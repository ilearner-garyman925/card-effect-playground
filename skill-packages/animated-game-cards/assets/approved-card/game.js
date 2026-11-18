(()=>{
const card=document.querySelector('#flip-card'),tilt=document.querySelector('#tilt'),flipButton=document.querySelector('#flip-button'),message=document.querySelector('#card-state'),foil=document.querySelector('#foil-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let flipped=false,px=.5,py=.5,targetX=0,targetY=0,rx=0,ry=0,light=0,targetLight=0,lastTime=0,down=null;
function updateLabel(){card.setAttribute('aria-pressed',String(flipped));card.setAttribute('aria-label',flipped?'翻至卡面':'翻至卡背');flipButton.textContent=flipped?'翻至卡面':'翻至卡背';message.textContent=flipped?'背面 · 電路紋收藏卡背':'正面 · 點擊或 Enter 翻面'}
function flip(){flipped=!flipped;card.classList.toggle('is-flipped',flipped);targetX=targetY=0;targetLight=.5;updateLabel()}
card.addEventListener('pointermove',e=>{const r=card.closest('.perspective').getBoundingClientRect();px=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));py=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));if(!reduced.matches){targetX=(.5-py)*18;targetY=(px-.5)*22}targetLight=1});
card.addEventListener('pointerenter',()=>targetLight=1);card.addEventListener('pointerleave',()=>{targetX=targetY=0;targetLight=0});
card.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});card.addEventListener('pointercancel',()=>{down=null;targetX=targetY=0;targetLight=0});
card.addEventListener('click',e=>{if(e.detail&&down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;flip();down=null});flipButton.onclick=flip;
foil.onchange=()=>tilt.classList.toggle('no-foil',!foil.checked);
function tick(now){const dt=lastTime?Math.min(.05,(now-lastTime)/1000):1/60;lastTime=now;const k=1-Math.exp(-12*dt);rx+=(targetX-rx)*k;ry+=(targetY-ry)*k;light+=(targetLight-light)*k;tilt.style.setProperty('--rx',rx+'deg');tilt.style.setProperty('--ry',ry+'deg');tilt.style.setProperty('--mx',(px*100)+'%');tilt.style.setProperty('--my',(py*100)+'%');tilt.style.setProperty('--light',light.toFixed(3));requestAnimationFrame(tick)}requestAnimationFrame(tick);updateLabel();
})();
