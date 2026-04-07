-- Maya Fitness — Seed data
-- Run AFTER 001_create_tables.sql

-- ─── EXERCISES — RUNNER ───────────────────────────────────────────────────────
INSERT INTO public.exercises (title, module, youtube_url, image, muscles, difficulty, category, description, duration_min, calories, instructions, benefits, tags) VALUES
('Échauffement Running 10 min', 'runner', 'https://www.youtube.com/watch?v=5P6UE0cDpW8', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=500&fit=crop', '["jambes","hanches","chevilles"]', 'Débutant', 'Échauffement', 'Préparez votre corps pour la course avec ce programme d''échauffement complet.', 10, 60,
'["Marche rapide 2 min","Montées de genoux 1 min","Talons-fesses 1 min","Fentes dynamiques 2 min","Rotations hanches 1 min","Pas chassés latéraux 1 min","Accélération progressive 2 min"]',
'["Réduit les risques de blessure","Améliore les performances","Prépare les articulations"]',
'["échauffement","running","préparation"]'),

('Renforcement Coureur — Abdos & Gainage', 'runner', 'https://www.youtube.com/watch?v=3_GFHP_RPTE', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=500&fit=crop', '["abdominaux","lombaires","gainage"]', 'Intermédiaire', 'Renforcement', 'Circuit de renforcement spécifique running pour améliorer votre stabilité.', 20, 150,
'["Planche 45 sec × 3","Relevés de jambes 15 reps × 3","Superman 12 reps × 3","Pont fessier 15 reps × 3","Crunchs obliques 20 reps × 3","Gainage latéral 30 sec × 2 côtés"]',
'["Améliore la posture de course","Réduit les douleurs lombaires","Renforce le core"]',
'["renforcement","core","running"]'),

('Mobilité Post-Course', 'runner', 'https://www.youtube.com/watch?v=sTxC3J3gQEU', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', '["ischio-jambiers","quadriceps","mollets","hanches"]', 'Débutant', 'Récupération', 'Étirements essentiels après votre course pour une bonne récupération.', 15, 50,
'["Étirement quadriceps debout 30 sec × 2","Étirement ischio-jambiers assis 45 sec × 2","Étirement mollet au mur 30 sec × 2","Fente basse hip flexor 45 sec × 2","Pigeon yoga 1 min × 2","Torsion dorsale allongé 30 sec × 2"]',
'["Réduction des courbatures","Meilleure flexibilité","Récupération optimisée"]',
'["récupération","mobilité","étirements"]'),

('Fartlek — Course Interval', 'runner', 'https://www.youtube.com/watch?v=8qMNaSb0e00', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=500&fit=crop', '["jambes","cardiovasculaire"]', 'Intermédiaire', 'Exercices techniques', 'Entraînement par intervalles pour améliorer votre VMA et votre endurance.', 30, 320,
'["Échauffement 5 min allure lente","Sprint 30 sec maximum","Jogging récup 90 sec","Répéter 8 fois","Retour au calme 5 min"]',
'["Améliore la VMA","Brûle plus de calories","Renforce le système cardiovasculaire"]',
'["fartlek","intervalles","vitesse"]'),

('Étirements Techniques de Course', 'runner', 'https://www.youtube.com/watch?v=4D0p1pYqDzQ', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop', '["mollets","quadriceps","ischio-jambiers","iliopsoas"]', 'Débutant', 'Mobilité', 'Programme de mobilité articulaire pour améliorer votre foulée.', 12, 40,
'["Rotation chevilles 30 sec","Étirement mollet contre mur 45 sec","Fente avant dynamique 10 reps","Balancement jambe avant-arrière 15 reps","Cercles hanches 20 reps","March on spot haute montée genou 2 min"]',
'["Meilleure amplitude de foulée","Prévention des blessures","Souplesse articulaire"]',
'["mobilité","technique","foulée"]');

