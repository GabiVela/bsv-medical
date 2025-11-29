"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, Activity, Loader2, ListPlus, UserCheck, XCircle, RefreshCw } from "lucide-react"

import { useWallet } from "@/context/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"

// 🔹 BSV SDK pieces
import { P2PKH, PublicKey } from "@bsv/sdk"

// --- CONFIGURATION ---
const ADMIN_PUBKEY =
  "026e845dfa6861d663706f31a6d1b1d3537ed8d4258fb5cd0ff699b8a79f3ac316"
const REGISTRY_BASKET = "medichain-doctor-registry"

interface RegistryEntry {
  key: string
  addedBy: string
  timestamp: string
}

export default function AdminPage() {
  const { walletAddress, walletClient, isConnected } = useWallet()
  const isAdmin = walletAddress === ADMIN_PUBKEY

  // --- STATE ---
  const [registryList, setRegistryList] = useState<RegistryEntry[]>([])
  const [newDoctorKey, setNewDoctorKey] = useState("")
  const [latestRegistryTxid, setLatestRegistryTxid] = useState<string | null>(
    null,
  )
  const [roleStatus, setRoleStatus] = useState<string | null>(null)
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null)

  // 1. LOAD DOCTOR REGISTRY LIST FROM BSV CHAIN
const loadRegistry = useCallback(async () => {
    if (!walletClient || !isConnected) return;
    setRoleStatus("Loading registry...");
    setAdminError(null);

    try {
      // 1. Fetch MORE than 1 output to ensure we don't miss the new one due to sorting issues
      const res = await walletClient.listOutputs({
        basket: REGISTRY_BASKET,
        includeCustomInstructions: true,
        limit: 10, // Fetch top 10 to be safe
      });
      
      const outputs = res.outputs || [];

      if (outputs.length === 0) {
        setRegistryList([]);
        setLatestRegistryTxid(null);
        setRoleStatus("Registry initialized, but empty (or syncing).");
        return;
      }

      // 2. MANUAL SORTING: Trust the data, not the blockchain sort order
      // We parse all outputs and find the one with the most recent 'updatedAt' timestamp
      const validRegistries = outputs.map((out: any) => {
          try {
              const meta = JSON.parse(out.customInstructions);
              // Ensure it's actually our registry data
              if (!meta.doctors || !meta.updatedAt) return null;
              
              return {
                  meta,
                  txid: out.outpoint ? out.outpoint.split('.')[0] : 'unknown',
                  timestamp: new Date(meta.updatedAt).getTime()
              };
          } catch (e) { return null; }
      }).filter(Boolean); // Remove nulls

      if (validRegistries.length === 0) {
           setRoleStatus("No valid registry data found.");
           return;
      }

      // 3. Sort Descending by Time (Newest First)
      validRegistries.sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));

      const latest = validRegistries[0]; // This is the winner

      if (latest) {
          setRegistryList(latest.meta.doctors || []);
          setLatestRegistryTxid(latest.txid);
          setRoleStatus(`Registry loaded: ${latest.meta.doctors?.length || 0} doctors found.`);
          console.log("✅ Loaded Registry Version:", latest.meta.updatedAt);
      }

    } catch (err) {
      console.error("Failed to load doctor registry:", err);
      setRoleStatus("Failed to load registry.");
    }
  }, [walletClient, isConnected]);
  useEffect(() => {
    if (isConnected && walletClient) {
      void loadRegistry()
    }
  }, [isConnected, walletClient, loadRegistry])

  // 2. ADMIN FUNCTION: ADD NEW DOCTOR
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError(null)
    setAdminSuccess(null)

    if (!isAdmin) {
      setAdminError("Access Denied: Only the Administrator key can modify the registry.")
      return
    }
    if (
      !newDoctorKey.trim() ||
      newDoctorKey.length < 30 ||
      !newDoctorKey.startsWith("0")
    ) {
      setAdminError(
        "Invalid Public Key entered. Must be a hex public key (starts with 02 or 03).",
      )
      return
    }
    if (registryList.some((d) => d.key === newDoctorKey)) {
      setAdminError("Doctor key is already registered.")
      return
    }

    setIsSubmittingAdmin(true)

    try {
      // Create the NEW registry list
      const updatedList: RegistryEntry[] = [
        ...registryList,
        {
          key: newDoctorKey,
          addedBy: walletAddress || "",
          timestamp: new Date().toISOString(),
        },
      ]

      const newRegistryMetadata = {
        version: "medichain-registry-v1",
        updatedAt: new Date().toISOString(),
        adminKey: ADMIN_PUBKEY,
        doctors: updatedList,
      }

      // 🔐 Build a P2PKH locking script that can only be spent by the admin key
      const adminAddress = PublicKey.fromString(ADMIN_PUBKEY).toAddress()
      const adminLockScript = new P2PKH().lock(adminAddress)

      const actionResult = await walletClient!.createAction({
        description: `Update Doctor Registry: Add new key ${newDoctorKey.slice(
          0,
          8,
        )}...`,
        outputs: [
          {
            satoshis: 1,
            lockingScript: adminLockScript.toHex(),
            basket: REGISTRY_BASKET,
            outputDescription: "Doctor Registry Control UTXO",
            customInstructions: JSON.stringify(newRegistryMetadata),
          },
        ],
      })

      setRegistryList(updatedList)
      setNewDoctorKey("")
      const txid =
        (actionResult as any)?.txid || (actionResult as any)?.transactionId
      setAdminSuccess(`Successfully added new doctor! TXID: ${txid}`)
      setLatestRegistryTxid(txid)
    } catch (err) {
      console.error("Admin action failed:", err)
      setAdminError(
        err instanceof Error
          ? err.message
          : "Failed to execute admin action. Check your balance and previous UTXO status.",
      )
    } finally {
      setIsSubmittingAdmin(false)
    }
  }

  const shortIdentity =
    walletAddress && walletAddress.length > 18
      ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
      : walletAddress || "Not connected"

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <XCircle className="w-12 h-12 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-red-400">
          ADMIN ACCESS DENIED
        </h1>
        <p className="text-slate-400">
          Your wallet address does not match the hardcoded Administrator key.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-red-400" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-red-400">
              MediChain Administrator
            </span>
            <span className="text-xs text-slate-400">Role: Administrator</span>
          </div>
        </div>
        <WalletButton />
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* --- IDENTITY & STATUS --- */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 bg-red-900/40 border border-red-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Administrator Key</h2>
            <code className="block bg-slate-900/80 border border-red-700 rounded px-3 py-2 break-all text-xs">
              {walletAddress}
            </code>
          </div>

          <div className="bg-red-900/40 border border-red-700 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-sm text-slate-400">Registry Status</div>
                <div className="text-base font-semibold text-yellow-400">
                  {roleStatus}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRegistry}
              disabled={isSubmittingAdmin}
              className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Registry
            </Button>
          </div>
        </section>

        {/* --- ADMIN PANEL --- */}
        <section className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <ListPlus className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Doctor Registry Management (On-Chain)</h2>
          </div>

          {/* Add Doctor Form */}
          <form
            onSubmit={handleAddDoctor}
            className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/30"
          >
            <h3 className="text-lg font-semibold text-slate-200">
              Add New Doctor to Registry
            </h3>
            <p className="text-sm text-slate-300">
              This action creates a new BSV transaction to store the updated
              list. Only the Admin Key can modify this record in the future.
            </p>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200">
                Doctor Public Key to Register
              </label>
              <input
                type="text"
                value={newDoctorKey}
                onChange={(e) => setNewDoctorKey(e.target.value)}
                placeholder="Paste the new Doctor's Public Key (e.g., 02abc...)"
                className="w-full px-3 py-2 rounded-md bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {adminError && (
              <div className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
                {adminError}
              </div>
            )}
            {adminSuccess && (
              <div className="text-xs text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 rounded px-3 py-2">
                {adminSuccess}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingAdmin || !isConnected}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmittingAdmin && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isSubmittingAdmin
                  ? "Updating Registry..."
                  : "Register New Doctor ON-CHAIN"}
              </Button>
            </div>
          </form>

          {/* Current Registry List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">
              Current Registered Doctors
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              Latest Registry TXID: {latestRegistryTxid || "N/A"}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {registryList.length === 0 ? (
                <p className="text-slate-400">No doctors currently registered.</p>
              ) : (
                registryList.map((entry) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-md border border-slate-700"
                  >
                    <code className="text-xs break-all">{entry.key}</code>
                    <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-4" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
