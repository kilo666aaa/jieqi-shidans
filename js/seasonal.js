/* 原创节气图鉴。Anatomy 方法：等距实心底座、分面明暗、实体支承与单模型时间线。
 * 不引入运行时依赖；图解为定性示意，不以动画进度伪装实测温度或生长速度。
 * 资料核对 2026-11-02：天文表已对照；其余见各项审核范围。旧古籍/诗词不升级审核。 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  var esc = function(s) { return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); };
  var sources = [
    {title:'香港天文台 · 二十四节气',url:'https://www.hko.gov.hk/tc/gts/time/24solarterms.htm',scope:'24项太阳黄经与中原气候背景：已对照原表'},
    {title:'中科院地理资源所 · 什么是二十四节气',url:'https://igsnrr.cas.cn/cbkx/kpyd/zybk/qhzy/202009/t20200910_5692918.html',scope:'命名及季节背景：已读概述，不是各地天气预报'},
    {title:'香港卫生署中医药规管办公室 · 节气养生',url:'https://www.cmro.gov.hk/html/gb/useful_information/public_health/exhibit_boards/Health_Maintenance_on_the_24Solar_Terms.html',scope:'传统四时食养概念参考；本页概括并非逐项疗效核验'},
    {title:'中国营养学会 · 中国居民膳食指南',url:'https://dg.cnsoc.org/',scope:'一般人群均衡饮食原则参考；非24项专门食谱'},
    {title:'国家疾控局 · 春分健康发布会',url:'https://www.ndcpa.gov.cn/jbkzzx/c100009/common/content/content_1902890955437412352.html',scope:'规律起居、地域温差与春捂边界参考'}
  ];
  // 原创概括：不是古籍引文，也不将某地食俗推广为全国惯例。
  var rows = [
    ['lichun','立春','土壤萌芽','传统春季起点，记录由冬向春的转折。','北方常仍寒冷，南方回暖较早。','立春不等于各地气象入春。','土壤条件合适时，种子吸水并萌发；实际时间随物种、温度和水分改变。'],
    ['yushui','雨水','降水浸润','以雨意象表达冷暖转换与水分变化。','中原降雨渐增，北方仍可能降雪。','雨水不保证当天有雨，也不表示全国进入雨季。','雨滴进入土壤孔隙，湿润带逐渐向下推进。'],
    ['jingzhe','惊蛰','地温与虫','以蛰伏动物开始活动描述春日变化。','各地地温回升不同，活动期也不同。','昆虫活动主要受温度等条件影响，并非雷声直接唤醒所有昆虫。','地温回升提供活动条件；虫体逐渐离开蛰伏位置，雷只是传统伴随意象。'],
    ['chunfen','春分','光照分界','太阳通过春分点，是春季的天文标记。','北半球昼长继续增加，各地气温并不相同。','昼夜近等长是概括；折射与太阳视圆面使实际日出日落间隔有差异。','光暗分界经过地球两极附近，展示接近等分的照明关系；地球自转为压缩示意。'],
    ['qingming','清明','柳芽抽长','取气清景明、草木生长之意，也是传统节日。','江南春意较浓，北方回暖可能伴随大风。','清明不一定下雨，诗句不能代替预报。','枝条上的芽逐渐展开；柳芽仅为代表性物候，不代表全国同步。'],
    ['guyu','谷雨','谷苗吸水','以春雨与谷物生长的关联命名。','南方需关注连阴雨，北方可能仍需灌溉。','谷雨不等于雨越多越好，积水也可能影响作物。','水分经根系吸收；图中水点路径仅表示输水方向，不是可见真实水滴。'],
    ['lixia','立夏','荷叶舒展','传统夏季由此开篇。','华南较热，北方不少地区尚处春日。','立夏不等于所有地区当天进入炎热夏季。','幼叶在水面逐渐展开；荷叶生长时间因地区与品种而异。'],
    ['xiaoman','小满','麦粒渐充','夏熟谷物籽粒逐渐充实而尚未全熟。','北方麦区关注灌浆，南方关注雨水与农田水情。','小满的满不意味着所有庄稼已经成熟。','穗上籽粒逐步充实，演示灌浆过程；不表示8秒内完成生长。'],
    ['mangzhong','芒种','收麦与播种','与有芒作物收种相联系的农时。','麦区收获、稻区栽插的节奏依作物和地区改变。','并非每种作物都必须在芒种这天播种。','先移去成熟麦穗，再把种子落入相邻田垄，展示收种交接。'],
    ['xiazhi','夏至','长日路径','太阳直射点接近北回归线。','北半球多数地区白昼达全年较长阶段，暑热仍会发展。','夏至不一定是全年最热一天，地表蓄热存在滞后。','同一地点示意较长的太阳日行弧；纬度改变会改变日照时长。'],
    ['xiaoshu','小暑','水分蒸发','暑热逐渐发展的时段。','多地高温渐多，沿海和内陆湿度差异明显。','蒸发不是只有沸腾时才发生。','水分从液面进入空气，水面缓慢下降；粒子是过程符号。'],
    ['dashu','大暑','树荫遮阳','暑热较盛的传统时段。','高温高湿常见，也须防局地强对流。','树荫可减少太阳直射，但不能保证消除中暑风险。','移动日照下树冠形成遮蔽区，展示遮阳减少直接辐射的作用。'],
    ['liqiu','立秋','叶色初变','传统秋季起点。','许多地区仍热，部分北方地区早晚渐凉。','立秋不是立即降温，也不是必须大量进补的信号。','叶片由绿渐显黄意，表示部分落叶植物色素变化；不是立秋日必然变色。'],
    ['chushu','处暑','热量渐退','处含终止意，表达暑热走向退场。','北方降温可能先到，南方余热常持续。','处暑并不意味着全国高温立刻结束。','受热地面逐渐散热，热流符号减弱，表现渐退而非瞬间变冷。'],
    ['bailu','白露','水汽凝结','夜凉与露水成为代表意象。','北方昼夜温差较明显，南方仍可能闷热。','露水来自水汽凝结，不是从天空下来的小雨。','叶面冷却到露点附近，水汽在表面形成液滴。'],
    ['qiufen','秋分','昼夜转折','太阳再经过赤道附近，传统秋季过半。','北半球昼长继续缩短，地域冷暖差异仍大。','秋分和春分光照近似，气温并不因此相同。','日夜转盘由接近平分转向夜长，演示北半球随后昼渐短的趋势。'],
    ['hanlu','寒露','清晨凝露','以更深秋凉中的露水命名。','北方寒意加深，南方不少地区仍较温暖。','寒露的露仍是液态水，不是已经变成霜。','冷却板模拟叶面夜间降温，较冷表面逐渐出现露滴。'],
    ['shuangjiang','霜降','水汽凝华','以深秋渐寒与霜的意象命名。','北方一些地区出现初霜，南方常仍未结霜。','霜通常由水汽直接凝华形成，并非露珠冻成霜或霜从天而降。','水汽在适宜的低温表面凝华成冰晶；霜形成需满足局地温湿条件。'],
    ['lidong','立冬','种子休眠','传统冬季的开端，含收藏之意。','北方降温明显，南方气象入冬通常较晚。','并非所有种子冬季都休眠，休眠机制随物种而变。','种子收入土中、活动指示减缓，表示部分种子等待适宜条件的休眠状态。'],
    ['xiaoxue','小雪','雪晶飘落','以降雪可能增加的时令意象命名。','北方可能见雪，南方多地并不降雪。','节气小雪不等于气象预报中的小雪量级。','雪晶从云下飘落，不同轨迹表示风与下落共同影响。'],
    ['daxue','大雪','积雪形成','以寒冷加深、降雪机会增多命名。','是否积雪取决于气温、地表和降雪条件。','大雪节气不保证降大雪，落雪也未必形成积雪。','飘雪到达较冷地面后逐层累积，示意积累与融化共同决定雪层。'],
    ['dongzhi','冬至','短日长夜','太阳直射点接近南回归线。','北半球多数地区白昼较短，严寒常还在后面。','冬至不是所有地区最冷一天；之后昼长也不是立刻明显增加。','较短日行弧与较长夜段形成对照，显示同一地点冬季日照较少。'],
    ['xiaohan','小寒','水面结冰','寒冷发展的传统时段。','大陆北方常寒冷，南方需关注湿冷。','小寒未必比大寒暖，实际冷暖受天气过程影响。','淡水表面先形成冰层并扩展，表示冰水相变；不代表各地水面必然结冰。'],
    ['dahan','大寒','梅芽待春','传统节气序列的末尾，寒尽候春。','仍需关注寒潮，地域最冷时段不一。','梅花开放受品种与环境影响，不能用一朵花判断全国气候。','枝上花芽逐渐膨大，末段显出花瓣，象征寒中孕育而非所有梅花此时盛开。']
  ];
  var traditional = [
    '传统以春生、调畅为食养线索，可把应季蔬菜作为餐桌选择。',
    '传统以夏长、清养为线索，常见清淡汤粥意象。',
    '传统以秋收、润燥为线索，常见梨与银耳等食物意象。',
    '传统以冬藏、温养为线索，强调温热熟食与适量进食。'
  ];
  var modern = [
    ['搭配蔬菜、全谷和蛋白质食物；豆芽等食材彻底加热。','粥配蛋、奶或豆制品与蔬菜，避免一餐只有稀粥。','水果正常食用即可，不把梨当成防治疾病的药物。','规律进餐，食物多样，不因节气刻意限制某一类食物。','青团等节令点心注意份量；不采食不认识的野菜。','香椿等应从可靠渠道购买并妥善处理，不用野生菌尝鲜。'],
    ['天气热时仍需足够主食和蛋白质，别用冷饮替代正餐。','主动饮水，水果清洗后食用；食量按活动情况调整。','农忙或运动后及时补水，熟食及时冷藏，生熟分开。','饮水与吃饭保持规律，少用含糖饮料解渴。','选择白水补水，出汗后的具体补给按活动量调整。','避免高温时段长时间户外活动；食材冷藏并充分加热。'],
    ['保持正常食量，不以贴秋膘为由增加油脂与总能量。','暑热未退时继续补水，少糖少油，不把甜汤当必需品。','可选水果和奶豆类，少吃高糖润燥甜品。','蔬果、全谷和蛋白质搭配，保持稳定的饮食节奏。','不依赖滋补品，多样食物提供营养，适量饮水。','天气冷也要吃蔬果；温热烹调是舒适选择，不是治疗。'],
    ['不因进补额外大量吃肉；均衡搭配谷物、蔬菜与蛋白质。','腌制食品控制份量，口味清淡；保留新鲜蔬菜摄入。','热汤少盐，主食粗细搭配，保证正常食量。','饺子或汤圆按一餐总量安排，搭配蔬菜和蛋白质。','温热饮食可改善舒适度，避免烫口；保持适量饮水。','年节前后规律进餐，留意零食、油盐和甜饮总量。']
  ];
  var routine = ['根据当地气温添减衣物，保持睡眠，散步时留意花粉和大风。','户外活动避开最热时段，保证休息，闷热天气关注高温预警。','早晚按体感添衣，规律睡眠，运动强度循序渐进。','注意室内通风和保暖，避免久坐，外出留意冰雪路面。'];
  var data = {};
  rows.forEach(function(r,i){ var season=Math.floor(i/6); data[r[0]]={id:r[0],name:r[1],index:i,longitude:(315+i*15)%360,theme:r[2],meaning:r[3],climate:r[4],misconception:r[5],explanation:r[6],traditional:traditional[season],modern:modern[season][i%6],routine:routine[season],duration:8,sources:sources,review:'黄经已对照天文台；释义为资料概括；气候、图解及食养待人工逐项复核；旧三候、诗词、食俗仍待核验。'}; });
  // 实拍自然视频版图解（Mixkit 免费素材，已在本地转码 640px / 约10秒 / 静音循环）
  var videoMeta={
    lichun:{src:'assets/video/lichun.mp4',theme:'草木萌动',caption:'实拍：早春枝头花簇初绽，草木自萌动中苏醒，春意悄然起步。',alt:'立春实拍：早春枝头花簇初绽'},
    yushui:{src:'assets/video/yushui.mp4',theme:'雨润枝叶',caption:'实拍：细雨润过枝头绿叶，水珠在叶面汇聚滚动，春泥渐湿。',alt:'雨水实拍：细雨润过绿叶'},
    jingzhe:{src:'assets/video/jingzhe.mp4',theme:'蛰虫苏振',caption:'实拍：惊蛰蛰虫苏醒，蝴蝶在春光里缓缓振翅。',alt:'惊蛰实拍：蝴蝶振翅'},
    chunfen:{src:'assets/video/chunfen.mp4',theme:'春野晴光',caption:'实拍：春分草原大树蓝天，风和日丽，昼夜均分时节。',alt:'春分实拍：春日草原晴空'},
    qingming:{src:'assets/video/qingming.mp4',theme:'烟雨清明',caption:'实拍：清明时节烟雨朦胧，林间雾气弥漫，气清景明。',alt:'清明实拍：烟雨朦胧的林间'},
    guyu:{src:'assets/video/guyu.mp4',theme:'秧田水暖',caption:'实拍：谷雨时节层层梯田蓄水插秧，新绿自田垄铺展。',alt:'谷雨实拍：梯田插秧'},
    lixia:{src:'assets/video/lixia.mp4',theme:'蝉鸣绿荫',caption:'实拍：初夏阳光穿过层层绿叶，光斑随风闪动，正是蝉鸣渐起的树荫景象。',alt:'立夏实拍：阳光穿过绿叶，光斑闪动'},
    xiaoman:{src:'assets/video/xiaoman.mp4',theme:'麦浪青青',caption:'实拍：小满时节青麦连片，麦浪随风起伏，籽粒渐渐充实。',alt:'小满实拍：青麦田麦浪起伏'},
    mangzhong:{src:'assets/video/mangzhong.mp4',theme:'收麦正忙',caption:'实拍：芒种时节金色麦田收割正忙，收麦与插秧两不相误。',alt:'芒种实拍：金色麦田收割'},
    xiazhi:{src:'assets/video/xiazhi.mp4',theme:'葵田向阳',caption:'实拍：夏至阳光最盛，向日葵田金黄绽放，朵朵追光而开。',alt:'夏至实拍：向日葵田向阳'},
    xiaoshu:{src:'assets/video/xiaoshu.mp4',theme:'林间暑光',caption:'实拍：小暑暑气渐盛，阳光穿过林间洒下斑驳光影。',alt:'小暑实拍：林间斑驳光影'},
    dashu:{src:'assets/video/dashu.mp4',theme:'烈日原野',caption:'实拍：大暑烈日当空，原野在骄阳下蒸腾暑气。',alt:'大暑实拍：烈日下的原野'},
    liqiu:{src:'assets/video/liqiu.mp4',theme:'枫叶初红',caption:'实拍：立秋叶色初变，红叶在风中摇曳报秋。',alt:'立秋实拍：红叶摇曳'},
    chushu:{src:'assets/video/chushu.mp4',theme:'秋湖退暑',caption:'实拍：处暑暑气渐收，湖畔秋叶初染，早晚凉意渐生。',alt:'处暑实拍：秋叶染色的湖畔'},
    bailu:{src:'assets/video/bailu.mp4',theme:'青草凝露',caption:'实拍：白露清晨，青草叶尖露珠晶莹，夜凉凝结成露。',alt:'白露实拍：青草叶尖露珠'},
    qiufen:{src:'assets/video/qiufen.mp4',theme:'金浪丰收',caption:'实拍：秋分金色田野翻涌如浪，收获的时节已经到来。',alt:'秋分实拍：金色田野丰收'},
    hanlu:{src:'assets/video/hanlu.mp4',theme:'雁阵南飞',caption:'实拍：寒露雁群结队南飞，深秋寒意一天深过一天。',alt:'寒露实拍：雁群飞过天空'},
    shuangjiang:{src:'assets/video/shuangjiang.mp4',theme:'枝头凝霜',caption:'实拍：霜降前后，枝头覆上白色霜华，寒夜凝霜渐重。',alt:'霜降实拍：枝头覆霜'},
    lidong:{src:'assets/video/lidong.mp4',theme:'水始成冰',caption:'实拍：立冬时节河水渐冷，碎冰开始在水面聚拢凝结。',alt:'立冬实拍：河面开始结冰'},
    xiaoxue:{src:'assets/video/xiaoxue.mp4',theme:'雪落松林',caption:'实拍：小雪时节雪花飘落松林，天地渐白，雾气沉沉。',alt:'小雪实拍：雪花飘落松林'},
    daxue:{src:'assets/video/daxue.mp4',theme:'雪湖凝白',caption:'实拍：大雪时节湖面凝白雪盖，远山雪林在雾气中静立，寒意深浓。',alt:'大雪实拍：雪白的湖面与雪林'},
    dongzhi:{src:'assets/video/dongzhi.mp4',theme:'雪夜月升',caption:'实拍：冬至夜最长，雪原明月当空，静候一阳初生。',alt:'冬至实拍：雪夜明月'},
    xiaohan:{src:'assets/video/xiaohan.mp4',theme:'冰河千里',caption:'实拍：小寒江河封冻，浮冰铺满河面，寒冷发展的时段。',alt:'小寒实拍：封冻的冰河'},
    dahan:{src:'assets/video/dahan.mp4',theme:'雪山寒极',caption:'实拍：大寒雪山顶风云涌动，正是一年中最冷的时段。',alt:'大寒实拍：雪山寒雾'}
  };
  Object.keys(videoMeta).forEach(function(id){ var d=data[id]; if(d){ d.theme=videoMeta[id].theme; d.explanation=videoMeta[id].caption; } });
  Object.keys(data).forEach(function(id){data[id].tcm=data[id].traditional;data[id].daily=data[id].routine;});
  data.shuangjiang.sources=sources.concat([{title:'北京市园林绿化局 · 寒露与霜降',url:'https://yllhj.beijing.gov.cn/ztxx/lhysh/sh/202311/t20231120_3305348.shtml',scope:'霜的凝华过程补充参考；古籍露结为霜不直接当作现代物理解释'}]);
  // 改正旧增强层会继续显示的科学错误，保留古籍原文和 demo 标记。
  (JQ.DATA && JQ.DATA.TERMS || []).forEach(function(t){
    var d=data[t.id]; if(!d)return;
    t.mean=d.meaning+' '+d.climate;
    if(t.id==='lichun' && t.houEx)t.houEx[0]='传统以暖风与冰冻开始消融记春意，不代表所有地区同时解冻';
    if(t.id==='jingzhe') { t.e='地温回升，蛰虫渐动'; if(t.houEx)t.houEx[2]='鹰化为鸠是传统物候认识，不是鹰变成另一物种'; }
    if(t.id==='qingming' && t.houEx)t.houEx[1]='田鼠化为鴽是古代观察与解释，不代表现代生物学上的物种转化';
    if(t.id==='shuangjiang')t.e='渐寒候霜，水汽凝华';
  });

  var ink='#365449', light='#e7eee0', mid='#b5c5ac', shade='#819982', dark='#667c6c', accent='#ba8141';
  function path(d,fill,extra){extra=extra||'';return '<path d="'+d+'" fill="'+(fill||'none')+'" '+(/\bstroke=/.test(extra)?'':'stroke="'+ink+'" ')+(/\bstroke-width=/.test(extra)?'':'stroke-width="1.1" ')+'stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';}
  function circle(x,y,r,fill){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="1"/>';}
  function ellipse(x,y,rx,ry,fill){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+ink+'" stroke-width="1"/>';}
  // Orthographic isometric projection; filled top / left / right faces keep back edges hidden.
  function point(x,y,z){return [180+(x-y)*.86,161+(x+y)*.42-z];}
  function poly(points,fill){return path('M'+points.map(function(p){return p.join(',');}).join('L')+'Z',fill);}
  function box(x,y,w,h,z,depth,fill){
    var a=point(x,y,z),b=point(x+w,y,z),c=point(x+w,y+h,z),d=point(x,y+h,z),bl=point(x+w,y,z-depth),cl=point(x+w,y+h,z-depth),dl=point(x,y+h,z-depth);
    return poly([d,c,cl,dl],shade)+poly([b,c,cl,bl],dark)+poly([a,b,c,d],fill||light);
  }
  function leaf(x,y,s,angle,fill){return '<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+s+')">'+path('M0 0C-24-5-24-24 0-36C22-22 24-6 0 0Z',fill||mid)+path('M0 0V-31')+'</g>';}
  function sprout(x,y,h,spread){return path('M'+x+' '+y+'v-'+h)+leaf(x,y-h*.55,spread,-65)+leaf(x,y-h,spread,55);}
  function drop(x,y,s,fill){return '<g transform="translate('+x+' '+y+') scale('+s+')">'+path('M0-9C-3-4-7 0-6 4C-5 12 6 12 6 4C7 0 3-4 0-9Z',fill||'#b8d5d0')+'</g>';}
  function crystal(x,y,s,angle){var out='';for(var i=0;i<3;i++)out+='<g transform="rotate('+(i*60)+' '+x+' '+y+')">'+path('M'+(x-9*s)+' '+y+'H'+(x+9*s))+path('M'+(x+6*s)+' '+(y-3*s)+'l-'+(3*s)+' '+(3*s)+' '+(3*s)+' '+(3*s))+'</g>';return '<g transform="rotate('+angle+' '+x+' '+y+')">'+out+'</g>';}
  function sun(x,y,r){var out=circle(x,y,r,'#e3bf80');for(var i=0;i<8;i++){var a=i*Math.PI/4;out+=path('M'+(x+Math.cos(a)*(r+4))+' '+(y+Math.sin(a)*(r+4))+'l'+Math.cos(a)*5+' '+Math.sin(a)*5);}return out;}
  function grain(x,y,p){var out=path('M'+x+' '+y+'v-66');for(var i=0;i<3;i++)out+=ellipse(x-5,y-24-i*13,2.5+p*2.5,4.5,accent)+ellipse(x+5,y-28-i*13,2.5+p*2.5,4.5,accent);return out;}
  function tree(p){return path('M181 155V91',mid)+ellipse(181,87,49,29,mid)+ellipse(159,82,24,20,light)+ellipse(196,74,30,22,light)+ellipse(211,92,25,18,mid);}
  /* ---- 自然场景辅助：天空 / 远山 / 地面 / 飞鸟（替换原等距板台） ---- */
  function sky(tint){return '<rect x="60" y="25" width="240" height="215" fill="'+(tint||'#edf1e6')+'" opacity=".55"/>';}
  function hills(tint){return path('M60 196Q110 170 160 186T250 178T300 190V240H60Z',tint||'#dbe2cf');}
  function ground(tint){return path('M60 208Q150 194 300 204V240H60Z',tint||'#c9d6b8');}
  function pond(rx,ry){return ellipse(185,218,rx,ry,'#b6d1c7');}
  function bird(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')">'+path('M0 0Q5 -6 10 0Q15 -6 20 0','none','stroke-width="1.6"')+'</g>';}
  function rainline(x,y){return path('M'+x+' '+y+'l-3 11','none','stroke="#9db8b2" stroke-width="1"');}
  function flake(x,y,r){return circle(x,y,r,'#fbfaf4');}
  function blossom(x,y){return circle(x,y,3,'#c97683')+circle(x,y,1.2,'#f3ecd8');}
  function base(){return sky()+hills()+ground();}
  function scene(id,p){
    var d=data[id]; if(!d)return ''; p=Math.max(0,Math.min(1,p));var q=p*p*(3-2*p),out='',i,j,a,x,y;
    switch(id){
      /* 立春 · 土壤萌芽：残雪消融，嫩芽破土 */
      case 'lichun':
        out+=sky()+hills()+ground('#c9d6b8')+sun(90,64,11);
        out+=ellipse(120,214,60-q*44,9,'#eef1ea')+ellipse(238,222,46-q*32,7,'#eef1ea');
        out+=sprout(180,208,14+q*44,.14+q*.5);
        for(i=0;i<3;i++)out+=sprout(126+i*54,222,6+q*22,.1+q*.3);
        break;
      /* 雨水 · 雨落水生：雨丝落塘，涟漪层开 */
      case 'yushui':
        out+=sky('#e6ecdf')+hills('#d3dcc6')+ground('#bcd0b4')+pond(88,17);
        for(i=0;i<12;i++)out+=rainline(92+(i%6)*30,42+((q*150+i*23)%140));
        for(i=0;i<3;i++)out+=ellipse(185,218,12+i*28*q,2.4+i*5*q,'none');
        out+=sprout(112,226,10+q*20,.3)+sun(250,56,9);
        break;
      /* 惊蛰 · 惊雷春动：春雷响，蛰虫出 */
      case 'jingzhe':
        out+=sky('#e3e9dd')+hills()+ground('#c2cfae');
        out+=ellipse(150,66,54,16,'#aebbb2')+ellipse(205,60,44,14,'#9cae9f');
        if(q<.5)out+=path('M176 82l-13 36 17-4-9 32 28-42-16 4z','#e3bf80');
        out+=ellipse(214,210,14,6,'#b8a58a');
        out+='<g transform="translate(198 '+(214-q*11)+') rotate('+(-q*44)+')">'+ellipse(0,0,9,4,dark)+circle(10,-1,3.4,ink)+'</g>';
        out+=sprout(138,224,8+q*18,.25);
        break;
      /* 春分 · 玄鸟至：花开满树，燕子归来 */
      case 'chunfen':
        out+=sky('#eef3e8')+hills()+ground('#c9d6b8')+sun(88,60,10);
        out+=path('M180 210Q182 178 176 152','none','stroke="'+shade+'" stroke-width="2.6"')+path('M177 168l22-12M178 158l-20-9','none','stroke="'+shade+'" stroke-width="1.6"');
        out+=ellipse(163,142,24,17,mid)+ellipse(197,138,26,18,mid)+ellipse(180,126,30,18,mid)+ellipse(168,120,16,12,light);
        for(i=0;i<10;i++)out+=circle(150+(i%5)*16,120+Math.floor(i/5)*16,1.4+q*1.7,'#e8aeb9');
        out+=bird(84+q*140,72+Math.sin(q*6)*8,1)+bird(62+q*140,88+Math.sin(q*6+2)*8,.75);
        break;
      /* 清明 · 烟雨柳垂：细雨柳丝摇 */
      case 'qingming':
        out+=sky('#e3e9dd')+hills('#ccd6c2')+ground('#b9ccb0')+ellipse(205,224,52,9,'#b6d1c7');
        out+=path('M172 212Q176 158 168 116','none','stroke="'+shade+'" stroke-width="2.6"');
        out+=path('M168 118Q146 112 130 118M168 118Q192 108 212 116M168 118Q180 102 196 100','none','stroke="'+shade+'" stroke-width="1.5"');
        var strands=[[136,120],[156,116],[176,112],[196,110],[210,118]];
        for(i=0;i<strands.length;i++){var sw=Math.sin(q*8+i*1.9)*7;out+=path('M'+strands[i][0]+' '+strands[i][1]+'C'+(strands[i][0]-3+sw*.3)+' '+(strands[i][1]+24)+','+(strands[i][0]-6+sw*.7)+' '+(strands[i][1]+46)+','+(strands[i][0]-8+sw)+' '+(strands[i][1]+66),'none','stroke="'+dark+'" stroke-width="1.2"');}
        for(i=0;i<10;i++)out+=rainline(88+(i%5)*34,44+((q*136+i*17)%128));
        break;
      /* 谷雨 · 雨生百谷：水田插新秧 */
      case 'guyu':
        out+=sky()+hills('#d6ddc8')+path('M60 214Q150 200 300 210V240H60Z','#a9c9c0');
        for(i=0;i<9;i++)out+=sprout(84+i*26,220+(i%3)*6,4+q*20,.16+q*.3);
        for(i=0;i<8;i++)out+=rainline(100+(i%4)*40,36+((q*128+i*21)%112));
        break;
      /* 立夏 · 蛙鸣荷叶展 */
      case 'lixia':
        out+=sky('#eaf1e2')+hills('#d6dfc9')+ground('#c3d4b5')+pond(94,18);
        out+='<g transform="translate(158 210) scale('+(0.25+q*.75)+')">'+ellipse(0,0,34,13,mid)+path('M-30 0H30M0 0l20-11M0 0l-22 10')+'</g>';
        if(q>.5)out+='<g transform="translate(216 204)">'+ellipse(0,0,9,6,mid)+circle(6,-7,4,mid)+circle(7,-8,1.4,ink)+circle(4,-9,1.4,ink)+'</g>';
        out+=bird(112+q*100,88+Math.sin(q*8)*6,.8)+sun(252,54,10);
        break;
      /* 小满 · 麦粒渐满 */
      case 'xiaoman':
        out+=sky()+hills('#d9dfc4')+ground('#c2cfa8')+sun(90,60,10);
        for(i=0;i<7;i++){var gx=103+i*26,gy=224-(i%2)*7;out+=grain(gx,gy,.25+q*.75)+leaf(gx-4,gy-40,.5,-60);}
        break;
      /* 芒种 · 收麦插秧 */
      case 'mangzhong':
        out+=sky()+hills('#d9dfc4')+ground('#c2cfa8');
        for(i=0;i<5;i++)out+=path('M'+(92+i*16)+' 218v-15','none')+'<circle cx="'+(92+i*16)+'" cy="203" r="1.4" fill="'+accent+'"/>';
        out+=path('M168 216Q230 206 300 214V240H168Z','#a9c9c0');
        for(i=0;i<5;i++)if(q>.12+i*.16)out+=sprout(194+i*22,224+(i%2)*5,10,.3);
        break;
      /* 夏至 · 日轨至高 */
      case 'xiazhi':
        out+=sky('#e9f0e0')+hills()+ground('#c6d4b2');
        out+=path('M80 168Q180 30 280 168','none','stroke="#c9b98a" stroke-dasharray="4 5" stroke-width="1.2"');
        a=Math.PI*(1-q);out+=sun(180+Math.cos(a)*100,168-Math.sin(a)*118,13);
        out+=pond(62,12)+leaf(222,212,.9,-10);
        break;
      /* 小暑 · 蝉鸣枝头 */
      case 'xiaoshu':
        out+=sky('#ecf1e2')+hills('#d9e1cb')+ground('#c6d2b4')+sun(244,58,12);
        out+=path('M118 212V152','none','stroke="'+shade+'" stroke-width="2.6"')+ellipse(112,140,34,21,mid)+ellipse(134,132,24,16,mid)+ellipse(104,132,16,12,light);
        out+=path('M134 132l18 -10','none','stroke="'+shade+'" stroke-width="1.8"');
        if(q>.3){out+='<g transform="translate(152 122) rotate(-18)"><ellipse rx="2.6" ry="5" fill="'+ink+'"/><ellipse rx="4.6" ry="1.8" transform="translate(-2 -3) rotate(-40)" fill="'+mid+'" stroke="none"/><ellipse rx="4.6" ry="1.8" transform="translate(1 -3) rotate(30)" fill="'+mid+'" stroke="none"/></g>';}
        for(i=0;i<3;i++)out+='<g opacity="'+(Math.max(0,.7-q)*1)+'"><path d="M162 112a'+(12+i*8)+' '+(12+i*8)+' 0 0 1 '+(12+i*8)+' -'+(12+i*8)+'" fill="none" stroke="'+ink+'" stroke-width="1"/></g>';
        out+=pond(58,11);
        break;
      /* 大暑 · 骄阳荷开 */
      case 'dashu':
        out+=sky('#ecf1df')+hills('#dbe2c9')+ground('#bdd1ac')+sun(96,56,14);
        out+=ellipse(180,222,112,20,'#b6d1c7');
        out+=ellipse(128,214,26,10,mid)+ellipse(248,216,22,9,shade);
        out+='<g transform="translate(184 '+(216-q*7)+') scale('+(.3+q*.7)+')">'+ellipse(0,-7,3.6,9,'#e8aeb9')+'<g transform="rotate(62)">'+ellipse(0,0,3.6,9,'#e8aeb9')+'</g><g transform="rotate(-62)">'+ellipse(0,0,3.6,9,'#e8aeb9')+'</g></g>';
        out+=ellipse(214,222,30,11,mid);
        break;
      /* 立秋 · 一叶知秋：叶变色而落 */
      case 'liqiu':
        out+=sky()+hills('#d9dfc5')+ground('#c6cfa6');
        out+=path('M60 96Q130 84 176 104','none','stroke="'+shade+'" stroke-width="2"');
        var lcol='rgb('+Math.round(120+q*90)+','+Math.round(170-q*60)+','+Math.round(90-q*40)+')';
        if(q<.5)out+=leaf(168,106,1.2,-30,lcol);
        else out+='<g transform="translate('+(168+(q-.5)*90)+' '+(106+(q-.5)*(q-.5)*300)+') rotate('+(q*160)+')"><g>'+path('M0 0C-24-5-24-24 0-36C22-22 24-6 0 0Z',lcol)+'</g></g>';
        out+=sun(250,58,10);
        break;
      /* 处暑 · 暑气渐敛 */
      case 'chushu':
        out+=sky()+hills('#d9ddc4')+ground('#c4cba6')+sun(92,58,15-q*8);
        for(i=0;i<4;i++)out+='<g opacity="'+(Math.max(0,1-q*.9))+'">'+path('M'+(148+i*26)+' 150q-8-10 0-20t0-20','none','stroke="'+accent+'"')+'</g>';
        for(i=0;i<5;i++)out+=sprout(116+i*30,228,6+q*16,.2);
        break;
      /* 白露 · 露凝而白 */
      case 'bailu':
        out+=sky('#e9efe2')+hills('#d4ddc6')+ground('#c3d1b2');
        out+='<ellipse cx="180" cy="196" rx="120" ry="26" fill="#eef2ea" opacity=".55"/>';
        out+=leaf(180,204,1.6,15);
        for(i=0;i<5;i++)out+=circle(165+i*8,182+i*5,1+q*3.2,'#dce9e6');
        out+=sun(88,62,9);
        break;
      /* 秋分 · 稻熟月圆 */
      case 'qiufen':
        out+=sky('#eef0e2')+hills('#dcd8bd')+ground('#d2c489')+circle(242,72+(1-q)*26,26,'#f3ecd8');
        for(i=0;i<8;i++)out+=grain(88+i*28,228-(i%2)*8,.2+q*.8);
        break;
      /* 寒露 · 鸿雁南飞 */
      case 'hanlu':
        out+=sky('#e9ede0')+hills('#d8dcc0')+ground('#c1c9a2');
        for(i=0;i<5;i++)out+=bird(64+q*182+i*19-(i%2)*9,62+i*13+(i%2)*7,.9-i*.1);
        out+=circle(228,216,7,accent);
        for(i=0;i<6;i++){a=i*Math.PI/3;out+=ellipse(228+Math.cos(a)*9,216+Math.sin(a)*9,4,2.4,accent);}
        for(i=0;i<4;i++)out+=circle(112+i*14,212+(i%2)*6,1.6+q*2,'#dce9e6');
        break;
      /* 霜降 · 霜华遍野 */
      case 'shuangjiang':
        out+=sky('#e8ebe0')+hills('#d5d8c2')+ground('#c3c6ab');
        out+=leaf(150,200,1.3,10)+leaf(212,208,1.1,-20);
        for(i=0;i<12;i++)out+=crystal(120+(i%4)*45,182+Math.floor(i/4)*17,Math.max(.02,q-i*.05)*.7,i*23);
        for(i=0;i<3;i++)out+=leaf(84+i*96,76+i*15,.8,i*40-20,'rgb(200,120,80)');
        break;
      /* 立冬 · 水始冰：冰缘自岸向心合拢 */
      case 'lidong':
        out+=sky('#e8ece2')+hills('#cfd4c2')+ground('#c6c9b2');
        out+=ellipse(185,218,96,18,'#b6d1c7');
        out+='<ellipse cx="185" cy="218" rx="'+(10+q*84)+'" ry="'+(2.4+q*15)+'" fill="#e3ebe8" opacity=".92"/>';
        for(i=0;i<4;i++)out+=path('M'+(96+i*11)+' 216q4 -20 '+(Math.sin(q*7+i)*4)+' -32','none','stroke="'+dark+'" stroke-width="1.2"')+'<ellipse cx="'+(97+i*11+Math.sin(q*7+i)*4)+'" cy="'+(184)+'" rx="2.4" ry="5" fill="'+accent+'"/>';
        break;
      /* 小雪 · 雪片初霁 */
      case 'xiaoxue':
        out+=sky('#e7ebe4')+hills('#d3d7c8');
        out+=path('M60 212Q150 203 300 210V240H60Z','#eef0ea');
        for(i=0;i<12;i++)out+=flake(88+(i%6)*34+Math.sin(q*6+i)*7,40+((q*160+i*29)%168),1.4+(i%2)*.7);
        out+=path('M60 96Q130 84 182 106','none','stroke="'+shade+'" stroke-width="2"');
        break;
      /* 大雪 · 积雪封枝 */
      case 'daxue':
        out+=sky('#e4e9e2')+hills('#cfd4c6');
        out+=path('M60 210Q150 198 300 206V240H60Z','#e9ebe2');
        out+=path('M120 212V150','none','stroke="'+shade+'" stroke-width="2.8"');
        out+=ellipse(120,138,42,25,'#9fb39a')+ellipse(104,130,18,13,'#b3c2ab')+ellipse(138,132,20,14,'#b3c2ab');
        out+='<ellipse cx="120" cy="118" rx="'+(20+q*26)+'" ry="'+(5+q*7)+'" fill="#f2f3ec"/>';
        for(i=0;i<14;i++)out+=flake(84+(i%7)*32+Math.sin(q*5+i)*8,40+((q*164+i*27)%160),1.4+(i%2)*.8);
        break;
      /* 冬至 · 日轨至低：短日雪原，梅含苞 */
      case 'dongzhi':
        out+=sky('#e6e9e0')+hills('#ced3c5');
        out+=path('M60 214Q150 202 300 210V240H60Z','#eef0ea');
        out+=path('M80 176Q180 120 280 176','none','stroke="#c9b98a" stroke-dasharray="4 5" stroke-width="1.2"');
        a=Math.PI*(1-q);out+=sun(180+Math.cos(a)*100,176-Math.sin(a)*54,11);
        out+=path('M212 214Q208 176 226 150M216 186l24-16M214 170l-22-14','none','stroke="'+shade+'" stroke-width="2"');
        if(q>.45)for(i=0;i<4;i++)out+=blossom(230+i*7,168-i*7);
        break;
      /* 小寒 · 江河封冻 */
      case 'xiaohan':
        out+=sky('#e6eae1')+hills('#ccd2c4')+ground('#d2d5c8');
        out+=path('M60 222Q150 210 300 218V240H60Z','#b6d1c7');
        out+='<path d="M60 222Q150 210 300 218V240H60Z" fill="#dfe8e6" opacity="'+(q*.95)+'"/>';
        for(i=0;i<4;i++)if(q>.5+i*.12)out+=path('M'+(108+i*42)+' 226l11 8-6 9','none','stroke="#aebbb2" stroke-width="1.2"');
        for(i=0;i<10;i++)out+=flake(90+(i%5)*40+Math.sin(q*5+i)*8,44+((q*130+i*23)%120),1.3+(i%2)*.6);
        break;
      /* 大寒 · 寒梅怒放 */
      case 'dahan':
        out+=sky('#e5e9e1')+hills('#cdd2c6');
        out+=path('M60 214Q150 202 300 210V240H60Z','#f0f1ea');
        out+=path('M124 218Q152 152 202 120M166 148l32-20M148 172l-30-12M180 132l20 6','none','stroke="'+shade+'" stroke-width="2"');
        var pts=[[198,122],[196,150],[136,160],[158,152],[212,140],[150,180]];
        for(i=0;i<Math.round(q*6);i++)out+=blossom(pts[i][0],pts[i][1]);
        break;
    }
    return out;
  }
  function render(id,p,icon){var d=data[id];return d?'<svg class="seasonal-svg'+(icon?' seasonal-icon':'')+'" viewBox="60 25 240 215" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(d.name+'：'+d.theme+'示意')+'">'+scene(id,p)+'</svg>':'';}
  function wellness(term,compact){var d=data[typeof term==='string'?term:term.id];if(!d)return '';return '<section class="seasonal-wellness"><h3>顺时食养</h3><p><b>传统食养观念</b> '+esc(d.traditional)+'</p><p><b>现代饮食建议</b> '+esc(d.modern)+'</p>'+(compact?'':'<p><b>日常起居</b> '+esc(d.routine)+'</p>')+'<small>一般科普，不能代替诊疗；食材选择先遵守你的过敏与饮食限制，不自行使用药材。</small></section>';}
  function card(term){var d=data[typeof term==='string'?term:term.id];if(!d)return '';
    var vm=videoMeta[d.id];
    var stageHtml=vm
      ?'<video class="seasonal-video" data-seasonal-video src="'+vm.src+'?v=20261110.6" muted loop playsinline preload="metadata" aria-label="'+esc(vm.alt)+'"></video>'
      :render(d.id,.7);
    var ctrlHtml=vm
      ?'<button type="button" data-seasonal-toggle aria-pressed="false">播放</button><button type="button" data-seasonal-replay>重播</button><output data-seasonal-readout>实拍自然 · 10 秒循环 · 静音</output>'
      :'<button type="button" data-seasonal-toggle aria-pressed="false">播放</button><button type="button" data-seasonal-replay>重播</button><output data-seasonal-readout>静态示意 · 8 秒</output>';
    return '<section class="seasonal-card" data-seasonal="'+d.id+'"><div class="seasonal-heading"><span>节气观察室 · '+(vm?'实拍自然':'8 秒图解')+'</span><h3>'+esc(d.theme)+'</h3></div><div class="seasonal-stage" data-seasonal-stage>'+stageHtml+'</div><div class="seasonal-controls">'+ctrlHtml+'</div>'+(vm?'':'<label class="seasonal-scrubber">观察进度<input type="range" min="0" max="100" value="70" aria-label="图解时间进度" data-seasonal-progress></label>')+'<p class="seasonal-caption">'+esc(d.explanation)+'</p><p class="seasonal-note">'+(vm?'实拍素材经加速与剪辑 · 各地物候不同步 · 图片与视频仅供意象参考':'定性示意 · 时间经过压缩 · 代表意象并非各地同步实况')+'</p><div class="seasonal-copy"><h3>天文与时令</h3><p><b>太阳黄经 '+d.longitude+'°</b> · '+esc(d.meaning)+'</p><p>每隔黄经15°为一个节气；实际交节以当年时刻为准，公历日期范围只是参考。</p><p><b>气候与地域</b> '+esc(d.climate)+'</p><h3>常见误解</h3><p>'+esc(d.misconception)+'</p></div>'+wellness(term,false)+'</section>';}
  var cleanups=[];
  function dispose(){cleanups.splice(0).forEach(function(fn){fn();});}
  function mount(root){
    dispose(); if(!root||!root.querySelectorAll)return;
    root.querySelectorAll('[data-seasonal]').forEach(function(el){
      var id=el.dataset.seasonal,stage=el.querySelector('[data-seasonal-stage]'),toggle=el.querySelector('[data-seasonal-toggle]'),replay=el.querySelector('[data-seasonal-replay]'),slider=el.querySelector('[data-seasonal-progress]'),output=el.querySelector('[data-seasonal-readout]');
      if(!data[id]||!stage)return;
      var vid=el.querySelector('[data-seasonal-video]');
      var media=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false},playing=false,visible=true,frame=0,elapsed=0,last=0,dead=false;
      if(vid){
        function vlabel(){toggle.textContent=vid.paused?'播放':'暂停';toggle.setAttribute('aria-pressed',String(!vid.paused));}
        function vgo(){var p=vid.play();if(p&&p.catch)p.catch(function(){});}
        function vauto(){if(dead)return;if(!media.matches&&visible&&!document.hidden){if(vid.paused)vgo();}else{if(!vid.paused)vid.pause();}}
        function vplay(){if(vid.paused)vgo();else vid.pause();}
        function vreplay(){try{vid.currentTime=0;}catch(e){}vgo();}
        toggle.addEventListener('click',vplay);replay.addEventListener('click',vreplay);
        vid.addEventListener('play',vlabel);vid.addEventListener('pause',vlabel);
        document.addEventListener('visibilitychange',vauto);
        if(media.addEventListener)media.addEventListener('change',vauto);
        var vobs=window.IntersectionObserver?new window.IntersectionObserver(function(entries){entries.forEach(function(e){if(e.target===el)visible=e.isIntersecting;});vauto();},{threshold:.05}):null;
        if(vobs)vobs.observe(el);
        vlabel();vauto();
        cleanups.push(function(){dead=true;if(!vid.paused)vid.pause();if(vobs)vobs.disconnect();toggle.removeEventListener('click',vplay);replay.removeEventListener('click',vreplay);document.removeEventListener('visibilitychange',vauto);if(media.removeEventListener)media.removeEventListener('change',vauto);});
        return;
      }
      function paint(){stage.innerHTML=render(id,elapsed/8000);slider.value=Math.round(elapsed/80);output.textContent=(elapsed/1000).toFixed(1)+' / 8 秒 · 示意';}
      function cancel(){if(frame)window.cancelAnimationFrame(frame);frame=0;last=0;}
      function label(){toggle.textContent=playing?'暂停':'播放';toggle.setAttribute('aria-pressed',String(playing));}
      function tick(now){frame=0;if(dead||!playing||!visible||document.hidden||media.matches)return;var dt=last?Math.min(now-last,100):0;last=now;elapsed=Math.min(8000,elapsed+dt);paint();if(elapsed>=8000){playing=false;label();return;}frame=window.requestAnimationFrame(tick);}
      function schedule(){cancel();if(playing&&visible&&!document.hidden&&!media.matches)frame=window.requestAnimationFrame(tick);}
      function play(){if(media.matches){playing=false;elapsed=8000;paint();output.textContent='低动态模式 · 已显示终态，可拖动观察';}else{if(elapsed>=8000)elapsed=0;playing=!playing;schedule();}label();}
      function restart(){elapsed=0;playing=false;if(media.matches){paint();output.textContent='低动态模式 · 可拖动观察';}else{playing=true;paint();schedule();}label();}
      function scrub(){playing=false;cancel();elapsed=Number(slider.value)*80;paint();label();}
      function visibility(){schedule();}
      function motion(){if(media.matches){playing=false;elapsed=8000;paint();label();}schedule();}
      toggle.addEventListener('click',play);replay.addEventListener('click',restart);slider.addEventListener('input',scrub);document.addEventListener('visibilitychange',visibility);
      if(media.addEventListener)media.addEventListener('change',motion);
      var observer=window.IntersectionObserver?new window.IntersectionObserver(function(entries){entries.forEach(function(e){if(e.target===el)visible=e.isIntersecting;});schedule();},{threshold:.05}):null;
      if(observer)observer.observe(el);
      elapsed=media.matches?8000:0;paint();if(media.matches)output.textContent='低动态模式 · 静态示意';
      cleanups.push(function(){dead=true;cancel();if(observer)observer.disconnect();toggle.removeEventListener('click',play);replay.removeEventListener('click',restart);slider.removeEventListener('input',scrub);document.removeEventListener('visibilitychange',visibility);if(media.removeEventListener)media.removeEventListener('change',motion);});
    });
  }
  // 独立徽记系统：120画布，在58/64px仍能读清中心意象；不缩小教学装置。
  function icon(id){
    var d=data[id];if(!d)return '';
    var gold='#bc8b49',pale='#e7ecdd',shape='',i,a;
    function P(s,f){return '<path d="'+s+'"'+(f?' fill="'+f+'"':'')+'/>';}
    function C(x,y,r,f){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"'+(f?' fill="'+f+'"':'')+'/>';}
    function E(x,y,rx,ry,angle,f){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+angle+' '+x+' '+y+')"'+(f?' fill="'+f+'"':'')+'/>';}
    function L(x,y,s,r,f){return '<g transform="translate('+x+' '+y+') rotate('+r+') scale('+s+')">'+P('M0 0C-20-2-25-22 0-39C25-21 20-3 0 0Z',f||pale)+P('M0 0V-31')+'</g>';}
    function D(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')">'+P('M0-21C-4-13-15-3-15 6A15 15 0 0 0 15 6C15-3 4-13 0-21Z',pale)+P('M-8 7q1 7 8 7')+'</g>';}
    function S(x,y,r){var s=C(x,y,r,gold);for(var j=0;j<8;j++){var t=j*Math.PI/4;s+=P('M'+(x+Math.cos(t)*(r+5))+' '+(y+Math.sin(t)*(r+5))+'l'+Math.cos(t)*5+' '+Math.sin(t)*5);}return s;}
    function F(x,y,s){var out='';for(var j=0;j<3;j++)out+='<g transform="translate('+x+' '+y+') rotate('+(j*60)+') scale('+s+')">'+P('M-18 0H18M-12-5l5 5-5 5M12-5l-5 5 5 5')+'</g>';return out;}
    function W(x,y,s){var out='<g transform="translate('+x+' '+y+') scale('+s+')">'+P('M0 26V-28');for(var j=0;j<4;j++)out+=E(-6,9-j*9,4,7,-40,j%2?pale:gold)+E(6,5-j*9,4,7,40,j%2?gold:pale);return out+'</g>';}
    switch(id){
      case 'lichun':shape=P('M60 88V50M41 88H79')+L(59,64,.65,-58)+L(60,51,.65,49)+C(60,89,3,gold);break;
      case 'yushui':shape=D(60,56,1.18)+P('M37 88q23 8 46 0M46 95q14 4 28 0');break;
      case 'jingzhe':shape=P('M64 26L47 53H62L54 70L79 43H63L72 26Z',gold)+E(60,83,12,6,0,pale)+C(75,81,4,gold)+P('M50 78l-6-7M49 84l-8 3M55 89l-3 7M66 89l4 7M70 77l4-7');break;
      case 'chunfen':shape=C(60,60,28,pale)+P('M60 32A28 28 0 0 1 60 88Z',gold)+P('M60 33V87M28 60H92')+C(43,59,6,'#faf7ed')+P('M73 50a10 10 0 1 0 0 18a8 8 0 0 1 0-18Z','#faf7ed');break;
      case 'qingming':shape=P('M47 91Q58 58 48 29M52 46Q73 32 91 51M53 60Q35 48 26 63');for(i=0;i<5;i++)shape+=L(35+i*12,61-(i>1?13:0),.34,i%2?14:-18,i===3?gold:pale);break;
      case 'guyu':shape=P('M60 91V49M38 92H82')+L(60,69,.63,-58)+L(60,55,.62,57)+D(36,36,.35)+D(83,41,.35);break;
      case 'lixia':shape=P('M43 92q17 5 34 0M32 83q29 8 57 0M60 85V66')+E(60,55,29,17,-12,pale)+P('M33 60L60 55L83 39M60 55L78 66')+C(60,55,3,gold);break;
      case 'xiaoman':shape=E(60,59,17,29,23,gold)+P('M48 81Q69 62 69 34M38 90H80')+L(42,88,.4,-34);break;
      case 'mangzhong':shape=W(45,62,.83)+W(77,60,.83)+P('M39 92q20 6 42-1');break;
      case 'xiazhi':shape=P('M27 80Q60 10 93 80M30 85H90')+S(73,43,11)+P('M60 84V67M54 91H66');break;
      case 'xiaoshu':shape=P('M29 47H72q15 0 15-10q0-10-11-10M28 60H86q12 0 12 10q0 10-11 10M34 73H65q9 0 9 9q0 9-10 9')+C(31,34,3,gold);break;
      case 'dashu':shape=S(60,59,22)+P('M48 88H72M53 94H67');break;
      case 'liqiu':shape=L(60,90,1.45,5,gold)+P('M60 79L43 63M61 63L79 46M47 47L59 53');break;
      case 'chushu':shape=P('M28 70H92M34 79H86M43 88H77')+P('M37 69A23 23 0 0 1 83 69',gold)+P('M60 28V36M32 43L39 49M88 43L81 49M60 39V60M53 54L60 61L67 54');break;
      case 'bailu':shape=D(60,57,1.15)+P('M35 89q25-8 50 0')+C(83,35,3,gold)+C(35,45,2,gold);break;
      case 'qiufen':shape=C(60,58,27,pale)+P('M60 31A27 27 0 0 1 60 85Z','#365449')+P('M60 31V85M30 92H90')+C(45,58,6,gold);break;
      case 'hanlu':shape=L(54,89,1.3,-29)+D(76,48,.5)+D(60,66,.34)+C(83,81,3,gold);break;
      case 'shuangjiang':shape=F(60,59,1.55)+C(60,59,4,gold)+P('M47 95H73');break;
      case 'lidong':shape=P('M28 70Q60 61 92 70M35 80Q60 73 85 80M43 90H77')+E(60,53,13,18,29,gold)+P('M55 64q11-8 10-23');break;
      case 'xiaoxue':shape=F(53,49,.85)+F(77,77,.45)+C(35,77,2.5,gold)+C(79,35,2,gold);break;
      case 'daxue':shape=F(47,48,.95)+F(77,74,.8)+P('M29 91Q46 86 59 91T92 91')+C(81,33,2.5,gold);break;
      case 'dongzhi':shape=P('M27 84Q48 49 68 84M29 89H91')+S(46,65,10)+P('M81 29a21 21 0 1 0 13 32a18 18 0 0 1-13-32Z',pale)+C(60,34,2,gold);break;
      case 'xiaohan':shape=P('M29 34L59 55L87 32M59 55L61 83L84 95M59 55L32 83M42 43L43 30M78 39L90 45M61 74L75 68M40 75L28 71M61 83L51 94')+C(59,55,4,gold);break;
      case 'dahan':shape=P('M45 93Q69 57 53 30M57 75L84 59M57 55L35 44');for(i=0;i<5;i++){a=i*Math.PI*2/5;shape+=C(70+Math.cos(a)*12,42+Math.sin(a)*12,8,pale);}shape+=C(70,42,4,gold)+C(37,43,5,gold);break;
    }
    return '<svg class="seasonal-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(d.name+'节气徽记')+'"><circle cx="60" cy="60" r="56" fill="#faf7ed" stroke="#c9d3be" stroke-width="1.5"/><circle cx="60" cy="60" r="50" fill="none" stroke="#c1ab80" stroke-width=".7" stroke-dasharray="1 6"/><g fill="none" stroke="#365449" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">'+shape+'</g></svg>';
  }
  JQ.SEASONAL={data:data,icon:icon,card:card,wellness:wellness,mount:mount,dispose:dispose,render:render};
})();
