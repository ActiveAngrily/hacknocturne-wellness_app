// debug.js
// Main debugging script for Mental Health Companion App
require('dotenv').config();
const axios = require('axios');

// --- PHASE 1: Check Environment ---
async function checkEnvironment() {
  console.log("\n=== PHASE 1: ENVIRONMENT CHECK ===");
  
  try {
    // Check for .env file and API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ No OPENAI_API_KEY found in environment");
      console.log("   Create a .env file in the project root with your OpenAI API key:");
      console.log("   OPENAI_API_KEY=your_key_here");
      return false;
    }
    
    console.log("✅ OPENAI_API_KEY found in environment");
    
    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      console.error("❌ API key format is invalid. Should start with 'sk-'");
      return false;
    }
    
    console.log("✅ API key format looks valid");
    
    // Check Node.js environment
    console.log(`ℹ️ Node.js version: ${process.version}`);
    console.log(`ℹ️ NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    
    return true;
  } catch (error) {
    console.error("❌ Environment check failed with error:", error.message);
    return false;
  }
}

// --- PHASE 2: Test OpenAI API Connection ---
async function testOpenAIConnection() {
  console.log("\n=== PHASE 2: OPENAI API CONNECTION ===");
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Test if we can connect to OpenAI API
    console.log("🔄 Testing connection to OpenAI API...");
    
    // Start timer
    const startTime = Date.now();
    
    // Make a simple request to models endpoint
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 10000
    });
    
    // End timer
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status === 200) {
      console.log(`✅ Successfully connected to OpenAI API (${responseTime}ms)`);
      
      // Check if gpt-3.5-turbo is available
      console.log("🔄 Checking if model 'gpt-3.5-turbo' is available...");
      
      try {
        const modelResponse = await axios.get('https://api.openai.com/v1/models/gpt-3.5-turbo', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        if (modelResponse.status === 200) {
          console.log("✅ Model 'gpt-3.5-turbo' is available");
        }
      } catch (modelError) {
        if (modelError.response && modelError.response.status === 404) {
          console.error("❌ Model 'gpt-3.5-turbo' not found. It may have been renamed or deprecated.");
        } else {
          console.error("❌ Error checking model availability:", modelError.message);
        }
      }
      
      // Test a simple chat completion
      console.log("🔄 Testing chat completion API...");
      
      try {
        const completionResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Say "Debug successful"' }],
            max_tokens: 20
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            timeout: 10000
          }
        );
        
        if (completionResponse.status === 200 && completionResponse.data.choices) {
          const message = completionResponse.data.choices[0].message.content;
          console.log(`✅ Chat completion API working: "${message}"`);
          return true;
        } else {
          console.error("❌ Unexpected response from chat completion API:", completionResponse.data);
          return false;
        }
      } catch (completionError) {
        console.error("❌ Chat completion test failed:", completionError.message);
        if (completionError.response) {
          console.error("Error response:", completionError.response.data);
        }
        return false;
      }
    } else {
      console.error(`❌ API responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("❌ OpenAI API connection test failed:");
    
    if (error.response) {
      // The request was made and the server responded with a non-2xx status
      console.error(`Status: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received. Network error or timeout.");
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
    }
    
    return false;
  }
}

// --- PHASE 3: Test Configuration Module ---
async function testConfiguration() {
  console.log("\n=== PHASE 3: CONFIGURATION MODULE ===");
  
  try {
    // Import the config module
    const { OPENAI_CONFIG, setApiKey } = require('./src/services/conversation/config');
    
    console.log("🔄 Checking configuration settings...");
    
    // Check required properties
    if (!OPENAI_CONFIG) {
      console.error("❌ OPENAI_CONFIG object is missing");
      return false;
    }
    
    const requiredProps = ['apiKey', 'model', 'maxTokens', 'temperature', 'systemPrompt'];
    const missingProps = requiredProps.filter(prop => !OPENAI_CONFIG.hasOwnProperty(prop));
    
    if (missingProps.length > 0) {
      console.error(`❌ Missing required properties in OPENAI_CONFIG: ${missingProps.join(', ')}`);
      return false;
    }
    
    console.log("✅ OPENAI_CONFIG has all required properties");
    
    // Log configuration details
    console.log("ℹ️ Configuration details:");
    console.log(`   - API Key: ${OPENAI_CONFIG.apiKey ? 'Set' : 'Not set'}`);
    console.log(`   - Model: ${OPENAI_CONFIG.model}`);
    console.log(`   - Max Tokens: ${OPENAI_CONFIG.maxTokens}`);
    console.log(`   - Temperature: ${OPENAI_CONFIG.temperature}`);
    console.log(`   - System Prompt length: ${OPENAI_CONFIG.systemPrompt.length} chars`);
    
    // Test setApiKey function
    console.log("🔄 Testing setApiKey function...");
    const testApiKey = 'sk-test123456789';
    const result = setApiKey(testApiKey);
    
    if (result && OPENAI_CONFIG.apiKey === testApiKey) {
      console.log("✅ setApiKey function works correctly");
    } else {
      console.error("❌ setApiKey function failed");
      return false;
    }
    
    // Restore original API key
    OPENAI_CONFIG.apiKey = process.env.OPENAI_API_KEY;
    
    return true;
  } catch (error) {
    console.error("❌ Configuration test failed:", error.message);
    console.error(error);
    return false;
  }
}

// --- PHASE 4: Test Conversation Store ---
async function testConversationStore() {
  console.log("\n=== PHASE 4: CONVERSATION STORE ===");
  
  try {
    // Import the conversation store
    const { conversationStore } = require('./src/services/conversation/conversationStore');
    
    console.log("🔄 Testing conversation store initialization...");
    const initialized = await conversationStore.initialize();
    
    if (!initialized) {
      console.error("❌ Conversation store initialization failed");
      return false;
    }
    
    console.log("✅ Conversation store initialized successfully");
    
    // Test getting messages
    const initialMessages = conversationStore.getMessages();
    console.log(`ℹ️ Initial messages: ${initialMessages.length}`);
    
    if (initialMessages.length === 0) {
      console.warn("⚠️ No initial messages found. Expected at least welcome message.");
    }
    
    // Test adding a user message
    console.log("🔄 Testing adding user message...");
    const userMessage = await conversationStore.addUserMessage(
      "This is a test message from the debugger"
    );
    
    if (!userMessage) {
      console.error("❌ Failed to add user message");
      return false;
    }
    
    console.log("✅ User message added successfully");
    
    // Test adding an Orb message
    console.log("🔄 Testing adding Orb message...");
    const orbMessage = await conversationStore.addOrbMessage(
      "This is a test response from the debugger"
    );
    
    if (!orbMessage) {
      console.error("❌ Failed to add Orb message");
      return false;
    }
    
    console.log("✅ Orb message added successfully");
    
    // Test ChatGPT format conversion
    console.log("🔄 Testing ChatGPT format conversion...");
    const chatGptMessages = conversationStore.toChatGptMessages();
    
    if (!Array.isArray(chatGptMessages)) {
      console.error("❌ ChatGPT format conversion failed");
      return false;
    }
    
    console.log(`✅ ChatGPT format conversion successful: ${chatGptMessages.length} messages`);
    
    // Verify correct format
    const lastMessage = chatGptMessages[chatGptMessages.length - 1];
    if (lastMessage.role !== 'assistant' || !lastMessage.content) {
      console.warn("⚠️ Last message format may be incorrect:", lastMessage);
    }
    
    // Test clearing conversation
    console.log("🔄 Testing clearing conversation...");
    const cleared = await conversationStore.clearConversation();
    
    if (!cleared) {
      console.error("❌ Failed to clear conversation");
      return false;
    }
    
    const messagesAfterClear = conversationStore.getMessages();
    console.log(`✅ Conversation cleared. Remaining messages: ${messagesAfterClear.length}`);
    
    if (messagesAfterClear.length !== 1) {
      console.warn("⚠️ Expected 1 message after clearing (welcome message)");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Conversation store test failed:", error.message);
    console.error(error);
    return false;
  }
}

// --- PHASE 5: Test ChatGPT Service ---
async function testChatGptService() {
  console.log("\n=== PHASE 5: CHATGPT SERVICE ===");
  
  try {
    // Import the ChatGPT service
    const { chatGptService } = require('./src/services/conversation/chatGptService');
    
    console.log("🔄 Testing ChatGPT service initialization...");
    const initialized = await chatGptService.initialize();
    
    if (!initialized) {
      console.error("❌ ChatGPT service initialization failed");
      return false;
    }
    
    console.log("✅ ChatGPT service initialized successfully");
    console.log(`ℹ️ Using model: ${chatGptService.model}`);
    
    // Test sending a message
    console.log("🔄 Testing sending a message...");
    const testMessage = "Hello, this is a test message from the debugger. Please respond with a brief greeting.";
    
    console.time("ChatGPT Response Time");
    const response = await chatGptService.sendMessage(testMessage);
    console.timeEnd("ChatGPT Response Time");
    
    if (!response) {
      console.error("❌ Failed to get response from ChatGPT");
      return false;
    }
    
    console.log(`✅ Received response from ChatGPT: "${response}"`);
    
    // Test getting conversation
    console.log("🔄 Testing getting conversation...");
    const conversation = chatGptService.getConversation();
    
    if (!Array.isArray(conversation)) {
      console.error("❌ Failed to get conversation");
      return false;
    }
    
    console.log(`✅ Got conversation with ${conversation.length} messages`);
    
    // Test clearing conversation
    console.log("🔄 Testing clearing conversation...");
    await chatGptService.clearConversation();
    
    const clearedConversation = chatGptService.getConversation();
    console.log(`✅ Cleared conversation. Remaining messages: ${clearedConversation.length}`);
    
    return true;
  } catch (error) {
    console.error("❌ ChatGPT service test failed:", error.message);
    console.error(error);
    return false;
  }
}

// --- PHASE 6: Test Full Integration ---
async function testFullIntegration() {
  console.log("\n=== PHASE 6: FULL INTEGRATION ===");
  
  try {
    // Import the service used by the app
    const ConversationService = require('./src/services');
    
    console.log("🔄 Testing service initialization...");
    const initialized = await ConversationService.initialize(process.env.OPENAI_API_KEY);
    
    if (!initialized) {
      console.warn("⚠️ Service initialization returned false, but continuing with test");
    } else {
      console.log("✅ Service initialized successfully");
    }
    
    // Get initial messages
    console.log("🔄 Getting initial messages...");
    const initialMessages = await ConversationService.getMessages();
    
    if (!Array.isArray(initialMessages)) {
      console.error("❌ Failed to get initial messages");
      return false;
    }
    
    console.log(`✅ Got ${initialMessages.length} initial messages`);
    
    // Send a test message
    console.log("🔄 Sending test message...");
    const testMessage = "Hello, this is an integration test. Please respond with a brief greeting.";
    
    console.time("Full Integration Response Time");
    const updatedMessages = await ConversationService.sendMessage(testMessage);
    console.timeEnd("Full Integration Response Time");
    
    if (!Array.isArray(updatedMessages)) {
      console.error("❌ Failed to get updated messages after sending");
      return false;
    }
    
    console.log(`✅ Got ${updatedMessages.length} messages after sending`);
    
    // Get last message to see response
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    console.log(`ℹ️ Last message (${lastMessage.sender}): "${lastMessage.text}"`);
    
    // Reset conversation
    console.log("🔄 Resetting conversation...");
    await ConversationService.resetConversation();
    console.log("✅ Conversation reset");
    
    return true;
  } catch (error) {
    console.error("❌ Full integration test failed:", error.message);
    console.error(error);
    return false;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log("=== MENTAL HEALTH APP DEBUGGING ===");
  console.log("Date:", new Date().toLocaleString());
  console.log("Testing ChatGPT integration pipeline\n");
  
  // Record results of each phase
  const results = {
    environment: false,
    openai: false,
    config: false,
    store: false,
    service: false,
    integration: false
  };
  
  try {
    // Phase 1: Environment Check
    results.environment = await checkEnvironment();
    if (!results.environment) {
      console.log("\n❌ Environment check failed. Fix these issues before continuing.");
      return printSummary(results);
    }
    
    // Phase 2: OpenAI API Connection
    results.openai = await testOpenAIConnection();
    if (!results.openai) {
      console.log("\n❌ OpenAI API connection test failed. Check your API key and internet connection.");
      return printSummary(results);
    }
    
    // Phase 3: Configuration Module
    results.config = await testConfiguration();
    if (!results.config) {
      console.log("\n❌ Configuration test failed. Check the configuration module.");
      return printSummary(results);
    }
    
    // Phase 4: Conversation Store
    results.store = await testConversationStore();
    if (!results.store) {
      console.log("\n❌ Conversation store test failed. Check the conversation store implementation.");
      return printSummary(results);
    }
    
    // Phase 5: ChatGPT Service
    results.service = await testChatGptService();
    if (!results.service) {
      console.log("\n❌ ChatGPT service test failed. Check the ChatGPT service implementation.");
      return printSummary(results);
    }
    
    // Phase 6: Full Integration
    results.integration = await testFullIntegration();
    if (!results.integration) {
      console.log("\n❌ Full integration test failed. Check how services are integrated.");
      return printSummary(results);
    }
    
    return printSummary(results);
  } catch (error) {
    console.error("\n❌ Fatal error during debugging:", error);
    return printSummary(results);
  }
}

// Print test summary and next steps
function printSummary(results) {
  console.log("\n=== DEBUG SUMMARY ===");
  console.log(`Environment Check: ${results.environment ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`OpenAI API Connection: ${results.openai ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Configuration Module: ${results.config ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Conversation Store: ${results.store ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`ChatGPT Service: ${results.service ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Full Integration: ${results.integration ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log("\n=== NEXT STEPS ===");
  if (!results.environment) {
    console.log("1. Create or update .env file with a valid OpenAI API key");
    console.log("2. Make sure dotenv is correctly set up");
  } else if (!results.openai) {
    console.log("1. Check your OpenAI API key is active and has credits");
    console.log("2. Verify your internet connection");
    console.log("3. Check if OpenAI is having service issues");
  } else if (!results.config) {
    console.log("1. Fix the configuration module in src/services/conversation/config.js");
    console.log("2. Ensure all required properties are present");
  } else if (!results.store) {
    console.log("1. Fix the conversation store implementation");
    console.log("2. Check AsyncStorage integration");
  } else if (!results.service) {
    console.log("1. Fix the ChatGPT service implementation");
    console.log("2. Ensure proper error handling is in place");
  } else if (!results.integration) {
    console.log("1. Fix how services are integrated together");
    console.log("2. Check the service index file (src/services/index.ts)");
  } else {
    console.log("✅ All tests passed! The ChatGPT integration is working correctly.");
    console.log("You can now run the app and it should work with the real ChatGPT API.");
  }
  
  console.log("\n=== END OF DEBUG REPORT ===");
}

// Start the tests
runAllTests();