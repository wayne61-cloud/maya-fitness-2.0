import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const RUNNER_RED = "#E8335A";

const GOALS = [
  { value: 10, label: "10 km / semaine", sub: "Reprise douce", icon: "walk-outline" },
  { value: 20, label: "20 km / semaine", sub: "Progression régulière", icon: "fitness-outline" },
  { value: 30, label: "30 km / semaine", sub: "Rythme soutenu", icon: "speedometer-outline" },
  { value: 40, label: "40 km / semaine", sub: "Objectif ambitieux", icon: "flash-outline" },
] as const;

export default function RunnerOnboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();
  const { user } = useAuth();
  const [goal, setGoal] = useState(profile.weeklyGoal || 20);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function finish() {
    await updateProfile({ ...profile, weeklyGoal: goal });

    if (user?.id) {
      await AsyncStorage.setItem(`@maya_${user.id}_runnerOnboardingCompleted`, "true");
    }

    router.replace("/runner/(tabs)");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 24, paddingBottom: bottomPad + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="speedometer-outline" size={28} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Maya Runner</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choisis ton objectif hebdomadaire pour débloquer ton espace course.
          </Text>
        </View>

        <View style={styles.optionList}>
          {GOALS.map((option) => {
            const active = goal === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: active ? `${RUNNER_RED}18` : colors.card,
                    borderColor: active ? RUNNER_RED : colors.border,
                  },
                ]}
                onPress={() => setGoal(option.value)}
                activeOpacity={0.82}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: active ? `${RUNNER_RED}28` : colors.secondary },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={22}
                    color={active ? RUNNER_RED : colors.mutedForeground}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionSub, { color: colors.mutedForeground }]}>
                    {option.sub}
                  </Text>
                </View>

                {active && <Ionicons name="checkmark-circle" size={22} color={RUNNER_RED} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottomPad + 12,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: RUNNER_RED }]}
          onPress={finish}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Commencer</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 24,
  },
  hero: {
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: RUNNER_RED,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 320,
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  optionSub: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
