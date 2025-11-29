"use client"

import { useEffect, useState, useCallback } from "react"
import { Shield, RefreshCw, Loader2, FileText, Lock, Database, Radio, AlertCircle } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Utils, Script } from "@bsv/sdk"

const ON_CHAIN_BASKET = "medical-records-on-chain";
const ON_CHAIN_PROTOCOL_PREFIX = "medichain";

export default function PatientDashboardPage() {
  const { walletClient, msgClient, isConnected } = useWallet()
  
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [status, setStatus] = useState("Waiting for wallet...")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  // 1. LOAD FROM LOCAL WALLET (The "Fast" Way)
  const loadLocalRecords = useCallback(async () => {
    if (!walletClient) return;
    setLoading(true);
    try {
        console.log("📂 Loading from Local Wallet...");
        const res = await walletClient.listOutputs({
            basket: ON_CHAIN_BASKET,
            includeCustomInstructions: true,
        });

        const localRecords = (res.outputs || []).map((out: any) => ({
            ...out,
            // Format data for UI
            txid: out.outpoint ? out.outpoint.split('.')[0] : 'unknown',
            // If the wallet stored custom instructions, use them for the label
            label: out.customInstructions ? JSON.parse(out.customInstructions).description : "Medical Record"
        }));

        setRecords(localRecords.reverse()); // Show newest first
        setStatus(`Loaded ${localRecords.length} records from local device.`);
    } catch (e) {
        console.error(e);
        setStatus("Failed to load local records.");
    } finally {
        setLoading(false);
    }
  }, [walletClient]);

  // 2. LISTEN FOR NEW MESSAGES & INTERNALIZE (The "Sync" Way)
  useEffect(() => {
    if (!msgClient || !walletClient) return;

    const setupListener = async () => {
        try {
            await msgClient.joinRoom('medichain_inbox');
            setStatus("Live: Listening for Doctor notifications...");

            await msgClient.listenForLiveMessages({
                messageBox: 'medichain_inbox',
                onMessage: async (msg) => {
                    console.log("🔔 MESSAGE RECEIVED:", msg);
                    
                    const body = msg.body as any;
                    
                    if (body && body.txid) {
                        setStatus(`New Record Incoming: ${body.txid.slice(0,6)}...`);
                        await internalizeTransaction(body.txid);
                    }
                }
            });
        } catch (e) { console.error("MessageBox Error:", e); }
    };

    setupListener();
    return () => { msgClient.leaveRoom('medichain_inbox'); }
  }, [msgClient, walletClient]);

  // 3. INTERNALIZE HELPER (Downloads & Saves to Local Wallet)
  const internalizeTransaction = async (txid: string) => {
      try {
          // A. Download Raw Hex from Explorer
          const res = await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`);
          const rawHex = await res.text();

          // B. Save to Local Wallet
          await walletClient?.internalizeAction({
              tx: rawHex,
              outputs: [{
                  outputIndex: 0, // The Data Output
                  protocol: 'basket insertion',
                  insertionRemittance: {
                      basket: ON_CHAIN_BASKET,
                      tags: ['visit_note', txid]
                  }
              }],
              description: "Medical Record from Doctor"
          });

          console.log("✅ Transaction Saved to Local Wallet!");
          loadLocalRecords(); // Refresh list

      } catch (e) {
          console.error("Internalize Failed:", e);
      }
  };

  // 4. DECRYPT (From Local Wallet Data)
  const decryptRecord = async (rec: any) => {
      if (!walletClient) return;
      setStatus("Decrypting...");
      
      try {
          // A. Parse the Script from the Local Record
          const script = Script.fromHex(rec.lockingScript);
          
          // B. Find the Encrypted Data Chunk
          const chunks = script.chunks;
          const tagIndex = chunks.findIndex(c => {
              try { return c.data && Utils.toUTF8(c.data) === ON_CHAIN_PROTOCOL_PREFIX } catch { return false }
          });

          if (tagIndex === -1 || !chunks[tagIndex + 1]?.data) {
              throw new Error("Data not found in script.");
          }

          // C. Get Ciphertext
          const ciphertext = Array.from(chunks[tagIndex + 1].data as number[]); // Ensure number[]

          // D. Decrypt
          const { plaintext } = await walletClient.decrypt({
              ciphertext,
              keyID: '1',
              protocolID: [1, "medichain record v1"],
              counterparty: "anyone" // Or extract from rec.customInstructions if available
          });

          let jsonStr = Utils.toUTF8(plaintext);
          jsonStr = jsonStr.replace(/\0/g, '').trim(); // Cleanup

          setSelectedRecord(JSON.parse(jsonStr));
          setStatus("Decrypted successfully.");

      } catch (e) {
          console.error("Decryption Error:", e);
          setStatus("Decryption Failed (Key mismatch or corrupt data).");
      }
  };

  // Initial Load
  useEffect(() => { 
      if (isConnected) loadLocalRecords(); 
  }, [isConnected, loadLocalRecords]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
        <nav className="flex justify-between border-b border-slate-700 pb-4 mb-6">
            <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400"/>
                <h1 className="text-xl font-bold text-blue-400">MediChain Patient</h1>
            </div>
            <WalletButton />
        </nav>
        
        {/* Status Bar */}
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded mb-6 border border-slate-700">
            <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${msgClient ? "text-green-400 animate-pulse" : "text-gray-500"}`}/>
                <span className="text-sm font-mono text-yellow-400">{status}</span>
            </div>
            <Button onClick={loadLocalRecords} disabled={loading} variant="outline" className="border-slate-600">
               <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> Reload Local DB
            </Button>
        </div>

        {/* List of Records */}
        <div className="space-y-3 mb-8">
            {records.length === 0 && !loading && (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                    No local records found. Wait for a message from your doctor.
                </div>
            )}

            {records.map((rec) => (
                <div key={rec.txid} className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg flex justify-between items-center hover:bg-slate-800 transition">
                    <div>
                        <div className="font-bold flex items-center gap-2 text-slate-200">
                            <Database className="w-4 h-4 text-purple-400"/>
                            Saved Medical Record
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">TXID: {rec.txid.slice(0,12)}...</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => decryptRecord(rec)}>
                        Decrypt & View
                    </Button>
                </div>
            ))}
        </div>

        {/* Viewer */}
        {selectedRecord && (
            <div className="mt-4 p-6 bg-slate-800 border border-emerald-500/50 rounded-xl shadow-2xl">
                <h2 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5"/> Decrypted Content
                </h2>
                <div className="grid gap-4 text-sm">
                    {selectedRecord.createdAt && (
                         <div className="text-slate-400 text-xs">Created: {new Date(selectedRecord.createdAt).toLocaleString()}</div>
                    )}
                    {selectedRecord.body?.notes && (
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <p className="text-slate-200 whitespace-pre-wrap">{selectedRecord.body.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  )
}