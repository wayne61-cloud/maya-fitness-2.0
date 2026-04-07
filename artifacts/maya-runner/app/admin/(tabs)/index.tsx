import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  moderator: "Modérateur",
  support: "Support",
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Maya Admin</Text>
          <Text style={styles.headerSub}>
            {user.name} · {ROLE_LABELS[user.role] ?? user.role}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Plateforme opérationnelle</Text>
      </View>

      <View style={styles.kpiRow}>
        <KpiCard label="Utilisateurs" value="—" icon="people-outline" color="#FFD60A" />
        <KpiCard label="Sessions" value="—" icon="fitness-outline" color="#FF8C00" />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Tickets ouverts" value="—" icon="headset-outline" color={ACCENT} />
        <KpiCard label="Signalements" value="—" icon="flag-outline" color="#9B7B6E" />
      </View>

      <Text style={styles.sectionTitle}>Activité récente</Text>
      <View style={styles.emptyCard}>
        <Ionicons name="time-outline" size={40} color="#2A2A2A" />
        <Text style={styles.emptyText}>Aucune activité récente</Text>
        <Text style={styles.emptyHint}>Les événements de la plateforme apparaîtront ici</Text>
      </View>

      <Text style={styles.sectionTitle}>État du système</Text>
      <View style={styles.systemCard}>
        <SystemRow label="API Server" status="ok" />
        <SystemRow label="Base de données" status="ok" />
        <SystemRow label="Stockage" status="ok" />
        <SystemRow label="GPS / Géolocalisation" status="ok" />
      </View>
    </ScrollView>
  );

  function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) {
    return (
      <View style={[styles.kpiCard]}>
        <View style={[styles.kpiIcon, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
    );
  }

  function SystemRow({ label, status }: { label: string; status: "ok" | "warn" | "error" }) {
    const color = status === "ok" ? "#5B8C5A" : status === "warn" ? "#FF8C00" : ACCENT;
    const icon = status === "ok" ? "checkmark-circle" : status === "warn" ? "warning" : "close-circle";
    return (
      <View style={styles.systemRow}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={styles.systemLabel}>{label}</Text>
        <Text style={[styles.systemStatus, { color }]}>
          {status === "ok" ? "OK" : status === "warn" ? "Attention" : "Erreur"}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#555", fontFamily: "Inter_400Regular", marginTop: 2 },
  logoutBtn: { width: 40, height: 40, backgroundColor: CARD, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BORDER },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#5B8C5A" },
  statusText: { fontSize: 13, color: "#5B8C5A", fontFamily: "Inter_500Medium" },
  kpiRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER },
  kpiIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  kpiValue: { fontSize: 24, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 12, color: "#666", fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontSize: 12, color: "#555", fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 24, marginBottom: 12 },
  emptyCard: { backgroundColor: CARD, borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  emptyText: { fontSize: 15, color: "#555", fontFamily: "Inter_500Medium", marginTop: 12 },
  emptyHint: { fontSize: 12, color: "#333", fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },
  systemCard: { backgroundColor: CARD, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: BORDER },
  systemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  systemLabel: { flex: 1, fontSize: 14, color: "#CCC", fontFamily: "Inter_400Regular" },
  systemStatus: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
