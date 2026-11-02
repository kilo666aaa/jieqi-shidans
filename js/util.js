/* 节气食单 · 工具函数（全局命名空间 JQ） */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  JQ.$ = function (sel, root) { return (root || document).querySelector(sel); };
  JQ.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* HTML 转义，防止内容注入 */
  JQ.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* 北京时间（UTC+8）：返回用 getUTC* 读取即为北京墙上时钟的 Date */
  JQ.bjNow = function () {
    var d = new Date();
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 8 * 3600000);
  };
  JQ.bjDateStr = function () {
    var b = JQ.bjNow();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return b.getUTCFullYear() + '-' + p(b.getUTCMonth() + 1) + '-' + p(b.getUTCDate());
  };
  /* 'YYYY-MM-DD HH:mm'（北京时间）→ 时间戳 */
  JQ.bjParse = function (str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(str);
    if (!m) { m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) - 8 * 3600000 : NaN; }
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - 8 * 3600000;
  };
  JQ.fmtMD = function (str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
    return m ? (+m[2]) + '月' + (+m[3]) + '日' : str;
  };
  JQ.fmtTime = function (str) {
    var m = /(\d{2}):(\d{2})/.exec(str);
    return m ? m[1] + ':' + m[2] : '';
  };
  JQ.fmtDT = function (ts) {
    var d = new Date(ts + 8 * 3600000); // 用 UTC 读取 → 北京时钟
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes());
  };

  /* Toast：type = '' | 'ok' | 'err' */
  JQ.toast = function (text, type, ms) {
    var wrap = JQ.$('#toast-wrap');
    if (!wrap) { return; }
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = text;
    wrap.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 2600);
  };

  /* 底部抽屉模态：返回关闭函数
     opts: { title, body(html), actions:[{label,cls,onClick(返回 true 则关闭)}], onMask } */
  JQ.modal = function (opts) {
    var root = JQ.$('#modal-root');
    root.innerHTML = '';
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    var box = document.createElement('div');
    box.className = 'modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    var html = '<h3>' + JQ.esc(opts.title || '') + '</h3><div class="m-body">' + (opts.body || '') + '</div>';
    if (opts.actions && opts.actions.length) {
      html += '<div class="m-actions">';
      opts.actions.forEach(function (a, i) {
        html += '<button class="btn ' + (a.cls || 'btn-ghost') + '" data-mi="' + i + '">' + JQ.esc(a.label) + '</button>';
      });
      html += '</div>';
    }
    box.innerHTML = html;
    mask.appendChild(box);
    root.appendChild(mask);
    var closed = false;
    function close() {
      if (closed) { return; }
      closed = true;
      /* 仅当模态根里还是本弹窗时才清空，避免嵌套确认时误删新弹窗 */
      if (mask.parentNode === root) { root.innerHTML = ''; }
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') { close(); } }
    document.addEventListener('keydown', onKey);
    mask.addEventListener('click', function (e) {
      if (e.target === mask) { if (opts.onMask === 'keep') { return; } close(); }
    });
    JQ.$$('[data-mi]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = opts.actions[+btn.getAttribute('data-mi')];
        var r = a.onClick ? a.onClick() : true;
        if (r !== false) { close(); }
      });
    });
    return close;
  };

  JQ.confirm = function (title, body, okLabel, onOk, danger) {
    JQ.modal({
      title: title, body: '<div class="small" style="color:var(--ink-2)">' + body + '</div>',
      actions: [
        { label: '取消', cls: 'btn-ghost' },
        { label: okLabel || '确定', cls: danger ? 'btn-danger' : 'btn-primary', onClick: onOk }
      ]
    });
  };

  /* 复制文本（降级方案诚实反馈） */
  JQ.copyText = function (text) {
    function fb() {
      JQ.modal({
        title: '复制链接',
        body: '<div class="small muted" style="margin-bottom:8px">浏览器未开放自动复制，请长按/手动复制：</div><input class="input" readonly value="' + JQ.esc(text) + '">',
        actions: [{ label: '知道了', cls: 'btn-primary' }]
      });
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { JQ.toast('链接已复制', 'ok'); }, fb);
    } else { fb(); }
  };

  /* 简易 SHA-256（本机账号口令散列用，非安全传输） */
  JQ.sha256 = function (text) {
    function rr(v, a, b) { return (v >>> a) | (v << (32 - a)); }
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var utf8 = unescape(encodeURIComponent(text));
    var bytes = []; for (var i = 0; i < utf8.length; i++) { bytes.push(utf8.charCodeAt(i)); }
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) { bytes.push(0); }
    for (i = 7; i >= 0; i--) { bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff); }
    for (i = 0; i < bytes.length; i += 64) {
      var w = new Array(64);
      for (var j = 0; j < 16; j++) {
        w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
      }
      for (j = 16; j < 64; j++) {
        var s0 = rr(w[j - 15], 7) ^ rr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        var s1 = rr(w[j - 2], 17) ^ rr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (j = 0; j < 64; j++) {
        var S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[j] + w[j]) | 0;
        var S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) { out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8); }
    return out;
  };
})();
