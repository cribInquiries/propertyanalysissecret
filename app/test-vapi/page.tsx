'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import React, { useState } from 'react'
import { VapiVoiceAssistant } from '@/components/vapi-voice-assistant'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Mic, TrendingUp } from 'lucide-react'

export default function TestVapiPage() {
  const [propertyName, setPropertyName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [analysisResults, setAnalysisResults] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalysisComplete = (transcript: string) => {
    setAnalysisResults(transcript)
    setIsAnalyzing(false)
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisResults('')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Vapi Voice AI Integration Test</h1>
        <p className="text-muted-foreground">
          Test the voice-powered property analysis assistant
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input
                id="propertyName"
                placeholder="e.g., Luxury Beachfront Villa"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                placeholder="e.g., 123 Ocean Drive, Malibu, CA"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
            </div>

            <Button 
              onClick={startAnalysis}
              className="w-full"
              disabled={!propertyName || isAnalyzing}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Start Voice Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Voice Assistant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VapiVoiceAssistant
              propertyName={propertyName}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <Badge variant="secondary">Voice Analysis Complete</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Conversation Transcript:</Label>
              <Textarea
                value={analysisResults}
                readOnly
                className="min-h-32"
                placeholder="Analysis results will appear here..."
              />
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review the conversation transcript above</li>
                <li>• Extract key insights and recommendations</li>
                <li>• Update your property analysis with voice insights</li>
                <li>• Save the analysis to your property portfolio</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Environment Variables</h4>
              <div className="text-sm bg-muted p-3 rounded">
                <code>NEXT_PUBLIC_VAPI_API_KEY=7478548e-d1f3-4feb-a835-d1bc14764283</code>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">MCP Configuration</h4>
              <div className="text-sm bg-muted p-3 rounded">
                <code>VAPI_TOKEN=5fdc55c4-3fc9-4902-8df7-0e0a766ccb3e</code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Features Available:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Voice-powered property analysis consultations</li>
              <li>• Real-time conversation transcripts</li>
              <li>• AI assistant creation and management</li>
              <li>• Integration with your property analysis workflow</li>
              <li>• Professional voice synthesis and recognition</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
