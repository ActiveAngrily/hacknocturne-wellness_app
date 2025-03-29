import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation';
import { COLORS } from './src/theme';

// Import conversation service
import * as ConversationService from './src/services';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Initialize app resources
    const initializeApp = async () => {
      try {
        // Reset conversation to ensure we have initial messages
        await ConversationService.resetConversation();
        console.log("Conversation service initialized");
      } catch (error) {
        console.error("Error initializing conversation:", error);
      }
      
      // Set app as ready
      setIsReady(true);
    };
    
    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background 
      }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ 
          marginTop: 20, 
          color: COLORS.text,
          fontSize: 16,
          fontWeight: '500'
        }}>
          Loading Orb...
        </Text>
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