import { Platform } from 'react-native';
import IconSymbol from './IconSymbol';

/**
 * iOS-specific icon configurations
 */
const IOS_ICON_OVERRIDES = {
  basketball: {
    strokeWidth: 1.2,
    useSystemIcon: true,
  },
  stats: {
    useSystemIcon: true,
    systemName: 'chart.bar.fill',
  },
  analysis: {
    useSystemIcon: true,
    systemName: 'chart.line.uptrend.xyaxis',
  },
  team: {
    useSystemIcon: true,
    systemName: 'person.3.fill',
  },
};

/**
 * iOS-specific system icon props
 */
interface SystemIconProps {
  systemName: string;
  size?: number;
  color?: string;
  weight?: 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
}

// Export the base component for non-iOS platforms
export default Platform.select({
  ios: () => {
    // Dynamic import of iOS-specific icon component
    const { default: SystemIcon } = require('./SystemIcon');

    return ({ name, ...props }: IconSymbolProps) => {
      const override = IOS_ICON_OVERRIDES[name];

      if (override?.useSystemIcon) {
        return (
          <SystemIcon
            systemName={override.systemName || name}
            weight="semibold"
            {...props}
          />
        );
      }

      return <IconSymbol name={name} {...props} />;
    };
  },
  default: () => IconSymbol,
})();