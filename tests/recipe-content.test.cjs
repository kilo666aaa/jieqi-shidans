const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c={};c.window=c;vm.createContext(c);
for(const name of ['data_terms','data_recipes_spring','data_recipes_summer','data_recipes_autumn','data_recipes_winter'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name+'.js'),'utf8'),c,{filename:name});
test('general meal recipes do not instruct the three legacy medicinal additions',()=>{
 const q=c.JQ;
 for(const id of ['lx1','bl1','dx1']){
  const r=q.DATA.recipeById(id);
  assert.doesNotMatch(JSON.stringify(r.ing)+r.steps.join(''),/川贝|当归|核桃壳|分心木/,id);
 }
 assert.equal(q.DATA.recipeById('bl1').name,'冰糖炖雪梨');
 assert.equal(q.DATA.recipeById('dx1').name,'生姜羊肉汤');
});
test('compound seasonings and sesame oil retain known allergen flags',()=>{
 const q=c.JQ;
 for(const id of ['sj4','dx4','sj2','lq1']){
  const r=q.DATA.recipeById(id);assert.ok(r.allergens.includes('soy'),id+' soy sauce contains soy');
  assert.ok(r.allergens.includes('gluten'),id+' standard soy sauce may contain wheat');
 }
 for(const id of ['mz4','xz1','ld4','cf2'])assert.ok(q.DATA.recipeById(id).allergens.includes('sesame'),id+' sesame');
 assert.ok(!q.DATA.recipeById('xs3').allergens.includes('soy'),'mung beans are not soybeans');
});
test('explicit eggs, shrimp, peanuts and optional tofu are never missing from allergen labels',()=>{
 const expected={lc1:['egg'],lc5:['soy'],ys5:['egg','seafood'],qm5:['egg'],xz3:['egg'],xx4:['seafood'],dz4:['seafood'],xh3:['peanut']};
 for(const [id,allergens] of Object.entries(expected))for(const a of allergens)assert.ok(c.JQ.DATA.recipeById(id).allergens.includes(a),id+'/'+a);
});
