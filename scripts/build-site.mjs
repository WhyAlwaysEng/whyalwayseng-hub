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
  <!-- Minimalist Navbar (Linear / Vercel style) -->
  <header class="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <a href="${rootPath}" class="flex items-center gap-2.5 group focus:outline-none">
        <div class="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
          ⬡
        </div>
        <span class="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
          Software Hub
        </span>
      </a>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-2">
        
        <!-- Favorites Counter Button -->
        <a href="${rootPath}?favorites=1"
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
           title="Saved Favorites">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-amber-500 flex-shrink-0">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span class="hidden sm:inline" x-text="$store.app.t('nav.favorites', 'Favorites')">Favorites</span>
          <span class="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400"
                x-text="$store.app.favorites.length"
                x-show="$store.app.favorites.length > 0">
          </span>
        </a>

        <!-- Language Switcher -->
        <button type="button"
                @click="$store.app.toggleLang()"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold font-mono border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                aria-label="Switch Language">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span x-text="$store.app.lang === 'en' ? 'TH' : 'EN'">TH</span>
        </button>

        <!-- Theme Toggle (Moon / Sun) -->
        <button type="button"
                @click="$store.app.toggleTheme()"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                aria-label="Toggle Theme Mode"
                title="Toggle Dark / Light Mode">
          <!-- Sun icon when dark mode is on -->
          <svg x-show="$store.app.theme === 'dark'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <!-- Moon icon when light mode is on -->
          <svg x-show="$store.app.theme !== 'dark'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-700">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <span class="hidden sm:inline text-xs font-mono" x-text="$store.app.theme === 'dark' ? 'Light' : 'Dark'">Light</span>
        </button>

      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <!-- Minimalist Footer -->
  <footer class="border-t border-zinc-200/80 dark:border-zinc-800/80 py-10 mt-20 text-xs text-zinc-500">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-zinc-800 dark:text-zinc-200">GitHub Software Store Hub</span>
        <span>•</span>
        <span>Zero-Backend</span>
      </div>
      <div class="flex items-center gap-4 text-zinc-500">
        <a href="./feed.xml" class="hover:text-zinc-800 dark:hover:text-zinc-200 transition">RSS</a>
        <a href="./sitemap.xml" class="hover:text-zinc-800 dark:hover:text-zinc-200 transition">Sitemap</a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-800 dark:hover:text-zinc-200 transition">GitHub</a>
      </div>
    </div>
  </footer>`;
}

function renderToast() {
  return `
  <!-- Minimal Pill Toast -->
  <div x-show="$store.app.toast.show"
       x-transition:enter="transition ease-out duration-200"
       x-transition:enter-start="opacity-0 translate-y-2 scale-95"
       x-transition:enter-end="opacity-100 translate-y-0 scale-100"
       x-transition:leave="transition ease-in duration-150"
       x-transition:leave-start="opacity-100 translate-y-0 scale-100"
       x-transition:leave-end="opacity-0 translate-y-2 scale-95"
       x-cloak
       class="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full px-4 py-2 text-xs font-medium shadow-lg flex items-center gap-2"
       role="alert"
       aria-live="polite">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
    <span x-text="$store.app.toast.message"></span>
  </div>`;
}

async function buildIndex(catalog) {
  // Compute real statistics from actual GitHub data
  const totalApps = catalog.apps.length;
  const totalStars = catalog.apps.reduce((sum, a) => sum + (a.repo?.stars || 0), 0);
  const totalDownloads = catalog.apps.reduce((sum, a) => sum + (a.totalDownloads || 0), 0);

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
             img-src 'self' data: blob: https:;
             frame-src https://giscus.app https://www.youtube-nocookie.com;
             connect-src 'self';
             base-uri 'self'; form-action 'none'">

  <!-- Immediate Theme Initialization (prevents flash) -->
  <script>
    (function() {
      const theme = localStorage.getItem('theme') || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>

  <link rel="stylesheet" href="./styles.css">
  <link rel="manifest" href="./manifest.webmanifest">

  <!-- Core App Scripts -->
  <script src="./vendor/marked.min.js"></script>
  <script src="./vendor/purify.min.js"></script>
  <script src="./vendor/fuse.min.js"></script>
  <script src="./app.js"></script>
  <script src="./vendor/alpine.min.js" defer></script>
</head>
<body class="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen flex flex-col antialiased transition-colors"
      x-data="storefront">

  ${renderHeader("./")}

  <!-- Compact Hero & Stats Header -->
  <section class="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6 w-full">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
      
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
            x-text="$store.app.t('store.title', '${escapeHtml(catalog.store.name)}')">
          ${escapeHtml(catalog.store.name)}
        </h1>
        <p class="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl"
           x-text="$store.app.t('store.tagline', '${escapeHtml(catalog.store.description)}')">
          ${escapeHtml(catalog.store.description)}
        </p>
      </div>

      <!-- Compact Inline Stats Pills (100% Real Data) -->
      <div class="flex items-center gap-2 flex-wrap text-xs font-mono">
        <div class="px-2.5 py-1 rounded-md bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300">
          <span class="font-bold text-zinc-900 dark:text-zinc-100">${totalApps}</span> apps
        </div>
        <div class="px-2.5 py-1 rounded-md bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300">
          ⭐ <span class="font-bold text-zinc-900 dark:text-zinc-100">${totalStars.toLocaleString()}</span> stars
        </div>
        <div class="px-2.5 py-1 rounded-md bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300">
          📥 <span class="font-bold text-zinc-900 dark:text-zinc-100">${totalDownloads.toLocaleString()}</span> downloads
        </div>
      </div>

    </div>
  </section>

  <!-- Unified Command & Filter Bar -->
  <main class="max-w-5xl mx-auto px-4 sm:px-6 flex-grow w-full space-y-6">
    
    <div class="space-y-3">
      
      <!-- Spotlight Command Search Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div class="relative flex-grow">
          <svg class="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text"
                 id="search-input"
                 x-model="searchQuery"
                 class="w-full pl-9 pr-14 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition"
                 placeholder="Search software (name, tag, author)..."
                 :placeholder="$store.app.t('search.placeholder', 'Search software (name, tag, author)...')">
          
          <!-- Shortcut Hint Badge "/" -->
          <kbd class="pointer-events-none absolute right-3 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700">
            /
          </kbd>
        </div>

        <!-- Sort Select -->
        <select x-model="sortBy"
                class="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer">
          <option value="popular">Popular (Stars/Downloads)</option>
          <option value="recent">Recently Updated</option>
          <option value="az">Alphabetical (A - Z)</option>
          <option value="newest">Newly Added</option>
        </select>
      </div>

      <!-- Segmented Filters Row: Categories & Platforms -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        
        <!-- Category Filter Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button type="button"
                  @click="setCategory('all')"
                  :class="selectedCategory === 'all' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs cursor-pointer">
            All
          </button>
          <template x-for="cat in categories" :key="cat">
            <button type="button"
                    @click="setCategory(cat)"
                    :class="selectedCategory === cat ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-md transition whitespace-nowrap text-xs cursor-pointer"
                    x-text="cat">
            </button>
          </template>
        </div>

        <!-- OS Filter Buttons -->
        <div class="flex items-center gap-1 font-mono text-[11px] flex-shrink-0">
          <button type="button"
                  @click="setPlatform('all')"
                  :class="selectedPlatform === 'all' ? 'text-zinc-950 dark:text-white font-bold border-b border-zinc-950 dark:border-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'"
                  class="px-1.5 pb-0.5 transition cursor-pointer">ALL</button>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <button type="button"
                  @click="setPlatform('windows')"
                  :class="selectedPlatform === 'windows' ? 'text-zinc-950 dark:text-white font-bold border-b border-zinc-950 dark:border-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'"
                  class="px-1.5 pb-0.5 transition cursor-pointer">WIN</button>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <button type="button"
                  @click="setPlatform('macos')"
                  :class="selectedPlatform === 'macos' ? 'text-zinc-950 dark:text-white font-bold border-b border-zinc-950 dark:border-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'"
                  class="px-1.5 pb-0.5 transition cursor-pointer">MAC</button>
          <span class="text-zinc-300 dark:text-zinc-700">/</span>
          <button type="button"
                  @click="setPlatform('linux')"
                  :class="selectedPlatform === 'linux' ? 'text-zinc-950 dark:text-white font-bold border-b border-zinc-950 dark:border-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'"
                  class="px-1.5 pb-0.5 transition cursor-pointer">LINUX</button>
        </div>

      </div>

    </div>

    <!-- Active Filter Reset Banner -->
    <div x-show="activeFiltersCount > 0"
         class="flex items-center justify-between text-xs py-1.5 px-3 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
      <div class="flex items-center gap-1.5">
        <span>Active filters:</span>
        <span class="font-mono font-bold text-zinc-900 dark:text-zinc-100" x-text="activeFiltersCount"></span>
      </div>
      <button type="button"
              @click="resetFilters()"
              class="font-medium text-red-500 hover:underline cursor-pointer">
        Reset
      </button>
    </div>

    <!-- Empty State -->
    <div x-show="!loading && filteredApps.length === 0"
         class="text-center py-16 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-900/30 p-8">
      <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        No software found matching query.
      </p>
      <button type="button"
              @click="resetFilters()"
              class="mt-3 px-3 py-1.5 text-xs font-semibold rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
        Clear filters
      </button>
    </div>

    <!-- Redesigned Minimal Bento Cards Grid -->
    <div x-show="!loading && filteredApps.length > 0"
         class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      <template x-for="app in filteredApps" :key="app.slug">
        <a :href="'./apps/' + app.slug + '/'"
           class="group block p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition-all duration-150 flex flex-col justify-between">
          
          <div>
            <!-- Card Header: Icon, Name, Favorite Star -->
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-center gap-3 min-w-0">
                <img :src="app.icon"
                     :alt="app.name"
                     class="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 p-0.5 flex-shrink-0"
                     loading="lazy"
                     @error="$event.target.src = 'https://avatars.githubusercontent.com/' + app.owner">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        x-text="app.name">
                    </h3>
                    <template x-if="app.verified">
                      <span class="text-blue-500 flex-shrink-0" title="Verified">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                      </span>
                    </template>
                  </div>
                  <span class="text-[11px] text-zinc-500 font-mono" x-text="app.category"></span>
                </div>
              </div>

              <!-- Favorite Button -->
              <button type="button"
                      @click.stop.prevent="$store.app.toggleFavorite(app.slug)"
                      class="p-1 rounded text-zinc-400 hover:text-amber-500 transition focus:outline-none cursor-pointer"
                      :class="$store.app.isFavorite(app.slug) ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'"
                      aria-label="Favorite">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            </div>

            <!-- Description -->
            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed"
               x-text="getAppTagline(app)">
            </p>
          </div>

          <!-- Card Footer: Version, Platforms, Stars -->
          <div class="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span class="text-zinc-400 dark:text-zinc-500" x-text="app.latest?.tag || 'latest'"></span>
            
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                <span class="text-amber-500">★</span>
                <span x-text="formatNumber(app.repo?.stars || 0)"></span>
              </span>
            </div>
          </div>

        </a>
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

  const primaryInstallCommand = Object.values(app.install || {})[0] || null;

  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="site-root" content="${rootPath}">
  <title>${escapeHtml(app.name)} - Software Hub</title>
  <meta name="description" content="${escapeHtml(app.tagline || app.name)}">
  
  <meta property="og:title" content="${escapeHtml(app.name)}">
  <meta property="og:description" content="${escapeHtml(app.tagline || app.name)}">
  <meta property="og:image" content="${escapeHtml(app.icon)}">
  <meta property="og:type" content="website">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(app.name)}">
  <meta name="twitter:description" content="${escapeHtml(app.tagline || app.name)}">
  <meta name="twitter:image" content="${escapeHtml(app.icon)}">

  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>

  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
             script-src 'self' 'unsafe-eval' https://giscus.app;
             style-src 'self' 'unsafe-inline';
             img-src 'self' data: blob: https:;
             frame-src https://giscus.app https://www.youtube-nocookie.com;
             connect-src 'self';
             base-uri 'self'; form-action 'none'">

  <!-- Immediate Theme Initialization (prevents flash) -->
  <script>
    (function() {
      const theme = localStorage.getItem('theme') || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>

  <link rel="stylesheet" href="${rootPath}styles.css">

  <!-- Core App Scripts -->
  <script src="${rootPath}vendor/marked.min.js"></script>
  <script src="${rootPath}vendor/purify.min.js"></script>
  <script src="${rootPath}app.js"></script>
  <script src="${rootPath}vendor/alpine.min.js" defer></script>
</head>
<body class="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen flex flex-col antialiased transition-colors"
      x-data="appDetail(${escapeHtml(appJson)})">

  ${renderHeader(rootPath)}

  <!-- Top Breadcrumb -->
  <div class="max-w-5xl mx-auto px-4 sm:px-6 pt-6 w-full">
    <a href="${rootPath}"
       class="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer">
      <span>←</span>
      <span x-text="$store.app.t('detail.back', 'Back to Store')">Back to Store</span>
    </a>
  </div>

  <!-- App Header Box -->
  <header class="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
    <div class="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
      
      <!-- Left: Icon, Titles, Badges, Author, Sponsor -->
      <div class="flex items-start gap-4">
        <img src="${escapeHtml(app.icon)}"
             alt="${escapeHtml(app.name)}"
             class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 p-1 flex-shrink-0"
             onerror="this.src='https://avatars.githubusercontent.com/${escapeHtml(app.owner)}'">
        
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              ${escapeHtml(app.name)}
            </h1>
            
            ${app.verified ? `
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                Verified
              </span>
            ` : ""}
            
            <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              ${escapeHtml(app.latest?.tag || "latest")}
            </span>

            ${app.sponsor ? `
              <a href="${escapeHtml(app.sponsor)}" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 px-2 py-0.5 rounded border border-pink-200 dark:border-pink-900 transition">
                <span>💖</span>
                <span>Sponsor</span>
              </a>
            ` : ""}
          </div>

          <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed"
             x-text="getAppTagline()">
            ${escapeHtml(app.tagline)}
          </p>

          <div class="flex items-center gap-3 mt-3 text-xs text-zinc-500 font-mono flex-wrap">
            <span>By <a href="${escapeHtml(app.repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="hover:underline text-zinc-700 dark:text-zinc-300">@${escapeHtml(app.owner)}</a></span>
            <span>•</span>
            <span>⭐ ${app.repo.stars.toLocaleString()}</span>
            <span>•</span>
            <span>${escapeHtml(app.repo.license || "Open Source")}</span>
            ${app.website ? `
              <span>•</span>
              <a href="${escapeHtml(app.website)}" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-500 font-sans">Website ↗</a>
            ` : ""}
          </div>
        </div>
      </div>

      <!-- Right: Smart 1-Click Download Box -->
      <div class="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
        
        <template x-if="primaryAsset">
          <a :href="primaryAsset.url"
             class="px-5 py-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold text-center flex items-center justify-center gap-2 transition shadow-xs cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <div>
              <span>Download for <span class="capitalize" x-text="userOS"></span></span>
              <span class="opacity-70 font-mono font-normal ml-1" x-text="'(' + formatBytes(primaryAsset.size) + ')'"></span>
            </div>
          </a>
        </template>

        <a href="#downloads-table"
           class="text-[11px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-center transition cursor-pointer">
          View all release assets ↓
        </a>

      </div>

    </div>
  </header>

  <!-- Quick CLI & SHA-256 Bar -->
  <section class="max-w-5xl mx-auto px-4 sm:px-6 w-full">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
      
      <!-- CLI Install Command Snippet -->
      ${primaryInstallCommand ? `
      <div class="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-zinc-400">$</span>
          <code class="truncate text-zinc-800 dark:text-zinc-200 select-all">${escapeHtml(primaryInstallCommand)}</code>
        </div>
        <button type="button"
                @click="copy('${escapeHtml(primaryInstallCommand)}', 'cli')"
                class="ml-2 text-zinc-400 hover:text-zinc-100 transition focus:outline-none cursor-pointer"
                title="Copy Command">
          <span x-show="copiedKey === 'cli'" class="text-emerald-400 font-bold">✓</span>
          <span x-show="copiedKey !== 'cli'">copy</span>
        </button>
      </div>
      ` : `
      <div class="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-zinc-500">
        <span>Repository:</span>
        <a href="${escapeHtml(app.repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="hover:underline">${escapeHtml(app.owner)}/${escapeHtml(app.repoName)}</a>
      </div>
      `}

      <!-- Quick SHA-256 Box -->
      <div class="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-zinc-400">SHA256:</span>
          <span class="truncate text-zinc-600 dark:text-zinc-400" x-text="primaryAsset?.sha256 ? primaryAsset.sha256.slice(0, 16) + '...' : 'Available in release'"></span>
        </div>
        <template x-if="primaryAsset?.sha256">
          <button type="button"
                  @click="copy(primaryAsset.sha256, 'sha')"
                  class="ml-2 text-zinc-400 hover:text-zinc-100 transition focus:outline-none cursor-pointer"
                  title="Copy SHA-256">
            <span x-show="copiedKey === 'sha'" class="text-emerald-400 font-bold">✓</span>
            <span x-show="copiedKey !== 'sha'">copy</span>
          </button>
        </template>
      </div>

    </div>
  </section>

  <!-- Media Gallery (Screenshots & Video) -->
  ${(app.screenshots && app.screenshots.length > 0) || app.video ? `
  <section class="max-w-5xl mx-auto px-4 sm:px-6 pt-4 w-full">
    <div class="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 space-y-3">
      <div class="flex items-center justify-between text-xs text-zinc-500 font-medium">
        <span class="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Screenshots & Media
        </span>
        <span class="text-[11px] text-zinc-400">Click to expand in lightbox</span>
      </div>
      
      <div class="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar rounded-xl">
        ${app.video ? `
        <div class="flex-shrink-0 w-80 h-48 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black">
          <iframe src="${escapeHtml(app.video)}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
        </div>
        ` : ""}
        ${(app.screenshots || []).map((img, idx) => `
        <button type="button"
                @click="openLightbox('${escapeHtml(img)}')"
                class="flex-shrink-0 group relative rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900/60 transition hover:border-zinc-400 dark:hover:border-zinc-600 focus:outline-none cursor-zoom-in">
          <img src="${escapeHtml(img)}"
               alt="${escapeHtml(app.name)} preview ${idx + 1}"
               class="h-44 sm:h-52 w-auto max-w-sm sm:max-w-md object-cover rounded-xl transition duration-200 group-hover:scale-[1.01]"
               loading="lazy"
               onerror="this.parentElement.style.display='none'">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded-xl"></div>
        </button>
        `).join("")}
      </div>
    </div>
  </section>
  ` : ""}

  <!-- Clean Interactive Tabs -->
  <main class="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-grow w-full space-y-6">
    
    <!-- Tab Navigation Bar -->
    <div class="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium">
      <button type="button"
              @click="setTab('overview')"
              :class="activeTab === 'overview' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold pb-2.5 -mb-px' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 pb-2.5'"
              class="transition cursor-pointer">
        Overview
      </button>
      <button type="button"
              @click="setTab('changelog')"
              :class="activeTab === 'changelog' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold pb-2.5 -mb-px' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 pb-2.5'"
              class="transition cursor-pointer">
        Changelog
      </button>
      <button type="button"
              @click="setTab('history')"
              :class="activeTab === 'history' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold pb-2.5 -mb-px' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 pb-2.5'"
              class="transition cursor-pointer">
        Releases (${app.releases.length})
      </button>
      <button type="button"
              @click="setTab('downloads')"
              :class="activeTab === 'downloads' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold pb-2.5 -mb-px' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 pb-2.5'"
              class="transition cursor-pointer">
        Downloads (${(app.latest?.assets || []).length})
      </button>
      <button type="button"
              @click="setTab('community')"
              :class="activeTab === 'community' ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold pb-2.5 -mb-px' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 pb-2.5'"
              class="transition cursor-pointer">
        Discussion
      </button>
    </div>

    <!-- Tab 1: Overview -->
    <div x-show="activeTab === 'overview'" class="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30">
      <div class="markdown-body"
           x-html="renderedReadme || '<p class=\\'text-zinc-500 italic\\'>No README available for this project.</p>'">
      </div>
    </div>

    <!-- Tab 2: Changelog -->
    <div x-show="activeTab === 'changelog'" class="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100">${escapeHtml(app.latest?.name || app.latest?.tag || "Release")}</h3>
          <span class="text-xs font-mono text-zinc-500">Released on ${escapeHtml(app.latest?.publishedAt ? new Date(app.latest.publishedAt).toLocaleDateString() : "-")}</span>
        </div>
        <span class="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          ${escapeHtml(app.latest?.tag || "")}
        </span>
      </div>
      <div class="markdown-body"
           x-html="renderedChangelog || '<p class=\\'text-zinc-500 italic\\'>No changelog provided for this release.</p>'">
      </div>
    </div>

    <!-- Tab 3: History -->
    <div x-show="activeTab === 'history'" class="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 space-y-3 font-mono text-xs">
      <template x-for="rel in app.releases" :key="rel.tag">
        <div class="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition">
          <div class="flex items-center gap-3">
            <span class="font-bold text-zinc-900 dark:text-zinc-100" x-text="rel.tag"></span>
            <span x-show="rel.prerelease" class="text-[10px] text-amber-500 border border-amber-500/30 px-1 rounded">pre-release</span>
            <span class="text-zinc-400" x-text="formatDate(rel.publishedAt)"></span>
          </div>
          <a :href="'https://github.com/' + app.owner + '/' + app.repoName + '/releases/tag/' + rel.tag"
             target="_blank" rel="noopener noreferrer"
             class="text-blue-500 hover:underline">
            GitHub →
          </a>
        </div>
      </template>
    </div>

    <!-- Tab 4 & Downloads Anchor: Asset Matrix Table -->
    <div id="downloads-table"
         x-show="activeTab === 'downloads' || true"
         class="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 space-y-4">
      
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100">Release Assets (${escapeHtml(app.latest?.tag || "")})</h3>
        <span class="text-xs font-mono text-zinc-500" x-text="(app.latest?.assets || []).length + ' files'"></span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left font-mono text-xs">
          <thead class="text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th class="py-2.5 px-3">Filename</th>
              <th class="py-2.5 px-2">Platform</th>
              <th class="py-2.5 px-2">Size</th>
              <th class="py-2.5 px-2">Checksum</th>
              <th class="py-2.5 px-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            <template x-for="asset in app.latest?.assets || []" :key="asset.name">
              <tr class="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition">
                <td class="py-2.5 px-3 text-zinc-800 dark:text-zinc-200 break-all font-semibold" x-text="asset.name"></td>
                <td class="py-2.5 px-2 text-zinc-500">
                  <span class="uppercase text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800"
                        x-text="(asset.os || 'other') + (asset.arch ? ' ' + asset.arch : '')">
                  </span>
                </td>
                <td class="py-2.5 px-2 text-zinc-400 whitespace-nowrap" x-text="formatBytes(asset.size)"></td>
                <td class="py-2.5 px-2">
                  <template x-if="asset.sha256">
                    <button type="button"
                            @click="copy(asset.sha256, asset.name)"
                            class="text-blue-500 hover:underline cursor-pointer">
                      <span x-text="copiedKey === asset.name ? '✓ Copied' : asset.sha256.slice(0, 8) + '...'"></span>
                    </button>
                  </template>
                  <template x-if="!asset.sha256">
                    <span class="text-zinc-500 italic">-</span>
                  </template>
                </td>
                <td class="py-2.5 px-3 text-right whitespace-nowrap">
                  <a :href="asset.url"
                     class="px-2.5 py-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[11px] hover:opacity-90 transition cursor-pointer">
                    Download
                  </a>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Tab 5: Community & Discussion (Giscus) -->
    <div x-show="activeTab === 'community'" class="p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100">Community Discussion &amp; Feedback</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Powered by GitHub Discussions. Sign in with GitHub to share your feedback or ask questions.</p>
        </div>
        <a href="${escapeHtml(app.repo.htmlUrl)}/discussions"
           target="_blank" rel="noopener noreferrer"
           class="text-xs text-blue-500 hover:underline font-medium">
          Open on GitHub ↗
        </a>
      </div>

      <div class="py-4 text-center">
        <a href="${escapeHtml(app.repo.htmlUrl)}/issues"
           target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Join Discussion on GitHub</span>
        </a>
      </div>
    </div>

  </main>

  <!-- Image Lightbox Modal -->
  <div x-show="activeLightboxImg"
       x-transition.opacity
       @click="closeLightbox()"
       class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
       x-cloak>
    <img :src="activeLightboxImg" class="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain border border-zinc-800" @click.stop>
    <button type="button"
            @click="closeLightbox()"
            class="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700 focus:outline-none">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>

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
  console.log("⚡ Building Ultra-Minimalist Pages with 12 Curated Apps & Media/Community...");

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

  console.log("✅ Site generation complete!");
}

main().catch((err) => {
  console.error("❌ Fatal error in build-site:", err);
  process.exit(1);
});
