import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Erreur de connexion");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0D0D0D" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/2382/2382533.png" }}
            style={styles.mascot}
          />
          <Text style={styles.appName}>Maya Fitness</Text>
          <Text style={styles.tagline}>Ton coach fitness intelligent</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="ton@email.com"
                placeholderTextColor="#555"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(null); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(null); }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#E8335A" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0D0D0D" />
            ) : (
              <Text style={styles.btnText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo hints */}
        <View style={styles.demoWrap}>
          <Text style={styles.demoTitle}>Comptes de démonstration</Text>
          <View style={styles.demoGrid}>
            <DemoChip email="user@maya.app" pwd="maya2024" label="Utilisateur" color="#FFD60A" />
            <DemoChip email="admin@maya.app" pwd="admin2024" label="Admin" color="#E8335A" />
          </View>
          <Text style={styles.demoHint}>Appuie sur un compte pour le remplir automatiquement</Text>
        </View>

        <Text style={styles.version}>Maya Fitness v2.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  function DemoChip({ email: e, pwd, label, color }: { email: string; pwd: string; label: string; color: string }) {
    return (
      <TouchableOpacity
        style={[styles.demoChip, { borderColor: color + "55" }]}
        onPress={() => { setEmail(e); setPassword(pwd); setError(null); }}
        activeOpacity={0.75}
      >
        <View style={[styles.demoRole, { backgroundColor: color + "22" }]}>
          <Text style={[styles.demoRoleText, { color }]}>{label}</Text>
        </View>
        <Text style={styles.demoEmail}>{e}</Text>
        <Text style={styles.demoPwd}>{pwd}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 36,
  },
  mascot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 14,
    backgroundColor: "#1A1A1A",
  },
  appName: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFD60A",
    letterSpacing: -0.5,
    fontFamily: "Inter_700Bold",
  },
  tagline: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  card: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#252525",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
    fontFamily: "Inter_700Bold",
  },
  fieldWrap: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D0D0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8335A15",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#E8335A",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  btn: {
    backgroundColor: "#FFD60A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#0D0D0D",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  demoWrap: {
    width: "100%",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },
  demoTitle: {
    color: "#666",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  demoGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  demoChip: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  demoRole: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  demoRoleText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  demoEmail: {
    color: "#CCC",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  demoPwd: {
    color: "#666",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  demoHint: {
    color: "#444",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  version: {
    color: "#333",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
