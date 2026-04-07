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
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const WORKOUT_ORANGE = "#FF8C00";

const LEVELS = [
  { id: "Débutant", icon: "leaf-outline", desc: "Je débute ou reprends après une pause" },
  { id: "Intermédiaire", icon: "trending-up-outline", desc: "Je m'entraîne régulièrement depuis 6+ mois" },
  { id: "Avancé", icon: "flash-outline", desc: "Je m'entraîne depuis plusieurs années" },
] as const;

const GOALS = [
  { id: "prise_masse", label: "Prise de masse", icon: "arrow-up-circle-outline", color: "#4CAF50" },
  { id: "perte_poids", label: "Perte de poids", icon: "trending-down-outline", color: "#2196F3" },
  { id: "tonification", label: "Tonification", icon: "body-outline", color: "#9C27B0" },
  { id: "performance", label: "Performance", icon: "flash-outline", color: WORKOUT_ORANGE },
  { id: "sante", label: "Santé générale", icon: "heart-outline", color: "#E91E63" },
];

const FREQUENCIES = [2, 3, 4, 5, 6];

const AREAS = [
  { id: "pectoraux", label: "Pectoraux", icon: "body-outline" },
  { id: "dos", label: "Dos", icon: "body-outline" },
  { id: "epaules", label: "Épaules", icon: "body-outline" },
  { id: "bras", label: "Bras", icon: "body-outline" },
  { id: "jambes", label: "Jambes", icon: "walk-outline" },
  { id: "fessiers", label: "Fessiers", icon: "walk-outline" },
  { id: "abdos", label: "Abdominaux", icon: "body-outline" },
];

const STEPS = ["level", "goal", "frequency", "areas"] as const;
type Step = typeof STEPS[number];

