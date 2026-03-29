(function () {
  const STORAGE_KEYS = {
    clients: "tfb-portal-clients",
    links: "tfb-portal-links",
    checkins: "tfb-portal-checkins"
  };

  function getConfig() {
    return window.TFB_PORTAL_CONFIG || {};
  }

  function isSupabaseConfigured() {
    const config = getConfig();
    return Boolean(
      config.supabaseUrl &&
        config.supabaseAnonKey &&
        !config.supabaseUrl.includes("YOUR-PROJECT") &&
        !config.supabaseAnonKey.includes("YOUR_PUBLIC_ANON_KEY")
    );
  }

  function isCoachSecretConfigured() {
    const config = getConfig();
    return Boolean(
      config.coachWriteSecret && !String(config.coachWriteSecret).includes("CHANGE_THIS_COACH_WRITE_SECRET")
    );
  }

  function getPortalUrl(token) {
    const base = window.TFBData.getCurrentPortalBaseUrl();
    const page = (getConfig().portalPage || "espace-coache.html").replace(/^\//, "");
    return `${base}/${page}?token=${encodeURIComponent(token)}`;
  }

  function createToken(length = 40) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    if (window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(length);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
    }

    let token = "";
    for (let index = 0; index < length; index += 1) {
      token += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return token;
  }

  function readLocalState(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeLocalState(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function getHeaders() {
    const config = getConfig();
    return {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
      "Content-Type": "application/json"
    };
  }

  async function supabaseRpc(functionName, payload) {
    const config = getConfig();
    const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload || {})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erreur Supabase sur ${functionName}.`);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : null;
  }

  async function localSyncClientProfile(client) {
    const clients = readLocalState(STORAGE_KEYS.clients, {});
    clients[client.slug] = {
      ...client,
      updatedAt: new Date().toISOString()
    };
    writeLocalState(STORAGE_KEYS.clients, clients);
    return clients[client.slug];
  }

  async function syncClientProfile(client) {
    if (!isSupabaseConfigured()) {
      return localSyncClientProfile(client);
    }

    if (!isCoachSecretConfigured()) {
      throw new Error("Configurez coachWriteSecret dans portal-config.js pour enregistrer les liens clients.");
    }

    return supabaseRpc("tfb_sync_client_profile", {
      p_admin_secret: getConfig().coachWriteSecret,
      p_client_slug: client.slug,
      p_first_name: client.firstName,
      p_last_name: client.lastName,
      p_email: client.email,
      p_phone: client.phone,
      p_birth_date: client.birthDate,
      p_gender: client.gender,
      p_start_date_label: client.startDate,
      p_start_date_short: client.startDateShort,
      p_coach_name: client.coach,
      p_objective: client.objective,
      p_level: client.level,
      p_objective_detail: client.objectiveDetail,
      p_height_label: client.height,
      p_weight_label: client.weight,
      p_age_label: client.age,
      p_activity_label: client.activity,
      p_frequency_label: client.frequency,
      p_constraints: client.constraints,
      p_habits: client.habits,
      p_notes: client.notes
    });
  }

  async function localIssuePortalLink(client, rotateToken) {
    await localSyncClientProfile(client);

    const links = readLocalState(STORAGE_KEYS.links, {});
    const existingEntry = Object.values(links).find((item) => item.clientSlug === client.slug);
    let token = existingEntry && !rotateToken ? existingEntry.token : createToken();

    if (existingEntry && rotateToken) {
      delete links[existingEntry.token];
    }

    links[token] = {
      token: token,
      clientSlug: client.slug,
      createdAt: new Date().toISOString()
    };

    writeLocalState(STORAGE_KEYS.links, links);

    return {
      token: token,
      client_slug: client.slug,
      portal_url: getPortalUrl(token),
      storage_mode: "local"
    };
  }

  async function issuePortalLink(client, options) {
    const rotateToken = Boolean(options && options.rotateToken);

    if (!isSupabaseConfigured()) {
      return localIssuePortalLink(client, rotateToken);
    }

    if (!isCoachSecretConfigured()) {
      throw new Error("Configurez coachWriteSecret dans portal-config.js pour generer un lien client.");
    }

    await syncClientProfile(client);

    const token = createToken();
    const result = await supabaseRpc("tfb_issue_portal_link", {
      p_admin_secret: getConfig().coachWriteSecret,
      p_client_slug: client.slug,
      p_token: token,
      p_rotate: rotateToken
    });

    const linkRow = Array.isArray(result) ? result[0] || {} : result;

    return {
      token: linkRow.token,
      client_slug: linkRow.client_slug,
      portal_url: getPortalUrl(linkRow.token),
      storage_mode: "supabase"
    };
  }

  async function localGetPortalByToken(token) {
    const links = readLocalState(STORAGE_KEYS.links, {});
    const clients = readLocalState(STORAGE_KEYS.clients, {});
    const entry = links[token];

    if (!entry) {
      return null;
    }

    const client = clients[entry.clientSlug] || window.TFBData.getClient(entry.clientSlug);
    return {
      client_slug: entry.clientSlug,
      token: token,
      first_name: client.firstName,
      last_name: client.lastName,
      objective: client.objective,
      coach_name: client.coach,
      start_date_label: client.startDate,
      level: client.level,
      email: client.email
    };
  }

  async function getPortalByToken(token) {
    if (!isSupabaseConfigured()) {
      return localGetPortalByToken(token);
    }

    const result = await supabaseRpc("tfb_get_client_portal", {
      p_token: token
    });

    return Array.isArray(result) ? result[0] || null : result;
  }

  function normalizeCheckinRecord(record) {
    const checkin = window.TFBData.createEmptyCheckin();

    window.TFBData.weeklyFields.forEach((field) => {
      const value = record[field.dbKey] ?? record[field.key] ?? "";
      checkin[field.key] = value === null ? "" : String(value);
    });

    checkin.commentaire = record.client_comment || record.commentaire || "";
    checkin.coachComment = record.coach_comment || record.coachComment || "";
    checkin.isoYear = record.iso_year ?? record.isoYear;
    checkin.isoWeek = record.iso_week ?? record.isoWeek;
    checkin.submittedAt = record.submitted_at || record.submittedAt || "";
    return checkin;
  }

  async function localListCheckinsByClientSlug(clientSlug) {
    const checkins = readLocalState(STORAGE_KEYS.checkins, {});

    return Object.values(checkins)
      .filter((item) => item.clientSlug === clientSlug)
      .sort((left, right) => {
        if (left.isoYear === right.isoYear) {
          return left.isoWeek - right.isoWeek;
        }
        return left.isoYear - right.isoYear;
      })
      .map(normalizeCheckinRecord);
  }

  async function localListCheckinsByToken(token) {
    const links = readLocalState(STORAGE_KEYS.links, {});
    const entry = links[token];
    if (!entry) return [];
    return localListCheckinsByClientSlug(entry.clientSlug);
  }

  async function listCheckinsByToken(token) {
    if (!isSupabaseConfigured()) {
      return localListCheckinsByToken(token);
    }

    const result = await supabaseRpc("tfb_list_client_checkins", {
      p_token: token
    });

    return (result || []).map(normalizeCheckinRecord);
  }

  async function listCheckinsByClientSlug(clientSlug) {
    if (!isSupabaseConfigured()) {
      return localListCheckinsByClientSlug(clientSlug);
    }

    if (!isCoachSecretConfigured()) {
      throw new Error("Configurez coachWriteSecret dans portal-config.js pour charger les donnees coach.");
    }

    const result = await supabaseRpc("tfb_list_client_checkins_for_coach", {
      p_admin_secret: getConfig().coachWriteSecret,
      p_client_slug: clientSlug
    });

    return (result || []).map(normalizeCheckinRecord);
  }

  function buildCheckinPayload(values, extra) {
    const payload = {
      p_iso_year: extra.isoYear,
      p_iso_week: extra.isoWeek,
      p_client_comment: values.commentaire || "",
      p_coach_comment: values.coachComment || ""
    };

    window.TFBData.weeklyFields.forEach((field) => {
      const rawValue = values[field.key];
      payload[`p_${field.dbKey}`] = rawValue === "" ? null : Number(rawValue);
    });

    return payload;
  }

  async function localSaveCheckinByToken(token, values, extra) {
    const links = readLocalState(STORAGE_KEYS.links, {});
    const entry = links[token];
    if (!entry) {
      throw new Error("Lien client invalide.");
    }

    const checkins = readLocalState(STORAGE_KEYS.checkins, {});
    const key = `${entry.clientSlug}:${extra.isoYear}:${extra.isoWeek}`;

    checkins[key] = {
      clientSlug: entry.clientSlug,
      isoYear: extra.isoYear,
      isoWeek: extra.isoWeek,
      submittedAt: new Date().toISOString(),
      client_comment: values.commentaire || "",
      coach_comment: values.coachComment || ""
    };

    window.TFBData.weeklyFields.forEach((field) => {
      checkins[key][field.dbKey] = values[field.key] === "" ? null : Number(values[field.key]);
    });

    writeLocalState(STORAGE_KEYS.checkins, checkins);
    return normalizeCheckinRecord(checkins[key]);
  }

  async function saveCheckinByToken(token, values, extra) {
    if (!isSupabaseConfigured()) {
      return localSaveCheckinByToken(token, values, extra);
    }

    const result = await supabaseRpc("tfb_upsert_client_checkin", {
      p_token: token,
      ...buildCheckinPayload(values, extra)
    });

    return Array.isArray(result) ? normalizeCheckinRecord(result[0] || {}) : normalizeCheckinRecord(result || {});
  }

  async function localSaveCoachComment(clientSlug, isoYear, isoWeek, coachComment) {
    const checkins = readLocalState(STORAGE_KEYS.checkins, {});
    const key = `${clientSlug}:${isoYear}:${isoWeek}`;
    const current = checkins[key] || {
      clientSlug: clientSlug,
      isoYear: isoYear,
      isoWeek: isoWeek,
      submittedAt: new Date().toISOString()
    };

    current.coach_comment = coachComment;
    checkins[key] = current;
    writeLocalState(STORAGE_KEYS.checkins, checkins);

    return normalizeCheckinRecord(current);
  }

  async function saveCoachComment(clientSlug, isoYear, isoWeek, coachComment) {
    if (!isSupabaseConfigured()) {
      return localSaveCoachComment(clientSlug, isoYear, isoWeek, coachComment);
    }

    if (!isCoachSecretConfigured()) {
      throw new Error("Configurez coachWriteSecret dans portal-config.js pour enregistrer les notes coach.");
    }

    const result = await supabaseRpc("tfb_save_coach_note", {
      p_admin_secret: getConfig().coachWriteSecret,
      p_client_slug: clientSlug,
      p_iso_year: isoYear,
      p_iso_week: isoWeek,
      p_coach_comment: coachComment || ""
    });

    return Array.isArray(result) ? normalizeCheckinRecord(result[0] || {}) : normalizeCheckinRecord(result || {});
  }

  window.TFBPortal = {
    getConfig: getConfig,
    isSupabaseConfigured: isSupabaseConfigured,
    issuePortalLink: issuePortalLink,
    syncClientProfile: syncClientProfile,
    getPortalByToken: getPortalByToken,
    listCheckinsByToken: listCheckinsByToken,
    listCheckinsByClientSlug: listCheckinsByClientSlug,
    saveCheckinByToken: saveCheckinByToken,
    saveCoachComment: saveCoachComment,
    getPortalUrl: getPortalUrl
  };
})();
