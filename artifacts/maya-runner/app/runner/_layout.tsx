import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function RunnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
