// src/services/conversation/testChatGpt.js
// Load environment variables first
require('dotenv').config();

// Import services
const { chatGptService } = require('./chatGptService');

// Function to test ChatGPT service
const testChatGptService = async () => {
  console.log('Testing ChatGPT service...');
  
  // Step 1: Initialize service
  console.log('1. Initializing ChatGPT service...');
  const initResult = await chatGptService.initialize();
  console.log('   Initialization result:', initResult ? 'SUCCESS' : 'FAILED');
  
  // Print API key status (without revealing the key)
  console.log('   API Key status:', chatGptService.apiKey ? 'Present' : 'Missing');
  
  // Step 2: Send a test message
  console.log('2. Sending test message...');
  const testMessage = 'I\'ve been feeling a bit anxious lately with work and everything. Any suggestions?';
  console.log('   Message:', testMessage);
  
  try {
    const response = await chatGptService.sendMessage(testMessage, {
      healthData: {
        heartRate: 85,
        heartRateBaseline: 72,
        sleepHours: 5.5,
        sleepBaseline: 7.2,
        steps: 3000,
        stepsBaseline: 5500
      },
      userProfile: {
        name: 'Test User',
        age: 32
      }
    });
    
    console.log('   Response:', response);
    
    // Step 3: Get conversation
    console.log('3. Getting conversation history...');
    const conversation = chatGptService.getConversation();
    console.log('   Message count:', conversation.length);
    
    // Step 4: Clear conversation
    console.log('4. Clearing conversation...');
    await chatGptService.clearConversation();
    const clearedConversation = chatGptService.getConversation();
    console.log('   Message count after clearing:', clearedConversation.length);
    
    // Overall test result
    const testPassed = initResult && response && conversation.length > 2;
    console.log('\nOverall test result:', testPassed ? 'PASSED' : 'FAILED');
    return testPassed;
  } catch (error) {
    console.error('Error during test:', error);
    console.log('\nOverall test result: FAILED');
    return false;
  }
};

// Run the test
testChatGptService()
  .then(result => {
    console.log('Test completed with result:', result);
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });