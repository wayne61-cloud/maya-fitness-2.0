import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { YogaCategory } from "@/constants/yoga-data";

export interface RunRecord {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
  calories: number;
  route: { latitude: number; longitude: number }[];
  title?: string;
  plannedRoute?: { latitude: number; longitude: number }[];
}

export interface WorkoutRecord {
  id: string;
  date: string;
  exercises: { name: string; sets: number; reps: number }[];
  duration: number;
  title?: string;
  sessionId?: string;
  calories?: number;
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  weight?: number;
  sessionType?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  weeklyGoal: number;
  avatar?: string;
  goal?: string;
  level?: string;
  email?: string;
}

export interface WorkoutOnboarding {
  level: "Débutant" | "Intermédiaire" | "Avancé";
  goal: string;
  frequency: number;
  areas: string[];
  completedAt: string;
}

// ── YOGA ──────────────────────────────────────────────────────────

export interface YogaRecord {
  id: string;
  date: string;
  sessionId?: string;
  exerciseId?: string;
  title: string;
  duration: number;
  calories: number;
  category: YogaCategory;
}

export interface YogaOnboarding {
  level: "Débutant" | "Intermédiaire" | "Avancé";
  goal: string;
  frequency: number;
  preferences: YogaCategory[];
  completedAt: string;
}

// ── NUTRITION ─────────────────────────────────────────────────────

export type NutritionMealType = "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Snack";

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: NutritionMealType;
  recipeId?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionOnboarding {
  sport: string;
  objective: string;
  diet: string;
  allergies: string[];
  disliked: string[];
  completedAt: string;
}

// ── CUSTOM SESSIONS ────────────────────────────────────────────────

export interface CustomSessionExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface CustomSession {
  id: string;
  name: string;
  description: string;
  exercises: CustomSessionExercise[];
  createdAt: string;
  durationMin: number;
}

// ── CONTEXT ────────────────────────────────────────────────────────

interface AppContextValue {
  // Runner
  runs: RunRecord[];
  addRun: (run: RunRecord) => Promise<void>;
  totalDistance: number;
  weeklyDistance: number;
  totalRuns: number;

  // Workout
  workouts: WorkoutRecord[];
  addWorkout: (workout: WorkoutRecord) => Promise<void>;
  weeklyWorkouts: number;
  customSessions: CustomSession[];
  addCustomSession: (session: CustomSession) => Promise<void>;
  deleteCustomSession: (id: string) => Promise<void>;

  // Yoga
  yogaRecords: YogaRecord[];
  addYogaRecord: (record: YogaRecord) => Promise<void>;
  yogaOnboarding: YogaOnboarding | null;
  setYogaOnboarding: (data: YogaOnboarding) => Promise<void>;
  weeklyYoga: number;
  totalYogaMinutes: number;

  // Nutrition
  nutritionLog: NutritionEntry[];
  addNutritionEntry: (entry: NutritionEntry) => Promise<void>;
  deleteNutritionEntry: (id: string) => Promise<void>;
  nutritionOnboarding: NutritionOnboarding | null;
  setNutritionOnboarding: (data: NutritionOnboarding) => Promise<void>;
  todayCaloriesConsumed: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;

  // Progress photos
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (photo: ProgressPhoto) => Promise<void>;
  deleteProgressPhoto: (id: string) => Promise<void>;

  // Profile
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => Promise<void>;
  workoutOnboarding: WorkoutOnboarding | null;
  setWorkoutOnboarding: (data: WorkoutOnboarding) => Promise<void>;

  // Computed hub stats
  todayCalories: number;
  todayMinutes: number;
  todaySessions: number;
  streak: number;
}

