"use client"

import { useState } from "react"
import { Upload, X, FileText, Eye, Download } from "lucide-react"
import PatientSidebar from "@/components/dashboards/patient-sidebar"

export default function RecordsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  const records = [
    {
      id: 1,
      name: "Lab Results - Blood Work",
      type: "Lab Results",
      date: "2024-01-20",
      provider: "City Medical Center",
      fileSize: "2.4 MB",
      txHash: "0x1a2b3c4d5e6f7g8h9i0j",
      sharedWith: ["Dr. Sarah Johnson", "Downtown Pharmacy"],
    },
    {
      id: 2,
      name: "CT Scan Report",
      type: "Imaging",
      date: "2024-01-15",
      provider: "Radiology Center",
      fileSize: "15.8 MB",
      txHash: "0x9i8h7g6f5e4d3c2b1a0",
      sharedWith: ["Dr. Robert Smith"],
    },
    {
      id: 3,
      name: "Prescription History",
      type: "Prescription",
      date: "2024-01-10",
      provider: "Dr. Sarah Johnson",
      fileSize: "0.8 MB",
      txHash: "0x5e4d3c2b1a0i9h8g7f6",
      sharedWith: ["Downtown Pharmacy", "City Pharmacy"],
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PatientSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Medical Records</h1>
              <p className="text-slate-400 mt-1">View and manage all your medical documents</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Upload className="w-5 h-5" />
              Upload Record
            </button>
          </div>
        </div>

        {/* Records Grid */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{record.name}</h3>
                    <p className="text-slate-400 text-sm">{record.provider}</p>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                    {record.type}
                  </span>
                </div>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Date</span>
                    <span className="text-white">{record.date}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>File Size</span>
                    <span className="text-white">{record.fileSize}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TX Hash</span>
                    <span className="text-white font-mono text-xs">{record.txHash.slice(0, 10)}...</span>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-t border-slate-700">
                  <p className="text-slate-400 text-xs mb-2">Shared with ({record.sharedWith.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {record.sharedWith.map((entity, idx) => (
                      <span key={idx} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Medical Record</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Record Type</label>
                  <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option>Lab Results</option>
                    <option>Prescription</option>
                    <option>Imaging</option>
                    <option>Medical History</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Medical Provider</label>
                  <input
                    type="text"
                    placeholder="Provider name or ID"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Upload File</label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Drag and drop your file here or click to browse</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Record Viewer Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedRecord.name}</h2>
                <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Provider</p>
                    <p className="text-white font-medium">{selectedRecord.provider}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Type</p>
                    <p className="text-white font-medium">{selectedRecord.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Date</p>
                    <p className="text-white font-medium">{selectedRecord.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">File Size</p>
                    <p className="text-white font-medium">{selectedRecord.fileSize}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Transaction Hash (Blockchain)</p>
                  <p className="text-white font-mono text-xs bg-slate-700/50 p-3 rounded border border-slate-600 break-all">
                    {selectedRecord.txHash}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Document Preview</p>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center h-64 flex items-center justify-center">
                    <div>
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Document preview would load here</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition">
                  Share Record
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
