const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
function app(now='2026-11-01T16:30:00Z',offset=-480){
 const instant=Date.parse(now);
 class ClockDate extends Date{constructor(value){super(arguments.length?value:instant);}static now(){return instant;}getTimezoneOffset(){return offset;}}
 const c={Date:ClockDate};c.window=c;vm.createContext(c);
 for(const file of ['util','data_terms','solar'])vm.runInContext(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'),c,{filename:file});
 return c.JQ;
}
test('Beijing date is independent of machine timezone, including early morning',()=>{
 for(const offset of [-480,0,300]){
  assert.equal(app('2026-11-01T16:30:00Z',offset).bjDateStr(),'2026-11-02');
  assert.equal(app('2026-11-02T15:59:59Z',offset).bjDateStr(),'2026-11-02');
  assert.equal(app('2026-11-02T16:00:00Z',offset).bjDateStr(),'2026-11-03');
 }
});
test('all 72 published onsets match archived HKO XML at minute precision',()=>{
 const q=app();const ids=['xiaohan','dahan',...q.DATA.TERMS.slice(0,22).map(t=>t.id)];
 for(const year of ['2026','2027','2028']){
  const xml=fs.readFileSync(path.join(root,'docs/research/hko','24SolarTerms_'+year+'.xml'),'utf8');
  const rows=[...xml.matchAll(/<Data><M>(\d+)<\/M><D>(\d+)<\/D><hm>(\d{2}:\d{2})<\/hm><\/Data>/g)];
  assert.equal(rows.length,24);
  rows.forEach((row,i)=>assert.equal(q.DATA.ONSETS[year][ids[i]],`${year}-${row[1]}-${row[2]} ${row[3]}`,year+'/'+ids[i]));
  assert.match(q.DATA.ONSET_SOURCE[year],/香港天文台/);
 }
 assert.match(q.DATA.ONSET_SOURCE['2029'],/待核验/);
});
test('onset boundary switches exactly and day count follows Beijing calendar days',()=>{
 const q=app('2026-10-23T16:30:00Z');
 const onset=q.bjParse('2026-10-23 17:38');
 assert.equal(q.SOLAR.current(onset-1).term.id,'hanlu');
 assert.equal(q.SOLAR.current(onset).term.id,'shuangjiang');
 assert.equal(q.SOLAR.dayOfTerm(),2,'Beijing 24 October is the second calendar day');
});
test('an empty onset table returns an honest unavailable state',()=>{
 const q=app();q.DATA.ONSETS={};
 assert.equal(q.SOLAR.current().ok,false);
 assert.match(q.SOLAR.current().reason,/未收录|暂无|不可/);
});
