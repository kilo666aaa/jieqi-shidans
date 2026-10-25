/* 节气食单 · Hash 路由器
   静态托管下刷新/直达不 404；返回键行为可预期（详情返回列表、百科回原位） */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var R = {};
  JQ.ROUTER = R;

  /* 各路由滚动位置记忆（#/term 列表等） */
  var scrollMem = {};

  R.go = function (hash) {
    if (location.hash === hash) {
      R.dispatch();
    } else {
      location.hash = hash;
    }
  };

  /* 页头组件：title / 右侧动作 html / 是否显示返回 */
  JQ.HEADER = function (title, rightHtml, showBack) {
    return '<header class="pagehead">' +
      (showBack
        ? '<button class="back" id="hdr-back" aria-label="返回">‹</button>'
        : '<button class="back" style="visibility:hidden" tabindex="-1" aria-hidden="true">‹</button>') +
      '<h1>' + title + '</h1>' +
      '<div class="hact">' + (rightHtml || '') + '</div>' +
      '</header>';
  };

  var TAB_OF = {
    home: 'home', ask: 'ask', term: 'term', 'term-detail': 'term',
    me: 'me', pref: 'me', fav: 'me', checkin: 'me', settings: 'me'
  };

  function setTab(name) {
    JQ.$$('#tabbar .tab').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-tab') === name);
    });
  }

  R.dispatch = function () {
    var prev = JQ.$('#view');
    if (prev) { scrollMem[R._currentPath || ''] = window.scrollY; }

    var hash = location.hash || '#/home';
    var path = hash.replace(/^#\/?/, '');
    var seg = path.split('?')[0].split('/').filter(Boolean);
    R._currentPath = seg.join('/');

    var tab = 'home';
    if (!seg.length) { tab = 'home'; JQ.VIEWS.home(); }
    else if (seg[0] === 'home') { tab = 'home'; JQ.VIEWS.home(); }
    else if (seg[0] === 'recipe' && seg[1]) { tab = 'home'; JQ.VIEWS.recipe(seg[1]); }
    else if (seg[0] === 'term' && seg[1]) { tab = 'term'; JQ.VIEWS.termDetail(seg[1]); }
    else if (seg[0] === 'term') { tab = 'term'; JQ.VIEWS.termList(); }
    else if (seg[0] === 'ask') { tab = 'ask'; JQ.VIEWS.ask(); }
    else if (seg[0] === 'me' && seg[1] === 'pref') { tab = 'me'; JQ.VIEWS.pref(); }
    else if (seg[0] === 'me' && seg[1] === 'fav') { tab = 'me'; JQ.VIEWS.fav(seg[2] || 'recipe'); }
    else if (seg[0] === 'me' && seg[1] === 'checkin') { tab = 'me'; JQ.VIEWS.checkin(); }
    else if (seg[0] === 'me' && seg[1] === 'settings') { tab = 'me'; JQ.VIEWS.settings(); }
    else if (seg[0] === 'me') { tab = 'me'; JQ.VIEWS.me(); }
    else if (seg[0] === 'login') { tab = ''; JQ.VIEWS.login(); }
    else if (seg[0] === 'register') { tab = ''; JQ.VIEWS.register(); }
    else if (seg[0] === 'onboard') { tab = ''; JQ.VIEWS.onboard(); }
    else { tab = 'home'; JQ.VIEWS.home(); }

    setTab(tab);
    window.scrollTo(0, scrollMem[R._currentPath] || 0);

    /* 季节主题 + 路由入场动画 + 滚动显现 */
    var disp0 = JQ.SOLAR.displayTerm();
    if (disp0.term) { document.body.setAttribute('data-season', disp0.term.season); }
    var vEl = JQ.$('#view');
    if (vEl) {
      vEl.classList.remove('vin');
      void vEl.offsetWidth; /* 重启动画 */
      vEl.classList.add('vin');
      if (window.IntersectionObserver && !R._io) {
        R._io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); R._io.unobserve(e.target); }
          });
        }, { threshold: .08 });
      }
      if (R._io) {
        JQ.$$('[data-reveal]', vEl).forEach(function (el, i) {
          el.style.transitionDelay = (i % 6) * 60 + 'ms';
          R._io.observe(el);
        });
      }
    }

    /* 返回按钮：优先历史返回（保留列表滚动位置），无历史则回上级 */
    var back = JQ.$('#hdr-back');
    if (back) {
      back.addEventListener('click', function () {
        if (history.length > 1 &&
            document.referrer !== location.href /* 同页反复 replace 的兜底 */) {
          history.back();
        } else {
          var p = R._currentPath.split('/');
          p.pop();
          R.go('#/' + (p[0] === 'recipe' || p[0] === 'term' ? (p[0] === 'term' ? 'term' : 'home') : (p[0] || 'home')));
        }
      });
    }
  };

  window.addEventListener('hashchange', function () { R.dispatch(); });
})();
