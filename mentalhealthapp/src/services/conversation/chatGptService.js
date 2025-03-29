// src/services/conversation/chatGptService.js
const axios = require('axios');
const { OPENAI_CONFIG } = require('./config');
const { conversationStore } = require('./conversationStore');

// API endpoints
const API_ENDPOINTS = {
  CHAT_COMPLETIONS: 'https://api.openai.com/v1/chat/completions',
};

// Class for handling ChatGPT API interactions
class ChatGptService {
  constructor() {
    this.isInitialized = false;
    this.apiKey = OPENAI_CONFIG.apiKey;
    this.model = OPENAI_CONFIG.model;
    this.systemPrompt = OPENAI_CONFIG.systemPrompt;
  }
  
  // ... (other methods remain unchanged)
  
  // Build system message with context data
  _buildSystemMessage(contextData) {
    const { healthData, userProfile } = contextData;
    
    let systemMessage = this.systemPrompt;
    
    // Add user profile context if available
    if (userProfile) {
      systemMessage += `\n\nUSER PROFILE:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age || 'Unknown'}
- Mental health conditions: ${userProfile.conditions?.join(', ') || 'None specified'}`;
    }
    
    // Add health data context if available
    if (healthData) {
      systemMessage += `\n\nRECENT HEALTH DATA:
- Heart rate: ${healthData.heartRate ? `${healthData.heartRate} bpm (baseline: ${healthData.heartRateBaseline} bpm)` : 'Not available'}
- Sleep: ${healthData.sleepHours ? `${healthData.sleepHours} hours (baseline: ${healthData.sleepBaseline} hours)` : 'Not available'}  
- Steps: ${healthData.steps ? `${healthData.steps} steps (baseline: ${healthData.stepsBaseline} steps)` : 'Not available'}`;
      
      // Add health insights if significant deviations
      if (healthData.heartRate && healthData.heartRateBaseline) {
        const heartRateChange = (healthData.heartRate / healthData.heartRateBaseline - 1) * 100;
        if (Math.abs(heartRateChange) > 15) {
          systemMessage += `\n- Note: Heart rate is ${Math.abs(heartRateChange).toFixed(0)}% ${heartRateChange > 0 ? 'higher' : 'lower'} than baseline`;
        }
      }
      
      if (healthData.sleepHours && healthData.sleepBaseline) {
        const sleepChange = (healthData.sleepHours / healthData.sleepBaseline - 1) * 100;
        if (Math.abs(sleepChange) > 20) {
          systemMessage += `\n- Note: Sleep is ${Math.abs(sleepChange).toFixed(0)}% ${sleepChange > 0 ? 'longer' : 'shorter'} than baseline`;
        }
      }
    }
    
    return systemMessage;
  }
  
  // Get a fallback response if API fails
  _getFallbackResponse(userMessage) {
    // Simple keyword matching for emergencies
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('suicide') || 
        lowerCaseMessage.includes('kill myself') || 
        lowerCaseMessage.includes('end my life')) {
      return "I'm concerned about what you're saying. Please reach out to a crisis helpline right away - they're available 24/7 at 988 (in the US). They're trained to help with these exact feelings. Would you like me to provide more resources?";
    }
    
    if (lowerCaseMessage.includes('anxious') || lowerCaseMessage.includes('anxiety')) {
      return "I understand anxiety can be difficult. Would it help to try a simple breathing exercise? Breathe in for 4 counts, hold for 7, and exhale for 8. This can help calm your nervous system.";
    }
    
    if (lowerCaseMessage.includes('sad') || lowerCaseMessage.includes('depress')) {
      return "I'm sorry to hear you're feeling this way. Sometimes it helps to talk about what's bothering you or engage in an activity you enjoy. Would you like some suggestions?";  
    }
    
    // Default fallback response
    return "I'm here to support you. Can you tell me more about what you're experiencing? (Note: I'm currently having some technical difficulties but still want to help)";
  }
}

// Create and export singleton instance
const chatGptService = new ChatGptService();

module.exports = { chatGptService };