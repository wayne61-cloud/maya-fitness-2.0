import { Stack } from "expo-router";
import React from "react";

export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exercise/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="session/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
    </Stack>
  );
}
