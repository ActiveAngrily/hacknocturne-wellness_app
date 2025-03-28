// Update src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import OrbScreen from '../screens/OrbScreen';
import ChatScreen from '../screens/ChatScreen';
import TestScreen from '../screens/TestScreen'; // Add this import

// Define the navigation parameters
export type RootStackParamList = {
  Orb: undefined;
  Chat: undefined;
  Test: undefined; // Add this type
};

// Create the stack navigator
const Stack = createStackNavigator<RootStackParamList>();

// Main navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Orb"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Orb" component={OrbScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Test" component={TestScreen} /> {/* Add this screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;