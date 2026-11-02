/* 节气环：原生 Canvas 透视粒子，无外部依赖。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var cleanup = null;
  var S = window.JQ.LOGIN_SCENE = {};
  S.dispose = function () { if (cleanup) { cleanup(); cleanup = null; } };
  S.mount = function (canvas) {
    S.dispose();
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var frame = 0, dead = false, width = 360, height = 300, pointer = 0;
    var particles = [];
    /* Deterministic Fibonacci shell plus two orbital bands. */
    for (var i = 0; i < 640; i++) {
      var y = 1 - (i / 639) * 2, radius = Math.sqrt(1 - y * y), a = i * 2.399963;
      particles.push({ x: Math.cos(a) * radius, y: y, z: Math.sin(a) * radius,
        size: i % 11 === 0 ? 1.6 : .65, band: false });
    }
    for (var j = 0; j < 310; j++) {
      var t = j / 310 * Math.PI * 2;
      particles.push({ x: 1.35 * Math.cos(t), y: .29 * Math.sin(t), z: 1.35 * Math.sin(t), size: 1.1, band: true });
    }
    function resize() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = r.width || 360; height = r.height || 300;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }
    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      var turn = (reduced.matches ? .7 : time * .00011) + pointer * .12;
      var ct = Math.cos(turn), st = Math.sin(turn), scale = Math.min(width * .29, height * .37);
      var projected = particles.map(function (p) {
        var x = p.x * ct + p.z * st, z = p.z * ct - p.x * st;
        var y = p.y * .92 - z * .32;
        var depth = z * .92 + p.y * .32;
        var perspective = 3.8 / (3.8 - depth);
        return { x: width / 2 + x * scale * perspective, y: height / 2 + y * scale * perspective,
          z: depth, size: p.size * perspective, band: p.band };
      }).sort(function (a, b) { return a.z - b.z; });
      projected.forEach(function (p) {
        ctx.globalAlpha = .22 + (p.z + 1.5) / 3 * .65;
        ctx.fillStyle = p.band ? '#d7bd7f' : '#a4cdb3';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = .8;
      /* Twenty-four quiet ticks connect the scene to the solar calendar. */
      for (var k = 0; k < 24; k++) {
        var a = k / 24 * Math.PI * 2, r = scale * 1.48;
        ctx.strokeStyle = '#b39962'; ctx.lineWidth = k % 6 === 0 ? 1.5 : .6;
        ctx.beginPath(); ctx.moveTo(width / 2 + Math.cos(a) * r, height / 2 + Math.sin(a) * r);
        ctx.lineTo(width / 2 + Math.cos(a) * (r + (k % 6 === 0 ? 8 : 3)), height / 2 + Math.sin(a) * (r + (k % 6 === 0 ? 8 : 3))); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    function loop(time) {
      frame = 0;
      if (dead || !canvas.isConnected || document.hidden || reduced.matches) { return; }
      draw(time); frame = requestAnimationFrame(loop);
    }
    function sync() {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      if (dead) { return; }
      draw(performance.now());
      if (!document.hidden && !reduced.matches) { frame = requestAnimationFrame(loop); }
    }
    function move(e) { var r = canvas.getBoundingClientRect(); pointer = (e.clientX - r.left) / width - .5; }
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', sync);
    canvas.addEventListener('pointermove', move);
    if (reduced.addEventListener) { reduced.addEventListener('change', sync); }
    cleanup = function () {
      dead = true; if (frame) { cancelAnimationFrame(frame); frame = 0; }
      window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('pointermove', move);
      if (reduced.removeEventListener) { reduced.removeEventListener('change', sync); }
    };
    resize(); sync();
  };
})();
