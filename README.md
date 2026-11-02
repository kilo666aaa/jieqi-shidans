# 节气食单（移动端网站 · 第一版）

以二十四节气时令食俗为文化主线，回答「今天这个节气吃什么、为什么这样吃」的移动端 H5。
文化锚点：《论语·乡党》**不时，不食**。

- 纯静态实现：原生 HTML/CSS/JS，无框架、无构建工具，可直接托管在 GitHub Pages
- Hash 路由（`#/home`、`#/recipe/:id`、`#/term/:id`…），静态托管下刷新/直达不 404
- 统一入口协议：NFC 卡 / 二维码 / 普通链接均为 `/?t=<节气拼音>`（如 `?t=hanlu` → 寒露）
- 四大板块：今日食单 · AI 问答 · 节气百科 · 我的
- 数据全部本机保存（偏好 / 收藏 / 打卡 / 本机账号）；聊天记录仅会话内存
- AI 问答：DeepSeek（OpenAI 兼容协议），API Key 由用户在「设置」填入、只存本机，不进代码

## 本地运行

```bash
# 任选一种静态服务器（file:// 直接打开也可运行，但部分浏览器功能受限，推荐 http）
cd jieqi-shidan
python -m http.server 8080
# 访问 http://127.0.0.1:8080
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库（如 `jieqi-shidan`），把本目录内容推送上去：

   ```bash
   git init
   git add .
   git commit -m "节气食单 第一版"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/jieqi-shidan.git
   git push -u origin main
   ```

2. 仓库 **Settings → Pages → Build and deployment → Source** 选 `Deploy from a branch`，分支选 `main`、目录选 `/ (root)`，保存。
3. 约 1–2 分钟后得到线上地址 `https://<你的用户名>.github.io/jieqi-shidan/`。
4. NFC 卡 / 二维码写入地址格式：`https://<你的用户名>.github.io/jieqi-shidan/?t=<节气拼音>`
   （24 个拼音：lichun yushui jingzhe chunfen qingming guyu lixia xiaoman mangzhong xiazhi xiaoshu dashu liqiu chushu bailu qiufen hanlu shuangjiang lidong xiaoxue daxue dongzhi xiaohan dahan）

## AI 问答接通（DeepSeek）

1. 打开网站 →「我的 → 设置 → AI 服务」
2. 填入 DeepSeek 开放平台的 API Key（sk-…），点「测试连接」
3. 成功后「AI 问答」页即可真实调用（模型 deepseek-chat / deepseek-reasoner 可选）

密钥只保存在你当前浏览器 localStorage，不写入仓库、不随分享链接携带。

## 数据来源与审核状态（重要）

- **交节时刻**：2026 年引自香港天文台《二十四节气的日期及时间资料》（依据英国皇家航海历书局及美国海军天文气象台数据，北京时间 UTC+8）；2027–2029 年引自历表整理（**待核验**）。超出覆盖年份时系统如实提示不可用，不外推。
- **节气百科 / 菜谱**：全部为课程**演示数据（待核验）**，页面上均有「演示数据」角标；物候三候整理自《月令七十二候集解》。正式上线前须由小组人工审核替换。
- 民俗与现代营养建议分区展示，不作疗效承诺。

## 验收对照

开发方自测记录见《工作日志》文档；验收清单（20 条）以《节气食单_移动端网站第一版需求定稿》第八章为准。

## 目录结构

```
index.html                  入口（Shell + 底部 Tab）
css/style.css               设计系统（米白 + 节气青 + 暖色）
js/util.js                  工具（toast/modal/北京时间/SHA-256）
js/data_terms.js            24 节气 + 2026–2029 交节表（含来源）
js/data_recipes_*.js        120 道候选菜（每节气 5 道，含过敏标注）
js/solar.js                 节气定位（参数 > 选择 > 交节表）
js/store.js                 本机存储层（失败如实提示）
js/prefs.js                 偏好画像 + 硬过滤 + 软排序 + 推荐位
js/fav.js                   收藏/打卡（独立数据）+ 加回复检
js/ai.js                    DeepSeek 适配层（频率/长度/超时/校验）
js/view_*.js                页面视图
js/router.js                Hash 路由 + 滚动记忆
js/app.js                   入口（?t= 协议、首访引导邀请）
```

## 团队 AI 接入（让所有人打开即已接通）

个人模式下 API Key 只存在各自浏览器（安全但每人要配一次）。若想让**全组打开网站就已是接通状态**，用团队代理（密钥放在免费云服务的环境变量里，绝不进公开代码）：

1. 注册 [Cloudflare](https://dash.cloudflare.com)（免费）→ **Workers & Pages → Create Worker**，名字如 `jieqi-ai`
2. 点 **Edit code**，粘贴 `deploy/cloudflare-worker.js` 全部内容 → **Save and Deploy**
3. **Settings → Variables and Secrets**：
   - 新增 **Secret**：名称 `DEEPSEEK_API_KEY`，值填你的 `sk-` 密钥
   - 新增 **Text**：名称 `SITE_ORIGIN`，值填站点地址（如 `https://你的用户名.github.io`）
4. 复制 Worker 地址（形如 `https://jieqi-ai.xxx.workers.dev`），填到 `js/ai.js` 顶部的 `AI.TEAM_PROXY_URL = ''` 引号里
5. 提交推送 → 全组打开网站即显示「已接通（团队服务）」，无需任何配置

优先级：个人密钥 > 团队代理。若部分同学网络打不开 `workers.dev`，可改用 Vercel Edge / Deno Deploy 部署同一份逻辑，或退回个人密钥模式（当前模式不受影响）。
