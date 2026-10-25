/* ============================================================
   节气食单 · 团队 AI 代理（腾讯云 / 任意云服务器 Node.js 版）
   ------------------------------------------------------------
   与 deploy/cloudflare-worker.js 同一逻辑：密钥放服务器环境变量，
   网站经此代理调用 DeepSeek，访问者打开即已接通，密钥不进公开代码。

   【服务器上的运行步骤】（Node.js 16+，无需安装任何依赖）
   1. 把本文件上传到服务器，例如 /opt/jieqi-ai/server.js
   2. 启动（密钥只放环境变量，不要写进任何文件）：
        DEEPSEEK_API_KEY=sk-你的密钥 \
        SITE_ORIGIN=https://你的用户名.github.io \
        PORT=8788 \
        node /opt/jieqi-ai/server.js
   3. 常驻运行（二选一）：
        pm2 start server.js --name jieqi-ai --env ... 
        或 systemd：见文末注释
   4. 【必须 HTTPS】：GitHub Pages 是 https，浏览器禁止 https 页面调用
      http 接口（混合内容拦截）。用 Nginx 反代 + 免费证书：
        sudo apt install nginx certbot python3-certbot-nginx
        # /etc/nginx/conf.d/jieqi-ai.conf:
        #   server {
        #     server_name api.你的域名.com;
        #     location / {
        #       proxy_pass http://127.0.0.1:8788;
        #       proxy_http_version 1.1;
        #       proxy_set_header Connection "";
        #       proxy_buffering off;          # 流式输出必须关
        #     }
        #   }
        sudo certbot --nginx -d api.你的域名.com
   5. 把 https://api.你的域名.com 填进 js/ai.js 的 AI.TEAM_PROXY_URL

   ⚠️ 域名与备案：大陆地域服务器绑域名对外服务需 ICP 备案（约 1–2 周）；
      腾讯云香港/境外地域不需要备案，且大陆可直接访问，课程项目推荐。

   【自由配置说明】
   - 换密钥：改环境变量 DEEPSEEK_API_KEY 后重启即可
   - 换模型（deepseek-chat / deepseek-reasoner）：无需动服务器，
     模型名由前端传入，用户在「设置」里自己选
   - 换供应商（如 OpenAI 兼容的其他服务）：改本文件里的
     UPSTREAM_HOST 一行即可
   ============================================================ */
'use strict';
const http = require('http');
const https = require('https');

const UPSTREAM_HOST = 'api.deepseek.com'; /* 换供应商改这里 */
const KEY = process.env.DEEPSEEK_API_KEY || '';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || '').split(',').map(s => s.trim());
const PORT = parseInt(process.env.PORT || '8788', 10);
const ALLOWED_PATHS = ['/chat/completions', '/models'];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  const allow = SITE_ORIGIN.includes(origin)
    ? origin
    : (SITE_ORIGIN[0] || '*');
  const cors = {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }
  if (!KEY) {
    res.writeHead(500, Object.assign({ 'Content-Type': 'application/json' }, cors));
    return res.end(JSON.stringify({ error: { message: '未配置 DEEPSEEK_API_KEY 环境变量' } }));
  }
  if (!ALLOWED_PATHS.includes(req.url)) {
    res.writeHead(404, Object.assign({ 'Content-Type': 'application/json' }, cors));
    return res.end(JSON.stringify({ error: { message: '本代理只开放 /chat/completions 与 /models' } }));
  }

  const upstream = https.request({
    host: UPSTREAM_HOST,
    path: req.url,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + KEY, /* 服务端密钥替换前端占位 */
      'Accept': req.headers.accept || 'application/json'
    }
  }, (up) => {
    const headers = Object.assign({}, up.headers, cors);
    delete headers['content-length']; /* 流式长度会变 */
    res.writeHead(up.statusCode, headers);
    up.pipe(res); /* 流式透传 */
  });
  upstream.on('error', (e) => {
    res.writeHead(502, Object.assign({ 'Content-Type': 'application/json' }, cors));
    res.end(JSON.stringify({ error: { message: '上游请求失败: ' + e.message } }));
  });
  req.pipe(upstream); /* 请求体透传 */
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('[jieqi-ai] listening on 127.0.0.1:' + PORT +
    ' | upstream: ' + UPSTREAM_HOST +
    ' | allow origins: ' + (SITE_ORIGIN.join(', ') || '*'));
});

/* systemd 常驻（/etc/systemd/system/jieqi-ai.service）：
   [Unit]
   Description=jieqi-ai proxy
   After=network.target
   [Service]
   Environment=DEEPSEEK_API_KEY=sk-xxx
   Environment=SITE_ORIGIN=https://你的用户名.github.io
   Environment=PORT=8788
   ExecStart=/usr/bin/node /opt/jieqi-ai/server.js
   Restart=always
   [Install]
   WantedBy=multi-user.target
   # 然后: systemctl daemon-reload && systemctl enable --now jieqi-ai
*/
