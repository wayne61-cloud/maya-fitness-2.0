import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAppContext, CustomSession, CustomSessionExercise } from "@/context/AppContext";
import { EXERCISES } from "@/constants/workout-data";

const WORKOUT_ORANGE = "#FF8C00";

const MUSCLE_GROUPS = ["Tout", "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Jambes", "Fessiers", "Abdominaux"];

export default function CreateSessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addCustomSession } = useAppContext();
  const [step, setStep] = useState<"info" | "pick" | "configure">("info");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("Tout");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [configured, setConfigured] = useState<Record<string, { sets: number; reps: number; rest: number }>>({});
  const [saving, setSaving] = useState(false);

  const bottomPad = Platform.OS === "web" ? 16 : insets.bottom;

  const filteredExercises = EXERCISES.filter((e) => {
    const matchGroup = filter === "Tout" || e.muscleGroup === filter || e.secondaryMuscles?.includes(filter);
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  function toggleExercise(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    if (!configured[id]) {
      setConfigured((prev) => ({ ...prev, [id]: { sets: 3, reps: 12, rest: 60 } }));
    }
  }

  function updateConfig(id: string, field: "sets" | "reps" | "rest", delta: number) {
    setConfigured((prev) => {
      const cur = prev[id] ?? { sets: 3, reps: 12, rest: 60 };
      const min = field === "rest" ? 15 : 1;
      const max = field === "sets" ? 10 : field === "reps" ? 30 : 180;
      return { ...prev, [id]: { ...cur, [field]: Math.max(min, Math.min(max, cur[field] + delta)) } };
    });
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Nom requis", "Donne un nom à ta séance.");
      return;
    }
    if (selected.length === 0) {
      Alert.alert("Exercices requis", "Sélectionne au moins un exercice.");
      return;
    }
    setSaving(true);
    const exercises: CustomSessionExercise[] = selected.map((id) => {
      const ex = EXERCISES.find((e) => e.id === id)!;
      const cfg = configured[id] ?? { sets: 3, reps: 12, rest: 60 };
      return { exerciseId: id, name: ex.name, sets: cfg.sets, reps: cfg.reps, restSeconds: cfg.rest };
    });
    const totalMin = Math.round(selected.length * 4.5);
    const session: CustomSession = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      exercises,
      createdAt: new Date().toISOString(),
      durationMin: totalMin,
    };
    await addCustomSession(session);
    setSaving(false);
    router.back();
  }

  if (step === "info") {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[styles.page, { paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Créer une séance</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {["Info", "Exercices", "Config"].map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, { backgroundColor: i === 0 ? WORKOUT_ORANGE : colors.card, borderColor: i === 0 ? WORKOUT_ORANGE : colors.border }]}>
                <Text style={[styles.stepNum, { color: i === 0 ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
              </View>
              {i < 2 && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Nom de la séance *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Ex : Push Day, Full Body Express..."
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
          maxLength={50}
        />

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Décris ta séance..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={150}
        />

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: name.trim() ? WORKOUT_ORANGE : colors.card }]}
          onPress={() => { if (name.trim()) setStep("pick"); }}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextBtnText, { color: name.trim() ? "#fff" : colors.mutedForeground }]}>Choisir les exercices</Text>
          <Ionicons name="arrow-forward" size={16} color={name.trim() ? "#fff" : colors.mutedForeground} />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === "pick") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => setStep("info")} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Exercices</Text>
          <Text style={[styles.selectedCount, { color: WORKOUT_ORANGE }]}>{selected.length} sél.</Text>
        </View>

        {/* Step indicator */}
        <View style={[styles.stepRow, { paddingHorizontal: 20 }]}>
          {["Info", "Exercices", "Config"].map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, { backgroundColor: i <= 1 ? WORKOUT_ORANGE : colors.card, borderColor: i <= 1 ? WORKOUT_ORANGE : colors.border }]}>
                {i < 1 ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={[styles.stepNum, { color: i === 1 ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>}
              </View>
              {i < 2 && <View style={[styles.stepLine, { backgroundColor: i < 1 ? WORKOUT_ORANGE : colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Rechercher..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Muscle filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}>
          {MUSCLE_GROUPS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.filterChip, { backgroundColor: filter === g ? WORKOUT_ORANGE : colors.card, borderColor: filter === g ? WORKOUT_ORANGE : colors.border }]}
              onPress={() => setFilter(g)}
            >
              <Text style={[styles.filterText, { color: filter === g ? "#fff" : colors.foreground }]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: bottomPad + 120 }}>
          {filteredExercises.map((ex) => {
            const isSelected = selected.includes(ex.id);
            return (
              <TouchableOpacity
                key={ex.id}
                style={[styles.exRow, { backgroundColor: colors.card, borderColor: isSelected ? WORKOUT_ORANGE : colors.border, borderWidth: isSelected ? 1.5 : 1 }]}
                onPress={() => toggleExercise(ex.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.exCheck, { backgroundColor: isSelected ? WORKOUT_ORANGE : "transparent", borderColor: isSelected ? WORKOUT_ORANGE : colors.border }]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
                  <Text style={[styles.exMeta, { color: colors.mutedForeground }]}>{ex.muscleGroup} · {ex.level}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selected.length > 0 && (
          <View style={[styles.floatBtn, { bottom: bottomPad + 20, backgroundColor: WORKOUT_ORANGE }]}>
            <TouchableOpacity style={styles.floatBtnInner} onPress={() => setStep("configure")} activeOpacity={0.85}>
              <Text style={styles.floatBtnText}>Configurer ({selected.length})</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Step 3 — Configure
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => setStep("pick")} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Configuration</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.stepRow, { paddingHorizontal: 20 }]}>
        {["Info", "Exercices", "Config"].map((s, i) => (
          <React.Fragment key={s}>
            <View style={[styles.stepDot, { backgroundColor: WORKOUT_ORANGE, borderColor: WORKOUT_ORANGE }]}>
              {i < 2 ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={[styles.stepNum, { color: "#fff" }]}>{i + 1}</Text>}
            </View>
            {i < 2 && <View style={[styles.stepLine, { backgroundColor: WORKOUT_ORANGE }]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: bottomPad + 100 }}>
        {selected.map((id) => {
          const ex = EXERCISES.find((e) => e.id === id)!;
          const cfg = configured[id] ?? { sets: 3, reps: 12, rest: 60 };
          return (
            <View key={id} style={[styles.configCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.configName, { color: colors.foreground }]}>{ex.name}</Text>
              <View style={styles.configRow}>
                {([
                  { label: "Séries", field: "sets" as const, unit: "" },
                  { label: "Reps", field: "reps" as const, unit: "" },
                  { label: "Repos", field: "rest" as const, unit: "s" },
                ] as const).map(({ label, field, unit }) => (
                  <View key={field} style={styles.configItem}>
                    <Text style={[styles.configLabel, { color: colors.mutedForeground }]}>{label}</Text>
                    <View style={styles.configControls}>
                      <TouchableOpacity onPress={() => updateConfig(id, field, -1)} style={[styles.configBtn, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="remove" size={14} color={colors.foreground} />
                      </TouchableOpacity>
                      <Text style={[styles.configVal, { color: colors.foreground }]}>{cfg[field]}{unit}</Text>
                      <TouchableOpacity onPress={() => updateConfig(id, field, 1)} style={[styles.configBtn, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="add" size={14} color={colors.foreground} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.floatBtn, { bottom: bottomPad + 20, backgroundColor: saving ? colors.card : WORKOUT_ORANGE }]}>
        <TouchableOpacity style={styles.floatBtnInner} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.floatBtnText}>{saving ? "Sauvegarde…" : "Créer la séance"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 60, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  selectedCount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stepRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20, gap: 0 },
  stepDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  stepLine: { flex: 1, height: 2 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15, marginTop: 8 },
  nextBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  exRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 12 },
  exCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  exMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  floatBtn: { position: "absolute", left: 20, right: 20, borderRadius: 18, overflow: "hidden" },
  floatBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  floatBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  configCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  configName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  configRow: { flexDirection: "row", gap: 12 },
  configItem: { flex: 1, gap: 4, alignItems: "center" },
  configLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  configControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  configBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  configVal: { fontSize: 15, fontFamily: "Inter_700Bold", minWidth: 30, textAlign: "center" },
});
