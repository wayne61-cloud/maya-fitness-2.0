import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E8335A";
const BG = "#0D0D0D";
const CARD = "#141414";
const BORDER = "#1E1E1E";

type UserStatus = "actif" | "suspendu" | "banni";
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  joined: string;
  runs: number;
  sessions: number;
  lastSeen: string;
}

const MOCK_USERS: MockUser[] = [
  { id: "u1", name: "Alice Martin", email: "alice@example.com", role: "user", status: "actif", joined: "12 janv. 2025", runs: 24, sessions: 18, lastSeen: "Aujourd'hui" },
  { id: "u2", name: "Bob Durand", email: "bob@example.com", role: "user", status: "actif", joined: "3 mars 2025", runs: 8, sessions: 32, lastSeen: "Hier" },
  { id: "u3", name: "Carol Lambert", email: "carol@example.com", role: "user", status: "suspendu", joined: "22 fév. 2025", runs: 0, sessions: 5, lastSeen: "Il y a 5 jours" },
  { id: "u4", name: "David Chen", email: "david@example.com", role: "user", status: "actif", joined: "1 avr. 2025", runs: 41, sessions: 0, lastSeen: "Il y a 2h" },
  { id: "u5", name: "Emma Leroy", email: "emma@example.com", role: "user", status: "banni", joined: "10 déc. 2024", runs: 2, sessions: 0, lastSeen: "Il y a 1 mois" },
  { id: "u6", name: "Felix Moreau", email: "felix@example.com", role: "user", status: "actif", joined: "28 mars 2025", runs: 15, sessions: 22, lastSeen: "Il y a 3h" },
  { id: "u7", name: "Grace Petit", email: "grace@example.com", role: "user", status: "actif", joined: "5 avr. 2025", runs: 3, sessions: 12, lastSeen: "Il y a 30 min" },
];

const STATUS_COLOR: Record<UserStatus, string> = { actif: "#5B8C5A", suspendu: "#FF8C00", banni: ACCENT };

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | UserStatus>("all");
  const [selected, setSelected] = useState<MockUser | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.status === filter;
    return matchSearch && matchFilter;
  });

  function changeStatus(id: string, status: UserStatus) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    setSelected(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Utilisateurs</Text>
        <Text style={styles.count}>{filtered.length} compte{filtered.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#555" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
            placeholderTextColor="#444"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#555" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(["all", "actif", "suspendu", "banni"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => setSelected(item)} activeOpacity={0.85}>
            <View style={[styles.userAvatar, { backgroundColor: STATUS_COLOR[item.status] + "33" }]}>
              <Text style={[styles.userInitial, { color: STATUS_COLOR[item.status] }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.userRow}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={styles.userStats}>
                <Text style={styles.userStatText}>🏃 {item.runs} courses</Text>
                <Text style={styles.userStatText}>💪 {item.sessions} séances</Text>
                <Text style={styles.userStatText}>Vu: {item.lastSeen}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#444" />
          </TouchableOpacity>
        )}
      />

      {/* User Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            {selected && (
              <>
                <View style={[styles.modalAvatar, { backgroundColor: STATUS_COLOR[selected.status] + "33" }]}>
                  <Text style={[styles.modalInitial, { color: STATUS_COLOR[selected.status] }]}>
                    {selected.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.modalName}>{selected.name}</Text>
                <Text style={styles.modalEmail}>{selected.email}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[selected.status] + "22", alignSelf: "center", marginVertical: 8 }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[selected.status] }]}>{selected.status}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <InfoRow icon="calendar-outline" label="Inscrit le" value={selected.joined} />
                  <InfoRow icon="time-outline" label="Dernière activité" value={selected.lastSeen} />
                  <InfoRow icon="walk-outline" label="Courses" value={`${selected.runs}`} />
                  <InfoRow icon="barbell-outline" label="Séances" value={`${selected.sessions}`} />
                </View>

                <Text style={styles.actionsTitle}>Actions de modération</Text>
                <View style={styles.actionsBtns}>
                  {selected.status !== "actif" && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#5B8C5A22", borderColor: "#5B8C5A44" }]} onPress={() => changeStatus(selected.id, "actif")}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#5B8C5A" />
                      <Text style={[styles.actionBtnText, { color: "#5B8C5A" }]}>Réactiver</Text>
                    </TouchableOpacity>
                  )}
                  {selected.status !== "suspendu" && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#FF8C0022", borderColor: "#FF8C0044" }]} onPress={() => changeStatus(selected.id, "suspendu")}>
                      <Ionicons name="pause-circle-outline" size={18} color="#FF8C00" />
                      <Text style={[styles.actionBtnText, { color: "#FF8C00" }]}>Suspendre</Text>
                    </TouchableOpacity>
                  )}
                  {selected.status !== "banni" && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#E8335A22", borderColor: "#E8335A44" }]} onPress={() => changeStatus(selected.id, "banni")}>
                      <Ionicons name="ban-outline" size={18} color={ACCENT} />
                      <Text style={[styles.actionBtnText, { color: ACCENT }]}>Bannir</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                  <Text style={styles.modalCloseText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );

  function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={16} color="#555" style={{ marginRight: 10 }} />
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  count: { fontSize: 13, color: "#555", fontFamily: "Inter_400Regular", marginTop: 2 },
  searchRow: { paddingHorizontal: 16, marginBottom: 12 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#141414", borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, color: "#FFF", fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: BORDER },
  filterChipActive: { backgroundColor: ACCENT + "22", borderColor: ACCENT + "66" },
  filterText: { fontSize: 13, color: "#666", fontFamily: "Inter_500Medium" },
  filterTextActive: { color: ACCENT },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER, gap: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  userInitial: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  userName: { fontSize: 15, color: "#FFF", fontFamily: "Inter_600SemiBold" },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular", marginBottom: 4 },
  userStats: { flexDirection: "row", gap: 10 },
  userStatText: { fontSize: 11, color: "#666", fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#141414", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: "center" },
  modalHandle: { width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, marginBottom: 20 },
  modalAvatar: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  modalInitial: { fontSize: 30, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalName: { fontSize: 20, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  modalEmail: { fontSize: 14, color: "#777", fontFamily: "Inter_400Regular", marginTop: 2 },
  modalInfo: { width: "100%", backgroundColor: "#0D0D0D", borderRadius: 14, padding: 16, marginVertical: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  infoLabel: { flex: 1, fontSize: 13, color: "#888", fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, color: "#DDD", fontFamily: "Inter_600SemiBold" },
  actionsTitle: { fontSize: 12, color: "#555", fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12, alignSelf: "flex-start" },
  actionsBtns: { flexDirection: "row", gap: 10, flexWrap: "wrap", width: "100%" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalClose: { marginTop: 16, padding: 14, width: "100%", alignItems: "center", backgroundColor: "#1A1A1A", borderRadius: 14 },
  modalCloseText: { color: "#888", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
