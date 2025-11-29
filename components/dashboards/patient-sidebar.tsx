"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, FileText, Share2, Settings, LogOut } from "lucide-react"

export default function PatientSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.includes(path)

  return (
    <div className="w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-white">MediChain</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink
          href="/dashboard/patient"
          icon={<FileText className="w-5 h-5" />}
          label="My Records"
          active={isActive("/dashboard/patient")}
        />
        <NavLink
          href="/dashboard/patient#access"
          icon={<Share2 className="w-5 h-5" />}
          label="Access Control"
          active={false}
        />
        <NavLink
          href="/dashboard/patient/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          active={isActive("settings")}
        />
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

function NavLink({ href, icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
        active ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
