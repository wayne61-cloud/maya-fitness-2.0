import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { useApp } from "@/context/AppContext";

const HUB_GOLD = "#FFD60A";
const RUNNER_RED = "#E8335A";
const WORKOUT_ORANGE = "#FF8C00";

const GOALS = [
  { id: "prise_masse", label: "Prise de masse", icon: "arrow-up-circle-outline" },
  { id: "perte_poids", label: "Perte de poids", icon: "trending-down-outline" },
  { id: "tonification", label: "Tonification", icon: "body-outline" },
  { id: "performance", label: "Performance", icon: "flash-outline" },
  { id: "sante", label: "Santé générale", icon: "heart-outline" },
];

const LEVELS = ["Débutant", "Intermédiaire", "Avancé"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, runs, workouts, totalDistance } = useApp();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalTime = runs.reduce((acc, r) => acc + r.duration, 0);
  const totalCal =
    runs.reduce((a, r) => a + r.calories, 0) +
    workouts.reduce((a, w) => a + (w.calories || 0), 0);

  async function save() {
    await updateProfile({
      ...form,
      name: form.name || "Athlete",
      age: Number(form.age) || 25,
      weight: Number(form.weight) || 70,
      height: Number(form.height) || 170,
      weeklyGoal: Number(form.weeklyGoal) || 30,
    });
    setEditing(false);
    Alert.alert("✅ Profil mis à jour !");
  }

  const bmi = profile.height > 0 ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : "--";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: HUB_GOLD + "44" }]}>
          <View style={[styles.avatarWrap, { borderColor: HUB_GOLD }]}>
            <Image source={require("@/assets/images/icon.png")} style={styles.avatar} resizeMode="cover" />
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: colors.foreground }]}>{profile.name}</Text>
            {profile.email && (
              <Text style={[styles.heroEmail, { color: colors.mutedForeground }]}>{profile.email}</Text>
            )}
            <View style={styles.heroTags}>
              {profile.level && (
                <View style={[styles.tag, { backgroundColor: HUB_GOLD + "22", borderColor: HUB_GOLD + "44" }]}>
                  <Text style={[styles.tagText, { color: HUB_GOLD }]}>{profile.level}</Text>
                </View>
              )}
              {profile.goal && (
                <View style={[styles.tag, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {GOALS.find((g) => g.id === profile.goal)?.label || profile.goal}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: editing ? HUB_GOLD : colors.secondary }]}
            onPress={() => (editing ? save() : setEditing(true))}
            activeOpacity={0.8}
          >
            <Ionicons name={editing ? "checkmark" : "pencil-outline"} size={16} color={editing ? "#000" : colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Global stats */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Statistiques globales</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: "footsteps-outline", val: `${totalDistance.toFixed(1)} km`, lbl: "Distance totale", color: RUNNER_RED },
            { icon: "barbell-outline", val: `${runs.length + workouts.length}`, lbl: "Séances totales", color: WORKOUT_ORANGE },
            { icon: "flame-outline", val: totalCal.toLocaleString(), lbl: "Calories totales", color: "#FF6B35" },
            { icon: "time-outline", val: `${Math.floor(totalTime / 3600)}h`, lbl: "Temps actif", color: "#4FC3F7" },
          ].map((s) => (
            <View key={s.lbl} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Physical info */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Informations physiques</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editing ? (
            <View style={{ gap: 12 }}>
              {[
                { key: "name", label: "Prénom", type: "default" },
                { key: "age", label: "Âge", type: "numeric" },
                { key: "weight", label: "Poids (kg)", type: "numeric" },
                { key: "height", label: "Taille (cm)", type: "numeric" },
                { key: "weeklyGoal", label: "Objectif hebdo course (km)", type: "numeric" },
                { key: "email", label: "Email", type: "email-address" },
              ].map((field) => (
                <View key={field.key} style={[styles.fieldRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { color: colors.foreground, borderBottomColor: HUB_GOLD }]}
                    value={String((form as any)[field.key] || "")}
                    onChangeText={(v) => setForm((p) => ({ ...p, [field.key]: v }))}
                    keyboardType={field.type as any}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              ))}

              {/* Goal selection */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Objectif fitness</Text>
              <View style={styles.goalPills}>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.goalPill,
                      {
                        backgroundColor: form.goal === g.id ? HUB_GOLD + "22" : colors.secondary,
                        borderColor: form.goal === g.id ? HUB_GOLD : colors.border,
                      },
                    ]}
                    onPress={() => setForm((p) => ({ ...p, goal: g.id }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.goalPillText, { color: form.goal === g.id ? HUB_GOLD : colors.foreground }]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Level selection */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Niveau</Text>
              <View style={styles.goalPills}>
                {LEVELS.map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[
                      styles.goalPill,
                      {
                        backgroundColor: form.level === l ? HUB_GOLD + "22" : colors.secondary,
                        borderColor: form.level === l ? HUB_GOLD : colors.border,
                      },
                    ]}
                    onPress={() => setForm((p) => ({ ...p, level: l }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.goalPillText, { color: form.level === l ? HUB_GOLD : colors.foreground }]}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: HUB_GOLD }]}
                onPress={save}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={styles.saveBtnText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 0 }}>
              {[
                { label: "Prénom", val: profile.name },
                { label: "Âge", val: `${profile.age} ans` },
                { label: "Poids", val: `${profile.weight} kg` },
                { label: "Taille", val: `${profile.height} cm` },
                { label: "IMC", val: bmi },
                { label: "Objectif course", val: `${profile.weeklyGoal} km / semaine` },
              ].map((item, i) => (
                <View
                  key={item.label}
                  style={[styles.fieldRow, { borderBottomColor: colors.border, borderBottomWidth: i < 5 ? 1 : 0 }]}
                >
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                  <Text style={[styles.fieldVal, { color: colors.foreground }]}>{item.val}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 16 },
  hero: {
    borderRadius: 20, borderWidth: 1, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  avatarWrap: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  heroTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  tagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%", borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 6,
  },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  fieldRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 12,
  },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  fieldVal: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  fieldInput: {
    fontSize: 14, fontFamily: "Inter_600SemiBold",
    borderBottomWidth: 1, textAlign: "right", minWidth: 100, paddingBottom: 2,
  },
  goalPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  goalPillText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 14, marginTop: 6,
  },
  saveBtnText: { color: "#000", fontSize: 15, fontFamily: "Inter_700Bold" },
});
