"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { WalletClient } from "@bsv/sdk"

interface WalletContextType {
  wallet: WalletClient | null
  isReady: boolean
  walletAddress: string | null
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletClient | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Just construct the client; don't talk to Metanet yet.
  useEffect(() => {
    const client = new WalletClient()
    setWallet(client)
    setIsReady(true)
  }, [])

  const connectWallet = useCallback(async () => {
    if (!wallet) return

    try {
      setError(null)
      // This will trigger Metanet Desktop to be used if available
      const { publicKey } = await wallet.getPublicKey({ identityKey: true })
      setWalletAddress(publicKey)
    } catch (err) {
      console.error("Connect wallet failed:", err)
      setWalletAddress(null)
      setError(
        "No BSV wallet detected. Please install, open, and unlock Metanet Desktop.",
      )
    }
  }, [wallet])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setError(null)
  }, [])

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isReady,
        walletAddress,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used inside a WalletProvider")
  }
  return context
}
