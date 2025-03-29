// src/services/debugOpenAI.js
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
console.log("API Key being used:", API_KEY ? "Key exists (last 4 chars: " + API_KEY.slice(-4) + ")" : "No key found");

const testOpenAIConnection = async () => {
  try {
    // First, log the full request we're about to make (without the API key)
    console.log("Making request to: https://api.openai.com/v1/chat/completions");
    console.log("Request body:", {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10
    });
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // Use a guaranteed available model
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log("API TEST SUCCESSFUL");
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error("API TEST FAILED");
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
      console.error("Response headers:", JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
    }
    
    return false;
  }
};

// Run the test when this file is executed directly
if (require.main === module) {
  console.log("Running direct OpenAI API test...");
  testOpenAIConnection()
    .then(result => {
      console.log("Test completed with result:", result ? "SUCCESS" : "FAILURE");
      process.exit(result ? 0 : 1);
    })
    .catch(err => {
      console.error("Test error:", err);
      process.exit(1);
    });
}

module.exports = { testOpenAIConnection };