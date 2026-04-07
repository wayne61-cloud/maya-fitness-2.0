import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { RunRecord } from "@/context/AppContext";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatPace(pace: number) {
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  run: RunRecord;
  onPress?: () => void;
}

export function RunCard({ run, onPress }: Props) {
  const colors = useColors();
  const date = new Date(run.date);
  const dateStr = date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "22" }]}>
          <Ionicons name="walk" size={18} color={colors.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {run.title ?? "Course"}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
        <Text style={[styles.dist, { color: colors.primary }]}>
          {run.distance.toFixed(2)}<Text style={{ fontSize: 12 }}>km</Text>
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.statVal, { color: colors.foreground }]}>{formatDuration(run.duration)}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="speedometer-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.statVal, { color: colors.foreground }]}>{formatPace(run.pace)} /km</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="flame-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.statVal, { color: colors.foreground }]}>{run.calories} kcal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  dist: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  divider: { height: 1 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statVal: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
