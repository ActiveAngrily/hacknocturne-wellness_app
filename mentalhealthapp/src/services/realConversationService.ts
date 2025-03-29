// src/services/realConversationService.ts
import { Message } from '../components/MessageBubble';

// Import the conversation service functions
const conversation = require('./conversation');
const { 
  chatGptService, 
  OPENAI_CONFIG,
  initializeConversationService,
  sendMessage: sendChatGptMessage,
  getConversation: getChatGptConversation,
  clearConversation
} = conversation;

// Track initialization status
let isInitialized = false;

/**
 * Initialize the conversation service with the OpenAI API key
 */
export const initialize = async (apiKey?: string): Promise<boolean> => {
  try {
    // Set the API key in config if provided
    if (apiKey && apiKey.length > 0) {
      OPENAI_CONFIG.apiKey = apiKey;
      console.log('API key set successfully');
    } else {
      console.warn('No API key provided, will use env variable if available');
    }
    
    // Initialize the service
    if (!isInitialized) {
      isInitialized = await initializeConversationService(apiKey);
      console.log('Real conversation service initialized:', isInitialized);
    }
    return isInitialized;
  } catch (error) {
    console.error('Failed to initialize conversation service:', error);
    return false;
  }
};

/**
 * Get all messages from the conversation
 */
export const getMessages = async (): Promise<Message[]> => {
  // Try to initialize if not already done
  if (!isInitialized) {
    await initialize();
  }
  
  try {
    return getChatGptConversation();
  } catch (error) {
    console.error('Error getting messages:', error);
    // Return a fallback initial message if there's an error
    return [{
      id: 'initial',
      text: "Hello! I'm Orb, your mental health companion. How can I help you today?",
      sender: 'orb',
      timestamp: new Date()
    }];
  }
};

/**
 * Send a message and get response
 */
export const sendMessage = async (text: string): Promise<Message[]> => {
  try {
    // Try to initialize if not already done
    if (!isInitialized) {
      await initialize();
    }
    
    // Send message with ChatGPT
    await sendChatGptMessage(text, {
      // You can add context data here from other services
    });
    
    // Return updated conversation
    return getChatGptConversation();
  } catch (error) {
    console.error('Error in realConversationService.sendMessage:', error);
    
    // Get the current conversation to append our error message
    let currentConversation: Message[] = [];
    try {
      currentConversation = getChatGptConversation();
    } catch (e) {
      // If we can't get the conversation, start with a basic array
      currentConversation = [];
    }
    
    // Add user message if it's not already there
    const userMessageExists = currentConversation.some(
      (msg: Message) => msg.sender === 'user' && msg.text === text
    );
    
    if (!userMessageExists) {
      currentConversation.push({
        id: `user-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date()
      });
    }
    
    // Add error message
    currentConversation.push({
      id: `error-${Date.now()}`,
      text: "I'm sorry, I'm having trouble connecting to my services. Could you try again in a moment?",
      sender: 'orb',
      timestamp: new Date()
    });
    
    return currentConversation;
  }
};

/**
 * Reset the conversation
 */
export const resetConversation = async (): Promise<void> => {
  try {
    // Try to initialize if not already done
    if (!isInitialized) {
      await initialize();
    }
    
    await clearConversation();
  } catch (error) {
    console.error('Error resetting conversation:', error);
    // No need to throw, just log the error
  }
};