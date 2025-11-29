"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import RoleSelector from "@/components/role-selector"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "wallet" | "details">("role")
  const [userRole, setUserRole] = useState<"patient" | "provider" | "pharmacy" | null>(null)
  const [walletAddress, setWalletAddress] = useState("")

  const handleRoleSelect = (role: "patient" | "provider" | "pharmacy") => {
    setUserRole(role)
    setStep("wallet")
  }

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address)
    setStep("details")
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
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">Join the decentralized healthcare network</p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-1 rounded ${step === "role" ? "bg-blue-500" : "bg-slate-700"}`} />
          <div
            className={`flex-1 h-1 rounded ${["wallet", "details"].includes(step) ? "bg-blue-500" : "bg-slate-700"}`}
          />
          <div className={`flex-1 h-1 rounded ${step === "details" ? "bg-blue-500" : "bg-slate-700"}`} />
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
          {step === "role" && <RoleSelector onRoleSelect={handleRoleSelect} />}

          {step === "wallet" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Connect Your Wallet</h2>
              <WalletConnect onConnected={handleWalletConnected} />
              <button
                onClick={() => setStep("role")}
                className="w-full mt-4 text-slate-400 hover:text-slate-300 text-sm transition"
              >
                ← Back
              </button>
            </div>
          )}

          {step === "details" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Complete Your Profile</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                {userRole === "provider" && (
                  <>
                    <input
                      type="text"
                      placeholder="Medical License Number"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Specialization"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </>
                )}
                {userRole === "pharmacy" && (
                  <input
                    type="text"
                    placeholder="Pharmacy License Number"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                )}
                <button
                  onClick={() => router.push(`/dashboard/${userRole}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition mt-6"
                >
                  Complete Setup
                </button>
              </div>
              <button
                onClick={() => setStep("wallet")}
                className="w-full mt-4 text-slate-400 hover:text-slate-300 text-sm transition"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center text-slate-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
