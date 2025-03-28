import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS, SPACING } from '../theme';

// Orb state types
export type OrbState = 'idle' | 'listening' | 'speaking' | 'thinking';

// Props interface for OrbVisualization
interface OrbVisualizationProps {
  state: OrbState;
  size?: 'small' | 'medium' | 'large';
  audioLevel?: number; // 0-1 value for audio visualization
  onPress?: () => void;
}

// OrbVisualization component
const OrbVisualization: React.FC<OrbVisualizationProps> = ({
  state,
  size = 'medium',
  audioLevel = 0,
  onPress,
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Get dimensions based on size prop
  const getOrbSize = () => {
    switch (size) {
      case 'small': return SPACING.orbSize.small;
      case 'large': return SPACING.orbSize.large;
      case 'medium':
      default: return SPACING.orbSize.medium;
    }
  };
  
  // Start animations based on state
  useEffect(() => {
    // Cancel any running animations
    pulseAnim.stopAnimation();
    scaleAnim.stopAnimation();
    waveAnim.stopAnimation();
    rotateAnim.stopAnimation();
    
    switch (state) {
      case 'idle':
        // Gentle pulsing animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            }),
            Animated.timing(pulseAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            })
          ])
        ).start();
        break;
        
      case 'listening':
        // Wave-like animation for listening
        Animated.loop(
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ).start();
        break;
        
      case 'speaking':
        // More pronounced animation for speaking
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 200,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            })
          ])
        ).start();
        break;
        
      case 'thinking':
        // Rotation animation for thinking state
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ).start();
        break;
    }
    
    // Cleanup animations when component unmounts or state changes
    return () => {
      pulseAnim.stopAnimation();
      scaleAnim.stopAnimation();
      waveAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [state]);
  
  // Update scale animation based on audio level (when listening)
  useEffect(() => {
    if (state === 'listening' && audioLevel > 0) {
      // Map audioLevel (0-1) to scale (1-1.3)
      const newScale = 1 + (audioLevel * 0.3);
      Animated.timing(scaleAnim, {
        toValue: newScale,
        duration: 100,
        useNativeDriver: true
      }).start();
    }
  }, [audioLevel, state]);
  
  // Animation interpolations
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });
  
  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6]
  });
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Get base size
  const orbSize = getOrbSize();
  
  // Calculate inner orbits for visualization
  const innerOrbSize = orbSize * 0.7;
  const innerOrbSize2 = orbSize * 0.5;
  
  // Get animation style based on current state
  const getAnimationStyle = () => {
    switch (state) {
      case 'idle':
        return {
          transform: [{ scale: pulseScale }]
        };
      case 'listening':
        return {
          opacity: waveOpacity,
          transform: [{ scale: scaleAnim }]
        };
      case 'speaking':
        return {
          transform: [{ scale: scaleAnim }]
        };
      case 'thinking':
        return {
          transform: [{ rotate: rotation }]
        };
      default:
        return {};
    }
  };
  
  // Get color based on state
  const getOrbColor = () => {
    switch (state) {
      case 'idle': return COLORS.primary;
      case 'listening': return COLORS.primaryLight;
      case 'speaking': return COLORS.primary;
      case 'thinking': return COLORS.primaryLight;
      default: return COLORS.primary;
    }
  };
  
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.orb, 
            { 
              width: orbSize, 
              height: orbSize,
              backgroundColor: getOrbColor()
            },
            getAnimationStyle()
          ]}
        >
          {/* Inner orbit for complex visualization */}
          <Animated.View 
            style={[
              styles.innerOrb,
              {
                width: innerOrbSize,
                height: innerOrbSize,
                backgroundColor: COLORS.primaryLight,
                opacity: 0.7
              }
            ]}
          >
            {/* Innermost orbit */}
            <Animated.View 
              style={[
                styles.innerOrb,
                {
                  width: innerOrbSize2,
                  height: innerOrbSize2,
                  backgroundColor: COLORS.textLight,
                  opacity: 0.9
                }
              ]}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    borderRadius: 999, // Make it round
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  innerOrb: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OrbVisualization;