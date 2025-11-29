"use client"

import { useEffect, useState, useCallback } from "react"
import { Shield, Activity, RefreshCw, FileText, Loader2, Eye, AlertTriangle } from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"

// BSV SDK imports
import { Utils, Script, PublicKey } from "@bsv/sdk"

import { Buffer } from 'buffer'
globalThis.Buffer = Buffer; // Fix browser Buffe

// The basket used for ON-CHAIN storage in the Doctor's code
const ON_CHAIN_BASKET = "medical-records-on-chain";
const ON_CHAIN_PROTOCOL_PREFIX = "medichain"; // The identifier placed before the data in the OP_RETURN script

interface RecordPointer {
  txid: string
  vout: number
  keyID: string
  protocolID: any
  recordType: string
  createdAt: string
  doctorIdentityKey: string
  patientIdentityKey: string
  // New field to hold the raw encrypted data extracted from the transaction
  encryptedDataBuffer: Buffer | null; 
}

interface DecryptedRecord {
  pointer: RecordPointer
  body: any
  rawJson: string
}

export default function PatientDashboardPage() {
  const { walletClient, walletAddress, isConnected } = useWallet()

  const [loadingList, setLoadingList] = useState(false)
  const [loadingRecordId, setLoadingRecordId] = useState<string | null>(null)
  const [records, setRecords] = useState<RecordPointer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<DecryptedRecord | null>(null)

  const shortIdentity =
    walletAddress && walletAddress.length > 18
      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
      : walletAddress || "Not connected"

    const useTTS = () => {
      const [isPlaying, setIsPlaying] = useState(false);
      
      const speak = useCallback(async (text: string) => {
        if (isPlaying) return;
        
        try {
          setIsPlaying(true);
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voiceId: '21m00Tcm4TlvDq8ikWAM' })
          });
          
          if (!response.ok) throw new Error('TTS failed');
          
          const audioBlob = await response.blob();
          const audio = new Audio();
          audio.src = URL.createObjectURL(audioBlob);
          await audio.play();
          
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => setIsPlaying(false);
          
        } catch (error) {
          console.error('TTS Error:', error);
          setIsPlaying(false);
        }
      }, [isPlaying]);
      
      return { speak, isPlaying };
    };

  const { speak, isPlaying } = useTTS();

