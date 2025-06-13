import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Platform, DimensionValue } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabBarBackgroundProps {
  height?: DimensionValue;
  blurIntensity?: number;
  translucent?: boolean;
  customBackground?: string;
}

/**
 * Performance optimization configurations
 */
const RENDER_OPTIMIZATIONS = {
  shouldComponentUpdate: true,
  maxBlurRadius: Platform.select({ ios: 20, android: 15 }),
  renderToHardwareTextureAndroid: true,
  androidRenderingMode: 'software' as const,
};

/**
 * Platform-specific visual configurations
 */
const PLATFORM_CONFIGS = {
  ios: {
    defaultBlurIntensity: 85,
    shadowRadius: 0.5,
    borderRadius: 0,
  },
  android: {
    defaultBlurIntensity: 65,
    elevationLevel: 4,
    borderRadius: 0,
  },
};

/**
 * Optimized TabBar background component with advanced visual effects
 */
const TabBarBackground: React.FC<TabBarBackgroundProps> = memo(({
  height,
  blurIntensity,
  translucent = true,
  customBackground,
}) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Memoize complex style calculations
  const containerStyle = useMemo(() => [
    styles.container,
    {
      height: height || (Platform.OS === 'ios' ? 49 + insets.bottom : 56),
      backgroundColor: customBackground || (translucent ? 'transparent' : Colors[colorScheme].tabBarBackground),
    },
    Platform.select({
      ios: styles.iosContainer,
      android: styles.androidContainer,
    }),
  ], [height, translucent, customBackground, colorScheme, insets.bottom]);

  // Memoize blur configuration
  const blurConfig = useMemo(() => ({
    intensity: blurIntensity || PLATFORM_CONFIGS[Platform.OS].defaultBlurIntensity,
    tint: colorScheme === 'dark' ? 'dark' : 'light',
  }), [blurIntensity, colorScheme]);

  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          containerStyle,
          styles.webContainer,
          { 
            backgroundColor: Colors[colorScheme].tabBarBackground,
            borderTopColor: Colors[colorScheme].tabBarBorder,
          }
        ]}
      />
    );
  }

  return (
    <View style={containerStyle}>
      {translucent && (
        <BlurView
          style={styles.blurView}
          {...blurConfig}
          {...RENDER_OPTIMIZATIONS}
        >
          <View 
            style={[
              styles.overlay,
              {
                backgroundColor: Colors[colorScheme].tabBarOverlay,
              }
            ]}
          />
        </BlurView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  iosContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: PLATFORM_CONFIGS.ios.shadowRadius,
  },
  androidContainer: {
    elevation: PLATFORM_CONFIGS.android.elevationLevel,
    backgroundColor: 'transparent',
  },
  webContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
});

// Cache component display name for development
TabBarBackground.displayName = 'TabBarBackground';

// Export optimization configurations for testing
export const _testExports = {
  RENDER_OPTIMIZATIONS,
  PLATFORM_CONFIGS,
};

export default TabBarBackground;