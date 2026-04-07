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
import { EXERCISES, MUSCLE_GROUPS } from "@/constants/workout-data";

const WORKOUT_ORANGE = "#FF8C00";

const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#4CAF50",
  Intermédiaire: "#FF8C00",
  Avancé: "#E8335A",
};

export default function ExercisesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Tout");

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = EXERCISES.filter((e) => {
    const matchGroup = selectedGroup === "Tout" || e.muscleGroup === selectedGroup;
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Rechercher un exercice…"
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

      {/* Muscle group filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupScrollContent}
      >
        {MUSCLE_GROUPS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.groupChip,
              {
                backgroundColor: selectedGroup === g ? WORKOUT_ORANGE : colors.card,
                borderColor: selectedGroup === g ? WORKOUT_ORANGE : colors.border,
              },
            ]}
            onPress={() => setSelectedGroup(g)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.groupChipText,
                { color: selectedGroup === g ? "#fff" : colors.foreground },
              ]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={[styles.countText, { color: colors.mutedForeground }]}>
        {filtered.length} exercice{filtered.length !== 1 ? "s" : ""}
      </Text>

      {/* Exercise list */}
      {filtered.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={[
            styles.exerciseCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push(`/workout/exercise/${ex.id}`)}
          activeOpacity={0.8}
        >
          {/* Cover image */}
          <View style={styles.thumbWrap}>
            <Image
              source={{ uri: ex.coverImage }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <View style={[styles.thumbOverlay, { backgroundColor: WORKOUT_ORANGE + "22" }]} />
            <Ionicons
              name="play-circle"
              size={22}
              color="rgba(255,255,255,0.85)"
              style={styles.thumbPlay}
            />
          </View>

          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.exerciseRow}>
              <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                {ex.name}
              </Text>
              <View
                style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[ex.level] + "20" }]}
              >
                <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[ex.level] }]}>
                  {ex.level}
                </Text>
              </View>
            </View>
            <View style={styles.exerciseMeta}>
              <Text style={[styles.muscleGroup, { color: WORKOUT_ORANGE }]}>{ex.muscleGroup}</Text>
              {ex.secondaryMuscles.slice(0, 1).map((m) => (
                <Text key={m} style={[styles.secondaryMuscle, { color: colors.mutedForeground }]}>
                  · {m}
                </Text>
              ))}
            </View>
            <View style={styles.exerciseDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                  {ex.durationMin} min
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="flame-outline" size={11} color={colors.mutedForeground} />
                <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                  {ex.calPerMin} kcal/min
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  groupScrollContent: { gap: 8, paddingRight: 20 },
  groupChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  groupChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  countText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exerciseCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },
  thumbOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  thumbPlay: { position: "absolute", bottom: 4, right: 4 },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  exerciseName: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  levelBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  muscleGroup: { fontSize: 12, fontFamily: "Inter_500Medium" },
  secondaryMuscle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exerciseDetails: { flexDirection: "row", gap: 12, marginTop: 2 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
