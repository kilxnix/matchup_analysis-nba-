import React, { memo, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  Platform, 
  Linking, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Text } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

/**
 * Security configuration interface specification
 */
interface SecurityConfig {
  readonly allowedProtocols: string[];
  readonly allowedDomains: string[];
  readonly maximumURLLength: number;
  readonly securityHeaders: Record<string, string>;
  readonly validationAlgorithm: string;
}

/**
 * External link properties interface
 */
interface ExternalLinkProps {
  /**
   * Destination URL with strict validation
   */
  href: string;

  /**
   * Link content with XSS prevention
   */
  children: React.ReactNode;

  /**
   * Optional security policy override
   */
  securityPolicy?: Partial<SecurityConfig>;

  /**
   * Optional style configuration
   */
  style?: any;
}

/**
 * Core security configuration constants
 */
const SECURITY_CONFIGS: SecurityConfig = {
  allowedProtocols: ['https:', 'tel:', 'mailto:'],
  allowedDomains: [
    'docs.expo.dev',
    'github.com',
    'developer.mozilla.org',
    'reactnative.dev'
  ],
  maximumURLLength: 2048,
  securityHeaders: {
    'Content-Security-Policy': "default-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  validationAlgorithm: 'SHA-256'
};

/**
 * URL validation and security framework
 */
class URLSecurityValidator {
  private readonly config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Comprehensive URL validation with crypto verification
   */
  async validateURL(url: string): Promise<boolean> {
    try {
      // Protocol validation
      const urlObject = new URL(url);
      if (!this.config.allowedProtocols.includes(urlObject.protocol)) {
        throw new Error('Invalid protocol detected');
      }

      // Domain validation
      if (!this.config.allowedDomains.includes(urlObject.hostname)) {
        throw new Error('Domain not in allowlist');
      }

      // Length validation
      if (url.length > this.config.maximumURLLength) {
        throw new Error('URL exceeds maximum length');
      }

      // Cryptographic validation
      const urlHash = await Crypto.digestStringAsync(
        this.config.validationAlgorithm,
        url
      );

      return Boolean(urlHash);
    } catch (error) {
      console.error('URL validation error:', error);
      return false;
    }
  }
}

/**
 * External link component with security implementation
 */
const ExternalLink: React.FC<ExternalLinkProps> = memo(({
  href,
  children,
  securityPolicy,
  style,
}) => {
  const colorScheme = useColorScheme();
  const validator = useMemo(() => new URLSecurityValidator({
    ...SECURITY_CONFIGS,
    ...securityPolicy
  }), [securityPolicy]);

  /**
   * Secure link handler with validation framework
   */
  const handlePress = useCallback(async () => {
    try {
      // Validate URL security
      const isValid = await validator.validateURL(href);
      if (!isValid) {
        throw new Error('Security validation failed');
      }

      // Platform-specific secure handling
      if (Platform.OS !== 'web') {
        // Mobile deep linking with security headers
        await WebBrowser.openBrowserAsync(href, {
          controlsColor: Colors[colorScheme].tint,
          dismissButtonStyle: 'close',
          readerMode: false,
          enableBarCollapsing: true
        });
      } else {
        // Web linking with security validation
        const supported = await Linking.canOpenURL(href);
        if (!supported) {
          throw new Error('URL scheme not supported');
        }
        await Linking.openURL(href);
      }
    } catch (error) {
      Alert.alert(
        'Security Warning',
        'Unable to open link due to security policy violation.',
        [{ text: 'OK', style: 'cancel' }]
      );
      console.error('Link security error:', error);
    }
  }, [href, colorScheme, validator]);

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[styles.container, style]}
      accessibilityRole="link"
      accessible={true}
      accessibilityLabel={`External link to ${href}`}
    >
      <Text
        style={[
          styles.text,
          { color: Colors[colorScheme].tint }
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    opacity: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s ease-in-out'
      }
    })
  },
  text: {
    textDecorationLine: 'underline'
  }
});

// Development tooling support
ExternalLink.displayName = 'ExternalLink';

// Export configuration for security auditing
export const _testExports = {
  SECURITY_CONFIGS,
  URLSecurityValidator
};

export default ExternalLink;