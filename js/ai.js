/* 节气食单 · AI 问答适配层（DeepSeek，OpenAI 兼容协议）
   安全规则（对应需求定稿五(五)）：
   - API 密钥只保存在用户本机浏览器（localStorage），绝不写入前端代码或仓库
   - 不向模型发送任何用户身份信息（无手机号/昵称/账号）
   - 请求频率限制 + 输入长度限制；加载/停止/超时/失败/空回答/重试状态齐全
   - 回答完整生成后做成分与风险校验；医疗边界问题输出服务边界声明
   - 供应商未配置时状态为「未接通」，如实提示，不伪造答案 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var AI = {};
  JQ.AI = AI;

  AI.DEFAULT_CFG = { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', apiKey: '' };
  AI.MIN_INTERVAL = 3000;   // 两次请求最小间隔（频率限制）
  AI.MAX_INPUT = 500;       // 单次输入最大字符
  AI.TIMEOUT = 60000;       // 超时
  AI.MAX_HISTORY = 6;       // 携带的对话历史轮数

  var lastCallTs = 0;

  AI.cfg = function () {
    var saved = JQ.STORE.get(JQ.STORE.KEYS.AI_CFG, null);
    var c = { baseUrl: AI.DEFAULT_CFG.baseUrl, model: AI.DEFAULT_CFG.model, apiKey: '' };
    if (saved) {
      if (saved.baseUrl) { c.baseUrl = saved.baseUrl; }
      if (saved.model) { c.model = saved.model; }
      if (saved.apiKey) { c.apiKey = saved.apiKey; }
    }
    return c;
  };
  AI.saveCfg = function (cfg) {
    var ok = JQ.STORE.set(JQ.STORE.KEYS.AI_CFG, cfg);
    if (!ok) { JQ.toast('AI 配置保存失败：本机存储不可用', 'err'); }
    return ok;
  };
  AI.status = function () {
    var c = AI.cfg();
    return { ready: !!c.apiKey, cfg: c };
  };

  /* ---------- 上下文组装（不含身份信息） ---------- */
  AI.buildContext = function () {
    var parts = [];
    var disp = JQ.SOLAR.displayTerm();
    if (disp.term) {
      parts.push('当前节气：' + disp.term.name + '（宜食方向：' + disp.term.yi + '）');
    }
    if (JQ.CHAT.contextRecipe) {
      var r = JQ.DATA.recipeById(JQ.CHAT.contextRecipe);
      if (r) {
        parts.push('用户正在查看菜谱：' + r.name + '（食材：' +
          r.ing.map(function (i) { return i[0]; }).join('、') + '；过敏成分标注：' +
          (r.allergens.length ? r.allergens.map(function (a) { return JQ.DATA.ALLERGEN_NAMES[a]; }).join('、') : '无') + '）');
      }
    }
    var prefs = JQ.PREFS.get();
    if (prefs.provided) {
      var seg = [];
      if (prefs.allergens.length) { seg.push('过敏硬限制（任何推荐绝对不可包含）：' + JQ.PREFS.allergenLabels(prefs).join('、')); }
      if (prefs.allergenUnsure) { seg.push('用户对过敏原不确定，回答需提醒查看成分'); }
      if (prefs.spicy != null) { seg.push('辣度偏好：' + JQ.PREFS.SPICY_OPTIONS[prefs.spicy]); }
      if (prefs.salt != null) { seg.push('咸淡偏好：' + JQ.PREFS.SALT_OPTIONS[prefs.salt]); }
      if (prefs.sweet != null) { seg.push('甜度偏好：' + JQ.PREFS.SWEET_OPTIONS[prefs.sweet]); }
      if (prefs.scene) {
        var sc = JQ.PREFS.SCENE_OPTIONS.filter(function (o) { return o.id === prefs.scene; })[0];
        if (sc) { seg.push('就餐场景：' + sc.label); }
      }
      if (seg.length) { parts.push(seg.join('；')); }
    } else {
      parts.push('用户未提供过敏信息：不可默认其无过敏，回答中需提醒核对食材成分。');
    }
    return parts.join('\n');
  };

  AI.SYSTEM_PROMPT = function () {
    return [
      '你是「节气食单」的节气食养助手，围绕二十四节气的时令饮食、食材替换、家常做法与食俗文化回答问题。文化锚点：《论语·乡党》「不时，不食」。',
      '回答结构：先给【建议】，再给【原因】，最后给【可执行做法或替代方案】。语言简洁，适合手机阅读。',
      '严格边界：',
      '1) 只能引用对话上下文中实际提供的节气与菜谱知识，不得编造民俗出处、诗句或文献；不确定就明说「待核验」。',
      '2) 用户的过敏硬限制绝对不可违反：推荐任何菜或食材替换时，必须完全排除用户过敏列表中的食物及含其成分的菜品。',
      '3) 涉及治疗、疾病、用药、孕妇婴幼儿等特殊人群时：说明本服务不提供医疗建议，建议咨询医生或注册营养师，不作任何疗效承诺，不推荐具体药物。',
      '4) 传统食俗与现代营养信息分开表述，不得把民俗说成功效（如「吃 X 治 Y」）。',
      '5) 不讨论与节气饮食无关的话题，礼貌拉回。'
    ].join('\n');
  };

  /* ---------- 医疗边界识别 ---------- */
  AI.MEDICAL_KEYS = ['疗效', '治疗', '治病', '治好', '吃药', '服药', '药物', '疾病', '糖尿病', '高血压',
    '痛风', '癌症', '肿瘤', '孕妇', '怀孕', '哺乳', '月子', '婴儿', '宝宝能', '宝宝可', '减肥药', '肝病', '肾病'];
  AI.isMedical = function (text) {
    return AI.MEDICAL_KEYS.some(function (k) { return text.indexOf(k) >= 0; });
  };
  AI.MEDICAL_NOTE = '⚠️ 服务边界：节气食单提供的是时令饮食文化参考，不构成医疗建议。涉及治疗、用药或特殊人群（孕期、哺乳期、婴幼儿、慢性病等），请咨询医生或注册营养师，本回答不作任何疗效承诺。';

  /* ---------- 过敏成分校验（答案完整生成后执行） ---------- */
  AI.ALLERGEN_KEYWORDS = {
    fish: ['鱼', '鲈', '鳝', '鳕', '带鱼', '鱿鱼'],
    seafood: ['虾', '蟹', '贝', '蛤', '螺', '蚝', '海米', '扇贝'],
    egg: ['蛋'],
    dairy: ['奶', '奶酪', '黄油', '乳制品'],
    gluten: ['面', '麦', '面粉', '饺子皮', '馄饨皮', '面包'],
    soy: ['豆腐', '豆干', '香干', '豆豉', '酱油', '毛豆', '豆浆'],
    peanut: ['花生', '麻酱'],
    nut: ['栗', '核桃', '腰果', '杏仁', '白果', '松子', '瓜子', '八宝'],
    sesame: ['芝麻', '香油', '麻油']
  };
  /* 返回 {conflicts:[{allergen,keyword}]}；命中则该答案未通过校验，须附警示而非直接采纳 */
  AI.validate = function (answerText) {
    var prefs = JQ.PREFS.get();
    var conflicts = [];
    if (!prefs.allergens.length) { return { conflicts: conflicts }; }
    prefs.allergens.forEach(function (a) {
      var kws = AI.ALLERGEN_KEYWORDS[a] || [];
      kws.forEach(function (kw) {
        if (answerText.indexOf(kw) >= 0) {
          conflicts.push({ allergen: a, keyword: kw });
        }
      });
    });
    return { conflicts: conflicts };
  };

  /* ---------- 会话消息 ---------- */
  AI.messagesFor = function (question) {
    var msgs = [{ role: 'system', content: AI.SYSTEM_PROMPT() + '\n\n【用户上下文（非身份信息）】\n' + AI.buildContext() }];
    var hist = JQ.CHAT.messages.slice(-AI.MAX_HISTORY * 2)
      .filter(function (m) { return m.role === 'user' || m.role === 'assistant'; })
      .map(function (m) { return { role: m.role, content: m.text }; });
    return msgs.concat(hist, [{ role: 'user', content: question }]);
  };

  /* ---------- 调用（流式） ----------
     ask(question, {onDelta(text), onDone({ok,text,error,empty,conflicts,medical}), signal})
     错误类型：rate | length | unconfigured | network | timeout | abort | http | empty */
  AI.ask = function (question, handlers) {
    var cfg = AI.cfg();
    /* 同步失败也走异步回调，避免占位渲染竞态 */
    function failNow(err) {
      setTimeout(function () { handlers.onDone(err); }, 0);
    }
    if (!cfg.apiKey) {
      failNow({ ok: false, error: 'unconfigured' });
      return null;
    }
    if (!question || !question.trim()) {
      failNow({ ok: false, error: 'empty-input' });
      return null;
    }
    if (question.length > AI.MAX_INPUT) {
      failNow({ ok: false, error: 'length', max: AI.MAX_INPUT });
      return null;
    }
    var now = Date.now();
    if (now - lastCallTs < AI.MIN_INTERVAL) {
      failNow({ ok: false, error: 'rate', waitMs: AI.MIN_INTERVAL - (now - lastCallTs) });
      return null;
    }
    lastCallTs = now;

    var ctrl = new AbortController();
    var timedOut = false;
    var timer = setTimeout(function () { timedOut = true; ctrl.abort(); }, AI.TIMEOUT);

    var url = cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify({
        model: cfg.model,
        messages: AI.messagesFor(question),
        stream: true,
        max_tokens: 900,
        temperature: 0.6
      }),
      signal: ctrl.signal
    }).then(function (resp) {
      if (!resp.ok) {
        return resp.text().then(function (t) {
          var msg = t;
          try { msg = (JSON.parse(t).error || {}).message || t; } catch (e) { /* 原样 */ }
          throw { type: 'http', status: resp.status, message: String(msg).slice(0, 200) };
        });
      }
      var reader = resp.body.getReader();
      var decoder = new TextDecoder('utf-8');
      var buf = '';
      var full = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { return full; }
          buf += decoder.decode(r.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          lines.forEach(function (line) {
            var s = line.trim();
            if (s.indexOf('data:') !== 0) { return; }
            var payload = s.slice(5).trim();
            if (payload === '[DONE]') { return; }
            try {
              var j = JSON.parse(payload);
              var delta = j.choices && j.choices[0] && j.choices[0].delta;
              if (delta && delta.content) {
                full += delta.content;
                if (handlers.onDelta) { handlers.onDelta(full); }
              }
            } catch (e) { /* 忽略无法解析的分片 */ }
          });
          return pump();
        });
      }
      return pump();
    }).then(function (full) {
      clearTimeout(timer);
      if (!full || !full.trim()) {
        handlers.onDone({ ok: false, error: 'empty' });
        return;
      }
      var medical = AI.isMedical(question) || AI.isMedical(full);
      var v = AI.validate(full);
      handlers.onDone({ ok: true, text: full, medical: medical, conflicts: v.conflicts });
    }).catch(function (err) {
      clearTimeout(timer);
      if (err && err.type === 'http') {
        handlers.onDone({ ok: false, error: 'http', status: err.status, message: err.message });
        return;
      }
      if (ctrl.signal.aborted) {
        handlers.onDone({ ok: false, error: timedOut ? 'timeout' : 'abort' });
        return;
      }
      handlers.onDone({ ok: false, error: 'network', message: err && err.message ? String(err.message).slice(0, 160) : '' });
    });

    return ctrl;
  };

  /* 连接测试（设置页用） */
  AI.test = function () {
    var cfg = AI.cfg();
    if (!cfg.apiKey) { return Promise.resolve({ ok: false, message: '未填写 API Key' }); }
    return fetch(cfg.baseUrl.replace(/\/+$/, '') + '/models', {
      headers: { 'Authorization': 'Bearer ' + cfg.apiKey }
    }).then(function (r) {
      if (r.ok) { return { ok: true }; }
      return { ok: false, message: '服务返回 ' + r.status + '（密钥无效或无权限）' };
    }).catch(function (e) {
      return { ok: false, message: '网络失败：' + (e && e.message ? e.message : '无法连接') };
    });
  };
})();
