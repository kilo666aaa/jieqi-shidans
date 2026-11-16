// 导出 16 个图标的 未选中/选中 两态 SVG 到 assets/icons/
const fs = require('fs');
const path = require('path');
const ICONS = [
 ['home','首页','<path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4.6v-5.4h-4.8V21H5a1 1 0 0 1-1-1z"/>'],
 ['term','节气百科','<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.2"/><path d="M12 3.6v2M20.4 12h-2M12 20.4v-2M3.6 12h2"/>'],
 ['ask','AI 问答','<path d="M4 6.4A2.4 2.4 0 0 1 6.4 4h11.2A2.4 2.4 0 0 1 20 6.4v8a2.4 2.4 0 0 1-2.4 2.4H9.6L5 20.6V16.8A2.4 2.4 0 0 1 4 14.4z"/><circle cx="9" cy="10.4" r="1.1"/><circle cx="13" cy="10.4" r="1.1"/><circle cx="17" cy="10.4" r="1.1"/>'],
 ['me','我的','<circle cx="12" cy="8.2" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>'],
 ['fav','收藏','<path d="m12 3.6 2.6 5.4 5.8.8-4.2 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.6 9.8l5.8-.8z"/>'],
 ['search','搜索','<circle cx="11" cy="11" r="6.6"/><path d="m16 16 4.6 4.6"/>'],
 ['settings','设置','<path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z"/><path d="M19.2 12c0-.4 0-.7-.1-1l1.7-1.3-1.6-2.8-2 .8c-.5-.4-1-.7-1.6-.9L15.2 5h-3.2l-.4 1.8c-.6.2-1.1.5-1.6.9l-2-.8-1.6 2.8L8.1 11c-.1.3-.1.7-.1 1s0 .7.1 1l-1.7 1.3 1.6 2.8 2-.8c.5.4 1 .7 1.6.9l.4 1.8h3.2l.4-1.8c.6-.2 1.1-.5 1.6-.9l2 .8 1.6-2.8-1.7-1.3c.1-.3.1-.7.1-1z"/>'],
 ['share','分享','<path d="M12 4.4 4.8 11h3.6v6.4h7.2V11h3.6z"/><path d="M12 17.4v3"/>'],
 ['checkin','打卡','<circle cx="12" cy="12" r="8.4"/><path d="m8.4 12.2 2.5 2.5 4.9-5.2"/>'],
 ['calendar','节气历','<rect x="4.4" y="5.6" width="15.2" height="14" rx="2"/><path d="M4.4 10h15.2M8.6 3.6v3.6M15.4 3.6v3.6"/><circle cx="12" cy="14.6" r="1.3"/>'],
 ['bowl','时令碗','<path d="M4.6 12.4h14.8a7.4 7.4 0 0 1-14.8 0z"/><path d="M9.2 10.6 15.6 4M12 10.6l4.8-6"/>'],
 ['heart','喜欢','<path d="M12 19.6S4.4 15.2 4.4 9.8a4.2 4.2 0 0 1 7.6-2.4 4.2 4.2 0 0 1 7.6 2.4c0 5.4-7.6 9.8-7.6 9.8z"/>'],
 ['back','返回','<path d="M14.5 5 8 12l6.5 7"/>'],
 ['more','更多','<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>'],
 ['alert','警示','<path d="M12 4.2 21 19.4H3z"/><path d="M12 9.6v4.4M12 16.6v.9"/>'],
 ['edit','编辑偏好','<path d="M4.8 19.2h4l10-10a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0l-10 10z"/><path d="m13.6 6.4 4 4"/>']
];
const OUT = path.join(__dirname, '..', 'assets', 'icons');
fs.mkdirSync(OUT, { recursive: true });
function svg(inner, on) {
  const stroke = on ? 'fill="#3F7D5A" stroke="#3F7D5A" stroke-width="1.4"'
                    : 'fill="none" stroke="#57534B" stroke-width="1.7"';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' + stroke +
    ' stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}
ICONS.forEach(function (p) {
  fs.writeFileSync(path.join(OUT, p[0] + '.svg'), svg(p[2], false));
  fs.writeFileSync(path.join(OUT, p[0] + '-on.svg'), svg(p[2], true));
});
console.log('exported', ICONS.length * 2, 'svg files');
