/**
 * i18n: carga locales desde languages/{locale}.json (o .js si fetch falla).
 * Cache en localStorage para arranques rápidos. Sin dependencias.
 */
(function (global) {
  const STORAGE_KEY = "tarot:locale";
  const CACHE_PREFIX = "tarot:lang-cache:";
  const LOCALE_VERSION = 3;
  const SUPPORTED = ["es", "en"];
  const DEFAULT_LOCALE = "es";

  const FALLBACK = {
    es: { loading: "CARGANDO..." },
    en: { loading: "LOADING..." },
  };

  function getNested(obj, path) {
    if (!obj || !path) return undefined;
    return String(path)
      .split(".")
      .reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
  }

  function interpolate(template, vars) {
    if (template == null) return "";
    let out = String(template);
    const data = vars && typeof vars === "object" ? vars : {};
    for (const [key, value] of Object.entries(data)) {
      out = out.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), String(value));
    }
    return out;
  }

  const I18n = {
    locale: DEFAULT_LOCALE,
    messages: {},
    ready: false,
    _listeners: [],
    _loadedScripts: new Set(),

    onChange(fn) {
      if (typeof fn === "function") this._listeners.push(fn);
    },

    _notify() {
      for (const fn of this._listeners) {
        try {
          fn(this.locale);
        } catch (err) {
          console.warn("i18n listener error", err);
        }
      }
    },

    normalizeLocale(code) {
      const base = String(code || "")
        .trim()
        .toLowerCase()
        .split("-")[0];
      return SUPPORTED.includes(base) ? base : DEFAULT_LOCALE;
    },

    readStoredLocale() {
      try {
        return this.normalizeLocale(global.localStorage.getItem(STORAGE_KEY));
      } catch (_) {
        return DEFAULT_LOCALE;
      }
    },

    persistLocale(locale) {
      try {
        global.localStorage.setItem(STORAGE_KEY, locale);
      } catch (_) {}
    },

    _cacheKey(loc) {
      return `${CACHE_PREFIX}${loc}`;
    },

    readCache(loc) {
      try {
        const raw = global.localStorage.getItem(this._cacheKey(loc));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== LOCALE_VERSION || !parsed.messages) return null;
        return parsed.messages;
      } catch (_) {
        return null;
      }
    },

    writeCache(loc, messages) {
      try {
        global.localStorage.setItem(
          this._cacheKey(loc),
          JSON.stringify({ version: LOCALE_VERSION, messages })
        );
      } catch (_) {}
    },

    _applyMessages(loc, messages) {
      this.locale = loc;
      this.messages = messages && typeof messages === "object" ? messages : {};
      this.ready = true;
    },

    _loadLocaleScript(loc) {
      if (global.__TAROT_LOCALES__ && global.__TAROT_LOCALES__[loc]) {
        return Promise.resolve(global.__TAROT_LOCALES__[loc]);
      }
      if (this._loadedScripts.has(loc)) {
        return Promise.resolve(global.__TAROT_LOCALES__ && global.__TAROT_LOCALES__[loc]);
      }

      return new Promise((resolve, reject) => {
        const id = `tarot-locale-script-${loc}`;
        let script = document.getElementById(id);
        if (!script) {
          script = document.createElement("script");
          script.id = id;
          script.src = `./languages/${loc}.js`;
          script.async = true;
          document.head.appendChild(script);
        }
        script.addEventListener("load", () => {
          this._loadedScripts.add(loc);
          const data = global.__TAROT_LOCALES__ && global.__TAROT_LOCALES__[loc];
          if (data) resolve(data);
          else reject(new Error(`Locale script empty: ${loc}`));
        });
        script.addEventListener("error", () => reject(new Error(`Locale script failed: ${loc}`)));
      });
    },

    async fetchLocale(loc) {
      try {
        const res = await fetch(`./languages/${loc}.json`, { cache: "default" });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === "object") return data;
        }
      } catch (_) {}

      return this._loadLocaleScript(loc);
    },

    async loadLocale(locale, options) {
      const loc = this.normalizeLocale(locale);
      const preferCache = !options || options.preferCache !== false;

      if (preferCache) {
        const cached = this.readCache(loc);
        if (cached) {
          this._applyMessages(loc, cached);
          if (!options || !options.skipBackgroundRefresh) {
            void this.fetchLocale(loc)
              .then((fresh) => {
                if (!fresh) return;
                this.writeCache(loc, fresh);
                if (this.locale === loc) {
                  this._applyMessages(loc, fresh);
                  this.applyDom();
                  this.updateLangSwitcher();
                }
              })
              .catch(() => {});
          }
          return cached;
        }
      }

      const data = await this.fetchLocale(loc);
      if (!data || typeof data !== "object") {
        throw new Error(`Invalid locale: ${loc}`);
      }
      this.writeCache(loc, data);
      this._applyMessages(loc, data);
      return data;
    },

    t(key, vars) {
      const raw = getNested(this.messages, key);
      if (raw == null) {
        const fb = getNested(FALLBACK[this.locale] || FALLBACK.es, key);
        if (fb != null) return interpolate(fb, vars);
        return key;
      }
      if (typeof raw === "string" || typeof raw === "number") {
        return interpolate(raw, vars);
      }
      return key;
    },

    tArray(key) {
      const raw = getNested(this.messages, key);
      return Array.isArray(raw) ? raw.slice() : [];
    },

    tObject(key) {
      const raw = getNested(this.messages, key);
      return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
    },

    flagSrc(locale) {
      const loc = this.normalizeLocale(locale);
      return `./assets/flags/${loc}.svg`;
    },

    applyDom(root) {
      const scope = root && root.querySelectorAll ? root : document;

      scope.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;
        el.textContent = this.t(key);
      });

      scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (!key) return;
        el.setAttribute("placeholder", this.t(key));
      });

      scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria");
        if (!key) return;
        el.setAttribute("aria-label", this.t(key));
      });

      scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        if (!key) return;
        el.setAttribute("title", this.t(key));
      });

      const title = this.t("meta.title");
      if (title && title !== "meta.title") {
        document.title = title;
      }
      const htmlLang = this.t("meta.html_lang");
      if (htmlLang && htmlLang !== "meta.html_lang") {
        document.documentElement.lang = htmlLang;
      }
    },

    updateLangSwitcher() {
      const btn = document.getElementById("langSwitcherBtn");
      const flag = document.getElementById("langSwitcherFlag");
      const menu = document.getElementById("langSwitcherMenu");
      if (flag instanceof HTMLImageElement) {
        flag.src = this.flagSrc(this.locale);
      }
      if (btn) btn.setAttribute("aria-label", this.t("lang.select"));
      if (menu) {
        menu.querySelectorAll("[data-locale]").forEach((item) => {
          const loc = item.getAttribute("data-locale");
          const active = loc === this.locale;
          item.setAttribute("aria-selected", active ? "true" : "false");
          item.classList.toggle("font-semibold", active);
          item.classList.toggle("bg-nomad-ice/40", active);
        });
      }
    },

    async setLocale(locale, options) {
      const loc = this.normalizeLocale(locale);
      const skipNotify = Boolean(options && options.skipNotify);

      await this.loadLocale(loc, { preferCache: true, skipBackgroundRefresh: false });
      this.persistLocale(loc);
      this.applyDom();
      this.updateLangSwitcher();

      const loaderText = document.getElementById("startupLoaderText");
      if (loaderText) loaderText.textContent = this.t("loading");

      if (!skipNotify) this._notify();
    },

    async init() {
      const initial = this.readStoredLocale();
      await this.loadLocale(initial, { preferCache: true });
      this.persistLocale(initial);
      this.applyDom();
      this.updateLangSwitcher();
      this.wireLangSwitcher();
    },

    wireLangSwitcher() {
      const root = document.getElementById("langSwitcher");
      const btn = document.getElementById("langSwitcherBtn");
      const menu = document.getElementById("langSwitcherMenu");
      if (!root || !btn || !menu) return;

      const closeMenu = () => {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      };

      const openMenu = () => {
        menu.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "true");
      };

      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (menu.classList.contains("hidden")) openMenu();
        else closeMenu();
      });

      menu.querySelectorAll("[data-locale]").forEach((item) => {
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          const loc = item.getAttribute("data-locale");
          closeMenu();
          if (loc && loc !== this.locale) {
            void this.setLocale(loc);
          }
        });
      });

      document.addEventListener("click", (event) => {
        if (!root.contains(event.target)) closeMenu();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });

      this.updateLangSwitcher();
    },
  };

  global.I18n = I18n;
})(typeof window !== "undefined" ? window : globalThis);
