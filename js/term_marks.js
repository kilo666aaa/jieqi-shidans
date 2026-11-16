/* 节气徽记统一由一碗四时图标系统绘制；保留已有调用接口。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.marksSVG = function (term, options) {
    if (!term) { return ''; }
    options = options || {};
    return JQ.ICONS.term(typeof term === 'string' ? term : term.id, {
      className: 'term-mark' + (options.cls ? ' ' + options.cls : ''),
      current: options.current
    });
  };
})();
