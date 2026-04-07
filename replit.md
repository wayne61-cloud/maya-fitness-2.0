# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a Maya Runner mobile app (Expo) and an API server.

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

## Maya Runner App (artifacts/maya-runner)

Full-featured running app inspired by Nike Running, Strava, and Garmin Connect.

### Features

- **Home** (`app/(tabs)/index.tsx`) — Dashboard with weekly stats, recent runs, quick actions
- **Run** (`app/(tabs)/run.tsx`) — Full GPS tracking with:
  - Real-time map with route tracing (green line)
  - Route planning before departure (blue dashed line)
  - Pause/resume/stop controls
  - Live stats (distance, duration, pace, calories)
  - Post-run summary with mini-map
  - Location permission handling
  - Web geolocation fallback
- **Exercises** (`app/(tabs)/exercises.tsx`) — Exercise library with:
  - Category filtering
  - Exercise detail page with YouTube video embed
  - Description + benefits for runners
  - Set/rep tracker modal
- **History** (`app/(tabs)/history.tsx`) — Run log with time filters
- **Progress** (`app/(tabs)/progress.tsx`) — Photo progression journal (date, weight, session type, notes)
- **Profile** (`app/(tabs)/profile.tsx`) — User profile with stats and editable fields

### Design

- Dark theme (#0D0D0D background)
- Primary: #E8335A (hot pink-red)
- Accent: #FF6B35 (orange)
- Map trace: #00E676 (green), planned: #4FC3F7 (light blue)
- Font: Inter (400/500/600/700)

### Packages

- `react-native-maps@1.18.0` — GPS map (pinned for Expo Go compatibility)
- `react-native-webview` — YouTube video embeds in exercise detail
- `expo-location` — GPS location tracking
- `@react-native-async-storage/async-storage` — Local data persistence
- `expo-image-picker` — Photo selection for progress journal

### Web Shims

- `shims/react-native-maps.web.js` — No-op for web bundling
- `shims/react-native-webview.web.js` — iframe fallback on web

### State Management

- `context/AppContext.tsx` — Global state (runs, workouts, progress photos, profile)
- AsyncStorage for all persistence

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
