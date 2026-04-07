import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NUTRITION_ACCENT = "#5B8C5A";
const NUTRITION_BG = "#F6FAF0";

export default function NutritionTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NUTRITION_ACCENT,
        tabBarInactiveTintColor: "#8FAA8E",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : NUTRITION_BG,
          borderTopWidth: 1,
          borderTopColor: "#D4E8D0",
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: NUTRITION_BG }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium" },
        headerShown: true,
        headerStyle: { backgroundColor: NUTRITION_BG },
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#2D4A2B" />
          </TouchableOpacity>
        ),
        headerTitle: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recettes",
          tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={22} color={color} />,
          tabBarLabel: "Recettes",
        }}
      />
      <Tabs.Screen
        name="menus"
        options={{
          title: "Mes Menus",
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
          tabBarLabel: "Menus",
        }}
      />
      <Tabs.Screen
        name="calories"
        options={{
          title: "Mes Calories",
          tabBarIcon: ({ color }) => <Ionicons name="flame-outline" size={22} color={color} />,
          tabBarLabel: "Calories",
        }}
      />
      <Tabs.Screen
        name="suivi"
        options={{
          title: "Suivi Nutrition",
          tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={22} color={color} />,
          tabBarLabel: "Suivi",
        }}
      />
    </Tabs>
  );
}
