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
import { useAppContext } from "@/context/AppContext";

const BG = "#F6FAF0";
const ACCENT = "#5B8C5A";
const TEXT = "#2D4A2B";
const MUTED = "#7A9878";
const CARD = "#FFFFFF";
const BORDER = "#D4E8D0";
const WARM = "#E8844A";

type Period = "Jour" | "Semaine" | "Mois";

function getDateRange(period: Period): Date[] {
  const today = new Date();
  if (period === "Jour") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 6 + i);
      return d;
    });
  }
  if (period === "Semaine") {
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 21 + i * 7);
      return d;
    });
  }
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - 5 + i);
    return d;
  });
}

function formatLabel(d: Date, period: Period): string {
  if (period === "Jour") return ["L", "M", "M", "J", "V", "S", "D"][d.getDay() === 0 ? 6 : d.getDay() - 1];
  if (period === "Semaine") return `S${Math.ceil(d.getDate() / 7)}`;
  return d.toLocaleString("fr", { month: "short" }).slice(0, 3);
}

export default function CaloriesScreen() {
  const insets = useSafeAreaInsets();
  const { nutritionLog, nutritionOnboarding, todayCaloriesConsumed, todayProtein, todayCarbs, todayFat } = useAppContext();
  const [period, setPeriod] = useState<Period>("Jour");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const GOAL = nutritionOnboarding?.objective === "Prise de masse" ? 2800 :
    nutritionOnboarding?.objective === "Perte de poids" ? 1600 :
    nutritionOnboarding?.objective === "Sèche" ? 1800 : 2200;

  const dates = getDateRange(period);
  const barData = dates.map((d) => {
    const prefix = d.toISOString().substring(0, period === "Mois" ? 7 : 10);
    return nutritionLog.filter((e) => e.date.startsWith(prefix)).reduce((a, e) => a + e.calories, 0);
  });
  const maxBar = Math.max(...barData, 1, GOAL);

  const pctGoal = Math.min(Math.round((todayCaloriesConsumed / GOAL) * 100), 100);
  const remaining = Math.max(GOAL - todayCaloriesConsumed, 0);

  const macroTotal = todayProtein * 4 + todayCarbs * 4 + todayFat * 9;
  const macroData = macroTotal > 0 ? [
    { label: "Protéines", val: todayProtein, color: "#4A90D9", pct: Math.round((todayProtein * 4 / macroTotal) * 100) },
    { label: "Glucides", val: todayCarbs, color: WARM, pct: Math.round((todayCarbs * 4 / macroTotal) * 100) },
    { label: "Lipides", val: todayFat, color: "#D9534A", pct: Math.round((todayFat * 9 / macroTotal) * 100) },
  ] : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's target */}
      <View style={[styles.targetCard, { backgroundColor: CARD, borderColor: BORDER }]}>
        <View style={styles.targetHeader}>
          <View>
            <Text style={[styles.targetLabel, { color: MUTED }]}>Calories consommées</Text>
            <Text style={[styles.targetVal, { color: TEXT }]}>{todayCaloriesConsumed}<Text style={[styles.targetGoal, { color: MUTED }]}> / {GOAL}</Text></Text>
          </View>
          <View style={[styles.pctCircle, { borderColor: ACCENT }]}>
            <Text style={[styles.pctText, { color: ACCENT }]}>{pctGoal}%</Text>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: BORDER }]}>
          <View style={[styles.progressBar, { width: `${pctGoal}%`, backgroundColor: pctGoal >= 100 ? WARM : ACCENT }]} />
        </View>
        <Text style={[styles.remainingText, { color: MUTED }]}>
          {remaining > 0 ? `Encore ${remaining} kcal pour atteindre l'objectif` : "Objectif atteint ! 🎉"}
        </Text>
      </View>

      {/* Macros breakdown */}
      {macroData.length > 0 && (
        <View style={[styles.macroCard, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.macroTitle, { color: TEXT }]}>Répartition des macros</Text>
          <View style={styles.macroBarTrack}>
            {macroData.map((m) => (
              <View key={m.label} style={[styles.macroBarSeg, { flex: m.pct, backgroundColor: m.color }]} />
            ))}
          </View>
          <View style={styles.macroLegend}>
            {macroData.map((m) => (
              <View key={m.label} style={styles.macroLegendItem}>
                <View style={[styles.macroLegendDot, { backgroundColor: m.color }]} />
                <Text style={[styles.macroLegendLabel, { color: MUTED }]}>{m.label}</Text>
                <Text style={[styles.macroLegendVal, { color: TEXT }]}>{m.val}g</Text>
                <Text style={[styles.macroLegendPct, { color: m.color }]}>{m.pct}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Period selector */}
      <View style={styles.periodRow}>
        {(["Jour", "Semaine", "Mois"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, { backgroundColor: period === p ? ACCENT : CARD, borderColor: period === p ? ACCENT : BORDER }]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, { color: period === p ? "#fff" : MUTED }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bar chart */}
      <View style={[styles.chartCard, { backgroundColor: CARD, borderColor: BORDER }]}>
        <Text style={[styles.chartTitle, { color: TEXT }]}>Historique — {period}</Text>
        <View style={styles.barChart}>
          {barData.map((val, i) => (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${(val / maxBar) * 100}%`, backgroundColor: val > 0 ? ACCENT : BORDER }]} />
                {/* Goal line */}
                <View style={[styles.goalLine, { bottom: `${(GOAL / maxBar) * 100}%`, backgroundColor: WARM + "80" }]} />
              </View>
              <Text style={[styles.barLabel, { color: MUTED }]}>{formatLabel(dates[i], period)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: ACCENT }]} />
          <Text style={[styles.legendText, { color: MUTED }]}>Consommé</Text>
          <View style={[styles.legendDot, { backgroundColor: WARM }]} />
          <Text style={[styles.legendText, { color: MUTED }]}>Objectif</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  targetCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  targetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  targetLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  targetVal: { fontSize: 32, fontFamily: "Inter_700Bold" },
  targetGoal: { fontSize: 16, fontFamily: "Inter_400Regular" },
  pctCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  pctText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 4 },
  remainingText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  macroCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  macroTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  macroBarTrack: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 1 },
  macroBarSeg: { borderRadius: 0 },
  macroLegend: { gap: 8 },
  macroLegendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  macroLegendDot: { width: 8, height: 8, borderRadius: 4 },
  macroLegendLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  macroLegendVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  macroLegendPct: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 36, textAlign: "right" },
  periodRow: { flexDirection: "row", gap: 8 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  periodText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  chartTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  barChart: { flexDirection: "row", height: 120, gap: 6, alignItems: "flex-end" },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end", position: "relative" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  goalLine: { position: "absolute", left: 0, right: 0, height: 1.5 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  chartLegend: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular", marginRight: 6 },
});
