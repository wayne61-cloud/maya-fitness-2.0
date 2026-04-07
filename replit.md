# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains **Maya Fitness** — a multi-module fitness hub Expo app — and an API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

---

## Maya Fitness App (artifacts/maya-runner)

**Full-featured fitness hub** with 4 modules, dark hub + themed modules, Expo Router, AsyncStorage.

### Hub

- **Hub Home** (`app/(tabs)/index.tsx`) — Redesigned hub with:
  - Dynamic "Action du Jour" immersive hero card (context-aware by time/day)
  - Real-time today stats (minutes, calories burned, consumed, sessions)
  - "Reprendre" last activity card
  - Horizontal Netflix-style module scroll with background images
  - Smart recommendations block (streak, protein, nutrition CTA)
  - Streak badge (🔥) computed across all activities
- **Activité** (`app/(tabs)/activity.tsx`) — Cross-module activity feed
- **Objectifs** (`app/(tabs)/goals.tsx`) — Goal tracking
- **Profil** (`app/(tabs)/profile.tsx`) — User profile, settings, progress photos

### Colors

| Module       | Accent     | Background |
|--------------|------------|------------|
| Hub          | #FFD60A    | #0D0D0D    |
| Maya Runner  | #E8335A    | #0D0D0D    |
| Maya Workout | #FF8C00    | #0D0D0D    |
| Maya Yoga    | #9B7B6E    | #FAF7F4    |
| Maya Nutrition | #5B8C5A  | #F6FAF0    |

---

### Module: Maya Runner (`app/runner/`)

- **Home** — Hero banner, weekly progress, quick actions (Courir/Historique/Stats)
- **Courir** — Full GPS tracking: real-time map, route planning, pause/resume/stop, post-run summary
- **Exercices** — Exercise library with category filter, YouTube embeds, set/rep tracker
- **Historique** — Run log with time filters
- **Progression** — Photo journal, charts

---

### Module: Maya Workout (`app/workout/`)

- **Accueil** — Dashboard with weekly stats, muscle heatmap teaser
- **Exercices** — Exercise library with muscle filter, YouTube embeds
- **Séances** — Program catalog + Custom sessions list + "➕ Créer" FAB
- **Progression** — Weekly/monthly volume charts

Custom session creation (`workout/session/create.tsx`):
- 3-step wizard: Name/Description → Exercise picker (with muscle filter + search) → Sets/Reps/Rest configurator
- Saved to AsyncStorage via AppContext `customSessions`

---

### Module: Maya Yoga & Pilates (`app/yoga/`)

Light theme (#FAF7F4 + #9B7B6E taupe).

- **Onboarding** — 4-step: Level → Goal → Disciplines → Frequency
- **Accueil** — Greeting, stats, quote of the day, featured session, category cards, popular exercises
- **Exercices** — Full library (18 exercises across 5 categories) with category/level filter
- **Séances** — Session catalog with category filter, exercise preview, one-tap start
- **Progression** — Bar charts (week + 8-week trend), categories breakdown

Exercise detail (`yoga/exercise/[id].tsx`):
- YouTube embed (WebView native / iframe web)
- Progress tracker (times completed)
- Benefits, muscles targeted, step-by-step instructions

**Data**: `constants/yoga-data.ts` — 18 exercises across Pilates, Yoga, Stretching, Méditation, Barre

---

### Module: Maya Nutrition (`app/nutrition/`)

Light theme (#F6FAF0 + #5B8C5A green).

- **Onboarding** — 4-step: Sport → Objectif → Régime → Allergies
- **Recettes** — Recipe catalog with multi-filter (meal type, goal, max time, search)
- **Menus** — Weekly calendar meal planner with meal slots (Petit-déjeuner/Déjeuner/Dîner/Snack), add/delete entries, day summary
- **Calories** — Macro breakdown bar, period chart (Jour/Semaine/Mois), goal tracking ring
- **Suivi** — Nutrition score (0–100), smart recommendations, meal suggestions by time of day, weekly summary

Recipe detail (`nutrition/recipe/[id].tsx`):
- YouTube embed (where available)
- Full macros (protein/carbs/fat/fiber), ingredients, preparation steps
- "Ajouter à mes repas" one-tap action

**Data**: `constants/nutrition-data.ts` — 20 recipes, `getRecipes()` pagination helper

---

### State Management

`context/AppContext.tsx` exports `useApp` / `useAppContext` (aliases).

Persisted keys in AsyncStorage:
- `runs`, `workouts`, `customSessions`
- `yogaRecords`, `yogaOnboarding`
- `nutritionLog`, `nutritionOnboarding`
- `progressPhotos`, `profile`, `workoutOnboarding`

Computed values: `streak`, `todayCalories`, `todayMinutes`, `todaySessions`, `todayCaloriesConsumed`, `todayProtein/Carbs/Fat`, `weeklyYoga`, `totalYogaMinutes`, etc.

---

### Packages

- `react-native-maps@1.18.0` — GPS map (**pinned** for Expo Go compatibility)
- `react-native-webview` — YouTube embeds
- `expo-location` — GPS
- `@react-native-async-storage/async-storage` — Persistence
- `expo-image-picker` — Progress photos
- `expo-blur` — Tab bar blur on iOS
- `@expo-google-fonts/inter` — Inter 400/500/600/700

### Web Shims

- `shims/react-native-maps.web.js` — No-op for web bundling
- `shims/react-native-webview.web.js` — iframe fallback on web

See the `pnpm-workspace` skill for workspace structure and package details.
