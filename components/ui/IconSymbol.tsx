import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Path, Svg, Circle } from 'react-native-svg';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

/**
 * Icon path data type definition
 */
interface IconPathData {
  readonly d: string;
  readonly fillRule?: 'nonzero' | 'evenodd';
  readonly clipRule?: string;
  readonly strokeWidth?: number;
}

/**
 * Icon configuration interface
 */
interface IconConfig {
  readonly paths: IconPathData[];
  readonly width: number;
  readonly height: number;
  readonly viewBox: string;
  readonly circle?: {
    cx: number;
    cy: number;
    r: number;
  };
}

/**
 * Icon symbol component props interface
 */
interface IconSymbolProps {
  name: keyof typeof ICON_CONFIGS;
  size?: number;
  color?: string;
  style?: any;
  strokeWidth?: number;
}

/**
 * Icon configuration constants with optimized SVG paths
 */
const ICON_CONFIGS: { [key: string]: IconConfig } = {
  basketball: {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
        fillRule: 'evenodd',
      },
      {
        d: 'M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z',
        fillRule: 'evenodd',
      },
    ],
    circle: {
      cx: 12,
      cy: 12,
      r: 2,
    },
  },
  stats: {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
        fillRule: 'nonzero',
      },
    ],
  },
  analysis: {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
        fillRule: 'evenodd',
      },
    ],
  },
  team: {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    paths: [
      {
        d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
        fillRule: 'evenodd',
      },
    ],
  },
};

/**
 * Memoized icon symbol component for optimal rendering performance
 */
const IconSymbol: React.FC<IconSymbolProps> = memo(({ 
  name,
  size = 24,
  color,
  style,
  strokeWidth
}) => {
  const colorScheme = useColorScheme();
  const iconConfig = ICON_CONFIGS[name];

  // Memoize color calculations
  const iconColor = useMemo(() => {
    if (color) return color;
    return Colors[colorScheme].text;
  }, [color, colorScheme]);

  // Handle invalid icon names
  if (!iconConfig) {
    console.warn(`Icon "${name}" not found in configuration`);
    return null;
  }

  // Calculate scaled dimensions
  const scale = size / iconConfig.width;
  const scaledWidth = iconConfig.width * scale;
  const scaledHeight = iconConfig.height * scale;

  return (
    <View style={[styles.container, style]}>
      <Svg
        width={scaledWidth}
        height={scaledHeight}
        viewBox={iconConfig.viewBox}
        {...Platform.select({
          web: {
            style: { display: 'block' }
          }
        })}
      >
        {iconConfig.paths.map((pathData, index) => (
          <Path
            key={index}
            d={pathData.d}
            fill={iconColor}
            fillRule={pathData.fillRule || 'nonzero'}
            clipRule={pathData.clipRule}
            strokeWidth={strokeWidth || pathData.strokeWidth}
          />
        ))}
        {iconConfig.circle && (
          <Circle
            cx={iconConfig.circle.cx}
            cy={iconConfig.circle.cy}
            r={iconConfig.circle.r}
            fill={iconColor}
          />
        )}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Cache component name for dev tools
IconSymbol.displayName = 'IconSymbol';

export default IconSymbol;