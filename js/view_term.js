/* 节气食单 · 视图：节气百科（目录 + 详情）
   目录当前节气高亮；详情分区展示民俗与现代营养；未核验标注整理中 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  JQ.VIEWS.termList = function () {
    var view = JQ.$('#view');
    var cur = JQ.SOLAR.current();
    var curId = cur.ok ? cur.term.id : null;

    var seasons = ['春', '夏', '秋', '冬'];
    var grid = '';
    seasons.forEach(function (s) {
      grid += '<div class="season-title">' + (s === '春' ? '🌱 春' : s === '夏' ? '☀️ 夏' : s === '秋' ? '🍂 秋' : '❄️ 冬') + '六节气</div><div class="term-grid">';
      JQ.DATA.TERMS.filter(function (t) { return t.season === s; }).forEach(function (t) {
        grid += '<a class="term-cell' + (t.id === curId ? ' now' : '') + '" href="#/term/' + t.id + '">' +
          (t.id === curId ? '<span class="tc-now">当前</span>' : '') +
          '<div class="tc-name serif">' + JQ.esc(t.name) + '</div>' +
          '<div class="tc-season">第' + t.seq + ' · ' + JQ.esc(t.pinyin) + '</div></a>';
      });
      grid += '</div>';
    });

    view.innerHTML = JQ.HEADER('节气百科', '') +
      '<div class="wrap">' +
      (cur.ok
        ? '<div class="notice-green">📍 当前节气：<b>' + JQ.esc(cur.term.name) + '</b>（' + JQ.fmtMD(cur.onset) + ' 交节 · 数据来源：' + JQ.esc(cur.source) + '）</div>'
        : '<div class="notice-amber">📍 ' + JQ.esc(cur.reason || '当前年份交节数据不可用。') + '</div>') +
      '<div class="card">' + grid + '</div>' +
      '<div class="notice-amber"><span class="badge badge-demo">演示数据</span> 百科内容为演示版（物候整理自《月令七十二候集解》，待核验）；交节时刻 2026 年引自香港天文台，2027–2029 年引自历表整理（待核验）。</div>' +
      '</div>';
  };

  JQ.VIEWS.termDetail = function (tid) {
    var view = JQ.$('#view');
    var t = JQ.DATA.termById(tid);
    if (!t) {
      view.innerHTML = JQ.HEADER('节气详情', '', true) +
        '<div class="wrap"><div class="card state-box"><div class="big">🗓️</div><div>没有找到该节气。</div>' +
        '<a class="btn btn-primary" href="#/term">回节气百科</a></div></div>';
      return;
    }

    /* 该节气在各覆盖年份的交节时刻 */
    var onsetRows = '';
    Object.keys(JQ.DATA.ONSETS).forEach(function (y) {
      var str = JQ.DATA.ONSETS[y][t.id];
      if (str) {
        onsetRows += '<div class="ing-row"><span>' + y + ' 年</span><span class="muted">' +
          JQ.fmtMD(str) + ' ' + JQ.fmtTime(str) + '</span></div>';
      }
    });

    var isFav = JQ.FAV.isFav('term', t.id);
    var hou = t.hou.map(function (h, i) {
      return '<div class="hou-row"><div class="hou-i">' + (i + 1) + '</div><div style="align-self:center">' + JQ.esc(h) + '</div></div>';
    }).join('');

    view.innerHTML =
      JQ.HEADER(t.name + ' · 节气详情',
        '<button class="btn btn-sm ' + (isFav ? 'btn-warm' : 'btn-ghost') + '" id="fav-btn">' + (isFav ? '★ 已收藏' : '☆ 收藏') + '</button>',
        true) +
      '<div class="wrap">' +
      '<div class="term-hero"><div class="t-seq">二十四节气 · 第 ' + t.seq + ' 个 · ' + JQ.esc(t.season) + '季</div>' +
      '<h2 class="serif">' + JQ.esc(t.name) + '</h2>' +
      '<div class="t-sub">' + JQ.esc(t.pinyin) + '</div></div>' +

      '<div class="card"><h2>物候三候 <span class="badge badge-demo">待核验</span></h2>' + hou +
      '<div class="small muted" style="margin-top:6px">整理自《月令七十二候集解》（演示数据）</div></div>' +

      '<div class="card"><div class="zone-title">传统民俗</div>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(t.food) + '</div>' +
      '<div class="zone-title warm">宜食方向</div>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(t.yi) + '</div>' +
      (t.poem
        ? '<div class="zone-title">诗词</div><div class="poem serif">' + JQ.esc(t.poem.text) +
        '<div class="small muted" style="margin-top:4px">—— ' + JQ.esc(t.poem.from) + '</div></div>'
        : '<div class="zone-title">诗词</div><div class="muted small" style="padding:10px 0">📜 诗词整理中，上线前须经核验。</div>') +
      '</div>' +

      '<div class="card"><div class="zone-title warm">现代营养视角（与民俗分区）</div>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(t.nutrition) + '</div>' +
      '<div class="small muted" style="margin-top:6px">以上为一般性膳食提示，不构成医疗建议，不作疗效承诺。</div></div>' +

      '<div class="card"><h2>历年交节时刻（北京时间）</h2>' + onsetRows +
      '<div class="small muted" style="margin-top:6px">未列年份的数据尚未收录，不做外推。</div></div>' +

      '<button class="btn btn-primary btn-block" id="go-menu">🥣 查看「' + JQ.esc(t.name) + '」食单</button>' +
      '<div style="height:12px"></div>' +
      '</div>';

    JQ.$('#fav-btn').addEventListener('click', function () {
      var res = JQ.FAV.toggle('term', t.id, { title: t.name + ' · 节气知识', sub: t.food });
      if (res === true) { JQ.toast('已收藏节气知识', 'ok'); }
      if (res === false) { JQ.toast('已取消收藏'); }
      JQ.VIEWS.termDetail(tid);
    });

    JQ.$('#go-menu').addEventListener('click', function () {
      JQ.SOLAR.browseTerm = t.id;
      location.hash = '#/home';
    });
  };
})();
