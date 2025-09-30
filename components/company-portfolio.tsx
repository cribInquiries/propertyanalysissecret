"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Award, Users, TrendingUp, Shield, Edit3, Save, X, Upload, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

const CompanyPortfolio = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [editableData, setEditableData] = useState({
    portfolioProperties: [
      {
        id: 1,
        name: "Adelaide Hills Retreat",
        location: "Adelaide Hills, SA",
        adr: 320,
        occupancy: 88,
        revenue: 103000,
        image: "/luxury-adelaide-hills-retreat.png",
      },
      {
        id: 2,
        name: "Glenelg Beach House",
        location: "Glenelg, SA",
        adr: 280,
        occupancy: 92,
        revenue: 94000,
        image: "/luxury-glenelg-beach-house.png",
      },
      {
        id: 3,
        name: "Barossa Valley Villa",
        location: "Barossa Valley, SA",
        adr: 450,
        occupancy: 85,
        revenue: 140000,
        image: "/luxury-barossa-valley-villa.png",
      },
      {
        id: 4,
        name: "North Adelaide Townhouse",
        location: "North Adelaide, SA",
        adr: 250,
        occupancy: 90,
        revenue: 82000,
        image: "/luxury-north-adelaide-townhouse.png",
      },
    ],
  })
  const [originalData, setOriginalData] = useState(editableData)

  const achievements = [
    {
      icon: TrendingUp,
      title: "Revenue Growth",
      description: "40% average revenue increase within first year",
    },
    {
      icon: Award,
      title: "Higher Profit Margins",
      description: "35% higher profit margins for managed properties",
    },
    {
      icon: Shield,
      title: "Reduced Operating Expenses",
      description: "25% reduction in operating costs through optimization",
    },
    {
      icon: Users,
      title: "Adelaide Specialists",
      description: "Local expertise in Adelaide's premium property market",
    },
  ]

  const handleSave = () => {
    setIsEditing(false)
    setOriginalData(editableData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditableData(originalData)
  }

  const updateProperty = (id: number, field: string, value: string | number) => {
    setEditableData((prev) => ({
      ...prev,
      portfolioProperties: prev.portfolioProperties.map((property) =>
        property.id === id ? { ...property, [field]: value } : property,
      ),
    }))
  }

  const addProperty = () => {
    const newId = Math.max(...editableData.portfolioProperties.map((p) => p.id)) + 1
    setEditableData((prev) => ({
      ...prev,
      portfolioProperties: [
        ...prev.portfolioProperties,
        {
          id: newId,
          name: "New Property",
          location: "Adelaide, SA",
          adr: 250,
          occupancy: 85,
          revenue: 75000,
          image: "/luxury-property-adelaide.png",
        },
      ],
    }))
  }

  const removeProperty = (id: number) => {
    setEditableData((prev) => ({
      ...prev,
      portfolioProperties: prev.portfolioProperties.filter((property) => property.id !== id),
    }))
  }

  const handleImageUpload = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateProperty(id, "image", result)
      }
      reader.readAsDataURL(file)
    }
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Why Choose Luxe Managements</h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Portfolio
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
            Adelaide's trusted experts in professional Airbnb property management. We're revenue optimization
            specialists with a proven track record of transforming properties into profitable luxury destinations.
          </p>
        </motion.div>

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center h-full">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground text-balance">{achievement.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Portfolio Properties */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-foreground">Our Adelaide Portfolio</h3>
            {isEditing && (
              <Button onClick={addProperty} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {editableData.portfolioProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  {isEditing && (
                    <Button
                      onClick={() => removeProperty(property.id)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <div className="relative">
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.name}
                      className="w-full h-64 object-cover"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = (e) => handleImageUpload(property.id, e as any)
                            input.click()
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={property.adr}
                          onChange={(e) => updateProperty(property.id, "adr", Number(e.target.value))}
                          className="w-16 h-6 text-xs p-1 bg-white text-black"
                        />
                      ) : (
                        `$${property.adr}/night`
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {isEditing ? (
                      <div className="space-y-3 mb-4">
                        <Input
                          value={property.name}
                          onChange={(e) => updateProperty(property.id, "name", e.target.value)}
                          className="text-xl font-semibold"
                        />
                        <Input
                          value={property.location}
                          onChange={(e) => updateProperty(property.id, "location", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xl font-semibold text-foreground mb-2">{property.name}</h4>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{property.location}</span>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={property.occupancy}
                            onChange={(e) => updateProperty(property.id, "occupancy", Number(e.target.value))}
                            className="text-center font-bold text-accent mb-1"
                          />
                        ) : (
                          <p className="text-lg font-bold text-accent">{property.occupancy}%</p>
                        )}
                        <p className="text-xs text-muted-foreground">Occupancy</p>
                      </div>
                      <div>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={property.adr}
                            onChange={(e) => updateProperty(property.id, "adr", Number(e.target.value))}
                            className="text-center font-bold text-accent mb-1"
                          />
                        ) : (
                          <p className="text-lg font-bold text-accent">${property.adr}</p>
                        )}
                        <p className="text-xs text-muted-foreground">ADR</p>
                      </div>
                      <div>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={property.revenue}
                            onChange={(e) => updateProperty(property.id, "revenue", Number(e.target.value))}
                            className="text-center font-bold text-accent mb-1"
                          />
                        ) : (
                          <p className="text-lg font-bold text-accent">${(property.revenue / 1000).toFixed(0)}K</p>
                        )}
                        <p className="text-xs text-muted-foreground">Annual Revenue</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Services Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Premium Airbnb Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-accent mb-3">Revenue Optimization</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Dynamic pricing strategies</li>
                  <li>• Multi-platform listings (Airbnb, Booking.com, Vrbo, Stayz)</li>
                  <li>• Market analysis & positioning</li>
                  <li>• Seasonal rate optimization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-3">Guest Experience</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Seamless check-ins</li>
                  <li>• Professional cleaning services</li>
                  <li>• Bespoke guest services</li>
                  <li>• 24/7 guest communication</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-3">Property Management</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Regular maintenance & inspections</li>
                  <li>• Emergency response</li>
                  <li>• Linen & amenity services</li>
                  <li>• Professional photography</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export { CompanyPortfolio }
export default CompanyPortfolio
