const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function environment(finePointer = true) {
  const frames = new Map();
  const handlers = new Map();
  const styles = new Map();
  const attributes = new Map();
  const media = matches => ({ matches, listeners: new Set(),
    addEventListener(type, callback) { this.listeners.add(callback); },
    removeEventListener(type, callback) { this.listeners.delete(callback); }
  });
  const fine = media(finePointer);
  const reduced = media(false);
  const node = {
    style: { setProperty: (name, value) => styles.set(name, value), removeProperty: name => styles.delete(name) },
    getBoundingClientRect: () => ({ left: 100, top: 100, width: 200, height: 100 }),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    addEventListener: (name, callback) => handlers.set(name, callback),
    removeEventListener: name => handlers.delete(name)
  };
  let frameId = 0;
  const context = {
    matchMedia: query => query.includes('pointer: fine') ? fine : reduced,
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id)
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/hover_fx.js'), 'utf8'), context);
  return { fx: context.JQ.HOVER, root: { querySelectorAll: () => [node] }, frames, handlers, styles, attributes, fine, reduced };
}

test('pointer lighting coalesces movement and releases frames, handlers and styles on teardown', () => {
  const app = environment();
  app.fx.mount(app.root);
  app.handlers.get('pointermove')({ clientX: 120, clientY: 125 });
  app.handlers.get('pointermove')({ clientX: 150, clientY: 175 });
  assert.equal(app.frames.size, 1);
  const [[id, callback]] = app.frames;
  app.frames.delete(id); callback();
  assert.equal(app.styles.get('--pointer-x'), '25.0%');
  assert.equal(app.styles.get('--pointer-y'), '75.0%');
  app.fx.dispose();
  assert.equal(app.frames.size, 0);
  assert.equal(app.handlers.size, 0);
  assert.equal(app.styles.size, 0);
  assert.equal(app.fine.listeners.size, 0);
  assert.equal(app.reduced.listeners.size, 0);
});

test('touch pointers and changing reduced-motion preferences keep static cards', () => {
  const touch = environment(false);
  touch.fx.mount(touch.root);
  assert.equal(touch.handlers.size, 0);
  touch.fx.dispose();
  const desktop = environment();
  desktop.fx.mount(desktop.root);
  desktop.reduced.matches = true;
  for (const callback of [...desktop.reduced.listeners]) callback();
  assert.equal(desktop.handlers.size, 0);
  assert.equal(desktop.frames.size, 0);
  desktop.fx.dispose();
});
