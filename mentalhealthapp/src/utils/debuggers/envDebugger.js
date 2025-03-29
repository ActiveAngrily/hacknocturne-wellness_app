// src/utils/debuggers/envDebugger.js
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

/**
 * Debug utility for checking environment configuration
 */
class EnvDebugger {
  constructor() {
    this.results = {
      envFile: false,
      apiKey: false,
      nodeEnv: process.env.NODE_ENV || 'development',
      errors: []
    };
  }

  /**
   * Run all environment checks
   */
  async runChecks() {
    this.checkEnvFile();
    this.checkApiKey();
    return this.results;
  }

  /**
   * Check if .env file exists
   */
  checkEnvFile() {
    try {
      const rootDir = process.cwd();
      const envPath = path.join(rootDir, '.env');
      
      if (fs.existsSync(envPath)) {
        this.results.envFile = true;
        console.log('✅ .env file found at:', envPath);
        
        // Check if dotenv loaded the file
        dotenv.config();
      } else {
        this.results.errors.push('No .env file found in project root.');
        console.error('❌ No .env file found at:', envPath);
      }
    } catch (error) {
      this.results.errors.push(`Error checking .env file: ${error.message}`);
      console.error('❌ Error checking .env file:', error);
    }
  }

  /**
   * Check if API key is available and valid format
   */
  checkApiKey() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        this.results.errors.push('OPENAI_API_KEY not found in environment variables.');
        console.error('❌ OPENAI_API_KEY not found in environment variables.');
        return;
      }
      
      // OpenAI API keys should start with 'sk-' and be 51 characters long
      if (apiKey.startsWith('sk-') && apiKey.length > 20) {
        this.results.apiKey = true;
        // Only show first and last few characters for security
        const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`;
        console.log(`✅ OPENAI_API_KEY found: ${maskedKey}`);
      } else {
        this.results.errors.push('OPENAI_API_KEY has invalid format. Should start with "sk-".');
        console.error('❌ OPENAI_API_KEY has invalid format. Should start with "sk-".');
      }
    } catch (error) {
      this.results.errors.push(`Error checking API key: ${error.message}`);
      console.error('❌ Error checking API key:', error);
    }
  }

  /**
   * Print summary of results
   */
  printSummary() {
    console.log('\n--- Environment & Configuration Debug Summary ---');
    console.log(`Environment: ${this.results.nodeEnv}`);
    console.log(`Env File Found: ${this.results.envFile ? 'Yes ✅' : 'No ❌'}`);
    console.log(`API Key Valid: ${this.results.apiKey ? 'Yes ✅' : 'No ❌'}`);
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:');
      this.results.errors.forEach(error => console.log(` - ${error}`));
    }
    
    console.log('\nNext steps:');
    if (!this.results.envFile) {
      console.log(' - Create a .env file in the project root directory');
    }
    if (!this.results.apiKey) {
      console.log(' - Add a valid OPENAI_API_KEY=your_key_here to your .env file');
    }
    
    console.log('-------------------------------------------\n');
  }
}

// Create and export the debugger instance
const envDebugger = new EnvDebugger();

module.exports = { envDebugger };

// Allow running directly with Node.js
if (require.main === module) {
  envDebugger.runChecks().then(() => {
    envDebugger.printSummary();
  });
}