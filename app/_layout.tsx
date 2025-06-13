import React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { Platform } from 'react-native';

/**
 * Layout configuration for the matchup analysis stack navigator.
 * Implements hierarchical navigation with type-safe route parameters.
 */
export default function MatchupLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
          ...Platform.select({
            ios: {
              shadowColor: Colors[colorScheme].text,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontFamily: 'SpaceMono-Regular',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        presentation: 'card',
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'NBA Matchup Analysis',
          headerLargeTitle: Platform.OS === 'ios',
          headerLargeTitleStyle: {
            fontFamily: 'SpaceMono-Regular',
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: 'Game Analysis',
          headerBackTitle: 'Back',
          presentation: 'modal',
          gestureEnabled: Platform.OS === 'ios',
          gestureResponseDistance: 350,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="historical/[teamId]"
        options={({ route }) => ({
          title: 'Historical Analysis',
          headerBackTitle: 'Back',
          presentation: 'card',
          animation: 'slide_from_bottom',
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="comparison/[gameId]"
        options={{
          title: 'Statistical Comparison',
          headerBackTitle: 'Back',
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

/**
 * Type declarations for route parameters
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '[id]': { id: string };
      'historical/[teamId]': { teamId: string };
      'comparison/[gameId]': { gameId: string };
    }
  }
}

/**
 * Route parameter type definitions
 */
export type MatchupRouteParams = {
  id: string;
  teamId: string;
  gameId: string;
};