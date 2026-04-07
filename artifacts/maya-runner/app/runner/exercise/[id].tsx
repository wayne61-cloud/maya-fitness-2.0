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
import { RUNNER_EXERCISES } from "@/constants/runner-exercises";

const RUNNER_RED = "#E8335A";

const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#4CAF50",
  Intermédiaire: "#FF8C00",
  Avancé: "#E8335A",
};

const CATEGORY_COLORS: Record<string, string> = {
  Échauffement: "#FF8C00",
  Technique: "#4FC3F7",
  Renforcement: "#E8335A",
  Récupération: "#00E676",
  Mobilité: "#AB47BC",
};

function YoutubeEmbed({ videoId }: { videoId: string }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&playsinline=1`;
  const embedHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#000;"><iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></body></html>`;

  if (showEmbed) {
    if (Platform.OS === "web") {
      return (
        <View style={styles.videoContainer}>
          <iframe
            src={embedUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </View>
      );
    }
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
        <View style={[styles.playCircle, { backgroundColor: RUNNER_RED }]}>
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

export default function RunnerExerciseDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const exercise = RUNNER_EXERCISES.find((e) => e.id === id);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const catColor = exercise ? (CATEGORY_COLORS[exercise.category] ?? RUNNER_RED) : RUNNER_RED;

  if (!exercise) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.foreground }}>Exercice introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: RUNNER_RED, marginTop: 16 }}>Retour</Text>
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
          {exercise.title}
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
          <View style={[styles.coverBadge, { backgroundColor: catColor + "CC" }]}>
            <Text style={styles.coverBadgeText}>{exercise.category}</Text>
          </View>
        </View>

        {/* YouTube embed */}
        <YoutubeEmbed videoId={exercise.youtubeEmbedId} />

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: LEVEL_COLORS[exercise.level] + "20" }]}>
            <Text style={[styles.badgeText, { color: LEVEL_COLORS[exercise.level] }]}>
              {exercise.level}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: RUNNER_RED + "20" }]}>
            <Ionicons name="time-outline" size={12} color={RUNNER_RED} />
            <Text style={[styles.badgeText, { color: RUNNER_RED }]}>{exercise.duration} min</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="flame-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              ~{exercise.calories} kcal
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>À propos</Text>
          <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>
            {exercise.description}
          </Text>
        </View>

        {/* Muscles */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Muscles ciblés</Text>
          <View style={styles.muscleWrap}>
            {exercise.musclesTargeted.map((m) => (
              <View key={m} style={[styles.muscleBadge, { backgroundColor: RUNNER_RED + "18" }]}>
                <Text style={[styles.muscleBadgeText, { color: RUNNER_RED }]}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View
          style={[styles.section, { backgroundColor: RUNNER_RED + "10", borderColor: RUNNER_RED + "30" }]}
        >
          <View style={styles.tipsHeader}>
            <Ionicons name="star-outline" size={18} color={RUNNER_RED} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bénéfices</Text>
          </View>
          {exercise.benefits.map((b, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: RUNNER_RED }]} />
              <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Instructions</Text>
          <View style={{ gap: 10 }}>
            {exercise.instructions.map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <View style={[styles.stepNum, { backgroundColor: RUNNER_RED }]}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  coverBadge: {
    position: "absolute",
    bottom: 10,
    left: 12,
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
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  muscleWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  muscleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  muscleBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  tipsHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
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
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
