// floating chemistry symbols that drift like feathers and clash like lightsabers
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv=document.getElementById('driftcanvas');
  if(!cv||!cv.getContext) return;
  const ctx=cv.getContext('2d');
  const DPR=Math.min(window.devicePixelRatio||1,2);
  const MONO='"JetBrains Mono", ui-monospace, monospace';
  const PURPLE=[181,123,255], TEAL=[63,224,197];
  const rgba=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  let W=0,H=0;
  function resize(){
    W=window.innerWidth; H=window.innerHeight;
    cv.width=W*DPR; cv.height=H*DPR; cv.style.width=W+'px'; cv.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  window.addEventListener('resize',resize);

  // tokens written with _ for subscript and ^ for superscript runs
  const RAW=['Nd','Pr','Dy','Fe','B','La','Ce','Sm','Th','Sc','Y','Li','REE','pH','HCl','NdFeB','D2EHPA',
    'Fe^3+','Fe^2+','Nd^3+','REE^3+','Cl^-','OH^-','SO_4^2-','C_2O_4^2-','H_2SO_4','Nd_2O_3','Fe_2O_3'];
  function parse(s){
    const seg=[]; let i=0;
    while(i<s.length){
      const c=s[i];
      if(c==='_'||c==='^'){ const k=c==='_'?1:2; i++; let t='';
        while(i<s.length&&/[0-9+\-]/.test(s[i])){t+=s[i++];} seg.push([t,k]); }
      else { let t=''; while(i<s.length&&s[i]!=='_'&&s[i]!=='^'){t+=s[i++];} seg.push([t,0]); }
    }
    return seg;
  }
  const TOKENS=RAW.map(parse);
  const fw=s=>'500 '+s+'px '+MONO;

  // pre-render each symbol once into a glowing sprite, so per-frame draws are cheap
  function sprite(seg,fs,color){
    const m=document.createElement('canvas').getContext('2d');
    let w=0; for(const[t,k]of seg){ m.font=fw(k?fs*0.7:fs); w+=m.measureText(t).width; }
    const pad=Math.ceil(fs*0.85), cw=Math.ceil(w)+pad*2, ch=Math.ceil(fs*1.9)+pad*2;
    const c=document.createElement('canvas'); c.width=cw*DPR; c.height=ch*DPR;
    const g=c.getContext('2d'); g.scale(DPR,DPR);
    g.textBaseline='middle'; g.fillStyle=rgba(color,1); g.shadowColor=rgba(color,1); g.shadowBlur=fs*0.45;
    let x=pad; const cy=ch/2;
    for(const[t,k]of seg){ const s=k?fs*0.7:fs; g.font=fw(s);
      const dy=k===1?fs*0.24:(k===2?-fs*0.30:0); g.fillText(t,x,cy+dy); x+=g.measureText(t).width; }
    return {canvas:c,w:cw,h:ch};
  }

  const parts=[];
  function spawn(init){
    const seg=TOKENS[(Math.random()*TOKENS.length)|0];
    const fs=rnd(15,34), color=Math.random()<0.42?TEAL:PURPLE, sp=sprite(seg,fs,color);
    const ang=rnd(0,Math.PI*2), v=rnd(0.25,0.85);
    return {sp,color,
      x:rnd(0,W), y:init?rnd(0,H):(Math.random()<.5?-30:H+30),
      vx:Math.cos(ang)*v, vy:Math.sin(ang)*v,
      rot:rnd(-0.35,0.35), vr:rnd(-0.0035,0.0035),
      alpha:rnd(0.10,0.24),
      r:Math.min(sp.w,sp.h)*0.38,
      wob:rnd(0,Math.PI*2), wsp:rnd(0.006,0.02), wamp:rnd(0.004,0.012),
      cd:0};
  }
  const COUNT=Math.round(Math.max(16,Math.min(34,W*H/52000)));
  for(let i=0;i<COUNT;i++) parts.push(spawn(true));

  // six actual molecule pictures (atoms + bonds), not formulas, that also fly and clash
  function drawBond(g,x1,y1,x2,y2,scale){
    g.shadowBlur=0; g.strokeStyle='rgba(190,182,222,0.55)'; g.lineWidth=Math.max(1.4,scale*0.05);
    g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke();
  }
  function molSprite(def,scale){
    const pad=Math.ceil(scale*0.55)+9, size=Math.ceil(scale*2)+pad*2;
    const c=document.createElement('canvas'); c.width=size*DPR; c.height=size*DPR;
    const g=c.getContext('2d'); g.scale(DPR,DPR); g.lineCap='round';
    const cx=size/2, cy=size/2;
    const P=def.n.map(n=>[cx+n[0]*scale, cy+n[1]*scale, n[2]*scale, n[3]]);
    for(const[i,j,order]of def.b){ const a=P[i],b=P[j];
      if(order===2){ const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ox=-dy/L*scale*0.08,oy=dx/L*scale*0.08;
        drawBond(g,a[0]+ox,a[1]+oy,b[0]+ox,b[1]+oy,scale); drawBond(g,a[0]-ox,a[1]-oy,b[0]-ox,b[1]-oy,scale);
      } else drawBond(g,a[0],a[1],b[0],b[1],scale);
    }
    for(const[x,y,r,key]of P){ const col=key==='t'?TEAL:(key==='w'?[226,224,242]:PURPLE);
      g.shadowColor=rgba(col,1); g.shadowBlur=r*1.7;
      const rg=g.createRadialGradient(x,y,0,x,y,r);
      rg.addColorStop(0,rgba(col,1)); rg.addColorStop(0.6,rgba(col,0.85)); rg.addColorStop(1,rgba(col,0.25));
      g.fillStyle=rg; g.beginPath(); g.arc(x,y,r,0,6.2832); g.fill();
    }
    return {canvas:c,w:size,h:size};
  }
  const benz=[]; for(let k=0;k<6;k++){ const a=-Math.PI/2+k*Math.PI/3; benz.push([Math.cos(a)*0.82,Math.sin(a)*0.82,0.11,'p']); }
  const MOLS=[
    {n:[[0,0.25,0.20,'p'],[-0.72,-0.35,0.12,'w'],[0.72,-0.35,0.12,'w']], b:[[0,1,1],[0,2,1]]},                 // water H2O (bent)
    {n:[[0,0,0.18,'p'],[-0.85,0,0.16,'t'],[0.85,0,0.16,'t']], b:[[0,1,2],[0,2,2]]},                              // CO2 (linear)
    {n:benz, b:[[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1]]},                                               // benzene ring
    {n:[[0,0,0.20,'t'],[0,-0.85,0.13,'p'],[-0.8,0.45,0.13,'p'],[0.8,0.45,0.13,'p'],[0,0.5,0.11,'p']], b:[[0,1,2],[0,2,1],[0,3,1],[0,4,2]]}, // sulfate tetrahedral
    {n:[[0,0,0.22,'t'],[0,-0.9,0.12,'p'],[0,0.9,0.12,'p'],[-0.9,0,0.12,'p'],[0.9,0,0.12,'p'],[-0.52,-0.52,0.10,'p'],[0.52,0.52,0.10,'p']], b:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[0,5,1],[0,6,1]]}, // octahedral metal complex
    {n:[[-0.9,0.25,0.12,'p'],[-0.45,-0.25,0.12,'p'],[0,0.25,0.12,'p'],[0.45,-0.25,0.12,'p'],[0.9,0.25,0.12,'p']], b:[[0,1,1],[1,2,1],[2,3,1],[3,4,1]]}, // zig-zag alkyl chain
    {n:[[0,0,0.16,'p'],[0,-0.85,0.13,'w'],[0.8,0.4,0.13,'w'],[-0.8,0.4,0.13,'w'],[0,0.85,0.13,'w']], b:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]}, // methane CH4 (tetrahedral)
    {n:[[0,-0.2,0.17,'t'],[0,0.7,0.12,'w'],[-0.78,-0.6,0.12,'w'],[0.78,-0.6,0.12,'w']], b:[[0,1,1],[0,2,1],[0,3,1]]}, // ammonia NH3 (pyramidal)
    {n:[[0,0,0.18,'p'],[0,-0.88,0.16,'t'],[-0.78,0.45,0.14,'t'],[0.78,0.45,0.14,'t']], b:[[0,1,2],[0,2,1],[0,3,1]]}, // carbonate CO3 (trigonal)
    {n:[[-0.5,0,0.18,'t'],[0.5,0,0.18,'t']], b:[[0,1,2]]},                                                       // diatomic O2 (double bond)
    {n:[[-0.7,0.2,0.12,'p'],[-0.2,-0.2,0.12,'p'],[0.35,0.2,0.13,'p'],[0.9,-0.1,0.14,'w']], b:[[0,1,1],[1,2,1],[2,3,1]]}, // ethanol-like chain with O
    {n:(function(){const a=[];for(let k=0;k<6;k++){const t=-Math.PI/2+k*Math.PI/3;a.push([Math.cos(t)*0.8,Math.sin(t)*0.8,0.1,'p']);}return a;})(),
       b:[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1]]}                                                      // cyclohexane (single-bond ring)
  ];
  function spawnMol(def,init){
    const scale=rnd(20,30), sp=molSprite(def,scale), ang=rnd(0,Math.PI*2), v=rnd(0.22,0.68);
    return {sp,color:PURPLE, x:rnd(0,W), y:init?rnd(0,H):(Math.random()<.5?-30:H+30),
      vx:Math.cos(ang)*v, vy:Math.sin(ang)*v, rot:rnd(-0.35,0.35), vr:rnd(-0.004,0.004),
      alpha:rnd(0.22,0.36), r:Math.min(sp.w,sp.h)*0.34,
      wob:rnd(0,Math.PI*2), wsp:rnd(0.006,0.02), wamp:rnd(0.004,0.012), cd:0};
  }
  const MOLN=Math.round(Math.max(10,Math.min(22,W*H/70000)));
  for(let i=0;i<MOLN;i++) parts.push(spawnMol(MOLS[(Math.random()*MOLS.length)|0],true));

  const flashes=[], sparks=[];
  function clash(x,y,nx,ny){
    const base=Math.atan2(ny,nx);            // along the contact normal
    const spread=rnd(0.62,0.92);             // half-angle between the two blades -> X
    const swap=Math.random()<.5;
    flashes.push({x,y,base,spread,life:0,max:rnd(260,440),len:rnd(26,54),
                  cA:swap?TEAL:PURPLE, cB:swap?PURPLE:TEAL}); // two clashing sabers, different colors
    const n=5+(Math.random()*5|0);
    for(let i=0;i<n;i++){ const a=rnd(0,Math.PI*2),s=rnd(0.7,2.6);
      sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0,max:rnd(160,340),color:Math.random()<.5?TEAL:PURPLE}); }
  }
  // one glowing saber blade: colored halo + white-hot core
  function blade(x,y,ang,len,color,k){
    const ex=Math.cos(ang)*len, ey=Math.sin(ang)*len;
    ctx.lineCap='round';
    ctx.strokeStyle=rgba(color,0.26*k); ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(x-ex,y-ey); ctx.lineTo(x+ex,y+ey); ctx.stroke();
    ctx.strokeStyle=rgba(color,0.4*k); ctx.lineWidth=3.6;
    ctx.beginPath(); ctx.moveTo(x-ex,y-ey); ctx.lineTo(x+ex,y+ey); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,'+(0.5*k)+')'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(x-ex,y-ey); ctx.lineTo(x+ex,y+ey); ctx.stroke();
  }

  let last=performance.now(), raf=0;
  function frame(now){
    const elapsed=Math.min(34,now-last); last=now; const dt=elapsed/16.67;
    ctx.clearRect(0,0,W,H);

    for(const p of parts){
      // feather wander: gentle, ever-shifting acceleration in x and y
      p.wob+=p.wsp*dt;
      p.vx+=Math.cos(p.wob)*p.wamp*dt;
      p.vy+=Math.sin(p.wob*1.27+1.1)*p.wamp*dt;
      const sp=Math.hypot(p.vx,p.vy), MAX=1.15;
      if(sp>MAX){ p.vx*=MAX/sp; p.vy*=MAX/sp; }
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.rot+=p.vr*dt;
      // soft bounce off edges so they stay in play and keep meeting
      if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx);} else if(p.x>W-p.r){p.x=W-p.r;p.vx=-Math.abs(p.vx);}
      if(p.y<p.r){p.y=p.r;p.vy=Math.abs(p.vy);} else if(p.y>H-p.r){p.y=H-p.r;p.vy=-Math.abs(p.vy);}
      if(p.cd>0)p.cd-=dt;
    }

    // collisions -> bounce + lightsaber clash
    for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
      const a=parts[i],b=parts[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy), rr=a.r+b.r;
      if(d>0&&d<rr){
        const nx=dx/d, ny=dy/d, ov=(rr-d)/2;
        a.x-=nx*ov; a.y-=ny*ov; b.x+=nx*ov; b.y+=ny*ov;
        const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(vn<0){
          a.vx+=nx*vn; a.vy+=ny*vn; b.vx-=nx*vn; b.vy-=ny*vn;
          if(a.cd<=0&&b.cd<=0){ clash((a.x+b.x)/2,(a.y+b.y)/2,nx,ny); a.cd=10; b.cd=10; }
        }
      }
    }

    // draw symbols
    for(const p of parts){
      ctx.save(); ctx.globalAlpha=p.alpha; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.drawImage(p.sp.canvas,-p.sp.w/2,-p.sp.h/2,p.sp.w,p.sp.h); ctx.restore();
    }

    // draw clashes and sparks additively for a glowing saber burst
    ctx.globalCompositeOperation='lighter';
    for(let i=flashes.length-1;i>=0;i--){
      const f=flashes[i]; f.life+=elapsed;
      const tt=f.life/f.max; if(tt>=1){ flashes.splice(i,1); continue; }
      const k=1-tt, grow=Math.sin(Math.min(1,tt*4)*Math.PI/2), len=f.len*(0.5+0.7*grow);
      // white-hot bloom at the clash point
      const R=f.len*1.5;
      const rg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,R);
      rg.addColorStop(0,'rgba(255,255,255,'+(0.22*k)+')');
      rg.addColorStop(0.4,'rgba(255,255,255,'+(0.05*k)+')');
      rg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(f.x,f.y,R,0,6.2832); ctx.fill();
      // two crossing sabers of different colors form the X
      blade(f.x,f.y,f.base+f.spread,len,f.cA,k);
      blade(f.x,f.y,f.base-f.spread,len,f.cB,k);
    }
    for(let i=sparks.length-1;i>=0;i--){
      const s=sparks[i]; s.life+=elapsed; const tt=s.life/s.max;
      if(tt>=1){ sparks.splice(i,1); continue; }
      s.x+=s.vx*dt; s.y+=s.vy*dt; s.vx*=0.97; s.vy*=0.97;
      const k=1-tt;
      ctx.fillStyle=rgba(s.color,0.4*k); ctx.beginPath(); ctx.arc(s.x,s.y,1.5,0,6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';

    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  // pause when tab is hidden to save the battery
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ cancelAnimationFrame(raf); raf=0; }
    else if(!raf){ last=performance.now(); raf=requestAnimationFrame(frame); }
  });

  // periodic table tiles sliding left to right at irregular intervals (unchanged ambient layer)
  const drift=document.getElementById('drift');
  const elems=[
    [57,'La','Lanthanum'],[58,'Ce','Cerium'],[59,'Pr','Praseodymium'],
    [60,'Nd','Neodymium'],[62,'Sm','Samarium'],[64,'Gd','Gadolinium'],
    [66,'Dy','Dysprosium'],[21,'Sc','Scandium'],[39,'Y','Yttrium'],[90,'Th','Thorium']
  ];
  elems.forEach((e)=>{
    const t=document.createElement('div');
    t.className='elemtile'+(Math.random()<.4?' teal':'');
    t.innerHTML='<span class="pn">'+e[0]+'</span><span class="ps">'+e[1]+'</span><span class="pl">'+e[2]+'</span>';
    const dur=24+Math.random()*30;
    t.style.top=(5+Math.random()*85)+'vh';
    t.style.animationDuration=dur+'s';
    t.style.animationDelay=((Math.random()*2-1)*dur).toFixed(1)+'s';
    t.style.setProperty('--op',(0.08+Math.random()*0.08).toFixed(2));
    drift.appendChild(t);
  });
})();
