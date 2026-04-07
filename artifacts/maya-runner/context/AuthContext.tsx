import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "user" | "admin" | "moderator" | "support";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isUser: boolean;
}

const ACCOUNTS: Array<AuthUser & { password: string }> = [
  { id: "u1", email: "user@maya.app", password: "maya2024", name: "Utilisateur", role: "user" },
  { id: "a1", email: "admin@maya.app", password: "admin2024", name: "Admin", role: "admin" },
  { id: "m1", email: "mod@maya.app", password: "mod2024", name: "Modérateur", role: "moderator" },
  { id: "s1", email: "support@maya.app", password: "support2024", name: "Support", role: "support" },
];

const AUTH_STORAGE_KEY = "@maya_auth_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStoredUser(); }, []);

  async function loadStoredUser() {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {}
    finally { setIsLoading(false); }
  }

  const login = useCallback(async (email: string, password: string) => {
    const account = ACCOUNTS.find(
      (a) => a.email === email.toLowerCase() && a.password === password
    );
    if (!account) return { success: false, error: "Email ou mot de passe incorrect" };
    const { password: _pwd, ...authUser } = account;
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch {
      return { success: false, error: "Erreur lors de la connexion" };
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "moderator" || user?.role === "support";
  const isUser = user?.role === "user";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
