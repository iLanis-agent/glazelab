#!/usr/bin/env python3
"""GlazeLab oracle: independent python UMF recompute."""
import json, os

MATS = {
 'silica': ({'SiO2':1}, 60.083),
 'kaolin': ({'Al2O3':1,'SiO2':2}, 222.127),
 'feldspar_potash': ({'K2O':1,'Al2O3':1,'SiO2':6}, 556.663),
 'feldspar_soda': ({'Na2O':1,'Al2O3':1,'SiO2':6}, 524.446),
 'whiting': ({'CaO':1}, 56.077),
 'dolomite': ({'CaO':1,'MgO':1}, 96.381),
 'talc': ({'MgO':3,'SiO2':4}, 361.244),
 'neph_syenite': ({'K2O':0.22,'Na2O':0.78,'Al2O3':1.11,'SiO2':4.66}, 435.499),
 'gerstley_borate': ({'CaO':2,'Na2O':1,'B2O3':3}, 400.998),
 'zircopax': ({'ZrO2':1,'SiO2':1}, 183.306),
 'rutile': ({'TiO2':1}, 79.866),
 'frit_3134': ({'CaO':1,'Na2O':0.28,'B2O3':1.45,'SiO2':2.2}, 323.773),
 'wollastonite': ({'CaO':1,'SiO2':1}, 116.160),
 'bone_ash': ({'CaO':3}, 168.231),
}
FLUX = ('K2O','Na2O','CaO','MgO','BaO','ZnO')

def umf(recipe):
    mol = {}; total = 0
    for mid, w in recipe:
        if mid not in MATS or not w > 0: continue
        ox, mw = MATS[mid]
        total += w
        fu = w/mw
        for s, n in ox.items():
            mol[s] = mol.get(s,0) + fu*n
    if total == 0: return None
    flux = sum(mol.get(s,0) for s in FLUX)
    if flux == 0: return {'ok': False}
    norm = {s: v/flux for s, v in mol.items()}
    si = norm.get('SiO2',0); al = norm.get('Al2O3',0)
    return {'ok': True, 'totalPct': total,
            'umf': {s: round(v,4) for s,v in norm.items()},
            'siAl': round(si/al,2) if al > 0 else None}

def cone(r):
    if not r or not r.get('ok'): return None
    sa = r['umf'].get('SiO2',0) + r['umf'].get('Al2O3',0)
    if sa < 2.2: return 'low'
    if sa < 3.4: return 'mid'
    return 'high'

RECIPES = [
 [('feldspar_potash',40),('kaolin',20),('silica',25),('whiting',15)],  # classic cone 10-ish
 [('whiting',100)],
 [('neph_syenite',50),('kaolin',25),('silica',25)],
 [('gerstley_borate',30),('feldspar_soda',40),('kaolin',10),('silica',20)],
 [('silica',100)],  # no flux -> fail
 [('dolomite',35),('talc',20),('feldspar_potash',45)],
 [('frit_3134',60),('kaolin',20),('silica',20)],
 [('nope',50)],
]
items = []
for r in RECIPES:
    res = umf(r)
    items.append({'kind':'umf','recipe':r,'oracle':res,'cone':cone(res)})
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expected.json')
json.dump({'items': items}, open(out,'w'))
print('cases:', len(items))
