# Maya Fitness 2.0 — Setup Guide

## Supabase Project
- Project ID: `fcemxiptwresbqznhwjy`
- Dashboard: https://supabase.com/dashboard/project/fcemxiptwresbqznhwjy

---

## Step 1 — Apply Database Migrations

Go to: https://supabase.com/dashboard/project/fcemxiptwresbqznhwjy/sql/new

Run these files **in order**:
1. `supabase/migrations/001_create_tables.sql` — creates tables + RLS policies
2. `supabase/migrations/002_seed_data.sql` — adds exercises and recipes

---

## Step 2 — Configure Backend Environment

```bash
cd artifacts/api-server
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — get from Supabase > Settings > Database > Connection string (Transaction pooler)
- `SUPABASE_SERVICE_ROLE_KEY` — get from Supabase > Settings > API > service_role key

---

## Step 3 — Configure Frontend Environment

```bash
cd artifacts/maya-runner
cp .env.example .env
```

Edit `.env`:
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — get from Supabase > Settings > API > anon key
- `EXPO_PUBLIC_API_URL` — URL of the running backend (e.g. `http://localhost:3000` or deployed URL)

---

## Step 4 — Create Auth Users in Supabase

Go to: https://supabase.com/dashboard/project/fcemxiptwresbqznhwjy/auth/users

Create at least these users:
- `user@maya.app` / `maya2024` — regular user
- `admin@maya.app` / `admin2024` — admin (email contains "admin" → gets admin role)

---

## Step 5 — Install & Run

```bash
# Install dependencies
pnpm install

# Run backend
cd artifacts/api-server
pnpm dev

# Run frontend (in another terminal)
cd artifacts/maya-runner
pnpm dev
```

---

## Architecture

```
maya-fitness-2.0/
├── artifacts/
│   ├── api-server/          # Express.js backend (TypeScript + Drizzle ORM)
│   └── maya-runner/         # React Native / Expo app
│       ├── app/             # Expo Router screens
│       │   ├── (tabs)/      # Hub: home, activity, goals, profile
│       │   ├── runner/      # Maya Runner module
│       │   ├── workout/     # Maya Workout module
│       │   ├── yoga/        # Maya Yoga & Pilates module
│       │   └── nutrition/   # Maya Nutrition module
│       ├── components/
│       │   └── ModuleSplash.tsx  # 3.5s splash for each module
│       ├── context/
│       │   ├── AuthContext.tsx   # Supabase Auth
│       │   └── AppContext.tsx    # Local state (runs, workouts, yoga, nutrition)
│       └── lib/
│           ├── supabase.ts       # Supabase client
│           └── api.ts            # API client configuration
├── lib/
│   ├── db/                  # Drizzle schema (PostgreSQL / Supabase)
│   └── api-client-react/    # Generated API client (React Query)
└── supabase/
    └── migrations/          # SQL migrations to apply in Supabase dashboard
```
