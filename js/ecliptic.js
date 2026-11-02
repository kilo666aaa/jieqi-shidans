/* 节气食单 · 节气天文仪（黄道图解卡）
   方法取自 anatomy skill：「物件即解释」——一台可读刻度的仪器：
   地球（含赤道与地轴）居中，外环为黄经刻度盘（0°=春分，每 15° 一气），
   日照指针指向当前节气；播放时太阳沿黄道周年视运动 8 秒一周（示意压缩）。
   数据真值：黄经度数取自 js/seasonal.js（已对照香港天文台）；
   动画为定性示意，不以动画进度伪装实测昼夜或温度。GSAP 仅做入场与补间，
   缺席时静态显示；prefers-reduced-motion 显示静帧。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var CX = 160, CY = 118, R = 84;
  var CARDINALS = { chunfen: '春分', xiazhi: '夏至', qiufen: '秋分', dongzhi: '冬至' };

  function order() {
    var T = JQ.DATA.TERMS;
    return T.map(function (t) {
      var s = JQ.SEASONAL && JQ.SEASONAL.data && JQ.SEASONAL.data[t.id];
      return { id: t.id, name: t.name, lon: s ? s.longitude : (315 + (t.seq - 1) * 15) % 360, theme: s ? s.theme : '' };
    });
  }
  function pos(lon) {
    var a = (lon - 90) * Math.PI / 180; /* 黄经 0°（春分）置于正上方 */
    return [CX + Math.cos(a) * R, CY + Math.sin(a) * R];
  }
  function ring(order_) {
    var out = '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="var(--line)" stroke-width="1.4"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R - 7) + '" fill="none" stroke="var(--line)" stroke-width=".6" stroke-dasharray="2 5"/>';
    order_.forEach(function (o) {
      var big = CARDINALS[o.id];
      var a = (o.lon - 90) * Math.PI / 180;
      var x1 = CX + Math.cos(a) * (R - (big ? 9 : 5)), y1 = CY + Math.sin(a) * (R - (big ? 9 : 5));
      var x2 = CX + Math.cos(a) * R, y2 = CY + Math.sin(a) * R;
      out += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--line)" stroke-width="' + (big ? 1.6 : .8) + '"/>';
      if (big) {
        var lx = CX + Math.cos(a) * (R + 14), ly = CY + Math.sin(a) * (R + 14);
        out += '<text class="ec-label' + (o.id === 'dongzhi' || o.id === 'qiufen' ? ' end' : '') + '" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle">' + big + '</text>';
      }
    });
    return out;
  }
  function earth() {
    return '<g class="ec-earth">' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="24" fill="var(--card)" stroke="var(--green)" stroke-width="1.6"/>' +
      '<ellipse cx="' + CX + '" cy="' + CY + '" rx="24" ry="8.5" fill="none" stroke="var(--green)" stroke-width=".8" opacity=".65"/>' +
      '<line x1="' + (CX - 24) + '" y1="' + CY + '" x2="' + (CX + 24) + '" y2="' + CY + '" stroke="var(--green)" stroke-width=".8" opacity=".65"/>' +
      '<line x1="' + (CX - 9) + '" y1="' + (CY - 27) + '" x2="' + (CX + 9) + '" y2="' + (CY + 27) + '" stroke="var(--ink2)" stroke-width="1.1" stroke-dasharray="4 3" opacity=".8"/>' +
      '<text x="' + CX + '" y="' + (CY + 3.4) + '" text-anchor="middle" font-size="10" class="ec-earth-t">地</text>' +
      '</g>';
  }
  function needle(o) {
    var p = pos(o.lon);
    var mx = CX + (p[0] - CX) * .38, my = CY + (p[1] - CY) * .38;
    return '<g class="ec-needle" data-ec-needle>' +
      '<line x1="' + mx.toFixed(1) + '" y1="' + my.toFixed(1) + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#C08A2E" stroke-width="2"/>' +
      '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="7.5" fill="#e3bf80" stroke="#C08A2E" stroke-width="1.2"/>' +
      '</g>' +
      '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="12.5" fill="none" stroke="#C08A2E" stroke-width="1" opacity=".55" data-ec-halo/>';
  }
  function svgOf(order_, o) {
    return '<svg viewBox="0 0 320 236" role="img" aria-label="节气天文仪：黄经' + o.lon + '度" data-ec-svg>' + ring(order_) + earth() + needle(o) + '</svg>';
  }

  JQ.ECLIPTIC = {
    card: function (term) {
      var list = order();
      var idx = Math.max(0, list.findIndex(function (o) { return o.id === term.id; }));
      var d = JQ.SEASONAL && JQ.SEASONAL.data && JQ.SEASONAL.data[term.id];
      return '<section class="card ec-card" data-reveal data-ec-card data-ec-idx="' + idx + '">' +
        '<div class="ec-head"><span class="ec-tag">节气天文仪 · 黄道刻度</span><output data-ec-readout>黄经 ' + list[idx].lon + '° · ' + list[idx].name + '</output></div>' +
        '<div class="ec-stage" data-ec-stage>' + svgOf(list, list[idx]) + '</div>' +
        '<div class="ec-controls">' +
        '<button type="button" data-ec-prev>‹ 上一气</button>' +
        '<button type="button" data-ec-play aria-pressed="false">播放周年</button>' +
        '<button type="button" data-ec-next>下一气 ›</button>' +
        '</div>' +
        '<p class="ec-note">日照指针为定性示意 · 播放为 8 秒压缩的周年视运动 · 实际昼夜时长随纬度与大气折射改变</p>' +
        (d ? '<p class="ec-sub"><b>' + JQ.esc(d.theme) + '</b> ' + JQ.esc(d.meaning) + '</p>' : '') +
        '</section>';
    },
    mount: function (root) {
      var card = root && (root.querySelector ? root.querySelector('[data-ec-card]') : null);
      if (!card || card.dataset.ecBound) { return; }
      card.dataset.ecBound = '1';
      var list = order();
      var stage = card.querySelector('[data-ec-stage]');
      var readout = card.querySelector('[data-ec-readout]');
      var playBtn = card.querySelector('[data-ec-play]');
      var idx = +card.getAttribute('data-ec-idx') || 0;
      var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
      var tween = null;

      function show(i, anim) {
        idx = ((i % 24) + 24) % 24;
        var o = list[idx];
        stage.innerHTML = svgOf(list, o);
        readout.textContent = '黄经 ' + o.lon + '° · ' + o.name;
        card.setAttribute('data-ec-idx', String(idx));
        var halo = stage.querySelector('[data-ec-halo]');
        if (halo && anim && window.gsap && !reduced.matches) {
          gsap.from(halo, { attr: { r: 30 }, opacity: 0, duration: .7, ease: 'power2.out' });
        }
      }
      function stop() {
        if (tween) { tween.kill(); tween = null; }
        playBtn.setAttribute('aria-pressed', 'false');
        playBtn.textContent = '播放周年';
      }
      function play() {
        if (tween) { stop(); return; }
        if (reduced.matches || !window.gsap) {
          readout.textContent = reduced.matches ? '低动态模式 · 静帧示意' : readout.textContent;
          return;
        }
        var sun = { lon: list[idx].lon };
        playBtn.setAttribute('aria-pressed', 'true');
        playBtn.textContent = '停止';
        tween = gsap.to(sun, {
          lon: '-=360', duration: 8, ease: 'none',
          onUpdate: function () {
            var near = list.reduce(function (best, o, i) {
              var dd = Math.abs(((o.lon - sun.lon) % 360 + 540) % 360 - 180);
              return dd < best.dd ? { dd: dd, i: i } : best;
            }, { dd: 999, i: idx });
            var o = list[near.i];
            var p = pos(((sun.lon % 360) + 360) % 360);
            stage.innerHTML = svgOf(list, { id: o.id, name: o.name, lon: ((sun.lon % 360) + 360) % 360, theme: o.theme });
            readout.textContent = '黄经 ' + Math.round(((sun.lon % 360) + 360) % 360) + '° · ' + (o.name || '');
            var halo = stage.querySelector('[data-ec-halo]');
            if (halo) { halo.setAttribute('r', '12.5'); }
            idx = near.i; card.setAttribute('data-ec-idx', String(idx));
          },
          onComplete: stop
        });
      }
      card.querySelector('[data-ec-prev]').addEventListener('click', function () { stop(); show(idx - 1, true); });
      card.querySelector('[data-ec-next]').addEventListener('click', function () { stop(); show(idx + 1, true); });
      playBtn.addEventListener('click', play);
      if (!reduced.matches && window.gsap) {
        gsap.from(stage.querySelector('[data-ec-needle]'), { opacity: 0, duration: .6, ease: 'power1.out' });
      }
      show(idx, false);
    },
    dispose: function () {
      /* tween 随节点移除自动失效；本组件不注册全局监听 */
    }
  };
})();
