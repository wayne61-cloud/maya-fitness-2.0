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
const YOGA_ROSE = "#9B7B6E";
const NUTRITION_GREEN = "#5B8C5A";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function getActionDuJour(): { title: string; sub: string; label: string; color: string; image: string; route: string; icon: string } {
  const h = new Date().getHours();
  const dow = new Date().getDay();
  if (dow === 0 || dow === 6) {
    return { title: "Long Run", sub: "70 min · Modéré", label: "Commencer la course", color: RUNNER_RED, image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=500&fit=crop&auto=format&q=80", route: "/runner/(tabs)/run", icon: "speedometer-outline" };
  }
  if (h < 11) {
    return { title: "Full Body Express", sub: "30 min · Débutant", label: "Commencer la séance", color: WORKOUT_ORANGE, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop&auto=format&q=80", route: "/workout/(tabs)", icon: "barbell-outline" };
  }
  if (h < 16) {
    return { title: "Course Interval", sub: "25 min · Haute intensité", label: "Démarrer le run", color: RUNNER_RED, image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=500&fit=crop&auto=format&q=80", route: "/runner/(tabs)/run", icon: "speedometer-outline" };
  }
  if (h < 20) {
    return { title: "Flow Yoga Soir", sub: "20 min · Zen · Récupération", label: "Commencer le yoga", color: YOGA_ROSE, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop&auto=format&q=80", route: "/yoga/(tabs)", icon: "flower-outline" };
  }
  return { title: "Méditation & Relaxation", sub: "15 min · Pleine conscience", label: "Se détendre", color: YOGA_ROSE, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop&auto=format&q=80", route: "/yoga/(tabs)", icon: "cloud-outline" };
}

const MODULES = [
  {
    title: "Maya Runner",
    sub: "GPS • Routes • Progression",
    color: RUNNER_RED,
    route: "/runner/(tabs)",
    image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop&auto=format&q=80",
    icon: "speedometer-outline",
  },
  {
    title: "Maya Workout",
    sub: "Musculation • Séances • Exercices",
    color: WORKOUT_ORANGE,
    route: "/workout/(tabs)",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format&q=80",
    icon: "barbell-outline",
  },
  {
    title: "Maya Yoga",
    sub: "Pilates • Yoga • Méditation",
    color: YOGA_ROSE,
    route: "/yoga/(tabs)",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format&q=80",
    icon: "flower-outline",
  },
  {
    title: "Maya Nutrition",
    sub: "Recettes • Menus • Calories",
    color: NUTRITION_GREEN,
    route: "/nutrition/(tabs)",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&auto=format&q=80",
    icon: "restaurant-outline",
  },
];

export default function HubHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    profile,
    streak,
    todayCalories,
    todayMinutes,
    todaySessions,
    todayCaloriesConsumed,
    runs,
    workouts,
    yogaRecords,
  } = useApp();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const action = getActionDuJour();

  // Last activity for "reprendre" card
  const allActivities = [
    ...runs.map((r) => ({ type: "run", title: `Course ${(r.distance / 1000).toFixed(1)} km`, date: r.date, color: RUNNER_RED, route: "/runner/(tabs)" })),
    ...workouts.map((w) => ({ type: "workout", title: w.title ?? "Séance workout", date: w.date, color: WORKOUT_ORANGE, route: "/workout/(tabs)" })),
    ...yogaRecords.map((y) => ({ type: "yoga", title: y.title, date: y.date, color: YOGA_ROSE, route: "/yoga/(tabs)" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastActivity = allActivities[0];

  const hasActivity = todayCalories > 0 || todayMinutes > 0 || todaySessions > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text>
          <Text style={[styles.phrase, { color: colors.mutedForeground }]}>
            {streak > 0 ? `Continue sur ta lancée 💪` : "Prêt à démarrer ta journée ?"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: HUB_GOLD + "20", borderColor: HUB_GOLD + "60" }]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakNum, { color: HUB_GOLD }]}>{streak}</Text>
            </View>
          )}
          <View style={[styles.avatarWrap, { backgroundColor: HUB_GOLD + "25" }]}>
            <Text style={styles.avatarEmoji}>🏋️</Text>
          </View>
        </View>
      </View>

      {/* ── ACTION DU JOUR ── */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push(action.route as any)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: action.image }} style={styles.actionImg} resizeMode="cover" />
        <View style={[styles.actionOverlay, { backgroundColor: "rgba(10,5,0,0.52)" }]} />
        <View style={[styles.actionAccent, { backgroundColor: action.color }]} />
        <View style={styles.actionContent}>
          <View style={[styles.actionPill, { backgroundColor: action.color + "30" }]}>
            <Text style={[styles.actionPillText, { color: action.color }]}>ACTION DU JOUR</Text>
          </View>
          <Text style={styles.actionTitle}>{action.title}</Text>
          <Text style={styles.actionSub}>{action.sub}</Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: action.color }]}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>{action.label}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ── STATS COMPACT ── */}
      <View style={styles.statsRow}>
        {[
          { label: "Actif", val: todayMinutes > 0 ? `${todayMinutes} min` : "—", icon: "time-outline", color: WORKOUT_ORANGE },
          { label: "Brûlées", val: todayCalories > 0 ? `${todayCalories} kcal` : "—", icon: "flame-outline", color: RUNNER_RED },
          { label: "Consommées", val: todayCaloriesConsumed > 0 ? `${todayCaloriesConsumed} kcal` : "—", icon: "restaurant-outline", color: NUTRITION_GREEN },
          { label: "Séances", val: String(todaySessions), icon: "barbell-outline", color: HUB_GOLD },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={s.icon as any} size={14} color={s.color} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── REPRENDRE ── */}
      {lastActivity && (
        <TouchableOpacity
          style={[styles.resumeCard, { backgroundColor: colors.card, borderColor: lastActivity.color + "40", borderLeftColor: lastActivity.color }]}
          onPress={() => router.push(lastActivity.route as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.resumeDot, { backgroundColor: lastActivity.color + "20" }]}>
            <Ionicons
              name={lastActivity.type === "run" ? "walk-outline" : lastActivity.type === "yoga" ? "flower-outline" : "barbell-outline"}
              size={18}
              color={lastActivity.color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.resumeLabel, { color: colors.mutedForeground }]}>Dernière activité</Text>
            <Text style={[styles.resumeTitle, { color: colors.foreground }]}>{lastActivity.title}</Text>
          </View>
          <View style={[styles.resumeBtn, { backgroundColor: lastActivity.color }]}>
            <Text style={styles.resumeBtnText}>Reprendre</Text>
            <Ionicons name="arrow-forward" size={12} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {/* ── MODULES (HORIZONTAL SCROLL — NETFLIX STYLE) ── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tes modules</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
        decelerationRate="fast"
        snapToInterval={236}
      >
        {MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.title}
            style={styles.modCard}
            onPress={() => router.push(mod.route as any)}
            activeOpacity={0.88}
          >
            <Image source={{ uri: mod.image }} style={styles.modImg} resizeMode="cover" />
            <View style={[styles.modOverlay, { backgroundColor: "rgba(5,0,0,0.48)" }]} />
            <View style={[styles.modAccentBar, { backgroundColor: mod.color }]} />
            <View style={styles.modContent}>
              <View style={[styles.modIconWrap, { backgroundColor: mod.color + "30" }]}>
                <Ionicons name={mod.icon as any} size={20} color={mod.color} />
              </View>
              <View>
                <Text style={styles.modTitle}>{mod.title}</Text>
                <Text style={styles.modSub}>{mod.sub}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── RECOMMENDATIONS ── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommandations</Text>
      <View style={styles.recoList}>
        {!hasActivity && (
          <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "40", borderLeftColor: WORKOUT_ORANGE }]}>
            <View style={[styles.recoIcon, { backgroundColor: WORKOUT_ORANGE + "15" }]}>
              <Ionicons name="flash-outline" size={18} color={WORKOUT_ORANGE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recoTitle, { color: colors.foreground }]}>Commence ta journée</Text>
              <Text style={[styles.recoText, { color: colors.mutedForeground }]}>Aucune activité aujourd'hui — c'est le moment idéal !</Text>
            </View>
          </View>
        )}
        {streak >= 3 && (
          <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: HUB_GOLD + "50", borderLeftColor: HUB_GOLD }]}>
            <View style={[styles.recoIcon, { backgroundColor: HUB_GOLD + "15" }]}>
              <Text style={{ fontSize: 18 }}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recoTitle, { color: colors.foreground }]}>Série en cours : {streak} jours</Text>
              <Text style={[styles.recoText, { color: colors.mutedForeground }]}>Tu es en feu ! Continue comme ça pour battre ton record.</Text>
            </View>
          </View>
        )}
        <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: YOGA_ROSE + "40", borderLeftColor: YOGA_ROSE }]}>
          <View style={[styles.recoIcon, { backgroundColor: YOGA_ROSE + "15" }]}>
            <Ionicons name="leaf-outline" size={18} color={YOGA_ROSE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recoTitle, { color: colors.foreground }]}>10 min de stretching</Text>
            <Text style={[styles.recoText, { color: colors.mutedForeground }]}>Améliore ta récupération et ta flexibilité quotidiennement.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.recoCard, { backgroundColor: colors.card, borderColor: NUTRITION_GREEN + "40", borderLeftColor: NUTRITION_GREEN }]}
          onPress={() => router.push("/nutrition/(tabs)" as any)}
          activeOpacity={0.85}
        >
          <View style={[styles.recoIcon, { backgroundColor: NUTRITION_GREEN + "15" }]}>
            <Ionicons name="restaurant-outline" size={18} color={NUTRITION_GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recoTitle, { color: colors.foreground }]}>
              {todayCaloriesConsumed === 0 ? "Tracker tes repas" : `${todayCaloriesConsumed} kcal consommées`}
            </Text>
            <Text style={[styles.recoText, { color: colors.mutedForeground }]}>
              {todayCaloriesConsumed === 0 ? "Lance Maya Nutrition pour suivre ton alimentation." : "Continue à tracker pour optimiser tes performances."}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 16 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  phrase: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  streakEmoji: { fontSize: 14 },
  streakNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
  avatarWrap: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 22 },

  // Action du jour
  actionCard: { height: 220, borderRadius: 22, overflow: "hidden" },
  actionImg: StyleSheet.absoluteFillObject as any,
  actionOverlay: StyleSheet.absoluteFillObject as any,
  actionAccent: { position: "absolute", top: 0, left: 0, width: 5, height: "100%" },
  actionContent: { flex: 1, padding: 20, justifyContent: "flex-end", gap: 8 },
  actionPill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  actionPillText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  actionTitle: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold" },
  actionSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  actionBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Stats
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center", gap: 3 },
  statVal: { fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "center" },
  statLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },

  // Reprendre
  resumeCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, padding: 14 },
  resumeDot: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  resumeLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  resumeTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resumeBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  resumeBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // Modules
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modCard: { width: 224, height: 144, borderRadius: 20, overflow: "hidden" },
  modImg: { ...StyleSheet.absoluteFillObject },
  modOverlay: StyleSheet.absoluteFillObject as any,
  modAccentBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },
  modContent: { flex: 1, padding: 14, justifyContent: "space-between" },
  modIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  modSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" },

  // Recommendations
  recoList: { gap: 10 },
  recoCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 14 },
  recoIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  recoTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recoText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 2 },
});
