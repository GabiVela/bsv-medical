"use client"

import { useEffect, useState } from "react"
import {
  Shield,
  Loader2,
  FileText,
  Database,
  Terminal,
} from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Utils } from "@bsv/sdk"

// ⚙️ Must match doctor page
const MEDICHAIN_PROTOCOL_ID = [1, "medichain record v1"] as [any, string]
const MEDICHAIN_KEY_ID = "medichainKey1"

type StoredRecord = {
  id: string
  cid: string
  patientIdentityKey: string
  doctorIdentityKey: string
  recordType: string
  createdAt: string
}

export default function PatientDashboardPage() {
  const { walletAddress, walletClient, isConnected } = useWallet()

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<StoredRecord[]>([])
  const [status, setStatus] = useState("Waiting for wallet...")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [selectedMeta, setSelectedMeta] = useState<StoredRecord | null>(null)
  const [decryptingId, setDecryptingId] = useState<string | null>(null)
  const [batchDecrypting, setBatchDecrypting] = useState(false)

  // id -> decrypted record object
  const [decryptedMap, setDecryptedMap] = useState<Record<string, any>>({})

  // ❗ NEW: track which records failed decryption
  const [failedDecrypt, setFailedDecrypt] = useState<Record<string, boolean>>({})

  // email + pdf sending
  const [email, setEmail] = useState("")
  const [sendingPdf, setSendingPdf] = useState(false)

  const shortIdentity =
    walletAddress && walletAddress.length > 18
      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
      : walletAddress || "Not connected"

  const fetchRecords = async () => {
    if (!walletAddress) return
    setLoading(true)
    setStatus("Loading records...")
    try {
      const res = await fetch(
        `/api/records?patientIdentityKey=${encodeURIComponent(walletAddress)}`,
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to load records.")
      }
      const data = await res.json()
      const recs: StoredRecord[] = data.records || []
      setRecords(recs)
      setStatus(`Loaded ${recs.length} record(s).`)
      // reset failure map when refetching
      setFailedDecrypt({})
    } catch (e) {
      console.error("Fetch records error:", e)
      setStatus("Failed to load records.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchRecords()
    }
  }, [isConnected, walletAddress])

  // Core decrypt logic for a single record (returns parsed record)
  const decryptOne = async (rec: StoredRecord) => {
    if (!walletClient) throw new Error("Wallet not available")

    // 1️⃣ Fetch encrypted payload from Pinata gateway
    const gwRes = await fetch(`https://gateway.pinata.cloud/ipfs/${rec.cid}`)
    if (!gwRes.ok) {
      throw new Error("Failed to fetch from IPFS gateway.")
    }

    const ipfsJson = await gwRes.json()
    const ciphertext: number[] = ipfsJson.ciphertext
    if (!Array.isArray(ciphertext) || !ciphertext.length) {
      throw new Error("Invalid ciphertext payload from IPFS.")
    }

    // 2️⃣ Ask wallet to decrypt using patient private key
    //    counterparty must be the DOCTOR (sender)
    const { plaintext } = await walletClient.decrypt({
      ciphertext,
      keyID: MEDICHAIN_KEY_ID,
      protocolID: MEDICHAIN_PROTOCOL_ID,
      counterparty: rec.doctorIdentityKey,
    })

    let rawText = Utils.toUTF8(plaintext)
    rawText = rawText.replace(/\0/g, "").trim()

    try {
      return JSON.parse(rawText)
    } catch {
      return {
        recordType: "Raw Data",
        isRaw: true,
        body: { notes: rawText },
      }
    }
  }

  const handleDecrypt = async (rec: StoredRecord) => {
    if (!walletClient || !walletAddress) return

    setDecryptingId(rec.id)
    setStatus("Decrypting record...")

    try {
      const parsed = await decryptOne(rec)

      setSelectedRecord(parsed)
      setSelectedMeta(rec)
      setDecryptedMap((prev) => ({ ...prev, [rec.id]: parsed }))
      setFailedDecrypt((prev) => {
        const copy = { ...prev }
        delete copy[rec.id]
        return copy
      })
      setStatus("Decrypted successfully.")
    } catch (e) {
      console.error("Decrypt error:", e)
      setFailedDecrypt((prev) => ({ ...prev, [rec.id]: true }))
      setStatus("Decryption failed for this record.")
    } finally {
      setDecryptingId(null)
    }
  }

  const handleDecryptAll = async () => {
    if (!walletClient || !walletAddress || !records.length) return
    setBatchDecrypting(true)
    setStatus("Batch decrypting all records...")

    const newMap: Record<string, any> = {}
    const failureMap: Record<string, boolean> = {}

    try {
      for (const rec of records) {
        try {
          const parsed = await decryptOne(rec)
          newMap[rec.id] = parsed
        } catch (e) {
          console.error("Batch decrypt failed for", rec.id, e)
          failureMap[rec.id] = true
        }
      }

      setDecryptedMap((prev) => ({ ...prev, ...newMap }))
      setFailedDecrypt((prev) => ({ ...prev, ...failureMap }))

      const successCount = Object.keys(newMap).length
      const failCount = Object.keys(failureMap).length
      setStatus(
        `Decrypted ${successCount} record(s).${
          failCount ? ` ${failCount} could not be decrypted (different wallet or old format).` : ""
        }`,
      )
    } finally {
      setBatchDecrypting(false)
    }
  }

  const handleSendPdf = async () => {
    if (!email) {
      setStatus("Please enter an email address.")
      return
    }

    // Build array of decrypted records, including meta
    const recordsArray = records
      .map((rec) => {
        const decrypted = decryptedMap[rec.id]
        if (!decrypted) return null
        return {
          ...decrypted,
          patientIdentityKey: rec.patientIdentityKey,
          doctorIdentityKey: rec.doctorIdentityKey,
          recordType: rec.recordType,
          createdAt: rec.createdAt,
        }
      })
      .filter(Boolean) as any[]

    if (!recordsArray.length) {
      setStatus("Please decrypt some records first (Decrypt All).")
      return
    }

    try {
      setSendingPdf(true)
      setStatus("Sending PDF via email...")
      const res = await fetch("https://c35a227fcd5f.ngrok-free.app/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          records: recordsArray,
        }),
      })
      if (!res.ok) {
        setStatus("Failed to send PDF.")
      } else {
        setStatus("PDF sent successfully.")
      }
    } catch (e) {
      console.error(e)
      setStatus("Error sending PDF.")
    } finally {
      setSendingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <nav className="flex justify-between border-b border-slate-700 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-blue-400">MediChain Patient</h1>
        </div>
        <WalletButton />
      </nav>

      <div className="mb-4 text-xs text-slate-400">
        Connected as:{" "}
        <span className="font-mono text-[11px]">{shortIdentity}</span>
      </div>

      {!isConnected ? (
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">
            Connect your wallet to view your encrypted medical records.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 bg-slate-800 p-4 rounded mb-6 border border-slate-700">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                {loading || batchDecrypting || sendingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                )}
                <span className="text-sm font-mono text-yellow-400">
                  {status}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={fetchRecords}
                  disabled={loading || batchDecrypting || sendingPdf}
                  variant="outline"
                  size="sm"
                  className="text-slate-100 border-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Refresh
                </Button>
                <Button
                  onClick={handleDecryptAll}
                  disabled={batchDecrypting || !records.length || sendingPdf}
                  variant="outline"
                  size="sm"
                  className="text-slate-100 border-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  {batchDecrypting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Decrypt All
                </Button>
              </div>
            </div>

            {/* Email + Send PDF row */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to receive PDF"
                className="w-full md:w-80 px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendPdf}
                disabled={sendingPdf || !Object.keys(decryptedMap).length}
                variant="outline"
                size="sm"
                className="text-slate-100 border-slate-500 hover:bg-slate-800 hover:text-white"
              >
                {sendingPdf && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send PDF
              </Button>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {records.map((rec) => {
              const decrypted = decryptedMap[rec.id]
              return (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold flex items-center gap-2 text-slate-200">
                        <Database className="w-4 h-4 text-purple-400" />
                        {rec.recordType || "Record"}
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(rec.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecrypt(rec)}
                      disabled={
                        decryptingId === rec.id || batchDecrypting || sendingPdf
                      }
                      className="text-slate-100 border-slate-500 hover:bg-slate-800 hover:text-white"
                    >
                      {decryptingId === rec.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          Decrypting...
                        </>
                      ) : (
                        "Decrypt"
                      )}
                    </Button>
                  </div>

                  {/* If this record has been decrypted (via single or batch), show a small preview */}
                  {decrypted && (
                    <div className="mt-3 bg-slate-900/60 border border-slate-700 rounded p-3">
                      <div className="text-[11px] text-slate-400 mb-1">
                        Decrypted preview (
                        {new Date(rec.createdAt).toLocaleString()}):
                      </div>
                      <div className="text-xs text-slate-200 font-mono whitespace-pre-wrap">
                        {decrypted.body?.notes ||
                          JSON.stringify(decrypted, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* ❗ Show message for records that failed decryption */}
                  {failedDecrypt[rec.id] && (
                    <div className="mt-2 text-[11px] text-red-400">
                      Could not decrypt this record. It may belong to a
                      different wallet or use an older encryption format.
                    </div>
                  )}
                </div>
              )
            })}
            {!loading && !records.length && (
              <div className="text-xs text-slate-500 italic">
                No records yet.
              </div>
            )}
          </div>

          {/* Detailed panel for last clicked record */}
          {selectedRecord && (
            <div className="mt-4 p-6 bg-slate-800 border border-emerald-500/50 rounded-xl shadow-2xl">
              <h2 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                {selectedRecord.isRaw ? (
                  <>
                    <Terminal className="w-5 h-5 text-yellow-400" />
                    Raw Data
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Medical Record
                  </>
                )}
              </h2>

              {selectedMeta && (
                <div className="text-xs text-slate-400 mb-3">
                  Created at:{" "}
                  <span className="font-mono">
                    {new Date(selectedMeta.createdAt).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {selectedRecord.body?.notes ||
                    JSON.stringify(selectedRecord, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
