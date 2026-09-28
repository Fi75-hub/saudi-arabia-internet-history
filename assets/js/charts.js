
function drawBarChart(canvas, labels, values){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  const pad={l:60,r:20,t:20,b:40};
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#5d7aa3'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();
  const maxV=Math.max(...values)*1.15;
  const chartW=W-pad.l-pad.r, chartH=H-pad.t-pad.b;
  const barW=chartW/values.length*0.6;
  values.forEach((v,i)=>{
    const x=pad.l+(i+0.5)*chartW/values.length-barW/2;
    const h=(v/maxV)*chartH;
    const y=H-pad.b-h;
    const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#00c2ff'); g.addColorStop(1,'#0e7dc1');
    ctx.fillStyle=g; ctx.fillRect(x,y,barW,h);
    ctx.fillStyle='#cfe3ff'; ctx.textAlign='center'; ctx.font='12px system-ui'; ctx.fillText(labels[i], x+barW/2, H-pad.b+16);
    ctx.fillStyle='#fff'; ctx.font='bold 12px system-ui'; ctx.fillText((v/1e6).toFixed(1)+'M', x+barW/2, y-6);
  });
  ctx.fillStyle='#9fb5d6'; ctx.textAlign='right';
  const steps=5;
  for(let s=0;s<=steps;s++){
    const val=maxV*s/steps;
    const y=H-pad.b-(val/maxV)*chartH;
    ctx.fillText((val/1e6).toFixed(0)+'M', pad.l-8, y+4);
    ctx.strokeStyle='rgba(255,255,255,.06)';
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
  }
}
function drawLineChart(canvas, labels, values){
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  const pad={l:60,r:20,t:20,b:40};
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#5d7aa3'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();
  const maxV=Math.max(...values)*1.15;
  const chartW=W-pad.l-pad.r, chartH=H-pad.t-pad.b;
  ctx.strokeStyle='#ffd166'; ctx.lineWidth=3; ctx.beginPath();
  values.forEach((v,i)=>{
    const x=pad.l+(i/(values.length-1))*chartW;
    const y=H-pad.b-(v/maxV)*chartH;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  ctx.fillStyle='#ffd166'; ctx.textAlign='center'; ctx.font='12px system-ui';
  values.forEach((v,i)=>{
    const x=pad.l+(i/(values.length-1))*chartW;
    const y=H-pad.b-(v/maxV)*chartH;
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#cfe3ff'; ctx.fillText(labels[i], x, H-pad.b+16);
    ctx.fillStyle='#fff'; ctx.fillText(v+' Mbps', x, y-8);
  });
}
function drawDonut(canvas, value, total, label){
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width, H=canvas.height, R=Math.min(W,H)/2-12;
  ctx.clearRect(0,0,W,H);
  ctx.translate(W/2,H/2);
  ctx.beginPath(); ctx.strokeStyle='#0e7dc1'; ctx.lineWidth=18; ctx.arc(0,0,R,0,Math.PI*2); ctx.stroke();
  const angle=(value/total)*Math.PI*2;
  ctx.beginPath(); ctx.strokeStyle='#ffd166'; ctx.lineWidth=18; ctx.arc(0,0,R,-Math.PI/2,-Math.PI/2+angle); ctx.stroke();
  ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='bold 18px system-ui'; ctx.fillText(value+'%',0,6);
  ctx.fillStyle='#cfe3ff'; ctx.font='12px system-ui'; ctx.fillText(label,0,24);
  ctx.setTransform(1,0,0,1,0,0);
}