export default function WorkoutOnboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setWorkoutOnboarding } = useApp();

  const [step, setStep] = useState<Step>("level");
  const [level, setLevel] = useState<"Débutant" | "Intermédiaire" | "Avancé" | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [areas, setAreas] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const stepIndex = STEPS.indexOf(step);

  function toggleArea(id: string) {
    setAreas((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  }

  function canContinue() {
    if (step === "level") return level != null;
    if (step === "goal") return goal != null;
    if (step === "frequency") return frequency != null;
    if (step === "areas") return areas.length > 0;
    return false;
  }

  async function next() {
    if (step === "areas") {
      await setWorkoutOnboarding({
        level: level!,
        goal: goal!,
        frequency: frequency!,
        areas,
        completedAt: new Date().toISOString(),
      });
      router.replace("/workout/(tabs)");
      return;
    }
    const nextIdx = stepIndex + 1;
    setStep(STEPS[nextIdx]);
  }

  function back() {
    if (stepIndex === 0) { router.back(); return; }
    setStep(STEPS[stepIndex - 1]);
  }

  const STEP_LABELS = ["Niveau", "Objectif", "Fréquence", "Zones"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Progress header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    i < stepIndex ? WORKOUT_ORANGE :
                    i === stepIndex ? WORKOUT_ORANGE :
                    colors.secondary,
                  width: i === stepIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
          {stepIndex + 1}/{STEPS.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* LEVEL */}
        {step === "level" && (
          <>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Quel est ton niveau ?</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                On va personnaliser ton expérience Maya Workout
              </Text>
            </View>
            <View style={styles.optionList}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[
                    styles.bigOption,
                    {
                      backgroundColor: level === l.id ? WORKOUT_ORANGE + "18" : colors.card,
                      borderColor: level === l.id ? WORKOUT_ORANGE : colors.border,
                    },
                  ]}
                  onPress={() => setLevel(l.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIconWrap, { backgroundColor: level === l.id ? WORKOUT_ORANGE + "30" : colors.secondary }]}>
                    <Ionicons name={l.icon as any} size={24} color={level === l.id ? WORKOUT_ORANGE : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bigOptionLabel, { color: colors.foreground }]}>{l.id}</Text>
                    <Text style={[styles.bigOptionDesc, { color: colors.mutedForeground }]}>{l.desc}</Text>
                  </View>
                  {level === l.id && (
                    <Ionicons name="checkmark-circle" size={22} color={WORKOUT_ORANGE} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* GOAL */}
        {step === "goal" && (
          <>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Quel est ton objectif ?</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                On adaptera tes programmes en conséquence
              </Text>
            </View>
            <View style={styles.goalGrid}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: goal === g.id ? g.color + "18" : colors.card,
                      borderColor: goal === g.id ? g.color : colors.border,
                    },
                  ]}
                  onPress={() => setGoal(g.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={g.icon as any} size={26} color={goal === g.id ? g.color : colors.mutedForeground} />
                  <Text style={[styles.goalCardLabel, { color: colors.foreground }]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* FREQUENCY */}
        {step === "frequency" && (
          <>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Combien de fois par semaine ?</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                Sois réaliste — la régularité prime sur l'intensité
              </Text>
            </View>
            <View style={styles.freqRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.freqBtn,
                    {
                      backgroundColor: frequency === f ? WORKOUT_ORANGE : colors.card,
                      borderColor: frequency === f ? WORKOUT_ORANGE : colors.border,
                    },
                  ]}
                  onPress={() => setFrequency(f)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.freqNum, { color: frequency === f ? "#fff" : colors.foreground }]}>{f}x</Text>
                  <Text style={[styles.freqSub, { color: frequency === f ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                    /sem
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.freqInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.freqInfoText, { color: colors.mutedForeground }]}>
                {frequency ? `${frequency}x par semaine = programme ${frequency <= 3 ? "Full Body" : frequency <= 4 ? "Upper/Lower" : "PPL"} recommandé` : "Choisis une fréquence"}
              </Text>
            </View>
          </>
        )}

        {/* AREAS */}
        {step === "areas" && (
          <>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Zones à travailler en priorité</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                Sélectionne autant de zones que tu veux (minimum 1)
              </Text>
            </View>
            <View style={styles.areaGrid}>
              {AREAS.map((a) => {
                const selected = areas.includes(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.areaBtn,
                      {
                        backgroundColor: selected ? WORKOUT_ORANGE + "20" : colors.card,
                        borderColor: selected ? WORKOUT_ORANGE : colors.border,
                      },
                    ]}
                    onPress={() => toggleArea(a.id)}
                    activeOpacity={0.8}
                  >
                    {selected && <Ionicons name="checkmark-circle" size={16} color={WORKOUT_ORANGE} style={{ position: "absolute", top: 8, right: 8 }} />}
                    <Text style={[styles.areaLabel, { color: selected ? WORKOUT_ORANGE : colors.foreground }]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.ctaWrap, { paddingBottom: bottomPad + 20, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: canContinue() ? WORKOUT_ORANGE : colors.secondary },
          ]}
          onPress={canContinue() ? next : undefined}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaBtnText, { color: canContinue() ? "#fff" : colors.mutedForeground }]}>
            {step === "areas" ? "Démarrer Maya Workout 🔥" : "Continuer"}
          </Text>
          {step !== "areas" && (
            <Ionicons name="arrow-forward" size={18} color={canContinue() ? "#fff" : colors.mutedForeground} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16, gap: 16,
  },
  backBtn: { padding: 4 },
  stepsRow: { flex: 1, flexDirection: "row", gap: 6, alignItems: "center" },
  stepDot: { height: 8, borderRadius: 4, transition: "width 0.3s" as any },
  stepLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  content: { paddingHorizontal: 20, gap: 20 },
  stepHeader: { gap: 6 },
  stepTitle: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 30 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  optionList: { gap: 12 },
  bigOption: {
    borderRadius: 16, borderWidth: 1.5, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  optionIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  bigOptionLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  bigOptionDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  goalCard: {
    width: "47%", borderRadius: 16, borderWidth: 1.5,
    padding: 18, alignItems: "center", gap: 10,
  },
  goalCardLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  freqRow: { flexDirection: "row", gap: 10 },
  freqBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1.5,
    padding: 16, alignItems: "center", gap: 4,
  },
  freqNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  freqSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  freqInfo: {
    borderRadius: 12, borderWidth: 1, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  freqInfoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  areaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  areaBtn: {
    paddingHorizontal: 18, paddingVertical: 13, borderRadius: 30, borderWidth: 1.5,
  },
  areaLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  ctaWrap: { paddingHorizontal: 20, paddingTop: 16 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 16,
  },
  ctaBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
