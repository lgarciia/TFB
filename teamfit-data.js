(function () {
  const clients = {
    "adam-bernier": {
      slug: "adam-bernier",
      firstName: "Adam",
      lastName: "Bernier",
      email: "adam.bernier@email.com",
      phone: "+33 6 11 24 88 10",
      birthDate: "03/08/1993",
      gender: "Homme",
      startDate: "04 janvier 2026",
      startDateShort: "04/01/2026",
      coach: "Team Fit Brothers",
      objective: "Perte de poids",
      level: "Intermediaire",
      objectiveDetail: "Reduction du taux de masse grasse, meilleure regularite sportive et remise en place d'une routine durable.",
      height: "178 cm",
      weight: "92 kg",
      age: "32 ans",
      activity: "Sedentaire",
      frequency: "1 a 2 seances / semaine",
      constraints: "Douleurs lombaires occasionnelles.",
      habits: "Repas souvent pris a l'exterieur, rythme professionnel irregulier.",
      notes: "Necessite un cadre simple, progressif et facile a tenir dans le temps."
    },
    "camille-robert": {
      slug: "camille-robert",
      firstName: "Camille",
      lastName: "Robert",
      email: "camille.robert@email.com",
      phone: "+33 6 42 17 08 61",
      birthDate: "21/11/1997",
      gender: "Femme",
      startDate: "15 fevrier 2026",
      startDateShort: "15/02/2026",
      coach: "Team Fit Brothers",
      objective: "Recomposition corporelle",
      level: "Intermediaire",
      objectiveDetail: "Ameliorer la composition corporelle, garder de l'energie au quotidien et structurer l'entrainement.",
      height: "171 cm",
      weight: "67 kg",
      age: "28 ans",
      activity: "Modere",
      frequency: "3 seances / semaine",
      constraints: "Sensibilite sur les epaules en developpe.",
      habits: "Routine plutot stable, sommeil correct, alimentation globalement reguliere.",
      notes: "Bonne adherence. Profil receptif au suivi detaille."
    },
    "chloe-blaison": {
      slug: "chloe-blaison",
      firstName: "Chloe",
      lastName: "Blaison",
      email: "chloe.blaison@email.com",
      phone: "+33 6 25 18 76 32",
      birthDate: "14/05/1996",
      gender: "Femme",
      startDate: "12 janvier 2026",
      startDateShort: "12/01/2026",
      coach: "Team Fit Brothers",
      objective: "Remise en forme",
      level: "Debutant",
      objectiveDetail: "Reprendre une activite physique reguliere, ameliorer l'hygiene de vie et retrouver une meilleure condition generale.",
      height: "168 cm",
      weight: "63 kg",
      age: "29 ans",
      activity: "Modere",
      frequency: "2 a 3 seances / semaine",
      constraints: "Legere sensibilite au genou gauche, vigilance sur les impacts.",
      habits: "Journees de travail chargees, rythme parfois irregulier sur les repas, sommeil globalement correct.",
      notes: "Profil motive, bon potentiel d'adherence si le cadre reste simple et progressif."
    },
    "enzo-martel": {
      slug: "enzo-martel",
      firstName: "Enzo",
      lastName: "Martel",
      email: "enzo.martel@email.com",
      phone: "+33 6 58 40 72 14",
      birthDate: "09/02/2000",
      gender: "Homme",
      startDate: "08 mars 2026",
      startDateShort: "08/03/2026",
      coach: "Team Fit Brothers",
      objective: "Prise de masse",
      level: "Avance",
      objectiveDetail: "Augmenter la masse musculaire, maintenir une bonne qualite d'execution et suivre la progression semaine par semaine.",
      height: "183 cm",
      weight: "76 kg",
      age: "26 ans",
      activity: "Actif",
      frequency: "5 seances / semaine",
      constraints: "Aucune blessure notable actuellement.",
      habits: "Bon niveau d'implication, alimentation deja structuree.",
      notes: "Profil performant. Recherche un suivi tres precis sur les mensurations."
    },
    "jade-morel": {
      slug: "jade-morel",
      firstName: "Jade",
      lastName: "Morel",
      email: "jade.morel@email.com",
      phone: "+33 6 73 14 95 30",
      birthDate: "18/06/1994",
      gender: "Femme",
      startDate: "20 janvier 2026",
      startDateShort: "20/01/2026",
      coach: "Team Fit Brothers",
      objective: "Perte de poids",
      level: "Debutant",
      objectiveDetail: "Retrouver une meilleure condition physique, perdre du poids progressivement et reprendre confiance.",
      height: "165 cm",
      weight: "79 kg",
      age: "31 ans",
      activity: "Sedentaire",
      frequency: "1 a 2 seances / semaine",
      constraints: "Fatigue recurrente en fin de journee.",
      habits: "Planning familial charge, besoin d'un suivi simple et concret.",
      notes: "Accompagnement motive par des objectifs de sante et de regularite."
    },
    "lucas-renaud": {
      slug: "lucas-renaud",
      firstName: "Lucas",
      lastName: "Renaud",
      email: "lucas.renaud@email.com",
      phone: "+33 6 89 26 51 44",
      birthDate: "27/01/1992",
      gender: "Homme",
      startDate: "27 fevrier 2026",
      startDateShort: "27/02/2026",
      coach: "Team Fit Brothers",
      objective: "Performance sportive",
      level: "Avance",
      objectiveDetail: "Ameliorer la performance generale, la recuperation et le suivi des indicateurs corporels.",
      height: "180 cm",
      weight: "84 kg",
      age: "34 ans",
      activity: "Tres actif",
      frequency: "6 seances / semaine",
      constraints: "Charge d'entrainement importante, attention a la recuperation.",
      habits: "Bonne hygiene de vie, implication forte, cherche un suivi detaille.",
      notes: "Profil autonome avec besoin d'un reporting hebdomadaire propre."
    },
    "manon-petit": {
      slug: "manon-petit",
      firstName: "Manon",
      lastName: "Petit",
      email: "manon.petit@email.com",
      phone: "+33 6 31 80 24 68",
      birthDate: "30/09/1998",
      gender: "Femme",
      startDate: "09 fevrier 2026",
      startDateShort: "09/02/2026",
      coach: "Team Fit Brothers",
      objective: "Recomposition corporelle",
      level: "Intermediaire",
      objectiveDetail: "Affiner la silhouette, gagner en tonicite et structurer les indicateurs de progression.",
      height: "169 cm",
      weight: "64 kg",
      age: "27 ans",
      activity: "Modere",
      frequency: "3 a 4 seances / semaine",
      constraints: "Douleurs cervicales ponctuelles.",
      habits: "Mode de vie stable, besoin d'un cadre simple pour rester reguliere.",
      notes: "Tres bonne communication, profil serieux."
    },
    "noah-girard": {
      slug: "noah-girard",
      firstName: "Noah",
      lastName: "Girard",
      email: "noah.girard@email.com",
      phone: "+33 6 48 33 19 07",
      birthDate: "11/04/2001",
      gender: "Homme",
      startDate: "05 mars 2026",
      startDateShort: "05/03/2026",
      coach: "Team Fit Brothers",
      objective: "Remise en forme",
      level: "Debutant",
      objectiveDetail: "Mettre en place une routine, suivre ses mensurations et garder une progression visible.",
      height: "176 cm",
      weight: "88 kg",
      age: "25 ans",
      activity: "Sedentaire",
      frequency: "2 seances / semaine",
      constraints: "Genou droit sensible sur les flexions profondes.",
      habits: "Horaires variables, besoin d'une interface simple pour saisir ses donnees.",
      notes: "Bon potentiel de progression avec suivi hebdomadaire."
    },
    "sarah-leclerc": {
      slug: "sarah-leclerc",
      firstName: "Sarah",
      lastName: "Leclerc",
      email: "sarah.leclerc@email.com",
      phone: "+33 6 67 92 14 56",
      birthDate: "06/12/1995",
      gender: "Femme",
      startDate: "18 janvier 2026",
      startDateShort: "18/01/2026",
      coach: "Team Fit Brothers",
      objective: "Perte de poids",
      level: "Intermediaire",
      objectiveDetail: "Perdre du poids progressivement, ameliorer la regularite et suivre les zones de mensuration prioritaires.",
      height: "167 cm",
      weight: "74 kg",
      age: "30 ans",
      activity: "Modere",
      frequency: "3 seances / semaine",
      constraints: "Besoin de vigilance sur la fatigue et le stress.",
      habits: "Alimentation en progression, suivi motive par des resultats visuels.",
      notes: "Demandeuse d'un retour clair sur l'evolution hebdomadaire."
    },
    "thomas-dumont": {
      slug: "thomas-dumont",
      firstName: "Thomas",
      lastName: "Dumont",
      email: "thomas.dumont@email.com",
      phone: "+33 6 54 87 20 49",
      birthDate: "01/03/1990",
      gender: "Homme",
      startDate: "01 mars 2026",
      startDateShort: "01/03/2026",
      coach: "Team Fit Brothers",
      objective: "Prise de masse",
      level: "Intermediaire",
      objectiveDetail: "Gagner en masse musculaire tout en suivant proprement l'evolution des tours de corps.",
      height: "185 cm",
      weight: "81 kg",
      age: "36 ans",
      activity: "Actif",
      frequency: "4 a 5 seances / semaine",
      constraints: "Ancienne douleur d'epaule a surveiller.",
      habits: "Bonne implication, demande une structure claire et pro.",
      notes: "Compatible avec un suivi client autonome via portail."
    }
  };

  const weeklyFields = [
    { key: "poids", label: "Poids", dbKey: "weight", unit: "kg" },
    { key: "epaule", label: "Epaule", dbKey: "shoulder", unit: "cm" },
    { key: "pec", label: "Pec", dbKey: "chest", unit: "cm" },
    { key: "brasDroit", label: "Bras droit", dbKey: "arm_right", unit: "cm" },
    { key: "brasGauche", label: "Bras gauche", dbKey: "arm_left", unit: "cm" },
    { key: "nombril", label: "Nombril", dbKey: "navel", unit: "cm" },
    { key: "hanche", label: "Hanche", dbKey: "hip", unit: "cm" },
    { key: "fesse", label: "Fesse", dbKey: "glute", unit: "cm" },
    { key: "cuisseGauche", label: "Cuisse gauche", dbKey: "thigh_left", unit: "cm" },
    { key: "cuisseDroite", label: "Cuisse droite", dbKey: "thigh_right", unit: "cm" },
    { key: "molletDroit", label: "Mollet droit", dbKey: "calf_right", unit: "cm" },
    { key: "molletGauche", label: "Mollet gauche", dbKey: "calf_left", unit: "cm" }
  ];

  function getClient(slug) {
    return clients[slug] || clients["chloe-blaison"];
  }

  function listClients() {
    return Object.values(clients);
  }

  function createEmptyCheckin() {
    const values = {};

    weeklyFields.forEach((field) => {
      values[field.key] = "";
    });

    values.commentaire = "";
    values.coachComment = "";
    return values;
  }

  function slugToDisplayName(slug) {
    const client = clients[slug];

    if (client) {
      return `${client.firstName} ${client.lastName}`;
    }

    return String(slug || "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getISOWeekInfo(date) {
    const currentDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = currentDate.getUTCDay() || 7;
    currentDate.setUTCDate(currentDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((currentDate - yearStart) / 86400000) + 1) / 7);

    return {
      isoYear: currentDate.getUTCFullYear(),
      isoWeek: week
    };
  }

  function formatWeekKey(isoYear, isoWeek) {
    return `${isoYear}-${String(isoWeek).padStart(2, "0")}`;
  }

  function getCurrentPortalBaseUrl() {
    if (window.TFB_PORTAL_CONFIG && window.TFB_PORTAL_CONFIG.appBaseUrl) {
      return window.TFB_PORTAL_CONFIG.appBaseUrl.replace(/\/$/, "");
    }

    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    const path = url.pathname.split("/");
    path.pop();
    url.pathname = path.join("/") || "/";
    return url.toString().replace(/\/$/, "");
  }

  window.TFBData = {
    clients: clients,
    weeklyFields: weeklyFields,
    getClient: getClient,
    listClients: listClients,
    createEmptyCheckin: createEmptyCheckin,
    slugToDisplayName: slugToDisplayName,
    getISOWeekInfo: getISOWeekInfo,
    formatWeekKey: formatWeekKey,
    getCurrentPortalBaseUrl: getCurrentPortalBaseUrl
  };
})();
