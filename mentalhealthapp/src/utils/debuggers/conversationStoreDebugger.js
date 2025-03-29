// src/utils/debuggers/conversationDebugger.js
const { conversationStore } = require('../../services/conversation/conversationStore');

/**
 * Debug utility for testing the conversation store
 */
class ConversationDebugger {
  constructor() {
    this.results = {
      storeInitialized: false,
      addUserMessage: false,
      addOrbMessage: false,
      getMessages: false,
      clearConversation: false,
      errors: []
    };
  }

  /**
   * Run all conversation store checks
   */
  async runChecks() {
    await this.testInitialization();
    
    if (this.results.storeInitialized) {
      await this.testAddUserMessage();
      await this.testAddOrbMessage();
      await this.testGetMessages();
      await this.testChatGptFormat();
      await this.testClearConversation();
    }
    
    return this.results;
  }

  /**
   * Test conversation store initialization
   */
  async testInitialization() {
    try {
      console.log('🔄 Testing conversation store initialization...');
      
      // Test initialization
      const result = await conversationStore.initialize();
      
      if (result) {
        this.results.storeInitialized = true;
        console.log('✅ Conversation store initialized successfully');
        
        // Check if we have the welcome message
        const messages = conversationStore.getMessages();
        console.log(`ℹ️ Initial message count: ${messages.length}`);
        
        if (messages.length > 0) {
          console.log(`ℹ️ First message: "${messages[0].text}"`);
        }
      } else {
        this.results.errors.push('Conversation store initialization failed');
        console.error('❌ Conversation store initialization failed');
      }
    } catch (error) {
      this.results.errors.push(`Initialization test failed: ${error.message}`);
      console.error('❌ Error during initialization test:', error);
    }
  }

