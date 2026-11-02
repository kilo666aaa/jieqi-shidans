/* 节气食单 · 视图：节气百科（环形节气盘 + 签牌目录 + 详情）
   目录当前节气高亮；详情分区展示民俗与现代营养；未核验标注整理中
   v2：环形时间轴（八节大站）、签牌卡（幽影数字+季色书脊+印章今日）、古籍引用 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  var CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四'];
  var MAIN8 = ['立春', '春分', '立夏', '夏至', '立秋', '秋分', '立冬', '冬至'];

  /* 环形节气盘 SVG */
  function ringSVG(curId) {
    var T = JQ.DATA.TERMS, N = T.length, C = 200, R = 164;
    var html = '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="var(--line)"/>' +
      '<circle cx="' + C + '" cy="' + C + '" r="' + (R - 26) + '" fill="none" stroke="var(--line)" stroke-width=".7" stroke-dasharray="2 6"/>' +
      '<circle cx="' + C + '" cy="' + C + '" r="' + (R - 82) + '" fill="var(--card)" stroke="var(--line)"/>';
    T.forEach(function (t, i) {
      var a = (t.seq / N) * Math.PI * 2 - Math.PI / 2; /* 以立春为起点顺时针 */
      var x = C + Math.cos(a) * R, y = C + Math.sin(a) * R;
      var x2 = C + Math.cos(a) * (R - 26), y2 = C + Math.sin(a) * (R - 26);
      var big = MAIN8.indexOf(t.name) >= 0;
      var isCur = t.id === curId;
      html += '<g role="link" tabindex="0" aria-label="查看' + t.name + '百科" class="node' + (isCur ? ' on' : '') + '" data-tid="' + t.id + '">' +
        '<line x1="' + x2.toFixed(1) + '" y1="' + y2.toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)"/>' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (big ? 5 : 3.4) + '" fill="' + (isCur ? 'var(--seal)' : (t.c || 'var(--green)')) + '" opacity="' + (big ? .92 : .62) + '"/>';
      if (big) {
        var lx = C + Math.cos(a) * (R + 20), ly = C + Math.sin(a) * (R + 20);
        html += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle">' + t.name + '</text>';
      }
      html += '</g>';
    });
    return html;
  }

  JQ.VIEWS.termList = function () {
    var view = JQ.$('#view');
    var cur = JQ.SOLAR.current();
    var curId = cur.ok ? cur.term.id : null;
    var curTerm = cur.ok ? cur.term : null;

    /* 环盘中心 */
    var mid = curTerm
      ? '<div class="i">第' + CN[curTerm.seq - 1] + '气</div><div class="t">' + JQ.esc(curTerm.name) + '</div><div class="d">' + JQ.fmtMD(JQ.DATA.ONSETS[cur.year][curTerm.id] || '') + ' · ' + curTerm.season + '</div>'
      : '<div class="t small">数据整理中</div>';

    /* 四季分区签牌 */
    var seasonColors = { 春: '#8FB56A', 夏: '#2E6B4F', 秋: '#C08A2E', 冬: '#3A4459' };
    var grid = '';
    ['春', '夏', '秋', '冬'].forEach(function (s) {
      grid += '<div class="season-title" style="--sc:' + seasonColors[s] + '"><span class="zi">' + s + '</span>六气</div><div class="term-grid">';
      JQ.DATA.TERMS.filter(function (t) { return t.season === s; }).forEach(function (t) {
        grid += '<a class="term-cell' + (t.id === curId ? ' now' : '') + '" style="--tc:' + (t.c || seasonColors[s]) + '" href="#/term/' + t.id + '">' +
          (t.id === curId ? '<span class="tc-now">今日</span>' : '') +
          '<span class="term-icon">' + (JQ.SEASONAL ? JQ.SEASONAL.icon(t.id) : '') + '</span>' +
          '<div class="tc-name">' + JQ.esc(t.name) + '</div>' +
          '<div class="tc-season">' + JQ.esc(t.pinyin) + '</div></a>';
      });
      grid += '</div>';
    });

    view.innerHTML = JQ.HEADER('节气百科', '') +
      '<div class="wrap">' +
      (cur.ok
        ? '<div class="notice-green">📍 当前节气：<b>' + JQ.esc(cur.term.name) + '</b>（' + JQ.fmtMD(cur.onset) + ' 交节 · 来源：' + JQ.esc(cur.source) + '）</div>'
        : '<div class="notice-amber">📍 ' + JQ.esc(cur.reason || '当前年份交节数据不可用。') + '</div>') +

      '<details class="card encyclopedia-intro"><summary>先读懂二十四节气</summary>' +
      '<h3>时刻、天气和物候，有什么区别？</h3>' +
      '<p>交节是一个天文时刻：从地球观测，太阳黄经每前进 15°，就到达下一个节气。气候与物候是长期观察形成的时令经验；当地今天是否下雨、结霜，还要看实际天气。</p>' +
      '<p class="small"><a href="https://www.hko.gov.hk/tc/gts/time/24solarterms.htm" target="_blank" rel="noopener noreferrer">香港天文台 · 节气原理</a></p>' +
      '<h3>非遗保护的是什么？</h3>' +
      '<p>二十四节气相关时间知识及实践于 2016 年列入联合国教科文组织人类非物质文化遗产代表作名录。这里的文化包括观察自然、安排农事和节令生活的知识与实践。本站菜谱是时令饮食示例，具体食俗应结合地域与出处理解。</p>' +
      '<p class="small"><a href="https://ich.unesco.org/en/RL/the-twenty-four-solar-terms-knowledge-of-time-and-practices-developed-in-china-through-observation-of-the-suns-annual-motion-00647" target="_blank" rel="noopener noreferrer">UNESCO 项目介绍</a> · <a href="https://www.ihchina.cn/solar_terms.html" target="_blank" rel="noopener noreferrer">中国非遗网 · 二十四节气专题</a></p>' +
      '<h3>如何理解三候与食养？</h3>' +
      '<p>三候是传统物候记录，不是各地同步发生的天气预报；古人关于动物变化的解释也需与现代科学区分。食养内容按传统观念、日常饮食和起居分别阅读，食材选择先核对个人过敏与实际配料。</p>' +
      '</details>' +

      '<div class="card axis-wrap" data-reveal>' +
      '<div class="kicker-h" style="text-align:center">节气轮 · 周天三百六十度</div>' +
      '<div class="axis">' +
      '<svg viewBox="0 0 400 400" aria-label="二十四节气环形时间轴">' + ringSVG(curId) + '</svg>' +
      '<div class="axis-mid">' + mid + '</div>' +
      '</div>' +
      '<div class="small muted" style="text-align:center;margin-top:4px">点任一节点进入详解 · 八节为大站</div>' +
      '</div>' +

      '<div class="card" data-reveal>' + grid + '</div>' +

      '<div class="notice-amber" data-reveal><span class="badge badge-demo">内容审核说明</span> 物候、古籍与食俗按条目标注审核范围；2026–2028 年交节时刻已逐项对照香港天文台原表，2029 年仍待核验。</div>' +
      '</div>';

    /* 圆盘节点点击 */
    JQ.$$('.axis .node').forEach(function (g) {
      g.addEventListener('click', function () {
        location.hash = '#/term/' + g.getAttribute('data-tid');
      });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.hash = '#/term/' + g.getAttribute('data-tid'); }
      });
    });
  };

  JQ.VIEWS.termDetail = function (tid) {
    var view = JQ.$('#view');
    var t = JQ.DATA.termById(tid);
    if (!t) {
      view.innerHTML = JQ.HEADER('节气详情', '', true) +
        '<div class="wrap"><div class="card state-box"><div class="big">🗓</div><div>没有找到该节气。</div>' +
        '<a class="btn btn-primary" href="#/term">回节气百科</a></div></div>';
      return;
    }

    /* 该节气在各覆盖年份的交节时刻 */
    var onsetRows = '';
    Object.keys(JQ.DATA.ONSETS).forEach(function (y) {
      var str = JQ.DATA.ONSETS[y][t.id];
      if (str) {
        var verifiedYear = ['2026', '2027', '2028'].indexOf(y) >= 0;
        onsetRows += '<div class="ing-row"><span>' + y + ' 年 <small class="badge ' + (verifiedYear ? 'badge-green' : 'badge-demo') + '">' + (verifiedYear ? '已对照' : '待核验') + '</small></span><span class="muted">' +
          JQ.fmtMD(str) + ' ' + JQ.fmtTime(str) + '</span></div>';
      }
    });

    var isFav = JQ.FAV.isFav('term', t.id);
    var hou = t.hou.map(function (h, i) {
      var ex = t.houEx ? t.houEx[i] : '';
      return '<div class="hou-row"><div class="hou-i">' + ['初', '二', '三'][i] + '</div>' +
        '<div style="align-self:center;min-width:0"><div class="serif" style="font-size:16px;letter-spacing:.06em">' + JQ.esc(h) + '</div>' +
        (ex ? '<div class="small muted">' + JQ.esc(ex) + '</div>' : '') + '</div></div>';
    }).join('');

    view.innerHTML =
      JQ.HEADER(t.name + ' · 节气详情',
        '<button class="btn btn-sm ' + (isFav ? 'btn-warm' : 'btn-ghost') + '" id="fav-btn">' + (isFav ? '★ 已收藏' : '☆ 收藏') + '</button>',
        true) +
      '<div class="wrap">' +
      '<div style="--c1:' + (t.c || 'var(--green)') + '">' +

      '<div class="home-hero" style="padding-top:16px">' +
      '<span class="hero-deco l" aria-hidden="true">' + JQ.esc(t.season) + '之月</span>' +
      '<span class="hero-deco r" aria-hidden="true">月令七十二候</span>' +
      '<div class="moongate">' + (JQ.SEASONAL ? JQ.SEASONAL.icon(t.id) : '<svg viewBox="0 0 400 400" role="img" aria-label="' + JQ.esc(t.name) + '意象">' + JQ.moongateSVG(t) + '</svg>') + '</div>' +
      '<div class="hero-kicker">第' + CN[t.seq - 1] + '气 · ' + JQ.esc(t.season) + '季</div>' +
      '<h2 class="hero-name" style="font-size:46px">' + JQ.esc(t.name) + '</h2>' +
      '<div class="hero-poem">' + JQ.esc(t.e || '') + '</div>' +
      '</div>' +

      (JQ.SEASONAL ? JQ.SEASONAL.card(t) : '') +

      '<div class="card" data-reveal><h2>节气释义 <span class="badge badge-demo">待核验</span></h2>' +
      (t.mean ? '<div style="font-size:14px;line-height:1.95">' + JQ.esc(t.mean) + '</div>' : '<div class="muted small">整理中</div>') +
      (t.klass ? '<hr class="divider"><div class="klass-quote">' + JQ.esc(t.klass) + '</div>' : '') +
      '</div>' +

      '<div class="card" data-reveal><h2>物候三候</h2>' + hou +
      '<div class="small muted" style="margin-top:6px">整理自《月令七十二候集解》（演示数据 · 待核验）</div></div>' +

      '<div class="card" data-reveal><div class="zone-title">传统民俗</div>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(t.food) + '</div>' +
      '<div class="zone-title">传统宜食说法 · 待核验</div>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(t.yi) + '</div>' +
      (t.poem
        ? '<div class="zone-title">诗词</div><div class="poem">' + JQ.esc(t.poem.text) +
        '<div class="small muted" style="margin-top:4px;letter-spacing:.1em">—— ' + JQ.esc(t.poem.from) + '</div></div>'
        : '<div class="zone-title">诗词</div><div class="muted small" style="padding:10px 0">📜 诗词整理中，上线前须经核验。</div>') +
      '</div>' +

      (JQ.SEASONAL ? '' : '<div class="card" data-reveal><div class="zone-title warm">现代营养视角（与民俗分区）</div>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(t.nutrition) + '</div>' +
      '<div class="small muted" style="margin-top:6px">以上为一般性提示，不构成医疗建议，不作疗效承诺。</div></div>') +

      '<div class="card" data-reveal><h2>历年交节时刻（北京时间）</h2>' + onsetRows +
      '<div class="small muted" style="margin-top:8px">2026–2028 年已对照<a href="https://www.hko.gov.hk/sc/gts/astronomy/Solar_Term.htm" target="_blank" rel="noopener noreferrer">香港天文台原表</a>；2029 年保留旧资料，待核验。</div>' +
      '<div class="small muted" style="margin-top:6px">未列年份的数据尚未收录，不做外推。</div></div>' +

      '</div>' +
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

    /* 重绘后重新激活滚动显现（收藏操作会触发整页重绘） */
    if (JQ.ROUTER && JQ.ROUTER.observeReveals) { JQ.ROUTER.observeReveals(); }
    if (JQ.SEASONAL) { JQ.SEASONAL.mount(view); }
  };
})();
