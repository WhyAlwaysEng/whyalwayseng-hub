import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderHeader(rootPath = "./") {
  return `
  <!-- Top Navigation Header -->
  <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <a href="${rootPath}" class="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-1">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Software Hub
          </span>
          <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 -mt-1">
            GitHub Store
          </span>
        </div>
      </a>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        
        <!-- Favorites Counter Button -->
        <a href="${rootPath}?favorites=1"
           class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
           title="View your saved favorites">
          <svg class="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="hidden sm:inline" x-text="$store.app.t('nav.favorites', 'Favorites')">Favorites</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                x-text="$store.app.favorites.length"
                x-show="$store.app.favorites.length > 0">
          </span>
        </a>

        <!-- Language Switcher -->
        <button type="button"
                @click="$store.app.toggleLang()"
                class="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                x-text="$store.app.lang === 'en' ? 'ไทย' : 'EN'"
                aria-label="Switch Language">
        </button>

        <!-- Dark / Light Theme Toggle -->
        <button type="button"
                @click="$store.app.toggleTheme()"
                class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle Dark/Light Mode">
          <svg x-show="$store.app.theme === 'dark'" class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg x-show="$store.app.theme !== 'dark'" class="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <!-- Submit App Link -->
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"
           class="hidden md:inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 text-xs font-semibold shadow-sm transition">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          <span x-text="$store.app.t('nav.submit', 'Submit App')">Submit App</span>
        </a>

      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <!-- Footer -->
  <footer class="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-12 mt-20 text-slate-500 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">⚡</div>
        <div>
          <span class="font-bold text-slate-800 dark:text-slate-200">GitHub Software Store Hub</span>
          <p class="text-xs text-slate-400 mt-0.5">Zero-backend open source distribution platform</p>
        </div>
      </div>
      <p class="text-xs text-center md:text-left text-slate-400 max-w-md">
        All binary downloads link directly to verified official GitHub Releases. No telemetry cookies.
      </p>
      <div class="flex items-center gap-5 text-xs font-semibold">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition">GitHub Repo</a>
        <a href="./feed.xml" class="hover:text-blue-600 dark:hover:text-blue-400 transition">RSS Feed</a>
        <a href="./sitemap.xml" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Sitemap</a>
      </div>
    </div>
  </footer>`;
}

function renderToast() {
  return `
  <!-- Toast Notification with Transition -->
  <div x-show="$store.app.toast.show"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 translate-y-4 scale-95"
       x-transition:enter-end="opacity-100 translate-y-0 scale-100"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="opacity-100 translate-y-0 scale-100"
       x-transition:leave-end="opacity-0 translate-y-4 scale-95"
       x-cloak
       class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700/50 dark:border-slate-200/50"
       role="alert"
       aria-live="polite">
    <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 flex items-center justify-center font-bold text-xs">
      ✓
    </div>
    <span x-text="$store.app.toast.message"></span>
  </div>`;
}

