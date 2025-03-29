// src/utils/debuggers/openaiDebugger.js
const axios = require('axios');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

/**
 * Debug utility for testing OpenAI API connection
 */
class OpenAIDebugger {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.results = {
      apiKeyPresent: false,
      connectionSuccess: false,
      modelAvailable: false,
      responseTime: null,
      errors: []
    };
  }

  /**
   * Run all OpenAI API checks
   */
  async runChecks() {
    this.checkApiKey();
    
    if (this.results.apiKeyPresent) {
      await this.testConnection();
      await this.testModel();
    }
    
    return this.results;
  }

  /**
   * Check if API key is present
   */
  checkApiKey() {
    if (!this.apiKey) {
      this.results.errors.push('OPENAI_API_KEY not found in environment variables.');
      console.error('❌ OPENAI_API_KEY not found in environment variables.');
      return;
    }
    
    // OpenAI API keys should start with 'sk-'
    if (this.apiKey.startsWith('sk-')) {
      this.results.apiKeyPresent = true;
      const maskedKey = `${this.apiKey.substring(0, 5)}...${this.apiKey.substring(this.apiKey.length - 4)}`;
      console.log(`✅ OPENAI_API_KEY found: ${maskedKey}`);
    } else {
      this.results.errors.push('OPENAI_API_KEY has invalid format. Should start with "sk-".');
      console.error('❌ OPENAI_API_KEY has invalid format. Should start with "sk-".');
    }
  }

  /**
   * Test basic connection to the OpenAI API
   */
  async testConnection() {
    try {
      console.log('🔄 Testing connection to OpenAI API...');
      const startTime = Date.now();
      
      // Make a simple request to the models endpoint
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      const endTime = Date.now();
      this.results.responseTime = endTime - startTime;
      
      if (response.status === 200) {
        this.results.connectionSuccess = true;
        console.log(`✅ Successfully connected to OpenAI API (${this.results.responseTime}ms)`);
        
        // Log how many models are available
        if (response.data && response.data.data) {
          console.log(`ℹ️ ${response.data.data.length} models available`);
        }
      } else {
        this.results.errors.push(`API responded with status: ${response.status}`);
        console.error(`❌ API responded with status: ${response.status}`);
      }
    } catch (error) {
      this.results.errors.push(`Connection test failed: ${error.message}`);
      
      if (error.response) {
        // The request was made and the server responded with a non-2xx status
        console.error('❌ API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('❌ No response received. Network error or timeout.');
      } else {
        // Something happened in setting up the request
        console.error('❌ Error setting up request:', error.message);
      }
    }
  }

  /**
   * Test if the specific model we want to use is available
   */
  async testModel() {
    if (!this.results.connectionSuccess) {
      console.log('⏭️ Skipping model check due to failed connection test');
      return;
    }
    
    try {
      console.log('🔄 Testing model availability...');
      const modelToCheck = 'gpt-3.5-turbo'; // The model we use in the app
      
      const response = await axios.get(
        `https://api.openai.com/v1/models/${modelToCheck}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 5000
        }
      );
      
      if (response.status === 200) {
        this.results.modelAvailable = true;
        console.log(`✅ Model "${modelToCheck}" is available`);
      } else {
        this.results.errors.push(`Model check responded with status: ${response.status}`);
        console.error(`❌ Model check responded with status: ${response.status}`);
      }
    } catch (error) {
      this.results.errors.push(`Model check failed: ${error.message}`);
      
      if (error.response && error.response.status === 404) {
        console.error(`❌ Model "gpt-3.5-turbo" not found. It may be deprecated or unavailable.`);
      } else if (error.response) {
        console.error('❌ API Error:', error.response.status, error.response.data);
      } else {
        console.error('❌ Error checking model:', error.message);
      }
    }
  }

  /**
   * Test a simple chat completion to verify the API is working correctly
   */
  async testChatCompletion() {
    if (!this.results.connectionSuccess || !this.results.modelAvailable) {
      console.log('⏭️ Skipping chat completion test due to failed previous tests');
      return false;
    }
    
    try {
      console.log('🔄 Testing chat completion...');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say hello world' }],
          max_tokens: 20
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 15000
        }
      );
      
      if (response.status === 200 && 
          response.data && 
          response.data.choices && 
          response.data.choices.length > 0) {
        const message = response.data.choices[0].message.content;
        console.log(`✅ Chat completion successful. Response: "${message}"`);
        return true;
      } else {
        console.error('❌ Chat completion returned unexpected format:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Chat completion failed:', error.message);
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      }
      return false;
    }
  }

  /**
   * Print summary of results
   */
  printSummary() {
    console.log('\n--- OpenAI API Debug Summary ---');
    console.log(`API Key Present: ${this.results.apiKeyPresent ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Connection Success: ${this.results.connectionSuccess ? 'Yes ✅' : 'No ❌'}`);
    console.log(`Model Available: ${this.results.modelAvailable ? 'Yes ✅' : 'No ❌'}`);
    
    if (this.results.responseTime) {
      console.log(`Response Time: ${this.results.responseTime}ms`);
    }
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:');
      this.results.errors.forEach(error => console.log(` - ${error}`));
    }
    
    console.log('\nNext steps:');
    if (!this.results.apiKeyPresent) {
      console.log(' - Add your OpenAI API key to the .env file');
    } else if (!this.results.connectionSuccess) {
      console.log(' - Check your internet connection');
      console.log(' - Verify your API key is active and has sufficient credits');
    } else if (!this.results.modelAvailable) {
      console.log(' - Update the model in config.js to a supported model');
    } else {
      console.log(' - OpenAI API connection is working correctly! 🎉');
    }
    
    console.log('-------------------------------------------\n');
  }
}

// Create and export the debugger instance
const openaiDebugger = new OpenAIDebugger();

module.exports = { openaiDebugger };

// Allow running directly with Node.js
if (require.main === module) {
  openaiDebugger.runChecks().then(() => {
    openaiDebugger.printSummary();
    // Optionally test a chat completion
    if (process.argv.includes('--test-chat')) {
      openaiDebugger.testChatCompletion();
    }
  });
}