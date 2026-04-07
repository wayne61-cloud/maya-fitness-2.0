import { useRouter } from "expo-router";
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

type Mode = "login" | "register";

export default function LoginScreen() {
  const { login, register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      if (result.role === "admin" || result.role === "moderator" || result.role === "support") {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)");
      }
    } else {
      setError(result.error ?? "Email ou mot de passe incorrect");
    }
  }

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await register(email.trim(), password, name.trim());
    setLoading(false);
    if (result.success) {
      setSuccess("Compte créé ! Connecte-toi maintenant.");
      switchMode("login");
      setEmail(email.trim());
    } else {
      setError(result.error ?? "Erreur lors de l'inscription");
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
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/2382/2382533.png" }}
            style={styles.mascot}
          />
          <Text style={styles.appName}>Maya Fitness</Text>
          <Text style={styles.tagline}>Ton coach fitness intelligent</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === "login" && styles.tabActive]}
            onPress={() => switchMode("login")}
          >
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
              Connexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === "register" && styles.tabActive]}
            onPress={() => switchMode("register")}
          >
            <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
              Inscription
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          {mode === "register" && (
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Prénom / Nom</Text>
              <View style={styles.inputRow}>
                <Text style={styles.icon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton prénom"
                  placeholderTextColor="#555"
                  value={name}
                  onChangeText={(t) => { setName(t); setError(null); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>
          )}

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Text style={styles.icon}>✉️</Text>
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

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <View style={styles.inputRow}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(null); }}
                secureTextEntry={!showPassword}
                returnKeyType={mode === "login" ? "done" : "next"}
                onSubmitEditing={mode === "login" ? handleLogin : undefined}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Text style={styles.icon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === "register" && (
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
              <View style={styles.inputRow}>
                <Text style={styles.icon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0D0D0D" />
            ) : (
              <Text style={styles.btnText}>
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchLink}
            onPress={() => switchMode(mode === "login" ? "register" : "login")}
          >
            <Text style={styles.switchLinkText}>
              {mode === "login"
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Maya Fitness v2.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 32,
  },
  mascot: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
    backgroundColor: "#1A1A1A",
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFD60A",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#888",
    marginTop: 6,
  },
  tabs: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#FFD60A",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
  },
  tabTextActive: {
    color: "#0D0D0D",
  },
  card: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#252525",
  },
  fieldWrap: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
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
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
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
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    color: "#E8335A",
    fontSize: 13,
    flex: 1,
  },
  successBox: {
    backgroundColor: "#22C55E15",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#22C55E",
    fontSize: 13,
    textAlign: "center",
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
  },
  switchLink: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 4,
  },
  switchLinkText: {
    color: "#FFD60A",
    fontSize: 14,
    fontWeight: "500",
  },
  version: {
    color: "#2A2A2A",
    fontSize: 12,
  },
});