-- ─── EXERCISES — WORKOUT ──────────────────────────────────────────────────────
INSERT INTO public.exercises (title, module, youtube_url, image, muscles, difficulty, category, description, duration_min, calories, instructions, benefits, tags) VALUES
('Développé couché haltères', 'workout', 'https://www.youtube.com/watch?v=VmB1G1K7v94', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop', '["pectoraux","triceps","épaules"]', 'Intermédiaire', 'Pectoraux', 'L''exercice roi pour développer la masse pectorale.', 25, 200,
'["Allongez-vous sur le banc, pieds à plat au sol","Saisissez les haltères au niveau des épaules","Poussez vers le haut en expirant","Redescendez lentement en 3 secondes","4 séries de 10-12 reps, repos 90 sec"]',
'["Développement pectoral complet","Renforcement triceps","Amélioration stabilité épaules"]',
'["pectoraux","développé","haltères"]'),

('Tractions Prise Large', 'workout', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=500&fit=crop', '["dos","biceps","trapèzes"]', 'Avancé', 'Dos', 'L''exercice fondamental pour un dos large et musclé.', 20, 180,
'["Saisissez la barre en pronation, largeur d''épaules + 20cm","Partez bras tendus, corps suspendu","Tirez en amenant le menton au-dessus de la barre","Redescendez lentement et contrôlé","4 séries max de reps, repos 2 min"]',
'["Élargit les dorsaux","Développe les biceps","Améliore la posture"]',
'["tractions","dos","poids du corps"]'),

('Squat Barre', 'workout', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=500&fit=crop', '["quadriceps","fessiers","ischio-jambiers","lombaires"]', 'Intermédiaire', 'Jambes', 'Le roi des exercices polyarticulaires pour des jambes puissantes.', 30, 280,
'["Barre sur le haut du dos, pieds largeur épaules","Descendez en gardant le dos droit","Cuisses parallèles au sol minimum","Poussez dans les talons pour remonter","5 séries de 8 reps, repos 2-3 min"]',
'["Développement massa musculaire","Renforce les articulations","Brûle un maximum de calories"]',
'["squat","jambes","polyarticulaire"]'),

('Curl Biceps Haltères', 'workout', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=500&fit=crop', '["biceps","avant-bras"]', 'Débutant', 'Bras', 'Isolation parfaite pour des biceps bien dessinés.', 15, 120,
'["Debout, haltères en main, paumes vers l''avant","Fléchissez les coudes sans bouger les épaules","Contractez les biceps en haut du mouvement","Redescendez lentement en 3 secondes","3-4 séries de 12-15 reps, repos 60 sec"]',
'["Isolation biceps","Améliore la pointe du biceps","Renforce les avant-bras"]',
'["biceps","curl","isolation"]'),

('Développé Militaire Haltères', 'workout', 'https://www.youtube.com/watch?v=qEwKCR5JCog', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=500&fit=crop', '["épaules","triceps","trapèzes"]', 'Intermédiaire', 'Épaules', 'Pour des épaules larges et équilibrées.', 20, 160,
'["Assis sur banc, haltères à hauteur des épaules","Poussez vers le haut sans verrouiller les coudes","Contrôlez la descente sur 3 secondes","Gardez les abdos gainés","4 séries de 10-12 reps, repos 90 sec"]',
'["Développe les deltoïdes","Renforce les triceps","Améliore la silhouette"]',
'["épaules","militaire","haltères"]'),

('Crunch Abdominaux', 'workout', 'https://www.youtube.com/watch?v=MKmrqcoCZ-M', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop', '["abdominaux","obliques"]', 'Débutant', 'Abdos', 'Base incontournable pour renforcer la sangle abdominale.', 15, 80,
'["Allongé sur le dos, genoux fléchis","Mains derrière les oreilles","Montez les épaules en expirant","Ne tirez pas sur le cou","4 séries de 20 reps, repos 45 sec"]',
'["Renforce le core","Améliore la posture","Protège les lombaires"]',
'["abdos","crunch","core"]'),

('Hip Thrust Fessiers', 'workout', 'https://www.youtube.com/watch?v=SEdqd1n0cvg', 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&h=500&fit=crop', '["fessiers","ischio-jambiers"]', 'Intermédiaire', 'Fessiers', 'L''exercice numéro 1 pour sculpter les fessiers.', 20, 150,
'["Épaules sur banc, barre sur les hanches","Pieds à plat, largeur des hanches","Poussez les hanches vers le plafond","Contractez les fessiers en haut","4 séries de 15 reps, repos 90 sec"]',
'["Activation maximale des fessiers","Renforce les ischio-jambiers","Améliore la puissance athlétique"]',
'["fessiers","hip thrust","sculpting"]');

