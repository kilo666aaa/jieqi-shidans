/* 节气食单 · 视图：菜谱详情
   必备：食材分量/份数/分步做法/耗时/设备/过敏标注/关联节气/推荐理由/文化出处
   食堂或外卖场景显示选餐建议；刷新停留在本页（Hash 路由保证） */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  JQ.VIEWS.recipe = function (rid) {
    var view = JQ.$('#view');
    var r = JQ.DATA.recipeById(rid);
    if (!r) {
      view.innerHTML = JQ.HEADER('菜谱详情', '', true) +
        '<div class="wrap"><div class="card state-box"><div class="big">🍽️</div>' +
        '<div>没有找到这道菜（可能已下线或链接无效）。</div>' +
        '<a class="btn btn-primary" href="#/home">回今日食单</a></div></div>';
      return;
    }
    var term = JQ.DATA.termById(r.t);
    var prefs = JQ.PREFS.get();
    var blockedHit = JQ.PREFS.recipeBlocked(r);

    /* 场景建议：食堂/外卖优先给选餐建议，教程折叠 */
    var sceneTip = '';
    var userScene = prefs.scene;
    var needTip = userScene === 'canteen' || userScene === 'takeout';
    if (needTip) {
      var keyIng = r.ing.slice(0, 3).map(function (i) { return i[0]; }).join('、');
      sceneTip =
        '<div class="notice-blue">🍽️ <b>' + (userScene === 'canteen' ? '食堂选餐建议' : '外卖点单建议') +
        '：</b>找以「' + JQ.esc(keyIng) + '」为主料的窗口/商家，做法相近即可；本页做法供自己做饭时参考。</div>';
    }

    var allergenHtml = r.allergens.length
      ? r.allergens.map(function (a) {
        var isBlocked = blockedHit === a;
        return '<span class="badge ' + (isBlocked ? 'badge-red' : 'badge-demo') + '">' +
          JQ.esc(JQ.DATA.ALLERGEN_NAMES[a]) + (isBlocked ? ' · 命中你的过敏' : '') + '</span>';
      }).join('')
      : '<span class="badge badge-green">无常见过敏原标注</span>';

    var blockedWarn = blockedHit
      ? '<div class="notice-amber" style="background:var(--red-bg);color:#7c3030;border-color:#d9a0a0">⚠️ 这道菜含「' +
        JQ.esc(JQ.DATA.ALLERGEN_NAMES[blockedHit]) + '」，与你的过敏硬限制冲突：不会被推荐、不可加回食单。仅为查看内容。</div>'
      : '';

    var isFav = JQ.FAV.isFav('recipe', r.id);
    var checkedToday = JQ.FAV.isCheckedToday('recipe:' + r.id);

    var ingHtml = r.ing.map(function (i) {
      return '<div class="ing-row"><span>' + JQ.esc(i[0]) + '</span><span class="muted">' + JQ.esc(i[1]) + '</span></div>';
    }).join('');

    var stepsHtml = r.steps.map(function (s, i) {
      return '<div class="step-li"><div class="s-i">' + (i + 1) + '</div><div style="flex:1">' + JQ.esc(s) + '</div></div>';
    }).join('');

    view.innerHTML =
      JQ.HEADER(r.name,
        '<button class="btn btn-sm ' + (isFav ? 'btn-warm' : 'btn-ghost') + '" id="fav-btn">' + (isFav ? '★ 已收藏' : '☆ 收藏') + '</button>',
        true) +
      '<div class="wrap">' +
      '<div class="card" style="text-align:center">' +
      '<div style="font-size:52px;margin:6px 0" aria-hidden="true">' + JQ.esc(r.emoji) + '</div>' +
      '<h2 class="serif" style="font-size:20px">' + JQ.esc(r.name) + '</h2>' +
      '<div class="muted small">' +
      (term ? '<a href="#/term/' + term.id + '">' + JQ.esc(term.name) + '</a> · ' : '') +
      '<span class="badge badge-demo">演示数据 · 待核验</span></div>' +
      '<div class="allergen-tags" style="justify-content:center">' + allergenHtml + '</div>' +
      '</div>' +
      blockedWarn + sceneTip +
      '<div class="meta-grid">' +
      '<div class="mg"><b>' + (r.time ? r.time + ' 分钟' : '即食') + '</b><span>预计耗时</span></div>' +
      '<div class="mg"><b>' + JQ.esc(r.servings) + '</b><span>份数</span></div>' +
      '<div class="mg"><b>' + (r.equip.length ? JQ.esc(r.equip.join('/')) : '无需设备') + '</b><span>所需设备</span></div>' +
      '</div>' +
      '<div class="card"><h2>食材与分量</h2>' + ingHtml + '</div>' +
      '<div class="card"><h2>做法步骤</h2>' + stepsHtml +
      (r.equip.length ? '<div class="small muted">需要：' + JQ.esc(r.equip.join('、')) + '</div>' : '') +
      '</div>' +
      '<div class="card"><h2>为什么推荐</h2><div style="font-size:14px;line-height:1.8">' + JQ.esc(r.reason) + '</div>' +
      '<hr class="divider"><div class="small" style="color:var(--ink-2)"><b>文化出处：</b>' + JQ.esc(r.source) + '</div></div>' +
      '<div style="display:flex;gap:10px;margin:4px 0 8px">' +
      '<button class="btn btn-primary" style="flex:1" id="ask-btn">💬 问 AI 追问</button>' +
      '<button class="btn ' + (checkedToday ? 'btn-ghost' : 'btn-plain') + '" style="flex:1" id="checkin-btn">' +
      (checkedToday ? '✓ 今日已打卡' : '📷 打卡') + '</button>' +
      '</div>' +
      '<button class="btn btn-ghost btn-block" id="addback-btn">➕ 加回今日食单</button>' +
      '<div style="height:12px"></div>' +
      '</div>';

    /* 收藏（失败如实提示在 fav.js 内） */
    JQ.$('#fav-btn').addEventListener('click', function () {
      var res = JQ.FAV.toggle('recipe', r.id, { title: r.name, sub: (term ? term.name + ' · ' : '') + r.servings });
      if (res === true) { JQ.toast('已收藏到「我的收藏」', 'ok'); }
      if (res === false) { JQ.toast('已取消收藏（打卡记录不受影响）'); }
      JQ.VIEWS.recipe(rid);
    });

    /* 打卡：用户主动确认 */
    JQ.$('#checkin-btn').addEventListener('click', function () {
      if (JQ.FAV.isCheckedToday('recipe:' + r.id)) {
        JQ.confirm('撤销今日打卡？', '将删除「' + JQ.esc(r.name) + '」今天的打卡记录。', '撤销', function () {
          var res = JQ.FAV.undoCheckin('recipe:' + r.id, JQ.bjDateStr());
          if (res.ok) { JQ.toast('已撤销今日打卡'); }
          else if (res.saveFail) { JQ.toast('撤销失败：本机存储不可用', 'err'); }
          else { JQ.toast('未找到可撤销的记录', 'err'); }
          JQ.VIEWS.recipe(rid);
        });
        return;
      }
      JQ.confirm('打卡「' + JQ.esc(r.name) + '」？', '按北京时间 ' + JQ.esc(JQ.bjDateStr()) + ' 记录，同一天同一道菜不会重复记录。', '打卡', function () {
        var res = JQ.FAV.checkin('recipe:' + r.id, r.name);
        if (res.ok) {
          JQ.toast('打卡成功', 'ok');
          /* 盖章动画（朱砂印） */
          var stamp = document.createElement('div');
          stamp.className = 'seal-stamp';
          stamp.setAttribute('aria-hidden', 'true');
          stamp.textContent = '已尝';
          document.body.appendChild(stamp);
          setTimeout(function () { stamp.remove(); }, 1200);
        }
        else if (res.dup) { JQ.toast('今天已打过卡，不新增记录'); }
        else { JQ.toast('打卡保存失败：本机存储不可用或已满', 'err'); }
        JQ.VIEWS.recipe(rid);
      });
    });

    /* 问 AI：携带本菜谱上下文 */
    JQ.$('#ask-btn').addEventListener('click', function () {
      JQ.CHAT.contextRecipe = r.id;
      location.hash = '#/ask';
    });

    /* 加回食单：按最新偏好复检 → 用户选择替换对象 → 冲突拒绝并说明 */
    JQ.$('#addback-btn').addEventListener('click', function () {
      var check = JQ.FAV.recheckForAdd(r.id);
      if (!check.ok) {
        JQ.modal({
          title: '无法加回', 
          body: '<div class="small" style="line-height:1.8;color:#7c3030">' + JQ.esc(check.reason) + '</div>',
          actions: [{ label: '知道了', cls: 'btn-primary' }]
        });
        return;
      }
      var disp = JQ.SOLAR.displayTerm();
      var termId = disp.term ? disp.term.id : r.t;
      var picks = JQ.PREFS.picksFor(termId);
      if (!picks.list.length) {
        JQ.toast('当前推荐位为空，刷新食单后可直接看到该菜', 'err');
        return;
      }
      if (picks.st.list.indexOf(r.id) >= 0) {
        JQ.toast('「' + r.name + '」已经在今日推荐位里了');
        return;
      }
      var bodyHtml = '<div class="small muted" style="margin-bottom:10px">选择要替换的推荐位（「' + JQ.esc(r.name) + '」将进入今日食单）：</div>' +
        picks.list.map(function (p, i) {
          return '<button class="me-item" data-replace="' + i + '"><span class="mi-emoji">' + JQ.esc(p.emoji) + '</span>' +
            '<span>' + JQ.esc(p.name) + '</span><span class="mi-arrow">替换 ›</span></button>';
        }).join('');
      JQ.modal({
        title: '加回今日食单',
        body: bodyHtml,
        actions: [{ label: '取消', cls: 'btn-ghost' }],
        onMask: 'keep'
      });
      JQ.$$('[data-replace]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = +btn.getAttribute('data-replace');
          picks.st.list[i] = r.id;
          JQ.$('#modal-root').innerHTML = '';
          JQ.toast('已加回今日食单（替换「' + picks.list[i].name + '」）', 'ok');
          location.hash = '#/home';
        });
      });
    });
  };
})();
