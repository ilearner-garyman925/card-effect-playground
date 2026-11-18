# Holographic effect sources

Adapted from Simon Goellner's pokemon-cards-css, under GPL-3.0 (HOLO-LICENSE.txt).
https://github.com/simeydotme/pokemon-cards-css

Original CSS is retained in *-source.css and holo-reference-source.css.
extra-holo.css adapts cosmos-holo, radiant-holo, v-regular, v-full-art and trainer-full-art:
selectors, pointer variables, artwork clipping, strength/size controls and local asset paths.
The Trainer treatment uses the upstream generic trainerbg fallback, not a Pokemon-specific etched mask.

Assets from public/img: cosmos-bottom.png, cosmos-middle-trans.png, cosmos-top-trans.png,
glitter.png, grain.webp, trainerbg.png. Upstream README credits Galaxy Holo to aschefield101
(https://www.deviantart.com/aschefield101) and some backgrounds to Vecteezy.

Per-texture strength and size are stored locally under yuki-texture-settings-v1.
Holofoil Rare defaults to 45%; other preset values are initial preview tuning.
