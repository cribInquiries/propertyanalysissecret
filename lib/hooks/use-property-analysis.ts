"use client"

import { useState, useEffect } from "react"
import { generateId, getCurrentUser, readJson, writeJson } from "@/lib/local-db"
import { toast } from "@/hooks/use-toast"

export interface PropertyAnalysis {
  id: string
  user_id: string
  address: string
  purchase_price: number
  analysis_data: Record<string, any>
  notes?: string
  is_favorite: boolean
  tags: string[]
  status: "draft" | "completed" | "archived"
  created_at: string
  updated_at: string
}

export interface CreatePropertyAnalysisData {
  address: string
  purchase_price: number
  analysis_data?: Record<string, any>
  notes?: string
  tags?: string[]
  status?: "draft" | "completed"
}

export function usePropertyAnalysis() {
  const [analyses, setAnalyses] = useState<PropertyAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const STORAGE_KEY_PREFIX = "property_analyses_"

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadAnalyses = async () => {
    if (!mounted) return

    try {
      setLoading(true)
      const user = getCurrentUser()
      if (!user) {
        setError("User not authenticated")
        return
      }

      const stored = readJson<PropertyAnalysis[]>(`${STORAGE_KEY_PREFIX}${user.id}`, [])
      setAnalyses(stored)
    } catch (err) {
      console.error("Error loading analyses:", err)
      setError(err instanceof Error ? err.message : "Failed to load analyses")
    } finally {
      setLoading(false)
    }
  }

  const createAnalysis = async (data: CreatePropertyAnalysisData): Promise<PropertyAnalysis | null> => {
    const user = getCurrentUser()
    if (!user) return null

    try {
      const newAnalysis: PropertyAnalysis = {
        id: generateId(),
        user_id: user.id,
        address: data.address,
        purchase_price: data.purchase_price,
        analysis_data: data.analysis_data || {},
        notes: data.notes,
        is_favorite: false,
        tags: data.tags || [],
        status: data.status || "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setAnalyses((prev) => {
        const next = [newAnalysis, ...prev]
        writeJson(`${STORAGE_KEY_PREFIX}${user.id}`, next)
        return next
      })

      toast({
        title: "Analysis created",
        description: "Property analysis saved successfully",
      })

      return newAnalysis
    } catch (err) {
      console.error("Error creating analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create analysis"
      setError(errorMessage)
      toast({
        title: "Creation failed",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }

  const updateAnalysis = async (id: string, updates: Partial<PropertyAnalysis>): Promise<PropertyAnalysis | null> => {
    const user = getCurrentUser()
    if (!user) return null

    try {
      let updated: PropertyAnalysis | null = null
      setAnalyses((prev) => {
        const next = prev.map((analysis) => {
          if (analysis.id !== id) return analysis
          updated = { ...analysis, ...updates, updated_at: new Date().toISOString() }
          return updated
        })
        writeJson(`${STORAGE_KEY_PREFIX}${user.id}`, next)
        return next
      })

      toast({
        title: "Analysis updated",
        description: "Changes saved successfully",
      })

      return updated
    } catch (err) {
      console.error("Error updating analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update analysis"
      setError(errorMessage)
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }

  const deleteAnalysis = async (id: string): Promise<boolean> => {
    const user = getCurrentUser()
    if (!user) return false

    try {
      setAnalyses((prev) => {
        const next = prev.filter((analysis) => analysis.id !== id)
        writeJson(`${STORAGE_KEY_PREFIX}${user.id}`, next)
        return next
      })

      toast({
        title: "Analysis deleted",
        description: "Property analysis removed successfully",
      })

      return true
    } catch (err) {
      console.error("Error deleting analysis:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete analysis"
      setError(errorMessage)
      toast({
        title: "Deletion failed",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }

  const toggleFavorite = async (id: string): Promise<boolean> => {
    const user = getCurrentUser()
    if (!user) return false

    try {
      const analysis = analyses.find((a) => a.id === id)
      if (!analysis) return false
      setAnalyses((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, is_favorite: !a.is_favorite } : a))
        writeJson(`${STORAGE_KEY_PREFIX}${user.id}`, next)
        return next
      })

      return true
    } catch (err) {
      console.error("Error toggling favorite:", err)
      return false
    }
  }

  const autoSaveAnalysis = async (id: string, analysisData: Record<string, any>) => {
    const user = getCurrentUser()
    if (!user) return

    try {
      setAnalyses((prev) => {
        const next = prev.map((analysis) =>
          analysis.id === id
            ? { ...analysis, analysis_data: analysisData, updated_at: new Date().toISOString() }
            : analysis,
        )
        writeJson(`${STORAGE_KEY_PREFIX}${user.id}`, next)
        return next
      })
    } catch (err) {
      console.error("Auto-save failed:", err)
    }
  }

  const logActivity = async () => {
    // no-op in local mode
  }

  const getAnalysisById = (id: string): PropertyAnalysis | undefined => {
    return analyses.find((analysis) => analysis.id === id)
  }

  const getFavoriteAnalyses = (): PropertyAnalysis[] => {
    return analyses.filter((analysis) => analysis.is_favorite)
  }

  const getAnalysesByStatus = (status: PropertyAnalysis["status"]): PropertyAnalysis[] => {
    return analyses.filter((analysis) => analysis.status === status)
  }

  const getAnalysesByTag = (tag: string): PropertyAnalysis[] => {
    return analyses.filter((analysis) => analysis.tags.includes(tag))
  }

  useEffect(() => {
    if (mounted) {
      loadAnalyses()
    }
  }, [mounted])

  return {
    analyses,
    loading,
    error,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    toggleFavorite,
    autoSaveAnalysis,
    refreshAnalyses: loadAnalyses,
    getAnalysisById,
    getFavoriteAnalyses,
    getAnalysesByStatus,
    getAnalysesByTag,
  }
}
