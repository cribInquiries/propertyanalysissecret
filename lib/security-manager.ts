import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase/config'

export interface SecurityEvent {
  id: string
  userId?: string
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_access' | 'data_breach_attempt'
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
  resolved: boolean
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export class SecurityManager {
  private supabase: any
  private securityEvents: Map<string, SecurityEvent> = new Map()
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()
  private blockedIPs: Set<string> = new Set()
  private blockedUsers: Set<string> = new Set()

  constructor(supabase: any) {
    this.supabase = supabase
  }

  // Rate limiting
  async checkRateLimit(userId: string, ipAddress: string, config: RateLimitConfig): Promise<boolean> {
    const key = `${userId}:${ipAddress}`
    const now = Date.now()
    const limit = this.rateLimits.get(key)

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return true
    }

    if (limit.count >= config.maxRequests) {
      // Rate limit exceeded
      await this.logSecurityEvent({
        id: this.generateId(),
        userId,
        type: 'rate_limit_exceeded',
        severity: 'medium',
        details: `Rate limit exceeded: ${limit.count}/${config.maxRequests} requests in ${config.windowMs}ms`,
        ipAddress,
        timestamp: new Date().toISOString(),
        resolved: false
      })

      return false
    }

    // Increment count
    limit.count++
    return true
  }

  // IP blocking
  blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress)
    this.logSecurityEvent({
      id: this.generateId(),
      type: 'suspicious_activity',
      severity: 'high',
      details: `IP blocked: ${reason}`,
      ipAddress,
      timestamp: new Date().toISOString(),
      resolved: false
    })
  }

  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress)
  }

  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress)
  }

  // User blocking
  blockUser(userId: string, reason: string): void {
    this.blockedUsers.add(userId)
    this.logSecurityEvent({
      id: this.generateId(),
      userId,
      type: 'suspicious_activity',
      severity: 'high',
      details: `User blocked: ${reason}`,
      timestamp: new Date().toISOString(),
      resolved: false
    })
  }

  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId)
  }

  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.has(userId)
  }

  // Security event logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    this.securityEvents.set(event.id, event)
    
    // Store in database for persistence
    try {
      await this.supabase
        .from('security_events')
        .insert({
          id: event.id,
          user_id: event.userId,
          type: event.type,
          severity: event.severity,
          details: event.details,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          timestamp: event.timestamp,
          resolved: event.resolved
        })
    } catch (error) {
      console.error('Failed to log security event to database:', error)
    }
  }

  // Get security events
  async getSecurityEvents(userId?: string, limit = 100): Promise<SecurityEvent[]> {
    try {
      let query = this.supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch security events:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch security events:', error)
      return []
    }
  }

  // Input validation and sanitization
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/data:/gi, '') // Remove data protocols
      .substring(0, 1000) // Limit length
  }

  // SQL injection prevention
  validateSQLInput(input: string): boolean {
    const dangerousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /exec\s*\(/i,
      /script\s*>/i,
      /<\s*script/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(input))
  }

  // XSS prevention
  escapeHTML(input: string): string {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  }

  // CSRF token generation
  generateCSRFToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Validate CSRF token
  validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64
  }

  // Session security
  async validateSession(userId: string, sessionToken: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.getUser(sessionToken)
      
      if (error || !data?.user || data.user.id !== userId) {
        await this.logSecurityEvent({
          id: this.generateId(),
          userId,
          type: 'invalid_access',
          severity: 'medium',
          details: 'Invalid session token',
          timestamp: new Date().toISOString(),
          resolved: false
        })
        return false
      }

      return true
    } catch (error) {
      await this.logSecurityEvent({
        id: this.generateId(),
        userId,
        type: 'invalid_access',
        severity: 'medium',
        details: `Session validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        resolved: false
      })
      return false
    }
  }

  // Data access monitoring
  async monitorDataAccess(userId: string, resourceType: string, action: string, ipAddress?: string): Promise<void> {
    // Log the access for monitoring
    await this.logSecurityEvent({
      id: this.generateId(),
      userId,
      type: 'suspicious_activity',
      severity: 'low',
      details: `${action} on ${resourceType}`,
      ipAddress,
      timestamp: new Date().toISOString(),
      resolved: false
    })

    // Check for suspicious patterns
    const recentEvents = await this.getSecurityEvents(userId, 10)
    const suspiciousActivity = recentEvents.filter(event => 
      event.type === 'suspicious_activity' && 
      new Date().getTime() - new Date(event.timestamp).getTime() < 60000 // Last minute
    )

    if (suspiciousActivity.length > 5) {
      await this.logSecurityEvent({
        id: this.generateId(),
        userId,
        type: 'suspicious_activity',
        severity: 'high',
        details: `Multiple suspicious activities detected: ${suspiciousActivity.length} events in last minute`,
        ipAddress,
        timestamp: new Date().toISOString(),
        resolved: false
      })
    }
  }

  // Security health check
  async performSecurityHealthCheck(): Promise<{
    blockedIPs: number
    blockedUsers: number
    recentEvents: number
    criticalEvents: number
  }> {
    const recentEvents = await this.getSecurityEvents(undefined, 1000)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const recent = recentEvents.filter(event => 
      new Date(event.timestamp) > last24Hours
    )

    const critical = recent.filter(event => 
      event.severity === 'critical'
    )

    return {
      blockedIPs: this.blockedIPs.size,
      blockedUsers: this.blockedUsers.size,
      recentEvents: recent.length,
      criticalEvents: critical.length
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Security middleware for API routes
export function createSecurityMiddleware(securityManager: SecurityManager) {
  return async (req: Request, userId: string) => {
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    // Check if IP is blocked
    if (securityManager.isIPBlocked(ipAddress)) {
      return { allowed: false, reason: 'IP blocked' }
    }

    // Check if user is blocked
    if (securityManager.isUserBlocked(userId)) {
      return { allowed: false, reason: 'User blocked' }
    }

    // Check rate limit
    const rateLimitConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100 // 100 requests per minute
    }

    const rateLimitOk = await securityManager.checkRateLimit(userId, ipAddress, rateLimitConfig)
    if (!rateLimitOk) {
      return { allowed: false, reason: 'Rate limit exceeded' }
    }

    return { allowed: true }
  }
}

export const securityManager = new SecurityManager(createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
