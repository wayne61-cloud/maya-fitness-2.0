import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { EXERCISES } from "@/app/(tabs)/exercises";
import { useApp } from "@/context/AppContext";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addWorkout } = useApp();

  const exercise = EXERCISES.find((e) => e.id === id);
  const [showWorkout, setShowWorkout] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!exercise) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground }}>Exercice non trouvé</Text>
      </View>
    );
  }

  const isWeb = Platform.OS === "web";
  const ytUrl = `https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=0&rel=0`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IFrameTag = "iframe" as any;

  function diffColor(d: string) {
    if (d === "Débutant") return colors.success;
    if (d === "Intermédiaire") return colors.warning;
    return colors.primary;
  }

  function completeSet() {
    setCompletedSets((prev) => [...prev, currentSet]);
    if (currentSet >= (exercise.sets ?? 3)) {
      setDone(true);
    } else {
      setCurrentSet((prev) => prev + 1);
    }
  }

  async function finishWorkout() {
    const duration = Math.round((Date.now() - startTime) / 1000);
    await addWorkout({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      title: exercise.name,
      exercises: [
        {
          name: exercise.name,
          sets: completedSets.length,
          reps: exercise.reps ?? 10,
        },
      ],
      duration,
    });
    setShowWorkout(false);
    if (Platform.OS === "web") {
      window.alert(`Bravo ! Séance terminée — ${completedSets.length} série(s) complétée(s).`);
      router.back();
    } else {
      Alert.alert("Bravo !", `Séance terminée — ${completedSets.length} série(s) complétée(s).`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 10, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>{exercise.name}</Text>
            <Text style={[styles.category, { color: colors.mutedForeground }]}>
              {exercise.category}
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: diffColor(exercise.difficulty) + "22" }]}>
            <Text style={[styles.diffText, { color: diffColor(exercise.difficulty) }]}>
              {exercise.difficulty}
            </Text>
          </View>
        </View>

        {/* Video */}
        <View style={[styles.videoContainer, { backgroundColor: colors.card }]}>
          {isWeb ? (
            <TouchableOpacity
              style={styles.webVideoWrap}
              onPress={() => { (window as any).open(`https://www.youtube.com/watch?v=${exercise.youtubeId}`, "_blank"); }}
              activeOpacity={0.85}
            >
              <img
                src={`https://img.youtube.com/vi/${exercise.youtubeId}/hqdefault.jpg`}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14, pointerEvents: "none", display: "block" } as any}
                alt={exercise.name}
              />
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 14 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,0,0,0.9)", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 22 }}>▶</Text>
                </View>
                <Text style={{ color: "#fff", marginTop: 10, fontSize: 13, fontWeight: "600" }}>Ouvrir sur YouTube</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <WebView
              source={{ uri: ytUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
            />
          )}
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
          </View>
          <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>
            {exercise.description}
          </Text>
        </View>

        {/* Benefits */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Bénéfices pour le coureur
            </Text>
          </View>
          <Text style={[styles.sectionText, { color: colors.mutedForeground }]}>
            {exercise.benefits}
          </Text>
        </View>

        {/* Muscles */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="body-outline" size={20} color={colors.success} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Muscles ciblés</Text>
          </View>
          <View style={styles.muscleList}>
            {exercise.primaryMuscles.map((m) => (
              <View key={m} style={[styles.muscleTag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.muscleText, { color: colors.foreground }]}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sets plan */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Programme</Text>
          </View>
          <View style={styles.setsPlan}>
            {Array.from({ length: exercise.sets ?? 3 }).map((_, i) => (
              <View key={i} style={[styles.setRow, { borderColor: colors.border }]}>
                <View style={[styles.setNum, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.setNumText, { color: colors.foreground }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.setDetail, { color: colors.foreground }]}>
                  {exercise.reps} {id === "plank" ? "secondes" : id === "jump-rope" ? "secondes" : "répétitions"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Start button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 10,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setCurrentSet(1);
            setCompletedSets([]);
            setDone(false);
            setShowWorkout(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startBtnText}>Commencer l'exercice</Text>
        </TouchableOpacity>
      </View>

      {/* Workout modal */}
      <Modal visible={showWorkout} animationType="slide" presentationStyle="pageSheet">
        <View
          style={[
            styles.workoutModal,
            { backgroundColor: colors.background, paddingTop: insets.top + 24 },
          ]}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowWorkout(false)}
          >
            <Ionicons name="close" size={26} color={colors.foreground} />
          </TouchableOpacity>

          {done ? (
            <View style={styles.workoutContent}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              <Text style={[styles.workoutTitle, { color: colors.foreground }]}>Excellent !</Text>
              <Text style={[styles.workoutSub, { color: colors.mutedForeground }]}>
                Tu as complété {completedSets.length} série(s) de {exercise.name}
              </Text>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.success }]}
                onPress={finishWorkout}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>Terminer la séance</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.workoutContent}>
              <Text style={[styles.workoutName, { color: colors.primary }]}>{exercise.name}</Text>
              <Text style={[styles.workoutTitle, { color: colors.foreground }]}>
                Série {currentSet}/{exercise.sets ?? 3}
              </Text>
              <Text style={[styles.workoutReps, { color: colors.foreground }]}>
                {exercise.reps}
                <Text style={{ fontSize: 20, color: colors.mutedForeground }}>
                  {" "}{id === "plank" ? "secondes" : id === "jump-rope" ? "secondes" : "répétitions"}
                </Text>
              </Text>

              <View style={styles.setIndicators}>
                {Array.from({ length: exercise.sets ?? 3 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.setDot,
                      {
                        backgroundColor: completedSets.includes(i + 1)
                          ? colors.success
                          : i + 1 === currentSet
                          ? colors.primary
                          : colors.secondary,
                        width: i + 1 === currentSet ? 28 : 12,
                      },
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                onPress={completeSet}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
                <Text style={styles.doneBtnText}>Série terminée</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  backBtn: {
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  category: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  diffText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  videoContainer: {
    borderRadius: 16,
    overflow: "hidden",
    height: 220,
  },
  webview: { flex: 1 },
  webVideoWrap: { width: "100%", height: "100%" },
  section: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sectionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  muscleList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  muscleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  muscleText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  setsPlan: { gap: 8 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  setNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  setDetail: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 30,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  workoutModal: {
    flex: 1,
    paddingHorizontal: 24,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  workoutContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  workoutName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  workoutTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  workoutSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  workoutReps: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  setIndicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setDot: {
    height: 12,
    borderRadius: 6,
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  doneBtnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
