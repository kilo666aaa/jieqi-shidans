/* 节气食单 · 月洞门意象（SVG 圆窗山水）与水墨粒子
   意象词汇源自舍友项目包原型（bud/rain/thunder/.../plum 24 式），按需精简适配 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var MOUNTAIN = 'M0,270 L70,215 L120,250 L190,196 L250,244 L310,205 L400,262 L400,400 L0,400 Z';
  var MOUNTAIN2 = 'M0,300 L60,262 L110,292 L180,248 L245,290 L320,255 L400,300 L400,400 L0,400 Z';
  var BRANCH = 'M-10,372 C60,344 96,300 118,250 C132,216 150,196 176,182 M118,250 C136,240 158,238 176,244 M96,300 C78,286 62,272 52,254 M150,196 C158,178 172,166 188,162';

  function motif(mo, c) {
    var P = [];
    function blossom(x, y, r) {
      for (var a = 0; a < 5; a++) {
        var ang = a * 72 * Math.PI / 180;
        P.push('<circle cx="' + (x + Math.cos(ang) * r).toFixed(1) + '" cy="' + (y + Math.sin(ang) * r).toFixed(1) + '" r="' + (r * .62).toFixed(1) + '" fill="#9D2933"/>');
      }
      P.push('<circle cx="' + x + '" cy="' + y + '" r="' + (r * .4).toFixed(1) + '" fill="var(--gold)"/>');
    }
    function leaf(x, y, rot) {
      P.push('<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"><path d="M0,0 C9,-7 20,-6 27,2 C19,10 8,9 0,0 Z" fill="' + c + '" opacity=".85"/></g>');
    }
    function bud(x, y) {
      P.push('<path d="M' + x + ',' + y + ' C' + (x + 3) + ',' + (y - 11) + ' ' + (x + 9) + ',' + (y - 15) + ' ' + (x + 6) + ',' + (y - 22) + '" stroke="var(--ink)" stroke-width="1.6" fill="none" opacity=".7"/>');
      P.push('<ellipse cx="' + (x + 4) + '" cy="' + (y - 11) + '" rx="4" ry="7" transform="rotate(-24 ' + (x + 4) + ' ' + (y - 11) + ')" fill="' + c + '"/>');
    }
    var i, x, y;
    switch (mo) {
      case 'bud': bud(88, 290); bud(44, 246); bud(150, 190); break;
      case 'rain':
        for (i = 0; i < 9; i++) { P.push('<line x1="' + (30 + i * 38) + '" y1="' + (60 + (i % 3) * 26) + '" x2="' + (24 + i * 38) + '" y2="' + (78 + (i % 3) * 26) + '" stroke="var(--c1)" stroke-width="1.6" opacity=".55"/>'); }
        break;
      case 'thunder':
        P.push('<path d="M200,80 L168,140 L196,140 L166,196 L214,132 L186,132 Z" fill="var(--c3)" opacity=".7"/>');
        for (i = 0; i < 6; i++) { P.push('<line x1="' + (24 + i * 60) + '" y1="' + (220 + (i % 3) * 18) + '" x2="' + (18 + i * 60) + '" y2="' + (238 + (i % 3) * 18) + '" stroke="var(--c1)" stroke-width="1.6" opacity=".5"/>'); }
        break;
      case 'swallow':
        for (i = 0; i < 3; i++) { P.push('<g transform="translate(' + (120 + i * 66) + ',' + (96 + (i % 2) * 40) + ') scale(' + (1 - i * .12) + ')"><path d="M0,0 C10,-8 22,-8 30,0 C22,-2 12,0 8,6 C6,2 2,1 0,0 Z" fill="var(--ink)" opacity=".78"/></g>'); }
        break;
      case 'willow':
        for (i = 0; i < 5; i++) { P.push('<path d="M' + (60 + i * 62) + ',44 C' + (50 + i * 62) + ',' + (96 + i * 6) + ' ' + (74 + i * 62) + ',' + (118 + i * 4) + ' ' + (62 + i * 62) + ',' + (152 + i * 4) + '" stroke="' + c + '" stroke-width="1.5" fill="none" opacity=".7"/>'); }
        leaf(150, 150, 20);
        break;
      case 'leaf': leaf(170, 238, -10); leaf(144, 184, 16); leaf(90, 294, 42); leaf(46, 248, 68); break;
      case 'lotus':
        P.push('<path d="M118,236 C104,222 104,204 118,192 C132,204 132,222 118,236 Z" fill="var(--c2)"/>');
        P.push('<path d="M158,262 C148,252 148,238 158,229 C169,238 169,252 158,262 Z" fill="var(--c2)" opacity=".8"/>');
        leaf(96, 300, 18); leaf(52, 254, -14);
        break;
      case 'wheat':
        for (i = 0; i < 4; i++) {
          var bx = 70 + i * 44;
          P.push('<line x1="' + bx + '" y1="330" x2="' + (bx + 6) + '" y2="252" stroke="var(--ink)" stroke-width="1.4" opacity=".65"/>');
          for (var j = 0; j < 5; j++) { P.push('<ellipse cx="' + (bx + 9) + '" cy="' + (268 + j * 14) + '" rx="4.5" ry="7" transform="rotate(-18 ' + (bx + 9) + ' ' + (268 + j * 14) + ')" fill="var(--c2)"/>'); }
        }
        break;
      case 'sun': break;
      case 'cicada':
        P.push('<g transform="translate(232,150)"><ellipse rx="10" ry="24" fill="var(--ink)" opacity=".8"/><path d="M-9,-10 C-24,-26 -30,-40 -26,-52" stroke="var(--ink)" stroke-width="1.4" fill="none" opacity=".6"/><path d="M9,-10 C24,-26 30,-40 26,-52" stroke="var(--ink)" stroke-width="1.4" fill="none" opacity=".6"/></g>');
        break;
      case 'firefly':
        for (i = 0; i < 10; i++) { P.push('<circle cx="' + (60 + ((i * 57) % 260)) + '" cy="' + (110 + ((i * 83) % 200)) + '" r="' + (2.4 + (i % 3)) + '" fill="var(--gold)" opacity=".9"/>'); }
        break;
      case 'dew':
        for (i = 0; i < 7; i++) { P.push('<ellipse cx="' + (70 + i * 42) + '" cy="' + (300 + (i % 3) * 22) + '" rx="' + (4 + (i % 2) * 2) + '" ry="' + (5 + (i % 2) * 2) + '" fill="var(--c2)" opacity=".7"/>'); }
        break;
      case 'frost':
        for (i = 0; i < 6; i++) {
          x = 58 + i * 54; y = 320 - (i % 3) * 26;
          P.push('<g stroke="var(--c2)" stroke-width="1.2" opacity=".7"><line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y - 16) + '"/><line x1="' + (x - 7) + '" y1="' + (y - 8) + '" x2="' + (x + 7) + '" y2="' + (y - 8) + '"/><line x1="' + (x - 5) + '" y1="' + (y - 13) + '" x2="' + (x + 5) + '" y2="' + (y - 3) + '"/></g>');
        }
        break;
      case 'persimmon':
        P.push('<circle cx="152" cy="196" r="13" fill="var(--c2)"/><circle cx="178" cy="246" r="13" fill="var(--c2)"/><circle cx="100" cy="300" r="13" fill="var(--c2)"/>');
        leaf(60, 240, 14); leaf(210, 210, -18);
        break;
      case 'moon': break;
      case 'ice':
        for (i = 0; i < 6; i++) { P.push('<line x1="' + (40 + i * 58) + '" y1="' + (348 + (i % 2) * 16) + '" x2="' + (96 + i * 58) + '" y2="' + (352 + (i % 2) * 16) + '" stroke="var(--c1)" stroke-width="1.4" opacity=".55"/>'); }
        break;
      case 'snow':
        for (i = 0; i < 11; i++) { P.push('<circle cx="' + ((i * 97) % 360 + 20) + '" cy="' + ((i * 151) % 300 + 50) + '" r="' + (1.8 + (i % 3) * .9) + '" fill="#FFFDF8" opacity=".9"/>'); }
        break;
      case 'pine':
        P.push('<g stroke="var(--ink)" stroke-width="1.5" fill="none" opacity=".75" transform="translate(210,300)"><path d="M0,0 L-40,-34 M0,0 L40,-34 M0,-14 L-30,-42 M0,-14 L30,-42 M0,-28 L-20,-52 M0,-28 L20,-52 M0,0 L0,-56"/></g>');
        for (i = 0; i < 8; i++) { P.push('<circle cx="' + (40 + i * 40) + '" cy="' + (90 + ((i * 79) % 200)) + '" r="' + (1.8 + (i % 3) * .8) + '" fill="#FFFDF8" opacity=".85"/>'); }
        break;
      case 'plum': blossom(176, 244, 11); blossom(150, 192, 9); blossom(96, 300, 10); blossom(60, 252, 8); blossom(206, 214, 7); break;
      default: leaf(176, 244, -8);
    }
    return P.join('');
  }

  /* 生成月洞门 SVG 内部结构（term 需含 c/mo/s 字段；size 视觉盒 400） */
  JQ.moongateSVG = function (term) {
    var night = term.season === '冬' || term.mo === 'moon';
    var disc = term.mo === 'sun'
      ? '<circle cx="200" cy="132" r="42" fill="var(--c2)" opacity=".5"/>'
      : (night
        ? '<circle cx="200" cy="126" r="34" fill="var(--paper)" opacity=".92"/><circle cx="214" cy="118" r="30" fill="var(--c1)" opacity=".22"/>'
        : '<circle cx="200" cy="132" r="42" fill="var(--c2)" opacity=".42"/>');
    var gid = 'g' + term.id;
    return '<defs>' +
      '<clipPath id="c' + gid + '"><circle cx="200" cy="200" r="182"/></clipPath>' +
      '<linearGradient id="s' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" style="stop-color:var(--paper)"/>' +
      '<stop offset="1" style="stop-color:' + (term.c || 'var(--c1)') + '" stop-opacity=".24"/>' +
      '</linearGradient></defs>' +
      '<g clip-path="url(#c' + gid + ')">' +
      '<rect width="400" height="400" fill="url(#s' + gid + ')"/>' + disc +
      '<path d="' + MOUNTAIN + '" fill="' + (term.c || 'var(--c1)') + '" opacity=".13"/>' +
      '<path d="' + MOUNTAIN2 + '" fill="' + (term.c || 'var(--c1)') + '" opacity=".25"/>' +
      motif(term.mo, term.c || 'var(--c1)') +
      '<path d="' + BRANCH + '" stroke="var(--ink)" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>' +
      '</g>' +
      '<circle cx="200" cy="200" r="182" fill="none" stroke="var(--line)" stroke-width="1.2"/>' +
      '<circle cx="200" cy="200" r="190" fill="none" stroke="' + (term.c || 'var(--c1)') + '" stroke-width=".8" opacity=".35"/>';
  };

  /* 水墨粒子：挂在指定 canvas 上；季色取 --c2；移动端减量；隐藏时暂停；reduced-motion 不启动 */
  JQ.inkParticles = function (canvas) {
    if (!canvas || window.matchMedia('(prefers-reduced-motion:reduce)').matches) { return; }
    var ctx = canvas.getContext('2d');
    var W, H, P = [], running = true;
    var touch = window.matchMedia('(hover:none)').matches;
    function init() {
      return {
        x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 3,
        vx: (Math.random() - .5) * .15, vy: .1 + Math.random() * .38,
        o: .12 + Math.random() * .32, a: Math.random() * Math.PI * 2
      };
    }
    function size() {
      var d = window.devicePixelRatio || 1, r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = r.width * d; canvas.height = r.height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      var n = Math.min(touch ? 14 : 26, Math.round(W * H / 26000));
      P = []; for (var i = 0; i < n; i++) { P.push(init()); }
    }
    function frame() {
      if (!running) { requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, W, H);
      var col = getComputedStyle(document.body).getPropertyValue('--c2').trim() || '#C3B787';
      ctx.fillStyle = col;
      P.forEach(function (p) {
        p.a += .012; p.x += p.vx + Math.sin(p.a) * .2; p.y += p.vy;
        if (p.y > H + 6) { Object.assign(p, init(), { y: -6 }); }
        ctx.globalAlpha = p.o;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.284); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', function () { running = !document.hidden; });
    size(); requestAnimationFrame(frame);
  };
})();
