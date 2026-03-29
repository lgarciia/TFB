(function () {
  const STORAGE_KEY = "tfb-programs-store-v1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function readStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function writeStore(store) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function createExercise(name, reps, sets, notes) {
    return {
      id: `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`,
      name: name || "Nouvel exercice",
      reps: reps || "10-12",
      sets: sets || "3",
      notes: notes || "Execution propre"
    };
  }

  function createSession(label, focus, tonnage, notes, exercises) {
    return {
      id: `${slugify(label)}-${Math.random().toString(36).slice(2, 8)}`,
      label: label || "Nouvelle seance",
      focus: focus || "",
      tonnage: tonnage || "",
      notes: notes || "",
      exercises: exercises || [createExercise()]
    };
  }

  function createFood(name, quantity, kcal, proteins, lipids, glucides, fibers) {
    return {
      id: `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`,
      name: name || "Nouvel aliment",
      quantity: quantity || "100 g",
      kcal: Number(kcal) || 0,
      proteins: Number(proteins) || 0,
      lipids: Number(lipids) || 0,
      glucides: Number(glucides) || 0,
      fibers: Number(fibers) || 0
    };
  }

  function createMeal(label, title, items) {
    return {
      id: `${slugify(label)}-${Math.random().toString(36).slice(2, 8)}`,
      label: label || "R1",
      title: title || "Repas",
      items: items || [createFood()]
    };
  }

  function createDayType(label, focus, targetCalories, notes, meals) {
    return {
      id: slugify(label),
      label: label || "ON 1",
      focus: focus || "",
      targetCalories: targetCalories || "",
      notes: notes || "",
      meals: meals || [createMeal()]
    };
  }

  function getProfileKey(objective) {
    switch (objective) {
      case "Perte de poids":
        return "loss";
      case "Prise de masse":
        return "mass";
      case "Performance sportive":
        return "performance";
      case "Recomposition corporelle":
        return "recomp";
      default:
        return "shape";
    }
  }

  function getProfileTexts(key) {
    const profiles = {
      loss: {
        trainingTitle: "Bloc silhouette active",
        cycle: "4 semaines",
        frequency: "3 seances / semaine",
        focus: "Depense, renforcement global et adherence",
        progression: "Monter de 1 a 2 reps avant d'augmenter la charge.",
        warmup: "6 minutes cardio + mobilisation epaules et hanches.",
        coachNote: "RPE 7 a 8, execution stable et simple a reproduire.",
        strategy: "Deficit modere, repas simples et bonne regularite.",
        hydration: "2.5 a 3 L / jour"
      },
      mass: {
        trainingTitle: "Bloc hypertrophie prioritaire",
        cycle: "5 semaines",
        frequency: "4 seances / semaine",
        focus: "Volume utile, surcharge progressive et recuperation",
        progression: "Valider le haut de fourchette puis ajouter 2.5 % de charge.",
        warmup: "Activation dorsale, hanches et series de montee progressive.",
        coachNote: "Garder 1 a 2 reps en reserve sur les mouvements guides.",
        strategy: "Surplus controle avec glucides hauts autour des seances.",
        hydration: "3.2 a 3.8 L / jour"
      },
      performance: {
        trainingTitle: "Bloc performance hybride",
        cycle: "4 semaines",
        frequency: "5 seances / semaine",
        focus: "Puissance, qualite motrice et recuperation",
        progression: "Monter la charge seulement si la vitesse reste stable.",
        warmup: "Mobilite dynamique, activation centrale et montees progressives.",
        coachNote: "Priorite a la vitesse d'execution sur les mouvements cles.",
        strategy: "Apports structures autour des seances et repere fort sur la recuperation.",
        hydration: "3.3 a 4 L / jour"
      },
      recomp: {
        trainingTitle: "Bloc recomposition tonique",
        cycle: "4 semaines",
        frequency: "4 seances / semaine",
        focus: "Densite musculaire, technique et depense utile",
        progression: "Chercher d'abord la regularite puis monter un peu la charge.",
        warmup: "5 minutes cardio + mobilisation thoracique et hanches.",
        coachNote: "Temps de repos moderes, execution stricte.",
        strategy: "Calories proches de la maintenance avec timing glucidique autour du training.",
        hydration: "2.7 a 3.2 L / jour"
      },
      shape: {
        trainingTitle: "Bloc remise en route",
        cycle: "4 semaines",
        frequency: "3 seances / semaine",
        focus: "Technique, confiance et regularite",
        progression: "Ajouter un peu de charge une fois la fourchette haute stable.",
        warmup: "Cardio doux 5 minutes + mobilisation generale.",
        coachNote: "Toujours garder une execution facile a reproduire.",
        strategy: "Plan simple, digeste et facile a tenir toute la semaine.",
        hydration: "2.3 a 2.8 L / jour"
      }
    };

    return profiles[key] || profiles.shape;
  }

  function buildSessions(key) {
    const sessionSets = {
      loss: [
        createSession("ON - S1", "Haut du corps + cardio", "4200", "Tempo controle et peu de temps mort.", [
          createExercise("Butterfly", "18-22", "2", "Mise en route"),
          createExercise("Chest press", "8-12", "3", "Progressif"),
          createExercise("Tirage vertical prise large", "8-12", "3", "Poitrine sortie"),
          createExercise("Tirage incline unilaterale", "10-14", "3", "Amplitude complete"),
          createExercise("Pull over corde", "14-20", "3", "Souffler fort")
        ]),
        createSession("ON - S2", "Bas du corps + gainage", "4600", "Accent sur la qualite du mouvement.", [
          createExercise("Presse a cuisses", "10-14", "4", "Controle en bas"),
          createExercise("Hip thrust", "8-12", "4", "Pause en haut"),
          createExercise("Leg curl assis", "12-15", "3", "Sans a-coups"),
          createExercise("Fentes guidees", "10-12 / jambe", "3", "Stable"),
          createExercise("Planche + respiration", "40 sec", "3", "Ventilation calme")
        ]),
        createSession("ON - S3", "Full body metabolique", "3800", "Circuit propre, rythme soutenu.", [
          createExercise("Rowing poulie basse", "12-15", "3", "Buste fixe"),
          createExercise("Goblet squat", "12-15", "3", "Descente controlee"),
          createExercise("Developpe incline machine", "10-12", "3", "RPE 8"),
          createExercise("Farmer carry", "30 m", "3", "Gainage fort"),
          createExercise("Bike erg", "8 min", "1", "Cadence reguliere")
        ])
      ],
      mass: [
        createSession("ON - S1", "Pecs / Dos", "5600", "Volume principal du bloc.", [
          createExercise("Butterfly", "20", "2", "Mise en route"),
          createExercise("Chest press", "8-12", "3", "Charge montante"),
          createExercise("Ecarte poulie assis", "14-18", "3", "Contraction forte"),
          createExercise("Tirage vertical prise large", "8-12", "3", "Poitrine sortie"),
          createExercise("Tirage incline uni", "10-14", "3", "Coude guide"),
          createExercise("Pull over corde", "14-20", "3", "Amplitude continue")
        ]),
        createSession("ON - S2", "Jambes", "6200", "Rester explosif a la montee.", [
          createExercise("Hack squat", "8-10", "4", "Profondeur stable"),
          createExercise("Presse a cuisses", "12-15", "4", "Sans verrouiller"),
          createExercise("Leg extension", "14-18", "3", "Pause haute"),
          createExercise("Leg curl allonge", "10-12", "4", "Controle"),
          createExercise("Mollets debout", "12-20", "4", "Pause etirement")
        ]),
        createSession("ON - S3", "Epaules / Bras", "4100", "Pump et densite.", [
          createExercise("Developpe militaire guide", "8-10", "4", "RPE 8"),
          createExercise("Elevations laterales", "14-20", "4", "Tension continue"),
          createExercise("Curl pupitre", "10-12", "3", "Controle"),
          createExercise("Extension triceps corde", "12-15", "3", "Finir tendu"),
          createExercise("Curl marteau", "10-14", "3", "Alternance")
        ]),
        createSession("ON - S4", "Dos / Rappels", "4700", "Accent sur l'epaisseur du dos.", [
          createExercise("Rowing machine convergente", "8-12", "4", "Buste fixe"),
          createExercise("Tractions assistees", "8-10", "3", "Controle"),
          createExercise("Pulldown neutre", "10-12", "3", "Gainage"),
          createExercise("Face pull", "14-18", "3", "Haut du dos"),
          createExercise("Shrug halteres", "12-15", "3", "Pause haute")
        ])
      ],
      performance: [
        createSession("ON - S1", "Force bas du corps", "6400", "Repos longs sur les series lourdes.", [
          createExercise("Squat securise", "5-6", "5", "Vitesse stable"),
          createExercise("Souleve de terre roumain", "6-8", "4", "Hanches en arriere"),
          createExercise("Fentes marchees", "10 / jambe", "3", "Controle"),
          createExercise("Leg curl", "8-10", "3", "Explosif"),
          createExercise("Sled push", "20 m", "4", "Drive regulier")
        ]),
        createSession("ON - S2", "Haut du corps puissance", "5200", "Coordination et transfert.", [
          createExercise("Developpe incline halteres", "6-8", "4", "Montee vive"),
          createExercise("Tractions lestees", "5-6", "4", "Amplitude propre"),
          createExercise("Landmine press", "8-10", "3", "Gainage"),
          createExercise("Rowing poitrine appuyee", "8-10", "3", "Tempo 2-0-1"),
          createExercise("Med ball slam", "8", "4", "Explosif")
        ]),
        createSession("ON - S3", "Conditioning", "3600", "Bloc cardio nerveux mais propre.", [
          createExercise("Bike sprint", "20 sec", "6", "Recup 70 sec"),
          createExercise("Farmer carry", "30 m", "4", "Posture"),
          createExercise("Box step up", "12 / jambe", "3", "Stable"),
          createExercise("Battle rope", "30 sec", "5", "Cadence"),
          createExercise("Gainage lateral", "40 sec", "3", "Respiration")
        ]),
        createSession("ON - S4", "Full body technique", "4100", "Volume plus bas, execution premium.", [
          createExercise("Trap bar deadlift", "4-6", "4", "Dynamique"),
          createExercise("Pec deck", "12-15", "3", "Contraction"),
          createExercise("Rowing cable", "10-12", "3", "Sans elancer"),
          createExercise("Bulgarian split squat", "8 / jambe", "3", "Controle"),
          createExercise("Face pull", "15-20", "3", "Haut du dos")
        ])
      ],
      recomp: [
        createSession("ON - S1", "Push", "4700", "Accent sur la qualite de la congestion.", [
          createExercise("Developpe incline machine", "8-12", "4", "Rythme controle"),
          createExercise("Chest press convergente", "10-12", "3", "Finir proche de l'echec"),
          createExercise("Elevations laterales", "14-20", "4", "Tension constante"),
          createExercise("Extension triceps corde", "12-15", "3", "Controle"),
          createExercise("Gainage dynamique", "30 sec", "3", "Tonicite")
        ]),
        createSession("ON - S2", "Lower body", "5100", "Ligne et tonicite.", [
          createExercise("Hack squat", "10-12", "4", "Profondeur stable"),
          createExercise("Hip thrust", "10-12", "4", "Pause en haut"),
          createExercise("Leg curl assis", "12-15", "3", "Amplitude complete"),
          createExercise("Mollets assis", "15-20", "4", "Pause etirement"),
          createExercise("Ab wheel", "8-12", "3", "Gainage ferme")
        ]),
        createSession("ON - S3", "Pull", "4500", "Dos epais et posture.", [
          createExercise("Rowing poulie basse", "8-12", "4", "Buste fixe"),
          createExercise("Tirage vertical neutre", "10-12", "3", "Coude bas"),
          createExercise("Face pull", "14-18", "3", "Arriere d'epaule"),
          createExercise("Curl poulie", "10-14", "3", "Sans elan"),
          createExercise("Farmer hold", "30 sec", "3", "Gainage")
        ]),
        createSession("ON - S4", "Circuit cardio muscu", "3200", "Metabolique et propre.", [
          createExercise("Rameur", "400 m", "3", "Regulier"),
          createExercise("Kettlebell squat", "15", "3", "Controle"),
          createExercise("Pompes inclinees", "12-15", "3", "Amplitude"),
          createExercise("Tirage TRX", "12-15", "3", "Epaules basses"),
          createExercise("Bike", "6 min", "1", "Fin de seance")
        ])
      ],
      shape: [
        createSession("ON - S1", "Full body A", "3600", "Seance simple et rassurante.", [
          createExercise("Butterfly", "15-20", "2", "Mise en route"),
          createExercise("Chest press", "10-12", "3", "Controle"),
          createExercise("Tirage vertical", "10-12", "3", "Poitrine sortie"),
          createExercise("Presse a cuisses", "12-15", "3", "Amplitude confortable"),
          createExercise("Gainage", "30 sec", "3", "Respiration")
        ]),
        createSession("ON - S2", "Full body B", "3900", "Leger accent jambes et dos.", [
          createExercise("Goblet squat", "12-15", "3", "Controle"),
          createExercise("Rowing poulie", "10-12", "3", "Sans elan"),
          createExercise("Developpe incline machine", "10-12", "3", "RPE 7"),
          createExercise("Hip thrust", "12-15", "3", "Pause en haut"),
          createExercise("Bike", "8 min", "1", "Calme")
        ]),
        createSession("ON - S3", "Renforcement + cardio", "2800", "Seance fluide et simple.", [
          createExercise("Marche inclinee", "10 min", "1", "Cadence stable"),
          createExercise("Tirage TRX", "12-15", "3", "Epaule basse"),
          createExercise("Leg curl assis", "12-15", "3", "Controle"),
          createExercise("Developpe halteres assis", "10-12", "3", "Amplitude"),
          createExercise("Farmer carry", "20 m", "3", "Gainage")
        ])
      ]
    };

    return sessionSets[key] || sessionSets.shape;
  }

  function buildNutrition(key, clientName) {
    const nutritionSets = {
      loss: [
        createDayType("ON 1", "Jour d'entrainement principal", "2250", "Glucides un peu plus hauts autour de la seance.", [
          createMeal("R1", "Petit dejeuner", [createFood("Whey", "30 g", 120, 24, 2, 3, 0), createFood("Avoine", "60 g", 225, 8, 4, 37, 6), createFood("Framboises", "100 g", 38, 1, 1, 5, 7)]),
          createMeal("C1", "Collation", [createFood("Pomme", "150 g", 78, 0, 0, 18, 3), createFood("Amandes", "15 g", 94, 3, 8, 2, 2)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "150 g", 165, 35, 3, 0, 0), createFood("Riz blanc", "160 g", 210, 4, 1, 46, 1), createFood("Tomates", "150 g", 27, 1, 0, 5, 2)]),
          createMeal("R3", "Diner", [createFood("Saumon", "140 g", 280, 28, 18, 0, 0), createFood("Pommes de terre", "220 g", 185, 5, 0, 41, 4), createFood("Haricots verts", "150 g", 47, 3, 0, 5, 5)])
        ]),
        createDayType("OFF", "Jour de repos", "1950", "Priorite aux proteines et a la regularite.", [
          createMeal("R1", "Petit dejeuner", [createFood("Oeufs entiers", "3 unites", 210, 18, 15, 1, 0), createFood("Pain complet", "70 g", 170, 6, 2, 30, 5)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "150 g", 165, 35, 3, 0, 0), createFood("Quinoa", "120 g", 144, 5, 2, 25, 3), createFood("Brocolis", "180 g", 62, 5, 1, 8, 6)]),
          createMeal("R3", "Diner", [createFood("Fromage blanc", "200 g", 146, 16, 6, 8, 0), createFood("Noix", "20 g", 130, 3, 13, 2, 1), createFood("Fraises", "150 g", 48, 1, 0, 9, 3)])
        ])
      ],
      mass: [
        createDayType("ON 1", "Jour haut du corps", "3180", "Plan le plus charge du bloc.", [
          createMeal("R1", "Petit dejeuner", [createFood("Whey Yam Nutrition", "40 g", 156, 31, 2, 4, 0), createFood("Lait entier", "300 ml", 198, 10, 11, 14, 0), createFood("Avoine", "68 g", 256, 9, 5, 41, 6), createFood("Framboises", "100 g", 38, 1, 1, 5, 7)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "150 g", 165, 35, 3, 0, 0), createFood("Riz blanc", "220 g", 286, 5, 1, 62, 1), createFood("Huile d'olive", "15 g", 135, 0, 15, 0, 0)]),
          createMeal("Pre", "Pre-training", [createFood("Miel", "30 g", 91, 0, 0, 24, 0), createFood("Corn flakes", "78 g", 289, 5, 1, 66, 3), createFood("Whey", "10 g", 36, 9, 0, 0, 0)]),
          createMeal("Intra", "Intra", [createFood("Miel", "38 g", 116, 0, 0, 30, 0), createFood("Sel", "1 g", 0, 0, 0, 0, 0)]),
          createMeal("R3", "Diner", [createFood("Thon", "150 g", 174, 39, 2, 0, 0), createFood("Pates", "190 g", 315, 11, 2, 66, 3), createFood("Haricots verts", "150 g", 47, 3, 0, 5, 5)])
        ]),
        createDayType("OFF", "Jour de repos", "2860", "Calories legerement plus basses sans couper les proteines.", [
          createMeal("R1", "Petit dejeuner", [createFood("Skyr", "250 g", 150, 25, 0, 12, 0), createFood("Granola", "70 g", 310, 7, 9, 43, 5)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "200 g", 220, 46, 4, 0, 0), createFood("Quinoa cuit", "170 g", 204, 7, 3, 34, 4), createFood("Avocat", "80 g", 128, 2, 12, 4, 5)]),
          createMeal("R3", "Diner", [createFood("Cabillaud", "220 g", 187, 40, 2, 0, 0), createFood("Riz cuit", "170 g", 221, 4, 1, 49, 1), createFood("Brocolis", "180 g", 62, 5, 1, 8, 6)])
        ])
      ],
      performance: [
        createDayType("ON 1", "Jour intense", "3050", "Macros hauts sur les seances de force.", [
          createMeal("R1", "Petit dejeuner", [createFood("Cream of rice", "90 g", 324, 7, 1, 72, 1), createFood("Whey isolate", "35 g", 132, 28, 1, 2, 0), createFood("Banane", "120 g", 110, 1, 0, 27, 2)]),
          createMeal("R2", "Dejeuner", [createFood("Boeuf maigre", "180 g", 306, 37, 17, 0, 0), createFood("Riz basmati", "190 g", 247, 5, 1, 54, 1), createFood("Carottes", "160 g", 58, 1, 0, 12, 4)]),
          createMeal("Pre", "Pre-training", [createFood("Bagel nature", "1 unite", 245, 9, 2, 47, 2), createFood("Confiture", "25 g", 65, 0, 0, 16, 0)]),
          createMeal("Post", "Post-training", [createFood("Riz souffle", "80 g", 304, 6, 1, 66, 1), createFood("Whey isolate", "35 g", 132, 28, 1, 2, 0)]),
          createMeal("R3", "Diner", [createFood("Saumon", "180 g", 360, 36, 24, 0, 0), createFood("Pommes de terre", "250 g", 210, 5, 0, 47, 5), createFood("Epinards", "170 g", 39, 5, 0, 4, 4)])
        ]),
        createDayType("OFF", "Jour de recuperation", "2700", "Glucides legerement plus bas, lipides plus hauts.", [
          createMeal("R1", "Petit dejeuner", [createFood("Oeufs entiers", "4 unites", 280, 24, 20, 2, 0), createFood("Pain complet", "100 g", 243, 8, 2, 43, 7)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "180 g", 198, 41, 4, 0, 0), createFood("Quinoa cuit", "170 g", 204, 7, 3, 34, 4), createFood("Avocat", "80 g", 128, 2, 12, 4, 5)]),
          createMeal("R3", "Diner", [createFood("Cabillaud", "220 g", 187, 40, 2, 0, 0), createFood("Patate douce", "250 g", 225, 4, 0, 52, 8), createFood("Brocolis", "180 g", 62, 5, 1, 8, 6)])
        ])
      ],
      recomp: [
        createDayType("ON 1", "Jour training", "2480", "Apports reguliers et digestion simple.", [
          createMeal("R1", "Petit dejeuner", [createFood("Skyr", "170 g", 102, 17, 0, 8, 0), createFood("Avoine", "60 g", 225, 8, 4, 37, 6), createFood("Fraises", "150 g", 48, 1, 0, 9, 3)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "150 g", 165, 35, 3, 0, 0), createFood("Riz cuit", "160 g", 208, 4, 1, 46, 1), createFood("Courgettes", "180 g", 30, 2, 0, 5, 2)]),
          createMeal("Pre", "Pre-training", [createFood("Banane", "120 g", 110, 1, 0, 27, 2), createFood("Galettes de riz", "4 unites", 104, 2, 0, 24, 1)]),
          createMeal("R3", "Diner", [createFood("Saumon", "150 g", 300, 30, 20, 0, 0), createFood("Pommes de terre", "220 g", 185, 5, 0, 41, 4), createFood("Haricots verts", "150 g", 47, 3, 0, 5, 5)])
        ]),
        createDayType("OFF", "Jour OFF", "2230", "Apports plus stables et simples.", [
          createMeal("R1", "Petit dejeuner", [createFood("Oeufs", "3 unites", 210, 18, 15, 1, 0), createFood("Pain complet", "80 g", 194, 7, 2, 35, 6)]),
          createMeal("R2", "Dejeuner", [createFood("Dinde", "150 g", 162, 34, 2, 0, 0), createFood("Quinoa", "130 g", 156, 6, 2, 28, 3), createFood("Brocolis", "180 g", 62, 5, 1, 8, 6)]),
          createMeal("R3", "Diner", [createFood("Fromage blanc", "200 g", 146, 16, 6, 8, 0), createFood("Noix", "20 g", 130, 3, 13, 2, 1), createFood("Fruits rouges", "120 g", 48, 1, 0, 9, 3)])
        ])
      ],
      shape: [
        createDayType("ON 1", "Jour actif", "2100", "Glucides un peu plus presents autour de la seance.", [
          createMeal("R1", "Petit dejeuner", [createFood("Fromage blanc", "200 g", 146, 16, 6, 8, 0), createFood("Avoine", "50 g", 188, 6, 3, 31, 5), createFood("Banane", "100 g", 89, 1, 0, 20, 2)]),
          createMeal("R2", "Dejeuner", [createFood("Poulet", "150 g", 165, 35, 3, 0, 0), createFood("Riz cuit", "150 g", 195, 4, 1, 43, 1), createFood("Haricots verts", "150 g", 47, 3, 0, 5, 5)]),
          createMeal("R3", "Diner", [createFood("Saumon", "140 g", 280, 28, 18, 0, 0), createFood("Pommes de terre", "220 g", 185, 5, 0, 41, 4), createFood("Courgettes", "180 g", 30, 2, 0, 5, 2)])
        ]),
        createDayType("OFF", "Jour plus calme", "1880", "Reperes simples sans se prendre la tete.", [
          createMeal("R1", "Petit dejeuner", [createFood("Oeufs", "3 unites", 210, 18, 15, 1, 0), createFood("Pain complet", "70 g", 170, 6, 2, 30, 5)]),
          createMeal("R2", "Dejeuner", [createFood("Dinde", "150 g", 162, 34, 2, 0, 0), createFood("Quinoa", "120 g", 144, 5, 2, 25, 3), createFood("Brocolis", "180 g", 62, 5, 1, 8, 6)]),
          createMeal("R3", "Diner", [createFood("Fromage blanc", "200 g", 146, 16, 6, 8, 0), createFood("Amandes", "15 g", 94, 3, 8, 2, 2), createFood("Fruits rouges", "150 g", 60, 1, 0, 12, 4)])
        ])
      ]
    };

    return {
      title: `Plan nutrition ${clientName}`,
      strategy: getProfileTexts(key).strategy,
      hydration: getProfileTexts(key).hydration,
      coachNote: "Adapter les quantites selon le ressenti, la satiere et les retours de seance.",
      references: [
        "Hydratation repartie toute la journee.",
        "Legumes sur les repas principaux.",
        "Ajuster le pre-training selon la digestion."
      ],
      foodLibrary: [createFood("Poulet", "100 g", 110, 23, 2, 0, 0), createFood("Riz cuit", "150 g", 195, 4, 1, 43, 1), createFood("Skyr", "170 g", 102, 17, 0, 8, 0), createFood("Banane", "120 g", 110, 1, 0, 27, 2), createFood("Amandes", "15 g", 94, 3, 8, 2, 2)],
      dayTypes: nutritionSets[key] || nutritionSets.shape
    };
  }

  function buildProgramsForClient(clientSlug) {
    const client = window.TFBData.getClient(clientSlug);
    const key = getProfileKey(client.objective);
    const texts = getProfileTexts(key);

    return {
      training: {
        title: texts.trainingTitle,
        cycle: texts.cycle,
        frequency: texts.frequency,
        focus: texts.focus,
        progression: texts.progression,
        warmup: texts.warmup,
        coachNote: texts.coachNote,
        sessions: buildSessions(key)
      },
      nutrition: buildNutrition(key, client.firstName),
      updatedAt: new Date().toISOString()
    };
  }

  function ensureClientPrograms(clientSlug) {
    const store = readStore();
    if (!store[clientSlug]) {
      store[clientSlug] = buildProgramsForClient(clientSlug);
      writeStore(store);
    }
    return clone(store[clientSlug]);
  }

  function saveClientPrograms(clientSlug, programs) {
    const store = readStore();
    store[clientSlug] = { training: clone(programs.training), nutrition: clone(programs.nutrition), updatedAt: new Date().toISOString() };
    writeStore(store);
    return clone(store[clientSlug]);
  }

  function calculateMealTotals(meal) {
    return ((meal && meal.items) || []).reduce(function (totals, item) {
      totals.kcal += Number(item.kcal) || 0;
      totals.proteins += Number(item.proteins) || 0;
      totals.lipids += Number(item.lipids) || 0;
      totals.glucides += Number(item.glucides) || 0;
      totals.fibers += Number(item.fibers) || 0;
      return totals;
    }, { kcal: 0, proteins: 0, lipids: 0, glucides: 0, fibers: 0 });
  }

  function calculateDayTotals(day) {
    return ((day && day.meals) || []).reduce(function (totals, meal) {
      const mealTotals = calculateMealTotals(meal);
      totals.kcal += mealTotals.kcal;
      totals.proteins += mealTotals.proteins;
      totals.lipids += mealTotals.lipids;
      totals.glucides += mealTotals.glucides;
      totals.fibers += mealTotals.fibers;
      return totals;
    }, { kcal: 0, proteins: 0, lipids: 0, glucides: 0, fibers: 0 });
  }

  window.TFBPrograms = {
    getClientPrograms: function (clientSlug) {
      return ensureClientPrograms(clientSlug);
    },
    saveClientPrograms: saveClientPrograms,
    calculateMealTotals: calculateMealTotals,
    calculateDayTotals: calculateDayTotals,
    createExercise: createExercise,
    createSession: createSession,
    createFood: createFood,
    createMeal: createMeal,
    createDayType: createDayType
  };
})();
