// src/services/realConversationService.js
const { 
    sendMessage: sendChatGptMessage, 
    getConversation, 
    clearConversation: clearChatGptConversation,
    initializeConversationService
  } = require('./conversation');
  
  // Initialize the conversation service
  const initialize = async () => {
    console.log('Initializing real conversation service...');
    return await initializeConversationService();
  };
  
  // Get all messages
  const getMessages = async () => {
    console.log('Getting all messages...');
    // Initialize if needed
    if (!(await initialize())) {
      console.warn('Failed to initialize conversation service when getting messages');
    }
    const messages = getConversation();
    console.log(`Retrieved ${messages.length} messages`);
    return messages;
  };
  
  // Send a message and get response
  const sendMessage = async (text) => {
    console.log('Sending message:', text);
    
    // Initialize if needed
    if (!(await initialize())) {
      console.warn('Failed to initialize conversation service when sending message');
    }
    
    try {
      // Add context data from other modules if available
      const contextData = {};
      
      // If health data is available, add it
      // if (global.healthData) {
      //   contextData.healthData = global.healthData;
      // }
      
      // Send message with context
      console.log('Calling ChatGPT API...');
      const response = await sendChatGptMessage(text, contextData);
      console.log('Received response from ChatGPT:', response.substring(0, 50) + '...');
      
      // Return updated conversation
      const updatedMessages = getConversation();
      console.log(`Conversation now has ${updatedMessages.length} messages`);
      return updatedMessages;
    } catch (error) {
      console.error('Error in realConversationService.sendMessage:', error);
      throw error;
    }
  };
  
  // Clear conversation
  const resetConversation = async () => {
    console.log('Resetting conversation...');
    await clearChatGptConversation();
  };
  
  module.exports = {
    getMessages,
    sendMessage,
    resetConversation,
    initialize
  };