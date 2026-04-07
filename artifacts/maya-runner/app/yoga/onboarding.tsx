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
import type { YogaCategory } from "@/constants/yoga-data";

const BG = "#FAF7F4";
const ACCENT = "#9B7B6E";
const TEXT = "#3D2B1F";
const MUTED = "#9E8C7E";
const CARD = "#FFFFFF";
const BORDER = "#EDE8E3";
const ROSE = "#E8A598";

const LEVELS = [
  { label: "Débutant", sub: "Je commence ma pratique", icon: "leaf-outline" },
  { label: "Intermédiaire", sub: "Quelques mois d'expérience", icon: "fitness-outline" },
  { label: "Avancé", sub: "Pratique régulière et approfondie", icon: "trophy-outline" },
];

const GOALS = ["Relaxation & stress", "Flexibilité", "Force & sculpture", "Pleine conscience", "Récupération sportive", "Perte de poids"];

const PREFS: { label: YogaCategory; icon: string }[] = [
  { label: "Pilates", icon: "body-outline" },
  { label: "Yoga", icon: "flower-outline" },
  { label: "Stretching", icon: "accessibility-outline" },
  { label: "Méditation", icon: "cloud-outline" },
  { label: "Barre", icon: "barbell-outline" },
];

const FREQS = [
  { label: "1-2x / semaine", value: 1 },
  { label: "3-4x / semaine", value: 3 },
  { label: "5-7x / semaine", value: 5 },
];

export default function YogaOnboarding() {
  const insets = useSafeAreaInsets();
  const { setYogaOnboarding } = useAppContext();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [prefs, setPrefs] = useState<YogaCategory[]>([]);
  const [freq, setFreq] = useState(3);
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  function togglePref(p: YogaCategory) {
    setPrefs((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function finish() {
    await setYogaOnboarding({ level: level as any, goal, frequency: freq, preferences: prefs, completedAt: new Date().toISOString() });
    router.replace("/yoga/(tabs)");
  }

  const steps = [
    // Step 0 — Bienvenue + Level
    <ScrollView key="s0" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🧘</Text>
        <Text style={styles.heroTitle}>Maya{"\n"}Yoga & Pilates</Text>
        <Text style={styles.heroSub}>Ambiance zen, corps et esprit</Text>
      </View>
      <Text style={styles.sectionTitle}>Ton niveau actuel</Text>
      {LEVELS.map((l) => (
        <TouchableOpacity
          key={l.label}
          style={[styles.optionCard, { borderColor: level === l.label ? ACCENT : BORDER, backgroundColor: level === l.label ? ACCENT + "12" : CARD }]}
          onPress={() => setLevel(l.label)}
          activeOpacity={0.8}
        >
          <Ionicons name={l.icon as any} size={22} color={level === l.label ? ACCENT : MUTED} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, { color: level === l.label ? ACCENT : TEXT }]}>{l.label}</Text>
            <Text style={[styles.optionSub, { color: MUTED }]}>{l.sub}</Text>
          </View>
          {level === l.label && <Ionicons name="checkmark-circle" size={20} color={ACCENT} />}
        </TouchableOpacity>
      ))}
    </ScrollView>,

    // Step 1 — Objectif
    <ScrollView key="s1" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <Text style={styles.stepTitle}>Ton objectif</Text>
      <Text style={styles.stepSub}>Qu'est-ce que tu cherches à travers ta pratique ?</Text>
      <View style={styles.chipGrid}>
        {GOALS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, { borderColor: goal === g ? ACCENT : BORDER, backgroundColor: goal === g ? ACCENT + "12" : CARD }]}
            onPress={() => setGoal(g)}
          >
            <Text style={[styles.chipText, { color: goal === g ? ACCENT : TEXT }]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>,

    // Step 2 — Préférences
    <ScrollView key="s2" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <Text style={styles.stepTitle}>Tes disciplines préférées</Text>
      <Text style={styles.stepSub}>Sélectionne tout ce qui t'intéresse</Text>
      {PREFS.map((p) => {
        const active = prefs.includes(p.label);
        return (
          <TouchableOpacity
            key={p.label}
            style={[styles.optionCard, { borderColor: active ? ACCENT : BORDER, backgroundColor: active ? ACCENT + "12" : CARD }]}
            onPress={() => togglePref(p.label)}
            activeOpacity={0.8}
          >
            <Ionicons name={p.icon as any} size={22} color={active ? ACCENT : MUTED} />
            <Text style={[styles.optionLabel, { color: active ? ACCENT : TEXT }]}>{p.label}</Text>
            {active && <Ionicons name="checkmark-circle" size={20} color={ACCENT} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>,

    // Step 3 — Fréquence
    <ScrollView key="s3" contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 100 }]}>
      <Text style={styles.stepTitle}>Fréquence souhaitée</Text>
      <Text style={styles.stepSub}>Combien de fois par semaine tu souhaites pratiquer ?</Text>
      {FREQS.map((f) => (
        <TouchableOpacity
          key={f.value}
          style={[styles.optionCard, { borderColor: freq === f.value ? ACCENT : BORDER, backgroundColor: freq === f.value ? ACCENT + "12" : CARD }]}
          onPress={() => setFreq(f.value)}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={22} color={freq === f.value ? ACCENT : MUTED} />
          <Text style={[styles.optionLabel, { color: freq === f.value ? ACCENT : TEXT }]}>{f.label}</Text>
          {freq === f.value && <Ionicons name="checkmark-circle" size={20} color={ACCENT} />}
        </TouchableOpacity>
      ))}
    </ScrollView>,
  ];

  const canNext = [!!level, !!goal, prefs.length > 0, true][step];

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top }}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.progressSegment, { backgroundColor: i <= step ? ACCENT : BORDER }]} />
        ))}
      </View>

      {steps[step]}

      {/* CTA */}
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
          activeOpacity={0.85}
        >
          <Text style={[styles.nextBtnText, { color: canNext ? "#fff" : MUTED }]}>
            {step === steps.length - 1 ? "Commencer" : "Continuer"}
          </Text>
          <Ionicons name={step === steps.length - 1 ? "leaf" : "arrow-forward"} size={16} color={canNext ? "#fff" : MUTED} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 24, paddingTop: 24, gap: 12 },
  progressBar: { flexDirection: "row", gap: 6, paddingHorizontal: 24, paddingVertical: 16 },
  progressSegment: { flex: 1, height: 3, borderRadius: 2 },
  hero: { alignItems: "center", paddingVertical: 32, gap: 8 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 34, fontFamily: "Inter_700Bold", color: TEXT, textAlign: "center", lineHeight: 42 },
  heroSub: { fontSize: 16, color: MUTED, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: TEXT, marginTop: 8 },
  stepTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: TEXT, marginTop: 8 },
  stepSub: { fontSize: 15, color: MUTED, fontFamily: "Inter_400Regular", marginBottom: 4 },
  optionCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 16 },
  optionLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  optionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
  backBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 28 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
