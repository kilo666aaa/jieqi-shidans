const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

function journal(favorites, checkins) {
  const view = { innerHTML: '' };
  const context = { console };
  context.window = context;
  vm.createContext(context);
  for (const name of ['data_terms', 'data_recipes_spring', 'data_recipes_summer', 'data_recipes_autumn', 'data_recipes_winter', 'iconography', 'recipe_photos', 'view_me']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8'), context);
  }
  const q = context.JQ;
  q.$ = selector => selector === '#view' ? view : null;
  q.HEADER = title => '<h1>' + title + '</h1>';
  q.esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  q.STORE = { KEYS: { SESSION: 'session' }, get: (key, fallback) => fallback };
  q.PREFS = { get: () => ({ provided: false }) };
  q.FAV = { list: () => favorites, checkins: () => checkins };
  q.PHOTOS.mount = () => {};
  q.VIEWS.me();
  return { html: view.innerHTML, icons: q.ICONS };
}

test('journal counts unique recipe terms from real checkins and ignores stale or unrelated records', () => {
  const result = journal([], [
    { oid: 'recipe:ld1' }, { oid: 'recipe:ld2' }, { oid: 'recipe:ld1' },
    { oid: 'recipe:dz1' }, { oid: 'term:lichun' }, { oid: 'recipe:removed' }, {}
  ]);
  assert.match(result.html, /<b>2<\/b><span>\/ 24<\/span>/);
  assert.equal((result.html.match(/footprint-stamp is-tasted/g) || []).length, 2);
  assert.equal((result.html.match(/class="footprint-stamp/g) || []).length, 24);
  assert.match(result.html, /立冬：已打卡/);
  assert.match(result.html, /冬至：已打卡/);
  assert.match(result.html, /立春：尚未打卡/);
});

test('recent recipes use current valid records, sort by saved time, and keep at most two', () => {
  const { html } = journal([
    { type: 'recipe', oid: 'ld1', at: 1 }, { type: 'answer', oid: 'answer', at: 5 },
    { type: 'recipe', oid: 'removed', at: 6 }, { type: 'recipe', oid: 'dz1', at: 3 },
    { type: 'recipe', oid: 'cf4', at: 4 }
  ], []);
  assert.equal((html.match(/class="recent-recipe"/g) || []).length, 2);
  assert.ok(html.indexOf('href="#/recipe/cf4"') < html.indexOf('href="#/recipe/dz1"'));
  assert.doesNotMatch(html, /href="#\/recipe\/ld1"/);
  assert.match(html, /<b>0<\/b><span>\/ 24<\/span>/);
  const empty = journal([], []).html;
  assert.match(empty, /去选一道菜/);
  assert.doesNotMatch(empty, /class="recent-recipe"/);
});

test('every redesigned icon has a matching local export', () => {
  const { icons } = journal([], []);
  for (const id of icons.termIds) assert.equal(fs.readFileSync(path.join(root, 'assets/seasonal/icons', id + '.svg'), 'utf8'), icons.term(id));
  for (const name of icons.uiNames) {
    for (const active of [false, true]) {
      assert.equal(fs.readFileSync(path.join(root, 'assets/icons', name + (active ? '-on' : '') + '.svg'), 'utf8'), icons.ui(name, { color: active ? '#355E50' : '#817D73' }));
    }
  }
});
