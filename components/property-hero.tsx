"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Save, X } from "lucide-react"

export function PropertyHero() {
  const [isEditing, setIsEditing] = useState(false)
  const [heroData, setHeroData] = useState({
    propertyName: "The Adelaide Hills Retreat",
    clientName: "Sarah & Michael Thompson",
    address: "123 Scenic Drive, Adelaide Hills, SA 5152",
    backgroundImage: "/luxury-property-aerial.png",
  })
  const [originalData, setOriginalData] = useState(heroData)

  const handleSave = () => {
    setOriginalData(heroData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setHeroData(originalData)
    setIsEditing(false)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroData.backgroundImage}')` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-8 right-8 z-20"
      >
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 border border-white/30 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/luxe-logo.png" alt="Luxe Managements Logo" className="h-64 w-auto" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-6"
        >
          {isEditing ? (
            <Input
              value={heroData.propertyName}
              onChange={(e) => setHeroData({ ...heroData, propertyName: e.target.value })}
              className="text-5xl md:text-7xl font-bold text-center bg-white/10 border-white/20 text-white placeholder-white/50 text-balance"
              placeholder="Property Name"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl font-bold text-balance">{heroData.propertyName}</h1>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          {isEditing ? (
            <Input
              value={heroData.address}
              onChange={(e) => setHeroData({ ...heroData, address: e.target.value })}
              className="text-lg md:text-xl text-center bg-white/10 border-white/20 text-white placeholder-white/50"
              placeholder="Property Address"
            />
          ) : (
            <p className="text-lg md:text-xl text-primary-foreground/80">{heroData.address}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8"
        >
          {isEditing ? (
            <div className="text-xl md:text-2xl text-center">
              <span className="text-primary-foreground/80">Prepared exclusively for </span>
              <Input
                value={heroData.clientName}
                onChange={(e) => setHeroData({ ...heroData, clientName: e.target.value })}
                className="inline-block w-auto min-w-[200px] bg-white/10 border-white/20 text-white placeholder-white/50 font-semibold"
                placeholder="Client Name"
              />
            </div>
          ) : (
            <p className="text-xl md:text-2xl text-primary-foreground/80">
              Prepared exclusively for <span className="text-white font-semibold">{heroData.clientName}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto"
        >
          <p className="mb-4">Comprehensive Airbnb Property Analysis</p>
          <div className="w-24 h-1 bg-white mx-auto rounded-full" />

          {isEditing && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Background Image URL</label>
              <Input
                value={heroData.backgroundImage}
                onChange={(e) => setHeroData({ ...heroData, backgroundImage: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder="Enter image URL or path"
              />
              <p className="text-xs text-white/60 mt-1">Upload images to /public folder or use external URLs</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
