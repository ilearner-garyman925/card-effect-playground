'use strict';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d'),W=896,H=1200;
const load=src=>{const i=new Image();i.src=src;return i};
const body=load('body-v2.png'),arm=load('arm-v2.png'),heads=load('heads-v2.png'),bg=load('background-v1.png'),original=load('B.jpg');
const state={motion:true,rain:true,glow:true,hover:true,pins:false,solo:false};
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,t=0,last=0,ready=false;
const pause=document.querySelector('#pause'),status=document.querySelector('#status'),strength=document.querySelector('#strength'),scrub=document.querySelector('#scrub');
function label(){pause.textContent=paused?'播放動畫':'暫停動畫';pause.setAttribute('aria-pressed',String(paused))}label();pause.onclick=()=>{paused=!paused;last=0;label()};
for(const key of Object.keys(state))document.querySelector('#'+key).onchange=e=>state[key]=e.target.checked;
document.querySelector('#reset').onclick=()=>{t=0;strength.value=1;paused=false;label()};
scrub.oninput=()=>{t=Number(scrub.value);paused=true;label()};
for(const b of document.querySelectorAll('[data-pose]'))b.onclick=()=>{t=Number(b.dataset.pose);paused=true;label()};
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
function envelope(s,a,b,c,d){return ease((s-a)/(b-a))*(1-ease((s-c)/(d-c)))}
function pose(){const s=t%6,a=state.motion?Number(strength.value):0,down=envelope(s,.45,1.2,2.05,2.75)*a,up=envelope(s,2.35,3.15,4.65,5.5)*a;return{s,down,up,head:down>.32?1:up>.30?2:0,angle:down*.055-up*.055,arm:-down*.13+up*.025,breath:state.motion?Math.sin(s*Math.PI/3)*2:0,stage:down>.4?'低頭查看平板':up>.4?'抬頭望向載具':'返回正面'}}
const ship=new Path2D('M 535 87 L 556 72 L 579 66 L 613 59 L 672 39 L 693 51 L 659 78 L 680 80 L 689 91 L 678 107 L 661 107 L 645 100 L 621 120 L 579 128 L 546 113 L 536 103 Z');
// Joint coordinates use the original 896 × 1200 reference, independent of texture resolution.
const neck={x:461,y:387},shoulder={x:545,y:427};
let bodyGlow,armGlow;
function glowMask(img){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(img,0,0,W,H);const d=g.getImageData(0,0,W,H);for(let i=0;i<d.data.length;i+=4){const r=d.data[i],v=d.data[i+1],b=d.data[i+2];d.data[i+3]*=Math.max(0,Math.min(1,(Math.min(v,b)-r-40)/80));}g.putImageData(d,0,0);return c}
function paintPart(img,mask,pivot,angle,dy=0){ctx.save();ctx.translate(pivot.x,pivot.y+dy);ctx.rotate(angle);ctx.translate(-pivot.x,-pivot.y);ctx.drawImage(img,0,0,W,H);if(state.glow&&mask){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.15+.65*(.5+.5*Math.sin(t*Math.PI/1.5));ctx.drawImage(mask,0,0)}ctx.restore()}
function draw(){const p=pose();ctx.clearRect(0,0,W,H);
if(state.solo){for(let y=0;y<H;y+=32)for(let x=0;x<W;x+=32){ctx.fillStyle=((x+y)/32)%2?'#142332':'#1c3040';ctx.fillRect(x,y,32,32)}}else{ctx.drawImage(bg,0,0,W,H);ctx.save();ctx.translate(state.hover?Math.sin(t*Math.PI/3)*22:0,state.hover?Math.sin(t*Math.PI/1.5)*8:0);ctx.clip(ship);ctx.drawImage(original,0,0,W,H);ctx.restore();ctx.save();ctx.fillStyle='#06101d';ctx.globalAlpha=.35;ctx.filter='blur(7px)';ctx.beginPath();ctx.ellipse(365,1163,48,8,0,0,Math.PI*2);ctx.ellipse(613,1180,26,7,0,0,Math.PI*2);ctx.fill();ctx.restore()}
// Rigid body plates, independent shoulder rotation and neck rotation.
paintPart(body,bodyGlow,{x:450,y:1100},0);
paintPart(arm,armGlow,shoulder,p.arm,p.breath);
ctx.save();ctx.translate(neck.x,neck.y+p.breath+p.down*5-p.up*3);ctx.rotate(p.angle);ctx.translate(-neck.x,-neck.y);
const cell=heads.width/3;ctx.drawImage(heads,p.head*cell,0,cell,heads.height,343,190,232,232);ctx.restore();
if(state.rain&&!state.solo){for(let i=0;i<125;i++){const z=i%3,x=((i*139.7-t*(20+z*9))%960+960)%960-30,y=(i*91.3+t*(420+z*210))%1270-35;ctx.strokeStyle=`rgba(155,213,244,${.2+z*.1})`;ctx.lineWidth=1+z*.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+20+z*10);ctx.stroke()}for(let i=0;i<20;i++){const q=(t*.65+i*.173)%1;ctx.strokeStyle=`rgba(127,214,246,${(1-q)*.45})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(30+(i*177)%840,965+(i*73)%225,3+q*26,1+q*5,0,0,Math.PI*2);ctx.stroke()}}
if(state.pins){ctx.font='17px system-ui';for(const[n,v]of[['頸部',neck],['肩部',shoulder]]){ctx.fillStyle='#7bffdf';ctx.strokeStyle='#06101d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(v.x,v.y,8,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillText(n,v.x+13,v.y)}}
canvas.dataset.time=t.toFixed(3);canvas.dataset.pose=p.head;canvas.dataset.ready='true';scrub.value=p.s;status.textContent=`${paused?'已暫停':'播放中'} · ${p.stage} · ${p.s.toFixed(1)} / 6 秒`;
}
function frame(now){if(last&&!paused&&!document.hidden)t+=Math.min(.05,(now-last)/1000);last=now;if(ready)draw();requestAnimationFrame(frame)}
Promise.all([body,arm,heads,bg,original].map(i=>i.decode())).then(()=>{bodyGlow=glowMask(body);armGlow=glowMask(arm);ready=true;requestAnimationFrame(frame)}).catch(e=>{status.textContent='未能啟動：'+e.message;console.error(e)});

