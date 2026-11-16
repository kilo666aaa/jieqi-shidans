/* 节气食单 · 瓷玉四时图标系统。
   优先使用本地透明材质图标；小型辅助控件和显式vector选项保留原描线图形。
   选中状态使用同一主体图，避免切换时产生形状漂移。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var ui = {
    home: '<path d="M3 11h18M4 11c.6 5.2 3.3 8 8 8s7.4-2.8 8-8M8 22h8M8 7c-2-2 2-3 0-5M13 7c-2-2 2-3 0-5"/>',
    ask: '<path d="M20.5 10.5c0 4.4-3.6 7.5-8.5 7.5H8l-4.5 3 .9-5C3.2 14.8 2.5 13 2.5 11c0-4.7 3.6-8 9-8h4M11 13c0-5 3-7 8-7-1 4-3.5 6-8 7Zm0 0 5-4"/>',
    term: '<path d="M5 4h14v17l-7-3-7 3ZM8 2v4M16 2v4M8 13h8M9 10a3 3 0 0 1 6 0"/>',
    me: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2c0-4 3-6 8-6s8 2 8 6v2M8 21h8"/>',
    fav: '<path d="M6 3h12v19l-6-4-6 4ZM9 8h6M9 11h4"/>',
    checkin: '<path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 2v6M16 2v6M4 10h16M8 15l3 3 5-5"/>',
    bowl: '<path d="M3 11h18M4 11c1 5 3 8 8 8s7-3 8-8M8 22h8M6 7 19 2M8 9l13-5"/>',
    calendar: '<path d="M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16M8 14h2M14 14h2M8 18h2"/>',
    edit: '<path d="m5 16-1 5 5-1L21 8l-4-4ZM14 7l4 4M13 21h8"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    settings: '<path d="M4 6h7M16 6h4M4 12h2M11 12h9M4 18h10M19 18h1"/><circle cx="13.5" cy="6" r="2.5"/><circle cx="8.5" cy="12" r="2.5"/><circle cx="16.5" cy="18" r="2.5"/>',
    back: '<path d="m11 5-7 7 7 7M4 12h17"/>',
    alert: '<path d="M12 3 2.5 20h19ZM12 9v5M12 17h.01"/>',
    heart: '<path d="M12 21 4 13C-3 5 7-1 12 7c5-8 15-2 8 6Z"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    share: '<path d="M13 3h8v8M21 3 10 14M9 6H4v15h15v-5"/>',
    leaf: '<path d="M5 20C0 9 9 2 21 3c1 12-7 18-16 17ZM5 20 16 9M10 15V9M10 15h6"/>',
    data: '<path d="M5 3h12l3 3v15H4V3ZM8 3v6h8V3M8 21v-7h8v7M12 6h1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M10 11h2v6M10 17h4M12 7h.01"/>',
    shield: '<path d="M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6ZM8 12l3 3 5-6"/>'
  };

  var terms = {
    lichun: '<path d="M24 41V18M24 30C11 30 9 24 10 17c9 0 14 4 14 13Zm0-6c0-11 6-15 14-15 0 9-5 15-14 15ZM10 41h28"/>',
    yushui: '<path d="M8 17c0-5 5-8 9-6 3-8 15-7 17 1 5-1 8 2 8 6M13 25l-4 9M25 22l-5 12M37 25l-4 9M8 41h32"/>',
    jingzhe: '<path d="m27 5-12 18h11l-5 15 15-21H24M8 43c4-7 10-7 14-4M29 42c4-5 8-6 13-5"/>',
    chunfen: '<path d="M24 7v34M8 24h32M24 24C13 23 9 17 11 10c8 0 13 6 13 14Zm0 0c11 1 15 7 13 14-8 0-13-6-13-14Z"/>',
    qingming: '<path d="M7 6c12 4 22 4 34 0M15 9c1 10-9 13-5 24M26 9c1 10-8 15-5 29M36 9c1 9-7 13-5 22M10 42c9-5 19-5 28-1"/>',
    guyu: '<path d="M14 42V22M14 34C5 34 5 28 5 24c6 0 9 3 9 10Zm0-5c0-8 5-12 10-12 0 7-3 11-10 12ZM34 7c-3 5-7 9-7 13a7 7 0 0 0 14 0c0-4-4-8-7-13ZM7 43h33"/>',
    lixia: '<path d="M12 42c13-4 21-14 26-29M12 36C5 17 17 5 39 7c3 18-7 32-27 29ZM20 32l-3-12M28 23l10 1M7 42h9"/>',
    xiaoman: '<path d="M17 42V12M31 42V8M17 18c-7-1-9-5-8-9 6 0 8 4 8 9Zm0 10c7-1 9-5 8-9-6 0-8 4-8 9Zm14-6c7-1 9-5 8-9-6 0-8 4-8 9ZM31 33c-7-1-9-5-8-9 6 0 8 4 8 9Z"/>',
    mangzhong: '<path d="M12 43c2-14 7-26 16-34M18 27c-8-2-9-7-7-12 6 2 8 6 7 12Zm6-9c6 3 12 1 15-3-7-3-12-2-15 3ZM16 35c7 2 12-1 14-6-7-2-12 1-14 6ZM30 31c5-2 10 0 12 4L24 44"/>',
    xiazhi: '<circle cx="24" cy="16" r="8"/><path d="M24 3v-1M11 6l-2-2M37 6l2-2M8 16H4M40 16h4M24 24v14M15 38h18M10 44h28"/>',
    xiaoshu: '<path d="M24 41V27M9 25a15 15 0 0 1 30 0L24 31ZM24 10v21M13 15l11 16M35 15 24 31M9 41h7M33 37h8"/>',
    dashu: '<path d="M24 35C9 30 8 18 13 11c7 3 11 11 11 24Zm0 0c15-5 16-17 11-24-7 3-11 11-11 24Zm0 0C15 25 17 12 24 5c7 7 9 20 0 30ZM7 41c11-3 23-3 34 0"/>',
    liqiu: '<path d="M10 38C6 22 16 9 39 7c1 21-11 32-29 31ZM9 40 31 18M18 31l-1-10M24 25h10M34 41l5 1"/>',
    chushu: '<path d="M7 27h34M13 27a11 11 0 0 1 22 0M24 7v5M8 14l4 4M40 14l-4 4M10 35c6-3 10-3 15 0s9 3 15 0M7 42h29"/>',
    bailu: '<path d="M27 6c-4 7-10 13-10 19a10 10 0 0 0 20 0c0-6-6-12-10-19ZM24 29c-2-1-3-3-3-5M8 41c3-8 7-12 15-10M8 41c7 0 12-3 15-10"/>',
    qiufen: '<path d="M7 25h34M24 8v34M24 13a11 11 0 0 0 0 22M30 13a11 11 0 0 1 0 22M7 42h34"/>',
    hanlu: '<path d="M13 43V24M13 32 5 27M13 38l8-7M31 8c-4 7-8 12-8 17a8 8 0 0 0 16 0c0-5-4-10-8-17ZM27 27l3 3M28 43h13"/>',
    shuangjiang: '<path d="M24 6v36M8 15l32 18M8 33l32-18M18 9l6 6 6-6M18 39l6-6 6 6M8 22l8-2-2-8M34 36l-2-8 8-2M8 26l8 2-2 8M34 12l-2 8 8 2"/>',
    lidong: '<path d="M8 30c10-3 22-3 32 0M10 37c8-3 20-3 28 0M16 44h16M23 25V6M23 16l-8-7M23 21l10-9M15 9V5M33 12l6-1"/>',
    xiaoxue: '<path d="M24 9v30M11 16l26 16M11 32l26-16M19 11l5 5 5-5M19 37l5-5 5 5M11 22l7-2M30 28l7-2"/>',
    daxue: '<path d="M17 7v27M5 14l24 14M5 28l24-14M12 8l5 5 5-5M11 33l6-6 6 6M36 25v13M30 28l12 7M30 35l12-7M6 43c10-3 24-3 36 0"/>',
    dongzhi: '<path d="M7 31h34M15 31a9 9 0 0 1 18 0M24 14v-4M10 20l-3-3M38 20l3-3M24 31 39 42M8 43h31"/>',
    xiaohan: '<path d="M22 5v38M22 9 10 20h24ZM22 18 7 31h30M22 27 5 40h34M34 8h8M36 14h7"/>',
    dahan: '<path d="M7 43c5-12 10-18 20-24M17 29l-7-8M26 21l6 11M27 15c-8-1-9-9-3-11 4-2 7 1 7 5 4-4 9-2 9 2s-4 6-8 4c4 6 0 12-5 9-3-2-4-6 0-9Z"/><circle cx="29" cy="14" r="1.8"/>'
  };

  function escape(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uiIcon(name, options) {
    options = options || {};
    var artwork = JQ.GENERATED_ICONS && JQ.GENERATED_ICONS.ui[name];
    if (artwork && !options.vector) {
      var stateClass = options.active === true ? ' icon-state-on' : options.active === false ? ' icon-state-off' : '';
      return '<img class="app-icon art-icon' + stateClass + '" src="' + escape(artwork) + '" alt="" width="28" height="28">';
    }
    if (!ui[name]) { return ''; }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="app-icon" viewBox="0 0 24 24" fill="none" stroke="' + escape(options.color || 'currentColor') + '" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ui[name] + '</svg>';
  }
  function termIcon(id, options) {
    options = options || {};
    var term = JQ.DATA.termById(id);
    if (!term || !terms[id]) { return ''; }
    var artwork = JQ.GENERATED_ICONS && JQ.GENERATED_ICONS.terms[id];
    if (artwork && !options.vector) {
      return '<svg xmlns="http://www.w3.org/2000/svg" class="generated-term-icon ' + escape(options.className || 'seasonal-icon') + '" viewBox="0 0 120 120" role="img" aria-label="' + escape(term.name + '节气徽记') + '">' +
        '<image href="' + escape(artwork) + '" width="120" height="120"/>' +
        (options.current ? '<circle cx="106" cy="14" r="4" fill="#B5533E"/>' : '') + '</svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + escape(options.className || 'seasonal-icon') + '" viewBox="0 0 120 120" role="img" aria-label="' + escape(term.name + '节气徽记') + '">' +
      '<g transform="scale(2.5)" fill="none" stroke="#355E50" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + terms[id] + '</g>' +
      (options.current ? '<circle cx="107" cy="15" r="4" fill="#B5533E"/>' : '') + '</svg>';
  }
  function termImage(id) {
    return JQ.GENERATED_ICONS && JQ.GENERATED_ICONS.terms[id] || 'assets/seasonal/icons/' + id + '.svg';
  }
  JQ.ICONS = { ui: uiIcon, term: termIcon, termImage: termImage, uiNames: Object.keys(ui), termIds: Object.keys(terms) };
})();
