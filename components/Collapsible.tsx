import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  LayoutChangeEvent,
  Platform,
  Easing,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

/**
 * Core interface specifications for Collapsible component
 */
interface CollapsibleProps {
  /**
   * Primary state controller for content visibility
   */
  collapsed: boolean;

  /**
   * Content to be rendered within collapsible container
   */
  children: React.ReactNode;

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;

  /**
   * Custom easing function for animation interpolation
   * @default Easing.inOut(Easing.cubic)
   */
  easing?: (value: number) => number;

  /**
   * Optional style overrides for container
   */
  style?: any;

  /**
   * Optional callback for animation completion
   */
  onAnimationComplete?: (collapsed: boolean) => void;

  /**
   * Enable hardware acceleration for animations
   * @default true
   */
  useNativeDriver?: boolean;
}

/**
 * Animation configuration constants
 */
const ANIMATION_CONFIGS = {
  defaultDuration: 300,
  minHeight: 0,
  maxOpacity: 1,
  minOpacity: 0,
  defaultEasing: Easing.inOut(Easing.cubic),
  nativeDriver: Platform.select({
    ios: true,
    android: true,
    default: false,
  }),
};

/**
 * Advanced collapsible component with optimized animation framework
 */
const Collapsible: React.FC<CollapsibleProps> = memo(({
  collapsed = false,
  children,
  duration = ANIMATION_CONFIGS.defaultDuration,
  easing = ANIMATION_CONFIGS.defaultEasing,
  style,
  onAnimationComplete,
  useNativeDriver = ANIMATION_CONFIGS.nativeDriver,
}) => {
  // Initialize animation controllers
  const animationHeight = useRef(new Animated.Value(ANIMATION_CONFIGS.minHeight));
  const animationOpacity = useRef(new Animated.Value(ANIMATION_CONFIGS.maxOpacity));
  const contentHeight = useRef<number>(0);

  // Optimization: Cache color scheme
  const colorScheme = useColorScheme();

  /**
   * Content measurement handler with error boundary
   */
  const handleLayoutChange = useCallback((event: LayoutChangeEvent) => {
    try {
      const { height } = event.nativeEvent.layout;
      contentHeight.current = height;
      
      if (!collapsed) {
        animationHeight.current.setValue(height);
      }
    } catch (error) {
      console.error('Layout measurement error:', error);
    }
  }, [collapsed]);

  /**
   * Animation orchestration framework
   */
  const initializeAnimation = useCallback(() => {
    const config = {
      duration,
      easing,
      useNativeDriver,
    };

    const heightValue = collapsed ? ANIMATION_CONFIGS.minHeight : contentHeight.current;
    const opacityValue = collapsed ? ANIMATION_CONFIGS.minOpacity : ANIMATION_CONFIGS.maxOpacity;

    return Animated.parallel([
      Animated.timing(animationHeight.current, {
        toValue: heightValue,
        ...config,
        useNativeDriver: false, // Height animations must use JS driver
      }),
      Animated.timing(animationOpacity.current, {
        toValue: opacityValue,
        ...config,
      }),
    ]);
  }, [collapsed, duration, easing, useNativeDriver]);

  /**
   * Animation lifecycle management
   */
  useEffect(() => {
    const animation = initializeAnimation();

    animation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete(collapsed);
      }
    });

    return () => {
      animation.stop();
    };
  }, [collapsed, initializeAnimation, onAnimationComplete]);

  /**
   * Render optimization wrapper
   */
  const renderContent = useCallback(() => (
    <View onLayout={handleLayoutChange} style={styles.measurementContainer}>
      {children}
    </View>
  ), [children, handleLayoutChange]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: animationHeight.current,
          opacity: animationOpacity.current,
          backgroundColor: Colors[colorScheme].background,
        },
        style,
      ]}
      pointerEvents={collapsed ? 'none' : 'auto'}
    >
      {renderContent()}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  measurementContainer: {
    position: 'absolute',
    width: '100%',
  },
});

// Development tooling support
Collapsible.displayName = 'Collapsible';

// Export configuration for testing purposes
export const _testExports = {
  ANIMATION_CONFIGS,
};

export default Collapsible;