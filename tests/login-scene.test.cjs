const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(reduced=false) {
  const events = new Map(); let queued=0, cancelled=0;
  const context = new Proxy({}, {get:(_,k)=>k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
  const canvas={width:0,height:0,isConnected:true,getContext:()=>context,getBoundingClientRect:()=>({width:360,height:300}),addEventListener(){},removeEventListener(){}};
  const document={hidden:false,addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)};
  const window={JQ:{},devicePixelRatio:3,matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)};
  const scope={window,document,Math,performance:{now:()=>0},requestAnimationFrame:()=>++queued,cancelAnimationFrame:()=>cancelled++};
  const file=__dirname+'/../js/login_scene.js';
  if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),scope);
  return {scene:window.JQ.LOGIN_SCENE,canvas,events,get queued(){return queued},get cancelled(){return cancelled}};
}
test('particle field mounts once, pauses in background and disposes all global listeners',()=>{
  const s=setup(); assert.ok(s.scene,'login scene module must exist');
  s.scene.mount(s.canvas); assert.equal(s.queued,1); assert.ok(s.events.has('visibilitychange'));
  assert.equal(s.canvas.width,540,'DPR is capped at 1.5');
  s.scene.dispose(); assert.equal(s.cancelled,1); assert.equal(s.events.size,0);
});
test('reduced motion paints a still without starting an animation loop',()=>{
  const s=setup(true); assert.ok(s.scene,'login scene module must exist');
  s.scene.mount(s.canvas); assert.equal(s.queued,0); s.scene.dispose();
});
