import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RECIPES } from "@/constants/nutrition-data";
import { useAppContext } from "@/context/AppContext";

const BG = "#F6FAF0";
const ACCENT = "#5B8C5A";
const TEXT = "#2D4A2B";
const MUTED = "#7A9878";
const CARD = "#FFFFFF";
const BORDER = "#D4E8D0";
const WARM = "#E8844A";

function YoutubeEmbed({ videoId }: { videoId: string }) {
  const isWeb = Platform.OS === "web";
  if (isWeb) {
    return (
      <View style={styles.videoBox}>
        <iframe
          width="100%" height="100%"
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          style={{ border: "none" }}
          allowFullScreen
        />
      </View>
    );
  }
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#000;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;"></iframe></body></html>`;
  return (
    <View style={styles.videoBox}>
      <WebView source={{ html }} style={{ flex: 1 }} allowsInlineMediaPlayback />
    </View>
  );
}

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addNutritionEntry } = useAppContext();
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) return null;

  async function handleAdd() {
    const now = new Date();
    await addNutritionEntry({
      id: `ne-${Date.now()}`,
      date: now.toISOString(),
      mealType: recipe!.mealType as any,
      recipeId: id,
      name: recipe!.title,
      calories: recipe!.calories,
      protein: recipe!.macros.protein,
      carbs: recipe!.macros.carbs,
      fat: recipe!.macros.fat,
    });
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 56, paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Video or placeholder */}
        {recipe.youtubeEmbedId ? (
          <YoutubeEmbed videoId={recipe.youtubeEmbedId} />
        ) : (
          <View style={[styles.videoBox, { backgroundColor: ACCENT + "20", alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="restaurant-outline" size={48} color={ACCENT} />
          </View>
        )}

        {/* Header */}
        <Text style={[styles.title, { color: TEXT }]}>{recipe.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: ACCENT + "15" }]}>
            <Ionicons name="time-outline" size={12} color={ACCENT} />
            <Text style={[styles.badgeText, { color: ACCENT }]}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: WARM + "15" }]}>
            <Ionicons name="people-outline" size={12} color={WARM} />
            <Text style={[styles.badgeText, { color: WARM }]}>{recipe.servings} portion{recipe.servings > 1 ? "s" : ""}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#4A90D9" + "15" }]}>
            <Text style={[styles.badgeText, { color: "#4A90D9" }]}>{recipe.difficulty}</Text>
          </View>
        </View>

        {/* Calories + Macros */}
        <View style={[styles.macroCard, { backgroundColor: CARD, borderColor: BORDER }]}>
          <View style={styles.macroMain}>
            <Text style={[styles.calVal, { color: ACCENT }]}>{recipe.calories}</Text>
            <Text style={[styles.calLabel, { color: MUTED }]}>kcal</Text>
          </View>
          {[
            { label: "Protéines", val: recipe.macros.protein, color: "#4A90D9" },
            { label: "Glucides", val: recipe.macros.carbs, color: WARM },
            { label: "Lipides", val: recipe.macros.fat, color: "#D9534A" },
            { label: "Fibres", val: recipe.macros.fiber, color: ACCENT },
          ].map((m) => (
            <View key={m.label} style={styles.macroItem}>
              <Text style={[styles.macroVal, { color: m.color }]}>{m.val}g</Text>
              <Text style={[styles.macroLabel, { color: MUTED }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Diet tags */}
        <View style={styles.dietRow}>
          {recipe.diet.map((d) => (
            <View key={d} style={[styles.dietTag, { backgroundColor: ACCENT + "15" }]}>
              <Text style={[styles.dietTagText, { color: ACCENT }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Ingredients */}
        <View style={[styles.section, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Ingrédients</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingRow}>
              <View style={[styles.ingDot, { backgroundColor: ACCENT }]} />
              <Text style={[styles.ingName, { color: TEXT }]}>{ing.name}</Text>
              <Text style={[styles.ingAmount, { color: MUTED }]}>{ing.amount}</Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={[styles.section, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Préparation</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: ACCENT }]}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: TEXT }]}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Back + CTA */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color={TEXT} />
      </TouchableOpacity>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, backgroundColor: BG, borderTopColor: BORDER }]}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: ACCENT }]} onPress={handleAdd} activeOpacity={0.88}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Ajouter à mes repas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  videoBox: { height: 210, borderRadius: 16, overflow: "hidden", backgroundColor: "#000" },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  macroCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 8 },
  macroMain: { alignItems: "center", marginRight: 8 },
  calVal: { fontSize: 28, fontFamily: "Inter_700Bold" },
  calLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  macroItem: { flex: 1, alignItems: "center", gap: 2 },
  macroVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  macroLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  dietRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dietTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  dietTagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  section: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ingDot: { width: 6, height: 6, borderRadius: 3 },
  ingName: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  ingAmount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  backBtn: { position: "absolute", left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(246,250,240,0.9)", alignItems: "center", justifyContent: "center" },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 14 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15 },
  addBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
