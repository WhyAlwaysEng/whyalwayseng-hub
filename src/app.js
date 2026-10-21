// GitHub Software Store Hub - Minimalist Alpine.js Store & Components

document.addEventListener("alpine:init", () => {
  // Global Store: Theme, Locale, Favorites, Minimal Toast
  Alpine.store("app", {
    theme: localStorage.getItem("theme") || "dark",
    lang: localStorage.getItem("lang") || (navigator.language?.startsWith("th") ? "th" : "en"),
    translations: {},
    favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
    recent: JSON.parse(localStorage.getItem("recent") || "[]"),
    toast: { show: false, message: "" },
    toastTimer: null,

    init() {
      this.applyTheme();
      this.loadTranslations();
    },

    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", this.theme);
      this.applyTheme();
    },

    applyTheme() {
      if (this.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    toggleLang() {
      const next = this.lang === "en" ? "th" : "en";
      this.setLanguage(next);
    },

    async setLanguage(lang) {
      this.lang = lang;
      localStorage.setItem("lang", lang);
      await this.loadTranslations();
    },

    async loadTranslations() {
      try {
        const root = document.querySelector("meta[name='site-root']")?.getAttribute("content") || "";
        const res = await fetch(`${root}locales/${this.lang}.json`);
        if (res.ok) {
          this.translations = await res.json();
        }
      } catch (e) {
        console.warn("Failed loading locale", e);
      }
    },

    t(keyPath, fallback = "") {
      const keys = keyPath.split(".");
      let val = this.translations;
      for (const k of keys) {
        if (!val || typeof val !== "object") return fallback;
        val = val[k];
      }
      return val || fallback;
    },

    toggleFavorite(slug) {
      if (this.favorites.includes(slug)) {
        this.favorites = this.favorites.filter((s) => s !== slug);
        this.showToast(this.t("detail.removedFav", "Removed from favorites"));
      } else {
        this.favorites.push(slug);
        this.showToast(this.t("detail.addedFav", "Added to favorites"));
      }
      localStorage.setItem("favorites", JSON.stringify(this.favorites));
    },

    isFavorite(slug) {
      return this.favorites.includes(slug);
    },

    addRecent(slug) {
      this.recent = [slug, ...this.recent.filter((s) => s !== slug)].slice(0, 10);
      localStorage.setItem("recent", JSON.stringify(this.recent));
    },

    showToast(message) {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toast = { show: true, message };
      this.toastTimer = setTimeout(() => {
        this.toast.show = false;
      }, 2500);
    },
  });

  // Storefront Component
  Alpine.data("storefront", () => ({
    loading: true,
    catalog: null,
    searchQuery: "",
    selectedCategory: "all",
    selectedPlatform: "all",
    sortBy: "popular",
    onlyFavorites: false,
    fuse: null,

    async init() {
      // Global shortcut "/" to focus search bar
      window.addEventListener("keydown", (e) => {
        if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          document.querySelector("#search-input")?.focus();
        }
      });

      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("favorites") === "1" || window.location.hash === "#favorites") {
        this.onlyFavorites = true;
      }
      if (urlParams.get("category")) {
        this.selectedCategory = urlParams.get("category");
      }
      if (urlParams.get("q")) {
        this.searchQuery = urlParams.get("q");
      }

      try {
        const root = document.querySelector("meta[name='site-root']")?.getAttribute("content") || "";
        const res = await fetch(`${root}data/catalog.json`);
        if (res.ok) {
          this.catalog = await res.json();
          this.initFuse();
        }
      } catch (e) {
        console.error("Failed loading catalog:", e);
      } finally {
        this.loading = false;
      }
    },

    initFuse() {
      if (window.Fuse && this.catalog?.apps) {
        this.fuse = new window.Fuse(this.catalog.apps, {
          keys: [
            { name: "name", weight: 0.4 },
            { name: "tagline", weight: 0.25 },
            { name: "tags", weight: 0.2 },
            { name: "category", weight: 0.1 },
            { name: "owner", weight: 0.05 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
        });
      }
    },

    setCategory(cat) {
      this.selectedCategory = cat;
    },

    setPlatform(plat) {
      this.selectedPlatform = plat;
    },

    setSort(sort) {
      this.sortBy = sort;
    },

    toggleFavoritesFilter() {
      this.onlyFavorites = !this.onlyFavorites;
    },

    resetFilters() {
      this.searchQuery = "";
      this.selectedCategory = "all";
      this.selectedPlatform = "all";
      this.onlyFavorites = false;
      this.sortBy = "popular";
    },

    get activeFiltersCount() {
      let count = 0;
      if (this.selectedCategory !== "all") count++;
      if (this.selectedPlatform !== "all") count++;
      if (this.onlyFavorites) count++;
      if (this.searchQuery.trim()) count++;
      return count;
    },

    get filteredApps() {
      if (!this.catalog?.apps) return [];

      let list = [...this.catalog.apps];

      // 1. Favorites Filter
      if (this.onlyFavorites) {
        const favs = Alpine.store("app").favorites;
        list = list.filter((a) => favs.includes(a.slug));
      }

      // 2. Category Filter
      if (this.selectedCategory !== "all") {
        list = list.filter((a) => a.category === this.selectedCategory);
      }

      // 3. Platform Filter
      if (this.selectedPlatform !== "all") {
        list = list.filter((a) => (a.platforms || []).includes(this.selectedPlatform));
      }

      // 4. Search Filter
      if (this.searchQuery.trim()) {
        if (this.fuse) {
          const results = this.fuse.search(this.searchQuery.trim());
          const matchedSlugs = new Set(results.map((r) => r.item.slug));
          list = list.filter((a) => matchedSlugs.has(a.slug));
        } else {
          const q = this.searchQuery.toLowerCase();
          list = list.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              (a.tagline && a.tagline.toLowerCase().includes(q)) ||
              (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
          );
        }
      }

      // 5. Sorting
      list.sort((a, b) => {
        if (this.sortBy === "popular") {
          return (b.repo?.stars || 0) + (b.totalDownloads || 0) - ((a.repo?.stars || 0) + (a.totalDownloads || 0));
        }
        if (this.sortBy === "recent") {
          const dateA = new Date(a.latest?.publishedAt || a.repo?.pushedAt || 0).getTime();
          const dateB = new Date(b.latest?.publishedAt || b.repo?.pushedAt || 0).getTime();
          return dateB - dateA;
        }
        if (this.sortBy === "az") {
          return a.name.localeCompare(b.name);
        }
        if (this.sortBy === "newest") {
          const dateA = new Date(a.latest?.publishedAt || 0).getTime();
          const dateB = new Date(b.latest?.publishedAt || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });

      return list;
    },

    get categories() {
      return this.catalog?.categories || [];
    },

    formatNumber(num) {
      if (!num) return "0";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "k";
      return num.toLocaleString();
    },

    getAppTagline(app) {
      const lang = Alpine.store("app").lang;
      if (app.i18n && app.i18n[lang] && app.i18n[lang].tagline) {
        return app.i18n[lang].tagline;
      }
      return app.tagline || "";
    },
  }));

  // App Detail Component
  Alpine.data("appDetail", (appData) => ({
    app: appData || null,
    activeTab: "overview",
    userOS: "windows",
    userArch: "x64",
    primaryAsset: null,
    renderedReadme: "",
    renderedChangelog: "",
    copiedKey: null,

    init() {
      this.detectUserEnv();
      this.determinePrimaryAsset();
      this.renderMarkdown();
      if (this.app?.slug) {
        Alpine.store("app").addRecent(this.app.slug);
      }
    },

    detectUserEnv() {
      const ua = (navigator.userAgent || "").toLowerCase();
      if (ua.includes("win")) this.userOS = "windows";
      else if (ua.includes("mac") || ua.includes("iphone") || ua.includes("ipad")) this.userOS = "macos";
      else if (ua.includes("linux") || ua.includes("android")) this.userOS = "linux";

      if (ua.includes("arm64") || ua.includes("aarch64")) {
        this.userArch = "arm64";
      } else {
        this.userArch = "x64";
      }
    },

    determinePrimaryAsset() {
      const assets = this.app?.latest?.assets || [];
      if (!assets.length) return;

      // Match OS + arch
      let match = assets.find((a) => a.os === this.userOS && a.arch === this.userArch);
      if (!match) match = assets.find((a) => a.os === this.userOS);
      if (!match) match = assets[0];

      this.primaryAsset = match;
    },

    setTab(tab) {
      this.activeTab = tab;
    },

    renderMarkdown() {
      if (window.marked && window.DOMPurify) {
        if (this.app?.readme) {
          try {
            const raw = window.marked.parse(this.app.readme);
            this.renderedReadme = window.DOMPurify.sanitize(raw);
          } catch (e) {
            console.warn("Failed rendering readme", e);
          }
        }
        if (this.app?.latest?.bodyMarkdown) {
          try {
            const raw = window.marked.parse(this.app.latest.bodyMarkdown);
            this.renderedChangelog = window.DOMPurify.sanitize(raw);
          } catch (e) {
            console.warn("Failed rendering changelog", e);
          }
        }
      }
    },

    copy(text, key = "default") {
      this.copiedKey = key;
      const onDone = () => {
        Alpine.store("app").showToast("Copied to clipboard");
        setTimeout(() => {
          if (this.copiedKey === key) this.copiedKey = null;
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(onDone).catch(() => this.fallbackCopy(text, onDone));
      } else {
        this.fallbackCopy(text, onDone);
      }
    },

    fallbackCopy(text, cb) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (cb) cb();
      } catch (err) {
        console.warn("Copy failed:", err);
      }
    },

    formatBytes(bytes) {
      if (!bytes || bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatNumber(num) {
      if (!num) return "0";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "k";
      return num.toLocaleString();
    },

    getAppTagline() {
      const lang = Alpine.store("app").lang;
      if (this.app?.i18n && this.app.i18n[lang] && this.app.i18n[lang].tagline) {
        return this.app.i18n[lang].tagline;
      }
      return this.app?.tagline || "";
    },
  }));
});
