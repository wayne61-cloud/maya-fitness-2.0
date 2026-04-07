import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import {
  YOGA_SESSIONS,
  YOGA_CATEGORIES,
  YOGA_CATEGORY_COLORS,
  YOGA_EXERCISES,
  type YogaCategory,
} from "@/constants/yoga-data";
import { useAppContext } from "@/context/AppContext";

const BG = "#FAF7F4";
const ACCENT = "#9B7B6E";
const TEXT = "#3D2B1F";
const MUTED = "#9E8C7E";
const CARD = "#FFFFFF";
const BORDER = "#EDE8E3";

export default function YogaSessions() {
  const insets = useSafeAreaInsets();
  const { addYogaRecord } = useAppContext();
  const [filter, setFilter] = useState<YogaCategory | "Tout">("Tout");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = YOGA_SESSIONS.filter((s) => filter === "Tout" || s.category === filter);

  async function handleStart(session: typeof YOGA_SESSIONS[0]) {
    await addYogaRecord({
      id: `yoga-${Date.now()}`,
      date: new Date().toISOString(),
      sessionId: session.id,
      title: session.title,
      duration: session.durationMin * 60,
      calories: session.calories,
      category: session.category,
    });
    router.push("/yoga/(tabs)");
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {(["Tout", ...YOGA_CATEGORIES] as (YogaCategory | "Tout")[]).map((c) => {
          const color = c === "Tout" ? ACCENT : YOGA_CATEGORY_COLORS[c as YogaCategory];
          const active = filter === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.filterChip, { backgroundColor: active ? color : CARD, borderColor: active ? color : BORDER }]}
              onPress={() => setFilter(c)}
            >
              <Text style={[styles.filterText, { color: active ? "#fff" : TEXT }]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.count, { color: MUTED }]}>{filtered.length} séance{filtered.length !== 1 ? "s" : ""}</Text>

      {filtered.map((session) => {
        const catColor = YOGA_CATEGORY_COLORS[session.category];
        const exercises = session.exerciseIds.map((eid) => YOGA_EXERCISES.find((e) => e.id === eid)!).filter(Boolean);
        return (
          <View key={session.id} style={[styles.sessionCard, { backgroundColor: CARD, borderColor: BORDER }]}>
            <View style={styles.cardImageWrap}>
              <Image source={{ uri: session.coverImage }} style={styles.cardImage} resizeMode="cover" />
              <View style={[styles.cardOverlay, { backgroundColor: "rgba(30,15,5,0.38)" }]} />
              {session.tag && (
                <View style={[styles.cardTag, { backgroundColor: catColor + "E0" }]}>
                  <Text style={styles.cardTagText}>{session.tag}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={[styles.catBadge, { backgroundColor: catColor + "18", alignSelf: "flex-start" }]}>
                    <Text style={[styles.catBadgeText, { color: catColor }]}>{session.category}</Text>
                  </View>
                  <Text style={[styles.sessionName, { color: TEXT }]}>{session.title}</Text>
                  <Text style={[styles.sessionDesc, { color: MUTED }]} numberOfLines={2}>{session.description}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: ACCENT + "15" }]}>
                  <Text style={[styles.levelText, { color: ACCENT }]}>{session.level}</Text>
                </View>
              </View>

              {/* Exercise list */}
              <View style={styles.exList}>
                {exercises.slice(0, 3).map((ex) => (
                  <View key={ex.id} style={styles.exItem}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={catColor} />
                    <Text style={[styles.exItemText, { color: MUTED }]}>{ex.title}</Text>
                  </View>
                ))}
                {exercises.length > 3 && (
                  <Text style={[styles.exMore, { color: MUTED }]}>+{exercises.length - 3} exercices</Text>
                )}
              </View>

              {/* Meta + CTA */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color={MUTED} />
                  <Text style={[styles.metaText, { color: MUTED }]}>{session.durationMin} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flame-outline" size={13} color={MUTED} />
                  <Text style={[styles.metaText, { color: MUTED }]}>{session.calories} kcal</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="barbell-outline" size={13} color={MUTED} />
                  <Text style={[styles.metaText, { color: MUTED }]}>{exercises.length} ex.</Text>
                </View>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: catColor }]}
                  onPress={() => handleStart(session)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="play" size={12} color="#fff" />
                  <Text style={styles.startBtnText}>Démarrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  count: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardImageWrap: { height: 160, position: "relative" },
  cardImage: { ...StyleSheet.absoluteFillObject },
  cardOverlay: StyleSheet.absoluteFillObject as any,
  cardTag: { position: "absolute", top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  cardTagText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  cardContent: { padding: 16, gap: 12 },
  cardHeader: { flexDirection: "row", gap: 10 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  sessionName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sessionDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: "flex-start" },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  exList: { gap: 4 },
  exItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  exItemText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exMore: { fontSize: 12, fontFamily: "Inter_400Regular", paddingLeft: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  startBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
