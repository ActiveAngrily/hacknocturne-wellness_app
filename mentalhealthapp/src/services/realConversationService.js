// src/services/realConversationService.js
const { 
  sendMessage: sendChatGptMessage, 
  getConversation, 
  clearConversation,
  initializeConversationService
} = require('./conversation');

// Track initialization status
let isInitialized = false;

// Initialize the service once
const initialize = async () => {
  if (!isInitialized) {
    try {
      isInitialized = await initializeConversationService();
      console.log('Real conversation service initialized:', isInitialized);
    } catch (error) {
      console.error('Failed to initialize conversation service:', error);
    }
  }
  return isInitialized;
};

// Get all messages
exports.getMessages = async () => {
  await initialize();
  return getConversation();
};

// Send a message and get response
exports.sendMessage = async (text) => {
  await initialize();
  
  // Send message with ChatGPT
  await sendChatGptMessage(text, {
    // You can add context data here from other services
    // healthData: {...},
    // userProfile: {...}
  });
  
  // Return updated conversation
  return getConversation();
};

// Clear conversation
exports.resetConversation = async () => {
  await initialize();
  await clearConversation();
};