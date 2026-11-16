import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import vm from 'node:vm';

const sourceFile = process.argv[2];
if (!sourceFile) throw new Error('Provide the local generated-image source manifest path.');
const sources = JSON.parse((await fs.readFile(sourceFile, 'utf8')).replace(/^\uFEFF/, ''));
if (!Array.isArray(sources) || sources.length !== 40) throw new Error('Expected all 24 seasonal and 16 interface image sources.');
if (new Set(sources.map(source => source.id)).size !== 40) throw new Error('Duplicate image source IDs.');
const originalDirectory = 'E:/chatgpt/资源库/节气食单_立体图标原图_20261117';
await fs.mkdir(originalDirectory, { recursive: true });
await fs.mkdir('assets/seasonal/art', { recursive: true });
await fs.mkdir('assets/icons/art', { recursive: true });
const terms = {};
const ui = {};
const images = [];

for (const source of sources) {
  const functional = source.id.startsWith('ui-');
  const name = functional ? source.id.slice(3) : source.id;
  if (!/^[a-z]+$/.test(name)) throw new Error('Unexpected generated icon ID.');
  const target = `assets/${functional ? 'icons' : 'seasonal'}/art/${name}.webp`;
  const original = await fs.readFile(source.path);
  await fs.copyFile(source.path, path.join(originalDirectory, source.id + '.png'));
  const info = await sharp(original).resize(256, 256, { fit: 'contain', background: '#00000000' })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(target);
  const metadata = await sharp(target).metadata();
  if (!metadata.hasAlpha) throw new Error(source.id + ' lost transparent background.');
  (functional ? ui : terms)[name] = target;
  images.push({ id: source.id, file: target, width: info.width, height: info.height, bytes: info.size,
    sourceSha256: crypto.createHash('sha256').update(original).digest('hex') });
}

const manifest = { generatedAt: '2026-11-17', generator: 'built-in image_gen', modelVersion: 'not_exposed_by_tool',
  style: 'Celadon glaze, ivory porcelain and antique bronze miniature sculptures', terms, ui, images };
await fs.writeFile('assets/generated-icons.json', JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile('js/generated_icon_assets.js', '/* Generated icon asset map. Rebuild with scripts/build-icons.mjs and local source manifest. */\n' +
  'window.JQ = window.JQ || {};\nJQ.GENERATED_ICONS = ' + JSON.stringify({ terms, ui }, null, 2) + ';\n');
console.log(JSON.stringify({ termIcons: Object.keys(terms).length, interfaceIcons: Object.keys(ui).length,
  webpBytes: images.reduce((sum, image) => sum + image.bytes, 0), originals: originalDirectory }));

const context = {};
context.window = context;
vm.createContext(context);
vm.runInContext(await fs.readFile('js/data_terms.js', 'utf8'), context);
const labels = { home: '今日食单', ask: '食养问答', term: '节气百科', me: '个人中心', fav: '收藏', checkin: '打卡', leaf: '饮食偏好', settings: '设置', bowl: '菜谱', data: '本机数据', shield: '隐私与说明', info: '关于', search: '搜索', calendar: '节气切换', share: '分享', edit: '编辑偏好' };
const tile = (file, label) => `<a class="art-tile" href="../${file}" download><img src="../${file}" alt="${label}" width="112" height="112"><span>${label}</span></a>`;
const tiles = context.JQ.DATA.TERMS.map(term => tile(terms[term.id], term.name)).join('');
const uiTiles = Object.entries(ui).map(([name, file]) => tile(file, labels[name])).join('');
const gallery = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>节气食单 · 瓷玉四时图标</title>
<style>*{box-sizing:border-box}body{max-width:1080px;margin:auto;padding:36px 24px;background:#F8F6F0;color:#304F41;font:600 14px/1.7 system-ui,"Microsoft YaHei",sans-serif}h1{font-size:30px;margin:0}h2{margin:28px 0 16px;font-size:20px}p{color:#777D6B;margin:8px 0 20px}.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.art-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 6px;background:#FFFEF9;border:1px solid #E5E4D7;border-radius:18px;color:inherit;text-decoration:none}.art-tile img{object-fit:contain;transition:transform .4s,filter .4s}.art-tile:hover img{transform:translateY(-6px) rotate(-3deg);filter:drop-shadow(0 8px 8px #7E7D3C30)}.ui{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:650px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.art-tile img{width:88px;height:88px}.ui{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(prefers-reduced-motion:reduce){.art-tile img{transition:none}.art-tile:hover img{transform:none}}</style>
<h1>瓷玉 · 四时</h1><p>节气食单立体材质图标 · 瓷白、玉绿与细金属边。点击图标下载透明WebP。</p><h2>二十四节气</h2><div class="grid">${tiles}</div><h2>十六种功能</h2><div class="grid ui">${uiTiles}</div><p>使用当前内置图像生成工具逐张制作。工具未披露模型版本。导航、功能与节气名称继续以文字标明。</p></html>`;
await fs.writeFile('deliver/icons.html', gallery);
