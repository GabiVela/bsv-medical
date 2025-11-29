"use client"

import { useState } from "react"
import { Search, Filter, Eye, Download } from "lucide-react"
import ProviderSidebar from "@/components/dashboards/provider-sidebar"

export default function ProviderDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const patientRecords = [
    {
      id: 1,
      patientName: "John Doe",
      patientID: "P001",
      recordType: "Lab Results",
      date: "2024-01-15",
      status: "accessible",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      patientID: "P002",
      recordType: "Prescription History",
      date: "2024-01-10",
      status: "accessible",
    },
    {
      id: 3,
      patientName: "Robert Johnson",
      patientID: "P003",
      recordType: "Medical History",
      date: "2024-01-08",
      status: "pending",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ProviderSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Patient Records</h1>
          <p className="text-slate-400 mt-1">Access authorized patient medical records</p>
        </div>

        {/* Search and Filters */}
        <div className="px-8 py-6 border-b border-slate-700">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="px-8 py-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Record Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-700/25 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{record.patientName}</div>
                        <div className="text-sm text-slate-400">{record.patientID}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{record.recordType}</td>
                    <td className="px-6 py-4 text-slate-300">{record.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "accessible"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-600 rounded-lg transition text-slate-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-slate-600 rounded-lg transition text-slate-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
