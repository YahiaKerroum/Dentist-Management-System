import { ChevronRight } from "lucide-react"

// Breadcrumb component for navigation hierarchy
export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, index) => (
        <span key={item} className="breadcrumb-item">
          {index > 0 && <ChevronRight size={16} className="breadcrumb-separator" />}
          <span className={index === items.length - 1 ? "breadcrumb-current" : "breadcrumb-link"}>{item}</span>
        </span>
      ))}
    </nav>
  )
}
