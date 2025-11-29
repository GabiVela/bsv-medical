"use client"

import { useState, useEffect } from "react"
import { Shield, FilePlus2, Activity, Loader2, XCircle, UserCheck } from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"

// 🔹 BSV SDK pieces
import {
  Utils,
  Random,
  Script,
  type WalletProtocol,
} from "@bsv/sdk"

// --- CONFIGURATION ---
const REGISTRY_BASKET = "medichain-doctor-registry";
const ON_CHAIN_BASKET = "medical-records-on-chain";
const ON_CHAIN_PROTOCOL_PREFIX = "medichain";

export default function DoctorDashboardPage() {
  const { walletAddress, walletClient, isConnected } = useWallet()

  // --- AUTH STATE ---
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>("");

  // --- FORM STATE ---
  const [patientId, setPatientId] = useState("")
  const [recordType, setRecordType] = useState("visit_note")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // 1️⃣ AUTHORIZATION CHECK: Verify wallet against On-Chain Registry
  useEffect(() => {
    const verifyDoctorAccess = async () => {
        if (!isConnected || !walletClient || !walletAddress) {
            setIsAuthorized(false);
            return;
        }

        setIsCheckingAuth(true);
        setAuthStatus("Verifying doctor credentials on-chain...");

        try {
            // Fetch registry outputs (Removed 'sort'/'direction' as they are not supported by SDK)
            const res = await walletClient.listOutputs({
                basket: REGISTRY_BASKET,
                includeCustomInstructions: true,
                // We fetch more than 1 to ensure we can sort client-side if multiple exist
                limit: 10, 
            });

            // Client-side sort to find the latest based on 'updatedAt' in metadata
            const latestOutput = (res.outputs || []).sort((a: any, b: any) => {
                try {
                    const metaA = JSON.parse(a.customInstructions || '{}');
                    const metaB = JSON.parse(b.customInstructions || '{}');
                    const timeA = new Date(metaA.updatedAt || 0).getTime();
                    const timeB = new Date(metaB.updatedAt || 0).getTime();
                    return timeB - timeA; // Descending (newest first)
                } catch {
                    return 0;
                }
            })[0];
            
            if (!latestOutput || !latestOutput.customInstructions) {
                setAuthStatus("Registry not found or empty.");
                setIsAuthorized(false);
                return;
            }

            const metadata = JSON.parse(latestOutput.customInstructions);
            const doctors = metadata.doctors || [];
            
            // Check if the connected wallet is in the list
            const isRegistered = doctors.some((d: any) => d.key === walletAddress);
            
            setIsAuthorized(isRegistered);
            setAuthStatus(isRegistered ? "Authorized" : "Not Registered");

        } catch (err) {
            console.error("Auth check failed:", err);
            setAuthStatus("Failed to verify registry.");
            setIsAuthorized(false);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    verifyDoctorAccess();
  }, [isConnected, walletClient, walletAddress]);


  // 2️⃣ HANDLE RECORD CREATION
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    // 🟢 FIX: Explicitly check if walletClient exists to satisfy TypeScript
    if (!walletClient) {
        setSubmitError("Wallet not connected.")
        return
    }

    if (!isAuthorized) {
        setSubmitError("Unauthorized: You are not a registered doctor.")
        return
    }

    if (!patientId.trim()) {
      setSubmitError("Please enter a patient ID or identity key.")
      return
    }

    if (!notes.trim()) {
      setSubmitError("Please enter clinical notes.")
      return
    }

    setIsSubmitting(true)

    try {
      const createdAt = new Date().toISOString()

      const record = {
        patientIdentityKey: patientId,
        doctorIdentityKey: walletAddress,
        recordType,
        createdAt,
        body: { notes },
      }

      const recordJson = JSON.stringify(record)

      const keyID = Utils.toBase64(Random(8))
      const protocolID: WalletProtocol = [1, "medichain record v1"]
      const counterparty = patientId

      const { ciphertext } = await walletClient.encrypt({
        plaintext: Utils.toArray(recordJson, "utf8"),
        counterparty,
        keyID,
        protocolID,
      })
      
      const encryptedDataBuffer = Buffer.from(ciphertext);

      const description = `ON-CHAIN Encrypted ${recordType} for patient`

      const opReturnScript = Script.fromASM([
        "OP_0", 
        "OP_RETURN",
        Utils.toHex(Utils.toArray(ON_CHAIN_PROTOCOL_PREFIX, "utf8")),
        encryptedDataBuffer.toString("hex"),
      ].join(' ')).toHex();

      const actionResult = await walletClient.createAction({
        description,
        outputs: [
          {
            satoshis: 0,
            lockingScript: opReturnScript,
            basket: ON_CHAIN_BASKET,
            outputDescription: "ON-CHAIN Encrypted Medical Record",
            customInstructions: JSON.stringify({
              protocolID,
              keyID,
              recordType,
              createdAt,
              doctorIdentityKey: walletAddress,
              patientIdentityKey: patientId,
              version: "medichain-record-onchain-v1",
            }),
          },
        ],
      })

      const txid = (actionResult as any)?.txid ?? (actionResult as any)?.transactionId

      setSubmitSuccess(
        txid
          ? `Record created & permanently stored ON-CHAIN. TXID: ${txid}`
          : "Record created successfully."
      )

      setNotes("")
    } catch (err) {
      console.error(err)
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong while creating the record.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const shortIdentity =
    walletAddress && walletAddress.length > 18
      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
      : walletAddress || "Not connected"

  // 3️⃣ RENDER LOADING STATE
  if (isCheckingAuth && isConnected) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
            <p className="text-slate-400">{authStatus}</p>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-lg font-bold">MediChain</span>
            <span className="text-xs text-slate-400">Doctor Dashboard</span>
          </div>
        </div>
        <WalletButton />
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Doctor identity / status */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Doctor Identity</h2>
            <p className="text-sm text-slate-300 mb-4">
              Your actions are signed using your BSV identity key.
            </p>
            <div className="text-xs text-slate-300">
              <div className="font-semibold mb-1">Identity Public Key</div>
              <code className="block bg-slate-900/80 border border-slate-700 rounded px-3 py-2 break-all">
                {walletAddress || "Not connected"}
              </code>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-sm text-slate-400">Authorization Status</div>
                <div className={`text-base font-semibold ${isAuthorized ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? (isAuthorized ? "Verified Doctor" : "Unauthorized") : "Wallet Not Connected"}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Connected as:{" "}
              <span className="font-mono text-[11px]">{shortIdentity}</span>
            </p>
          </div>
        </section>

        {/* 4️⃣ CONDITIONAL RENDER: ACCESS DENIED vs DASHBOARD */}
        {!isConnected ? (
             <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8 text-center">
                <p className="text-slate-400">Please connect your BSV wallet to verify your doctor credentials.</p>
             </div>
        ) : !isAuthorized ? (
            <section className="bg-red-900/20 border border-red-800 rounded-xl p-8 flex flex-col items-center text-center space-y-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-red-400">Access Restricted</h2>
                <p className="text-slate-300 max-w-lg">
                    This dashboard is restricted to registered medical practitioners. 
                    Your wallet address (<strong>{shortIdentity}</strong>) was not found in the official MediChain Doctor Registry.
                </p>
                <p className="text-sm text-slate-500">
                    Please contact the administrator to have your public key added to the registry.
                </p>
            </section>
        ) : (
            <>
                {/* Create new record - ONLY VISIBLE IF AUTHORIZED */}
                <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FilePlus2 className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold">Create New Medical Record (ON-CHAIN)</h2>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                    Create an encrypted medical record. The data is stored immutably on the BSV blockchain.
                </p>

                <form onSubmit={handleCreateRecord} className="space-y-4">
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                        Patient MediChain ID (Identity Public Key)
                    </label>
                    <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="e.g. 02abc... (patient identity key)"
                        className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>

                    <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                        Record Type
                    </label>
                    <select
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="visit_note">Visit Note</option>
                        <option value="lab_result">Lab Result</option>
                        <option value="prescription">Prescription</option>
                        <option value="imaging_report">Imaging Report</option>
                        <option value="other">Other</option>
                    </select>
                    </div>

                    <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                        Clinical Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Brief description, diagnosis, treatment plan, etc."
                        className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>

                    {submitError && (
                    <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
                        {submitError}
                    </div>
                    )}
                    {submitSuccess && (
                    <div className="text-xs text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 rounded px-3 py-2">
                        {submitSuccess}
                    </div>
                    )}

                    <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !isConnected}
                        className="flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Creating ON-CHAIN Record..." : "Create & Send ON-CHAIN"}
                    </Button>
                    </div>
                </form>
                </section>

                <section className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-2">Recent Records</h2>
                <p className="text-sm text-slate-400">
                    Your recent on-chain entries will appear here.
                </p>
                </section>
            </>
        )}
      </main>
    </div>
  )
}