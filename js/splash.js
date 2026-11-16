/* 节气食单 · 启动过渡页控制
   - 冷启动展示 2.6s，点击/滚动可跳过
   - JQ.SPLASH.after(fn)：启动页退场后再执行（首访引导等不该被遮住的交互）
   - ?splash=0 供自动化截图与调试直接跳过
   - 尊重 prefers-reduced-motion：无动画，1.2s 后安静退场 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var el = document.getElementById('splash');
  var waiters = [];
  var done = false;
  var timer = 0;
  var quick = /[?&]splash=0/.test(location.search);
  var still = /[?&]splash=still/.test(location.search);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function release(fn) { try { fn(); } catch (e) { if (window.console) { console.warn('[splash]', e); } } }

  function runWaiters() {
    done = true;
    var list = waiters.slice();
    waiters.length = 0;
    for (var i = 0; i < list.length; i++) { release(list[i]); }
  }

  function unlock() {
    document.documentElement.classList.remove('sp-lock');
    if (document.body) { document.body.classList.remove('sp-lock'); }
  }

  function hide() {
    if (!el || done) { return; }
    clearTimeout(timer);
    el.classList.add('out');
    unlock();
    setTimeout(function () {
      if (el && el.parentNode) { el.parentNode.removeChild(el); }
      el = null;
      runWaiters();
      var view = document.getElementById('view');
      if (view) {
        view.classList.remove('vin');
        void view.offsetWidth;
        view.classList.add('vin');
      }
    }, reduce.matches ? 200 : 560);
  }

  JQ.SPLASH = {
    after: function (fn) { if (done) { fn(); } else { waiters.push(fn); } },
    hide: hide,
    active: function () { return !done; }
  };

  if (!el || quick) {
    if (el && el.parentNode) { el.parentNode.removeChild(el); }
    el = null;
    runWaiters();
    return;
  }

  document.documentElement.classList.add('sp-lock');
  if (document.body) {
    document.body.classList.add('sp-lock');
    if (!still) {
      el.addEventListener('pointerdown', hide, { once: true });
      el.addEventListener('wheel', hide, { passive: true, once: true });
    }
  }
  if (still) {
    el.classList.add('still');
    timer = setTimeout(hide, 60000);
  } else {
    timer = setTimeout(hide, reduce.matches ? 1200 : 2600);
  }
})();
