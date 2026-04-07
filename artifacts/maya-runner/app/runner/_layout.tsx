import { Stack } from "expo-router";
import React, { useState } from "react";
import { ModuleSplash } from "@/components/ModuleSplash";

export default function RunnerLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && (
        <ModuleSplash module="runner" onFinish={() => setSplashDone(true)} />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="exercise/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="exercises" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
