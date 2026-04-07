import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext, type NutritionMealType } from "@/context/AppContext";
import { RECIPES, NUTRITION_MEAL_ICONS, type MealType } from "@/constants/nutrition-data";

const BG = "#F6FAF0";
const ACCENT = "#5B8C5A";
const TEXT = "#2D4A2B";
const MUTED = "#7A9878";
const CARD = "#FFFFFF";
const BORDER = "#D4E8D0";
const WARM = "#E8844A";

const MEAL_SLOTS: { type: NutritionMealType; label: string; icon: string; color: string }[] = [
  { type: "Petit-déjeuner", label: "Petit-déjeuner", icon: "sunny-outline", color: "#F5A623" },
  { type: "Déjeuner", label: "Déjeuner", icon: "partly-sunny-outline", color: ACCENT },
  { type: "Dîner", label: "Dîner", icon: "moon-outline", color: "#4A6FA5" },
  { type: "Snack", label: "Snack", icon: "apple-outline", color: WARM },
];

function formatDate(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1);
    return d;
  });
}

export default function MenusScreen() {
  const insets = useSafeAreaInsets();
  const { nutritionLog, addNutritionEntry, deleteNutritionEntry } = useAppContext();
  const [selectedDay, setSelectedDay] = useState(formatDate(new Date()));
  const [addingSlot, setAddingSlot] = useState<NutritionMealType | null>(null);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const weekDays = getWeekDays();
  const dayNames = ["L", "M", "M", "J", "V", "S", "D"];

  const todayEntries = nutritionLog.filter((e) => e.date.startsWith(selectedDay));
  const totalCals = todayEntries.reduce((a, e) => a + e.calories, 0);
  const totalProtein = todayEntries.reduce((a, e) => a + e.protein, 0);

  function addRecipe(mealType: NutritionMealType, recipeId: string) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    addNutritionEntry({
      id: `ne-${Date.now()}`,
      date: selectedDay + "T12:00:00.000Z",
      mealType,
      recipeId,
      name: recipe.title,
      calories: recipe.calories,
      protein: recipe.macros.protein,
      carbs: recipe.macros.carbs,
      fat: recipe.macros.fat,
    });
    setAddingSlot(null);
  }

  const suggestedRecipes = addingSlot
    ? RECIPES.filter((r) => r.mealType === addingSlot).slice(0, 6)
    : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Week selector */}
      <View style={styles.weekRow}>
        {weekDays.map((d, i) => {
          const key = formatDate(d);
          const active = key === selectedDay;
          const hasActivity = nutritionLog.some((e) => e.date.startsWith(key));
          return (
            <TouchableOpacity
              key={key}
              style={[styles.dayBtn, { backgroundColor: active ? ACCENT : CARD, borderColor: active ? ACCENT : BORDER }]}
              onPress={() => setSelectedDay(key)}
            >
              <Text style={[styles.dayName, { color: active ? "#fff" : MUTED }]}>{dayNames[i]}</Text>
              <Text style={[styles.dayNum, { color: active ? "#fff" : TEXT }]}>{d.getDate()}</Text>
              {hasActivity && !active && <View style={[styles.dayDot, { backgroundColor: ACCENT }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Day summary */}
      <View style={[styles.summaryCard, { backgroundColor: CARD, borderColor: BORDER }]}>
        <View style={styles.summaryItem}>
          <Ionicons name="flame-outline" size={18} color={WARM} />
          <Text style={[styles.summaryVal, { color: WARM }]}>{totalCals}</Text>
          <Text style={[styles.summaryLabel, { color: MUTED }]}>kcal</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: BORDER }]} />
        <View style={styles.summaryItem}>
          <Ionicons name="barbell-outline" size={18} color="#4A90D9" />
          <Text style={[styles.summaryVal, { color: "#4A90D9" }]}>{totalProtein}g</Text>
          <Text style={[styles.summaryLabel, { color: MUTED }]}>protéines</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: BORDER }]} />
        <View style={styles.summaryItem}>
          <Ionicons name="restaurant-outline" size={18} color={ACCENT} />
          <Text style={[styles.summaryVal, { color: ACCENT }]}>{todayEntries.length}</Text>
          <Text style={[styles.summaryLabel, { color: MUTED }]}>repas</Text>
        </View>
      </View>

      {/* Meal slots */}
      {MEAL_SLOTS.map((slot) => {
        const slotEntries = todayEntries.filter((e) => e.mealType === slot.type);
        return (
          <View key={slot.type} style={[styles.mealSlot, { backgroundColor: CARD, borderColor: BORDER }]}>
            <View style={styles.slotHeader}>
              <Ionicons name={slot.icon as any} size={18} color={slot.color} />
              <Text style={[styles.slotTitle, { color: TEXT }]}>{slot.label}</Text>
              {slotEntries.length > 0 && (
                <Text style={[styles.slotCals, { color: slot.color }]}>
                  {slotEntries.reduce((a, e) => a + e.calories, 0)} kcal
                </Text>
              )}
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: slot.color + "15", borderColor: slot.color + "40" }]}
                onPress={() => setAddingSlot(slot.type)}
              >
                <Ionicons name="add" size={16} color={slot.color} />
              </TouchableOpacity>
            </View>
            {slotEntries.map((entry) => (
              <View key={entry.id} style={[styles.entryRow, { borderTopColor: BORDER }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.entryName, { color: TEXT }]}>{entry.name}</Text>
                  <Text style={[styles.entryMeta, { color: MUTED }]}>
                    {entry.calories} kcal · P: {entry.protein}g · G: {entry.carbs}g · L: {entry.fat}g
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteNutritionEntry(entry.id)}>
                  <Ionicons name="trash-outline" size={16} color={MUTED} />
                </TouchableOpacity>
              </View>
            ))}
            {slotEntries.length === 0 && (
              <Text style={[styles.emptySlot, { color: MUTED }]}>Rien d'ajouté</Text>
            )}
          </View>
        );
      })}

      {/* Recipe picker modal */}
      {addingSlot && (
        <View style={[styles.pickerCard, { backgroundColor: CARD, borderColor: BORDER }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: TEXT }]}>Ajouter à {addingSlot}</Text>
            <TouchableOpacity onPress={() => setAddingSlot(null)}>
              <Ionicons name="close" size={20} color={MUTED} />
            </TouchableOpacity>
          </View>
          {suggestedRecipes.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.recipeRow, { borderBottomColor: BORDER }]}
              onPress={() => addRecipe(addingSlot, r.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.recipeName, { color: TEXT }]}>{r.title}</Text>
                <Text style={[styles.recipeMeta, { color: MUTED }]}>{r.calories} kcal · {r.prepTime + r.cookTime} min</Text>
              </View>
              <Ionicons name="add-circle-outline" size={20} color={ACCENT} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  weekRow: { flexDirection: "row", gap: 6 },
  dayBtn: { flex: 1, alignItems: "center", borderRadius: 12, borderWidth: 1, paddingVertical: 8, gap: 2 },
  dayName: { fontSize: 10, fontFamily: "Inter_500Medium" },
  dayNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  summaryCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 14 },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  summaryDivider: { width: 1, marginVertical: 4 },
  mealSlot: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  slotHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  slotTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  slotCals: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  addBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  entryName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  entryMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptySlot: { fontSize: 12, fontFamily: "Inter_400Regular", paddingHorizontal: 14, paddingBottom: 12, fontStyle: "italic" },
  pickerCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: "#D4E8D0" },
  pickerTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  recipeRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1 },
  recipeName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  recipeMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
