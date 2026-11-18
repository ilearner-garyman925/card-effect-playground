(()=>{
const card=document.querySelector('#flip-card'),tilt=document.querySelector('#tilt'),flipButton=document.querySelector('#flip-button'),message=document.querySelector('#card-state'),foil=document.querySelector('#foil-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let flipped=false,px=.5,py=.5,targetX=0,targetY=0,rx=0,ry=0,light=0,targetLight=0,lastTime=0,down=null;
let hovering=false,idleTime=0,mx=.5,my=.5;
window.cardDepth={x:0,y:0};
const controls=document.querySelector('details');
for(const [id,text] of [['idle-light','閒置傾斜與反射光'],['depth-motion','人物／背景視差']]){const label=document.createElement('label');label.innerHTML='<input type="checkbox" id="'+id+'" checked>'+text;controls.append(label)}
const sliders={};
for(const [id,title,min,max,step,value] of [
 ['idle-speed','閒置動畫速度',.25,3,.05,1],
 ['depth-strength','視差幅度',0,3,.1,1.8]
]){
 const label=document.createElement('label');
 const caption=document.createElement('span');caption.textContent=title+' ';
 const output=document.createElement('output');output.htmlFor=id;
 const input=document.createElement('input');input.type='range';input.id=id;input.min=min;input.max=max;input.step=step;input.value=value;input.setAttribute('aria-label',title);
 const refresh=()=>{const v=Number(input.value);output.textContent=v.toFixed(2).replace(/0$/,'')+'×'+(id==='idle-speed'?' · 約 '+(20/v).toFixed(0)+' 秒／圈':'');input.setAttribute('aria-valuetext',output.textContent)};
 input.addEventListener('input',refresh);label.append(caption,output,input);controls.append(label);sliders[id]={input,refresh,value};refresh();
}
document.querySelector('#reset').addEventListener('click',()=>{for(const item of Object.values(sliders)){item.input.value=item.value;item.refresh()}});
function updateLabel(){card.setAttribute('aria-pressed',String(flipped));card.setAttribute('aria-label',flipped?'翻至卡面':'翻至卡背');flipButton.textContent=flipped?'翻至卡面':'翻至卡背';message.textContent=flipped?'背面 · 電路紋收藏卡背':'正面 · 點擊或 Enter 翻面'}
function flip(){flipped=!flipped;card.classList.toggle('is-flipped',flipped);targetX=targetY=0;targetLight=.5;updateLabel()}
card.addEventListener('pointermove',e=>{const r=card.closest('.perspective').getBoundingClientRect();px=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));py=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));if(!reduced.matches){targetX=(.5-py)*18;targetY=(px-.5)*22}targetLight=1});
card.addEventListener('pointerenter',()=>{hovering=true;targetLight=1});card.addEventListener('pointerleave',()=>{hovering=false;targetX=targetY=0;targetLight=0});
card.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});card.addEventListener('pointercancel',()=>{hovering=false;down=null;targetX=targetY=0;targetLight=0});
card.addEventListener('click',e=>{if(e.detail&&down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;flip();down=null});flipButton.onclick=flip;
foil.onchange=()=>tilt.classList.toggle('no-foil',!foil.checked);
function tick(now){
 const dt=lastTime?Math.min(.05,(now-lastTime)/1000):1/60;lastTime=now;
 const paused=document.querySelector('#pause').getAttribute('aria-pressed')==='true';
 if(!document.hidden&&!paused)idleTime+=dt*Number(sliders['idle-speed'].input.value);
 const idle=!hovering&&!reduced.matches&&document.querySelector('#idle-light').checked;
 const phase=idleTime*Math.PI*2/20;
 const tx=reduced.matches?0:idle?Math.sin(phase)*3:targetX;
 const ty=reduced.matches?0:idle?Math.cos(phase)*4:targetY;
 const lx=idle?.5+Math.cos(phase)*.34:px,ly=idle?.5+Math.sin(phase)*.34:py;
 const k=1-Math.exp(-(hovering?9:2.2)*dt);
 rx+=(tx-rx)*k;ry+=(ty-ry)*k;mx+=(lx-mx)*k;my+=(ly-my)*k;
 const desiredLight=idle?.55+.15*Math.sin(phase):targetLight;
 light+=(desiredLight-light)*k;
 tilt.style.setProperty('--pointer-from-left',mx);tilt.style.setProperty('--pointer-from-top',my);tilt.style.setProperty('--pointer-from-center',Math.min(1,Math.hypot(mx-.5,my-.5)*2));
 tilt.style.setProperty('--holo-x',(37+mx*26)+'%');tilt.style.setProperty('--holo-y',(33+my*34)+'%');
 tilt.style.setProperty('--rx',rx+'deg');tilt.style.setProperty('--ry',ry+'deg');
 tilt.style.setProperty('--mx',(mx*100)+'%');tilt.style.setProperty('--my',(my*100)+'%');tilt.style.setProperty('--light',light.toFixed(3));
 const depth=!reduced.matches&&document.querySelector('#depth-motion').checked;
 const amount=Number(sliders['depth-strength'].input.value);
 window.cardDepth.x=depth?ry/11*amount:0;window.cardDepth.y=depth?-rx/9*amount:0;
 requestAnimationFrame(tick);
}requestAnimationFrame(tick);updateLabel();
})();
