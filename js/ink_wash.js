/* 宣纸水墨：输入驱动的墨丝、飞墨与扩散，不在空闲时持续绘制。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var active = null;
  var userPaused = false;
  var PALETTE = { '春': '43,63,49', '夏': '33,55,47', '秋': '65,55,43', '冬': '37,47,57' };

  function landscape() {
    return '<svg class="ink-mountains" viewBox="0 0 720 300" aria-hidden="true"><defs><filter id="ink-mountain-grain" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035 .09" numOctaves="3" seed="17" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="9" xChannelSelector="R" yChannelSelector="B"/><feGaussianBlur stdDeviation=".6"/></filter></defs><g filter="url(#ink-mountain-grain)" fill="currentColor"><path d="M-20 245C18 236 30 197 59 192C80 193 89 213 108 188C134 157 143 174 162 153C180 129 188 96 212 91C232 98 239 140 257 144C277 139 286 120 302 141C330 170 332 194 359 192C385 180 396 205 424 210C453 196 463 145 485 130C509 137 513 172 537 166C567 156 575 195 600 211C621 218 633 184 652 196C680 212 706 244 740 250V310H-20Z" opacity=".3"/><path d="M-20 272C32 254 48 222 76 226C102 231 115 245 139 223C167 198 183 168 209 177C232 191 237 218 265 224C289 208 301 215 319 238C350 250 365 214 390 228C416 245 431 259 453 240C477 219 485 187 512 197C534 210 547 236 571 226C602 202 616 238 643 230C674 222 702 260 740 275V310H-20Z" opacity=".24"/><path d="M-20 280Q120 260 256 283T520 276T740 286V310H-20Z" opacity=".2"/></g></svg>';
  }
  function tools() {
    return '<div class="ink-tools"><span data-ink-caption>鼠标划过，墨点随行</span><button type="button" data-ink-toggle aria-pressed="false">暂停水墨</button></div>';
  }
  function dispose() {
    if (!active) { return; }
    var s = active;
    cancelAnimationFrame(s.frame);
    s.bindings.forEach(function (b) { b[0].removeEventListener(b[1], b[2]); });
    s.media.removeEventListener('change', s.refresh);
    s.canvas.remove();
    document.body.classList.remove('ink-wash-page');
    active = null;
  }
  function mount(root) {
    var scope = root && root.querySelector('[data-ink-page]');
    if (active && active.scope === scope && active.canvas.isConnected) { return; }
    dispose();
    if (!scope) { return; }
    document.body.classList.add('ink-wash-page');
    var canvas = document.createElement('canvas');
    canvas.className = 'ink-wash-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-ink-canvas', '');
    var ctx = canvas.getContext('2d');
    var button = scope.querySelector('[data-ink-toggle]');
    if (!ctx) { document.body.classList.remove('ink-wash-page'); if (button) { button.disabled = true; button.textContent = '静态水墨'; } return; }
    document.body.appendChild(canvas);
    var s = { scope: scope, canvas: canvas, ctx: ctx, media: window.matchMedia('(prefers-reduced-motion: reduce)'),
      bindings: [], frame: 0, points: [], washes: [], strokes: [], last: null, width: 0, height: 0, maskDirty: true, masks: [],
      rgb: PALETTE[scope.dataset.inkSeason] || '36,47,43', lastWash: -1000 };
    active = s;
    function bind(node, name, fn) { node.addEventListener(name, fn, { passive: true }); s.bindings.push([node, name, fn]); }
    function clear() {
      cancelAnimationFrame(s.frame); s.frame = 0; s.points = []; s.washes = []; s.strokes = []; s.last = null;
      ctx.clearRect(0, 0, s.width, s.height);
    }
    function blocked() { return userPaused || s.media.matches || document.hidden; }
    function status() {
      canvas.dataset.inkState = s.media.matches ? 'reduced' : userPaused ? 'paused' : document.hidden ? 'hidden' : 'ready';
      if (button) {
        button.disabled = s.media.matches;
        button.textContent = s.media.matches ? '低动态模式' : userPaused ? '开启水墨' : '暂停水墨';
        button.setAttribute('aria-pressed', String(userPaused));
      }
    }
    function size() {
      clear();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      s.width = window.innerWidth; s.height = window.innerHeight;
      canvas.width = Math.round(s.width * dpr); canvas.height = Math.round(s.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); s.maskDirty = true; status();
    }
    function masks() {
      if (!s.maskDirty) { return; }
      s.masks = [];
      root.querySelectorAll('.pagehead,h1,h2,h3,.hero-deco,.hero-kicker,.hero-poem,.hero-meta,.ticker,.ink-tools,button,input,textarea,select').forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < s.height) { s.masks.push(rect); }
      });
      s.maskDirty = false;
    }
    function color(alpha) { return 'rgba(' + s.rgb + ',' + alpha.toFixed(4) + ')'; }
    function frame(now) {
      s.frame = 0;
      if (active !== s || blocked()) { clear(); status(); return; }
      ctx.clearRect(0, 0, s.width, s.height);
      s.washes = s.washes.filter(function (p) { return now - p.born < p.life; });
      s.strokes = s.strokes.filter(function (p) { return now - p.born < p.life; });
      s.points = s.points.filter(function (p) { return now - p.born < p.life; });
      s.washes.forEach(function (p) {
        var age = (now - p.born) / p.life;
        var r = p.r * (.32 + age * 1.45);
        var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        gradient.addColorStop(0, color(.14 * Math.pow(1 - age, 1.5)));
        gradient.addColorStop(.37, color(.065 * (1 - age)));
        gradient.addColorStop(1, color(0));
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      });
      s.strokes.forEach(function (p) {
        var fade = 1 - (now - p.born) / p.life;
        ctx.strokeStyle = color(.12 * fade * fade); ctx.lineWidth = p.r * fade + .25; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.mx, p.my, p.tx, p.ty); ctx.stroke();
      });
      s.points.forEach(function (p) {
        var age = (now - p.born) / p.life;
        var t = age * 54;
        var x = p.x + p.vx * t + Math.sin(p.phase + age * 4) * age * 16;
        var y = p.y + p.vy * t - Math.sin(age * Math.PI) * 20;
        ctx.fillStyle = color((.25 + p.r * .055) * Math.pow(1 - age, 1.6));
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.phase + age * 2);
        ctx.beginPath();
        if (p.phase > Math.PI) { ctx.arc(0, 0, p.r * .55, 0, Math.PI * 2); }
        else { ctx.ellipse(0, 0, p.r * (1 + age), p.r * .43, 0, 0, Math.PI * 2); }
        ctx.fill(); ctx.restore();
      });
      masks();
      s.masks.forEach(function (r) { ctx.clearRect(r.left - 3, r.top - 2, r.width + 6, r.height + 4); });
      if (s.points.length || s.washes.length || s.strokes.length) { canvas.dataset.inkState = 'flowing'; s.frame = requestAnimationFrame(frame); }
      else { status(); }
    }
    function emit(event, burst) {
      if (blocked()) { return; }
      if (event.target && event.target.closest && event.target.closest('button,a,input,textarea,select,[role="dialog"],.modal,.tabbar')) { s.last = null; return; }
      var now = performance.now(), x = event.clientX, y = event.clientY;
      s.maskDirty = true;
      if (!Number.isFinite(x) || !Number.isFinite(y)) { return; }
      var last = s.last;
      if (!burst && last && now - last.at < 16) { return; }
      var dx = last ? x - last.x : 2, dy = last ? y - last.y : -1;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (!burst && distance < 1) { return; }
      var angle = Math.atan2(dy, dx);
      var count = burst ? 16 : 5;
      for (var i = 0; i < count; i++) {
        var spread = angle + (Math.random() - .5) * 3.8;
        var speed = .24 + Math.random() * .8;
        s.points.push({ x: x + (Math.random() - .5) * 10, y: y + (Math.random() - .5) * 10,
          vx: Math.cos(spread) * speed, vy: Math.sin(spread) * speed * .6 - .15,
          phase: Math.random() * 6.28, r: .8 + Math.random() * 2.6, born: now, life: 900 + Math.random() * 950 });
      }
      s.points = s.points.slice(-160);
      if (burst || now - s.lastWash > 72) {
        s.washes.push({ x: x, y: y, r: burst ? 48 : 26, born: now, life: 1900 });
        s.washes = s.washes.slice(-12); s.lastWash = now;
      }
      if (last && distance < 160 && !burst) {
        s.strokes.push({ x: last.x, y: last.y, mx: (x + last.x) / 2 - dy * .16, my: (y + last.y) / 2 + dx * .16, tx: x, ty: y, r: Math.min(3.5, distance / 9 + .5), born: now, life: 1100 });
        s.strokes = s.strokes.slice(-30);
      }
      s.last = burst ? null : { x: x, y: y, at: now };
      if (!s.frame) { s.frame = requestAnimationFrame(frame); }
    }
    s.refresh = function () { clear(); status(); };
    s.media.addEventListener('change', s.refresh);
    bind(window, 'pointermove', function (e) { if (!e.pointerType || e.pointerType === 'mouse') { emit(e, false); } });
    bind(window, 'pointerdown', function (e) { emit(e, true); });
    bind(window, 'resize', size);
    bind(window, 'scroll', function () { s.maskDirty = true; s.last = null; });
    bind(document, 'visibilitychange', s.refresh);
    if (button) { bind(button, 'click', function () { userPaused = !userPaused; s.refresh(); }); }
    var caption = scope.querySelector('[data-ink-caption]');
    if (caption && window.matchMedia('(hover: none)').matches) { caption.textContent = '轻触留白，墨色轻散'; }
    size();
  }
  JQ.INK_WASH = { mount: mount, dispose: dispose, landscape: landscape, tools: tools };
})();
