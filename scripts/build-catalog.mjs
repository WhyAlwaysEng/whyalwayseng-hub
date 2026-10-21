import fs from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const API = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "github-software-store-builder",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
};

const gh = async (urlPath) => {
  const url = API + urlPath;
  try {
    const res = await fetch(url, { headers });
    if (res.status === 404) return null;
    if (res.status === 403) {
      const resetTime = res.headers.get("x-ratelimit-reset");
      console.warn(`[rate-limit] 403 on ${urlPath}. Reset at ${resetTime ? new Date(resetTime * 1000).toISOString() : "unknown"}`);
      return null;
    }
    if (!res.ok) throw new Error(`${urlPath} -> HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[error] fetch failed for ${urlPath}: ${err.message}`);
    return null;
  }
};

const detect = (name, patterns = {}) => {
  for (const [key, pattern] of Object.entries(patterns)) {
    try {
      if (new RegExp(pattern, "i").test(name)) return key;
    } catch {}
  }
  return null;
};

function mapAsset(a, rules = {}) {
  const inc = (rules?.include ?? []).map((r) => new RegExp(r, "i"));
  const exc = (rules?.exclude ?? []).map((r) => new RegExp(r, "i"));

  if (exc.some((r) => r.test(a.name))) return null;
  if (inc.length && !inc.some((r) => r.test(a.name))) return null;

  let sha256 = null;
  if (a.digest?.startsWith("sha256:")) {
    sha256 = a.digest.slice(7);
  }

  return {
    name: a.name,
    url: a.browser_download_url,
    size: a.size,
    downloads: a.download_count ?? 0,
    os: detect(a.name, rules?.osPatterns) ?? null,
    arch: detect(a.name, rules?.archPatterns) ?? null,
    sha256,
  };
}

function mapRelease(r, rules = {}) {
  const assets = (r.assets ?? [])
    .map((a) => mapAsset(a, rules))
    .filter(Boolean);

  return {
    tag: r.tag_name,
    name: r.name || r.tag_name,
    publishedAt: r.published_at,
    prerelease: r.prerelease ?? false,
    bodyMarkdown: r.body ?? "",
    assets,
  };
}

async function loadPreviousCatalog() {
  const candidates = ["data/catalog.prev.json", "data/catalog.json", "dist/data/catalog.json"];
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, "utf8");
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.apps)) {
        return Object.fromEntries(data.apps.map((a) => [a.slug, a]));
      }
    } catch {}
  }
  return {};
}

async function main() {
  console.log("🚀 Building Catalog from GitHub API...");
  const config = JSON.parse(await fs.readFile("projects.json", "utf8"));
  const prevBySlug = await loadPreviousCatalog();

  const apps = [];

  for (const p of config.projects) {
    console.log(`  📦 Processing [${p.slug}] (${p.owner}/${p.repo})...`);
    try {
      const [repo, releases] = await Promise.all([
        gh(`/repos/${p.owner}/${p.repo}`),
        gh(`/repos/${p.owner}/${p.repo}/releases?per_page=20`),
      ]);

      if (!repo) {
        throw new Error(`Repository ${p.owner}/${p.repo} not found or rate-limited`);
      }

      const releaseList = (releases ?? [])
        .filter((r) => !r.draft)
        .map((r) => mapRelease(r, p.assetRules));

      const stable = releaseList.find((r) => !r.prerelease) ?? null;
      const latest = stable ?? releaseList[0] ?? null;

      const totalDownloads = releaseList.reduce(
        (acc, rel) => acc + rel.assets.reduce((sum, asset) => sum + (asset.downloads || 0), 0),
        0
      );

      // Try fetching README content if available
      let readme = null;
      try {
        const readmeData = await gh(`/repos/${p.owner}/${p.repo}/readme`);
        if (readmeData && readmeData.content && readmeData.encoding === "base64") {
          readme = Buffer.from(readmeData.content, "base64").toString("utf8");
        }
      } catch {}

      apps.push({
        slug: p.slug,
        owner: p.owner,
        repoName: p.repo,
        name: p.name,
        tagline: p.tagline || repo.description || "",
        category: p.category,
        tags: p.tags || [],
        icon: p.icon || `https://avatars.githubusercontent.com/${p.owner}`,
        screenshots: p.screenshots || [],
        video: p.video || null,
        featured: Boolean(p.featured),
        verified: Boolean(p.verified),
        platforms: p.platforms || ["windows", "macos", "linux"],
        architectures: p.architectures || ["x64", "arm64"],
        minOS: p.minOS || null,
        install: p.install || {},
        website: p.website || repo.homepage || null,
        sponsor: p.sponsor || null,
        i18n: p.i18n || {},
        stale: false,
        repo: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          license: p.license || repo.license?.spdx_id || repo.license?.name || null,
          pushedAt: repo.pushed_at,
          archived: repo.archived,
          defaultBranch: repo.default_branch,
          htmlUrl: repo.html_url,
        },
        latest,
        releases: releaseList,
        totalDownloads,
        readme: readme ? readme.slice(0, 15000) : null, // Limit README size for catalog efficiency
      });
    } catch (err) {
      console.warn(`  ⚠️ Failed fetching ${p.slug}: ${err.message}`);
      const old = prevBySlug[p.slug];
      if (old) {
        console.log(`    ↳ Reusing previous cached data for ${p.slug} (marked stale)`);
        apps.push({
          ...old,
          icon: p.icon || old.icon,
          screenshots: (p.screenshots && p.screenshots.length > 0) ? p.screenshots : (old.screenshots || []),
          video: p.video ?? old.video ?? null,
          sponsor: p.sponsor || old.sponsor || null,
          website: p.website || old.website || null,
          stale: true,
        });
      } else {
        console.warn(`    ↳ No previous data for ${p.slug}. Adding fallback shell.`);
        apps.push({
          slug: p.slug,
          owner: p.owner,
          repoName: p.repo,
          name: p.name,
          tagline: p.tagline || "",
          category: p.category,
          tags: p.tags || [],
          icon: p.icon || `https://avatars.githubusercontent.com/${p.owner}`,
          screenshots: [],
          video: null,
          featured: Boolean(p.featured),
          verified: Boolean(p.verified),
          platforms: p.platforms || [],
          architectures: p.architectures || [],
          install: p.install || {},
          website: p.website || null,
          stale: true,
          repo: {
            stars: 0,
            forks: 0,
            openIssues: 0,
            license: p.license || null,
            pushedAt: null,
            archived: false,
            htmlUrl: `https://github.com/${p.owner}/${p.repo}`,
          },
          latest: null,
          releases: [],
          totalDownloads: 0,
          readme: null,
        });
      }
    }
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    store: config.store,
    categories: [...new Set(config.projects.map((p) => p.category))],
    apps,
  };

  await fs.mkdir("dist/data", { recursive: true });
  await fs.mkdir("data", { recursive: true });

  const jsonStr = JSON.stringify(catalog, null, 2);
  await fs.writeFile("dist/data/catalog.json", jsonStr, "utf8");
  await fs.writeFile("data/catalog.json", jsonStr, "utf8");

  console.log(`✅ catalog.json generated with ${apps.length} apps! Saved to dist/data/catalog.json`);
}

main().catch((err) => {
  console.error("❌ Fatal error in build-catalog:", err);
  process.exit(1);
});
