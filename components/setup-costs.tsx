"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Palette, Sofa, Wrench, Camera, Edit3, Save, X, Upload, Plus, Trash2 } from "lucide-react"
import { useState, useRef } from "react"

export function SetupCosts() {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingDesign, setIsEditingDesign] = useState(false)
  const [editableData, setEditableData] = useState({
    renovationItems: [
      { category: "Kitchen Upgrade", cost: 25000, description: "Modern appliances, countertops, and fixtures" },
      { category: "Bathroom Renovation", cost: 18000, description: "Luxury finishes and spa-like amenities" },
      { category: "Flooring", cost: 12000, description: "Premium hardwood and tile throughout" },
      { category: "Paint & Finishes", cost: 8000, description: "Professional interior and exterior painting" },
    ],
    furnishingItems: [
      { category: "Living Areas", cost: 15000, description: "Sofas, dining sets, and entertainment centers" },
      { category: "Bedrooms", cost: 12000, description: "Beds, dressers, and luxury linens" },
      { category: "Outdoor Furniture", cost: 8000, description: "Patio sets, loungers, and umbrellas" },
      { category: "Decor & Accessories", cost: 5000, description: "Artwork, lighting, and finishing touches" },
    ],
    designInspirations: [
      {
        id: 1,
        title: "Luxury Living Space",
        image: "/luxury-living-room.png",
        description: "Modern luxury living room with premium finishes and comfortable seating",
      },
      {
        id: 2,
        title: "Master Bedroom Suite",
        image: "/modern-luxury-bedroom-design.png",
        description: "Elegant bedroom design with luxury linens and sophisticated lighting",
      },
      {
        id: 3,
        title: "Outdoor Entertainment",
        image: "/luxury-outdoor-patio-design.png",
        description: "Premium outdoor space perfect for relaxation and entertainment",
      },
    ],
  })
  const [originalData, setOriginalData] = useState(editableData)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalRenovation = editableData.renovationItems.reduce((sum, item) => sum + item.cost, 0)
  const totalFurnishing = editableData.furnishingItems.reduce((sum, item) => sum + item.cost, 0)
  const totalSetup = totalRenovation + totalFurnishing

  const handleSave = () => {
    setIsEditing(false)
    setOriginalData(editableData)
  }

  const handleDesignSave = () => {
    setIsEditingDesign(false)
    setOriginalData(editableData)
  }

  const handleDesignCancel = () => {
    setIsEditingDesign(false)
    setEditableData(originalData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditableData(originalData)
  }

  const updateRenovationItem = (index: number, field: string, value: number | string) => {
    setEditableData((prev) => ({
      ...prev,
      renovationItems: prev.renovationItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const updateFurnishingItem = (index: number, field: string, value: number | string) => {
    setEditableData((prev) => ({
      ...prev,
      furnishingItems: prev.furnishingItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const updateDesignInspiration = (id: number, field: string, value: string) => {
    setEditableData((prev) => ({
      ...prev,
      designInspirations: prev.designInspirations.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const addDesignInspiration = () => {
    const newId = Math.max(...editableData.designInspirations.map((item) => item.id)) + 1
    setEditableData((prev) => ({
      ...prev,
      designInspirations: [
        ...prev.designInspirations,
        {
          id: newId,
          title: "New Design",
          image: "/interior-design-inspiration.png",
          description: "Add your design description here",
        },
      ],
    }))
  }

  const removeDesignInspiration = (id: number) => {
    setEditableData((prev) => ({
      ...prev,
      designInspirations: prev.designInspirations.filter((item) => item.id !== id),
    }))
  }

  const handleImageUpload = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateDesignInspiration(id, "image", result)
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Setup Investment</h2>
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
            Transform your property into a luxury Airbnb destination with our recommended renovations and furnishing
            package designed to maximize guest satisfaction and revenue.
          </p>
        </motion.div>

        {/* Cost Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Wrench className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Renovations</h3>
              <p className="text-3xl font-bold text-foreground">${totalRenovation.toLocaleString()}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Sofa className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Furnishing</h3>
              <p className="text-3xl font-bold text-foreground">${totalFurnishing.toLocaleString()}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <Palette className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Investment</h3>
              <p className="text-3xl font-bold text-accent">${totalSetup.toLocaleString()}</p>
            </Card>
          </motion.div>
        </div>

        {/* Renovation Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <Wrench className="w-6 h-6 text-accent" />
                Recommended Renovations
              </h3>
              <div className="space-y-6">
                {editableData.renovationItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={item.category}
                            onChange={(e) => updateRenovationItem(index, "category", e.target.value)}
                            className="font-semibold"
                          />
                          <Input
                            value={item.description}
                            onChange={(e) => updateRenovationItem(index, "description", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-foreground">{item.category}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </>
                      )}
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateRenovationItem(index, "cost", Number(e.target.value))}
                          className="w-28 text-right font-bold"
                        />
                      ) : (
                        <span className="text-lg font-bold text-accent">${item.cost.toLocaleString()}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <Sofa className="w-6 h-6 text-accent" />
                Furnishing Package
              </h3>
              <div className="space-y-6">
                {editableData.furnishingItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={item.category}
                            onChange={(e) => updateFurnishingItem(index, "category", e.target.value)}
                            className="font-semibold"
                          />
                          <Input
                            value={item.description}
                            onChange={(e) => updateFurnishingItem(index, "description", e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-foreground">{item.category}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </>
                      )}
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateFurnishingItem(index, "cost", Number(e.target.value))}
                          className="w-28 text-right font-bold"
                        />
                      ) : (
                        <span className="text-lg font-bold text-accent">${item.cost.toLocaleString()}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Design Renderings */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <Camera className="w-6 h-6 text-accent" />
                Design Inspiration & Renderings
              </h3>
              <div className="flex gap-2">
                {!isEditingDesign ? (
                  <Button onClick={() => setIsEditingDesign(true)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Designs
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleDesignSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleDesignCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {isEditingDesign && (
                  <Button onClick={addDesignInspiration} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Inspiration
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editableData.designInspirations.map((inspiration) => (
                <div key={inspiration.id} className="relative group">
                  {isEditingDesign && (
                    <Button
                      onClick={() => removeDesignInspiration(inspiration.id)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <div className="relative">
                    <img
                      src={inspiration.image || "/placeholder.svg"}
                      alt={inspiration.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {isEditingDesign && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <Button
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = (e) => handleImageUpload(inspiration.id, e as any)
                            input.click()
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    )}
                    {!isEditingDesign && (
                      <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <p className="text-primary-foreground font-semibold text-center px-4">{inspiration.title}</p>
                      </div>
                    )}
                  </div>

                  {isEditingDesign && (
                    <div className="mt-4 space-y-2">
                      <Input
                        value={inspiration.title || ""}
                        onChange={(e) => updateDesignInspiration(inspiration.id, "title", e.target.value)}
                        placeholder="Design title"
                        className="font-semibold"
                      />
                      <Input
                        value={inspiration.description || ""}
                        onChange={(e) => updateDesignInspiration(inspiration.id, "description", e.target.value)}
                        placeholder="Design description"
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ROI Projection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="p-8 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <h4 className="text-xl font-semibold text-foreground mb-4">Investment Return Projection</h4>
            <p className="text-muted-foreground text-lg mb-4">
              With an initial investment of ${totalSetup.toLocaleString()}, our projections show a full ROI within 18-24
              months based on the enhanced revenue potential from luxury positioning and premium guest experience.
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">18-24</p>
                <p className="text-sm text-muted-foreground">Months to ROI</p>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">35%</p>
                <p className="text-sm text-muted-foreground">Revenue Increase</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
