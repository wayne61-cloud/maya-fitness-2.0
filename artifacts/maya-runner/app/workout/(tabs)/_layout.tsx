import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const WORKOUT_ORANGE = "#FF8C00";

export default function WorkoutTabLayout() {
  const colors = useColors();
  const { workoutOnboarding, setWorkoutOnboarding } = useApp();
  const { user } = useAuth();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();
  const [onboardingResolved, setOnboardingResolved] = useState(false);
  const [hasWorkoutOnboarding, setHasWorkoutOnboarding] = useState(false);

  useEffect(() => {
    let active = true;

    async function resolveOnboarding() {
      if (workoutOnboarding) {
        if (!active) return;
        setHasWorkoutOnboarding(true);
        setOnboardingResolved(true);
        return;
      }

      if (!user?.id) {
        if (!active) return;
        setHasWorkoutOnboarding(false);
        setOnboardingResolved(false);
        return;
      }

      try {
        const storageKey = `@maya_${user.id}_workoutOnboarding`;
        const [storedOnboarding, legacyOnboarding] = await Promise.all([
          AsyncStorage.getItem(storageKey),
          AsyncStorage.getItem("workoutOnboarding"),
        ]);
        if (!active) return;

        const resolvedOnboarding = storedOnboarding ?? legacyOnboarding;
        const hasStoredOnboarding = Boolean(resolvedOnboarding);

        if (!storedOnboarding && legacyOnboarding) {
          AsyncStorage.setItem(storageKey, legacyOnboarding).catch(console.warn);
        }

        if (!workoutOnboarding && resolvedOnboarding) {
          await setWorkoutOnboarding(JSON.parse(resolvedOnboarding));
        }

        setHasWorkoutOnboarding(hasStoredOnboarding);
        setOnboardingResolved(true);

        if (!hasStoredOnboarding) {
          router.replace("/workout/onboarding");
        }
      } catch {
        if (!active) return;
        setHasWorkoutOnboarding(false);
        setOnboardingResolved(true);
        router.replace("/workout/onboarding");
      }
    }

    resolveOnboarding();

    return () => {
      active = false;
    };
  }, [setWorkoutOnboarding, user?.id, workoutOnboarding]);

  const canRenderTabs = onboardingResolved && hasWorkoutOnboarding && !!workoutOnboarding;

  if (!canRenderTabs) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: WORKOUT_ORANGE,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium" },
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)" as any)}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
        ),
        headerTitle: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Maya Workout",
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          tabBarLabel: "Accueil",
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="barbell-outline" size={22} color={color} />,
          tabBarLabel: "Exercices",
          title: "Exercices",
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={22} color={color} />,
          tabBarLabel: "Séances",
          title: "Séances",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="trending-up-outline" size={22} color={color} />,
          tabBarLabel: "Progression",
        }}
      />
    </Tabs>
  );
}
