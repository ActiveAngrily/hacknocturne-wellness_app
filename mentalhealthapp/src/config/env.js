import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration
export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  // Add other environment variables as needed
};

// Validate required environment variables
export const validateEnv = () => {
  const missingVars = [];
  
  if (!ENV.OPENAI_API_KEY) {
    missingVars.push('OPENAI_API_KEY');
  }
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};