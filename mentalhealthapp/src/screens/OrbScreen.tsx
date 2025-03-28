import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/index';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import OrbVisualization, { OrbState } from '../components/OrbVisualization';

// Import your services
const { sendMessage, getMessages } = require('../services/realConversationService');

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
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Handle Orb press to start/stop voice recognition
  const handleOrbPress = async () => {
    if (orbState === 'idle') {
      // Start listening simulation
      setOrbState('listening');
      
      // For hackathon demo: Simulate listening for 3 seconds then go to thinking
      setTimeout(() => {
        setOrbState('thinking');
        const simulatedTranscript = "I've been feeling anxious lately, any advice?";
        setTranscript(simulatedTranscript);
        processUserSpeech(simulatedTranscript);
      }, 3000);
      
    } else if (orbState === 'listening') {
      // Stop listening and process
      setOrbState('thinking');
      processUserSpeech("I'm feeling stressed with work deadlines, what can I do?");
      
    } else if (orbState === 'speaking') {
      // Stop speaking
      setOrbState('idle');
      setResponse('');
    } else {
      // If thinking, just go back to idle
      setOrbState('idle');
    }
  };
  
  // Process user speech and get AI response
  const processUserSpeech = async (text: string) => {
    try {
      setLoading(true);
      console.log('Processing speech:', text);
      
      // Send message to get AI response
      const updatedMessages = await sendMessage(text);
      
      // Get the most recent message (the Orb's response)
      if (updatedMessages && updatedMessages.length > 0) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage.sender === 'orb') {
          setResponse(lastMessage.text);
          // Start speaking the response
          speakOrbResponse(lastMessage.text);
        }
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      Alert.alert('Error', 'Failed to process your request. Please try again.');
      setOrbState('idle');
    } finally {
      setLoading(false);
    }
  };
  
  // Have the Orb speak the response
  const speakOrbResponse = (text: string) => {
    setOrbState('speaking');
    
    // For hackathon demo: Simulate speaking for a duration based on text length
    // Roughly 5 words per second for average speaking rate
    const words = text.split(' ').length;
    const speakingTimeMs = Math.max(3000, words * 200); // Minimum 3 seconds
    
    console.log(`Speaking response for ${speakingTimeMs}ms: "${text}"`);
    
    setTimeout(() => {
      setOrbState('idle');
      setResponse('');
    }, speakingTimeMs);
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
        
        {/* Response display when speaking */}
        {orbState === 'speaking' && response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}
        
        {/* Transcript display when processing */}
        {orbState === 'thinking' && transcript && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>You said:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}
        
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
            Swipe up for text chat
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
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  responseContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 16,
    margin: SPACING.medium,
    maxWidth: '80%',
    maxHeight: '30%',
  },
  responseText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  transcriptContainer: {
    backgroundColor: COLORS.userBubble,
    padding: SPACING.medium,
    borderRadius: 16,
    margin: SPACING.small,
    maxWidth: '80%',
  },
  transcriptLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.tiny,
  },
  transcriptText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontStyle: 'italic',
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
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default OrbScreen;