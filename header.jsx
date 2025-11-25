"use client"
import { Bell, LogOut } from "lucide-react"

export default function Header() {
  return (
    <header className="header">
      <div className="header-user">
        <div className="user-avatar">
          <span>JS</span>
        </div>
        <div className="user-info">
          <span className="user-greeting">Welcome back,</span>
          <span className="user-name">Dr. John Smith</span>
        </div>
      </div>

      {/* Header Actions - stays on the right */}
      <div className="header-actions">
        <button className="icon-button">
          <Bell size={20} />
        </button>
        <button className="sign-out-button">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  )
}
