const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const root=require('node:path').join(__dirname,'..');
const ctx={window:{},console}; ctx.window=ctx; vm.createContext(ctx);
for(const file of ['js/data_terms.js','js/data_terms_rich.js','js/seasonal.js']) vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),ctx);
const S=ctx.JQ.SEASONAL;
test('24 terms have exact astronomy, unique icons and mechanisms, honest sources',()=>{
 assert.equal(Object.keys(S.data).length,24);
 const icons=new Set(),mechanisms=new Set();
 ctx.JQ.DATA.TERMS.forEach((term,i)=>{
  const d=S.data[term.id]; assert.ok(d,term.id); assert.equal(d.longitude,(315+i*15)%360);
  for(const key of ['meaning','climate','misconception','traditional','modern','routine','explanation','review']) assert.ok(d[key]?.length>5,term.id+':'+key);
  assert.ok(d.theme.length>=4,term.id+':theme');
  assert.equal(d.duration,8); assert.ok(d.sources.every(x=>/^https:\/\//.test(x.url)&&x.scope));
  assert.match(d.review,/待/); const icon=S.icon(term.id); assert.match(icon,/<svg/); assert.match(icon,/role="img"/); assert.match(icon,/aria-label=/); assert.match(icon,/viewBox="0 0 120 120"/); icons.add(icon.replace(/aria-label="[^"]*"/g,''));
  for(const tag of icon.match(/<[^/!][^>]*>/g)||[]){const attrs=[...tag.matchAll(/\s([\w:-]+)="[^"]*"/g)].map(m=>m[1]);assert.equal(new Set(attrs).size,attrs.length,term.id+' duplicate SVG attribute');}
  mechanisms.add(d.theme); const html=S.card(term); assert.match(html,/data-seasonal-stage/); assert.match(html,/data-seasonal-replay/); assert.match(html,/太阳黄经/); assert.match(html,/审核/);
  assert.match(S.wellness(term,true),/传统/); assert.match(S.wellness(term,false),/现代/);
  assert.notEqual(S.render(term.id,0),S.render(term.id,.63),term.id+' must change state');
 }); assert.equal(icons.size,24); assert.equal(mechanisms.size,24);
});
test('correct existing scientific errors without promoting old poetry to reviewed',()=>{
 const terms=ctx.JQ.DATA.TERMS;
 assert.doesNotMatch(terms.find(t=>t.id==='lichun').houEx[0],/始凝/);
 assert.doesNotMatch(terms.find(t=>t.id==='jingzhe').mean,/惊醒/);
 assert.match(terms.find(t=>t.id==='jingzhe').houEx[2],/不是|不代表/);
 assert.equal(terms[0].poem.status,'demo');
 assert.equal(S.icon('unknown'),''); assert.equal(S.card({id:'unknown'}),'');
});
test('play/pause/replay, visibility, reduced motion, and dispose release resources',()=>{
 const raf=new Map(),listeners=new Map();let serial=0,observer;
 const element=()=>({value:0,textContent:'',innerHTML:'',events:new Map(),attrs:{},addEventListener(n,f){this.events.set(n,f);},removeEventListener(n){this.events.delete(n);},setAttribute(n,v){this.attrs[n]=v;}});
 const stage=element(),toggle=element(),replay=element(),slider=element(),output=element();
 const parts={'[data-seasonal-stage]':stage,'[data-seasonal-toggle]':toggle,'[data-seasonal-replay]':replay,'[data-seasonal-progress]':slider,'[data-seasonal-readout]':output};
 const card={dataset:{seasonal:'lichun'},querySelector:s=>parts[s]};
 const root={querySelectorAll:()=>[card]};
 const media={matches:false,addEventListener(n,f){this.change=f;},removeEventListener(){this.change=null;}};
 ctx.document={hidden:false,addEventListener(n,f){listeners.set(n,f);},removeEventListener(n){listeners.delete(n);}};
 ctx.matchMedia=()=>media;ctx.requestAnimationFrame=f=>{raf.set(++serial,f);return serial;};ctx.cancelAnimationFrame=n=>raf.delete(n);
 ctx.IntersectionObserver=class{constructor(fn){this.fn=fn;observer=this;}observe(){}disconnect(){this.disconnected=true;}};
 const frame=time=>{const callbacks=[...raf.values()];raf.clear();callbacks.forEach(fn=>fn(time));};
 S.mount(root);assert.equal(slider.value,0);toggle.events.get('click')();assert.equal(toggle.textContent,'暂停');
 frame(1);frame(101);assert.equal(slider.value,1);
 toggle.events.get('click')();assert.equal(raf.size,0);assert.equal(toggle.textContent,'播放');
 replay.events.get('click')();assert.equal(slider.value,0);assert.equal(raf.size,1);
 observer.fn([{target:card,isIntersecting:false}]);assert.equal(raf.size,0);
 observer.fn([{target:card,isIntersecting:true}]);assert.equal(raf.size,1);
 ctx.document.hidden=true;listeners.get('visibilitychange')();assert.equal(raf.size,0);
 ctx.document.hidden=false;listeners.get('visibilitychange')();assert.equal(raf.size,1);
 replay.events.get('click')();frame(1000);for(let t=1100;t<=9000;t+=100)frame(t);
 assert.equal(slider.value,100);assert.equal(toggle.textContent,'播放');assert.equal(raf.size,0);
 media.matches=true;media.change();assert.equal(raf.size,0);assert.equal(slider.value,100);
 slider.value=30;slider.events.get('input')();assert.equal(slider.value,30);assert.equal(raf.size,0);
 S.dispose();assert.equal(toggle.events.size,0);assert.equal(listeners.size,0);assert.equal(media.change,null);assert.equal(observer.disconnected,true);
 S.dispose();assert.equal(raf.size,0);
});
