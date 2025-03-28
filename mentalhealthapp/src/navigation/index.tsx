import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// We'll import screens once we create them
import OrbScreen from '../screens/OrbScreen';
import ChatScreen from '../screens/ChatScreen';

// Define the navigation parameters
export type RootStackParamList = {
  Orb: undefined;
  Chat: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