-- ─── EXERCISES — YOGA & PILATES ───────────────────────────────────────────────
INSERT INTO public.exercises (title, module, youtube_url, image, muscles, difficulty, category, description, duration_min, calories, instructions, benefits, tags) VALUES
('Salutation au Soleil — Suite A', 'yoga', 'https://www.youtube.com/watch?v=73sjOu0g58M', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop', '["ensemble du corps","dos","épaules","hanches"]', 'Débutant', 'Yoga', 'La séquence fondamentale du yoga pour éveiller le corps et l''esprit.', 20, 100,
'["Tadasana — debout, pieds joints, mains en prière","Urdhva Hastasana — bras levés, légère extension","Uttanasana — flexion avant, mains au sol","Ardha Uttanasana — dos plat, regard devant","Planche — corps aligné","Chaturanga — descente contrôlée","Cobra — ouverture de la poitrine","Chien tête en bas — 5 respirations","Retour en avant puis lever en Tadasana"]',
'["Éveille le corps","Améliore la flexibilité","Renforce progressivement"]',
'["salutation","soleil","débutant","yoga"]'),

('Pilates — Renforcement Core', 'yoga', 'https://www.youtube.com/watch?v=K3lil9gNB-c', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=500&fit=crop', '["abdominaux","lombaires","stabilisateurs"]', 'Intermédiaire', 'Pilates', 'Circuit Pilates complet pour renforcer en profondeur le centre du corps.', 30, 120,
'["The Hundred — 100 pompes bras","Roll Up — déroll vertébral lent","Leg Circles — cercles de jambes","Rolling Like a Ball","Single Leg Stretch","Double Leg Stretch","Scissors","Criss-Cross"]',
'["Renforcement profond du core","Améliore l''alignement","Développe le contrôle corporel"]',
'["pilates","core","renforcement"]'),

('Méditation Guidée — Pleine Conscience', 'yoga', 'https://www.youtube.com/watch?v=inpok4MKVLM', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', '["mental","respiration"]', 'Débutant', 'Méditation', 'Séance de méditation pour réduire le stress et améliorer la concentration.', 15, 30,
'["Asseyez-vous confortablement, dos droit","Fermez les yeux, relâchez les épaules","Concentrez-vous sur votre respiration","Inspirez profondément par le nez (4 temps)","Retenez 2 temps","Expirez lentement par la bouche (6 temps)","Observez les pensées sans les juger","Terminez par 3 grandes inspirations"]',
'["Réduit le stress et l''anxiété","Améliore la concentration","Favorise le sommeil"]',
'["méditation","pleine conscience","relaxation"]'),

('Stretching Complet Corps', 'yoga', 'https://www.youtube.com/watch?v=g_tea8ZNk5A', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', '["ensemble du corps","hanches","épaules","dos"]', 'Débutant', 'Stretching', 'Programme d''étirements global pour améliorer votre souplesse générale.', 25, 70,
'["Cou — rotations douces 30 sec","Épaules — étirement croisé 45 sec × 2","Triceps derrière la tête 30 sec × 2","Flexion avant debout 60 sec","Fente basse hip flexor 45 sec × 2","Pigeon yoga 90 sec × 2","Torsion assise 45 sec × 2","Enfant (Balasana) 60 sec"]',
'["Améliore la souplesse globale","Libère les tensions","Meilleure récupération"]',
'["stretching","souplesse","récupération"]'),

('Barre — Équilibre et Sculpture', 'yoga', 'https://www.youtube.com/watch?v=35cGKS5e3Yg', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&h=500&fit=crop', '["fessiers","cuisses","mollets","abdos"]', 'Intermédiaire', 'Barre', 'Séance barre inspirée de la danse pour tonifier et allonger la silhouette.', 45, 200,
'["Warm-up au niveau de la barre — relevés sur pointes","Pliés 1ère et 2ème position — 20 reps","Battements devant et derrière — 15 reps","Ronds de jambe en dehors et dedans — 20 reps","Grand battement — 10 reps","Port de bras — 8 reps lents","Arabesques — 10 reps × 2 côtés","Cool-down étirements au sol"]',
'["Tonifie sans bulker","Améliore le port","Allonge la silhouette"]',
'["barre","danse","sculpture","équilibre"]');

