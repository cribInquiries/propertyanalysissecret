'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react'
import { vapiClient, useVapiCall } from '@/lib/vapi-client'
import { toast } from 'sonner'

interface VapiVoiceAssistantProps {
  propertyId?: string
  propertyName?: string
  onAnalysisComplete?: (transcript: string) => void
}

export function VapiVoiceAssistant({ 
  propertyId, 
  propertyName, 
  onAnalysisComplete 
}: VapiVoiceAssistantProps) {
  const [assistants, setAssistants] = useState<any[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [callStatus, setCallStatus] = useState<string>('idle')
  const [transcript, setTranscript] = useState<string>('')
  const [isMuted, setIsMuted] = useState(false)
  
  const { isCallActive, callId, startPropertyAnalysisCall, endCall } = useVapiCall()

  // Load assistants on component mount
  useEffect(() => {
    loadAssistants()
  }, [])

  // Poll call status when call is active
  useEffect(() => {
    if (isCallActive && callId) {
      const interval = setInterval(async () => {
        try {
          const status = await vapiClient.getCallStatus(callId)
          setCallStatus(status.status)
          if (status.transcript) {
            setTranscript(status.transcript)
          }
          
          // If call ended, trigger analysis completion
          if (status.status === 'ended' && onAnalysisComplete) {
            onAnalysisComplete(status.transcript || '')
          }
        } catch (error) {
          console.error('Error polling call status:', error)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isCallActive, callId, onAnalysisComplete])

  const loadAssistants = async () => {
    try {
      setIsLoading(true)
      const response = await vapiClient.getAssistants()
      setAssistants(response.data || [])
      
      // Auto-select first property analysis assistant
      const propertyAssistant = response.data?.find((a: any) => 
        a.name?.toLowerCase().includes('property') || 
        a.name?.toLowerCase().includes('analysis')
      )
      if (propertyAssistant) {
        setSelectedAssistant(propertyAssistant.id)
      }
    } catch (error) {
      console.error('Error loading assistants:', error)
      toast.error('Failed to load voice assistants')
    } finally {
      setIsLoading(false)
    }
  }

  const createPropertyAssistant = async () => {
    try {
      setIsLoading(true)
      const assistant = await vapiClient.createPropertyAnalysisAssistant()
      toast.success('Property analysis assistant created!')
      await loadAssistants()
      setSelectedAssistant(assistant.id)
    } catch (error) {
      console.error('Error creating assistant:', error)
      toast.error('Failed to create assistant')
    } finally {
      setIsLoading(false)
    }
  }

  const startCall = async () => {
    if (!selectedAssistant) {
      toast.error('Please select an assistant first')
      return
    }

    try {
      await startPropertyAnalysisCall(selectedAssistant)
      toast.success('Voice call started!')
    } catch (error) {
      console.error('Error starting call:', error)
      toast.error('Failed to start voice call')
    }
  }

  const handleEndCall = () => {
    endCall()
    setCallStatus('idle')
    toast.info('Call ended')
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In a real implementation, you would mute/unmute the microphone
    toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Property Analysis Assistant
        </CardTitle>
        {propertyName && (
          <Badge variant="secondary" className="w-fit">
            Analyzing: {propertyName}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Assistant Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Assistant:</label>
          {assistants.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No assistants found</p>
              <Button 
                onClick={createPropertyAssistant} 
                disabled={isLoading}
                variant="outline"
              >
                Create Property Analysis Assistant
              </Button>
            </div>
          ) : (
            <select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={isCallActive}
            >
              <option value="">Select an assistant...</option>
              {assistants.map((assistant) => (
                <option key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              disabled={!selectedAssistant || isLoading}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Voice Analysis
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
              
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 mr-2" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          )}
        </div>

        {/* Call Status */}
        {isCallActive && (
          <div className="text-center">
            <Badge 
              variant={callStatus === 'ringing' ? 'default' : 'secondary'}
              className="mb-2"
            >
              Status: {callStatus}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Call ID: {callId}
            </p>
          </div>
        )}

        {/* Live Transcript */}
        {transcript && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Live Transcript:</label>
            <div className="p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{transcript}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Select a property analysis assistant</li>
            <li>Click "Start Voice Analysis" to begin a voice call</li>
            <li>Speak with the AI assistant about your property investment</li>
            <li>The assistant will provide real-time analysis and insights</li>
            <li>View the live transcript as you speak</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
