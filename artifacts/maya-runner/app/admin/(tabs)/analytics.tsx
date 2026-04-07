import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG = "#0D0D0D";
const CARD = "#141414";
const BORDER = "#1E1E1E";

type Period = "7j" | "30j" | "90j";

const DATA_7J = [
  { day: "L", users: 120, sessions: 48 },
  { day: "M", users: 145, sessions: 62 },
  { day: "M", users: 98, sessions: 34 },
  { day: "J", users: 170, sessions: 75 },
  { day: "V", users: 200, sessions: 90 },
  { day: "S", users: 260, sessions: 115 },
  { day: "D", users: 210, sessions: 95 },
];

const MODULES_STATS = [
  { name: "Maya Runner", users: 842, pct: 67, color: "#E8335A" },
  { name: "Maya Workout", users: 610, pct: 49, color: "#FF8C00" },
  { name: "Maya Yoga", users: 380, pct: 30, color: "#9B7B6E" },
  { name: "Maya Nutrition", users: 290, pct: 23, color: "#5B8C5A" },
];

const RETENTION = [
  { label: "J1", pct: 100, color: "#FFD60A" },
  { label: "J7", pct: 72, color: "#FF8C00" },
  { label: "J14", pct: 55, color: "#E8335A" },
  { label: "J30", pct: 38, color: "#9B59B6" },
  { label: "J60", pct: 24, color: "#555" },
];

