import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
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

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progressPhotos, addProgressPhoto, deleteProgressPhoto } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Partial<ProgressPhoto> & { uri?: string }>({});
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Progression visuelle</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Suis ta transformation physique avec des photos datées
        </Text>

        {progressPhotos.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="camera-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Aucune photo encore
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Poste ta première photo de progression pour suivre ton évolution
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowModal(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                Ajouter une photo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {progressPhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoItem}
                onPress={() => setSelectedPhoto(photo)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                <View style={[styles.photoMeta, { backgroundColor: colors.card }]}>
                  <Text style={[styles.photoDate, { color: colors.foreground }]}>{photo.date}</Text>
                  {photo.weight && (
                    <Text style={[styles.photoWeight, { color: colors.primary }]}>
                      {photo.weight} kg
                    </Text>
                  )}
                  {photo.sessionType && (
                    <Text style={[styles.photoSession, { color: colors.mutedForeground }]}>
                      {photo.sessionType}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add photo modal */}
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
                  <Text style={[styles.photoPickerText, { color: colors.mutedForeground }]}>
                    Appuyer pour choisir une photo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.formFields}>
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Date</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                  value={newPhoto.date || new Date().toISOString().slice(0, 10)}
                  onChangeText={(v) => setNewPhoto((p) => ({ ...p, date: v }))}
                />
              </View>

              <View style={styles.formField}>
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

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Type de séance</Text>
                <View style={styles.sessionTypes}>
                  {SESSION_TYPES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.sessionTag,
                        {
                          backgroundColor:
                            newPhoto.sessionType === s ? colors.primary : colors.card,
                          borderColor:
                            newPhoto.sessionType === s ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setNewPhoto((p) => ({ ...p, sessionType: s }))}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          color: newPhoto.sessionType === s ? "#fff" : colors.foreground,
                          fontSize: 13,
                          fontFamily: "Inter_500Medium",
                        }}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
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

      {/* Detail view modal */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View style={styles.detailOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedPhoto(null)}
            activeOpacity={1}
          />
          {selectedPhoto && (
            <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.detailImage}
                resizeMode="cover"
              />
              <View style={styles.detailMeta}>
                <Text style={[styles.detailDate, { color: colors.foreground }]}>{selectedPhoto.date}</Text>
                {selectedPhoto.weight && (
                  <Text style={[styles.detailWeight, { color: colors.primary }]}>
                    {selectedPhoto.weight} kg
                  </Text>
                )}
                {selectedPhoto.sessionType && (
                  <Text style={[styles.detailSession, { color: colors.mutedForeground }]}>
                    {selectedPhoto.sessionType}
                  </Text>
                )}
                {selectedPhoto.notes && (
                  <Text style={[styles.detailNotes, { color: colors.mutedForeground }]}>
                    {selectedPhoto.notes}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: colors.destructive + "22" }]}
                  onPress={async () => {
                    await deleteProgressPhoto(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                  <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 14 }}>
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -6,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 36,
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoItem: {
    width: "47.5%",
    borderRadius: 12,
    overflow: "hidden",
  },
  photoThumb: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  photoMeta: {
    padding: 8,
    gap: 2,
  },
  photoDate: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  photoWeight: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  photoSession: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  modalSave: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  photoPicker: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    gap: 10,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoPickerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  formFields: { gap: 14 },
  formField: { gap: 6 },
  formLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  formInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  sessionTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sessionTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  detailCard: {
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
    maxWidth: 400,
  },
  detailImage: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  detailMeta: {
    padding: 16,
    gap: 6,
  },
  detailDate: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  detailWeight: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  detailSession: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  detailNotes: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 6,
  },
});
