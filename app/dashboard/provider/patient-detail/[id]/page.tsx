"use client"

import { useParams } from "next/navigation"
import { Download, Share2, Clock, FileText, AlertCircle } from "lucide-react"
import ProviderSidebar from "@/components/dashboards/provider-sidebar"

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id

  // Mock patient data
  const patient = {
    name: "John Doe",
    age: 45,
    mrn: "MRN-001",
    contact: "john@example.com",
    allergies: ["Penicillin", "Shellfish"],
    medicalHistory: "Hypertension, Type 2 Diabetes",
    currentMedications: ["Lisinopril 10mg", "Metformin 500mg"],
    lastVisit: "2024-01-20",
    permissions: ["Medical History", "Lab Results", "Prescriptions"],
  }

  const records = [
    {
      id: 1,
      name: "Lab Results - Blood Work",
      type: "Lab Results",
      date: "2024-01-20",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Recent Vitals",
      type: "Vital Signs",
      date: "2024-01-20",
      size: "0.5 MB",
    },
    {
      id: 3,
      name: "Prescription History",
      type: "Prescription",
      date: "2024-01-15",
      size: "0.8 MB",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ProviderSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{patient.name}</h1>
              <div className="flex gap-4 mt-2 text-slate-400 text-sm">
                <span>MRN: {patient.mrn}</span>
                <span>Age: {patient.age}</span>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Share2 className="w-5 h-5" />
              Share Record
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Patient Info */}
            <div className="col-span-1 space-y-6">
              {/* Allergies Alert */}
              {patient.allergies.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Allergies</h3>
                      <div className="space-y-1">
                        {patient.allergies.map((allergy, idx) => (
                          <p key={idx} className="text-red-300 text-sm">
                            {allergy}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Contact</h3>
                <p className="text-slate-300 text-sm">{patient.contact}</p>
              </div>

              {/* Last Visit */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-white">Last Visit</h3>
                </div>
                <p className="text-slate-300 text-sm">{patient.lastVisit}</p>
              </div>
            </div>

            {/* Right Column - Medical Info and Records */}
            <div className="col-span-2 space-y-6">
              {/* Medical History */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Medical History</h3>
                <p className="text-slate-300 mb-4">{patient.medicalHistory}</p>

                <div className="mb-4">
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Current Medications</h4>
                  <div className="space-y-2">
                    {patient.currentMedications.map((med, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-2 rounded text-slate-300 text-sm">
                        {med}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical Records */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Medical Records</h3>
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium text-sm">{record.name}</p>
                          <p className="text-slate-400 text-xs">
                            {record.type} • {record.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-600 rounded transition text-slate-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Permissions */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Your Access</h3>
                <div className="flex flex-wrap gap-2">
                  {patient.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
