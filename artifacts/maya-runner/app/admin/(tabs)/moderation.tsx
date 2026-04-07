import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E8335A";
const BG = "#0D0D0D";
const CARD = "#141414";
const BORDER = "#1E1E1E";
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type ContentType = "photo" | "commentaire" | "pseudo";
type ModerationStatus = "en_attente" | "approuvé" | "supprimé";

interface Report {
  id: string;
  type: ContentType;
  reason: string;
  user: string;
  reportedBy: string;
  date: string;
  status: ModerationStatus;
  preview?: string;
}

const TYPE_ICON: Record<ContentType, string> = {
  photo: "image-outline",
  commentaire: "chatbubble-outline",
  pseudo: "person-outline",
};

const STATUS_COLOR: Record<ModerationStatus, string> = {
  en_attente: "#FF8C00",
  approuvé: "#5B8C5A",
  supprimé: ACCENT,
};

export default function AdminModeration() {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | ModerationStatus>("en_attente");
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  const filtered = filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus);
  const pending = reports.filter((r) => r.status === "en_attente").length;

  function approve(id: string) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approuvé" as const } : r)));
  }

  function remove(id: string) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "supprimé" as const } : r)));
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.title}>Modération</Text>
          {pending > 0 && (
            <View style={styles.pendingBadge}>
              <Ionicons name="alert-circle" size={14} color={ACCENT} />
              <Text style={styles.pendingText}>{pending} signalement{pending > 1 ? "s" : ""} en attente</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        {(["en_attente", "all", "approuvé", "supprimé"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterStatus === f && styles.filterChipActive]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[styles.filterText, filterStatus === f && { color: "#FFF" }]}>
              {f === "all" ? "Tous" : f === "en_attente" ? "En attente" : f === "approuvé" ? "Approuvés" : "Supprimés"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="shield-checkmark-outline" size={52} color="#2A2A2A" />
            <Text style={styles.emptyTitle}>Aucun signalement</Text>
            <Text style={styles.emptyHint}>
              Les contenus signalés par les utilisateurs apparaîtront ici
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={[styles.typeIcon, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
                <Ionicons name={TYPE_ICON[item.type] as any} size={18} color={STATUS_COLOR[item.status]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportType}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)} signalé{item.type === "photo" ? "e" : ""}
                </Text>
                <Text style={styles.reportDate}>{item.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                  {item.status === "en_attente" ? "En attente" : item.status === "approuvé" ? "Approuvé" : "Supprimé"}
                </Text>
              </View>
            </View>

            {item.preview && (
              <TouchableOpacity
                onPress={() => setLightboxUri(item.preview!)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.preview }} style={styles.preview} resizeMode="cover" />
                <View style={styles.previewOverlay}>
                  <Ionicons name="expand-outline" size={18} color="#FFF" />
                  <Text style={styles.previewOverlayText}>Agrandir</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.reportInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Raison :</Text>
                <Text style={styles.infoValue}>{item.reason}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Utilisateur :</Text>
                <Text style={styles.infoValue}>{item.user}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Signalé par :</Text>
                <Text style={styles.infoValue}>{item.reportedBy}</Text>
              </View>
            </View>

            {item.status === "en_attente" && (
              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => approve(item.id)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#5B8C5A" />
                  <Text style={styles.approveBtnText}>Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(item.id)}>
                  <Ionicons name="trash-outline" size={16} color={ACCENT} />
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Photo lightbox */}
      <Modal
        visible={lightboxUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxUri(null)}
      >
        <View style={styles.lightboxBg}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setLightboxUri(null)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          {lightboxUri && (
            <Image
              source={{ uri: lightboxUri }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.lightboxHint}>Appuie n'importe où pour fermer</Text>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setLightboxUri(null)}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  pendingText: { fontSize: 13, color: ACCENT, fontFamily: "Inter_500Medium" },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: BORDER },
  filterChipActive: { backgroundColor: "#333", borderColor: "#555" },
  filterText: { fontSize: 12, color: "#666", fontFamily: "Inter_500Medium" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyTitle: { fontSize: 16, color: "#555", fontFamily: "Inter_600SemiBold", marginTop: 16 },
  emptyHint: { fontSize: 13, color: "#333", fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center", paddingHorizontal: 32 },
  reportCard: { backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER },
  reportHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  reportType: { fontSize: 14, color: "#FFF", fontFamily: "Inter_600SemiBold" },
  reportDate: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  preview: { width: "100%", height: 140, borderRadius: 10, marginBottom: 0 },
  previewOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewOverlayText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_500Medium" },
  reportInfo: { backgroundColor: "#0D0D0D", borderRadius: 10, padding: 12, marginBottom: 12, marginTop: 12 },
  infoRow: { flexDirection: "row", paddingVertical: 4 },
  infoLabel: { width: 90, fontSize: 12, color: "#555", fontFamily: "Inter_400Regular" },
  infoValue: { flex: 1, fontSize: 12, color: "#CCC", fontFamily: "Inter_500Medium" },
  reportActions: { flexDirection: "row", gap: 10 },
  approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#5B8C5A22", borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: "#5B8C5A44" },
  approveBtnText: { color: "#5B8C5A", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  deleteBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: ACCENT + "22", borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: ACCENT + "44" },
  deleteBtnText: { color: ACCENT, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  lightboxBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  lightboxClose: { position: "absolute", top: 50, right: 20, zIndex: 10, padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20 },
  lightboxImage: { width: SCREEN_W, height: SCREEN_H * 0.75, zIndex: 5 },
  lightboxHint: { position: "absolute", bottom: 40, color: "#555", fontSize: 13, fontFamily: "Inter_400Regular", zIndex: 5 },
});
