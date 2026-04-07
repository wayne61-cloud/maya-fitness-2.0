import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, totalDistance } = useApp();
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const now = Date.now();
  const filtered = runs.filter((r) => {
    const t = new Date(r.date).getTime();
    if (filter === "week") return now - t < 7 * 86400000;
    if (filter === "month") return now - t < 30 * 86400000;
    return true;
  });

  const totalTime = filtered.reduce((acc, r) => acc + r.duration, 0);
  const avgPace =
    filtered.length > 0
      ? filtered.reduce((acc, r) => acc + r.pace, 0) / filtered.length
      : 0;

  function formatTime(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Historique</Text>

      <View style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["all", "week", "month"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? "#fff" : colors.mutedForeground },
              ]}
            >
              {f === "all" ? "Tout" : f === "week" ? "7 jours" : "30 jours"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryVal, { color: colors.primary }]}>
            {filtered.reduce((a, r) => a + r.distance, 0).toFixed(1)}
            <Text style={{ fontSize: 12 }}>km</Text>
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Distance</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryVal, { color: colors.accent }]}>
            {formatTime(totalTime)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Durée</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryVal, { color: colors.success }]}>
            {filtered.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Courses</Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={[styles.empty, { borderColor: colors.border }]}>
          <MaterialCommunityIcons name="run-fast" size={44} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune course</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Lance ta première course dans l'onglet Courir
          </Text>
        </View>
      ) : (
        <>
          {filtered.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  filterRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryVal: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
