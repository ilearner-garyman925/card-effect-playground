'use strict';
const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d'),W=896,H=1200;
const image=src=>{const i=new Image();i.src=src;return i};
const person=image('person-v1.png'),background=image('background-v1.png'),original=image('B.jpg');
const state={motion:true,rain:true,glow:true,hover:true,pins:false,solo:false};
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,t=0,last=0,ready=false,drag=null;
const pins=[{name:'頭部',x:465,y:300,r:160,dx:0,dy:0},{name:'胸口',x:458,y:470,r:180,dx:0,dy:0},{name:'腰部',x:454,y:657,r:170,dx:0,dy:0},{name:'手腕',x:637,y:496,r:115,dx:0,dy:0},{name:'左腳固定',x:362,y:1120,r:120,dx:0,dy:0,locked:true},{name:'右腳固定',x:612,y:1140,r:120,dx:0,dy:0,locked:true}];
const pause=document.querySelector('#pause'),status=document.querySelector('#status'),strength=document.querySelector('#strength');
function label(){pause.textContent=paused?'播放動畫':'暫停動畫';pause.setAttribute('aria-pressed',String(paused))}label();pause.onclick=()=>{paused=!paused;label()};
for(const key of Object.keys(state))document.querySelector('#'+key).onchange=e=>state[key]=e.target.checked;
document.querySelector('#reset').onclick=()=>{for(const p of pins)p.dx=p.dy=0;strength.value=1;t=0};
function point(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height}}
canvas.addEventListener('pointerdown',e=>{if(!state.pins)return;const q=point(e);drag=pins.find(p=>!p.locked&&Math.hypot(p.x+p.dx-q.x,p.y+p.dy-q.y)<45);if(drag){canvas.setPointerCapture(e.pointerId);e.preventDefault()}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const q=point(e);drag.dx=Math.max(-35,Math.min(35,q.x-drag.x));drag.dy=Math.max(-25,Math.min(25,q.y-drag.y))});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
const smooth=(a,b,v)=>{const u=Math.min(1,Math.max(0,(v-a)/(b-a)));return u*u*(3-2*u)};
function deform(x,y,phase,amount){const leg=1-smooth(770,1080,y),upper=1-smooth(650,1050,y),head=1-smooth(350,425,y);const sway=Math.sin(phase)*8*amount,breath=(1-Math.cos(phase))*2.8*amount;
let xx=x+sway*leg,yy=y-breath*upper;
// Rigid head rotation blended only at the neck; armor remains nearly rigid.
const angle=Math.sin(phase)*.028*amount,rx=x-461,ry=y-392;
xx+=head*(rx*Math.cos(angle)-ry*Math.sin(angle)-rx);yy+=head*(rx*Math.sin(angle)+ry*Math.cos(angle)-ry);
const hand=Math.exp(-((x-640)**2/10000+(y-490)**2/8500));
xx+=hand*Math.sin(phase)*3*amount;yy+=hand*Math.sin(phase)*5*amount;
for(const p of pins){if(p.locked)continue;const weight=Math.exp(-((x-p.x)**2+(y-p.y)**2)/(p.r*p.r*.65))*leg;xx+=p.dx*weight;yy+=p.dy*weight}
return[xx,yy]}
const layer=document.createElement('canvas');layer.width=W;layer.height=H;const gl=layer.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
let program,buffer,uvBuffer,texture,vertices,sourceCoords,triangles,pulse;
function setup(){if(!gl)throw Error('此瀏覽器未啟用 WebGL');program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;attribute vec2 uv;varying vec2 texcoord;void main(){texcoord=uv;gl_Position=vec4(position.x/448.0-1.0,1.0-position.y/600.0,0.0,1.0);}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D image;uniform float pulse;varying vec2 texcoord;void main(){vec4 c=texture2D(image,texcoord);float cyan=smoothstep(.12,.35,min(c.g,c.b)-c.r)*smoothstep(.4,.7,c.b);c.rgb+=vec3(.05,.38,.5)*cyan*pulse;gl_FragColor=c;}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const coords=[],uvs=[];const nx=44,ny=60;for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){for(const[a,b]of[[i,j],[i+1,j],[i,j+1],[i,j+1],[i+1,j],[i+1,j+1]]){coords.push(a/nx*W,b/ny*H);uvs.push(a/nx,b/ny)}}sourceCoords=new Float32Array(coords);vertices=new Float32Array(coords.length);triangles=coords.length/2;
buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
uvBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW);const uv=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,person);pulse=gl.getUniformLocation(program,'pulse');gl.viewport(0,0,W,H)}
const ship=new Path2D('M 535 87 L 556 72 L 579 66 L 613 59 L 672 39 L 693 51 L 659 78 L 680 80 L 689 91 L 678 107 L 661 107 L 645 100 L 621 120 L 579 128 L 546 113 L 536 103 Z');
function draw(){const phase=t*Math.PI/3,amount=state.motion?Number(strength.value):0;
ctx.clearRect(0,0,W,H);if(state.solo){for(let y=0;y<H;y+=32)for(let x=0;x<W;x+=32){ctx.fillStyle=((x+y)/32)%2?'#142332':'#1c3040';ctx.fillRect(x,y,32,32)}}else{ctx.drawImage(background,0,0,W,H);ctx.save();if(state.hover)ctx.translate(Math.sin(phase)*23,Math.sin(phase*2)*9);ctx.clip(ship);ctx.drawImage(original,0,0,W,H);ctx.restore()}
for(let i=0;i<sourceCoords.length;i+=2){const d=deform(sourceCoords[i],sourceCoords[i+1],phase,amount);vertices[i]=d[0];vertices[i+1]=d[1]}
gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,vertices);gl.uniform1f(pulse,state.glow?.15+.65*(.5+.5*Math.sin(phase*2)):0);gl.drawArrays(gl.TRIANGLES,0,triangles);ctx.drawImage(layer,0,0);
if(state.rain&&!state.solo){for(let i=0;i<150;i++){const z=i%3,x=((i*139.7-t*(20+z*9))%960+960)%960-30,y=(i*91.3+t*(420+z*210))%1270-35;ctx.strokeStyle=`rgba(155,213,244,${.24+z*.1})`;ctx.lineWidth=1+z*.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+22+z*10);ctx.stroke()}for(let i=0;i<20;i++){const p=(t*.65+i*.173)%1;ctx.strokeStyle=`rgba(127,214,246,${(1-p)*.5})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(30+(i*177)%840,965+(i*73)%225,3+p*26,1+p*5,0,0,Math.PI*2);ctx.stroke()}}
if(state.pins){ctx.font='18px system-ui';for(const p of pins){const [x,y]=deform(p.x,p.y,phase,amount);ctx.fillStyle=p.locked?'#ffcb7d':'#7bffdf';ctx.strokeStyle='#07131e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillText(p.name,x+15,y+6)}}
canvas.dataset.time=t.toFixed(2);canvas.dataset.ready='true';status.textContent=paused?'已暫停':`播放中 · ${(t%6).toFixed(1)} / 6 秒`}
function frame(now){if(last&&!paused&&!document.hidden)t+=Math.min(.05,(now-last)/1000);last=now;if(ready)draw();requestAnimationFrame(frame)}
Promise.all([person.decode(),background.decode(),original.decode()]).then(()=>{setup();ready=true;requestAnimationFrame(frame)}).catch(e=>{status.textContent='未能啟動：'+e.message;console.error(e)});
