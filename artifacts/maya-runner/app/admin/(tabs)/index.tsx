import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const ACCENT = "#E8335A";
const BG = "#0D0D0D";
const CARD = "#141414";
const BORDER = "#1E1E1E";

const MOCK_STATS = [
  { label: "Utilisateurs actifs", value: "1 248", delta: "+12%", icon: "people" as const, color: "#FFD60A" },
  { label: "Sessions aujourd'hui", value: "342", delta: "+8%", icon: "fitness" as const, color: "#FF8C00" },
  { label: "Tickets ouverts", value: "14", delta: "-3", icon: "headset" as const, color: ACCENT },
  { label: "Signalements", value: "3", delta: "0", icon: "flag" as const, color: "#9B59B6" },
];

const MOCK_ACTIVITY = [
  { user: "alice@example.com", action: "Inscription", time: "Il y a 2 min", badge: "NEW" },
  { user: "bob@example.com", action: "Ticket support #42", time: "Il y a 5 min", badge: "TICKET" },
  { user: "carol@example.com", action: "Photo signalée", time: "Il y a 11 min", badge: "FLAG" },
  { user: "david@example.com", action: "Session yoga terminée", time: "Il y a 18 min", badge: "YOGA" },
  { user: "emma@example.com", action: "Course de 8.2 km", time: "Il y a 23 min", badge: "RUN" },
];

const BADGE_COLORS: Record<string, string> = {
  NEW: "#5B8C5A",
  TICKET: "#FF8C00",
  FLAG: ACCENT,
  YOGA: "#9B7B6E",
  RUN: "#E8335A",
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Maya Admin</Text>
          <Text style={styles.headerSub}>
            <Text style={{ color: ACCENT }}>● </Text>
            {user?.name} · {user?.role.charAt(0).toUpperCase() + user!.role.slice(1)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Image
            source={{ uri: `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}` }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats grid */}
      <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
      <View style={styles.statsGrid}>
        {MOCK_STATS.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.color + "22" }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statDelta, { color: s.delta.startsWith("+") ? "#5B8C5A" : s.delta.startsWith("-") && s.label !== "Tickets ouverts" ? ACCENT : "#888" }]}>
              {s.delta}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.quickRow}>
        <QuickBtn icon="person-add-outline" label="Ajouter user" color="#5B8C5A" />
        <QuickBtn icon="ban-outline" label="Suspendre" color={ACCENT} />
        <QuickBtn icon="mail-outline" label="Notifier" color="#FFD60A" />
        <QuickBtn icon="download-outline" label="Export CSV" color="#9B7B6E" />
      </View>

      {/* Recent activity */}
      <Text style={styles.sectionTitle}>Activité récente</Text>
      <View style={styles.activityCard}>
        {MOCK_ACTIVITY.map((item, i) => (
          <View key={i} style={[styles.activityRow, i < MOCK_ACTIVITY.length - 1 && styles.activityBorder]}>
            <View style={[styles.badge, { backgroundColor: (BADGE_COLORS[item.badge] ?? "#888") + "22" }]}>
              <Text style={[styles.badgeText, { color: BADGE_COLORS[item.badge] ?? "#888" }]}>{item.badge}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityUser}>{item.user}</Text>
              <Text style={styles.activityAction}>{item.action}</Text>
            </View>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        ))}
      </View>

      {/* System status */}
      <Text style={styles.sectionTitle}>Statut système</Text>
      <View style={styles.statusCard}>
        {[
          { label: "API Server", ok: true },
          { label: "Base de données", ok: true },
          { label: "Push notifications", ok: true },
          { label: "Storage photos", ok: false },
        ].map((s) => (
          <View key={s.label} style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: s.ok ? "#5B8C5A" : ACCENT }]} />
            <Text style={styles.statusLabel}>{s.label}</Text>
            <Text style={[styles.statusState, { color: s.ok ? "#5B8C5A" : ACCENT }]}>
              {s.ok ? "Opérationnel" : "Dégradé"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  function QuickBtn({ icon, label, color }: { icon: any; label: string; color: string }) {
    return (
      <TouchableOpacity style={styles.quickBtn} activeOpacity={0.75}>
        <View style={[styles.quickIcon, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#888", marginTop: 2, fontFamily: "Inter_400Regular" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1A1A1A" },
  logoutBtn: { backgroundColor: "#1A1A1A", borderRadius: 10, padding: 8 },
  sectionTitle: { fontSize: 13, color: "#555", fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 14, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: "44%", backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, color: "#666", fontFamily: "Inter_400Regular", marginTop: 2 },
  statDelta: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickBtn: { flex: 1, alignItems: "center" },
  quickIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  quickLabel: { fontSize: 11, color: "#888", fontFamily: "Inter_500Medium", textAlign: "center" },
  activityCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 24, overflow: "hidden" },
  activityRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  activityUser: { fontSize: 13, color: "#CCC", fontFamily: "Inter_500Medium" },
  activityAction: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular" },
  activityTime: { fontSize: 11, color: "#444", fontFamily: "Inter_400Regular" },
  statusCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 24, overflow: "hidden" },
  statusRow: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  statusLabel: { flex: 1, fontSize: 14, color: "#CCC", fontFamily: "Inter_400Regular" },
  statusState: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
