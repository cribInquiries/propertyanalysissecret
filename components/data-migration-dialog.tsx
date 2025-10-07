"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Upload, Database } from "lucide-react"
import { dataMigration } from "@/lib/data-migration"

interface MigrationStatus {
  hasLocalData: boolean
  hasSupabaseData: boolean
  needsMigration: boolean
}

export function DataMigrationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    migrated: number
    errors: string[]
  } | null>(null)

  useEffect(() => {
    if (isOpen) {
      checkMigrationStatus()
    }
  }, [isOpen])

  const checkMigrationStatus = async () => {
    try {
      const migrationStatus = await dataMigration.getMigrationStatus()
      setStatus(migrationStatus)
    } catch (error) {
      console.error("Error checking migration status:", error)
    }
  }

  const handleMigration = async () => {
    setIsMigrating(true)
    setMigrationResult(null)
    
    try {
      const result = await dataMigration.migrateToSupabase()
      setMigrationResult(result)
      
      if (result.success) {
        dataMigration.clearLocalData()
        // Refresh status after successful migration
        await checkMigrationStatus()
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        migrated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setIsMigrating(false)
    }
  }

  if (!status) {
    return null
  }

  if (!status.needsMigration && !migrationResult) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Data Migration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Migrate Your Data
          </DialogTitle>
          <DialogDescription>
            We've upgraded our data storage system. Migrate your local data to the cloud for better security and cross-device access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!migrationResult ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {status.hasLocalData ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>Local data found: {status.hasLocalData ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {status.hasSupabaseData ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>Cloud data found: {status.hasSupabaseData ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {status.needsMigration && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    We found local data that can be migrated to the cloud. This will allow you to access your property analysis data from any device.
                  </p>
                </div>
              )}

              {!status.needsMigration && status.hasLocalData && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You have both local and cloud data. The cloud data will be used by default.
                  </p>
                </div>
              )}

              <Button 
                onClick={handleMigration} 
                disabled={!status.needsMigration || isMigrating}
                className="w-full"
              >
                {isMigrating ? "Migrating..." : "Migrate to Cloud"}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                migrationResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {migrationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    migrationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {migrationResult.success ? 'Migration Successful!' : 'Migration Failed'}
                  </span>
                </div>
                <p className={`text-sm ${
                  migrationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {migrationResult.success 
                    ? `Successfully migrated ${migrationResult.migrated} data items to the cloud.`
                    : `Failed to migrate data. ${migrationResult.errors.length} errors occurred.`
                  }
                </p>
              </div>

              {migrationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-800">Errors:</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    {migrationResult.errors.map((error, index) => (
                      <li key={index} className="bg-red-100 p-2 rounded">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setMigrationResult(null)
                    checkMigrationStatus()
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Check Again
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


