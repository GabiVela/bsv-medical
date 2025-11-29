"use client"

import { Eye, Download, Share2 } from "lucide-react"

export default function PermissionAuditLog() {
  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-01-22 10:45 AM",
      entity: "Dr. Sarah Johnson",
      action: "Viewed Lab Results",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2024-01-21 3:20 PM",
      entity: "Downtown Pharmacy",
      action: "Downloaded Prescription",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2024-01-20 2:10 PM",
      entity: "Dr. Robert Smith",
      action: "Access Denied",
      status: "denied",
    },
    {
      id: 4,
      timestamp: "2024-01-19 11:30 AM",
      entity: "City Medical Center",
      action: "Uploaded Medical History",
      status: "success",
    },
  ]

  const getActionIcon = (action: string) => {
    if (action.includes("View")) return <Eye className="w-4 h-4" />
    if (action.includes("Download")) return <Download className="w-4 h-4" />
    if (action.includes("Share")) return <Share2 className="w-4 h-4" />
    return <Eye className="w-4 h-4" />
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Audit Log</h2>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-blue-500/20 p-2 rounded">{getActionIcon(log.action)}</div>
              <div>
                <p className="text-white text-sm font-medium">{log.action}</p>
                <p className="text-slate-400 text-xs">{log.entity}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm">{log.timestamp}</p>
              <span className={`text-xs font-medium ${log.status === "success" ? "text-green-400" : "text-red-400"}`}>
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
