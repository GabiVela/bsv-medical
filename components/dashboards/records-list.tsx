"use client"

import { Eye, Download, Trash2, Clock } from "lucide-react"

export default function RecordsList() {
  const records = [
    {
      id: 1,
      name: "Lab Results - Blood Work",
      type: "Lab Results",
      date: "2024-01-20",
      provider: "City Medical Center",
      sharedWith: 2,
    },
    {
      id: 2,
      name: "Prescription History",
      type: "Prescription",
      date: "2024-01-15",
      provider: "Dr. Sarah Johnson",
      sharedWith: 1,
    },
    {
      id: 3,
      name: "Annual Physical Exam",
      type: "Physical Exam",
      date: "2024-01-10",
      provider: "City Medical Center",
      sharedWith: 3,
    },
  ]

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div
          key={record.id}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{record.name}</h3>
              <p className="text-slate-400 text-sm">From: {record.provider}</p>
            </div>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
              {record.type}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {record.date}
              </div>
              <div>Shared with {record.sharedWith} entities</div>
            </div>

            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white">
                <Eye className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-red-500/20 rounded-lg transition text-slate-400 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
