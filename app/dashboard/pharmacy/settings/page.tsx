"use client"

import { Bell, Lock } from "lucide-react"
import PharmacySidebar from "@/components/dashboards/pharmacy-sidebar"

export default function PharmacySettingsPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PharmacySidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Pharmacy Settings</h1>
          <p className="text-slate-400 mt-1">Manage your pharmacy account preferences</p>
        </div>

        {/* Settings */}
        <div className="px-8 py-8 max-w-4xl">
          {/* Pharmacy Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Pharmacy Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pharmacy Name</label>
                <input
                  type="text"
                  defaultValue="Downtown Pharmacy"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">License Number</label>
                <input
                  type="text"
                  defaultValue="PH-789456123"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Save Changes
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-medium">New Prescription Alerts</p>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-medium">Patient Record Access</p>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition">
                Change Password
              </button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition">
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
