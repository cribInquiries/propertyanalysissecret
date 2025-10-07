import { NextResponse } from "next/server"
import { systemMonitor } from "@/lib/system-monitor"
import { securityManager } from "@/lib/security-manager"
import { CacheUtils } from "@/lib/cache-manager"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET() {
  try {
    // Get system health
    const health = await systemMonitor.getSystemHealth()
    
    // Get performance stats
    const performanceStats = systemMonitor.getPerformanceStats()
    
    // Get security health
    const securityHealth = await securityManager.performSecurityHealthCheck()
    
    // Get cache stats
    const cacheStats = CacheUtils.getCacheStats()
    
    // Check for alerts
    const alerts = await systemMonitor.checkAlerts()

    return NextResponse.json({
      status: health.status,
      timestamp: health.timestamp,
      components: health.components,
      metrics: health.metrics,
      performance: performanceStats,
      security: securityHealth,
      cache: cacheStats,
      alerts
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Force metrics collection
    await systemMonitor.collectMetrics()
    
    return NextResponse.json({
      success: true,
      message: 'Metrics collection triggered',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
