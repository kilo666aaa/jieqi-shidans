/* 节气食单 · 视图：今日食单（首页，默认落地页）
   首页不等待 AI：本地已审核内容 → 硬过滤 → 软排序 → 展示 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  JQ.VIEWS.home = function () {
    var view = JQ.$('#view');
    var disp = JQ.SOLAR.displayTerm();
    var prefs = JQ.PREFS.get();
    var aState = JQ.PREFS.allergenState();

    /* 节气定位失败（超出交节数据覆盖）：诚实提示，不伪造 */
    if (!disp.term) {
      view.innerHTML =
        JQ.HEADER('节气食单', '') +
        '<div class="wrap">' +
        '<div class="card"><div class="state-box"><div class="big">🗓️</div>' +
        '<div>' + JQ.esc(disp.error || '当前年份交节数据不可用。') + '</div>' +
        '<div class="small muted" style="margin-top:6px">你可以从节气百科手动浏览任意节气的内容。</div>' +
        '<button class="btn btn-primary" onclick="location.hash=\'#/term\'">去节气百科</button></div></div>' +
        '</div>';
      return;
    }

    var term = disp.term;
    var ranked = JQ.PREFS.rankTermRecipes(term.id);
    var picks = JQ.PREFS.picksFor(term.id);

    /* 顶部浏览提示（非当前节气时） */
    var browseHtml = '';
    if (disp.browsing) {
      browseHtml =
        '<div class="browse-banner">🔖 正在浏览：<b>' + JQ.esc(term.name) + '</b>' +
        '<button class="btn btn-sm btn-warm" id="back-to-now">回到当前节气</button></div>';
    }

    /* 过敏提示（未提供 ≠ 无过敏） */
    var allergenNotice = '';
    if (aState === 'unfilled') {
      allergenNotice =
        '<div class="notice-amber">🧾 你还未填写过敏信息（未填写不等于无过敏）。本页已标注每道菜的过敏成分，' +
        '请自行核对；可在<a href="#/me/pref"><b>我的偏好</b></a>中填写后自动过滤。</div>';
    } else if (aState === 'unfilled' && prefs.allergenUnsure) {
      allergenNotice = '';
    }
    if (prefs.provided && prefs.allergenUnsure) {
      allergenNotice =
        '<div class="notice-amber">❓ 你标注了「不确定」过敏原：无法自动过滤，请点开每道菜的「过敏成分标注」自行核对。</div>';
    } else if (prefs.provided && prefs.allergenOther) {
      allergenNotice =
        '<div class="notice-amber">🧾 你标注了「其他」过敏原：请核对每道菜的成分标注；具体过敏项可在<a href="#/me/pref"><b>我的偏好</b></a>补充。</div>';
    }

    /* 推荐区 */
    var dishesHtml = '';
    if (!picks.list.length) {
      var why = ranked.blockedCount
        ? '本节气候选菜共 ' + ranked.all.length + ' 道，其中 ' + ranked.blockedCount + ' 道因命中你的过敏硬限制被过滤，剩余 0 道。'
        : '本节气候选菜暂未收录。';
      dishesHtml =
        '<div class="card"><div class="state-box"><div class="big">🥣</div>' +
        '<div><b>暂无可推荐的菜品</b></div>' +
        '<div class="small muted" style="margin-top:6px;line-height:1.8">' + JQ.esc(why) + '<br>过敏限制不会被放宽以凑数。你可以在 AI 问答中让助手基于可用食材给替代思路，或到节气百科看看相邻节气。</div>' +
        '<a class="btn btn-ghost" href="#/ask">去问 AI 替代方案</a></div></div>';
    } else {
      dishesHtml = '<div class="card"><div style="display:flex;align-items:center;margin-bottom:4px">' +
        '<h2 style="flex:1">今日推荐 <span class="muted small">（候选池 ' + picks.poolSize + ' 道）</span></h2>' +
        '<button class="btn btn-sm btn-plain" id="rotate-btn">🔄 换一换</button></div>';
      picks.list.forEach(function (r) {
        var tagHtml = r.allergens.map(function (a) {
          return '<span class="badge badge-red">' + JQ.esc(JQ.DATA.ALLERGEN_NAMES[a]) + '</span>';
        }).join('');
        if (r.scenes.indexOf('canteen') >= 0) { tagHtml += '<span class="badge badge-blue">食堂可点</span>'; }
        if (r.scenes.indexOf('takeout') >= 0) { tagHtml += '<span class="badge badge-gray">外卖友好</span>'; }
        if (r.time) { tagHtml += '<span class="badge badge-gray">' + r.time + ' 分钟</span>'; }
        dishesHtml +=
          '<div class="dish-card" data-rid="' + JQ.esc(r.id) + '">' +
          '<div class="d-emoji" aria-hidden="true">' + JQ.esc(r.emoji) + '</div>' +
          '<div class="d-main"><div class="d-name">' + JQ.esc(r.name) + '</div>' +
          '<div class="d-meta">' + JQ.esc(r.servings) + ' · ' + JQ.esc(r.reason).slice(0, 34) + '…</div>' +
          '<div class="d-tags">' + tagHtml + '</div></div>' +
          '<div class="d-go">›</div></div>';
      });
      if (picks.poolSize <= 3) {
        dishesHtml += '<div class="small muted" style="padding-top:8px">候选池仅有 ' + picks.poolSize + ' 道（不放宽过敏限制补足），换一换将循环推荐。</div>';
      }
      dishesHtml += '</div>';
    }

    /* 软偏好差异说明 */
    var notesHtml = (ranked.notes || []).map(function (n) {
      return '<div class="notice-blue">' + JQ.esc(n) + '</div>';
    }).join('');

    /* 被过滤数量说明（诚实呈现硬过滤结果；不列出菜品名，页面不出现过敏菜品字样） */
    if (ranked.blockedCount > 0 && aState === 'specific') {
      notesHtml += '<div class="notice-green">🛡️ 已按你的过敏硬限制隐去 ' + ranked.blockedCount + ' 道菜品，换一换也只在剩余候选池内轮换，不会放宽。</div>';
    }

    /* 交节信息 */
    var cur = JQ.SOLAR.current();
    var onsetLine = '';
    if (disp.browsing) {
      onsetLine = '节气百科 · ' + JQ.esc(term.season) + '季第 ' + ((term.seq - 1) % 6 + 1) + ' 个节气';
    } else if (cur.ok) {
      onsetLine = '今年交节：' + JQ.fmtMD(cur.onset) + ' ' + JQ.fmtTime(cur.onset) +
        ' · 第 ' + (JQ.SOLAR.dayOfTerm() || '?') + ' 天';
    }

    view.innerHTML =
      JQ.HEADER('节气食单',
        '<button class="btn btn-sm btn-ghost" id="home-share" aria-label="复制本页链接">🔗 分享</button>') +
      '<div class="wrap">' +
      browseHtml +
      '<div class="term-hero">' +
      '<div class="t-seq">二十四节气 · 第 ' + term.seq + ' 个</div>' +
      '<h2 class="serif">' + JQ.esc(term.name) + '</h2>' +
      '<div class="t-sub">' + JQ.esc(onsetLine) + '</div>' +
      '<div class="t-actions"><span class="chip">' + JQ.esc(term.season) + '</span>' +
      '<a class="chip" href="#/term/' + term.id + '">📖 节气百科</a>' +
      '<a class="chip" href="#/ask">💬 问 AI</a></div>' +
      '</div>' +
      '<div class="notice-amber"><span class="badge badge-demo">演示数据</span> 食单与节气内容为课程演示数据（待小组核验），正式内容以人工审核为准。</div>' +
      allergenNotice +
      '<div class="card"><h2>宜食方向</h2><div style="font-size:14px;line-height:1.8">' + JQ.esc(term.yi) + '</div></div>' +
      dishesHtml +
      notesHtml +
      '<div class="card"><h2>文化解说 <span class="badge badge-demo">待核验</span></h2>' +
      '<div style="font-size:14px;line-height:1.9">' + JQ.esc(term.food) + '</div>' +
      (term.poem
        ? '<hr class="divider"><div class="poem serif">' + JQ.esc(term.poem.text) +
        '<div class="small muted" style="margin-top:4px">—— ' + JQ.esc(term.poem.from) + '</div></div>'
        : '<hr class="divider"><div class="muted small">诗词整理中</div>') +
      '</div>' +
      '<div style="text-align:center" class="muted small">— 《论语·乡党》不时，不食 —</div>' +
      '</div>';

    /* 事件绑定 */
    var shareBtn = JQ.$('#home-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var link = JQ.SOLAR.shareLink(term.id);
        JQ.copyText(link);
        JQ.toast('链接不含任何个人偏好', '', 3000);
      });
    }
    var backNow = JQ.$('#back-to-now');
    if (backNow) {
      backNow.addEventListener('click', function () {
        JQ.SOLAR.browseTerm = null;
        JQ.ROUTER.go('#/home');
      });
    }
    var rot = JQ.$('#rotate-btn');
    if (rot) {
      rot.addEventListener('click', function () {
        JQ.PREFS.rotate(term.id);
        JQ.VIEWS.home();
        JQ.toast('已在候选池内换一批（共 ' + picks.poolSize + ' 道，不放宽过敏限制）');
      });
    }
    JQ.$$('.dish-card', view).forEach(function (el) {
      el.addEventListener('click', function () {
        location.hash = '#/recipe/' + el.getAttribute('data-rid');
      });
    });
  };
})();
