import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const RUNNER_RED = "#E8335A";

export default function RunnerTabLayout() {
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
            onPress={() => router.back()}
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
