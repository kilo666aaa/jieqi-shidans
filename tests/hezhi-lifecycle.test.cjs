const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function setup() {
  const target = () => ({ listeners: new Map(), addEventListener(n,f) { this.listeners.set(n,f); }, removeEventListener(n) { this.listeners.delete(n); } });
  const button = Object.assign(target(),{setAttribute(){},disabled:false});
  const figure = Object.assign(target(),{getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})});
  const host = {isConnected:true};
  const label = {textContent:''};
  const panel = {dataset:{},classList:{toggle(){}},querySelector(q){return q.includes('canvas')?host:q.includes('motion')?button:q.includes('label')?label:figure;}};
  const root = {querySelector:()=>panel};
  const media = Object.assign(target(),{matches:false});
  const instances = [], observers=[];
  const document = Object.assign(target(),{hidden:false,body:{classList:{add(){},remove(){}}}});
  class Observer {constructor(cb){this.cb=cb;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
  const context = { document, Promise, setTimeout, clearTimeout, matchMedia:()=>media, IntersectionObserver:Observer,
    Hezhi3D:{mount(node,options){const instance={options,updates:[],disposed:false};instances.push(instance);options.onReady();return {update(next){instance.updates.push(next);},dispose(){instance.disposed=true;}};}} };
  context.window=context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/hezhi.js'),'utf8'),context);
  return {fx:context.JQ.HEZHI,root,panel,button,figure,media,document,instances,observers,label};
}

test('leaving before the lazy scene resolves cannot mount a stale WebGL root', async()=>{
  const app=setup();app.fx.mount(app.root);app.fx.dispose();await Promise.resolve();
  assert.equal(app.instances.length,0);
  assert.equal(app.document.listeners.size,0);
  assert.equal(app.media.listeners.size,0);
  assert.equal(app.figure.listeners.size,0);
  assert.equal(app.button.listeners.size,0);
  assert.equal(app.observers[0].disconnected,true);
});

test('queued state survives loading; visibility, low motion and disposal reach the scene',async()=>{
  const app=setup();app.fx.mount(app.root);app.fx.setState('thinking');app.fx.setConversation(true);await Promise.resolve();
  assert.equal(app.instances.length,1);
  assert.equal(app.instances[0].options.mode,'thinking');
  assert.equal(app.instances[0].options.compact,true);
  assert.equal(app.panel.dataset.renderer,'webgl');
  app.figure.listeners.get('pointermove')({clientX:75,clientY:25});
  assert.equal(app.instances[0].updates.at(-1).hovered,true);
  app.figure.listeners.get('pointerdown')({pointerType:'touch'});
  app.figure.listeners.get('pointerup')({pointerType:'touch'});
  assert.equal(app.instances[0].updates.at(-1).hovered,true);
  app.media.matches=true;app.media.listeners.get('change')();
  assert.equal(app.button.disabled,true);
  assert.equal(app.instances[0].updates.at(-1).paused,true);
  app.media.matches=false;app.document.hidden=true;app.document.listeners.get('visibilitychange')();
  assert.equal(app.instances[0].updates.at(-1).paused,true);
  app.document.hidden=false;app.observers[0].cb([{isIntersecting:false}]);
  assert.equal(app.instances[0].updates.at(-1).paused,true);
  app.fx.setState('answered');assert.equal(app.panel.dataset.hezhiState,'answered');
  app.fx.dispose();
  assert.equal(app.instances[0].disposed,true);
  assert.equal(app.document.listeners.size,0);
  assert.equal(app.media.listeners.size,0);
  assert.equal(app.figure.listeners.size,0);
});
