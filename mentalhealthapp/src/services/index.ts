// Service index - choose which implementation to use

// Use mock service (for development without API key)
//export * from './mockConversationService';

// Use real OpenAI GPT service - commenting out to fix blank screen issue
export * from './realConversationService';