  /**
   * Test adding a user message
   */
  async testAddUserMessage() {
    try {
      console.log('🔄 Testing adding user message...');
      
      // Get initial message count
      const initialMessages = conversationStore.getMessages();
      const initialCount = initialMessages.length;
      
      // Add test message
      const testMessage = 'This is a test user message from the debugger';
      const message = await conversationStore.addUserMessage(testMessage);
      
      // Get updated messages
      const updatedMessages = conversationStore.getMessages();
      const newCount = updatedMessages.length;
      
      if (newCount === initialCount + 1) {
        this.results.addUserMessage = true;
        console.log(`✅ Successfully added user message. New count: ${newCount}`);
        
        // Check if the last message is our test message
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage.text === testMessage && lastMessage.sender === 'user') {
          console.log('✅ User message content verified');
        } else {
          console.warn('⚠️ User message content does not match expected value');
        }
      } else {
        this.results.errors.push('Failed to add user message. Count did not increase.');
        console.error('❌ Failed to add user message. Count did not increase.');
      }
    } catch (error) {
      this.results.errors.push(`Add user message test failed: ${error.message}`);
      console.error('❌ Error testing add user message:', error);
    }
  }

  /**
   * Test adding an Orb message
   */
  async testAddOrbMessage() {
    try {
      console.log('🔄 Testing adding Orb message...');
      
      // Get initial message count
      const initialMessages = conversationStore.getMessages();
      const initialCount = initialMessages.length;
      
      // Add test message
      const testMessage = 'This is a test Orb message from the debugger';
      const message = await conversationStore.addOrbMessage(testMessage);
      
      // Get updated messages
      const updatedMessages = conversationStore.getMessages();
      const newCount = updatedMessages.length;
      
      if (newCount === initialCount + 1) {
        this.results.addOrbMessage = true;
        console.log(`✅ Successfully added Orb message. New count: ${newCount}`);
        
        // Check if the last message is our test message
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage.text === testMessage && lastMessage.sender === 'orb') {
          console.log('✅ Orb message content verified');
        } else {
          console.warn('⚠️ Orb message content does not match expected value');
        }
      } else {
        this.results.errors.push('Failed to add Orb message. Count did not increase.');
        console.error('❌ Failed to add Orb message. Count did not increase.');
      }
    } catch (error) {
      this.results.errors.push(`Add Orb message test failed: ${error.message}`);
      console.error('❌ Error testing add Orb message:', error);
    }
  }

  /**
   * Test getting messages
   */
  async testGetMessages() {
    try {
      console.log('🔄 Testing getting messages...');
      
      const messages = conversationStore.getMessages();
      
      if (Array.isArray(messages) && messages.length > 0) {
        this.results.getMessages = true;
        console.log(`✅ Successfully retrieved ${messages.length} messages`);
        
        // Validate message structure
        const sampleMessage = messages[0];
        console.log('ℹ️ Sample message structure:', JSON.stringify(sampleMessage, null, 2));
        
        // Check if message has required fields
        const hasRequiredFields = 
          sampleMessage.id && 
          sampleMessage.text && 
          sampleMessage.sender && 
          sampleMessage.timestamp;
        
        if (hasRequiredFields) {
          console.log('✅ Message structure includes all required fields');
        } else {
          console.warn('⚠️ Message structure is missing required fields');
        }
      } else {
        this.results.errors.push('Failed to get messages or messages array is empty');
        console.error('❌ Failed to get messages or messages array is empty');
      }
    } catch (error) {
      this.results.errors.push(`Get messages test failed: ${error.message}`);
      console.error('❌ Error testing get messages:', error);
    }
  }

  /**
   * Test converting messages to ChatGPT format
   */
  async testChatGptFormat() {
    try {
      console.log('🔄 Testing ChatGPT format conversion...');
      
      const chatGptMessages = conversationStore.toChatGptMessages();
      
      if (Array.isArray(chatGptMessages) && chatGptMessages.length > 0) {
        console.log(`✅ Successfully converted ${chatGptMessages.length} messages to ChatGPT format`);
        
        // Validate format
        const sampleMessage = chatGptMessages[0];
        console.log('ℹ️ Sample ChatGPT format:', JSON.stringify(sampleMessage, null, 2));
        
        // Check if message has required fields for ChatGPT
        const hasRequiredFields = 
          sampleMessage.role && 
          (sampleMessage.role === 'user' || sampleMessage.role === 'assistant') && 
          sampleMessage.content;
        
        if (hasRequiredFields) {
          console.log('✅ ChatGPT message format is correct');
        } else {
          console.warn('⚠️ ChatGPT message format is missing required fields');
          this.results.errors.push('ChatGPT format is incorrect');
        }
      } else {
        this.results.errors.push('Failed to convert messages to ChatGPT format');
        console.error('❌ Failed to convert messages to ChatGPT format');
      }
    } catch (error) {
      this.results.errors.push(`ChatGPT format test failed: ${error.message}`);
      console.error('❌ Error testing ChatGPT format:', error);
    }
  }

  /**
   * Test clearing the conversation
   */
  async testClearConversation() {
    try {
      console.log('🔄 Testing clearing conversation...');
      
      // Clear the conversation
      await conversationStore.clearConversation();
      
      // Check if it was cleared correctly
      const messages = conversationStore.getMessages();
      
      // Should only have the initial message
      if (messages.length === 1) {
        this.results.clearConversation = true;
        console.log('✅ Successfully cleared conversation');
        console.log(`ℹ️ Remaining message: "${messages[0].text}"`);
      } else {
        this.results.errors.push(`Clear conversation failed. ${messages.length} messages remain.`);
        console.error(`❌ Clear conversation failed. ${messages.length} messages remain.`);
      }
    } catch (error) {
      this.results.errors.push(`Clear conversation test failed: ${error.message}`);
      console.error('❌ Error testing clear conversation:', error);
    }
  }

  /**
   * Print summary of results
   */
  printSummary() {
    console.log('\n--- Conversation Store Debug Summary ---');
    console.log(`Store Initialized: ${this.results.storeInitialized ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Add User Message: ${this.results.addUserMessage ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Add Orb Message: ${this.results.addOrbMessage ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Get Messages: ${this.results.getMessages ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Clear Conversation: ${this.results.clearConversation ? 'Yes ✅' : 'No ❌'}`);
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:');
      this.results.errors.forEach(error => console.log(` - ${error}`));
    }
    
    console.log('\nNext steps:');
    if (!this.results.storeInitialized) {
      console.log(' - Check the conversationStore implementation');
    } else if (!this.results.addUserMessage || !this.results.addOrbMessage) {
      console.log(' - Fix message adding functionality in conversationStore');
    } else if (!this.results.getMessages) {
      console.log(' - Fix message retrieval in conversationStore');
    } else if (!this.results.clearConversation) {
      console.log(' - Fix conversation clearing in conversationStore');
    } else {
      console.log(' - Conversation store is working correctly! 🎉');
    }
    
    console.log('-------------------------------------------\n');
  }
}

// Create and export the debugger instance
const conversationDebugger = new ConversationDebugger();

module.exports = { conversationDebugger };

// Allow running directly with Node.js
if (require.main === module) {
  conversationDebugger.runChecks().then(() => {
    conversationDebugger.printSummary();
  });
}