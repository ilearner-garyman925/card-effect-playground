// Independent, composable effects. Both passes share the animation clock.
window.drawCardEffects = (ctx, pass, time, pose, selection, scale) => {
  const fx = selection.effects || {};
  const phase = time * Math.PI / 3;
  ctx.save();
  if (fx.qi) {
    ctx.save();ctx.translate(448,160);ctx.scale(scale,scale);ctx.translate(-448,-160);
    ctx.translate(pose.sway*.7,-pose.lift);ctx.lineCap='round';
    const point=u=>{const a=u*Math.PI*2+phase;return [448+Math.cos(a)*365,850-u*440+Math.sin(a)*100,Math.sin(a)];};
    for(const [width,color] of [[26,'rgba(45,205,255,.10)'],[12,'rgba(45,220,255,.35)'],[4,'rgba(178,252,255,.95)']]){
      ctx.beginPath();ctx.lineWidth=width;ctx.strokeStyle=color;let active=false;
      for(let j=0;j<=200;j++){const [x,y,z]=point(j/200);const visible=(z>=0)===(pass==='front');if(visible){if(active)ctx.lineTo(x,y);else ctx.moveTo(x,y)}active=visible;}ctx.stroke();
    }
    for(let i=0;i<32;i++){const u=((i/32+time/12)%1),[x,y,z]=point(u);if((z>=0)!==(pass==='front'))continue;ctx.fillStyle='#c6fcff';ctx.beginPath();ctx.ellipse(x+Math.sin(i*17)*20,y+Math.cos(i*7)*25,2,5,-.5,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  if (fx.magic) {
    ctx.save();
    ctx.translate(448,160); ctx.scale(scale,scale); ctx.translate(-448,-160);
    ctx.translate(pose.sway * .7, -pose.lift);
    ctx.lineCap = 'round';
    // Split each helix at its depth crossings: rear arcs are occluded by the actor.
    for (let band=0;band<2;band++) {
      const point = u => {
        const a = u*Math.PI*4 + phase + band*Math.PI;
        return [448+Math.cos(a)*(275-band*28), 990-u*540, Math.sin(a)];
      };
      for (const [width,color] of [[18,'rgba(44,255,139,.09)'],[8,'rgba(64,255,156,.28)'],[2.8,'rgba(169,255,206,.88)']]) {
        ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
        let active=false;
        for(let j=0;j<=180;j++) {const [x,y,z]=point(j/180);const visible=(z>=0)===(pass==='front');if(visible){if(active)ctx.lineTo(x,y);else ctx.moveTo(x,y)}active=visible;}
        ctx.stroke();
      }
    }
    for(let i=0;i<16;i++) {
      const a=phase+i*2.4,z=Math.sin(a);
      if((z>=0)!==(pass==='front'))continue;
      const x=448+Math.cos(a)*(245+i%3*18), y=470+(i*47)%550+Math.sin(phase+i)*18;
      ctx.save();ctx.translate(x,y);ctx.rotate(a*.4);ctx.fillStyle=i%2?'#b7d969':'#55c877';
      ctx.beginPath();ctx.ellipse(0,0,4,11,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
  if(pass==='front' && fx.rain) {
    for(let i=0;i<125;i++) {
      const z=i%3,x=((i*139.7-time*(20+z*9))%960+960)%960-30,y=(i*91.3+time*(420+z*210))%1270-35;
      ctx.strokeStyle=`rgba(155,213,244,${.2+z*.1})`;ctx.lineWidth=1+z*.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+20+z*10);ctx.stroke();
    }
    for(let i=0;i<20;i++) {const q=(time*.65+i*.173)%1;ctx.strokeStyle=`rgba(127,214,246,${(1-q)*.45})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(30+(i*177)%840,965+(i*73)%225,3+q*26,1+q*5,0,0,Math.PI*2);ctx.stroke();}
  }
  if(fx.fireflies) {
    for(let i=0;i<36;i++) {
      if((i%2===0)!==(pass==='front'))continue;
      const x=35+(i*137)%820+Math.sin(phase+i)*24,y=110+(i*83)%940+Math.cos(phase+i*.7)*25;
      const alpha=.35+.5*(.5+.5*Math.sin(phase+i));
      const g=ctx.createRadialGradient(x,y,0,x,y,13);g.addColorStop(0,`rgba(225,255,153,${alpha})`);g.addColorStop(.2,`rgba(194,255,117,${alpha*.6})`);g.addColorStop(1,'rgba(167,255,89,0)');
      ctx.fillStyle=g;ctx.fillRect(x-13,y-13,26,26);
    }
  }
  ctx.restore();
};
