"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { WalletClient } from "@bsv/sdk"

interface WalletContextType {
  isConnected: boolean
  isConnecting: boolean
  error: string | null

  walletClient: WalletClient | null

  // Optional, for future overlays (identity, paymail, etc.)
  walletAddress: string | null
  balance: number | null

  connectWallet: () => Promise<void>
  disconnectWallet: () => void

  // Not used right now – kept for future use
  signMessage: (message: string) => Promise<string>
  signTransaction: (txData: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  // Optional, for future identity overlays
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

const connectWallet = useCallback(async () => {
  setIsConnecting(true)
  setError(null)

  try {
    const client = new WalletClient()

    // 🔹 Ping Metanet Desktop to verify it's available.
    await client
      .listOutputs({
        basket: "micro-contracts", // required by ListOutputsArgs
        limit: 1,
      })
      .catch(() => {
        throw new Error("Metanet Desktop not available")
      })

    setWalletClient(client)
    setIsConnected(true)

    setWalletAddress(null)
    setBalance(null)
  } catch (err) {
    console.error("Wallet connection error:", err)
    setWalletClient(null)
    setIsConnected(false)
    setWalletAddress(null)
    setBalance(null)
    setError("Failed to connect. Please open Metanet Desktop and unlock it.")
  } finally {
    setIsConnecting(false)
  }
}, [])


  const disconnectWallet = useCallback(() => {
    setIsConnected(false)
    setWalletClient(null)
    setWalletAddress(null)
    setBalance(null)
    setError(null)
  }, [])

  // Placeholders – real signing is done via WalletClient flows (createAction, etc.)
  const signMessage = useCallback(
    async (_message: string): Promise<string> => {
      if (!walletClient) {
        throw new Error("Wallet not connected")
      }
      throw new Error(
        "signMessage is not implemented for BRC-100 yet. Use WalletClient-based flows instead.",
      )
    },
    [walletClient],
  )

  const signTransaction = useCallback(
    async (_txData: string): Promise<string> => {
      if (!walletClient) {
        throw new Error("Wallet not connected")
      }
      throw new Error(
        "signTransaction is not implemented directly. Build an action and use WalletClient.createAction instead.",
      )
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
