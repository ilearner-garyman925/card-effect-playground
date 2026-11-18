(()=>{
const chars={cyber:{name:'霓虹巡察者',outfit:'賽博戰術甲',thumb:'character-thumb',affinity:'◈ CYBER',subtitle:'YUKI · NIGHT PATROL'},druid:{name:'森林德魯伊',outfit:'德魯伊鎧甲',thumb:'druid-thumb',affinity:'◈ NATURE',subtitle:'YUKI · FOREST DRUID'}};
const backgrounds={city:{name:'雨夜霓虹街道',thumb:'background-thumb'},forest:{name:'森林遺跡',thumb:'forest-thumb'}};
window.cardSelection={identity:'longhair',character:'druid',background:'forest',effects:{magic:true,rain:false,fireflies:false}};
const sel=window.cardSelection,panels=document.querySelectorAll('.asset-panel');
document.querySelector('.worktop span').textContent='臨時預覽 · 2 位角色 / 2 套衣著 / 2 個背景';
const note=document.createElement('p');note.id='library-status';note.setAttribute('role','status');note.textContent='正在載入素材…';document.querySelector('.bottom-tools').prepend(note);
function update(){
document.querySelector('#tilt').dataset.character=sel.character;
for(const b of document.querySelectorAll('[data-asset-kind]'))b.setAttribute('aria-pressed',String(sel[b.dataset.assetKind]===b.dataset.assetId));
panels[0].querySelector('.selected-note').textContent='已選擇：'+chars[sel.character].outfit;panels[1].querySelector('.selected-note').textContent='已選擇：'+backgrounds[sel.background].name;
const c={...chars[sel.character]};if(sel.identity==='longhair'){c.name=sel.character==='druid'?'長髮德魯伊':'長髮巡察者';c.subtitle=sel.character==='druid'?'FOREST DRUID':'NIGHT PATROL'};document.querySelector('.card-caption strong').textContent=c.name;document.querySelector('.card-subtitle').textContent=c.subtitle;document.querySelector('.affinity').textContent=c.affinity;
document.querySelector('#scene').setAttribute('aria-label',c.name+'，背景為'+backgrounds[sel.background].name);
// The original druid is cropped at the lower legs. Let the title plaque cover
// that crop rather than inventing feet or pretending this is a full-body rig.
document.querySelector('#scene').dataset.figureScale=sel.identity==='longhair'?'1':sel.character==='druid'?'0.88':'0.86';
document.querySelectorAll('[data-pose]').forEach(b=>b.disabled=sel.identity==='longhair'||sel.character==='druid');
document.querySelector('[data-pose="3.8"]').textContent=sel.background==='forest'?'觀察森林':'望向載具';
document.querySelector('#pins').disabled=sel.identity==='longhair'||sel.character==='druid';document.querySelector('#glow').disabled=sel.identity==='longhair'||sel.character==='druid';document.querySelector('#hover').disabled=sel.background==='forest';
note.textContent=c.name+' ＋ '+backgrounds[sel.background].name+(sel.identity==='longhair'?' · 整體待機':sel.character==='druid'?' · 施法待機':'');
}
for(const[kind,data,index]of[['character',chars,0],['background',backgrounds,1]]){const panel=panels[index],grid=panel.querySelector('.asset-grid');panel.querySelector('.panel-head span').textContent='2 個素材';grid.replaceChildren();for(const[id,item]of Object.entries(data)){const b=document.createElement('button');b.type='button';b.className='asset-option';b.dataset.assetKind=kind;b.dataset.assetId=id;b.disabled=true;b.setAttribute('aria-label','選擇'+(item.outfit||item.name));const image=document.createElement('span');image.className='asset-image '+item.thumb;const label=document.createElement('span');label.textContent=item.outfit||item.name;b.append(image,label);b.onclick=()=>{sel[kind]=id;update()};grid.append(b)}}
panels[0].querySelector('h2').textContent='衣著';
const identityPanel=document.createElement('section');identityPanel.className='asset-panel identity-panel';identityPanel.innerHTML='<header class="panel-head"><h2>角色</h2><span>2 位角色</span></header><div class="asset-grid"></div><p class="selected-note"></p>';
document.querySelector('.library').prepend(identityPanel);
function updateIdentity(){identityPanel.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.identity===sel.identity)));identityPanel.querySelector('.selected-note').textContent=sel.identity==='longhair'?'長髮角色 · 整體待機':'藍髮角色';update()}
for(const[id,name,thumb]of [['blue','藍髮角色','character-thumb'],['longhair','長髮角色','longhair-thumb']]){const b=document.createElement('button');b.type='button';b.className='asset-option';b.dataset.identity=id;b.setAttribute('aria-label','角色：'+name);b.innerHTML='<span class="asset-image '+thumb+'"></span><span>'+name+'</span>';b.onclick=()=>{sel.identity=id;updateIdentity()};identityPanel.querySelector('.asset-grid').append(b)}
updateIdentity();
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

