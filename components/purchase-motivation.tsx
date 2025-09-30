"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Target, TrendingUp, MapPin, Clock, Edit3, Save, Plus, X, DollarSign } from "lucide-react"

interface FinancialData {
  purchasePrice: number
  totalDeposit: number
  loanAmount: number
  interestRate: number
  loanTerm: number
}

interface MotivationData {
  clientGoals: string[]
  investmentHorizon: string
  expectedReturn: string
  location: string
  financials: FinancialData
}

const defaultData: MotivationData = {
  clientGoals: [
    "Generate consistent passive income through short-term rentals",
    "Build long-term wealth through property appreciation",
    "Diversify investment portfolio with real estate",
    "Create a premium hospitality experience for guests",
  ],
  investmentHorizon: "7-10 years",
  expectedReturn: "12-15% annually",
  location: "Adelaide Hills, SA",
  financials: {
    purchasePrice: 850000,
    totalDeposit: 170000,
    loanAmount: 680000,
    interestRate: 6.5,
    loanTerm: 30,
  },
}

export function PurchaseMotivation() {
  const [data, setData] = useState<MotivationData>(defaultData)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<MotivationData>(defaultData)
  const [newGoal, setNewGoal] = useState("")

  const calculatedLoanAmount = editData.financials.purchasePrice - editData.financials.totalDeposit
  if (calculatedLoanAmount !== editData.financials.loanAmount && calculatedLoanAmount >= 0) {
    setEditData((prev) => ({
      ...prev,
      financials: {
        ...prev.financials,
        loanAmount: calculatedLoanAmount,
      },
    }))
  }

  const monthlyPayment =
    (editData.financials.loanAmount *
      (editData.financials.interestRate / 100 / 12) *
      Math.pow(1 + editData.financials.interestRate / 100 / 12, editData.financials.loanTerm * 12)) /
    (Math.pow(1 + editData.financials.interestRate / 100 / 12, editData.financials.loanTerm * 12) - 1)
  const loanToValue = (editData.financials.loanAmount / editData.financials.purchasePrice) * 100

  const getRevenueData = () => 85000 // default revenue
  const getMaintenanceData = () => 18500 // default maintenance

  // Calculate automatic investment horizon based on loan term and break-even analysis
  const calculateInvestmentHorizon = () => {
    const annualRevenue = getRevenueData()
    const annualMaintenance = getMaintenanceData()
    const annualLoanPayments = monthlyPayment * 12
    const netCashFlow = annualRevenue - annualMaintenance - annualLoanPayments

    // If positive cash flow, suggest loan term as minimum horizon
    if (netCashFlow > 0) {
      if (editData.financials.loanTerm <= 10)
        return `${editData.financials.loanTerm}-${editData.financials.loanTerm + 5} years`
      else if (editData.financials.loanTerm <= 20)
        return `${editData.financials.loanTerm}-${editData.financials.loanTerm + 10} years`
      else return `${editData.financials.loanTerm}+ years`
    } else {
      // If negative cash flow, suggest longer horizon for appreciation
      return `${Math.max(editData.financials.loanTerm, 15)}-${Math.max(editData.financials.loanTerm + 10, 25)} years`
    }
  }

  // Calculate expected return based on revenue, costs, and property appreciation
  const calculateExpectedReturn = () => {
    const annualRevenue = getRevenueData()
    const annualMaintenance = getMaintenanceData()
    const annualLoanPayments = monthlyPayment * 12
    const netOperatingIncome = annualRevenue - annualMaintenance
    const netCashFlow = netOperatingIncome - annualLoanPayments

    // Calculate cash-on-cash return
    const cashOnCashReturn = (netCashFlow / editData.financials.totalDeposit) * 100

    // Estimate total return including appreciation (assume 3-5% annual appreciation)
    const appreciationReturn = 4 // Conservative 4% annual appreciation
    const totalReturn = Math.max(cashOnCashReturn + appreciationReturn, 0)

    if (totalReturn < 8) return `6-10% annually`
    else if (totalReturn < 12) return `8-12% annually`
    else if (totalReturn < 16) return `12-16% annually`
    else return `15%+ annually`
  }

  // Auto-calculate values
  const autoInvestmentHorizon = calculateInvestmentHorizon()
  const autoExpectedReturn = calculateExpectedReturn()

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Your Investment Motivation</h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setData(editData)
                    setIsEditing(false)
                  }}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditData(data)
                    setNewGoal("")
                    setIsEditing(false)
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Understanding your goals helps us tailor our analysis to deliver the insights that matter most to your
            investment strategy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-accent" />
              Financial Overview
            </h3>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Purchase Price</label>
                  <Input
                    type="number"
                    value={editData.financials.purchasePrice || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        financials: { ...editData.financials, purchasePrice: Number(e.target.value) || 0 },
                      })
                    }
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Total Deposit</label>
                  <Input
                    type="number"
                    value={editData.financials.totalDeposit || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        financials: { ...editData.financials, totalDeposit: Number(e.target.value) || 0 },
                      })
                    }
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Loan Amount (Auto-calculated)
                  </label>
                  <Input
                    type="number"
                    value={editData.financials.loanAmount || 0}
                    readOnly
                    className="text-lg bg-muted/50 cursor-not-allowed"
                    title="Automatically calculated as Purchase Price - Total Deposit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Interest Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editData.financials.interestRate || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        financials: { ...editData.financials, interestRate: Number(e.target.value) || 0 },
                      })
                    }
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Loan Term (years)</label>
                  <Input
                    type="number"
                    value={editData.financials.loanTerm || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        financials: { ...editData.financials, loanTerm: Number(e.target.value) || 0 },
                      })
                    }
                    className="text-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Purchase Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${data.financials.purchasePrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Deposit</p>
                  <p className="text-2xl font-bold text-foreground">${data.financials.totalDeposit.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                  <p className="text-2xl font-bold text-foreground">${data.financials.loanAmount.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-foreground">{data.financials.interestRate}%</p>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Loan Payment</p>
                  <p className="text-xl font-bold text-accent">
                    ${monthlyPayment.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Loan to Value Ratio</p>
                  <p className="text-xl font-bold text-accent">{loanToValue.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Investment Goals */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Investment Goals</h3>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {editData.clientGoals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Textarea
                        value={goal || ""}
                        onChange={(e) => {
                          const updatedGoals = [...editData.clientGoals]
                          updatedGoals[index] = e.target.value
                          setEditData({
                            ...editData,
                            clientGoals: updatedGoals,
                          })
                        }}
                        className="flex-1 min-h-[60px]"
                      />
                      <Button
                        onClick={() => {
                          setEditData({
                            ...editData,
                            clientGoals: editData.clientGoals.filter((_, i) => i !== index),
                          })
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <Input
                      placeholder="Add new goal..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          if (newGoal.trim()) {
                            setEditData({
                              ...editData,
                              clientGoals: [...editData.clientGoals, newGoal.trim()],
                            })
                            setNewGoal("")
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (newGoal.trim()) {
                          setEditData({
                            ...editData,
                            clientGoals: [...editData.clientGoals, newGoal.trim()],
                          })
                          setNewGoal("")
                        }
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {data.clientGoals.map((goal, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{goal}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Card>
          </motion.div>

          {/* Investment Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-accent" />
                <h4 className="text-lg font-semibold text-foreground">Investment Horizon</h4>
              </div>
              <p className="text-2xl font-bold text-accent">{autoInvestmentHorizon}</p>
              <p className="text-sm text-muted-foreground mt-2">Based on loan term and cash flow analysis</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h4 className="text-lg font-semibold text-foreground">Expected Return</h4>
              </div>
              <p className="text-2xl font-bold text-accent">{autoExpectedReturn}</p>
              <p className="text-sm text-muted-foreground mt-2">Including cash flow and property appreciation</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-accent" />
                <h4 className="text-lg font-semibold text-foreground">Target Location</h4>
              </div>
              {isEditing ? (
                <Input
                  value={editData.location || ""}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="text-xl font-bold"
                />
              ) : (
                <p className="text-2xl font-bold text-accent">{data.location}</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <h4 className="text-xl font-semibold text-foreground mb-4">Key Insight</h4>
            <p className="text-muted-foreground text-lg text-balance">
              Based on your investment goals and financial structure, this property is projected to generate{" "}
              {autoExpectedReturn} returns over a {autoInvestmentHorizon} investment horizon. With a{" "}
              {loanToValue.toFixed(0)}% LVR and monthly payments of $
              {monthlyPayment.toLocaleString("en-AU", { maximumFractionDigits: 0 })}, the property shows{" "}
              {getRevenueData() - getMaintenanceData() - monthlyPayment * 12 > 0 ? "positive" : "break-even"} cash flow
              potential in the {data.location} market.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
