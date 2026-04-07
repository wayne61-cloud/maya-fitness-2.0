import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  youtubeId: string;
  description: string;
  benefits: string;
  primaryMuscles: string[];
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  sets?: number;
  reps?: number;
}

export const EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Squats",
    category: "Jambes",
    youtubeId: "aclHkVaku9U",
    description: "Le squat est un exercice fondamental de musculation qui cible principalement les quadriceps, les fessiers et les ischio-jambiers. Partez debout, pieds écartés à largeur d'épaules, puis descendez en pliant les genoux jusqu'à ce que les cuisses soient parallèles au sol.",
    benefits: "Pour les coureurs, les squats renforcent les muscles propulseurs de la course, améliorent la stabilité du genou, préviennent les blessures et augmentent la puissance à chaque foulée. Un incontournable pour progresser.",
    primaryMuscles: ["Quadriceps", "Fessiers", "Ischio-jambiers"],
    difficulty: "Débutant",
    sets: 3,
    reps: 15,
  },
  {
    id: "lunges",
    name: "Fentes",
    category: "Jambes",
    youtubeId: "QOVaHwm-Q6U",
    description: "Les fentes (lunges) sont un exercice unilatéral qui simule le mouvement de course. Avancez un pied, descendez jusqu'à ce que le genou arrière effleure le sol, puis remontez. Alternez les jambes.",
    benefits: "Excellent pour corriger les déséquilibres musculaires entre les deux jambes — fréquents chez les coureurs. Améliore la stabilité, la proprioception et la force explosive, réduisant ainsi le risque de blessures.",
    primaryMuscles: ["Quadriceps", "Fessiers", "Mollets"],
    difficulty: "Débutant",
    sets: 3,
    reps: 12,
  },
  {
    id: "calf-raises",
    name: "Mollets",
    category: "Jambes",
    youtubeId: "gwLzBJYoWlI",
    description: "Debout sur les pointes des pieds, montez et descendez lentement. Cet exercice cible spécifiquement les mollets (gastrocnémiens et soléaires), muscles essentiels à la propulsion en course.",
    benefits: "Les mollets sont les premiers absorbeurs d'impact à la course. Des mollets forts réduisent les risques de périostites tibiales et de tendinopathies d'Achille, deux blessures très fréquentes chez les coureurs.",
    primaryMuscles: ["Mollets", "Soléaires"],
    difficulty: "Débutant",
    sets: 4,
    reps: 20,
  },
  {
    id: "hip-bridges",
    name: "Pont de hanche",
    category: "Fessiers",
    youtubeId: "OUgsJ8-Vi0E",
    description: "Allongé sur le dos, genoux pliés, soulevez les hanches vers le haut en contractant les fessiers. Maintenez 2 secondes en haut puis redescendez lentement.",
    benefits: "Renforce les fessiers et les muscles stabilisateurs du bassin. Une musculature forte des fessiers est essentielle pour maintenir une bonne posture de course et prévenir les douleurs lombaires et les genoux en valgus.",
    primaryMuscles: ["Fessiers", "Ischio-jambiers", "Lombaires"],
    difficulty: "Débutant",
    sets: 3,
    reps: 15,
  },
  {
    id: "plank",
    name: "Planche",
    category: "Core",
    youtubeId: "pvIjcsNJBmY",
    description: "En appui sur les avant-bras et les pointes des pieds, maintenez le corps parfaitement aligné (tête-épaules-hanches-talons). Contractez les abdominaux et les fessiers tout au long de l'exercice.",
    benefits: "Un core solide stabilise le tronc pendant la course, réduisant les oscillations latérales qui gaspillent de l'énergie. La planche améliore la posture, prévient les douleurs dorsales et contribue à une foulée plus efficace.",
    primaryMuscles: ["Abdominaux", "Érecteurs du rachis", "Épaules"],
    difficulty: "Débutant",
    sets: 3,
    reps: 30,
  },
  {
    id: "mountain-climbers",
    name: "Grimpeurs",
    category: "Core",
    youtubeId: "nmwgirgXLYM",
    description: "En position de pompe, ramenez alternativement chaque genou vers la poitrine en maintenant le dos plat. Le rythme peut être lent (force) ou rapide (cardio).",
    benefits: "Exercice composite qui combine gainage, cardio et mobilité des hanches. Simule le mouvement des membres inférieurs en course tout en renforçant le core. Parfait pour améliorer l'endurance musculaire spécifique à la course.",
    primaryMuscles: ["Abdominaux", "Quadriceps", "Épaules"],
    difficulty: "Intermédiaire",
    sets: 3,
    reps: 20,
  },
  {
    id: "step-ups",
    name: "Step Up",
    category: "Fonctionnel",
    youtubeId: "dQqApCGd5Ss",
    description: "Montez sur un banc ou une boîte avec un pied, poussez pour soulever l'autre jambe, puis redescendez. Travaillez de façon unilatérale pour corriger les déséquilibres.",
    benefits: "Reproduit le mouvement de montée d'escalier et de côte en course. Renforce les quadriceps, les fessiers et améliore la coordination neuromusculaire. Idéal pour les coureurs de trail ou pour préparer les montées.",
    primaryMuscles: ["Quadriceps", "Fessiers", "Core"],
    difficulty: "Intermédiaire",
    sets: 3,
    reps: 10,
  },
  {
    id: "jump-rope",
    name: "Corde à sauter",
    category: "Cardio",
    youtubeId: "FJmRQ5iTXKE",
    description: "Sautez à la corde à rythme régulier, atterrissez sur l'avant du pied avec un léger fléchissement des genoux. Commencez lentement puis augmentez progressivement le rythme.",
    benefits: "La corde à sauter améliore la cadence de foulée, la coordination pied-sol et l'endurance cardiovasculaire. L'impact contrôlé renforce les os et les tendons. Outil favori des sprinters et des boxeurs pour la légèreté des appuis.",
    primaryMuscles: ["Mollets", "Core", "Cardiovasculaire"],
    difficulty: "Intermédiaire",
    sets: 5,
    reps: 60,
  },
];

