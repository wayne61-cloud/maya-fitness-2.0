export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  equipment: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  type: "Force" | "Cardio" | "Mobilité" | "Endurance";
  calPerMin: number;
  durationMin: number;
  coverImage: string;
  videoId: string;
  description: string;
  instructions: string[];
  benefits: string[];
  tips: string[];
  tags: string[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  durationMin: number;
  calories: number;
  muscleGroups: string[];
  exercises: {
    exerciseId: string;
    sets: number;
    reps: string;
    restSec: number;
    note?: string;
  }[];
  description: string;
  tag?: string;
}

export const MUSCLE_GROUPS = [
  "Tout",
  "Pectoraux",
  "Dos",
  "Épaules",
  "Biceps",
  "Triceps",
  "Jambes",
  "Fessiers",
  "Abdos",
  "Cardio",
];

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=340&fit=crop&auto=format&q=80`;

export const EXERCISES: WorkoutExercise[] = [
  {
    id: "bench-press",
    name: "Développé couché",
    muscleGroup: "Pectoraux",
    secondaryMuscles: ["Triceps", "Épaules"],
    equipment: "Barre + banc",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 8,
    durationMin: 18,
    coverImage: UNSPLASH("1571019613454-1cb2f99b2d8b"),
    videoId: "rT7DgCr-3pg",
    description:
      "Le développé couché est l'exercice roi pour développer la masse pectorale. Il sollicite l'ensemble du pectoral, les triceps et les deltoïdes antérieurs.",
    instructions: [
      "Allongez-vous sur le banc, pieds bien à plat au sol",
      "Saisissez la barre légèrement plus large que la largeur des épaules",
      "Déverrouillez la barre et abaissez-la vers le milieu de la poitrine",
      "Poussez la barre vers le haut en expirant jusqu'à verrouillage des coudes",
      "Contrôlez la descente sur 2-3 secondes",
    ],
    benefits: [
      "Développe la masse et la force pectorale",
      "Renforce les triceps et les deltoïdes antérieurs",
      "Améliore la puissance de poussée globale",
    ],
    tips: [
      "Gardez les omoplates serrées et rétractées",
      "Ne rebondissez pas la barre sur la poitrine",
      "Pieds toujours au sol pour plus de stabilité",
    ],
    tags: ["pectoraux", "force", "masse", "upper-body"],
  },
  {
    id: "incline-dumbbell-press",
    name: "Développé incliné haltères",
    muscleGroup: "Pectoraux",
    secondaryMuscles: ["Épaules", "Triceps"],
    equipment: "Haltères + banc incliné",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 7,
    durationMin: 16,
    coverImage: UNSPLASH("1581009146145-b5ef050c2e1e"),
    videoId: "8iPEnn-ltC8",
    description:
      "Cible la partie supérieure du pectoral pour un développé complet de la poitrine.",
    instructions: [
      "Réglez le banc à 30-45 degrés d'inclinaison",
      "Tenez un haltère dans chaque main, à hauteur des épaules",
      "Poussez les haltères vers le haut en les rapprochant légèrement",
      "Redescendez lentement sous contrôle",
    ],
    benefits: [
      "Cible le chef supérieur du pectoral",
      "Améliore la définition de la poitrine haute",
      "Répartit le travail musculaire uniformément",
    ],
    tips: [
      "30° offre le meilleur équilibre entre pec supérieur et global",
      "Rotation légère des haltères vers l'intérieur en haut",
    ],
    tags: ["pectoraux", "haltères", "incline", "upper-body"],
  },
  {
    id: "pull-up",
    name: "Tractions",
    muscleGroup: "Dos",
    secondaryMuscles: ["Biceps", "Épaules"],
    equipment: "Barre de traction",
    level: "Avancé",
    type: "Force",
    calPerMin: 10,
    durationMin: 20,
    coverImage: UNSPLASH("1534368786875-c21f7e3a4fc1"),
    videoId: "eGo4IYlbE5g",
    description:
      "Les tractions sont l'exercice de référence pour le dos. Elles développent massivement le grand dorsal et améliorent la force globale du haut du corps.",
    instructions: [
      "Saisissez la barre en pronation, légèrement plus large que les épaules",
      "Suspendez-vous à bout de bras, corps gainé",
      "Tirez vers le haut jusqu'à ce que le menton dépasse la barre",
      "Descendez lentement en contrôlant la phase excentrique",
    ],
    benefits: [
      "Développe massivement le grand dorsal",
      "Améliore la force globale du haut du corps",
      "Renforce la prise et les avant-bras",
    ],
    tips: [
      "Initiez le mouvement avec les omoplates, pas les bras",
      "Ne balancez pas le corps",
      "Pour faciliter : utilisez une bande élastique",
    ],
    tags: ["dos", "force", "poids-de-corps", "upper-body"],
  },
  {
    id: "bent-over-row",
    name: "Rowing barre",
    muscleGroup: "Dos",
    secondaryMuscles: ["Biceps", "Trapèzes"],
    equipment: "Barre",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 8,
    durationMin: 18,
    coverImage: UNSPLASH("1526506118085-60ce8714f8c5"),
    videoId: "G8l_8chR5BE",
    description:
      "Exercice polyarticulaire majeur pour l'épaisseur du dos. Cible principalement le grand dorsal, le rhomboïde et le milieu du trapèze.",
    instructions: [
      "Pieds écartés largeur des épaules, légère flexion des genoux",
      "Penchez-vous à environ 45° avec le dos droit",
      "Tirez la barre vers le bas de l'abdomen en serrant les coudes",
      "Revenez lentement à la position de départ",
    ],
    benefits: [
      "Développe l'épaisseur et la largeur du dos",
      "Renforce les rhomboïdes et les trapèzes",
      "Améliore la posture et le maintien",
    ],
    tips: ["Dos toujours plat, jamais arrondi", "Serrez les omoplates en haut du mouvement"],
    tags: ["dos", "force", "barre", "upper-body"],
  },
  {
    id: "lat-pulldown",
    name: "Tirage vertical",
    muscleGroup: "Dos",
    secondaryMuscles: ["Biceps", "Épaules"],
    equipment: "Câble + poulie haute",
    level: "Débutant",
    type: "Force",
    calPerMin: 7,
    durationMin: 15,
    coverImage: UNSPLASH("1540497077202-7c8a3999166f"),
    videoId: "CAwf7n6Luuc",
    description:
      "Alternative aux tractions, idéal pour construire la force dorsale et préparer aux tractions lestées.",
    instructions: [
      "Asseyez-vous face à la machine, genoux sous le rembourrage",
      "Saisissez la barre en pronation, largeur épaules",
      "Tirez la barre vers la clavicule en inclinant légèrement le buste",
      "Contrôlez la remontée",
    ],
    benefits: [
      "Parfait pour les débutants en musculation du dos",
      "Prépare aux tractions avec barre",
      "Améliore la force de tirage verticale",
    ],
    tips: ["Tirez avec les coudes, pas avec les mains", "Gardez la poitrine haute"],
    tags: ["dos", "câble", "débutant", "upper-body"],
  },
  {
    id: "overhead-press",
    name: "Développé militaire",
    muscleGroup: "Épaules",
    secondaryMuscles: ["Triceps", "Trapèzes"],
    equipment: "Barre ou haltères",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 8,
    durationMin: 18,
    coverImage: UNSPLASH("1544367597-5f5a91e8e5a0"),
    videoId: "2yjwXTZQDDI",
    description:
      "Le développé militaire est le roi des exercices d'épaule. Il développe les trois faisceaux du deltoïde et améliore la stabilité de l'épaule.",
    instructions: [
      "Tenez la barre à hauteur des épaules, prise légèrement plus large",
      "Poussez la barre verticalement au-dessus de la tête",
      "Rentrez la tête légèrement pour laisser passer la barre",
      "Verrouillez les coudes en haut, bras tendus",
      "Redescendez sous contrôle à hauteur des épaules",
    ],
    benefits: [
      "Développe les trois faisceaux du deltoïde",
      "Renforce la stabilité de l'épaule",
      "Améliore la puissance de poussée verticale",
    ],
    tips: ["Gainez fortement le core pour protéger le dos", "Évitez l'hyperextension lombaire"],
    tags: ["épaules", "force", "barre", "upper-body"],
  },
  {
    id: "lateral-raise",
    name: "Élévations latérales",
    muscleGroup: "Épaules",
    secondaryMuscles: [],
    equipment: "Haltères",
    level: "Débutant",
    type: "Force",
    calPerMin: 5,
    durationMin: 12,
    coverImage: UNSPLASH("1583454110551-21f2fa2afe61"),
    videoId: "3VcKaXpzqRo",
    description:
      "Isole le faisceau latéral du deltoïde pour élargir visuellement les épaules et créer un physique en V.",
    instructions: [
      "Debout, haltères le long du corps",
      "Élevez les bras sur les côtés jusqu'à hauteur des épaules",
      "Légère rotation externe du poignet (petit doigt en haut)",
      "Descendez lentement sur 3-4 secondes",
    ],
    benefits: [
      "Élargit visuellement les épaules",
      "Isole le deltoïde latéral",
      "Crée un physique en V et améliore la symétrie",
    ],
    tips: [
      "Léger mouvement de coude, pas de coup de rein",
      "Poids léger + contrôle > poids lourd + triche",
    ],
    tags: ["épaules", "isolation", "haltères", "upper-body"],
  },
  {
    id: "bicep-curl",
    name: "Curl biceps barre",
    muscleGroup: "Biceps",
    secondaryMuscles: ["Avant-bras"],
    equipment: "Barre EZ ou droite",
    level: "Débutant",
    type: "Force",
    calPerMin: 5,
    durationMin: 12,
    coverImage: UNSPLASH("1581009137042-c8f9f31bacce"),
    videoId: "LY1V6UbRHFM",
    description:
      "L'isolation du biceps par excellence. La barre EZ réduit la tension sur les poignets.",
    instructions: [
      "Debout, barre tenue en supination",
      "Coudes collés au corps, fléchissez les avant-bras",
      "Montez jusqu'à la contraction maximale",
      "Descendez lentement sans laisser les coudes bouger en avant",
    ],
    benefits: [
      "Développe le volume et le pic du biceps",
      "Renforce les avant-bras et la prise",
      "Améliore la force de flexion du coude",
    ],
    tips: [
      "Squeezer le biceps en haut pour maximiser la contraction",
      "Ne vous aidez pas du dos",
    ],
    tags: ["biceps", "isolation", "barre", "upper-body"],
  },
  {
    id: "tricep-pushdown",
    name: "Extension triceps poulie",
    muscleGroup: "Triceps",
    secondaryMuscles: [],
    equipment: "Câble + corde",
    level: "Débutant",
    type: "Force",
    calPerMin: 5,
    durationMin: 12,
    coverImage: UNSPLASH("1534367507873-d2d7e24c797f"),
    videoId: "2-LAMcpzODU",
    description:
      "Exercice d'isolation efficace pour développer le volume et la définition du triceps.",
    instructions: [
      "Debout face à la poulie haute, saisissez la corde",
      "Coudes collés au corps, bras fléchis",
      "Poussez la corde vers le bas en écartant les extrémités",
      "Contractez le triceps en bas, revenez lentement",
    ],
    benefits: [
      "Isole les trois chefs du triceps",
      "Améliore la définition et le galbe du bras",
      "Tension constante grâce au câble",
    ],
    tips: [
      "Coudes fixes tout au long du mouvement",
      "Écartez la corde en bas pour une meilleure isolation",
    ],
    tags: ["triceps", "isolation", "câble", "upper-body"],
  },
  {
    id: "squat",
    name: "Squat barre",
    muscleGroup: "Jambes",
    secondaryMuscles: ["Fessiers", "Abdos", "Dos"],
    equipment: "Barre + cage",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 12,
    durationMin: 25,
    coverImage: UNSPLASH("1534438327431-94d22a47f706"),
    videoId: "bEv6CCg2BC8",
    description:
      "Le roi de tous les exercices. Le squat sollicite l'ensemble des muscles du bas du corps et stimule la sécrétion d'hormones anabolisantes.",
    instructions: [
      "Barre posée sur les trapèzes (high bar) ou deltoïdes (low bar)",
      "Pieds écartés légèrement plus que les épaules, orteils légèrement ouverts",
      "Descendez en gardant le buste droit et les genoux dans l'axe des pieds",
      "Cuisses parallèles au sol minimum (full squat recommandé)",
      "Poussez avec les talons pour remonter",
    ],
    benefits: [
      "Développe la force et la masse des jambes complètes",
      "Stimule la production d'hormones anabolisantes",
      "Renforce le gainage et la posture générale",
    ],
    tips: [
      "Genoux ne doivent pas rentrer vers l'intérieur",
      "Respirez avant de descendre (Valsalva)",
      "Jambes jamais totalement verrouillées",
    ],
    tags: ["jambes", "force", "masse", "compound", "lower-body"],
  },
  {
    id: "romanian-deadlift",
    name: "Soulevé de terre roumain",
    muscleGroup: "Fessiers",
    secondaryMuscles: ["Ischio-jambiers", "Dos"],
    equipment: "Barre ou haltères",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 10,
    durationMin: 18,
    coverImage: UNSPLASH("1571945153237-4929e783af4a"),
    videoId: "JCXUYuzwNrM",
    description:
      "Excellent pour développer les ischio-jambiers et les fessiers tout en améliorant la mobilité de la chaîne postérieure.",
    instructions: [
      "Debout, haltères ou barre devant les cuisses",
      "Penchez-vous en avant en gardant le dos droit",
      "Les haltères glissent le long des jambes",
      "Descendre jusqu'à sentir l'étirement dans les ischio-jambiers",
      "Remontez en contractant les fessiers",
    ],
    benefits: [
      "Développe les ischio-jambiers et fessiers",
      "Améliore la flexibilité de la chaîne postérieure",
      "Renforce le bas du dos et la stabilité lombaire",
    ],
    tips: [
      "Dos toujours neutre, jamais arrondi",
      "Légère flexion des genoux pour protéger les articulations",
    ],
    tags: ["fessiers", "ischio", "force", "lower-body"],
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    muscleGroup: "Fessiers",
    secondaryMuscles: ["Ischio-jambiers", "Quadriceps"],
    equipment: "Barre + banc",
    level: "Débutant",
    type: "Force",
    calPerMin: 8,
    durationMin: 16,
    coverImage: UNSPLASH("1570172619644-dfd03ed5d881"),
    videoId: "xDmFkJxPzeM",
    description:
      "L'exercice le plus efficace pour isoler et développer les fessiers. Études EMG prouvent une activation maximale des fessiers.",
    instructions: [
      "Dos appuyé sur le banc, barre en travers des hanches",
      "Pieds à plat au sol, écartés largeur des épaules",
      "Poussez les hanches vers le haut jusqu'à alignement complet",
      "Contractez les fessiers au maximum en haut",
      "Redescendez lentement",
    ],
    benefits: [
      "Activation maximale des fessiers (prouvée EMG)",
      "Améliore la puissance et la vitesse athlétique",
      "Sans pression sur la colonne vertébrale",
    ],
    tips: [
      "Menton rentré pour ne pas comprimer la nuque",
      "Poussez avec les talons, pas les orteils",
    ],
    tags: ["fessiers", "force", "isolation", "lower-body"],
  },
  {
    id: "plank",
    name: "Planche (Plank)",
    muscleGroup: "Abdos",
    secondaryMuscles: ["Dos", "Épaules", "Fessiers"],
    equipment: "Aucun",
    level: "Débutant",
    type: "Endurance",
    calPerMin: 4,
    durationMin: 10,
    coverImage: UNSPLASH("1571019614099-fdde74e7e2e7"),
    videoId: "ASdvN_XEl_c",
    description:
      "La planche est le meilleur exercice isométrique pour renforcer l'ensemble du gainage du tronc.",
    instructions: [
      "Appui sur les avant-bras et les orteils",
      "Corps parfaitement aligné de la tête aux talons",
      "Abdominaux contractés, fessiers serrés",
      "Respirez normalement sans laisser les hanches monter ou descendre",
    ],
    benefits: [
      "Renforce tout le gainage du tronc",
      "Améliore la stabilité et la posture",
      "Sans impact articulaire, accessible à tous",
    ],
    tips: [
      "Qualité > durée : 30s parfaites valent plus que 2min relâchée",
      "Rentrez le nombril vers la colonne",
    ],
    tags: ["abdos", "gainage", "poids-de-corps", "core"],
  },
  {
    id: "leg-press",
    name: "Presse à cuisses",
    muscleGroup: "Jambes",
    secondaryMuscles: ["Fessiers"],
    equipment: "Machine",
    level: "Débutant",
    type: "Force",
    calPerMin: 9,
    durationMin: 16,
    coverImage: UNSPLASH("1552674605-db6ffd4facb5"),
    videoId: "IZxyjW7MPJQ",
    description:
      "Alternative au squat permettant de charger lourd en sécurité et de cibler précisément les quadriceps.",
    instructions: [
      "Asseyez-vous dans la machine, dos contre le dossier",
      "Pieds à mi-hauteur de la plateforme, écartés largeur des hanches",
      "Déverrouillez, descendez lentement jusqu'à 90° minimum",
      "Poussez en gardant les talons ancrés",
    ],
    benefits: [
      "Permet de charger très lourd en toute sécurité",
      "Cible précisément les quadriceps",
      "Idéal en cas de douleurs lombaires",
    ],
    tips: [
      "Ne verrouillez jamais complètement les genoux",
      "Pieds hauts = plus de fessiers/ischio, pieds bas = plus de quadriceps",
    ],
    tags: ["jambes", "machine", "débutant", "lower-body"],
  },
  {
    id: "cable-fly",
    name: "Écarté poulie",
    muscleGroup: "Pectoraux",
    secondaryMuscles: ["Épaules"],
    equipment: "Câbles croisés",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 6,
    durationMin: 14,
    coverImage: UNSPLASH("1516208813904-7f3aa1ad5ab7"),
    videoId: "Iwe6AmxVf7o",
    description:
      "Isolation maximale du pectoral avec tension constante tout au long du mouvement, idéal pour la finition et la définition.",
    instructions: [
      "Poulies réglées en haut, debout au centre",
      "Légère flexion des coudes, bras ouverts en croix",
      "Ramenez les mains vers le centre en arc de cercle",
      "Contractez les pectoraux en fin de mouvement",
    ],
    benefits: [
      "Tension constante sur le pectoral",
      "Parfait pour la finition et la définition",
      "Meilleure isolation qu'avec des haltères",
    ],
    tips: ["Imaginez enlacer un arbre géant", "La tension câble > haltères pour la finition"],
    tags: ["pectoraux", "câble", "isolation", "upper-body"],
  },
  {
    id: "face-pull",
    name: "Face Pull",
    muscleGroup: "Épaules",
    secondaryMuscles: ["Trapèzes", "Dos"],
    equipment: "Câble + corde",
    level: "Débutant",
    type: "Force",
    calPerMin: 5,
    durationMin: 10,
    coverImage: UNSPLASH("1605296867424-35fc25c9212a"),
    videoId: "rep-qVOkqgk",
    description:
      "Exercice indispensable pour la santé des épaules et l'équilibre musculaire. Renforce les rotateurs externes et les deltoïdes postérieurs.",
    instructions: [
      "Poulie à hauteur du visage, saisissez la corde en pronation",
      "Tirez vers le visage en écartant les mains",
      "Rotation externe des épaules en fin de mouvement",
      "Revenez lentement",
    ],
    benefits: [
      "Prévient les blessures d'épaule",
      "Rééquilibre les muscles de la coiffe des rotateurs",
      "Améliore la posture et corrige l'enroulement",
    ],
    tips: [
      "Pensez à pointer les pouces vers l'arrière",
      "Incontournable pour la longévité des épaules",
    ],
    tags: ["épaules", "santé", "câble", "upper-body"],
  },
  {
    id: "lunges",
    name: "Fentes marchées",
    muscleGroup: "Jambes",
    secondaryMuscles: ["Fessiers", "Abdos"],
    equipment: "Haltères ou barre",
    level: "Débutant",
    type: "Force",
    calPerMin: 9,
    durationMin: 14,
    coverImage: UNSPLASH("1553530979-7d3016b1b35f"),
    videoId: "L8fvypPrzzs",
    description:
      "Les fentes améliorent l'équilibre unijambiste, corrigent les déséquilibres et développent simultanément quadriceps et fessiers.",
    instructions: [
      "Debout, pieds joints, haltères dans chaque main",
      "Faites un grand pas en avant",
      "Descendez jusqu'à ce que le genou arrière frôle le sol",
      "Poussez sur le pied avant pour revenir et enchaîner l'autre côté",
    ],
    benefits: [
      "Corrige les déséquilibres gauche/droite",
      "Améliore l'équilibre et la coordination",
      "Développe simultanément quadriceps et fessiers",
    ],
    tips: [
      "Genou avant ne dépasse pas le bout du pied",
      "Buste droit tout au long du mouvement",
    ],
    tags: ["jambes", "fessiers", "unilatéral", "lower-body"],
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    muscleGroup: "Abdos",
    secondaryMuscles: ["Obliques"],
    equipment: "Disque ou haltère",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 6,
    durationMin: 10,
    coverImage: UNSPLASH("1547919307-1ecf11bf6cfc"),
    videoId: "wkD8rjkodUI",
    description:
      "Excellent pour développer les obliques et la rotation du tronc, essentiels pour les sports de combat et de raquette.",
    instructions: [
      "Assis au sol, jambes légèrement fléchies soulevées",
      "Tenez un disque ou haltère devant vous",
      "Tournez le tronc de gauche à droite en contrôlant",
      "Touchez le sol de chaque côté à chaque rotation",
    ],
    benefits: [
      "Développe les obliques et la rotation du tronc",
      "Améliore la stabilité rotationnelle",
      "Essentiel pour les sports de combat et de raquette",
    ],
    tips: [
      "Plus les pieds sont hauts, plus c'est difficile",
      "Twistez depuis les épaules, pas les bras",
    ],
    tags: ["abdos", "obliques", "core", "rotation"],
  },
  {
    id: "deadlift",
    name: "Soulevé de terre",
    muscleGroup: "Dos",
    secondaryMuscles: ["Jambes", "Fessiers", "Abdos", "Trapèzes"],
    equipment: "Barre",
    level: "Avancé",
    type: "Force",
    calPerMin: 14,
    durationMin: 25,
    coverImage: UNSPLASH("1517838277536-f5f99be501cd"),
    videoId: "op9kVnSso6Q",
    description:
      "L'exercice le plus complet de la musculation. Sollicite plus de 70% des muscles du corps dans un seul mouvement.",
    instructions: [
      "Pieds sous la barre, écartés largeur des hanches",
      "Saisissez la barre en pronation ou mixte",
      "Dos plat, poitrine haute, hanches fléchies",
      "Poussez le sol avec les pieds pour soulever",
      "Hanches et épaules montent à la même vitesse",
      "Debout, hanche et genou verrouillés",
    ],
    benefits: [
      "Sollicite plus de 70% des muscles du corps",
      "Développe une force fonctionnelle maximale",
      "Renforce la chaîne postérieure complète",
    ],
    tips: [
      "La barre reste toujours en contact avec les tibias",
      "N'arrondissez JAMAIS le bas du dos avec charge lourde",
    ],
    tags: ["dos", "force", "compound", "avancé", "full-body"],
  },
  {
    id: "dips",
    name: "Dips",
    muscleGroup: "Triceps",
    secondaryMuscles: ["Pectoraux", "Épaules"],
    equipment: "Barres parallèles",
    level: "Intermédiaire",
    type: "Force",
    calPerMin: 9,
    durationMin: 14,
    coverImage: UNSPLASH("1541534741688-6078c787b684"),
    videoId: "2z8JmcrW-As",
    description:
      "Les dips sont un exercice polyarticulaire exceptionnel pour les triceps. En se penchant en avant, vous sollicitez davantage les pectoraux.",
    instructions: [
      "Montez sur les barres, bras tendus, corps droit",
      "Descendez lentement en fléchissant les coudes",
      "Jusqu'à ce que les épaules soient à hauteur des coudes",
      "Repoussez vers le haut jusqu'à extension complète",
    ],
    benefits: [
      "Excellent développeur de triceps polyarticulaire",
      "Peut cibler pectoraux ou triceps selon l'inclinaison",
      "Exercice au poids de corps facilement progressif",
    ],
    tips: [
      "Corps droit = plus de triceps, penché avant = plus de pectoraux",
      "Utilisez une bande élastique si trop difficile",
    ],
    tags: ["triceps", "pectoraux", "poids-de-corps", "upper-body"],
  },
];

export const SESSIONS: WorkoutSession[] = [
  {
    id: "push-a",
    name: "Push Day A",
    type: "PPL",
    level: "Intermédiaire",
    durationMin: 65,
    calories: 420,
    muscleGroups: ["Pectoraux", "Épaules", "Triceps"],
    description:
      "Séance poussée complète pour développer le haut du corps. Idéale pour le programme Push Pull Legs.",
    tag: "PPL",
    exercises: [
      { exerciseId: "bench-press", sets: 4, reps: "6-8", restSec: 120 },
      { exerciseId: "incline-dumbbell-press", sets: 3, reps: "10-12", restSec: 90 },
      { exerciseId: "overhead-press", sets: 3, reps: "8-10", restSec: 90 },
      { exerciseId: "lateral-raise", sets: 4, reps: "15-20", restSec: 60 },
      { exerciseId: "cable-fly", sets: 3, reps: "12-15", restSec: 60 },
      { exerciseId: "tricep-pushdown", sets: 3, reps: "12-15", restSec: 60 },
      { exerciseId: "dips", sets: 3, reps: "10-12", restSec: 75 },
    ],
  },
  {
    id: "pull-a",
    name: "Pull Day A",
    type: "PPL",
    level: "Intermédiaire",
    durationMin: 60,
    calories: 390,
    muscleGroups: ["Dos", "Biceps"],
    description:
      "Séance tirage pour construire un dos large et épais. Combine tractions, rowing et isolations.",
    tag: "PPL",
    exercises: [
      { exerciseId: "pull-up", sets: 4, reps: "6-10", restSec: 120 },
      { exerciseId: "bent-over-row", sets: 4, reps: "8-10", restSec: 120 },
      { exerciseId: "lat-pulldown", sets: 3, reps: "10-12", restSec: 90 },
      { exerciseId: "face-pull", sets: 3, reps: "15-20", restSec: 60 },
      { exerciseId: "bicep-curl", sets: 4, reps: "10-12", restSec: 60 },
    ],
  },
  {
    id: "legs-a",
    name: "Leg Day A",
    type: "PPL",
    level: "Intermédiaire",
    durationMin: 70,
    calories: 520,
    muscleGroups: ["Jambes", "Fessiers"],
    description:
      "Séance jambes complète avec accent sur les quadriceps et les fessiers. La plus dure de la semaine.",
    tag: "PPL",
    exercises: [
      { exerciseId: "squat", sets: 4, reps: "5-8", restSec: 150 },
      { exerciseId: "romanian-deadlift", sets: 3, reps: "10-12", restSec: 120 },
      { exerciseId: "leg-press", sets: 3, reps: "12-15", restSec: 90 },
      { exerciseId: "lunges", sets: 3, reps: "12 chaque", restSec: 90 },
      { exerciseId: "hip-thrust", sets: 4, reps: "12-15", restSec: 90 },
    ],
  },
  {
    id: "full-body-beginner",
    name: "Full Body Débutant",
    type: "Full Body",
    level: "Débutant",
    durationMin: 45,
    calories: 280,
    muscleGroups: ["Pectoraux", "Dos", "Jambes", "Abdos"],
    description:
      "Programme complet idéal pour les débutants. Un exercice par groupe musculaire pour s'initier en douceur.",
    tag: "Full Body",
    exercises: [
      {
        exerciseId: "lat-pulldown",
        sets: 3,
        reps: "12-15",
        restSec: 90,
        note: "Alternative aux tractions",
      },
      { exerciseId: "bench-press", sets: 3, reps: "12-15", restSec: 90 },
      { exerciseId: "leg-press", sets: 3, reps: "15", restSec: 90 },
      { exerciseId: "lateral-raise", sets: 3, reps: "15", restSec: 60 },
      { exerciseId: "bicep-curl", sets: 3, reps: "15", restSec: 60 },
      { exerciseId: "tricep-pushdown", sets: 3, reps: "15", restSec: 60 },
      { exerciseId: "plank", sets: 3, reps: "30-60s", restSec: 60 },
    ],
  },
  {
    id: "glutes-focus",
    name: "Glutes & Legs",
    type: "Isolation",
    level: "Débutant",
    durationMin: 50,
    calories: 350,
    muscleGroups: ["Fessiers", "Jambes"],
    description:
      "Séance dédiée aux fessiers et ischio-jambiers pour sculpter et renforcer le bas du corps.",
    tag: "Fessiers",
    exercises: [
      { exerciseId: "hip-thrust", sets: 4, reps: "15-20", restSec: 75 },
      { exerciseId: "romanian-deadlift", sets: 4, reps: "12-15", restSec: 90 },
      { exerciseId: "lunges", sets: 3, reps: "15 chaque", restSec: 75 },
      {
        exerciseId: "squat",
        sets: 3,
        reps: "15",
        restSec: 90,
        note: "Poids léger, focus fessiers",
      },
    ],
  },
  {
    id: "upper-body",
    name: "Upper Body",
    type: "Upper/Lower",
    level: "Intermédiaire",
    durationMin: 60,
    calories: 380,
    muscleGroups: ["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps"],
    description:
      "Haut du corps complet en une séance. Parfait pour un programme 2-3 fois par semaine.",
    tag: "Upper",
    exercises: [
      { exerciseId: "bench-press", sets: 3, reps: "8-10", restSec: 90 },
      { exerciseId: "bent-over-row", sets: 3, reps: "8-10", restSec: 90 },
      { exerciseId: "overhead-press", sets: 3, reps: "10", restSec: 90 },
      { exerciseId: "lat-pulldown", sets: 3, reps: "12", restSec: 75 },
      { exerciseId: "lateral-raise", sets: 3, reps: "15", restSec: 60 },
      { exerciseId: "face-pull", sets: 3, reps: "15", restSec: 60 },
      { exerciseId: "bicep-curl", sets: 2, reps: "15", restSec: 60 },
      { exerciseId: "tricep-pushdown", sets: 2, reps: "15", restSec: 60 },
    ],
  },
  {
    id: "strength-core",
    name: "Force & Core",
    type: "Force",
    level: "Avancé",
    durationMin: 75,
    calories: 500,
    muscleGroups: ["Dos", "Jambes", "Abdos"],
    description:
      "Séance axée sur les mouvements de force fondamentaux. Deadlift, squat et gainage pour la puissance maximale.",
    tag: "Force",
    exercises: [
      {
        exerciseId: "deadlift",
        sets: 5,
        reps: "3-5",
        restSec: 180,
        note: "Travail lourd — échauffez-vous bien",
      },
      { exerciseId: "squat", sets: 4, reps: "5", restSec: 150 },
      { exerciseId: "bent-over-row", sets: 4, reps: "6-8", restSec: 120 },
      { exerciseId: "plank", sets: 3, reps: "60s", restSec: 75 },
      { exerciseId: "russian-twist", sets: 3, reps: "20", restSec: 60 },
    ],
  },
];
