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
import { useColors } from "@/hooks/useColors";
import {
  RUNNER_EXERCISES,
  RUNNER_EXERCISE_CATEGORIES,
} from "@/constants/runner-exercises";

const RUNNER_RED = "#E8335A";

const CATEGORY_COLORS: Record<string, string> = {
  Échauffement: "#FF8C00",
  Technique: "#4FC3F7",
  Renforcement: "#E8335A",
  Récupération: "#00E676",
  Mobilité: "#AB47BC",
};

const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#4CAF50",
  Intermédiaire: "#FF8C00",
  Avancé: "#E8335A",
};

export default function RunnerExercisesTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tout");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const categories = ["Tout", ...RUNNER_EXERCISE_CATEGORIES];

  const filtered = RUNNER_EXERCISES.filter((e) => {
    const matchCat = selectedCat === "Tout" || e.category === selectedCat;
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Rechercher…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {categories.map((cat) => {
          const color = cat === "Tout" ? RUNNER_RED : (CATEGORY_COLORS[cat] ?? RUNNER_RED);
          const active = selectedCat === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, { backgroundColor: active ? color : colors.card, borderColor: active ? color : colors.border }]}
              onPress={() => setSelectedCat(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.catChipText, { color: active ? "#fff" : colors.foreground }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.countText, { color: colors.mutedForeground }]}>
        {filtered.length} exercice{filtered.length !== 1 ? "s" : ""}
      </Text>

      {filtered.map((ex) => {
        const catColor = CATEGORY_COLORS[ex.category] ?? RUNNER_RED;
        return (
          <TouchableOpacity
            key={ex.id}
            style={[styles.exCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/runner/exercise/${ex.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.thumbWrap}>
              <Image source={{ uri: ex.coverImage }} style={styles.thumb} resizeMode="cover" />
              <View style={[styles.thumbOverlay, { backgroundColor: catColor + "33" }]} />
              <Ionicons name="play-circle" size={20} color="rgba(255,255,255,0.9)" style={styles.thumbPlay} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.exName, { color: colors.foreground }]} numberOfLines={1}>{ex.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.catBadge, { backgroundColor: catColor + "18" }]}>
                  <Text style={[styles.catBadgeText, { color: catColor }]}>{ex.category}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[ex.level] + "18" }]}>
                  <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[ex.level] }]}>{ex.level}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{ex.duration} min</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="flame-outline" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.mutedForeground }]}>~{ex.calories} kcal</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  countText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exCard: { borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  thumbWrap: { width: 72, height: 72, borderRadius: 12, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  thumbOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  thumbPlay: { position: "absolute", bottom: 4, right: 4 },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", gap: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  levelBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  detailRow: { flexDirection: "row", gap: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
