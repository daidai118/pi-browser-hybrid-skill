# pi-browser-hybrid-skill

[简体中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

Use Obscura first, but let Pi switch to Chrome when the site looks risky for Obscura.

Skill name in Pi: `browser-hybrid`

## Product positioning

- `pi-obscura-skill`: lightweight, low-memory, default first choice
- `pi-browser-hybrid-skill`: compatibility probe first, automatic Chrome fallback when needed

## Why this package exists

Obscura is cheaper and lighter, but not every site renders correctly there. During local verification:

- `example.com` and simple forms were fine in Obscura
- `https://100t.xiaomimimo.com/` showed missing applied stylesheets, collapsed layout metrics, and broken interactive flow rendering in Obscura

So this package uses an Obscura probe first, then routes you to Chrome when the probe says the site is risky or incompatible.

## Installation

### Local path install, before pushing to GitHub

```bash
pi install /Users/daidai/ai/pi-browser-hybrid-skill
```

### Install from GitHub after publishing

```bash
pi install git:github.com/daidai118/pi-browser-hybrid-skill
```

### Install into project-local Pi settings

```bash
pi install -l git:github.com/daidai118/pi-browser-hybrid-skill
```

## Updating

```bash
pi update git:github.com/daidai118/pi-browser-hybrid-skill
```

If you want easy updates later, do not pin a git ref during install.

## Requirements

- Node.js 22+
- Chrome fallback requires Chrome remote debugging enabled at `chrome://inspect/#remote-debugging`
- Bundled Obscura backend can auto-download its tested Obscura binary when needed

## Commands

All commands use:

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs
```

### Probe first

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs check --json https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs engine https://example.com
```

Probe statuses:

- `compatible` → use Obscura
- `risky` → Chrome fallback is safer
- `incompatible` → use Chrome

### Open with automatic backend selection

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs open https://example.com
```

The returned target is prefixed with its backend, for example:

```text
obscura:page-1
chrome:6BE827FA
```

### Follow-up commands

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs list
skills/browser-hybrid/scripts/browser-hybrid.mjs eval  obscura:page-1 "document.title"
skills/browser-hybrid/scripts/browser-hybrid.mjs html  chrome:6BE827FA
skills/browser-hybrid/scripts/browser-hybrid.mjs click chrome:6BE827FA "button.submit"
skills/browser-hybrid/scripts/browser-hybrid.mjs fill  chrome:6BE827FA "input[name=q]" "pi"
skills/browser-hybrid/scripts/browser-hybrid.mjs type  chrome:6BE827FA "hello"
skills/browser-hybrid/scripts/browser-hybrid.mjs nav   obscura:page-1 https://example.com
```

### Direct backend pass-through

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs obscura list
skills/browser-hybrid/scripts/browser-hybrid.mjs chrome list
```

Use pass-through when you need backend-specific commands that are not normalized by hybrid.

## Notes

- Hybrid uses the same Obscura compatibility checker shipped in `pi-obscura-skill`.
- If hybrid chooses Chrome, do not treat that as failure; it means the Obscura probe detected rendering risk.
- The Chrome backend is vendored from `chrome-cdp-skill`; see `THIRD_PARTY_NOTICES.md`.
