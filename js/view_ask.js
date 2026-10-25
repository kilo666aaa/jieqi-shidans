/* 节气食单 · 视图：AI 问答
   聊天记录仅存会话内存（刷新丢失）；已收藏答案持久保存本机
   状态齐全：未接通/加载中/停止/超时/失败/空回答/手动重试 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  var sending = false;
  var ctrl = null;      // AbortController
  var lastQ = '';       // 供重试

  function msgHtml(m, idx) {
    if (m.role === 'user') {
      return '<div class="msg user">' + JQ.esc(m.text) + '</div>';
    }
    if (m.role === 'assistant') {
      var label = '<div class="msg-label"><span class="badge badge-green">节气食单助手</span>' +
        (m.streaming ? '<span class="badge badge-blue">生成中…</span>' : '') + '</div>';
      var body = JQ.esc(m.text);
      var warn = '';
      if (m.conflicts && m.conflicts.length) {
        var kws = {};
        m.conflicts.forEach(function (c) {
          var label2 = JQ.DATA.ALLERGEN_NAMES[c.allergen] || c.allergen;
          kws[label2] = true;
        });
        warn = '<div class="notice-amber" style="margin:8px 0 0">⚠️ <b>成分校验提示：</b>回答中出现了与你过敏限制相关的食物（' +
          Object.keys(kws).join('、') + '）。该回答未通过校验，请勿直接采纳相关建议；可追问替代食材。</div>';
      }
      var medical = m.medical
        ? '<div class="notice-blue" style="margin:8px 0 0">' + JQ.AI.MEDICAL_NOTE + '</div>'
        : '';
      var tools = '';
      if (!m.streaming) {
        var favId = m.favId;
        tools = '<div class="msg-tools">' +
          (favId
            ? '<span class="badge badge-green">已收藏</span>'
            : '<button class="btn btn-sm btn-ghost" data-fav="' + idx + '">☆ 收藏答案</button>') +
          '<button class="btn btn-sm btn-ghost" data-copy="' + idx + '">复制</button>' +
          '</div>';
      }
      return '<div class="msg ai">' + label + body + warn + medical + tools + '</div>';
    }
    if (m.role === 'assistant-error') {
      var reason = '';
      if (m.error === 'unconfigured') {
        reason = 'AI 服务未接通：还没有配置 DeepSeek API。你可以先浏览今日食单与节气百科（不受影响），或到「设置 → AI 服务」完成配置。';
      } else if (m.error === 'rate') {
        reason = '提问太快啦，请几秒后再试（已设置频率限制）。';
      } else if (m.error === 'length') {
        reason = '问题太长了（上限 ' + (m.max || JQ.AI.MAX_INPUT) + ' 字），请精简后再问。';
      } else if (m.error === 'timeout') {
        reason = '请求超时（60 秒）。你的输入已保留，可点击重试。';
      } else if (m.error === 'abort') {
        reason = '已停止生成。';
      } else if (m.error === 'empty') {
        reason = '模型返回了空回答，可能是服务波动。可重试或换个问法。';
      } else if (m.error === 'http') {
        reason = '服务返回错误（' + (m.status || '') + '）：' + JQ.esc(m.message || '') + '。请检查 API Key 是否有效、账户是否有余额。';
      } else {
        reason = '网络失败：' + JQ.esc(m.message || '无法连接服务') + '。弱网时食单与百科仍可浏览。';
      }
      return '<div class="msg ai fail">' + reason +
        '<div class="msg-tools"><button class="btn btn-sm btn-ghost" data-retry="1">↻ 重试</button></div></div>';
    }
    return '';
  }

  function renderMessages() {
    var box = JQ.$('#chat-box');
    if (!box) { return; }
    box.innerHTML = JQ.CHAT.messages.map(msgHtml).join('');
    box.scrollTop = box.scrollHeight;
  }

  JQ.VIEWS.ask = function () {
    var view = JQ.$('#view');
    var st = JQ.AI.status();
    var disp = JQ.SOLAR.displayTerm();

    var ctxChips = '';
    if (disp.term) { ctxChips += '<span class="ctx-chip">🌤️ ' + JQ.esc(disp.term.name) + (disp.browsing ? '（浏览中）' : '（当前）') + '</span>'; }
    if (JQ.CHAT.contextRecipe) {
      var r = JQ.DATA.recipeById(JQ.CHAT.contextRecipe);
      if (r) { ctxChips += '<span class="ctx-chip" id="ctx-recipe">🍲 ' + JQ.esc(r.name) + ' ✕</span>'; }
    }

    var quicks = disp.term ? [
      '「' + disp.term.name + '」适合吃什么？为什么？',
      '讲讲「' + disp.term.name + '」的食俗和来历',
      JQ.CHAT.contextRecipe && r ? '「' + r.name + '」可以用什么食材替换？' : '食堂场景怎么按节气选菜？',
      '对某种食材过敏，帮我看看替代方案'
    ] : ['今天适合吃什么？', '讲讲节气食俗'];

    view.innerHTML =
      JQ.HEADER('AI 食养问答', '') +
      (st.ready
        ? (st.mode === 'team'
          ? '<div class="ai-status-banner ready" style="margin:12px 16px 0">🔌 已接通：' + JQ.esc(st.cfg.model) + '（DeepSeek · 团队服务，无需自配密钥）</div>'
          : '<div class="ai-status-banner ready" style="margin:12px 16px 0">🔌 已接通：' + JQ.esc(st.cfg.model) + '（DeepSeek）· 密钥仅存本机</div>')
        : '<div class="ai-status-banner unconfigured" style="margin:12px 16px 0">🔌 AI 服务未接通——未配置 API Key。食单与百科不受影响。<a href="#/me/settings"><b>去设置 →</b></a></div>') +
      '<div style="padding:8px 16px 0">' + ctxChips + '</div>' +
      '<div class="quick-chips">' + quicks.map(function (q) {
        return '<button class="chip" data-quick="' + JQ.esc(q) + '">' + JQ.esc(q) + '</button>';
      }).join('') + '</div>' +
      '<div class="chat-area" id="chat-area">' +
      '<div id="chat-box">' +
      (JQ.CHAT.messages.length ? '' :
        '<div class="state-box"><div class="big">💬</div><div>围绕节气食养、食材替换、做法与食俗文化提问<br>回答会结合当前节气与你的偏好（不发送身份信息）</div></div>') +
      '</div>' +
      '</div>' +
      '<div class="ask-inputbar">' +
      '<div class="row">' +
      '<textarea id="ask-input" rows="1" maxlength="' + JQ.AI.MAX_INPUT + '" placeholder="问点什么…（' + JQ.AI.MAX_INPUT + ' 字内）" aria-label="输入问题"></textarea>' +
      '<button class="send" id="send-btn" aria-label="发送">➤</button>' +
      '</div>' +
      '<div class="disclaim">回答为时令饮食文化参考，不构成医疗建议；民俗不作疗效承诺。聊天记录仅存本页，刷新后丢失（收藏的答案会保存到本机）。</div>' +
      '</div>';

    renderMessages();

    var input = JQ.$('#ask-input');
    var sendBtn = JQ.$('#send-btn');

    function setSending(on) {
      sending = on;
      sendBtn.textContent = on ? '■' : '➤';
      sendBtn.setAttribute('aria-label', on ? '停止生成' : '发送');
      input.disabled = on;
    }

    function doAsk(q) {
      if (sending) { return; }
      if (!q || !q.trim()) { JQ.toast('请输入问题'); return; }
      if (q.length > JQ.AI.MAX_INPUT) { JQ.toast('问题超过 ' + JQ.AI.MAX_INPUT + ' 字，请精简', 'err'); return; }
      lastQ = q;
      JQ.CHAT.messages.push({ role: 'user', text: q });
      var aiMsg = { role: 'assistant', text: '', streaming: true };
      JQ.CHAT.messages.push(aiMsg);
      renderMessages();
      setSending(true);

      ctrl = JQ.AI.ask(q, {
        onDelta: function (full) {
          aiMsg.text = full;
          var box = JQ.$('#chat-box');
          if (box) {
            /* 局部更新最后一条，避免整页重绘打断 */
            var last = box.lastElementChild;
            if (last && last.classList.contains('ai')) {
              var body = last.querySelector('.msg-body');
              if (!body) {
                last.innerHTML = '<div class="msg-label"><span class="badge badge-green">节气食单助手</span><span class="badge badge-blue">生成中…</span></div><div class="msg-body"></div>';
                body = last.querySelector('.msg-body');
              }
              body.textContent = full;
              box.scrollTop = box.scrollHeight;
            } else { renderMessages(); }
          }
        },
        onDone: function (res) {
          setSending(false);
          ctrl = null;
          JQ.CHAT.messages.pop(); // 移除流式占位
          if (res.ok) {
            JQ.CHAT.messages.push({
              role: 'assistant', text: res.text, medical: res.medical,
              conflicts: res.conflicts, at: Date.now()
            });
          } else {
            JQ.CHAT.messages.push({
              role: 'assistant-error', error: res.error,
              status: res.status, message: res.message, max: res.max
            });
          }
          renderMessages();
        }
      });
      /* 流式占位消息渲染成带 msg-body 的结构，供 onDelta 局部更新（若已同步失败则跳过） */
      var box0 = JQ.$('#chat-box');
      var lastMsg = JQ.CHAT.messages[JQ.CHAT.messages.length - 1];
      if (box0 && box0.lastElementChild && lastMsg && lastMsg.streaming) {
        box0.lastElementChild.innerHTML = '<div class="msg-label"><span class="badge badge-green">节气食单助手</span><span class="badge badge-blue">生成中…</span></div><div class="msg-body"></div>';
      }
    }

    sendBtn.addEventListener('click', function () {
      if (sending) {
        if (ctrl) { ctrl.abort(); }
        return;
      }
      var q = input.value.trim();
      input.value = '';
      doAsk(q);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !sending) {
        e.preventDefault();
        var q = input.value.trim();
        input.value = '';
        doAsk(q);
      }
    });

    /* 快捷气泡 / 重试 / 收藏 / 复制（事件委托） */
    view.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-quick],[data-retry],[data-fav],[data-copy]') : null;
      if (!t) { return; }
      if (t.hasAttribute('data-quick')) { doAsk(t.getAttribute('data-quick')); }
      else if (t.hasAttribute('data-retry')) {
        JQ.CHAT.messages = JQ.CHAT.messages.filter(function (m) { return m.role !== 'assistant-error'; });
        if (lastQ) { doAsk(lastQ); }
      }
      else if (t.hasAttribute('data-fav')) {
        var idx = +t.getAttribute('data-fav');
        var m = JQ.CHAT.messages[idx];
        if (!m) { return; }
        var q0 = '';
        for (var k = idx - 1; k >= 0; k--) { if (JQ.CHAT.messages[k].role === 'user') { q0 = JQ.CHAT.messages[k].text; break; } }
        var res = JQ.FAV.toggle('answer', 'ans-' + (m.at || Date.now()), {
          title: 'Q：' + (q0.slice(0, 40) || 'AI 回答'),
          sub: m.text
        });
        if (res === true) {
          m.favId = 'ans-' + (m.at || Date.now());
          JQ.toast('答案已收藏到本机（可长期保存）', 'ok');
        } else if (res === false) { JQ.toast('已取消收藏'); }
        renderMessages();
      }
      else if (t.hasAttribute('data-copy')) {
        var m2 = JQ.CHAT.messages[+t.getAttribute('data-copy')];
        if (m2) { JQ.copyText(m2.text); }
      }
    });

    /* 移除菜谱上下文 */
    var cr = JQ.$('#ctx-recipe');
    if (cr) {
      cr.addEventListener('click', function () {
        JQ.CHAT.contextRecipe = null;
        JQ.VIEWS.ask();
      });
    }
  };
})();
