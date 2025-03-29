// web-adapter.js
// This file adapts the web frontend to work with the ChatGPT service

// Define a bridge for web environment
const WebChatService = {
    // Track initialization state
    initialized: false,
    apiKey: null,
    
    // Initial messages
    conversationHistory: [
        {
            id: 'initial-message',
            text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
            sender: 'orb',
            timestamp: new Date()
        }
    ],
    
    // Initialize the service
    async initialize(apiKey = null) {
        try {
            console.log('Initializing WebChatService...');
            
            // Try to load the API key from localStorage or parameter
            this.apiKey = apiKey || localStorage.getItem('openai_api_key');
            
            if (!this.apiKey) {
                console.warn('No API key found. Using mock responses.');
                return false;
            }
            
            // Make a test request to verify the API key
            const response = await this.testApiKey(this.apiKey);
            
            if (response.valid) {
                console.log('API key validated successfully');
                this.initialized = true;
                
                // Store the key
                localStorage.setItem('openai_api_key', this.apiKey);
                
                return true;
            } else {
                console.error('API key validation failed:', response.error);
                return false;
            }
        } catch (error) {
            console.error('Error initializing WebChatService:', error);
            return false;
        }
    },
    
    // Test if the API key is valid
    async testApiKey(apiKey) {
        try {
            // Make a minimal request to the OpenAI API
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            if (response.ok) {
                return { valid: true };
            } else {
                const errorData = await response.json();
                return { valid: false, error: errorData.error || 'Invalid API key' };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    },
    
    // Send a message to the ChatGPT API
    async sendMessage(message, context = {}) {
        // Add to the chat history regardless
        this.addUserMessage(message);
        
        try {
            if (!this.initialized || !this.apiKey) {
                // Use mock response if not initialized
                const mockResponse = this.generateMockResponse(message);
                this.addOrbMessage(mockResponse);
                return mockResponse;
            }
            
            console.log('Sending message to ChatGPT API...');
            
            // Prepare the system message with context
            const systemMessage = this.buildSystemMessage(context);
            
            // Get recent conversation messages for context
            const recentMessages = this.conversationHistory
                .slice(-10) // Last 10 messages for context
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }));
            
            // Prepare the messages array
            const messages = [
                { role: 'system', content: systemMessage },
                ...recentMessages
            ];
            
            // Make the API request
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 300,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.choices && data.choices.length > 0) {
                const responseText = data.choices[0].message.content;
                
                // Add the response to the conversation
                this.addOrbMessage(responseText);
                
                return responseText;
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('Error sending message to ChatGPT:', error);
            
            // Fallback to mock response
            const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. Let me try to help anyway. " + 
                this.generateMockResponse(message);
            
            // Add the fallback response to the conversation
            this.addOrbMessage(fallbackResponse);
            
            return fallbackResponse;
        }
    },
    
    // Add a user message to the conversation
    addUserMessage(text) {
        const message = {
            id: `user-${Date.now()}`,
            text,
            sender: 'user',
            timestamp: new Date()
        };
        
        this.conversationHistory.push(message);
        return message;
    },
    
    // Add an Orb message to the conversation
    addOrbMessage(text) {
        const message = {
            id: `orb-${Date.now()}`,
            text,
            sender: 'orb',
            timestamp: new Date()
        };
        
        this.conversationHistory.push(message);
        return message;
    },
    
    // Get all messages
    getMessages() {
        return [...this.conversationHistory];
    },
    
    // Clear conversation history except for the initial message
    clearConversation() {
        this.conversationHistory = [
            {
                id: 'initial-message',
                text: "Hello! I'm Orb, your mental health companion. How are you feeling today?",
                sender: 'orb',
                timestamp: new Date()
            }
        ];
        
        return true;
    },
    
    // Build system message with context data
    buildSystemMessage(context) {
        const { userProfile, healthData } = context;
        
        let systemMessage = `You are Orb, a mental health companion app. Your goal is to provide supportive, evidence-based guidance to help users manage their mental health.
  
GUIDELINES:
1. Be empathetic and supportive without making medical claims
2. If detecting signs of crisis, suggest professional help resources
3. For anxiety or stress, suggest evidence-based techniques like:
   - Breathing exercises (4-7-8 breathing, box breathing)
   - Grounding techniques (5-4-3-2-1 method)
   - Mindfulness practices
4. Keep responses concise (2-4 sentences) unless elaboration is requested
5. Never dismiss or minimize the user's feelings
6. Don't provide medical diagnoses or treatment recommendations
7. If suggesting physical activities, start with gentle options

In your responses, be warm, empathetic, and supportive. Use natural language that feels conversational and friendly.`;
        
        // Add user profile context if available
        if (userProfile) {
            systemMessage += `\n\nUSER PROFILE:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age || 'Unknown'}
- Mental health conditions: ${userProfile.conditions?.join(', ') || 'None specified'}`;
        }
        
        // Add health data context if available
        if (healthData) {
            systemMessage += `\n\nRECENT HEALTH DATA:
- Heart rate: ${healthData.heartRate ? `${healthData.heartRate} bpm (baseline: ${healthData.heartRateBaseline} bpm)` : 'Not available'}
- Sleep: ${healthData.sleepHours ? `${healthData.sleepHours} hours (baseline: ${healthData.sleepBaseline} hours)` : 'Not available'}`;
            
            // Add health insights if significant deviations
            if (healthData.heartRate && healthData.heartRateBaseline) {
                const heartRateChange = (healthData.heartRate / healthData.heartRateBaseline - 1) * 100;
                if (Math.abs(heartRateChange) > 15) {
                    systemMessage += `\n- Note: Heart rate is ${Math.abs(heartRateChange).toFixed(0)}% ${heartRateChange > 0 ? 'higher' : 'lower'} than baseline`;
                }
            }
            
            if (healthData.sleepHours && healthData.sleepBaseline) {
                const sleepChange = (healthData.sleepHours / healthData.sleepBaseline - 1) * 100;
                if (Math.abs(sleepChange) > 20) {
                    systemMessage += `\n- Note: Sleep is ${Math.abs(sleepChange).toFixed(0)}% ${sleepChange > 0 ? 'longer' : 'shorter'} than baseline`;
                }
            }
        }
        
        return systemMessage;
    },
    
    // Generate a mock response based on keywords (fallback method)
    generateMockResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        
        if (lowerCaseMessage.includes('suicide') || 
            lowerCaseMessage.includes('kill myself') || 
            lowerCaseMessage.includes('end my life')) {
            return "I'm concerned about what you're saying. Please reach out to a crisis helpline right away - they're available 24/7 at 988 (in the US). They're trained to help with these exact feelings. Would you like me to provide more resources?";
        }
        
        if (lowerCaseMessage.includes('anxious') || lowerCaseMessage.includes('anxiety')) {
            return "I understand anxiety can be difficult. Would it help to try a simple breathing exercise? Breathe in for 4 counts, hold for 7, and exhale for 8. This can help calm your nervous system.";
        }
        
        if (lowerCaseMessage.includes('sad') || lowerCaseMessage.includes('depress')) {
            return "I'm sorry to hear you're feeling this way. Sometimes it helps to talk about what's bothering you or engage in an activity you enjoy. Would you like some suggestions?";
        }
        
        if (lowerCaseMessage.includes('sleep') || lowerCaseMessage.includes('tired')) {
            return "Sleep is so important for mental health. Have you tried establishing a consistent bedtime routine? Reducing screen time before bed can also help improve sleep quality.";
        }
        
        if (lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('overwhelmed')) {
            return "Being overwhelmed by stress is common. Have you tried breaking down your tasks into smaller, manageable steps? Sometimes making a list can help reduce that feeling of being overwhelmed.";
        }
        
        // Default response
        return "I'm here to support you. Can you tell me more about what you're experiencing right now?";
    }
};

