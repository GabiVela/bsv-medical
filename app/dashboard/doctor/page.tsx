"use client"

import { useState, useEffect } from "react"
import { Shield, FilePlus2, Activity, Loader2 } from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Utils, SecurityLevel } from "@bsv/sdk"

// ⚙️ Wallet crypto constants (MUST match patient page)
// ✅ allowed: letters, numbers, spaces
const MEDICHAIN_PROTOCOL_ID = [1, "medichain record v1"] as [any, string];


// (optional) make keyID alphanumeric only, just to be safe
const MEDICHAIN_KEY_ID = "medichainKey1";


export default function DoctorDashboardPage() {
  const { walletAddress, walletClient, isConnected } = useWallet()

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authStatus, setAuthStatus] = useState<string>("")

  const [patientId, setPatientId] = useState("")
  const [recordType, setRecordType] = useState("visit_note")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Simple: any connected wallet is "doctor" for demo
  useEffect(() => {
    if (isConnected && walletAddress) {
      setIsAuthorized(true)
      setAuthStatus("Authorized (demo)")
    } else {
      setIsAuthorized(false)
      setAuthStatus("Wallet not connected")
    }
  }, [isConnected, walletAddress])

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!walletClient || !walletAddress) {
      setSubmitError("Wallet not connected.")
      return
    }
    if (!isAuthorized) {
      setSubmitError("You are not authorized to create records.")
      return
    }
    if (!patientId.trim()) {
      setSubmitError("Please enter a patient ID (public key).")
      return
    }
    if (!notes.trim()) {
      setSubmitError("Please enter clinical notes.")
      return
    }
    if (!patientId.startsWith("02") && !patientId.startsWith("03")) {
      setSubmitError("Patient ID must be a compressed public key (starts with 02/03).")
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

      // 🔐 Encrypt using MetaNet wallet (E2E)
      const plaintextBytes = Utils.toArray(recordJson, "utf8")

const { ciphertext } = await walletClient.encrypt({
  plaintext: Utils.toArray(recordJson, "utf8"),
  counterparty: patientId,
  keyID: MEDICHAIN_KEY_ID,
  protocolID: MEDICHAIN_PROTOCOL_ID,
});


      // API expects ciphertext as array of numbers
      // We send metadata + ciphertext to our backend
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientIdentityKey: patientId,
          doctorIdentityKey: walletAddress,
          recordType,
          createdAt,
          ciphertext, // array<number>
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to save record.")
      }

      const data = await res.json()
      setSubmitSuccess(
        `Record saved. ID: ${data.id || "unknown"}\nCID: ${data.cid || "via Pinata"}`
      )
      setNotes("")
    } catch (err) {
      console.error("Create record error:", err)
      setSubmitError(err instanceof Error ? err.message : "Creation failed.")
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
                <div
                  className={`text-base font-semibold ${
                    isAuthorized ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isConnected
                    ? isAuthorized
                      ? authStatus
                      : "Unauthorized"
                    : "Wallet Not Connected"}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Connected as:{" "}
              <span className="font-mono text-[11px]">{shortIdentity}</span>
            </p>
          </div>
        </section>

        {!isConnected ? (
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8 text-center">
            <p className="text-slate-400">
              Please connect your MetaNet wallet to act as a doctor.
            </p>
          </div>
        ) : !isAuthorized ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-8 text-center">
            <p className="text-red-400 font-semibold">
              You are not authorized to create records.
            </p>
          </div>
        ) : (
          <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FilePlus2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">
                Create New Medical Record
              </h2>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Records are encrypted using your wallet keys and stored off-chain
              (e.g. Pinata/IPFS). The patient decrypts with their own wallet.
            </p>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-200">
                  Patient Identity Key (Public Key)
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Paste patient public key (starts with 02/03...)"
                  className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="Diagnosis, treatment plan, etc."
                  className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {submitError && (
                <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2 whitespace-pre-wrap">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="text-xs text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 rounded px-3 py-2 whitespace-pre-wrap">
                  {submitSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className="flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isSubmitting ? "Saving..." : "Create Record"}
                </Button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
