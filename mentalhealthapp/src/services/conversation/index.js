// src/services/conversation/index.js
const { chatGptService } = require('./chatGptService');
const { conversationStore } = require('./conversationStore');
const { OPENAI_CONFIG } = require('./config');
const dotenv = require('dotenv');

// Initialize dotenv
dotenv.config();

// Initialize services
const initializeConversationService = async () => {
  const result = await chatGptService.initialize();
  console.log('Conversation service initialization:', result ? 'SUCCESS' : 'FAILED');
  return result;
};

// Helper function to send message and get response
const sendMessage = async (text, contextData = {}) => {
  if (!chatGptService.isInitialized) {
    await chatGptService.initialize();
  }
  return chatGptService.sendMessage(text, contextData);
};

// Helper function to get conversation history
const getConversation = () => {
  return chatGptService.getConversation();
};

// Helper function to clear conversation
const clearConversation = async () => {
  return chatGptService.clearConversation();
};

module.exports = {
  chatGptService,
  conversationStore,
  OPENAI_CONFIG,
  initializeConversationService,
  sendMessage,
  getConversation,
  clearConversation
};