async function buildIndex(catalog) {
  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="site-root" content="./">
  <title>${escapeHtml(catalog.store.name)}</title>
  <meta name="description" content="${escapeHtml(catalog.store.description || 'Open Source Software Store')}">
  
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
             script-src 'self' 'unsafe-eval' https://giscus.app;
             style-src 'self' 'unsafe-inline';
             img-src 'self' data: https://raw.githubusercontent.com https://avatars.githubusercontent.com;
             frame-src https://giscus.app https://www.youtube-nocookie.com;
             connect-src 'self';
             base-uri 'self'; form-action 'none'">

  <link rel="stylesheet" href="./styles.css">
  <link rel="manifest" href="./manifest.webmanifest">

  <script src="./vendor/alpine.min.js" defer></script>
  <script src="./vendor/marked.min.js" defer></script>
  <script src="./vendor/purify.min.js" defer></script>
  <script src="./vendor/fuse.min.js" defer></script>
  <script src="./app.js" defer></script>
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500 selection:text-white"
      x-data="storefront">

  ${renderHeader("./")}

  <!-- Hero & Search Header Section -->
  <section class="relative overflow-hidden pt-10 pb-6 sm:pt-16 sm:pb-10 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="max-w-3xl text-center sm:text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 mb-4 border border-blue-200 dark:border-blue-800/60">
          <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Zero-Backend Software Store</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
            x-text="$store.app.t('store.title', '${escapeHtml(catalog.store.name)}')">
          ${escapeHtml(catalog.store.name)}
        </h1>
        <p class="mt-3 text-sm sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed"
           x-text="$store.app.t('store.tagline', '${escapeHtml(catalog.store.description)}')">
          ${escapeHtml(catalog.store.description)}
        </p>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">${catalog.apps.length}</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Verified Apps</div>
        </div>
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Free &amp; Open Source</div>
        </div>
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div class="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400">0</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Tracking Cookies</div>
        </div>
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div class="text-2xl sm:text-3xl font-black text-amber-500">1-Click</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Direct Release Links</div>
        </div>
      </div>

    </div>
  </section>

  <!-- Main Storefront App Directory -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
    
    <!-- Search & Filter Control Hub -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm mb-8 space-y-5">
      
      <!-- Top Row: Search Box & Sort Selection -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search input -->
        <div class="relative flex-grow">
          <svg class="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text"
                 x-model="searchQuery"
                 class="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition"
                 placeholder="Search software by name, description, tags, developer..."
                 :placeholder="$store.app.t('search.placeholder', 'Search apps, categories, tags, developers...')">
          
          <!-- Clear Search Button -->
          <button type="button"
                  x-show="searchQuery.length > 0"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear search input">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Sort dropdown -->
        <div class="flex items-center gap-2">
          <select x-model="sortBy"
                  class="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option value="popular">🔥 Most Popular</option>
            <option value="recent">⚡ Recently Updated</option>
            <option value="az">🔤 Name (A - Z)</option>
            <option value="newest">✨ Newly Added</option>
          </select>
        </div>
      </div>

      <!-- Categories Pills Bar (Horizontally Scrollable) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-sm">
        <button type="button"
                @click="setCategory('all')"
                :class="selectedCategory === 'all' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium'"
                class="px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm">
          All Categories
        </button>
        <template x-for="cat in categories" :key="cat">
          <button type="button"
                  @click="setCategory(cat)"
                  :class="selectedCategory === cat ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium'"
                  class="px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm"
                  x-text="cat">
          </button>
        </template>
      </div>

      <!-- Platforms & Active Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        
        <!-- Platform Selector Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">OS:</span>
          
          <button type="button"
                  @click="setPlatform('all')"
                  :class="selectedPlatform === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                  class="px-2.5 py-1.5 rounded-lg transition font-medium">
            All
          </button>

          <button type="button"
                  @click="setPlatform('windows')"
                  :class="selectedPlatform === 'windows' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                  class="px-2.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1">
            <span>Windows</span>
          </button>

          <button type="button"
                  @click="setPlatform('macos')"
                  :class="selectedPlatform === 'macos' ? 'bg-purple-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                  class="px-2.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1">
            <span>macOS</span>
          </button>

          <button type="button"
                  @click="setPlatform('linux')"
                  :class="selectedPlatform === 'linux' ? 'bg-amber-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
                  class="px-2.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1">
            <span>Linux</span>
          </button>
        </div>

        <!-- Filter Reset Button -->
        <div x-show="activeFiltersCount > 0" class="flex items-center gap-2">
          <span class="text-slate-400">Active filters: <strong class="text-blue-600 dark:text-blue-400" x-text="activeFiltersCount"></strong></span>
          <button type="button"
                  @click="resetFilters()"
                  class="text-xs font-bold text-red-500 hover:underline">
            Reset all
          </button>
        </div>

      </div>

    </div>

    <!-- Favorites Notification Banner -->
    <div x-show="onlyFavorites"
         class="mb-6 flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-5 py-3 rounded-2xl text-amber-900 dark:text-amber-200 text-sm shadow-sm">
      <div class="flex items-center gap-2 font-medium">
        <span>⭐</span>
        <span x-text="$store.app.t('search.showingFavs', 'Showing your favorited apps only')">Showing your favorited apps only</span>
      </div>
      <button type="button"
              @click="onlyFavorites = false"
              class="text-xs font-bold underline hover:no-underline">
        Show all apps
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div x-show="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse h-64"></div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse h-64"></div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse h-64"></div>
    </div>

    <!-- Empty State -->
    <div x-show="!loading && filteredApps.length === 0"
         class="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
        🔍
      </div>
      <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200"
          x-text="$store.app.t('search.noResults', 'No software found matching your search.')">
        No software found matching your search.
      </h3>
      <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
        Try adjusting your keywords, switching categories, or clearing your active filters.
      </p>
      <button type="button"
              @click="resetFilters()"
              class="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition">
        Reset All Filters
      </button>
    </div>

    <!-- App Cards Grid -->
    <div x-show="!loading && filteredApps.length > 0"
         class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <template x-for="app in filteredApps" :key="app.slug">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
          
          <div>
            <!-- Card Header: Icon, Titles, Badges, Favorite Button -->
            <div class="flex items-start justify-between gap-3">
              <a :href="'./apps/' + app.slug + '/'" class="flex items-center gap-3.5 flex-grow focus:outline-none">
                <img :src="app.icon"
                     :alt="app.name"
                     class="w-13 h-13 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm group-hover:scale-105 transition-transform duration-200"
                     loading="lazy">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate"
                        x-text="app.name">
                    </h3>
                    <template x-if="app.verified">
                      <span class="inline-flex text-blue-500" title="Verified Open-Source Repository">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                      </span>
                    </template>
                  </div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider" x-text="app.category"></span>
                </div>
              </a>

              <!-- Favorite Toggle Button -->
              <button type="button"
                      @click.stop.prevent="$store.app.toggleFavorite(app.slug)"
                      class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                      :class="$store.app.isFavorite(app.slug) ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'"
                      aria-label="Toggle favorite">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            </div>

            <!-- Description -->
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed"
               x-text="getAppTagline(app)">
            </p>

            <!-- Tags & Platforms -->
            <div class="flex items-center gap-1.5 mt-3.5 flex-wrap">
              <template x-for="tag in (app.tags || []).slice(0, 3)" :key="tag">
                <span class="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                      x-text="'#' + tag">
                </span>
              </template>
            </div>
          </div>

          <!-- Card Bottom Stats & Actions -->
          <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <!-- Stars -->
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span x-text="formatNumber(app.repo?.stars || 0)"></span>
              </span>

              <!-- Version Tag -->
              <span class="font-mono text-slate-400 dark:text-slate-500" x-text="app.latest?.tag || 'v1.0'"></span>
            </div>

            <!-- Detail link button -->
            <a :href="'./apps/' + app.slug + '/'"
               class="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all shadow-sm">
              Details →
            </a>
          </div>

        </div>
      </template>
    </div>

  </main>

  ${renderFooter()}
  ${renderToast()}

  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(console.warn);
      });
    }
  </script>
