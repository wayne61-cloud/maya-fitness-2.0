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
import { SESSIONS } from "@/constants/workout-data";

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
  const [filter, setFilter] = useState("Tout");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = SESSIONS.filter((s) => filter === "Tout" || s.type === filter);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
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
});
