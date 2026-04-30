# pi-browser-hybrid-skill

[简体中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

まず Obscura を試し、危ないサイトでは自動的に Chrome に切り替える Pi browser skill です。

Pi での skill 名: `browser-hybrid`

## 製品ポジション

- `pi-obscura-skill`: 軽量・低メモリ・デフォルト第一候補
- `pi-browser-hybrid-skill`: 先に互換性を判定し、危ないときは自動で Chrome fallback

## このパッケージの目的

Obscura は軽量ですが、すべてのサイトで完全に動くわけではありません。ローカル検証では:

- `example.com` や単純なフォームページは Obscura で問題なし
- `https://100t.xiaomimimo.com/` は Obscura 上でスタイル未適用、レイアウト崩壊、対話フロー未表示を確認

そのため、このパッケージは「常に Obscura を強制する」ためではなく、「まず判定し、危ないときは Chrome に切り替える」ためのものです。

## インストール

### ローカルインストール

```bash
pi install /Users/daidai/ai/pi-browser-hybrid-skill
```

### GitHub 公開後

```bash
pi install git:github.com/daidai118/pi-browser-hybrid-skill
```

### リリースタグに固定してインストール

```bash
pi install git:github.com/daidai118/pi-browser-hybrid-skill@v0.1.2
```

### 現在のプロジェクトだけにインストール

```bash
pi install -l git:github.com/daidai118/pi-browser-hybrid-skill
```

## 更新

```bash
pi update git:github.com/daidai118/pi-browser-hybrid-skill
```

## プロジェクト文書

- [Changelog](./CHANGELOG.md)
- [Contributing guide](./CONTRIBUTING.md)
- [Roadmap](./ROADMAP.md)
- [Release checklist](./RELEASE_CHECKLIST.md)

## 要件

- Node.js 22+
- Chrome fallback を使う場合は `chrome://inspect/#remote-debugging` で Chrome remote debugging を有効化
- 同梱の Obscura backend は必要時に検証済み Obscura バイナリを自動取得可能

## コマンド

すべてのコマンドは次を使います:

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs
```

### まず判定

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs check --json https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs why https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs engine https://example.com
```

状態の意味:

- `compatible` → Obscura を使う
- `risky` → Chrome fallback のほうが安全
- `incompatible` → Chrome を使う

### 自動選択でページを開く

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs open https://example.com
```

返される target には backend 接頭辞が付きます:

```text
obscura:page-1
chrome:6BE827FA
```

### 続きの操作

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs list
skills/browser-hybrid/scripts/browser-hybrid.mjs eval  obscura:page-1 "document.title"
skills/browser-hybrid/scripts/browser-hybrid.mjs html  chrome:6BE827FA
skills/browser-hybrid/scripts/browser-hybrid.mjs click chrome:6BE827FA "button.submit"
skills/browser-hybrid/scripts/browser-hybrid.mjs fill  chrome:6BE827FA "input[name=q]" "pi"
```

### backend へ直接パススルー

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs obscura list
skills/browser-hybrid/scripts/browser-hybrid.mjs chrome list
```

backend 固有コマンドが必要なときはパススルーを使います。

## メモ

- hybrid は `pi-obscura-skill` に入っている互換性チェックをそのまま利用します。
- hybrid が Chrome を選んだ場合、それは失敗ではなく、Obscura 側に明確なリスクシグナルが見つかったという意味です。
- Chrome backend は vendored `chrome-cdp-skill` を利用しています。`THIRD_PARTY_NOTICES.md` を参照してください。
