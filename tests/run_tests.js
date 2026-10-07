/* GlazeLab tests: engine vs tests/expected.json (python oracle). */
'use strict';
const fs=require('fs'),path=require('path');
const G=require(path.join(__dirname,'..','engine.js'));
const items=JSON.parse(fs.readFileSync(path.join(__dirname,'expected.json'),'utf8')).items;
let pass=0,fail=0;
function ok(){pass++;}
function bad(l,a,b){fail++;console.log('FAIL '+l+': got '+JSON.stringify(a)+' want '+JSON.stringify(b));}
for(const it of items){
  const T='umf '+JSON.stringify(it.recipe).slice(0,50)+' ';
  const r=G.umf(it.recipe.map(x=>({id:x[0],pct:x[1]})));
  const o=it.oracle;
  if(o===null){ if(r===null)ok(); else bad(T+'should be null',r,o); continue; }
  if(!o.ok){ if(r&&r.ok===false)ok(); else bad(T+'should fail',r,o); continue; }
  if(!r||!r.ok){bad(T+'should pass',r,o);continue;}
  let good=r.totalPct===o.totalPct&&r.siAl===o.siAl;
  for(const s in o.umf){
    if(Math.abs((r.umf[s]||0)-o.umf[s])>0.0001)good=false;
  }
  if(good)ok(); else bad(T+'values',{umf:r.umf,siAl:r.siAl},o);
  const cg=G.coneGuess(r);
  const want={low:'low fire',mid:'mid fire',high:'high fire'}[it.cone];
  if(cg&&cg.indexOf(want)===0)ok(); else bad(T+'cone',cg,it.cone);
}
// sanity: material list unique ids
const ids=G.listMats().map(m=>m.id);
if(new Set(ids).size===ids.length&&ids.length===14)pass++; else bad('mat list',ids.length,14);
// pure silica has no flux -> error object, not null (weight>0)
const ps=G.umf([{id:'silica',pct:100}]);
if(ps&&ps.ok===false)pass++; else bad('silica no flux',ps,'ok:false');
console.log(pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
