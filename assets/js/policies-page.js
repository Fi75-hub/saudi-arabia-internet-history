
const POL_FALLBACK = [
  {"year":2001,"policy":"CITC established","impact":"Independent regulator formalised for telecom and internet."},
  {"year":2017,"policy":"National Cybersecurity Authority","impact":"Central cyber governance and common controls."}
];
let CURRENT_POL=null;
async function initPolicies(){
  const status = document.getElementById('pol-status');
  const wrap = document.getElementById('policies');
  let data = await DataGuard.fetchAny(['../data/policies.json'], POL_FALLBACK, arr=>DataGuard.validatePolicies(arr));
  status.textContent = 'Loaded policies';
  wrap.innerHTML='';
  data.sort((a,b)=>a.year-b.year).forEach((it,i)=>{
    const row = document.createElement('div'); row.className='fadein'; row.style.animationDelay=(i*0.03)+'s';
    const head = document.createElement('div'); head.className='year'; head.setAttribute('tabindex','0');
    head.innerHTML = `<h3>${it.year} • ${it.policy}</h3><span class="icon">▶</span>`;
    const body = document.createElement('div'); body.className='details';
    body.innerHTML = `<p class="kicker">Impact</p><p>${it.impact}</p>`;
    head.addEventListener('click',()=>{ CURRENT_POL=head; updatePolicyAside(it); toggle(body,head); });
    head.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); CURRENT_POL=head; updatePolicyAside(it); toggle(body,head);} });
    row.appendChild(head); row.appendChild(body); wrap.appendChild(row);
  });
  function toggle(body, head){
    const open = body.style.display!=='block';
    document.querySelectorAll('.details').forEach(d=>d.style.display='none');
    document.querySelectorAll('.year').forEach(h=>h.classList.remove('open'));
    if(open){ body.style.display='block'; head.classList.add('open'); }
  }
}
document.addEventListener('DOMContentLoaded', initPolicies);

function updatePolicyAside(item){
  const t=document.getElementById('pol-aside-title');
  const k=document.getElementById('pol-aside-kicker');
  const b=document.getElementById('pol-aside-body');
  if(!t) return;
  if(!item){ t.textContent='Highlight'; k.textContent='Open a policy to see a quick takeaway'; b.innerHTML='<p>When you choose a policy the panel shows what it changed in practice.</p>'; return; }
  t.textContent = item.year + ' • ' + (item.policy||item.title||'');
  k.textContent = 'What it delivered';
  b.innerHTML = '<p style="margin:.25rem 0 0 0">'+(item.details||item.impact||item.summary||'')+'</p>';
}

// Clicking the highlight panel scrolls to the current policy
document.addEventListener('DOMContentLoaded', ()=>{
  const aside = document.getElementById('pol-aside');
  if(aside){
    aside.addEventListener('click', ()=>{
      if(CURRENT_POL){ CURRENT_POL.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  }
});
