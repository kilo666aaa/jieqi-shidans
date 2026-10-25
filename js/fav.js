/* 节气食单 · 收藏与打卡（两种独立数据）
   - 收藏三类：recipe 菜品 / answer AI 答案 / term 节气知识；保存类型+稳定ID+快照+时间，去重、可取消、失败如实提示
   - 打卡：对象 + 北京日期；同日同对象防重复；可撤销；必须用户主动确认
   - 取消收藏不影响打卡 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var F = {};
  JQ.FAV = F;

  /* ---------- 收藏 ---------- */
  F.list = function () { return JQ.STORE.get(JQ.STORE.KEYS.FAVS, []); };

  F.isFav = function (type, oid) {
    return F.list().some(function (f) { return f.type === type && f.oid === oid; });
  };

  /* 返回 true=已收藏 / false=已取消 / null=保存失败（必须提示） */
  F.toggle = function (type, oid, snapshot) {
    var list = F.list();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].type === type && list[i].oid === oid) { idx = i; break; }
    }
    if (idx >= 0) {
      list.splice(idx, 1);
      if (!JQ.STORE.set(JQ.STORE.KEYS.FAVS, list)) {
        JQ.toast('取消收藏失败：本机存储不可用', 'err');
        return null;
      }
      return false;
    }
    list.unshift({
      type: type, oid: oid,
      snap: { title: snapshot.title, sub: snapshot.sub || '' },
      at: Date.now()
    });
    if (!JQ.STORE.set(JQ.STORE.KEYS.FAVS, list)) {
      JQ.toast('收藏失败：本机存储不可用或已满', 'err');
      return null;
    }
    return true;
  };

  F.byType = function (type) { return F.list().filter(function (f) { return f.type === type; }); };

  /* ---------- 打卡 ---------- */
  F.checkins = function () { return JQ.STORE.get(JQ.STORE.KEYS.CHECKINS, []); };

  F.isCheckedToday = function (oid) {
    var today = JQ.bjDateStr();
    return F.checkins().some(function (c) { return c.oid === oid && c.date === today; });
  };

  /* 打卡（用户主动触发）：同日同对象防重复 */
  F.checkin = function (oid, title) {
    var today = JQ.bjDateStr();
    var list = F.checkins();
    if (list.some(function (c) { return c.oid === oid && c.date === today; })) {
      return { ok: false, dup: true };
    }
    list.unshift({ oid: oid, title: title, date: today, at: Date.now() });
    if (!JQ.STORE.set(JQ.STORE.KEYS.CHECKINS, list)) {
      return { ok: false, dup: false, saveFail: true };
    }
    return { ok: true };
  };

  /* 撤销指定打卡（仅支持当日撤销入口） */
  F.undoCheckin = function (oid, date) {
    var list = F.checkins();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].oid === oid && list[i].date === date) { idx = i; break; }
    }
    if (idx < 0) { return { ok: false }; }
    list.splice(idx, 1);
    if (!JQ.STORE.set(JQ.STORE.KEYS.CHECKINS, list)) {
      return { ok: false, saveFail: true };
    }
    return { ok: true };
  };

  /* ---------- 收藏菜品加回食单（按最新偏好复检） ----------
     返回：
     {ok:true}            可加回，调用方让用户选择替换对象
     {ok:false,reason}    冲突拒绝（含原因文案） */
  F.recheckForAdd = function (recipeId) {
    var r = JQ.DATA.recipeById(recipeId);
    if (!r) { return { ok: false, reason: '该菜品内容已更新或下线，暂时无法加回。' }; }
    var hit = JQ.PREFS.recipeBlocked(r);
    if (hit) {
      return {
        ok: false,
        reason: '无法加回：「' + r.name + '」含「' + JQ.DATA.ALLERGEN_NAMES[hit] +
          '」，与你当前设置的过敏硬限制冲突。可先在「我的偏好」核对，但过敏限制不会被放宽。'
      };
    }
    return { ok: true, recipe: r };
  };
})();
