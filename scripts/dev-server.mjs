import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { analyzeRepository, addAppToProjects, removeAppFromProjects } from "./manage-apps.mjs";

const execAsync = promisify(exec);
const PORT = 3000;
const DIST = path.resolve("dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURI(url.pathname);
    const method = req.method.toUpperCase();

    // 1. Admin Dashboard Route
    if (pathname === "/admin") {
      res.writeHead(301, { Location: "/admin/" });
      res.end();
      return;
    }
    if (pathname === "/admin/") {
      const adminHtml = await fs.readFile(path.resolve("src/admin.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(adminHtml);
      return;
    }

    // 2. API Routes
    if (pathname === "/api/apps" && method === "GET") {
      const raw = await fs.readFile(path.resolve("projects.json"), "utf8");
      sendJson(res, 200, JSON.parse(raw));
      return;
    }

    if (pathname === "/api/analyze" && method === "POST") {
      const { input } = await readBody(req);
      if (!input) return sendJson(res, 400, { error: "Missing repository input" });
      const analysis = await analyzeRepository(input);
      sendJson(res, 200, analysis);
      return;
    }

    if (pathname === "/api/apps/add" && method === "POST") {
      const appConfig = await readBody(req);
      if (!appConfig?.slug || !appConfig?.owner || !appConfig?.repo) {
        return sendJson(res, 400, { error: "Incomplete app configuration" });
      }
      const updatedList = await addAppToProjects(appConfig);
      sendJson(res, 200, { success: true, count: updatedList.length });
      return;
    }

    if (pathname.startsWith("/api/apps/") && method === "DELETE") {
      const slug = pathname.replace("/api/apps/", "").trim();
      const updatedList = await removeAppFromProjects(slug);
      sendJson(res, 200, { success: true, count: updatedList.length });
      return;
    }

    if (pathname === "/api/build" && method === "POST") {
      console.log("⚡ Triggering site build from Admin UI...");
      const { stdout, stderr } = await execAsync("npm run build");
      console.log(stdout);
      if (stderr) console.error(stderr);
      sendJson(res, 200, { success: true, message: "Build completed" });
      return;
    }

    // 3. Static File Serving from dist/
    let reqPath = pathname;
    if (reqPath.endsWith("/")) reqPath += "index.html";

    let filePath = path.join(DIST, reqPath);
    let stat;
    try {
      stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
        stat = await fs.stat(filePath);
      }
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    });
    res.end(content);
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) {
      sendJson(res, 500, { error: err.message });
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`   Admin Control Panel at http://localhost:${PORT}/admin`);
  console.log(`   Serving static site from: ${DIST}\n`);
});
