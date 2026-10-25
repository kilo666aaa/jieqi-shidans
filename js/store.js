/* 节气食单 · 本机存储层
   - 偏好 / 收藏 / 打卡 / 账号 / AI 配置全部保存在当前浏览器（localStorage）
   - 任何保存失败必须如实上抛，不得假成功
   - 聊天记录只存会话内存（JQ.CHAT），刷新即失 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var STORE = {};
  JQ.STORE = STORE;
  var PREFIX = 'jqsq.';

  /* 探测 localStorage 是否可用（隐私模式/禁用时给出诚实提示） */
  var available = (function () {
    try {
      var k = PREFIX + '__probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  STORE.available = function () { return available; };

  STORE.get = function (key, fallback) {
    if (!available) { return fallback; }
    try {
      var raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.warn('[store] 读取失败', key, e);
      return fallback;
    }
  };

  /* 返回 true=成功；false=失败（调用方必须向用户如实提示） */
  STORE.set = function (key, value) {
    if (!available) { return false; }
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[store] 写入失败', key, e);
      return false;
    }
  };

  STORE.remove = function (key) {
    if (!available) { return false; }
    try { localStorage.removeItem(PREFIX + key); return true; } catch (e) { return false; }
  };

  /* 清空本站全部本机数据（保留探测键以外的所有 jqsq.* 键全删） */
  STORE.clearAll = function () {
    if (!available) { return false; }
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) { keys.push(k); }
      }
      keys.forEach(function (k) { localStorage.removeItem(k); });
      return true;
    } catch (e) { return false; }
  };

  /* ---------- 应用级存储键 ---------- */
  STORE.KEYS = {
    PREFS: 'prefs',            // 偏好画像
    FAVS: 'favs',              // 收藏列表
    CHECKINS: 'checkins',      // 打卡列表
    ACCOUNTS: 'accounts',      // 本机账号（含散列口令）
    SESSION: 'session',        // 登录会话
    AI_CFG: 'ai.config',       // AI 服务配置（密钥仅存本机）
    ONBOARDED: 'onboarded'     // 是否完成/跳过首次引导
  };

  /* ---------- 会话内存（刷新即失） ---------- */
  JQ.CHAT = { messages: [], contextRecipe: null }; // AI 聊天记录：只存内存
  JQ.PICKS = {}; // 每节气当前推荐位（含换一换轮换），会话级
})();
