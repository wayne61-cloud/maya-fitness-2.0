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

function smoothCoords(coords: Coord[], windowSize = 3): Coord[] {
  if (coords.length < 3) return coords;
  return coords.map((c, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(coords.length - 1, i + Math.floor(windowSize / 2));
    const slice = coords.slice(start, end + 1);
    return {
      latitude: slice.reduce((a, b) => a + b.latitude, 0) / slice.length,
      longitude: slice.reduce((a, b) => a + b.longitude, 0) / slice.length,
    };
  });
}

export default function RunScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRun } = useApp();

  const [runState, setRunState] = useState<RunState>("idle");
  const [currentPosition, setCurrentPosition] = useState<Coord | null>(null);
  const [recordedRoute, setRecordedRoute] = useState<Coord[]>([]);
  const [plannedRoute, setPlannedRoute] = useState<Coord[]>([]);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heading, setHeading] = useState(0);
  const [locationPermission, setLocationPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [followUser, setFollowUser] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  const mapRef = useRef<MapViewRef>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubRef = useRef<any>(null);
  const lastPositionRef = useRef<Coord | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Pulse animation
  useEffect(() => {
    if (runState === "running") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
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
      setLocationPermission("denied");
    }
  }

  async function requestLocationPermission() {
    if (Platform.OS === "web") {
      setLocationPermission("granted");
      getCurrentPositionWeb();
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationPermission("granted");
      await fetchCurrentLocation();
    } else {
      setLocationPermission("denied");
      Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire pour tracer ta course.");
    }
  }

  function getCurrentPositionWeb() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCurrentPosition(coord);
        lastPositionRef.current = coord;
        centerOnUser(coord);
      },
      () => {
        const coord = { latitude: 48.8566, longitude: 2.3522 };
        setCurrentPosition(coord);
        lastPositionRef.current = coord;
        centerOnUser(coord);
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
      centerOnUser(coord);
    } catch {
      const coord = { latitude: 48.8566, longitude: 2.3522 };
      setCurrentPosition(coord);
      lastPositionRef.current = coord;
    }
  }

  function centerOnUser(coord?: Coord) {
    const target = coord ?? currentPosition;
    if (!target) return;
    mapRef.current?.animateCamera({ center: target, zoom: 17, heading, pitch: runState === "running" ? 30 : 0 }, { duration: 600 });
  }

  function handleMapPress(e: any) {
    if (runState === "planning") {
      const coord = e.nativeEvent?.coordinate;
      if (coord) setPlannedRoute((prev) => [...prev, coord]);
    }
  }

  async function startRun() {
    if (locationPermission !== "granted") {
      await requestLocationPermission();
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

    if (Platform.OS === "web") {
      startWebTracking();
    } else {
      startNativeTracking();
    }
  }

  function startWebTracking() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        updatePosition(coord);
        if (pos.coords.heading != null && pos.coords.heading >= 0) setHeading(pos.coords.heading);
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
        if (loc.coords.heading != null && loc.coords.heading >= 0) setHeading(loc.coords.heading);
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
          setRecordedRoute((prev) => [...prev, coord]);
          lastPositionRef.current = coord;
        }
      } else {
        lastPositionRef.current = coord;
        setRecordedRoute([coord]);
      }
      if (followUser) {
        mapRef.current?.animateCamera({ center: coord, heading, zoom: 17, pitch: 30 }, { duration: 400 });
      }
    },
    [followUser, heading]
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
    setPlannedRoute([]);
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

  const pace =
    duration > 0 && distance > 0
      ? (() => {
          const p = duration / 60 / distance;
          const m = Math.floor(p);
          const s = Math.round((p - m) * 60);
          return `${m}:${s.toString().padStart(2, "0")}`;
        })()
      : "--:--";

  const initialRegion = (currentPosition ?? { latitude: 48.8566, longitude: 2.3522 }) && {
    latitude: (currentPosition ?? { latitude: 48.8566, longitude: 2.3522 }).latitude,
    longitude: (currentPosition ?? { latitude: 48.8566, longitude: 2.3522 }).longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const isRunning = runState === "running";
  const isPaused = runState === "paused";
  const isIdle = runState === "idle";
  const isPlanning = runState === "planning";
  const isActive = isRunning || isPaused;

  return (
    <View style={{ flex: 1 }}>
      {locationPermission === "denied" ? (
        <View style={[styles.permissionScreen, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
          <Ionicons name="location-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.permTitle, { color: colors.foreground }]}>Localisation requise</Text>
          <Text style={[styles.permText, { color: colors.mutedForeground }]}>
            Maya Runner a besoin d'accéder à ta position pour tracer tes courses.
          </Text>
          <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestLocationPermission} activeOpacity={0.85}>
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
            showsCompass={false}
            showsMyLocationButton={false}
            userInterfaceStyle="dark"
            traceCoords={recordedRoute}
            plannedCoords={plannedRoute}
            userPosition={currentPosition}
            heading={heading}
            onPanDrag={() => { if (isRunning) setFollowUser(false); }}
            onPress={handleMapPress}
          />

          {/* Top stats overlay */}
          <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
            {isActive ? (
              <View style={styles.activeStats}>
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{distance.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{formatDuration(duration)}</Text>
                  <Text style={styles.statLabel}>durée</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{pace}</Text>
                  <Text style={styles.statLabel}>/km</Text>
                </View>
              </View>
            ) : (
              <View style={styles.idleHeader}>
                <Text style={styles.idleTitle}>
                  {isPlanning ? "Planifier" : "Prêt à courir"}
                </Text>
                <Text style={styles.idleSub}>
                  {isPlanning
                    ? "Appuie sur la carte pour tracer ton itinéraire"
                    : "Lance ta course ou planifie ton parcours"}
                </Text>
              </View>
            )}
          </View>

          {/* Locate button */}
          <TouchableOpacity
            style={[styles.locateBtn, { top: topPad + 90, backgroundColor: "rgba(26,26,26,0.92)" }]}
            onPress={() => { setFollowUser(true); centerOnUser(); }}
            activeOpacity={0.8}
          >
            <Ionicons name="locate-outline" size={20} color={isRunning && followUser ? colors.primary : "#fff"} />
          </TouchableOpacity>

          {/* Calories badge during run */}
          {isActive && (
            <View style={[styles.calBadge, { top: topPad + 90 + 56, backgroundColor: "rgba(26,26,26,0.92)" }]}>
              <Ionicons name="flame-outline" size={14} color={colors.accent} />
              <Text style={[styles.calText, { color: "#fff" }]}>{Math.round(distance * 70)} kcal</Text>
            </View>
          )}

          {/* Bottom controls */}
          <View style={[styles.bottomControls, { paddingBottom: bottomPad + 90 }]}>
            {isIdle && (
              <View style={styles.idleButtons}>
                <TouchableOpacity
                  style={[styles.planBtn, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: "rgba(255,255,255,0.15)" }]}
                  onPress={() => setRunState("planning")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={20} color="#fff" />
                  <Text style={styles.planBtnText}>Planifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mainRunBtn, { backgroundColor: colors.primary }]}
                  onPress={startRun}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="run-fast" size={30} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {isPlanning && (
              <View style={styles.planningButtons}>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: "rgba(255,255,255,0.15)" }]} onPress={() => setPlannedRoute((p) => p.slice(0, -1))} activeOpacity={0.8}>
                  <Ionicons name="arrow-undo" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: "rgba(255,255,255,0.15)" }]} onPress={() => setPlannedRoute([])} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mainRunBtn, { backgroundColor: colors.primary }]} onPress={startRun} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="run-fast" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: "rgba(255,255,255,0.15)" }]} onPress={() => setRunState("idle")} activeOpacity={0.8}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {isActive && (
              <View style={styles.runningButtons}>
                {isPaused && (
                  <TouchableOpacity style={[styles.stopBtn, { backgroundColor: colors.destructive }]} onPress={stopRun} activeOpacity={0.8}>
                    <Ionicons name="stop" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.mainRunBtn, { backgroundColor: isRunning ? colors.warning : colors.primary, width: 80, height: 80, borderRadius: 40 }]}
                  onPress={isRunning ? pauseRun : resumeRun}
                  activeOpacity={0.85}
                >
                  <Ionicons name={isRunning ? "pause" : "play"} size={32} color="#fff" />
                </TouchableOpacity>
                {isRunning && (
                  <Animated.View style={[styles.recDot, { backgroundColor: colors.primary, transform: [{ scale: pulseAnim }] }]} />
                )}
              </View>
            )}
          </View>
        </>
      )}

      {/* Summary modal */}
      <Modal visible={showSummary} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.summaryModal, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Résumé de course</Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.primary }]}>{distance.toFixed(2)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>km</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.accent }]}>{formatDuration(duration)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>durée</Text>
              </View>
            </View>
            <View style={[{ height: 1, backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.success }]}>{pace}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>allure /km</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.warning }]}>{Math.round(distance * 70)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>kcal</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryActions}>
            <TouchableOpacity style={[styles.discardBtn, { borderColor: colors.border }]} onPress={discardRun} activeOpacity={0.8}>
              <Text style={[styles.discardText, { color: colors.mutedForeground }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveRun} activeOpacity={0.85}>
              <Ionicons name="save-outline" size={18} color="#fff" />
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  permTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  permText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  permBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, marginTop: 8 },
  permBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "rgba(13,13,13,0.85)",
  },
  activeStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 6,
  },
  statBlock: { alignItems: "center", gap: 2 },
  statBig: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.8 },
  statSep: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.12)" },
  idleHeader: { alignItems: "center", paddingVertical: 10, gap: 4 },
  idleTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  idleSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center" },
  locateBtn: {
    position: "absolute",
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  calBadge: {
    position: "absolute",
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  idleButtons: { flexDirection: "row", alignItems: "center", gap: 16 },
  planBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
  },
  planBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  mainRunBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8335A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  planningButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  smallBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  runningButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  stopBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  recDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  summaryModal: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  summaryTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  summaryCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", padding: 20, gap: 4 },
  summaryVal: { fontSize: 28, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6 },
  summaryDivider: { width: 1, height: 50 },
  summaryActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    paddingBottom: 24,
  },
  discardBtn: { flex: 1, paddingVertical: 16, borderRadius: 30, borderWidth: 1, alignItems: "center" },
  discardText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
