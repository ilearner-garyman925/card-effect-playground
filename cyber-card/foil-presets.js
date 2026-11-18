(()=>{
 const tilt=document.querySelector('#tilt');
 const rarity=document.querySelector('.rarity');
 const shine=document.createElement('span');shine.className='rarity-shine';shine.textContent='SSR';shine.setAttribute('aria-hidden','true');rarity.append(shine);
 const pause=document.querySelector('#pause');
 const syncPause=()=>{shine.style.animationPlayState=pause.getAttribute('aria-pressed')==='true'?'paused':'running'};
 new MutationObserver(syncPause).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});syncPause();
 const texture=document.createElement('div');texture.className='theme-texture';texture.setAttribute('aria-hidden','true');texture.innerHTML='<i></i><i class="texture-fine"></i>';document.querySelector('.front').append(texture);
 const bar=document.createElement('fieldset');bar.className='foil-picker';
 bar.innerHTML='<legend>卡面閃箔</legend>';
 for(const [id,name] of [['normal','正常'],['special','特別'],['ultra','超罕有']]){
   const label=document.createElement('label');
   const input=document.createElement('input');input.type='radio';input.name='foil-grade';input.value=id;input.checked=id==='special';
   const text=document.createElement('span');text.textContent=name;
   input.addEventListener('change',()=>{if(input.checked)tilt.dataset.foil=id});
   label.append(input,text);bar.append(label);
 }
 const header=document.querySelector('.preview-panel>.panel-head');
 header.querySelector('span').textContent='切角黑銀';
 header.after(bar);tilt.dataset.foil='special';
})();
