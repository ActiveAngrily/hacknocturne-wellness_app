import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation';
import { COLORS } from './src/theme';

// Import the real conversation service
import * as RealConversationService from './src/services/realConversationService'; 
import { validateEnv } from './src/config/env';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initializingAPI, setInitializingAPI] = useState(true);

  useEffect(() => {
    // Initialize the conversation service with API key
    const initializeAPI = async () => {
      try {
        setInitializingAPI(true);

        // Validate environment variables
        const isValidEnv = validateEnv();
        if (!isValidEnv) {
          throw new Error('Invalid environment variables');
        }

        // Get OpenAI API key from environment
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        console.log("Initializing with API key:", OPENAI_API_KEY ? "Key exists" : "No key found");
        const initialized = await RealConversationService.initialize(OPENAI_API_KEY); 

        if (!initialized) {
          console.warn("Could not initialize conversation service");
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