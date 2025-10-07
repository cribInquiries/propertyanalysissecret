interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
  hitRate: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  }
  private readonly maxSize: number
  private readonly defaultTTL: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    this.startCleanup()
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    }

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, entry)
    this.updateStats()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      this.updateStats()
      return null
    }

    const now = Date.now()
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      this.updateStats()
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    this.stats.hits++
    this.updateStats()
    
    return entry.data as T
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.evictions++
      this.updateStats()
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  private updateStats(): void {
    this.stats.size = this.cache.size
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  private startCleanup(): void {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key)
          this.stats.evictions++
        }
      }
      this.updateStats()
    }, 60 * 1000)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Specialized caches for different data types
export const userDataCache = new CacheManager(500, 2 * 60 * 1000) // 2 minutes TTL for user data
export const imageMetadataCache = new CacheManager(200, 10 * 60 * 1000) // 10 minutes TTL for image metadata
export const propertyAnalysisCache = new CacheManager(100, 5 * 60 * 1000) // 5 minutes TTL for property analyses

// Cache utilities
export class CacheUtils {
  static generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`
  }

  static getUserDataKey(userId: string, dataKey: string): string {
    return this.generateKey('userdata', userId, dataKey)
  }

  static getImageMetadataKey(userId: string, category?: string): string {
    return this.generateKey('images', userId, category || 'all')
  }

  static getPropertyAnalysisKey(userId: string, analysisId?: string): string {
    return this.generateKey('property', userId, analysisId || 'all')
  }

  static invalidateUserData(userId: string): void {
    // Remove all user data cache entries
    const keysToDelete: string[] = []
    
    for (const key of userDataCache['cache'].keys()) {
      if (key.startsWith(`userdata:${userId}`)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => userDataCache.delete(key))
  }

  static invalidateImageCache(userId: string): void {
    const keysToDelete: string[] = []
    
    for (const key of imageMetadataCache['cache'].keys()) {
      if (key.startsWith(`images:${userId}`)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => imageMetadataCache.delete(key))
  }

  static getCacheStats() {
    return {
      userData: userDataCache.getStats(),
      imageMetadata: imageMetadataCache.getStats(),
      propertyAnalysis: propertyAnalysisCache.getStats()
    }
  }
}

// Enhanced data store with caching
export class CachedDataStore {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async getCachedUserData<T>(userId: string, dataKey: string): Promise<T | null> {
    const cacheKey = CacheUtils.getUserDataKey(userId, dataKey)
    
    // Try cache first
    const cached = userDataCache.get<T>(cacheKey)
    if (cached !== null) {
      return cached
    }

    // Fetch from database
    const { data, error } = await this.supabase
      .from('user_data')
      .select('data_value')
      .eq('user_id', userId)
      .eq('data_key', dataKey)
      .single()

    if (error || !data) {
      return null
    }

    const result = data.data_value as T
    
    // Cache the result
    userDataCache.set(cacheKey, result)
    
    return result
  }

  async setCachedUserData<T>(userId: string, dataKey: string, data: T): Promise<void> {
    const cacheKey = CacheUtils.getUserDataKey(userId, dataKey)
    
    // Update database
    const { error } = await this.supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_key: dataKey,
        data_value: data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,data_key'
      })

    if (!error) {
      // Update cache
      userDataCache.set(cacheKey, data)
    }
  }

  async getCachedImages(userId: string, category?: string): Promise<any[]> {
    const cacheKey = CacheUtils.getImageMetadataKey(userId, category)
    
    // Try cache first
    const cached = imageMetadataCache.get<any[]>(cacheKey)
    if (cached !== null) {
      return cached
    }

    // Fetch from database
    let query = this.supabase
      .from('image_metadata')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return []
    }

    const result = data || []
    
    // Cache the result
    imageMetadataCache.set(cacheKey, result)
    
    return result
  }

  invalidateUserCache(userId: string): void {
    CacheUtils.invalidateUserData(userId)
    CacheUtils.invalidateImageCache(userId)
  }
}

export const cacheManager = new CacheManager()