</body>
</html>`;

  await fs.writeFile("dist/index.html", html, "utf8");
}

async function buildAppPage(app, catalog) {
  const rootPath = "../../";
  const appJson = JSON.stringify(app);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "operatingSystem": (app.platforms || ["Windows", "macOS", "Linux"]).join(", "),
    "applicationCategory": app.category,
    "softwareVersion": app.latest?.tag || "1.0.0",
    "downloadUrl": app.latest?.assets?.[0]?.url || app.repo?.htmlUrl,
    "author": {
      "@type": "Person",
      "name": app.owner
    }
  };

  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="site-root" content="${rootPath}">
  <title>${escapeHtml(app.name)} - Download Free Open Source</title>
  <meta name="description" content="${escapeHtml(app.tagline || app.name)}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(app.name)}">
  <meta property="og:description" content="${escapeHtml(app.tagline || app.name)}">
  <meta property="og:image" content="${escapeHtml(app.icon)}">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(app.name)}">
  <meta name="twitter:description" content="${escapeHtml(app.tagline || app.name)}">
  <meta name="twitter:image" content="${escapeHtml(app.icon)}">

  <!-- JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>

  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
             script-src 'self' 'unsafe-eval' https://giscus.app;
             style-src 'self' 'unsafe-inline';
             img-src 'self' data: https://raw.githubusercontent.com https://avatars.githubusercontent.com;
             frame-src https://giscus.app https://www.youtube-nocookie.com;
             connect-src 'self';
             base-uri 'self'; form-action 'none'">

  <link rel="stylesheet" href="${rootPath}styles.css">

  <script src="${rootPath}vendor/alpine.min.js" defer></script>
  <script src="${rootPath}vendor/marked.min.js" defer></script>
  <script src="${rootPath}vendor/purify.min.js" defer></script>
  <script src="${rootPath}app.js" defer></script>
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500 selection:text-white"
      x-data="appDetail(${escapeHtml(appJson)})">

  ${renderHeader(rootPath)}

  <!-- Top Breadcrumb -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
    <a href="${rootPath}"
       class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
      </svg>
      <span x-text="$store.app.t('detail.back', 'Back to Software Store')">Back to Software Store</span>
    </a>
  </div>

  <!-- App Hero Banner -->
  <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
      
      <!-- App Info -->
      <div class="flex items-start sm:items-center gap-6">
        <img src="${escapeHtml(app.icon)}"
             alt="${escapeHtml(app.name)}"
             class="w-20 h-20 sm:w-26 sm:h-26 rounded-3xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex-shrink-0">
        
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              ${escapeHtml(app.name)}
            </h1>
            
            ${app.verified ? `
              <span class="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Verified
              </span>
            ` : ""}
            
            ${app.stale ? `
              <span class="inline-flex text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200">
                Stale Data
              </span>
            ` : ""}
          </div>

          <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed font-normal"
             x-text="getAppTagline()">
            ${escapeHtml(app.tagline)}
          </p>

          <div class="flex items-center gap-4 mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
            <span>By <a href="${escapeHtml(app.repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">@${escapeHtml(app.owner)}</a></span>
            <span>•</span>
            <span class="flex items-center gap-1">⭐ ${app.repo.stars.toLocaleString()} Stars</span>
            <span>•</span>
            <span>License: <strong class="text-slate-700 dark:text-slate-300">${escapeHtml(app.repo.license || "Open Source")}</strong></span>
            <span>•</span>
            <span class="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">${escapeHtml(app.latest?.tag || "Latest")}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        
        <!-- Primary 1-Click Smart Download -->
        <template x-if="primaryAsset">
          <a :href="primaryAsset.url"
             class="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-95 text-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <div>
              <div class="text-sm">Download for <span class="capitalize" x-text="userOS"></span></div>
              <div class="text-[11px] opacity-80 font-mono font-normal" x-text="formatBytes(primaryAsset.size)"></div>
            </div>
          </a>
        </template>

        <a href="#downloads-section"
           class="px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm text-center transition">
          All Files
        </a>

        <!-- Favorite Button -->
        <button type="button"
                @click="$store.app.toggleFavorite(app.slug)"
                class="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none flex items-center justify-center"
                :class="$store.app.isFavorite(app.slug) ? 'text-amber-500' : 'text-slate-400'"
                aria-label="Add to favorites">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>

      </div>

    </div>
  </header>

  <!-- Main Body Content Grid -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-grow w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    <!-- Left 2 Columns: Tabs (README, Changelog, Releases, Downloads) -->
    <div class="lg:col-span-2 space-y-6">
      
      <!-- Responsive Tabs Bar -->
      <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-sm font-bold overflow-x-auto no-scrollbar">
        <button type="button"
                @click="setTab('overview')"
                :class="activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
                class="transition whitespace-nowrap px-2">
          Overview &amp; README
        </button>
        <button type="button"
                @click="setTab('changelog')"
                :class="activeTab === 'changelog' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
                class="transition whitespace-nowrap px-2">
          Changelog (${escapeHtml(app.latest?.tag || "")})
        </button>
        <button type="button"
                @click="setTab('history')"
                :class="activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
                class="transition whitespace-nowrap px-2">
          Releases (${app.releases.length})
        </button>
      </div>

      <!-- Tab Content: Overview -->
      <div x-show="activeTab === 'overview'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed overflow-x-auto"
             x-html="renderedReadme || '<p class=\\'text-slate-400 italic\\'>No README available.</p>'">
        </div>
      </div>

      <!-- Tab Content: Changelog -->
      <div x-show="activeTab === 'changelog'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">${escapeHtml(app.latest?.name || app.latest?.tag || "Release")}</h3>
            <span class="text-xs text-slate-500">Published on ${escapeHtml(app.latest?.publishedAt ? new Date(app.latest.publishedAt).toLocaleDateString() : "-")}</span>
          </div>
          <span class="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
            ${escapeHtml(app.latest?.tag || "")}
          </span>
        </div>
        <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed overflow-x-auto"
             x-html="renderedChangelog || '<p class=\\'text-slate-400 italic\\'>No release notes provided for this version.</p>'">
        </div>
      </div>

      <!-- Tab Content: History -->
      <div x-show="activeTab === 'history'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <template x-for="rel in app.releases" :key="rel.tag">
          <div class="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-blue-500/50 transition">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-sm text-slate-900 dark:text-white" x-text="rel.tag"></span>
                <span x-show="rel.prerelease" class="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 px-1.5 py-0.5 rounded font-semibold">Pre-release</span>
              </div>
              <span class="text-xs text-slate-400" x-text="formatDate(rel.publishedAt)"></span>
            </div>
            <a :href="'https://github.com/' + app.owner + '/' + app.repoName + '/releases/tag/' + rel.tag"
               target="_blank" rel="noopener noreferrer"
               class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              GitHub Release →
            </a>
          </div>
        </template>
      </div>

      <!-- Downloads & Assets Section -->
      <div id="downloads-section" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-black text-lg text-slate-900 dark:text-white">All Downloadable Files</h3>
          <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400" x-text="(app.latest?.assets || []).length + ' files'"></span>
        </div>
        <p class="text-xs text-slate-500 mb-6">Direct download links from GitHub for ${escapeHtml(app.latest?.tag || "")}.</p>

        <!-- Desktop Asset Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-3 px-3 font-bold">File Name</th>
                <th class="py-3 px-2 font-bold">OS / Arch</th>
                <th class="py-3 px-2 font-bold">Size</th>
                <th class="py-3 px-2 font-bold">Checksum</th>
                <th class="py-3 px-3 font-bold text-right">Download</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <template x-for="asset in app.latest?.assets || []" :key="asset.name">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-3.5 px-3 font-mono font-medium text-xs text-slate-800 dark:text-slate-200 break-all" x-text="asset.name"></td>
                  <td class="py-3.5 px-2 text-xs">
                    <span class="inline-block px-2.5 py-1 rounded-lg font-bold text-[11px]"
                          :class="{
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300': asset.os === 'windows',
                            'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300': asset.os === 'macos',
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300': asset.os === 'linux',
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400': !asset.os
                          }"
                          x-text="(asset.os || 'other') + (asset.arch ? ' (' + asset.arch + ')' : '')">
                    </span>
                  </td>
                  <td class="py-3.5 px-2 text-xs text-slate-500 whitespace-nowrap" x-text="formatBytes(asset.size)"></td>
                  <td class="py-3.5 px-2 text-xs">
                    <template x-if="asset.sha256">
                      <button type="button"
                              @click="copy(asset.sha256, asset.name)"
                              class="font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        <span x-text="asset.sha256.slice(0, 8) + '...'"></span>
                        <span class="text-[10px]" x-show="copiedKey === asset.name">✓</span>
                      </button>
                    </template>
                    <template x-if="!asset.sha256">
                      <span class="text-slate-400 text-xs italic">N/A</span>
                    </template>
                  </td>
                  <td class="py-3.5 px-3 text-right whitespace-nowrap">
                    <a :href="asset.url"
                       class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Download
                    </a>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile Asset Cards -->
        <div class="sm:hidden space-y-3">
          <template x-for="asset in app.latest?.assets || []" :key="asset.name">
            <div class="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <div class="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all" x-text="asset.name"></div>
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold uppercase tracking-wider text-slate-500" x-text="asset.os || 'Universal'"></span>
                <span class="text-slate-400" x-text="formatBytes(asset.size)"></span>
              </div>
              <div class="pt-2 flex items-center justify-between gap-2">
                <template x-if="asset.sha256">
                  <button type="button"
                          @click="copy(asset.sha256, asset.name)"
                          class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Copy SHA-256
                  </button>
                </template>
                <a :href="asset.url"
                   class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm">
                  Download
                </a>
              </div>
            </div>
          </template>
        </div>

      </div>

    </div>

    <!-- Right Column Sidebar (Package Managers & Info) -->
    <div class="space-y-6">
      
      <!-- Package Manager Installation Commands -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 class="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📦</span>
          <span>Package Managers</span>
        </h3>

        <div class="space-y-3">
          ${Object.entries(app.install || {}).map(([pm, cmd]) => `
            <div class="space-y-1">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(pm)}</span>
              <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
                <code class="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all mr-2">${escapeHtml(cmd)}</code>
                <button type="button"
                        @click="copy('${escapeHtml(cmd)}', '${escapeHtml(pm)}')"
                        class="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition"
                        title="Copy command">
                  <template x-if="copiedKey === '${escapeHtml(pm)}'">
                    <span class="text-xs font-bold text-emerald-500">✓</span>
                  </template>
                  <template x-if="copiedKey !== '${escapeHtml(pm)}'">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </template>
                </button>
              </div>
            </div>
          `).join("")}

          ${Object.keys(app.install || {}).length === 0 ? `
            <p class="text-xs text-slate-400 italic">No package manager commands provided.</p>
          ` : ""}
        </div>
      </div>

      <!-- Information & Metadata Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 class="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
          Repository Details
        </h3>

        <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">GitHub</span>
            <a href="${escapeHtml(app.repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="font-bold text-blue-600 hover:underline">
              ${escapeHtml(app.owner)}/${escapeHtml(app.repoName)}
            </a>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">License</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(app.repo.license || "Open Source")}</span>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">Total Downloads</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300" x-text="formatNumber(app.totalDownloads)"></span>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">Forks</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300">${app.repo.forks.toLocaleString()}</span>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">Open Issues</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300">${app.repo.openIssues.toLocaleString()}</span>
          </div>
        </div>

        <div class="pt-2">
          <a href="${escapeHtml(app.repo.htmlUrl)}/issues/new"
             target="_blank" rel="noopener noreferrer"
             class="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center justify-center gap-2 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Report an Issue on GitHub
          </a>
        </div>
      </div>

    </div>

  </main>

  ${renderFooter()}
  ${renderToast()}
</body>
</html>`;

  const appDir = path.join("dist", "apps", app.slug);
  await fs.mkdir(appDir, { recursive: true });
  await fs.writeFile(path.join(appDir, "index.html"), html, "utf8");
}

