import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/index';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import OrbVisualization, { OrbState } from '../components/OrbVisualization';

// Import services from mock conversation service
import * as ConversationService from '../services/mockConversationService';

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Define props interface
type OrbScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Orb'>;
};

// OrbScreen component
const OrbScreen: React.FC<OrbScreenProps> = ({ navigation }) => {
  // State for the Orb
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  
  // Handle Orb press to start/stop voice recognition
  const handleOrbPress = async () => {
    // For testing purposes, we'll cycle through states
    // In a real implementation, this would use the speech service
    if (orbState === 'idle') {
      // Start listening
      setOrbState('listening');
      
      // For testing only - after 3 seconds, move to thinking state
      setTimeout(() => {
        setOrbState('thinking');
        processUserSpeech("I've been feeling anxious lately, any advice?");
      }, 3000);
      
    } else if (orbState === 'listening') {
      // Stop listening and process
      setOrbState('thinking');
      setTranscript("I've been feeling stressed at work lately.");
      processUserSpeech("I've been feeling stressed at work lately.");
      
    } else if (orbState === 'thinking') {
      // Just for testing - for real implementation, let it complete
      setOrbState('speaking');
    } else if (orbState === 'speaking') {
      // Stop speaking
      setOrbState('idle');
    }
  };
  
  // Process user speech and get AI response
  const processUserSpeech = async (text: string) => {
    try {
      // Send message to get AI response
      const updatedMessages = await ConversationService.sendMessage(text);
      
      // Get the most recent message (the Orb's response)
      if (updatedMessages && updatedMessages.length > 0) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage.sender === 'orb') {
          // Start speaking the response
          speakOrbResponse(lastMessage.text);
        }
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      setOrbState('idle');
    }
  };
  
  // Have the Orb speak the response
  const speakOrbResponse = (text: string) => {
    setOrbState('speaking');
    
    // For testing - after 5 seconds, go back to idle
    setTimeout(() => {
      setOrbState('idle');
    }, 5000);
  };
  
  // Go to chat screen
  const handleGoToChat = () => {
    navigation.navigate('Chat');
  };
  
  // Render guide text based on Orb state
  const renderGuideText = () => {
    switch (orbState) {
      case 'idle':
        return 'Tap Orb to start speaking';
      case 'listening':
        return 'Listening... Tap again when finished';
      case 'thinking':
        return 'Processing...';
      case 'speaking':
        return 'Orb is speaking... Tap to stop';
      default:
        return 'Tap Orb to start speaking';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* Guide text above Orb */}
        <Text style={styles.guideText}>
          {renderGuideText()}
        </Text>
        
        {/* Orb visualization */}
        <View style={styles.orbContainer}>
          <OrbVisualization
            state={orbState}
            size="large"
            onPress={handleOrbPress}
          />
        </View>
        
        {/* Swipe hint at bottom */}
        <TouchableOpacity 
          style={styles.swipeHintContainer}
          onPress={handleGoToChat}
        >
          <View style={styles.swipeHintBar} />
          <Text style={styles.swipeHintText}>
            Tap here for text chat
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xlarge,
  },
  orbContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    alignItems: 'center',
    paddingBottom: SPACING.medium,
  },
  swipeHintBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    marginBottom: SPACING.small,
  },
  swipeHintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
});

export default OrbScreen;