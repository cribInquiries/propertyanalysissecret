"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePropertyAnalysis, type PropertyAnalysis } from "@/lib/hooks/use-property-analysis"
import { useUserSettings } from "@/lib/hooks/use-user-settings"
import { PropertyAnalysisForm } from "@/components/property-analysis-form"
import {
  Plus,
  Search,
  Heart,
  TrendingUp,
  DollarSign,
  Home,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Star,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DashboardContent() {
  const { analyses, loading, deleteAnalysis, toggleFavorite, getFavoriteAnalyses, getAnalysesByStatus } =
    usePropertyAnalysis()
  const { settings } = useUserSettings()
  const [selectedAnalysis, setSelectedAnalysis] = useState<PropertyAnalysis | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created_at")

  // Filter and sort analyses
  const filteredAnalyses = analyses
    .filter((analysis) => {
      const matchesSearch = analysis.address.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || analysis.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "updated_at":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "address":
          return a.address.localeCompare(b.address)
        case "purchase_price":
          return b.purchase_price - a.purchase_price
        default:
          return 0
      }
    })

  // Calculate dashboard metrics
  const totalAnalyses = analyses.length
  const favoriteAnalyses = getFavoriteAnalyses().length
  const completedAnalyses = getAnalysesByStatus("completed").length
  const totalInvestment = analyses.reduce((sum, analysis) => sum + analysis.purchase_price, 0)

  const handleEdit = (analysis: PropertyAnalysis) => {
    setSelectedAnalysis(analysis)
    setShowForm(true)
  }

  const handleDelete = async (analysis: PropertyAnalysis) => {
    if (confirm(`Are you sure you want to delete the analysis for ${analysis.address}?`)) {
      await deleteAnalysis(analysis.id)
    }
  }

  const handleToggleFavorite = async (analysis: PropertyAnalysis) => {
    await toggleFavorite(analysis.id)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currency || "USD",
    }).format(amount)
  }

  const calculateCashFlow = (analysis: PropertyAnalysis) => {
    const { monthly_rent, monthly_expenses, loan_amount, interest_rate, loan_term, vacancy_rate } =
      analysis.analysis_data

    const monthlyInterestRate = (interest_rate || 0) / 100 / 12
    const numberOfPayments = (loan_term || 30) * 12

    const monthlyMortgage =
      loan_amount > 0
        ? (loan_amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : 0

    const effectiveMonthlyRent = (monthly_rent || 0) * (1 - (vacancy_rate || 5) / 100)
    return effectiveMonthlyRent - (monthly_expenses || 0) - monthlyMortgage
  }

  if (showForm) {
    return (
      <div className="container mx-auto py-8 px-4">
        <PropertyAnalysisForm
          analysis={selectedAnalysis || undefined}
          onSave={(analysis) => {
            setShowForm(false)
            setSelectedAnalysis(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setSelectedAnalysis(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Property Analysis Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage and track your property investment analyses</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
                <p className="text-2xl font-bold">{totalAnalyses}</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">{favoriteAnalyses}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedAnalyses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="address">Address</SelectItem>
                <SelectItem value="purchase_price">Purchase Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analysis List */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No analyses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first property analysis"}
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnalyses.map((analysis) => {
                const cashFlow = calculateCashFlow(analysis)
                return (
                  <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{analysis.address}</CardTitle>
                          <CardDescription className="mt-1">{formatCurrency(analysis.purchase_price)}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(analysis)}
                            className={analysis.is_favorite ? "text-red-500" : ""}
                          >
                            <Heart className={`h-4 w-4 ${analysis.is_favorite ? "fill-current" : ""}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(analysis)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(analysis)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Cash Flow</span>
                          <span className={`font-semibold ${cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(cashFlow)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={analysis.status === "completed" ? "default" : "secondary"}>
                            {analysis.status}
                          </Badge>
                          {analysis.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          {analysis.tags.length > 2 && <Badge variant="outline">+{analysis.tags.length - 2}</Badge>}
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </div>
                          {analysis.is_favorite && <Star className="h-3 w-3 fill-current text-yellow-500" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-12 w-12 bg-muted rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                      <div className="h-8 w-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAnalyses.length === 0 ? (
                <div className="p-12 text-center">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No analyses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by creating your first property analysis"}
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Analysis
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAnalyses.map((analysis) => {
                    const cashFlow = calculateCashFlow(analysis)
                    return (
                      <div key={analysis.id} className="p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Home className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{analysis.address}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(analysis.purchase_price)}
                                </span>
                                <Badge variant={analysis.status === "completed" ? "default" : "secondary"}>
                                  {analysis.status}
                                </Badge>
                                {analysis.is_favorite && <Heart className="h-3 w-3 fill-current text-red-500" />}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Monthly Cash Flow</div>
                              <div className={`font-semibold ${cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(cashFlow)}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(analysis)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(analysis)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
