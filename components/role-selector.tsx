"use client"

import { FileText, Stethoscope, Pill } from "lucide-react"

interface RoleSelectorProps {
  onRoleSelect: (role: "patient" | "provider" | "pharmacy") => void
}

export default function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Select Your Role</h2>

      <div className="space-y-3">
        <button
          onClick={() => onRoleSelect("patient")}
          className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg p-4 text-left transition"
        >
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-medium">Patient</h3>
              <p className="text-slate-400 text-sm">Manage your medical records and share with providers</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onRoleSelect("provider")}
          className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg p-4 text-left transition"
        >
          <div className="flex items-start gap-4">
            <Stethoscope className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-medium">Medical Provider</h3>
              <p className="text-slate-400 text-sm">Access patient records with proper permissions</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onRoleSelect("pharmacy")}
          className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg p-4 text-left transition"
        >
          <div className="flex items-start gap-4">
            <Pill className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-medium">Pharmacy</h3>
              <p className="text-slate-400 text-sm">Access prescription and medication information</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
