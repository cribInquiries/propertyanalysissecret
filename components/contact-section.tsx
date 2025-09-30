"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin } from "lucide-react"

export function ContactSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-6">
            <img src="/luxe-logo.png" alt="Luxe Managements Logo" className="h-96 w-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Maximize Your Property's Potential?</h2>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto text-balance">
            Thank you for considering Luxe Managements for your Airbnb property. Let's discuss how we can transform your
            Adelaide investment into a luxury revenue generator.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Call Us Today</p>
                    <p className="text-primary-foreground/80">+61 406 631 461</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Email Us</p>
                    <p className="text-primary-foreground/80">luxemanagements.info@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Serving Adelaide</p>
                    <p className="text-primary-foreground/80">Professional Airbnb Management in Adelaide, SA</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-primary-foreground/20">
              <h4 className="font-semibold mb-4">What Happens Next?</h4>
              <div className="space-y-3 text-sm text-primary-foreground/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>We'll schedule a property consultation within 24 hours</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>Our team will conduct a detailed property assessment</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>You'll receive a customized management proposal</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-primary-foreground mb-6">
                  Start Your Journey to Premium Returns
                </h3>
                <p className="text-primary-foreground/80 mb-8">
                  Join our portfolio of successful property owners who are earning 40% more revenue with our luxury
                  management services.
                </p>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call +61 406 631 461 Now
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Schedule a Consultation
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-primary-foreground/20">
                  <p className="text-sm text-primary-foreground/60">
                    Available 7 days a week • Free initial consultation • No obligation
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
