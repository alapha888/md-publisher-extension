# MD 排版助手 · 浏览器插件

Markdown 多平台排版助手（Manifest V3 浏览器插件）：微信公众号样式渲染，知乎、掘金干净 Markdown 一键复制；Pro 解锁三平台一键打包导出。

- 落地页：https://alapha888.github.io/md-publisher-extension/
- 网页版：https://alapha888.github.io/md-publisher/
- 仓库：https://github.com/alapha888/md-publisher-extension

## 功能

- **微信 Tab**：Markdown 渲染为微信公众号图文样式，复制后粘贴到公众号后台；支持多主题与自定义 CSS。
- **知乎 Tab**：干净 Markdown（图片已转图床链接），一键复制，直接粘贴到知乎编辑器。
- **掘金 Tab**：干净 Markdown（代码块语言标注已规范化），一键复制，直接粘贴到掘金编辑器。
- **Pro**（单独购买）：三平台一键打包导出（微信 HTML + 知乎/掘金 Markdown → zip）。

## 安装

1. Edge Add-ons 商店安装（提交中，见 `docs/EDGE-SUBMIT-CHECKLIST.md`）；或
2. 离线包：从 [Releases](https://github.com/alapha888/md-publisher-extension/releases) 下载 zip，
   解压后在 `edge://extensions/` 开启开发者模式 → 加载解压缩的扩展。

## 构建

前置：Node ≥ 22，pnpm。

```bash
pnpm install
cd apps/web
NODE_OPTIONS=--max-old-space-size=4096 ./node_modules/.bin/wxt zip
# 产物：apps/web/.output/md-publisher-extension-<version>-chrome.zip
```

## 文档

- [docs/EDGE-SUBMIT-CHECKLIST.md](docs/EDGE-SUBMIT-CHECKLIST.md) —— Edge 上架检查单（可提交，未提交）
- [docs/STORE-LISTING.md](docs/STORE-LISTING.md) —— 商店文案
- [docs/PRO-DESIGN.md](docs/PRO-DESIGN.md) —— Pro 功能 / 定价 / license 方案
- [docs/AFDIAN-PRO-LISTING.md](docs/AFDIAN-PRO-LISTING.md) —— 爱发电商品文案（隐藏待上架）

## 来源与致谢

本插件基于 [doocs/md](https://github.com/doocs/md)（WTFPL 开源协议）构建，
在其基础上增加了微信 / 知乎 / 掘金三平台发布 Tab、Pro 授权体系与浏览器插件打包。
感谢 doocs/md 的开源工作。
