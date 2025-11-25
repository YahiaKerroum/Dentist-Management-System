"use client"

import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ReportsPage from "@/components/reports-page"

export default function Reports() {
  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <Header />

        <ReportsPage />
      </div>
    </div>
  )
}
