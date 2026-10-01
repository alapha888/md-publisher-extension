# Edge Add-ons 提交检查单

> 状态：2026-10-01 —— **可提交，未提交**。提交动作（注册/上传/点发布）需浏览器
> 人工操作，本单只做到"可提交"为止。点最终发布前必须先报告确认。

## 0. 前置结论（已核验）

- Edge Add-ons 注册**免费**（Chrome Web Store 收一次性 $5，本线不付，先走 Edge）。
- 需要一个 Microsoft 账号（MSA）。可用现有 GitHub 账号在 Partner Center
  登录流程中自动创建一个 MSA。
- 同一份 MV3 zip 可直接用于 Edge（Chromium 同源），无需改包。

## 1. 注册（浏览器人工步骤，未执行）

1. 打开 https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. 用 Microsoft 账号登录（或用 GitHub 账号按提示创建 MSA）。
   - 如该步要求手机号验证：属正常账号安全流程，可继续；
     **如要求身份证/付费，立即停下并报告。**
3. 选择账户类型：**个人（Individual）**，接受 Microsoft Store 应用开发者协议，
   完成页面显示的验证。

## 2. 创建提交（浏览器人工步骤，未执行）

1. Partner Center → Microsoft Edge 计划 → 新建扩展，上传
   `dist/md-publisher-extension-<version>-chrome.zip`（见 §4 构建）。
2. 填写商店信息（文案见 `docs/STORE-LISTING.md`，从 manifest 自动读取名称/简介）：
   - 类别：生产力（Productivity）
   - 隐私页：Single Purpose（一句话）、逐项解释 manifest 权限、
     远程代码：否、数据使用声明、隐私政策 URL（落地页 `/privacy.html`）。
3. 上传截图（至少 1 张 1280x800：编辑器三 Tab 界面）。
4. 保存为草稿 → **不要点 Submit**。把草稿状态截图/链接回填到本文件，
   等确认后再点发布。

## 3. 权限说明（提交时原样填写）

| 权限                                                     | 用途                                     |
| -------------------------------------------------------- | ---------------------------------------- |
| storage                                                  | 保存编辑器设置、主题、Pro 激活码（本地） |
| activeTab                                                | 侧边栏复制到公众号时的当前标签页交互     |
| sidePanel                                                | 在 Edge 侧边栏打开编辑器                 |
| contextMenus                                             | 右键菜单快捷操作                         |
| identity                                                 | 预留（云同步登录，当前版本未启用）       |
| host_permissions（github/gitee/weixin/qpic/plantuml 等） | 图床、公式渲染等第三方资源加载           |

远程代码：否。所有 JS 均打包在扩展内，不加载执行远程脚本。

## 4. 构建提交包

```bash
cd apps/web
NODE_OPTIONS=--max-old-space-size=4096 ./node_modules/.bin/wxt zip
# 产物：.output/md-publisher-extension-<version>-chrome.zip
```

构建产物同时发布到 GitHub Release，供离线包分发下载。

## 5. 离线包分发（与商店并行）

- GitHub Release 附件：zip 包 + 安装说明（`edge://extensions/` → 开发者模式 → 加载解压缩的扩展）。
- 落地页提供下载入口。
