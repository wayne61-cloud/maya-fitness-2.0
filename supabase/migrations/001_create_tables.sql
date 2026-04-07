-- Maya Fitness — Initial schema
-- Run this in: https://supabase.com/dashboard/project/fcemxiptwresbqznhwjy/sql/new

-- ─── EXERCISES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercises (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  module        TEXT NOT NULL,         -- 'runner' | 'workout' | 'yoga' | 'nutrition'
  youtube_url   TEXT,
  image         TEXT,
  muscles       JSONB DEFAULT '[]',
  difficulty    TEXT NOT NULL DEFAULT 'Débutant',
  category      TEXT,
  description   TEXT,
  duration_min  INTEGER,
  calories      INTEGER,
  instructions  JSONB DEFAULT '[]',
  benefits      JSONB DEFAULT '[]',
  tags          JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RECIPES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recipes (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  image           TEXT,
  youtube_url     TEXT,
  calories        INTEGER NOT NULL DEFAULT 0,
  protein         REAL NOT NULL DEFAULT 0,
  carbs           REAL NOT NULL DEFAULT 0,
  fat             REAL NOT NULL DEFAULT 0,
  prep_time_min   INTEGER DEFAULT 15,
  cook_time_min   INTEGER DEFAULT 20,
  servings        INTEGER DEFAULT 2,
  category        TEXT,               -- 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Snack'
  diet            TEXT,               -- 'végétarien' | 'vegan' | 'sans-gluten' | 'normal'
  ingredients     JSONB DEFAULT '[]',
  steps           JSONB DEFAULT '[]',
  tags            JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER ACTIVITY ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_activity (
  id                SERIAL PRIMARY KEY,
  user_id           TEXT NOT NULL DEFAULT 'local',
  type              TEXT NOT NULL,    -- 'run' | 'workout' | 'yoga' | 'nutrition'
  title             TEXT,
  date              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_sec      INTEGER NOT NULL DEFAULT 0,
  calories          INTEGER DEFAULT 0,
  distance_km       REAL,
  pace_min_km       REAL,
  route             JSONB,
  exercises         JSONB,
  session_id        TEXT,
  yoga_category     TEXT,
  yoga_exercise_id  TEXT,
  meal_type         TEXT,
  recipe_id         TEXT,
  protein           REAL,
  carbs             REAL,
  fat               REAL,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exercises_module ON public.exercises (module);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises (difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes (category);
CREATE INDEX IF NOT EXISTS idx_recipes_diet ON public.recipes (diet);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity (type);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON public.user_activity (date DESC);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Allow all reads on exercises and recipes (public content)
CREATE POLICY "public_read_exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "public_read_recipes" ON public.recipes FOR SELECT USING (true);

-- Allow full access for authenticated service (backend)
CREATE POLICY "service_write_exercises" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_recipes" ON public.recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_activity" ON public.user_activity FOR ALL USING (true) WITH CHECK (true);
