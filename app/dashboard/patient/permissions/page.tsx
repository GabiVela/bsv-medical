"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import PatientSidebar from "@/components/dashboards/patient-sidebar"

export default function PermissionsPage() {
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<any>(null)

  const permissions = [
    {
      id: 1,
      entity: "Dr. Sarah Johnson",
      type: "Medical Provider",
      grantedDate: "2024-01-10",
      recordsAccess: ["Lab Results", "Medical History", "Prescriptions"],
      status: "active",
      lastAccessed: "2024-01-22 10:30 AM",
      expiration: "2025-01-10",
    },
    {
      id: 2,
      entity: "Downtown Pharmacy",
      type: "Pharmacy",
      grantedDate: "2024-01-05",
      recordsAccess: ["Prescriptions", "Allergies"],
      status: "active",
      lastAccessed: "2024-01-21 3:15 PM",
      expiration: "2025-01-05",
    },
    {
      id: 3,
      entity: "Dr. Robert Smith",
      type: "Medical Provider",
      grantedDate: "2023-12-20",
      recordsAccess: ["Lab Results"],
      status: "inactive",
      lastAccessed: "2024-01-15 2:00 PM",
      expiration: null,
    },
  ]

  const recordTypes = ["Lab Results", "Prescriptions", "Medical History", "Imaging", "Allergies", "Vaccines"]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PatientSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Manage Permissions</h1>
              <p className="text-slate-400 mt-1">Control who has access to your medical records</p>
            </div>
            <button
              onClick={() => setShowGrantModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Grant Access
            </button>
          </div>
        </div>

        {/* Permissions List */}
        <div className="px-8 py-8">
          <div className="space-y-4">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{perm.entity}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          perm.status === "active" ? "bg-green-500/20 text-green-400" : "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {perm.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{perm.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPermission(perm)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 rounded-lg transition text-slate-400 hover:text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-t border-slate-700 pt-4">
                  <div>
                    <p className="text-slate-400 mb-1">Granted Date</p>
                    <p className="text-white font-medium">{perm.grantedDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Last Accessed</p>
                    <p className="text-white font-medium">{perm.lastAccessed}</p>
                  </div>
                  {perm.expiration && (
                    <div>
                      <p className="text-slate-400 mb-1">Expiration</p>
                      <p className="text-white font-medium">{perm.expiration}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Record Access</p>
                  <div className="flex flex-wrap gap-2">
                    {perm.recordsAccess.map((record, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-xs font-medium">
                        {record}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grant Access Modal */}
        {showGrantModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Grant Access</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Entity Type</label>
                  <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option>Medical Provider</option>
                    <option>Pharmacy</option>
                    <option>Hospital/Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address or ID</label>
                  <input
                    type="text"
                    placeholder="Enter BSV wallet address"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Records to Share</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recordTypes.map((record) => (
                      <label
                        key={record}
                        className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                      >
                        <input type="checkbox" className="w-4 h-4" defaultChecked={record === "Prescriptions"} />
                        <span className="text-white text-sm">{record}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Expiration (Optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowGrantModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                    Grant Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Permission Modal */}
        {selectedPermission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Permission</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Entity</p>
                  <p className="text-white bg-slate-700/50 p-2 rounded">{selectedPermission.entity}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Records Access</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recordTypes.map((record) => (
                      <label
                        key={record}
                        className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          defaultChecked={selectedPermission.recordsAccess.includes(record)}
                        />
                        <span className="text-white text-sm">{record}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Expiration</label>
                  <input
                    type="date"
                    defaultValue={selectedPermission.expiration || ""}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setSelectedPermission(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
