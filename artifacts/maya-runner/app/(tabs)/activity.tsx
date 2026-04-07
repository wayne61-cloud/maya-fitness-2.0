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

type ActivityFilter = "all" | "runner" | "workout" | "yoga" | "nutrition";
type TimeFilter = "all" | "week" | "month";

const RUNNER_RED = "#E8335A";
const WORKOUT_ORANGE = "#FF8C00";
const YOGA_TAUPE = "#9B7B6E";
const NUTRITION_GREEN = "#5B8C5A";

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ActivityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, workouts, yogaRecords, nutritionLog } = useApp();

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

  const showRunner = activity === "all" || activity === "runner";
  const showWorkout = activity === "all" || activity === "workout";
  const showYoga = activity === "all" || activity === "yoga";
  const showNutrition = activity === "all" || activity === "nutrition";

  const filteredRuns = showRunner ? runs.filter((r) => inTimeRange(r.date)) : [];
  const filteredWorkouts = showWorkout ? workouts.filter((w) => inTimeRange(w.date)) : [];
  const filteredYoga = showYoga ? yogaRecords.filter((y) => inTimeRange(y.date)) : [];
  const filteredNutrition = showNutrition
    ? (() => {
        const byDay: Record<string, { date: string; count: number; calories: number; protein: number }> = {};
        nutritionLog.filter((n) => inTimeRange(n.date)).forEach((n) => {
          const day = n.date.substring(0, 10);
          if (!byDay[day]) byDay[day] = { date: n.date, count: 0, calories: 0, protein: 0 };
          byDay[day].count++;
          byDay[day].calories += n.calories;
          byDay[day].protein += n.protein;
        });
        return Object.values(byDay).sort((a, b) => b.date.localeCompare(a.date));
      })()
    : [];

  const allItems: ({ type: "run" | "workout" | "yoga" | "nutrition"; date: string; item: any })[] = [
    ...filteredRuns.map((r) => ({ type: "run" as const, date: r.date, item: r })),
    ...filteredWorkouts.map((w) => ({ type: "workout" as const, date: w.date, item: w })),
    ...filteredYoga.map((y) => ({ type: "yoga" as const, date: y.date, item: y })),
    ...filteredNutrition.map((n) => ({ type: "nutrition" as const, date: n.date, item: n })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const totalKm = filteredRuns.reduce((a, r) => a + r.distance, 0);
  const totalRunTime = filteredRuns.reduce((a, r) => a + r.duration, 0);
  const totalCal =
    filteredRuns.reduce((a, r) => a + r.calories, 0) +
    filteredWorkouts.reduce((a, w) => a + (w.calories || 0), 0) +
    filteredYoga.reduce((a, y) => a + y.calories, 0);
  const totalYogaMin = filteredYoga.reduce((a, y) => a + Math.round(y.duration / 60), 0);
  const totalNutritionCal = filteredNutrition.reduce((a, n) => a + n.calories, 0);

  const FILTERS: { key: ActivityFilter; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "runner", label: "🏃 Course" },
    { key: "workout", label: "🏋️ Muscu" },
    { key: "yoga", label: "🧘 Yoga" },
    { key: "nutrition", label: "🥗 Nutrition" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Activité</Text>

      {/* Activity type filter — horizontal scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: "row" }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: activity === f.key ? colors.primary : colors.card,
                borderColor: activity === f.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActivity(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, { color: activity === f.key ? "#fff" : colors.mutedForeground }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        {showRunner && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: RUNNER_RED + "40" }]}>
            <MaterialCommunityIcons name="run-fast" size={18} color={RUNNER_RED} />
            <Text style={[styles.summaryVal, { color: RUNNER_RED }]}>{totalKm.toFixed(1)}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>km courus</Text>
          </View>
        )}
        {showWorkout && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "40" }]}>
            <Ionicons name="barbell-outline" size={18} color={WORKOUT_ORANGE} />
            <Text style={[styles.summaryVal, { color: WORKOUT_ORANGE }]}>{filteredWorkouts.length}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>séances muscu</Text>
          </View>
        )}
        {showYoga && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: YOGA_TAUPE + "40" }]}>
            <Ionicons name="flower-outline" size={18} color={YOGA_TAUPE} />
            <Text style={[styles.summaryVal, { color: YOGA_TAUPE }]}>{totalYogaMin}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>min yoga</Text>
          </View>
        )}
        {showNutrition && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: NUTRITION_GREEN + "40" }]}>
            <Ionicons name="restaurant-outline" size={18} color={NUTRITION_GREEN} />
            <Text style={[styles.summaryVal, { color: NUTRITION_GREEN }]}>{totalNutritionCal}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>kcal mangées</Text>
          </View>
        )}
        {(showRunner || showWorkout || showYoga) && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flame-outline" size={18} color="#FF8C00" />
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>{totalCal.toLocaleString()}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>kcal brûlées</Text>
          </View>
        )}
        {showRunner && (
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
            Lance une course, une séance, ou pratique le yoga pour voir ton historique ici
          </Text>
        </View>
      ) : (
        allItems.map((entry, idx) => {
          if (entry.type === "run") {
            return <RunCard key={`run-${entry.item.id}`} run={entry.item} />;
          }
          if (entry.type === "workout") {
            const w = entry.item;
            return (
              <View
                key={`workout-${w.id}`}
                style={[styles.activityCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "30" }]}
              >
                <View style={[styles.activityAccent, { backgroundColor: WORKOUT_ORANGE }]} />
                <View style={styles.activityContent}>
                  <View style={styles.activityRow}>
                    <View style={[styles.activityIcon, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
                      <Ionicons name="barbell-outline" size={18} color={WORKOUT_ORANGE} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityTitle, { color: colors.foreground }]}>{w.title || "Séance muscu"}</Text>
                      <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                        {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text style={[styles.activityDuration, { color: WORKOUT_ORANGE }]}>{w.duration}min</Text>
                      {w.calories && (
                        <Text style={[styles.activityCal, { color: colors.mutedForeground }]}>{w.calories} kcal</Text>
                      )}
                    </View>
                  </View>
                  {w.exercises?.length > 0 && (
                    <View style={styles.tagList}>
                      {w.exercises.slice(0, 3).map((e: any, i: number) => (
                        <View key={i} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{e.name} · {e.sets}×{e.reps}</Text>
                        </View>
                      ))}
                      {w.exercises.length > 3 && (
                        <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>+{w.exercises.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          }
          if (entry.type === "yoga") {
            const y = entry.item;
            return (
              <View
                key={`yoga-${y.id}`}
                style={[styles.activityCard, { backgroundColor: colors.card, borderColor: YOGA_TAUPE + "30" }]}
              >
                <View style={[styles.activityAccent, { backgroundColor: YOGA_TAUPE }]} />
                <View style={styles.activityContent}>
                  <View style={styles.activityRow}>
                    <View style={[styles.activityIcon, { backgroundColor: YOGA_TAUPE + "20" }]}>
                      <Ionicons name="flower-outline" size={18} color={YOGA_TAUPE} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityTitle, { color: colors.foreground }]}>{y.title}</Text>
                      <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                        {new Date(y.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text style={[styles.activityDuration, { color: YOGA_TAUPE }]}>{Math.round(y.duration / 60)}min</Text>
                      <Text style={[styles.activityCal, { color: colors.mutedForeground }]}>{y.calories} kcal</Text>
                    </View>
                  </View>
                  <View style={styles.tagList}>
                    <View style={[styles.tag, { backgroundColor: YOGA_TAUPE + "15" }]}>
                      <Text style={[styles.tagText, { color: YOGA_TAUPE }]}>{y.category}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }
          if (entry.type === "nutrition") {
            const n = entry.item;
            return (
              <View
                key={`nutrition-${n.date}`}
                style={[styles.activityCard, { backgroundColor: colors.card, borderColor: NUTRITION_GREEN + "30" }]}
              >
                <View style={[styles.activityAccent, { backgroundColor: NUTRITION_GREEN }]} />
                <View style={styles.activityContent}>
                  <View style={styles.activityRow}>
                    <View style={[styles.activityIcon, { backgroundColor: NUTRITION_GREEN + "20" }]}>
                      <Ionicons name="restaurant-outline" size={18} color={NUTRITION_GREEN} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityTitle, { color: colors.foreground }]}>{n.count} repas trackés</Text>
                      <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                        {new Date(n.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text style={[styles.activityDuration, { color: NUTRITION_GREEN }]}>{n.calories}</Text>
                      <Text style={[styles.activityCal, { color: colors.mutedForeground }]}>kcal</Text>
                    </View>
                  </View>
                  <View style={styles.tagList}>
                    <View style={[styles.tag, { backgroundColor: NUTRITION_GREEN + "15" }]}>
                      <Text style={[styles.tagText, { color: NUTRITION_GREEN }]}>{n.protein}g protéines</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }
          return null;
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
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
  activityCard: {
    borderRadius: 16, borderWidth: 1,
    flexDirection: "row", overflow: "hidden",
  },
  activityAccent: { width: 4 },
  activityContent: { flex: 1, padding: 14, gap: 10 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  activityDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  activityDuration: { fontSize: 16, fontFamily: "Inter_700Bold" },
  activityCal: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tagList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
