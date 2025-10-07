import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { DataValidator } from "@/lib/data-validation"
import { RateLimiter } from "@/lib/data-validation"
import { securityManager } from "@/lib/security-manager"
import { CachedDataStore } from "@/lib/cache-manager"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Create a simple Supabase client for API routes
// Provide fallback values to prevent build errors when env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

const supabase = createClient(
  supabaseUrl,
  supabaseKey // Use service role key to bypass RLS for API routes
)

const cachedDataStore = new CachedDataStore(supabase)

export async function PUT(request: Request) {
  try {
    const { userId, key, data } = await request.json()
    
    // Input validation
    if (!userId || !key) {
      return NextResponse.json({ error: "Missing userId or key" }, { status: 400 })
    }

    // Rate limiting
    if (!RateLimiter.isAllowed(userId)) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please try again later." 
      }, { status: 429 })
    }

    // Validate data structure
    const validation = DataValidator.validateUserData(data)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid data format", 
        details: validation.errors 
      }, { status: 400 })
    }

    // Use cached data store for better performance
    await cachedDataStore.setCachedUserData(userId, key, validation.data)

    // Log data access
    await securityManager.monitorDataAccess(userId, 'user_data', 'update')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const key = searchParams.get("key")
    
    if (!userId || !key) {
      return NextResponse.json({ error: "Missing userId or key" }, { status: 400 })
    }

    // Rate limiting
    if (!RateLimiter.isAllowed(userId)) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please try again later." 
      }, { status: 429 })
    }

    // Use cached data store for better performance
    const data = await cachedDataStore.getCachedUserData(userId, key)
    
    if (data === null) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Log data access
    await securityManager.monitorDataAccess(userId, 'user_data', 'read')

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}


