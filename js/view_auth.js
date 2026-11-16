/* 节气食单 · 视图：本机账号（登录/注册）+ 首次偏好引导
   账号规则（诚实约束）：静态托管无后端，账号只保存在当前浏览器——
   不能跨设备登录、不能短信验证码、不能找回密码；偏好/收藏/打卡始终本机保存
   v2：全屏「节气星环」3D 粒子场景（js/login_scene.js，Canvas 透视投影）+ GSAP 入场 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  var HONEST_NOTE = '本机账号：静态托管无后端，账号仅保存在当前浏览器——不支持跨设备登录、无短信验证码、密码无法找回（可清除数据重新注册）。偏好、收藏、打卡与本机绑定。';

  function scene(mode) { /* mode: 'login' | 'register' */
    var view = JQ.$('#view');
    var cur = JQ.SOLAR && JQ.SOLAR.current();
    var mark = cur.ok && JQ.marksSVG ? JQ.marksSVG(cur.term, { current: true }) : '';

    view.innerHTML =
      '<div class="auth-scene">' +
      '<button class="btn btn-sm btn-ghost auth-back" id="auth-back">‹ 返回首页</button>' +
      '<div class="auth-brand" id="auth-brand">' +
      (mark || '') +
      '<div class="brand-name">节气食单</div>' +
      '<div class="brand-sub">不时不食 · 顺时而餐</div>' +
      '<div class="brand-motto">—— 一年 · 二十四气 · 一桌时味 ——</div>' +
      '</div>' +
      '<div class="auth-card" id="auth-card">' +
      '<div class="auth-tabs" role="tablist">' +
      '<button type="button" role="tab" data-go="login" class="' + (mode === 'login' ? 'on' : '') + '" aria-selected="' + (mode === 'login') + '">登录</button>' +
      '<button type="button" role="tab" data-go="register" class="' + (mode === 'register' ? 'on' : '') + '" aria-selected="' + (mode === 'register') + '">注册</button>' +
      '</div>' +
      (mode === 'login'
        ? '<h2>欢迎回来</h2><div class="auth-lead">登录后偏好、收藏与打卡仍在这一台设备上等你</div>' +
          '<div class="auth-field"><label for="lg-phone">手机号</label>' +
          '<input id="lg-phone" inputmode="numeric" maxlength="11" placeholder="11 位手机号（仅本机校验格式）" autocomplete="username"></div>' +
          '<div class="auth-field"><label for="lg-pw">密码</label>' +
          '<input id="lg-pw" type="password" placeholder="注册时设置的密码" autocomplete="current-password"></div>' +
          '<button class="btn btn-primary btn-block" id="lg-btn">登录（本机）</button>' +
          '<div class="auth-alt">先随便逛逛？<a href="#/home">游客模式全功能可用</a></div>'
        : '<h2>注册本机账号</h2><div class="auth-lead">30 秒完成，注册即登录</div>' +
          '<div class="auth-field"><label for="rg-phone">手机号</label>' +
          '<input id="rg-phone" inputmode="numeric" maxlength="11" placeholder="11 位手机号"></div>' +
          '<div class="auth-field"><label for="rg-nick">昵称（可选）</label>' +
          '<input id="rg-nick" maxlength="12" placeholder="不填则自动生成"></div>' +
          '<div class="auth-field"><label for="rg-pw">设置密码（≥6 位）</label>' +
          '<input id="rg-pw" type="password" placeholder="至少 6 位" autocomplete="new-password"></div>' +
          '<div class="auth-field"><label for="rg-pw2">确认密码</label>' +
          '<input id="rg-pw2" type="password" placeholder="再输入一次" autocomplete="new-password"></div>' +
          '<button class="btn btn-primary btn-block" id="rg-btn">注册并登录（本机）</button>') +
      '<div class="auth-honest">🔐 ' + HONEST_NOTE + '</div>' +
      '</div>' +
      '</div>';

    /* GSAP 入场（缺席时靠 CSS 自然呈现） */
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.from('#auth-brand', { y: 26, opacity: 0, duration: .8, ease: 'power2.out' });
      gsap.from('#auth-card', { y: 34, opacity: 0, duration: .8, delay: .12, ease: 'power3.out' });
      gsap.from('.auth-card > *', { y: 12, opacity: 0, duration: .45, stagger: .05, delay: .3, ease: 'power2.out', clearProps: 'all' });
    }

    JQ.$('#auth-back').addEventListener('click', function () { location.hash = '#/home'; });
    JQ.$$('.auth-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        var to = b.getAttribute('data-go');
        if (to !== mode) { location.hash = '#/' + to; }
      });
    });

    if (mode === 'login') {
      JQ.$('#lg-btn').addEventListener('click', function () {
        var phone = JQ.$('#lg-phone').value.trim();
        var pw = JQ.$('#lg-pw').value;
        if (!/^1\d{10}$/.test(phone)) { JQ.toast('手机号格式不正确', 'err'); return; }
        if (!pw) { JQ.toast('请输入密码', 'err'); return; }
        var r = JQ.ACCOUNT.login(phone, pw);
        if (r.ok) {
          JQ.toast('欢迎回来，' + r.session.nickname, 'ok');
          location.hash = '#/me';
        } else {
          JQ.toast(r.reason || '登录失败', 'err', 3600);
        }
      });
      JQ.$('#lg-pw').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { JQ.$('#lg-btn').click(); }
      });
    } else {
      JQ.$('#rg-btn').addEventListener('click', function () {
        var phone = JQ.$('#rg-phone').value.trim();
        var nick = JQ.$('#rg-nick').value.trim();
        var pw = JQ.$('#rg-pw').value;
        var pw2 = JQ.$('#rg-pw2').value;
        if (!/^1\d{10}$/.test(phone)) { JQ.toast('手机号格式不正确', 'err'); return; }
        if (pw.length < 6) { JQ.toast('密码至少 6 位', 'err'); return; }
        if (pw !== pw2) { JQ.toast('两次密码不一致', 'err'); return; }
        var r = JQ.ACCOUNT.register(phone, pw, nick || null);
        if (r.ok) {
          JQ.toast('注册成功，欢迎 ' + r.session.nickname, 'ok');
          location.hash = '#/me';
        } else {
          JQ.toast(r.reason || '注册失败', 'err', 3600);
        }
      });
    }
  }

  JQ.VIEWS.login = function () { scene('login'); };
  JQ.VIEWS.register = function () { scene('register'); };

  /* ---------- 偏好问卷（20 题 · 4 组 · 每组一屏） ----------
     题目配置在 prefs.js 的 QUIZ_GROUPS；本视图只负责渲染与收集答案。
     impact:true 的题真进算法，画像题在界面明确标注，不假装有用。 */
  JQ.VIEWS.onboard = function () {
    var view = JQ.$('#view');
    var gi = 0;
    var ans = {};
    /* 深链参数：#/onboard?gq=1..4 直接打开某一组（截图/回填定位用） */
    var gm = (location.hash.match(/[?&]gq=(\d+)/) || [])[1];
    if (gm) { gi = Math.min(JQ.PREFS.QUIZ_GROUPS.length - 1, Math.max(0, (+gm) - 1)); }

    function answered() {
      var n = 0;
      JQ.PREFS.QUIZ_GROUPS.forEach(function (g) {
        g.items.forEach(function (it) {
          var v = ans[it.id];
          var hit = it.multi ? (v && v.length) : (v !== undefined && v !== null);
          if (hit) { n++; }
          if (it.multi && ans.allergenNone) { n++; }
        });
      });
      return n;
    }

    function finish(provided) {
      var p = JQ.PREFS.DEFAULT();
      p.v = 2;
      p.provided = provided;
      if (provided) {
        p.quiz = ans;
        p.allergens = (ans.allergens || []).slice();
        p.allergenNone = !!ans.allergenNone;
        p.allergenOther = ans.allergenOther === 'yes';
        p.allergenUnsure = ans.severity === 'unsure' || (!p.allergens.length && !p.allergenNone);
        p.spicy = numOrNull(ans.spicy);
        p.salt = numOrNull(ans.salt);
        p.sweet = numOrNull(ans.sweet);
        p.scene = ans.scene || null;
        p.maxTime = ans.maxTime == null ? null : +ans.maxTime;
      }
      p.source = 'onboard';
      if (JQ.PREFS.save(p)) {
        JQ.toast(provided ? '已记录 ' + answered() + ' 项 · 推荐已按你的限制过滤' : '已跳过：稍后可在「我的偏好」填写');
      } else {
        JQ.toast('保存失败：浏览器存储不可用（可稍后在「我的偏好」重试）', 'err', 4000);
      }
      JQ.STORE.set(JQ.STORE.KEYS.ONBOARDED, true);
      location.hash = '#/home';
    }

    function numOrNull(v) { return (v === undefined || v === null) ? null : +v; }

    function isOn(it, raw) {
      var cur = ans[it.id];
      if (it.multi) { return !!(cur && cur.indexOf(raw) >= 0); }
      return cur !== undefined && cur !== null && String(cur) === String(raw);
    }

    function rawOf(it, str) {
      for (var k = 0; k < it.opts.length; k++) {
        if (String(it.opts[k][0]) === String(str)) { return it.opts[k][0]; }
      }
      return str;
    }

    function tagOf(it) {
      if (it.id === 'allergens') { return '<span class="qz-tag qz-tag-hard">硬限制</span>'; }
      if (it.impact) { return '<span class="qz-tag qz-tag-live">影响推荐</span>'; }
      return '<span class="qz-tag">画像</span>';
    }

    function itemHtml(it) {
      var opts = it.opts.map(function (o) {
        var on = isOn(it, o[0]) ? ' on' : '';
        return '<button type="button" class="qz-opt' + on + '" data-item="' + it.id + '" data-val="' + o[0] + '">' + JQ.esc(o[1]) + '</button>';
      }).join('');
      if (it.multi) {
        opts += '<button type="button" class="qz-opt qz-opt-none' + (ans.allergenNone ? ' warn-on' : '') + '" data-item="' + it.id + '" data-val="__none">暂无已知过敏</button>';
      }
      return '<div class="qz-item">' +
        '<div class="qz-head"><span class="qz-icon" aria-hidden="true">' + it.icon + '</span>' +
        '<div class="qz-qt">' + JQ.esc(it.q) + tagOf(it) + '</div></div>' +
        '<div class="qz-opts">' + opts + '</div></div>';
    }

    function render() {
      var G = JQ.PREFS.QUIZ_GROUPS[gi];
      var last = gi === JQ.PREFS.QUIZ_GROUPS.length - 1;
      var bars = JQ.PREFS.QUIZ_GROUPS.map(function (g, k) {
        return '<i class="' + (k < gi ? 'done' : (k === gi ? 'cur' : '')) + '"></i>';
      }).join('');

      view.innerHTML =
        JQ.HEADER('偏好问卷', '', false) +
        '<div class="wrap qz-wrap">' +
        '<div class="qz-top"><span class="qz-count">第 <b>' + (gi + 1) + '</b> / 4 组</span>' +
        '<span class="qz-done">已答 ' + answered() + ' / ' + JQ.PREFS.QUIZ_TOTAL + '</span></div>' +
        '<div class="qz-progress">' + bars + '</div>' +
        '<div class="qz-hero">' +
        '<span class="qz-hero-icon" aria-hidden="true">' + G.icon + '</span>' +
        '<h1 class="qz-h1">' + G.title + '</h1>' +
        '<p class="qz-lead">' + G.lead + '</p>' +
        '</div>' +
        G.items.map(itemHtml).join('') +
        '<div class="qz-foot">' +
        (gi > 0 ? '<button type="button" class="btn btn-ghost qz-prev" data-act="prev">上一组</button>' : '') +
        '<button type="button" class="btn btn-primary qz-next" data-act="' + (last ? 'done' : 'next') + '">' +
        (last ? '完成，去看看推荐' : '下一组') + '</button>' +
        '</div>' +
        '<div class="qz-skipwrap"><button type="button" class="qz-skip" data-act="skip">跳过问卷（稍后可在「我的偏好」填）</button></div>' +
        '</div>';
    }

    /* 委托一次，避免每次 render 叠加监听 */
    view.onclick = function (e) {
      var t = e.target.closest ? e.target.closest('[data-act],[data-item]') : null;
      if (!t) { return; }
      var act = t.getAttribute('data-act');
      if (act) {
        if (act === 'prev' && gi > 0) { gi--; render(); window.scrollTo(0, 0); }
        else if (act === 'next') { gi++; render(); window.scrollTo(0, 0); }
        else if (act === 'done') { finish(true); }
        else if (act === 'skip') {
          JQ.confirm('跳过问卷？', '跳过后记为「未提供」：过敏不会被自动过滤，你随时可以在「我的 → 我的偏好」填写。', '跳过', function () { finish(false); });
        }
        return;
      }

      var itemId = t.getAttribute('data-item');
      var raw = t.getAttribute('data-val');
      var it = null;
      JQ.PREFS.QUIZ_GROUPS.forEach(function (g) {
        g.items.forEach(function (x) { if (x.id === itemId) { it = x; } });
      });
      if (!it) { return; }

      if (it.multi && raw === '__none') {
        ans.allergenNone = !ans.allergenNone;
        if (ans.allergenNone) { ans.allergens = []; }
      } else if (it.multi) {
        ans.allergenNone = false;
        var arr = ans.allergens || (ans.allergens = []);
        var v = raw;
        var k = arr.indexOf(v);
        if (k >= 0) { arr.splice(k, 1); } else { arr.push(v); }
      } else {
        var val = rawOf(it, raw);
        ans[it.id] = (ans[it.id] !== undefined && ans[it.id] !== null && String(ans[it.id]) === String(val)) ? null : val;
      }
      /* 只重绘本题的选中态，避免整页跳动 */
      var box = t.parentNode;
      Array.prototype.forEach.call(box.querySelectorAll('[data-item="' + itemId + '"]'), function (b) {
        if (b.getAttribute('data-val') === '__none') {
          b.classList.toggle('warn-on', !!ans.allergenNone);
        } else {
          b.classList.toggle('on', isOn(it, b.getAttribute('data-val')));
        }
      });
      var cnt = view.querySelector('.qz-done');
      if (cnt) { cnt.textContent = '已答 ' + answered() + ' / ' + JQ.PREFS.QUIZ_TOTAL; }
    };

    render();
  };
})();
