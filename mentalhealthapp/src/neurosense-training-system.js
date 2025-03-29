// neurosense-training-system.js
// System for recording, storing, and learning from user interactions

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * NeuroSense Training System
 * 
 * This system:
 * 1. Records conversations and feedback for model improvement
 * 2. Stores physiological factors and their correlations with mental states
 * 3. Adapts the Orb's responses based on historical patterns
 * 4. Implements a privacy-focused approach with local storage
 */
class NeuroSenseTrainingSystem {
  constructor(options = {}) {
    this.options = {
      dataDir: path.join(__dirname, 'data'),
      promptsFile: 'training_prompts.json',
      conversationsFile: 'training_conversations.json',
      correlationsFile: 'physiological_correlations.json',
      maxStoredConversations: 200,
      maxPromptLength: 1000,
      ...options
    };
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.options.dataDir)) {
      fs.mkdirSync(this.options.dataDir, { recursive: true });
    }
    
    // Initialize training data structures
    this.trainingPrompts = this._loadJSON(this.options.promptsFile, []);
    this.conversations = this._loadJSON(this.options.conversationsFile, []);
    this.physiologicalCorrelations = this._loadJSON(this.options.correlationsFile, {
      heartRate: [],
      sleepHours: [],
      stressLevel: [],
      exercise: []
    });
  }
  
  /**
   * Record a conversation for training
   */
  recordConversation(userMessage, orbResponse, context) {
    // Generate a unique ID for the conversation entry
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    
    // Create conversation entry
    const entry = {
      id,
      timestamp: new Date().toISOString(),
      userMessage,
      orbResponse,
      context: this._sanitizeContext(context),
      helpful: null, // To be filled in later with feedback
      metrics: {} // Additional metrics can be added later
    };
    
    // Add to conversations array
    this.conversations.push(entry);
    
    // Prune oldest conversations if we exceed the maximum
    if (this.conversations.length > this.options.maxStoredConversations) {
      this.conversations = this.conversations.slice(-this.options.maxStoredConversations);
    }
    
    // Save to storage
    this._saveJSON(this.options.conversationsFile, this.conversations);
    
    // Return the conversation ID for later reference
    return id;
  }
  
  /**
   * Record user feedback on a conversation
   */
  recordFeedback(conversationId, isHelpful, additionalFeedback = null) {
    const conversation = this.conversations.find(c => c.id === conversationId);
    
    if (!conversation) return false;
    
    // Update the feedback
    conversation.helpful = isHelpful;
    
    if (additionalFeedback) {
      conversation.additionalFeedback = additionalFeedback;
    }
    
    // Save back to storage
    this._saveJSON(this.options.conversationsFile, this.conversations);
    
    // Update training prompts based on feedback
    this._updateTrainingPrompts(conversation);
    
    return true;
  }
  
  /**
   * Record a physiological correlation
   */
  recordPhysiologicalCorrelation(metricType, value, mentalState) {
    if (!this.physiologicalCorrelations[metricType]) {
      this.physiologicalCorrelations[metricType] = [];
    }
    
    // Add the correlation
    const correlation = {
      timestamp: new Date().toISOString(),
      value,
      mentalState
    };
    
    this.physiologicalCorrelations[metricType].push(correlation);
    
    // Save back to storage
    this._saveJSON(this.options.correlationsFile, this.physiologicalCorrelations);
    
    return true;
  }
  
  /**
   * Get personalized system prompt based on user history
   */
  getPersonalizedSystemPrompt(basePrompt, userProfile) {
    let personalizedPrompt = basePrompt;
    
    // Add insights from physiological correlations
    const insights = this._generatePhysiologicalInsights(userProfile);
    
    if (insights.length > 0) {
      personalizedPrompt += "\n\nPHYSIOLOGICAL INSIGHTS:\n";
      insights.forEach(insight => {
        personalizedPrompt += `- ${insight}\n`;
      });
    }
    
    // Add learned patterns from helpful conversations
    const patterns = this._extractConversationPatterns();
    
    if (patterns.length > 0) {
      personalizedPrompt += "\n\nLEARNED INTERACTION PATTERNS:\n";
      patterns.forEach(pattern => {
        personalizedPrompt += `- ${pattern}\n`;
      });
    }
    
    // Ensure we don't exceed max prompt length
    if (personalizedPrompt.length > this.options.maxPromptLength) {
      personalizedPrompt = personalizedPrompt.substring(0, this.options.maxPromptLength);
    }
    
    return personalizedPrompt;
  }
  
  /**
   * Identify potential triggers based on conversation history
   */
  identifyTriggers(message, userProfile) {
    const triggers = [];
    
    // Look for keywords associated with negative responses
    const negativeConversations = this.conversations.filter(c => c.helpful === false);
    
    if (negativeConversations.length > 0) {
      // Extract keywords from negative conversations
      const negativeKeywords = this._extractKeywords(negativeConversations.map(c => c.userMessage));
      
      // Check if current message contains any of these keywords
      for (const keyword of negativeKeywords) {
        if (message.toLowerCase().includes(keyword.toLowerCase())) {
          triggers.push({
            type: 'keyword',
            value: keyword,
            source: 'negative_conversation'
          });
        }
      }
    }
    
    // Check physiological correlations for potential triggers
    if (userProfile && userProfile.recentBiometrics) {
      for (const reading of userProfile.recentBiometrics) {
        const correlations = this.physiologicalCorrelations[reading.type] || [];
        
        // Find correlations with similar values that led to negative mental states
        const similarCorrelations = correlations.filter(c => 
          Math.abs(c.value - reading.value) / reading.value < 0.1 && // Within 10%
          c.mentalState && c.mentalState.includes('anxiety') || c.mentalState.includes('stress')
        );
        
        if (similarCorrelations.length > 0) {
          triggers.push({
            type: 'biometric',
            metric: reading.type,
            value: reading.value,
            source: 'physiological_correlation'
          });
        }
      }
    }
    
    return triggers;
  }
  
  /**
   * Clear all training data
   */
  clearTrainingData() {
    this.trainingPrompts = [];
    this.conversations = [];
    this.physiologicalCorrelations = {
      heartRate: [],
      sleepHours: [],
      stressLevel: [],
      exercise: []
    };
    
    // Save empty data
    this._saveJSON(this.options.promptsFile, this.trainingPrompts);
    this._saveJSON(this.options.conversationsFile, this.conversations);
    this._saveJSON(this.options.correlationsFile, this.physiologicalCorrelations);
    
    return true;
  }
  
  /**
   * Generate insights from physiological data
   */
  _generatePhysiologicalInsights(userProfile) {
    const insights = [];
    
    // Analyze heart rate correlations
    const heartRateCorrelations = this.physiologicalCorrelations.heartRate || [];
    if (heartRateCorrelations.length >= 5) {
      // Group by mental state
      const heartRateByState = this._groupByMentalState(heartRateCorrelations);
      
      // Find significant differences
      for (const [state, readings] of Object.entries(heartRateByState)) {
        if (readings.length < 3) continue;
        
        // Calculate average heart rate for this mental state
        const avgHeartRate = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
        
        // Compare to baseline
        const baseline = userProfile?.baselineHeartRate || 72;
        const difference = avgHeartRate - baseline;
        
        if (Math.abs(difference) > 10) {
          insights.push(
            `User's heart rate tends to be ${difference > 0 ? 'elevated' : 'lower'} (${Math.abs(difference).toFixed(1)} bpm ${difference > 0 ? 'above' : 'below'} baseline) when experiencing ${state}`
          );
        }
      }
    }
    
    // Analyze sleep correlations
    const sleepCorrelations = this.physiologicalCorrelations.sleepHours || [];
    if (sleepCorrelations.length >= 5) {
      // Group by mental state
      const sleepByState = this._groupByMentalState(sleepCorrelations);
      
      // Find significant differences
      for (const [state, readings] of Object.entries(sleepByState)) {
        if (readings.length < 3) continue;
        
        // Calculate average sleep for this mental state
        const avgSleep = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
        
        // Compare to baseline
        const baseline = userProfile?.baselineSleep || 7.5;
        const difference = avgSleep - baseline;
        
        if (Math.abs(difference) > 1) {
          insights.push(
            `User's sleep tends to be ${difference > 0 ? 'longer' : 'shorter'} (${Math.abs(difference).toFixed(1)} hours ${difference > 0 ? 'above' : 'below'} baseline) before days with reported ${state}`
          );
        }
      }
    }
    
    return insights;
  }
  
  /**
   * Extract communication patterns from successful conversations
   */
  _extractConversationPatterns() {
    const patterns = [];
    
    // Get conversations marked as helpful
    const helpfulConversations = this.conversations.filter(c => c.helpful === true);
    
    if (helpfulConversations.length < 5) {
      return patterns;
    }
    
    // Extract patterns from helpful Orb responses
    const responseTexts = helpfulConversations.map(c => c.orbResponse);
    
    // Count common phrases
    const phrases = this._extractCommonPhrases(responseTexts);
    
    // Add the most common phrases as patterns
    Object.entries(phrases)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([phrase, count]) => {
        if (count >= 3) {
          patterns.push(`User responds well to phrasing like: "${phrase}"`);
        }
      });
    
    // Analyze response structure
    const usesQuestions = responseTexts.filter(t => t.includes('?')).length;
    if (usesQuestions > helpfulConversations.length * 0.7) {
      patterns.push('User responds well to responses that include questions');
    }
    
    const usesStepByStep = responseTexts.filter(t => 
      t.includes('First') && t.includes('Second') || 
      t.includes('Step 1') || 
      t.includes('1.') && t.includes('2.')
    ).length;
    
    if (usesStepByStep > helpfulConversations.length * 0.5) {
      patterns.push('User responds well to step-by-step instructions or numbered lists');
    }
    
    return patterns;
  }
  
  /**
   * Update training prompts based on feedback
   */
  _updateTrainingPrompts(conversation) {
    // Only add to training prompts if feedback is available
    if (conversation.helpful === null) return;
    
    // Create a training prompt
    const prompt = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      timestamp: new Date().toISOString(),
      userMessage: conversation.userMessage,
      context: conversation.context,
      orbResponse: conversation.orbResponse,
      helpful: conversation.helpful
    };
    
    // Add to training prompts
    this.trainingPrompts.push(prompt);
    
    // Save to storage
    this._saveJSON(this.options.promptsFile, this.trainingPrompts);
  }
  
  /**
   * Extract common phrases from a list of texts
   */
  _extractCommonPhrases(texts, minLength = 5, maxLength = 10) {
    const phrases = {};
    
    texts.forEach(text => {
      const words = text.split(' ');
      
      for (let len = minLength; len <= maxLength; len++) {
        for (let i = 0; i <= words.length - len; i++) {
          const phrase = words.slice(i, i + len).join(' ');
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    });
    
    // Filter out phrases that only appear once
    return Object.fromEntries(
      Object.entries(phrases).filter(([_, count]) => count > 1)
    );
  }
  
  /**
   * Extract keywords from a list of texts
   */
  _extractKeywords(texts) {
    // This is a simple implementation - in a real system,
    // you'd use NLP techniques like TF-IDF or a topic model
    
    // Common stop words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
      'to', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'of'
    ]);
    
    // Count word occurrences
    const wordCounts = {};
    
    texts.forEach(text => {
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 2 && !stopWords.has(word)); // Filter stop words
      
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }
  
  /**
   * Group correlations by mental state
   */
  _groupByMentalState(correlations) {
    const byState = {};
    
    correlations.forEach(correlation => {
      if (!correlation.mentalState) return;
      
      const state = correlation.mentalState.toLowerCase();
      
      if (!byState[state]) {
        byState[state] = [];
      }
      
      byState[state].push(correlation);
    });
    
    return byState;
  }
  
  /**
   * Sanitize context to remove sensitive information
   */
  _sanitizeContext(context) {
    if (!context) return {};
    
    // Create a sanitized copy
    const sanitized = { ...context };
    
    // Remove potential sensitive fields
    delete sanitized.personalIdentifiers;
    delete sanitized.emailAddress;
    delete sanitized.phoneNumber;
    delete sanitized.address;
    delete sanitized.apiKey;
    delete sanitized.password;
    
    return sanitized;
  }
  
  /**
   * Load JSON data from file
   */
  _loadJSON(filename, defaultValue) {
    const filePath = path.join(this.options.dataDir, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
    }
    
    return defaultValue;
  }
  
  /**
   * Save JSON data to file
   */
  _saveJSON(filename, data) {
    const filePath = path.join(this.options.dataDir, filename);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
      return false;
    }
  }
}