// ⬆️ MAKE SURE YOU HAVE THESE IMPORTS AT THE TOP
  const loadRecords = async () => {
    setError(null)
    setSelectedRecord(null)

    if (!walletClient) {
      setError("Please connect your wallet to load your records.")
      return
    }

    try {
      setLoadingList(true)
      console.log("🔍 Debug: Fetching records from basket:", ON_CHAIN_BASKET);

      // 1️⃣ List all records
      const res = await walletClient.listOutputs({
        basket: ON_CHAIN_BASKET,
        includeCustomInstructions: true,
        limit: 50,
      })
      
      console.log(`📦 Debug: Found ${res.outputs.length} raw outputs.`);

      const pointers: RecordPointer[] = (res.outputs || [])
        .map((out: any) => {
          let meta: any = null
          try {
            meta = out.customInstructions ? JSON.parse(out.customInstructions) : null
          } catch (e) {
            console.warn("Failed to parse customInstructions:", e)
          }
          if (!meta) return null

          const [txid, voutStr] = String(out.outpoint || "").split(".")
          const vout = Number(voutStr || 0)
          
          let encryptedDataBuffer: Buffer | null = null;
          
          try {
            // 2️⃣ EXTRACT THE ENCRYPTED DATA (SMART SEARCH)
            const script = Script.fromHex(out.lockingScript);
            const chunks = script.chunks;

            // Strategy A: Look for "medichain" label
            const prefixIndex = chunks.findIndex(
              (c) => c.buf && c.buf.toString('utf8') === ON_CHAIN_PROTOCOL_PREFIX
            );
            
            if (prefixIndex !== -1 && chunks[prefixIndex + 1]?.buf) {
               encryptedDataBuffer = chunks[prefixIndex + 1].buf;
            } 
            // Strategy B: (Fallback) Grab the largest data chunk after OP_RETURN
            else {
                const opReturnIndex = chunks.findIndex(c => c.op === 106); // 106 is OP_RETURN
                if (opReturnIndex !== -1) {
                    const candidates = chunks.slice(opReturnIndex + 1);
                    // Sort by size (largest first)
                    const largest = candidates.sort((a, b) => (b.buf?.length || 0) - (a.buf?.length || 0))[0];
                    if (largest?.buf && largest.buf.length > 20) {
                        console.log(`⚠️ Recovered data via fallback size check (${largest.buf.length} bytes)`);
                        encryptedDataBuffer = largest.buf;
                    }
                }
            }

          } catch (e) {
            console.warn("Failed to parse lockingScript for data:", e);
          }

          return {
            txid,
            vout,
            keyID: meta.keyID,
            protocolID: meta.protocolID,
            recordType: meta.recordType || "unknown",
            createdAt: meta.createdAt || "",
            doctorIdentityKey: meta.doctorIdentityKey,
            patientIdentityKey: meta.patientIdentityKey,
            encryptedDataBuffer: encryptedDataBuffer,
          } as RecordPointer
        })
        .filter(Boolean)
        
        // 🚨 DEBUG: FILTER REMOVED. 
        // We will log the comparison instead of hiding the record.
        .map((p: any) => {
            // Attempt to derive address from the stored public key
            let derivedAddress = "invalid-key";
            try {
                derivedAddress = PublicKey.fromString(p.patientIdentityKey).toAddress().toString();
            } catch(e) {}

            const isMatch = derivedAddress === walletAddress;
            
            console.log(`🔐 Identity Check for Record ${p.recordType}:`);
            console.log(`   - Record Stored Key: ${p.patientIdentityKey.slice(0,10)}...`);
            console.log(`   - Derived Address:   ${derivedAddress}`);
            console.log(`   - My Wallet Address: ${walletAddress}`);
            console.log(`   - MATCH? ${isMatch ? "✅ YES" : "❌ NO"}`);

            // Return it anyway so you can see it in the UI
            return p;
        });

      setRecords(pointers)
    } catch (err) {
      console.error(err)
      setError("Failed to load records from BSV chain.")
    } finally {
      setLoadingList(false)
    }
  }

  const decryptRecord = async (pointer: RecordPointer) => {
    setError(null)
    setSelectedRecord(null)

    if (!walletClient || !walletAddress) {
      setError("Please connect your wallet first.")
      return
    }

    if (!pointer.encryptedDataBuffer) {
      setError("Record missing encrypted data in the on-chain script.")
      return
    }

    try {
      setLoadingRecordId(pointer.txid)
      
      const ciphertext = pointer.encryptedDataBuffer; // Data is already retrieved from the chain!

      // Decrypt the data using the patient's wallet
      const { plaintext } = await walletClient.decrypt({
        ciphertext,
        counterparty: pointer.doctorIdentityKey,
        keyID: pointer.keyID,
        protocolID: pointer.protocolID,
      })

      const jsonText = Utils.toUTF8(plaintext)
      let parsed = null
      try {
        parsed = JSON.parse(jsonText)
      } catch {}

      setSelectedRecord({
        pointer,
        body: parsed,
        rawJson: jsonText,
      })
    } catch (err) {
      console.error(err)
      // Since decryption relies on the patient's private key, failure likely means:
      // 1) The patient is connected with the wrong wallet/key.
      // 2) The encryption was faulty.
      setError("Decryption failed. Ensure you are connected with the correct wallet for this record.")
    } finally {
      setLoadingRecordId(null)
    }
  }

  // Auto-load
  useEffect(() => {
    if (isConnected && walletClient && walletAddress) {
      void loadRecords()
    }
  }, [isConnected, walletClient, walletAddress])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-lg font-bold">MediChain</span>
            <span className="text-xs text-slate-400">Patient Dashboard (On-Chain Data)</span>
          </div>
        </div>
        <WalletButton />
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Identity */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Your MediChain Identity</h2>
            <code className="block bg-slate-900/80 border border-slate-700 rounded px-3 py-2 break-all text-xs">
              {walletAddress || "Not connected"}
            </code>
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
              Connected as: <span className="font-mono text-[11px]">{shortIdentity}</span>
            </p>
          </div>
        </section>

        {/* Record List */}
        <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Medical Records (BSV On-Chain)</h2>

            <Button
              variant="outline"
              size="sm"
              onClick={loadRecords}
              disabled={loadingList || !isConnected}
              className="flex items-center gap-2"
            >
              {loadingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
          
          {records.length === 0 && !loadingList && <p className="text-slate-400">No on-chain records found in the "{ON_CHAIN_BASKET}" basket.</p>}

          {error && (
            <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {records.map((rec) => (
              <div key={`${rec.txid}-${rec.vout}`} className="p-4 bg-slate-900/60 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{rec.recordType}</span>
                  <Button
                    size="xs"
                    variant="outline"
                    className="flex items-center gap-1 text-xs"
                    onClick={() => decryptRecord(rec)}
                    disabled={loadingRecordId === rec.txid || !rec.encryptedDataBuffer}
                  >
                    {loadingRecordId === rec.txid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                    View
                  </Button>
                </div>

                <div className="text-[11px] text-slate-400 mt-1">
                  Doctor: {rec.doctorIdentityKey.slice(0, 10)}...{rec.doctorIdentityKey.slice(-6)} | Created: {new Date(rec.createdAt).toLocaleDateString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  TXID: {rec.txid.slice(0, 10)}...{rec.txid.slice(-6)}
                </div>
                {!rec.encryptedDataBuffer && (
                  <div className="text-[10px] text-red-400 mt-1">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Error: Could not find data in OP_RETURN script.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Viewer */}
        {selectedRecord && (
        <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Decrypted Record: {selectedRecord.pointer.recordType}
          </h2>
          {/* ✅ BOTÓN TTS - AHORA isPlaying ESTÁ DISPONIBLE */}
          <div className="flex gap-2 mb-4">
            <Button 
              size="sm" 
              onClick={() => speak(selectedRecord.rawJson)} 
              disabled={isPlaying}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔊'}
              {isPlaying ? 'Playing...' : 'Read Aloud'}
            </Button>
          </div>
          
          <p className="text-xs text-amber-300 mb-4">
            This data was retrieved directly from the immutable BSV transaction script (OP_RETURN).
          </p>

          <pre className="bg-slate-900/80 p-4 rounded border border-slate-700 text-[11px] whitespace-pre-wrap">
            {selectedRecord.rawJson}
          </pre>
        </section>
      )}
      </main>
    </div>
  )
}