import { Stack } from "expo-router";

export default function RunnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exercise/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="exercises" options={{ headerShown: false }} />
    </Stack>
  );
}
