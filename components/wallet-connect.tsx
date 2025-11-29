"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { useState } from "react"

export function WalletConnect() {
  const { walletAddress, isReady, connectWallet, disconnectWallet } = useWallet()
  const [copied, setCopied] = useState(false)

  if (!isReady) {
    return (
      <Button disabled className="gap-2">
        <Wallet className="w-4 h-4" />
        Loading...
      </Button>
    )
  }

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  if (!walletAddress) {
    return (
      <Button onClick={connectWallet} className="gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="gap-2" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 6)}
      </Button>
      <Button variant="destructive" onClick={disconnectWallet} className="gap-2">
        <LogOut className="w-4 h-4" />
        Disconnect
      </Button>
    </div>
  )
}
