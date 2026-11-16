import fs from 'node:fs/promises';
import sharp from 'sharp';

const directory = 'deliver/第三部分_功能图标';
const labels = { home: '今日食单', ask: '食养问答', term: '节气百科', me: '我的', fav: '收藏', checkin: '打卡', leaf: '饮食偏好', settings: '设置', bowl: '菜谱', data: '本机数据', shield: '隐私与说明', info: '关于', search: '搜索', calendar: '节气切换', share: '分享', edit: '编辑偏好' };
const manifest = JSON.parse(await fs.readFile('assets/generated-icons.json', 'utf8'));
if (Object.keys(manifest.ui).length !== 16) throw new Error('All 16 functional icons are required.');
await fs.mkdir(directory + '/单个图标', { recursive: true });
const font = 'Microsoft YaHei, sans-serif';
const records = [];

// Keep the generated artwork intact. State differences are deterministic UI rendering:
// a neutral default state, full-colour active state and an additional vermilion marker.
const iconSvg = (data, active) => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><filter id="neutral" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0.06"/></filter></defs><image href="${data}" x="12" y="4" width="232" height="232"${active ? '' : ' filter="url(#neutral)"'}/>${active ? '<rect x="109" y="245" width="38" height="5" rx="2.5" fill="#B5533E"/>' : ''}</svg>`;
for (const [id, label] of Object.entries(labels)) {
  const png = await sharp(manifest.ui[id]).png().toBuffer();
  const data = 'data:image/png;base64,' + png.toString('base64');
  for (const active of [false, true]) {
    const state = active ? '选中' : '未选中';
    const filename = `${id}_${state}`;
    const svg = iconSvg(data, active);
    await fs.writeFile(`${directory}/单个图标/${filename}.svg`, svg);
    await sharp(Buffer.from(svg)).png().toFile(`${directory}/单个图标/${filename}.png`);
  }
  records.push({ id, label, data });
}
const text = (x, y, size, copy, color = '#304F41', extra = '') => `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="600" fill="${color}" ${extra}>${copy}</text>`;
for (let page = 0; page < 2; page++) {
  let cards = '';
  for (let i = 0; i < 8; i++) {
    const item = records[page * 8 + i];
    const x = 72 + i % 4 * 450;
    const y = 205 + Math.floor(i / 4) * 386;
    cards += `<g transform="translate(${x} ${y})"><rect width="426" height="360" rx="22" fill="#FFFEFA" stroke="#E1E3D8"/>` +
      text(26, 45, 25, String(page * 8 + i + 1).padStart(2, '0') + '  ' + item.label) +
      `<image href="data:image/svg+xml;base64,${Buffer.from(iconSvg(item.data, false)).toString('base64')}" x="34" y="78" width="156" height="156"/>` +
      `<image href="data:image/svg+xml;base64,${Buffer.from(iconSvg(item.data, true)).toString('base64')}" x="236" y="78" width="156" height="156"/>` +
      text(112, 279, 20, '未选中', '#777D73', 'text-anchor="middle"') + text(314, 279, 20, '选中', '#355E50', 'text-anchor="middle"') +
      text(26, 332, 15, item.id, '#8A8C7E') + '</g>';
  }
  const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#F8F6F0"/>${text(72, 67, 20, '节气食单  /  第三部分：功能图标')}${text(72, 130, 44, '瓷玉四时 · 功能图标 ' + (page + 1) + '/2')}${text(72, 174, 21, '16 种功能图标，32 个状态。未选中保持中性色，选中恢复瓷玉配色并增加朱砂标记。', '#777D73')}${cards}${text(72, 1026, 18, '青瓷釉色、瓷白与细铜边，连接食器文化和时令食养。动作按钮的“选中”用于按下或激活反馈。', '#777D73')}</svg>`;
  await fs.writeFile(`${directory}/功能图标_状态对照_${page + 1}.svg`, board);
  await sharp(Buffer.from(board)).png().toFile(`${directory}/功能图标_状态对照_${page + 1}.png`);
}
await fs.writeFile(directory + '/图标清单.json', JSON.stringify({ count: 16, states: 32, labels, generation: { tool: manifest.generator, modelVersion: manifest.modelVersion }, stateDesign: 'Same source artwork; neutral default, full colour with vermilion marker when active.' }, null, 2));
await fs.writeFile(directory + '/交付说明.md', `# 节气食单：第三部分功能图标\n\n16种功能图标，每种未选中与选中各一版，共32个状态。\n\n- 单个图标：透明PNG与自包含SVG各32份。SVG内嵌位图，可调整大小和状态标记，图标主体不是可逐路径编辑的矢量。\n- 状态对照：2张1920×1080展示板，可直接放入小组PPT。\n- 两页PPT：运行export-icon-ppt.py生成；图标各自独立可移动，文字和卡片可编辑。\n- 生成工具：内置image_gen；工具未披露具体模型版本，不能标成已确认的Image2.5。\n- 状态制作：原始生成图保持不变，通过SVG的中性色滤镜、全彩和朱砂短线表达状态，防止两次生成造成形状漂移。\n- 搜索、分享、编辑等动作按钮，在实际产品中应使用按下/激活反馈，不设置持久选中状态。\n- 24节气图标是额外的文化内容素材，不计入本次16种功能图标。\n- 本包仅覆盖老师第三项；不代表已完成21页线框图、高保真图或整个期末PPT。\n`);
console.log(JSON.stringify({ directory, functionalIcons: records.length, stateFiles: 32 }));
