/*
  Renseignez vos identifiants Supabase pour activer la synchronisation distante.
  Sans configuration Supabase, le portail fonctionne en mode local sur ce navigateur.
  Si votre site est servi depuis un domaine fixe Vercel, vous pouvez renseigner appBaseUrl.
*/

window.TFB_PORTAL_CONFIG = {
  appBaseUrl: "",
  portalPage: "espace-coache.html",
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_KEY",
  coachWriteSecret: "CHANGE_THIS_COACH_WRITE_SECRET"
};
