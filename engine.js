/* GlazeLab engine: unity molecular formula (Seger/UMF) math for glaze recipes.
   Materials use theoretical oxide compositions with standard molecular weights.
   Real materials vary by source; LOI is excluded (fired-oxide basis).
   Pure JS, browser + Node. */
(function(root,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{root.GlazeLab=factory();}
})(typeof self!=='undefined'?self:this,function(){
'use strict';
/* oxides: [symbol, molar mass g/mol] */
var OX={
 K2O:94.196, Na2O:61.979, CaO:56.077, MgO:40.304, BaO:153.326, ZnO:81.379,
 Al2O3:101.961, SiO2:60.083, B2O3:69.620, TiO2:79.866, ZrO2:123.223
};
/* materials: percent composition -> oxide counts per formula unit + formula-unit mass (fired basis) */
var MATS=[
 {id:'silica',name:'Silica (Quartz)',ox:{SiO2:1},mw:60.083},
 {id:'kaolin',name:'Kaolin (EPK)',ox:{Al2O3:1,SiO2:2},mw:222.127}, /* Al2O3.2SiO2.2H2O fired basis excl. water */
 {id:'feldspar_potash',name:'Potash Feldspar',ox:{K2O:1,Al2O3:1,SiO2:6},mw:556.663},
 {id:'feldspar_soda',name:'Soda Feldspar',ox:{Na2O:1,Al2O3:1,SiO2:6},mw:524.446},
 {id:'whiting',name:'Whiting (CaCO3)',ox:{CaO:1},mw:56.077},
 {id:'dolomite',name:'Dolomite',ox:{CaO:1,MgO:1},mw:96.381},
 {id:'talc',name:'Talc',ox:{MgO:3,SiO2:4},mw:361.244},
 {id:'neph_syenite',name:'Nepheline Syenite',ox:{K2O:0.22,Na2O:0.78,Al2O3:1.11,SiO2:4.66},mw:435.499},
 {id:'gerstley_borate',name:'Gerstley Borate (sub)',ox:{CaO:2,Na2O:1,B2O3:3},mw:400.998},
 {id:'zircopax',name:'Zircopax (ZrSiO4)',ox:{ZrO2:1,SiO2:1},mw:183.306},
 {id:'rutile',name:'Rutile',ox:{TiO2:1},mw:79.866},
 {id:'frit_3134',name:'Ferro Frit 3134',ox:{CaO:1,Na2O:0.28,B2O3:1.45,SiO2:2.2},mw:323.773},
 {id:'wollastonite',name:'Wollastonite',ox:{CaO:1,SiO2:1},mw:116.160},
 {id:'bone_ash',name:'Bone Ash',ox:{CaO:3},mw:168.231,note:'P2O5 not modeled'}
];
function oxMass(sym){return OX[sym];}
function listMats(){return MATS;}
function matById(id){for(var i=0;i<MATS.length;i++)if(MATS[i].id===id)return MATS[i];return null;}
/* recipe: [{id, pct}] by weight percent -> oxide mole totals on fired basis */
function umf(recipe){
  var mol={};
  var total=0;
  for(var i=0;i<recipe.length;i++){
    var m=matById(recipe[i].id),w=parseFloat(recipe[i].pct);
    if(!m||!(w>0))continue;
    total+=w;
    var fu=w/m.mw; /* formula units */
    for(var sym in m.ox){
      mol[sym]=(mol[sym]||0)+fu*m.ox[sym];
    }
  }
  if(total===0)return null;
  var flux=mol.K2O||0; flux+=mol.Na2O||0; flux+=mol.CaO||0; flux+=mol.MgO||0; flux+=mol.BaO||0; flux+=mol.ZnO||0;
  if(flux===0)return {ok:false,error:'no flux oxides in recipe'};
  var norm={};
  for(var s in mol)norm[s]=mol[s]/flux;
  var si=norm.SiO2||0, al=norm.Al2O3||0;
  return {
    ok:true,
    totalPct:total,
    umf:norm,
    siAl:al>0?Math.round(si/al*100)/100:null,
    fluxBreakdown:{
      K2O:norm.K2O||0,Na2O:norm.Na2O||0,CaO:norm.CaO||0,
      MgO:norm.MgO||0,BaO:norm.BaO||0,ZnO:norm.ZnO||0
    }
  };
}
/* rough cone-range guidance from SiO2+Al2O3 (very approximate, labeled) */
function coneGuess(r){
  if(!r||!r.ok)return null;
  var sa=(r.umf.SiO2||0)+(r.umf.Al2O3||0);
  if(sa<2.2)return 'low fire (cone 06-02) - very approximate';
  if(sa<3.4)return 'mid fire (cone 5-6) - very approximate';
  return 'high fire (cone 9-10) - very approximate';
}
return {listMats:listMats,matById:matById,umf:umf,coneGuess:coneGuess,oxMass:oxMass};
});
