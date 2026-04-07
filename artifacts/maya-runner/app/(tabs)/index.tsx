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

const HUB_GOLD = "#FFD60A";
const RUNNER_RED = "#E8335A";
const WORKOUT_ORANGE = "#FF8C00";
const YOGA_TEAL = "#26C6DA";

function ModuleCard({
  accent,
  icon,
  title,
  subtitle,
  metric,
  metricLabel,
  btnLabel,
  onPress,
  locked,
}: {
  accent: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  btnLabel: string;
  onPress: () => void;
  locked?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.moduleCard, { backgroundColor: colors.card, borderColor: accent + "44" }]}
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.82}
    >
      <View style={[styles.moduleAccentBar, { backgroundColor: accent }]} />
      <View style={styles.moduleContent}>
        <View style={styles.moduleTop}>
          <View style={[styles.moduleIconWrap, { backgroundColor: accent + "20" }]}>
            {icon}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.moduleTitle, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.moduleSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
          </View>
          {locked ? (
            <View style={[styles.lockedBadge, { backgroundColor: colors.secondary }]}>
              <Ionicons name="lock-closed" size={12} color={colors.mutedForeground} />
              <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>Bientôt</Text>
            </View>
          ) : (
            <View style={styles.metricBlock}>
              <Text style={[styles.metricVal, { color: accent }]}>{metric}</Text>
              <Text style={[styles.metricLbl, { color: colors.mutedForeground }]}>{metricLabel}</Text>
            </View>
          )}
        </View>
        {!locked && (
          <TouchableOpacity
            style={[styles.moduleBtn, { backgroundColor: accent + "18", borderColor: accent + "44" }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.moduleBtnText, { color: accent }]}>{btnLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={accent} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function StatPill({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statPillIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.statPillVal, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statPillLbl, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function HubDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    profile,
    runs,
    workouts,
    weeklyDistance,
    weeklyWorkouts,
    todayCalories,
    todayMinutes,
    todaySessions,
    workoutOnboarding,
  } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyRuns = runs.filter((r) => new Date(r.date).getTime() > oneWeekAgo).length;

  function handleOpenWorkout() {
    if (!workoutOnboarding) {
      router.push("/workout/onboarding");
    } else {
      router.push("/workout");
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting},</Text>
          <View style={styles.headerNameRow}>
            <Text style={[styles.appName, { color: HUB_GOLD }]}>Maya</Text>
            <Text style={[styles.appName, { color: colors.foreground }]}> Fitness</Text>
          </View>
        </View>
        <View style={[styles.avatarWrap, { borderColor: HUB_GOLD + "60" }]}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Today summary */}
      <View style={[styles.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.todayHeader}>
          <View style={styles.todayTitleRow}>
            <View style={[styles.todayDot, { backgroundColor: HUB_GOLD }]} />
            <Text style={[styles.todayTitle, { color: colors.foreground }]}>Aujourd'hui</Text>
          </View>
          <Text style={[styles.todayDate, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
          </Text>
        </View>
        <View style={styles.todayStats}>
          <View style={styles.todayStat}>
            <Ionicons name="flame" size={22} color={WORKOUT_ORANGE} />
            <Text style={[styles.todayStatVal, { color: colors.foreground }]}>{todayCalories}</Text>
            <Text style={[styles.todayStatLbl, { color: colors.mutedForeground }]}>kcal</Text>
          </View>
          <View style={[styles.todayDivider, { backgroundColor: colors.border }]} />
          <View style={styles.todayStat}>
            <Ionicons name="time-outline" size={22} color="#4FC3F7" />
            <Text style={[styles.todayStatVal, { color: colors.foreground }]}>{todayMinutes}</Text>
            <Text style={[styles.todayStatLbl, { color: colors.mutedForeground }]}>min</Text>
          </View>
          <View style={[styles.todayDivider, { backgroundColor: colors.border }]} />
          <View style={styles.todayStat}>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
            <Text style={[styles.todayStatVal, { color: colors.foreground }]}>{todaySessions}</Text>
            <Text style={[styles.todayStatLbl, { color: colors.mutedForeground }]}>séances</Text>
          </View>
        </View>
      </View>

      {/* Weekly stats pills */}
      <View style={styles.pillsRow}>
        <StatPill icon="footsteps-outline" value={`${weeklyDistance.toFixed(1)} km`} label="cette semaine" color={RUNNER_RED} />
        <StatPill icon="barbell-outline" value={`${weeklyWorkouts} séances`} label="cette semaine" color={WORKOUT_ORANGE} />
      </View>

      {/* Modules */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mes modules</Text>
      </View>

      <ModuleCard
        accent={RUNNER_RED}
        icon={<MaterialCommunityIcons name="run-fast" size={24} color={RUNNER_RED} />}
        title="Maya Runner"
        subtitle="Course à pied · GPS"
        metric={`${weeklyDistance.toFixed(1)} km`}
        metricLabel="cette semaine"
        btnLabel="Commencer à courir"
        onPress={() => router.push("/runner")}
      />

      <ModuleCard
        accent={WORKOUT_ORANGE}
        icon={<Ionicons name="barbell-outline" size={24} color={WORKOUT_ORANGE} />}
        title="Maya Workout"
        subtitle="Musculation · Séances"
        metric={`${weeklyWorkouts} séances`}
        metricLabel="cette semaine"
        btnLabel={workoutOnboarding ? "S'entraîner" : "Démarrer"}
        onPress={handleOpenWorkout}
      />

      <ModuleCard
        accent={YOGA_TEAL}
        icon={<MaterialCommunityIcons name="yoga" size={24} color={YOGA_TEAL} />}
        title="Maya Yoga"
        subtitle="Yoga · Pilates · Mobilité"
        metric="—"
        metricLabel="à venir"
        btnLabel="Découvrir"
        onPress={() => {}}
        locked
      />

      {/* Quick tips / recommendation */}
      {runs.length > 0 || workouts.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Recommandé</Text>
          <TouchableOpacity
            style={[styles.recommendCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleOpenWorkout}
            activeOpacity={0.8}
          >
            <View style={[styles.recommendIcon, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
              <Ionicons name="barbell-outline" size={22} color={WORKOUT_ORANGE} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.recommendTitle, { color: colors.foreground }]}>Push Day A — PPL</Text>
              <Text style={[styles.recommendSub, { color: colors.mutedForeground }]}>
                65 min · Pectoraux, Épaules, Triceps
              </Text>
            </View>
            <View style={[styles.recommendBadge, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
              <Text style={[styles.recommendBadgeText, { color: WORKOUT_ORANGE }]}>420 kcal</Text>
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: HUB_GOLD + "44" }]}>
          <Text style={[styles.welcomeTitle, { color: HUB_GOLD }]}>Bienvenue 👋</Text>
          <Text style={[styles.welcomeText, { color: colors.mutedForeground }]}>
            Choisis un module ci-dessus pour démarrer ton premier entraînement. Toutes tes données seront centralisées ici.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  headerNameRow: { flexDirection: "row", alignItems: "baseline" },
  appName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  avatarWrap: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },

  todayCard: {
    borderRadius: 18, borderWidth: 1, padding: 16, gap: 14,
  },
  todayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  todayTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  todayDot: { width: 8, height: 8, borderRadius: 4 },
  todayTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  todayDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  todayStats: { flexDirection: "row", alignItems: "center" },
  todayStat: { flex: 1, alignItems: "center", gap: 4 },
  todayStatVal: { fontSize: 24, fontFamily: "Inter_700Bold" },
  todayStatLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  todayDivider: { width: 1, height: 48, opacity: 0.5 },

  pillsRow: { flexDirection: "row", gap: 10 },
  statPill: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 6,
  },
  statPillIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statPillVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statPillLbl: { fontSize: 10, fontFamily: "Inter_400Regular" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },

  moduleCard: {
    borderRadius: 18, borderWidth: 1,
    overflow: "hidden", flexDirection: "row",
  },
  moduleAccentBar: { width: 4 },
  moduleContent: { flex: 1, padding: 16, gap: 12 },
  moduleTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  moduleIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  moduleTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  moduleSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  metricBlock: { alignItems: "flex-end" },
  metricVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  metricLbl: { fontSize: 10, fontFamily: "Inter_400Regular" },
  lockedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  lockedText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  moduleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  moduleBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  recommendCard: {
    borderRadius: 16, borderWidth: 1, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  recommendIcon: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  recommendTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recommendSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recommendBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  recommendBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  welcomeCard: {
    borderRadius: 16, borderWidth: 1, padding: 20, gap: 8,
  },
  welcomeTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  welcomeText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
