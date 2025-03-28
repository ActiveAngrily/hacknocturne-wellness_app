import React, { useState } from 'react';
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
  
  // Handle Orb press to cycle through states (for testing)
  const handleOrbPress = () => {
    // Cycle through states: idle -> listening -> speaking -> thinking -> idle
    if (orbState === 'idle') {
      setOrbState('listening');
    } else if (orbState === 'listening') {
      setOrbState('speaking');
    } else if (orbState === 'speaking') {
      setOrbState('thinking');
    } else {
      setOrbState('idle');
    }
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
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default OrbScreen;
