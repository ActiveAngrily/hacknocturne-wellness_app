// src/utils/debuggers/chatGptServiceDebugger.js
const { chatGptService } = require('../../services/conversation/chatGptService');

/**
 * Debug utility for testing the ChatGPT service integration
 */
class ChatGptServiceDebugger {
  constructor() {
    this.results = {
      serviceInitialized: false,
      sendMessage: false,
      getConversation: false,
      clearConversation: false,
      responseTime: null,
      errors: []
    };
  }

  /**
   * Run all ChatGPT service checks
   */
  async runChecks() {
    await this.testInitialization();
    
    if (this.results.serviceInitialized) {
      await this.testSendMessage();
      await this.testGetConversation();
      await this.testClearConversation();
    }
    
    return this.results;
  }

  /**
   * Test ChatGPT service initialization
   */
  async testInitialization() {
    try {
      console.log('🔄 Testing ChatGPT service initialization...');
      
      // Test initialization
      const result = await chatGptService.initialize();
      
      if (result) {
        this.results.serviceInitialized = true;
        console.log('✅ ChatGPT service initialized successfully');
        
        // Check API key status
        console.log(`ℹ️ API Key available: ${chatGptService.apiKey ? 'Yes' : 'No'}`);
        console.log(`ℹ️ Model: ${chatGptService.model}`);
      } else {
        this.results.errors.push('ChatGPT service initialization failed');
        console.error('❌ ChatGPT service initialization failed');
      }
    } catch (error) {
      this.results.errors.push(`Initialization test failed: ${error.message}`);
      console.error('❌ Error during initialization test:', error);
      console.error(error);
    }
  }

  /**
   * Test sending a message
   */
  async testSendMessage() {
    try {
      console.log('🔄 Testing sending message to ChatGPT...');
      
      // Get initial conversation length
      const initialConversation = chatGptService.getConversation();
      const initialCount = initialConversation.length;
      
      // Test message
      const testMessage = 'Hello, this is a test message from the debugger. Please respond with a very short greeting.';
      
      // Measure response time
      const startTime = Date.now();
      
      // Send message
      const response = await chatGptService.sendMessage(testMessage);
      
      // Calculate response time
      const endTime = Date.now();
      this.results.responseTime = endTime - startTime;
      
      // Get updated conversation
      const updatedConversation = chatGptService.getConversation();
      const newCount = updatedConversation.length;
      
      if (newCount > initialCount && response) {
        this.results.sendMessage = true;
        console.log(`✅ Message sent successfully in ${this.results.responseTime}ms`);
        console.log(`ℹ️ Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
        
        // Check if conversation was updated
        if (newCount === initialCount + 2) { // User message + Orb response
          console.log('✅ Conversation updated correctly');
        } else {
          console.warn(`⚠️ Unexpected conversation length: ${newCount} (expected ${initialCount + 2})`);
        }
      } else {
        this.results.errors.push('Failed to send message or get response');
        console.error('❌ Failed to send message or get response');
      }
    } catch (error) {
      this.results.errors.push(`Send message test failed: ${error.message}`);
      console.error('❌ Error testing send message:', error);
      
      if (error.response) {
        console.error('API Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  /**
   * Test getting conversation
   */
  async testGetConversation() {
    try {
      console.log('🔄 Testing get conversation...');
      
      const conversation = chatGptService.getConversation();
      
      if (Array.isArray(conversation) && conversation.length > 0) {
        this.results.getConversation = true;
        console.log(`✅ Successfully retrieved ${conversation.length} messages`);
        
        // Validate message structure
        const sampleMessage = conversation[0];
        console.log('ℹ️ Sample message structure:', JSON.stringify(sampleMessage, null, 2));
        
        // Check if message has expected fields
        const hasExpectedFields = 
          sampleMessage.id && 
          sampleMessage.text && 
          sampleMessage.sender && 
          sampleMessage.timestamp;
        
        if (hasExpectedFields) {
          console.log('✅ Message structure has expected fields');
        } else {
          console.warn('⚠️ Message structure is missing expected fields');
        }
      } else {
        this.results.errors.push('Failed to get conversation or conversation is empty');
        console.error('❌ Failed to get conversation or conversation is empty');
      }
    } catch (error) {
      this.results.errors.push(`Get conversation test failed: ${error.message}`);
      console.error('❌ Error testing get conversation:', error);
    }
  }

  /**
   * Test clearing conversation
   */
  async testClearConversation() {
    try {
      console.log('🔄 Testing clear conversation...');
      
      // Add test messages if needed
      if (chatGptService.getConversation().length < 3) {
        await chatGptService.sendMessage('Adding a test message before clearing conversation');
      }
      
      // Get initial conversation
      const initialConversation = chatGptService.getConversation();
      const initialCount = initialConversation.length;
      
      // Clear conversation
      await chatGptService.clearConversation();
      
      // Get updated conversation
      const updatedConversation = chatGptService.getConversation();
      const newCount = updatedConversation.length;
      
      // Should only have 1 message (the initial message)
      if (newCount === 1 && initialCount > 1) {
        this.results.clearConversation = true;
        console.log('✅ Conversation cleared successfully');
        console.log(`ℹ️ Initial message: "${updatedConversation[0].text.substring(0, 50)}..."`);
      } else {
        this.results.errors.push(`Clear conversation failed. ${newCount} messages remain.`);
        console.error(`❌ Clear conversation failed. ${newCount} messages remain.`);
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
    console.log('\n--- ChatGPT Service Debug Summary ---');
    console.log(`Service Initialized: ${this.results.serviceInitialized ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Send Message: ${this.results.sendMessage ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Get Conversation: ${this.results.getConversation ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Clear Conversation: ${this.results.clearConversation ? 'Yes ✅' : 'No ❌'}`);
    
    if (this.results.responseTime) {
      console.log(`Response Time: ${this.results.responseTime}ms`);
    }
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:');
      this.results.errors.forEach(error => console.log(` - ${error}`));
    }
    
    console.log('\nNext steps:');
    if (!this.results.serviceInitialized) {
      console.log(' - Fix chatGptService initialization');
      console.log(' - Check if API key is properly set');
    } else if (!this.results.sendMessage) {
      console.log(' - Check sendMessage method in chatGptService');
      console.log(' - Verify API key has sufficient credits');
    } else if (!this.results.getConversation || !this.results.clearConversation) {
      console.log(' - Fix conversation management in chatGptService');
    } else {
      console.log(' - ChatGPT service is working correctly! 🎉');
    }
    
    console.log('-------------------------------------------\n');
  }
}

// Create and export the debugger instance
const chatGptServiceDebugger = new ChatGptServiceDebugger();

module.exports = { chatGptServiceDebugger };

// Allow running directly with Node.js
if (require.main === module) {
  chatGptServiceDebugger.runChecks().then(() => {
    chatGptServiceDebugger.printSummary();
  });
}