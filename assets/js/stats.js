
const STATS_FALLBACK = {
  users:[
    {year:2000,value:200000},
    {year:2010,value:11000000},
    {year:2020,value:30000000},
    {year:2025,value:33900000}
  ],
  speeds:[
    {year:2019,mobile_mbps:85},
    {year:2020,mobile_mbps:110},
    {year:2021,mobile_mbps:135},
    {year:2022,mobile_mbps:140},
    {year:2023,mobile_mbps:145},
    {year:2024,mobile_mbps:122},
    {year:2025,mobile_mbps:125}
  ],
  penetration:{year:2025,percent:99}
};
function animateCounters(){
  document.querySelectorAll('.counter').forEach(c=>{
    const target = +c.dataset.target; let val = 0;
    const step = Math.max(1, Math.ceil(target/120));
    const tick = ()=>{
      val += step; if(val>target) val=target;
      c.textContent = target<200 ? val.toFixed(0)+'%' : val.toLocaleString();
      if(val<target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
async function initStats(){
  const data = await DataGuard.fetchAny(['../data/stats.json'], STATS_FALLBACK, obj=>DataGuard.validateStats(obj));
  const counters = document.getElementById('counters');
  counters.innerHTML = `
    <div class="stat fadein"><h3>Users 2000</h3><div class="counter" data-target="${data.users.find(u=>u.year===2000)?.value||0}">0</div></div>
    <div class="stat fadein"><h3>Users 2010</h3><div class="counter" data-target="${data.users.find(u=>u.year===2010)?.value||0}">0</div></div>
    <div class="stat fadein"><h3>Users 2020</h3><div class="counter" data-target="${data.users.find(u=>u.year===2020)?.value||0}">0</div></div>
    <div class="stat fadein"><h3>Users 2025</h3><div class="counter" data-target="${data.users.find(u=>u.year===2025)?.value||0}">0</div></div>
  `;
  animateCounters();
  const bar = document.getElementById('usersChart');
  const lbl = data.users.map(u=>u.year.toString());
  const vals = data.users.map(u=>u.value);
  drawBarChart(bar, lbl, vals);
  const line = document.getElementById('speedChart');
  const lbl2 = data.speeds.map(s=>s.year.toString());
  const vals2 = data.speeds.map(s=>s.mobile_mbps);
  drawLineChart(line, lbl2, vals2);
  const donut = document.getElementById('penetrationChart');
  drawDonut(donut, data.penetration.percent, 100, 'Penetration');
}
document.addEventListener('DOMContentLoaded', initStats);
