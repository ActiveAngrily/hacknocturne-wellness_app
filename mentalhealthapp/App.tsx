// App.tsx
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import AppNavigator from './src/navigation';
import { COLORS } from './src/theme';

// Import directly from services/index.ts which handles both real and mock services
import * as ConversationService from './src/services';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initializingAPI, setInitializingAPI] = useState(true);

  useEffect(() => {
    // Initialize the conversation service
    const initializeAPI = async () => {
      try {
        setInitializingAPI(true);
        
        // Your OpenAI API key - for testing, hardcode here or use environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        
        console.log("Attempting to initialize with API key:", apiKey ? "Key exists" : "No key found");
        
        // This will try real service first and fall back to mock if needed
        const initialized = await ConversationService.initialize(apiKey);
        
        if (!initialized) {
          // We're already showing warnings in the console, no need to alert the user
          console.warn("Could not initialize conversation service with real API, using mock instead");
        }
      } catch (error) {
        console.error('Failed to initialize API:', error);
      } finally {
        setInitializingAPI(false);
      }
    };

    initializeAPI();

    // Simple timeout to ensure all components are loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || initializingAPI) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 20, color: COLORS.text }}>Loading Orb...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}