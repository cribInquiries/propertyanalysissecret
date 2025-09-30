import { PropertyHero } from "@/components/property-hero"
import { AnalysisOverview } from "@/components/analysis-overview"
import { PurchaseMotivation } from "@/components/purchase-motivation"
import { RevenueProjections } from "@/components/revenue-projections"
import { MaintenanceBreakdown } from "@/components/maintenance-breakdown"
import { SetupCosts } from "@/components/setup-costs"
import { ValueMaximization } from "@/components/value-maximization"
import { CompanyPortfolio } from "@/components/company-portfolio"
import { ContactSection } from "@/components/contact-section"
import { UserNav } from "@/components/user-nav"

export default function PropertyAnalysisPage() {
  const user = { id: "anon", email: "guest@example.com", name: "Guest" }
  return (
    <main className="min-h-screen">
      <UserNav user={user} />

      <PropertyHero />
      <AnalysisOverview />
      <PurchaseMotivation />
      <RevenueProjections />
      <MaintenanceBreakdown />
      <SetupCosts />
      <ValueMaximization />
      <CompanyPortfolio />
      <ContactSection />
    </main>
  )
}
