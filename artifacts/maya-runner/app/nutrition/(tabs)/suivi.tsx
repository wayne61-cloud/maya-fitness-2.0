import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";

const BG = "#F6FAF0";
const ACCENT = "#5B8C5A";
const TEXT = "#2D4A2B";
const MUTED = "#7A9878";
const CARD = "#FFFFFF";
const BORDER = "#D4E8D0";
const WARM = "#E8844A";
const RED = "#D9534A";
const BLUE = "#4A90D9";

interface Recommendation {
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  icon: string;
}

function computeScore(cals: number, protein: number, goal: number, targetProtein: number): number {
  const calScore = cals > 0 ? Math.min(cals / goal, 1) * 40 : 0;
  const proteinScore = protein > 0 ? Math.min(protein / targetProtein, 1) * 40 : 0;
  const balanceScore = cals > 0 && cals < goal * 1.1 ? 20 : 10;
  return Math.round(calScore + proteinScore + balanceScore);
}

export default function SuiviScreen() {
  const insets = useSafeAreaInsets();
  const {
    nutritionLog,
    nutritionOnboarding,
    todayCaloriesConsumed,
    todayProtein,
    todayCarbs,
    todayFat,
    weeklyWorkouts,
    weeklyYoga,
  } = useAppContext();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const GOAL_CALORIES = nutritionOnboarding?.objective === "Prise de masse" ? 2800 :
    nutritionOnboarding?.objective === "Perte de poids" ? 1600 :
    nutritionOnboarding?.objective === "Sèche" ? 1800 : 2200;
  const TARGET_PROTEIN = nutritionOnboarding?.objective === "Prise de masse" ? 180 :
    nutritionOnboarding?.objective === "Sèche" ? 160 : 120;

  const score = computeScore(todayCaloriesConsumed, todayProtein, GOAL_CALORIES, TARGET_PROTEIN);
  const scoreColor = score >= 70 ? ACCENT : score >= 40 ? WARM : RED;

  // Recommendations
  const recs: Recommendation[] = [];

  if (todayCaloriesConsumed === 0) {
    recs.push({ type: "info", title: "Commence à tracker", message: "Ajoute tes repas dans l'onglet Menus pour voir les recommandations.", icon: "add-circle-outline" });
  } else {
    if (todayProtein < TARGET_PROTEIN * 0.7) {
      recs.push({ type: "warning", title: "Manque de protéines", message: `Il te manque ${TARGET_PROTEIN - todayProtein}g de protéines. Pense à du poulet, des œufs ou de la whey.`, icon: "barbell-outline" });
    } else {
      recs.push({ type: "success", title: "Apport protéique bon", message: `${todayProtein}g / ${TARGET_PROTEIN}g — excellent pour la récupération.`, icon: "checkmark-circle-outline" });
    }
    if (todayCaloriesConsumed > GOAL_CALORIES * 1.1) {
      recs.push({ type: "warning", title: "Surplus calorique", message: `Tu es à ${todayCaloriesConsumed - GOAL_CALORIES} kcal au-dessus de ton objectif. Pense à alléger le dîner.`, icon: "alert-circle-outline" });
    } else if (todayCaloriesConsumed < GOAL_CALORIES * 0.5) {
      recs.push({ type: "info", title: "Mange plus", message: "Tu n'as consommé que la moitié de ton objectif. Ajoute un repas ou un snack protéiné.", icon: "restaurant-outline" });
    }
    if (weeklyWorkouts >= 3 || weeklyYoga >= 3) {
      recs.push({ type: "info", title: "Récupération active", message: "Ta semaine est chargée en sport. Assure-toi de bien t'hydrater et de consommer des glucides post-workout.", icon: "water-outline" });
    }
  }

  // Meal suggestions based on objective and time of day
  const h = new Date().getHours();
  const mealSuggestions = [
    h < 10 ? { name: "Porridge Protéiné", why: "Énergie durable pour la matinée" } : null,
    (h >= 11 && h < 14) ? { name: "Bowl Poulet & Riz", why: "Repas équilibré post-entraînement" } : null,
    (h >= 17 && h < 20) ? { name: "Saumon & Quinoa", why: "Oméga-3 pour la récupération musculaire" } : null,
    h >= 20 ? { name: "Salade Niçoise Fitness", why: "Léger et protéiné pour le soir" } : null,
  ].filter(Boolean) as { name: string; why: string }[];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: 16, paddingBottom: bottomPad + 90 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Score nutrition */}
      <View style={[styles.scoreCard, { backgroundColor: CARD, borderColor: BORDER }]}>
        <View style={styles.scoreHeader}>
          <View>
            <Text style={[styles.scoreTitle, { color: TEXT }]}>Score Nutrition</Text>
            <Text style={[styles.scoreDate, { color: MUTED }]}>Aujourd'hui</Text>
          </View>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreVal, { color: scoreColor }]}>{score}</Text>
            <Text style={[styles.scoreMax, { color: MUTED }]}>/100</Text>
          </View>
        </View>
        <View style={[styles.scoreTrack, { backgroundColor: BORDER }]}>
          <View style={[styles.scoreBar, { width: `${score}%`, backgroundColor: scoreColor }]} />
        </View>
        <Text style={[styles.scoreLabel, { color: MUTED }]}>
          {score >= 80 ? "Excellente journée nutritionnelle ! 🌟" :
           score >= 60 ? "Bonne journée, quelques ajustements possibles" :
           score >= 40 ? "Journée passable — améliore tes prochains repas" :
           "Commence à tracker tes repas pour améliorer ton score"}
        </Text>
      </View>

      {/* Recommendations */}
      <Text style={[styles.sectionTitle, { color: TEXT }]}>Recommandations</Text>
      {recs.map((rec, i) => {
        const colors = { info: BLUE, warning: WARM, success: ACCENT };
        const color = colors[rec.type];
        return (
          <View key={i} style={[styles.recCard, { backgroundColor: color + "10", borderColor: color + "30", borderLeftColor: color }]}>
            <Ionicons name={rec.icon as any} size={20} color={color} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.recTitle, { color: TEXT }]}>{rec.title}</Text>
              <Text style={[styles.recMsg, { color: MUTED }]}>{rec.message}</Text>
            </View>
          </View>
        );
      })}

      {/* Meal suggestions */}
      {mealSuggestions.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Suggestions de repas</Text>
          {mealSuggestions.map((s, i) => (
            <View key={i} style={[styles.suggCard, { backgroundColor: CARD, borderColor: BORDER }]}>
              <View style={[styles.suggIcon, { backgroundColor: ACCENT + "15" }]}>
                <Ionicons name="restaurant-outline" size={18} color={ACCENT} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.suggName, { color: TEXT }]}>{s.name}</Text>
                <Text style={[styles.suggWhy, { color: MUTED }]}>{s.why}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
            </View>
          ))}
        </>
      )}

      {/* Weekly summary */}
      <Text style={[styles.sectionTitle, { color: TEXT }]}>Résumé semaine</Text>
      <View style={styles.weekGrid}>
        {[
          { label: "Repas trackés", val: nutritionLog.filter((e) => { const d = new Date(e.date); const now = new Date(); return now.getTime() - d.getTime() < 7 * 86400000; }).length, icon: "restaurant-outline", color: ACCENT },
          { label: "Séances sport", val: weeklyWorkouts + weeklyYoga, icon: "barbell-outline", color: WARM },
          { label: "Objectif", val: nutritionOnboarding?.objective ?? "Maintien", icon: "flag-outline", color: BLUE },
        ].map((item) => (
          <View key={item.label} style={[styles.weekCard, { backgroundColor: CARD, borderColor: BORDER }]}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
            <Text style={[styles.weekVal, { color: item.color }]} numberOfLines={1}>{item.val}</Text>
            <Text style={[styles.weekLabel, { color: MUTED }]} numberOfLines={2}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  scoreCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  scoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  scoreDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  scoreMax: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  scoreBar: { height: "100%", borderRadius: 4 },
  scoreLabel: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  recCard: { flexDirection: "row", gap: 12, borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 14, alignItems: "flex-start" },
  recTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recMsg: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  suggCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  suggIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  suggName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  suggWhy: { fontSize: 12, fontFamily: "Inter_400Regular" },
  weekGrid: { flexDirection: "row", gap: 10 },
  weekCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  weekVal: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  weekLabel: { fontSize: 11, color: "#7A9878", fontFamily: "Inter_400Regular", textAlign: "center" },
});
