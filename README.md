# ⬡ WhyAlwaysEng Hub

> **A high-performance, zero-backend personal software distribution hub and store powered 100% by GitHub Releases.**

[![CI/CD Status](https://github.com/WhyAlwaysEng/whyalwayseng-hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/WhyAlwaysEng/whyalwayseng-hub/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Tailwind v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-3.x-8bc0d0.svg)](https://alpinejs.dev)
[![Security Tested](https://img.shields.io/badge/Security-XSS_Disarmed-emerald.svg)](scripts/test-security.mjs)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-f59e0b.svg)](src/manifest.webmanifest)

---

## 🌟 Overview

**WhyAlwaysEng Hub** is an ultra-fast, minimalist personal application distribution store. It eliminates the need for complex databases, backend servers, or paid hosting by using GitHub Repositories and GitHub Releases as the single source of truth.

- **Zero-Backend Architecture:** 100% Static Site Generation (SSG). Client browsers query cached static JSON and pre-rendered HTML without ever hitting runtime GitHub API rate limits.
- **Ultra-Minimalist Aesthetic:** Clean monochrome typography inspired by Linear, Raycast, and Vercel with flawless class-based Dark & Light mode toggle.
- **Smart OS & Architecture Detection:** Automatically detects whether visitors are on Windows, macOS, or Linux (x64 / arm64) and highlights the direct 1-click installer download.
- **Uniform Media Gallery:** Displays 16:9 aspect-ratio screenshots and demonstration videos with an expandable full-screen Lightbox modal (`Esc` to close).
- **Admin Command Center (`/admin`):** Integrated web dashboard to inspect, import, and delete software with live preview cards.
- **GitHub PAT Security Gate:** In production, the `/admin` dashboard is locked by a GitHub Personal Access Token gate, ensuring only you can manage your applications.
- **Automated Cloud Sync (GitHub Actions):** Runs every midnight UTC to fetch the latest releases, download counts, and commit hashes without you having to leave your computer on.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** Vanilla JavaScript (ES Modules) + [Alpine.js](https://alpinejs.dev) for lightweight reactive states.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with `@variant dark` class toggle and custom typography.
- **Search Engine:** Client-side fuzzy keyword search powered by [Fuse.js](https://www.fusejs.io).
- **Markdown & Release Notes:** [marked.js](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify) for 100% XSS-safe rendering.
- **Schema Validation:** Strict JSON Schema validation using [Ajv](https://ajv.js.org).
- **Hosting & CI/CD:** GitHub Pages + GitHub Actions.

---

## 📁 Repository Structure

```
whyalwayseng-hub/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated daily build & GitHub Pages deploy
├── data/
│   └── catalog.json            # Compiled catalog snapshot with releases
├── locales/
│   ├── en.json                 # English localization strings
│   └── th.json                 # Thai localization strings
├── schema/
│   └── projects.schema.json    # JSON Schema definition for projects.json
├── scripts/
│   ├── build-catalog.mjs       # Scrapes GitHub API and compiles catalog
│   ├── build-site.mjs          # SSG generator for pages, sitemap & RSS feed
│   ├── dev-server.mjs          # Local dev server with Admin REST API
│   ├── manage-apps.mjs         # CLI tool for 1-click app additions/removals
│   ├── test-security.mjs       # Automated XSS & regex unit test suite
│   └── validate.mjs            # Ajv schema validator
├── src/
│   ├── admin.html              # Store Admin Command Center
│   ├── app.js                  # Client Alpine.js logic & stores
│   ├── favicon.svg             # Vector brand icon matching navbar
│   ├── manifest.webmanifest    # PWA install manifest
│   ├── styles.css              # Tailwind CSS v4 root stylesheet
│   └── sw.js                   # Service Worker for offline capability
├── projects.json               # Config of active applications in store
└── projects.example.json       # Backup reference list of top open-source tools
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org) v20.x or v22.x+
- npm v10+

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/whyalwayseng-hub.git
   cd whyalwayseng-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   - Storefront: [http://localhost:3000](http://localhost:3000)
   - Admin Command Center: [http://localhost:3000/admin](http://localhost:3000/admin)

4. **Run automated security & quality tests:**
   ```bash
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📦 Managing Software in Your Store

### Option 1: Via CLI (Fastest)

- **Add an application:**
  ```bash
  npm run app:add <owner>/<repo>
  # Example:
  npm run app:add WhyAlwaysEng/my-desktop-tool
  ```
  The script automatically inspects the repo, detects `.exe`, `.msi`, `.dmg`, or `.deb` assets, generates regex rules, and writes to `projects.json`.

- **Remove an application:**
  ```bash
  npm run app:remove <slug>
  # Example:
  npm run app:remove github-cli
  ```

---

### Option 2: Via Admin Web Dashboard

1. Launch dev server: `npm run dev`
2. Open [http://localhost:3000/admin](http://localhost:3000/admin)
3. Paste any GitHub repository URL into the **Import Software** box.
4. Click **Analyze** to review the live bento preview card, edit categories, and select platforms.
5. Click **Save to Store** — changes are instantly saved to `projects.json`!
6. Click **⚡ Rebuild** to refresh the static HTML pages.

---

## 🚀 Production Deployment (GitHub Pages)

### 1. Push Code to GitHub
```bash
git remote add origin https://github.com/<your-username>/whyalwayseng-hub.git
git branch -M master
git push -u origin master
```

### 2. Enable GitHub Pages
1. On GitHub, navigate to **Settings** > **Pages**.
2. Under **Build and deployment > Source**, select **`GitHub Actions`**.
3. Under **Settings** > **Actions** > **General** > **Workflow permissions**, choose **`Read and write permissions`** (so the GitHub Actions bot can update release statistics).

### 3. All Done!
Within 1-2 minutes, your store will be live at:
`https://<your-username>.github.io/<your-repo-name>/`

---

## 🔒 Security & Quality Assurance

- **Strict Content Security Policy (CSP):** All inline scripts, unsafe connections, and untrusted frames are disarmed.
- **Automated XSS Prevention:** Release changelogs and README markdown are passed through a double-pass pipeline: `marked` parsing followed by aggressive sanitization via `DOMPurify`.
- **Verified Regex Rule Sets:** Prevents regex overlap bugs (e.g., ensuring `darwin` is never falsely categorized as `windows`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built by **WhyAlwaysEng**.
