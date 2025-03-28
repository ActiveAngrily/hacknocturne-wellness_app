import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation';

// Import service initializer
const { initializeConversationService } = require('./src/services/conversation');

export default function App() {
  // Initialize services on app startup
  useEffect(() => {
    const initServices = async () => {
      try {
        console.log('Initializing conversation service...');
        await initializeConversationService();
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };
    
    initServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}