// Expose the service globally
window.WebChatService = WebChatService;

// Automatically initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Try to initialize with stored API key
    WebChatService.initialize().then(initialized => {
        console.log('WebChatService initialized:', initialized);
        
        // Hook up the send message functionality
        connectChatInterface();
    });
});

// Connect the chat interface to the service
function connectChatInterface() {
    // Get the chat input and send button
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message-btn');
    
    if (chatInput && sendButton) {
        // Handle enter key in input
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
        
        // Handle button click
        sendButton.addEventListener('click', sendChatMessage);
    }
    
    // Connect other chat-related elements
    wireUpChatInterface();
}

// Send a chat message
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        try {
            // Clear input
            input.value = '';
            
            // Set Orb to thinking state
            const orbVisual = document.getElementById('orb-visual');
            if (orbVisual) {
                orbVisual.className = 'orb thinking';
            }
            
            // Get context from user data
            const context = getUserContext();
            
            // Send the message
            await WebChatService.sendMessage(message, context);
            
            // Update the UI
            updateConversationDisplay();
            
            // Set Orb back to idle state
            if (orbVisual) {
                orbVisual.className = 'orb idle';
            }
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Handle error in UI
            const errorMessage = "I'm sorry, I'm having trouble processing your message. Could you try again?";
            WebChatService.addOrbMessage(errorMessage);
            updateConversationDisplay();
            
            // Reset Orb state
            if (orbVisual) {
                orbVisual.className = 'orb idle';
            }
        }
    }
}

// Get user context for message
function getUserContext() {
    // Get latest health data
    const latestHeartRate = window.biometricHistory
        ?.filter(reading => reading.type === 'heartRate')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    const latestSleep = window.biometricHistory
        ?.filter(reading => reading.type === 'sleepHours')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    return {
        userProfile: window.userProfile || {},
        healthData: {
            heartRate: latestHeartRate?.value,
            heartRateBaseline: window.userProfile?.baselineHeartRate || 72,
            sleepHours: latestSleep?.value,
            sleepBaseline: window.userProfile?.baselineSleep || 7.5
        }
    };
}

// Update the chat display
function updateConversationDisplay() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    // Get the messages
    const messages = WebChatService.getMessages();
    
    // Clear current messages
    messagesContainer.innerHTML = '';
    
    // Add messages to the container
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        
        // Format timestamp
        const timeAgo = formatTimeAgo(message.timestamp);
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message.text}</p>
            </div>
            <div class="message-time">${timeAgo}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Format time ago helper
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return new Date(date).toLocaleDateString();
}

// Wire up the chat interface elements
function wireUpChatInterface() {
    // Connect other chat-related functionality
    // This would be customized based on your specific UI
    
    // For example, connect the API key input if it exists
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    
    if (apiKeyInput && saveApiKeyButton) {
        // Set the current value if available
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
            apiKeyInput.value = storedKey;
        }
        
        // Handle saving the API key
        saveApiKeyButton.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                const initialized = await WebChatService.initialize(apiKey);
                if (initialized) {
                    alert('API key saved and validated successfully!');
                    // Close settings if needed
                    // ...
                } else {
                    alert('Invalid API key. Please check and try again.');
                }
            }
        });
    }
}