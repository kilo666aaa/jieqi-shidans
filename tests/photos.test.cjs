const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),c={};c.window=c;vm.createContext(c);
for(const name of ['data_terms','data_recipes_spring','data_recipes_summer','data_recipes_autumn','data_recipes_winter','recipe_photos'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),c,{filename:name});
test('all 120 recipes have a locally available photo with attribution and an honest match type',()=>{
 const q=c.JQ,missing=q.DATA.RECIPES.filter(r=>!q.PHOTOS.items[r.id]);
 assert.equal(missing.length,0,'missing photos: '+missing.map(r=>r.name).join('、'));
 for(const r of q.DATA.RECIPES){
  const p=q.PHOTOS.items[r.id];assert.match(p.localFile,/^assets\/food\/[a-z0-9_-]+\.webp$/);
  assert.ok(fs.statSync(path.join(root,p.localFile)).size>500,r.name);
  assert.ok(p.author&&p.license&&p.licenseUrl&&p.sourcePage&&p.matchNote,r.name);
  assert.ok(['dish','ingredient'].includes(p.matchType),r.name);
  const compact=q.PHOTOS.html(r,{}),detail=q.PHOTOS.html(r,{detail:true});
  assert.doesNotMatch(compact,/<a\b/,'no nested interactive credit in recipe cards');
  assert.match(detail,/license|许可|来源/);assert.ok(detail.includes(p.sourcePage.replace(/&/g,'&amp;')));
  if(p.matchType==='ingredient')assert.match(compact,/食材参考.*非成品/);
 }
});
test('unknown and hostile recipe names have a clear escaped missing-photo state',()=>{
 const html=c.JQ.PHOTOS.html({id:'unknown',name:'<img src=x onerror=alert(1)>'},{});
 assert.match(html,/food-photo-missing/);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/&lt;img/);
});

test('runtime photos and published attribution manifest agree exactly',()=>{
 const doc=JSON.parse(fs.readFileSync(path.join(root,'docs/food-photo-sources.json'),'utf8'));
 const records=new Map();
 for(const p of doc.images)for(const id of p.recipeIds){
  assert.ok(!records.has(id),'duplicate attribution for '+id);records.set(id,p);
 }
 assert.equal(records.size,c.JQ.DATA.RECIPES.length);
 let dishes=0,ingredients=0;
 for(const r of c.JQ.DATA.RECIPES){
  const p=records.get(r.id),live=c.JQ.PHOTOS.items[r.id];
  assert.ok(p.recipeNames.includes(r.name),r.id+' current name');
  for(const key of ['localFile','sourcePage','author','license','licenseUrl','matchType','matchNote','width','height'])assert.equal(live[key],p[key],r.id+' '+key);
  if(p.matchType==='dish')dishes++;else ingredients++;
 }
 assert.equal(doc.statistics.dishRecipes,dishes);assert.equal(doc.statistics.ingredientRecipes,ingredients);
 assert.equal(doc.statistics.localImages,doc.images.length);
});
