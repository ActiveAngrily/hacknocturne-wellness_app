// src/services/realConversationService.js
import { 
  sendMessage as sendChatGptMessage, 
  getConversation, 
  clearConversation,
  initializeConversationService 
} from './conversation';
import { Message } from '../components/MessageBubble';

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
export const getMessages = async () => {
  await initialize();
  return getConversation();
};

// Send a message and get response
export const sendMessage = async (text) => {
  try {
    await initialize();
    
    // Send message with ChatGPT
    await sendChatGptMessage(text, {
      // You can add context data here from other services
      // For example:
      // healthData: {
      //   heartRate: 75,
      //   heartRateBaseline: 72,
      //   sleepHours: 7.5,
      //   sleepBaseline: 8
      // },
      // userProfile: {
      //   name: 'User',
      //   age: 30
      // }
    });
    
    // Return updated conversation
    return getConversation();
  } catch (error) {
    console.error('Error in realConversationService.sendMessage:', error);
    
    // Provide a fallback response if the service fails
    const errorMessage = {
      id: `error-${Date.now()}`,
      text: "I'm sorry, I'm having trouble connecting to my services. Could you try again in a moment?",
      sender: 'orb',
      timestamp: new Date()
    };
    
    return [...getConversation(), errorMessage];
  }
};

// Clear conversation
export const resetConversation = async () => {
  await initialize();
  await clearConversation();
};