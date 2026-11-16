const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require('sharp');
const root = path.join(__dirname, '..');

test('generated set covers every term and 16 unique functional icons with alpha', async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/generated-icons.json')));
  const context = {};
  context.window = context;
  vm.createContext(context);
  for (const name of ['data_terms', 'generated_icon_assets', 'iconography']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8'), context);
  }
  assert.equal(Object.keys(manifest.terms).length, 24);
  assert.equal(Object.keys(manifest.ui).length, 16);
  assert.equal(new Set(manifest.images.map(item => item.sourceSha256)).size, 40);
  assert.equal(JSON.stringify(context.JQ.GENERATED_ICONS.terms), JSON.stringify(manifest.terms));
  assert.equal(JSON.stringify(context.JQ.GENERATED_ICONS.ui), JSON.stringify(manifest.ui));
  for (const id of context.JQ.ICONS.termIds) {
    assert.match(context.JQ.ICONS.term(id), new RegExp(manifest.terms[id]));
    assert.equal(context.JQ.ICONS.termImage(id), manifest.terms[id]);
  }
  for (const [id, file] of Object.entries(manifest.ui)) {
    assert.match(context.JQ.ICONS.ui(id, { active: false }), /icon-state-off/);
    assert.match(context.JQ.ICONS.ui(id, { active: true }), /icon-state-on/);
    assert.match(context.JQ.ICONS.ui(id), new RegExp(file));
    assert.match(context.JQ.ICONS.ui(id, { vector: true }), /^<svg/);
  }
  for (const image of manifest.images) {
    const metadata = await sharp(path.join(root, image.file)).metadata();
    assert.equal(metadata.width, 256);
    assert.equal(metadata.height, 256);
    assert.equal(metadata.hasAlpha, true);
  }
});

test('coursework includes sixteen complete pairs of transparent state exports', async () => {
  const directory = path.join(root, 'deliver/第三部分_功能图标');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, '图标清单.json')));
  assert.equal(manifest.count, 16);
  assert.equal(manifest.states, 32);
  for (const id of Object.keys(manifest.labels)) {
    const off = fs.readFileSync(path.join(directory, '单个图标', id + '_未选中.png'));
    const on = fs.readFileSync(path.join(directory, '单个图标', id + '_选中.png'));
    assert.notDeepEqual(off, on);
    assert.equal((await sharp(on).metadata()).hasAlpha, true);
    assert.equal((await sharp(off).metadata()).hasAlpha, true);
    for (const state of ['未选中', '选中']) {
      const svg = fs.readFileSync(path.join(directory, '单个图标', id + '_' + state + '.svg'), 'utf8');
      assert.match(svg, /data:image\/png;base64,/);
    }
  }
});
