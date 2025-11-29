"use client"

import { useState } from "react"
import { Plus, FileText, Share2 } from "lucide-react"
import PatientSidebar from "@/components/dashboards/patient-sidebar"
import RecordsList from "@/components/dashboards/records-list"
import AccessManagement from "@/components/dashboards/access-management"

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<"records" | "access">("records")

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PatientSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Medical Records</h1>
              <p className="text-slate-400 mt-1">Manage and share your healthcare information</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Plus className="w-5 h-5" />
              Upload Record
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 px-8 py-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("records")}
            className={`pb-4 font-medium transition ${
              activeTab === "records"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Records
            </div>
          </button>
          <button
            onClick={() => setActiveTab("access")}
            className={`pb-4 font-medium transition ${
              activeTab === "access"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Access Control
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {activeTab === "records" && <RecordsList />}
          {activeTab === "access" && <AccessManagement />}
        </div>
      </div>
    </div>
  )
}
