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
import { useAppContext } from "@/context/AppContext";

const BG = "#F6FAF0";
const ACCENT = "#5B8C5A";
const TEXT = "#2D4A2B";
const MUTED = "#7A9878";
const CARD = "#FFFFFF";
const BORDER = "#D4E8D0";
const WARM = "#E8844A";

const SPORTS = ["Running", "Musculation", "Yoga & Pilates", "Cyclisme", "Natation", "Arts martiaux", "Autre"];
const OBJECTIVES = [
  { label: "Prise de masse", icon: "barbell-outline", color: "#E8844A" },
  { label: "Perte de poids", icon: "trending-down-outline", color: "#5B8C5A" },
  { label: "Maintien", icon: "heart-outline", color: "#4A90D9" },
  { label: "Sèche", icon: "flash-outline", color: "#D9534A" },
];
const DIETS = ["Omnivore", "Végétarien", "Vegan", "Sans gluten", "Cétogène"];
const ALLERGIES = ["Gluten", "Lactose", "Arachides", "Fruits à coque", "Soja", "Œufs", "Crustacés", "Poisson"];

export default function NutritionOnboarding() {
  const insets = useSafeAreaInsets();
  const { setNutritionOnboarding } = useAppContext();
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("");
  const [objective, setObjective] = useState("");
  const [diet, setDiet] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  function toggleAllergy(a: string) {
    setAllergies((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  async function finish() {
    await setNutritionOnboarding({
      sport, objective, diet,
      allergies, disliked: [],
      completedAt: new Date().toISOString(),
    });
    router.replace("/nutrition/(tabs)");
  }

  const steps = [
    // Step 0
    <ScrollView key="s0" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🥗</Text>
        <Text style={[styles.heroTitle, { color: TEXT }]}>Maya Nutrition</Text>
        <Text style={[styles.heroSub, { color: MUTED }]}>Mange intelligemment, performe mieux</Text>
      </View>
      <Text style={[styles.stepTitle, { color: TEXT }]}>Ton sport principal</Text>
      <View style={styles.chipGrid}>
        {SPORTS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, { borderColor: sport === s ? ACCENT : BORDER, backgroundColor: sport === s ? ACCENT + "12" : CARD }]}
            onPress={() => setSport(s)}
          >
            <Text style={[styles.chipText, { color: sport === s ? ACCENT : TEXT }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>,

    // Step 1
    <ScrollView key="s1" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <Text style={[styles.stepTitle, { color: TEXT }]}>Ton objectif nutritionnel</Text>
      {OBJECTIVES.map((obj) => (
        <TouchableOpacity
          key={obj.label}
          style={[styles.optionCard, { borderColor: objective === obj.label ? obj.color : BORDER, backgroundColor: objective === obj.label ? obj.color + "12" : CARD }]}
          onPress={() => setObjective(obj.label)}
          activeOpacity={0.8}
        >
          <Ionicons name={obj.icon as any} size={22} color={objective === obj.label ? obj.color : MUTED} />
          <Text style={[styles.optionLabel, { color: objective === obj.label ? obj.color : TEXT }]}>{obj.label}</Text>
          {objective === obj.label && <Ionicons name="checkmark-circle" size={20} color={obj.color} />}
        </TouchableOpacity>
      ))}
    </ScrollView>,

    // Step 2
    <ScrollView key="s2" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <Text style={[styles.stepTitle, { color: TEXT }]}>Ton régime alimentaire</Text>
      {DIETS.map((d) => (
        <TouchableOpacity
          key={d}
          style={[styles.optionCard, { borderColor: diet === d ? ACCENT : BORDER, backgroundColor: diet === d ? ACCENT + "12" : CARD }]}
          onPress={() => setDiet(d)}
          activeOpacity={0.8}
        >
          <Ionicons name="leaf-outline" size={22} color={diet === d ? ACCENT : MUTED} />
          <Text style={[styles.optionLabel, { color: diet === d ? ACCENT : TEXT }]}>{d}</Text>
          {diet === d && <Ionicons name="checkmark-circle" size={20} color={ACCENT} />}
        </TouchableOpacity>
      ))}
    </ScrollView>,

    // Step 3
    <ScrollView key="s3" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <Text style={[styles.stepTitle, { color: TEXT }]}>Allergies & restrictions</Text>
      <Text style={[styles.stepSub, { color: MUTED }]}>Sélectionne si nécessaire (optionnel)</Text>
      <View style={styles.chipGrid}>
        {ALLERGIES.map((a) => {
          const active = allergies.includes(a);
          return (
            <TouchableOpacity
              key={a}
              style={[styles.chip, { borderColor: active ? WARM : BORDER, backgroundColor: active ? WARM + "12" : CARD }]}
              onPress={() => toggleAllergy(a)}
            >
              <Text style={[styles.chipText, { color: active ? WARM : TEXT }]}>{a}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>,
  ];

  const canNext = [!!sport, !!objective, !!diet, true][step];

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
      <View style={styles.progressBar}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? ACCENT : BORDER }]} />
        ))}
      </View>

      {steps[step]}

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, backgroundColor: BG, borderTopColor: BORDER }]}>
        {step > 0 && (
          <TouchableOpacity style={[styles.backBtn, { borderColor: BORDER }]} onPress={() => setStep((s) => s - 1)}>
            <Ionicons name="arrow-back" size={20} color={MUTED} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: canNext ? ACCENT : BORDER, flex: step > 0 ? 1 : undefined, width: step === 0 ? "100%" : undefined }]}
          onPress={() => step < steps.length - 1 ? setStep((s) => s + 1) : finish()}
          disabled={!canNext}
        >
          <Text style={[styles.nextBtnText, { color: canNext ? "#fff" : MUTED }]}>
            {step === steps.length - 1 ? "C'est parti !" : "Continuer"}
          </Text>
          <Ionicons name={step === steps.length - 1 ? "restaurant-outline" : "arrow-forward"} size={16} color={canNext ? "#fff" : MUTED} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  progressBar: { flexDirection: "row", gap: 6, paddingHorizontal: 24, paddingVertical: 16 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  hero: { alignItems: "center", paddingVertical: 28, gap: 8 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 30, fontFamily: "Inter_700Bold", textAlign: "center" },
  heroSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 4 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  optionCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 16 },
  optionLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
  backBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 24 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
