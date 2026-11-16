/* 节气食单 · 共享顶栏工具与节气搜索浮层
   首页 / AI 问答 / 节气百科共用：搜索按钮 + 设置按钮（右上角同位），
   搜索支持节气名 / 拼音 / 季节（中英文） */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var ICO_SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg>';
  var ICO_GEAR = '<svg class="ico-solid" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
  var ICO_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var SEASON_CN = { '春': 'Spring', '夏': 'Summer', '秋': 'Autumn', '冬': 'Winter' };

  /* 顶栏按钮组：搜索 + 设置（与首页右上角同款同位） */
  JQ.hdrTools = function (searchId, gearId) {
    return '<button class="hdr-icon" id="' + searchId + '" aria-label="搜索节气">' + ICO_SEARCH + '</button>' +
      '<button class="hdr-icon" id="' + gearId + '" aria-label="设置">' + ICO_GEAR + '</button>';
  };

  /* 搜索浮层 markup（每页插一份，浮层内 id 页面内唯一） */
  JQ.SEARCH = {
    html: function () {
      return '<div class="search-overlay" hidden>' +
        '<div class="search-panel">' +
        '<div class="search-row">' +
        '<svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg>' +
        '<input id="search-input" placeholder="搜节气，如：霜降 / shuangjiang / 冬" aria-label="搜索节气" autocomplete="off">' +
        '<button class="hdr-icon" id="search-close" aria-label="关闭搜索">' + ICO_CLOSE + '</button>' +
        '</div>' +
        '<div class="search-list" id="search-list"></div>' +
        '</div>' +
        '</div>';
    },

    /* 绑定：openBtn 为触发按钮元素 */
    bind: function (openBtn) {
      var ov = document.querySelector('.search-overlay');
      var inp = document.getElementById('search-input');
      var list = document.getElementById('search-list');
      if (!ov || !inp || !openBtn) { return; }

      function renderList(q) {
        q = (q || '').trim().toLowerCase();
        var hits = JQ.DATA.TERMS.filter(function (t) {
          return !q ||
            t.name.indexOf(q) >= 0 ||
            t.pinyin.indexOf(q) >= 0 ||
            (t.season || '').indexOf(q) >= 0 ||
            (SEASON_CN[t.season] || '').toLowerCase().indexOf(q) >= 0;
        });
        list.innerHTML = hits.length
          ? hits.map(function (t) {
            return '<div class="search-item" data-tid="' + t.id + '">' +
              '<span class="s-name">' + JQ.esc(t.name) + '</span>' +
              '<span class="s-pin">' + JQ.esc(t.pinyin) + '</span>' +
              '<span class="s-badge" data-season="' + t.season + '">' + t.season + '季</span>' +
              '</div>';
          }).join('')
          : '<div class="search-empty">没有匹配的节气——试试节气名（霜降）或拼音（shuangjiang）</div>';
      }

      function open() {
        ov.hidden = false;
        inp.value = '';
        renderList('');
        setTimeout(function () { inp.focus(); }, 60);
      }
      function close() { ov.hidden = true; }

      openBtn.addEventListener('click', open);
      document.getElementById('search-close').addEventListener('click', close);
      ov.addEventListener('click', function (e) { if (e.target === ov) { close(); } });
      inp.addEventListener('input', function () { renderList(inp.value); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
      list.addEventListener('click', function (e) {
        var item = e.target.closest ? e.target.closest('.search-item') : null;
        if (!item) { return; }
        close();
        location.hash = '#/term/' + item.getAttribute('data-tid');
      });
      /* ?search=<词>：截图/演示用，自动展开搜索浮层并填入关键词 */
      var sm = /[?&]search=([^&]*)/.exec(location.search);
      if (sm) {
        ov.hidden = false;
        inp.value = decodeURIComponent(sm[1]);
        renderList(inp.value);
      }
    }
  };
})();
