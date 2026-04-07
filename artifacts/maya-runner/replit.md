# Maya Fitness — Expo App

## Overview
Maya Fitness is a multi-module fitness hub Expo app with GPS running tracking and strength training. All data is stored locally with AsyncStorage — no backend required.

## Architecture

### Hub Navigation (4 tabs, gold #FFD60A accent)
- **Accueil** (`app/(tabs)/index.tsx`) — Dashboard with module cards, today summary, weekly stats
- **Activité** (`app/(tabs)/activity.tsx`) — Combined run + workout history with filters
- **Objectifs** (`app/(tabs)/goals.tsx`) — Weekly goals with progress bars
- **Profil** (`app/(tabs)/profile.tsx`) — Global profile with stats and editing

### Runner Module (`app/runner/`) — Red #E8335A accent
- Stack layout with back-to-hub navigation
- 4 tabs: Accueil, Courir (GPS map), Historique, Progression
- Full GPS tracking with Leaflet map (CartoDB dark tiles) on web, react-native-maps on native
- OSRM snap-to-road route planning

### Workout Module (`app/workout/`) — Orange #FF8C00 accent
- Onboarding flow (`onboarding.tsx`): Level → Goal → Frequency → Target areas
- 4 tabs: Accueil, Exercices, Séances, Progression
- Exercise detail (`exercise/[id].tsx`) with YouTube video links
- Session detail (`session/[id].tsx`) with live timer, set/rep tracking, rest counter

## Data
- `context/AppContext.tsx` — Global state: runs, workouts, profile, workoutOnboarding
- `constants/workout-data.ts` — 20 exercises + 7 sessions (PPL, Full Body, Glutes, Upper, Strength+Core)
- AsyncStorage keys: `runs`, `workouts`, `progressPhotos`, `profile`, `workoutOnboarding`

## Design System
| Token | Value |
|-------|-------|
| Background | #0D0D0D |
| Hub gold | #FFD60A |
| Runner red | #E8335A |
| Workout orange | #FF8C00 |
| Yoga teal | #26C6DA (future) |
| Font | Inter 400/500/600/700 |

## Key Dependencies
- `expo-router` v6 — file-based routing
- `expo-location` — GPS tracking
- `react-native-maps@1.18.0` — pinned for Expo Go compatibility
- `react-native-webview` — Leaflet iframe map
- `@react-native-async-storage/async-storage` — local persistence
- `expo-blur` — tab bar blur (iOS)

## Module Navigation Flow
1. Hub shows 3 module cards: Runner, Workout, Yoga (locked)
2. Tapping Runner → pushes `/runner` stack → Runner tab bar appears
3. Tapping Workout → if no onboarding: `/workout/onboarding` → `/workout/(tabs)`, else `/workout`
4. Back button in module headers → returns to hub
