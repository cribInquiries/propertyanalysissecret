"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, Home, Wrench, Palette, DollarSign, Star } from "lucide-react"

const analysisSteps = [
  {
    icon: TrendingUp,
    title: "Purchase Motivation",
    description: "Understanding your investment goals and expectations for this property",
  },
  {
    icon: DollarSign,
    title: "Revenue Projections",
    description: "Detailed analysis of potential earnings based on market data and comparable properties",
  },
  {
    icon: Wrench,
    title: "Maintenance Breakdown",
    description: "Comprehensive overview of ongoing operational costs and maintenance requirements",
  },
  {
    icon: Palette,
    title: "Setup Investment",
    description: "Renovation recommendations, furnishing costs, and property preparation estimates",
  },
  {
    icon: Star,
    title: "Value Maximization",
    description: "Strategic additions and improvements to optimize your property's earning potential",
  },
  {
    icon: Home,
    title: "Our Portfolio",
    description: "Showcase of our managed properties and proven track record of success",
  },
]

export function AnalysisOverview() {
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">How We Analyze Your Property</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Our comprehensive analysis covers every aspect of your property's potential, from initial investment to
            ongoing profitability and optimization strategies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analysisSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:shadow-lg transition-shadow duration-300 border-border/50">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-balance">{step.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Process Flow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 bg-card p-6 rounded-lg border">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              1
            </div>
            <div className="w-12 h-1 bg-border"></div>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              2
            </div>
            <div className="w-12 h-1 bg-border"></div>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              3
            </div>
            <div className="w-12 h-1 bg-border"></div>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
              4
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Analysis → Projections → Recommendations → Success</p>
        </motion.div>
      </div>
    </section>
  )
}
