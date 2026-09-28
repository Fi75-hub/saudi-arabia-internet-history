
async function initHome(){
  const fallback = {
    users:[{year:2000,value:200000},{year:2010,value:11000000},{year:2020,value:30000000},{year:2025,value:33900000}],
    penetration:{year:2025,percent:99}
  };
  const stats = await DataGuard.fetchAny(['data/stats.json'], fallback, obj=>DataGuard.validateStats(obj));
  const users2025 = (stats.users.find(u=>u.year===2025)||stats.users[stats.users.length-1]).value;
  const pen2025 = stats.penetration?.percent ?? 99;
  animateCount(document.getElementById('kpi-users'), users2025);
  animateCount(document.getElementById('kpi-penetration'), pen2025, true);
}
function animateCount(el, target, isPercent=false){
  if(!el) return;
  let val=0; const step=Math.max(1, Math.ceil(target/120));
  const tick=()=>{ val+=step; if(val>target) val=target; el.textContent = isPercent? val.toFixed(0)+'%' : val.toLocaleString(); if(val<target) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
document.addEventListener('DOMContentLoaded', initHome);
