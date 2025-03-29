// src/services/index.ts
// Service index - intelligently switch between real and mock implementations

// Import both implementations
import * as RealConversationService from './realConversationService';
import * as MockConversationService from './mockConversationService';

// Track which service is active
let isUsingRealService = true;

// Initialize - try real service first, fall back to mock if needed
export const initialize = async (apiKey?: string): Promise<boolean> => {
  try {
    const initialized = await RealConversationService.initialize(apiKey);
    isUsingRealService = initialized;
    
    if (!initialized) {
      console.warn("Real conversation service initialization failed. Using mock service instead.");
    } else {
      console.log("Using real OpenAI conversation service");
    }
    
    return initialized;
  } catch (error) {
    console.error("Error initializing real conversation service:", error);
    isUsingRealService = false;
    console.log("Falling back to mock conversation service");
    return false;
  }
};

// Get all messages
export const getMessages = async () => {
  try {
    if (isUsingRealService) {
      return await RealConversationService.getMessages();
    } else {
      return await MockConversationService.getMessages();
    }
  } catch (error) {
    console.error("Error in getMessages, falling back to mock:", error);
    isUsingRealService = false;
    return MockConversationService.getMessages();
  }
};

// Send a message and get a response
export const sendMessage = async (text: string) => {
  try {
    if (isUsingRealService) {
      return await RealConversationService.sendMessage(text);
    } else {
      return await MockConversationService.sendMessage(text);
    }
  } catch (error) {
    console.error("Error in sendMessage, falling back to mock:", error);
    isUsingRealService = false;
    return MockConversationService.sendMessage(text);
  }
};

// Reset conversation
export const resetConversation = async () => {
  try {
    if (isUsingRealService) {
      await RealConversationService.resetConversation();
    } else {
      await MockConversationService.resetConversation();
    }
  } catch (error) {
    console.error("Error in resetConversation:", error);
  }
};