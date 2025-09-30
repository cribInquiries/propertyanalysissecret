"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, Calendar, TrendingUp, Home, Edit3, Save, X } from "lucide-react"
import { useState } from "react"

export function RevenueProjections() {
  const [isEditing, setIsEditing] = useState(false)
  const [editableData, setEditableData] = useState({
    baseADR: 280,
    seasonalMultipliers: {
      Dec: 1.4,
      Jan: 1.5,
      Feb: 1.3,
      Mar: 1.1,
      Apr: 1.0,
      May: 0.9,
      Jun: 0.7,
      Jul: 0.6,
      Aug: 0.7,
      Sep: 0.9,
      Oct: 1.0,
      Nov: 1.2,
    },
    occupancyRates: {
      Dec: 88,
      Jan: 92,
      Feb: 85,
      Mar: 78,
      Apr: 75,
      May: 70,
      Jun: 60,
      Jul: 55,
      Aug: 62,
      Sep: 72,
      Oct: 80,
      Nov: 85,
    },
    comparableProperties: [
      { name: "Adelaide Hills Retreat", adr: 295, occupancy: 82, revenue: 89000 },
      { name: "Barossa Valley Villa", adr: 265, occupancy: 78, revenue: 76000 },
      { name: "City Terrace", adr: 215, occupancy: 85, revenue: 68000 },
      { name: "Coastal Escape", adr: 340, occupancy: 88, revenue: 98000 },
    ],
  })
  const [originalData, setOriginalData] = useState(editableData)

  const monthlyData = [
    {
      month: "Jan",
      fullMonth: "January",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Jan * (editableData.occupancyRates.Jan / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.Jan,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Jan),
      days: 31,
    },
    {
      month: "Feb",
      fullMonth: "February",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Feb * (editableData.occupancyRates.Feb / 100) * 28,
      ),
      occupancy: editableData.occupancyRates.Feb,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Feb),
      days: 28,
    },
    {
      month: "Mar",
      fullMonth: "March",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Mar * (editableData.occupancyRates.Mar / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.Mar,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Mar),
      days: 31,
    },
    {
      month: "Apr",
      fullMonth: "April",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Apr * (editableData.occupancyRates.Apr / 100) * 30,
      ),
      occupancy: editableData.occupancyRates.Apr,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Apr),
      days: 30,
    },
    {
      month: "May",
      fullMonth: "May",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.May * (editableData.occupancyRates.May / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.May,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.May),
      days: 31,
    },
    {
      month: "Jun",
      fullMonth: "June",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Jun * (editableData.occupancyRates.Jun / 100) * 30,
      ),
      occupancy: editableData.occupancyRates.Jun,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Jun),
      days: 30,
    },
    {
      month: "Jul",
      fullMonth: "July",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Jul * (editableData.occupancyRates.Jul / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.Jul,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Jul),
      days: 31,
    },
    {
      month: "Aug",
      fullMonth: "August",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Aug * (editableData.occupancyRates.Aug / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.Aug,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Aug),
      days: 31,
    },
    {
      month: "Sep",
      fullMonth: "September",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Sep * (editableData.occupancyRates.Sep / 100) * 30,
      ),
      occupancy: editableData.occupancyRates.Sep,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Sep),
      days: 30,
    },
    {
      month: "Oct",
      fullMonth: "October",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Oct * (editableData.occupancyRates.Oct / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.Oct,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Oct),
      days: 31,
    },
    {
      month: "Nov",
      fullMonth: "November",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Nov * (editableData.occupancyRates.Nov / 100) * 30,
      ),
      occupancy: editableData.occupancyRates.Nov,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Nov),
      days: 30,
    },
    {
      month: "Dec",
      fullMonth: "December",
      revenue: Math.round(
        editableData.baseADR * editableData.seasonalMultipliers.Dec * (editableData.occupancyRates.Dec / 100) * 31,
      ),
      occupancy: editableData.occupancyRates.Dec,
      adr: Math.round(editableData.baseADR * editableData.seasonalMultipliers.Dec),
      days: 31,
    },
  ]

  const totalAnnualRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0)
  const averageOccupancy = Math.round(monthlyData.reduce((sum, month) => sum + month.occupancy, 0) / monthlyData.length)

  const totalOccupiedNights = monthlyData.reduce((sum, month) => sum + (month.days * month.occupancy) / 100, 0)
  const weightedADRSum = monthlyData.reduce((sum, month) => sum + (month.adr * month.days * month.occupancy) / 100, 0)
  const averageADR = Math.round(weightedADRSum / totalOccupiedNights)

  const handleSave = () => {
    setIsEditing(false)
    setOriginalData(editableData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditableData(originalData)
  }

  const updateSeasonalMultiplier = (month: string, value: number) => {
    setEditableData((prev) => ({
      ...prev,
      seasonalMultipliers: { ...prev.seasonalMultipliers, [month]: value },
    }))
  }

  const updateOccupancyRate = (month: string, value: number) => {
    setEditableData((prev) => ({
      ...prev,
      occupancyRates: { ...prev.occupancyRates, [month]: value },
    }))
  }

  const updateComparableProperty = (index: number, field: string, value: number | string) => {
    setEditableData((prev) => ({
      ...prev,
      comparableProperties: prev.comparableProperties.map((prop, i) =>
        i === index ? { ...prop, [field]: value } : prop,
      ),
    }))
  }

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Revenue Projections</h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Based on comprehensive market analysis, comparable properties, and Adelaide's seasonal trends, here's what
            your property could generate annually.
          </p>
        </motion.div>

        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Base Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Base ADR ($)</label>
                  <Input
                    type="number"
                    value={editableData.baseADR}
                    onChange={(e) => setEditableData((prev) => ({ ...prev, baseADR: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Annual Revenue</h3>
              <p className="text-3xl font-bold text-foreground">${totalAnnualRevenue.toLocaleString()}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg Occupancy</h3>
              <p className="text-3xl font-bold text-foreground">{averageOccupancy}%</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Average ADR</h3>
              <p className="text-3xl font-bold text-foreground">${averageADR}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Home className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Property Class</h3>
              <p className="text-3xl font-bold text-foreground">Luxury</p>
            </Card>
          </motion.div>
        </div>

        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Settings</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-4">Seasonal Multipliers</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(editableData.seasonalMultipliers).map(([month, multiplier]) => (
                      <div key={month}>
                        <label className="text-xs text-muted-foreground mb-1 block">{month}</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={multiplier}
                          onChange={(e) => updateSeasonalMultiplier(month, Number(e.target.value))}
                          className="w-full text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Occupancy Rates (%)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(editableData.occupancyRates).map(([month, rate]) => (
                      <div key={month}>
                        <label className="text-xs text-muted-foreground mb-1 block">{month}</label>
                        <Input
                          type="number"
                          value={rate}
                          onChange={(e) => updateOccupancyRate(month, Number(e.target.value))}
                          className="w-full text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Monthly Revenue & Performance</h3>
            <p className="text-muted-foreground mb-6">Hover over data points to see detailed breakdown</p>

            <div className="relative h-96 w-full">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {monthlyData.map((month, index) => (
                  <text
                    key={month.month}
                    x={70 + index * 55}
                    y="390"
                    className="text-sm fill-current text-muted-foreground"
                    textAnchor="middle"
                  >
                    {month.month}
                  </text>
                ))}

                {(() => {
                  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))
                  const minRevenue = Math.min(...monthlyData.map((m) => m.revenue))
                  const range = maxRevenue - minRevenue
                  const padding = range * 0.1
                  const yMin = Math.max(0, minRevenue - padding)
                  const yMax = maxRevenue + padding
                  const step = (yMax - yMin) / 6

                  return Array.from({ length: 7 }, (_, i) => {
                    const value = yMin + i * step
                    return (
                      <text
                        key={i}
                        x="60"
                        y={350 - i * 50}
                        className="text-sm fill-current text-muted-foreground"
                        textAnchor="end"
                      >
                        ${Math.round(value).toLocaleString()}
                      </text>
                    )
                  })
                })()}

                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <line
                    key={i}
                    x1="70"
                    y1={350 - i * 50}
                    x2="750"
                    y2={350 - i * 50}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border opacity-30"
                  />
                ))}

                {monthlyData.map((_, index) => (
                  <line
                    key={index}
                    x1={70 + index * 55}
                    y1="50"
                    x2={70 + index * 55}
                    y2="350"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border opacity-20"
                  />
                ))}

                <path
                  d={(() => {
                    const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))
                    const minRevenue = Math.min(...monthlyData.map((m) => m.revenue))
                    const range = maxRevenue - minRevenue
                    const padding = range * 0.1
                    const yMin = Math.max(0, minRevenue - padding)
                    const yMax = maxRevenue + padding

                    const points = monthlyData.map((month, index) => ({
                      x: 70 + index * 55,
                      y: 350 - ((month.revenue - yMin) / (yMax - yMin)) * 300,
                    }))

                    if (points.length < 2) return ""

                    let path = `M ${points[0].x} ${points[0].y}`

                    for (let i = 1; i < points.length; i++) {
                      const prev = points[i - 1]
                      const curr = points[i]
                      const next = points[i + 1] || curr
                      const prevPrev = points[i - 2] || prev

                      const tension = 0.3
                      const cp1x = prev.x + (curr.x - prevPrev.x) * tension
                      const cp1y = prev.y + (curr.y - prevPrev.y) * tension
                      const cp2x = curr.x - (next.x - prev.x) * tension
                      const cp2y = curr.y - (next.y - prev.y) * tension

                      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
                    }

                    return path
                  })()}
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />

                {monthlyData.map((month, index) => {
                  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))
                  const minRevenue = Math.min(...monthlyData.map((m) => m.revenue))
                  const range = maxRevenue - minRevenue
                  const padding = range * 0.1
                  const yMin = Math.max(0, minRevenue - padding)
                  const yMax = maxRevenue + padding
                  const yPos = 350 - ((month.revenue - yMin) / (yMax - yMin)) * 300

                  return (
                    <g key={month.month} className="group">
                      <circle
                        cx={70 + index * 55}
                        cy={yPos}
                        r="6"
                        fill="#1e40af"
                        className="cursor-pointer hover:r-8 transition-all duration-200"
                      />
                      <circle cx={70 + index * 55} cy={yPos} r="15" fill="transparent" className="cursor-pointer" />

                      <foreignObject
                        x={Math.min(70 + index * 55 + 15, 550)}
                        y={Math.max(yPos - 50, 10)}
                        width="200"
                        height="80"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <h4 className="font-semibold text-blue-600 mb-2">{month.fullMonth}</h4>
                          <div className="grid grid-cols-1 gap-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="font-semibold">${month.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ADR:</span>
                              <span className="font-semibold">${month.adr}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Occupancy:</span>
                              <span className="font-semibold">{month.occupancy}%</span>
                            </div>
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  )
                })}

                <line
                  x1="70"
                  y1="50"
                  x2="70"
                  y2="350"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                />
                <line
                  x1="70"
                  y1="350"
                  x2="750"
                  y2="350"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                />
              </svg>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Adelaide Seasonal Revenue Distribution</h3>
            <p className="text-muted-foreground mb-6">Seasonal breakdown of annual revenue</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #1e40af 0% 35%,
                        #059669 35% 63%,
                        #d97706 63% 88%,
                        #64748b 88% 100%
                      )`,
                    }}
                  ></div>
                  <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">${totalAnnualRevenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                {[
                  { name: "Summer (Dec-Feb)", value: 35, color: "#1e40af", months: "Peak holiday season" },
                  { name: "Spring (Sep-Nov)", value: 28, color: "#059669", months: "School holidays & events" },
                  { name: "Autumn (Mar-May)", value: 25, color: "#d97706", months: "Shoulder season" },
                  { name: "Winter (Jun-Aug)", value: 12, color: "#64748b", months: "Low season" },
                ].map((season, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: season.color }}></div>
                      <div>
                        <p className="font-semibold text-foreground">{season.name}</p>
                        <p className="text-sm text-muted-foreground">{season.months}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{season.value}%</p>
                      <p className="text-sm text-muted-foreground">
                        ${Math.round((totalAnnualRevenue * season.value) / 100).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Comparable Properties Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Property</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">ADR</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Occupancy</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Annual Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {editableData.comparableProperties.map((property, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-b border-border/50"
                    >
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            value={property.name}
                            onChange={(e) => updateComparableProperty(index, "name", e.target.value)}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-muted-foreground">{property.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={property.adr}
                            onChange={(e) => updateComparableProperty(index, "adr", Number(e.target.value))}
                            className="w-20 text-sm"
                          />
                        ) : (
                          <span className="font-semibold text-primary">${property.adr}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={property.occupancy}
                            onChange={(e) => updateComparableProperty(index, "occupancy", Number(e.target.value))}
                            className="w-20 text-sm"
                          />
                        ) : (
                          <span className="font-semibold text-primary">{property.occupancy}%</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={property.revenue}
                            onChange={(e) => updateComparableProperty(index, "revenue", Number(e.target.value))}
                            className="w-28 text-sm"
                          />
                        ) : (
                          <span className="font-semibold text-primary">${property.revenue.toLocaleString()}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
