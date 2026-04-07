export type MealType = "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Snack";
export type NutritionGoal = "Prise de masse" | "Perte de poids" | "Maintien" | "Sèche";
export type DietType = "Omnivore" | "Végétarien" | "Vegan" | "Sans gluten" | "Cétogène";

export interface RecipeMacros {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  mealType: MealType;
  goal: NutritionGoal[];
  diet: DietType[];
  coverImage: string;
  youtubeEmbedId?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  macros: RecipeMacros;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  difficulty: "Facile" | "Moyen" | "Difficile";
  rating?: number;
}

export interface DayMenu {
  id: string;
  date: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks: string[];
  totalCalories: number;
  totalProtein: number;
}

// ------- RECIPES DATABASE -------
// Structure extensible : ajouter de nouvelles recettes ici ou via API

export const RECIPES: Recipe[] = [
  // ── PETIT-DÉJEUNER ──────────────────────────────────────────────
  {
    id: "rec-pb-oats",
    title: "Porridge Protéiné",
    mealType: "Petit-déjeuner",
    goal: ["Prise de masse", "Maintien"],
    diet: ["Omnivore", "Végétarien"],
    coverImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop&auto=format&q=80",
    youtubeEmbedId: "3bTmBVjqT8g",
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    calories: 480,
    macros: { protein: 32, carbs: 58, fat: 12, fiber: 7 },
    ingredients: [
      { name: "Flocons d'avoine", amount: "80 g" },
      { name: "Lait d'amande", amount: "250 ml" },
      { name: "Whey protéine vanille", amount: "1 scoop (30 g)" },
      { name: "Beurre de cacahuète", amount: "1 c. à soupe" },
      { name: "Banane", amount: "½" },
      { name: "Miel", amount: "1 c. à café" },
    ],
    steps: [
      "Porter le lait à ébullition dans une casserole.",
      "Ajouter les flocons et cuire 3-4 min à feu moyen en remuant.",
      "Hors du feu, incorporer la whey et bien mélanger.",
      "Verser dans un bol, garnir de beurre de cacahuète, banane et miel.",
    ],
    tags: ["rapide", "protéines", "musculation"],
    difficulty: "Facile",
    rating: 4.8,
  },
  {
    id: "rec-pb-eggs-avocado",
    title: "Œufs Brouillés Avocat",
    mealType: "Petit-déjeuner",
    goal: ["Maintien", "Perte de poids", "Sèche"],
    diet: ["Omnivore", "Sans gluten", "Cétogène"],
    coverImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    calories: 390,
    macros: { protein: 22, carbs: 12, fat: 28, fiber: 8 },
    ingredients: [
      { name: "Œufs entiers", amount: "3" },
      { name: "Avocat mûr", amount: "½" },
      { name: "Huile d'olive", amount: "1 c. à café" },
      { name: "Sel, poivre", amount: "selon goût" },
      { name: "Pain complet", amount: "1 tranche" },
      { name: "Tomates cerises", amount: "5-6" },
    ],
    steps: [
      "Fouetter les œufs avec sel et poivre.",
      "Chauffer l'huile à feu doux, verser les œufs.",
      "Remuer doucement jusqu'à texture crémeuse.",
      "Servir sur le pain grillé avec l'avocat écrasé et les tomates.",
    ],
    tags: ["keto", "protéines", "sain"],
    difficulty: "Facile",
    rating: 4.7,
  },
  {
    id: "rec-pb-smoothie-bowl",
    title: "Smoothie Bowl Acaï",
    mealType: "Petit-déjeuner",
    goal: ["Maintien", "Perte de poids"],
    diet: ["Vegan", "Végétarien", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    calories: 340,
    macros: { protein: 12, carbs: 52, fat: 10, fiber: 10 },
    ingredients: [
      { name: "Poudre d'acaï", amount: "1 sachet (100 g)" },
      { name: "Banane congelée", amount: "1" },
      { name: "Lait de coco", amount: "80 ml" },
      { name: "Granola sans sucre", amount: "30 g" },
      { name: "Fruits rouges", amount: "50 g" },
      { name: "Graines de chia", amount: "1 c. à soupe" },
    ],
    steps: [
      "Mixer l'acaï, la banane et le lait de coco jusqu'à consistance épaisse.",
      "Verser dans un bol.",
      "Garnir de granola, fruits rouges et graines de chia.",
      "Servir immédiatement.",
    ],
    tags: ["vegan", "antioxydants", "coloré"],
    difficulty: "Facile",
    rating: 4.9,
  },
  // ── DÉJEUNER ────────────────────────────────────────────────────
  {
    id: "rec-lunch-chicken-bowl",
    title: "Bowl Poulet & Riz",
    mealType: "Déjeuner",
    goal: ["Prise de masse", "Maintien"],
    diet: ["Omnivore", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&auto=format&q=80",
    youtubeEmbedId: "RtNa8cU2GZE",
    prepTime: 10,
    cookTime: 20,
    servings: 1,
    calories: 620,
    macros: { protein: 52, carbs: 65, fat: 14, fiber: 6 },
    ingredients: [
      { name: "Blanc de poulet", amount: "200 g" },
      { name: "Riz basmati", amount: "80 g sec" },
      { name: "Brocoli", amount: "100 g" },
      { name: "Sauce soja", amount: "2 c. à soupe" },
      { name: "Huile de sésame", amount: "1 c. à café" },
      { name: "Ail", amount: "1 gousse" },
    ],
    steps: [
      "Cuire le riz selon les instructions (environ 15 min).",
      "Couper le poulet en lanières, mariner dans sauce soja et ail.",
      "Poêler le poulet 6-8 min jusqu'à dorure.",
      "Cuire le brocoli vapeur 4 min.",
      "Assembler le bowl : riz, poulet, brocoli, filet d'huile de sésame.",
    ],
    tags: ["musculation", "protéines", "meal prep"],
    difficulty: "Facile",
    rating: 4.6,
  },
  {
    id: "rec-lunch-salmon-quinoa",
    title: "Saumon & Quinoa",
    mealType: "Déjeuner",
    goal: ["Maintien", "Sèche", "Perte de poids"],
    diet: ["Omnivore", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&auto=format&q=80",
    youtubeEmbedId: "HxYegtPRlOg",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    calories: 520,
    macros: { protein: 42, carbs: 40, fat: 22, fiber: 5 },
    ingredients: [
      { name: "Filet de saumon", amount: "180 g" },
      { name: "Quinoa", amount: "70 g sec" },
      { name: "Épinards frais", amount: "80 g" },
      { name: "Citron", amount: "½" },
      { name: "Huile d'olive", amount: "1 c. à soupe" },
      { name: "Aneth", amount: "quelques brins" },
    ],
    steps: [
      "Cuire le quinoa (2x son volume en eau, 12-15 min).",
      "Assaisonner le saumon avec citron, sel, aneth.",
      "Poêler 3-4 min par face sur feu moyen.",
      "Faire revenir les épinards 2 min à l'huile d'olive.",
      "Servir saumon sur quinoa et épinards.",
    ],
    tags: ["oméga-3", "sèche", "équilibré"],
    difficulty: "Facile",
    rating: 4.8,
  },
  {
    id: "rec-lunch-turkey-wrap",
    title: "Wrap Dinde & Légumes",
    mealType: "Déjeuner",
    goal: ["Maintien", "Perte de poids"],
    diet: ["Omnivore"],
    coverImage: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 8,
    cookTime: 5,
    servings: 1,
    calories: 420,
    macros: { protein: 38, carbs: 35, fat: 12, fiber: 5 },
    ingredients: [
      { name: "Tortilla de blé", amount: "1 grande" },
      { name: "Blanc de dinde tranché", amount: "120 g" },
      { name: "Fromage blanc 0%", amount: "2 c. à soupe" },
      { name: "Tomates", amount: "1" },
      { name: "Salade verte", amount: "quelques feuilles" },
      { name: "Concombre", amount: "½" },
    ],
    steps: [
      "Étaler le fromage blanc sur la tortilla.",
      "Disposer la dinde, la salade, tomates et concombre.",
      "Rouler fermement en wrap.",
      "Couper en deux en diagonale.",
    ],
    tags: ["rapide", "transport", "léger"],
    difficulty: "Facile",
    rating: 4.5,
  },
  {
    id: "rec-lunch-vegan-buddha",
    title: "Buddha Bowl Vegan",
    mealType: "Déjeuner",
    goal: ["Maintien", "Perte de poids"],
    diet: ["Vegan", "Végétarien", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format&q=80",
    youtubeEmbedId: "3lN9NtCRGYs",
    prepTime: 15,
    cookTime: 25,
    servings: 1,
    calories: 480,
    macros: { protein: 18, carbs: 68, fat: 16, fiber: 14 },
    ingredients: [
      { name: "Pois chiches rôtis", amount: "100 g" },
      { name: "Patate douce", amount: "150 g" },
      { name: "Quinoa", amount: "60 g" },
      { name: "Avocat", amount: "½" },
      { name: "Épinards", amount: "50 g" },
      { name: "Tahini", amount: "1 c. à soupe" },
      { name: "Citron", amount: "½" },
    ],
    steps: [
      "Rôtir les pois chiches et la patate douce 20-25 min à 200°C.",
      "Cuire le quinoa.",
      "Préparer la sauce tahini : tahini + jus citron + eau.",
      "Assembler le bowl avec tous les ingrédients.",
      "Arroser de sauce tahini.",
    ],
    tags: ["vegan", "plant-based", "coloré"],
    difficulty: "Moyen",
    rating: 4.7,
  },
  // ── DÎNER ────────────────────────────────────────────────────────
  {
    id: "rec-dinner-beef-sweet-potato",
    title: "Bœuf & Patate Douce",
    mealType: "Dîner",
    goal: ["Prise de masse", "Maintien"],
    diet: ["Omnivore", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&auto=format&q=80",
    youtubeEmbedId: "TP4SWTkIp8s",
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    calories: 680,
    macros: { protein: 48, carbs: 55, fat: 22, fiber: 8 },
    ingredients: [
      { name: "Steak de bœuf (rumsteak)", amount: "200 g" },
      { name: "Patate douce", amount: "200 g" },
      { name: "Brocoli", amount: "120 g" },
      { name: "Huile d'olive", amount: "1 c. à soupe" },
      { name: "Ail, romarin", amount: "selon goût" },
    ],
    steps: [
      "Cuire la patate douce au four 20 min à 200°C.",
      "Cuire le brocoli vapeur 5 min.",
      "Saisir le steak 2-3 min par face selon cuisson désirée.",
      "Assaisonner avec ail et romarin.",
      "Dresser l'assiette avec tous les éléments.",
    ],
    tags: ["musculation", "iron", "complet"],
    difficulty: "Moyen",
    rating: 4.6,
  },
  {
    id: "rec-dinner-pasta-chicken",
    title: "Pâtes Poulet Pesto",
    mealType: "Dîner",
    goal: ["Prise de masse", "Maintien"],
    diet: ["Omnivore", "Végétarien"],
    coverImage: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    calories: 640,
    macros: { protein: 44, carbs: 72, fat: 18, fiber: 4 },
    ingredients: [
      { name: "Pâtes complètes", amount: "90 g sec" },
      { name: "Blanc de poulet", amount: "150 g" },
      { name: "Pesto maison", amount: "2 c. à soupe" },
      { name: "Tomates cerises", amount: "80 g" },
      { name: "Parmesan", amount: "15 g" },
      { name: "Basilic frais", amount: "selon goût" },
    ],
    steps: [
      "Cuire les pâtes al dente.",
      "Poêler le poulet en morceaux jusqu'à dorure.",
      "Mélanger pâtes, poulet et pesto hors du feu.",
      "Ajouter tomates cerises et parmesan.",
      "Garnir de basilic frais.",
    ],
    tags: ["glucides", "post-workout", "rapide"],
    difficulty: "Facile",
    rating: 4.7,
  },
  {
    id: "rec-dinner-vegan-curry",
    title: "Curry de Lentilles",
    mealType: "Dîner",
    goal: ["Maintien", "Perte de poids"],
    diet: ["Vegan", "Végétarien", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop&auto=format&q=80",
    youtubeEmbedId: "aw2aRfMp4Hc",
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    calories: 420,
    macros: { protein: 22, carbs: 58, fat: 8, fiber: 16 },
    ingredients: [
      { name: "Lentilles corail", amount: "200 g" },
      { name: "Lait de coco", amount: "200 ml" },
      { name: "Tomates concassées", amount: "1 boîte" },
      { name: "Curry en poudre", amount: "2 c. à café" },
      { name: "Oignon", amount: "1" },
      { name: "Ail, gingembre", amount: "2 gousses" },
      { name: "Riz basmati", amount: "60 g" },
    ],
    steps: [
      "Faire revenir oignon, ail et gingembre 3 min.",
      "Ajouter curry et lentilles, nacrer 1 min.",
      "Incorporer tomates et lait de coco.",
      "Cuire 20 min à feu doux en remuant.",
      "Servir avec le riz basmati.",
    ],
    tags: ["vegan", "fibres", "économique"],
    difficulty: "Facile",
    rating: 4.5,
  },
  {
    id: "rec-dinner-tuna-salad",
    title: "Salade Niçoise Fitness",
    mealType: "Dîner",
    goal: ["Perte de poids", "Sèche", "Maintien"],
    diet: ["Omnivore", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 12,
    cookTime: 10,
    servings: 1,
    calories: 380,
    macros: { protein: 36, carbs: 22, fat: 16, fiber: 7 },
    ingredients: [
      { name: "Thon en boîte (eau)", amount: "150 g égouttés" },
      { name: "Œufs durs", amount: "2" },
      { name: "Haricots verts", amount: "100 g" },
      { name: "Tomates cerises", amount: "80 g" },
      { name: "Olives noires", amount: "15 g" },
      { name: "Vinaigrette légère", amount: "1 c. à soupe" },
    ],
    steps: [
      "Cuire les haricots verts al dente (6 min vapeur).",
      "Cuire les œufs durs (9 min).",
      "Assembler tous les ingrédients dans un grand bol.",
      "Arroser de vinaigrette.",
      "Servir frais.",
    ],
    tags: ["léger", "sèche", "protéines"],
    difficulty: "Facile",
    rating: 4.4,
  },
  // ── SNACKS ───────────────────────────────────────────────────────
  {
    id: "rec-snack-protein-shake",
    title: "Shake Protéiné Maison",
    mealType: "Snack",
    goal: ["Prise de masse", "Maintien"],
    diet: ["Omnivore", "Végétarien"],
    coverImage: "https://images.unsplash.com/photo-1526560617706-1b1e85f6d0a9?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    calories: 280,
    macros: { protein: 30, carbs: 22, fat: 6, fiber: 2 },
    ingredients: [
      { name: "Lait demi-écrémé", amount: "250 ml" },
      { name: "Whey chocolat", amount: "1 scoop (30 g)" },
      { name: "Banane", amount: "½" },
      { name: "Beurre d'amande", amount: "1 c. à café" },
    ],
    steps: [
      "Mixer tous les ingrédients jusqu'à consistance lisse.",
      "Servir immédiatement avec des glaçons si souhaité.",
    ],
    tags: ["post-workout", "rapide", "protéines"],
    difficulty: "Facile",
    rating: 4.6,
  },
  {
    id: "rec-snack-energy-balls",
    title: "Energy Balls Dattes-Amandes",
    mealType: "Snack",
    goal: ["Maintien", "Prise de masse"],
    diet: ["Vegan", "Végétarien"],
    coverImage: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    calories: 160,
    macros: { protein: 5, carbs: 22, fat: 8, fiber: 4 },
    ingredients: [
      { name: "Dattes Medjool", amount: "10" },
      { name: "Amandes", amount: "80 g" },
      { name: "Cacao en poudre", amount: "2 c. à soupe" },
      { name: "Noix de coco râpée", amount: "2 c. à soupe" },
    ],
    steps: [
      "Mixer dattes et amandes jusqu'à obtenir une pâte.",
      "Incorporer le cacao, bien malaxer.",
      "Former des boules et rouler dans la noix de coco.",
      "Réfrigérer 30 min avant de consommer.",
    ],
    tags: ["vegan", "naturel", "pré-workout"],
    difficulty: "Facile",
    rating: 4.9,
  },
  {
    id: "rec-snack-greek-yogurt",
    title: "Yaourt Grec & Fruits",
    mealType: "Snack",
    goal: ["Maintien", "Perte de poids"],
    diet: ["Végétarien", "Omnivore", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    calories: 200,
    macros: { protein: 18, carbs: 22, fat: 4, fiber: 3 },
    ingredients: [
      { name: "Yaourt grec 0%", amount: "200 g" },
      { name: "Miel", amount: "1 c. à café" },
      { name: "Myrtilles", amount: "60 g" },
      { name: "Noix", amount: "10 g" },
    ],
    steps: [
      "Verser le yaourt dans un bol.",
      "Ajouter le miel et mélanger.",
      "Garnir de myrtilles et noix.",
      "Consommer frais.",
    ],
    tags: ["rapide", "probiotiques", "naturel"],
    difficulty: "Facile",
    rating: 4.7,
  },
  {
    id: "rec-snack-rice-cakes",
    title: "Galettes de Riz Beurre d'Amande",
    mealType: "Snack",
    goal: ["Sèche", "Perte de poids"],
    diet: ["Vegan", "Végétarien", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 2,
    cookTime: 0,
    servings: 1,
    calories: 150,
    macros: { protein: 6, carbs: 18, fat: 7, fiber: 1 },
    ingredients: [
      { name: "Galettes de riz", amount: "2" },
      { name: "Beurre d'amande", amount: "1 c. à soupe" },
      { name: "Banane", amount: "½" },
    ],
    steps: [
      "Étaler le beurre d'amande sur les galettes.",
      "Garnir de tranches de banane.",
    ],
    tags: ["léger", "pré-workout", "rapide"],
    difficulty: "Facile",
    rating: 4.3,
  },
  // Bonus
  {
    id: "rec-lunch-tuna-pasta",
    title: "Pâtes Thon Tomate",
    mealType: "Déjeuner",
    goal: ["Maintien", "Prise de masse"],
    diet: ["Omnivore"],
    coverImage: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 5,
    cookTime: 12,
    servings: 1,
    calories: 560,
    macros: { protein: 40, carbs: 68, fat: 10, fiber: 5 },
    ingredients: [
      { name: "Pâtes penne", amount: "90 g sec" },
      { name: "Thon en boîte", amount: "120 g" },
      { name: "Sauce tomate", amount: "150 ml" },
      { name: "Câpres", amount: "1 c. à soupe" },
      { name: "Ail", amount: "1 gousse" },
      { name: "Persil", amount: "quelques brins" },
    ],
    steps: [
      "Cuire les pâtes.",
      "Faire revenir ail dans un peu d'huile.",
      "Ajouter sauce tomate, thon et câpres.",
      "Mélanger avec les pâtes égouttées.",
      "Parsemer de persil.",
    ],
    tags: ["économique", "rapide", "meal prep"],
    difficulty: "Facile",
    rating: 4.4,
  },
  {
    id: "rec-dinner-grilled-chicken-veggies",
    title: "Poulet Grillé & Légumes Rôtis",
    mealType: "Dîner",
    goal: ["Sèche", "Perte de poids", "Maintien"],
    diet: ["Omnivore", "Sans gluten"],
    coverImage: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&h=400&fit=crop&auto=format&q=80",
    prepTime: 10,
    cookTime: 30,
    servings: 1,
    calories: 380,
    macros: { protein: 44, carbs: 22, fat: 12, fiber: 9 },
    ingredients: [
      { name: "Filet de poulet", amount: "180 g" },
      { name: "Poivrons mixtes", amount: "150 g" },
      { name: "Courgette", amount: "1 petite" },
      { name: "Aubergine", amount: "½" },
      { name: "Herbes de Provence", amount: "1 c. à café" },
      { name: "Huile d'olive", amount: "1 c. à soupe" },
    ],
    steps: [
      "Préchauffer le four à 200°C.",
      "Couper les légumes, mélanger avec huile et herbes.",
      "Enfourner 25-30 min.",
      "Griller le poulet 5-6 min par face.",
      "Servir ensemble.",
    ],
    tags: ["sèche", "léger", "four"],
    difficulty: "Facile",
    rating: 4.5,
  },
];

// Pagination helper (pour future intégration API)
export function getRecipes(page = 0, limit = 10, filters?: {
  mealType?: MealType;
  goal?: NutritionGoal;
  diet?: DietType;
  maxCalories?: number;
  maxTime?: number;
  search?: string;
}): { data: Recipe[]; total: number; hasMore: boolean } {
  let data = [...RECIPES];
  if (filters) {
    if (filters.mealType) data = data.filter((r) => r.mealType === filters.mealType);
    if (filters.goal) data = data.filter((r) => r.goal.includes(filters.goal!));
    if (filters.diet) data = data.filter((r) => r.diet.includes(filters.diet!));
    if (filters.maxCalories) data = data.filter((r) => r.calories <= filters.maxCalories!);
    if (filters.maxTime) data = data.filter((r) => r.prepTime + r.cookTime <= filters.maxTime!);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter((r) => r.title.toLowerCase().includes(s) || r.tags.some((t) => t.includes(s)));
    }
  }
  return { data: data.slice(page * limit, (page + 1) * limit), total: data.length, hasMore: (page + 1) * limit < data.length };
}

export const NUTRITION_MEAL_TYPES: MealType[] = ["Petit-déjeuner", "Déjeuner", "Dîner", "Snack"];
export const NUTRITION_GOALS: NutritionGoal[] = ["Prise de masse", "Perte de poids", "Maintien", "Sèche"];
export const NUTRITION_DIETS: DietType[] = ["Omnivore", "Végétarien", "Vegan", "Sans gluten", "Cétogène"];

export const NUTRITION_MEAL_ICONS: Record<MealType, string> = {
  "Petit-déjeuner": "☀️",
  "Déjeuner": "🌤️",
  "Dîner": "🌙",
  "Snack": "🍎",
};
