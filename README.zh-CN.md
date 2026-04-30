# pi-browser-hybrid-skill

[简体中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

先用 Obscura 探测，站点不稳就自动切到 Chrome。

Pi 中的 skill 名称：`browser-hybrid`

## 产品定位

- `pi-obscura-skill`：轻量、低内存、默认首选
- `pi-browser-hybrid-skill`：先做兼容性探测，不行就自动走 Chrome fallback

## 为什么做这个包

Obscura 很省资源，但不是所有站点都能正常渲染。我本地验证时：

- `example.com`、简单表单页面在 Obscura 里没问题
- `https://100t.xiaomimimo.com/` 在 Obscura 里出现了样式未真正应用、布局塌缩、交互流程点不出来的问题

所以这个包的目标不是强迫所有站点都走 Obscura，而是先探测，再自动给出更靠谱的路线。

## 安装

### 本地安装

```bash
pi install /Users/daidai/ai/pi-browser-hybrid-skill
```

### 推到 GitHub 后安装

```bash
pi install git:github.com/daidai118/pi-browser-hybrid-skill
```

### 固定到 release tag

```bash
pi install git:github.com/daidai118/pi-browser-hybrid-skill@v0.1.1
```

### 安装到当前项目

```bash
pi install -l git:github.com/daidai118/pi-browser-hybrid-skill
```

## 更新

```bash
pi update git:github.com/daidai118/pi-browser-hybrid-skill
```

## 项目文档

- [Contributing guide](./CONTRIBUTING.md)
- [Roadmap](./ROADMAP.md)
- [Release checklist](./RELEASE_CHECKLIST.md)

## 运行要求

- Node.js 22+
- 如果 fallback 到 Chrome，需要先在 `chrome://inspect/#remote-debugging` 打开 Chrome 远程调试
- 内置的 Obscura backend 会在需要时自动下载测试过的 Obscura 二进制

## 命令

所有命令都通过：

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs
```

### 先探测

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs check https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs check --json https://example.com
skills/browser-hybrid/scripts/browser-hybrid.mjs engine https://example.com
```

探测状态含义：

- `compatible` → 走 Obscura
- `risky` → 更建议 Chrome fallback
- `incompatible` → 直接走 Chrome

### 自动选择后打开页面

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs open https://example.com
```

返回的 target 会自带 backend 前缀，例如：

```text
obscura:page-1
chrome:6BE827FA
```

### 后续操作

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs list
skills/browser-hybrid/scripts/browser-hybrid.mjs eval  obscura:page-1 "document.title"
skills/browser-hybrid/scripts/browser-hybrid.mjs html  chrome:6BE827FA
skills/browser-hybrid/scripts/browser-hybrid.mjs click chrome:6BE827FA "button.submit"
skills/browser-hybrid/scripts/browser-hybrid.mjs fill  chrome:6BE827FA "input[name=q]" "pi"
```

### 直接透传到底层 backend

```bash
skills/browser-hybrid/scripts/browser-hybrid.mjs obscura list
skills/browser-hybrid/scripts/browser-hybrid.mjs chrome list
```

如果你要用某个 backend 的特定命令，可以直接透传。

## 说明

- hybrid 内部直接复用了 `pi-obscura-skill` 的兼容性检查逻辑。
- 如果 hybrid 选择了 Chrome，不代表失败，而是说明 Obscura 探测到了明显风险。
- Chrome backend 来自 vendored `chrome-cdp-skill`，见 `THIRD_PARTY_NOTICES.md`。
