import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useAppContext } from "@/context/AppContext";
import { RECIPES, getRecipes, NUTRITION_MEAL_TYPES, NUTRITION_GOALS, type MealType, type NutritionGoal } from "@/constants/nutrition-data";

const BG = "#F6FAF0";
const ACCENT = "#5B8C5A";
const TEXT = "#2D4A2B";
const MUTED = "#7A9878";
const CARD = "#FFFFFF";
const BORDER = "#D4E8D0";
const WARM = "#E8844A";

const MEAL_ICONS: Record<MealType, string> = {
  "Petit-déjeuner": "sunny-outline",
  "Déjeuner": "partly-sunny-outline",
  "Dîner": "moon-outline",
  "Snack": "apple-outline",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Facile: "#5B8C5A",
  Moyen: "#E8844A",
  Difficile: "#D9534A",
};

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const { nutritionOnboarding } = useAppContext();
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState<MealType | "Tout">("Tout");
  const [goalFilter, setGoalFilter] = useState<NutritionGoal | "Tout">("Tout");
  const [maxTime, setMaxTime] = useState<number | undefined>();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!nutritionOnboarding) router.replace("/nutrition/onboarding");
  }, [nutritionOnboarding]);

  if (!nutritionOnboarding) return null;

  const { data: recipes } = getRecipes(0, 50, {
    mealType: mealFilter !== "Tout" ? mealFilter : undefined,
    goal: goalFilter !== "Tout" ? (goalFilter as NutritionGoal) : undefined,
    maxTime,
    search,
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
          placeholder="Rechercher une recette..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Meal type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {(["Tout", ...NUTRITION_MEAL_TYPES] as (MealType | "Tout")[]).map((t) => {
          const active = mealFilter === t;
          const icon = t === "Tout" ? "restaurant-outline" : MEAL_ICONS[t as MealType];
          return (
            <TouchableOpacity
              key={t}
              style={[styles.filterChip, { backgroundColor: active ? ACCENT : CARD, borderColor: active ? ACCENT : BORDER }]}
              onPress={() => setMealFilter(t)}
            >
              <Ionicons name={icon as any} size={14} color={active ? "#fff" : MUTED} />
              <Text style={[styles.filterText, { color: active ? "#fff" : TEXT }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Goal filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
        {(["Tout", ...NUTRITION_GOALS] as (NutritionGoal | "Tout")[]).map((g) => {
          const active = goalFilter === g;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.smallChip, { backgroundColor: active ? WARM + "15" : "transparent", borderColor: active ? WARM : BORDER }]}
              onPress={() => setGoalFilter(g)}
            >
              <Text style={[styles.smallChipText, { color: active ? WARM : MUTED }]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Quick time filter */}
      <View style={styles.timeRow}>
        <Text style={[styles.timeLabel, { color: MUTED }]}>Temps max :</Text>
        {[undefined, 15, 30, 45].map((t) => (
          <TouchableOpacity
            key={String(t)}
            style={[styles.timeChip, { backgroundColor: maxTime === t ? ACCENT : CARD, borderColor: maxTime === t ? ACCENT : BORDER }]}
            onPress={() => setMaxTime(t)}
          >
            <Text style={[styles.timeChipText, { color: maxTime === t ? "#fff" : TEXT }]}>{t ? `${t} min` : "Tout"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.count, { color: MUTED }]}>{recipes.length} recette{recipes.length !== 1 ? "s" : ""}</Text>

      {recipes.map((recipe) => (
        <TouchableOpacity
          key={recipe.id}
          style={[styles.recipeCard, { backgroundColor: CARD, borderColor: BORDER }]}
          onPress={() => router.push(`/nutrition/recipe/${recipe.id}`)}
          activeOpacity={0.88}
        >
          <View style={styles.recipeImageWrap}>
            <Image source={{ uri: recipe.coverImage }} style={styles.recipeImage} resizeMode="cover" />
            <View style={styles.recipeOverlay} />
            <View style={[styles.mealTypeBadge, { backgroundColor: ACCENT + "E0" }]}>
              <Ionicons name={MEAL_ICONS[recipe.mealType] as any} size={12} color="#fff" />
              <Text style={styles.mealTypeText}>{recipe.mealType}</Text>
            </View>
          </View>
          <View style={styles.recipeContent}>
            <View style={styles.recipeTop}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.recipeName, { color: TEXT }]} numberOfLines={1}>{recipe.title}</Text>
                <View style={styles.recipeGoals}>
                  {recipe.goal.slice(0, 2).map((g) => (
                    <View key={g} style={[styles.goalBadge, { backgroundColor: WARM + "15" }]}>
                      <Text style={[styles.goalText, { color: WARM }]}>{g}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[styles.calories, { color: ACCENT }]}>{recipe.calories}</Text>
                <Text style={[styles.caloriesLabel, { color: MUTED }]}>kcal</Text>
              </View>
            </View>

            {/* Macros */}
            <View style={styles.macroRow}>
              {[
                { label: "P", val: recipe.macros.protein, color: "#4A90D9" },
                { label: "G", val: recipe.macros.carbs, color: WARM },
                { label: "L", val: recipe.macros.fat, color: "#D9534A" },
              ].map((m) => (
                <View key={m.label} style={[styles.macroBadge, { backgroundColor: m.color + "15" }]}>
                  <Text style={[styles.macroLabel, { color: m.color }]}>{m.label}</Text>
                  <Text style={[styles.macroVal, { color: m.color }]}>{m.val}g</Text>
                </View>
              ))}
              <View style={{ flex: 1 }} />
              <View style={styles.metaRight}>
                <Ionicons name="time-outline" size={12} color={MUTED} />
                <Text style={[styles.metaText, { color: MUTED }]}>{recipe.prepTime + recipe.cookTime} min</Text>
                <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[recipe.difficulty] + "18" }]}>
                  <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>{recipe.difficulty}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 10 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  smallChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  smallChipText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  timeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  timeChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  count: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recipeCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  recipeImageWrap: { height: 150, position: "relative" },
  recipeImage: StyleSheet.absoluteFillObject as any,
  recipeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,40,20,0.25)" },
  mealTypeBadge: { position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  mealTypeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  recipeContent: { padding: 14, gap: 10 },
  recipeTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  recipeName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  recipeGoals: { flexDirection: "row", gap: 6 },
  goalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  goalText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  calories: { fontSize: 20, fontFamily: "Inter_700Bold" },
  caloriesLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  macroRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  macroBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, alignItems: "center" },
  macroLabel: { fontSize: 10, fontFamily: "Inter_700Bold" },
  macroVal: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metaRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 4 },
  diffText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
