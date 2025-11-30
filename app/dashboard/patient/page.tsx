"use client"

import { useEffect, useState } from "react"
import { Shield, Loader2, FileText, Database, Terminal } from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Utils } from "@bsv/sdk"

// ⚙️ Must match doctor page
const MEDICHAIN_PROTOCOL_ID = [1, "medichain record v1"] as [any, string];
const MEDICHAIN_KEY_ID = "medichainKey1";

// type returned from /api/records
type StoredRecord = {
  id: string
  cid: string             // IPFS CID pinned via Pinata
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
  const [decryptingId, setDecryptingId] = useState<string | null>(null)

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

  const handleDecrypt = async (rec: StoredRecord) => {
    if (!walletClient || !walletAddress) return

    setDecryptingId(rec.id)
    setStatus("Fetching ciphertext from IPFS...")

    try {
      // 1️⃣ Fetch encrypted payload from Pinata gateway
      const gwRes = await fetch(
        `https://gateway.pinata.cloud/ipfs/${rec.cid}`,
      )
      if (!gwRes.ok) {
        throw new Error("Failed to fetch from IPFS gateway.")
      }

      // We pinned JSON: { ciphertext: number[] }
      const ipfsJson = await gwRes.json()
      const ciphertext: number[] = ipfsJson.ciphertext
      if (!Array.isArray(ciphertext) || !ciphertext.length) {
        throw new Error("Invalid ciphertext payload from IPFS.")
      }

      setStatus("Decrypting with wallet...")

      // 2️⃣ Ask wallet to decrypt using patient private key
      const { plaintext } = await walletClient.decrypt({
        ciphertext,
        keyID: MEDICHAIN_KEY_ID,
        protocolID: MEDICHAIN_PROTOCOL_ID,
        counterparty: rec.doctorIdentityKey, // the patient identity
      })

      // 3️⃣ Convert bytes → UTF-8 string
      let rawText = Utils.toUTF8(plaintext)
      rawText = rawText.replace(/\0/g, "").trim()

      console.log("🔓 Decrypted record:", rawText)

      try {
        const parsed = JSON.parse(rawText)
        setSelectedRecord(parsed)
        setStatus("Decrypted successfully.")
      } catch {
        setSelectedRecord({
          recordType: "Raw Data",
          isRaw: true,
          body: { notes: rawText },
        })
        setStatus("Decrypted (raw text).")
      }
    } catch (e) {
      console.error("Decrypt error:", e)
      setStatus("Decryption failed.")
    } finally {
      setDecryptingId(null)
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
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded mb-6 border border-slate-700">
            <div className="flex items-center gap-2">
              {loading ? (
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
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg flex justify-between items-center"
              >
                <div>
                  <div className="font-bold flex items-center gap-2 text-slate-200">
                    <Database className="w-4 h-4 text-purple-400" />
                    {rec.recordType || "Record"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    From: {rec.doctorIdentityKey.slice(0, 10)}...
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(rec.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecrypt(rec)}
                  disabled={decryptingId === rec.id}
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
            ))}
            {!loading && records.length === 0 && (
              <div className="text-xs text-slate-500 italic">
                No records yet.
              </div>
            )}
          </div>

          {selectedRecord && (
            <div className="mt-4 p-6 bg-slate-800 border border-emerald-500/50 rounded-xl shadow-2xl">
              <h2 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
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
