import { marked } from "marked";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

async function testXSSSanitization() {
  console.log("🛡️ Running XSS Defense & Sanitization Tests...");
  
  const maliciousPayloads = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)">',
    '<a href="javascript:alert(document.cookie)">Click me</a>',
    '<svg onload="alert(1)"></svg>',
    '<iframe src="https://malicious.example.com"></iframe>',
    '<body onload="alert(1)">',
    '<details open ontoggle="alert(1)">',
    '[Click](javascript:prompt(1))',
    '![Image](data:text/html,<script>alert(1)</script>)',
  ];

  for (const payload of maliciousPayloads) {
    const rawParsed = marked.parse(payload);
    const sanitized = DOMPurify.sanitize(rawParsed);

    if (
      sanitized.includes("<script") ||
      sanitized.includes("onerror=") ||
      sanitized.includes("onload=") ||
      sanitized.includes("ontoggle=") ||
      sanitized.includes("javascript:") ||
      sanitized.includes("<iframe")
    ) {
      console.error(`❌ XSS Leak detected in payload: ${payload}`);
      console.error(`   Output was: ${sanitized}`);
      process.exit(1);
    }
  }

  console.log(`✅ All ${maliciousPayloads.length} aggressive XSS attack payloads were disarmed!`);
}

async function testAssetDetectionRules() {
  console.log("🔍 Running Asset Detection Rules Tests...");

  const detect = (name, patterns = {}) => {
    for (const [key, pattern] of Object.entries(patterns)) {
      try {
        if (new RegExp(pattern, "i").test(name)) return key;
      } catch {}
    }
    return null;
  };

  const osPatterns = {
    macos: "(mac|darwin|osx|\\.dmg|\\.pkg)",
    windows: "(windows|\\bwin\\b|[-_]win[-_.]|\\.exe|\\.msi)",
    linux: "(linux|\\.AppImage|\\.deb|\\.rpm)",
  };

  const archPatterns = {
    x64: "(x64|x86_64|amd64)",
    arm64: "(arm64|aarch64)",
  };

  const testCases = [
    { file: "app-v1.0.0-windows-x64.exe", expectedOS: "windows", expectedArch: "x64" },
    { file: "app-v1.0.0-win-x86_64.msi", expectedOS: "windows", expectedArch: "x64" },
    { file: "app_1.0.0_darwin_arm64.dmg", expectedOS: "macos", expectedArch: "arm64" },
    { file: "app-mac-aarch64.pkg", expectedOS: "macos", expectedArch: "arm64" },
    { file: "app-v1.0.0-linux-amd64.deb", expectedOS: "linux", expectedArch: "x64" },
    { file: "app-linux-arm64.AppImage", expectedOS: "linux", expectedArch: "arm64" },
  ];

  for (const tc of testCases) {
    const os = detect(tc.file, osPatterns);
    const arch = detect(tc.file, archPatterns);

    if (os !== tc.expectedOS || arch !== tc.expectedArch) {
      console.error(`❌ Asset pattern detection mismatch for "${tc.file}": got (${os}, ${arch}), expected (${tc.expectedOS}, ${tc.expectedArch})`);
      process.exit(1);
    }
  }

  console.log(`✅ All ${testCases.length} asset OS/arch detection tests passed!`);
}

async function main() {
  await testXSSSanitization();
  await testAssetDetectionRules();
  console.log("🎉 All security and quality tests completed successfully!");
}

main().catch((err) => {
  console.error("❌ Fatal test error:", err);
  process.exit(1);
});
