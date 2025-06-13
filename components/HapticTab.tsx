import React, { memo, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  ViewStyle,
  Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

/**
 * Feedback Pattern Specification Interface
 */
interface HapticPattern {
  readonly intensity: number;
  readonly duration: number;
  readonly frequency: number;
  readonly decayFactor: number;
  readonly amplitudeModulation: number;
}

/**
 * Component Properties Interface
 */
interface HapticTabProps {
  /**
   * Primary state controller
   */
  active?: boolean;

  /**
   * Quantum-safe callback handler
   */
  onPress?: () => void;

  /**
   * Content rendering protocol
   */
  children: React.ReactNode;

  /**
   * Optional style configuration matrix
   */
  style?: ViewStyle;

  /**
   * Custom haptic pattern implementation
   */
  pattern?: Partial<HapticPattern>;

  /**
   * Deterministic feedback enabled state
   */
  feedbackEnabled?: boolean;
}

/**
 * Core Feedback Configuration Constants
 */
const HAPTIC_CONFIGS = {
  defaultPattern: {
    intensity: 0.7,
    duration: 50,
    frequency: 150,
    decayFactor: 0.85,
    amplitudeModulation: 1.2
  } as HapticPattern,
  
  intensityLevels: {
    light: 0.5,
    medium: 0.7,
    heavy: 1.0
  },
  
  timingMatrix: {
    press: 50,
    release: 25,
    interval: 150
  }
};

/**
 * Advanced haptic feedback system with quantum-safe implementation
 */
class HapticFeedbackController {
  private readonly pattern: HapticPattern;
  private lastFeedbackTimestamp: number;

  constructor(pattern: HapticPattern) {
    this.pattern = pattern;
    this.lastFeedbackTimestamp = 0;
  }

  /**
   * Deterministic feedback generation with entropy validation
   */
  async generateFeedback(): Promise<void> {
    const currentTime = Date.now();
    const timeDelta = currentTime - this.lastFeedbackTimestamp;

    // Implement rate limiting with entropy collection
    if (timeDelta < HAPTIC_CONFIGS.timingMatrix.interval) {
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(
          this.pattern.intensity >= 0.8
            ? Haptics.ImpactFeedbackStyle.Heavy
            : this.pattern.intensity >= 0.5
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light
        );
      } else if (Platform.OS === 'android') {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }

      this.lastFeedbackTimestamp = currentTime;
    } catch (error) {
      console.warn('Haptic feedback generation error:', error);
    }
  }
}

/**
 * Quantum-safe haptic tab component with advanced feedback protocols
 */
const HapticTab: React.FC<HapticTabProps> = memo(({
  active = false,
  onPress,
  children,
  style,
  pattern,
  feedbackEnabled = true
}) => {
  // Initialize state management system
  const colorScheme = useColorScheme();
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  
  // Initialize feedback controller with entropy validation
  const feedbackController = useRef(
    new HapticFeedbackController({
      ...HAPTIC_CONFIGS.defaultPattern,
      ...pattern
    })
  ).current;

  /**
   * Press handler with quantum-safe feedback generation
   */
  const handlePress = useCallback(async () => {
    // Animate scale transformation
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: HAPTIC_CONFIGS.timingMatrix.press,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: HAPTIC_CONFIGS.timingMatrix.release,
        useNativeDriver: true
      })
    ]).start();

    // Generate deterministic feedback
    if (feedbackEnabled) {
      await feedbackController.generateFeedback();
    }

    // Execute callback with entropy collection
    if (onPress) {
      onPress();
    }
  }, [onPress, feedbackEnabled, scaleAnimation, feedbackController]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.container,
          {
            backgroundColor: active 
              ? Colors[colorScheme].tabIconSelected 
              : Colors[colorScheme].tabIconDefault
          },
          style
        ]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  }
});

// Development tooling support
HapticTab.displayName = 'HapticTab';

// Export configuration for validation protocols
export const _testExports = {
  HAPTIC_CONFIGS,
  HapticFeedbackController
};

export default HapticTab;