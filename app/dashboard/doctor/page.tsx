"use client"

import { useState } from "react"
import { Shield, FilePlus2, Activity, Loader2 } from "lucide-react" // Removed AlertTriangle

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
// NOTE: StorageUploader is removed as we are no longer using UHRP

// ⚠️ NOTICE: The UHRP-related constants are removed as we are now storing data ON-CHAIN.

export default function DoctorDashboardPage() {
  const { walletAddress, walletClient, isConnected } = useWallet()

  const [patientId, setPatientId] = useState("")
  const [recordType, setRecordType] = useState("visit_note")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!isConnected || !walletClient || !walletAddress) {
      setSubmitError("Please connect your BSV (Metanet) wallet first.")
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
      // 1️⃣ Build the raw medical record JSON (this is what we encrypt)
      const createdAt = new Date().toISOString()

      const record = {
        patientIdentityKey: patientId, // what doctor typed (identity pubkey or handle)
        doctorIdentityKey: walletAddress, // from connected wallet
        recordType,
        createdAt,
        body: {
          notes,
          // diagnosis, labValues, attachments, etc.
        },
      }

      const recordJson = JSON.stringify(record)

      // 2️⃣ Derive an encryption context for this doctor -> patient pair
      const keyID = Utils.toBase64(Random(8))
      const protocolID: WalletProtocol = [1, "medichain record v1"]

      // Here we treat patientId as the patient's identity public key.
      const counterparty = patientId

      const { ciphertext } = await walletClient.encrypt({
        plaintext: Utils.toArray(recordJson, "utf8"),
        counterparty,
        keyID,
        protocolID,
      })
      
      // 🚨 CRITICAL CHANGE 🚨
      // 3️⃣ Skip the UHRP upload step. The encrypted data will be placed directly on-chain.
      // We encode the encrypted data (ciphertext) into the standard BSV buffer format.
      const encryptedDataBuffer = Buffer.from(ciphertext);

      // 4️⃣ Commit the ENTIRE ENCRYPTED RECORD on-chain using OP_RETURN
      const description = `ON-CHAIN Encrypted ${recordType} for patient`

      // 4.1 Build the OP_RETURN script containing the data
      // We use a simple protocol prefix (e.g., 'medichain') and then the encrypted data
      const opReturnScript = Script.fromASM([
        "OP_0", // The standard protocol prefix for non-standard data
        "OP_RETURN",
        Utils.toHex(Utils.toArray("medichain", "utf8")), // Protocol identifier
        encryptedDataBuffer.toString("hex"), // The actual encrypted data blob
      ].join(' ')).toHex();


      const actionResult = await walletClient.createAction({
        description,
        outputs: [
          {
            // The satoshi value here MUST be large enough to cover the fee 
            // for the entire data size, plus the minimum satoshi needed. 
            // We use 0 satoshis and rely on the wallet to add the fee input.
            // NOTE: The entire output is the OP_RETURN, no satoshis are locked/spent.
            satoshis: 0,
            lockingScript: opReturnScript,
            basket: "medical-records-on-chain", // NEW BASKET for on-chain records
            outputDescription: "ON-CHAIN Encrypted Medical Record",
            
            // This metadata is now OPTIONAL, as the encrypted data is already in the script.
            // We keep the keys/protocol data here for easy retrieval from the UTXO.
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
          : "Record created successfully and stored on BSV.",
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
              Your actions are signed using your BSV identity key. Patients can
              cryptographically verify which doctor created each record.
            </p>
            <div className="text-xs text-slate-300">
              <div className="font-semibold mb-1">Identity Public Key</div>
              <code className="block bg-slate-900/80 border border-slate-700 rounded px-3 py-2 break-all">
                {walletAddress || "Not connected"}
              </code>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-400 mt-3">
                Connect your Metanet Desktop wallet using the button in the top
                right before creating records.
              </p>
            )}
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-sm text-slate-400">Status</div>
                <div className="text-base font-semibold">
                  {isConnected ? "Wallet Connected" : "Wallet Not Connected"}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Connected as:{" "}
              <span className="font-mono text-[11px]">{shortIdentity}</span>
            </p>
          </div>
        </section>

        {/* Create new record */}
        <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FilePlus2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Create New Medical Record (ON-CHAIN)</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            **WARNING:** The **entire encrypted medical record** will be stored directly on the BSV blockchain using an `OP_RETURN` output. This ensures maximum immutability but **will result in significantly higher transaction fees** compared to the original UHRP off-chain approach.
          </p>

          <form onSubmit={handleCreateRecord} className="space-y-4">
            {/* Patient ID / Identity */}
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
              <p className="text-xs text-slate-400">
                The patient can copy their MediChain ID from the wallet button
                in their dashboard and share it with you.
              </p>
            </div>

            {/* Record type */}
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

            {/* Notes */}
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

        {/* Placeholder section for future: list of records */}
        <section className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Recent Records</h2>
          <p className="text-sm text-slate-400">
            Next, we can hook this up to list the records you’ve created by
            querying outputs from your &quot;medical-records-on-chain&quot; basket and
            decoding their metadata, and then extracting the encrypted data blob directly from the `OP_RETURN` script.
          </p>
        </section>
      </main>
    </div>
  )
}