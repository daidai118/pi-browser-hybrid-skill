# pi-browser-hybrid-skill

> Obscura-first browser automation for Pi with automatic Chrome fallback when the site looks risky.

**Languages / 语言 / 言語**

- [简体中文](./README.zh-CN.md)
- [English](./README.en.md)
- [日本語](./README.ja.md)

**Pi skill name:** `browser-hybrid`

## Product positioning

- `pi-obscura-skill`: lightweight, low-memory, default first choice
- `pi-browser-hybrid-skill`: compatibility probe first, automatic Chrome fallback when needed

## What this package is for

Use this package when you want one browser entry point that makes the routing decision for you:

- probe a site with Obscura first
- stay on Obscura when the page looks safe
- switch to Chrome when rendering / anti-bot / interaction risk is detected
- keep one unified CLI with backend-prefixed targets like `obscura:page-1` and `chrome:ABC12345`

## Quick install

### Before pushing to GitHub

```bash
pi install /Users/daidai/ai/pi-browser-hybrid-skill
```

### After pushing to GitHub

```bash
pi install git:github.com/daidai118/pi-browser-hybrid-skill
```

### Install into the current project instead of global Pi settings

```bash
pi install -l git:github.com/daidai118/pi-browser-hybrid-skill
```

## Start with a probe

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs engine https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs open https://example.com
```

Status meanings:

- `compatible` → stay on Obscura
- `risky` → Chrome fallback is safer
- `incompatible` → use Chrome

## Updating later

```bash
pi update git:github.com/daidai118/pi-browser-hybrid-skill
```

## GitHub repository metadata

Suggested GitHub description and topics are in:

- [GITHUB_REPO_METADATA.md](./GITHUB_REPO_METADATA.md)

## Docs

- [简体中文文档](./README.zh-CN.md)
- [English docs](./README.en.md)
- [日本語ドキュメント](./README.ja.md)
