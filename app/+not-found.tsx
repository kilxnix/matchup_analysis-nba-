import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ThemedText';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Error boundary interface for type-safe error handling
 */
interface ErrorBoundaryProps {
  error: Error;
  resetError: () => void;
}

/**
 * Custom error types for specific handling
 */
enum ErrorType {
  NAVIGATION = 'NAVIGATION_ERROR',
  RESOURCE = 'RESOURCE_ERROR',
  NETWORK = 'NETWORK_ERROR'
}

/**
 * Error metadata for enhanced debugging
 */
interface ErrorMetadata {
  timestamp: number;
  type: ErrorType;
  path?: string;
  context?: Record<string, unknown>;
}

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Provide haptic feedback on error
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    );

    // Log error metadata for analytics
    const errorMetadata: ErrorMetadata = {
      timestamp: Date.now(),
      type: ErrorType.NAVIGATION,
      path: window.location?.pathname
    };

    console.error('Navigation Error:', errorMetadata);
  }, []);

  const handleRetry = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Gracefully handle haptics failure
      console.warn('Haptics not available:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Error - Page Not Found' }} />
      
      <View style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background }
      ]}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="error-outline"
            size={64}
            color={Colors[colorScheme].text}
          />
        </View>

        <Text style={styles.title}>Page Not Found</Text>
        
        <Text style={styles.description}>
          The requested resource could not be located. This could be due to:
        </Text>

        <View style={styles.reasonsContainer}>
          <Text style={styles.reason}>• Invalid navigation path</Text>
          <Text style={styles.reason}>• Expired or invalid game ID</Text>
          <Text style={styles.reason}>• Missing required permissions</Text>
        </View>

        <View style={styles.actionsContainer}>
          <Link href="/" asChild>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: Colors[colorScheme].tint }
              ]}
              onPress={handleRetry}
            >
              <Text style={styles.buttonText}>Return to Home</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: Colors[colorScheme].tint }
            ]}
            onPress={handleRetry}
          >
            <Text style={[
              styles.buttonText,
              { color: Colors[colorScheme].tint }
            ]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.errorId}>
          Error ID: {Buffer.from(Date.now().toString()).toString('base64').slice(0, 8)}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  reasonsContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  reason: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorId: {
    marginTop: 40,
    fontSize: 12,
    opacity: 0.5,
  },
});