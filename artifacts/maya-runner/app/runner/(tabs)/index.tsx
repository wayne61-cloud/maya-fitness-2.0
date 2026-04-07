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
import { RunCard } from "@/components/RunCard";
import {
  RUNNER_EXERCISES,
  RUNNER_EXERCISE_CATEGORIES,
  type RunnerExerciseCategory,
} from "@/constants/runner-exercises";

const RUNNER_RED = "#E8335A";

const CATEGORY_COLORS: Record<RunnerExerciseCategory, string> = {
  Échauffement: "#FF8C00",
  Technique: "#4FC3F7",
  Renforcement: "#E8335A",
  Récupération: "#00E676",
  Mobilité: "#AB47BC",
};

const CATEGORY_ICONS: Record<RunnerExerciseCategory, string> = {
  Échauffement: "flame-outline",
  Technique: "trending-up-outline",
  Renforcement: "barbell-outline",
  Récupération: "leaf-outline",
  Mobilité: "body-outline",
};

function StatBox({
  value,
  unit,
  label,
  color,
}: {
  value: string;
  unit?: string;
  label: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[boxStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[boxStyles.val, { color }]}>
        {value}
        {unit && <Text style={[boxStyles.unit, { color: colors.mutedForeground }]}> {unit}</Text>}
      </Text>
      <Text style={[boxStyles.lbl, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const boxStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 4, alignItems: "center" },
  val: { fontSize: 22, fontFamily: "Inter_700Bold" },
  unit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  lbl: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
});

export default function RunnerHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, weeklyDistance, totalDistance, profile } = useApp();

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyRuns = runs.filter((r) => new Date(r.date).getTime() > oneWeekAgo);
  const weeklyGoalPct = Math.min(
    Math.round((weeklyDistance / Math.max(profile.weeklyGoal, 1)) * 100),
    100
  );
  const recentRuns = runs.slice(0, 3);

  // Featured exercises (one per category)
  const featured = RUNNER_EXERCISE_CATEGORIES.map(
    (cat) => RUNNER_EXERCISES.find((e) => e.category === cat)!
  ).filter(Boolean);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero start banner */}
      <TouchableOpacity
        style={[styles.heroBanner, { backgroundColor: RUNNER_RED }]}
        onPress={() => router.push("/runner/(tabs)/run")}
        activeOpacity={0.88}
      >
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>Prêt à courir ?</Text>
          <Text style={styles.heroSub}>Objectif : {profile.weeklyGoal} km / semaine</Text>
          <View style={styles.startBtn}>
            <MaterialCommunityIcons name="run-fast" size={16} color={RUNNER_RED} />
            <Text style={[styles.startBtnText, { color: RUNNER_RED }]}>Démarrer</Text>
          </View>
        </View>
        <View style={styles.heroCircle}>
          <MaterialCommunityIcons name="run-fast" size={52} color="rgba(255,255,255,0.15)" />
        </View>
      </TouchableOpacity>

      {/* Weekly progress */}
      <View
        style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.foreground }]}>Cette semaine</Text>
          <Text style={[styles.progressPct, { color: RUNNER_RED }]}>{weeklyGoalPct}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${weeklyGoalPct}%` as any, backgroundColor: RUNNER_RED },
            ]}
          />
        </View>
        <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
          {weeklyDistance.toFixed(1)} km / {profile.weeklyGoal} km
        </Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsRow}>
        <StatBox
          value={weeklyDistance.toFixed(1)}
          unit="km"
          label="Cette semaine"
          color={RUNNER_RED}
        />
        <StatBox value={String(weeklyRuns.length)} label="Sorties" color={colors.accent} />
        <StatBox
          value={totalDistance.toFixed(1)}
          unit="km"
          label="Total"
          color={colors.foreground}
        />
      </View>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: RUNNER_RED + "40" }]}
          onPress={() => router.push("/runner/(tabs)/run")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="run-fast" size={22} color={RUNNER_RED} />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>Courir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/runner/(tabs)/history")}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={22} color="#4FC3F7" />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/runner/exercises")}
          activeOpacity={0.8}
        >
          <Ionicons name="barbell-outline" size={22} color="#FF8C00" />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>Exercices</Text>
        </TouchableOpacity>
      </View>

      {/* Exercises section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Exercices & Préparation
        </Text>
        <TouchableOpacity onPress={() => router.push("/runner/exercises")}>
          <Text style={[styles.seeAll, { color: RUNNER_RED }]}>Tout voir</Text>
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 20 }}
      >
        {RUNNER_EXERCISE_CATEGORIES.map((cat) => {
          const color = CATEGORY_COLORS[cat];
          const icon = CATEGORY_ICONS[cat] as any;
          const count = RUNNER_EXERCISES.filter((e) => e.category === cat).length;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, { backgroundColor: color + "18", borderColor: color + "40" }]}
              onPress={() => router.push(`/runner/exercises?category=${cat}`)}
              activeOpacity={0.75}
            >
              <Ionicons name={icon} size={16} color={color} />
              <Text style={[styles.catPillText, { color }]}>{cat}</Text>
              <Text style={[styles.catPillCount, { color: color + "CC" }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured exercises */}
      {featured.map((ex) => {
        const catColor = CATEGORY_COLORS[ex.category];
        return (
          <TouchableOpacity
            key={ex.id}
            style={[
              styles.exCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push(`/runner/exercise/${ex.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.exThumbWrap}>
              <Image source={{ uri: ex.coverImage }} style={styles.exThumb} resizeMode="cover" />
              <View style={[styles.exThumbOverlay, { backgroundColor: catColor + "33" }]} />
              <Ionicons
                name="play-circle"
                size={22}
                color="rgba(255,255,255,0.9)"
                style={styles.exThumbPlay}
              />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.exName, { color: colors.foreground }]} numberOfLines={1}>
                {ex.title}
              </Text>
              <View style={styles.exMeta}>
                <View style={[styles.catTag, { backgroundColor: catColor + "18" }]}>
                  <Text style={[styles.catTagText, { color: catColor }]}>{ex.category}</Text>
                </View>
                <Text style={[styles.exDuration, { color: colors.mutedForeground }]}>
                  {ex.duration} min
                </Text>
              </View>
              <Text
                style={[styles.exDesc, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {ex.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        );
      })}

      {/* Recent runs */}
      {recentRuns.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Dernières courses
            </Text>
            <TouchableOpacity onPress={() => router.push("/runner/(tabs)/history")}>
              <Text style={[styles.seeAll, { color: RUNNER_RED }]}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          {recentRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </>
      ) : (
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
  container: { paddingHorizontal: 20, gap: 14 },
  heroBanner: {
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  heroLeft: { flex: 1, gap: 6 },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  startBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  heroCircle: { opacity: 0.5 },
  progressCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 30,
    borderWidth: 1,
  },
  catPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  catPillCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  exCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exThumbWrap: { width: 72, height: 72, borderRadius: 12, overflow: "hidden" },
  exThumb: { width: "100%", height: "100%" },
  exThumbOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  exThumbPlay: { position: "absolute", bottom: 4, right: 4 },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  exMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  exDuration: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
