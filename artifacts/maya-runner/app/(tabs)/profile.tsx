import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { useApp } from "@/context/AppContext";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, runs, totalDistance } = useApp();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalTime = runs.reduce((acc, r) => acc + r.duration, 0);
  const bestDist = runs.reduce((max, r) => Math.max(max, r.distance), 0);

  async function save() {
    await updateProfile({
      name: form.name || "Runner",
      age: Number(form.age) || 25,
      weight: Number(form.weight) || 70,
      height: Number(form.height) || 170,
      weeklyGoal: Number(form.weeklyGoal) || 30,
    });
    setEditing(false);
    Alert.alert("Profil mis à jour !");
  }

  function hours(s: number) {
    return (s / 3600).toFixed(0);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.primary + "33", borderColor: colors.primary }]}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.nameText, { color: colors.foreground }]}>{profile.name}</Text>
          <Text style={[styles.subText, { color: colors.mutedForeground }]}>
            {profile.age} ans · {profile.height} cm · {profile.weight} kg
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: "Distance totale", value: `${totalDistance.toFixed(1)} km`, icon: "map-outline", color: colors.primary },
            { label: "Courses", value: runs.length.toString(), icon: "walk-outline", color: colors.accent },
            { label: "Heures", value: `${hours(totalTime)}h`, icon: "time-outline", color: colors.success },
            { label: "Record dist.", value: `${bestDist.toFixed(1)} km`, icon: "trophy-outline", color: colors.warning },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Mon profil</Text>
            <TouchableOpacity
              onPress={() => (editing ? save() : setEditing(true))}
              style={[styles.editBtn, { backgroundColor: editing ? colors.primary : colors.secondary }]}
              activeOpacity={0.8}
            >
              <Ionicons name={editing ? "checkmark" : "pencil-outline"} size={16} color={editing ? "#fff" : colors.foreground} />
            </TouchableOpacity>
          </View>

          {(["name", "age", "weight", "height", "weeklyGoal"] as const).map((field) => (
            <View key={field} style={[styles.field, { borderBottomColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                {field === "name" ? "Prénom" : field === "age" ? "Âge" : field === "weight" ? "Poids (kg)" : field === "height" ? "Taille (cm)" : "Objectif hebdo (km)"}
              </Text>
              {editing ? (
                <TextInput
                  style={[styles.fieldInput, { color: colors.foreground, borderBottomColor: colors.primary }]}
                  value={String(form[field])}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [field]: v }))}
                  keyboardType={field === "name" ? "default" : "numeric"}
                  placeholderTextColor={colors.mutedForeground}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: colors.foreground }]}>
                  {String(profile[field])}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  profileHeader: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  nameText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  subText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  fieldInput: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    borderBottomWidth: 1,
    minWidth: 80,
    textAlign: "right",
    paddingBottom: 2,
  },
});
