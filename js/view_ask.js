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
  var emptyBoxHtml = ''; // 空状态占位（问候+推荐），由 VIEWS.ask 注入，renderMessages 读取
  var pageSession = null;
  function disposePage() {
    if (!pageSession) { return; }
    var session = pageSession; session.active = false;
    if (session.delegate) { session.view.removeEventListener('click', session.delegate); }
    if (sending) {
      var last = JQ.CHAT.messages[JQ.CHAT.messages.length - 1];
      if (last && last.streaming) { JQ.CHAT.messages.pop(); JQ.CHAT.messages.push({ role: 'assistant-error', error: 'abort' }); }
    }
    var request = ctrl; ctrl = null; sending = false;
    if (request && request.abort) { request.abort(); }
    if (JQ.HEZHI) { JQ.HEZHI.dispose(); }
    pageSession = null;
  }
  JQ.ASK_PAGE = { dispose: disposePage };

  /* 图标（SVG 线性） */
  var ICON_SEND = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>';
  var ICON_STOP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>';
  var ICON_SMILE = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14s1.2 1.8 3.5 1.8S15.5 14 15.5 14"/><path d="M9 9.6h.01M15 9.6h.01" stroke-width="2.4"/></svg>';
  var ICON_WARN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 2.8 19.5h18.4L12 3.5z"/><path d="M12 10v4.2"/><path d="M12 17h.01"/></svg>';

  var EMOJIS = ['😊', '😄', '😋', '🤤', '😍', '🥰', '😌', '🤗',
    '🙂', '😆', '🤔', '😯', '😴', '😎', '🥳', '👍',
    '🙏', '❤️', '🔥', '🎉', '🍜', '🥣', '🍵', '🍂'];

  function msgHtml(m, idx) {
    if (m.role === 'user') {
      return '<div class="msg user">' + JQ.esc(m.text) + '</div>';
    }
    if (m.role === 'assistant') {
      var label = '<div class="msg-label"><span class="badge badge-green">禾知 · 食养助手</span>' +
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
    box.innerHTML = JQ.CHAT.messages.length
      ? JQ.CHAT.messages.map(msgHtml).join('')
      : emptyBoxHtml;
    box.scrollTop = box.scrollHeight;
    if (JQ.HEZHI) { JQ.HEZHI.setConversation(JQ.CHAT.messages.length > 0); }
  }

  JQ.VIEWS.ask = function () {
    disposePage();
    var view = JQ.$('#view');
    var session = { active: true, view: view, delegate: null };
    pageSession = session;
    var st = JQ.AI.status();
    var disp = JQ.SOLAR.displayTerm();

    var ctxChips = '';
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

    var quickTitles = ['今天吃什么', '了解食俗', JQ.CHAT.contextRecipe && r ? '菜谱追问' : '食堂怎么选', '替代食材'];
    var quickDescriptions = ['顺着时令安排一餐', '聊聊节气里的饮食文化', JQ.CHAT.contextRecipe && r ? '看看食材如何调整' : '用常见菜品搭配一餐', '说出需要避开的食材'];
    var quickIcons = ['bowl', 'term', 'leaf', 'edit'];
    /* 形象独立于消息列表，流式更新不会反复创建WebGL。 */
    emptyBoxHtml =
      '<div class="ask-empty">' +
      '<div class="rec-title">从一个问题开始</div>' +
      '<div class="rec-list">' + quicks.map(function (q, i) {
        return '<button class="rec-chip" data-quick="' + JQ.esc(q) + '" aria-label="' + JQ.esc(q) + '">' +
          JQ.ICONS.ui(quickIcons[i]) + '<span class="rec-chip-title">' + quickTitles[i] + '</span><small>' + quickDescriptions[i] + '</small></button>';
      }).join('') + '</div>' +
      '</div>';

    view.innerHTML =
      JQ.HEADER('食养问答', JQ.hdrTools('ask-search', 'ask-gear')) +
      JQ.SEARCH.html() +
      (st.ready ? '' : '<div class="ai-status-banner unconfigured" style="margin:12px 16px 0">🔌 AI 服务未接通——未配置 API Key。食单与百科不受影响。<a href="#/me/settings"><b>去设置 →</b></a></div>') +
      (ctxChips ? '<div style="padding:8px 16px 0">' + ctxChips + '</div>' : '') +
      (JQ.HEZHI ? JQ.HEZHI.html(disp.term, st.ready) : '') +
      '<div class="chat-area" id="chat-area">' +
      '<div id="chat-box"></div>' +
      '</div>' +
      '<div class="ask-inputbar">' +
      '<div class="emoji-panel" id="emoji-panel" hidden>' +
      EMOJIS.map(function (em) { return '<button type="button" data-emoji="' + em + '">' + em + '</button>'; }).join('') +
      '</div>' +
      '<div class="row">' +
      '<button class="warn-btn" id="warn-btn" aria-label="完整免责声明">' + ICON_WARN + '</button>' +
      '<textarea id="ask-input" rows="1" maxlength="' + JQ.AI.MAX_INPUT + '" placeholder="问禾知：这餐怎么吃…" aria-label="输入问题"></textarea>' +
      '<button class="emoji-btn" id="emoji-btn" aria-label="插入表情">' + ICON_SMILE + '</button>' +
      '<button class="send" id="send-btn" aria-label="发送">' + ICON_SEND + '</button>' +
      '</div>' +
      '</div>';

    if (JQ.HEZHI) { JQ.HEZHI.mount(view); }
    renderMessages();
    var previousMessage = JQ.CHAT.messages[JQ.CHAT.messages.length - 1];
    if (JQ.HEZHI && previousMessage) { JQ.HEZHI.setState(previousMessage.role === 'assistant-error' ? 'error' : 'answered'); }

    var input = JQ.$('#ask-input');
    var sendBtn = JQ.$('#send-btn');
    var emojiBtn = JQ.$('#emoji-btn');
    var emojiPanel = JQ.$('#emoji-panel');

    function setSending(on) {
      sending = on;
      sendBtn.innerHTML = on ? ICON_STOP : ICON_SEND;
      sendBtn.setAttribute('aria-label', on ? '停止生成' : '发送');
      input.disabled = on;
      if (on && emojiPanel) { emojiPanel.hidden = true; }
      if (on && JQ.HEZHI) { JQ.HEZHI.setState('thinking'); }
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
          if (!session.active) { return; }
          if (JQ.HEZHI) { JQ.HEZHI.setState('answering'); }
          aiMsg.text = full;
          var box = JQ.$('#chat-box');
          if (box) {
            /* 局部更新最后一条，避免整页重绘打断 */
            var last = box.lastElementChild;
            if (last && last.classList.contains('ai')) {
              var body = last.querySelector('.msg-body');
              if (!body) {
                last.innerHTML = '<div class="msg-label"><span class="badge badge-green">禾知 · 食养助手</span><span class="badge badge-blue">生成中…</span></div><div class="msg-body"></div>';
                body = last.querySelector('.msg-body');
              }
              body.textContent = full;
              box.scrollTop = box.scrollHeight;
            } else { renderMessages(); }
          }
        },
        onDone: function (res) {
          if (!session.active) { return; }
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
          if (JQ.HEZHI) { JQ.HEZHI.setState(res.ok ? 'answered' : 'error'); }
        }
      });
      /* 流式占位消息渲染成带 msg-body 的结构，供 onDelta 局部更新（若已同步失败则跳过） */
      var box0 = JQ.$('#chat-box');
      var lastMsg = JQ.CHAT.messages[JQ.CHAT.messages.length - 1];
      if (box0 && box0.lastElementChild && lastMsg && lastMsg.streaming) {
        box0.lastElementChild.innerHTML = '<div class="msg-label"><span class="badge badge-green">禾知 · 食养助手</span><span class="badge badge-blue">生成中…</span></div><div class="msg-body"></div>';
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

    /* 顶栏：节气搜索 + 设置（与首页右上角同位） */
    JQ.SEARCH.bind(JQ.$('#ask-search'));
    JQ.$('#ask-gear').addEventListener('click', function () {
      location.hash = '#/me/settings';
    });

    /* 表情面板：点笑脸展开，点表情插入到光标处 */
    if (emojiBtn && emojiPanel) {
      emojiBtn.addEventListener('click', function () {
        emojiPanel.hidden = !emojiPanel.hidden;
      });
      emojiPanel.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-emoji]') : null;
        if (!t) { return; }
        var em = t.getAttribute('data-emoji');
        var s = input.selectionStart, epos = input.selectionEnd;
        if (s == null) { s = epos = input.value.length; }
        input.value = input.value.slice(0, s) + em + input.value.slice(epos);
        input.focus();
        var pos = s + em.length;
        try { input.setSelectionRange(pos, pos); } catch (err) { /* ignored */ }
        emojiPanel.hidden = true;
      });
    }

    /* 快捷气泡 / 重试 / 收藏 / 复制（事件委托） */
    session.delegate = function (e) {
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
    };
    view.addEventListener('click', session.delegate);

    /* 警示按钮：完整免责声明 */
    JQ.$('#warn-btn').addEventListener('click', function () {
      JQ.modal({
        title: '使用须知',
        body: '<div class="small" style="color:var(--ink2);line-height:2">回答为时令饮食文化参考，<b>不构成医疗建议</b>；民俗内容不作疗效承诺。<br>聊天记录仅存本页，刷新后丢失（收藏的答案会保存到本机）。</div>',
        actions: [{ label: '知道了', cls: 'btn-primary' }]
      });
    });

    /* 移除菜谱上下文 */
    var cr = JQ.$('#ctx-recipe');
    if (cr) {
      cr.addEventListener('click', function () {
        JQ.CHAT.contextRecipe = null;
        JQ.VIEWS.ask();
      });
    }

    /* 重绘后重新激活滚动显现 */
    if (JQ.ROUTER && JQ.ROUTER.observeReveals) { JQ.ROUTER.observeReveals(); }
  };
})();
