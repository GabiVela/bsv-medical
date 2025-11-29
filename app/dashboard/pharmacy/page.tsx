"use client"

import { useState } from "react"
import { Search, Bell, Pill, Download } from "lucide-react"
import PharmacySidebar from "@/components/dashboards/pharmacy-sidebar"

export default function PharmacyDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const prescriptions = [
    {
      id: 1,
      patientName: "John Doe",
      medication: "Amoxicillin 500mg",
      dosage: "1 tablet, 3x daily",
      quantity: "30 tablets",
      date: "2024-01-20",
      status: "pending",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      medication: "Lisinopril 10mg",
      dosage: "1 tablet daily",
      quantity: "90 tablets",
      date: "2024-01-18",
      status: "filled",
    },
    {
      id: 3,
      patientName: "Robert Johnson",
      medication: "Metformin 500mg",
      dosage: "2 tablets, 2x daily",
      quantity: "60 tablets",
      date: "2024-01-15",
      status: "filled",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PharmacySidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Prescriptions</h1>
              <p className="text-slate-400 mt-1">View and manage authorized prescriptions</p>
            </div>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Bell className="w-5 h-5" />
              Alerts
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 py-6 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="px-8 py-8">
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <Pill className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{prescription.medication}</h3>
                      <p className="text-slate-400 text-sm">Patient: {prescription.patientName}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prescription.status === "filled"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {prescription.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Dosage</p>
                    <p className="text-white font-medium">{prescription.dosage}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Quantity</p>
                    <p className="text-white font-medium">{prescription.quantity}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Date</p>
                    <p className="text-white font-medium">{prescription.date}</p>
                  </div>
                </div>

                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 transition">
                  <Download className="w-4 h-4" />
                  Download Prescription
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
