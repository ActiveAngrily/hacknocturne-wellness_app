import { conversationStore } from './conversationStore.js';

// Function to test conversation store
const testConversationStore = async () => {
  console.log('Testing conversation store...');
  
  // Step 1: Initialize store
  console.log('1. Initializing conversation store...');
  const initResult = await conversationStore.initialize();
  console.log('   Initialization result:', initResult ? 'SUCCESS' : 'FAILED');
  
  // Step 2: Check initial messages
  console.log('2. Checking initial messages...');
  const initialMessages = conversationStore.getMessages();
  console.log('   Initial message count:', initialMessages.length);
  console.log('   First message:', initialMessages[0]?.text);
  
  // Step 3: Add a user message
  console.log('3. Adding user message...');
  const userMessage = await conversationStore.addUserMessage('I\'ve been feeling anxious lately');
  console.log('   Added user message:', userMessage.text);
  
  // Step 4: Add an Orb message
  console.log('4. Adding Orb message...');
  const orbMessage = await conversationStore.addOrbMessage('I\'m sorry to hear you\'re feeling anxious. Would you like to try a breathing exercise?');
  console.log('   Added Orb message:', orbMessage.text);
  
  // Step 5: Check updated messages
  console.log('5. Checking updated messages...');
  const updatedMessages = conversationStore.getMessages();
  console.log('   Updated message count:', updatedMessages.length);
  
  // Step 6: Convert to ChatGPT format
  console.log('6. Converting to ChatGPT format...');
  const chatGptMessages = conversationStore.toChatGptMessages();
  console.log('   ChatGPT format message count:', chatGptMessages.length);
  console.log('   First message role:', chatGptMessages[0]?.role);
  
  // Step 7: Clear conversation
  console.log('7. Clearing conversation...');
  await conversationStore.clearConversation();
  const clearedMessages = conversationStore.getMessages();
  console.log('   Message count after clearing:', clearedMessages.length);
  
  // Overall test result
  const testPassed = initResult && updatedMessages.length === 3 && clearedMessages.length === 1;
  console.log('\nOverall test result:', testPassed ? 'PASSED' : 'FAILED');
  return testPassed;
};

// Run the test
testConversationStore()
  .then(result => {
    console.log('Test completed with result:', result);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  });