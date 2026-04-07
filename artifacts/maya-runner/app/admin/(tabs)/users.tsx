import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
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
interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  joined: string;
  lastSeen: string;
}

const STATUS_COLOR: Record<UserStatus, string> = { actif: "#5B8C5A", suspendu: "#FF8C00", banni: ACCENT };

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | UserStatus>("all");
  const [users] = useState<PlatformUser[]>([]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Utilisateurs</Text>
        <Text style={styles.count}>{filtered.length} compte{filtered.length !== 1 ? "s" : ""}</Text>
      </View>

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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={52} color="#2A2A2A" />
            <Text style={styles.emptyTitle}>Aucun utilisateur</Text>
            <Text style={styles.emptyHint}>
              Les comptes inscrits sur la plateforme apparaîtront ici
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
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
              <Text style={styles.userMeta}>Inscrit le {item.joined} · Vu {item.lastSeen}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
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
  userEmail: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular", marginBottom: 2 },
  userMeta: { fontSize: 11, color: "#333", fontFamily: "Inter_400Regular" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyTitle: { fontSize: 16, color: "#555", fontFamily: "Inter_600SemiBold", marginTop: 16 },
  emptyHint: { fontSize: 13, color: "#333", fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center", paddingHorizontal: 32 },
});
