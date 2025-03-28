// src/services/debugOpenAI.js
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.OPENAI_API_KEY;
console.log("API Key being used:", API_KEY ? "Key exists (last 4 chars: " + API_KEY.slice(-4) + ")" : "No key found");

const testOpenAIConnection = async () => {
  try {
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
        }
      }
    );
    console.log("API TEST SUCCESSFUL:", response.data);
    return true;
  } catch (error) {
    console.error("API TEST FAILED:", error.response ? error.response.data : error.message);
    return false;
  }
};

// Run the test when this file is executed directly
if (require.main === module) {
  console.log("Running direct OpenAI API test...");
  testOpenAIConnection()
    .then(result => {
      console.log("Test completed with result:", result ? "SUCCESS" : "FAILURE");
    })
    .catch(err => {
      console.error("Test error:", err);
    });
}

module.exports = { testOpenAIConnection };