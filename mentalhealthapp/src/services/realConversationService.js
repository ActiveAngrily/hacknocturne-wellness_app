// src/services/realConversationService.js
const { Message } = require('../components/MessageBubble');
const { 
  sendMessage: sendChatGptMessage, 
  getConversation, 
  clearConversation
} = require('./conversation');

// Get all messages
exports.getMessages = async () => {
  return getConversation();
};

// Send a message and get response
exports.sendMessage = async (text) => {
  // Send message with ChatGPT
  await sendChatGptMessage(text, {
    // You can add context data here from other services
    // For example, if you integrate with the health module:
    // healthData: healthService.getRecentData()
  });
  
  // Return updated conversation
  return getConversation();
};

// Clear conversation
exports.resetConversation = async () => {
  await clearConversation();
};