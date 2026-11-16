/* 立冬庭院：延迟加载 React Three Fiber 场景，保留本地风景与 GSAP 窗景作为降级。
   所有食单始终保留在页面中；动效随离屏、页面隐藏、低动态偏好和路由暂停或释放。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var active = null;
  var libraryPromise = null;
  function load3D() {
    if (window.Jieqi3D) { return Promise.resolve(window.Jieqi3D); }
    if (!libraryPromise) {
      libraryPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'js/vendor/courtyard-3d.js?v=20261117.1';
        script.onload = function () { window.Jieqi3D ? resolve(window.Jieqi3D) : reject(new Error('3D unavailable')); };
        script.onerror = reject;
        document.head.appendChild(script);
      }).catch(function (error) { libraryPromise = null; throw error; });
    }
    return libraryPromise;
  }

  function html(term) {
    return '<div class="courtyard" data-courtyard aria-label="立冬庭院意象">' +
      '<div class="courtyard-stage">' +
      '<div class="courtyard-window" aria-hidden="true"><img class="courtyard-landscape" src="' + JQ.esc(JQ.SCENERY[term.id]) + '" alt="" width="400" height="400"><div class="courtyard-haze"></div></div>' +
      '<svg class="courtyard-eaves" viewBox="0 0 400 80" aria-hidden="true"><path d="M0 0H400V24L335 41L72 37L0 19Z" fill="#34443C"/><path d="M0 18L72 36L335 40L400 23" fill="none" stroke="#A9AD9A" stroke-width="2"/><path d="M36 0L83 35M99 0L135 37M164 0L186 38M230 0L240 39M295 0L293 40M362 0L344 37" stroke="#657063" fill="none"/></svg>' +
      '<svg class="courtyard-branch" viewBox="0 0 140 220" aria-hidden="true"><path d="M-8 12C45 44 18 109 112 179M22 71L81 49M43 123L105 104M66 145L29 187" fill="none" stroke="#586756" stroke-width="3" stroke-linecap="round"/><g fill="#6D8068"><path d="M70 54Q62 32 87 26Q90 47 70 54Z"/><path d="M81 49Q94 31 113 45Q103 61 81 49Z"/><path d="M91 110Q84 90 109 83Q113 103 91 110Z"/><path d="M104 105Q119 93 132 110Q117 122 104 105Z"/><path d="M34 180Q13 166 10 191Q29 198 34 180Z"/></g></svg>' +
      '<div class="courtyard-light" aria-hidden="true"></div>' +
      '<div class="courtyard-table" aria-hidden="true"></div>' +
      '<div class="courtyard-cup" aria-hidden="true"><i></i></div>' +
      '<button class="courtyard-paper" type="button" data-courtyard-open aria-controls="today-recipes" aria-label="翻开立冬食单，查看今日推荐">' +
      '<span class="courtyard-paper-kicker">不时 · 不食</span><strong>立冬</strong><span class="courtyard-paper-sub">一碗热汤，一餐时令</span><span class="courtyard-paper-action">翻开食单 <span aria-hidden="true">↗</span></span></button>' +
      '<span class="courtyard-scene-label" aria-hidden="true">冬意入院</span>' +
      '</div><div class="courtyard-3d-host" data-courtyard-3d></div>' +
      '<div class="courtyard-interactions" hidden><button type="button" data-courtyard-tea>温一盏茶</button><button type="button" data-courtyard-leaf>拂叶知冬</button><button type="button" data-courtyard-open-3d aria-controls="today-recipes">翻开食单 ↗</button></div>' +
      '<p class="courtyard-caption" data-courtyard-caption aria-live="polite" hidden>移近茶盏、枝叶或食单，看看庭院的回应。</p>' +
      '<div class="courtyard-tools"><span>近看食单，远望冬山</span><button type="button" data-courtyard-motion aria-pressed="false">暂停动效</button></div></div>';
  }

  function dispose() {
    if (!active) { return; }
    active.opening && active.opening.kill();
    active.context && active.context.revert();
    active.observer && active.observer.disconnect();
    active.three && active.three.dispose();
    active.listeners && active.listeners.forEach(function (item) { item[0].removeEventListener(item[1], item[2]); });
    active.media.removeEventListener('change', active.update);
    document.removeEventListener('visibilitychange', active.update);
    active.motionButton.removeEventListener('click', active.toggle);
    active.paper.removeEventListener('click', active.open);
    active.jumpButton && active.jumpButton.removeEventListener('click', active.jump);
    active = null;
  }

  function mount(root) {
    dispose();
    var scene = (root || document).querySelector('[data-courtyard]');
    if (!scene) { return; }
    var state = {
      scene: scene,
      media: window.matchMedia('(prefers-reduced-motion: reduce)'),
      motionButton: scene.querySelector('[data-courtyard-motion]'),
      paper: scene.querySelector('[data-courtyard-open]'),
      jumpButton: document.querySelector('[data-courtyard-jump]'),
      inView: true,
      userPaused: false,
      context: null,
      intro: null,
      ambient: null,
      opening: null,
      listeners: [],
      three: null
    };
    active = state;

    state.update = function () {
      var still = state.media.matches || (!state.three && !window.gsap);
      var paused = still || state.userPaused || document.hidden || !state.inView;
      if (still && state.intro) { state.intro.progress(1); }
      if (state.intro) { state.intro.paused(paused); }
      if (state.ambient) { state.ambient.paused(paused); }
      state.scene.dataset.motion = still ? 'static' : (paused ? 'paused' : 'playing');
      state.motionButton.hidden = still;
      state.motionButton.textContent = state.userPaused ? '继续动效' : '暂停动效';
      state.motionButton.setAttribute('aria-pressed', String(state.userPaused));
      if (state.three) { state.three.setPaused(paused, state.media.matches); }
    };
    state.toggle = function () { state.userPaused = !state.userPaused; state.update(); };
    state.jump = function () {
      var target = document.getElementById('today-recipes');
      if (!target) { return; }
      target.scrollIntoView({ behavior: state.media.matches ? 'auto' : 'smooth', block: 'start' });
      var heading = target.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    };
    state.open = function () {
      if (state.opening) { state.opening.kill(); }
      if (!window.gsap || state.media.matches || state.userPaused) { state.jump(); return; }
      state.opening = window.gsap.to(state.paper, { rotationY: -16, rotation: 0, duration: .32, ease: 'power2.out', onComplete: state.jump });
    };

    if (window.gsap) {
      state.context = window.gsap.context(function () {
        state.intro = window.gsap.timeline({ paused: true });
        state.intro.fromTo('.courtyard-landscape', { scale: 1.12 }, { scale: 1.02, duration: 1.6, ease: 'power2.out' }, 0);
        state.intro.fromTo('.courtyard-paper', { y: 15, rotation: -9 }, { y: 0, rotation: -4, duration: 1.1, ease: 'power2.out' }, .15);
        state.ambient = window.gsap.timeline({ paused: true, repeat: -1, yoyo: true });
        state.ambient.to('.courtyard-branch', { rotation: 1.6, transformOrigin: '0% 0%', duration: 6, ease: 'sine.inOut' }, 0);
        state.ambient.to('.courtyard-haze', { xPercent: 5, opacity: .28, duration: 6, ease: 'sine.inOut' }, 0);
      }, scene);
    }
    if (window.IntersectionObserver) {
      state.observer = new IntersectionObserver(function (entries) {
        state.inView = entries[0].isIntersecting;
        state.update();
      }, { threshold: .08 });
      state.observer.observe(scene);
    }
    state.motionButton.addEventListener('click', state.toggle);
    state.paper.addEventListener('click', state.open);
    state.jumpButton && state.jumpButton.addEventListener('click', state.jump);
    state.media.addEventListener('change', state.update);
    document.addEventListener('visibilitychange', state.update);
    state.update();
    load3D().then(function (library) {
      if (active !== state || !scene.isConnected) { return; }
      var host = scene.querySelector('[data-courtyard-3d]');
      var controls = scene.querySelector('.courtyard-interactions');
      var caption = scene.querySelector('[data-courtyard-caption]');
      function say(text) { caption.textContent = text; }
      function fallback() {
        if (active !== state) { return; }
        scene.classList.remove('courtyard-is-3d');
        controls.hidden = true; caption.hidden = true;
        if (state.three) { var failed = state.three; state.three = null; setTimeout(function () { failed.dispose(); }, 0); }
        state.update();
      }
      try {
        state.three = library.mount(host, {
          paused: state.userPaused || document.hidden || !state.inView,
          reduced: state.media.matches,
          onOpen: state.jump,
          onTea: function () { say('青瓷留温，茶气轻起。立冬的一餐，从温热饮食开始。'); },
          onLeaf: function () { say('风过庭院，枝叶轻摇。冬意已至，今日食单也随节气换新。'); },
          onFocus: function (id) { if (id === 'menu') say('翻开纸上食单，查看今日时令推荐。'); else if (id === 'cup') say('轻点青瓷茶盏，温一盏茶。'); else if (id === 'leaf') say('轻触枝叶，看冬风拂过庭院。'); },
          onReady: function () { if (active !== state) return; scene.classList.add('courtyard-is-3d'); controls.hidden = false; caption.hidden = false; if(state.context) { state.context.revert(); state.context = null; state.intro = null; state.ambient = null; } state.update(); },
          onError: fallback
        });
        function bind(selector, id, action) {
          var button = scene.querySelector(selector);
          [['click', action], ['focus', function () { state.three && state.three.focus(id); }], ['blur', function () { state.three && state.three.focus(''); }]].forEach(function (entry) { button.addEventListener(entry[0], entry[1]); state.listeners.push([button, entry[0], entry[1]]); });
        }
        bind('[data-courtyard-open-3d]', 'menu', state.jump);
        bind('[data-courtyard-tea]', 'cup', function () { state.three && state.three.tea(); });
        bind('[data-courtyard-leaf]', 'leaf', function () { state.three && state.three.leaf(); });
      } catch (error) { fallback(); }
    }).catch(function () { /* The fully functional illustrated courtyard remains visible. */ });
  }

  JQ.COURTYARD = { html: html, mount: mount, dispose: dispose };
})();
