"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { WalletClient } from "@bsv/sdk"
// 🟢 1. Import MessageBox
import { MessageBoxClient } from "@bsv/message-box-client"

interface WalletContextType {
  isConnected: boolean
  isConnecting: boolean
  error: string | null

  walletClient: WalletClient | null
  // 🟢 2. Add MessageBox Client to Interface
  msgClient: MessageBoxClient | null

  walletAddress: string | null
  balance: number | null

  connectWallet: () => Promise<void>
  disconnectWallet: () => void

  signMessage: (message: string) => Promise<string>
  signTransaction: (txData: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  // 🟢 3. State for MessageBox
  const [msgClient, setMsgClient] = useState<MessageBoxClient | null>(null)

  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      let client: WalletClient | null = null

      // ---------------------------------------------------------
      // 1️⃣ ATTEMPT 1: Try Default Port (3301)
      // ---------------------------------------------------------
      try {
        console.log("🔌 Attempting connection on default port (3301)...")
        const candidate = new WalletClient() 

        await candidate.listOutputs({
          basket: "micro-contracts",
          limit: 1,
        })
        
        client = candidate
        console.log("✅ Connected on Port 3301")
      } catch (err3301) {
        console.warn("⚠️ Port 3301 failed. Falling through to Port 3321...")
      }

      // ---------------------------------------------------------
      // 2️⃣ ATTEMPT 2: Fallback to BSV Desktop Port (3321)
      // ---------------------------------------------------------
      if (!client) {
        try {
          console.log("🔌 Attempting connection on fallback port (3321)...")
          const candidate = new WalletClient({ 
              url: "http://localhost:3321" 
          } as any)

          await candidate.listOutputs({
            basket: "micro-contracts",
            limit: 1,
          })

          client = candidate
          console.log("✅ Connected on Port 3321")
        } catch (err3321) {
          throw new Error("Desktop Agent not found on port 3301 OR 3321.")
        }
      }

      // ---------------------------------------------------------
      // ✅ SUCCESS: We have a working client
      // ---------------------------------------------------------
      setWalletClient(client)

      // Get identity public key
      try {
        const { publicKey } = await client.getPublicKey({ identityKey: true })
        setWalletAddress(publicKey)
      } catch (e) {
        console.error("Failed to get identity key:", e)
        setWalletAddress(null)
      }

      // 🟢 4. INITIALIZE MESSAGEBOX
      try {
        console.log("📬 Initializing MessageBox...");
        const mbox = new MessageBoxClient({
            walletClient: client,
            enableLogging: true // Helps with debugging
        });
        await mbox.initializeConnection();
        console.log("✅ MessageBox Connected!");
        setMsgClient(mbox);
      } catch (mboxErr) {
        console.warn("⚠️ MessageBox failed to connect (Real-time alerts disabled):", mboxErr);
        // We do NOT throw here, because we want the wallet to still work even if messaging fails
      }

      setBalance(null)
      setIsConnected(true)

    } catch (err) {
      console.error("Wallet connection error:", err)
      setWalletClient(null)
      setMsgClient(null)
      setIsConnected(false)
      setWalletAddress(null)
      setBalance(null)
      setError("Failed to connect. Please ensure Babbage Desktop (3301) or BSV Desktop (3321) is running.")
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setIsConnected(false)
    setWalletClient(null)
    setMsgClient(null) // Clear msg client
    setWalletAddress(null)
    setBalance(null)
    setError(null)
  }, [])

  const signMessage = useCallback(
    async (_message: string): Promise<string> => {
      if (!walletClient) throw new Error("Wallet not connected")
      throw new Error("signMessage is not implemented.")
    },
    [walletClient],
  )

  const signTransaction = useCallback(
    async (_txData: string): Promise<string> => {
      if (!walletClient) throw new Error("Wallet not connected")
      throw new Error("signTransaction is not implemented.")
    },
    [walletClient],
  )

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        error,
        walletClient,
        msgClient, // 🟢 Export msgClient
        walletAddress,
        balance,
        connectWallet,
        disconnectWallet,
        signMessage,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return ctx
}