-- ─── RECIPES ──────────────────────────────────────────────────────────────────
INSERT INTO public.recipes (title, description, image, youtube_url, calories, protein, carbs, fat, prep_time_min, cook_time_min, servings, category, diet, ingredients, steps, tags) VALUES
('Bowl Protéiné Poulet & Quinoa', 'Un repas complet riche en protéines, parfait pour la récupération post-entraînement.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=kVJBtHXxBDo', 520, 42, 55, 12, 15, 20, 2, 'Déjeuner', 'normal',
'[{"name":"Blanc de poulet","amount":"200","unit":"g"},{"name":"Quinoa cuit","amount":"150","unit":"g"},{"name":"Avocats","amount":"1","unit":"pièce"},{"name":"Tomates cerises","amount":"100","unit":"g"},{"name":"Roquette","amount":"50","unit":"g"},{"name":"Citron","amount":"1","unit":"pièce"},{"name":"Huile d''olive","amount":"1","unit":"c.à.s"},{"name":"Sel, poivre","amount":"","unit":""}]',
'["Cuire le quinoa selon les instructions","Griller le poulet assaisonné 6-7 min par côté","Couper l''avocat en tranches","Assembler le bowl : quinoa, poulet tranché, avocat, tomates, roquette","Assaisonner avec citron, huile d''olive, sel et poivre"]',
'["protéines","quinoa","bowl","récupération"]'),

('Pancakes Protéinés Avoine', 'Des pancakes moelleux et nutritifs, idéaux pour un petit-déjeuner sportif.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=7TbW3ZhFO1E', 380, 28, 48, 8, 10, 10, 2, 'Petit-déjeuner', 'végétarien',
'[{"name":"Flocons d''avoine","amount":"100","unit":"g"},{"name":"Fromage blanc 0%","amount":"150","unit":"g"},{"name":"Œufs","amount":"2","unit":"pièces"},{"name":"Banane mûre","amount":"1","unit":"pièce"},{"name":"Extrait de vanille","amount":"1","unit":"c.à.c"},{"name":"Levure chimique","amount":"1","unit":"c.à.c"},{"name":"Myrtilles","amount":"100","unit":"g"}]',
'["Mixer les flocons d''avoine en farine fine","Mélanger tous les ingrédients sauf les myrtilles","Chauffer une poêle antiadhésive légèrement huilée","Verser des petits cercles de pâte","Ajouter quelques myrtilles sur le dessus","Cuire 2-3 min par côté jusqu''à dorure","Servir avec miel ou sirop d''érable"]',
'["petit-déjeuner","protéines","avoine","pancakes"]'),

('Saumon Teriyaki & Légumes Vapeur', 'Un dîner équilibré savoureux, riche en oméga-3 et en vitamines.', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=wJNRXcxAC9E', 440, 38, 32, 18, 10, 20, 2, 'Dîner', 'sans-gluten',
'[{"name":"Pavé de saumon","amount":"200","unit":"g"},{"name":"Sauce soja","amount":"3","unit":"c.à.s"},{"name":"Miel","amount":"1","unit":"c.à.s"},{"name":"Ail","amount":"2","unit":"gousses"},{"name":"Gingembre râpé","amount":"1","unit":"c.à.c"},{"name":"Brocolis","amount":"200","unit":"g"},{"name":"Carottes","amount":"150","unit":"g"},{"name":"Riz jasmin","amount":"120","unit":"g"}]',
'["Préparer la marinade : soja, miel, ail, gingembre","Mariner le saumon 30 min au frais","Cuire le riz selon les instructions","Cuire les légumes à la vapeur 8-10 min","Saisir le saumon mariné 3-4 min par côté","Napper avec le reste de marinade réduite","Servir avec le riz et les légumes"]',
'["dîner","saumon","oméga-3","équilibré"]'),

