(function () {
  const SESSION_KEY = "tfb-auth-session";
  const ATTEMPT_KEY = "tfb-auth-attempts";
  const TOOLBAR_ID = "tfb-auth-toolbar";
  const TOOLBAR_STYLE_ID = "tfb-auth-toolbar-style";

  const DEFAULT_CONFIG = {
    brandName: "Team Fit Brothers",
    loginPage: "index.html",
    defaultRedirect: "accueil.html",
    sessionDurationMinutes: 240,
    rememberDurationDays: 7,
    maxAttempts: 5,
    lockoutMinutes: 15,
    protectedPages: ["accueil.html"],
    users: []
  };

  function getConfig() {
    const customConfig = window.TFB_AUTH_CONFIG || {};
    return {
      ...DEFAULT_CONFIG,
      ...customConfig,
      protectedPages: Array.isArray(customConfig.protectedPages)
        ? customConfig.protectedPages.slice()
        : DEFAULT_CONFIG.protectedPages.slice(),
      users: Array.isArray(customConfig.users) ? customConfig.users.slice() : []
    };
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function getCurrentPage() {
    const path = window.location.pathname || "";
    const segments = path.split("/");
    return segments[segments.length - 1] || "index.html";
  }

  function safeStorageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function safeStorageRemove(storage, key) {
    try {
      storage.removeItem(key);
    } catch (error) {
      return false;
    }

    return true;
  }

  function readJson(value, fallback) {
    if (!value) return fallback;

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function clearSession() {
    safeStorageRemove(window.sessionStorage, SESSION_KEY);
    safeStorageRemove(window.localStorage, SESSION_KEY);
  }

  function readStoredSession(storage) {
    const session = readJson(safeStorageGet(storage, SESSION_KEY), null);

    if (!session || !session.expiresAt) {
      return null;
    }

    if (Number(session.expiresAt) <= Date.now()) {
      safeStorageRemove(storage, SESSION_KEY);
      return null;
    }

    return session;
  }

  function getSession() {
    return readStoredSession(window.sessionStorage) || readStoredSession(window.localStorage);
  }

  function generateToken() {
    if (window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  }

  function startSession(user, remember) {
    clearSession();

    const config = getConfig();
    const now = Date.now();
    const durationMs = remember
      ? config.rememberDurationDays * 24 * 60 * 60 * 1000
      : config.sessionDurationMinutes * 60 * 1000;

    const session = {
      id: generateToken(),
      remember: Boolean(remember),
      loginAt: now,
      expiresAt: now + durationMs,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    const storage = remember ? window.localStorage : window.sessionStorage;
    safeStorageSet(storage, SESSION_KEY, JSON.stringify(session));
  }

  function getAttemptState() {
    const state = readJson(safeStorageGet(window.localStorage, ATTEMPT_KEY), null);
    const config = getConfig();

    if (!state) {
      return { failedCount: 0, lockUntil: 0 };
    }

    if (state.lockUntil && state.lockUntil <= Date.now()) {
      return { failedCount: 0, lockUntil: 0 };
    }

    if (state.failedCount > config.maxAttempts) {
      return { failedCount: config.maxAttempts, lockUntil: state.lockUntil || 0 };
    }

    return {
      failedCount: Number(state.failedCount) || 0,
      lockUntil: Number(state.lockUntil) || 0
    };
  }

  function setAttemptState(state) {
    safeStorageSet(window.localStorage, ATTEMPT_KEY, JSON.stringify(state));
  }

  function resetAttempts() {
    setAttemptState({ failedCount: 0, lockUntil: 0 });
  }

  function getRemainingLockMs() {
    const state = getAttemptState();
    return Math.max(0, (Number(state.lockUntil) || 0) - Date.now());
  }

  function registerFailure() {
    const config = getConfig();
    const state = getAttemptState();
    const nextCount = state.failedCount + 1;

    if (nextCount >= config.maxAttempts) {
      const lockUntil = Date.now() + config.lockoutMinutes * 60 * 1000;
      setAttemptState({ failedCount: config.maxAttempts, lockUntil: lockUntil });
      return {
        locked: true,
        remainingMs: Math.max(0, lockUntil - Date.now())
      };
    }

    setAttemptState({ failedCount: nextCount, lockUntil: 0 });
    return {
      locked: false,
      remainingMs: 0,
      remainingAttempts: Math.max(0, config.maxAttempts - nextCount)
    };
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) {
      return `${seconds}s`;
    }

    if (seconds === 0) {
      return `${minutes} min`;
    }

    return `${minutes} min ${seconds}s`;
  }

  async function sha256Hex(input) {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) {
      throw new Error("Le navigateur ne prend pas en charge le hash securise Web Crypto.");
    }

    const buffer = await window.crypto.subtle.digest(
      "SHA-256",
      new window.TextEncoder().encode(String(input))
    );

    return Array.from(new Uint8Array(buffer), (value) => value.toString(16).padStart(2, "0")).join("");
  }

  function findUserByEmail(email) {
    return getConfig().users.find((user) => normalizeEmail(user.email) === email) || null;
  }

  async function authenticate(email, password) {
    const config = getConfig();
    const normalizedEmail = normalizeEmail(email);
    const rawPassword = String(password || "");
    const remainingLockMs = getRemainingLockMs();

    if (!config.users.length) {
      return {
        ok: false,
        code: "config",
        message: "Aucun compte n'est configure dans auth-config.js."
      };
    }

    if (!normalizedEmail || !rawPassword) {
      return {
        ok: false,
        code: "required",
        message: "Renseignez une adresse e-mail et un mot de passe."
      };
    }

    if (remainingLockMs > 0) {
      return {
        ok: false,
        code: "locked",
        remainingMs: remainingLockMs,
        message: `Trop de tentatives. Reessayez dans ${formatDuration(remainingLockMs)}.`
      };
    }

    const user = findUserByEmail(normalizedEmail);
    let isValid = false;

    if (user) {
      if (user.passwordHash) {
        try {
          const passwordHash = await sha256Hex(rawPassword);
          isValid = passwordHash === String(user.passwordHash).toLowerCase();
        } catch (error) {
          return {
            ok: false,
            code: "crypto",
            message: "Impossible de verifier le mot de passe sur ce navigateur."
          };
        }
      } else if (Object.prototype.hasOwnProperty.call(user, "password")) {
        isValid = rawPassword === String(user.password);
      }
    }

    if (!isValid) {
      const failure = registerFailure();

      if (failure.locked) {
        return {
          ok: false,
          code: "locked",
          remainingMs: failure.remainingMs,
          message: `Trop de tentatives. Reessayez dans ${formatDuration(failure.remainingMs)}.`
        };
      }

      return {
        ok: false,
        code: "invalid",
        remainingAttempts: failure.remainingAttempts,
        message: "Adresse e-mail ou mot de passe invalide."
      };
    }

    resetAttempts();

    return {
      ok: true,
      user: {
        email: user.email,
        name: user.name || user.email,
        role: user.role || "Acces prive"
      }
    };
  }

  function isProtectedPage(page) {
    return getConfig().protectedPages.includes(page || getCurrentPage());
  }

  function sanitizeRedirect(target) {
    const config = getConfig();

    if (!target || typeof target !== "string") {
      return config.defaultRedirect;
    }

    const trimmedTarget = target.trim();

    if (!trimmedTarget || trimmedTarget.startsWith("javascript:") || trimmedTarget.startsWith("//")) {
      return config.defaultRedirect;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(trimmedTarget, window.location.href);
    } catch (error) {
      return config.defaultRedirect;
    }

    if (parsedUrl.origin !== window.location.origin) {
      return config.defaultRedirect;
    }

    const pathSegments = parsedUrl.pathname.split("/");
    const fileName = pathSegments[pathSegments.length - 1] || config.defaultRedirect;

    if (!isProtectedPage(fileName)) {
      return config.defaultRedirect;
    }

    return `${fileName}${parsedUrl.search}${parsedUrl.hash}`;
  }

  function getLoginRedirectUrl() {
    const config = getConfig();
    const currentPath = `${getCurrentPage()}${window.location.search}${window.location.hash}`;
    return `${config.loginPage}?redirect=${encodeURIComponent(currentPath)}`;
  }

  function redirectToLogin() {
    window.location.replace(getLoginRedirectUrl());
  }

  function getInitials(user) {
    const source = String(user.name || user.email || "TF").trim();
    const segments = source.split(/\s+/).filter(Boolean);

    if (segments.length === 1) {
      return segments[0].slice(0, 2).toUpperCase();
    }

    return `${segments[0][0] || ""}${segments[1][0] || ""}`.toUpperCase();
  }

  function injectToolbarStyles() {
    if (document.getElementById(TOOLBAR_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = TOOLBAR_STYLE_ID;
    style.textContent = `
      #${TOOLBAR_ID} {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 999;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
        backdrop-filter: blur(12px);
      }

      #${TOOLBAR_ID} * {
        box-sizing: border-box;
        font-family: "Inter", sans-serif;
      }

      .tfb-auth-avatar {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: linear-gradient(135deg, #111827, #334155);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }

      .tfb-auth-meta {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .tfb-auth-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        font-weight: 700;
      }

      .tfb-auth-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
        white-space: nowrap;
      }

      .tfb-auth-role {
        font-size: 0.82rem;
        color: #64748b;
      }

      .tfb-auth-logout {
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #111827;
        border-radius: 14px;
        padding: 10px 14px;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .tfb-auth-logout:hover {
        transform: translateY(-1px);
        background: #f8fafc;
      }

      @media (max-width: 720px) {
        #${TOOLBAR_ID} {
          left: 16px;
          right: 16px;
          bottom: 16px;
          padding: 12px;
        }

        .tfb-auth-name {
          white-space: normal;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function hydrateUserTargets(user) {
    const nameTargets = document.querySelectorAll("[data-auth-name]");
    const roleTargets = document.querySelectorAll("[data-auth-role]");
    const emailTargets = document.querySelectorAll("[data-auth-email-value]");

    nameTargets.forEach((node) => {
      node.textContent = user.name;
    });

    roleTargets.forEach((node) => {
      node.textContent = user.role;
    });

    emailTargets.forEach((node) => {
      node.textContent = user.email;
    });
  }

  function bindLogoutTriggers() {
    const triggers = document.querySelectorAll("[data-auth-logout], .tfb-auth-logout");

    triggers.forEach((node) => {
      if (node.dataset.authBound === "true") {
        return;
      }

      node.dataset.authBound = "true";
      node.addEventListener("click", function () {
        clearSession();
        redirectToLogin();
      });
    });
  }

  function renderToolbar(user) {
    if (!document.body || document.getElementById(TOOLBAR_ID)) {
      return;
    }

    const toolbar = document.createElement("div");
    toolbar.id = TOOLBAR_ID;
    toolbar.innerHTML = `
      <div class="tfb-auth-avatar">${getInitials(user)}</div>
      <div class="tfb-auth-meta">
        <div class="tfb-auth-label">Session securisee</div>
        <div class="tfb-auth-name">${user.name}</div>
        <div class="tfb-auth-role">${user.role}</div>
      </div>
      <button type="button" class="tfb-auth-logout">Se deconnecter</button>
    `;

    document.body.appendChild(toolbar);
    bindLogoutTriggers();
  }

  function bootProtectedPage(user) {
    const run = function () {
      injectToolbarStyles();
      hydrateUserTargets(user);
      renderToolbar(user);
      bindLogoutTriggers();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
      return;
    }

    run();
  }

  function requireAuth() {
    const page = getCurrentPage();

    if (!isProtectedPage(page)) {
      return true;
    }

    const session = getSession();

    if (!session) {
      redirectToLogin();
      return false;
    }

    bootProtectedPage(session.user);
    return true;
  }

  function redirectIfAuthenticated() {
    const session = getSession();

    if (!session) {
      return false;
    }

    const redirectTarget = sanitizeRedirect(
      new URLSearchParams(window.location.search).get("redirect") || getConfig().defaultRedirect
    );

    window.location.replace(redirectTarget);
    return true;
  }

  async function login(options) {
    const result = await authenticate(options.email, options.password);

    if (!result.ok) {
      return result;
    }

    startSession(result.user, options.remember);
    window.location.replace(sanitizeRedirect(options.redirect));

    return { ok: true };
  }

  function initLoginPage() {
    if (redirectIfAuthenticated()) {
      return;
    }

    const form = document.querySelector("[data-auth-form]");

    if (!form) {
      return;
    }

    const emailInput = form.querySelector("[data-auth-email]");
    const passwordInput = form.querySelector("[data-auth-password]");
    const rememberInput = form.querySelector("[data-auth-remember]");
    const redirectInput = form.querySelector("[data-auth-redirect]");
    const submitButton = form.querySelector("[data-auth-submit]");
    const submitLabel = form.querySelector("[data-auth-submit-label]");
    const statusNode = document.querySelector("[data-auth-status]");
    const capsLockNode = document.querySelector("[data-auth-capslock]");
    const togglePasswordButton = document.querySelector("[data-auth-toggle-password]");

    const redirectTarget = sanitizeRedirect(
      new URLSearchParams(window.location.search).get("redirect") || getConfig().defaultRedirect
    );

    if (redirectInput) {
      redirectInput.value = redirectTarget;
    }

    function setStatus(message, tone) {
      if (!statusNode) {
        return;
      }

      statusNode.textContent = message;
      statusNode.dataset.tone = tone || "muted";
      statusNode.hidden = !message;
    }

    function setLoadingState(isLoading) {
      if (!submitButton) {
        return;
      }

      submitButton.disabled = isLoading;

      if (submitLabel) {
        submitLabel.textContent = isLoading ? "Verification..." : "Se connecter";
      }
    }

    let lockTimer = null;

    function refreshLockState() {
      const remainingLockMs = getRemainingLockMs();

      if (remainingLockMs > 0) {
        if (submitButton) {
          submitButton.disabled = true;
        }

        setStatus(
          `Connexion temporairement bloquee. Reessayez dans ${formatDuration(remainingLockMs)}.`,
          "danger"
        );

        if (!lockTimer) {
          lockTimer = window.setInterval(function () {
            const liveRemainingMs = getRemainingLockMs();

            if (liveRemainingMs <= 0) {
              window.clearInterval(lockTimer);
              lockTimer = null;
              setLoadingState(false);
              setStatus("Saisissez vos identifiants pour acceder a l'espace securise.", "muted");
              return;
            }

            setStatus(
              `Connexion temporairement bloquee. Reessayez dans ${formatDuration(liveRemainingMs)}.`,
              "danger"
            );
          }, 1000);
        }

        return true;
      }

      if (lockTimer) {
        window.clearInterval(lockTimer);
        lockTimer = null;
      }

      if (submitButton) {
        submitButton.disabled = false;
      }

      return false;
    }

    if (!getConfig().users.length) {
      setStatus("Aucun compte autorise n'est configure.", "danger");

      if (submitButton) {
        submitButton.disabled = true;
      }

      return;
    }

    setStatus("Saisissez vos identifiants pour acceder a l'espace securise.", "muted");
    refreshLockState();

    if (togglePasswordButton && passwordInput) {
      togglePasswordButton.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordButton.textContent = isPassword ? "Masquer" : "Afficher";
      });
    }

    if (passwordInput && capsLockNode) {
      passwordInput.addEventListener("keyup", function (event) {
        capsLockNode.hidden = !event.getModifierState("CapsLock");
      });

      passwordInput.addEventListener("blur", function () {
        capsLockNode.hidden = true;
      });
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (refreshLockState()) {
        return;
      }

      setLoadingState(true);
      setStatus("Verification des identifiants...", "info");

      const result = await login({
        email: emailInput ? emailInput.value : "",
        password: passwordInput ? passwordInput.value : "",
        remember: rememberInput ? rememberInput.checked : false,
        redirect: redirectInput ? redirectInput.value : redirectTarget
      });

      if (!result.ok) {
        setLoadingState(false);
        setStatus(result.message, "danger");
        refreshLockState();
      }
    });
  }

  window.TFBAuth = {
    authenticate: authenticate,
    getConfig: getConfig,
    getRemainingLockMs: getRemainingLockMs,
    getSessionUser: function () {
      const session = getSession();
      return session ? session.user : null;
    },
    hashPassword: sha256Hex,
    initLoginPage: initLoginPage,
    isAuthenticated: function () {
      return Boolean(getSession());
    },
    login: login,
    logout: function () {
      clearSession();
      redirectToLogin();
    },
    redirectIfAuthenticated: redirectIfAuthenticated,
    requireAuth: requireAuth,
    sanitizeRedirect: sanitizeRedirect
  };
})();
