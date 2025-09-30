"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  TreePine,
  Camera,
  Shield,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react"
import { useState } from "react"

const initialData = {
  valueAddons: [
    {
      icon: Wifi,
      title: "High-Speed Fiber Internet",
      impact: 15,
      description: "Essential for remote workers and digital nomads",
      cost: "$150/month",
    },
    {
      icon: Car,
      title: "EV Charging Station",
      impact: 25,
      description: "Attract eco-conscious travelers with Tesla charging",
      cost: "$2,500 setup",
    },
    {
      icon: Utensils,
      title: "Gourmet Kitchen Package",
      impact: 20,
      description: "Professional appliances and cooking essentials",
      cost: "$5,000 upgrade",
    },
    {
      icon: Dumbbell,
      title: "Home Gym Setup",
      impact: 30,
      description: "Private fitness space with premium equipment",
      cost: "$8,000 investment",
    },
    {
      icon: Waves,
      title: "Hot Tub Installation",
      impact: 40,
      description: "Luxury relaxation feature for premium positioning",
      cost: "$12,000 installation",
    },
    {
      icon: Camera,
      title: "Professional Photography",
      impact: 35,
      description: "Stunning listing photos increase booking rates",
      cost: "$1,500 one-time",
    },
    {
      icon: TreePine,
      title: "Landscaping Enhancement",
      impact: 18,
      description: "Beautiful outdoor spaces and curb appeal",
      cost: "$4,000 project",
    },
    {
      icon: Shield,
      title: "Smart Security System",
      impact: 12,
      description: "Guest peace of mind with modern security features",
      cost: "$2,000 system",
    },
  ],
}

export function ValueMaximization() {
  const [isEditing, setIsEditing] = useState(false)
  const [editableData, setEditableData] = useState(initialData)
  const [originalData, setOriginalData] = useState(initialData)

  const totalPotentialIncrease = editableData.valueAddons.reduce((sum, addon) => sum + addon.impact, 0)
  const annualIncrease = totalPotentialIncrease * 365 * 0.82 // Assuming 82% occupancy

  const handleSave = () => {
    setIsEditing(false)
    setOriginalData(editableData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditableData(originalData)
  }

  const updateValueAddon = (index: number, field: string, value: number | string) => {
    setEditableData((prev) => ({
      ...prev,
      valueAddons: prev.valueAddons.map((addon, i) => (i === index ? { ...addon, [field]: value } : addon)),
    }))
  }

  const addValueAddon = () => {
    const newAddon = {
      icon: Plus,
      title: "New Addition",
      impact: 0,
      description: "Describe the value this addition brings",
      cost: "$0",
    }
    setEditableData((prev) => ({
      ...prev,
      valueAddons: [...prev.valueAddons, newAddon],
    }))
  }

  const removeValueAddon = (index: number) => {
    setEditableData((prev) => ({
      ...prev,
      valueAddons: prev.valueAddons.filter((_, i) => i !== index),
    }))
  }

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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Maximize Your Property's Potential</h2>
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
            Strategic value-add improvements can significantly increase your Average Daily Rate and attract premium
            guests willing to pay for luxury amenities and experiences.
          </p>
        </motion.div>

        {/* Potential Impact Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="p-8 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Total Revenue Potential</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-accent">+${totalPotentialIncrease}</p>
                  <p className="text-sm text-muted-foreground">Per Night Increase</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">+${Math.round(annualIncrease).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Annual Revenue Increase</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">Premium</p>
                  <p className="text-sm text-muted-foreground">Market Positioning</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Value Add Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {editableData.valueAddons.map((addon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:scale-105 relative">
                {isEditing && (
                  <Button
                    onClick={() => removeValueAddon(index)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <addon.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={addon.title}
                            onChange={(e) => updateValueAddon(index, "title", e.target.value)}
                            className="font-semibold text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm">+$</span>
                            <Input
                              type="number"
                              value={addon.impact}
                              onChange={(e) => updateValueAddon(index, "impact", Number(e.target.value))}
                              className="w-20 text-sm font-bold"
                            />
                            <span className="text-sm">/night</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-foreground">{addon.title}</h3>
                          <p className="text-lg font-bold text-accent">+${addon.impact}/night</p>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <Input
                      value={addon.description}
                      onChange={(e) => updateValueAddon(index, "description", e.target.value)}
                      className="mb-4 text-sm"
                    />
                  ) : (
                    <p className="text-muted-foreground mb-4 flex-1">{addon.description}</p>
                  )}

                  <div className="pt-4 border-t border-border">
                    {isEditing ? (
                      <Input
                        value={addon.cost}
                        onChange={(e) => updateValueAddon(index, "cost", e.target.value)}
                        className="text-sm"
                        placeholder="Investment cost"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground">Investment: {addon.cost}</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card
                className="p-6 h-full border-dashed border-2 border-accent/30 hover:border-accent/50 transition-colors cursor-pointer flex items-center justify-center"
                onClick={addValueAddon}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-accent font-medium">Add New Addition</p>
                  <p className="text-sm text-muted-foreground mt-2">Click to add a custom value-add feature</p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Implementation Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Recommended Implementation Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-accent mb-3">Phase 1: Quick Wins</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Professional Photography</li>
                  <li>• High-Speed Internet</li>
                  <li>• Smart Security System</li>
                  <li>• Gourmet Kitchen Package</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">ROI: 3-6 months</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-3">Phase 2: Premium Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Landscaping Enhancement</li>
                  <li>• EV Charging Station</li>
                  <li>• Home Gym Setup</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">ROI: 6-12 months</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-3">Phase 3: Luxury Positioning</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Hot Tub Installation</li>
                  <li>• Additional Premium Amenities</li>
                  <li>• Concierge Services</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">ROI: 12-18 months</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
