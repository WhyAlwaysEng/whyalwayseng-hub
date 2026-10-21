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
  <!-- Rainbow Top Light Bar -->
  <div class="h-1.5 w-full bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 via-emerald-400 to-amber-400 animate-rainbow-flow"></div>

  <!-- Header -->
  <header class="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-xl transition-all shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
      
      <!-- Brand Logo with Rainbow Aura -->
      <a href="${rootPath}" class="flex items-center gap-3 group focus:outline-none rounded-2xl p-1">
        <div class="relative">
          <div class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-70 blur-sm group-hover:opacity-100 group-hover:blur animate-rainbow-flow transition duration-300"></div>
          <div class="relative w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-xl shadow-md border border-slate-100">
            <span class="animate-float">🌈</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-black text-xl tracking-tight rainbow-text">
            Software Hub
          </span>
          <span class="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase -mt-0.5">
            GitHub Release Store
          </span>
        </div>
      </a>

      <!-- Right Header Actions (Every button has permanent visible icon + text) -->
      <div class="flex items-center gap-2 sm:gap-3">
        
        <!-- Favorites Counter Button -->
        <a href="${rootPath}?favorites=1"
           class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 transition shadow-sm focus:outline-none"
           title="View your saved favorites">
          <span class="text-amber-500">⭐</span>
          <span class="hidden sm:inline" x-text="$store.app.t('nav.favorites', 'Favorites')">Favorites</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm"
                x-text="$store.app.favorites.length"
                x-show="$store.app.favorites.length > 0">
            0
          </span>
        </a>

        <!-- Language Switcher (Always shows icon and language label) -->
        <button type="button"
                @click="$store.app.toggleLang()"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition shadow-sm focus:outline-none"
                aria-label="Switch Language">
          <span class="text-sm">🌐</span>
          <span class="font-bold" x-text="$store.app.lang === 'en' ? 'TH (ไทย)' : 'EN (English)'">TH (ไทย)</span>
        </button>

        <!-- Theme Toggle (Explicitly shows Sun/Moon icon and label) -->
        <button type="button"
                @click="$store.app.toggleTheme()"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition shadow-sm focus:outline-none"
                aria-label="Toggle Theme Mode">
          <span class="text-base" x-show="$store.app.theme === 'dark'">☀️</span>
          <span class="text-base" x-show="$store.app.theme !== 'dark'">🌙</span>
          <span class="hidden sm:inline text-xs font-bold" x-text="$store.app.theme === 'dark' ? 'Light' : 'Dark'">Mode</span>
        </button>

        <!-- Submit App Button -->
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"
           class="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl rainbow-button text-white text-xs font-bold shadow-md">
          <span>+</span>
          <span x-text="$store.app.t('nav.submit', 'Submit App')">Submit App</span>
        </a>

      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <!-- Footer with Rainbow Accent -->
  <footer class="border-t border-slate-200 bg-white py-12 mt-20 text-slate-500 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 text-white flex items-center justify-center font-black text-sm shadow-md animate-rainbow-flow">
          ⚡
        </div>
        <div>
          <span class="font-bold text-slate-800">GitHub Software Store Hub</span>
          <p class="text-xs text-slate-400 mt-0.5">Zero-backend software store. Real verified GitHub Releases.</p>
        </div>
      </div>

      <div class="text-xs text-center text-slate-400">
        Direct binary downloads powered by GitHub Releases. No mock data.
      </div>

      <div class="flex items-center gap-5 text-xs font-bold">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="hover:text-purple-600 transition">GitHub</a>
        <span>•</span>
        <a href="./feed.xml" class="hover:text-purple-600 transition">RSS Feed</a>
        <span>•</span>
        <a href="./sitemap.xml" class="hover:text-purple-600 transition">Sitemap</a>
      </div>
    </div>
  </footer>`;
}

function renderToast() {
  return `
  <!-- Rainbow Toast Notification -->
  <div x-show="$store.app.toast.show"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 translate-y-4 scale-95"
       x-transition:enter-end="opacity-100 translate-y-0 scale-100"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="opacity-100 translate-y-0 scale-100"
       x-transition:leave-end="opacity-0 translate-y-4 scale-95"
       x-cloak
       class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border-2 border-purple-500/50"
       role="alert"
       aria-live="polite">
    <div class="w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs animate-rainbow-flow shadow-sm">
      ✓
    </div>
    <span x-text="$store.app.toast.message">Notification</span>
  </div>`;
}

async function buildIndex(catalog) {
  // Calculate 100% REAL statistics from actual GitHub data (NO MOCK DATA)
  const totalApps = catalog.apps.length;
  const totalStars = catalog.apps.reduce((sum, a) => sum + (a.repo?.stars || 0), 0);
  const totalDownloads = catalog.apps.reduce((sum, a) => sum + (a.totalDownloads || 0), 0);
  const totalReleases = catalog.apps.reduce((sum, a) => sum + (a.releases?.length || 0), 0);

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
<body class="bg-white text-slate-900 min-h-screen flex flex-col antialiased selection:bg-pink-500 selection:text-white"
      x-data="storefront">

  ${renderHeader("./")}

  <!-- Hero Section with Glowing Rainbow Aura -->
  <section class="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 bg-white">
    
    <!-- Background Animated Rainbow Aura Gradients -->
    <div class="absolute -top-36 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-pink-400/25 via-purple-400/25 via-cyan-400/25 to-amber-300/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
    <div class="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-pink-400/20 rounded-full blur-2xl pointer-events-none animate-rainbow-hue"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="max-w-3xl text-center sm:text-left">
        <!-- Floating Rainbow Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold rainbow-badge shadow-md shadow-purple-500/20 mb-5 animate-float">
          <span>✨</span>
          <span>Zero-Backend • Direct GitHub Releases</span>
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Discover &amp; Download <span class="rainbow-text">Top Open Source</span> Apps
        </h1>

        <p class="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed"
           x-text="$store.app.t('store.tagline', '${escapeHtml(catalog.store.description)}')">
          ${escapeHtml(catalog.store.description)}
        </p>
      </div>

      <!-- Real Live Stats Bar (100% Real data from GitHub API, NO MOCK DATA) -->
      <div class="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div class="bg-white border-2 border-slate-100 hover:border-pink-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-300">
          <div class="text-2xl sm:text-4xl font-black text-pink-600">${totalApps}</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Apps</div>
        </div>

        <div class="bg-white border-2 border-slate-100 hover:border-purple-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-300">
          <div class="text-2xl sm:text-4xl font-black text-purple-600">${totalStars.toLocaleString()}</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total GitHub Stars</div>
        </div>

        <div class="bg-white border-2 border-slate-100 hover:border-cyan-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-300">
          <div class="text-2xl sm:text-4xl font-black text-cyan-600">${totalDownloads.toLocaleString()}</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Binary Downloads</div>
        </div>

        <div class="bg-white border-2 border-slate-100 hover:border-amber-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-300">
          <div class="text-2xl sm:text-4xl font-black text-amber-500">${totalReleases}</div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Releases Indexed</div>
        </div>

      </div>

    </div>
  </section>

  <!-- Main Storefront App Directory -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
    
    <!-- Search & Filter Rainbow Control Box -->
    <div class="bg-white border-2 border-slate-100 rounded-3xl p-5 sm:p-7 shadow-sm mb-10 space-y-6">
      
      <!-- Top Row: Search Input + Sort Selection -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        <!-- Search bar with Rainbow Focus Ring -->
        <div class="relative flex-grow">
          <svg class="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text"
                 x-model="searchQuery"
                 class="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 text-sm font-medium text-slate-900 placeholder-slate-400 transition"
                 placeholder="Search software by name, description, tags, developer..."
                 :placeholder="$store.app.t('search.placeholder', 'Search apps, categories, tags, developers...')">
          
          <!-- Instant Clear Button -->
          <button type="button"
                  x-show="searchQuery.length > 0"
                  @click="searchQuery = ''"
                  class="absolute right-3.5 top-3.5 p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                  aria-label="Clear search input">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Sort Select Dropdown -->
        <div class="flex items-center gap-2">
          <select x-model="sortBy"
                  class="w-full sm:w-auto px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm">
            <option value="popular">🔥 Most Popular (Stars &amp; Downloads)</option>
            <option value="recent">⚡ Recently Updated</option>
            <option value="az">🔤 Name (A - Z)</option>
            <option value="newest">✨ Newly Added</option>
          </select>
        </div>
      </div>

      <!-- Categories Pills Bar -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-sm">
        <button type="button"
                @click="setCategory('all')"
                :class="selectedCategory === 'all' ? 'rainbow-button text-white font-extrabold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'"
                class="px-4 py-2 rounded-xl transition whitespace-nowrap text-xs sm:text-sm">
          All Categories
        </button>
        <template x-for="cat in categories" :key="cat">
          <button type="button"
                  @click="setCategory(cat)"
                  :class="selectedCategory === cat ? 'rainbow-button text-white font-extrabold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'"
                  class="px-4 py-2 rounded-xl transition whitespace-nowrap text-xs sm:text-sm"
                  x-text="cat">
          </button>
        </template>
      </div>

      <!-- OS Filters Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-slate-400 font-black uppercase tracking-wider text-[11px] mr-1">Filter by OS:</span>
          
          <button type="button"
                  @click="setPlatform('all')"
                  :class="selectedPlatform === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-xl transition font-semibold">
            All Platforms
          </button>

          <button type="button"
                  @click="setPlatform('windows')"
                  :class="selectedPlatform === 'windows' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-xl transition font-semibold">
            Windows
          </button>

          <button type="button"
                  @click="setPlatform('macos')"
                  :class="selectedPlatform === 'macos' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-xl transition font-semibold">
            macOS
          </button>

          <button type="button"
                  @click="setPlatform('linux')"
                  :class="selectedPlatform === 'linux' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-3 py-1.5 rounded-xl transition font-semibold">
            Linux
          </button>
        </div>

        <!-- Filter Reset Option -->
        <div x-show="activeFiltersCount > 0" class="flex items-center gap-2">
          <span class="text-slate-400 font-medium">Active filters: <strong class="text-purple-600" x-text="activeFiltersCount"></strong></span>
          <button type="button"
                  @click="resetFilters()"
                  class="text-xs font-bold text-red-500 hover:underline">
            Reset all
          </button>
        </div>

      </div>

    </div>

    <!-- Active Favorites Banner -->
    <div x-show="onlyFavorites"
         class="mb-6 flex items-center justify-between bg-amber-50 border-2 border-amber-200 px-5 py-3 rounded-2xl text-amber-900 text-sm shadow-sm">
      <div class="flex items-center gap-2 font-bold">
        <span>⭐</span>
        <span x-text="$store.app.t('search.showingFavs', 'Showing your favorited apps only')">Showing your favorited apps only</span>
      </div>
      <button type="button"
              @click="onlyFavorites = false"
              class="text-xs font-bold underline hover:no-underline text-amber-950">
        Show all apps
      </button>
    </div>

    <!-- Empty State -->
    <div x-show="!loading && filteredApps.length === 0"
         class="text-center py-20 bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
      <div class="w-16 h-16 mx-auto mb-4 rounded-3xl bg-purple-50 flex items-center justify-center text-3xl">
        🔍
      </div>
      <h3 class="text-xl font-bold text-slate-800"
          x-text="$store.app.t('search.noResults', 'No software found matching your search.')">
        No software found matching your search.
      </h3>
      <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
        Try adjusting your keywords or clearing your active filters.
      </p>
      <button type="button"
              @click="resetFilters()"
              class="mt-5 px-5 py-2.5 rainbow-button text-white rounded-xl text-sm font-bold shadow-md">
        Reset All Filters
      </button>
    </div>

    <!-- Apps Grid (Rainbow Card with Glowing Borders) -->
    <div x-show="!loading && filteredApps.length > 0"
         class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      <template x-for="app in filteredApps" :key="app.slug">
        <div class="rainbow-card p-6 border-2 border-slate-100 flex flex-col justify-between group">
          
          <div>
            <!-- Card Top: Icon, Name, Verified Badge, Favorite Button -->
            <div class="flex items-start justify-between gap-3">
              <a :href="'./apps/' + app.slug + '/'" class="flex items-center gap-3.5 flex-grow focus:outline-none">
                <img :src="app.icon"
                     :alt="app.name"
                     class="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-200"
                     loading="lazy">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="font-extrabold text-base text-slate-900 group-hover:text-purple-600 transition-colors truncate"
                        x-text="app.name">
                    </h3>
                    <template x-if="app.verified">
                      <span class="inline-flex text-blue-500" title="Verified Repository">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                      </span>
                    </template>
                  </div>
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider" x-text="app.category"></span>
                </div>
              </a>

              <!-- Favorite Button -->
              <button type="button"
                      @click.stop.prevent="$store.app.toggleFavorite(app.slug)"
                      class="p-2 rounded-xl hover:bg-amber-50 transition-colors focus:outline-none"
                      :class="$store.app.isFavorite(app.slug) ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-500'"
                      aria-label="Toggle favorite">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            </div>

            <!-- Description -->
            <p class="text-sm text-slate-600 mt-3.5 line-clamp-2 leading-relaxed"
               x-text="getAppTagline(app)">
            </p>

            <!-- Tags -->
            <div class="flex items-center gap-1.5 mt-4 flex-wrap">
              <template x-for="tag in (app.tags || []).slice(0, 3)" :key="tag">
                <span class="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg"
                      x-text="'#' + tag">
                </span>
              </template>
            </div>
          </div>

          <!-- Card Bottom Stats & Details Button -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3 text-xs font-bold text-slate-500">
              <!-- Stars -->
              <span class="flex items-center gap-1">
                <span class="text-amber-500">⭐</span>
                <span x-text="formatNumber(app.repo?.stars || 0)"></span>
              </span>

              <!-- Downloads -->
              <span class="flex items-center gap-1" x-show="app.totalDownloads > 0">
                <span class="text-blue-500">📥</span>
                <span x-text="formatNumber(app.totalDownloads)"></span>
              </span>

              <!-- Version Tag -->
              <span class="font-mono text-slate-400" x-text="app.latest?.tag || 'v1.0'"></span>
            </div>

            <!-- Detail link button -->
            <a :href="'./apps/' + app.slug + '/'"
               class="px-4 py-1.5 rounded-xl rainbow-button text-white text-xs font-extrabold shadow-sm">
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
<body class="bg-white text-slate-900 min-h-screen flex flex-col antialiased selection:bg-pink-500 selection:text-white"
      x-data="appDetail(${escapeHtml(appJson)})">

  ${renderHeader(rootPath)}

  <!-- Top Breadcrumb -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
    <a href="${rootPath}"
       class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
      </svg>
      <span x-text="$store.app.t('detail.back', 'Back to Software Store')">Back to Software Store</span>
    </a>
  </div>

  <!-- App Hero Banner with Glowing Rainbow Effect -->
  <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
    <div class="relative bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 overflow-hidden">
      
      <!-- Rainbow ambient aura in header -->
      <div class="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <!-- App Info -->
      <div class="relative flex items-start sm:items-center gap-6">
        <img src="${escapeHtml(app.icon)}"
             alt="${escapeHtml(app.name)}"
             class="w-20 h-20 sm:w-26 sm:h-26 rounded-3xl object-cover bg-slate-50 border-2 border-slate-100 shadow-md flex-shrink-0">
        
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ${escapeHtml(app.name)}
            </h1>
            
            ${app.verified ? `
              <span class="inline-flex items-center gap-1 text-xs font-bold rainbow-badge px-3 py-1 rounded-full shadow-sm">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Verified
              </span>
            ` : ""}
            
            ${app.stale ? `
              <span class="inline-flex text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                Stale Data
              </span>
            ` : ""}
          </div>

          <p class="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed font-medium"
             x-text="getAppTagline()">
            ${escapeHtml(app.tagline)}
          </p>

          <div class="flex items-center gap-4 mt-4 text-xs font-bold text-slate-500 flex-wrap">
            <span>By <a href="${escapeHtml(app.repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:underline">@${escapeHtml(app.owner)}</a></span>
            <span>•</span>
            <span class="flex items-center gap-1">⭐ ${app.repo.stars.toLocaleString()} Stars</span>
            <span>•</span>
            <span>License: <strong class="text-slate-800">${escapeHtml(app.repo.license || "Open Source")}</strong></span>
            <span>•</span>
            <span class="font-mono bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">${escapeHtml(app.latest?.tag || "Latest")}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        
        <!-- Primary 1-Click Smart Download Button with Rainbow Glow -->
        <template x-if="primaryAsset">
          <a :href="primaryAsset.url"
             class="px-7 py-4 rounded-2xl rainbow-button text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95 text-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <div>
              <div class="text-sm">Download for <span class="capitalize" x-text="userOS"></span></div>
              <div class="text-[11px] opacity-90 font-mono font-normal" x-text="formatBytes(primaryAsset.size)"></div>
            </div>
          </a>
        </template>

        <a href="#downloads-section"
           class="px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 font-bold text-sm text-center transition">
          All Files
        </a>

        <!-- Favorite Button -->
        <button type="button"
                @click="$store.app.toggleFavorite(app.slug)"
                class="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors focus:outline-none flex items-center justify-center"
                :class="$store.app.isFavorite(app.slug) ? 'text-amber-500 bg-amber-50' : 'text-slate-400'"
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
      
      <!-- Tabs Bar -->
      <div class="flex items-center gap-3 border-b-2 border-slate-100 text-sm font-black overflow-x-auto no-scrollbar">
        <button type="button"
                @click="setTab('overview')"
                :class="activeTab === 'overview' ? 'border-b-2 border-purple-600 text-purple-600 pb-3' : 'text-slate-500 hover:text-slate-800 pb-3'"
                class="transition whitespace-nowrap px-2">
          Overview &amp; README
        </button>
        <button type="button"
                @click="setTab('changelog')"
                :class="activeTab === 'changelog' ? 'border-b-2 border-purple-600 text-purple-600 pb-3' : 'text-slate-500 hover:text-slate-800 pb-3'"
                class="transition whitespace-nowrap px-2">
          Changelog (${escapeHtml(app.latest?.tag || "")})
        </button>
        <button type="button"
                @click="setTab('history')"
                :class="activeTab === 'history' ? 'border-b-2 border-purple-600 text-purple-600 pb-3' : 'text-slate-500 hover:text-slate-800 pb-3'"
                class="transition whitespace-nowrap px-2">
          Releases (${app.releases.length})
        </button>
      </div>

      <!-- Tab Content: Overview -->
      <div x-show="activeTab === 'overview'" class="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div class="prose max-w-none text-slate-700 text-sm leading-relaxed overflow-x-auto"
             x-html="renderedReadme || '<p class=\\'text-slate-400 italic\\'>No README available.</p>'">
        </div>
      </div>

      <!-- Tab Content: Changelog -->
      <div x-show="activeTab === 'changelog'" class="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 class="font-bold text-lg text-slate-900">${escapeHtml(app.latest?.name || app.latest?.tag || "Release")}</h3>
            <span class="text-xs text-slate-500">Published on ${escapeHtml(app.latest?.publishedAt ? new Date(app.latest.publishedAt).toLocaleDateString() : "-")}</span>
          </div>
          <span class="px-3 py-1 rainbow-badge font-mono text-xs font-bold rounded-lg shadow-sm">
            ${escapeHtml(app.latest?.tag || "")}
          </span>
        </div>
        <div class="prose max-w-none text-slate-700 text-sm leading-relaxed overflow-x-auto"
             x-html="renderedChangelog || '<p class=\\'text-slate-400 italic\\'>No release notes provided for this version.</p>'">
        </div>
      </div>

      <!-- Tab Content: History -->
      <div x-show="activeTab === 'history'" class="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <template x-for="rel in app.releases" :key="rel.tag">
          <div class="border-2 border-slate-100 hover:border-purple-300 rounded-2xl p-4 flex items-center justify-between gap-4 transition">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-sm text-slate-900" x-text="rel.tag"></span>
                <span x-show="rel.prerelease" class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Pre-release</span>
              </div>
              <span class="text-xs text-slate-400" x-text="formatDate(rel.publishedAt)"></span>
            </div>
            <a :href="'https://github.com/' + app.owner + '/' + app.repoName + '/releases/tag/' + rel.tag"
               target="_blank" rel="noopener noreferrer"
               class="text-xs font-bold text-purple-600 hover:underline">
              GitHub Release →
            </a>
          </div>
        </template>
      </div>

      <!-- Downloads & Assets Section -->
      <div id="downloads-section" class="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-black text-lg text-slate-900">All Downloadable Files</h3>
          <span class="text-xs font-mono font-bold text-purple-600" x-text="(app.latest?.assets || []).length + ' files'"></span>
        </div>
        <p class="text-xs text-slate-500 mb-6">Direct binary downloads from GitHub for ${escapeHtml(app.latest?.tag || "")}.</p>

        <!-- Desktop Asset Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th class="py-3 px-3 font-bold">File Name</th>
                <th class="py-3 px-2 font-bold">OS / Arch</th>
                <th class="py-3 px-2 font-bold">Size</th>
                <th class="py-3 px-2 font-bold">Checksum</th>
                <th class="py-3 px-3 font-bold text-right">Download</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template x-for="asset in app.latest?.assets || []" :key="asset.name">
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3.5 px-3 font-mono font-semibold text-xs text-slate-800 break-all" x-text="asset.name"></td>
                  <td class="py-3.5 px-2 text-xs">
                    <span class="inline-block px-2.5 py-1 rounded-lg font-bold text-[11px]"
                          :class="{
                            'bg-blue-100 text-blue-800': asset.os === 'windows',
                            'bg-purple-100 text-purple-800': asset.os === 'macos',
                            'bg-amber-100 text-amber-800': asset.os === 'linux',
                            'bg-slate-100 text-slate-600': !asset.os
                          }"
                          x-text="(asset.os || 'other') + (asset.arch ? ' (' + asset.arch + ')' : '')">
                    </span>
                  </td>
                  <td class="py-3.5 px-2 text-xs text-slate-500 whitespace-nowrap" x-text="formatBytes(asset.size)"></td>
                  <td class="py-3.5 px-2 text-xs">
                    <template x-if="asset.sha256">
                      <button type="button"
                              @click="copy(asset.sha256, asset.name)"
                              class="font-mono text-[11px] text-purple-600 hover:underline flex items-center gap-1 font-bold">
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
                       class="px-4 py-2 rounded-xl rainbow-button text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
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
            <div class="border-2 border-slate-100 rounded-2xl p-4 space-y-2">
              <div class="font-mono text-xs font-bold text-slate-800 break-all" x-text="asset.name"></div>
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold uppercase tracking-wider text-slate-500" x-text="asset.os || 'Universal'"></span>
                <span class="text-slate-400 font-semibold" x-text="formatBytes(asset.size)"></span>
              </div>
              <div class="pt-2 flex items-center justify-between gap-2">
                <template x-if="asset.sha256">
                  <button type="button"
                          @click="copy(asset.sha256, asset.name)"
                          class="text-xs font-bold text-purple-600 hover:underline">
                    Copy SHA-256
                  </button>
                </template>
                <a :href="asset.url"
                   class="px-4 py-2 rounded-xl rainbow-button text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm">
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
      <div class="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 class="font-black text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📦</span>
          <span>Package Managers</span>
        </h3>

        <div class="space-y-3">
          ${Object.entries(app.install || {}).map(([pm, cmd]) => `
            <div class="space-y-1">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(pm)}</span>
              <div class="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                <code class="text-xs font-mono text-slate-800 truncate select-all mr-2">${escapeHtml(cmd)}</code>
                <button type="button"
                        @click="copy('${escapeHtml(cmd)}', '${escapeHtml(pm)}')"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 transition"
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

      <!-- Repository Information Card -->
      <div class="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 class="font-black text-sm text-slate-900 uppercase tracking-wider mb-2">
          Repository Details
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">GitHub</span>
            <a href="${escapeHtml(app.repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="font-bold text-purple-600 hover:underline">
              ${escapeHtml(app.owner)}/${escapeHtml(app.repoName)}
            </a>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">License</span>
            <span class="font-bold text-slate-800">${escapeHtml(app.repo.license || "Open Source")}</span>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">Total Downloads</span>
            <span class="font-bold text-slate-800" x-text="formatNumber(app.totalDownloads)"></span>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">Forks</span>
            <span class="font-bold text-slate-800">${app.repo.forks.toLocaleString()}</span>
          </div>
          <div class="py-2.5 flex items-center justify-between">
            <span class="text-slate-500">Open Issues</span>
            <span class="font-bold text-slate-800">${app.repo.openIssues.toLocaleString()}</span>
          </div>
        </div>

        <div class="pt-2">
          <a href="${escapeHtml(app.repo.htmlUrl)}/issues/new"
             target="_blank" rel="noopener noreferrer"
             class="w-full py-3 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition">
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
  console.log("🌈 Building Bright White Rainbow-Themed Pages...");

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

  console.log("✅ Rainbow white theme site generation complete!");
}

main().catch((err) => {
  console.error("❌ Fatal error in build-site:", err);
  process.exit(1);
});