const CATEGORIES = ["Tous", "Jambes", "Fessiers", "Core", "Fonctionnel", "Cardio"];
const DIFFICULTIES = ["Tous", "Débutant", "Intermédiaire", "Avancé"];

export default function ExercisesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCat, setSelectedCat] = useState("Tous");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = EXERCISES.filter(
    (e) => selectedCat === "Tous" || e.category === selectedCat
  );

  const diffColor = (d: string) => {
    if (d === "Débutant") return colors.success;
    if (d === "Intermédiaire") return colors.warning;
    return colors.primary;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Exercices</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Renforcement spécifique pour coureurs
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedCat === cat ? colors.primary : colors.card,
                borderColor: selectedCat === cat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCat(cat)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedCat === cat ? "#fff" : colors.foreground },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={[styles.exCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: ex.id } })}
          activeOpacity={0.75}
        >
          <View style={styles.exHeader}>
            <View style={[styles.exIcon, { backgroundColor: colors.primary + "22" }]}>
              <Ionicons name="barbell-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.exInfo}>
              <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
              <Text style={[styles.exCat, { color: colors.mutedForeground }]}>{ex.category}</Text>
            </View>
            <View
              style={[
                styles.diffBadge,
                { backgroundColor: diffColor(ex.difficulty) + "22" },
              ]}
            >
              <Text
                style={[styles.diffText, { color: diffColor(ex.difficulty) }]}
              >
                {ex.difficulty}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.exDesc, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {ex.description}
          </Text>

          <View style={styles.exMuscles}>
            {ex.primaryMuscles.map((m) => (
              <View
                key={m}
                style={[styles.muscleTag, { backgroundColor: colors.secondary }]}
              >
                <Text style={[styles.muscleText, { color: colors.foreground }]}>{m}</Text>
              </View>
            ))}
          </View>

          <View style={styles.exFooter}>
            <Text style={[styles.exSets, { color: colors.mutedForeground }]}>
              {ex.sets} séries × {ex.reps} {ex.id === "plank" ? "sec" : ex.id === "jump-rope" ? "sec" : "reps"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -6,
  },
  filters: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  exCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  exHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exInfo: { flex: 1 },
  exName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  exCat: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  exDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  exMuscles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  muscleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  muscleText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  exFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exSets: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
