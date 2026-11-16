/* 节气食单 · 视图：交付补全页（关于 / 免责 / 本机数据 / AI服务说明 / 分享卡 / 404）
   这些页面此前作为设置页内区块存在，为线框图与高保真图一一对应拆为独立页面 */
(function () {
  'use strict';
  window.JQ = window.JQ || {};
  JQ.VIEWS = JQ.VIEWS || {};

  JQ.VIEWS.about = function () {
    var view = JQ.$('#view');
    var s = JQ.ACCOUNT ? JQ.ACCOUNT.session() : null;
    view.innerHTML =
      JQ.HEADER('关于', '', true) +
      '<div class="wrap">' +

      '<div class="home-hero" style="padding:8px 0 2px">' +
      '<div class="moongate" style="width:min(44vw,168px)"><svg viewBox="0 0 400 400" role="img" aria-label="节气食单标识">' + JQ.marksSVG(JQ.DATA.TERMS[0], { cls: 'about-mark' }) + '</svg></div>' +
      '<h2 class="hero-name" style="font-size:32px;margin:6px 0 2px">节气食单</h2>' +
      '<div class="hero-poem">不时不食 · 顺时而餐</div>' +
      '</div>' +

      '<div class="card"><h2>这是一份什么产品</h2>' +
      '<div style="font-size:15px;line-height:1.95">以二十四节气为线索的时令食单：每个节气给出<b>当日食单、物候解释、传统食俗与现代营养视角</b>。传统文化的部分不冒充科学结论，现代营养的部分不作疗效承诺——两个视角并置，让用户自己判断。</div>' +
      '<hr class="divider">' +
      '<div class="small" style="color:var(--ink2);line-height:1.9">文化锚点：《论语·乡党》"不时，不食"。<br>定位：文化传播 + 文化教育方向的课程数字产品。</div></div>' +

      '<div class="card"><h2>版本与技术</h2>' +
      '<div class="ing-row"><span>当前版本</span><span class="muted">第一版 · 访客模式 + 本机账号</span></div>' +
      '<div class="ing-row"><span>技术形态</span><span class="muted">纯静态 H5 · Hash 路由</span></div>' +
      '<div class="ing-row"><span>AI 能力</span><span class="muted">DeepSeek（云端免密钥 / 个人密钥）</span></div>' +
      '<div class="ing-row"><span>数据与授权</span><span class="muted">本机存储 · 不上传个人数据</span></div>' +
      (s ? '<div class="ing-row"><span>当前登录</span><span class="muted">' + JQ.esc(s.nickname) + '（本机账号）</span></div>' : '') +
      '</div>' +

      '<div class="card"><h2>团队</h2>' +
      '<div class="small" style="color:var(--ink2);line-height:2">"以赛促学 · 技术赋能文化创意"课程项目组。<br>产品设计与研发：一组。</div></div>' +
      '<div style="height:8px"></div>' +
      '</div>';
  };

  JQ.VIEWS.disclaimer = function () {
    var view = JQ.$('#view');
    view.innerHTML =
      JQ.HEADER('免责与说明', '', true) +
      '<div class="wrap">' +
      '<div class="card"><h2>内容边界</h2>' +
      '<div style="font-size:15px;line-height:2">' +
      '<b>① 课程演示项目。</b>节气与菜谱内容为课程演示整理，不作为商业产品发布。<br>' +
      '<b>② 民俗与科学分区。</b>传统食俗与现代营养建议分区呈现；民俗不作疗效承诺，涉及健康请咨询专业人士。<br>' +
      '<b>③ AI 回答需核验。</b>AI 回答由大模型生成，可能存在错误，请核验后采纳；过敏硬限制之外的内容请自行判断。<br>' +
      '<b>④ 交节数据来源。</b>2026 年引自香港天文台，2027–2029 年引自历表整理；实际交节以当年权威发布为准。' +
      '</div></div>' +
      '<div class="card"><h2>素材授权</h2>' +
      '<div style="font-size:15px;line-height:2">节气观察室实拍视频与月洞门实景照片来自 <b>Mixkit / Lorem Picsum</b>（免费商用授权，无需署名）；思源宋体依据 SIL OFL 授权本地分发；界面插画为课程原创 SVG。</div></div>' +
      '<div style="height:8px"></div>' +
      '</div>';
  };

  JQ.VIEWS.data = function () {
    var view = JQ.$('#view');
    var keys = [
      ['偏好设置', '口味、场景与过敏硬限制'],
      ['收藏夹', '菜谱、节气知识与 AI 答案'],
      ['打卡记录', '节气打卡与连续天数'],
      ['本机账号', '昵称与登录态（不联网）'],
      ['AI 配置', '个人密钥与模型选择']
    ].map(function (k) {
      return '<div class="ing-row"><span>' + k[0] + '</span><span class="muted">' + k[1] + '</span></div>';
    }).join('');
    view.innerHTML =
      JQ.HEADER('本机数据', '', true) +
      '<div class="wrap">' +
      '<div class="card"><h2>你的数据都存在哪</h2>' +
      '<div style="font-size:15px;line-height:1.95">全部保存在<b>当前浏览器</b>（localStorage），不上传服务器、不跨设备同步。清理浏览器数据或使用无痕窗口后，这些数据会消失。</div></div>' +
      '<div class="card"><h2>存储清单</h2>' + keys + '</div>' +
      '<div class="card"><h2>管理</h2>' +
      '<button class="btn btn-danger btn-block" id="data-export">导出为文本备份</button>' +
      '<button class="btn btn-danger btn-block" style="margin-top:10px" id="data-clear">清除本机全部数据</button>' +
      '</div>' +
      '<div style="height:8px"></div>' +
      '</div>';
    JQ.$('#data-export').addEventListener('click', function () {
      var dump = {};
      ['prefs', 'favs', 'checkin', 'account', 'ai_cfg'].forEach(function (k) {
        try { dump[k] = JQ.STORE.get(k, null); } catch (e) { }
      });
      if (JQ.util && JQ.util.download) { JQ.util.download(JSON.stringify(dump, null, 2), 'jqsq-backup.txt', 'text/plain'); }
      else { JQ.toast('已生成备份内容，请长按复制', 'ok'); }
    });
    JQ.$('#data-clear').addEventListener('click', function () {
      JQ.confirm('清除本机全部数据？', '将删除偏好、收藏、打卡、账号与 AI 配置，不可恢复。', '确认清除', function () {
        if (JQ.STORE.clearAll()) { JQ.toast('本机数据已清空', 'ok'); location.hash = '#/home'; }
      }, true);
    });
  };

  JQ.VIEWS.aiInfo = function () {
    var view = JQ.$('#view');
    var st = JQ.AI.status();
    view.innerHTML =
      JQ.HEADER('AI 服务说明', '', true) +
      '<div class="wrap">' +
      '<div class="card"><h2>当前接入方式</h2>' +
      '<div class="notice-green" style="margin:0 0 12px">✅ ' + (st.mode === 'cloud' ? '云端免密钥接入：密钥保存在服务端，不出现在网页代码中' : st.mode === 'team' ? '团队共享接入：密钥安全地保存在团队代理服务端' : '个人密钥模式：密钥只保存在你的本机浏览器') + '</div>' +
      '<div class="ing-row"><span>模型</span><span class="muted">' + JQ.esc(st.model || 'deepseek-chat') + '</span></div>' +
      '<div class="ing-row"><span>状态</span><span class="muted">' + (st.ready ? '已接通' : '未配置') + '</span></div>' +
      '</div>' +
      '<div class="card"><h2>它能做什么</h2>' +
      '<div style="font-size:15px;line-height:1.95">节气饮食问答、菜谱追问与替代建议、顺时起居参考。回答以<b>本产品的节气知识库</b>为上下文，减少空泛输出。</div></div>' +
      '<div class="card"><h2>边界与隐私</h2>' +
      '<div style="font-size:15px;line-height:1.95">个人密钥只存在本机，不写入网页代码、不随链接分享、不发送给除模型服务商以外的任何一方；对话记录只存在当前页面，刷新即消失；收藏的答案长期保存在本机。</div></div>' +
      '<button class="btn btn-plain btn-block" id="ai-goto">去配置个人密钥（可选）</button>' +
      '<div style="height:8px"></div>' +
      '</div>';
    JQ.$('#ai-goto').addEventListener('click', function () { JQ._SEC = 'sec-ai'; location.hash = '#/me/settings'; });
  };

  JQ.VIEWS.shareCard = function () {
    var view = JQ.$('#view');
    var cur = JQ.SOLAR.current();
    var t = (cur.ok && cur.term) || JQ.DATA.TERMS[0];
    var link = 'https://jieqi-shidan-36422.app.workbuddy.host/?t=' + t.id;
    view.innerHTML =
      JQ.HEADER('分享', '', true) +
      '<div class="wrap" style="text-align:center">' +
      '<div class="card" style="padding:22px 16px">' +
      '<div class="share-stage" style="position:relative;width:min(64vw,240px);aspect-ratio:3/4;margin:0 auto;border-radius:16px;overflow:hidden;background:var(--paper2);border:1px solid var(--line)">' +
      '<div class="moongate" style="width:min(52vw,190px);margin:26px auto 10px"><svg viewBox="0 0 400 400" role="img" aria-label="' + JQ.esc(t.name) + '意象">' + JQ.moongateSVG(t) + '</svg></div>' +
      '<div class="serif" style="font-size:28px;letter-spacing:.14em">' + JQ.esc(t.name) + '</div>' +
      '<div class="small muted" style="letter-spacing:.3em;margin-top:4px">' + JQ.esc(t.pinyin) + '</div>' +
      '<div class="small" style="color:var(--ink2);line-height:1.8;margin:12px 14px 8px">' + JQ.esc(t.e || '') + '</div>' +
      '<div class="small muted" style="position:absolute;left:0;right:0;bottom:10px;letter-spacing:.18em">节气食单 · 不时不食</div>' +
      '</div>' +
      '<div class="small muted" style="margin-top:14px">好友打开链接即直达「' + JQ.esc(t.name) + '」食单，无需安装</div>' +
      '</div>' +
      '<div class="card" style="text-align:left"><h2>分享方式</h2>' +
      '<div class="ing-row"><span>口令直达</span><span class="muted" style="font-size:13.5px">链接带 ?t=' + JQ.esc(t.id) + '</span></div>' +
      '<div class="ing-row"><span>NFC 碰一碰</span><span class="muted">贴纸写入同链接，免安装</span></div>' +
      '<button class="btn btn-primary btn-block" style="margin-top:14px" id="share-copy">复制分享链接</button>' +
      '</div>' +
      '<div style="height:8px"></div>' +
      '</div>';
    JQ.$('#share-copy').addEventListener('click', function () {
      if (navigator.clipboard) { navigator.clipboard.writeText(link); JQ.toast('链接已复制', 'ok'); }
      else { JQ.toast(link, '', 4000); }
    });
  };

  JQ.VIEWS.notFound = function (path) {
    var view = JQ.$('#view');
    view.innerHTML =
      JQ.HEADER('404', '', true) +
      '<div class="wrap">' +
      '<div class="card state-box" style="text-align:center;padding:34px 18px">' +
      '<div class="serif" style="font-size:72px;line-height:1;letter-spacing:.1em">肆零肆</div>' +
      '<div class="serif" style="font-size:15px;color:var(--ink2);letter-spacing:.28em;margin:14px 0 4px">查无此页</div>' +
      '<div class="small muted" style="margin:10px 0 20px">' + (path ? '路径 <code>' + JQ.esc(path) + '</code> 不存在，或该节气还在路上。' : '你要找的页面不在这里。') + '</div>' +
      '<a class="btn btn-primary" href="#/home">回首页 · 看今日食单</a>' +
      '<div style="height:10px"></div>' +
      '<a class="btn btn-ghost btn-block" href="#/term">去节气百科逛逛</a>' +
      '</div>' +
      '<div style="height:8px"></div>' +
      '</div>';
  };
})();
