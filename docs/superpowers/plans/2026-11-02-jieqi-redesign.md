# 节气食单改版 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有 H5 中交付批准的教师反馈改版。
**Architecture:** 保留全局 JQ 命名空间与 Hash 路由，增加独立视觉、百科与照片模块；不增加后端。
**Tech Stack:** HTML/CSS/原生 JS、SVG、Canvas；Node 内置测试。
**Spec:** `docs/superpowers/specs/2026-11-02-jieqi-redesign-design.md`（用户已确认）。

## Global Constraints

- 工作目录 E:/jieqi-shidan；复用现有 checkout，在 redesign/20261102 分支修改，方便 GitHub Desktop 查看；不创建另一个源码副本。
- 不推送、不改 AI 密钥；不覆盖历史材料。
- 保留 NFC、过敏硬过滤、收藏与打卡、本机账号行为。
- 静态资源版本统一 20261102。
- 393×852 原型逻辑画布；375、393、430px 和桌面浏览器检查。
- 正文至少 600，标题 700–800，控件圆角且触控面积至少 44px。

## Review Focus

- 菜名与实拍不符、许可不明：照片映射逐项检查并显式报告缺口。
- 旧视图自重绘：新内容立即可见，动画卸载不得泄漏。
- 过敏条件变化：推荐、换一换与收藏加回仍不放宽硬限制。
- 深链接刷新与 NFC 参数：保持指定节气与正确返回行为。
- 手机/低动态环境：不溢出，表单不遮挡，动画可静止。

### Task 1: 固定设备原型与流程图（独立域）

Files: create `docs/presentation/黑白结构原型_iPhone16.html`、`系统流程图_v2_食养修订.html`、`系统流程图_v4_食养修订.html`。

- [x] 保留历史稿，生成全部同尺寸可滚动手机框。
- [x] 保持两个流程图主结构与连线，只补充节点内容和必要注释。
- [x] 验证屏幕尺寸、页面覆盖和 SVG 节点/连线几何保留。

### Task 2: 百科数据、图标与独立动画（独立域）

Files: create `js/seasonal.js`, `css/seasonal.css`, `tests/seasonal.test.cjs`，可选本地 SVG 资产。
Interfaces: `JQ.SEASONAL.icon(termId) -> SVG string`; `card(term) -> HTML`; `wellness(term,compact) -> HTML`; `mount(root)`; `dispose()`。

- [x] 先写并运行24项内容/图标/主题覆盖测试，确认缺少模块时失败。
- [x] 用 Anatomy 方法制作不同机制的短动画，数据含来源、误解与解释；正文可直接嵌入详情。
- [x] 播放/暂停/重播、低动态与卸载行为可用。
- [x] 运行覆盖与语法检查，报告来源核验边界。

### Task 3: 实拍照片映射（独立域）

Files: create `js/recipe_photos.js`, `assets/food/*`, `docs/food-photo-sources.json`。
Interfaces: `JQ.PHOTOS.html(recipe,{className,detail}) -> HTML`; `mount(root)`; mapping keyed recipe id。

- [x] 枚举120道菜，寻找许可可核查、与菜名对应的实拍。
- [x] 下载压缩、记录来源许可与适配类型；缺图不冒充完成。
- [x] 检查映射与资源存在，加载失败可回退。

### Task 4: 主站视觉、登录粒子与整合（主执行域）

Files: modify `index.html`, `css/style.css`, `js/view_home.js`, `view_recipe.js`, `view_term.js`, `view_auth.js`, `view_me.js`, `router.js`, `ai.js`; create `js/login_scene.js`, `css/redesign.css`。

- [x] 统一加粗、圆角、色彩、排版；压缩旧首页装饰占用。
- [x] 登录/注册整合节气环透视粒子，离开路由清理动画，保留原表单行为。
- [x] 将 Task 2 和 3 接入首页、百科、详情与收藏；推荐卡可键盘操作。
- [x] AI 上下文加入已整理食养摘要，不将传统理论写成疗效。
- [x] 更新静态资源版本，保留历史逻辑与全部入口。

### Task 5: 回归、复核与交付

- [x] Node 检查全部 JS 语法、内容覆盖、照片资源与推荐约束。
- [x] 起本地服务器，浏览器检查 375/393/430 与桌面、登录、详情、换一换、收藏、打卡、过敏与 NFC。
- [x] 修复发现的问题，独立审阅最终差异。
- [x] 记录真实验证结果与剩余素材缺口，附本地预览和发布操作说明。保持未推送供用户查看。

## 执行记录

- 2026-11-02：用户确认方案。已核查 main 同步与干净基线。为不改变用户发布目录，选择原目录新分支，避免 worktree 带来的另一个源码位置。
- Ruling: 不重复索取实施计划批准；本计划落实用户刚确认的完整方案与既定范围。

- 最终：9项测试通过，120道有实拍（19成品/101参考），主工作区已返回main，修改未提交未推送；交付说明详列未完成项。
