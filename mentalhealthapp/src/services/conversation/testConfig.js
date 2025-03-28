// src/services/conversation/testConfig.js

const { OPENAI_CONFIG } = require('./config');

// Test function to verify config is loaded correctly
const testConfig = () => {
  // Check if config is loaded
  if (!OPENAI_CONFIG) {
    console.error('ERROR: Config not loaded');
    return false;
  }
  
  // Check required properties
  if (!OPENAI_CONFIG.apiKey) {
    console.error('ERROR: API key is missing in config');
    return false;
  }
  
  if (!OPENAI_CONFIG.model) {
    console.error('ERROR: Model is missing in config');
    return false;
  }
  
  if (!OPENAI_CONFIG.systemPrompt) {
    console.error('ERROR: System prompt is missing in config');
    return false;
  }
  
  console.log('ChatGPT config loaded successfully:');
  console.log('- Model:', OPENAI_CONFIG.model);
  console.log('- Max Tokens:', OPENAI_CONFIG.maxTokens);
  console.log('- Temperature:', OPENAI_CONFIG.temperature);
  
  return true;
};

// Run the test
const result = testConfig();
console.log('Config test result:', result ? 'PASSED' : 'FAILED');