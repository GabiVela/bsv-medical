"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"

export default function LoginPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address)
    // Redirect based on user type
    setTimeout(() => {
      router.push("/dashboard/patient")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
            <span className="text-2xl font-bold text-white">MediChain</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-slate-400 mt-2">Connect your BSV wallet to access your medical records</p>
        </div>

        {/* Wallet Connect */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-6">
          <WalletConnect onConnected={handleWalletConnected} />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-400">or</span>
          </div>
        </div>

        {/* Email fallback */}
        <div className="mb-6">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Sign up link */}
        <p className="text-center text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