async function buildSitemapAndFeed(catalog) {
  const baseUrl = catalog.store.url || "https://example.github.io/software-store";

  // Sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${catalog.apps.map((a) => `
  <url>
    <loc>${baseUrl}/apps/${a.slug}/</loc>
    <lastmod>${(a.latest?.publishedAt || new Date().toISOString()).split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join("")}
</urlset>`;

  await fs.writeFile("dist/sitemap.xml", sitemap.trim(), "utf8");

  // Atom Feed XML
  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml(catalog.store.name)}</title>
  <subtitle>${escapeHtml(catalog.store.description)}</subtitle>
  <link href="${baseUrl}/feed.xml" rel="self"/>
  <link href="${baseUrl}/"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${baseUrl}/</id>
  ${catalog.apps.map((a) => `
  <entry>
    <title>${escapeHtml(a.name)} ${escapeHtml(a.latest?.tag || "")}</title>
    <link href="${baseUrl}/apps/${a.slug}/"/>
    <id>${baseUrl}/apps/${a.slug}/#${escapeHtml(a.latest?.tag || "")}</id>
    <updated>${a.latest?.publishedAt || new Date().toISOString()}</updated>
    <summary>${escapeHtml(a.tagline)}</summary>
  </entry>
  `).join("")}
</feed>`;

  await fs.writeFile("dist/feed.xml", feed.trim(), "utf8");
}

