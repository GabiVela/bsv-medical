"use client"

import { useState } from "react"
import { Plus, Trash2, Clock, CheckCircle } from "lucide-react"

export default function AccessManagement() {
  const [showAddAccess, setShowAddAccess] = useState(false)

  const accessRequests = [
    {
      id: 1,
      name: "Dr. Robert Smith",
      type: "Medical Provider",
      requestDate: "2024-01-20",
      status: "pending",
      reason: "Consultation",
    },
    {
      id: 2,
      name: "City Pharmacy",
      type: "Pharmacy",
      requestDate: "2024-01-18",
      status: "approved",
      reason: "Prescription filling",
    },
  ]

  const grantedAccess = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      type: "Medical Provider",
      grantedDate: "2024-01-10",
      recordsAccess: "All Lab Results, Medical History",
    },
    {
      id: 2,
      name: "Downtown Pharmacy",
      type: "Pharmacy",
      grantedDate: "2024-01-05",
      recordsAccess: "Prescription History only",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Access Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Pending Access Requests</h2>
          <button
            onClick={() => setShowAddAccess(!showAddAccess)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Grant Access
          </button>
        </div>

        {showAddAccess && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <input
              type="text"
              placeholder="Enter wallet address or provider ID"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Send Request
              </button>
              <button
                onClick={() => setShowAddAccess(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {accessRequests.map((request) => (
            <div key={request.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{request.name}</h3>
                  <p className="text-slate-400 text-sm">{request.type}</p>
                  <p className="text-slate-500 text-sm mt-1">Reason: {request.reason}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block ${
                      request.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {request.status}
                  </span>
                  {request.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition">
                        Approve
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Granted Access */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Granted Access</h2>
        <div className="space-y-3">
          {grantedAccess.map((access) => (
            <div key={access.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-white">{access.name}</h3>
                  </div>
                  <p className="text-slate-400 text-sm">{access.type}</p>
                  <p className="text-slate-500 text-sm mt-1">Access: {access.recordsAccess}</p>
                  <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Granted: {access.grantedDate}
                  </p>
                </div>
                <button className="text-red-400 hover:text-red-300 transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
