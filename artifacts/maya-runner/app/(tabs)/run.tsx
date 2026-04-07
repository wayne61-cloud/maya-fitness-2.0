import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MapViewComponent, MapViewRef } from "@/components/MapViewComponent";

type Coord = { latitude: number; longitude: number };
type RunState = "idle" | "planning" | "running" | "paused" | "finished";

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function haversineDistance(a: Coord, b: Coord) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function RunScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRun } = useApp();

  const [runState, setRunState] = useState<RunState>("idle");
  const [currentPosition, setCurrentPosition] = useState<Coord | null>(null);
  const [recordedRoute, setRecordedRoute] = useState<Coord[]>([]);
  const [plannedRoute, setPlannedRoute] = useState<Coord[]>([]);
  const [plannedDistanceKm, setPlannedDistanceKm] = useState(0);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heading, setHeading] = useState(0);
  const [locationPermission, setLocationPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [followUser, setFollowUser] = useState(true);
  const [headingMode, setHeadingModeState] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const mapRef = useRef<MapViewRef>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubRef = useRef<any>(null);
  const lastPositionRef = useRef<Coord | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 72 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isRunning = runState === "running";
  const isPaused = runState === "paused";
  const isIdle = runState === "idle";
  const isPlanning = runState === "planning";
  const isActive = isRunning || isPaused;

  // Pulse animation while running
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [runState]);

  useEffect(() => {
    checkLocationPermission();
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      locationSubRef.current?.remove?.();
    };
  }, []);

  // Sync planning mode to Leaflet
  useEffect(() => {
    mapRef.current?.setPlanningMode(isPlanning);
  }, [isPlanning]);

  async function checkLocationPermission() {
    if (Platform.OS === "web") {
      setLocationPermission("granted");
      getCurrentPositionWeb();
      return;
    }
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationPermission("granted");
      await fetchCurrentLocation();
    } else {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(newStatus === "granted" ? "granted" : "denied");
      if (newStatus === "granted") await fetchCurrentLocation();
    }
  }

  function getCurrentPositionWeb() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCurrentPosition(coord);
        lastPositionRef.current = coord;
        setTimeout(() => centerOnUser(coord), 400);
      },
      () => {
        const coord = { latitude: 48.8566, longitude: 2.3522 };
        setCurrentPosition(coord);
        lastPositionRef.current = coord;
        setTimeout(() => centerOnUser(coord), 400);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function fetchCurrentLocation() {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCurrentPosition(coord);
      lastPositionRef.current = coord;
      setTimeout(() => centerOnUser(coord), 400);
    } catch {
      const coord = { latitude: 48.8566, longitude: 2.3522 };
      setCurrentPosition(coord);
      lastPositionRef.current = coord;
    }
  }

  function centerOnUser(coord?: Coord) {
    const target = coord ?? currentPosition;
    if (!target) return;
    mapRef.current?.animateCamera(
      { center: target, zoom: 17, heading: headingMode ? heading : 0, pitch: isRunning ? 0 : 0 },
      { duration: 500 }
    );
  }

  function handlePlanUpdate(coords: Coord[], distanceKm: number) {
    setPlannedRoute(coords);
    setPlannedDistanceKm(distanceKm);
  }

  async function startRun() {
    if (locationPermission !== "granted") {
      await checkLocationPermission();
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setRunState("running");
    setRecordedRoute([]);
    setDuration(0);
    setDistance(0);
    setFollowUser(true);

    if (currentPosition) {
      setRecordedRoute([currentPosition]);
      lastPositionRef.current = currentPosition;
    }

    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    if (Platform.OS === "web") startWebTracking();
    else startNativeTracking();
  }

  function startWebTracking() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        updatePosition(coord);
        if (pos.coords.heading != null && pos.coords.heading >= 0) {
          setHeading(pos.coords.heading);
        }
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
    locationSubRef.current = { remove: () => navigator.geolocation.clearWatch(watchId) };
  }

  async function startNativeTracking() {
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 5 },
      (loc) => {
        const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        updatePosition(coord);
        if (loc.coords.heading != null && loc.coords.heading >= 0) {
          setHeading(loc.coords.heading);
        }
      }
    );
    locationSubRef.current = sub;
  }

  const updatePosition = useCallback(
    (coord: Coord) => {
      setCurrentPosition(coord);
      if (lastPositionRef.current) {
        const d = haversineDistance(lastPositionRef.current, coord);
        if (d > 0.003) {
          setDistance((prev) => prev + d);
          setRecordedRoute((prev) => {
            const next = [...prev, coord];
            return next;
          });
          lastPositionRef.current = coord;
        }
      } else {
        lastPositionRef.current = coord;
        setRecordedRoute([coord]);
      }
      if (followUser) {
        mapRef.current?.animateCamera({ center: coord, zoom: 17 }, { duration: 400 });
      }
    },
    [followUser]
  );

  async function pauseRun() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timerRef.current && clearInterval(timerRef.current);
    locationSubRef.current?.remove?.();
    setRunState("paused");
  }

  async function resumeRun() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunState("running");
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    if (Platform.OS === "web") startWebTracking();
    else startNativeTracking();
  }

  async function stopRun() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    timerRef.current && clearInterval(timerRef.current);
    locationSubRef.current?.remove?.();
    setRunState("finished");
    setShowSummary(true);
  }

  async function saveRun() {
    const pace = distance > 0 ? duration / 60 / distance : 0;
    const calories = Math.round(distance * 70);
    await addRun({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      distance,
      duration,
      pace,
      calories,
      route: recordedRoute,
      plannedRoute: plannedRoute.length > 0 ? plannedRoute : undefined,
      title: "Course libre",
    });
    setShowSummary(false);
    setRunState("idle");
    setRecordedRoute([]);
    mapRef.current?.clearPlan();
    setPlannedRoute([]);
    setPlannedDistanceKm(0);
    setDistance(0);
    setDuration(0);
    router.push("/(tabs)/history");
  }

  function discardRun() {
    setShowSummary(false);
    setRunState("idle");
    setRecordedRoute([]);
    setDistance(0);
    setDuration(0);
  }

  function toggleHeadingMode() {
    const next = !headingMode;
    setHeadingModeState(next);
    mapRef.current?.setHeadingMode(next);
    Haptics.selectionAsync();
  }

  const pace =
    duration > 0 && distance > 0
      ? (() => {
          const p = duration / 60 / distance;
          const m = Math.floor(p);
          const s = Math.round((p - m) * 60);
          return `${m}:${s.toString().padStart(2, "0")}`;
        })()
      : "--:--";

  const initialRegion = {
    latitude: currentPosition?.latitude ?? 48.8566,
    longitude: currentPosition?.longitude ?? 2.3522,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={{ flex: 1 }}>
      {locationPermission === "denied" ? (
        <View style={[styles.permissionScreen, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
          <View style={[styles.permIcon, { backgroundColor: colors.card }]}>
            <Ionicons name="location-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.permTitle, { color: colors.foreground }]}>Localisation requise</Text>
          <Text style={[styles.permText, { color: colors.mutedForeground }]}>
            Maya Runner a besoin d'accéder à ta position pour tracer tes courses.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={checkLocationPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="locate" size={18} color="#fff" />
            <Text style={styles.permBtnText}>Autoriser la localisation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Map */}
          <MapViewComponent
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            showsUserLocation={locationPermission === "granted"}
            followsUserLocation={isRunning && followUser}
            userInterfaceStyle="dark"
            traceCoords={recordedRoute}
            plannedCoords={plannedRoute}
            userPosition={currentPosition}
            heading={heading}
            isPlanningMode={isPlanning}
            onPlanUpdate={handlePlanUpdate}
            onPanDrag={() => { if (isRunning) setFollowUser(false); }}
            onPress={() => {}}
          />

          {/* Top stats bar */}
          <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
            {isActive ? (
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{distance.toFixed(2)}</Text>
                  <Text style={styles.statUnit}>km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{formatDuration(duration)}</Text>
                  <Text style={styles.statUnit}>durée</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{pace}</Text>
                  <Text style={styles.statUnit}>/km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}>
                  <Text style={[styles.statBig, { color: colors.accent }]}>{Math.round(distance * 70)}</Text>
                  <Text style={styles.statUnit}>kcal</Text>
                </View>
              </View>
            ) : (
              <View style={styles.idleHeader}>
                <Text style={styles.idleTitle}>
                  {isPlanning ? "Planifier mon parcours" : "Prêt à courir ?"}
                </Text>
                {isPlanning && plannedDistanceKm > 0.01 ? (
                  <Text style={[styles.idleSub, { color: "#4FC3F7" }]}>
                    {plannedDistanceKm.toFixed(2)} km planifiés
                  </Text>
                ) : (
                  <Text style={styles.idleSub}>
                    {isPlanning
                      ? "Appuie sur la carte pour tracer ton itinéraire"
                      : "Lance ou planifie ta course"}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Map controls (right side) */}
          <View style={[styles.mapControls, { top: topPad + 82 }]}>
            {/* Recentrer */}
            <TouchableOpacity
              style={[
                styles.mapBtn,
                { backgroundColor: "rgba(18,18,24,0.92)" },
                followUser && isRunning && { borderColor: colors.primary, borderWidth: 1.5 },
              ]}
              onPress={() => { setFollowUser(true); centerOnUser(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={18} color={followUser && isRunning ? colors.primary : "#fff"} />
            </TouchableOpacity>

            {/* Heading mode toggle (native only really, but show on web too) */}
            {isActive && (
              <TouchableOpacity
                style={[
                  styles.mapBtn,
                  { backgroundColor: "rgba(18,18,24,0.92)" },
                  headingMode && { backgroundColor: colors.primary },
                ]}
                onPress={toggleHeadingMode}
                activeOpacity={0.8}
              >
                <Ionicons name="compass-outline" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom controls */}
          <View style={[styles.bottomControls, { paddingBottom: bottomPad + 90 }]}>
            {/* Idle */}
            {isIdle && (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.secBtn, { backgroundColor: "rgba(18,18,24,0.95)", borderColor: "rgba(255,255,255,0.14)" }]}
                  onPress={() => setRunState("planning")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={20} color="#fff" />
                  <Text style={styles.secBtnText}>Planifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bigBtn, { backgroundColor: colors.primary }]}
                  onPress={startRun}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="run-fast" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Planning mode */}
            {isPlanning && (
              <View style={styles.column}>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: "rgba(18,18,24,0.95)", borderColor: "rgba(255,255,255,0.14)" }]}
                    onPress={() => mapRef.current?.undoLastPlanPoint()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-undo-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: "rgba(18,18,24,0.95)", borderColor: "rgba(255,255,255,0.14)" }]}
                    onPress={() => { mapRef.current?.clearPlan(); setPlannedDistanceKm(0); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.bigBtn, { backgroundColor: colors.primary }]}
                    onPress={startRun}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="run-fast" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: "rgba(18,18,24,0.95)", borderColor: "rgba(255,255,255,0.14)" }]}
                    onPress={() => { setRunState("idle"); mapRef.current?.setPlanningMode(false); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Running / Paused */}
            {isActive && (
              <View style={styles.row}>
                {isPaused && (
                  <TouchableOpacity
                    style={[styles.stopBtn, { backgroundColor: colors.destructive }]}
                    onPress={stopRun}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="stop" size={26} color="#fff" />
                  </TouchableOpacity>
                )}
                <View style={{ position: "relative" }}>
                  <TouchableOpacity
                    style={[
                      styles.bigBtn,
                      { width: 80, height: 80, borderRadius: 40, backgroundColor: isRunning ? "#E8A000" : colors.primary },
                    ]}
                    onPress={isRunning ? pauseRun : resumeRun}
                    activeOpacity={0.85}
                  >
                    <Ionicons name={isRunning ? "pause" : "play"} size={34} color="#fff" />
                  </TouchableOpacity>
                  {isRunning && (
                    <Animated.View
                      style={[
                        styles.recPulse,
                        { backgroundColor: colors.primary, transform: [{ scale: pulseAnim }] },
                      ]}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </>
      )}

      {/* Summary modal */}
      <Modal visible={showSummary} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: (insets.top || 24) + 16 }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Résumé de course</Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryVal, { color: colors.primary }]}>{distance.toFixed(2)}</Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>kilomètres</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryVal, { color: colors.accent }]}>{formatDuration(duration)}</Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>durée</Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryVal, { color: colors.success }]}>{pace}</Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>allure /km</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryVal, { color: "#FFCA28" }]}>{Math.round(distance * 70)}</Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>kcal brûlées</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={discardRun}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Ignorer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={saveRun}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionScreen: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, gap: 18,
  },
  permIcon: {
    width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center",
  },
  permTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  permText: {
    fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22,
  },
  permBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, marginTop: 8,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: "rgba(13,13,13,0.88)",
  },
  statsRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingTop: 4,
  },
  statBlock: { alignItems: "center", gap: 2 },
  statBig: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  statUnit: {
    fontSize: 10, fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.8,
  },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.1)" },
  idleHeader: { alignItems: "center", paddingVertical: 8, gap: 4 },
  idleTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  idleSub: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)", textAlign: "center",
  },

  mapControls: {
    position: "absolute", right: 14, gap: 10, alignItems: "center",
  },
  mapBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },

  bottomControls: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    alignItems: "center", justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  column: { alignItems: "center", gap: 10 },
  secBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 22, paddingVertical: 15,
    borderRadius: 30, borderWidth: 1,
  },
  secBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  bigBtn: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#E8335A", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 8,
  },
  iconBtn: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  stopBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  recPulse: {
    position: "absolute", top: -3, right: -3,
    width: 14, height: 14, borderRadius: 7,
  },

  modal: { flex: 1, paddingHorizontal: 20, gap: 20 },
  modalTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  summaryCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryCell: { flex: 1, alignItems: "center", padding: 22, gap: 4 },
  summaryVal: { fontSize: 28, fontFamily: "Inter_700Bold" },
  summaryLbl: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryDivider: { width: 1, height: 50 },
  modalActions: {
    flexDirection: "row", gap: 12, marginTop: "auto" as any, paddingBottom: 32,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 30, borderWidth: 1, alignItems: "center",
  },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 2, flexDirection: "row", gap: 8,
    alignItems: "center", justifyContent: "center",
    paddingVertical: 16, borderRadius: 30,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
