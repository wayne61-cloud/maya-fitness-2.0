import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SESSIONS } from "@/constants/workout-data";
import { useApp } from "@/context/AppContext";

const WORKOUT_ORANGE = "#FF8C00";

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "#4CAF50",
  "Intermédiaire": "#FF8C00",
  "Avancé": "#E8335A",
};

const SESSION_TYPES = ["Tout", "PPL", "Full Body", "Glutes", "Upper", "Force"];

export default function SessionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customSessions, deleteCustomSession } = useApp();
  const [filter, setFilter] = useState("Tout");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = SESSIONS.filter((s) => filter === "Tout" || s.type === filter);

  function confirmDelete(id: string, name: string) {
    Alert.alert("Supprimer la séance", `Supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteCustomSession(id) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Custom sessions */}
      {customSessions.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mes séances</Text>
          {customSessions.map((cs) => (
            <View key={cs.id} style={[styles.customCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "60", borderLeftColor: WORKOUT_ORANGE }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionName, { color: colors.foreground }]}>{cs.name}</Text>
                {cs.description ? <Text style={[styles.sessionDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{cs.description}</Text> : null}
                <Text style={[styles.customMeta, { color: colors.mutedForeground }]}>
                  {cs.exercises.length} exercices · {cs.durationMin} min
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: WORKOUT_ORANGE }]}
                onPress={() => Alert.alert("Démarrer", `Commencer "${cs.name}" ?`)}
              >
                <Ionicons name="play" size={12} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(cs.id, cs.name)} style={{ paddingHorizontal: 8 }}>
                <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </>
      )}
      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
        {SESSION_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === t ? WORKOUT_ORANGE : colors.card,
                borderColor: filter === t ? WORKOUT_ORANGE : colors.border,
              },
            ]}
            onPress={() => setFilter(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, { color: filter === t ? "#fff" : colors.foreground }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.countText, { color: colors.mutedForeground }]}>
        {filtered.length} programme{filtered.length !== 1 ? "s" : ""}
      </Text>

      {filtered.map((session) => (
        <TouchableOpacity
          key={session.id}
          style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push(`/workout/session/${session.id}`)}
          activeOpacity={0.8}
        >
          {/* Color accent bar */}
          <View style={[styles.accentBar, { backgroundColor: LEVEL_COLORS[session.level] }]} />
          <View style={styles.sessionContent}>
            <View style={styles.sessionTop}>
              <View style={{ flex: 1, gap: 3 }}>
                {session.tag && (
                  <Text style={[styles.sessionTag, { color: WORKOUT_ORANGE }]}>{session.tag}</Text>
                )}
                <Text style={[styles.sessionName, { color: colors.foreground }]}>{session.name}</Text>
                <Text style={[styles.sessionDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {session.description}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[session.level] + "20" }]}>
                <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[session.level] }]}>
                  {session.level}
                </Text>
              </View>
            </View>

            {/* Muscle groups */}
            <View style={styles.muscleRow}>
              {session.muscleGroups.map((m) => (
                <View key={m} style={[styles.muscleBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.muscleBadgeText, { color: colors.mutedForeground }]}>{m}</Text>
                </View>
              ))}
            </View>

            {/* Meta info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{session.durationMin} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{session.calories} kcal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{session.exercises.length} exercices</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={[styles.startBtn, { backgroundColor: WORKOUT_ORANGE }]}>
                <Text style={styles.startBtnText}>Commencer</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>

      {/* FAB — Créer une séance */}
      <TouchableOpacity
        style={[styles.fab, { bottom: bottomPad + 100, backgroundColor: WORKOUT_ORANGE }]}
        onPress={() => router.push("/workout/session/create")}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Créer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  filterContent: { gap: 8, paddingRight: 20 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  countText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionCard: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden", flexDirection: "row",
  },
  accentBar: { width: 4 },
  sessionContent: { flex: 1, padding: 14, gap: 10 },
  sessionTop: { flexDirection: "row", gap: 12 },
  sessionTag: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  sessionName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sessionDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  levelBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  levelBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  muscleRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  muscleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  muscleBadgeText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  startBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  startBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  customCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 12 },
  customMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: 1, marginVertical: 4 },
  fab: { position: "absolute", right: 20, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 28, paddingHorizontal: 18, paddingVertical: 13, elevation: 4, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  fabText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
