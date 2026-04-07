import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { EXERCISES } from "@/constants/workout-data";

const WORKOUT_ORANGE = "#FF8C00";

const LEVEL_COLORS: Record<string, string> = {
  "Débutant": "#4CAF50",
  "Intermédiaire": "#FF8C00",
  "Avancé": "#E8335A",
};

export default function ExerciseDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const exercise = EXERCISES.find((e) => e.id === id);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!exercise) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Exercice introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: WORKOUT_ORANGE, marginTop: 16 }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function openVideo() {
    Linking.openURL(`https://www.youtube.com/watch?v=${exercise!.videoId}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Video thumbnail button */}
        <TouchableOpacity
          style={[styles.videoCard, { backgroundColor: "#000" }]}
          onPress={openVideo}
          activeOpacity={0.85}
        >
          <View style={styles.videoPlaceholder}>
            <Ionicons name="logo-youtube" size={48} color="#FF0000" />
            <Text style={styles.videoText}>Voir la vidéo démonstration</Text>
            <Text style={styles.videoSub}>Ouvre YouTube</Text>
          </View>
          <View style={styles.playOverlay}>
            <View style={styles.playBtn}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: LEVEL_COLORS[exercise.level] + "20" }]}>
            <Text style={[styles.badgeText, { color: LEVEL_COLORS[exercise.level] }]}>{exercise.level}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
            <Text style={[styles.badgeText, { color: WORKOUT_ORANGE }]}>{exercise.type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="barbell-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{exercise.equipment}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="flame-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{exercise.calPerMin} kcal/min</Text>
          </View>
        </View>

        {/* Muscles */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Muscles sollicités</Text>
          <View style={{ gap: 8 }}>
            <View style={styles.muscleRow}>
              <Text style={[styles.muscleLabel, { color: colors.mutedForeground }]}>Principal</Text>
              <View style={[styles.muscleBadge, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
                <Text style={[styles.muscleBadgeText, { color: WORKOUT_ORANGE }]}>{exercise.muscleGroup}</Text>
              </View>
            </View>
            {exercise.secondaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Text style={[styles.muscleLabel, { color: colors.mutedForeground }]}>Secondaires</Text>
                <View style={styles.secMuscleRow}>
                  {exercise.secondaryMuscles.map((m) => (
                    <View key={m} style={[styles.muscleBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.muscleBadgeText, { color: colors.mutedForeground }]}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
          <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>{exercise.description}</Text>
        </View>

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Instructions</Text>
          <View style={{ gap: 10 }}>
            {exercise.instructions.map((instruction, i) => (
              <View key={i} style={styles.instructionRow}>
                <View style={[styles.stepNum, { backgroundColor: WORKOUT_ORANGE }]}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "40" }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={18} color={WORKOUT_ORANGE} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conseils</Text>
            </View>
            {exercise.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: WORKOUT_ORANGE }]} />
                <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: WORKOUT_ORANGE }]}
          onPress={openVideo}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-youtube" size={20} color="#fff" />
          <Text style={styles.ctaBtnText}>Voir la vidéo complète</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 12, gap: 12,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  container: { paddingHorizontal: 20, gap: 14 },
  videoCard: {
    borderRadius: 16, height: 180, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  videoPlaceholder: { alignItems: "center", gap: 8 },
  videoText: { color: "#fff", fontSize: 14, fontFamily: "Inter_500Medium" },
  videoSub: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },
  playOverlay: {
    position: "absolute", bottom: 14, right: 14,
  },
  playBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,140,0,0.9)", alignItems: "center", justifyContent: "center",
  },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  muscleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  muscleLabel: { fontSize: 13, fontFamily: "Inter_400Regular", width: 72 },
  secMuscleRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  muscleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  muscleBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  instructionRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  stepNumText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  instructionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  tipsHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 15, borderRadius: 16, marginTop: 6,
  },
  ctaBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
