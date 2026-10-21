import fs from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const checkRepos = process.argv.includes("--check-repos");

async function main() {
  console.log("🔍 Validating projects.json...");

  // 1. Read files
  const schemaRaw = await fs.readFile("schema/projects.schema.json", "utf8");
  const schema = JSON.parse(schemaRaw);

  const projectsRaw = await fs.readFile("projects.json", "utf8");
  const config = JSON.parse(projectsRaw);

  // 2. Validate JSON Schema
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    console.error("❌ Schema validation failed:");
    for (const err of validate.errors) {
      console.error(`  - ${err.instancePath || "/"}: ${err.message}`);
    }
    process.exit(1);
  }

  // 3. Check uniqueness of slug and owner/repo
  const slugs = new Set();
  const repos = new Set();

  for (const p of config.projects) {
    if (slugs.has(p.slug)) {
      console.error(`❌ Duplicate slug detected: "${p.slug}"`);
      process.exit(1);
    }
    slugs.add(p.slug);

    const fullRepo = `${p.owner.toLowerCase()}/${p.repo.toLowerCase()}`;
    if (repos.has(fullRepo)) {
      console.error(`❌ Duplicate repository detected: "${fullRepo}"`);
      process.exit(1);
    }
    repos.add(fullRepo);

    // 4. Validate assetRules regexes
    if (p.assetRules) {
      const allRegexes = [
        ...(p.assetRules.include ?? []),
        ...(p.assetRules.exclude ?? []),
        ...Object.values(p.assetRules.osPatterns ?? {}),
        ...Object.values(p.assetRules.archPatterns ?? {}),
      ];

      for (const pattern of allRegexes) {
        try {
          new RegExp(pattern);
        } catch (e) {
          console.error(`❌ Invalid regex pattern "${pattern}" in app "${p.slug}": ${e.message}`);
          process.exit(1);
        }
      }
    }

    // 5. Check local icon / screenshot file existence & size (< 2MB)
    const checkFile = async (filePath, label) => {
      if (!filePath || filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return;
      }
      try {
        const stat = await fs.stat(filePath);
        if (stat.size > 2 * 1024 * 1024) {
          console.error(`❌ ${label} file too large (> 2MB): ${filePath}`);
          process.exit(1);
        }
      } catch (e) {
        console.error(`❌ Referenced ${label} not found: ${filePath}`);
        process.exit(1);
      }
    };

    if (p.icon) await checkFile(p.icon, "icon");
    if (p.screenshots) {
      for (const s of p.screenshots) {
        await checkFile(s, "screenshot");
      }
    }
  }

  // 6. Check GitHub Repos if requested
  if (checkRepos) {
    console.log("🌐 Checking repos against GitHub API...");
    const TOKEN = process.env.GITHUB_TOKEN;
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "github-software-store-validator",
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }),
    };

    for (const p of config.projects) {
      const url = `https://api.github.com/repos/${p.owner}/${p.repo}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error(`❌ Repo check failed for ${p.owner}/${p.repo} (HTTP ${res.status})`);
        process.exit(1);
      }
      const data = await res.json();
      if (data.private) {
        console.error(`❌ Repo ${p.owner}/${p.repo} is private! Only public repos allowed.`);
        process.exit(1);
      }
    }
  }

  console.log(`✅ Validation passed successfully! (${config.projects.length} apps validated)`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
