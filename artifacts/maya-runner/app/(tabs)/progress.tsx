import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, ProgressPhoto } from "@/context/AppContext";

const SESSION_TYPES = ["Course", "Fractionné", "Trail", "Musculation", "Récupération"];

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatPace(pace: number) {
  if (!pace || pace <= 0 || !isFinite(pace)) return "--:--";
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Tab = "stats" | "photos";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, workouts, progressPhotos, addProgressPhoto, deleteProgressPhoto } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [showModal, setShowModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Partial<ProgressPhoto> & { uri?: string }>({});
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // ── Stats computations ──────────────────────────────────────
  const stats = useMemo(() => {
    const totalDistance = runs.reduce((a, r) => a + r.distance, 0);
    const totalDuration = runs.reduce((a, r) => a + r.duration, 0);
    const totalCalories = runs.reduce((a, r) => a + r.calories, 0);
    const longestRun = runs.length > 0 ? Math.max(...runs.map((r) => r.distance)) : 0;
    const bestPace = runs.filter((r) => r.pace > 0).length > 0
      ? Math.min(...runs.filter((r) => r.pace > 0).map((r) => r.pace))
      : 0;
    const totalWorkouts = workouts.length;

    // Fav exercise
    const exoCounts: Record<string, number> = {};
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        exoCounts[e.name] = (exoCounts[e.name] || 0) + e.sets;
      });
    });
    const favExo = Object.entries(exoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Weekly distance — last 8 weeks
    const weeks: { label: string; km: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = Date.now() - (i + 1) * 7 * 86400000;
      const end = Date.now() - i * 7 * 86400000;
      const weekRuns = runs.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= start && t < end;
      });
      const km = weekRuns.reduce((a, r) => a + r.distance, 0);
      const d = new Date(end);
      weeks.push({ label: `S${8 - i}`, km });
    }

    // Weight evolution from progress photos (sorted)
    const weightData = progressPhotos
      .filter((p) => p.weight != null && p.weight! > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({ date: p.date.slice(5), weight: p.weight! }));

    const avgPacePerMin = runs.filter((r) => r.pace > 0).length > 0
      ? runs.filter((r) => r.pace > 0).reduce((a, r) => a + r.pace, 0) / runs.filter((r) => r.pace > 0).length
      : 0;

    return {
      totalDistance,
      totalDuration,
      totalCalories,
      longestRun,
      bestPace,
      avgPace: avgPacePerMin,
      totalWorkouts,
      totalRuns: runs.length,
      favExo,
      weeks,
      weightData,
    };
  }, [runs, workouts, progressPhotos]);

  const maxWeekKm = Math.max(...stats.weeks.map((w) => w.km), 1);

  // ── Photo handlers ───────────────────────────────────────────
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à la galerie dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setNewPhoto((prev) => ({ ...prev, uri: result.assets[0].uri }));
    }
  }

  async function submitPhoto() {
    if (!newPhoto.uri) {
      Alert.alert("Sélectionnez une photo d'abord");
      return;
    }
    const photo: ProgressPhoto = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      uri: newPhoto.uri,
      date: newPhoto.date || new Date().toISOString().slice(0, 10),
      weight: newPhoto.weight ? Number(newPhoto.weight) : undefined,
      sessionType: newPhoto.sessionType,
      notes: newPhoto.notes,
    };
    await addProgressPhoto(photo);
    setNewPhoto({});
    setShowModal(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Sticky header */}
      <View style={[styles.headerWrap, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Progression</Text>
          {activeTab === "photos" && (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        {/* Tab selector */}
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "stats" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("stats")}
            activeOpacity={0.8}
          >
            <Ionicons name="stats-chart" size={15} color={activeTab === "stats" ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === "stats" ? "#fff" : colors.mutedForeground }]}>
              Statistiques
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "photos" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("photos")}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={15} color={activeTab === "photos" ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === "photos" ? "#fff" : colors.mutedForeground }]}>
              Photos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ────────── STATS TAB ────────── */}
      {activeTab === "stats" && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Global summary */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Résumé global</Text>
          <View style={styles.grid2}>
            <StatCard
              icon="footsteps-outline"
              iconColor={colors.primary}
              value={stats.totalDistance.toFixed(1)}
              unit="km"
              label="Distance totale"
              colors={colors}
            />
            <StatCard
              icon="flame-outline"
              iconColor="#FF6B35"
              value={stats.totalCalories.toLocaleString()}
              unit="kcal"
              label="Calories brûlées"
              colors={colors}
            />
            <StatCard
              icon="time-outline"
              iconColor="#4FC3F7"
              value={stats.totalDuration > 0 ? formatDuration(stats.totalDuration) : "0min"}
              unit=""
              label="Temps de course"
              colors={colors}
            />
            <StatCard
              icon="trending-up-outline"
              iconColor={colors.success}
              value={String(stats.totalRuns)}
              unit="courses"
              label="Sorties effectuées"
              colors={colors}
            />
          </View>

          {/* Performance */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Performance</Text>
          <View style={styles.grid2}>
            <StatCard
              icon="trophy-outline"
              iconColor="#FFCA28"
              value={stats.longestRun > 0 ? stats.longestRun.toFixed(2) : "--"}
              unit="km"
              label="Course la plus longue"
              colors={colors}
            />
            <StatCard
              icon="flash-outline"
              iconColor={colors.accent}
              value={formatPace(stats.bestPace)}
              unit="/km"
              label="Meilleure allure"
              colors={colors}
            />
            <StatCard
              icon="speedometer-outline"
              iconColor="#CE93D8"
              value={formatPace(stats.avgPace)}
              unit="/km"
              label="Allure moyenne"
              colors={colors}
            />
            <StatCard
              icon="barbell-outline"
              iconColor={colors.primary}
              value={String(stats.totalWorkouts)}
              unit="séances"
              label="Séances muscu"
              colors={colors}
            />
          </View>

          {/* Fav exercise */}
          {stats.favExo && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Exercices</Text>
              <View style={[styles.favExoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.favExoIcon, { backgroundColor: colors.primary + "22" }]}>
                  <MaterialCommunityIcons name="dumbbell" size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.favExoLabel, { color: colors.mutedForeground }]}>Exercice favori</Text>
                  <Text style={[styles.favExoName, { color: colors.foreground }]}>{stats.favExo}</Text>
                </View>
                <View style={[styles.favBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.favBadgeText, { color: colors.primary }]}>⭐ Favori</Text>
                </View>
              </View>
            </>
          )}

          {/* Weekly bar chart */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activité hebdo</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {stats.totalRuns === 0 ? (
              <View style={styles.chartEmpty}>
                <Ionicons name="bar-chart-outline" size={36} color={colors.mutedForeground} />
                <Text style={[styles.chartEmptyText, { color: colors.mutedForeground }]}>
                  Lance ta première course pour voir l'évolution
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.chartBars}>
                  {stats.weeks.map((w, i) => {
                    const pct = maxWeekKm > 0 ? w.km / maxWeekKm : 0;
                    const isCurrentWeek = i === stats.weeks.length - 1;
                    return (
                      <View key={i} style={styles.barCol}>
                        <Text style={[styles.barValue, { color: w.km > 0 ? colors.foreground : "transparent" }]}>
                          {w.km.toFixed(1)}
                        </Text>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: `${Math.max(pct * 100, w.km > 0 ? 8 : 0)}%`,
                                backgroundColor: isCurrentWeek ? colors.primary : colors.accent + "BB",
                                borderRadius: 4,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.barLabel, { color: isCurrentWeek ? colors.primary : colors.mutedForeground }]}>
                          {w.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={[styles.chartLegend, { borderTopColor: colors.border }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Semaine actuelle</Text>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent + "BB", marginLeft: 12 }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Semaines passées</Text>
                </View>
              </>
            )}
          </View>

          {/* Weight evolution */}
          {stats.weightData.length >= 2 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Évolution du poids</Text>
              <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.weightList}>
                  {stats.weightData.map((d, i) => {
                    const prev = stats.weightData[i - 1];
                    const diff = prev ? d.weight - prev.weight : 0;
                    return (
                      <View key={i} style={[styles.weightRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
                        <Text style={[styles.weightDate, { color: colors.mutedForeground }]}>{d.date}</Text>
                        <Text style={[styles.weightVal, { color: colors.foreground }]}>{d.weight} kg</Text>
                        {i > 0 && (
                          <View style={styles.weightDiff}>
                            <Ionicons
                              name={diff < 0 ? "arrow-down" : diff > 0 ? "arrow-up" : "remove"}
                              size={13}
                              color={diff < 0 ? colors.success : diff > 0 ? colors.destructive : colors.mutedForeground}
                            />
                            <Text style={{ color: diff < 0 ? colors.success : diff > 0 ? colors.destructive : colors.mutedForeground, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                              {Math.abs(diff).toFixed(1)} kg
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* Empty state for no data */}
          {stats.totalRuns === 0 && stats.totalWorkouts === 0 && (
            <View style={[styles.emptyStats, { borderColor: colors.border }]}>
              <Ionicons name="analytics-outline" size={52} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Pas encore de données</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Lance ta première course ou séance pour voir tes statistiques s'afficher ici.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ────────── PHOTOS TAB ────────── */}
      {activeTab === "photos" && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.photosSubtitle, { color: colors.mutedForeground }]}>
            Suis ta transformation physique avec des photos datées
          </Text>

          {progressPhotos.length === 0 ? (
            <View style={[styles.emptyPhotos, { borderColor: colors.border }]}>
              <Ionicons name="camera-outline" size={52} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune photo encore</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Poste ta première photo de progression pour suivre ton évolution
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                  Ajouter une photo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {progressPhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={[styles.photoItem, { backgroundColor: colors.card }]}
                  onPress={() => setSelectedPhoto(photo)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                  <View style={styles.photoMeta}>
                    <Text style={[styles.photoDate, { color: colors.foreground }]}>{photo.date}</Text>
                    <View style={styles.photoMetaRow}>
                      {photo.weight && (
                        <View style={[styles.photoBadge, { backgroundColor: colors.primary + "22" }]}>
                          <Text style={[styles.photoBadgeText, { color: colors.primary }]}>{photo.weight} kg</Text>
                        </View>
                      )}
                      {photo.sessionType && (
                        <View style={[styles.photoBadge, { backgroundColor: colors.card }]}>
                          <Text style={[styles.photoBadgeText, { color: colors.mutedForeground }]}>{photo.sessionType}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ────────── ADD PHOTO MODAL ────────── */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nouvelle photo</Text>
            <TouchableOpacity onPress={submitPhoto}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Sauver</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.photoPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {newPhoto.uri ? (
                <Image source={{ uri: newPhoto.uri }} style={styles.photoPreview} resizeMode="cover" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={44} color={colors.mutedForeground} />
                  <Text style={[{ color: colors.mutedForeground, fontSize: 14, fontFamily: "Inter_400Regular" }]}>
                    Appuyer pour choisir une photo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Date</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                  value={newPhoto.date || new Date().toISOString().slice(0, 10)}
                  onChangeText={(v) => setNewPhoto((p) => ({ ...p, date: v }))}
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Poids (kg)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="70"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  value={newPhoto.weight ? String(newPhoto.weight) : ""}
                  onChangeText={(v) => setNewPhoto((p) => ({ ...p, weight: Number(v) }))}
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Type de séance</Text>
                <View style={styles.sessionTypes}>
                  {SESSION_TYPES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.sessionTag,
                        {
                          backgroundColor: newPhoto.sessionType === s ? colors.primary : colors.card,
                          borderColor: newPhoto.sessionType === s ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setNewPhoto((p) => ({ ...p, sessionType: s }))}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: newPhoto.sessionType === s ? "#fff" : colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Notes</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border, minHeight: 80, textAlignVertical: "top" }]}
                  placeholder="Ressenti, observations..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  value={newPhoto.notes}
                  onChangeText={(v) => setNewPhoto((p) => ({ ...p, notes: v }))}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ────────── PHOTO DETAIL MODAL ────────── */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View style={styles.detailOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSelectedPhoto(null)} activeOpacity={1} />
          {selectedPhoto && (
            <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.detailImage} resizeMode="cover" />
              <View style={{ padding: 16, gap: 6 }}>
                <Text style={[{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }]}>{selectedPhoto.date}</Text>
                {selectedPhoto.weight && (
                  <Text style={[{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary }]}>{selectedPhoto.weight} kg</Text>
                )}
                {selectedPhoto.sessionType && (
                  <Text style={[{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }]}>{selectedPhoto.sessionType}</Text>
                )}
                {selectedPhoto.notes && (
                  <Text style={[{ fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, color: colors.mutedForeground }]}>{selectedPhoto.notes}</Text>
                )}
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: colors.destructive + "22" }]}
                  onPress={async () => { await deleteProgressPhoto(selectedPhoto.id); setSelectedPhoto(null); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                  <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 14 }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

// ── StatCard component ──────────────────────────────────────────
function StatCard({ icon, iconColor, value, unit, label, colors }: {
  icon: string; iconColor: string; value: string; unit: string; label: string; colors: any;
}) {
  return (
    <View style={[statStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: iconColor + "1A" }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={statStyles.vals}>
        <Text style={[statStyles.val, { color: colors.foreground }]}>
          {value}
          {unit ? <Text style={[statStyles.unit, { color: colors.mutedForeground }]}> {unit}</Text> : null}
        </Text>
        <Text style={[statStyles.lbl, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1, minWidth: "47%",
    borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 10,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  vals: { gap: 2 },
  val: { fontSize: 20, fontFamily: "Inter_700Bold" },
  unit: { fontSize: 13, fontFamily: "Inter_500Medium" },
  lbl: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
});

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 10 },
  sectionTitle: {
    fontSize: 16, fontFamily: "Inter_700Bold",
    marginTop: 6, marginBottom: 2,
  },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  favExoCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 16, flexDirection: "row",
    alignItems: "center", gap: 14,
  },
  favExoIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  favExoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  favExoName: { fontSize: 17, fontFamily: "Inter_700Bold", marginTop: 2 },
  favBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  favBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  chartCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 16,
  },
  chartEmpty: { alignItems: "center", gap: 8, paddingVertical: 20 },
  chartEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barValue: { fontSize: 8, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  barFill: { width: "100%", minHeight: 0 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  chartLegend: {
    flexDirection: "row", alignItems: "center",
    marginTop: 12, paddingTop: 12, gap: 6, borderTopWidth: 1,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },

  weightList: { gap: 0 },
  weightRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, gap: 8,
  },
  weightDate: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  weightVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  weightDiff: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 60, justifyContent: "flex-end" },

  emptyStats: {
    borderRadius: 16, borderWidth: 1, borderStyle: "dashed",
    padding: 36, alignItems: "center", gap: 12, marginTop: 10,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },

  photosSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  emptyPhotos: {
    borderRadius: 16, borderWidth: 1, borderStyle: "dashed",
    padding: 36, alignItems: "center", gap: 12, marginTop: 10,
  },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, marginTop: 6,
  },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoItem: { width: "47.5%", borderRadius: 12, overflow: "hidden" },
  photoThumb: { width: "100%", aspectRatio: 3 / 4 },
  photoMeta: { padding: 8, gap: 4 },
  photoDate: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  photoMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  photoBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  photoBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  modalSave: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  modalBody: { padding: 20, gap: 16 },
  photoPicker: {
    borderRadius: 16, borderWidth: 2, borderStyle: "dashed",
    height: 200, alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 10,
  },
  photoPreview: { width: "100%", height: "100%" },
  formLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  formInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  sessionTypes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sessionTag: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  detailOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  detailCard: { borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 400 },
  detailImage: { width: "100%", aspectRatio: 3 / 4 },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    alignSelf: "flex-start", marginTop: 6,
  },
});
