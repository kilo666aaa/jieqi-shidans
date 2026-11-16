/* 卡片悬停：局部追光、图片轻推。触摸屏保留原操作，低动态偏好使用静态反馈。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var active = null;

  function dispose() {
    if (!active) { return; }
    active.fine.removeEventListener('change', active.refresh);
    active.reduce.removeEventListener('change', active.refresh);
    active.bindings.forEach(function (binding) {
      cancelAnimationFrame(binding.frame);
      binding.node.removeEventListener('pointermove', binding.move);
      binding.node.removeEventListener('pointerleave', binding.leave);
      binding.node.removeAttribute('data-hover-fx');
      binding.node.style.removeProperty('--pointer-x');
      binding.node.style.removeProperty('--pointer-y');
    });
    active = null;
  }

  function mount(root) {
    dispose();
    if (!root) { return; }
    var state = {
      root: root,
      fine: window.matchMedia('(hover: hover) and (pointer: fine)'),
      reduce: window.matchMedia('(prefers-reduced-motion: reduce)'),
      bindings: []
    };
    active = state;
    state.refresh = function () { mount(state.root); };
    state.fine.addEventListener('change', state.refresh);
    state.reduce.addEventListener('change', state.refresh);
    if (!state.fine.matches || state.reduce.matches) { return; }
    root.querySelectorAll('.dish-carousel .dish-card, .term-cell, .recent-recipe').forEach(function (node) {
      var binding = { node: node, frame: 0, x: 50, y: 50 };
      binding.move = function (event) {
        var rect = node.getBoundingClientRect();
        binding.x = 100 * (event.clientX - rect.left) / rect.width;
        binding.y = 100 * (event.clientY - rect.top) / rect.height;
        if (binding.frame) { return; }
        binding.frame = requestAnimationFrame(function () {
          binding.frame = 0;
          node.style.setProperty('--pointer-x', binding.x.toFixed(1) + '%');
          node.style.setProperty('--pointer-y', binding.y.toFixed(1) + '%');
        });
      };
      binding.leave = function () {
        cancelAnimationFrame(binding.frame);
        binding.frame = 0;
        node.style.removeProperty('--pointer-x');
        node.style.removeProperty('--pointer-y');
      };
      node.setAttribute('data-hover-fx', '');
      node.addEventListener('pointermove', binding.move, { passive: true });
      node.addEventListener('pointerleave', binding.leave);
      state.bindings.push(binding);
    });
  }
  JQ.HOVER = { mount: mount, dispose: dispose };
})();
