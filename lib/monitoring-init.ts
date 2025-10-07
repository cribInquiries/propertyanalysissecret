import { systemMonitor } from './system-monitor'

// Initialize system monitoring
export function initializeMonitoring() {
  // Start monitoring with 30-second intervals
  systemMonitor.startMonitoring(30000)
  
  console.log('System monitoring initialized')
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down monitoring...')
    systemMonitor.stopMonitoring()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    console.log('Shutting down monitoring...')
    systemMonitor.stopMonitoring()
    process.exit(0)
  })
}

// Auto-initialize in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  initializeMonitoring()
}
