/* 节气食单 · 节气定位（按年份交节表，缺数据年份如实提示，不外推伪造） */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var SOLAR = {};
  JQ.SOLAR = SOLAR;

  /* 展开所有交节时刻为时间戳（缓存） */
  var flat = null;
  function onsets() {
    if (flat) { return flat; }
    flat = [];
    var years = Object.keys(JQ.DATA.ONSETS);
    years.forEach(function (y) {
      var table = JQ.DATA.ONSETS[y];
      Object.keys(table).forEach(function (tid) {
        flat.push({ termId: tid, year: y, str: table[tid], ts: JQ.bjParse(table[tid]) });
      });
    });
    flat.sort(function (a, b) { return a.ts - b.ts; });
    return flat;
  }

  /* 当前节气（按北京时间）：
     返回 {ok:true, term, onset, sinceTs, next, year}
     或 {ok:false, reason} —— 数据覆盖之外必须如实告知 */
  SOLAR.current = function (nowTs) {
    var now = nowTs == null ? Date.now() : nowTs;
    var list = onsets();
    if (!list.length || now < list[0].ts) {
      return { ok: false, reason: '当前日期早于已收录的交节数据（' + list[0].str.slice(0, 10) + ' 起），暂不可自动定位节气。' };
    }
    var idx = -1;
    for (var i = 0; i < list.length; i++) { if (list[i].ts <= now) { idx = i; } else { break; } }
    var cur = list[idx];
    var next = list[idx + 1] || null;
    /* 超出末个交节 16 天仍未有下一数据：进入未知区间 */
    if (!next && now > cur.ts + 16 * 86400000) {
      return { ok: false, reason: '当前日期已超出已收录的交节数据范围（' + cur.str.slice(0, 10) + ' 后），暂不可自动定位节气。' };
    }
    return {
      ok: true,
      term: JQ.DATA.termById(cur.termId),
      onset: cur.str,
      sinceTs: cur.ts,
      next: next ? next : null,
      year: cur.year,
      source: JQ.DATA.ONSET_SOURCE[cur.year] || ''
    };
  };

  /* 浏览态（会话级）：用户从百科/NFC/链接指定节气；不持久化 */
  SOLAR.browseTerm = null; /* termId 或 null（跟随当前节气） */

  SOLAR.displayTerm = function () {
    if (SOLAR.browseTerm) {
      var t = JQ.DATA.termById(SOLAR.browseTerm);
      if (t) { return { term: t, browsing: true }; }
    }
    var c = SOLAR.current();
    if (c.ok) { return { term: c.term, browsing: false, onset: c.onset }; }
    return { term: null, browsing: false, error: c.reason };
  };

  /* NFC / 二维码 / 普通链接统一参数 ?t=拼音 → termId；无效返回 null */
  SOLAR.termIdFromParam = function (p) {
    if (!p) { return null; }
    var t = JQ.DATA.termByPinyin(String(p).toLowerCase().trim());
    return t ? t.id : null;
  };

  /* 本节气第几天（含交节当天为第 1 天） */
  SOLAR.dayOfTerm = function () {
    var c = SOLAR.current();
    if (!c.ok) { return null; }
    return Math.floor((Date.now() - c.sinceTs) / 86400000) + 1;
  };

  /* 组装不含任何个人偏好的分享链接 */
  SOLAR.shareLink = function (termId) {
    var base = location.origin === 'null' || !location.origin || /^file:/.test(location.origin)
      ? location.href.split('#')[0].split('?')[0]
      : location.origin + location.pathname;
    var t = termId ? JQ.DATA.termById(termId) : null;
    return t ? base + '?t=' + t.pinyin : base;
  };
})();
