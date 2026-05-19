/**
 * Pantalla de carga inicial: espera idioma (cache o red) y luego entrega la app.
 */
(function (global) {
  const FALLBACK_LOADING = { es: "CARGANDO...", en: "LOADING..." };

  const TarotStartup = {
    _promise: null,
    _finished: false,

    ready() {
      if (!this._promise) this._promise = this._run();
      return this._promise;
    },

    _loaderTextEl() {
      return document.getElementById("startupLoaderText");
    },

    _setLoaderText(text) {
      const el = this._loaderTextEl();
      if (el) el.textContent = text;
    },

    _setBootUiState(state) {
      const loader = document.getElementById("startupLoader");
      const langSwitcher = document.getElementById("langSwitcher");
      const app = document.getElementById("appContent");

      if (loader) {
        loader.classList.toggle("hidden", state === "done");
        loader.setAttribute("aria-hidden", state === "done" ? "true" : "false");
        loader.setAttribute("aria-busy", state === "loading" ? "true" : "false");
      }

      if (langSwitcher) {
        const showChrome = state === "app" || state === "done";
        langSwitcher.classList.toggle("invisible", !showChrome);
        langSwitcher.classList.toggle("opacity-0", !showChrome);
        langSwitcher.classList.toggle("pointer-events-none", !showChrome);
      }

      if (app) {
        const showApp = state === "done";
        app.classList.toggle("invisible", !showApp);
        app.classList.toggle("opacity-0", !showApp);
        app.classList.toggle("opacity-100", showApp);
      }

      document.body.classList.toggle("overflow-hidden", state !== "done");
    },

    async _run() {
      this._setBootUiState("loading");

      const locale =
        typeof I18n !== "undefined" ? I18n.readStoredLocale() : "es";
      this._setLoaderText(FALLBACK_LOADING[locale] || FALLBACK_LOADING.es);

      try {
        if (typeof I18n === "undefined") throw new Error("I18n missing");
        await I18n.init();
        this._setLoaderText(I18n.t("loading"));
      } catch (err) {
        console.warn("No se pudo cargar el idioma.", err);
        this._setLoaderText(FALLBACK_LOADING[locale] || FALLBACK_LOADING.es);
      }

      this._setBootUiState("app");
      return typeof I18n !== "undefined" ? I18n : null;
    },

    finish() {
      if (this._finished) return;
      this._finished = true;
      this._setBootUiState("done");
    },
  };

  global.TarotStartup = TarotStartup;
})(typeof window !== "undefined" ? window : globalThis);
