"use client"

import { Shield, Key, Database } from "lucide-react"
import PatientSidebar from "@/components/dashboards/patient-sidebar"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PatientSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and privacy settings</p>
        </div>

        {/* Settings Content */}
        <div className="px-8 py-8 max-w-4xl">
          {/* Wallet Settings */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Wallet Settings</h2>
                <p className="text-slate-400 text-sm">Manage your BSV wallet connection</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <p className="text-slate-400 text-sm mb-2">Connected Wallet Address</p>
                <p className="text-white font-mono text-sm break-all">1A1z7agoat2FYLAKGKTY1j1wWUTAJJJA</p>
              </div>
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition">
                Disconnect Wallet
              </button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
                <p className="text-slate-400 text-sm">Control who can access your records</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div>
                  <p className="text-white font-medium">Record Encryption</p>
                  <p className="text-slate-400 text-sm">Enable end-to-end encryption</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div>
                  <p className="text-white font-medium">Access Notifications</p>
                  <p className="text-slate-400 text-sm">Get notified when records are accessed</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div>
                  <p className="text-white font-medium">Audit Logging</p>
                  <p className="text-slate-400 text-sm">Log all record access activities</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Data Management</h2>
                <p className="text-slate-400 text-sm">Export or delete your medical data</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition">
                Export All Records
              </button>
              <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition">
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
