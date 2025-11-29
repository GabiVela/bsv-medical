"use client"

import Link from "next/link"
import { Lock, FileText, Share2, Smartphone, Shield, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button"
import { useWallet } from "@/context/wallet-context"

export default function LandingPage() {
  const { isConnected, isConnecting, connectWallet } = useWallet()

  const handleConnectClick = async () => {
    if (!isConnected && !isConnecting) {
      await connectWallet()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-white">MediChain</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition">
            Sign In
          </Link>
          <WalletButton />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-24 max-w-7xl mx-auto gap-12">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Healthcare Records on the Blockchain
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Control your medical records with your BSV wallet. Grant access to providers and pharmacies
            with complete transparency and security.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Connect Wallet */}
            <Button
              onClick={handleConnectClick}
              disabled={isConnecting || isConnected}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
            >
              {isConnected
                ? "Wallet Connected"
                : isConnecting
                ? "Connecting..."
                : "Connect Wallet"}
              {!isConnected && <ArrowRight className="w-4 h-4" />}
            </Button>

            {/* Doctor Dashboard Button (only visible AFTER wallet connects) */}
            {isConnected && (
              <Link href="/dashboard/doctor" className="inline-flex">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">
                  Doctor Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}

            {/* Learn More */}
            <Link href="/learn" className="inline-flex">
              <button className="border border-slate-600 text-slate-300 hover:text-white px-6 py-3 rounded-lg transition">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Phone graphic */}
        <div className="flex-1 relative h-96 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-32 h-32 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-24 max-w-7xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition">
          <Lock className="w-10 h-10 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
          <p className="text-slate-400">
            Your records are encrypted and stored securely on the BSV blockchain.
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition">
          <Share2 className="w-10 h-10 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Easy Sharing</h3>
          <p className="text-slate-400">
            Grant granular access to doctors, specialists, and pharmacies instantly.
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition">
          <FileText className="w-10 h-10 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Complete History</h3>
          <p className="text-slate-400">
            View your complete medical history with immutable transaction records.
          </p>
        </div>
      </div>
    </div>
  )
}
