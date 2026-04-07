import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatsCardProps {
  value: string;
  label: string;
  unit?: string;
  color?: string;
}

export function StatsCard({ value, label, unit, color }: StatsCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.value, { color: color ?? colors.primary }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text>}
      </View>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  value: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  unit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
