"use client"

import { Key, Bell, Users } from "lucide-react"
import ProviderSidebar from "@/components/dashboards/provider-sidebar"

export default function ProviderSettingsPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ProviderSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Provider Settings</h1>
          <p className="text-slate-400 mt-1">Manage your medical provider account</p>
        </div>

        {/* Settings */}
        <div className="px-8 py-8 max-w-4xl">
          {/* Provider Information */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Provider Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Dr. Sarah Johnson"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">License Number</label>
                  <input
                    type="text"
                    defaultValue="MD-789456123"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Specialization</label>
                  <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option>Cardiology</option>
                    <option>General Practice</option>
                    <option>Neurology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Facility</label>
                  <input
                    type="text"
                    defaultValue="City Medical Center"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Save Changes
              </button>
            </div>
          </div>

          {/* Wallet Management */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Wallet Management</h2>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 mb-4">
              <p className="text-slate-400 text-sm mb-2">Connected Wallet</p>
              <p className="text-white font-mono text-sm break-all">1DrSarahJohnsonMedicalProvider</p>
            </div>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition">
              Reconnect Wallet
            </button>
          </div>

          {/* Notification Preferences */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-medium">New Record Requests</p>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-medium">Patient Updates</p>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-white font-medium">System Alerts</p>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Team Members</h2>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">
                Add Member
              </button>
            </div>
            <div className="space-y-2">
              {[
                { name: "Dr. Michael Chen", role: "Specialist" },
                { name: "Dr. Emily Brown", role: "Resident" },
              ].map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-slate-400 text-sm">{member.role}</p>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm transition">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
