const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=340&fit=crop&auto=format&q=80`;

export type RunnerExerciseCategory =
  | "Échauffement"
  | "Technique"
  | "Renforcement"
  | "Récupération"
  | "Mobilité";

export interface RunnerExercise {
  id: string;
  title: string;
  category: RunnerExerciseCategory;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  coverImage: string;
  youtubeEmbedId: string;
  duration: number; // minutes
  calories: number;
  description: string;
  instructions: string[];
  benefits: string[];
  musclesTargeted: string[];
  tags: string[];
}

export const RUNNER_EXERCISE_CATEGORIES: RunnerExerciseCategory[] = [
  "Échauffement",
  "Technique",
  "Renforcement",
  "Récupération",
  "Mobilité",
];

export const RUNNER_EXERCISES: RunnerExercise[] = [
  // ─── ÉCHAUFFEMENT ───────────────────────────────────────────────────
  {
    id: "run-warmup-march",
    title: "Marche active & rotation bras",
    category: "Échauffement",
    level: "Débutant",
    coverImage: UNSPLASH("1486218119243-13301bc8eb88"),
    youtubeEmbedId: "pqb9RZBgZMU",
    duration: 5,
    calories: 20,
    description:
      "La marche active combinée aux rotations de bras élève progressivement le rythme cardiaque et prépare les articulations avant l'effort. C'est le point de départ idéal de chaque séance de course.",
    instructions: [
      "Marchez à vive allure pendant 2 minutes",
      "Faites des rotations de bras vers l'avant 10 fois, puis vers l'arrière 10 fois",
      "Accélérez légèrement le pas jusqu'au trot léger",
      "Ajoutez des montées de genoux progressives pendant 1 minute",
      "Terminez par 30 secondes de footing lent",
    ],
    benefits: [
      "Élève progressivement le rythme cardiaque",
      "Prépare les articulations des épaules et hanches",
      "Réduit le risque de blessure au démarrage",
    ],
    musclesTargeted: ["Ischio-jambiers", "Quadriceps", "Épaules", "Mollets"],
    tags: ["échauffement", "débutant", "cardio-léger"],
  },
  {
    id: "run-warmup-highknees",
    title: "Montées de genoux dynamiques",
    category: "Échauffement",
    level: "Débutant",
    coverImage: UNSPLASH("1483721788836-3ea87df0d192"),
    youtubeEmbedId: "8opcQdC-V-U",
    duration: 4,
    calories: 35,
    description:
      "Les montées de genoux activent les fléchisseurs de hanche, améliorent la cadence et réchauffent le système cardiovasculaire. Indispensables avant toute séance de course.",
    instructions: [
      "Debout, pieds écartés largeur des hanches",
      "Levez alternativement les genoux jusqu'à hauteur du bassin",
      "Balancez les bras en opposition (bras gauche avec genou droit)",
      "Maintenez le dos droit et le regard devant",
      "Augmentez progressivement la vitesse sur 3-4 séries de 20 répétitions",
    ],
    benefits: [
      "Active les fléchisseurs de hanche essentiels à la course",
      "Améliore la cadence et la coordination",
      "Réchauffe efficacement le système cardiovasculaire",
    ],
    musclesTargeted: ["Fléchisseurs de hanche", "Abdos", "Mollets", "Quadriceps"],
    tags: ["échauffement", "cadence", "hanche"],
  },
  {
    id: "run-warmup-legswings",
    title: "Balancés de jambes",
    category: "Échauffement",
    level: "Débutant",
    coverImage: UNSPLASH("1535914254981-b5012eebbd37"),
    youtubeEmbedId: "5UCkrWGBFws",
    duration: 5,
    calories: 18,
    description:
      "Les balancés de jambes mobilisent l'articulation de la hanche dans toute son amplitude. Exercice clé pour les coureurs afin de prévenir les douleurs aux hanches et aux ischio-jambiers.",
    instructions: [
      "Tenez-vous à un mur ou une barrière pour l'équilibre",
      "Balancez une jambe vers l'avant et vers l'arrière 15 fois",
      "Puis balancez la même jambe latéralement vers l'intérieur et l'extérieur 15 fois",
      "Changez de jambe et répétez",
      "Progressez vers des amplitudes plus grandes sans forcer",
    ],
    benefits: [
      "Mobilise la hanche dans toute son amplitude",
      "Prévient les tendinites et douleurs à la hanche",
      "Améliore la souplesse des ischio-jambiers",
    ],
    musclesTargeted: ["Fléchisseurs de hanche", "Ischio-jambiers", "Fessiers", "Adducteurs"],
    tags: ["mobilité", "hanche", "prévention"],
  },

  // ─── TECHNIQUE ──────────────────────────────────────────────────────
  {
    id: "run-tech-cadence",
    title: "Travail de cadence (180 pas/min)",
    category: "Technique",
    level: "Intermédiaire",
    coverImage: UNSPLASH("1476480862126-209bfaa8edc8"),
    youtubeEmbedId: "zSuHNqANNNM",
    duration: 12,
    calories: 80,
    description:
      "La cadence optimale de 170-180 pas par minute réduit l'impact au sol, limite les blessures et améliore l'économie de course. Cet exercice vous aide à intégrer ce rythme naturellement.",
    instructions: [
      "Mettez un métronome sur 170-180 BPM (application smartphone)",
      "Courez en synchronisant chaque pose de pied avec le bip",
      "Commencez 5 minutes à vitesse facile, concentré uniquement sur la cadence",
      "Reposez-vous 2 minutes puis répétez 2 fois",
      "Progressez en conservant cette cadence à des allures plus rapides",
    ],
    benefits: [
      "Réduit les forces d'impact au sol de 20 à 30%",
      "Limite les blessures liées au surstride",
      "Améliore l'économie de course et l'efficacité énergétique",
    ],
    musclesTargeted: ["Mollets", "Quadriceps", "Fessiers", "Ischio-jambiers"],
    tags: ["technique", "cadence", "efficacité", "intermédiaire"],
  },
  {
    id: "run-tech-drills",
    title: "Gammes de course (Drills)",
    category: "Technique",
    level: "Intermédiaire",
    coverImage: UNSPLASH("1518611012228-43782890b0be"),
    youtubeEmbedId: "wB13ou48TOo",
    duration: 15,
    calories: 90,
    description:
      "Les gammes de course (talon-fesses, montées de genoux, talonnettes) affinent la technique et renforcent les muscles spécifiques au running. Pratiquées régulièrement, elles transforment durablement votre foulée.",
    instructions: [
      "Talon-fesses : touchez les fesses avec les talons alternativement, 20m × 3",
      "Montées de genoux hautes : levez les genoux au maximum, 20m × 3",
      "Pas chassés latéraux : déplacez-vous latéralement, 20m × 2 par côté",
      "Skipping : montées de genoux rapides sur place, 15 secondes × 3",
      "Accélérations progressives : terminez par 3 × 60m d'accélération douce",
    ],
    benefits: [
      "Améliore la mécanique et l'efficacité de la foulée",
      "Renforce les muscles spécifiques à la course",
      "Développe la proprioception et la coordination",
    ],
    musclesTargeted: ["Mollets", "Ischio-jambiers", "Quadriceps", "Fessiers"],
    tags: ["technique", "drills", "foulée", "coordination"],
  },
  {
    id: "run-tech-breathing",
    title: "Respiration rythmée 2-2 et 3-2",
    category: "Technique",
    level: "Débutant",
    coverImage: UNSPLASH("1571008887538-b36bb32f4571"),
    youtubeEmbedId: "v_GtHSLgmYA",
    duration: 10,
    calories: 50,
    description:
      "Maîtriser la respiration en course réduit le point de côté, améliore l'oxygénation musculaire et permet de courir plus longtemps à une allure donnée. La rythmique 2-2 ou 3-2 est la base de la respiration de coureur.",
    instructions: [
      "Rythme 2-2 : inspirez sur 2 foulées, expirez sur 2 foulées (allures rapides)",
      "Rythme 3-2 : inspirez sur 3 foulées, expirez sur 2 foulées (allures modérées)",
      "Respirez par le nez ET la bouche simultanément",
      "Pratiquez d'abord en marchant puis en trottinant",
      "Entraînez-vous 10 minutes à cadence légère en comptant mentalement",
    ],
    benefits: [
      "Élimine les points de côté",
      "Améliore l'oxygénation musculaire",
      "Permet de courir plus longtemps et plus confortablement",
    ],
    musclesTargeted: ["Diaphragme", "Muscles intercostaux"],
    tags: ["respiration", "technique", "débutant", "endurance"],
  },

  // ─── RENFORCEMENT ────────────────────────────────────────────────────
  {
    id: "run-strength-calf",
    title: "Mollets — montées sur pointes de pied",
    category: "Renforcement",
    level: "Débutant",
    coverImage: UNSPLASH("1571019613454-1cb2f99b2d8b"),
    youtubeEmbedId: "gwLzBJYoWlI",
    duration: 10,
    calories: 45,
    description:
      "Les mollets sont les muscles les plus sollicités en course à pied. Les renforcer réduit les tendinites d'Achille, améliore la propulsion et protège la cheville. Un incontournable pour tous les coureurs.",
    instructions: [
      "Debout sur le bord d'une marche, talons dans le vide",
      "Montez sur la pointe des pieds aussi haut que possible",
      "Tenez 1 seconde en haut, contractez les mollets",
      "Descendez lentement jusqu'à sentir l'étirement",
      "3 séries de 15 répétitions, repos 60 secondes",
    ],
    benefits: [
      "Prévient la tendinite d'Achille",
      "Améliore la puissance de propulsion",
      "Renforce la stabilité de la cheville",
    ],
    musclesTargeted: ["Mollets (gastrocnémien)", "Soléaire", "Tendon d'Achille"],
    tags: ["renforcement", "mollets", "prévention", "cheville"],
  },
  {
    id: "run-strength-glutes",
    title: "Fessiers — pont fessier unilatéral",
    category: "Renforcement",
    level: "Intermédiaire",
    coverImage: UNSPLASH("1570172619644-dfd03ed5d881"),
    youtubeEmbedId: "2hYazNMsj0o",
    duration: 12,
    calories: 55,
    description:
      "Des fessiers forts stabilisent le bassin en course, réduisent le risque de syndrome de la bandelette iliotibiale (IT band) et améliorent la puissance de foulée. Le pont unilatéral est l'exercice préféré des kinés du sport.",
    instructions: [
      "Allongé sur le dos, genoux fléchis, pieds à plat",
      "Levez un pied du sol, jambe tendue dans l'axe",
      "Montez les hanches jusqu'à l'alignement épaule-genou",
      "Tenez 2 secondes en contractant le fessier",
      "Descendez lentement, 12 répétitions par côté × 3 séries",
    ],
    benefits: [
      "Stabilise le bassin pendant la course",
      "Prévient le syndrome IT band",
      "Améliore la puissance de propulsion unilatérale",
    ],
    musclesTargeted: ["Fessiers", "Ischio-jambiers", "Stabilisateurs lombaires"],
    tags: ["renforcement", "fessiers", "unilatéral", "prévention"],
  },
  {
    id: "run-strength-core",
    title: "Gainage latéral progressif",
    category: "Renforcement",
    level: "Intermédiaire",
    coverImage: UNSPLASH("1571019614099-fdde74e7e2e7"),
    youtubeEmbedId: "K2sDhAR7fic",
    duration: 10,
    calories: 40,
    description:
      "Un core solide empêche le tangage du buste en course, économise l'énergie et protège la colonne. Le gainage latéral renforce les obliques et le carré des lombes, essentiels à la stabilité du tronc.",
    instructions: [
      "Sur le côté, appui sur l'avant-bras et le pied",
      "Corps aligné de la tête aux pieds, hanches hautes",
      "Tenez 30 secondes, augmentez progressivement jusqu'à 60 secondes",
      "Variation : soulevez et abaissez les hanches 10 fois",
      "3 séries par côté, repos 45 secondes",
    ],
    benefits: [
      "Stabilise le tronc et réduit le tangage",
      "Protège la colonne lombaire",
      "Économise l'énergie en course",
    ],
    musclesTargeted: ["Obliques", "Carré des lombes", "Épaule (stabilisation)"],
    tags: ["renforcement", "core", "gainage", "stabilité"],
  },
  {
    id: "run-strength-hipflexor",
    title: "Renforcement fléchisseurs de hanche",
    category: "Renforcement",
    level: "Intermédiaire",
    coverImage: UNSPLASH("1553830979-7d3016b1b35f"),
    youtubeEmbedId: "j3l_RM5QVaA",
    duration: 10,
    calories: 45,
    description:
      "Les fléchisseurs de hanche propulsent la jambe vers l'avant à chaque foulée. Insuffisamment renforcés, ils deviennent vite une source de douleur. Cet exercice les renforce tout en améliorant la longueur de foulée.",
    instructions: [
      "En position de fente basse, genou arrière au sol",
      "Maintenez la position 30 secondes pour étirer le fléchisseur",
      "Passez en résistance : soulevez le genou avant 15 fois contre la main",
      "Ajoutez des rotations du buste vers le genou levé",
      "3 séries par côté",
    ],
    benefits: [
      "Améliore la longueur et la vitesse de foulée",
      "Prévient les douleurs inguinales",
      "Réduit la fatigue dans les côtes",
    ],
    musclesTargeted: ["Ilio-psoas", "Rectus femoris", "Abdos (stabilisation)"],
    tags: ["renforcement", "hanche", "foulée", "côtes"],
  },

  // ─── RÉCUPÉRATION ────────────────────────────────────────────────────
  {
    id: "run-recovery-stretch",
    title: "Étirements post-course complets",
    category: "Récupération",
    level: "Débutant",
    coverImage: UNSPLASH("1607962837359-5e5d5ea8f5c6"),
    youtubeEmbedId: "qULTwQuOuT8",
    duration: 12,
    calories: 25,
    description:
      "Une routine d'étirements complète post-course accélère la récupération, réduit les courbatures et maintient l'amplitude articulaire. À effectuer dans les 10-15 minutes suivant la fin de votre course.",
    instructions: [
      "Quadriceps debout : tirez le pied vers la fesse, 30s par jambe",
      "Ischio-jambiers assis : jambe tendue, penchez le buste, 30s par jambe",
      "Mollets : talon contre un mur, jambe tendue derrière, 30s par jambe",
      "Fléchisseurs de hanche : fente basse statique, 30s par côté",
      "Piriforme : croisez une cheville sur le genou opposé, tirez, 30s par côté",
    ],
    benefits: [
      "Réduit les courbatures et l'inflammation",
      "Maintient la souplesse et l'amplitude articulaire",
      "Accélère la récupération musculaire",
    ],
    musclesTargeted: ["Quadriceps", "Ischio-jambiers", "Mollets", "Fléchisseurs de hanche"],
    tags: ["récupération", "étirements", "post-course", "souplesse"],
  },
  {
    id: "run-recovery-foam",
    title: "Foam rolling pour coureurs",
    category: "Récupération",
    level: "Débutant",
    coverImage: UNSPLASH("1518611012228-43782890b0be"),
    youtubeEmbedId: "X7vxBvRBF6k",
    duration: 15,
    calories: 30,
    description:
      "Le foam rolling (auto-massage au rouleau de mousse) dénoue les tensions musculaires, améliore la circulation et accélère la récupération. Idéal les jours de repos et après les longues courses.",
    instructions: [
      "IT band (bandelette) : couché sur le côté, roulez de la hanche au genou, 60s par côté",
      "Mollets : posez les mollets sur le rouleau et soulevez les hanches, 60s",
      "Quadriceps : sur le ventre, roulez de la hanche au genou, 60s par jambe",
      "Bas du dos : sous les lombaires, genoux fléchis, roulez doucement",
      "Fessiers : assis sur le rouleau, croisez une cheville et roulez le fessier, 60s",
    ],
    benefits: [
      "Dénoue les tensions et les nœuds musculaires",
      "Améliore la circulation sanguine et lymphatique",
      "Réduit les douleurs et la raideur post-effort",
    ],
    musclesTargeted: ["IT Band", "Mollets", "Quadriceps", "Fessiers", "Lombaires"],
    tags: ["récupération", "foam-rolling", "automassage", "repos"],
  },

  // ─── MOBILITÉ ────────────────────────────────────────────────────────
  {
    id: "run-mobility-hip",
    title: "Mobilité de hanche 360°",
    category: "Mobilité",
    level: "Débutant",
    coverImage: UNSPLASH("1535914254981-b5012eebbd37"),
    youtubeEmbedId: "5UCkrWGBFws",
    duration: 8,
    calories: 22,
    description:
      "La mobilité de hanche est déterminante pour la qualité de la foulée et la prévention des blessures lombaires et du genou. Cet exercice travaille la hanche dans tous les plans de l'espace.",
    instructions: [
      "Cercles de hanche : mains sur les hanches, faites de grands cercles 10 fois dans chaque sens",
      "Rotations externes : assis en tailleur, poussez les genoux vers le sol avec les coudes",
      "Ouverture de hanche en lunge : fente avant, coude homolatéral touche le sol, 5 par côté",
      "Squat profond tenu : maintenez le squat profond 30 secondes, dos droit",
      "Répétez le circuit 2 fois",
    ],
    benefits: [
      "Améliore l'amplitude de la foulée",
      "Prévient les douleurs lombaires et genoux",
      "Libère les tensions accumulées en courant",
    ],
    musclesTargeted: ["Fléchisseurs de hanche", "Piriforme", "Adducteurs", "Fessiers"],
    tags: ["mobilité", "hanche", "amplitude", "foulée"],
  },
  {
    id: "run-mobility-ankle",
    title: "Mobilité de cheville pour la propulsion",
    category: "Mobilité",
    level: "Débutant",
    coverImage: UNSPLASH("1486218119243-13301bc8eb88"),
    youtubeEmbedId: "YvYYjQk1DxA",
    duration: 6,
    calories: 15,
    description:
      "Une cheville mobile est essentielle pour absorber les impacts en course et maximiser la propulsion. La raideur de cheville est souvent en cause dans les tendinites d'Achille et les périostites.",
    instructions: [
      "Cercles de cheville assis : faites des grands cercles dans les deux sens, 15 fois",
      "Dorsiflexion genou au mur : pied 10 cm du mur, fléchissez le genou sans décoller le talon",
      "Flexion-extension dynamique sur le sol : 20 répétitions par pied",
      "Marche sur les talons 30 secondes puis sur les pointes 30 secondes",
      "2 séries du circuit complet",
    ],
    benefits: [
      "Améliore la dorsiflexion et la propulsion",
      "Prévient les tendinites d'Achille et périostites",
      "Absorbe mieux les impacts en course",
    ],
    musclesTargeted: ["Mollets", "Tibial antérieur", "Péroniers", "Tendon d'Achille"],
    tags: ["mobilité", "cheville", "propulsion", "prévention"],
  },
];
