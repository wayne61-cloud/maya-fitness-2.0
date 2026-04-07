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
const YELLOW = "#FFD60A";

type TicketStatus = "ouvert" | "en_cours" | "résolu" | "fermé";
type TicketPriority = "haute" | "normale" | "basse";

interface Ticket {
  id: string;
  subject: string;
  user: string;
  status: TicketStatus;
  priority: TicketPriority;
  date: string;
  messages: { from: "user" | "support"; text: string; time: string }[];
  category: string;
}

const STATUS_COLOR: Record<TicketStatus, string> = {
  ouvert: ACCENT,
  en_cours: "#FF8C00",
  résolu: "#5B8C5A",
  fermé: "#555",
};

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  haute: ACCENT,
  normale: "#FF8C00",
  basse: "#5B8C5A",
};

export default function AdminSupport() {
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | TicketStatus>("all");
  const [reply, setReply] = useState("");

  const filtered = filterStatus === "all" ? tickets : tickets.filter((t) => t.status === filterStatus);
  const openCount = tickets.filter((t) => t.status === "ouvert").length;

  function sendReply(ticketId: string) {
    if (!reply.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: "en_cours" as const, messages: [...t.messages, { from: "support" as const, text: reply.trim(), time }] }
          : t
      )
    );
    if (selected?.id === ticketId) {
      setSelected((prev) =>
        prev ? { ...prev, status: "en_cours", messages: [...prev.messages, { from: "support", text: reply.trim(), time }] } : null
      );
    }
    setReply("");
  }

  function resolveTicket(ticketId: string) {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: "résolu" as const } : t)));
    setSelected((prev) => (prev?.id === ticketId ? { ...prev, status: "résolu" } : prev));
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Support SAV</Text>
        {openCount > 0 && (
          <View style={styles.openBadge}>
            <Text style={styles.openBadgeText}>{openCount} ticket{openCount > 1 ? "s" : ""} ouvert{openCount > 1 ? "s" : ""}</Text>
          </View>
        )}
      </View>

      <View style={styles.filterRow}>
        {(["all", "ouvert", "en_cours", "résolu"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterStatus === f && { backgroundColor: (STATUS_COLOR[f as TicketStatus] ?? YELLOW) + "22", borderColor: (STATUS_COLOR[f as TicketStatus] ?? YELLOW) + "55" }]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[styles.filterText, filterStatus === f && { color: STATUS_COLOR[f as TicketStatus] ?? YELLOW }]}>
              {f === "all" ? "Tous" : f === "en_cours" ? "En cours" : f === "résolu" ? "Résolus" : "Ouverts"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="headset-outline" size={52} color="#2A2A2A" />
            <Text style={styles.emptyTitle}>Aucun ticket</Text>
            <Text style={styles.emptyHint}>
              Les demandes de support des utilisateurs apparaîtront ici
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.ticketCard} onPress={() => setSelected(item)} activeOpacity={0.85}>
            <View style={styles.ticketTop}>
              <Text style={styles.ticketId}>#{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                  {item.status === "en_cours" ? "En cours" : item.status === "résolu" ? "Résolu" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLOR[item.priority] + "22" }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLOR[item.priority] }]}>{item.priority}</Text>
              </View>
            </View>
            <Text style={styles.ticketSubject}>{item.subject}</Text>
            <Text style={styles.ticketUser}>{item.user} · {item.date}</Text>
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketCategory}>{item.category}</Text>
              <Text style={styles.ticketMsgs}>{item.messages.length} message{item.messages.length !== 1 ? "s" : ""}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: BG }}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selected?.subject}</Text>
              <Text style={styles.modalUser}>{selected?.user}</Text>
            </View>
            {(selected?.status === "en_cours" || selected?.status === "ouvert") && (
              <TouchableOpacity style={styles.resolveBtn} onPress={() => resolveTicket(selected!.id)}>
                <Text style={styles.resolveBtnText}>Résoudre</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            {selected?.messages.map((m, i) => (
              <View key={i} style={[styles.bubble, m.from === "support" ? styles.bubbleSupport : styles.bubbleUser]}>
                <Text style={[styles.bubbleFrom, { color: m.from === "support" ? YELLOW : "#9B7B6E" }]}>
                  {m.from === "support" ? "Support Maya" : selected.user}
                </Text>
                <Text style={styles.bubbleText}>{m.text}</Text>
                <Text style={styles.bubbleTime}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>

          {(selected?.status === "ouvert" || selected?.status === "en_cours") && (
            <View style={[styles.replyBar, { paddingBottom: insets.bottom + 12 }]}>
              <TextInput
                style={styles.replyInput}
                placeholder="Répondre au ticket..."
                placeholderTextColor="#444"
                value={reply}
                onChangeText={setReply}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, !reply.trim() && { opacity: 0.4 }]}
                onPress={() => sendReply(selected!.id)}
                disabled={!reply.trim()}
              >
                <Ionicons name="send" size={18} color="#0D0D0D" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold", marginBottom: 4 },
  openBadge: { backgroundColor: ACCENT + "22", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  openBadgeText: { color: ACCENT, fontSize: 12, fontFamily: "Inter_600SemiBold" },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: BORDER },
  filterText: { fontSize: 12, color: "#666", fontFamily: "Inter_500Medium" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyTitle: { fontSize: 16, color: "#555", fontFamily: "Inter_600SemiBold", marginTop: 16 },
  emptyHint: { fontSize: 13, color: "#333", fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center", paddingHorizontal: 32 },
  ticketCard: { backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER },
  ticketTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  ticketId: { fontSize: 12, color: "#555", fontFamily: "Inter_600SemiBold" },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  priorityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  ticketSubject: { fontSize: 15, color: "#FFF", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  ticketUser: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular", marginBottom: 8 },
  ticketFooter: { flexDirection: "row", justifyContent: "space-between" },
  ticketCategory: { fontSize: 12, color: "#FFD60A", fontFamily: "Inter_500Medium" },
  ticketMsgs: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular" },
  modalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { padding: 4 },
  modalTitle: { fontSize: 16, color: "#FFF", fontFamily: "Inter_600SemiBold" },
  modalUser: { fontSize: 12, color: "#555", fontFamily: "Inter_400Regular" },
  resolveBtn: { backgroundColor: "#5B8C5A22", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#5B8C5A44" },
  resolveBtnText: { color: "#5B8C5A", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bubble: { borderRadius: 16, padding: 14, marginBottom: 12, maxWidth: "85%" },
  bubbleUser: { backgroundColor: "#1A1A1A", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleSupport: { backgroundColor: "#1A2A1A", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleFrom: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  bubbleText: { fontSize: 14, color: "#DDD", fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTime: { fontSize: 11, color: "#444", fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "right" },
  replyBar: { flexDirection: "row", alignItems: "flex-end", padding: 12, borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: "#0D0D0D", gap: 10 },
  replyInput: { flex: 1, backgroundColor: "#1A1A1A", borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12, color: "#FFF", fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: "#FFD60A", borderRadius: 14, justifyContent: "center", alignItems: "center" },
});
