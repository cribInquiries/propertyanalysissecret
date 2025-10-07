import { createClient } from '@supabase/supabase-js'

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  components: {
    database: ComponentHealth
    storage: ComponentHealth
    auth: ComponentHealth
    api: ComponentHealth
  }
  metrics: {
    responseTime: number
    errorRate: number
    throughput: number
    activeUsers: number
  }
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  errorRate?: number
  lastChecked: string
  details?: string
}

export interface PerformanceMetrics {
  timestamp: string
  responseTime: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
  queryCount: number
  errorCount: number
}

export class SystemMonitor {
  private supabase: any
  private metrics: PerformanceMetrics[] = []
  private readonly maxMetricsHistory = 1000
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor(supabase: any) {
    this.supabase = supabase
  }

  // Start monitoring
  startMonitoring(intervalMs = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.collectMetrics()
    }, intervalMs)
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // Collect performance metrics
  async collectMetrics(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test database connectivity and performance
      const dbStartTime = Date.now()
      const { error: dbError } = await this.supabase
        .from('user_data')
        .select('count')
        .limit(1)
      const dbResponseTime = Date.now() - dbStartTime

      // Test storage connectivity
      const storageStartTime = Date.now()
      const { error: storageError } = await this.supabase.storage
        .from('user-uploads')
        .list({ limit: 1 })
      const storageResponseTime = Date.now() - storageStartTime

      // Test auth service
      const authStartTime = Date.now()
      const { error: authError } = await this.supabase.auth.getSession()
      const authResponseTime = Date.now() - authStartTime

      // Calculate overall response time
      const responseTime = Date.now() - startTime

      // Count errors
      const errorCount = [dbError, storageError, authError].filter(error => error).length

      // Get system metrics
      const memoryUsage = this.getMemoryUsage()
      const cpuUsage = await this.getCPUUsage()

      const metric: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        responseTime,
        memoryUsage,
        cpuUsage,
        activeConnections: 1, // Simplified for now
        queryCount: 3, // Number of queries we just ran
        errorCount
      }

      this.metrics.push(metric)

      // Keep only recent metrics
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory)
      }

    } catch (error) {
      console.error('Failed to collect metrics:', error)
    }
  }

  // Get system health status
  async getSystemHealth(): Promise<SystemHealth> {
    const now = new Date().toISOString()

    // Check database health
    const databaseHealth = await this.checkDatabaseHealth()
    
    // Check storage health
    const storageHealth = await this.checkStorageHealth()
    
    // Check auth health
    const authHealth = await this.checkAuthHealth()
    
    // Check API health (simplified)
    const apiHealth = await this.checkAPIHealth()

    // Calculate overall metrics
    const recentMetrics = this.metrics.slice(-10) // Last 10 measurements
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
      : 0
    
    const errorRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.errorCount, 0) / recentMetrics.length
      : 0

    const throughput = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.queryCount, 0) / recentMetrics.length
      : 0

    // Determine overall system status
    const componentStatuses = [
      databaseHealth.status,
      storageHealth.status,
      authHealth.status,
      apiHealth.status
    ]

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (componentStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy'
    } else if (componentStatuses.includes('degraded')) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }

    return {
      status: overallStatus,
      timestamp: now,
      components: {
        database: databaseHealth,
        storage: storageHealth,
        auth: authHealth,
        api: apiHealth
      },
      metrics: {
        responseTime: avgResponseTime,
        errorRate,
        throughput,
        activeUsers: await this.getActiveUsersCount()
      }
    }
  }

  private async checkDatabaseHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase
        .from('user_data')
        .select('count')
        .limit(1)

      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'unhealthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          details: error.message
        }
      }

      const status = responseTime > 1000 ? 'degraded' : 'healthy'
      
      return {
        status,
        responseTime,
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async checkStorageHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase.storage
        .from('user-uploads')
        .list({ limit: 1 })

      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'unhealthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          details: error.message
        }
      }

      const status = responseTime > 2000 ? 'degraded' : 'healthy'
      
      return {
        status,
        responseTime,
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async checkAuthHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase.auth.getSession()

      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'unhealthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          details: error.message
        }
      }

      const status = responseTime > 1500 ? 'degraded' : 'healthy'
      
      return {
        status,
        responseTime,
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async checkAPIHealth(): Promise<ComponentHealth> {
    // Simplified API health check
    return {
      status: 'healthy',
      lastChecked: new Date().toISOString()
    }
  }

  private async getActiveUsersCount(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('user_id')
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

      if (error) return 0

      const uniqueUsers = new Set(data?.map((item: any) => item.user_id) || [])
      return uniqueUsers.size
    } catch {
      return 0
    }
  }

  private getMemoryUsage(): number {
    // Simplified memory usage calculation
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return usage.heapUsed / usage.heapTotal
    }
    return 0
  }

  private async getCPUUsage(): Promise<number> {
    // Simplified CPU usage calculation
    return 0 // Would need more complex implementation for real CPU monitoring
  }

  // Get performance metrics history
  getMetricsHistory(limit = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit)
  }

  // Get performance statistics
  getPerformanceStats(): {
    avgResponseTime: number
    maxResponseTime: number
    minResponseTime: number
    avgErrorRate: number
    totalErrors: number
    uptime: number
  } {
    if (this.metrics.length === 0) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        avgErrorRate: 0,
        totalErrors: 0,
        uptime: 0
      }
    }

    const responseTimes = this.metrics.map(m => m.responseTime)
    const errorCounts = this.metrics.map(m => m.errorCount)

    return {
      avgResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      avgErrorRate: errorCounts.reduce((sum, count) => sum + count, 0) / errorCounts.length,
      totalErrors: errorCounts.reduce((sum, count) => sum + count, 0),
      uptime: this.metrics.length > 0 ? Date.now() - new Date(this.metrics[0].timestamp).getTime() : 0
    }
  }

  // Alert system
  async checkAlerts(): Promise<string[]> {
    const alerts: string[] = []
    const health = await this.getSystemHealth()
    const stats = this.getPerformanceStats()

    // Check for unhealthy components
    if (health.status === 'unhealthy') {
      alerts.push('System is unhealthy - immediate attention required')
    } else if (health.status === 'degraded') {
      alerts.push('System performance is degraded')
    }

    // Check response time
    if (stats.avgResponseTime > 2000) {
      alerts.push(`High response time: ${stats.avgResponseTime}ms`)
    }

    // Check error rate
    if (stats.avgErrorRate > 0.1) {
      alerts.push(`High error rate: ${(stats.avgErrorRate * 100).toFixed(2)}%`)
    }

    // Check memory usage
    const recentMetrics = this.metrics.slice(-5)
    const avgMemoryUsage = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length
      : 0

    if (avgMemoryUsage > 0.9) {
      alerts.push(`High memory usage: ${(avgMemoryUsage * 100).toFixed(2)}%`)
    }

    return alerts
  }
}

export const systemMonitor = new SystemMonitor(createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
))
