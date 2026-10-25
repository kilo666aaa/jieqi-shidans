/* 节气食单 · 视图：本机账号（登录/注册）+ 首次偏好引导
   账号规则（诚实约束）：静态托管无后端，账号只保存在当前浏览器——
   不能跨设备登录、不能短信验证码、不能找回密码；偏好/收藏/打卡始终本机保存 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  var ACCOUNT_NOTE = '<div class="notice-amber">🔐 <b>本机账号：</b>因当前为静态托管（无后端服务器），账号信息仅保存在这个浏览器里——不支持跨设备登录、不支持短信验证码、忘记密码无法找回（可清除数据后重新注册）。偏好、收藏、打卡与本机绑定，不随账号迁移。</div>';

  /* ---------- 登录 ---------- */
  JQ.VIEWS.login = function () {
    var view = JQ.$('#view');
    view.innerHTML =
      JQ.HEADER('登录', '', true) +
      '<div class="wrap">' +
      '<div class="card" style="text-align:center;padding-top:26px">' +
      '<div style="font-size:40px;margin-bottom:6px" aria-hidden="true">🌱</div>' +
      '<h2 class="serif">节气食单</h2><div class="muted small" style="margin-bottom:18px">不时，不食</div>' +
      '<div class="field"><label for="lg-phone">手机号</label>' +
      '<input class="input" id="lg-phone" inputmode="numeric" maxlength="11" placeholder="11 位手机号（仅本机校验格式）"></div>' +
      '<div class="field"><label for="lg-pw">密码</label>' +
      '<input class="input" id="lg-pw" type="password" placeholder="注册时设置的密码"></div>' +
      '<button class="btn btn-primary btn-block" id="lg-btn">登录（本机）</button>' +
      '<div class="small muted" style="margin-top:12px">还没有账号？<a href="#/register"><b>注册一个</b></a> ｜ <a href="#/home">先随便逛逛（访客）</a></div>' +
      '</div>' + ACCOUNT_NOTE + '</div>';

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
  };

  /* ---------- 注册 ---------- */
  JQ.VIEWS.register = function () {
    var view = JQ.$('#view');
    view.innerHTML =
      JQ.HEADER('注册', '', true) +
      '<div class="wrap">' +
      '<div class="card">' +
      '<div class="field"><label for="rg-phone">手机号</label>' +
      '<input class="input" id="rg-phone" inputmode="numeric" maxlength="11" placeholder="11 位手机号">' +
      '<div class="hint">无后端服务器，仅在本机做格式校验，不发短信验证码。</div></div>' +
      '<div class="field"><label for="rg-nick">昵称（可选）</label>' +
      '<input class="input" id="rg-nick" maxlength="12" placeholder="不填则自动生成"></div>' +
      '<div class="field"><label for="rg-pw">设置密码（≥6 位）</label>' +
      '<input class="input" id="rg-pw" type="password" placeholder="至少 6 位"></div>' +
      '<div class="field"><label for="rg-pw2">确认密码</label>' +
      '<input class="input" id="rg-pw2" type="password" placeholder="再输入一次"></div>' +
      '<button class="btn btn-primary btn-block" id="rg-btn">注册并登录（本机）</button>' +
      '<div class="small muted" style="margin-top:12px">已有账号？<a href="#/login"><b>去登录</b></a></div>' +
      '</div>' + ACCOUNT_NOTE + '</div>';

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
  };

  /* ---------- 首次偏好引导（可填写可跳过；跳过=未提供） ---------- */
  JQ.VIEWS.onboard = function () {
    var view = JQ.$('#view');
    var step = 1;
    var data = {
      allergens: [], allergenNone: false, allergenUnsure: false, allergenOther: false,
      spicy: null, salt: null, sweet: null, scene: null, maxTime: null
    };

    function finish(provided) {
      var p = JQ.PREFS.DEFAULT();
      p.provided = provided;
      if (provided) {
        p.allergens = data.allergens;
        p.allergenNone = data.allergenNone;
        p.allergenUnsure = data.allergenUnsure;
        p.allergenOther = data.allergenOther;
        p.spicy = data.spicy; p.salt = data.salt; p.sweet = data.sweet;
        p.scene = data.scene; p.maxTime = data.maxTime;
      }
      p.source = 'onboard';
      if (JQ.STORE.set(JQ.STORE.KEYS.PREFS, p)) {
        JQ.toast(provided ? '偏好已保存，推荐已按你的限制过滤' : '已跳过：稍后可在「我的偏好」填写');
      } else {
        JQ.toast('偏好保存失败：浏览器存储不可用（可稍后在「我的偏好」重试）', 'err', 4000);
      }
      JQ.STORE.set(JQ.STORE.KEYS.ONBOARDED, true);
      location.hash = '#/home';
    }

    function render() {
      var stepsBar = '<div class="onboard-steps">' + [1, 2, 3].map(function (i) {
        return '<i class="' + (i <= step ? 'done' : '') + '"></i>';
      }).join('') + '</div>';

      var body = '';
      if (step === 1) {
        body = '<div class="card">' +
          '<h2>你对哪些食物过敏？</h2>' +
          '<div class="small muted" style="margin-bottom:12px">多选 · 这是<b>硬限制</b>：命中的菜品不会再出现在推荐和 AI 回答里</div>' +
          '<div class="opt-grid" style="margin-bottom:10px">' +
          JQ.PREFS.ALLERGEN_OPTIONS.map(function (o) {
            return '<button class="opt' + (data.allergens.indexOf(o.id) >= 0 ? ' on' : '') + '" data-alg="' + o.id + '">' + JQ.esc(o.label) + '</button>';
          }).join('') + '</div>' +
          '<div class="opt-grid">' +
          '<button class="opt' + (data.allergenNone ? ' warn-on' : '') + '" data-alg="__none">暂无已知过敏</button>' +
          '<button class="opt' + (data.allergenUnsure ? ' warn-on' : '') + '" data-alg="__unsure">不确定</button>' +
          '<button class="opt' + (data.allergenOther ? ' warn-on' : '') + '" data-alg="__other">其他</button></div>' +
          '<div class="hint">「暂无已知过敏」与具体项互斥；未填写不等于无过敏。</div></div>';
      } else if (step === 2) {
        function cyc(g, label, opts) {
          return '<div class="field"><label>' + label + '</label><div class="opt-grid" data-g="' + g + '">' +
            opts.map(function (o, i) {
              return '<button class="opt' + (data[g] === i ? ' on' : '') + '" data-val="' + i + '">' + JQ.esc(o) + '</button>';
            }).join('') + '</div></div>';
        }
        body = '<div class="card"><h2>口味偏好</h2>' +
          '<div class="small muted" style="margin-bottom:12px">软偏好：只影响排序，满足不了会向你说明</div>' +
          cyc('spicy', '辣度', JQ.PREFS.SPICY_OPTIONS) +
          cyc('salt', '咸淡', JQ.PREFS.SALT_OPTIONS) +
          cyc('sweet', '甜度', JQ.PREFS.SWEET_OPTIONS) + '</div>';
      } else {
        body = '<div class="card"><h2>平时在哪吃饭？</h2>' +
          '<div class="opt-grid" style="margin-bottom:16px" data-g="scene">' +
          JQ.PREFS.SCENE_OPTIONS.map(function (o) {
            return '<button class="opt' + (data.scene === o.id ? ' on' : '') + '" data-scene="' + o.id + '">' + JQ.esc(o.label) + '</button>';
          }).join('') + '</div>' +
          '<div class="field" style="margin-bottom:0"><label>自己做饭时的耗时上限（可选）</label>' +
          '<div class="opt-grid" data-g="maxTime">' +
          JQ.PREFS.TIME_OPTIONS.map(function (o) {
            return '<button class="opt' + (data.maxTime === +o.id ? ' on' : '') + '" data-time="' + o.id + '">' + JQ.esc(o.label) + '</button>';
          }).join('') + '</div></div>' +
          '<div class="hint">食堂/外卖场景会显示选餐建议，而不是强行看教程。</div></div>';
      }

      view.innerHTML =
        JQ.HEADER('首次偏好引导 <span class="badge badge-demo">约 30 秒</span>', '', false) +
        '<div class="wrap">' + stepsBar + body +
        '<div class="onboard-actions">' +
        (step > 1 ? '<button class="btn btn-ghost" id="ob-prev">上一步</button>' : '') +
        (step < 3 ? '<button class="btn btn-primary" id="ob-next">下一步</button>'
          : '<button class="btn btn-primary" id="ob-done">完成</button>') +
        '</div>' +
        '<div style="text-align:center;margin-top:14px"><button class="btn btn-sm btn-ghost" id="ob-skip">跳过引导（稍后可在「我的偏好」填写）</button></div>' +
        '</div>';

      /* 事件 */
      var prev = JQ.$('#ob-prev');
      if (prev) { prev.addEventListener('click', function () { step--; render(); }); }
      var next = JQ.$('#ob-next');
      if (next) { next.addEventListener('click', function () { step++; render(); }); }
      var done = JQ.$('#ob-done');
      if (done) { done.addEventListener('click', function () { finish(true); }); }
      JQ.$('#ob-skip').addEventListener('click', function () {
        JQ.confirm('跳过引导？', '跳过后记为「未提供」：推荐页会保留过敏核对提示，你随时可以在「我的 → 我的偏好」填写。', '跳过', function () { finish(false); });
      });

      view.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('button[data-alg],button[data-val],button[data-scene],button[data-time]') : null;
        if (!t) { return; }
        if (t.hasAttribute('data-alg')) {
          var id = t.getAttribute('data-alg');
          if (id === '__none') {
            data.allergenNone = !data.allergenNone;
            if (data.allergenNone) {
              data.allergens = []; data.allergenUnsure = false; data.allergenOther = false;
            }
          } else if (id === '__unsure') { data.allergenUnsure = !data.allergenUnsure; }
          else if (id === '__other') { data.allergenOther = !data.allergenOther; }
          else {
            var i = data.allergens.indexOf(id);
            if (i >= 0) { data.allergens.splice(i, 1); }
            else { data.allergens.push(id); data.allergenNone = false; }
          }
          render();
          return;
        }
        var box = t.closest('[data-g]');
        if (!box) { return; }
        var g = box.getAttribute('data-g');
        if (g === 'scene') {
          var sc = t.getAttribute('data-scene');
          data.scene = data.scene === sc ? null : sc;
        } else if (g === 'maxTime') {
          var v = +t.getAttribute('data-time');
          data.maxTime = data.maxTime === v ? null : v;
        } else {
          var val = +t.getAttribute('data-val');
          data[g] = data[g] === val ? null : val;
        }
        render();
      });
    }

    render();
  };
})();
