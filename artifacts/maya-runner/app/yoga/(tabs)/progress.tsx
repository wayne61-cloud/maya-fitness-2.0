import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { YOGA_CATEGORY_COLORS, type YogaCategory } from "@/constants/yoga-data";

const BG = "#FAF7F4";
const ACCENT = "#9B7B6E";
const TEXT = "#3D2B1F";
const MUTED = "#9E8C7E";
const CARD = "#FFFFFF";
const BORDER = "#EDE8E3";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().substring(0, 10);
  });
}

function getLast8Weeks() {
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i) * 7);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().substring(0, 10);
  });
}

export default function YogaProgress() {
  const insets = useSafeAreaInsets();
  const { yogaRecords, yogaOnboarding, weeklyYoga, totalYogaMinutes } = useAppContext();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const last7 = getLast7Days();
  const last8w = getLast8Weeks();

  const dayActivity = last7.map((day) => yogaRecords.filter((r) => r.date.startsWith(day)).length);
  const weekActivity = last8w.map((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return yogaRecords.filter((r) => {
      const d = new Date(r.date);
      return d >= new Date(weekStart) && d < weekEnd;
    }).length;
  });

  const maxDay = Math.max(...dayActivity, 1);
  const maxWeek = Math.max(...weekActivity, 1);

  const totalCalories = yogaRecords.reduce((a, r) => a + r.calories, 0);
  const totalSessions = yogaRecords.length;
  const streak = yogaRecords.length; // simplified

  // Categories breakdown
  const catCounts: Record<string, number> = {};
  yogaRecords.forEach((r) => {
    catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
  });

  // Top exercises
  const exCounts: Record<string, number> = {};
  yogaRecords.forEach((r) => {
    if (r.exerciseId) exCounts[r.exerciseId] = (exCounts[r.exerciseId] ?? 0) + 1;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Global stats */}
      <View style={styles.statsGrid}>
        {[
          { label: "Séances", value: totalSessions, icon: "play-circle-outline" },
          { label: "Minutes", value: totalYogaMinutes, icon: "time-outline" },
          { label: "Calories", value: `${totalCalories} kcal`, icon: "flame-outline" },
          { label: "Cette semaine", value: weeklyYoga, icon: "calendar-outline" },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: CARD, borderColor: BORDER }]}>
            <Ionicons name={s.icon as any} size={20} color={ACCENT} />
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Week chart */}
      <Text style={styles.sectionTitle}>Cette semaine</Text>
      <View style={[styles.chartCard, { backgroundColor: CARD, borderColor: BORDER }]}>
        <View style={styles.barChart}>
          {dayActivity.map((val, i) => (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(val / maxDay) * 100}%`,
                      backgroundColor: val > 0 ? ACCENT : BORDER,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: MUTED }]}>{DAYS[i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 8-week trend */}
      <Text style={styles.sectionTitle}>Tendance 8 semaines</Text>
      <View style={[styles.chartCard, { backgroundColor: CARD, borderColor: BORDER }]}>
        <View style={styles.barChart}>
          {weekActivity.map((val, i) => (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(val / maxWeek) * 100}%`,
                      backgroundColor: val > 0 ? ACCENT + "BB" : BORDER,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: MUTED }]}>S{i + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Categories practiced */}
      {Object.keys(catCounts).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Disciplines pratiquées</Text>
          <View style={[styles.catCard, { backgroundColor: CARD, borderColor: BORDER }]}>
            {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const color = YOGA_CATEGORY_COLORS[cat as YogaCategory] ?? ACCENT;
              const pct = Math.round((count / totalSessions) * 100);
              return (
                <View key={cat} style={styles.catRow}>
                  <Text style={[styles.catName, { color: TEXT }]}>{cat}</Text>
                  <View style={styles.catBarTrack}>
                    <View style={[styles.catBar, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.catPct, { color: MUTED }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {totalSessions === 0 && (
        <View style={[styles.emptyCard, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={{ fontSize: 40 }}>🌸</Text>
          <Text style={[styles.emptyTitle, { color: TEXT }]}>Ta progression s'affichera ici</Text>
          <Text style={[styles.emptyText, { color: MUTED }]}>
            Commence ta première séance et regarde ta progression s'envoler.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold", color: ACCENT },
  statLabel: { fontSize: 11, color: MUTED, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: TEXT },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  barChart: { flexDirection: "row", height: 100, gap: 6, alignItems: "flex-end" },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  catCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  catName: { width: 90, fontSize: 12, fontFamily: "Inter_500Medium" },
  catBarTrack: { flex: 1, height: 6, backgroundColor: "#EDE8E3", borderRadius: 3, overflow: "hidden" },
  catBar: { height: "100%", borderRadius: 3 },
  catPct: { width: 30, fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
