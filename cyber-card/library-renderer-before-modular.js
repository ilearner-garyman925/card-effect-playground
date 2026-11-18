'use strict';
const canvas=document.querySelector('#scene'),sceneCtx=canvas.getContext('2d'),W=896,H=1200;
let ctx=sceneCtx;
const actor=document.createElement('canvas');actor.width=W;actor.height=H;
const actorCtx=actor.getContext('2d');
const headLayer=document.createElement('canvas');headLayer.width=232;headLayer.height=232;
const headCtx=headLayer.getContext('2d');
const load=src=>{const i=new Image();i.src=src;return i};
const body=load('body-v2.png'),arm=load('arm-v2.png'),heads=load('heads-v2.png'),bg=load('background-v1.png'),original=load('B.jpg');
const longhair=load('longhair-outfits-v1.png');
const druid=load('druid-person-v1.png'),forest=load('forest-background-v1.png');
const selection=window.cardSelection||{character:'cyber',background:'city'};
const state={motion:true,rain:true,glow:true,hover:true,pins:false,solo:false};
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,t=0,last=0,ready=false;
const pause=document.querySelector('#pause'),status=document.querySelector('#status'),strength=document.querySelector('#strength'),scrub=document.querySelector('#scrub');
function label(){pause.textContent=paused?'播放動畫':'暫停動畫';pause.setAttribute('aria-pressed',String(paused))}label();pause.onclick=()=>{paused=!paused;last=0;label()};
for(const key of Object.keys(state))document.querySelector('#'+key).onchange=e=>state[key]=e.target.checked;
document.querySelector('#reset').onclick=()=>{t=0;strength.value=1;paused=false;label()};
scrub.oninput=()=>{t=Number(scrub.value);paused=true;label()};
for(const b of document.querySelectorAll('[data-pose]'))b.onclick=()=>{t=Number(b.dataset.pose);paused=true;label()};
// Quintic easing keeps velocity and acceleration continuous at each hold.
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10)};
function envelope(s,a,b,c,d){return ease((s-a)/(b-a))*(1-ease((s-c)/(d-c)))}
function pose(){const s=t%6,a=state.motion?Number(strength.value):0;
if(selection.identity==='longhair'||selection.character==='druid')return{s,down:0,up:0,head:0,weights:[1,0,0],angle:0,arm:0,breath:0,sway:Math.sin(s*Math.PI/3)*10*a,lift:(1-Math.cos(s*Math.PI/3))*2*a,stage:selection.identity==='longhair'?'整體待機擺動':'德魯伊施法待機'};
const d=envelope(s,.3,1.3,1.95,2.85),u=envelope(s,2.4,3.4,4.55,5.7),down=d*a,up=u*a;
const armDown=envelope(s,.42,1.42,2.07,2.97)*a,armUp=envelope(s,2.52,3.52,4.67,5.82)*a;
const phase=s*Math.PI/3;
// A short continuous replacement transition avoids a one-frame head-pose cut.
const wd=a?ease((d-.20)/.42):0,wu=a?ease((u-.20)/.42):0,total=Math.max(1,wd+wu);
return{s,down,up,head:down>.32?1:up>.30?2:0,weights:[1-(wd+wu)/total,wd/total,wu/total],angle:down*.075-up*.07,
arm:-armDown*.16+armUp*.045,breath:Math.sin(phase)*1.5*a,
sway:Math.sin(phase)*24*a,lift:(1-Math.cos(phase*2))*2.5*a,
stage:down>.4?'低頭查看平板':up>.4?(selection.background==='city'?'抬頭望向載具':'抬頭觀察森林'):'返回正面'}}
function bodyPoint(x,y,p){const upper=1-ease((y-650)/440);return[x+p.sway*upper,y-p.lift*upper]}
const warped=document.createElement('canvas');warped.width=W;warped.height=H;
const gl=warped.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});
let warpProgram,warpBuffer,warpTexture,warpCoords;
function setupWarp(){
if(!gl)throw Error('需要支援 WebGL 的瀏覽器');
const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
warpProgram=gl.createProgram();gl.attachShader(warpProgram,shader(gl.VERTEX_SHADER,'attribute vec2 pos;attribute vec2 uv;varying vec2 v;void main(){v=uv;gl_Position=vec4(pos.x/448.0-1.0,1.0-pos.y/600.0,0.,1.);}'));gl.attachShader(warpProgram,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform sampler2D tex;void main(){gl_FragColor=texture2D(tex,v);}'));gl.linkProgram(warpProgram);if(!gl.getProgramParameter(warpProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(warpProgram));gl.useProgram(warpProgram);
warpCoords=new Float32Array(80*6*4);warpBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,warpBuffer);gl.bufferData(gl.ARRAY_BUFFER,warpCoords,gl.DYNAMIC_DRAW);
for(const[n,offset]of[['pos',0],['uv',8]]){const a=gl.getAttribLocation(warpProgram,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,16,offset)}
warpTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,warpTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.viewport(0,0,W,H);
}
function compositeActor(p){
// Shared mesh vertices eliminate the antialiased seams of individual strips.
let k=0;for(let row=0;row<80;row++){const y=row*15;for(const[x,sy]of[[0,y],[W,y],[0,y+15],[0,y+15],[W,y],[W,y+15]]){const[dx,dy]=bodyPoint(x,sy,p);warpCoords[k++]=dx;warpCoords[k++]=dy;warpCoords[k++]=x/W;warpCoords[k++]=sy/H}}
gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.bindBuffer(gl.ARRAY_BUFFER,warpBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,warpCoords);gl.bindTexture(gl.TEXTURE_2D,warpTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,actor);gl.drawArrays(gl.TRIANGLES,0,480);const figureScale=Number(canvas.dataset.figureScale||1);sceneCtx.save();sceneCtx.translate(W/2,160);sceneCtx.scale(figureScale,figureScale);sceneCtx.translate(-W/2,-160);sceneCtx.drawImage(warped,0,0);sceneCtx.restore();
}
const ship=new Path2D('M 535 87 L 556 72 L 579 66 L 613 59 L 672 39 L 693 51 L 659 78 L 680 80 L 689 91 L 678 107 L 661 107 L 645 100 L 621 120 L 579 128 L 546 113 L 536 103 Z');
// Joint coordinates use the original 896 × 1200 reference, independent of texture resolution.
const neck={x:461,y:387},shoulder={x:545,y:427};
let bodyGlow,armGlow;
function glowMask(img){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(img,0,0,W,H);const d=g.getImageData(0,0,W,H);for(let i=0;i<d.data.length;i+=4){const r=d.data[i],v=d.data[i+1],b=d.data[i+2];d.data[i+3]*=Math.max(0,Math.min(1,(Math.min(v,b)-r-40)/80));}g.putImageData(d,0,0);return c}
function paintPart(img,mask,pivot,angle,dy=0){ctx.save();ctx.translate(pivot.x,pivot.y+dy);ctx.rotate(angle);ctx.translate(-pivot.x,-pivot.y);ctx.drawImage(img,0,0,W,H);if(state.glow&&mask){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.15+.65*(.5+.5*Math.sin(t*Math.PI/1.5));ctx.drawImage(mask,0,0)}ctx.restore()}
const depthLayers={background:{x:0,y:0},actor:{x:0,y:0},front:{x:0,y:0}};
function updateDepth(dt){const target=window.cardDepth||{x:0,y:0};
 for(const [key,amount,rate] of [['background',-12,3],['actor',22,7],['front',31,10]]){
 const layer=depthLayers[key],k=1-Math.exp(-rate*dt);
 layer.x+=(target.x*amount-layer.x)*k;const vertical=target.y*amount*.65;
 // Keep the druid's original lower-leg crop behind the title plaque.
 const safeY=selection.character==='druid'&&key==='actor'?Math.max(-12,Math.min(20,vertical)):vertical;
 layer.y+=(safeY-layer.y)*k;
 }
}
function depthPass(key,render){ctx.save();const d=depthLayers[key];ctx.translate(d.x,d.y);render();ctx.restore()}
function renderEffects(pass,p){
 if(state.solo)return;
 // Magic stays with the actor; environmental particles use independent depth.
 depthPass('actor',()=>window.drawCardEffects(ctx,pass,t,p,{...selection,effects:{magic:selection.effects.magic}},Number(canvas.dataset.figureScale||1)));
 depthPass(pass==='front'?'front':'background',()=>window.drawCardEffects(ctx,pass,t,p,{...selection,effects:{rain:selection.effects.rain,fireflies:selection.effects.fireflies}},Number(canvas.dataset.figureScale||1)));
}
function draw(){const p=pose();ctx.clearRect(0,0,W,H);
if(state.solo){for(let y=0;y<H;y+=32)for(let x=0;x<W;x+=32){ctx.fillStyle=((x+y)/32)%2?'#142332':'#1c3040';ctx.fillRect(x,y,32,32)}}else{ctx.save();ctx.translate(depthLayers.background.x,depthLayers.background.y);ctx.translate(W/2,H/2);const cover=Math.max(1.045,1+2*(Math.abs(depthLayers.background.x)+3)/W,1+2*(Math.abs(depthLayers.background.y)+3)/H);ctx.scale(cover,cover);ctx.translate(-W/2,-H/2);ctx.drawImage(selection.background==='forest'?forest:bg,0,0,W,H);if(selection.background==='city'){ctx.save();ctx.translate(state.hover?Math.sin(t*Math.PI/3)*22:0,state.hover?Math.sin(t*Math.PI/1.5)*8:0);ctx.clip(ship);ctx.drawImage(original,0,0,W,H);ctx.restore()}ctx.restore()}
renderEffects('back',p);
// Assemble independent parts first, then move the assembled upper body.
actorCtx.clearRect(0,0,W,H);ctx=actorCtx;
if(selection.identity==='longhair'){const cell=longhair.width/2,cyber=selection.character==='cyber',h=870,w=cell/longhair.height*h;const center=cyber?.38:.586;ctx.drawImage(longhair,cyber?cell:0,0,cell,longhair.height,448-w*center,160,w,h)}else if(selection.character==='druid'){ctx.drawImage(druid,0,0,W,H)}else{
paintPart(body,bodyGlow,{x:450,y:1100},0);
paintPart(arm,armGlow,shoulder,p.arm,p.breath);
ctx.save();ctx.translate(neck.x,neck.y+p.breath+p.down*5-p.up*3);ctx.rotate(p.angle);ctx.translate(-neck.x,-neck.y);
const cell=heads.width/3;headCtx.clearRect(0,0,232,232);headCtx.globalCompositeOperation='lighter';
for(let i=0;i<3;i++){if(p.weights[i]<=0)continue;headCtx.globalAlpha=p.weights[i];headCtx.drawImage(heads,i*cell,0,cell,heads.height,0,0,232,232)}headCtx.globalAlpha=1;
ctx.drawImage(headLayer,343,190);ctx.restore();}ctx=sceneCtx;depthPass('actor',()=>compositeActor(p));
renderEffects('front',p);
if(state.pins&&selection.identity!=='longhair'&&selection.character==='cyber'){ctx.save();ctx.translate(depthLayers.actor.x,depthLayers.actor.y);const sc=Number(canvas.dataset.figureScale||1);ctx.translate(W/2,160);ctx.scale(sc,sc);ctx.translate(-W/2,-160);ctx.font='17px system-ui';for(const[n,v]of[['頸部',neck],['肩部',shoulder]]){const[x,y]=bodyPoint(v.x,v.y,p);ctx.fillStyle='#7bffdf';ctx.strokeStyle='#06101d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillText(n,x+13,y)}ctx.restore()}
canvas.dataset.time=t.toFixed(3);canvas.dataset.pose=p.head;canvas.dataset.ready='true';scrub.value=p.s;status.textContent=`${paused?'已暫停':'播放中'} · ${p.stage} · ${p.s.toFixed(1)} / 6 秒`;
}
function frame(now){if(last&&!paused&&!document.hidden)t+=Math.min(.05,(now-last)/1000);const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;updateDepth(dt);if(ready)draw();requestAnimationFrame(frame)}
Promise.all([body,arm,heads,bg,original,druid,forest,longhair].map(i=>i.decode())).then(()=>{setupWarp();bodyGlow=glowMask(body);armGlow=glowMask(arm);ready=true;window.dispatchEvent(new Event('card-assets-ready'));requestAnimationFrame(frame)}).catch(e=>{status.textContent='未能啟動：'+e.message;document.querySelector('#library-status').textContent='素材載入失敗，請重新整理';console.error(e)});


