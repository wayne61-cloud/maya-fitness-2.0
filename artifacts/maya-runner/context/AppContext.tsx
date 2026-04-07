import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
}

interface AppContextValue {
  runs: RunRecord[];
  workouts: WorkoutRecord[];
  progressPhotos: ProgressPhoto[];
  profile: UserProfile;
  addRun: (run: RunRecord) => Promise<void>;
  addWorkout: (workout: WorkoutRecord) => Promise<void>;
  addProgressPhoto: (photo: ProgressPhoto) => Promise<void>;
  deleteProgressPhoto: (id: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  totalDistance: number;
  weeklyDistance: number;
  totalRuns: number;
}

const defaultProfile: UserProfile = {
  name: "Runner",
  age: 25,
  weight: 70,
  height: 170,
  weeklyGoal: 30,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    (async () => {
      try {
        const [runsJson, workoutsJson, photosJson, profileJson] =
          await Promise.all([
            AsyncStorage.getItem("runs"),
            AsyncStorage.getItem("workouts"),
            AsyncStorage.getItem("progressPhotos"),
            AsyncStorage.getItem("profile"),
          ]);
        if (runsJson) setRuns(JSON.parse(runsJson));
        if (workoutsJson) setWorkouts(JSON.parse(workoutsJson));
        if (photosJson) setProgressPhotos(JSON.parse(photosJson));
        if (profileJson) setProfile(JSON.parse(profileJson));
      } catch {}
    })();
  }, []);

  const addRun = useCallback(async (run: RunRecord) => {
    setRuns((prev) => {
      const next = [run, ...prev];
      AsyncStorage.setItem("runs", JSON.stringify(next));
      return next;
    });
  }, []);

  const addWorkout = useCallback(async (workout: WorkoutRecord) => {
    setWorkouts((prev) => {
      const next = [workout, ...prev];
      AsyncStorage.setItem("workouts", JSON.stringify(next));
      return next;
    });
  }, []);

  const addProgressPhoto = useCallback(async (photo: ProgressPhoto) => {
    setProgressPhotos((prev) => {
      const next = [photo, ...prev];
      AsyncStorage.setItem("progressPhotos", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProgressPhoto = useCallback(async (id: string) => {
    setProgressPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem("progressPhotos", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem("profile", JSON.stringify(newProfile));
  }, []);

  const totalDistance = runs.reduce((acc, r) => acc + r.distance, 0);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyDistance = runs
    .filter((r) => new Date(r.date).getTime() > oneWeekAgo)
    .reduce((acc, r) => acc + r.distance, 0);

  return (
    <AppContext.Provider
      value={{
        runs,
        workouts,
        progressPhotos,
        profile,
        addRun,
        addWorkout,
        addProgressPhoto,
        deleteProgressPhoto,
        updateProfile,
        totalDistance,
        weeklyDistance,
        totalRuns: runs.length,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