async function main() {
  console.log("🏗️ Building Modern Responsive Pages with HTML/Eta Generators...");

  // Load catalog
  const catalogRaw = await fs.readFile("dist/data/catalog.json", "utf8");
  const catalog = JSON.parse(catalogRaw);

  // 1. Copy assets, locales, vendor files to dist
  console.log("  📂 Copying static assets...");
  await copyDir("src/vendor", "dist/vendor");
  await copyDir("locales", "dist/locales");
  await fs.copyFile("src/app.js", "dist/app.js");
  await fs.copyFile("src/sw.js", "dist/sw.js");
  await fs.copyFile("src/manifest.webmanifest", "dist/manifest.webmanifest");
  await copyDir("assets", "dist/assets");

  // 2. Build Index Page
  console.log("  📄 Building Home Page (dist/index.html)...");
  await buildIndex(catalog);

  // 3. Build App Detail Pages
  console.log(`  📄 Building ${catalog.apps.length} App Pages (dist/apps/<slug>/index.html)...`);
  for (const app of catalog.apps) {
    await buildAppPage(app, catalog);
  }

  // 4. Build Sitemap & Feed
  console.log("  🗺️ Generating sitemap.xml and feed.xml...");
  await buildSitemapAndFeed(catalog);

  console.log("✅ Static site generation complete!");
}

main().catch((err) => {
  console.error("❌ Fatal error in build-site:", err);
  process.exit(1);
});
