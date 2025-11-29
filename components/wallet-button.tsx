"use client"

import { useState } from "react"
import { Wallet, LogOut, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/context/wallet-context"

export function WalletButton() {
  const {
    isConnected,
    isConnecting,
    error,
    walletAddress,
    connectWallet,
    disconnectWallet,
  } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!walletAddress) return
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={isConnecting} className="gap-2">
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  const label =
    walletAddress && walletAddress.length > 10
      ? `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`
      : "Metanet Desktop"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
          BRC-100 Wallet Connected
        </div>

        {walletAddress && (
          <div className="px-2 py-2 bg-muted rounded mx-2 mb-2">
            <code className="text-xs font-mono break-all text-foreground">
              {walletAddress}
            </code>
          </div>
        )}

        {walletAddress && (
          <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </>
            )}
          </DropdownMenuItem>
        )}

        {error && (
          <div className="px-2 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={disconnectWallet}
          className="gap-2 text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
