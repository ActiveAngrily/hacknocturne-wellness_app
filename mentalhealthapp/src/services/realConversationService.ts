// src/services/realConversationService.ts
import { Message } from '../components/MessageBubble';

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial messages for the conversation
const initialMessages: Message[] = [
  {
    id: generateId(),
    text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
    sender: 'orb',
    timestamp: new Date()
  }
];

// In-memory message store (fallback for when API fails)
let messages = [...initialMessages];

// Track initialization status
let isInitialized = false;

/**
 * Initialize the conversation service with the OpenAI API key
 */
export const initialize = async (apiKey?: string): Promise<boolean> => {
  try {
    console.log('Initializing real conversation service');
    
    // For this fixed version, we'll just use an in-memory implementation
    // until you get the API key issue sorted out
    isInitialized = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize conversation service:', error);
    return false;
  }
};

/**
 * Get all messages from the conversation
 */
export const getMessages = async (): Promise<Message[]> => {
  // Simply return the in-memory messages
  return [...messages];
};

/**
 * Send a message and get response
 */
export const sendMessage = async (text: string): Promise<Message[]> => {
  try {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    messages.push(userMessage);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a simple response based on keywords
    const responseText = generateSimpleResponse(text);
    
    const orbResponse: Message = {
      id: generateId(),
      text: responseText,
      sender: 'orb',
      timestamp: new Date()
    };
    
    messages.push(orbResponse);
    
    return [...messages];
    
  } catch (error) {
    console.error('Error in realConversationService.sendMessage:', error);
    
    // Add error message response
    messages.push({
      id: generateId(),
      text: "I'm having trouble connecting to my services. Could you try again in a moment?",
      sender: 'orb',
      timestamp: new Date()
    });
    
    return [...messages];
  }
};

/**
 * Reset the conversation
 */
export const resetConversation = async (): Promise<void> => {
  try {
    messages = [...initialMessages];
  } catch (error) {
    console.error('Error resetting conversation:', error);
    // No need to throw, just log the error
  }
};

// Helper function for simple keyword-based responses
const generateSimpleResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
    return "Hello! How are you feeling today?";
  } else if (lowerCaseMessage.includes('anxious') || lowerCaseMessage.includes('anxiety')) {
    return "I understand feeling anxious can be difficult. Would you like to try a simple breathing exercise? Breathe in for 4 counts, hold for 7, and exhale for 8. This can help calm your nervous system.";
  } else if (lowerCaseMessage.includes('sad') || lowerCaseMessage.includes('depressed')) {
    return "I'm sorry to hear you're feeling down. Sometimes it helps to talk about what's bothering you or engage in an activity you enjoy. Would you like some suggestions?";
  } else if (lowerCaseMessage.includes('sleep') || lowerCaseMessage.includes('tired')) {
    return "Sleep is so important for mental health. Have you tried establishing a consistent bedtime routine? Reducing screen time before bed can also help improve sleep quality.";
  } else if (lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('overwhelmed')) {
    return "Being overwhelmed by stress is common. Have you tried breaking down your tasks into smaller, manageable steps? Sometimes making a list can help reduce that feeling of being overwhelmed.";
  } else {
    return "I'm here to support you. Can you tell me more about what you're experiencing right now?";
  }
};