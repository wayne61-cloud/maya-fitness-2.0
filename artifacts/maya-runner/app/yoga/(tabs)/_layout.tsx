import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const YOGA_ACCENT = "#9B7B6E";
const YOGA_BG = "#FAF7F4";

export default function YogaTabLayout() {
  const { yogaOnboarding, setYogaOnboarding } = useAppContext();
  const { user } = useAuth();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();
  const [onboardingResolved, setOnboardingResolved] = useState(false);
  const [hasYogaOnboarding, setHasYogaOnboarding] = useState(false);

  useEffect(() => {
    let active = true;

    async function resolveOnboarding() {
      if (yogaOnboarding) {
        if (!active) return;
        setHasYogaOnboarding(true);
        setOnboardingResolved(true);
        return;
      }

      if (!user?.id) {
        if (!active) return;
        setHasYogaOnboarding(false);
        setOnboardingResolved(false);
        return;
      }

      try {
        const storageKey = `@maya_${user.id}_yogaOnboarding`;
        const [storedOnboarding, legacyOnboarding] = await Promise.all([
          AsyncStorage.getItem(storageKey),
          AsyncStorage.getItem("yogaOnboarding"),
        ]);
        if (!active) return;

        const resolvedOnboarding = storedOnboarding ?? legacyOnboarding;
        const hasStoredOnboarding = Boolean(resolvedOnboarding);

        if (!storedOnboarding && legacyOnboarding) {
          AsyncStorage.setItem(storageKey, legacyOnboarding).catch(console.warn);
        }

        if (!yogaOnboarding && resolvedOnboarding) {
          await setYogaOnboarding(JSON.parse(resolvedOnboarding));
        }

        setHasYogaOnboarding(hasStoredOnboarding);
        setOnboardingResolved(true);

        if (!hasStoredOnboarding) {
          router.replace("/yoga/onboarding");
        }
      } catch {
        if (!active) return;
        setHasYogaOnboarding(false);
        setOnboardingResolved(true);
        router.replace("/yoga/onboarding");
      }
    }

    resolveOnboarding();

    return () => {
      active = false;
    };
  }, [setYogaOnboarding, user?.id, yogaOnboarding]);

  const canRenderTabs = onboardingResolved && hasYogaOnboarding && !!yogaOnboarding;

  if (!canRenderTabs) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: YOGA_ACCENT,
        tabBarInactiveTintColor: "#B8A9A2",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : YOGA_BG,
          borderTopWidth: 1,
          borderTopColor: "#EDE8E3",
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: YOGA_BG }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium" },
        headerShown: true,
        headerStyle: { backgroundColor: YOGA_BG },
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)" as any)}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
          </TouchableOpacity>
        ),
        headerTitle: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Yoga & Pilates",
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          tabBarLabel: "Accueil",
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercices",
          tabBarIcon: ({ color }) => <Ionicons name="body-outline" size={22} color={color} />,
          tabBarLabel: "Exercices",
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Séances",
          tabBarIcon: ({ color }) => <Ionicons name="play-circle-outline" size={22} color={color} />,
          tabBarLabel: "Séances",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progression",
          tabBarIcon: ({ color }) => <Ionicons name="trending-up-outline" size={22} color={color} />,
          tabBarLabel: "Progression",
        }}
      />
    </Tabs>
  );
}
