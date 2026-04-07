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

const MODULES = [
  { name: "Maya Runner", color: "#E8335A" },
  { name: "Maya Workout", color: "#FF8C00" },
  { name: "Maya Yoga", color: "#9B7B6E" },
  { name: "Maya Nutrition", color: "#5B8C5A" },
];

export default function AdminAnalytics() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("7j");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Analytics</Text>

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

      <View style={styles.kpiRow}>
        <KpiCard label="Utilisateurs actifs" value="—" color="#FFD60A" icon="people-outline" />
        <KpiCard label="Sessions totales" value="—" color="#5B8C5A" icon="fitness-outline" />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Durée moy." value="—" color="#FF8C00" icon="time-outline" />
        <KpiCard label="Rétention J7" value="—" color="#9B7B6E" icon="refresh-outline" />
      </View>

      <Text style={styles.sectionTitle}>Utilisation par module</Text>
      <View style={styles.card}>
        {MODULES.map((m) => (
          <View key={m.name} style={styles.moduleRow}>
            <View style={[styles.moduleDot, { backgroundColor: m.color }]} />
            <Text style={styles.moduleName}>{m.name}</Text>
            <View style={styles.moduleBarWrap}>
              <View style={[styles.moduleBar, { width: "0%", backgroundColor: m.color }]} />
            </View>
            <Text style={styles.modulePct}>—</Text>
          </View>
        ))}
        <Text style={styles.noDataHint}>Les statistiques apparaîtront dès que des utilisateurs seront actifs</Text>
      </View>

      <Text style={styles.sectionTitle}>Événements</Text>
      <View style={[styles.card, styles.emptyCard]}>
        <Ionicons name="bar-chart-outline" size={40} color="#2A2A2A" />
        <Text style={styles.emptyText}>Aucune donnée pour la période sélectionnée</Text>
      </View>
    </ScrollView>
  );

  function KpiCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: any }) {
    return (
      <View style={[styles.kpiCard]}>
        <View style={[styles.kpiIcon, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiLabel}>{label}</Text>
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
  kpiValue: { fontSize: 22, fontWeight: "700", color: "#555", fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontSize: 12, color: "#555", fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 24, marginBottom: 12 },
  card: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  emptyCard: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#444", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 12, textAlign: "center" },
  moduleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  moduleDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  moduleName: { width: 110, fontSize: 13, color: "#CCC", fontFamily: "Inter_400Regular" },
  moduleBarWrap: { flex: 1, height: 8, backgroundColor: "#1A1A1A", borderRadius: 4, overflow: "hidden", marginHorizontal: 10 },
  moduleBar: { height: "100%", borderRadius: 4 },
  modulePct: { fontSize: 13, color: "#555", fontFamily: "Inter_600SemiBold", width: 30, textAlign: "right" },
  noDataHint: { fontSize: 12, color: "#333", fontFamily: "Inter_400Regular", marginTop: 12, textAlign: "center" },
});
