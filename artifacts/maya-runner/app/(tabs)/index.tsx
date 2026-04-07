import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
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
import { StatsCard } from "@/components/StatsCard";
import { RunCard } from "@/components/RunCard";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, totalDistance, weeklyDistance, profile } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const recentRuns = runs.slice(0, 3);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Bonjour,</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text>
        </View>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Prêt à courir ?</Text>
          <Text style={styles.heroSub}>Objectif hebdo: {profile.weeklyGoal} km</Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push("/(tabs)/run")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="run-fast" size={18} color={colors.primary} />
            <Text style={[styles.heroBtnText, { color: colors.primary }]}>Lancer une course</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cette semaine</Text>
      <View style={styles.statsRow}>
        <StatsCard
          value={weeklyDistance.toFixed(1)}
          unit="km"
          label="Distance"
          color={colors.primary}
        />
        <StatsCard
          value={runs.filter((r) => {
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return new Date(r.date).getTime() > oneWeekAgo;
          }).length.toString()}
          label="Sorties"
          color={colors.accent}
        />
        <StatsCard
          value={(
            (weeklyDistance / Math.max(profile.weeklyGoal, 1)) *
            100
          ).toFixed(0)}
          unit="%"
          label="Objectif"
          color={colors.success}
        />
      </View>

      <View style={styles.statsRow}>
        <StatsCard
          value={totalDistance.toFixed(1)}
          unit="km"
          label="Total"
          color={colors.foreground}
        />
        <StatsCard
          value={runs.length.toString()}
          label="Courses"
          color={colors.foreground}
        />
        <StatsCard
          value={
            runs.length > 0
              ? (totalDistance / runs.length).toFixed(1)
              : "0"
          }
          unit="km"
          label="Moyenne"
          color={colors.foreground}
        />
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/exercises")}
          activeOpacity={0.75}
        >
          <Ionicons name="barbell-outline" size={24} color={colors.primary} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Exercices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/progress")}
          activeOpacity={0.75}
        >
          <Ionicons name="camera-outline" size={24} color={colors.accent} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Progression</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/history")}
          activeOpacity={0.75}
        >
          <Ionicons name="analytics-outline" size={24} color={colors.success} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Historique</Text>
        </TouchableOpacity>
      </View>

      {recentRuns.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Dernières courses
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          {recentRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </>
      )}

      {recentRuns.length === 0 && (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <MaterialCommunityIcons name="run-fast" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Pas encore de courses
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Lance ta première course pour commencer ton aventure !
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  heroContent: { gap: 6 },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: -6,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
