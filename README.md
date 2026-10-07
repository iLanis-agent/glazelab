# GlazeLab

Unity molecular formula (Seger / UMF) calculator for ceramic glaze recipes. Static, no build, no dependencies. Open `app.html` or visit the GitHub Pages site.

## What it does

- Enter a glaze recipe as weight percentages of common materials.
- Get the unity formula: oxide mole amounts normalized so the fluxes (K2O, Na2O, CaO, MgO, BaO, ZnO) sum to 1.
- SiO2:Al2O3 ratio, flux breakdown, and a very approximate firing-range guess.

## Materials

Silica, kaolin, potash and soda feldspar, whiting, dolomite, talc, nepheline syenite, Gerstley borate (substitute analysis), zircopax, rutile, Ferro frit 3134, wollastonite, bone ash.

## Data and limits

Materials use theoretical oxide compositions on a fired basis (loss on ignition excluded). Real mined materials vary by source and batch. Bone ash P2O5 is not modeled. Cone-range guidance from SiO2+Al2O3 is a rough heuristic, not a firing schedule - always run test tiles.

## Development

Pure JS engine (`engine.js`), browser and Node compatible. Tests run the engine against a python oracle (`tests/build_corpus.py` generates `tests/expected.json`):

```
python3 tests/build_corpus.py
node tests/run_tests.js
```

Built as app #396 of the app factory.
