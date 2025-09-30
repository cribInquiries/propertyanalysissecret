import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    const userId = (form.get("userId") as string) || "anon"
    const folder = (form.get("folder") as string) || "design-inspiration"

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
    const path = `userdata/${encodeURIComponent(userId)}/${folder}/${Date.now()}-${safeName}`

    const { url } = await put(path, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url, path })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}


