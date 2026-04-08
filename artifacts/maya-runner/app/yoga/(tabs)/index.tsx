import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
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
import { useAppContext } from "@/context/AppContext";
import {
  YOGA_EXERCISES,
  YOGA_SESSIONS,
  YOGA_CATEGORIES,
  YOGA_CATEGORY_COLORS,
  YOGA_MOTIVATION_QUOTES,
  type YogaCategory,
} from "@/constants/yoga-data";

const BG = "#FAF7F4";
const ACCENT = "#9B7B6E";
const TEXT = "#3D2B1F";
const MUTED = "#9E8C7E";
const CARD = "#FFFFFF";
const BORDER = "#EDE8E3";

const CATEGORY_ICONS: Record<YogaCategory, string> = {
  Pilates: "body-outline",
  Yoga: "flower-outline",
  Stretching: "accessibility-outline",
  Méditation: "cloud-outline",
  Barre: "barbell-outline",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function getDailyPhrase(onboarding: any) {
  const h = new Date().getHours();
  if (h < 9) return "Une belle séance du matin vous attend 🌸";
  if (h < 12) return "Étirez-vous et respirez en pleine conscience 🌿";
  if (h < 16) return "Parfait pour une pause zen 🧘";
  if (h < 20) return "Décompressez avec une séance du soir 🌙";
  return "Terminez la journée en beauté ✨";
}

export default function YogaHome() {
  const insets = useSafeAreaInsets();
  const { yogaOnboarding, yogaRecords, weeklyYoga, totalYogaMinutes } = useAppContext();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!yogaOnboarding) {
      router.replace("/yoga/onboarding");
    }
  }, [yogaOnboarding]);

  if (!yogaOnboarding) return null;

  const quote = YOGA_MOTIVATION_QUOTES[new Date().getDate() % YOGA_MOTIVATION_QUOTES.length];
  const totalSessions = yogaRecords.length;
  const favExercises = YOGA_EXERCISES.slice(0, 3);
  const featuredSession = YOGA_SESSIONS[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{yogaOnboarding.preferences[0] ?? "Yoga & Pilates"} 🌸</Text>
          <Text style={styles.phrase}>{getDailyPhrase(yogaOnboarding)}</Text>
        </View>
        <View style={[styles.avatarWrap, { backgroundColor: ACCENT + "20" }]}>
          <Text style={{ fontSize: 26 }}>🧘</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Séances", value: totalSessions, icon: "play-circle-outline" },
          { label: "Minutes", value: totalYogaMinutes, icon: "time-outline" },
          { label: "Cette semaine", value: weeklyYoga, icon: "calendar-outline" },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: CARD, borderColor: BORDER }]}>
            <Ionicons name={s.icon as any} size={18} color={ACCENT} />
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quote */}
      <View style={[styles.quoteCard, { backgroundColor: ACCENT + "12", borderColor: ACCENT + "30" }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={ACCENT} />
        <Text style={styles.quoteText}>"{quote}"</Text>
      </View>

      {/* Featured session */}
      <Text style={styles.sectionTitle}>Séance du jour</Text>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push("/yoga/(tabs)/sessions")}
        activeOpacity={0.9}
      >
        <Image source={{ uri: featuredSession.coverImage }} style={styles.featuredImg} resizeMode="cover" />
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          {featuredSession.tag && (
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>{featuredSession.tag}</Text>
            </View>
          )}
          <Text style={styles.featuredTitle}>{featuredSession.title}</Text>
          <Text style={styles.featuredMeta}>{featuredSession.durationMin} min · {featuredSession.level}</Text>
          <TouchableOpacity style={styles.startBtn} activeOpacity={0.85} onPress={() => router.push("/yoga/(tabs)/sessions")}>
            <Ionicons name="play" size={14} color={ACCENT} />
            <Text style={styles.startBtnText}>Commencer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Disciplines</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
        {YOGA_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catCard, { backgroundColor: CARD, borderColor: YOGA_CATEGORY_COLORS[cat] + "40" }]}
            onPress={() => router.push("/yoga/(tabs)/exercises")}
            activeOpacity={0.85}
          >
            <View style={[styles.catIcon, { backgroundColor: YOGA_CATEGORY_COLORS[cat] + "20" }]}>
              <Ionicons name={CATEGORY_ICONS[cat] as any} size={20} color={YOGA_CATEGORY_COLORS[cat]} />
            </View>
            <Text style={[styles.catLabel, { color: TEXT }]}>{cat}</Text>
            <Text style={[styles.catCount, { color: MUTED }]}>
              {YOGA_EXERCISES.filter((e) => e.category === cat).length} ex.
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Favorites / Recent */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Exercices populaires</Text>
        <TouchableOpacity onPress={() => router.push("/yoga/(tabs)/exercises")}>
          <Text style={[styles.seeAll, { color: ACCENT }]}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      {favExercises.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={[styles.exRow, { backgroundColor: CARD, borderColor: BORDER }]}
          onPress={() => router.push(`/yoga/exercise/${ex.id}`)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: ex.coverImage }} style={styles.exThumb} resizeMode="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.exName, { color: TEXT }]} numberOfLines={1}>{ex.title}</Text>
            <Text style={[styles.exMeta, { color: MUTED }]}>{ex.category} · {ex.duration} min</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: YOGA_CATEGORY_COLORS[ex.category] + "20" }]}>
            <Text style={[styles.levelText, { color: YOGA_CATEGORY_COLORS[ex.category] }]}>{ex.level}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { fontSize: 14, color: MUTED, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: TEXT },
  phrase: { fontSize: 13, color: MUTED, fontFamily: "Inter_400Regular", marginTop: 2 },
  avatarWrap: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold", color: ACCENT },
  statLabel: { fontSize: 11, color: MUTED, fontFamily: "Inter_400Regular", textAlign: "center" },
  quoteCard: { flexDirection: "row", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "flex-start" },
  quoteText: { flex: 1, fontSize: 13, color: TEXT, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: TEXT },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  featuredCard: { height: 200, borderRadius: 20, overflow: "hidden" },
  featuredImg: { ...StyleSheet.absoluteFillObject },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(30,15,5,0.45)" },
  featuredContent: { flex: 1, padding: 18, justifyContent: "flex-end", gap: 6 },
  featuredTag: { backgroundColor: "rgba(255,255,255,0.25)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  featuredTagText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  featuredTitle: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  featuredMeta: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  startBtnText: { color: ACCENT, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  catCard: { width: 110, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  catIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  catCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  exRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  exThumb: { width: 60, height: 60, borderRadius: 10 },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  exMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
