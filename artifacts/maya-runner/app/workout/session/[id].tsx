import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SESSIONS, EXERCISES } from "@/constants/workout-data";

const WORKOUT_ORANGE = "#FF8C00";

type SessionState = "preview" | "active" | "rest" | "done";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function SessionDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addWorkout } = useApp();

  const session = SESSIONS.find((s) => s.id === id);
  const [state, setState] = useState<SessionState>("preview");
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, []);

  if (!session) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Séance introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: WORKOUT_ORANGE }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exEntries = session.exercises.map((se) => ({
    ...se,
    exercise: EXERCISES.find((e) => e.id === se.exerciseId),
  }));

  const currentEntry = exEntries[currentExIdx];
  const currentExercise = currentEntry?.exercise;

  function startSession() {
    setState("active");
    setCurrentExIdx(0);
    setCurrentSet(1);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
  }

  function nextSet() {
    if (currentSet < currentEntry.sets) {
      setCurrentSet((s) => s + 1);
      startRest();
    } else {
      if (currentExIdx < exEntries.length - 1) {
        setCurrentExIdx((i) => i + 1);
        setCurrentSet(1);
        startRest();
      } else {
        finishSession();
      }
    }
  }

  function startRest() {
    setState("rest");
    setRestTime(currentEntry.restSec);
    const interval = setInterval(() => {
      setRestTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setState("active");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function skipRest() {
    setState("active");
  }

  async function finishSession() {
    timerRef.current && clearInterval(timerRef.current);
    setState("done");
    await addWorkout({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      title: session!.name,
      sessionId: session!.id,
      duration: Math.round(elapsed / 60),
      calories: session!.calories,
      exercises: exEntries.map((e) => ({
        name: e.exercise?.name || e.exerciseId,
        sets: e.sets,
        reps: Number(e.reps) || 12,
      })),
    });
  }

  // PREVIEW screen
  if (state === "preview") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{session.name}</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.previewContainer, { paddingBottom: bottomPad + 110 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Session info card */}
          <View style={[styles.infoCard, { backgroundColor: WORKOUT_ORANGE + "18", borderColor: WORKOUT_ORANGE + "44" }]}>
            {session.tag && <Text style={[styles.sessionTag, { color: WORKOUT_ORANGE }]}>{session.tag}</Text>}
            <Text style={[styles.sessionName, { color: colors.foreground }]}>{session.name}</Text>
            <Text style={[styles.sessionDesc, { color: colors.mutedForeground }]}>{session.description}</Text>
            <View style={styles.sessionMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={WORKOUT_ORANGE} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{session.durationMin} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color={WORKOUT_ORANGE} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{session.calories} kcal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={14} color={WORKOUT_ORANGE} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{exEntries.length} exercices</Text>
              </View>
              <View style={[styles.levelChip, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
                <Text style={[styles.levelText, { color: WORKOUT_ORANGE }]}>{session.level}</Text>
              </View>
            </View>
          </View>

          {/* Exercise list */}
          <Text style={[styles.listTitle, { color: colors.foreground }]}>Programme de la séance</Text>
          {exEntries.map((entry, i) => (
            <TouchableOpacity
              key={`${entry.exerciseId}-${i}`}
              style={[styles.exercisePreview, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/workout/exercise/${entry.exerciseId}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.exNumBadge, { backgroundColor: WORKOUT_ORANGE }]}>
                <Text style={styles.exNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.exName, { color: colors.foreground }]}>{entry.exercise?.name || entry.exerciseId}</Text>
                <Text style={[styles.exMeta, { color: colors.mutedForeground }]}>
                  {entry.sets} séries × {entry.reps} reps · {entry.restSec}s repos
                </Text>
                {entry.note && (
                  <Text style={[styles.exNote, { color: WORKOUT_ORANGE }]}>{entry.note}</Text>
                )}
              </View>
              <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[styles.ctaFixed, { paddingBottom: bottomPad + 20, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: WORKOUT_ORANGE }]}
            onPress={startSession}
            activeOpacity={0.88}
          >
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.ctaBtnText}>Démarrer la séance</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // DONE screen
  if (state === "done") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 24 }}>
        <View style={[styles.doneIcon, { backgroundColor: WORKOUT_ORANGE + "20" }]}>
          <Ionicons name="checkmark-circle" size={64} color={WORKOUT_ORANGE} />
        </View>
        <Text style={[styles.doneTitle, { color: colors.foreground }]}>Séance terminée ! 🔥</Text>
        <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
          {session.name} · {Math.round(elapsed / 60)} min · {session.calories} kcal
        </Text>
        <View style={[styles.doneStats, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatVal, { color: WORKOUT_ORANGE }]}>{exEntries.length}</Text>
            <Text style={[styles.doneStatLbl, { color: colors.mutedForeground }]}>Exercices</Text>
          </View>
          <View style={[styles.doneDivider, { backgroundColor: colors.border }]} />
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatVal, { color: WORKOUT_ORANGE }]}>{session.calories}</Text>
            <Text style={[styles.doneStatLbl, { color: colors.mutedForeground }]}>kcal</Text>
          </View>
          <View style={[styles.doneDivider, { backgroundColor: colors.border }]} />
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatVal, { color: WORKOUT_ORANGE }]}>{formatTime(elapsed)}</Text>
            <Text style={[styles.doneStatLbl, { color: colors.mutedForeground }]}>Durée</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: WORKOUT_ORANGE, width: "100%" }]}
          onPress={() => router.replace("/workout/(tabs)")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ACTIVE / REST screens
  const progressPct = ((currentExIdx * 10 + currentSet) / (exEntries.length * 10)) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
      <View style={[styles.activeHeader, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity
          onPress={() => Alert.alert("Quitter la séance ?", "Tes progrès seront perdus.", [
            { text: "Continuer", style: "cancel" },
            { text: "Quitter", style: "destructive", onPress: () => { timerRef.current && clearInterval(timerRef.current); router.back(); } },
          ])}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.activeTimer, { color: colors.foreground }]}>{formatTime(elapsed)}</Text>
          <Text style={[styles.activeProg, { color: colors.mutedForeground }]}>
            {currentExIdx + 1}/{exEntries.length} exercices
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
        <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: WORKOUT_ORANGE }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.activeContainer, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {state === "rest" ? (
          <View style={styles.restView}>
            <Text style={[styles.restTitle, { color: colors.foreground }]}>Repos</Text>
            <Text style={[styles.restTimer, { color: WORKOUT_ORANGE }]}>{formatTime(restTime)}</Text>
            <Text style={[styles.restSub, { color: colors.mutedForeground }]}>
              Prochain : {exEntries[currentExIdx + 1]?.exercise?.name || exEntries[currentExIdx]?.exercise?.name}
            </Text>
            <TouchableOpacity
              style={[styles.skipBtn, { borderColor: WORKOUT_ORANGE }]}
              onPress={skipRest}
              activeOpacity={0.7}
            >
              <Text style={[styles.skipText, { color: WORKOUT_ORANGE }]}>Passer le repos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Current exercise */}
            <View style={[styles.exerciseActiveCard, { backgroundColor: colors.card, borderColor: WORKOUT_ORANGE + "44" }]}>
              <Text style={[styles.exActiveTag, { color: WORKOUT_ORANGE }]}>
                Exercice {currentExIdx + 1}/{exEntries.length}
              </Text>
              <Text style={[styles.exActiveName, { color: colors.foreground }]}>
                {currentExercise?.name || currentEntry.exerciseId}
              </Text>
              <View style={styles.setRow}>
                <View style={[styles.setInfo, { backgroundColor: WORKOUT_ORANGE + "18" }]}>
                  <Text style={[styles.setLabel, { color: WORKOUT_ORANGE }]}>Série</Text>
                  <Text style={[styles.setVal, { color: WORKOUT_ORANGE }]}>{currentSet}/{currentEntry.sets}</Text>
                </View>
                <View style={[styles.setInfo, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>Répétitions</Text>
                  <Text style={[styles.setVal, { color: colors.foreground }]}>{currentEntry.reps}</Text>
                </View>
              </View>
              {currentEntry.note && (
                <View style={[styles.noteCard, { backgroundColor: WORKOUT_ORANGE + "12" }]}>
                  <Ionicons name="information-circle-outline" size={14} color={WORKOUT_ORANGE} />
                  <Text style={[styles.noteText, { color: WORKOUT_ORANGE }]}>{currentEntry.note}</Text>
                </View>
              )}
            </View>

            {/* Instructions quick list */}
            {currentExercise?.instructions.slice(0, 3).map((inst, i) => (
              <View key={i} style={[styles.instRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.instNum, { backgroundColor: WORKOUT_ORANGE }]}>
                  <Text style={styles.instNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.instText, { color: colors.mutedForeground }]}>{inst}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      {state === "active" && (
        <View style={[styles.ctaFixed, { paddingBottom: bottomPad + 20, backgroundColor: colors.background }]}>
          <View style={styles.setDots}>
            {Array.from({ length: currentEntry.sets }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.setDot,
                  { backgroundColor: i < currentSet ? WORKOUT_ORANGE : colors.secondary },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: WORKOUT_ORANGE }]}
            onPress={nextSet}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaBtnText}>
              {currentSet < currentEntry.sets
                ? `Série suivante (${currentSet + 1}/${currentEntry.sets})`
                : currentExIdx < exEntries.length - 1
                ? "Exercice suivant"
                : "Terminer la séance 🔥"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  activeHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  activeTimer: { fontSize: 28, fontFamily: "Inter_700Bold" },
  activeProg: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 3 },
  progressFill: { height: "100%" },
  previewContainer: { paddingHorizontal: 20, gap: 12 },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  sessionTag: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase" },
  sessionName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sessionDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  sessionMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  levelChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  listTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  exercisePreview: {
    borderRadius: 14, borderWidth: 1, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  exNumBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  exNumText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  exName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  exMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exNote: { fontSize: 11, fontFamily: "Inter_500Medium" },
  ctaFixed: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  ctaBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  activeContainer: { paddingHorizontal: 20, gap: 12, paddingTop: 16 },
  exerciseActiveCard: { borderRadius: 18, borderWidth: 1.5, padding: 20, gap: 14 },
  exActiveTag: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.6 },
  exActiveName: { fontSize: 26, fontFamily: "Inter_700Bold" },
  setRow: { flexDirection: "row", gap: 12 },
  setInfo: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 4 },
  setLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase" },
  setVal: { fontSize: 28, fontFamily: "Inter_700Bold" },
  noteCard: { borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "flex-start", gap: 6 },
  noteText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  instRow: { borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  instNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 1 },
  instNumText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  instText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  setDots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  setDot: { width: 10, height: 10, borderRadius: 5 },
  restView: { alignItems: "center", paddingTop: 60, gap: 16 },
  restTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  restTimer: { fontSize: 72, fontFamily: "Inter_700Bold" },
  restSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  skipBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  skipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  doneIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  doneSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  doneStats: { borderRadius: 16, borderWidth: 1, flexDirection: "row", overflow: "hidden" },
  doneStat: { flex: 1, alignItems: "center", padding: 16, gap: 4 },
  doneStatVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  doneStatLbl: { fontSize: 11, fontFamily: "Inter_500Medium" },
  doneDivider: { width: 1 },
});
