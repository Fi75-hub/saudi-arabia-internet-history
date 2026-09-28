
const TL_FALLBACK = [
  {"year":1993,"title":"First academic connection","details":"KFUPM links to the global internet for research and email. Interest spreads to other universities."},
  {"year":1999,"title":"Public access","details":"Citizens subscribe to local ISPs and cafés appear across cities."},
  {"year":2019,"title":"5G rollout","details":"Commercial 5G launches in major cities with focus on dense areas."},
  {"year":2025,"title":"Vision 2030 digital phase","details":"Government and industry digital platforms operate at scale."}
];
let TL_DATA = TL_FALLBACK;
let CURRENT_TL=null;
async function initTimeline(){
  const status = document.getElementById('tl-status');
  const wrap = document.getElementById('timeline');
  const search = document.getElementById('tl-search');
  const filter = document.getElementById('tl-year');
  try{
    TL_DATA = await DataGuard.fetchAny(['../data/timeline.json'], TL_FALLBACK, arr=>DataGuard.validateTimeline(arr));
    status.textContent = 'Loaded timeline data';
  }catch(e){
    status.textContent = 'Using built-in timeline data';
  }
  function render(list){
    wrap.innerHTML = '';
    list.sort((a,b)=>a.year-b.year).forEach((it,i)=>{
      const row = document.createElement('div');
      row.className='fadein';
      row.style.animationDelay = (i*0.03)+'s';
      const head = document.createElement('div');
      head.className='year';
      head.setAttribute('tabindex','0');
      head.innerHTML = `<h3>${it.year} • ${it.title}</h3><span class="icon">▶</span>`;
      const body = document.createElement('div');
      body.className='details';
      body.innerHTML = `<p class="kicker">What happened</p><p>${it.details}</p>`;
      head.addEventListener('click',()=>{ CURRENT_TL=head; updateTimelineAside(it); toggle(body, head); });
      head.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); CURRENT_TL=head; updateTimelineAside(it); toggle(body, head); } });
      row.appendChild(head); row.appendChild(body); wrap.appendChild(row);
    });
  }
  function toggle(body, head){
    const open = body.style.display !== 'block';
    document.querySelectorAll('.details').forEach(d=>d.style.display='none');
    document.querySelectorAll('.year').forEach(h=>h.classList.remove('open'));
    if(open){ body.style.display='block'; head.classList.add('open'); }
  }
  function applyFilters(){
    const term = (search?.value||'').toLowerCase();
    const yr = (filter?.value||'').trim();
    const filtered = TL_DATA.filter(it=>{
      const okText = `${it.year} ${it.title} ${it.details}`.toLowerCase().includes(term);
      const okYear = yr==='' || String(it.year)===yr;
      return okText && okYear;
    });
    render(filtered);
  }
  if(search) search.addEventListener('input', applyFilters);
  if(filter){
    const years = [...new Set(TL_DATA.map(x=>x.year))].sort((a,b)=>a-b);
    filter.innerHTML = '<option value="">All years</option>' + years.map(y=>`<option value="${y}">${y}</option>`).join('');
    filter.addEventListener('change', applyFilters);
  }
  render(TL_DATA);
}
document.addEventListener('DOMContentLoaded', initTimeline);

function updateTimelineAside(item){
  const t=document.getElementById('tl-aside-title');
  const k=document.getElementById('tl-aside-kicker');
  const b=document.getElementById('tl-aside-body');
  if(!t) return;
  if(!item){ t.textContent='Highlight'; k.textContent='Open a year to see a quick takeaway'; b.innerHTML='<p>When you choose a year the panel shows a one line summary and a small metric.</p>'; return; }
  t.textContent = item.year + ' • ' + (item.title||'');
  k.textContent = 'Why it mattered';
  b.innerHTML = '<p style="margin:.25rem 0 0 0">'+(item.details||item.summary||'')+'</p>';
}

// Clicking the highlight panel scrolls to the current item
document.addEventListener('DOMContentLoaded', ()=>{
  const aside = document.getElementById('tl-aside');
  if(aside){
    aside.addEventListener('click', ()=>{
      if(CURRENT_TL){ CURRENT_TL.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  }
});
