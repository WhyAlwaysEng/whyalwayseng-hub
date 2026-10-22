import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

export function parseRepoInput(input) {
  if (!input) throw new Error("No repository provided");
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\/github\.com\//i, "");
  cleaned = cleaned.replace(/\.git$/i, "");
  cleaned = cleaned.replace(/^\/+|\/+$/g, "");
  const parts = cleaned.split("/");
  if (parts.length < 2) {
    throw new Error(`Invalid GitHub repository format: "${input}". Expected "owner/repo" or GitHub URL.`);
  }
  return { owner: parts[0], repo: parts[1] };
}

async function fetchGitHub(endpoint) {
  const headers = {
    "User-Agent": "github-software-store-manager",
    Accept: "application/vnd.github+json",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com${endpoint}`, { headers });
  if (res.status === 404) return null;
  if (res.status === 403) {
    console.warn("  ⚠️ GitHub API rate limit reached (unauthenticated 60 req/hr). Falling back to safe defaults.");
    return { isRateLimited: true };
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub API Error (${res.status}): ${txt}`);
  }
  return res.json();
}

export async function analyzeRepository(input) {
  const { owner, repo: repoName } = parseRepoInput(input);
  console.log(`🔍 Inspecting GitHub repository: ${owner}/${repoName}...`);

  const [repoData, releasesData] = await Promise.all([
    fetchGitHub(`/repos/${owner}/${repoName}`),
    fetchGitHub(`/repos/${owner}/${repoName}/releases?per_page=5`),
  ]);

  if (!repoData) {
    throw new Error(`Repository "${owner}/${repoName}" was not found on GitHub.`);
  }

  const isRateLimited = repoData.isRateLimited;
  const repo = isRateLimited
    ? {
        name: repoName,
        description: `${repoName} open source project`,
        topics: ["utility", "open-source"],
        license: { spdx_id: "MIT" },
        stargazers_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        homepage: `https://github.com/${owner}/${repoName}`,
      }
    : repoData;

  const releases = Array.isArray(releasesData) ? releasesData.filter((r) => !r.draft) : [];
  const latestRelease = releases[0] || null;
  const assetNames = (latestRelease?.assets || []).map((a) => a.name.toLowerCase());

  // Determine platforms based on release assets and topics
  const platforms = new Set();
  const hasWin = assetNames.some((n) => n.endsWith(".exe") || n.endsWith(".msi") || n.includes("windows") || n.includes("win"));
  const hasMac = assetNames.some((n) => n.endsWith(".dmg") || n.endsWith(".pkg") || n.includes("darwin") || n.includes("mac"));
  const hasLinux = assetNames.some((n) => n.endsWith(".deb") || n.endsWith(".rpm") || n.endsWith(".appimage") || n.includes("linux"));
  const hasAndroid = assetNames.some((n) => n.endsWith(".apk") || n.endsWith(".aab"));
  const hasIos = assetNames.some((n) => n.endsWith(".ipa"));

  if (hasWin) platforms.add("windows");
  if (hasMac) platforms.add("macos");
  if (hasLinux) platforms.add("linux");
  if (hasAndroid) platforms.add("android");
  if (hasIos) platforms.add("ios");
  if ((repo.topics || []).some((t) => ["web", "webapp", "web-app", "frontend", "pwa"].includes(t.toLowerCase()))) {
    platforms.add("web");
  }
  if (platforms.size === 0) {
    platforms.add("windows");
    platforms.add("macos");
    platforms.add("linux");
  }

  // Architectures
  const architectures = new Set(["x64"]);
  if (assetNames.some((n) => n.includes("arm64") || n.includes("aarch64"))) {
    architectures.add("arm64");
  }

  // Guess category
  const topics = repo.topics || [];
  const desc = (repo.description || "").toLowerCase();
  let category = "Utility";
  if (topics.some((t) => ["game", "gaming", "unity", "godot", "gamedev", "rpg", "arcade"].includes(t.toLowerCase())) || desc.includes("game") || desc.includes("gaming")) {
    category = "Game";
  } else if (topics.some((t) => ["ai", "llm", "machine-learning", "deep-learning", "openai", "gemini", "chatgpt"].includes(t.toLowerCase())) || desc.includes("machine learning") || desc.includes("large language model")) {
    category = "AI & Machine Learning";
  } else if (topics.some((t) => ["bot", "discord-bot", "telegram-bot", "automation", "crawler", "scraper"].includes(t.toLowerCase())) || desc.includes("discord bot") || desc.includes("automation")) {
    category = "Automation & Bot";
  } else if (topics.some((t) => ["security", "cybersecurity", "pentest", "vulnerability", "infosec"].includes(t.toLowerCase())) || desc.includes("security")) {
    category = "Cybersecurity";
  } else if (topics.some((t) => ["cli", "terminal", "command-line", "shell"].includes(t)) || desc.includes("command line") || desc.includes("cli tool")) {
    category = "CLI Tool";
  } else if (topics.some((t) => ["database", "sql", "editor", "ide", "git", "devtools", "developer-tools"].includes(t))) {
    category = "Developer Tool";
  } else if (platforms.has("windows") || platforms.has("macos")) {
    category = "Desktop App";
  }

  const slug = repoName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const appConfig = {
    slug,
    owner,
    repo: repoName,
    name: repo.name,
    tagline: repo.description || `${repo.name} - Open source software`,
    category,
    tags: Array.from(new Set([...topics, category.toLowerCase().replace(/\s+/g, "-")])).slice(0, 5),
    icon: `https://github.com/${owner}.png`,
    screenshots: [],
    featured: false,
    verified: false,
    license: repo.license?.spdx_id || repo.license?.name || "Open Source",
    platforms: Array.from(platforms),
    architectures: Array.from(architectures),
    assetRules: {
      include: ["\\.(exe|msi|dmg|pkg|deb|rpm|tar\\.gz|zip|AppImage)$"],
      exclude: ["\\.(sha256|sig|asc|blockmap)$", "^source"],
      osPatterns: {
        macos: "(macOS|darwin|mac|\\.dmg|\\.pkg)",
        windows: "(windows|\\bwin\\b|[-_]win[-_.]|\\.exe|\\.msi)",
        linux: "(linux|\\.deb|\\.rpm|\\.AppImage)",
      },
      archPatterns: {
        x64: "(amd64|x86_64|x64)",
        arm64: "(arm64|aarch64)",
      },
    },
    install: {},
    website: repo.homepage || `https://github.com/${owner}/${repoName}`,
  };

  if (repo.sponsor) {
    appConfig.sponsor = repo.sponsor;
  }

  return {
    appConfig,
    stats: {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      latestReleaseTag: latestRelease?.tag_name || "No releases found",
      assetCount: assetNames.length,
    },
  };
}

