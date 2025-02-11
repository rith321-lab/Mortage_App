import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Home, FileText, Settings, BarChart2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const Navigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/documents", label: "Documents", icon: Upload },
    { path: "/status", label: "Status", icon: BarChart2 },
    { path: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="flex flex-col h-full bg-background border-r">
      <div className="p-4">
        <h1 className="text-xl font-bold">Mortgage App</h1>
      </div>
      <Separator />
      <div className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => navigate(item.path)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation 