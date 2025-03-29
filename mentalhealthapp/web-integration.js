// web-integration.js
// This file connects the HTML/PHP frontend to the existing ChatGPT service

// Import conversation service for Node.js environment
const { chatGptService, conversationStore } = require('./src/services/conversation');

// Initialize global state
let isInitialized = false;
let userProfile = {
    name: '',
    age: null,
    conditions: [],
    lastAssessment: null,
    assessmentFrequency: 7, // days
    baselineHeartRate: 72,
    baselineSleep: 7.5,
    preferredCheckInTime: '09:00',
    checkInFrequency: 'daily',
    insightsEnabled: true
};

// Assessment history
let assessmentHistory = [];

// Biometric history 
let biometricHistory = [];

// Initialize system when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing NeuroSense Web Interface...');
    
    try {
        // Initialize ChatGPT service
        isInitialized = await chatGptService.initialize();
        console.log('ChatGPT service initialized:', isInitialized);
        
        // Load conversation history
        const messages = conversationStore.getMessages();
        conversationHistory = messages; // Set the global variable
        
        // Load user data from localStorage
        loadUserData();
        
        // Update UI with user data
        updateUI();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('NeuroSense Web Interface initialized successfully');
    } catch (error) {
        console.error('Error initializing NeuroSense Web Interface:', error);
        showNotification('Error', 'There was a problem initializing the application. Please try again later.');
    }
});

// ===== Data management functions =====
// Load user data from localStorage
function loadUserData() {
    try {
        // Load user profile
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            userProfile = JSON.parse(savedProfile);
            console.log('User profile loaded');
        }
        
        // Load assessment history
        const savedAssessments = localStorage.getItem('assessmentHistory');
        if (savedAssessments) {
            assessmentHistory = JSON.parse(savedAssessments);
            // Convert string dates back to Date objects
            assessmentHistory.forEach(assessment => {
                assessment.timestamp = new Date(assessment.timestamp);
            });
            console.log('Assessment history loaded');
        }
        
        // Load biometric history
        const savedBiometrics = localStorage.getItem('biometricHistory');
        if (savedBiometrics) {
            biometricHistory = JSON.parse(savedBiometrics);
            // Convert string dates back to Date objects
            biometricHistory.forEach(reading => {
                reading.timestamp = new Date(reading.timestamp);
            });
            console.log('Biometric history loaded');
        }
        
        // Load conversation history if not already loaded from conversationStore
        if (!conversationHistory || conversationHistory.length === 0) {
            const savedConversation = localStorage.getItem('conversationHistory');
            if (savedConversation) {
                conversationHistory = JSON.parse(savedConversation);
                // Convert string dates back to Date objects
                conversationHistory.forEach(message => {
                    message.timestamp = new Date(message.timestamp);
                });
                console.log('Conversation history loaded from localStorage');
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error', 'There was a problem loading your data.');
    }
}

// Save user data to localStorage
function saveUserData() {
    try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('assessmentHistory', JSON.stringify(assessmentHistory));
        localStorage.setItem('biometricHistory', JSON.stringify(biometricHistory));
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    } catch (error) {
        console.error('Error saving user data:', error);
        showNotification('Error', 'There was a problem saving your data.');
    }
}

// Add biometric reading
async function addBiometricReading(type, value, source = 'manual') {
    const reading = {
        type,
        value,
        source,
        timestamp: new Date()
    };
    
    biometricHistory.push(reading);
    saveUserData();
    
    // Update UI
    updateRecentActivity();
    updateBiometricDisplays();
    
    return reading;
}

// Add assessment result
async function addAssessmentResult(type, score, assessment, responses) {
    const result = {
        type,
        score,
        assessment,
        responses,
        timestamp: new Date()
    };
    
    assessmentHistory.push(result);
    userProfile.lastAssessment = new Date().toISOString();
    saveUserData();
    
    // Update UI
    updateRecentActivity();
    updateAssessmentHistory();
    updateDashboardMetrics();
    
    return result;
}

// Send chat message
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        try {
            // Add user message to conversation (for UI display)
            addMessageToConversation(message, 'user');
            
            // Clear input
            input.value = '';
            
            // Set Orb to thinking state
            const orbVisual = document.getElementById('orb-visual');
            if (orbVisual) {
                orbVisual.className = 'orb thinking';
            }
            
            // Send message to ChatGPT
            if (isInitialized) {
                // Use the context from user profile and biometrics
                const context = buildContextFromUserData();
                const response = await chatGptService.sendMessage(message, context);
                
                // Add Orb response to conversation
                addMessageToConversation(response, 'orb');
            } else {
                // Fallback to mock response if service isn't initialized
                const response = generateMockResponse(message);
                addMessageToConversation(response, 'orb');
            }
            
            // Set Orb back to idle state
            if (orbVisual) {
                orbVisual.className = 'orb idle';
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            addMessageToConversation("I'm sorry, I'm having trouble processing your message. Could you try again?", 'orb');
            
            if (orbVisual) {
                orbVisual.className = 'orb idle';
            }
        }
    }
}

// Build context from user data
function buildContextFromUserData() {
    // Get latest biometric readings
    const latestHeartRate = biometricHistory
        .filter(reading => reading.type === 'heartRate')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    const latestSleep = biometricHistory
        .filter(reading => reading.type === 'sleepHours')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    return {
        userProfile: {
            name: userProfile.name,
            age: userProfile.age,
            conditions: userProfile.conditions
        },
        healthData: {
            heartRate: latestHeartRate ? latestHeartRate.value : null,
            heartRateBaseline: userProfile.baselineHeartRate,
            sleepHours: latestSleep ? latestSleep.value : null,
            sleepBaseline: userProfile.baselineSleep
        }
    };
}

// Add message to conversation
function addMessageToConversation(text, sender) {
    const message = {
        id: `msg-${Date.now()}`,
        text,
        sender,
        timestamp: new Date()
    };
    
    // Add to conversation history
    conversationHistory.push(message);
    
    // If using the ChatGPT service, also sync with conversationStore
    if (isInitialized) {
        if (sender === 'user') {
            conversationStore.addUserMessage(text);
        } else {
            conversationStore.addOrbMessage(text);
        }
    }
    
    // Save user data
    saveUserData();
    
    // Update UI
    updateConversationDisplay();
}

// Generate a mock response (fallback)
function generateMockResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        return "Hello! How are you feeling today?";
    } else if (lowerCaseMessage.includes('anxious') || lowerCaseMessage.includes('anxiety')) {
        return "I understand feeling anxious can be difficult. Would you like to try a simple breathing exercise? Breathe in for 4 counts, hold for 7, and exhale for 8. This can help calm your nervous system.";
    } else if (lowerCaseMessage.includes('sad') || lowerCaseMessage.includes('depressed')) {
        return "I'm sorry to hear you're feeling down. Sometimes it helps to talk about what's bothering you or engage in an activity you enjoy. Would you like some suggestions?";
    } else if (lowerCaseMessage.includes('sleep') || lowerCaseMessage.includes('tired')) {
        return "Sleep is so important for mental health. Have you tried establishing a consistent bedtime routine? Reducing screen time before bed can also help improve sleep quality.";
    } else if (lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('overwhelmed')) {
        return "Being overwhelmed by stress is common. Have you tried breaking down your tasks into smaller, manageable steps? Sometimes making a list can help reduce that feeling of being overwhelmed.";
    } else {
        return "I'm here to support you. Can you tell me more about what you're experiencing right now?";
    }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addBiometricReading,
        addAssessmentResult,
        sendChatMessage,
        loadUserData,
        saveUserData
    };
}