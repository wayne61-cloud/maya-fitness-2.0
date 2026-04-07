import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { RunCard } from "@/components/RunCard";

type ActivityFilter = "all" | "runner" | "workout";
type TimeFilter = "all" | "week" | "month";

const RUNNER_RED = "#E8335A";
const WORKOUT_ORANGE = "#FF8C00";

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ActivityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, workouts } = useApp();

  const [activity, setActivity] = useState<ActivityFilter>("all");
  const [time, setTime] = useState<TimeFilter>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const now = Date.now();
  function inTimeRange(date: string) {
    const t = new Date(date).getTime();
    if (time === "week") return now - t < 7 * 86400000;
    if (time === "month") return now - t < 30 * 86400000;
    return true;
  }

  const filteredRuns = runs.filter((r) => activity !== "workout" && inTimeRange(r.date));
  const filteredWorkouts = workouts.filter((w) => activity !== "runner" && inTimeRange(w.date));

  const allItems: ({ type: "run"; date: string; item: any } | { type: "workout"; date: string; item: any })[] = [
    ...filteredRuns.map((r) => ({ type: "run" as const, date: r.date, item: r })),
    ...filteredWorkouts.map((w) => ({ type: "workout" as const, date: w.date, item: w })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const totalKm = filteredRuns.reduce((a, r) => a + r.distance, 0);
  const totalRunTime = filteredRuns.reduce((a, r) => a + r.duration, 0);
  const totalCal =
    filteredRuns.reduce((a, r) => a + r.calories, 0) +
    filteredWorkouts.reduce((a, w) => a + (w.calories || 0), 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Activité</Text>

      {/* Activity type filter */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {([
          { key: "all", label: "Tout" },
          { key: "runner", label: "🏃 Course" },
          { key: "workout", label: "🏋️ Muscu" },
        ] as { key: ActivityFilter; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.tabBtn, activity === f.key && { backgroundColor: colors.primary }]}
            onPress={() => setActivity(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: activity === f.key ? "#fff" : colors.mutedForeground }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time filter */}
      <View style={styles.timeRow}>
        {([
          { key: "all", label: "Tout" },
          { key: "week", label: "7 jours" },
          { key: "month", label: "30 jours" },
        ] as { key: TimeFilter; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.timeBtn, time === f.key && { borderColor: colors.primary }]}
            onPress={() => setTime(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeText, { color: time === f.key ? colors.primary : colors.mutedForeground }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        {activity !== "workout" && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: RUNNER_RED + "40" }]}>
            <MaterialCommunityIcons name="run-fast" size={18} color={RUNNER_RED} />
            <Text style={[styles.summaryVal, { color: RUNNER_RED }]}>{totalKm.toFixed(1)}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>km courus</Text>
          </View>
        )}
        {activity !== "runner" && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "40" }]}>
            <Ionicons name="barbell-outline" size={18} color={WORKOUT_ORANGE} />
            <Text style={[styles.summaryVal, { color: WORKOUT_ORANGE }]}>{filteredWorkouts.length}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>séances muscu</Text>
          </View>
        )}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="flame-outline" size={18} color="#FF8C00" />
          <Text style={[styles.summaryVal, { color: colors.foreground }]}>{totalCal.toLocaleString()}</Text>
          <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>kcal total</Text>
        </View>
        {activity !== "workout" && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={18} color="#4FC3F7" />
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>{formatDuration(totalRunTime)}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>temps course</Text>
          </View>
        )}
      </View>

      {/* Activity list */}
      {allItems.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <Ionicons name="pulse-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune activité</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Lance une course ou une séance muscu pour voir ton historique ici
          </Text>
        </View>
      ) : (
        allItems.map((entry) => {
          if (entry.type === "run") {
            return <RunCard key={`run-${entry.item.id}`} run={entry.item} />;
          }
          const w = entry.item;
          return (
            <View
              key={`workout-${w.id}`}
              style={[styles.workoutCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "30" }]}
            >
              <View style={[styles.workoutAccent, { backgroundColor: WORKOUT_ORANGE }]} />
              <View style={styles.workoutContent}>
                <View style={styles.workoutRow}>
                  <View style={[styles.workoutIcon, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
                    <Ionicons name="barbell-outline" size={18} color={WORKOUT_ORANGE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.workoutTitle, { color: colors.foreground }]}>
                      {w.title || "Séance muscu"}
                    </Text>
                    <Text style={[styles.workoutDate, { color: colors.mutedForeground }]}>
                      {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 2 }}>
                    <Text style={[styles.workoutDuration, { color: WORKOUT_ORANGE }]}>{w.duration}min</Text>
                    {w.calories && (
                      <Text style={[styles.workoutCal, { color: colors.mutedForeground }]}>{w.calories} kcal</Text>
                    )}
                  </View>
                </View>
                {w.exercises.length > 0 && (
                  <View style={styles.exoList}>
                    {w.exercises.slice(0, 3).map((e: any, i: number) => (
                      <View key={i} style={[styles.exoBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.exoBadgeText, { color: colors.mutedForeground }]}>
                          {e.name} · {e.sets}×{e.reps}
                        </Text>
                      </View>
                    ))}
                    {w.exercises.length > 3 && (
                      <View style={[styles.exoBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.exoBadgeText, { color: colors.mutedForeground }]}>
                          +{w.exercises.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  tabRow: {
    flexDirection: "row", borderRadius: 12, padding: 3,
    borderWidth: 1, gap: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  timeRow: { flexDirection: "row", gap: 8 },
  timeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "transparent" },
  timeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryCard: {
    flex: 1, minWidth: "30%", borderRadius: 14, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 4,
  },
  summaryVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLbl: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyState: {
    borderRadius: 16, borderWidth: 1, borderStyle: "dashed",
    padding: 36, alignItems: "center", gap: 12, marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  workoutCard: {
    borderRadius: 16, borderWidth: 1,
    flexDirection: "row", overflow: "hidden",
  },
  workoutAccent: { width: 4 },
  workoutContent: { flex: 1, padding: 14, gap: 10 },
  workoutRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  workoutIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  workoutTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  workoutDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  workoutDuration: { fontSize: 16, fontFamily: "Inter_700Bold" },
  workoutCal: { fontSize: 11, fontFamily: "Inter_400Regular" },
  exoList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  exoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  exoBadgeText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
