import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const WORKOUT_ORANGE = "#FF8C00";

export default function WorkoutTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
