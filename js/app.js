/* 节气食单 · 应用入口
   - ?t=<节气拼音> 统一入口（NFC / 二维码 / 普通链接）→ 重定向到对应 Hash 路由
   - 非法参数：提示后回当前节气
   - 首访不设登录墙：直接见食单，再以可跳过的方式邀请偏好引导 */
(function () {
  'use strict';

  function boot() {
    /* 线框模式：?wire=1 给 body 打 wire 类（灰阶皮肤，用于线框图交付）
       ?nb=1：标记已引导（截图/演示时跳过首访弹层）
       ?reveal=0：禁用滚动入场动画（截图/录屏时避免透明度卡帧） */
    if (/[?&]wire=1/.test(location.search)) {
      document.body.classList.add('wire');
    }
    if (/[?&]nb=1/.test(location.search)) {
      try { JQ.STORE.set(JQ.STORE.KEYS.ONBOARDED, true); } catch (e) { }
    }
    if (/[?&]reveal=0/.test(location.search)) {
      document.documentElement.classList.add('no-anim');
    }

    /* 存储不可用横幅（诚实提示，不静默） */
    if (!JQ.STORE.available()) {
      var b = JQ.$('#storage-banner');
      b.hidden = false;
      b.textContent = '⚠️ 当前浏览器禁止本机存储（或已满）：偏好、收藏、打卡与账号将无法保存，页面其余功能可正常浏览。';
    }

    /* ?t= 入口协议：仅处理一次，处理完清掉查询串（避免分享链接带参数循环） */
    var search = location.search;
    if (search) {
      var m = /[?&]t=([^&]*)/.exec(search);
      if (m) {
        var tid = JQ.SOLAR.termIdFromParam(decodeURIComponent(m[1]));
        if (tid) {
          JQ.SOLAR.browseTerm = tid; // 会话级浏览态（优先级高于当前节气）
        } else {
          sessionStorage.setItem('jqsq.invalidT', '1');
        }
      }
      var clean = location.origin !== 'null' && location.origin && !/^file:/.test(location.origin)
        ? location.origin + location.pathname + (location.hash || '')
        : location.href.split('?')[0].split('#')[0] + (location.hash || '');
      history.replaceState(null, '', clean);
    }

    if (!location.hash) { location.hash = '#/home'; }
    JQ.ROUTER.dispatch();

    if (sessionStorage.getItem('jqsq.invalidT') === '1') {
      sessionStorage.removeItem('jqsq.invalidT');
      setTimeout(function () {
        JQ.toast('链接中的节气参数无效，已回到当前节气', '', 3600);
      }, 600);
    }

    /* 首访偏好引导：非阻断底部邀请（可开始 / 可跳过），不当登录墙 */
    var onboarded = JQ.STORE.get(JQ.STORE.KEYS.ONBOARDED, false);
    var prefs = JQ.PREFS.get();
    if (!onboarded && !prefs.provided) {
      /* 启动页在场时延后到退场后再邀请，避免被过渡层遮住 */
      var invite = function () { showOnboard(); };
      if (JQ.SPLASH && JQ.SPLASH.active()) {
        JQ.SPLASH.after(invite);
      } else {
        invite();
      }
    }

    function showOnboard() {
      JQ.modal({
        title: '初见 · 花 30 秒让推荐更懂你',
        body: '<div class="small" style="color:var(--ink2);line-height:1.9">三步填写：<b>过敏原（硬限制，命中即不再推荐）</b> → 口味（辣/咸/甜）→ 就餐场景。<br><br>也可以先逛逛——不填写时推荐页会保留过敏核对提示。</div>',
        actions: [
          { label: '先跳过', cls: 'btn-ghost', onClick: function () { JQ.STORE.set(JQ.STORE.KEYS.ONBOARDED, true); } },
          { label: '开始填写', cls: 'btn-primary', onClick: function () { location.hash = '#/onboard'; } }
        ]
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
