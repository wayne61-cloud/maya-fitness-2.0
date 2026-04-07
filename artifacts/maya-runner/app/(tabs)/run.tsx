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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

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

  const mapRef = useRef<MapView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastPositionRef = useRef<Coord | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Pulse animation for recording dot
  useEffect(() => {
    if (runState === "running") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
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
      locationSubscriptionRef.current?.remove();
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
      Alert.alert(
        "Permission refusée",
        "L'accès à la localisation est nécessaire pour tracer ta course."
      );
    }
  }

  function getCurrentPositionWeb() {
    if (Platform.OS !== "web" || typeof navigator === "undefined") return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCurrentPosition(coord);
        lastPositionRef.current = coord;
        centerOnUser(coord);
      },
      () => {
        // fallback to Paris
        const coord = { latitude: 48.8566, longitude: 2.3522 };
        setCurrentPosition(coord);
        lastPositionRef.current = coord;
        centerOnUser(coord);
      }
    );
  }

  async function fetchCurrentLocation() {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coord = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
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
    mapRef.current?.animateCamera(
      {
        center: target,
        zoom: 17,
        heading,
        pitch: runState === "running" ? 30 : 0,
      },
      { duration: 600 }
    );
  }

  function handleMapPress(e: MapPressEvent) {
    if (runState === "planning") {
      setPlannedRoute((prev) => [...prev, e.nativeEvent.coordinate]);
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

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    // Start location tracking
    if (Platform.OS === "web") {
      startWebLocationTracking();
    } else {
      startNativeLocationTracking();
    }
  }

  function startWebLocationTracking() {
    if (typeof navigator === "undefined") return;
    const watchId = navigator.geolocation?.watchPosition(
      (pos) => {
        const coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        updatePosition(coord);
        if (pos.coords.heading != null && pos.coords.heading >= 0) {
          setHeading(pos.coords.heading);
        }
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
    (locationSubscriptionRef as any).current = {
      remove: () => navigator.geolocation?.clearWatch(watchId),
    };
  }

  async function startNativeLocationTracking() {
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        const coord = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        updatePosition(coord);
        if (loc.coords.heading != null && loc.coords.heading >= 0) {
          setHeading(loc.coords.heading);
        }
      }
    );
    locationSubscriptionRef.current = sub;
  }

  const updatePosition = useCallback(
    (coord: Coord) => {
      setCurrentPosition(coord);

      if (lastPositionRef.current) {
        const d = haversineDistance(lastPositionRef.current, coord);
        if (d > 0.003) {
          // Min 3m to avoid GPS drift noise
          setDistance((prev) => prev + d);
          setRecordedRoute((prev) => [...prev, coord]);
          lastPositionRef.current = coord;
        }
      } else {
        lastPositionRef.current = coord;
        setRecordedRoute((prev) => [...prev, coord]);
      }

      if (followUser) {
        mapRef.current?.animateCamera(
          { center: coord, heading, zoom: 17, pitch: 30 },
          { duration: 400 }
        );
      }
    },
    [followUser, heading]
  );

  async function pauseRun() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    timerRef.current && clearInterval(timerRef.current);
    locationSubscriptionRef.current?.remove();
    setRunState("paused");
  }

  async function resumeRun() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunState("running");
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    if (Platform.OS === "web") {
      startWebLocationTracking();
    } else {
      startNativeLocationTracking();
    }
  }

  async function stopRun() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    timerRef.current && clearInterval(timerRef.current);
    locationSubscriptionRef.current?.remove();
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

  const smoothed = smoothCoords(recordedRoute);

  const initialRegion = currentPosition
    ? {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  const isRunning = runState === "running";
  const isPaused = runState === "paused";
  const isIdle = runState === "idle";
  const isPlanning = runState === "planning";
  const isActive = isRunning || isPaused;

  return (
    <View style={{ flex: 1 }}>
      {/* Full screen map */}
      {locationPermission === "denied" && !isActive ? (
        <View style={[styles.permissionScreen, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
          <Ionicons name="location-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.permTitle, { color: colors.foreground }]}>Localisation requise</Text>
          <Text style={[styles.permText, { color: colors.mutedForeground }]}>
            Maya Runner a besoin d'accéder à ta position pour tracer tes courses.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={requestLocationPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permBtnText}>Autoriser la localisation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            initialRegion={initialRegion}
            showsUserLocation={locationPermission === "granted"}
            followsUserLocation={isRunning && followUser}
            showsCompass={false}
            showsMyLocationButton={false}
            userInterfaceStyle="dark"
            onPanDrag={() => {
              if (isRunning) setFollowUser(false);
            }}
            onPress={handleMapPress}
          >
            {/* Planned route */}
            {plannedRoute.length > 1 && (
              <Polyline
                coordinates={plannedRoute}
                strokeColor={colors.mapTracePlanned}
                strokeWidth={3}
                lineDashPattern={[8, 6]}
              />
            )}
            {plannedRoute.map((coord, i) => (
              <Marker key={`plan-${i}`} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.planDot, { backgroundColor: colors.mapTracePlanned }]} />
              </Marker>
            ))}

            {/* Recorded route */}
            {smoothed.length > 1 && (
              <Polyline
                coordinates={smoothed}
                strokeColor={colors.mapTrace}
                strokeWidth={4}
                strokeColors={undefined}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </MapView>

          {/* Top overlay — status bar */}
          <View
            style={[
              styles.topBar,
              {
                paddingTop: topPad + 10,
                backgroundColor: "rgba(13,13,13,0.82)",
              },
            ]}
          >
            {isActive ? (
              <View style={styles.activeStats}>
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{distance.toFixed(2)}</Text>
                  <Text style={styles.statSmall}>km</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{formatDuration(duration)}</Text>
                  <Text style={styles.statSmall}>durée</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                <View style={styles.statBlock}>
                  <Text style={styles.statBig}>{pace}</Text>
                  <Text style={styles.statSmall}>/km</Text>
                </View>
              </View>
            ) : (
              <View style={styles.idleHeader}>
                <Text style={styles.idleTitle}>
                  {isPlanning ? "Planifier ma course" : "Prêt à courir"}
                </Text>
                <Text style={styles.idleSub}>
                  {isPlanning
                    ? "Appuie sur la carte pour tracer ton itinéraire"
                    : "Lance ta course ou planifie ton itinéraire"}
                </Text>
              </View>
            )}
          </View>

          {/* Map controls — right side */}
          <View
            style={[
              styles.mapControls,
              { top: topPad + 90 },
            ]}
          >
            <TouchableOpacity
              style={[styles.mapBtn, { backgroundColor: "rgba(26,26,26,0.9)" }]}
              onPress={() => {
                setFollowUser(true);
                centerOnUser();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="locate-outline" size={20} color={isRunning && followUser ? colors.primary : "#fff"} />
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View
            style={[
              styles.bottomControls,
              {
                paddingBottom: bottomPad + 90,
                backgroundColor: "rgba(13,13,13,0.0)",
              },
            ]}
          >
            {isIdle && (
              <View style={styles.idleButtons}>
                <TouchableOpacity
                  style={[
                    styles.planBtn,
                    { backgroundColor: "rgba(26,26,26,0.95)", borderColor: colors.border },
                  ]}
                  onPress={() => setRunState("planning")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={20} color={colors.foreground} />
                  <Text style={styles.planBtnText}>Planifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.startRunBtn, { backgroundColor: colors.primary }]}
                  onPress={startRun}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="run-fast" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {isPlanning && (
              <View style={styles.planningButtons}>
                <TouchableOpacity
                  style={[styles.planAction, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: colors.border }]}
                  onPress={() => setPlannedRoute((p) => p.slice(0, -1))}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-undo" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.planAction, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: colors.border }]}
                  onPress={() => setPlannedRoute([])}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.startRunBtn, { backgroundColor: colors.primary }]}
                  onPress={startRun}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="run-fast" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.planAction, { backgroundColor: "rgba(26,26,26,0.95)", borderColor: colors.border }]}
                  onPress={() => setRunState("idle")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            )}

            {isActive && (
              <View style={styles.runningButtons}>
                {isPaused && (
                  <TouchableOpacity
                    style={[styles.runActionBtn, { backgroundColor: colors.destructive }]}
                    onPress={stopRun}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="stop" size={24} color="#fff" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.mainRunBtn,
                    { backgroundColor: isRunning ? colors.warning : colors.primary },
                  ]}
                  onPress={isRunning ? pauseRun : resumeRun}
                  activeOpacity={0.85}
                >
                  <Ionicons name={isRunning ? "pause" : "play"} size={32} color="#fff" />
                </TouchableOpacity>

                {isRunning && (
                  <Animated.View
                    style={[
                      styles.recordingDot,
                      {
                        backgroundColor: colors.primary,
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                )}
              </View>
            )}
          </View>

          {/* Calories badge during run */}
          {isActive && (
            <View style={[styles.caloriesBadge, { backgroundColor: "rgba(26,26,26,0.9)", top: topPad + 90 + 60 }]}>
              <Ionicons name="flame-outline" size={14} color={colors.accent} />
              <Text style={[styles.calText, { color: colors.foreground }]}>
                {Math.round(distance * 70)} kcal
              </Text>
            </View>
          )}
        </>
      )}

      {/* Summary modal */}
      <Modal visible={showSummary} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.summaryModal, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Résumé de course</Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.primary }]}>
                  {distance.toFixed(2)}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>km</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.accent }]}>
                  {formatDuration(duration)}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>durée</Text>
              </View>
            </View>
            <View style={[styles.summaryDividerH, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.success }]}>{pace}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>allure /km</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.warning }]}>
                  {Math.round(distance * 70)}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>kcal</Text>
              </View>
            </View>
          </View>

          {recordedRoute.length > 1 && (
            <View style={[styles.miniMap, { overflow: "hidden", borderRadius: 16 }]}>
              <MapView
                style={{ flex: 1 }}
                provider={PROVIDER_DEFAULT}
                scrollEnabled={false}
                zoomEnabled={false}
                initialRegion={(() => {
                  const lats = recordedRoute.map((c) => c.latitude);
                  const lons = recordedRoute.map((c) => c.longitude);
                  const minLat = Math.min(...lats);
                  const maxLat = Math.max(...lats);
                  const minLon = Math.min(...lons);
                  const maxLon = Math.max(...lons);
                  return {
                    latitude: (minLat + maxLat) / 2,
                    longitude: (minLon + maxLon) / 2,
                    latitudeDelta: (maxLat - minLat) * 1.4 || 0.005,
                    longitudeDelta: (maxLon - minLon) * 1.4 || 0.005,
                  };
                })()}
                userInterfaceStyle="dark"
              >
                <Polyline
                  coordinates={smoothCoords(recordedRoute)}
                  strokeColor={colors.mapTrace}
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                />
              </MapView>
            </View>
          )}

          <View style={styles.summaryActions}>
            <TouchableOpacity
              style={[styles.discardBtn, { borderColor: colors.border }]}
              onPress={discardRun}
              activeOpacity={0.8}
            >
              <Text style={[styles.discardText, { color: colors.mutedForeground }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={saveRun}
              activeOpacity={0.85}
            >
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
  permTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  permText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  permBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 8,
  },
  permBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  activeStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBlock: {
    alignItems: "center",
    gap: 2,
  },
  statBig: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statSmall: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  idleHeader: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  idleTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  idleSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  mapControls: {
    position: "absolute",
    right: 14,
    gap: 10,
  },
  mapBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  idleButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  planBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
  },
  planBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  startRunBtn: {
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
  planningButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planAction: {
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
  runActionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  mainRunBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    top: -2,
    right: -2,
  },
  caloriesBadge: {
    position: "absolute",
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  planDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  summaryModal: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    gap: 4,
  },
  summaryVal: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryDivider: {
    width: 1,
    height: 50,
  },
  summaryDividerH: {
    height: 1,
  },
  miniMap: {
    height: 180,
  },
  summaryActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    paddingBottom: 24,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
  },
  discardText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
