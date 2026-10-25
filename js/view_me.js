/* 节气食单 · 视图：我的（个人中心）
   并列入口：我的偏好 / 我的收藏 / 打卡记录 / 设置
   数据全部本机保存；清除数据二次确认；保存失败如实提示 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  JQ.ACCOUNT = {
    session: function () { return JQ.STORE.get(JQ.STORE.KEYS.SESSION, null); },
    accounts: function () { return JQ.STORE.get(JQ.STORE.KEYS.ACCOUNTS, []); },
    register: function (phone, password, nickname) {
      var list = JQ.ACCOUNT.accounts();
      if (list.some(function (a) { return a.phone === phone; })) {
        return { ok: false, reason: '该手机号已在本机注册过账号' };
      }
      var salt = Math.random().toString(36).slice(2, 10);
      list.push({
        phone: phone, salt: salt,
        hash: JQ.sha256(salt + password),
        nickname: nickname || ('食客' + phone.slice(-4)),
        createdAt: Date.now()
      });
      if (!JQ.STORE.set(JQ.STORE.KEYS.ACCOUNTS, list)) {
        return { ok: false, reason: '保存失败：本机存储不可用或已满' };
      }
      return JQ.ACCOUNT.login(phone, password);
    },
    login: function (phone, password) {
      var acc = JQ.ACCOUNT.accounts().filter(function (a) { return a.phone === phone; })[0];
      if (!acc) { return { ok: false, reason: '本机没有这个账号（账号仅保存在当前浏览器）' }; }
      if (acc.hash !== JQ.sha256(acc.salt + password)) {
        return { ok: false, reason: '密码不正确' };
      }
      var s = { phone: acc.phone, nickname: acc.nickname, at: Date.now() };
      if (!JQ.STORE.set(JQ.STORE.KEYS.SESSION, s)) {
        return { ok: false, reason: '保存失败：本机存储不可用' };
      }
      return { ok: true, session: s };
    },
    logout: function () { return JQ.STORE.remove(JQ.STORE.KEYS.SESSION); }
  };

  /* ---------- 我的（主页） ---------- */
  JQ.VIEWS.me = function () {
    var view = JQ.$('#view');
    var s = JQ.ACCOUNT.session();
    var prefs = JQ.PREFS.get();
    var favs = JQ.FAV.list();
    var checkins = JQ.FAV.checkins();
    var favCount = { recipe: 0, answer: 0, term: 0 };
    favs.forEach(function (f) { favCount[f.type] = (favCount[f.type] || 0) + 1; });

    var prefSummary;
    if (!prefs.provided) { prefSummary = '未提供（可跳过；未填写不等于无过敏）'; }
    else {
      var seg = [];
      seg.push(prefs.allergens.length ? '过敏：' + JQ.PREFS.allergenLabels().join('、') : (prefs.allergenNone ? '暂无已知过敏' : '过敏：未具体填写'));
      if (prefs.spicy != null) { seg.push('辣度：' + JQ.PREFS.SPICY_OPTIONS[prefs.spicy]); }
      if (prefs.scene) {
        var sc = JQ.PREFS.SCENE_OPTIONS.filter(function (o) { return o.id === prefs.scene; })[0];
        if (sc) { seg.push('场景：' + sc.label); }
      }
      prefSummary = seg.join(' · ');
    }

    view.innerHTML =
      JQ.HEADER('我的', '') +
      '<div class="wrap">' +
      '<div class="me-head">' +
      '<div class="avatar" aria-hidden="true">' + (s ? JQ.esc(s.nickname.slice(0, 1)) : '客') + '</div>' +
      '<div style="flex:1;min-width:0">' +
      (s
        ? '<div style="font-size:17px;font-weight:700">' + JQ.esc(s.nickname) + '</div><div class="muted small">本机账号 · ' + JQ.esc(s.phone.slice(0, 3) + '****' + s.phone.slice(-4)) + '</div>'
        : '<div style="font-size:17px;font-weight:700">访客模式</div><div class="muted small">不登录也能使用全部功能；登录仅在本机生效</div>') +
      '</div>' +
      (s
        ? '<button class="btn btn-sm btn-ghost" id="logout-btn">退出</button>'
        : '<a class="btn btn-sm btn-primary" href="#/login" style="margin-right:8px">登录</a><a class="btn btn-sm btn-ghost" href="#/register">注册</a>') +
      '</div>' +

      '<div class="me-list">' +
      '<a class="me-item" href="#/me/pref"><span class="mi-emoji">🥗</span><span>我的偏好<span class="mi-sub">' + JQ.esc(prefSummary) + '</span></span><span class="mi-arrow">›</span></a>' +
      '<a class="me-item" href="#/me/fav"><span class="mi-emoji">⭐</span><span>我的收藏<span class="mi-sub">菜品 ' + favCount.recipe + ' · AI 答案 ' + favCount.answer + ' · 节气知识 ' + favCount.term + '</span></span><span class="mi-arrow">›</span></a>' +
      '<a class="me-item" href="#/me/checkin"><span class="mi-emoji">📷</span><span>打卡记录<span class="mi-sub">共 ' + checkins.length + ' 条</span></span><span class="mi-arrow">›</span></a>' +
      '<a class="me-item" href="#/me/settings"><span class="mi-emoji">⚙️</span><span>设置<span class="mi-sub">AI 服务 · 本机数据 · 免责声明</span></span><span class="mi-arrow">›</span></a>' +
      '</div>' +

      '<div class="notice-amber">💾 本机保存：偏好、收藏、打卡与账号都只保存在当前浏览器，清理浏览器数据后可能丢失，且不支持跨设备同步。</div>' +
      '</div>';

    var lo = JQ.$('#logout-btn');
    if (lo) {
      lo.addEventListener('click', function () {
        JQ.confirm('退出登录？', '退出后以访客身份继续使用；本机的偏好、收藏、打卡不受影响。', '退出', function () {
          if (!JQ.ACCOUNT.logout()) { JQ.toast('退出失败：本机存储不可用', 'err'); return; }
          JQ.toast('已退出，当前为访客模式');
          JQ.VIEWS.me();
        });
      });
    }
  };

  /* ---------- 我的偏好（与引导页同一份画像） ---------- */
  JQ.VIEWS.pref = function () {
    var view = JQ.$('#view');
    var prefs = JQ.PREFS.get();

    function allergenChip(o) {
      var on = prefs.allergens.indexOf(o.id) >= 0;
      return '<button class="opt' + (on ? ' on' : '') + '" data-alg="' + o.id + '" aria-pressed="' + on + '">' + JQ.esc(o.label) + '</button>';
    }
    function cycleBtn(group, opts, val) {
      return '<div class="opt-grid" data-group="' + group + '">' + opts.map(function (o, i) {
        return '<button class="opt' + (val === i ? ' on' : '') + '" data-val="' + i + '" aria-pressed="' + (val === i) + '">' + JQ.esc(o) + '</button>';
      }).join('') + '</div>';
    }

    view.innerHTML =
      JQ.HEADER('我的偏好', '', true) +
      '<div class="wrap">' +
      '<div class="notice-amber">🛡️ <b>过敏与明确禁食是硬限制</b>：推荐、换菜、AI 回答、收藏加回都不会放宽。口味与耗时是软偏好，只影响排序。</div>' +
      '<div class="card"><h2>过敏原（多选）</h2>' +
      '<div class="opt-grid" style="margin-bottom:10px">' + JQ.PREFS.ALLERGEN_OPTIONS.map(allergenChip).join('') + '</div>' +
      '<div class="opt-grid">' +
      '<button class="opt' + (prefs.allergenNone ? ' warn-on' : '') + '" data-alg="__none">暂无已知过敏</button>' +
      '<button class="opt' + (prefs.allergenUnsure ? ' warn-on' : '') + '" data-alg="__unsure">不确定</button>' +
      '<button class="opt' + (prefs.allergenOther ? ' warn-on' : '') + '" data-alg="__other">其他</button>' +
      '</div>' +
      '<div class="hint">「暂无已知过敏」与具体过敏项互斥；未填写不等于无过敏。</div></div>' +

      '<div class="card"><h2>口味偏好</h2>' +
      '<div class="field"><label>辣度</label>' + cycleBtn('spicy', JQ.PREFS.SPICY_OPTIONS, prefs.spicy) + '</div>' +
      '<div class="field"><label>咸淡</label>' + cycleBtn('salt', JQ.PREFS.SALT_OPTIONS, prefs.salt) + '</div>' +
      '<div class="field" style="margin-bottom:0"><label>甜度</label>' + cycleBtn('sweet', JQ.PREFS.SWEET_OPTIONS, prefs.sweet) + '</div></div>' +

      '<div class="card"><h2>就餐场景</h2>' +
      '<div class="opt-grid" data-group="scene">' + JQ.PREFS.SCENE_OPTIONS.map(function (o) {
        return '<button class="opt' + (prefs.scene === o.id ? ' on' : '') + '" data-scene="' + o.id + '">' + JQ.esc(o.label) + '</button>';
      }).join('') + '</div>' +
      '<div class="field" style="margin-top:14px"><label>做饭耗时上限（可选）</label>' +
      '<div class="opt-grid" data-group="maxTime">' + JQ.PREFS.TIME_OPTIONS.map(function (o) {
        return '<button class="opt' + (prefs.maxTime === +o.id ? ' on' : '') + '" data-time="' + o.id + '">' + JQ.esc(o.label) + '</button>';
      }).join('') + '<button class="opt' + (prefs.maxTime == null ? ' on' : '') + '" data-time="">不限</button></div></div>' +
      '</div>' +

      '<button class="btn btn-primary btn-block" id="save-prefs">保存偏好</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn btn-ghost btn-block" id="clear-prefs">恢复未提供状态</button>' +
      '<div style="height:16px"></div>' +
      '</div>';

    /* 状态在本地副本上改，保存时落库 */
    var draft = JSON.parse(JSON.stringify(prefs));

    function rerender() { JQ.VIEWS.pref(); /* 简化：重绘保留 draft 逻辑 */ }
    /* 为避免重绘丢状态，这里不重绘，只改类 */
    function toggleClass(btn, on) {
      btn.classList.toggle('on', on);
      btn.classList.toggle('warn-on', on && btn.hasAttribute('data-alg'));
      btn.setAttribute('aria-pressed', on);
    }

    view.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button') : null;
      if (!t) { return; }
      if (t.hasAttribute('data-alg')) {
        var id = t.getAttribute('data-alg');
        if (id === '__none') {
          draft.allergenNone = !draft.allergenNone;
          if (draft.allergenNone) {
            draft.allergens = [];
            draft.allergenUnsure = false; draft.allergenOther = false;
            JQ.$$('[data-alg]').forEach(function (b) {
              var bid = b.getAttribute('data-alg');
              toggleClass(b, bid === '__none');
            });
          } else { toggleClass(t, false); }
          return;
        }
        if (id === '__unsure' || id === '__other') {
          var key = id === '__unsure' ? 'allergenUnsure' : 'allergenOther';
          draft[key] = !draft[key];
          toggleClass(t, draft[key]);
          return;
        }
        var i = draft.allergens.indexOf(id);
        if (i >= 0) { draft.allergens.splice(i, 1); toggleClass(t, false); }
        else {
          draft.allergens.push(id);
          draft.allergenNone = false;
          toggleClass(t, true);
          var noneBtn = JQ.$('[data-alg="__none"]');
          if (noneBtn) { toggleClass(noneBtn, false); }
        }
        return;
      }
      var group = t.closest('[data-group]');
      if (group) {
        var g = group.getAttribute('data-group');
        JQ.$$('button', group).forEach(function (b) { toggleClass(b, false); });
        if (g === 'spicy' || g === 'salt' || g === 'sweet') {
          var val = +t.getAttribute('data-val');
          if (draft[g] === val) { draft[g] = null; } else { draft[g] = val; toggleClass(t, true); }
        } else if (g === 'scene') {
          var sc = t.getAttribute('data-scene');
          if (draft.scene === sc) { draft.scene = null; } else { draft.scene = sc; toggleClass(t, true); }
        } else if (g === 'maxTime') {
          var tv = t.getAttribute('data-time');
          var v = tv === '' ? null : +tv;
          if (draft.maxTime === v) { draft.maxTime = null; var unlimited = JQ.$('[data-time=""]'); if (unlimited) { toggleClass(unlimited, true); } }
          else { draft.maxTime = v; toggleClass(t, true); }
        }
      }
    });

    JQ.$('#save-prefs').addEventListener('click', function () {
      draft.provided = true;
      draft.source = 'settings';
      /* 「暂无已知过敏」互斥已保证：勾具体项时清空 none */
      if (JQ.STORE.set(JQ.STORE.KEYS.PREFS, draft)) {
        JQ.toast('偏好已保存，食单与问答已按新偏好重算', 'ok');
        history.back();
      } else {
        JQ.toast('偏好保存失败：本机存储不可用或已满', 'err');
      }
    });
    JQ.$('#clear-prefs').addEventListener('click', function () {
      JQ.confirm('恢复「未提供」状态？', '将清空本机偏好画像；推荐页会恢复过敏核对提示。', '恢复', function () {
        var fresh = JQ.PREFS.DEFAULT();
        fresh.source = 'settings';
        if (JQ.STORE.set(JQ.STORE.KEYS.PREFS, fresh)) {
          JQ.toast('已恢复未提供状态');
          JQ.VIEWS.pref();
        } else { JQ.toast('操作失败：本机存储不可用', 'err'); }
      });
    });
    void rerender;
  };

  /* ---------- 我的收藏 ---------- */
  JQ.VIEWS.fav = function (tab) {
    var view = JQ.$('#view');
    tab = tab || 'recipe';
    var names = { recipe: '菜品', answer: 'AI 答案', term: '节气知识' };
    var list = JQ.FAV.byType(tab);

    var items = list.map(function (f, i) {
      var open = tab === 'recipe'
        ? 'href="#/recipe/' + JQ.esc(f.oid) + '"'
        : 'data-open="' + i + '"';
      return '<a class="me-item" ' + open + '>' +
        '<span class="mi-emoji">' + (tab === 'recipe' ? '🍽️' : tab === 'answer' ? '💬' : '📖') + '</span>' +
        '<span style="min-width:0">' + JQ.esc(f.snap.title) +
        '<span class="mi-sub">' + JQ.esc((f.snap.sub || '').slice(0, 42)) + (f.snap.sub && f.snap.sub.length > 42 ? '…' : '') +
        ' · ' + JQ.fmtDT(f.at) + '</span></span>' +
        (tab === 'recipe' ? '<span class="mi-arrow">›</span>' : '<span class="mi-arrow">查看</span>') +
        '</a>';
    }).join('');

    view.innerHTML =
      JQ.HEADER('我的收藏', '', true) +
      '<div class="wrap">' +
      '<div class="fav-tabs">' + ['recipe', 'answer', 'term'].map(function (k) {
        return '<button class="chip' + (tab === k ? ' on' : '') + '" data-tab="' + k + '">' + names[k] + '（' + JQ.FAV.byType(k).length + '）</button>';
      }).join('') + '</div>' +
      (list.length
        ? '<div class="me-list">' + items + '</div>' +
        (tab === 'recipe'
          ? '<div class="notice-blue">➕ 打开收藏的菜品 →「加回今日食单」：将按最新过敏偏好复检，冲突会被拒绝并说明原因；替换哪道由你选择。</div>'
          : '')
        : '<div class="card state-box"><div class="big">' + (tab === 'recipe' ? '🍽️' : tab === 'answer' ? '💬' : '📖') + '</div>' +
        '<div>还没有收藏' + names[tab] + '</div>' +
        '<a class="btn btn-ghost" href="#/home">去今日食单看看</a></div>') +
      '</div>';

    JQ.$$('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { JQ.VIEWS.fav(b.getAttribute('data-tab')); });
    });
    JQ.$$('[data-open]').forEach(function (el) {
      el.addEventListener('click', function () {
        var f = list[+el.getAttribute('data-open')];
        if (!f) { return; }
        if (tab === 'term') { location.hash = '#/term/' + JQ.esc(f.oid); return; }
        JQ.modal({
          title: JQ.esc(f.snap.title),
          body: '<div class="small muted" style="margin-bottom:8px">收藏于 ' + JQ.fmtDT(f.at) + '（内容快照）</div>' +
            '<div style="font-size:14px;line-height:1.9;white-space:pre-wrap">' + JQ.esc(f.snap.sub || '（无快照内容）') + '</div>',
          actions: [
            { label: '取消收藏', cls: 'btn-danger', onClick: function () {
              var res = JQ.FAV.toggle(f.type, f.oid, f.snap);
              if (res === false) { JQ.toast('已取消收藏（打卡记录不受影响）'); }
              JQ.VIEWS.fav(tab);
            } },
            { label: '关闭', cls: 'btn-primary' }
          ]
        });
      });
    });
  };

  /* ---------- 打卡记录 ---------- */
  JQ.VIEWS.checkin = function () {
    var view = JQ.$('#view');
    var list = JQ.FAV.checkins();
    var today = JQ.bjDateStr();

    var rows = list.map(function (c, i) {
      return '<div class="checkin-row"><span class="ci-dot" aria-hidden="true"></span>' +
        '<span>' + JQ.esc(c.title) + '</span>' +
        '<span class="ci-date">' + JQ.esc(c.date) + (c.date === today ? ' · 今天' : '') + '</span>' +
        (c.date === today ? '<button class="btn btn-sm btn-ghost" data-undo="' + i + '">撤销</button>' : '') +
        '</div>';
    }).join('');

    view.innerHTML =
      JQ.HEADER('打卡记录', '', true) +
      '<div class="wrap">' +
      (list.length
        ? '<div class="card">' + rows + '</div>' +
        '<div class="notice-blue">打卡按<b>北京时间</b>记录；同一天同一对象只记一次；仅浏览不会自动打卡；只有当天记录可撤销。</div>'
        : '<div class="card state-box"><div class="big">📷</div><div>还没有打卡记录</div>' +
        '<div class="small muted" style="margin:6px 0 4px">打开一道菜 → 点「打卡」主动记录</div>' +
        '<a class="btn btn-ghost" href="#/home">去今日食单</a></div>') +
      '</div>';

    JQ.$$('[data-undo]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = list[+b.getAttribute('data-undo')];
        if (!c) { return; }
        JQ.confirm('撤销这条打卡？', '「' + JQ.esc(c.title) + '」 ' + JQ.esc(c.date), '撤销', function () {
          var res = JQ.FAV.undoCheckin(c.oid, c.date);
          if (res.ok) { JQ.toast('已撤销'); }
          else if (res.saveFail) { JQ.toast('撤销失败：本机存储不可用', 'err'); }
          else { JQ.toast('未找到该记录', 'err'); }
          JQ.VIEWS.checkin();
        });
      });
    });
  };

  /* ---------- 设置 ---------- */
  JQ.VIEWS.settings = function () {
    var view = JQ.$('#view');
    var cfg = JQ.AI.cfg();
    var s = JQ.ACCOUNT.session();

    view.innerHTML =
      JQ.HEADER('设置', '', true) +
      '<div class="wrap">' +

      '<div class="card"><h3>🔌 AI 服务（DeepSeek）</h3>' +
      '<div class="small muted" style="margin-bottom:10px">API Key 只保存在你当前浏览器（本机），不会写入网页代码、不会随链接分享、不会发送给除 DeepSeek 以外的任何一方。</div>' +
      '<div class="field"><label for="ai-key">API Key</label>' +
      '<input class="input" id="ai-key" type="password" placeholder="sk-…（DeepSeek 开放平台获取）" value="' + JQ.esc(cfg.apiKey) + '" autocomplete="off">' +
      '<div class="hint">连接测试成功后，AI 问答页即可真实调用。</div></div>' +
      '<div class="field"><label for="ai-model">模型</label>' +
      '<select class="input" id="ai-model">' +
      ['deepseek-chat', 'deepseek-reasoner'].map(function (m) {
        return '<option value="' + m + '"' + (cfg.model === m ? ' selected' : '') + '>' + m + '</option>';
      }).join('') +
      '</select></div>' +
      '<div class="field"><label for="ai-url">接口地址（一般无需修改）</label>' +
      '<input class="input" id="ai-url" value="' + JQ.esc(cfg.baseUrl) + '"></div>' +
      '<div style="display:flex;gap:10px">' +
      '<button class="btn btn-ghost" style="flex:1" id="ai-test">测试连接</button>' +
      '<button class="btn btn-primary" style="flex:1" id="ai-save">保存配置</button>' +
      '</div></div>' +

      '<div class="card"><h3>💾 本机数据</h3>' +
      '<div class="small" style="color:var(--ink-2);line-height:1.8">偏好、收藏、打卡、账号与 AI 配置均保存在<b>当前浏览器</b>：清理浏览器数据（或使用无痕窗口）后可能丢失；不支持跨设备同步。聊天记录只存在当前页面，刷新后消失；已收藏的 AI 答案会长期保存在本机。</div>' +
      '<button class="btn btn-danger btn-block" style="margin-top:12px" id="clear-data">🗑️ 清除本机全部数据</button></div>' +

      '<div class="card"><h3>🧾 免责与说明</h3>' +
      '<div class="small" style="color:var(--ink-2);line-height:1.8">' +
      '① 本产品为课程演示项目：全部节气与菜谱内容为<b>演示数据（待核验）</b>，正式内容以人工审核为准。<br>' +
      '② 传统食俗与现代营养建议分区呈现，民俗不作疗效承诺；涉及健康请咨询专业人士。<br>' +
      '③ AI 回答由大模型生成，可能存在错误，请核验后采纳；过敏硬限制之外的内容请自行判断。<br>' +
      '④ 交节数据：2026 年引自香港天文台，2027–2029 年引自历表整理（待核验）。' +
      '</div></div>' +

      '<div class="card"><h3>ℹ️ 关于</h3>' +
      '<div class="small" style="color:var(--ink-2)">节气食单 · 第一版（访客模式 + 本机账号）<br>文化锚点：《论语·乡党》不时，不食<br>技术：纯静态 H5 · Hash 路由 · DeepSeek API（用户自配密钥）</div>' +
      (s ? '<div class="small muted" style="margin-top:8px">当前登录：' + JQ.esc(s.nickname) + '（本机账号）</div>' : '') +
      '</div>' +
      '<div style="height:8px"></div>' +
      '</div>';

    JQ.$('#ai-save').addEventListener('click', function () {
      var c = {
        apiKey: JQ.$('#ai-key').value.trim(),
        model: JQ.$('#ai-model').value,
        baseUrl: JQ.$('#ai-url').value.trim() || 'https://api.deepseek.com'
      };
      if (JQ.AI.saveCfg(c)) { JQ.toast('AI 配置已保存到本机', 'ok'); }
    });
    JQ.$('#ai-test').addEventListener('click', function () {
      /* 先保存当前输入再测试，避免测旧值 */
      var c = {
        apiKey: JQ.$('#ai-key').value.trim(),
        model: JQ.$('#ai-model').value,
        baseUrl: JQ.$('#ai-url').value.trim() || 'https://api.deepseek.com'
      };
      JQ.STORE.set(JQ.STORE.KEYS.AI_CFG, c);
      var btn = JQ.$('#ai-test');
      btn.textContent = '测试中…'; btn.disabled = true;
      JQ.AI.test().then(function (r) {
        btn.textContent = '测试连接'; btn.disabled = false;
        if (r.ok) { JQ.toast('连接成功：AI 问答已接通 ✓', 'ok', 3200); }
        else { JQ.toast('连接失败：' + r.message, 'err', 4000); }
      });
    });
    JQ.$('#clear-data').addEventListener('click', function () {
      JQ.confirm('清除本机全部数据？',
        '将删除本机保存的<b>偏好、收藏、打卡记录、账号与 AI 配置</b>，且无法恢复。聊天记录本就不保留。',
        '确认清除', function () {
          JQ.confirm('二次确认', '真的要清除吗？此操作不可撤销。', '清除', function () {
            if (JQ.STORE.clearAll()) {
              JQ.CHAT.messages = [];
              JQ.CHAT.contextRecipe = null;
              JQ.PICKS = {};
              JQ.toast('本机数据已清空', 'ok');
              location.hash = '#/home';
            } else {
              JQ.toast('清除失败：本机存储不可用', 'err');
            }
          }, true);
        }, true);
    });
  };
})();