('Green Smoothie Énergie', 'Le smoothie vert idéal pour faire le plein d''énergie et de nutriments avant l''entraînement.', 'https://images.unsplash.com/photo-1612540139306-e3a2b4f46cf3?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=jjKBfIcpFwA', 220, 15, 35, 4, 5, 0, 1, 'Petit-déjeuner', 'vegan',
'[{"name":"Épinards frais","amount":"100","unit":"g"},{"name":"Banane congelée","amount":"1","unit":"pièce"},{"name":"Protéine végétale vanille","amount":"30","unit":"g"},{"name":"Lait d''amande","amount":"250","unit":"ml"},{"name":"Gingembre","amount":"1","unit":"c.à.c"},{"name":"Citron vert","amount":"0.5","unit":"pièce"},{"name":"Graines de chia","amount":"1","unit":"c.à.s"}]',
'["Mettre tous les ingrédients dans le blender","Mixer à puissance maximale 45 secondes","Goûter et ajuster sucre/citron","Verser dans un grand verre","Saupoudrer de graines de chia","Consommer immédiatement pour bénéficier des nutriments"]',
'["smoothie","vegan","pré-entraînement","énergie"]'),

('Bol Açaï Super-Food', 'Un bol gourmand et ultra-nutritif, idéal pour la récupération ou un petit-déjeuner premium.', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=6x3MnLH4i6A', 350, 8, 58, 10, 10, 0, 1, 'Petit-déjeuner', 'vegan',
'[{"name":"Purée d''açaï surgelée","amount":"100","unit":"g"},{"name":"Banane","amount":"1","unit":"pièce"},{"name":"Lait de coco","amount":"100","unit":"ml"},{"name":"Granola","amount":"50","unit":"g"},{"name":"Fruits rouges","amount":"100","unit":"g"},{"name":"Kiwi","amount":"1","unit":"pièce"},{"name":"Noix de coco râpée","amount":"2","unit":"c.à.s"},{"name":"Miel","amount":"1","unit":"c.à.s"}]',
'["Mixer l''açaï avec la banane et le lait de coco","La texture doit être épaisse comme une glace","Verser dans un bol froid","Disposer le granola, les fruits rouges, le kiwi en tranches","Parsemer de noix de coco et drizzler de miel","Servir immédiatement"]',
'["açaï","superfood","vegan","bowl"]'),

('Curry de Lentilles Corail', 'Un plat végétarien savoureux, riche en protéines végétales et en fer.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop', 'https://www.youtube.com/watch?v=0kMpDTfJZpI', 420, 22, 65, 8, 15, 25, 3, 'Dîner', 'vegan',
'[{"name":"Lentilles corail","amount":"200","unit":"g"},{"name":"Lait de coco","amount":"400","unit":"ml"},{"name":"Tomates concassées","amount":"400","unit":"g"},{"name":"Oignon","amount":"1","unit":"pièce"},{"name":"Ail","amount":"3","unit":"gousses"},{"name":"Gingembre frais","amount":"2","unit":"cm"},{"name":"Curry en poudre","amount":"2","unit":"c.à.s"},{"name":"Curcuma","amount":"1","unit":"c.à.c"},{"name":"Riz basmati","amount":"150","unit":"g"}]',
'["Faire revenir oignon, ail, gingembre 5 min","Ajouter les épices et torréfier 1 min","Incorporer les tomates et cuire 5 min","Ajouter lentilles rincées et lait de coco","Cuire à feu doux 25 min en remuant","Cuire le riz en parallèle","Assaisonner, servir avec le riz et une noisette de beurre de coco"]',
'["végétarien","curry","lentilles","protéines végétales"]'),

('Wrap Prise de Masse', 'Un wrap hyper-calorique et protéiné pour les objectifs de prise de masse.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=500&fit=crop', null, 680, 48, 72, 18, 10, 10, 1, 'Déjeuner', 'normal',
'[{"name":"Grande tortilla blé complet","amount":"1","unit":"pièce"},{"name":"Poulet grillé","amount":"180","unit":"g"},{"name":"Riz cuit","amount":"100","unit":"g"},{"name":"Haricots noirs","amount":"80","unit":"g"},{"name":"Avocat","amount":"0.5","unit":"pièce"},{"name":"Maïs","amount":"50","unit":"g"},{"name":"Fromage râpé","amount":"30","unit":"g"},{"name":"Sauce yaourt-épices","amount":"2","unit":"c.à.s"}]',
'["Réchauffer légèrement la tortilla","Mélanger riz et haricots assaisonnés","Disposer le riz au centre de la tortilla","Ajouter le poulet tranché, l''avocat, le maïs","Parsemer de fromage","Napper de sauce","Rouler fermement en serrant bien","Couper en diagonale et servir"]',
'["prise de masse","wrap","protéines","calories"]');
