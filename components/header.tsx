"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/actions"

interface HeaderProps {
  userEmail?: string
  userName?: string
}

export default function Header({ userEmail, userName }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">BMI Tracker</h1>
          </div>

          <div className="flex items-center space-x-4">
            {userName && <span className="text-sm text-gray-600 hidden sm:block">Welcome back, {userName}</span>}
            {!userName && userEmail && <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>}
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
