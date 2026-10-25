/* ============================================================
   节气食单 · 团队 AI 代理（Cloudflare Worker，免费额度足够课程使用）
   ------------------------------------------------------------
   作用：把 DeepSeek 密钥保存在服务端环境变量里，网站通过这个代理调用，
   所有访问者打开即已接通，且密钥永远不会出现在公开的前端代码中。

   部署步骤（约 10 分钟，免费）：
   1. 注册 https://dash.cloudflare.com （免费账号即可）
   2. 左侧 Workers & Pages → Create → Create Worker → 名字填 jieqi-ai → Deploy
   3. 点 Edit code，把本文件全部内容粘贴进去覆盖 → Save and Deploy
   4. Settings → Variables and Secrets →
        Add variable：类型选 Secret
        名称 DEEPSEEK_API_KEY，值填你的 sk- 开头密钥
        再 Add variable：类型 Text
        名称 SITE_ORIGIN，值填你的站点地址（如 https://你的用户名.github.io）
   5. 部署后得到地址 https://jieqi-ai.你的子域.workers.dev
   6. 打开 js/ai.js，把最上面的 AI.TEAM_PROXY_URL 填成这个地址
   7. 提交推送，全组打开网站即已接通

   说明：
   - 仅允许来自 SITE_ORIGIN 与本机的页面调用（防陌生人盗用）
   - 转发 /chat/completions（问答）与 /models（连接测试）两个接口
   - 如果 workers.dev 在你的网络打不开，可改用 Vercel Edge Function
     部署同样逻辑（见 README「团队 AI 接入」一节），或退回个人密钥模式
   ============================================================ */

const ALLOWED_ORIGINS = (env.SITE_ORIGIN || '').split(',').map(function (s) { return s.trim(); })
  .concat(['http://localhost:8080', 'http://127.0.0.1:8080']);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : ALLOWED_ORIGINS[0] || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const h = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: h });
    }
    if (!env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: { message: '代理未配置 DEEPSEEK_API_KEY，请按 deploy/cloudflare-worker.js 注释第 4 步设置' } }),
        { status: 500, headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
    }
    /* 来源限制：不是允许的来源直接拒绝（密钥更安全） */
    if (origin && ALLOWED_ORIGINS.indexOf(origin) < 0) {
      return new Response(JSON.stringify({ error: { message: '来源不被允许' } }),
        { status: 403, headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/chat/completions' && url.pathname !== '/models') {
      return new Response(JSON.stringify({ error: { message: '本代理只开放 /chat/completions 与 /models' } }),
        { status: 404, headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
    }

    const headers = new Headers(request.headers);
    headers.set('Authorization', 'Bearer ' + env.DEEPSEEK_API_KEY); /* 用服务端密钥替换前端占位 */
    const resp = await fetch('https://api.deepseek.com' + url.pathname, {
      method: request.method,
      headers: headers,
      body: request.method === 'GET' ? undefined : request.body
    });
    const out = new Response(resp.body, resp);
    Object.keys(h).forEach(function (k) { out.headers.set(k, h[k]); });
    return out;
  }
};
