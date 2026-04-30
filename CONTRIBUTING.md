# Contributing to pi-browser-hybrid-skill

Thanks for contributing.

## Before opening an issue

1. Run the probe first:

```bash
node skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
```

2. If the issue depends on Chrome fallback, include whether Chrome remote debugging was enabled.
3. Include the exact command, URL, chosen engine, and output.

## Local verification

Run the same checks used by CI:

```bash
node --check skills/browser-hybrid/scripts/browser-hybrid.mjs
node --check skills/browser-hybrid/vendor/obscura-cdp.mjs
node --check skills/browser-hybrid/vendor/chrome-cdp.mjs
node skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
```

If you changed hybrid routing, test both a safe site and a known risky site.

## Scope guidance

This repository is for the **routing layer** between Obscura and Chrome.

Good fits:
- engine selection logic
- target prefix routing
- fallback behavior
- docs for when to choose hybrid

Not a fit:
- deep Obscura-only runtime changes with no hybrid impact

Those belong in `pi-obscura-skill` unless they are being vendored here intentionally.

## Pull requests

Please keep PRs focused and include:
- what changed
- why it changed
- how you verified both routing and backend behavior
- whether vendored backend files were intentionally resynced

Use the provided PR template.

## Release-related changes

If a change affects public installation or release behavior, also review:
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)
- [ROADMAP.md](./ROADMAP.md)
- [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)
