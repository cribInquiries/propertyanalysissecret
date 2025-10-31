'use client'

// Vapi Client Integration for Property Analysis App
// This file shows how to integrate Vapi voice AI into your property analysis application

import { useState } from 'react'

export interface VapiConfig {
  apiKey: string;
  assistantId?: string;
  baseUrl?: string;
}

export class VapiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: VapiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.vapi.ai';
  }

  /**
   * Start a voice call with Vapi assistant
   * Use this for voice-based property analysis consultations
   */
  async startCall(assistantId: string, customerNumber?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId,
          customer: customerNumber ? { number: customerNumber } : undefined,
          // Add property analysis context
          assistantOverrides: {
            variableValues: {
              propertyType: 'luxury',
              analysisType: 'investment',
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting Vapi call:', error);
      throw error;
    }
  }

  /**
   * Get call status and transcript
   */
  async getCallStatus(callId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting call status:', error);
      throw error;
    }
  }

  /**
   * Create a property analysis assistant
   */
  async createPropertyAnalysisAssistant() {
    try {
      const response = await fetch(`${this.baseUrl}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Property Analysis Expert',
          model: {
            provider: 'openai',
            model: 'gpt-4',
            systemMessage: `You are a luxury property investment analysis expert. 
            Help clients analyze property investments, calculate ROI, assess market conditions, 
            and provide detailed financial projections. You have access to current market data 
            and can help with:
            - Purchase price analysis
            - Revenue projections
            - Maintenance cost breakdowns
            - Value maximization strategies
            - Market comparison analysis
            
            Always provide detailed, data-driven insights and ask clarifying questions 
            to better understand the client's investment goals.`,
            temperature: 0.7,
            maxTokens: 1000,
          },
          voice: {
            provider: 'elevenlabs',
            voiceId: 'rachel', // Professional female voice
          },
          firstMessage: "Hello! I'm your luxury property investment analysis expert. I'm here to help you analyze potential property investments and maximize your returns. What property would you like to analyze today?",
          endCallMessage: "Thank you for using our property analysis service. I hope I've provided valuable insights for your investment decision. Have a great day!",
          endCallPhrases: ['goodbye', 'thank you', 'that\'s all', 'end call'],
          recordingEnabled: true,
          backgroundSound: 'office',
        }),
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  }

  /**
   * Get all assistants
   */
  async getAssistants() {
    try {
      const response = await fetch(`${this.baseUrl}/assistant`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting assistants:', error);
      throw error;
    }
  }
}

// Initialize Vapi client with your public API key
export const vapiClient = new VapiClient({
  apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY || '7478548e-d1f3-4feb-a835-d1bc14764283',
});

// Example usage in a React component:
export const useVapiCall = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  const startPropertyAnalysisCall = async (assistantId: string) => {
    try {
      setIsCallActive(true);
      const call = await vapiClient.startCall(assistantId);
      setCallId(call.id);
      return call;
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsCallActive(false);
      throw error;
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallId(null);
  };

  return {
    isCallActive,
    callId,
    startPropertyAnalysisCall,
    endCall,
  };
};
