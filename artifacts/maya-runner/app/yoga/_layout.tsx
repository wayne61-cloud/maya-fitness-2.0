import { Stack } from "expo-router";
import React, { useState } from "react";
import { ModuleSplash } from "@/components/ModuleSplash";

export default function YogaLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && (
        <ModuleSplash module="yoga" onFinish={() => setSplashDone(true)} />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="exercise/[id]"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
}
