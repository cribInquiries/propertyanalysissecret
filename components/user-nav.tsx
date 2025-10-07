"use client"

import { supabaseAuth } from "@/lib/auth/supabase-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DataMigrationDialog } from "@/components/data-migration-dialog"

interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
}

interface UserNavProps {
  user: User
}

export function UserNav({ user: initialUser }: UserNavProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [currentUser, setCurrentUser] = useState(initialUser)

  useEffect(() => {
    // Load the actual user when component mounts
    const loadUser = async () => {
      try {
        const user = await supabaseAuth.getCurrentUser()
        if (user) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error("Error loading user:", error)
      }
    }
    
    loadUser()
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabaseAuth.signOut()
      setCurrentUser({ id: "anon", email: "guest@example.com", display_name: "Guest" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      // Still redirect even if there's an error to ensure user is logged out
      router.push("/auth/login")
    } finally {
      setIsSigningOut(false)
    }
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏢</span>
            <span className="font-bold text-slate-900">LuxeAnalytics</span>
          </div>

          <div className="flex items-center gap-2">
            <DataMigrationDialog />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-100 text-slate-700">
                    {getInitials(currentUser.email || "")}
                  </AvatarFallback>
                </Avatar>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <span className="mr-2">👤</span>
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <span className="mr-2">🚪</span>
                <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
