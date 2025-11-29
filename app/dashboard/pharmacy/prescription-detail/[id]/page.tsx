"use client"

import { useParams } from "next/navigation"
import { CheckCircle, AlertCircle, Download } from "lucide-react"
import PharmacySidebar from "@/components/dashboards/pharmacy-sidebar"
import { useState } from "react"

export default function PrescriptionDetailPage() {
  const params = useParams()
  const prescriptionId = params.id
  const [status, setStatus] = useState("pending")

  const prescription = {
    id: "RX-001",
    patientName: "John Doe",
    patientAge: 45,
    patientContact: "john@example.com",
    medication: "Amoxicillin 500mg",
    dosage: "1 tablet, 3x daily",
    quantity: "30 tablets",
    refills: 2,
    instructions: "Take with food. Do not take if allergic to penicillin.",
    prescriber: "Dr. Sarah Johnson",
    prescriberLicense: "MD-789456123",
    issueDate: "2024-01-20",
    expiryDate: "2025-01-20",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j",
    patientAllergies: ["Penicillin"],
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PharmacySidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Prescription Details</h1>
              <p className="text-slate-400 mt-1">Prescription ID: {prescription.id}</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Alert if allergies match */}
        {prescription.patientAllergies.length > 0 && (
          <div className="mx-8 mt-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Allergy Warning</h3>
              <p className="text-red-300 text-sm">
                Patient has allergies to: {prescription.patientAllergies.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Prescription Info */}
            <div className="col-span-2 space-y-6">
              {/* Medication Details */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Medication Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Medication</p>
                      <p className="text-white font-medium text-lg">{prescription.medication}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Dosage</p>
                      <p className="text-white font-medium">{prescription.dosage}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Quantity</p>
                      <p className="text-white font-medium">{prescription.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Refills</p>
                      <p className="text-white font-medium">{prescription.refills}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Instructions</p>
                      <p className="text-white font-medium text-sm">{prescription.instructions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescriber Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Prescriber Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Prescriber</p>
                    <p className="text-white font-medium">{prescription.prescriber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">License Number</p>
                    <p className="text-white font-medium">{prescription.prescriberLicense}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Issue Date</p>
                      <p className="text-white font-medium">{prescription.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Expiry Date</p>
                      <p className="text-white font-medium">{prescription.expiryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Blockchain Verification
                </h2>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Transaction Hash</p>
                  <p className="text-white font-mono text-sm bg-slate-700/50 p-3 rounded border border-slate-600 break-all">
                    {prescription.txHash}
                  </p>
                  <p className="text-green-400 text-sm mt-3 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified on BSV Blockchain
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Patient & Status */}
            <div className="col-span-1 space-y-6">
              {/* Patient Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Patient Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Name</p>
                    <p className="text-white font-medium text-sm">{prescription.patientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Age</p>
                    <p className="text-white font-medium text-sm">{prescription.patientAge}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Contact</p>
                    <p className="text-white font-medium text-sm break-all">{prescription.patientContact}</p>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Status</h3>
                <div className="space-y-3">
                  {status === "pending" && (
                    <>
                      <button
                        onClick={() => setStatus("filled")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Filled
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
                        Reject
                      </button>
                    </>
                  )}
                  {status === "filled" && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                      <p className="text-green-400 font-medium text-sm">Prescription Filled</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
