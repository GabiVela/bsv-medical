"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import ProviderSidebar from "@/components/dashboards/provider-sidebar"

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      patientName: "John Doe",
      patientID: "P001",
      requestType: "Medical History Access",
      reason: "Pre-consultation assessment",
      date: "2024-01-20",
      status: "pending",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      patientID: "P002",
      requestType: "Lab Results Access",
      reason: "Follow-up diagnosis",
      date: "2024-01-18",
      status: "approved",
    },
    {
      id: 3,
      patientName: "Robert Johnson",
      patientID: "P003",
      requestType: "Complete Medical History",
      reason: "Comprehensive treatment planning",
      date: "2024-01-15",
      status: "denied",
    },
  ])

  const handleApprove = (id: number) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "approved" } : r)))
  }

  const handleDeny = (id: number) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "denied" } : r)))
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ProviderSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Access Requests</h1>
          <p className="text-slate-400 mt-1">Manage patient record access requests</p>
        </div>

        {/* Requests List */}
        <div className="px-8 py-8">
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{request.patientName}</h3>
                    <p className="text-slate-400 text-sm">Patient ID: {request.patientID}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      request.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : request.status === "denied"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {request.status === "pending" && <Clock className="w-4 h-4" />}
                    {request.status === "approved" && <CheckCircle className="w-4 h-4" />}
                    {request.status === "denied" && <XCircle className="w-4 h-4" />}
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Request Type</p>
                    <p className="text-white font-medium">{request.requestType}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Reason</p>
                    <p className="text-white font-medium">{request.reason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <p className="text-slate-500 text-xs">Requested: {request.date}</p>
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
