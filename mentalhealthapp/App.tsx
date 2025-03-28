import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation';
import { COLORS } from './src/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple timeout to ensure all components are loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
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