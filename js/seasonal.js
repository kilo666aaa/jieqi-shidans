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
  function grain(x,y,p){var out=path('M'+x+' '+y+'v-66');for(var i=0;i<5;i++)out+=ellipse(x-6,y-16-i*9,3+p*3,5,accent)+ellipse(x+6,y-20-i*9,3+p*3,5,accent);return out;}
  function tree(p){return path('M181 155V91',mid)+ellipse(181,87,49,29,mid)+ellipse(159,82,24,20,light)+ellipse(196,74,30,22,light)+ellipse(211,92,25,18,mid);}
  function base(){var out=ellipse(180,190,115,19,'#e4e6dc');out+=box(-65,-40,14,14,-8,8,mid)+box(49,-40,14,14,-8,8,mid)+box(-65,27,14,14,-8,8,mid)+box(49,27,14,14,-8,8,mid);out+=box(-76,-48,152,96,0,12,light);for(var i=0;i<4;i++){var p=point(i<2?-67:67,i%2?-39:39,1);out+=ellipse(p[0],p[1],2.1,1.1,ink);}return out;}
  function scene(id,p){
    var d=data[id]; if(!d)return ''; p=Math.max(0,Math.min(1,p));var q=p*p*(3-2*p),out=base(),i,j,a,x,y;
    switch(id){
      case 'lichun': out+=box(-34,-24,68,48,3,7,'#b8a58a')+ellipse(180,160,8,5,accent)+sprout(180,160,8+q*61,.12+q*.55);break;
      case 'yushui': out+=box(-40,-30,80,60,2,5,'#c8b79b')+box(-40,-30,80,60,3+q*2,1,'#a2b7a6');for(i=0;i<10;i++)out+=drop(130+(i%5)*25,54+((q*115+i*19)%105),.35);out+=box(-40,-30,80,60,-8-q*13,3,'#b4a087');break;
      case 'jingzhe': out+=box(-44,-29,88,58,2,13,'#b8a58a');x=155+q*60;y=151-q*18;out+=ellipse(x,y,8,5,dark)+circle(x+9,y-1,4,ink);for(i=-1;i<2;i++)out+=path('M'+(x+i*5)+' '+y+'l-6 9M'+(x+i*5)+' '+y+'l-3 -8');out+=path('M115 132V68',light)+circle(115,133,7,accent)+path('M115 128V'+(120-q*48),'none','stroke-width="4"');break;
      case 'chunfen': out+=circle(181,113,49,mid)+path('M181 64A49 49 0 0 1 181 162Z',light)+ellipse(181,113,49,15,'none')+path('M181 64V162');out+='<g transform="rotate('+(q*360)+' 181 113)">'+ellipse(181,113,17,49,'none')+'</g>';out+=sun(89,77,13);break;
      case 'qingming': out+=path('M167 164Q177 127 161 73',shade)+path('M164 93Q196 71 224 103M169 115Q140 93 118 118');for(i=0;i<7;i++)out+=leaf(119+i*16,116-Math.sin(i/6*Math.PI)*22,.1+q*.45,i%2?20:-15);break;
      case 'guyu': out+=box(-42,-30,84,60,1,10,'#b8a58a')+sprout(180,154,46,.65)+path('M180 155l-18 20m18-20l18 20m-18-20v27');for(i=0;i<5;i++){a=(q+i*.2)%1;out+=drop(180+Math.sin(a*6)*10,181-a*66,.28);}break;
      case 'lixia': out+=box(-54,-34,108,68,2,6,'#adc6bf')+path('M180 159Q180 126 190 115');out+='<g transform="translate(190 115) scale('+(0.2+q*.8)+' 1)">'+ellipse(0,0,45,19,mid)+path('M-42 0H42M0 0l23-14M0 0l-26 13')+'</g>';break;
      case 'xiaoman': out+=grain(180,165,q)+leaf(177,153,.6,-60);break;
      case 'mangzhong': out+='<g opacity="'+(1-Math.min(1,q*2))+'" transform="translate(0 '+(-q*35)+')">'+grain(149,151,1)+'</g>'+box(0,-18,45,35,2,5,'#b8a58a');for(i=0;i<5;i++)out+=ellipse(197+i*6,118+Math.max(0,(q-.4)/.6)*42,2.5,4,accent);break;
      case 'xiazhi': a=Math.PI*(1-q);out+=path('M95 146Q180-31 265 146')+sun(180+Math.cos(a)*85,146-Math.sin(a)*87,12)+path('M180 156V112',mid)+ellipse(180+q*12,158,15+Math.abs(q-.5)*60,4,shade);break;
      case 'xiaoshu': out+=box(-40,-26,80,52,2,8,mid)+ellipse(180,143,44,19,'#b6d1c7')+ellipse(180,143+q*6,39,15,'#c6e1d6');for(i=0;i<7;i++){a=(q+i/7)%1;out+=circle(150+i*10,134-a*60,2,'#d2dfd6');}break;
      case 'dashu': out+=ellipse(183+q*22,160,46,14,shade)+tree(q)+sun(101+q*110,48,13);break;
      case 'liqiu': out+=path('M180 166V116',mid)+leaf(180,132,1.8,-12,'rgb('+Math.round(180+q*29)+','+Math.round(200-q*40)+',132)');break;
      case 'chushu': out+=box(-42,-28,84,56,2,7,'#bda784');for(i=0;i<5;i++)out+='<g opacity="'+(1-q*.88)+'">'+path('M'+(145+i*18)+' 139q-10-13 0-24t0-24','none','stroke="'+accent+'"')+'</g>';out+=sun(104,56,15-q*5);break;
      case 'bailu': out+=leaf(180,164,1.8,20);for(i=0;i<5;i++)out+=drop(166+i*6,117+i*7,.05+q*.42);break;
      case 'qiufen': out+=circle(180,108,47,light)+'<g transform="rotate('+(q*35)+' 180 108)">'+path('M180 61A47 47 0 0 1 180 155Z',dark)+'</g>'+path('M130 165H230');for(i=0;i<12;i++)out+=box(-54+i*9,24,7,7,2,2,i<(6-q*2)?accent:mid);break;
      case 'hanlu': out+=box(-44,-27,88,54,10,15,mid)+leaf(180,151,1.4,68);for(i=0;i<5;i++)out+=drop(154+i*12,124+i*2,.05+q*.35);out+=circle(111,106,8,accent)+path('M111 98V'+(61+q*27),'none','stroke-width="4"');break;
      case 'shuangjiang': out+=box(-44,-27,88,54,5,8,mid);for(i=0;i<12;i++)out+=crystal(143+(i%4)*25,140+Math.floor(i/4)*9,Math.max(.02,q-i*.045)*.75,i*17);break;
      case 'lidong': out+=box(-44,-29,88,58,4,17,'#b8a58a');out+='<g transform="translate(0 '+q*12+')">'+ellipse(180,151,13,8,accent)+path('M173 147Q181 142 185 154')+'</g>';for(i=0;i<3;i++)out+='<g opacity="'+(1-q*.85)+'">'+ellipse(180,153,20+i*9,9+i*4,'none')+'</g>';break;
      case 'xiaoxue': for(i=0;i<10;i++)out+=crystal(120+(i%5)*29+Math.sin(q*5+i)*8,49+((q*91+i*13)%112),.47,i*20+q*30);break;
      case 'daxue': for(i=0;i<4;i++)out+=box(-49,-30,98,60,3+q*(i+1)*4,2,'#edf1e9');for(i=0;i<8;i++)out+=crystal(123+(i%4)*37,49+((q*80+i*19)%96),.4,i*21);break;
      case 'dongzhi': out+=path('M115 146Q180 72 245 146')+sun(115+q*130,146-Math.sin(q*Math.PI)*37,10)+path('M180 157V110',mid)+ellipse(180-q*23,160,64-q*13,6,shade);break;
      case 'xiaohan': out+=box(-50,-31,100,62,2,7,'#a7c6be')+box(-50,-31,Math.max(.1,q*100),62,4,2,'#e2ece4');for(i=0;i<6;i++)if(q>i/6)out+=path('M'+(128+i*17)+' 145l8 9-5 8');break;
      case 'dahan': out+=path('M170 165Q184 121 161 75M174 138l39-34M173 119l-35-17',shade);for(i=0;i<4;i++){x=141+i*20;y=100+(i%2)*12;out+=ellipse(x,y,3+q*3,5+q*2,accent);if(q>.55)for(j=0;j<5;j++)out+=circle(x+Math.cos(j*1.26)*q*9,y+Math.sin(j*1.26)*q*9,q*5,'#d4b5ac');}break;
    }
    return out;
  }
  function render(id,p,icon){var d=data[id];return d?'<svg class="seasonal-svg'+(icon?' seasonal-icon':'')+'" viewBox="60 25 240 215" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(d.name+'：'+d.theme+'示意')+'">'+scene(id,p)+'</svg>':'';}
  function wellness(term,compact){var d=data[typeof term==='string'?term:term.id];if(!d)return '';return '<section class="seasonal-wellness"><h3>顺时食养</h3><p><b>传统食养观念</b> '+esc(d.traditional)+'</p><p><b>现代饮食建议</b> '+esc(d.modern)+'</p>'+(compact?'':'<p><b>日常起居</b> '+esc(d.routine)+'</p>')+'<small>一般科普，不能代替诊疗；食材选择先遵守你的过敏与饮食限制，不自行使用药材。</small></section>';}
  function card(term){var d=data[typeof term==='string'?term:term.id];if(!d)return '';return '<section class="seasonal-card" data-seasonal="'+d.id+'"><div class="seasonal-heading"><span>节气观察室 · 8 秒图解</span><h3>'+esc(d.theme)+'</h3></div><div class="seasonal-stage" data-seasonal-stage>'+render(d.id,.7)+'</div><div class="seasonal-controls"><button type="button" data-seasonal-toggle aria-pressed="false">播放</button><button type="button" data-seasonal-replay>重播</button><output data-seasonal-readout>静态示意 · 8 秒</output></div><label class="seasonal-scrubber">观察进度<input type="range" min="0" max="100" value="70" aria-label="图解时间进度" data-seasonal-progress></label><p class="seasonal-caption">'+esc(d.explanation)+'</p><p class="seasonal-note">定性示意 · 时间经过压缩 · 代表意象并非各地同步实况</p><div class="seasonal-copy"><h3>天文与时令</h3><p><b>太阳黄经 '+d.longitude+'°</b> · '+esc(d.meaning)+'</p><p>每隔黄经15°为一个节气；实际交节以当年时刻为准，公历日期范围只是参考。</p><p><b>气候与地域</b> '+esc(d.climate)+'</p><h3>常见误解</h3><p>'+esc(d.misconception)+'</p></div>'+wellness(term,false)+'<details class="seasonal-sources"><summary>资料来源与审核范围</summary><p>'+esc(d.review)+'</p><p>地域食俗、三候与诗词沿用原条目，仅作待核验文化资料；未将它们纳入已核对范围。</p><ul>'+d.sources.map(function(s){return '<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'</a><small>'+esc(s.scope)+'</small></li>';}).join('')+'</ul><p>资料整理：2026-11-02。未进行医学专家审核。</p></details></section>';}
  var cleanups=[];
  function dispose(){cleanups.splice(0).forEach(function(fn){fn();});}
  function mount(root){
    dispose(); if(!root||!root.querySelectorAll)return;
    root.querySelectorAll('[data-seasonal]').forEach(function(el){
      var id=el.dataset.seasonal,stage=el.querySelector('[data-seasonal-stage]'),toggle=el.querySelector('[data-seasonal-toggle]'),replay=el.querySelector('[data-seasonal-replay]'),slider=el.querySelector('[data-seasonal-progress]'),output=el.querySelector('[data-seasonal-readout]');
      if(!data[id]||!stage)return;
      var media=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false},playing=false,visible=true,frame=0,elapsed=0,last=0,dead=false;
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
