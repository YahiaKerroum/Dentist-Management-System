"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LayoutDashboard, Calendar, Users, Stethoscope, BarChart3, FileText, Bell, Settings } from "lucide-react"

// Navigation items for the sidebar
const mainNavItems = [
  { icon: User, label: "Profile", href: "/profile", badge: null },
  { icon: LayoutDashboard, label: "Dashboard", href: "/", badge: null },
  { icon: Calendar, label: "Appointments", href: "/appointments", badge: 12 },
  { icon: Users, label: "Patients", href: "/patients", badge: null },
  { icon: Stethoscope, label: "Treatments", href: "/treatments", badge: null },
  { icon: BarChart3, label: "Reports", href: "/reports", badge: null },
  { icon: FileText, label: "Documents", href: "/documents", badge: null },
]

const bottomNavItems = [
  { icon: Bell, label: "Notifications", href: "/notifications", badge: 3 },
  { icon: Settings, label: "Settings", href: "/settings", badge: null },
]

// Reusable component for navigation items
function NavItem({ icon: Icon, label, badge, href, active }) {
  return (
    <Link href={href}>
      <span className={`nav-item ${active ? "nav-item-active" : ""}`}>
        <Icon size={20} />
        <span>{label}</span>
        {badge && <span className="nav-badge">{badge}</span>}
      </span>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <Link href="/">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-title">DentalCare</span>
            <span className="logo-subtitle">Management System</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {mainNavItems.map((item) => (
          <NavItem 
            key={item.label} 
            icon={item.icon} 
            label={item.label} 
            badge={item.badge} 
            href={item.href}
            active={pathname === item.href || (item.href === "/" && pathname === "/")}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <nav className="sidebar-nav sidebar-bottom">
        {bottomNavItems.map((item) => (
          <NavItem 
            key={item.label} 
            icon={item.icon} 
            label={item.label} 
            badge={item.badge}
            href={item.href}
            active={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  )
}