export async function addAppToProjects(appConfig) {
  const projectsPath = path.resolve("projects.json");
  const raw = await fs.readFile(projectsPath, "utf8");
  const data = JSON.parse(raw);

  const existingIdx = data.projects.findIndex((p) => p.slug === appConfig.slug || (p.owner.toLowerCase() === appConfig.owner.toLowerCase() && p.repo.toLowerCase() === appConfig.repo.toLowerCase()));

  if (existingIdx >= 0) {
    console.log(`⚠️ App "${appConfig.slug}" already exists in projects.json. Updating existing entry...`);
    data.projects[existingIdx] = { ...data.projects[existingIdx], ...appConfig };
  } else {
    data.projects.push(appConfig);
  }

  await fs.writeFile(projectsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`✅ Successfully saved "${appConfig.name}" to projects.json!`);

  // Validate
  try {
    execSync("npm run validate", { stdio: "inherit" });
  } catch (e) {
    console.warn("⚠️ Schema validation reported a warning.");
  }

  return data.projects;
}

export async function removeAppFromProjects(slug) {
  const projectsPath = path.resolve("projects.json");
  const raw = await fs.readFile(projectsPath, "utf8");
  const data = JSON.parse(raw);

  const initialCount = data.projects.length;
  data.projects = data.projects.filter((p) => p.slug !== slug && `${p.owner}/${p.repo}`.toLowerCase() !== slug.toLowerCase());

  if (data.projects.length === initialCount) {
    throw new Error(`App with slug "${slug}" was not found in projects.json.`);
  }

  await fs.writeFile(projectsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`🗑️ Successfully removed "${slug}" from projects.json! (Remaining: ${data.projects.length} apps)`);

  execSync("npm run validate", { stdio: "inherit" });
  return data.projects;
}

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/manage-apps.mjs")) {
  const action = process.argv[2];
  const target = process.argv[3];

  async function run() {
    try {
      if (action === "add") {
        if (!target) {
          console.error("Usage: npm run app:add <owner/repo or github-url>");
          process.exit(1);
        }
        const { appConfig, stats } = await analyzeRepository(target);
        console.log(`\n📦 Analysis results for ${appConfig.name}:`);
        console.log(`   - Stars: ⭐ ${stats.stars.toLocaleString()}`);
        console.log(`   - Category: ${appConfig.category}`);
        console.log(`   - Platforms: ${appConfig.platforms.join(", ")}`);
        console.log(`   - Latest Release: ${stats.latestReleaseTag} (${stats.assetCount} assets)`);
        console.log(`   - License: ${appConfig.license}`);

        await addAppToProjects(appConfig);
        console.log(`\n🎉 Done! To compile pages with the new app, run: npm run build\n`);
      } else if (action === "remove" || action === "rm" || action === "delete") {
        if (!target) {
          console.error("Usage: npm run app:remove <slug>");
          process.exit(1);
        }
        await removeAppFromProjects(target);
        console.log(`\n🎉 Done! To compile pages, run: npm run build\n`);
      } else {
        console.log("Usage:");
        console.log("  npm run app:add <owner/repo>");
        console.log("  npm run app:remove <slug>");
      }
    } catch (err) {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  }

  run();
}
