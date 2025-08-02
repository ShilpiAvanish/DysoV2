import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeStripe } from '@/lib/stripe';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Initialize Stripe only on native platforms
    if (Platform.OS !== 'web') {
      initializeStripe();
    }
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  // Only wrap with StripeProvider on native platforms
  if (Platform.OS === 'web') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="phone-verification" options={{ headerShown: false }} />
          <Stack.Screen name="verify-phone" options={{ headerShown: false }} />
          <Stack.Screen name="permissions" options={{ headerShown: false }} />
          <Stack.Screen name="setup-profile" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // Native platforms - use StripeProvider
  const { StripeProvider } = require('@stripe/stripe-react-native');
  
  return (
    <StripeProvider publishableKey={publishableKey}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="phone-verification" options={{ headerShown: false }} />
          <Stack.Screen name="verify-phone" options={{ headerShown: false }} />
          <Stack.Screen name="permissions" options={{ headerShown: false }} />
          <Stack.Screen name="setup-profile" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StripeProvider>
  );
}
