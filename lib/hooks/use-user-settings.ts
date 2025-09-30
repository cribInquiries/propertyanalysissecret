"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, readJson, writeJson } from "@/lib/local-db"
import { toast } from "@/hooks/use-toast"

export interface UserSettings {
  id: string
  theme: "light" | "dark" | "system"
  currency: string
  language: string
  notifications_enabled: boolean
  email_notifications: boolean
  analysis_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

const defaultSettings: Partial<UserSettings> = {
  theme: "light",
  currency: "USD",
  language: "en",
  notifications_enabled: true,
  email_notifications: true,
  analysis_preferences: {},
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const STORAGE_KEY_PREFIX = "user_settings_"

  // Load user settings
  const loadSettings = async () => {
    if (!mounted) return

    try {
      setLoading(true)
      const user = getCurrentUser()

      if (!user) {
        setError("User not authenticated")
        return
      }

      const stored = readJson<UserSettings | null>(`${STORAGE_KEY_PREFIX}${user.id}`, null)
      if (!stored) {
        await createDefaultSettings(user.id)
      } else {
        setSettings(stored)
      }
    } catch (err) {
      console.error("Error loading settings:", err)
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  // Create default settings for new user
  const createDefaultSettings = async (userId: string) => {

    try {
      const newSettings: UserSettings = {
        id: userId,
        theme: (defaultSettings.theme as any) || "light",
        currency: (defaultSettings.currency as any) || "USD",
        language: (defaultSettings.language as any) || "en",
        notifications_enabled: (defaultSettings.notifications_enabled as any) ?? true,
        email_notifications: (defaultSettings.email_notifications as any) ?? true,
        analysis_preferences: (defaultSettings.analysis_preferences as any) || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      writeJson(`${STORAGE_KEY_PREFIX}${userId}`, newSettings)
      setSettings(newSettings)
    } catch (err) {
      console.error("Error creating default settings:", err)
      setError(err instanceof Error ? err.message : "Failed to create settings")
    }
  }

  // Update settings
  const updateSettings = async (updates: Partial<UserSettings>) => {
    const user = getCurrentUser()
    if (!user) return

    try {
      if (!settings) return
      const merged: UserSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      }
      writeJson(`${STORAGE_KEY_PREFIX}${user.id}`, merged)
      setSettings(merged)
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully",
      })
      return merged
    } catch (err) {
      console.error("Error updating settings:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update settings"
      setError(errorMessage)
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  // Update analysis preferences
  const updateAnalysisPreferences = async (preferences: Record<string, any>) => {
    return updateSettings({
      analysis_preferences: {
        ...settings?.analysis_preferences,
        ...preferences,
      },
    })
  }

  useEffect(() => {
    if (mounted) {
      loadSettings()
    }
  }, [mounted])

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateAnalysisPreferences,
    refreshSettings: loadSettings,
  }
}
