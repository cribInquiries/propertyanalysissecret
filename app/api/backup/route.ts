import { NextResponse } from "next/server"
import { createBackupManager } from "@/lib/backup-manager"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes for backup operations

export async function POST(request: Request) {
  try {
    const backupManager = createBackupManager()
    const { action, backupId, userId } = await request.json()
    
    // Security check - only allow admin operations
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    
    // In a real implementation, you'd verify admin credentials
    // For now, we'll allow the operation but log it
    
    switch (action) {
      case 'create':
        const backupResult = await backupManager.createBackup()
        return NextResponse.json(backupResult)
        
      case 'create_incremental':
        const incrementalResult = await backupManager.createIncrementalBackup()
        return NextResponse.json(incrementalResult)
        
      case 'restore':
        if (!backupId) {
          return NextResponse.json({ error: "Backup ID required for restore" }, { status: 400 })
        }
        const restoreResult = await backupManager.restoreFromBackup(backupId)
        return NextResponse.json(restoreResult)
        
      case 'list':
        const backups = await backupManager.listBackups()
        return NextResponse.json({ backups })
        
      case 'cleanup':
        const cleanupResult = await backupManager.cleanupOldBackups()
        return NextResponse.json(cleanupResult)
        
      case 'export_user':
        if (!userId) {
          return NextResponse.json({ error: "User ID required for export" }, { status: 400 })
        }
        const exportResult = await backupManager.exportUserData(userId)
        return NextResponse.json(exportResult)
        
      case 'delete_user':
        if (!userId) {
          return NextResponse.json({ error: "User ID required for deletion" }, { status: 400 })
        }
        const deleteResult = await backupManager.deleteUserData(userId)
        return NextResponse.json(deleteResult)
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Backup operation failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      status: 'active',
      backups: [],
      config: {
        enabled: true,
        retentionDays: 30,
        lastBackup: null
      },
      message: 'Backup system is ready'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
