"use client"

import { useState, useEffect } from "react"
import { Shield, FilePlus2, Activity, Loader2, XCircle } from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"

// 🔹 BSV SDK pieces
import {
  Utils,
  Random,
  Script,
  P2PKH,      // 🟢 Added for Payment
  PublicKey,  // 🟢 Added for Address derivation
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

  // 1️⃣ AUTHORIZATION CHECK
  useEffect(() => {
    const verifyDoctorAccess = async () => {
        if (!isConnected || !walletClient || !walletAddress) {
            setIsAuthorized(false);
            return;
        }

        setIsCheckingAuth(true);
        setAuthStatus("Verifying doctor credentials on-chain...");

        try {
            const res = await walletClient.listOutputs({
                basket: REGISTRY_BASKET,
                includeCustomInstructions: true,
                limit: 10, 
            });

            // Sort by latest timestamp
            const latestOutput = (res.outputs || []).sort((a: any, b: any) => {
                try {
                    const metaA = JSON.parse(a.customInstructions || '{}');
                    const metaB = JSON.parse(b.customInstructions || '{}');
                    return new Date(metaB.updatedAt || 0).getTime() - new Date(metaA.updatedAt || 0).getTime();
                } catch { return 0; }
            })[0];
            
            if (!latestOutput || !latestOutput.customInstructions) {
                setAuthStatus("Registry not found.");
                setIsAuthorized(false);
                return;
            }

            const metadata = JSON.parse(latestOutput.customInstructions);
            const doctors = metadata.doctors || [];
            
            const isRegistered = doctors.some((d: any) => d.key === walletAddress);
            setIsAuthorized(isRegistered);
            setAuthStatus(isRegistered ? "Authorized" : "Not Registered");

        } catch (err) {
            console.error("Auth check failed:", err);
            setAuthStatus("Verification failed.");
            setIsAuthorized(false);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    verifyDoctorAccess();
  }, [isConnected, walletClient, walletAddress]);


  // 2️⃣ HANDLE RECORD CREATION (The Robust Version)
// 2️⃣ HANDLE RECORD CREATION (Final Fix)
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!walletClient) { setSubmitError("Wallet not connected."); return; }
    if (!isAuthorized) { setSubmitError("Unauthorized."); return; }
    if (!patientId.trim()) { setSubmitError("Please enter Patient Public Key."); return; }
    if (!notes.trim()) { setSubmitError("Please enter notes."); return; }

    if (!patientId.startsWith('02') && !patientId.startsWith('03')) {
        setSubmitError("Invalid Patient ID. Must be a Public Key (starts with 02/03).");
        return;
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

      // A. Encrypt
      const keyID = Utils.toBase64(Random(8))
      const protocolID: WalletProtocol = [1, "medichain record v1"]
      
      const { ciphertext } = await walletClient.encrypt({
        plaintext: Utils.toArray(recordJson, "utf8"),
        counterparty: patientId,
        keyID,
        protocolID,
      })
      
      // B. Create Output 1: The Data (ASM Method)
      // 🟢 FIX: Convert data to Hex strings first, then use fromASM.
      // This avoids the "Property 'op' is missing" error AND the "Odd Length" error.
      
      const protocolHex = Utils.toHex(Utils.toArray(ON_CHAIN_PROTOCOL_PREFIX, "utf8"));
      const dataHex = Utils.toHex(ciphertext); // Convert number[] to Hex String

      // The SDK will automatically calculate the correct PUSHDATA opcodes for the hex data
      const opReturnScript = Script.fromASM(
          `OP_0 OP_RETURN ${protocolHex} ${dataHex}`
      );
      
      const opReturnScriptHex = opReturnScript.toHex();

      // C. Create Output 2: The Notification
      const patientAddress = PublicKey.fromString(patientId).toAddress();
      const paymentScriptHex = new P2PKH().lock(patientAddress).toHex();

      // D. Broadcast
      const actionResult = await walletClient.createAction({
        description: `Medical Record for ${patientId.slice(0,6)}...`,
        outputs: [
          {
            satoshis: 0,
            lockingScript: opReturnScriptHex,
            basket: ON_CHAIN_BASKET,
            outputDescription: "Medical Data",
          },
          {
            satoshis: 1000,
            lockingScript: paymentScriptHex,
            basket: ON_CHAIN_BASKET,
            outputDescription: "Patient Notification",
          }
        ],
      })

      const txid = (actionResult as any)?.txid ?? (actionResult as any)?.transactionId

      setSubmitSuccess(txid ? `Success! TXID: ${txid}` : "Record created.")
      setNotes("")
      
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : "Error creating record.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const shortIdentity =
    walletAddress && walletAddress.length > 18
      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
      : walletAddress || "Not connected"

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
        {/* Identity & Status */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Doctor Identity</h2>
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
                <div className="text-sm text-slate-400">Status</div>
                <div className={`text-base font-semibold ${isAuthorized ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? (isAuthorized ? "Verified Doctor" : "Unauthorized") : "Wallet Not Connected"}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">Connected as: <span className="font-mono text-[11px]">{shortIdentity}</span></p>
          </div>
        </section>

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
                    Your key (<strong>{shortIdentity}</strong>) is not in the registry.
                </p>
            </section>
        ) : (
            <>
                <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FilePlus2 className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold">Create New Medical Record (ON-CHAIN)</h2>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                    Create an encrypted record. A notification (1000 sats) will be sent to the patient's wallet.
                </p>

                <form onSubmit={handleCreateRecord} className="space-y-4">
                    <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">Patient Identity Key (Public Key)</label>
                    <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="Paste Patient Public Key (starts with 02...)"
                        className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>

                    <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">Record Type</label>
                    <select
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="visit_note">Visit Note</option>
                        <option value="lab_result">Lab Result</option>
                        <option value="prescription">Prescription</option>
                        <option value="imaging_report">Imaging Report</option>
                    </select>
                    </div>

                    <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">Clinical Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Diagnosis, treatment plan, etc."
                        className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>

                    {submitError && <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">{submitError}</div>}
                    {submitSuccess && <div className="text-xs text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 rounded px-3 py-2">{submitSuccess}</div>}

                    <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !isConnected} className="flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? "Broadcasting..." : "Create Record"}
                    </Button>
                    </div>
                </form>
                </section>
            </>
        )}
      </main>
    </div>
  )
}