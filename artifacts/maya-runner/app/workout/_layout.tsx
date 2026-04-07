import { Stack } from "expo-router";
import React, { useState } from "react";
import { ModuleSplash } from "@/components/ModuleSplash";

export default function WorkoutLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && (
        <ModuleSplash module="workout" onFinish={() => setSplashDone(true)} />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="exercise/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="session/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="session/create" options={{ headerShown: false, animation: "slide_from_right" }} />
      </Stack>
    </>
  );
}
