"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  usePropertyAnalysis,
  type CreatePropertyAnalysisData,
  type PropertyAnalysis,
} from "@/lib/hooks/use-property-analysis"
import { useUserSettings } from "@/lib/hooks/use-user-settings"
import { ImageUpload } from "@/components/image-upload"
import { Heart, Save, Trash2, Plus, X } from "lucide-react"

interface PropertyAnalysisFormProps {
  analysis?: PropertyAnalysis
  onSave?: (analysis: PropertyAnalysis) => void
  onCancel?: () => void
}

export function PropertyAnalysisForm({ analysis, onSave, onCancel }: PropertyAnalysisFormProps) {
  const { createAnalysis, updateAnalysis, deleteAnalysis, toggleFavorite, autoSaveAnalysis } = usePropertyAnalysis()
  const { settings } = useUserSettings()
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    address: analysis?.address || "",
    purchase_price: analysis?.purchase_price || 0,
    notes: analysis?.notes || "",
    tags: analysis?.tags || [],
    status: analysis?.status || ("draft" as const),
    analysis_data: analysis?.analysis_data || {
      monthly_rent: 0,
      monthly_expenses: 0,
      down_payment: 0,
      loan_amount: 0,
      interest_rate: 0,
      loan_term: 30,
      property_tax: 0,
      insurance: 0,
      maintenance: 0,
      vacancy_rate: 5,
      appreciation_rate: 3,
    },
  })

  // Auto-save functionality
  useEffect(() => {
    if (analysis && settings?.analysis_preferences?.auto_save) {
      const timeoutId = setTimeout(() => {
        autoSaveAnalysis(analysis.id, formData.analysis_data)
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [formData.analysis_data, analysis, settings, autoSaveAnalysis])

  // Calculate metrics
  const calculateMetrics = () => {
    const { monthly_rent, monthly_expenses, down_payment, loan_amount, interest_rate, loan_term, vacancy_rate } =
      formData.analysis_data

    const monthlyInterestRate = interest_rate / 100 / 12
    const numberOfPayments = loan_term * 12

    // Monthly mortgage payment
    const monthlyMortgage =
      loan_amount > 0
        ? (loan_amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : 0

    // Effective monthly rent (accounting for vacancy)
    const effectiveMonthlyRent = monthly_rent * (1 - vacancy_rate / 100)

    // Monthly cash flow
    const monthlyCashFlow = effectiveMonthlyRent - monthly_expenses - monthlyMortgage

    // Annual cash flow
    const annualCashFlow = monthlyCashFlow * 12

    // Cash-on-cash return
    const cashOnCashReturn = down_payment > 0 ? (annualCashFlow / down_payment) * 100 : 0

    // Cap rate
    const capRate =
      formData.purchase_price > 0
        ? ((effectiveMonthlyRent * 12 - monthly_expenses * 12) / formData.purchase_price) * 100
        : 0

    return {
      monthlyMortgage,
      effectiveMonthlyRent,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashReturn,
      capRate,
    }
  }

  const metrics = calculateMetrics()

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("analysis_data.")) {
      const dataField = field.replace("analysis_data.", "")
      setFormData((prev) => ({
        ...prev,
        analysis_data: {
          ...prev.analysis_data,
          [dataField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let savedAnalysis: PropertyAnalysis | null = null

      if (analysis) {
        // Update existing analysis
        savedAnalysis = await updateAnalysis(analysis.id, formData)
      } else {
        // Create new analysis
        savedAnalysis = await createAnalysis(formData as CreatePropertyAnalysisData)
      }

      if (savedAnalysis) {
        onSave?.(savedAnalysis)
      }
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!analysis) return

    if (confirm("Are you sure you want to delete this analysis?")) {
      setLoading(true)
      try {
        const success = await deleteAnalysis(analysis.id)
        if (success) {
          onCancel?.()
        }
      } catch (error) {
        console.error("Delete failed:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleToggleFavorite = async () => {
    if (!analysis) return
    await toggleFavorite(analysis.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{analysis ? "Edit Analysis" : "New Property Analysis"}</h2>
          <p className="text-muted-foreground">
            {analysis ? "Update your property analysis" : "Create a comprehensive property investment analysis"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {analysis && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              className={analysis.is_favorite ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${analysis.is_favorite ? "fill-current" : ""}`} />
            </Button>
          )}
          {analysis && (
            <Button variant="outline" size="icon" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Basic details about the property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange("purchase_price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis</CardTitle>
          <CardDescription>Enter the financial details for analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_rent">Monthly Rent</Label>
              <Input
                id="monthly_rent"
                type="number"
                value={formData.analysis_data.monthly_rent}
                onChange={(e) =>
                  handleInputChange("analysis_data.monthly_rent", Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_expenses">Monthly Expenses</Label>
              <Input
                id="monthly_expenses"
                type="number"
                value={formData.analysis_data.monthly_expenses}
                onChange={(e) =>
                  handleInputChange("analysis_data.monthly_expenses", Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="down_payment">Down Payment</Label>
              <Input
                id="down_payment"
                type="number"
                value={formData.analysis_data.down_payment}
                onChange={(e) =>
                  handleInputChange("analysis_data.down_payment", Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan_amount">Loan Amount</Label>
              <Input
                id="loan_amount"
                type="number"
                value={formData.analysis_data.loan_amount}
                onChange={(e) => handleInputChange("analysis_data.loan_amount", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                value={formData.analysis_data.interest_rate}
                onChange={(e) =>
                  handleInputChange("analysis_data.interest_rate", Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan_term">Loan Term (years)</Label>
              <Input
                id="loan_term"
                type="number"
                value={formData.analysis_data.loan_term}
                onChange={(e) => handleInputChange("analysis_data.loan_term", Number.parseInt(e.target.value) || 30)}
              />
            </div>
          </div>

          <Separator />

          {/* Calculated Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Monthly Cash Flow</div>
                <div
                  className={`text-2xl font-bold ${metrics.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${metrics.monthlyCashFlow.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Cash-on-Cash Return</div>
                <div
                  className={`text-2xl font-bold ${metrics.cashOnCashReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {metrics.cashOnCashReturn.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Cap Rate</div>
                <div className="text-2xl font-bold text-blue-600">{metrics.capRate.toFixed(2)}%</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Property Images</CardTitle>
          <CardDescription>Upload images of the property</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload propertyAnalysisId={analysis?.id} />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Additional notes and observations</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Add any additional notes about this property..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {settings?.analysis_preferences?.auto_save && analysis && <span>Auto-save enabled</span>}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Analysis"}
          </Button>
        </div>
      </div>
    </div>
  )
}
