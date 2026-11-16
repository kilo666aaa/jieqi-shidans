/* 禾知：按需加载点云，真实请求状态由问答视图传入。 */
(function(){
  'use strict';window.JQ=window.JQ||{};
  var active=null,library=null,paused=false;
  var labels={idle:'移近或轻触，点阵会回应',thinking:'正在整理你的问题',answering:'正在回答',answered:'回答已整理好',error:'这次请求未完成'};
  function avatar(){return '<svg class="hezhi-fallback" viewBox="0 0 300 260" aria-hidden="true"><defs><pattern id="hezhi-dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#6F8D70"/></pattern><linearGradient id="hezhi-leaf" x2="1" y2="1"><stop stop-color="#AAC19A"/><stop offset="1" stop-color="#3D6A4E"/></linearGradient></defs><ellipse cx="150" cy="196" rx="92" ry="18" fill="none" stroke="#B8BA9A" stroke-dasharray="1 7"/><path d="M149 62C93 60 86 119 101 170C118 222 169 219 187 176C215 115 197 62 149 62Z" fill="#DDE1CE"/><path d="M149 62C93 60 86 119 101 170C118 222 169 219 187 176C215 115 197 62 149 62Z" fill="url(#hezhi-dots)"/><path d="M149 71C150 30 182 18 216 29C204 60 179 77 149 71Z" fill="url(#hezhi-leaf)"/><path d="M151 72L202 36" stroke="#DFDEBB" fill="none"/><circle cx="137" cy="133" r="3" fill="#29493B"/><circle cx="162" cy="133" r="3" fill="#29493B"/><path d="M145 149Q150 154 155 149" stroke="#537057" fill="none" stroke-linecap="round"/></svg>';}
  function html(term,ready){return '<section class="hezhi-panel" data-hezhi data-hezhi-state="idle" data-renderer="fallback" aria-label="禾知食养助手">'+
    '<div class="hezhi-figure"><div class="hezhi-orbit" aria-hidden="true"></div>'+avatar()+'<div class="hezhi-webgl" data-hezhi-canvas role="img" aria-label="禾知：谷粒与稻叶组成的三维点阵形象"></div><button type="button" class="hezhi-motion" data-hezhi-motion aria-pressed="false">暂停动效</button></div>'+
    '<div class="hezhi-intro"><div class="hezhi-eyebrow"><span>禾知 · 食养助手</span><span class="hezhi-service'+(ready?' is-ready':'')+'">'+(ready?'服务已配置':'服务待连接')+'</span></div><h2>这一餐，顺着节气吃</h2><p class="hezhi-description">聊时令、选菜品，也能帮你找替代食材。</p><div class="hezhi-tags">'+(term?'<span>'+JQ.esc(term.name)+'食养</span>':'')+'<span>食堂选菜</span><span>食俗文化</span></div><p class="hezhi-state" data-hezhi-label role="status">'+labels.idle+'</p></div></section>';}
  function load(){
    if(window.Hezhi3D)return Promise.resolve(window.Hezhi3D);
    if(!library)library=new Promise(function(resolve,reject){var script=document.createElement('script');script.src='js/vendor/hezhi-3d.js?v=20261117.3';script.onload=function(){window.Hezhi3D?resolve(window.Hezhi3D):reject(new Error('Missing point cloud'));};script.onerror=reject;document.head.appendChild(script);}).catch(function(error){library=null;throw error;});
    return library;
  }
  function dispose(){
    if(!active)return;var s=active;active=null;clearTimeout(s.pulseTimer);s.bindings.forEach(function(b){b[0].removeEventListener(b[1],b[2]);});s.media.removeEventListener('change',s.refresh);s.observer&&s.observer.disconnect();s.scene&&s.scene.dispose();document.body.classList.remove('hezhi-ask-page');
  }
  function mount(root){
    dispose();var panel=root&&root.querySelector('[data-hezhi]');if(!panel)return;
    document.body.classList.add('hezhi-ask-page');
    var s={panel:panel,host:panel.querySelector('[data-hezhi-canvas]'),button:panel.querySelector('[data-hezhi-motion]'),media:matchMedia('(prefers-reduced-motion:reduce)'),bindings:[],scene:null,mode:'idle',compact:false,visible:true,pulseTimer:0};active=s;
    function bind(node,name,fn){node.addEventListener(name,fn,{passive:true});s.bindings.push([node,name,fn]);}
    s.refresh=function(){var stop=paused||s.media.matches||document.hidden||!s.visible;s.button.disabled=s.media.matches;s.button.textContent=s.media.matches?'低动态模式':paused?'开启动效':'暂停动效';s.button.setAttribute('aria-pressed',String(paused));s.scene&&s.scene.update({paused:stop});};
    s.media.addEventListener('change',s.refresh);bind(document,'visibilitychange',s.refresh);bind(s.button,'click',function(){paused=!paused;s.refresh();});
    var figure=panel.querySelector('.hezhi-figure');
    bind(figure,'pointermove',function(e){if(s.media.matches||paused)return;var r=figure.getBoundingClientRect();s.scene&&s.scene.update({hovered:true,pointer:[(e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1]});});
    bind(figure,'pointerleave',function(e){if(paused||s.media.matches||(e&&e.pointerType==='touch'&&s.pulseTimer))return;s.scene&&s.scene.update({hovered:false,pointer:[0,0]});});
    bind(figure,'pointerdown',function(e){if(paused||s.media.matches)return;s.scene&&s.scene.update({hovered:true});if(e&&e.pointerType!=='mouse'){clearTimeout(s.pulseTimer);s.pulseTimer=setTimeout(function(){s.pulseTimer=0;if(active===s)s.scene&&s.scene.update({hovered:false});},650);}});
    bind(figure,'pointerup',function(e){if(paused||s.media.matches||(e&&e.pointerType!=='mouse'))return;s.scene&&s.scene.update({hovered:false});});
    if(window.IntersectionObserver){s.observer=new IntersectionObserver(function(entries){s.visible=entries[0].isIntersecting;s.refresh();},{threshold:.05});s.observer.observe(figure);}
    s.refresh();
    load().then(function(api){if(active!==s||!s.host.isConnected)return;s.scene=api.mount(s.host,{paused:paused||s.media.matches||document.hidden||!s.visible,mode:s.mode,compact:s.compact,
      onReady:function(){if(active===s)panel.dataset.renderer='webgl';},onError:function(){if(active!==s)return;panel.dataset.renderer='fallback';s.host.hidden=true;setTimeout(function(){s.scene&&s.scene.dispose();s.scene=null;},0);}});}).catch(function(){if(active===s)panel.dataset.renderer='fallback';});
  }
  function state(mode){if(!active)return;active.mode=labels[mode]?mode:'idle';active.panel.dataset.hezhiState=active.mode;active.panel.querySelector('[data-hezhi-label]').textContent=labels[active.mode];active.scene&&active.scene.update({mode:active.mode});}
  function compact(on){if(!active)return;active.compact=!!on;active.panel.classList.toggle('is-compact',!!on);active.scene&&active.scene.update({compact:!!on});}
  JQ.HEZHI={html:html,mount:mount,dispose:dispose,setState:state,setConversation:compact};
})();
