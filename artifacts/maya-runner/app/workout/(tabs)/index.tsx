import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { SESSIONS, EXERCISES } from "@/constants/workout-data";

const WORKOUT_ORANGE = "#FF8C00";

export default function WorkoutHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workouts, weeklyWorkouts, workoutOnboarding } = useApp();

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const recentWorkouts = workouts.slice(0, 3);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyCal = workouts
    .filter((w) => new Date(w.date).getTime() > oneWeekAgo)
    .reduce((a, w) => a + (w.calories || 0), 0);

  // Recommend session based on onboarding goal
  const goal = workoutOnboarding?.goal;
  const freq = workoutOnboarding?.frequency || 3;
  const recommendedSession = SESSIONS.find((s) => {
    if (goal === "prise_masse" || goal === "performance") return s.type === "PPL" || s.type === "Force";
    if (goal === "perte_poids") return s.type === "Full Body" || s.type === "Cardio";
    if (goal === "tonification") return s.type === "Full Body" || s.type === "Glutes";
    return true;
  }) || SESSIONS[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetRow}>
        <View>
          <Text style={[styles.greet, { color: colors.mutedForeground }]}>{greeting},</Text>
          <Text style={[styles.greetTitle, { color: colors.foreground }]}>Maya Workout</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: WORKOUT_ORANGE + "20", borderColor: WORKOUT_ORANGE + "44" }]}>
          <Text style={[styles.levelText, { color: WORKOUT_ORANGE }]}>{workoutOnboarding?.level || "Débutant"}</Text>
        </View>
      </View>

      {/* Week recap */}
      <View style={[styles.weekCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "44" }]}>
        <Text style={[styles.weekTitle, { color: colors.foreground }]}>Cette semaine</Text>
        <View style={styles.weekStats}>
          <View style={styles.weekStat}>
            <Text style={[styles.weekVal, { color: WORKOUT_ORANGE }]}>{weeklyWorkouts}</Text>
            <Text style={[styles.weekLbl, { color: colors.mutedForeground }]}>séances</Text>
          </View>
          <View style={[styles.weekDiv, { backgroundColor: colors.border }]} />
          <View style={styles.weekStat}>
            <Text style={[styles.weekVal, { color: WORKOUT_ORANGE }]}>{weeklyCal}</Text>
            <Text style={[styles.weekLbl, { color: colors.mutedForeground }]}>kcal</Text>
          </View>
          <View style={[styles.weekDiv, { backgroundColor: colors.border }]} />
          <View style={styles.weekStat}>
            <Text style={[styles.weekVal, { color: WORKOUT_ORANGE }]}>{freq}</Text>
            <Text style={[styles.weekLbl, { color: colors.mutedForeground }]}>objectif</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((weeklyWorkouts / freq) * 100, 100)}%`, backgroundColor: WORKOUT_ORANGE },
            ]}
          />
        </View>
        <Text style={[styles.progressLbl, { color: colors.mutedForeground }]}>
          {weeklyWorkouts}/{freq} séances
        </Text>
      </View>

      {/* Recommended session */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Séance recommandée</Text>
      <TouchableOpacity
        style={[styles.sessionCard, { backgroundColor: WORKOUT_ORANGE, borderColor: WORKOUT_ORANGE }]}
        onPress={() => router.push(`/workout/session/${recommendedSession.id}`)}
        activeOpacity={0.88}
      >
        <View style={styles.sessionCardTop}>
          <View style={styles.sessionInfo}>
            {recommendedSession.tag && (
              <View style={styles.sessionTag}>
                <Text style={styles.sessionTagText}>{recommendedSession.tag}</Text>
              </View>
            )}
            <Text style={styles.sessionName}>{recommendedSession.name}</Text>
            <Text style={styles.sessionDesc} numberOfLines={2}>{recommendedSession.description}</Text>
          </View>
        </View>
        <View style={styles.sessionMeta}>
          <View style={styles.sessionMetaItem}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.sessionMetaText}>{recommendedSession.durationMin} min</Text>
          </View>
          <View style={styles.sessionMetaItem}>
            <Ionicons name="flame-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.sessionMetaText}>{recommendedSession.calories} kcal</Text>
          </View>
          <View style={styles.sessionMetaItem}>
            <Ionicons name="barbell-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.sessionMetaText}>{recommendedSession.exercises.length} exercices</Text>
          </View>
        </View>
        <View style={styles.startArrow}>
          <Ionicons name="play-circle" size={42} color="rgba(255,255,255,0.9)" />
        </View>
      </TouchableOpacity>

      {/* Quick links */}
      <View style={styles.quickRow}>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/workout/(tabs)/exercises")}
          activeOpacity={0.8}
        >
          <Ionicons name="barbell-outline" size={24} color={WORKOUT_ORANGE} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Exercices</Text>
          <Text style={[styles.quickCount, { color: colors.mutedForeground }]}>{EXERCISES.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/workout/(tabs)/sessions")}
          activeOpacity={0.8}
        >
          <Ionicons name="list-outline" size={24} color={WORKOUT_ORANGE} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Séances</Text>
          <Text style={[styles.quickCount, { color: colors.mutedForeground }]}>{SESSIONS.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/workout/(tabs)/progress")}
          activeOpacity={0.8}
        >
          <Ionicons name="trending-up-outline" size={24} color={WORKOUT_ORANGE} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Stats</Text>
          <Text style={[styles.quickCount, { color: colors.mutedForeground }]}>{workouts.length}</Text>
        </TouchableOpacity>
      </View>

      {/* All sessions mini list */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tous les programmes</Text>
      {SESSIONS.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.sessionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push(`/workout/session/${s.id}`)}
          activeOpacity={0.8}
        >
          <View style={[styles.sessionRowIcon, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
            <Ionicons name="barbell-outline" size={18} color={WORKOUT_ORANGE} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.sessionRowName, { color: colors.foreground }]}>{s.name}</Text>
            <Text style={[styles.sessionRowSub, { color: colors.mutedForeground }]}>
              {s.durationMin}min · {s.calories} kcal · {s.level}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      ))}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Séances récentes</Text>
          {recentWorkouts.map((w) => (
            <View
              key={w.id}
              style={[styles.recentCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "30" }]}
            >
              <View style={styles.recentRow}>
                <Text style={[styles.recentTitle, { color: colors.foreground }]}>{w.title || "Séance muscu"}</Text>
                <Text style={[styles.recentDate, { color: colors.mutedForeground }]}>
                  {new Date(w.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </Text>
              </View>
              <Text style={[styles.recentMeta, { color: colors.mutedForeground }]}>
                {w.duration} min · {w.exercises.length} exercices · {w.calories || "—"} kcal
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  greetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greet: { fontSize: 13, fontFamily: "Inter_400Regular" },
  greetTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  levelBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  weekCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  weekTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  weekStats: { flexDirection: "row", alignItems: "center" },
  weekStat: { flex: 1, alignItems: "center", gap: 2 },
  weekVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  weekLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  weekDiv: { width: 1, height: 36 },
  progressTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLbl: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sessionCard: {
    borderRadius: 20, padding: 20, overflow: "hidden",
  },
  sessionCardTop: { marginBottom: 12 },
  sessionInfo: { gap: 6 },
  sessionTag: { backgroundColor: "rgba(0,0,0,0.2)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  sessionTagText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sessionName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  sessionDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", lineHeight: 18 },
  sessionMeta: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  sessionMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  sessionMetaText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  startArrow: { position: "absolute", right: 16, bottom: 16 },
  quickRow: { flexDirection: "row", gap: 10 },
  quickCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: "center", gap: 6,
  },
  quickLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  quickCount: { fontSize: 10, fontFamily: "Inter_400Regular" },
  sessionRow: {
    borderRadius: 14, borderWidth: 1, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  sessionRowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sessionRowName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sessionRowSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recentCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  recentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recentDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recentMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
