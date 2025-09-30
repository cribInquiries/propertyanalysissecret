"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Waves, Bed, Home, TreePine, Star, Edit3, Save, X } from "lucide-react"
import { useState } from "react"

export function MaintenanceBreakdown() {
  const [isEditing, setIsEditing] = useState(false)
  const [editableData, setEditableData] = useState({
    hasPool: true,
    bedrooms: 4,
    totalArea: 2500,
    hasGarden: true,
    propertyClass: "Luxury",
    poolCostPerYear: 2400,
    gardenCostPerYear: 1800,
    maintenancePerSqFt: 12,
    bedroomCostPerYear: 600,
    luxuryMultiplier: 1.3,
    cleaningCostPerBedroom: 150,
    linenServicePerBedroom: 200,
    generalRepairRate: 8,
    hvacMaintenanceRate: 4,
    poolChemicalsCost: 800,
    poolEquipmentMaintenance: 1200,
    gardenWaterCost: 600,
    landscapingCost: 1200,
    cleaningCostPerStay: 85,
    averageBookingLength: 3.2,
    averageStaysPerYear: 85,
    utilityCostPerStay: 25,
    amenityRestockingCost: 15,
    keyManagementCost: 8,
    inspectionCostPerStay: 12,
  })
  const [originalData, setOriginalData] = useState(editableData)

  const poolCost = editableData.hasPool ? editableData.poolChemicalsCost + editableData.poolEquipmentMaintenance : 0
  const gardenCost = editableData.hasGarden ? editableData.gardenWaterCost + editableData.landscapingCost : 0
  const generalMaintenance = Math.round(editableData.totalArea * editableData.generalRepairRate)
  const hvacMaintenance = Math.round(editableData.totalArea * editableData.hvacMaintenanceRate)
  const baseMaintenance = generalMaintenance + hvacMaintenance
  const cleaningCost = editableData.bedrooms * editableData.cleaningCostPerBedroom * 12
  const linenCost = editableData.bedrooms * editableData.linenServicePerBedroom * 12
  const bedroomCost = cleaningCost + linenCost

  const stayBasedCosts = Math.round(
    (editableData.cleaningCostPerStay +
      editableData.utilityCostPerStay +
      editableData.amenityRestockingCost +
      editableData.keyManagementCost +
      editableData.inspectionCostPerStay) *
      editableData.averageStaysPerYear,
  )

  const totalAnnualCost = Math.round(
    (poolCost + gardenCost + baseMaintenance + bedroomCost + stayBasedCosts) * editableData.luxuryMultiplier,
  )

  const safeFormatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0"
    }
    return Math.round(value).toLocaleString()
  }

  const maintenanceItems = [
    {
      icon: Home,
      title: "General Property Maintenance",
      cost: Math.round(baseMaintenance * editableData.luxuryMultiplier),
      description: `Regular repairs ($${editableData.generalRepairRate}/sq ft) and HVAC maintenance ($${editableData.hvacMaintenanceRate}/sq ft)`,
    },
    {
      icon: Bed,
      title: `${editableData.bedrooms} Bedroom Services`,
      cost: Math.round(bedroomCost * editableData.luxuryMultiplier),
      description: `Deep cleaning ($${editableData.cleaningCostPerBedroom}/month) and linen service ($${editableData.linenServicePerBedroom}/month) per bedroom`,
    },
    {
      icon: Star,
      title: "Guest Turnover Operations",
      cost: Math.round(stayBasedCosts * editableData.luxuryMultiplier),
      description: `${editableData.averageStaysPerYear} stays/year: cleaning ($${editableData.cleaningCostPerStay}), utilities ($${editableData.utilityCostPerStay}), amenities ($${editableData.amenityRestockingCost}) per stay`,
    },
    ...(editableData.hasPool
      ? [
          {
            icon: Waves,
            title: "Pool Maintenance",
            cost: Math.round(poolCost * editableData.luxuryMultiplier),
            description: `Chemicals ($${editableData.poolChemicalsCost}/yr) and equipment servicing ($${editableData.poolEquipmentMaintenance}/yr)`,
          },
        ]
      : []),
    ...(editableData.hasGarden
      ? [
          {
            icon: TreePine,
            title: "Garden & Landscaping",
            cost: Math.round(gardenCost * editableData.luxuryMultiplier),
            description: `Irrigation ($${editableData.gardenWaterCost}/yr) and professional landscaping ($${editableData.landscapingCost}/yr)`,
          },
        ]
      : []),
  ]

  const handleSave = () => {
    setIsEditing(false)
    setOriginalData(editableData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditableData(originalData)
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Maintenance Breakdown</h2>
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
            Understanding the ongoing costs is crucial for accurate ROI calculations. Here's a detailed breakdown of
            your property's annual maintenance requirements.
          </p>
        </motion.div>

        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Maintenance Cost Settings</h3>

              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-foreground">General Property Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      General Repair Rate ($/sq ft/year)
                    </label>
                    <Input
                      type="number"
                      value={editableData.generalRepairRate || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, generalRepairRate: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      HVAC Maintenance ($/sq ft/year)
                    </label>
                    <Input
                      type="number"
                      value={editableData.hvacMaintenanceRate || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, hvacMaintenanceRate: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Luxury Multiplier</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editableData.luxuryMultiplier || 1.0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, luxuryMultiplier: Number(e.target.value) || 1.0 }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-foreground">Bedroom Services (Monthly Rates)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Deep Cleaning per Bedroom ($/month)
                    </label>
                    <Input
                      type="number"
                      value={editableData.cleaningCostPerBedroom || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, cleaningCostPerBedroom: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Linen Service per Bedroom ($/month)
                    </label>
                    <Input
                      type="number"
                      value={editableData.linenServicePerBedroom || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, linenServicePerBedroom: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-foreground">Operational Costs (Per Stay)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Cleaning Cost per Stay ($)
                    </label>
                    <Input
                      type="number"
                      value={editableData.cleaningCostPerStay || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, cleaningCostPerStay: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Utilities per Stay ($)
                    </label>
                    <Input
                      type="number"
                      value={editableData.utilityCostPerStay || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, utilityCostPerStay: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Amenity Restocking ($)
                    </label>
                    <Input
                      type="number"
                      value={editableData.amenityRestockingCost || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, amenityRestockingCost: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Average Booking Length (nights)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editableData.averageBookingLength || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, averageBookingLength: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Total Stays per Year</label>
                    <Input
                      type="number"
                      value={editableData.averageStaysPerYear || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, averageStaysPerYear: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Key Management per Stay ($)
                    </label>
                    <Input
                      type="number"
                      value={editableData.keyManagementCost || 0}
                      onChange={(e) =>
                        setEditableData((prev) => ({ ...prev, keyManagementCost: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
              </div>

              {editableData.hasPool && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-foreground">Pool Maintenance (Annual Costs)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Pool Chemicals ($/year)
                      </label>
                      <Input
                        type="number"
                        value={editableData.poolChemicalsCost || 0}
                        onChange={(e) =>
                          setEditableData((prev) => ({ ...prev, poolChemicalsCost: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Equipment Maintenance ($/year)
                      </label>
                      <Input
                        type="number"
                        value={editableData.poolEquipmentMaintenance || 0}
                        onChange={(e) =>
                          setEditableData((prev) => ({
                            ...prev,
                            poolEquipmentMaintenance: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {editableData.hasGarden && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-foreground">Garden & Landscaping (Annual Costs)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Irrigation & Water ($/year)
                      </label>
                      <Input
                        type="number"
                        value={editableData.gardenWaterCost || 0}
                        onChange={(e) =>
                          setEditableData((prev) => ({ ...prev, gardenWaterCost: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Professional Landscaping ($/year)
                      </label>
                      <Input
                        type="number"
                        value={editableData.landscapingCost || 0}
                        onChange={(e) =>
                          setEditableData((prev) => ({ ...prev, landscapingCost: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Home className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Area</h3>
              {isEditing ? (
                <Input
                  type="number"
                  value={editableData.totalArea || 0}
                  onChange={(e) => setEditableData((prev) => ({ ...prev, totalArea: Number(e.target.value) || 0 }))}
                  className="text-center font-bold text-lg"
                />
              ) : (
                <p className="text-2xl font-bold text-foreground">{safeFormatNumber(editableData.totalArea)} sq ft</p>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Bed className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Bedrooms</h3>
              {isEditing ? (
                <Input
                  type="number"
                  value={editableData.bedrooms || 0}
                  onChange={(e) => setEditableData((prev) => ({ ...prev, bedrooms: Number(e.target.value) || 0 }))}
                  className="text-center font-bold text-lg"
                />
              ) : (
                <p className="text-2xl font-bold text-foreground">{editableData.bedrooms}</p>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Waves
                className={`w-8 h-8 mx-auto mb-4 ${editableData.hasPool ? "text-accent" : "text-muted-foreground"}`}
              />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Pool</h3>
              {isEditing ? (
                <select
                  value={editableData.hasPool ? "Yes" : "No"}
                  onChange={(e) => setEditableData((prev) => ({ ...prev, hasPool: e.target.value === "Yes" }))}
                  className="w-full text-center font-bold text-lg bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <p className="text-2xl font-bold text-foreground">{editableData.hasPool ? "Yes" : "No"}</p>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 text-center">
              <Star className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Class</h3>
              {isEditing ? (
                <select
                  value={editableData.propertyClass}
                  onChange={(e) =>
                    setEditableData((prev) => ({
                      ...prev,
                      propertyClass: e.target.value,
                      luxuryMultiplier: e.target.value === "Luxury" ? 1.3 : 1.0,
                    }))
                  }
                  className="w-full text-center font-bold text-lg bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="Standard">Standard</option>
                  <option value="Luxury">Luxury</option>
                </select>
              ) : (
                <p className="text-2xl font-bold text-foreground">{editableData.propertyClass}</p>
              )}
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {maintenanceItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <span className="text-xl font-bold text-accent">${safeFormatNumber(item.cost)}/yr</span>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Total Annual Maintenance Cost</h3>
                <p className="text-muted-foreground">
                  Includes{" "}
                  {editableData.luxuryMultiplier > 1 ? "30% luxury property premium" : "standard maintenance rates"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-accent">${safeFormatNumber(totalAnnualCost)}</p>
                <p className="text-sm text-muted-foreground">${safeFormatNumber(totalAnnualCost / 12)}/month</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
