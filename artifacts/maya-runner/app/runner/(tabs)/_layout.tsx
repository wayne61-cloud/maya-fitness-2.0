import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const RUNNER_RED = "#E8335A";

export default function RunnerTabLayout() {
  const colors = useColors();
  const { user } = useAuth();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();
  const [onboardingResolved, setOnboardingResolved] = useState(false);
  const [hasRunnerOnboarding, setHasRunnerOnboarding] = useState(false);

  useEffect(() => {
    let active = true;

    async function resolveOnboarding() {
      if (!user?.id) {
        if (!active) return;
        setHasRunnerOnboarding(false);
        setOnboardingResolved(false);
        return;
      }

      const prefix = `@maya_${user.id}_`;

      try {
        const [storedCompletion, legacyCompletion, storedProfile, storedRuns] = await Promise.all([
          AsyncStorage.getItem(`${prefix}runnerOnboardingCompleted`),
          AsyncStorage.getItem("runnerOnboardingCompleted"),
          AsyncStorage.getItem(`${prefix}profile`),
          AsyncStorage.getItem(`${prefix}runs`),
        ]);
        if (!active) return;

        const hasExistingRunnerData = Boolean(storedProfile || storedRuns);
        const onboardingCompleted =
          storedCompletion === "true" ||
          legacyCompletion === "true" ||
          hasExistingRunnerData;

        if (!storedCompletion && onboardingCompleted) {
          AsyncStorage.setItem(`${prefix}runnerOnboardingCompleted`, "true").catch(console.warn);
        }

        setHasRunnerOnboarding(onboardingCompleted);
        setOnboardingResolved(true);

        if (!onboardingCompleted) {
          router.replace("/runner/onboarding");
        }
      } catch {
        if (!active) return;
        setHasRunnerOnboarding(false);
        setOnboardingResolved(true);
        router.replace("/runner/onboarding");
      }
    }

    resolveOnboarding();

    return () => {
      active = false;
    };
  }, [user?.id]);

  if (!(onboardingResolved && hasRunnerOnboarding)) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: RUNNER_RED,
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
          title: "Maya Runner",
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          tabBarLabel: "Accueil",
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="run-fast" size={22} color={color} />,
          tabBarLabel: "Courir",
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercices",
          tabBarIcon: ({ color }) => <Ionicons name="barbell-outline" size={22} color={color} />,
          tabBarLabel: "Exercices",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
          tabBarLabel: "Historique",
          title: "Historique",
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
