/* 节气食单 · 菜谱数据（冬）——演示内容 · 待小组核验 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.DATA = JQ.DATA || {};
  JQ.DATA.RECIPES = JQ.DATA.RECIPES || [];

  JQ.DATA.recipeById = function (id) {
    var rs = JQ.DATA.RECIPES;
    for (var i = 0; i < rs.length; i++) { if (rs[i].id === id) { return rs[i]; } }
    return null;
  };
  JQ.DATA.recipesByTerm = function (tid) {
    return JQ.DATA.RECIPES.filter(function (r) { return r.t === tid; });
  };

  /* 过敏原显示名 */
  JQ.DATA.ALLERGEN_NAMES = {
    fish: '鱼类', seafood: '虾蟹贝类', egg: '鸡蛋', dairy: '牛奶/乳制品',
    gluten: '麸质（小麦）', soy: '大豆', peanut: '花生', nut: '坚果/籽类', sesame: '芝麻'
  };

  /* ---------- 立冬 ---------- */
  JQ.DATA.RECIPES.push(
    { id: 'ld1', t: 'lidong', name: '猪肉白菜饺子', emoji: '🥟', allergens: ['gluten'],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 70, servings: '3 人份',
      ing: [['饺子皮', '50 张'], ['猪肉糜', '300 克'], ['大白菜', '300 克'], ['葱姜水 / 生抽 / 香油', '适量']],
      steps: ['白菜切碎加盐腌 10 分钟挤干，与上劲的肉糜拌成馅。', '包饺，水开下锅点三滚凉水至浮起。', '蘸醋蒜泥食用。'],
      equip: ['汤锅'],
      reason: '"立冬不端饺子碗，冻掉耳朵没人管"——北方立冬吃饺子，"交子之时"的谐音里是新旧交替的仪式感。',
      source: '北方立冬食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'ld2', t: 'lidong', name: '姜母鸭', emoji: '🦆', allergens: [],
      spicy: 1, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 90, servings: '3–4 人份',
      ing: [['半番鸭', '半只'], ['老姜', '100 克'], ['麻油', '3 勺'], ['米酒 / 生抽', '适量']],
      steps: ['鸭块焯水；老姜切厚片。', '麻油小火煸姜片至卷边，下鸭块煸炒至微焦。', '加米酒生抽与少量水，小火焖 60 分钟收汁。'],
      equip: ['砂锅'],
      reason: '"立冬补冬，补嘴空"——闽南立冬姜母鸭最正宗：麻油姜香气血翻涌，是南方人对冬天的郑重其事。',
      source: '闽台立冬食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'ld3', t: 'lidong', name: '涮羊肉', emoji: '🍲', allergens: [],
      spicy: 1, salt: 1, sweet: 0, scenes: ['canteen', 'takeout'], time: 30, servings: '3 人份',
      ing: [['羊肉卷', '400 克'], ['白菜 / 冻豆腐 / 粉丝', '适量'], ['芝麻酱 / 腐乳 / 韭菜花', '适量'], ['清汤锅底', '1 份']],
      steps: ['清水加姜葱枣做清汤底。', '肉片涮 10 秒变色即捞，蘸麻酱小料，配菜随下随吃。'],
      equip: ['火锅 / 电磁炉'],
      reason: '立冬"补冬"在北方绕不开一锅涮肉——铜锅清汤最能检验羊肉新鲜度；食堂档口与外卖小火锅同样可得。',
      source: '北方立冬涮羊肉习俗；演示数据 · 待核验', status: 'demo' },
    { id: 'ld4', t: 'lidong', name: '麻油鸡', emoji: '🍗', allergens: [],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook'], time: 50, servings: '3 人份',
      ing: [['鸡腿', '3 只'], ['老姜', '80 克'], ['黑麻油', '3 勺'], ['米酒', '100 毫升']],
      steps: ['麻油小火煸姜，下鸡块炒至表皮金黄。', '加米酒与等量水，焖煮 30 分钟，少许盐。'],
      equip: ['砂锅 / 深锅'],
      reason: '台式立冬补冬的当家菜——麻油与老姜的暖，米酒收尾的香，一勺汤浇饭就是冬天。',
      source: '台闽补冬食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'ld5', t: 'lidong', name: '萝卜羊骨汤', emoji: '🥘', allergens: [],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 110, servings: '4 人份',
      ing: [['羊骨 / 羊排', '600 克'], ['白萝卜', '400 克'], ['姜片 / 花椒', '少许'], ['盐 / 香菜', '适量']],
      steps: ['羊骨冷水焯水，与姜花椒炖 90 分钟至汤白。', '萝卜块入锅煮 18 分钟，调盐撒香菜。'],
      equip: ['炖锅'],
      reason: '冬吃萝卜夏吃姜——羊肉配萝卜是老搭配：萝卜解腻，羊汤暖身，一碗下肚寒气退散。',
      source: '民间冬令汤俗；演示数据 · 待核验', status: 'demo' }
  );

  /* ---------- 小雪 ---------- */
  JQ.DATA.RECIPES.push(
    { id: 'xx1', t: 'xiaoxue', name: '腊味煲仔饭', emoji: '🍚', allergens: [],
      spicy: 0, salt: 2, sweet: 0, scenes: ['cook', 'canteen', 'takeout'], time: 50, servings: '2 人份',
      ing: [['丝苗米', '200 克'], ['腊肠 / 腊肉', '各 50 克'], ['青菜', '2 棵'], ['煲仔饭酱油', '适量']],
      steps: ['米泡 30 分钟，砂锅抹油，米水 1:1 煮至冒虾眼泡。', '铺腊味片，沿边淋油，小火焖 12 分钟。', '关火再焖 10 分钟，浇酱油、烫青菜。'],
      equip: ['砂锅'],
      reason: '"小雪腌菜，大雪腌肉"——此时旧腊味正香，新腊味刚上绳；一锅煲仔饭的焦香是广式冬天的开场白。',
      source: '广式冬季食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'xx2', t: 'xiaoxue', name: '红糖糍粑', emoji: '🍡', allergens: ['gluten'],
      spicy: 0, salt: 0, sweet: 2, scenes: ['cook', 'takeout'], time: 25, servings: '2 人份',
      ing: [['糍粑（或糯米粉自制）', '200 克'], ['红糖', '30 克'], ['黄豆粉', '适量'], ['食用油', '适量']],
      steps: ['糍粑切块，少油小火煎至两面鼓起金黄。', '红糖加水熬成浓汁，淋在糍粑上，撒黄豆粉。'],
      equip: ['平底锅'],
      reason: '"十月朝，糍粑碌碌烧"——南方小雪前后舂糍粑，团圆甜糯；古时还是祭祀牛神的供品。',
      source: '南方十月朝食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'xx3', t: 'xiaoxue', name: '白果炖鸡', emoji: '🍲', allergens: ['nut'],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 100, servings: '4 人份',
      ing: [['整鸡腿肉', '500 克'], ['白果（去芯）', '30 克'], ['红枣', '5 颗'], ['姜片 / 盐', '适量']],
      steps: ['鸡肉焯水，与白果红枣姜片炖 85 分钟，调盐。'],
      equip: ['炖锅'],
      reason: '小雪进补讲"平和"——白果炖鸡是川渝冬季名汤；白果每次食用勿超 10 粒且必须熟透，儿童减半。',
      source: '川渝冬令汤品；白果属坚果籽类，过敏者注意；演示数据 · 待核验', status: 'demo' },
    { id: 'xx4', t: 'xiaoxue', name: '白菜炖豆腐', emoji: '🥬', allergens: ['soy'],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 25, servings: '2 人份',
      ing: [['大白菜', '300 克'], ['北豆腐', '300 克'], ['虾皮（可选）', '1 撮'], ['盐 / 香油', '适量']],
      steps: ['豆腐切块煎至两面微黄。', '下白菜帮炒软，加水炖 10 分钟，下菜叶与虾皮再煮 3 分钟，调盐点香油。'],
      equip: ['炖锅'],
      reason: '"百菜不如白菜"——小雪窖藏白菜正当时，配豆腐是最经济的冬日CP，清爽解腻。',
      source: '北方冬储白菜食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'xx5', t: 'xiaoxue', name: '红薯粥', emoji: '🍠', allergens: [],
      spicy: 0, salt: 0, sweet: 1, scenes: ['cook', 'canteen'], time: 40, servings: '2 人份',
      ing: [['粳米', '80 克'], ['红薯', '150 克'], ['清水', '适量']],
      steps: ['红薯去皮切块，与米同煮 30 分钟至粥稠薯糯。'],
      equip: ['汤锅 / 电饭煲'],
      reason: '小雪后晚餐宜早宜暖——一碗红薯粥纤维充足、饱腹感强，是冬夜不过载的温柔选择。',
      source: '家常冬令主食；演示数据 · 待核验', status: 'demo' }
  );

  /* ---------- 大雪 ---------- */
  JQ.DATA.RECIPES.push(
    { id: 'dx1', t: 'daxue', name: '当归生姜羊肉汤', emoji: '🍖', allergens: [],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 110, servings: '4 人份',
      ing: [['羊腿肉', '600 克'], ['当归片', '10 克'], ['生姜', '50 克'], ['料酒 / 盐', '适量']],
      steps: ['羊肉焯水，与当归姜片料酒同炖 90 分钟至肉烂。', '调盐即成，汤色乳白微甘。'],
      equip: ['炖锅'],
      reason: '大雪进补的头牌——出自汉代医典的食方在民间流传两千年；作为冬令汤品享用即可，孕妇及服药人群请先咨询医师。',
      source: '化裁自《金匮要略》当归生姜羊肉汤的民间食方；演示数据 · 待核验', status: 'demo' },
    { id: 'dx2', t: 'daxue', name: '枸杞红枣乌鸡汤', emoji: '🍲', allergens: [],
      spicy: 0, salt: 1, sweet: 1, scenes: ['cook', 'canteen'], time: 95, servings: '4 人份',
      ing: [['乌鸡', '半只'], ['红枣', '6 颗'], ['枸杞', '15 粒'], ['姜片 / 盐', '适量']],
      steps: ['乌鸡焯水，与红枣姜片炖 75 分钟。', '加枸杞再煮 10 分钟，调盐。'],
      equip: ['炖锅'],
      reason: '"大雪进补，开春打虎"——乌鸡汤是南方补冬的温和款，加枸杞红枣，甘润不腻。',
      source: '民间冬令进补习俗；演示数据 · 待核验', status: 'demo' },
    { id: 'dx3', t: 'daxue', name: '荸荠雪梨水', emoji: '🍐', allergens: [],
      spicy: 0, salt: 0, sweet: 1, scenes: ['cook', 'takeout'], time: 25, servings: '2 人份',
      ing: [['荸荠（马蹄）', '150 克'], ['雪梨', '1 个'], ['冰糖', '15 克'], ['清水', '800 毫升']],
      steps: ['荸荠去皮对半切，梨切块。', '同煮 18 分钟，加冰糖融化即可，温饮。'],
      equip: ['小汤锅'],
      reason: '北方干冷、室内燥热，荸荠雪梨水是民间应对"冬燥"的甜饮——生荸荠有寄生虫风险，务必煮熟。',
      source: '民间冬令润燥饮；演示数据 · 待核验', status: 'demo' },
    { id: 'dx4', t: 'daxue', name: '白灼菜心（冬版）', emoji: '🥬', allergens: [],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 8, servings: '2 人份',
      ing: [['菜心 / 塌棵菜', '300 克'], ['生抽 / 蒜末', '适量'], ['热油', '半勺']],
      steps: ['沸水加几滴油焯菜 50 秒码盘，淋生抽蒜末，浇热油。'],
      equip: ['汤锅'],
      reason: '进补不等于顿顿浓油赤酱——大雪的餐桌更需要一口青绿；经霜的叶菜自带回甘。',
      source: '粤式家常做法；演示数据 · 待核验', status: 'demo' },
    { id: 'dx5', t: 'daxue', name: '腌笃鲜（冬笋版）', emoji: '🥘', allergens: [],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook'], time: 100, servings: '4 人份',
      ing: [['五花肉 / 排骨', '400 克'], ['腌腊肉 / 咸肉', '100 克'], ['冬笋', '2 根'], ['百叶结', '100 克'], ['姜片 / 葱结', '适量']],
      steps: ['鲜肉咸肉分别焯水，加姜葱炖 60 分钟。', '下笋块百叶结再炖 30 分钟，汤白即成（咸肉已带咸，少盐）。'],
      equip: ['砂锅'],
      reason: '"腌"是咸肉、"笃"是小火慢炖、"鲜"是冬笋——大雪前后冬笋破土，这一锅是江南人给冬天的答案。',
      source: '江南冬令名菜；演示数据 · 待核验', status: 'demo' }
  );

  /* ---------- 冬至 ---------- */
  JQ.DATA.RECIPES.push(
    { id: 'dz1', t: 'dongzhi', name: '白菜猪肉饺子', emoji: '🥟', allergens: ['gluten'],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen', 'takeout'], time: 70, servings: '3–4 人份',
      ing: [['饺子皮', '60 张'], ['猪肉糜', '350 克'], ['大白菜', '350 克'], ['葱姜 / 生抽 / 香油', '适量']],
      steps: ['白菜杀水挤干拌入上劲肉糜。', '包饺煮三滚，蘸醋蒜即食。'],
      equip: ['汤锅'],
      reason: '"冬至不端饺子碗，冻掉耳朵没人管"——纪念张仲景"祛寒娇耳汤"的传说，让饺子有了医者仁心的来历。',
      source: '北方冬至食俗（张仲景传说）；演示数据 · 待核验', status: 'demo' },
    { id: 'dz2', t: 'dongzhi', name: '黑芝麻汤圆', emoji: '元宵', allergens: ['sesame', 'gluten'],
      spicy: 0, salt: 0, sweet: 2, scenes: ['cook', 'takeout'], time: 30, servings: '2 人份',
      ing: [['糯米粉', '150 克'], ['温水', '适量'], ['黑芝麻馅（芝麻+糖+猪油/黄油）', '120 克']],
      steps: ['糯米粉温水和团，包入搓圆的黑芝麻馅。', '水开下锅煮至浮起再 2 分钟，连汤盛。'],
      equip: ['汤锅'],
      reason: '"吃了汤圆大一岁"——冬至大如年，南方以汤圆团圆添岁；黑芝麻馅流沙般涌出的瞬间最治愈。',
      source: '江南冬至食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'dz3', t: 'dongzhi', name: '赤豆糯米饭', emoji: '🍚', allergens: [],
      spicy: 0, salt: 0, sweet: 1, scenes: ['cook'], time: 60, servings: '2–3 人份',
      ing: [['糯米', '150 克'], ['赤小豆', '50 克'], ['红糖（可选）', '少许']],
      steps: ['赤豆提前泡 4 小时先煮 20 分钟。', '与糯米同入电饭煲，水量略低于白米饭，煮熟焖 10 分钟。'],
      equip: ['电饭煲'],
      reason: '共工氏之子"疫鬼畏赤豆"的传说让江南冬至必吃赤豆饭——驱邪祈福的老故事，暖糯微甜的一碗饭。',
      source: '江南冬至赤豆饭民俗；演示数据 · 待核验', status: 'demo' },
    { id: 'dz4', t: 'dongzhi', name: '鲜肉馄饨', emoji: '🥟', allergens: ['gluten'],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'takeout'], time: 45, servings: '2–3 人份',
      ing: [['馄饨皮', '30 张'], ['猪肉糜', '200 克'], ['榨菜末 / 葱花 / 紫菜 / 虾皮', '适量'], ['生抽 / 香油', '适量']],
      steps: ['肉糜调味搅打包成馄饨。', '碗中备紫菜虾皮葱花生抽，滚汤冲开，盛入煮好的馄饨。'],
      equip: ['汤锅'],
      reason: '"冬至馄饨夏至面"——老北京冬至吃馄饨，取"混沌初开"之意；一碗热汤下肚，数九寒天开始。',
      source: '北方冬至食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'dz5', t: 'dongzhi', name: '冬至羊肉汤', emoji: '🍲', allergens: [],
      spicy: 1, salt: 1, sweet: 0, scenes: ['canteen', 'takeout'], time: 30, servings: '2 人份',
      ing: [['羊肉汤底（现成或自炖）', '1 份'], ['羊肉片', '200 克'], ['白萝卜', '200 克'], ['香菜 / 辣椒面', '适量']],
      steps: ['汤底烧开下萝卜片煮 8 分钟。', '下羊肉片涮至变色，撒香菜，喜辣蘸干碟。'],
      equip: ['汤锅'],
      reason: '从冬至起"数九"，民间以羊肉汤开启严寒倒计时——西南地区冬至羊汤馆大排长龙是年度景观。',
      source: '西南冬至食俗；演示数据 · 待核验', status: 'demo' }
  );

  /* ---------- 小寒 ---------- */
  JQ.DATA.RECIPES.push(
    { id: 'xh1', t: 'xiaohan', name: '腊八粥', emoji: '🥣', allergens: ['peanut', 'nut', 'gluten'],
      spicy: 0, salt: 0, sweet: 1, scenes: ['cook', 'canteen', 'takeout'], time: 90, servings: '4 人份',
      ing: [['粳米 / 糯米', '100 克'], ['赤豆 / 绿豆 / 花生 / 莲子 / 桂圆 / 红枣', '各 20 克'], ['燕麦（含麸质，可选）', '20 克'], ['冰糖', '适量']],
      steps: ['豆类花生莲子提前泡 4 小时。', '除桂圆红枣外先煮 40 分钟，再下米与其余料熬 30 分钟至粥稠，加糖。'],
      equip: ['电饭煲 / 炖锅'],
      reason: '腊八多在小寒节气内——一碗腊八粥汇聚五谷杂豆，"过了腊八就是年"，甜香里是年关将近的踏实。',
      source: '腊八节食俗（佛寺施粥传统）；演示数据 · 待核验', status: 'demo' },
    { id: 'xh2', t: 'xiaohan', name: '南京菜饭', emoji: '🍚', allergens: [],
      spicy: 0, salt: 2, sweet: 0, scenes: ['cook', 'canteen'], time: 50, servings: '2–3 人份',
      ing: [['矮脚黄青菜', '250 克'], ['咸肉丁', '60 克'], ['板鸭丁（可选）', '50 克'], ['粳米', '200 克'], ['猪油', '1 小勺']],
      steps: ['米正常水量入锅，铺咸肉丁煮熟。', '青菜切碎用猪油炒软，拌入焖好的饭中再焖 5 分钟。'],
      equip: ['电饭煲'],
      reason: '"小寒一碗菜饭，胜过人参鹿茸"——南京人的小寒限定：矮脚黄青菜配咸肉板鸭，油润喷香。',
      source: '南京小寒食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'xh3', t: 'xiaohan', name: '腊味糯米饭', emoji: '🍙', allergens: [],
      spicy: 0, salt: 2, sweet: 0, scenes: ['cook', 'canteen'], time: 60, servings: '3 人份',
      ing: [['糯米', '200 克'], ['腊肠 / 腊肉', '各 50 克'], ['花生米', '30 克'], ['香菜 / 生抽', '适量']],
      steps: ['糯米泡 2 小时蒸熟。', '腊味切丁煸炒出油，与花生米一起拌入糯米饭，淋生抽回蒸 5 分钟。'],
      equip: ['蒸锅'],
      reason: '广东小寒早上吃糯米饭——腊味与花生的油脂香裹着糯米，"小寒大寒，冻成冰团"的早晨全靠它。',
      source: '广东小寒食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'xh4', t: 'xiaohan', name: '桂圆红枣茶', emoji: '🍵', allergens: [],
      spicy: 0, salt: 0, sweet: 2, scenes: ['cook', 'canteen', 'takeout'], time: 20, servings: '2 人份',
      ing: [['桂圆肉', '20 克'], ['红枣', '6 颗'], ['枸杞', '10 粒'], ['清水 / 红糖', '适量']],
      steps: ['红枣去核撕开，与桂圆加水煮 15 分钟。', '加枸杞红糖再煮 3 分钟，趁热饮。'],
      equip: ['小锅 / 养生壶'],
      reason: '小寒是季冬开端，民俗以温热甜饮护住阳气——手捧一杯桂圆红枣茶，是从掌心开始的暖。',
      source: '民间冬令饮品综述；演示数据 · 待核验', status: 'demo' },
    { id: 'xh5', t: 'xiaohan', name: '黄焖鸡块', emoji: '🍗', allergens: [],
      spicy: 1, salt: 1, sweet: 0, scenes: ['cook', 'canteen', 'takeout'], time: 50, servings: '3 人份',
      ing: [['鸡腿', '3 只'], ['香菇', '5 朵'], ['姜蒜 / 生抽 / 老抽 / 糖', '适量'], ['青椒', '1 个']],
      steps: ['鸡块焯水煸炒上色。', '加香菇与调料、热水没鸡，焖 30 分钟，收汁前下青椒。'],
      equip: ['砂锅 / 炒锅'],
      reason: '小寒天寒需要扎实的一餐——黄焖鸡的浓汁最适合浇饭，食堂与外卖场景友好度满分。',
      source: '家常鲁菜系做法；演示数据 · 待核验', status: 'demo' }
  );

  /* ---------- 大寒 ---------- */
  JQ.DATA.RECIPES.push(
    { id: 'dh1', t: 'dahan', name: '肉丝炒年糕', emoji: '🍡', allergens: ['gluten'],
      spicy: 0, salt: 1, sweet: 1, scenes: ['cook', 'canteen', 'takeout'], time: 25, servings: '2 人份',
      ing: [['水磨年糕', '300 克'], ['肉丝', '100 克'], ['白菜丝 / 韭黄', '100 克'], ['生抽 / 糖', '适量']],
      steps: ['年糕切片焯水 1 分钟过凉防粘。', '肉丝滑炒盛出，炒白菜，回锅年糕肉丝，加生抽少许糖翻匀。'],
      equip: ['炒锅'],
      reason: '"大寒迎年"吃年糕，取"年年高"之意——宁波水磨年糕的软糯，是江浙人辞冬迎春的口彩。',
      source: '江浙大寒迎年食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'dh2', t: 'dahan', name: '八宝饭', emoji: '🍮', allergens: ['nut', 'gluten'],
      spicy: 0, salt: 0, sweet: 2, scenes: ['cook', 'takeout'], time: 90, servings: '6 人份',
      ing: [['糯米', '300 克'], ['豆沙馅', '200 克'], ['红枣 / 葡萄干 / 瓜子仁 / 红绿丝', '适量'], ['猪油 / 白糖', '适量']],
      steps: ['糯米蒸熟拌糖与猪油。', '碗中抹油码果料，铺一层糯米、豆沙、再糯米压实。', '上锅蒸 20 分钟，倒扣装盘。'],
      equip: ['蒸锅'],
      reason: '八宝饭是大寒到春节宴席的"压轴甜"——八宝聚齐象征团圆美满，年味从这碗糯米开始。',
      source: '江南年节甜食；演示数据 · 待核验', status: 'demo' },
    { id: 'dh3', t: 'dahan', name: '老母鸡汤', emoji: '🍗', allergens: [],
      spicy: 0, salt: 1, sweet: 0, scenes: ['cook', 'canteen'], time: 120, servings: '4 人份',
      ing: [['老母鸡', '半只'], ['姜片', '5 片'], ['红枣 / 枸杞', '适量'], ['盐', '适量']],
      steps: ['整鸡焯水，与姜片小火炖 100 分钟。', '加红枣枸杞再炖 15 分钟，只以盐调味。'],
      equip: ['炖锅'],
      reason: '"大寒保暖第一汤"——数九将尽，一碗只加盐的老母鸡汤最见本味；南京"大寒煲鸡汤"是有名的旧俗。',
      source: '南京大寒食俗；演示数据 · 待核验', status: 'demo' },
    { id: 'dh4', t: 'dahan', name: '冬笋炒腊肉', emoji: '🥓', allergens: [],
      spicy: 1, salt: 2, sweet: 0, scenes: ['cook', 'canteen'], time: 30, servings: '2–3 人份',
      ing: [['冬笋', '2 根'], ['腊肉', '150 克'], ['青蒜', '2 根'], ['干辣椒（可选）', '2 个']],
      steps: ['冬笋切片焯水 2 分钟去涩；腊肉蒸 10 分钟切片。', '煸腊肉出油，下笋片与辣椒翻炒 3 分钟，撒青蒜断生即出。'],
      equip: ['炒锅'],
      reason: '大寒时节腊肉腌足风成，冬笋鲜灵正破土——咸鲜配清鲜，是湘赣人家冬天最下饭的一盘。',
      source: '南方冬季家常菜；演示数据 · 待核验', status: 'demo' },
    { id: 'dh5', t: 'dahan', name: '消寒糕（冻梨糕点替代）', emoji: '🍪', allergens: ['gluten'],
      spicy: 0, salt: 0, sweet: 2, scenes: ['takeout'], time: 5, servings: '1–2 人份',
      ing: [['年糕 / 甑糕（市售）', '1 份'], ['热豆浆或热茶', '1 杯']],
      steps: ['购买市售消寒糕或甑糕，配一杯热饮，趁热食用——"一块消寒糕，出门不缩手"。'],
      equip: [],
      reason: '旧时北京大寒吃"消寒糕"，年糕谐音"年高"，寓意步步高升、驱散寒气；今日可在点心铺买到同类糕点。',
      source: '北京大寒食俗记载；演示数据 · 待核验', status: 'demo' }
  );
})();
