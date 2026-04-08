import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { EXERCISES } from "@/constants/workout-data";

const WORKOUT_ORANGE = "#FF8C00";

const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#4CAF50",
  Intermédiaire: "#FF8C00",
  Avancé: "#E8335A",
};

function YoutubeEmbed({ videoId }: { videoId: string }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&playsinline=1`;
  const embedHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#000;"><iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></body></html>`;

  // Web: YouTube blocks iframes — show thumbnail + open in new tab
  if (Platform.OS === "web") {
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return (
      <TouchableOpacity
        style={[styles.videoContainer, { backgroundColor: "#111" }]}
        onPress={() => { (window as any).open(`https://www.youtube.com/watch?v=${videoId}`, "_blank"); }}
        activeOpacity={0.85}
      >
        <Image source={{ uri: thumbUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.35)" }]} />
        <View style={styles.videoOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
          <Text style={styles.videoLabel}>Ouvrir sur YouTube</Text>
          <View style={styles.ytBadge}>
            <Ionicons name="logo-youtube" size={14} color="#FF0000" />
            <Text style={styles.ytBadgeText}>YouTube</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (showEmbed) {
    return (
      <WebView
        source={{ html: embedHtml }}
        style={styles.videoContainer}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
      />
    );
  }

  return (
    <TouchableOpacity
      style={[styles.videoContainer, { backgroundColor: "#111" }]}
      onPress={() => setShowEmbed(true)}
      activeOpacity={0.85}
    >
      <View style={styles.videoOverlay}>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={28} color="#fff" />
        </View>
        <Text style={styles.videoLabel}>Lancer la vidéo</Text>
        <View style={styles.ytBadge}>
          <Ionicons name="logo-youtube" size={14} color="#FF0000" />
          <Text style={styles.ytBadgeText}>YouTube</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ExerciseDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const exercise = EXERCISES.find((e) => e.id === id);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!exercise) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.foreground }}>Exercice introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: WORKOUT_ORANGE, marginTop: 16 }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
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
        {/* Cover image */}
        <View style={styles.coverWrap}>
          <Image
            source={{ uri: exercise.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverGradient} />
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>{exercise.muscleGroup}</Text>
          </View>
        </View>

        {/* YouTube embed */}
        <YoutubeEmbed videoId={exercise.videoId} />

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View
            style={[styles.badge, { backgroundColor: LEVEL_COLORS[exercise.level] + "20" }]}
          >
            <Text style={[styles.badgeText, { color: LEVEL_COLORS[exercise.level] }]}>
              {exercise.level}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
            <Text style={[styles.badgeText, { color: WORKOUT_ORANGE }]}>{exercise.type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              ~{exercise.durationMin} min
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="flame-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {exercise.calPerMin} kcal/min
            </Text>
          </View>
        </View>

        {/* Equipment */}
        <View style={[styles.equipRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="barbell-outline" size={16} color={WORKOUT_ORANGE} />
          <Text style={[styles.equipLabel, { color: colors.mutedForeground }]}>Équipement</Text>
          <Text style={[styles.equipValue, { color: colors.foreground }]}>{exercise.equipment}</Text>
        </View>

        {/* Muscles */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Muscles sollicités</Text>
          <View style={{ gap: 8 }}>
            <View style={styles.muscleRow}>
              <Text style={[styles.muscleLabel, { color: colors.mutedForeground }]}>Principal</Text>
              <View style={[styles.muscleBadge, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
                <Text style={[styles.muscleBadgeText, { color: WORKOUT_ORANGE }]}>
                  {exercise.muscleGroup}
                </Text>
              </View>
            </View>
            {exercise.secondaryMuscles.length > 0 && (
              <View style={styles.muscleRow}>
                <Text style={[styles.muscleLabel, { color: colors.mutedForeground }]}>Secondaires</Text>
                <View style={styles.secMuscleRow}>
                  {exercise.secondaryMuscles.map((m) => (
                    <View key={m} style={[styles.muscleBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.muscleBadgeText, { color: colors.mutedForeground }]}>
                        {m}
                      </Text>
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
          <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>
            {exercise.description}
          </Text>
        </View>

        {/* Benefits */}
        <View style={[styles.section, { backgroundColor: WORKOUT_ORANGE + "10", borderColor: WORKOUT_ORANGE + "30" }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="star-outline" size={18} color={WORKOUT_ORANGE} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bénéfices</Text>
          </View>
          {exercise.benefits.map((b, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: WORKOUT_ORANGE }]} />
              <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>{b}</Text>
            </View>
          ))}
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
                <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
                  {instruction}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <View
            style={[styles.section, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "40" }]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={18} color={WORKOUT_ORANGE} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conseils pro</Text>
            </View>
            {exercise.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: WORKOUT_ORANGE }]} />
                <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        {exercise.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {exercise.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  container: { paddingHorizontal: 20, gap: 14 },
  coverWrap: { borderRadius: 16, overflow: "hidden", height: 180 },
  coverImage: { width: "100%", height: "100%" },
  coverGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  coverBadge: {
    position: "absolute",
    bottom: 10,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  coverBadgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  videoContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 210,
    backgroundColor: "#111",
  },
  videoOverlay: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: WORKOUT_ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  videoLabel: { color: "#fff", fontSize: 14, fontFamily: "Inter_500Medium" },
  ytBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ytBadgeText: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  equipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  equipLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  equipValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  instructionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  tipsHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
