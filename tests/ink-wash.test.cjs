const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function setup(reduced = false) {
  const target = () => ({ listeners: new Map(), addEventListener(n, f) { this.listeners.set(n, f); }, removeEventListener(n) { this.listeners.delete(n); } });
  const frames = new Map(); let id = 0, clock = 100;
  const draw = { fills: 0, setTransform() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, stroke() {}, save() {}, restore() {}, translate() {}, rotate() {}, ellipse() {}, arc() {}, fill() { this.fills++; }, createRadialGradient() { return { addColorStop() {} }; } };
  const canvases = [];
  const button = Object.assign(target(), { setAttribute() {}, textContent: '', disabled: false });
  const caption = { textContent: '' };
  let scope = { dataset: { inkSeason: '冬' }, querySelector: q => q.includes('toggle') ? button : caption, querySelectorAll: () => [] };
  const root = { querySelector: () => scope, querySelectorAll: () => [] };
  const media = Object.assign(target(), { matches: reduced });
  const document = Object.assign(target(), { hidden: false, body: { classList: { add() {}, remove() {} }, appendChild(c) { c.isConnected = true; canvases.push(c); } }, createElement() { return { dataset: {}, style: {}, setAttribute() {}, getContext: () => draw, remove() { this.isConnected = false; } }; } });
  const context = Object.assign(target(), { document, Math, performance: { now: () => clock }, innerWidth: 400, innerHeight: 850, devicePixelRatio: 3, matchMedia: q => q.includes('reduced-motion') ? media : { matches: false }, requestAnimationFrame(f) { frames.set(++id, f); return id; }, cancelAnimationFrame(n) { frames.delete(n); } });
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/ink_wash.js'), 'utf8'), context);
  const tick = ms => { clock += ms; const jobs = [...frames]; frames.clear(); for (const [, f] of jobs) f(clock); };
  return { fx: context.JQ.INK_WASH, context, document, frames, canvases, root, media, button, draw, tick, replaceScope() { scope = { ...scope }; } };
}

test('ink is input-driven, capped in resolution, settles to idle, and disposes every listener', () => {
  const app = setup();
  app.fx.mount(app.root);
  assert.equal(app.frames.size, 0);
  assert.equal(app.canvases[0].width, 600);
  app.context.listeners.get('pointermove')({ clientX: 100, clientY: 120, pointerType: 'mouse', target: null });
  assert.equal(app.frames.size, 1);
  app.tick(16);
  assert.ok(app.draw.fills > 0);
  app.tick(4000);
  assert.equal(app.frames.size, 0);
  app.fx.dispose();
  assert.equal(app.context.listeners.size, 0);
  assert.equal(app.document.listeners.size, 0);
  assert.equal(app.media.listeners.size, 0);
  assert.equal(app.button.listeners.size, 0);
  assert.equal(app.canvases.filter(c => c.isConnected).length, 0);
});

test('pause, hidden page and reduced motion stop drawing; remount never duplicates a canvas', () => {
  const app = setup(); app.fx.mount(app.root); app.fx.mount(app.root);
  assert.equal(app.canvases.length, 1);
  app.context.listeners.get('pointerdown')({ clientX: 80, clientY: 160, pointerType: 'touch', target: null });
  assert.equal(app.frames.size, 1);
  app.document.hidden = true; app.document.listeners.get('visibilitychange')();
  assert.equal(app.frames.size, 0);
  app.document.hidden = false; app.document.listeners.get('visibilitychange')();
  app.button.listeners.get('click')();
  app.context.listeners.get('pointermove')({ clientX: 100, clientY: 100, pointerType: 'mouse', target: null });
  assert.equal(app.frames.size, 0);
  app.button.listeners.get('click')();
  app.media.matches = true; app.media.listeners.get('change')();
  app.context.listeners.get('pointermove')({ clientX: 100, clientY: 100, pointerType: 'mouse', target: null });
  assert.equal(app.frames.size, 0);
  assert.equal(app.button.disabled, true);
  app.replaceScope(); app.fx.mount(app.root);
  assert.equal(app.canvases.filter(c => c.isConnected).length, 1);
  app.fx.dispose();
});
