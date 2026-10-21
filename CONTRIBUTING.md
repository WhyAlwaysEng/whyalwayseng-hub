# Contributing to GitHub Software Store Hub

We welcome submissions of open-source applications and improvements to the store platform.

## How to Submit an Application

Adding an app is done completely through a Pull Request on `projects.json`:

1. **Fork this repository** and create a feature branch (`git checkout -b add-myapp`).
2. **Edit `projects.json`** to append your application to the `projects` array:

```json
{
  "slug": "my-app",
  "owner": "my-org",
  "repo": "my-app",
  "name": "My App",
  "tagline": "A super fast productivity tool",
  "category": "Desktop App",
  "tags": ["productivity", "desktop"],
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64", "arm64"],
  "assetRules": {
    "include": ["\\.(exe|msi|dmg|pkg|deb|tar\\.gz|zip)$"],
    "exclude": ["\\.(sha256|sig)$"],
    "osPatterns": {
      "windows": "(win|\\.exe|\\.msi)",
      "macos": "(mac|darwin|\\.dmg)",
      "linux": "(linux|\\.deb)"
    },
    "archPatterns": {
      "x64": "(x64|x86_64|amd64)",
      "arm64": "(arm64|aarch64)"
    }
  },
  "install": {
    "brew": "brew install my-app",
    "winget": "winget install MyOrg.MyApp"
  }
}
```

3. **Validate your changes locally:**
   ```bash
   npm run validate
   ```
4. **Submit a Pull Request**. Our automated CI will run checks and the maintainers will review and merge it.

## Verification Criteria

To receive the **Verified** badge:
- The app must be an established open-source project with an active release cadence.
- Repository must clearly define an OSI-approved open-source license.
- Release assets should preferably include checksums (`.sha256` or digest in releases).
