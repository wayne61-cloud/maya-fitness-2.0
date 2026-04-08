import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { configureApiClient } from "@/lib/api";
import {
  checkAndNotifyInactivity,
  recordActivity,
  requestNotificationPermission,
} from "@/utils/notifications";

SplashScreen.preventAutoHideAsync();

// Configure API client once at module load
configureApiClient();

const queryClient = new QueryClient();

function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) return null;

  const isOnLogin = segments[0] === "login";
  const isOnAdmin = segments[0] === "admin";
  const isAdminRole = user?.role === "admin" || user?.role === "moderator" || user?.role === "support";

  // Not logged in and not on login → redirect to login
  if (!user && !isOnLogin) return <Redirect href="/login" />;

  // Logged in admin on login page → send to admin
  if (user && isOnLogin && isAdminRole) return <Redirect href="/admin" />;

  // Logged in user on login page → send to app
  if (user && isOnLogin && !isAdminRole) return <Redirect href="/(tabs)" />;

  // Admin role on non-admin page → redirect to admin
  if (user && isAdminRole && !isOnAdmin) return <Redirect href="/admin" />;

  // Regular user on admin page → redirect to app
  if (user && !isAdminRole && isOnAdmin) return <Redirect href="/(tabs)" />;

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="runner"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="workout"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="yoga"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="nutrition"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="exercise/[id]"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Ionicons: require("../assets/fonts/Ionicons.ttf"),
    MaterialCommunityIcons: require("../assets/fonts/MaterialCommunityIcons.ttf"),
    Feather: require("../assets/fonts/Feather.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // PWA push notifications: request permission then check for inactivity
  useEffect(() => {
    (async () => {
      await recordActivity();
      const granted = await requestNotificationPermission();
      if (granted) await checkAndNotifyInactivity();
    })();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
