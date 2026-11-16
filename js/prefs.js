/* 节气食单 · 偏好模型 + 硬过滤 + 软排序
   规则：
   - 过敏与明确禁食是硬限制：推荐、换菜、AI、收藏加回一律不得放宽
   - 口味（辣/咸/甜）与耗时是软偏好：只影响排序，无法满足时解释差异
   - 「未提供过敏」≠「无过敏」：界面保留核对提示 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};

  var P = {};
  JQ.PREFS = P;

  /* 引导页/设置页共用的过敏选项（具体项 + 特殊项）
     特殊项：none 暂无已知过敏（与具体项互斥）；unsure 不确定；other 其他 */
  P.ALLERGEN_OPTIONS = [
    { id: 'fish', label: '鱼类' }, { id: 'seafood', label: '虾蟹贝类' },
    { id: 'egg', label: '鸡蛋' }, { id: 'dairy', label: '牛奶/乳制品' },
    { id: 'gluten', label: '麸质（小麦）' }, { id: 'soy', label: '大豆' },
    { id: 'peanut', label: '花生' }, { id: 'nut', label: '坚果/籽类' },
    { id: 'sesame', label: '芝麻' }
  ];
  P.SPICY_OPTIONS = ['不吃辣', '微辣', '中辣', '重辣'];
  P.SALT_OPTIONS = ['清淡', '适中', '偏咸'];
  P.SWEET_OPTIONS = ['少甜', '适中', '嗜甜'];
  P.SCENE_OPTIONS = [
    { id: 'canteen', label: '食堂' }, { id: 'takeout', label: '外卖' }, { id: 'cook', label: '自己做' }
  ];
  P.TIME_OPTIONS = [
    { id: '20', label: '≤20 分钟' }, { id: '40', label: '≤40 分钟' }, { id: '60', label: '≤60 分钟' }
  ];

  /* ============ 20 题偏好问卷（4 组 × 5 题） ============
     每组一屏；impact:true 表示该题真的进算法，false/缺省=只做画像。
     不假装有用：画像题在界面上明确标注，答辩时不虚。 */
  P.QUIZ_GROUPS = [
    {
      id: 'profile', num: '01', title: '关于你', icon: '🧑',
      lead: '先知道你是谁，推荐才谈得上懂你',
      items: [
        { id: 'ageBand', icon: '🎂', q: '你的年龄段', opts: [['u18', '18 岁以下'], ['18-22', '18–22 岁'], ['23-26', '23–26 岁'], ['27-35', '27–35 岁'], ['o35', '35 岁以上']] },
        { id: 'identity', icon: '🎓', q: '你现在的身份', opts: [['student', '在校学生'], ['worker', '上班族'], ['freelance', '自由职业'], ['other', '其他']] },
        { id: 'rhythm', icon: '⏰', q: '你的三餐规律', opts: [['three', '三餐规律'], ['two', '两餐为主'], ['night', '常吃夜宵'], ['random', '时间不定']] },
        { id: 'cookFreq', icon: '🍳', q: '一周自己做几次饭', opts: [['daily', '几乎每天'], ['often', '每周 3–5 次'], ['rare', '偶尔'], ['never', '几乎不做']] },
        { id: 'dineWith', icon: '👥', q: '通常和谁一起吃', opts: [['alone', '一个人'], ['roomie', '室友或同学'], ['family', '家人'], ['outside', '经常在外']] }
      ]
    },
    {
      id: 'taste', num: '02', title: '口味', icon: '🌶',
      lead: '辣、咸、甜三项会直接改变推荐顺序',
      items: [
        { id: 'spicy', icon: '🌶', q: '你能吃多辣', impact: true, opts: [[0, '不吃辣'], [1, '微辣'], [2, '中辣'], [3, '重辣']] },
        { id: 'salt', icon: '🧂', q: '口味咸淡', impact: true, opts: [[0, '清淡'], [1, '适中'], [2, '偏咸']] },
        { id: 'sweet', icon: '🍬', q: '甜度接受度', impact: true, opts: [[0, '少甜'], [1, '适中'], [2, '嗜甜']] },
        { id: 'texture', icon: '🥢', q: '你偏爱的口感', opts: [['soft', '软糯'], ['crisp', '爽脆'], ['chewy', '有嚼劲'], ['any', '不挑']] },
        { id: 'method', icon: '🔥', q: '喜欢的做法', opts: [['steam', '蒸煮'], ['stir', '快炒'], ['stew', '炖煲'], ['cold', '凉拌'], ['any', '都可以']] }
      ]
    },
    {
      id: 'allergen', num: '03', title: '过敏与忌口', icon: '⚠️',
      lead: '勾选即硬限制：命中的菜不会出现在推荐与 AI 回答里',
      items: [
        { id: 'allergens', icon: '⚠️', q: '已知的食物过敏（可多选）', multi: true, impact: true, opts: P.ALLERGEN_OPTIONS.map(function (o) { return [o.id, o.label]; }) },
        { id: 'allergenOther', icon: '❓', q: '还有没列出来的过敏吗', opts: [['no', '没有'], ['yes', '有，稍后补充']] },
        { id: 'intolerance', icon: '🥛', q: '有食物不耐受吗', opts: [['none', '没有'], ['lactose', '乳糖不耐'], ['gluten', '麸质敏感'], ['unsure', '不确定']] },
        { id: 'severity', icon: '🏥', q: '误食后的反应程度', opts: [['mild', '轻微不适'], ['clear', '明显不适'], ['severe', '严重，需就医'], ['unsure', '不确定']] },
        { id: 'taboo', icon: '🚫', q: '除过敏之外的忌口', opts: [['none', '没有'], ['beef', '不吃牛肉'], ['lamb', '不吃羊肉'], ['pork', '不吃猪肉'], ['organ', '不吃内脏'], ['veg', '素食']] }
      ]
    },
    {
      id: 'scene', num: '04', title: '吃饭场景', icon: '📍',
      lead: '在哪吃、有多少时间，决定给你什么建议',
      items: [
        { id: 'scene', icon: '📍', q: '主要在哪吃饭', impact: true, opts: [['canteen', '食堂'], ['takeout', '外卖'], ['cook', '自己做']] },
        { id: 'maxTime', icon: '⏱', q: '能接受的做饭时间', impact: true, opts: [[20, '≤20 分钟'], [40, '≤40 分钟'], [60, '≤60 分钟']] },
        { id: 'budget', icon: '💰', q: '每餐预算', opts: [['b10', '10 元以内'], ['b20', '10–20 元'], ['b35', '20–35 元'], ['b35p', '35 元以上']] },
        { id: 'partySize', icon: '🍽', q: '通常几个人吃', opts: [[1, '一个人'], [2, '两个人'], [4, '3–4 人'], [6, '5 人以上']] },
        { id: 'priority', icon: '❤️', q: '选餐时最看重', opts: [['fast', '快'], ['cheap', '省'], ['healthy', '健康'], ['tasty', '好吃'], ['pretty', '好看']] }
      ]
    }
  ];

  P.QUIZ_TOTAL = P.QUIZ_GROUPS.reduce(function (n, g) { return n + g.items.length; }, 0);

  P.DEFAULT = function () {
    return {
      v: 2,
      provided: false,          // 是否填写过偏好（false=跳过=未提供）
      allergens: [],            // 具体过敏 id 列表（硬限制）
      allergenNone: false,      // 暂无已知过敏
      allergenUnsure: false,    // 不确定
      allergenOther: false,     // 其他
      spicy: null, salt: null, sweet: null,  // 0..3 / 0..2 / 0..2
      scene: null,              // canteen | takeout | cook
      maxTime: null,            // 分钟
      quiz: {},                 // 20 题原始答案（画像）
      updatedAt: null,
      source: null              // onboard | settings
    };
  };

  P.get = function () {
    var saved = JQ.STORE.get(JQ.STORE.KEYS.PREFS, null);
    if (!saved || (saved.v !== 1 && saved.v !== 2)) { return P.DEFAULT(); }
    if (!saved.quiz) { saved.quiz = {}; }
    return saved;
  };

  /* 保存失败时如实提示；设置页只编辑旧字段，这里保住问诊画像不被覆盖 */
  P.save = function (prefs) {
    var old = P.get();
    if (!prefs.quiz && old && old.quiz) { prefs.quiz = old.quiz; }
    if (!prefs.v) { prefs.v = 2; }
    prefs.updatedAt = Date.now();
    var ok = JQ.STORE.set(JQ.STORE.KEYS.PREFS, prefs);
    if (!ok) { JQ.toast('偏好保存失败：浏览器存储不可用或已满', 'err'); }
    return ok;
  };

  /* 过敏状态摘要 */
  P.allergenState = function (prefs) {
    prefs = prefs || P.get();
    if (!prefs.provided) { return 'unfilled'; }
    if (prefs.allergens.length > 0) { return 'specific'; }
    if (prefs.allergenNone) { return 'none'; }
    return 'unfilled'; // 勾了 unsure/other 但无具体项 → 仍无法自动过滤
  };

  P.allergenLabels = function (prefs) {
    prefs = prefs || P.get();
    return prefs.allergens.map(function (id) {
      var hit = P.ALLERGEN_OPTIONS.filter(function (o) { return o.id === id; })[0];
      return hit ? hit.label : id;
    });
  };

  /* 硬过滤：命中用户具体过敏原的菜品直接剔除（任何路径不得放宽） */
  P.recipeBlocked = function (recipe, prefs) {
    prefs = prefs || P.get();
    if (!prefs.allergens.length) { return null; }
    for (var i = 0; i < recipe.allergens.length; i++) {
      if (prefs.allergens.indexOf(recipe.allergens[i]) >= 0) {
        return recipe.allergens[i];
      }
    }
    return null;
  };

  /* 软排序：场景适配 + 耗时 + 口味距离；返回 {sorted, notes} */
  P.rankTermRecipes = function (termId, opts) {
    opts = opts || {};
    var prefs = opts.prefs || P.get();
    var list = JQ.DATA.recipesByTerm(termId).slice();

    var blockedNames = [];
    var kept = list.filter(function (r) {
      var hit = P.recipeBlocked(r, prefs);
      if (hit) { blockedNames.push(r.name + '（含' + JQ.DATA.ALLERGEN_NAMES[hit] + '）'); return false; }
      return true;
    });

    function score(r) {
      var s = 0;
      if (prefs.scene && r.scenes.indexOf(prefs.scene) >= 0) { s += 3; }
      if (prefs.maxTime && r.time <= prefs.maxTime) { s += 2; }
      if (prefs.spicy != null) { s -= Math.abs((r.spicy) - prefs.spicy) * 0.6; }
      if (prefs.salt != null) { s -= Math.abs(r.salt - prefs.salt) * 0.5; }
      if (prefs.sweet != null) { s -= Math.abs(r.sweet - prefs.sweet) * 0.4; }
      return s;
    }
    kept.sort(function (a, b) { return score(b) - score(a); });

    /* 软偏好差异说明（诚实解释，不放宽） */
    var notes = [];
    if (prefs.scene) {
      var sceneLabel = (P.SCENE_OPTIONS.filter(function (o) { return o.id === prefs.scene; })[0] || {}).label;
      var fitCount = kept.filter(function (r) { return r.scenes.indexOf(prefs.scene) >= 0; }).length;
      if (kept.length && fitCount < Math.min(3, kept.length)) {
        notes.push('当前节气适合「' + sceneLabel + '」的菜品较少，以下推荐按口味为你排了序。');
      }
    }
    if (prefs.maxTime) {
      var fast = kept.filter(function (r) { return r.time <= prefs.maxTime; }).length;
      if (kept.length && fast < Math.min(3, kept.length)) {
        notes.push('部分菜品耗时超出你设定的上限（≤' + prefs.maxTime + ' 分钟），已在推荐理由中保留说明。');
      }
    }
    return { all: list, kept: kept, blocked: blockedNames, notes: notes, blockedCount: list.length - kept.length };
  };

  /* 今日推荐位：默认取排序前 3（不足按实际数量）；换一换在过滤池内轮换。
     推荐位为会话级状态（JQ.PICKS），存菜品 id 列表；偏好更新后 key 变化即重算。 */
  P.picksFor = function (termId) {
    var prefs = P.get();
    var ranked = P.rankTermRecipes(termId);
    var pool = ranked.kept;
    var key = termId + '|' + prefs.updatedAt;
    if (!pool.length) {
      delete JQ.PICKS[key];
      return { list: [], poolSize: 0, ranked: ranked, key: key };
    }
    var st = JQ.PICKS[key];
    if (st && st.list) {
      /* 池变化（菜品下线等）导致存档失效则重算 */
      var valid = st.list.filter(function (id) {
        return pool.some(function (r) { return r.id === id; });
      });
      if (valid.length !== st.list.length) { st.list = null; }
    }
    if (!st || !st.list) {
      st = { list: pool.slice(0, Math.min(3, pool.length)).map(function (r) { return r.id; }) };
      JQ.PICKS[key] = st;
    }
    return {
      list: st.list.map(function (id) { return JQ.DATA.recipeById(id); }),
      poolSize: pool.length, ranked: ranked, key: key, st: st
    };
  };

  /* 换一换：在过滤后的候选池内向后轮换一个窗口 */
  P.rotate = function (termId) {
    var picks = P.picksFor(termId);
    if (!picks.poolSize) { return picks; }
    var ids = picks.ranked.kept.map(function (r) { return r.id; });
    var curFirst = picks.st.list[0];
    var i = ids.indexOf(curFirst);
    var start = (i >= 0 ? i : 0) + picks.st.list.length;
    var n = Math.min(3, ids.length);
    var list = [];
    for (var k = 0; k < n; k++) { list.push(ids[(start + k) % ids.length]); }
    picks.st.list = list;
    return P.picksFor(termId);
  };
})();