/**
 * Helper class to integrate the training system with the Orb chatbot
 */
class OrbTrainingAdapter {
  constructor(trainingSystem, chatService) {
    this.trainingSystem = trainingSystem;
    this.chatService = chatService;
    this.pendingConversations = new Map(); // Track conversations awaiting feedback
  }
  
  /**
   * Process a message with the Orb chatbot
   */
  async processMessage(message, userProfile) {
    try {
      // Get personalized system prompt
      const basePrompt = this.chatService.systemPrompt || "";
      const personalizedPrompt = this.trainingSystem.getPersonalizedSystemPrompt(basePrompt, userProfile);
      
      // Override the system prompt temporarily
      const originalPrompt = this.chatService.systemPrompt;
      this.chatService.systemPrompt = personalizedPrompt;
      
      // Identify potential triggers in the message
      const triggers = this.trainingSystem.identifyTriggers(message, userProfile);
      
      // Prepare the context with triggers
      const context = {
        userProfile,
        triggers,
        timestamp: new Date().toISOString()
      };
      
      // Process the message
      const response = await this.chatService.sendMessage(message, context);
      
      // Record the conversation
      const conversationId = this.trainingSystem.recordConversation(message, response, context);
      
      // Track this conversation for future feedback
      this.pendingConversations.set(conversationId, {
        message,
        response,
        context,
        timestamp: new Date()
      });
      
      // Restore original system prompt
      this.chatService.systemPrompt = originalPrompt;
      
      // Return the enhanced response with conversation ID
      return {
        text: response,
        conversationId
      };
    } catch (error) {
      console.error("Error in OrbTrainingAdapter.processMessage:", error);
      
      // Fallback to regular processing
      return {
        text: await this.chatService.sendMessage(message, { userProfile }),
        conversationId: null
      };
    }
  }
  