export default function AdminAnalytics() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("7j");

  const maxUsers = Math.max(...DATA_7J.map((d) => d.users));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Analytics</Text>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {(["7j", "30j", "90j"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KPI row */}
      <View style={styles.kpiRow}>
        <KpiCard label="Utilisateurs actifs" value="1 248" sub="+12% vs semaine passée" color="#FFD60A" icon="people" />
        <KpiCard label="Sessions totales" value="8 340" sub="+8% vs semaine passée" color="#5B8C5A" icon="fitness" />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Durée moy. session" value="32 min" sub="+2 min vs mois passé" color="#FF8C00" icon="time" />
        <KpiCard label="Taux de rétention J7" value="72%" sub="+5pts vs mois passé" color="#9B7B6E" icon="refresh" />
      </View>

      {/* Bar chart */}
      <Text style={styles.sectionTitle}>Utilisateurs actifs — 7 derniers jours</Text>
      <View style={styles.chartCard}>
        <View style={styles.chartBars}>
          {DATA_7J.map((d, i) => (
            <View key={i} style={styles.barCol}>
              <Text style={styles.barValue}>{d.users}</Text>
              <View style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(8, (d.users / maxUsers) * 120),
                      backgroundColor: "#FFD60A",
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{d.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Module usage */}
      <Text style={styles.sectionTitle}>Utilisation par module</Text>
      <View style={styles.card}>
        {MODULES_STATS.map((m) => (
          <View key={m.name} style={styles.moduleRow}>
            <View style={[styles.moduleDot, { backgroundColor: m.color }]} />
            <Text style={styles.moduleName}>{m.name}</Text>
            <View style={styles.moduleBarWrap}>
              <View style={[styles.moduleBar, { width: `${m.pct}%`, backgroundColor: m.color + "66" }]}>
                <View style={[styles.moduleBarFill, { width: "100%", backgroundColor: m.color }]} />
              </View>
            </View>
            <Text style={styles.modulePct}>{m.pct}%</Text>
          </View>
        ))}
      </View>

      {/* Retention */}
      <Text style={styles.sectionTitle}>Courbe de rétention</Text>
      <View style={styles.card}>
        <View style={styles.retentionRow}>
          {RETENTION.map((r) => (
            <View key={r.label} style={styles.retentionItem}>
              <Text style={[styles.retentionPct, { color: r.color }]}>{r.pct}%</Text>
              <View style={styles.retentionBarWrap}>
                <View style={[styles.retentionBar, { height: (r.pct / 100) * 80, backgroundColor: r.color }]} />
              </View>
              <Text style={styles.retentionLabel}>{r.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top events */}
      <Text style={styles.sectionTitle}>Top événements</Text>
      <View style={styles.card}>
        {[
          { event: "session_completed", count: "3 214", icon: "checkmark-circle" as const, color: "#5B8C5A" },
          { event: "run_saved", count: "1 842", icon: "walk" as const, color: "#E8335A" },
          { event: "recipe_viewed", count: "1 105", icon: "restaurant" as const, color: "#5B8C5A" },
          { event: "yoga_started", count: "892", icon: "body" as const, color: "#9B7B6E" },
          { event: "onboarding_completed", count: "341", icon: "flag" as const, color: "#FFD60A" },
        ].map((e, i) => (
          <View key={i} style={[styles.eventRow, i > 0 && { borderTopWidth: 1, borderTopColor: BORDER }]}>
            <View style={[styles.eventIcon, { backgroundColor: e.color + "22" }]}>
              <Ionicons name={e.icon} size={16} color={e.color} />
            </View>
            <Text style={styles.eventName}>{e.event}</Text>
            <Text style={styles.eventCount}>{e.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: any }) {
    return (
      <View style={[styles.kpiCard]}>
        <View style={[styles.kpiIcon, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiSub}>{sub}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold", marginBottom: 16 },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  periodChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: BORDER },
  periodChipActive: { backgroundColor: "#FFD60A22", borderColor: "#FFD60A66" },
  periodText: { fontSize: 13, color: "#666", fontFamily: "Inter_500Medium" },
  periodTextActive: { color: "#FFD60A" },
  kpiRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  kpiValue: { fontSize: 22, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 12, color: "#666", fontFamily: "Inter_400Regular", marginTop: 2 },
  kpiSub: { fontSize: 11, color: "#5B8C5A", fontFamily: "Inter_400Regular", marginTop: 4 },
  sectionTitle: { fontSize: 13, color: "#555", fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 24, marginBottom: 12 },
  chartCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  chartBars: { flexDirection: "row", alignItems: "flex-end", height: 160, gap: 6 },
  barCol: { flex: 1, alignItems: "center" },
  barValue: { fontSize: 10, color: "#666", fontFamily: "Inter_400Regular", marginBottom: 4 },
  barWrap: { width: "100%", height: 120, justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "80%", borderRadius: 4 },
  barLabel: { fontSize: 11, color: "#666", fontFamily: "Inter_500Medium", marginTop: 6 },
  card: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  moduleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  moduleDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  moduleName: { width: 110, fontSize: 13, color: "#CCC", fontFamily: "Inter_400Regular" },
  moduleBarWrap: { flex: 1, height: 8, backgroundColor: "#1A1A1A", borderRadius: 4, overflow: "hidden", marginHorizontal: 10 },
  moduleBar: { height: "100%", borderRadius: 4 },
  moduleBarFill: { height: "100%", borderRadius: 4 },
  modulePct: { fontSize: 13, color: "#888", fontFamily: "Inter_600SemiBold", width: 35, textAlign: "right" },
  retentionRow: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 10 },
  retentionItem: { flex: 1, alignItems: "center" },
  retentionPct: { fontSize: 12, fontFamily: "Inter_700Bold", marginBottom: 4 },
  retentionBarWrap: { width: "100%", justifyContent: "flex-end", alignItems: "center", height: 80 },
  retentionBar: { width: "70%", borderRadius: 4 },
  retentionLabel: { fontSize: 11, color: "#666", fontFamily: "Inter_500Medium", marginTop: 6 },
  eventRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  eventIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  eventName: { flex: 1, fontSize: 13, color: "#CCC", fontFamily: "Inter_400Regular" },
  eventCount: { fontSize: 14, color: "#FFF", fontFamily: "Inter_700Bold" },
});
