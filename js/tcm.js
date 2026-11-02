/* 节气食单 · 中医养生层（传统理论概括 · 演示数据 · 待核验）
   依据：四时五脏相应与五味调养的传统概括（春肝/夏心/长夏脾/秋肺/冬肾），
   逐气给出性味宜食、传统食养思路与起居导引。不构成医疗建议，不作疗效承诺；
   不辨证、不开方、不推荐药材剂量；食材选择仍以用户过敏与忌口硬过滤为先。
   资料方向：香港卫生署中医药规管办公室「二十四节气养生」展板、中医四时养生通识。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var TCM = {
    lichun: { zang: '春气通肝', wei: '宜省酸增甘（传统五味调养说法）', shi: '山药、大枣、韭菜、豆芽等升发之品', dao: '晨起梳头、缓步舒展；夜卧早起不宜贪凉' },
    yushui: { zang: '肝气渐旺，脾胃需和', wei: '宜甘淡，少酸收', shi: '小米粥、蜂蜜、荠菜、莲子', dao: '「春捂」下厚上薄，防倒春寒侵足膝' },
    jingzhe: { zang: '肝阳易升', wei: '宜清淡甘平', shi: '梨、百合、春笋、菠菜', dao: '早睡早起，情志疏达勿郁怒' },
    chunfen: { zang: '肝气正当令', wei: '宜平和，忌偏嗜', shi: '时令春菜、枸杞叶、菊花茶', dao: '昼夜均分宜规律作息，踏青放风筝以舒肝气' },
    qingming: { zang: '肝脾相济', wei: '宜甘温健脾', shi: '山药、燕麦、荠菜、陈皮水', dao: '户外散步吐纳；悲思过度伤脾，宜宽怀' },
    guyu: { zang: '脾喜燥恶湿', wei: '宜健脾祛湿（传统说法）', shi: '薏米、赤小豆、香椿、山药', dao: '雨多湿重，衣被常晒；晚睡早起午小憩' },
    lixia: { zang: '夏气通心', wei: '宜清淡养心；「省苦增辛，养肺气」为传统说法之一，流派不一如实并存', shi: '立夏蛋、豌豆、冬瓜、莲子心茶', dao: '午间小睡养心；汗后勿当即当风冲凉' },
    xiaoman: { zang: '心火渐长，脾湿渐重', wei: '宜清利湿热', shi: '苦菜、绿豆、冬瓜、薏米', dao: '起居迎阳而作；情绪勿急躁，急则生火' },
    mangzhong: { zang: '心脾两顾', wei: '宜清淡祛湿', shi: '青梅、蚕豆、西瓜皮汤、乌梅饮', dao: '昼长夜短宜午休；勤换湿衣，防「夏打盹」' },
    xiazhi: { zang: '心气旺盛', wei: '宜苦味清心（传统说法），咸味补心?', shi: '过水面、苦瓜、莲子、绿茶', dao: '晚睡早起午补眠；心静自然凉，忌大怒大汗' },
    xiaoshu: { zang: '暑易伤心', wei: '宜清暑益气', shi: '黄瓜、绿豆汤、冬瓜、酸梅汤', dao: '避午间烈日；凉水澡勿贪，汗出当心腠理开泄' },
    dashu: { zang: '暑湿困脾', wei: '宜清补（传统「夏补三伏」说法）', shi: '仙草、老鸭冬瓜汤、姜茶暖胃', dao: '空调勿直吹，「虚邪贼风避之有时」' },
    liqiu: { zang: '秋气通肺', wei: '宜少辛增酸（传统说法）', shi: '梨、银耳、百合、莲藕', dao: '「秋收」早卧早起；贴秋膘按体质量力' },
    chushu: { zang: '肺气渐肃', wei: '宜滋阴润燥', shi: '老鸭汤、酸梅汤收尾、秋梨', dao: '早晚渐凉添薄衣；缓和运动收汗' },
    bailu: { zang: '肺喜润恶燥', wei: '宜润肺生津', shi: '白露茶、龙眼、冰糖炖梨、银耳', dao: '「白露身不露」——勿赤膊贪凉；早卧早起' },
    qiufen: { zang: '肺金当令', wei: '宜平补滋润', shi: '秋菜、莲藕、蟹（过敏者忌）、银耳', dao: '登高望远以宽肺气；收敛神气使秋气平' },
    hanlu: { zang: '燥邪渐凉燥', wei: '宜滋阴防燥', shi: '芝麻、山药、板栗、菊花茶', dao: '「寒露脚不露」——足膝保暖；缓敛运动不宜大汗' },
    shuangjiang: { zang: '脾胃当令宜平补', wei: '宜平补润肺', shi: '柿子（勿空腹）、萝卜炖牛腩、栗子乌鸡汤', dao: '膝足保暖防血管收缩；情志勿悲秋过度' },
    lidong: { zang: '冬气通肾', wei: '宜温补驱寒（传统「补冬」说法）', shi: '饺子、姜母鸭、涮羊肉、萝卜羊骨汤', dao: '早卧晚起必待日光；保暖头足，运动微汗即止' },
    xiaoxue: { zang: '肾气渐盛', wei: '宜温润平补', shi: '腊味煲仔饭、红糖糍粑、白菜炖豆腐', dao: '「冬藏」——减少剧烈大汗；晒背助阳气' },
    daxue: { zang: '肾宜温养', wei: '宜温补益气', shi: '当归生姜羊肉汤（传统食方，痰热体质慎）、枸杞乌鸡汤', dao: '早卧晚起；泡脚暖身，情志内藏勿过激' },
    dongzhi: { zang: '阴极阳生，肾气为本', wei: '宜温补团圆', shi: '饺子、黑芝麻汤圆、赤豆糯米饭、羊肉汤', dao: '「数九」静养；艾灸足三里为传统保健法（仅文化介绍）' },
    xiaohan: { zang: '寒主收引', wei: '宜温养脾胃', shi: '腊八粥、腊味糯米饭、姜枣茶', dao: '三九防寒护心脑；运动待日出，微汗为度' },
    dahan: { zang: '脾肾同温', wei: '宜温润收尾，为立春清淡过渡', shi: '年糕、八宝饭、老母鸡汤', dao: '起居向立春过渡；年终忙碌勿过耗心神' }
  };
  var NOTE = '中医食养内容为传统理论的通俗概括（演示数据 · 待核验），不构成医疗建议；不辨证、不开方、不荐药材剂量；食材取舍先遵守你的过敏与忌口设置。传统流派说法不一处已如实并存或注明。';

  JQ.TCM = {
    NOTE: NOTE,
    get: function (id) { return TCM[id] || null; },
    card: function (term) {
      var d = TCM[term.id];
      if (!d) { return ''; }
      return '<section class="card tcm-card" data-reveal>' +
        '<h2>中医养生 <span class="badge badge-demo">传统理论 · 待核验</span></h2>' +
        '<div class="tcm-grid">' +
        '<div class="tcm-item"><div class="zone-title warm">五脏时令</div><div class="tcm-v">' + JQ.esc(d.zang) + '</div></div>' +
        '<div class="tcm-item"><div class="zone-title warm">五味调养</div><div class="tcm-v">' + JQ.esc(d.wei) + '</div></div>' +
        '<div class="tcm-item"><div class="zone-title warm">传统食养</div><div class="tcm-v">' + JQ.esc(d.shi) + '</div></div>' +
        '<div class="tcm-item"><div class="zone-title warm">起居导引</div><div class="tcm-v">' + JQ.esc(d.dao) + '</div></div>' +
        '</div>' +
        '<div class="small muted" style="margin-top:8px">' + JQ.esc(NOTE) + '</div>' +
        '</section>';
    }
  };
})();
