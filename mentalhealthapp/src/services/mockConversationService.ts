import { Message } from '../components/MessageBubble';

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial messages for the conversation
const initialMessages: Message[] = [
  {
    id: generateId(),
    text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
    sender: 'orb',
    timestamp: new Date(Date.now() - 60000) // 1 minute ago
  }
];

// Mock conversation state
let messages = [...initialMessages];

// Get all messages
export const getMessages = (): Message[] => {
  return [...messages];
};

// Add a user message and get an Orb response
export const sendMessage = async (text: string): Promise<Message[]> => {
  // Create a new user message
  const userMessage: Message = {
    id: generateId(),
    text,
    sender: 'user',
    timestamp: new Date()
  };
  
  // Add user message to the conversation
  messages.push(userMessage);
  
  // Generate a mock response based on keywords
  const responseText = generateResponse(text);
  
  // Create Orb response message
  const orbResponse: Message = {
    id: generateId(),
    text: responseText,
    sender: 'orb',
    timestamp: new Date()
  };
  
  // Add Orb response to the conversation
  messages.push(orbResponse);
  
  // Return updated messages
  return [...messages];
};

// Generate a response based on the user's message
const generateResponse = (userMessage: string): string => {
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

// Clear all messages except the initial ones
export const resetConversation = (): void => {
  messages = [...initialMessages];
};