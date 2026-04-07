import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

const ROLE_STORAGE_KEY = "@maya_user_role";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getRoleFromEmail(email: string): UserRole {
  if (email.includes("admin")) return "admin";
  if (email.includes("mod")) return "moderator";
  if (email.includes("support")) return "support";
  return "user";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildAuthUser(session.user).then(setUser);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        buildAuthUser(session.user).then(setUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function buildAuthUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<AuthUser> {
    const email = supabaseUser.email ?? "";
    const storedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY + supabaseUser.id);
    const role: UserRole = (storedRole as UserRole) ?? getRoleFromEmail(email);
    return {
      id: supabaseUser.id,
      email,
      name: (supabaseUser.user_metadata?.["name"] as string) ?? email.split("@")[0] ?? "Utilisateur",
      role,
    };
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return { success: false, error: error?.message ?? "Email ou mot de passe incorrect" };
      }
      const authUser = await buildAuthUser(data.user);
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch {
      return { success: false, error: "Erreur lors de la connexion" };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
