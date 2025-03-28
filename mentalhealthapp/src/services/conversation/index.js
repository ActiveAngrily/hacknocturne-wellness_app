// src/services/conversation/index.js
import { chatGptService } from './chatGptService';
import { conversationStore } from './conversationStore';
import { OPENAI_CONFIG } from './config';

// Initialize services
export const initializeConversationService = async () => {
  const result = await chatGptService.initialize();
  console.log('Conversation service initialization:', result ? 'SUCCESS' : 'FAILED');
  return result;
};

// Helper function to send message and get response
export const sendMessage = async (text, contextData = {}) => {
  if (!chatGptService.isInitialized) {
    await chatGptService.initialize();
  }
  return chatGptService.sendMessage(text, contextData);
};

// Helper function to get conversation history
export const getConversation = () => {
  return chatGptService.getConversation();
};

// Helper function to clear conversation
export const clearConversation = async () => {
  return chatGptService.clearConversation();
};

export {
  chatGptService,
  conversationStore,
  OPENAI_CONFIG
};