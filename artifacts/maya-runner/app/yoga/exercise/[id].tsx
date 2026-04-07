import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
import { YOGA_EXERCISES, YOGA_CATEGORY_COLORS } from "@/constants/yoga-data";
import { useAppContext } from "@/context/AppContext";

const BG = "#FAF7F4";
const ACCENT = "#9B7B6E";
const TEXT = "#3D2B1F";
const MUTED = "#9E8C7E";
const CARD = "#FFFFFF";
const BORDER = "#EDE8E3";

const LEVEL_COLORS: Record<string, string> = {
  Débutant: "#8BAB8B",
  Intermédiaire: "#C4A882",
  Avancé: "#E8A598",
};

function YoutubeEmbed({ videoId }: { videoId: string }) {
  const isWeb = Platform.OS === "web";
  if (isWeb) {
    return (
      <View style={styles.videoBox}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          style={{ border: "none", borderRadius: 12 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </View>
    );
  }
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#000;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;"></iframe></body></html>`;
  return (
    <View style={styles.videoBox}>
      <WebView source={{ html }} style={{ flex: 1 }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} />
    </View>
  );
}

export default function YogaExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addYogaRecord, yogaRecords } = useAppContext();
  const [started, setStarted] = useState(false);
  const bottomPad = Platform.OS === "web" ? 20 : insets.bottom;

  const exercise = YOGA_EXERCISES.find((e) => e.id === id);
  if (!exercise) return null;

  const catColor = YOGA_CATEGORY_COLORS[exercise.category];
  const lvlColor = LEVEL_COLORS[exercise.level];
  const timesCompleted = yogaRecords.filter((r) => r.exerciseId === id).length;
  const progressPct = Math.min(timesCompleted * 10, 100);

  async function handleStart() {
    setStarted(true);
    await addYogaRecord({
      id: `yoga-ex-${Date.now()}`,
      date: new Date().toISOString(),
      exerciseId: id,
      title: exercise!.title,
      duration: exercise!.duration * 60,
      calories: exercise!.calories,
      category: exercise!.category,
    });
    setTimeout(() => setStarted(false), 2000);
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 56, paddingBottom: bottomPad + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* YouTube embed */}
        <YoutubeEmbed videoId={exercise.youtubeEmbedId} />

        {/* Header */}
        <View style={styles.headerContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: catColor + "20" }]}>
              <Text style={[styles.badgeText, { color: catColor }]}>{exercise.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: lvlColor + "20" }]}>
              <Text style={[styles.badgeText, { color: lvlColor }]}>{exercise.level}</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: TEXT }]}>{exercise.title}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: "time-outline", val: `${exercise.duration} min` },
              { icon: "flame-outline", val: `${exercise.calories} kcal` },
              { icon: "barbell-outline", val: exercise.musclesTargeted[0] },
            ].map((s) => (
              <View key={s.icon} style={[styles.statChip, { backgroundColor: CARD, borderColor: BORDER }]}>
                <Ionicons name={s.icon as any} size={14} color={ACCENT} />
                <Text style={[styles.statText, { color: TEXT }]}>{s.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: CARD, borderColor: BORDER }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: TEXT }]}>Ma progression</Text>
            <Text style={[styles.progressPct, { color: catColor }]}>{progressPct}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: BORDER }]}>
            <View style={[styles.progressBar, { width: `${progressPct}%`, backgroundColor: catColor }]} />
          </View>
          <Text style={[styles.progressSub, { color: MUTED }]}>{timesCompleted} fois complété</Text>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Description</Text>
          <Text style={[styles.sectionText, { color: MUTED }]}>{exercise.description}</Text>
        </View>

        {/* Benefits */}
        <View style={[styles.section, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Bienfaits</Text>
          {exercise.benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.benefitDot, { backgroundColor: catColor }]} />
              <Text style={[styles.benefitText, { color: MUTED }]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Muscles */}
        <View style={[styles.section, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Muscles ciblés</Text>
          <View style={styles.tagRow}>
            {exercise.musclesTargeted.map((m) => (
              <View key={m} style={[styles.tag, { backgroundColor: catColor + "18" }]}>
                <Text style={[styles.tagText, { color: catColor }]}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: CARD, borderColor: BORDER }]}>
          <Text style={[styles.sectionTitle, { color: TEXT }]}>Instructions</Text>
          {exercise.instructions.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: catColor }]}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: TEXT }]}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12, backgroundColor: "rgba(250,247,244,0.9)" }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color={TEXT} />
      </TouchableOpacity>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 12, backgroundColor: BG, borderTopColor: BORDER }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: started ? "#8BAB8B" : catColor }]}
          onPress={handleStart}
          activeOpacity={0.88}
        >
          <Ionicons name={started ? "checkmark-circle" : "play"} size={18} color="#fff" />
          <Text style={styles.startBtnText}>{started ? "Exercice enregistré !" : "Démarrer l'exercice"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  videoBox: { height: 210, borderRadius: 16, overflow: "hidden", backgroundColor: "#000" },
  headerContent: { gap: 10 },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 30 },
  statsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statChip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  statText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressPct: { fontSize: 14, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 3 },
  progressSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sectionText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitDot: { width: 7, height: 7, borderRadius: 4 },
  benefitText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 1 },
  stepNumText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  backBtn: { position: "absolute", left: 16, width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 14 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15 },
  startBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
