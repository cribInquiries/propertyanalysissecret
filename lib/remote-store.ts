export async function remoteSave(userId: string, key: string, data: any): Promise<void> {
  await fetch("/api/storage", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, key, data }),
  })
}

export async function remoteLoad<T = any>(userId: string, key: string): Promise<T | null> {
  const res = await fetch(`/api/storage?userId=${encodeURIComponent(userId)}&key=${encodeURIComponent(key)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Remote load failed")
  const json = await res.json()
  return json.data as T
}


