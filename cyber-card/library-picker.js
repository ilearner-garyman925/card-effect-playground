(()=>{
const chars={cyber:{name:'霓虹巡察者',outfit:'賽博戰術甲',thumb:'character-thumb',affinity:'◈ CYBER',subtitle:'YUKI · NIGHT PATROL'},druid:{name:'森林德魯伊',outfit:'德魯伊鎧甲',thumb:'druid-thumb',affinity:'◈ NATURE',subtitle:'YUKI · FOREST DRUID'}};
const backgrounds={city:{name:'雨夜霓虹街道',thumb:'background-thumb'},forest:{name:'森林遺跡',thumb:'forest-thumb'}};
window.cardSelection={identity:'longhair',character:'cyber',background:'city',sharedBody:true,effects:{magic:false,rain:true,fireflies:false}};
const sel=window.cardSelection,panels=document.querySelectorAll('.asset-panel');
document.querySelector('.worktop span').textContent='臨時預覽 · 2 位角色 / 2 套衣著 / 2 個背景';
const note=document.createElement('p');note.id='library-status';note.setAttribute('role','status');note.textContent='正在載入素材…';document.querySelector('.bottom-tools').prepend(note);
const zoomStorage='yuki-character-zoom-v1';
let zoomSettings={};
try{const saved=JSON.parse(localStorage.getItem(zoomStorage)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))zoomSettings=saved}catch{}
const zoomControl=document.createElement('div');
zoomControl.innerHTML='<label for="figure-zoom">人物遠近 <output id="figure-zoom-value" for="figure-zoom"></output><input id="figure-zoom" type="range" min="60" max="180" step="1" value="100" aria-label="人物遠近"></label><small>拉遠 ← → 拉近 · 只調整人物與隨身魔法</small> <button type="button" id="reset-figure-zoom">重設人物遠近</button>';
zoomControl.style.cssText='padding-bottom:12px;border-bottom:1px solid #384656';
zoomControl.querySelector('small').style.cssText='font-size:11px;color:#a5b9c9';
document.querySelector('details summary').after(zoomControl);
const zoomInput=zoomControl.querySelector('input'),zoomOutput=zoomControl.querySelector('output');
const zoomKey=()=>sel.identity+':'+sel.character+':'+(sel.character==='cyber'&&sel.identity==='longhair'&&!sel.sharedBody?'full':'default');
function applyZoom(){
 const value=Number(zoomInput.value);
 document.querySelector('#scene').dataset.figureScale=String(Number(zoomInput.dataset.baseScale)*value/100);
 zoomOutput.textContent=value+'%';zoomInput.setAttribute('aria-valuetext',value+'%，'+(value>100?'拉近':value<100?'拉遠':'預設'));
}
function saveZoom(){zoomSettings[zoomKey()]=Number(zoomInput.value);try{localStorage.setItem(zoomStorage,JSON.stringify(zoomSettings))}catch{}}
zoomInput.addEventListener('input',()=>{applyZoom();saveZoom()});
zoomControl.querySelector('button').onclick=()=>{zoomInput.value=100;applyZoom();saveZoom()};
const layerControl=document.createElement('label');
layerControl.style.cssText='display:block;font-size:12px';
layerControl.innerHTML='長髮分層檢查 <select id="identity-layers" aria-label="長髮分層檢查"><option value="all">完整合成</option><option value="no-front">隱藏前髮</option><option value="no-back">隱藏後髮</option><option value="neck">只檢查頭頸與衣領</option></select>';
zoomControl.after(layerControl);
function update(){
const shared=sel.character==='cyber'&&(sel.identity!=='longhair'||sel.sharedBody);
layerControl.hidden=!(shared&&sel.identity==='longhair');
document.querySelector('#tilt').dataset.character=sel.character;
for(const b of document.querySelectorAll('[data-asset-kind]'))b.setAttribute('aria-pressed',String(sel[b.dataset.assetKind]===b.dataset.assetId));
panels[0].querySelector('.selected-note').textContent='已選擇：'+chars[sel.character].outfit;panels[1].querySelector('.selected-note').textContent='已選擇：'+backgrounds[sel.background].name;
const c={...chars[sel.character]};if(sel.identity==='longhair'){c.name=sel.character==='druid'?'長髮德魯伊':'長髮巡察者';c.subtitle=sel.character==='druid'?'FOREST DRUID':'NIGHT PATROL'};document.querySelector('.card-caption strong').textContent=c.name;document.querySelector('.card-subtitle').textContent=c.subtitle;document.querySelector('.affinity').textContent=c.affinity;
document.querySelector('#scene').setAttribute('aria-label',c.name+'，背景為'+backgrounds[sel.background].name);
// The original druid is cropped at the lower legs. Let the title plaque cover
// that crop rather than inventing feet or pretending this is a full-body rig.
// Match the approved blue-haired druid's closer, knee-cropped framing.
// Full-body sheets have more empty space and need a different normalization.
zoomInput.dataset.baseScale=sel.identity==='longhair'&&!shared?'1.4':sel.character==='druid'?'0.88':'1.18';
const savedZoom=zoomSettings[zoomKey()];
zoomInput.value=typeof savedZoom==='number'&&Number.isFinite(savedZoom)?Math.max(60,Math.min(180,savedZoom)):100;
applyZoom();
document.querySelectorAll('[data-pose]').forEach(b=>b.disabled=!shared);
document.querySelector('[data-pose="1.5"]').textContent=sel.identity==='longhair'?'頭部偏轉 A':'看平板';
document.querySelector('[data-pose="3.8"]').textContent=sel.identity==='longhair'?'頭部偏轉 B':sel.background==='forest'?'觀察森林':'望向載具';
document.querySelector('#pins').disabled=!shared;document.querySelector('#glow').disabled=!shared;document.querySelector('#hover').disabled=sel.background==='forest';
note.textContent=c.name+' ＋ '+backgrounds[sel.background].name+(sel.identity==='longhair'?(shared?' · 共用身體＋頭髮拆件':' · 完整人物'):sel.character==='druid'?' · 施法待機':'');
}
for(const[kind,data,index]of[['character',chars,0],['background',backgrounds,1]]){const panel=panels[index],grid=panel.querySelector('.asset-grid');panel.querySelector('.panel-head span').textContent='2 個素材';grid.replaceChildren();for(const[id,item]of Object.entries(data)){const b=document.createElement('button');b.type='button';b.className='asset-option';b.dataset.assetKind=kind;b.dataset.assetId=id;b.disabled=true;b.setAttribute('aria-label','選擇'+(item.outfit||item.name));const image=document.createElement('span');image.className='asset-image '+item.thumb;const label=document.createElement('span');label.textContent=item.outfit||item.name;b.append(image,label);b.onclick=()=>{sel[kind]=id;update()};grid.append(b)}}
panels[0].querySelector('h2').textContent='衣著';
const identityPanel=document.createElement('section');identityPanel.className='asset-panel identity-panel';identityPanel.innerHTML='<header class="panel-head"><h2>角色</h2><span>2 位角色</span></header><div class="asset-grid"></div><p class="selected-note"></p>';
document.querySelector('.library').prepend(identityPanel);
function updateIdentity(){identityPanel.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.identity===sel.identity)));identityPanel.querySelector('.selected-note').textContent=sel.identity==='longhair'?'長髮角色':'藍髮角色';update()}
for(const[id,name,thumb]of [['blue','藍髮角色','character-thumb'],['longhair','長髮角色','longhair-thumb']]){const b=document.createElement('button');b.type='button';b.className='asset-option';b.dataset.identity=id;b.setAttribute('aria-label','角色：'+name);b.innerHTML='<span class="asset-image '+thumb+'"></span><span>'+name+'</span>';b.onclick=()=>{sel.identity=id;updateIdentity()};identityPanel.querySelector('.asset-grid').append(b)}
updateIdentity();
const modularControl=document.createElement('label');
modularControl.style.cssText='display:flex;align-items:center;gap:8px;font-size:12px;margin:0;padding:8px 16px;color:#c5e7f5;flex:none';
modularControl.innerHTML='<input type="checkbox" id="shared-body" checked>賽博換裝測試：共用身體（關閉比較原版）';
document.querySelector('.preview-panel').insertBefore(modularControl,document.querySelector('.preview-stage'));
modularControl.querySelector('input').onchange=e=>{sel.sharedBody=e.target.checked;update()};
const effects={magic:'自然魔法',rain:'雨夜',fireflies:'林間螢光'};
const effectPanel=document.createElement('section');effectPanel.className='asset-panel effects-panel';
effectPanel.innerHTML='<header class="panel-head"><h2>特效</h2><span>可多選疊加</span></header><div class="asset-grid"></div><div class="effect-footer"><p class="selected-note" role="status"></p><button type="button" class="clear-effects">全部關閉</button></div>';
document.querySelector('.library').append(effectPanel);
function updateEffects(){
 for(const b of effectPanel.querySelectorAll('[data-effect]'))b.setAttribute('aria-pressed',String(sel.effects[b.dataset.effect]));
 const active=Object.keys(effects).filter(id=>sel.effects[id]);
 effectPanel.querySelector('.selected-note').textContent=active.length?active.map(id=>effects[id]).join(' ＋ '):'無特效';
}
for(const[id,name]of Object.entries(effects)){
 const b=document.createElement('button');b.type='button';b.className='asset-option';b.dataset.effect=id;b.setAttribute('aria-label',name+'特效');
 b.innerHTML='<span class="asset-image effect-thumb fx-'+id+'" aria-hidden="true"><i></i></span><span>'+name+'</span>';
 b.onclick=()=>{sel.effects[id]=!sel.effects[id];updateEffects()};effectPanel.querySelector('.asset-grid').append(b);
}
effectPanel.querySelector('.clear-effects').onclick=()=>{Object.keys(effects).forEach(id=>sel.effects[id]=false);updateEffects()};
updateEffects();
// The library replaces the old background-coupled environment checkbox.
document.querySelector('#rain').parentElement.hidden=true;
window.addEventListener('card-assets-ready',()=>{document.querySelectorAll('[data-asset-kind]').forEach(b=>b.disabled=false);update()});
update();
})();

