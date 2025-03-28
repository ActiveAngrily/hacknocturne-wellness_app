// src/services/conversation/conversationStore.js

// Check if we're in a Node.js environment (for testing) or React Native
const isNodeEnvironment = typeof window === 'undefined';

// Use the appropriate storage implementation
const AsyncStorage = isNodeEnvironment 
  ? require('./mockAsyncStorage')
  : require('@react-native-async-storage/async-storage').default;

// Keys for AsyncStorage
const STORAGE_KEYS = {
  CONVERSATION: 'mentalHealthApp_conversation',
};

// Default initial message from Orb
const DEFAULT_INITIAL_MESSAGE = {
  id: 'initial-message',
  text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
  sender: 'orb',
  timestamp: new Date()
};

// Class for managing conversation state and persistence
class ConversationStore {
  constructor() {
    this.messages = [DEFAULT_INITIAL_MESSAGE];
    this.isInitialized = false;
  }
  
  // Initialize the store
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      // Load conversation from storage
      await this.loadConversation();
      this.isInitialized = true;
      console.log('Conversation store initialized with', this.messages.length, 'messages');
      return true;
    } catch (error) {
      console.error('Error initializing conversation store:', error);
      // If loading fails, use default initial message
      this.messages = [DEFAULT_INITIAL_MESSAGE];
      this.isInitialized = true;
      return false;
    }
  }
  
  // Get all messages
  getMessages() {
    return [...this.messages];
  }
  
  // Get a limited number of recent messages
  getRecentMessages(count = 10) {
    return this.messages.slice(-count);
  }
  
  // Add a user message
  async addUserMessage(text) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    this.messages.push(message);
    await this.saveConversation();
    
    return message;
  }
  
  // Add an Orb (assistant) message
  async addOrbMessage(text) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const message = {
      id: `orb-${Date.now()}`,
      text,
      sender: 'orb',
      timestamp: new Date()
    };
    
    this.messages.push(message);
    await this.saveConversation();
    
    return message;
  }
  
  // Clear conversation history
  async clearConversation() {
    this.messages = [DEFAULT_INITIAL_MESSAGE];
    await this.saveConversation();
    return true;
  }
  
  // Convert messages to ChatGPT format
  toChatGptMessages() {
    return this.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  }
  
  // Save conversation to AsyncStorage
  async saveConversation() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONVERSATION,
        JSON.stringify(this.messages)
      );
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }
  
  // Load conversation from AsyncStorage
  async loadConversation() {
    try {
      const storedConversation = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATION);
      
      if (storedConversation) {
        // Parse stored messages
        const parsedMessages = JSON.parse(storedConversation);
        
        // Convert string dates back to Date objects
        this.messages = parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } else {
        // If no stored messages, use default
        this.messages = [DEFAULT_INITIAL_MESSAGE];
      }
      
      return true;
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.messages = [DEFAULT_INITIAL_MESSAGE];
      return false;
    }
  }
}

// Create and export singleton instance
const conversationStore = new ConversationStore();

module.exports = { conversationStore };