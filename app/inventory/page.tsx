"use client"

import { useState } from "react"
import { Plus, Search, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import PharmacySidebar from "@/components/dashboards/pharmacy-sidebar"

export default function InventoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const inventory = [
    {
      id: 1,
      name: "Amoxicillin 500mg",
      quantity: 150,
      reorderLevel: 100,
      unit: "tablets",
      supplier: "PharmaCorp",
      lastRestocked: "2024-01-15",
    },
    {
      id: 2,
      name: "Lisinopril 10mg",
      quantity: 45,
      reorderLevel: 100,
      unit: "tablets",
      supplier: "HealthSupply Inc",
      lastRestocked: "2024-01-10",
    },
    {
      id: 3,
      name: "Metformin 500mg",
      quantity: 200,
      reorderLevel: 100,
      unit: "tablets",
      supplier: "PharmaCorp",
      lastRestocked: "2024-01-18",
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
              <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
              <p className="text-slate-400 mt-1">Track medication stock levels</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Plus className="w-5 h-5" />
              Add Medication
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 py-6 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="px-8 py-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Medication</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reorder Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Supplier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Last Restocked</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.reorderLevel
                  return (
                    <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/25 transition">
                      <td className="px-6 py-4 text-slate-300 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{item.supplier}</td>
                      <td className="px-6 py-4 text-slate-300">{item.lastRestocked}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