const defaultProfile: UserProfile = {
  name: "Maya Fitness",
  age: 28,
  weight: 65,
  height: 168,
  weeklyGoal: 30,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function computeStreak(records: { date: string }[]): number {
  if (!records.length) return 0;
  const dates = [...new Set(records.map((r) => r.date.substring(0, 10)))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().substring(0, 10);
    if (dates[i] === expectedStr) streak++;
    else break;
  }
  return streak;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [customSessions, setCustomSessions] = useState<CustomSession[]>([]);
  const [yogaRecords, setYogaRecords] = useState<YogaRecord[]>([]);
  const [yogaOnboarding, setYogaOnboardingState] = useState<YogaOnboarding | null>(null);
  const [nutritionLog, setNutritionLog] = useState<NutritionEntry[]>([]);
  const [nutritionOnboarding, setNutritionOnboardingState] = useState<NutritionOnboarding | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [workoutOnboarding, setWorkoutOnboardingState] = useState<WorkoutOnboarding | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [r, w, cs, yr, yo, nl, no, ph, pr, wo] = await Promise.all([
          AsyncStorage.getItem("runs"),
          AsyncStorage.getItem("workouts"),
          AsyncStorage.getItem("customSessions"),
          AsyncStorage.getItem("yogaRecords"),
          AsyncStorage.getItem("yogaOnboarding"),
          AsyncStorage.getItem("nutritionLog"),
          AsyncStorage.getItem("nutritionOnboarding"),
          AsyncStorage.getItem("progressPhotos"),
          AsyncStorage.getItem("profile"),
          AsyncStorage.getItem("workoutOnboarding"),
        ]);
        if (r) setRuns(JSON.parse(r));
        if (w) setWorkouts(JSON.parse(w));
        if (cs) setCustomSessions(JSON.parse(cs));
        if (yr) setYogaRecords(JSON.parse(yr));
        if (yo) setYogaOnboardingState(JSON.parse(yo));
        if (nl) setNutritionLog(JSON.parse(nl));
        if (no) setNutritionOnboardingState(JSON.parse(no));
        if (ph) setProgressPhotos(JSON.parse(ph));
        if (pr) setProfile(JSON.parse(pr));
        if (wo) setWorkoutOnboardingState(JSON.parse(wo));
      } catch (e) {
        console.warn("AppContext load error", e);
      }
    })();
  }, []);

  // ── RUNNER ──────────────────────────────────────────────────────
  const addRun = useCallback(async (run: RunRecord) => {
    setRuns((prev) => {
      const next = [run, ...prev];
      AsyncStorage.setItem("runs", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  // ── WORKOUT ─────────────────────────────────────────────────────
  const addWorkout = useCallback(async (workout: WorkoutRecord) => {
    setWorkouts((prev) => {
      const next = [workout, ...prev];
      AsyncStorage.setItem("workouts", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const addCustomSession = useCallback(async (session: CustomSession) => {
    setCustomSessions((prev) => {
      const next = [session, ...prev];
      AsyncStorage.setItem("customSessions", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const deleteCustomSession = useCallback(async (id: string) => {
    setCustomSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      AsyncStorage.setItem("customSessions", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  // ── YOGA ────────────────────────────────────────────────────────
  const addYogaRecord = useCallback(async (record: YogaRecord) => {
    setYogaRecords((prev) => {
      const next = [record, ...prev];
      AsyncStorage.setItem("yogaRecords", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const setYogaOnboarding = useCallback(async (data: YogaOnboarding) => {
    setYogaOnboardingState(data);
    AsyncStorage.setItem("yogaOnboarding", JSON.stringify(data)).catch(console.warn);
  }, []);

  // ── NUTRITION ───────────────────────────────────────────────────
  const addNutritionEntry = useCallback(async (entry: NutritionEntry) => {
    setNutritionLog((prev) => {
      const next = [entry, ...prev];
      AsyncStorage.setItem("nutritionLog", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const deleteNutritionEntry = useCallback(async (id: string) => {
    setNutritionLog((prev) => {
      const next = prev.filter((e) => e.id !== id);
      AsyncStorage.setItem("nutritionLog", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const setNutritionOnboarding = useCallback(async (data: NutritionOnboarding) => {
    setNutritionOnboardingState(data);
    AsyncStorage.setItem("nutritionOnboarding", JSON.stringify(data)).catch(console.warn);
  }, []);

  // ── PHOTOS / PROFILE ────────────────────────────────────────────
  const addProgressPhoto = useCallback(async (photo: ProgressPhoto) => {
    setProgressPhotos((prev) => {
      const next = [photo, ...prev];
      AsyncStorage.setItem("progressPhotos", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const deleteProgressPhoto = useCallback(async (id: string) => {
    setProgressPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem("progressPhotos", JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const updateProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    AsyncStorage.setItem("profile", JSON.stringify(p)).catch(console.warn);
  }, []);

  const setWorkoutOnboarding = useCallback(async (data: WorkoutOnboarding) => {
    setWorkoutOnboardingState(data);
    AsyncStorage.setItem("workoutOnboarding", JSON.stringify(data)).catch(console.warn);
  }, []);

  // ── COMPUTED ────────────────────────────────────────────────────
  const totalDistance = runs.reduce((a, r) => a + r.distance, 0);
  const weeklyDistance = runs.filter((r) => isThisWeek(r.date)).reduce((a, r) => a + r.distance, 0);
  const totalRuns = runs.length;
  const weeklyWorkouts = workouts.filter((w) => isThisWeek(w.date)).length;
  const weeklyYoga = yogaRecords.filter((r) => isThisWeek(r.date)).length;
  const totalYogaMinutes = yogaRecords.reduce((a, r) => a + Math.round(r.duration / 60), 0);

  const todayRuns = runs.filter((r) => isToday(r.date));
  const todayWorkoutsList = workouts.filter((w) => isToday(w.date));
  const todayYogaList = yogaRecords.filter((y) => isToday(y.date));
  const todayNutrition = nutritionLog.filter((n) => isToday(n.date));

  const todayCalories = todayRuns.reduce((a, r) => a + r.calories, 0) +
    todayWorkoutsList.reduce((a, w) => a + (w.calories ?? 0), 0) +
    todayYogaList.reduce((a, y) => a + y.calories, 0);
  const todayMinutes = todayRuns.reduce((a, r) => a + Math.round(r.duration / 60), 0) +
    todayWorkoutsList.reduce((a, w) => a + w.duration, 0) +
    todayYogaList.reduce((a, y) => a + Math.round(y.duration / 60), 0);
  const todaySessions = todayRuns.length + todayWorkoutsList.length + todayYogaList.length;

  const todayCaloriesConsumed = todayNutrition.reduce((a, e) => a + e.calories, 0);
  const todayProtein = todayNutrition.reduce((a, e) => a + e.protein, 0);
  const todayCarbs = todayNutrition.reduce((a, e) => a + e.carbs, 0);
  const todayFat = todayNutrition.reduce((a, e) => a + e.fat, 0);

  const allActivities = [
    ...runs.map((r) => ({ date: r.date })),
    ...workouts.map((w) => ({ date: w.date })),
    ...yogaRecords.map((y) => ({ date: y.date })),
  ];
  const streak = computeStreak(allActivities);

  return (
    <AppContext.Provider
      value={{
        runs, addRun, totalDistance, weeklyDistance, totalRuns,
        workouts, addWorkout, weeklyWorkouts, customSessions, addCustomSession, deleteCustomSession,
        yogaRecords, addYogaRecord, yogaOnboarding, setYogaOnboarding, weeklyYoga, totalYogaMinutes,
        nutritionLog, addNutritionEntry, deleteNutritionEntry, nutritionOnboarding, setNutritionOnboarding,
        todayCaloriesConsumed, todayProtein, todayCarbs, todayFat,
        progressPhotos, addProgressPhoto, deleteProgressPhoto,
        profile, updateProfile, workoutOnboarding, setWorkoutOnboarding,
        todayCalories, todayMinutes, todaySessions, streak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be inside AppProvider");
  return ctx;
}

// Backward-compat alias used by existing screens
export const useApp = useAppContext;
