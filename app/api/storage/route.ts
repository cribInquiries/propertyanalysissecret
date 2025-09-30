import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export const runtime = "edge"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function PUT(request: Request) {
  try {
    const { userId, key, data } = await request.json()
    if (!userId || !key) {
      return NextResponse.json({ error: "Missing userId or key" }, { status: 400 })
    }

    const path = `userdata/${encodeURIComponent(userId)}/${encodeURIComponent(key)}.json`
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 })
    }
    const result = await put(path, JSON.stringify(data ?? null), {
      access: "public",
      contentType: "application/json",
      // @ts-ignore - supported in recent @vercel/blob versions; prevents random suffix
      addRandomSuffix: false,
      token,
    })

    return NextResponse.json({ url: result.url, path })
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

    const prefix = `userdata/${encodeURIComponent(userId)}/${encodeURIComponent(key)}.json`
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 })
    }
    const { blobs } = await list({ prefix, token })
    if (!blobs || blobs.length === 0) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const url = blobs[0].url
    const res = await fetch(url)
    if (!res.ok) {
      return new NextResponse("Upstream fetch failed", { status: 502 })
    }
    const json = await res.json()
    return NextResponse.json({ data: json, url })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}


