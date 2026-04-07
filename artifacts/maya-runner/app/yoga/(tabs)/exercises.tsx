import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  YOGA_EXERCISES,
  YOGA_CATEGORIES,
  YOGA_CATEGORY_COLORS,
  type YogaCategory,
} from "@/constants/yoga-data";

const BG = "#FAF7F4";
const ACCENT = "#9B7B6E";
const TEXT = "#3D2B1F";
const MUTED = "#9E8C7E";
const CARD = "#FFFFFF";
const BORDER = "#EDE8E3";

const LEVELS = ["Tout", "Débutant", "Intermédiaire", "Avancé"];
const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#8BAB8B",
  Intermédiaire: "#C4A882",
  Avancé: "#E8A598",
};

export default function YogaExercises() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<YogaCategory | "Tout">("Tout");
  const [level, setLevel] = useState("Tout");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = YOGA_EXERCISES.filter((e) => {
    const matchCat = cat === "Tout" || e.category === cat;
    const matchLevel = level === "Tout" || e.level === level;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: CARD, borderColor: BORDER }]}>
        <Ionicons name="search-outline" size={16} color={MUTED} />
        <TextInput
          style={[styles.searchInput, { color: TEXT }]}
          placeholder="Rechercher un exercice..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {(["Tout", ...YOGA_CATEGORIES] as (YogaCategory | "Tout")[]).map((c) => {
          const color = c === "Tout" ? ACCENT : YOGA_CATEGORY_COLORS[c as YogaCategory];
          const active = cat === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, { backgroundColor: active ? color : CARD, borderColor: active ? color : BORDER }]}
              onPress={() => setCat(c)}
            >
              <Text style={[styles.catChipText, { color: active ? "#fff" : TEXT }]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Level filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {LEVELS.map((l) => {
          const color = l === "Tout" ? "#B8A9A2" : LEVEL_COLORS[l];
          const active = level === l;
          return (
            <TouchableOpacity
              key={l}
              style={[styles.levelChip, { backgroundColor: active ? color + "20" : "transparent", borderColor: active ? color : BORDER }]}
              onPress={() => setLevel(l)}
            >
              <Text style={[styles.levelChipText, { color: active ? color : MUTED }]}>{l}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.count, { color: MUTED }]}>{filtered.length} exercice{filtered.length !== 1 ? "s" : ""}</Text>

      {filtered.map((ex) => {
        const catColor = YOGA_CATEGORY_COLORS[ex.category];
        const lvlColor = LEVEL_COLORS[ex.level];
        return (
          <TouchableOpacity
            key={ex.id}
            style={[styles.exCard, { backgroundColor: CARD, borderColor: BORDER }]}
            onPress={() => router.push(`/yoga/exercise/${ex.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.thumbWrap}>
              <Image source={{ uri: ex.coverImage }} style={styles.thumb} resizeMode="cover" />
              <View style={[styles.thumbOverlay, { backgroundColor: catColor + "40" }]} />
              <Ionicons name="play-circle" size={20} color="rgba(255,255,255,0.9)" style={styles.thumbPlay} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.exName, { color: TEXT }]} numberOfLines={1}>{ex.title}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.catBadge, { backgroundColor: catColor + "18" }]}>
                  <Text style={[styles.catBadgeText, { color: catColor }]}>{ex.category}</Text>
                </View>
                <View style={[styles.lvlBadge, { backgroundColor: lvlColor + "18" }]}>
                  <Text style={[styles.lvlBadgeText, { color: lvlColor }]}>{ex.level}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={11} color={MUTED} />
                <Text style={[styles.metaText, { color: MUTED }]}>{ex.duration} min</Text>
                <Ionicons name="flame-outline" size={11} color={MUTED} />
                <Text style={[styles.metaText, { color: MUTED }]}>{ex.calories} kcal</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 10 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  levelChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  levelChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  count: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  thumbWrap: { width: 72, height: 72, borderRadius: 12, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  thumbOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  thumbPlay: { position: "absolute", bottom: 4, right: 4 },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  badgeRow: { flexDirection: "row", gap: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  lvlBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  lvlBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular", marginRight: 6 },
});
