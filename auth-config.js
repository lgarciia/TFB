/*
  Modifiez les comptes autorises avant diffusion.
  Pour generer un hash SHA-256 depuis la console du navigateur:
  TFBAuth.hashPassword("VotreMotDePasseFort").then(console.log)
*/

window.TFB_AUTH_CONFIG = {
  brandName: "Team Fit Brothers",
  loginPage: "index.html",
  defaultRedirect: "accueil.html",
  sessionDurationMinutes: 240,
  rememberDurationDays: 7,
  maxAttempts: 5,
  lockoutMinutes: 15,
  protectedPages: [
    "accueil.html",
    "creation-client.html",
    "espace-coache.html",
    "fiche-client.html",
    "fiches-clients.html",
    "share.html",
    "suivi-coaches.html",
    "suivi-hebdo.html"
  ],
  users: [
    {
      email: "acces@teamfitbrothers.fr",
      passwordHash: "66639e5215ca8a3f5b8560bb2ec9db29faf5bb71fdad0665b8cebf803d490ad9",
      name: "Acces Team Fit",
      role: "Administration"
    }
  ]
};
