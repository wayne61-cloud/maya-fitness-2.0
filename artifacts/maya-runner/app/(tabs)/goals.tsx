import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const HUB_GOLD = "#FFD60A";
const RUNNER_RED = "#E8335A";
const WORKOUT_ORANGE = "#FF8C00";

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const colors = useColors();
  return (
    <View style={[progressStyles.track, { backgroundColor: colors.secondary }]}>
      <View style={[progressStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
});

function GoalCard({
  icon,
  iconColor,
  title,
  current,
  target,
  unit,
  progress,
  progressColor,
  onEdit,
  colors,
}: {
  icon: string;
  iconColor: string;
  title: string;
  current: string | number;
  target: string | number;
  unit: string;
  progress: number;
  progressColor: string;
  onEdit?: () => void;
  colors: any;
}) {
  const pct = Math.min(Math.round(progress * 100), 100);
  const done = pct >= 100;
  return (
    <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: done ? progressColor + "60" : colors.border }]}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: iconColor + "20" }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.goalTitle, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.goalSub, { color: colors.mutedForeground }]}>
            {current} / {target} {unit}
          </Text>
        </View>
        <View style={styles.goalRight}>
          <Text style={[styles.goalPct, { color: done ? progressColor : colors.foreground }]}>{pct}%</Text>
          {done && <Ionicons name="checkmark-circle" size={18} color={progressColor} />}
          {onEdit && !done && (
            <TouchableOpacity onPress={onEdit}>
              <Ionicons name="pencil-outline" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ProgressBar value={Number(current)} max={Number(target)} color={progressColor} />
    </View>
  );
}

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, runs, workouts, weeklyDistance, weeklyWorkouts } = useApp();

  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyRuns = runs.filter((r) => new Date(r.date).getTime() > oneWeekAgo).length;

  const runningGoal = profile.weeklyGoal || 30;
  const workoutGoal = 3;
  const calorieGoal = 2000;

  const weeklyCal =
    runs.filter((r) => new Date(r.date).getTime() > oneWeekAgo).reduce((a, r) => a + r.calories, 0) +
    workouts.filter((w) => new Date(w.date).getTime() > oneWeekAgo).reduce((a, w) => a + (w.calories || 0), 0);

  async function saveGoal() {
    if (editingGoal === "running") {
      await updateProfile({ ...profile, weeklyGoal: Number(tempVal) || 30 });
    }
    setEditingGoal(null);
  }

  const GOAL_LEVELS = [
    { label: "Débutant", sub: "3 fois / semaine", icon: "leaf-outline", color: colors.success },
    { label: "Régulier", sub: "5 fois / semaine", icon: "trending-up-outline", color: WORKOUT_ORANGE },
    { label: "Intense", sub: "7 fois / semaine", icon: "flame-outline", color: RUNNER_RED },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Objectifs</Text>

      <View style={[styles.weekCard, { backgroundColor: colors.card, borderColor: HUB_GOLD + "44" }]}>
        <View style={styles.weekHeader}>
          <View style={[styles.weekDot, { backgroundColor: HUB_GOLD }]} />
          <Text style={[styles.weekTitle, { color: colors.foreground }]}>Semaine en cours</Text>
        </View>
        <Text style={[styles.weekSub, { color: colors.mutedForeground }]}>
          {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — 7 jours
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Progression hebdo</Text>

      <GoalCard
        icon="footsteps-outline"
        iconColor={RUNNER_RED}
        title="Distance de course"
        current={weeklyDistance.toFixed(1)}
        target={runningGoal}
        unit="km"
        progress={weeklyDistance / runningGoal}
        progressColor={RUNNER_RED}
        onEdit={() => { setEditingGoal("running"); setTempVal(String(runningGoal)); }}
        colors={colors}
      />

      {editingGoal === "running" && (
        <View style={[styles.editCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.editLabel, { color: colors.foreground }]}>Objectif hebdo (km)</Text>
          <View style={styles.editRow}>
            <TextInput
              style={[styles.editInput, { color: colors.foreground, borderColor: colors.border }]}
              value={tempVal}
              onChangeText={setTempVal}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.editSave, { backgroundColor: RUNNER_RED }]}
              onPress={saveGoal}
              activeOpacity={0.8}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Sauver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <GoalCard
        icon="barbell-outline"
        iconColor={WORKOUT_ORANGE}
        title="Séances de musculation"
        current={weeklyWorkouts}
        target={workoutGoal}
        unit="séances"
        progress={weeklyWorkouts / workoutGoal}
        progressColor={WORKOUT_ORANGE}
        colors={colors}
      />

      <GoalCard
        icon="flame-outline"
        iconColor="#FF6B35"
        title="Calories brûlées"
        current={weeklyCal.toLocaleString()}
        target={calorieGoal.toLocaleString()}
        unit="kcal"
        progress={weeklyCal / calorieGoal}
        progressColor="#FF6B35"
        colors={colors}
      />

      <GoalCard
        icon="calendar-outline"
        iconColor="#4FC3F7"
        title="Sorties totales"
        current={weeklyRuns + weeklyWorkouts}
        target={5}
        unit="sorties"
        progress={(weeklyRuns + weeklyWorkouts) / 5}
        progressColor="#4FC3F7"
        colors={colors}
      />

      {/* Training intensity levels */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Niveau d'intensité</Text>
      <View style={styles.levelsRow}>
        {GOAL_LEVELS.map((lvl, i) => {
          const isActive = i === 1;
          return (
            <TouchableOpacity
              key={lvl.label}
              style={[
                styles.levelCard,
                {
                  backgroundColor: isActive ? lvl.color + "20" : colors.card,
                  borderColor: isActive ? lvl.color : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name={lvl.icon as any} size={20} color={lvl.color} />
              <Text style={[styles.levelLabel, { color: colors.foreground }]}>{lvl.label}</Text>
              <Text style={[styles.levelSub, { color: colors.mutedForeground }]}>{lvl.sub}</Text>
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: lvl.color }]}>
                  <Text style={styles.activeBadgeText}>Actif</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Motivation message */}
      <View style={[styles.motivCard, { backgroundColor: colors.card, borderColor: HUB_GOLD + "44" }]}>
        <Text style={[styles.motivEmoji]}>💪</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.motivTitle, { color: colors.foreground }]}>
            {weeklyRuns + weeklyWorkouts >= 3
              ? "En feu cette semaine !"
              : weeklyRuns + weeklyWorkouts >= 1
              ? "Bon début !"
              : "Démarre ta semaine !"}
          </Text>
          <Text style={[styles.motivText, { color: colors.mutedForeground }]}>
            {weeklyRuns + weeklyWorkouts >= 3
              ? "Tu bats ton rythme habituel. Continue comme ça !"
              : weeklyRuns + weeklyWorkouts >= 1
              ? "Tu as déjà bougé. Garde le cap jusqu'à la fin de la semaine."
              : "Chaque grande transformation commence par un premier pas."}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  weekCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 4,
  },
  weekHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  weekDot: { width: 8, height: 8, borderRadius: 4 },
  weekTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  weekSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  goalCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
  },
  goalTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  goalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  goalTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  goalSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  goalRight: { alignItems: "flex-end", gap: 4 },
  goalPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  editCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  editLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  editRow: { flexDirection: "row", gap: 10 },
  editInput: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    padding: 10, fontSize: 16, fontFamily: "Inter_600SemiBold",
  },
  editSave: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  levelsRow: { flexDirection: "row", gap: 10 },
  levelCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 6,
  },
  levelLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  levelSub: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  activeBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 2,
  },
  activeBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  motivCard: {
    borderRadius: 16, borderWidth: 1, padding: 16,
    flexDirection: "row", gap: 14, alignItems: "center",
  },
  motivEmoji: { fontSize: 28 },
  motivTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  motivText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});
