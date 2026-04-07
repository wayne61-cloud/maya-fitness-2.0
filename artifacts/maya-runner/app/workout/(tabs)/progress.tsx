import { Ionicons } from "@expo/vector-icons";
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

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const colors = useColors();
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={[miniBarStyles.track, { backgroundColor: colors.secondary }]}>
      <View style={[miniBarStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const miniBarStyles = StyleSheet.create({
  track: { height: 7, borderRadius: 4, overflow: "hidden", flex: 1 },
  fill: { height: "100%", borderRadius: 4 },
});

export default function WorkoutProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workouts, workoutOnboarding } = useApp();
  const [tab, setTab] = useState<"stats" | "history">("stats");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalWorkouts = workouts.length;
  const totalCal = workouts.reduce((a, w) => a + (w.calories || 0), 0);
  const totalMin = workouts.reduce((a, w) => a + w.duration, 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMin / totalWorkouts) : 0;

  // Last 8 weeks workout count
  const now = new Date();
  const weekData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7 - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= weekStart && d < weekEnd;
    }).length;
    return { label: `S${i + 1}`, count };
  });
  const maxWeek = Math.max(...weekData.map((w) => w.count), 1);

  // Exercise frequency
  const exoFreq: Record<string, number> = {};
  workouts.forEach((w) => {
    w.exercises.forEach((e) => {
      exoFreq[e.name] = (exoFreq[e.name] || 0) + 1;
    });
  });
  const topExercises = Object.entries(exoFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxExo = topExercises[0]?.[1] || 1;

  const oneWeekAgo = Date.now() - 7 * 86400000;
  const weeklyWorkouts = workouts.filter((w) => new Date(w.date).getTime() > oneWeekAgo).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Progression</Text>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "stats" && { backgroundColor: WORKOUT_ORANGE }]}
          onPress={() => setTab("stats")}
          activeOpacity={0.7}
        >
          <Ionicons name="stats-chart-outline" size={14} color={tab === "stats" ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.tabText, { color: tab === "stats" ? "#fff" : colors.mutedForeground }]}>Statistiques</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "history" && { backgroundColor: WORKOUT_ORANGE }]}
          onPress={() => setTab("history")}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={14} color={tab === "history" ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.tabText, { color: tab === "history" ? "#fff" : colors.mutedForeground }]}>Historique</Text>
        </TouchableOpacity>
      </View>

      {tab === "stats" && (
        <>
          {/* Summary cards */}
          <View style={styles.statsGrid}>
            {[
              { icon: "barbell-outline", val: String(totalWorkouts), lbl: "Séances totales", color: WORKOUT_ORANGE },
              { icon: "flame-outline", val: totalCal.toLocaleString(), lbl: "Calories brûlées", color: "#FF6B35" },
              { icon: "time-outline", val: `${Math.floor(totalMin / 60)}h`, lbl: "Temps total", color: "#4FC3F7" },
              { icon: "trending-up-outline", val: `${avgDuration}min`, lbl: "Durée moyenne", color: colors.success },
            ].map((s) => (
              <View key={s.lbl} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          {/* 8-week chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>Séances / semaine (8 semaines)</Text>
            <View style={styles.chartBars}>
              {weekData.map((w) => (
                <View key={w.label} style={styles.chartBarCol}>
                  <Text style={[styles.chartVal, { color: WORKOUT_ORANGE }]}>
                    {w.count > 0 ? w.count : ""}
                  </Text>
                  <View style={styles.chartBarWrap}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: Math.max((w.count / maxWeek) * 80, 4),
                          backgroundColor: w.count > 0 ? WORKOUT_ORANGE : colors.secondary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>{w.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top exercises */}
          {topExercises.length > 0 && (
            <View style={[styles.topCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.topTitle, { color: colors.foreground }]}>Exercices les plus pratiqués</Text>
              <View style={{ gap: 10 }}>
                {topExercises.map(([name, count]) => (
                  <View key={name} style={styles.topRow}>
                    <Text style={[styles.topName, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>
                    <MiniBar value={count} max={maxExo} color={WORKOUT_ORANGE} />
                    <Text style={[styles.topCount, { color: WORKOUT_ORANGE }]}>{count}×</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Onboarding info */}
          {workoutOnboarding && (
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "40" }]}>
              <Text style={[styles.profileTitle, { color: colors.foreground }]}>Mon profil muscu</Text>
              {[
                { lbl: "Niveau", val: workoutOnboarding.level },
                { lbl: "Objectif", val: workoutOnboarding.goal.replace("_", " ") },
                { lbl: "Fréquence", val: `${workoutOnboarding.frequency}× / semaine` },
                { lbl: "Zones", val: workoutOnboarding.areas.join(", ") },
              ].map((item) => (
                <View key={item.lbl} style={[styles.profileRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.profileLbl, { color: colors.mutedForeground }]}>{item.lbl}</Text>
                  <Text style={[styles.profileVal, { color: colors.foreground }]}>{item.val}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {tab === "history" && (
        <>
          {workouts.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Ionicons name="barbell-outline" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune séance enregistrée</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Lance ta première séance pour la voir apparaître ici
              </Text>
            </View>
          ) : (
            workouts.map((w) => (
              <View
                key={w.id}
                style={[styles.historyCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "30" }]}
              >
                <View style={[styles.historyAccent, { backgroundColor: WORKOUT_ORANGE }]} />
                <View style={styles.historyContent}>
                  <View style={styles.historyRow}>
                    <Text style={[styles.historyTitle, { color: colors.foreground }]}>{w.title || "Séance muscu"}</Text>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                      {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                  <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>
                    {w.duration}min · {w.exercises.length} ex · {w.calories || "—"} kcal
                  </Text>
                  <View style={styles.historyExos}>
                    {w.exercises.slice(0, 3).map((e, i) => (
                      <View key={i} style={[styles.exoBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.exoBadgeText, { color: colors.mutedForeground }]}>
                          {e.name} {e.sets}×{e.reps}
                        </Text>
                      </View>
                    ))}
                    {w.exercises.length > 3 && (
                      <View style={[styles.exoBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.exoBadgeText, { color: colors.mutedForeground }]}>+{w.exercises.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  tabs: {
    flexDirection: "row", borderRadius: 12, padding: 3,
    borderWidth: 1, gap: 3,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: "center", flexDirection: "row",
    justifyContent: "center", gap: 6,
  },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%", borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 6,
  },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_500Medium" },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  chartTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", height: 110, gap: 6 },
  chartBarCol: { flex: 1, alignItems: "center", gap: 4 },
  chartVal: { fontSize: 10, fontFamily: "Inter_600SemiBold", height: 14 },
  chartBarWrap: { flex: 1, justifyContent: "flex-end", width: "100%" },
  chartBar: { borderRadius: 4, width: "100%" },
  chartLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  topCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  topTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  topName: { width: 130, fontSize: 12, fontFamily: "Inter_500Medium" },
  topCount: { fontSize: 12, fontFamily: "Inter_700Bold", width: 28, textAlign: "right" },
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 0 },
  profileTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  profileRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  profileLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  profileVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
  emptyState: {
    borderRadius: 16, borderWidth: 1, borderStyle: "dashed",
    padding: 32, alignItems: "center", gap: 12, marginTop: 16,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  historyCard: {
    borderRadius: 14, borderWidth: 1, flexDirection: "row", overflow: "hidden",
  },
  historyAccent: { width: 4 },
  historyContent: { flex: 1, padding: 14, gap: 6 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  historyMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  historyExos: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  exoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  exoBadgeText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
