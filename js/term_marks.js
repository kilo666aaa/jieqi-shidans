/* 节气食单 · 24 节气徽记（印章×历盘）
   设计语言承接古中式 v2：楷体单名竖排居中，外环为节气刻度盘（24 分度，
   呼应黄经每 15° 一气），季节色描环，当前节气加朱砂双环与「今」角印。
   纯 SVG 无依赖；颜色来自数据层 t.c，未引入新主题色。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var INK = '#1D1B1C', SEAL = '#C0392B';

  JQ.marksSVG = function (term, opts) {
    opts = opts || {};
    var t = typeof term === 'string' ? JQ.DATA.termById(term) : term;
    if (!t) { return ''; }
    var c = t.c || '#3F7D5A';
    var n1 = t.name.charAt(0), n2 = t.name.charAt(1);
    var ticks = '';
    for (var k = 0; k < 24; k++) {
      var a = k / 24 * Math.PI * 2 - Math.PI / 2;
      var big = k % 6 === 0;
      var r1 = big ? 24.5 : 26.5, r2 = 29.5;
      ticks += '<line x1="' + (40 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (40 + Math.sin(a) * r1).toFixed(1) +
        '" x2="' + (40 + Math.cos(a) * r2).toFixed(1) + '" y2="' + (40 + Math.sin(a) * r2).toFixed(1) +
        '" stroke="' + c + '" stroke-width="' + (big ? 1.6 : .8) + '" opacity="' + (big ? .95 : .55) + '"/>';
    }
    var current = opts.current
      ? '<circle cx="40" cy="40" r="37.5" fill="none" stroke="' + SEAL + '" stroke-width="1.6" opacity=".9"/>' +
        '<g transform="translate(61 61)"><rect x="-8" y="-8" width="16" height="16" rx="3" fill="' + SEAL + '"/>' +
        '<text x="0" y="3.8" text-anchor="middle" font-size="10" fill="#F8F4ED" style="font-family:\'KaiTi\',\'STKaiti\',serif">今</text></g>'
      : '';
    return '<svg class="term-mark' + (opts.cls ? ' ' + opts.cls : '') + '" viewBox="0 0 80 80" role="img" aria-label="' +
      JQ.esc(t.name + '徽记') + '">' +
      '<circle cx="40" cy="40" r="38" fill="' + (opts.current ? 'rgba(192,57,43,.05)' : 'rgba(63,125,90,.04)') + '" stroke="' + c + '" stroke-width="2"/>' +
      '<circle cx="40" cy="40" r="21.5" fill="none" stroke="' + c + '" stroke-width=".7" opacity=".45"/>' +
      ticks +
      '<text x="40" y="34.5" text-anchor="middle" font-size="21" font-weight="700" fill="' + INK + '" style="font-family:\'KaiTi\',\'STKaiti\',serif">' + n1 + '</text>' +
      '<text x="40" y="55.5" text-anchor="middle" font-size="21" font-weight="700" fill="' + INK + '" style="font-family:\'KaiTi\',\'STKaiti\',serif">' + n2 + '</text>' +
      '<circle cx="40" cy="61.5" r="1.7" fill="' + c + '"/>' +
      current +
      '</svg>';
  };
})();
