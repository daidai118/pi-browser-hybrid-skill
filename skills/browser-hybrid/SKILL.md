---
name: browser-hybrid
description: Use an Obscura-first browser workflow in pi, but probe site compatibility first and fall back to Chrome automatically when Obscura looks risky or incompatible.
license: MIT
compatibility: Node.js 22+. Bundles an Obscura backend and a Chrome fallback backend. Chrome fallback requires Chrome remote debugging enabled.
---

# Browser Hybrid

This skill is the **safety wrapper** around the browser choices:

- `pi-obscura-skill` = lightweight, low-memory, default first choice
- `pi-browser-hybrid-skill` = probe first, then automatically switch to Chrome when needed

## Runtime

All commands are in:

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs
```

## Start with a probe

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs engine https://example.com
```

The probe uses Obscura's compatibility checker and returns one of:
- `compatible` → stay on Obscura
- `risky` → Chrome fallback is safer
- `incompatible` → use Chrome

## Open with automatic backend selection

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs open https://example.com
```

This prints a prefixed hybrid target like:

```text
obscura:page-1
chrome:6BE827FA
```

Use that target for follow-up commands.

## Follow-up commands

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs list
skills/browser-hybrid/scripts/browser-hybrid.mjs eval  obscura:page-1 "document.title"
skills/browser-hybrid/scripts/browser-hybrid.mjs html  chrome:6BE827FA
skills/browser-hybrid/scripts/browser-hybrid.mjs click chrome:6BE827FA "button.submit"
skills/browser-hybrid/scripts/browser-hybrid.mjs fill  chrome:6BE827FA "input[name=q]" "pi"
```

## Direct backend pass-through

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs obscura list
skills/browser-hybrid/scripts/browser-hybrid.mjs chrome list
```

## Notes

- Chrome fallback requires Chrome remote debugging enabled at `chrome://inspect/#remote-debugging`.
- If hybrid chooses Chrome, that is intentional: the Obscura probe detected signals that the page may render or behave incorrectly there.
- The Chrome backend is vendored from `chrome-cdp-skill`; see `THIRD_PARTY_NOTICES.md`.
