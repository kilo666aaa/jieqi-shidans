const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function app(){
 const memory={};const JQ={PICKS:{},toast(){},STORE:{KEYS:{PREFS:'pref'},get:(k,d)=>memory[k]??d,set:(k,v)=>(memory[k]=v,true)}};
 const context=vm.createContext({window:{JQ},JQ,console,Date,Math,setTimeout});
 for(const f of ['data_terms.js','data_recipes_spring.js','data_recipes_summer.js','data_recipes_autumn.js','data_recipes_winter.js','prefs.js','ai.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),context);
 return JQ;
}
test('every term retains five candidates and every marked allergen is excluded after rotation',()=>{
 const q=app();assert.equal(q.DATA.RECIPES.length,120);
 for(const alg of q.PREFS.ALLERGEN_OPTIONS){
  const pref=q.PREFS.DEFAULT();pref.provided=true;pref.allergens=[alg.id];q.STORE.set('pref',pref);
  for(const term of q.DATA.TERMS){
   assert.equal(q.DATA.RECIPES.filter(r=>r.t===term.id).length,5);
   for(let i=0;i<6;i++){
    const picks=q.PREFS.picksFor(term.id);
    assert.ok(picks.list.every(r=>!r.allergens.includes(alg.id)),`${term.id}/${alg.id}`);
    q.PREFS.rotate(term.id);
   }
  }
 }
});
test('AI context carries attributed traditional wellness separately from modern daily advice',()=>{
 const q=app();q.SOLAR={displayTerm:()=>({term:q.DATA.TERMS[0]})};q.CHAT={};
 q.SEASONAL={data:{lichun:{tcm:'传统食养示例',daily:'现代饮食示例',review:'食养仍待人工逐项复核',sources:[{title:'示例来源标题',scope:'只支持一般膳食原则',url:'https://example.org/source'}]}}};
 const c=q.AI.buildContext();assert.match(c,/传统食养示例/);assert.match(c,/现代饮食示例/);assert.match(c,/https:\/\/example.org\/source/);
 assert.match(q.AI.SYSTEM_PROMPT(),/中医/);
 assert.match(c,/食养仍待人工逐项复核/); assert.match(c,/只支持一般膳食原则/); assert.match(c,/示例来源标题/);
});