  /**
   * Process feedback on a conversation
   */
  async processFeedback(conversationId, isHelpful, additionalFeedback = null) {
    try {
      // Record the feedback
      const result = this.trainingSystem.recordFeedback(
        conversationId,
        isHelpful,
        additionalFeedback
      );
      
      // Remove from pending conversations
      this.pendingConversations.delete(conversationId);
      
      return result;
    } catch (error) {
      console.error("Error in OrbTrainingAdapter.processFeedback:", error);
      return false;
    }
  }
  
  /**
   * Record physiological data with mental state correlation
   */
  recordPhysiologicalData(metricType, value, mentalState = null) {
    try {
      return this.trainingSystem.recordPhysiologicalCorrelation(
        metricType,
        value,
        mentalState
      );
    } catch (error) {
      console.error("Error in OrbTrainingAdapter.recordPhysiologicalData:", error);
      return false;
    }
  }
  
  /**
   * Clean up old pending conversations
   */
  cleanupPendingConversations(maxAgeHours = 48) {
    const now = new Date();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    
    for (const [id, conversation] of this.pendingConversations.entries()) {
      const age = now - conversation.timestamp;
      
      if (age > maxAgeMs) {
        this.pendingConversations.delete(id);
      }
    }
  }
}

module.exports = {
  NeuroSenseTrainingSystem,
  OrbTrainingAdapter
};