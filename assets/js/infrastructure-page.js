// Connectivity page logic
(function(){
  const statusEl = document.getElementById('infra-status');
  const listEl = document.getElementById('infra-list');

  const searchEl = document.getElementById('infra-search');
  const sortEl = document.getElementById('infra-sort');
  const groupEl = document.getElementById('infra-group');
  const catsEl = document.getElementById('infra-cats');

  let RAW = [];
  let ACTIVE_CATS = new Set();

  function setStatus(text, cls){
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'status ' + (cls || '');
  }

  function decadeOf(y){ return Math.floor((y||0)/10)*10; }

  function appendCard(it, i){
    const card = document.createElement('div');
    card.className = 'pill fadein';
    card.style.animationDelay = (i * 0.02) + 's';

    const h = document.createElement('h4');
    h.textContent = (it.year ? it.year + ' • ' : '') + (it.category || it.title || 'Item');

    const p1 = document.createElement('p');
    p1.textContent = it.title || '';

    const p2 = document.createElement('p');
    p2.textContent = it.details || '';

    card.appendChild(h);
    if (p1.textContent) card.appendChild(p1);
    if (p2.textContent) card.appendChild(p2);
    listEl.appendChild(card);
  }

  function render(items){
    listEl.innerHTML = '';
    if (!items || items.length === 0){
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'No items match your filters.';
      listEl.appendChild(p);
      return;
    }
    if (groupEl && groupEl.checked){
      const groups = new Map();
      items.forEach(it => {
        const d = decadeOf(it.year);
        if (!groups.has(d)) groups.set(d, []);
        groups.get(d).push(it);
      });
      const decades = Array.from(groups.keys()).sort((a,b)=>a-b);
      decades.forEach(d => {
        const header = document.createElement('h3');
        header.textContent = (d ? d + 's' : 'Unknown decade');
        header.style.marginTop = '10px';
        listEl.appendChild(header);
        groups.get(d).forEach((it,i) => appendCard(it,i));
      });
    } else {
      items.forEach((it,i) => appendCard(it,i));
    }
  }

  function buildCategoryChips(data){
    const cats = Array.from(new Set((data||[]).map(r => r.category).filter(Boolean))).sort();
    catsEl.innerHTML = '';
    cats.forEach(cat => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = cat;
      chip.setAttribute('aria-pressed','false');
      chip.addEventListener('click', () => {
        if (ACTIVE_CATS.has(cat)){ ACTIVE_CATS.delete(cat); chip.classList.remove('active'); chip.setAttribute('aria-pressed','false'); }
        else { ACTIVE_CATS.add(cat); chip.classList.add('active'); chip.setAttribute('aria-pressed','true'); }
        applyFilters();
      });
      catsEl.appendChild(chip);
    });
  }

  function applyFilters(){
    let arr = RAW.slice();
    const q = (searchEl && searchEl.value || '').toLowerCase().trim();
    if (q){
      arr = arr.filter(it => (it.title||'').toLowerCase().includes(q) || (it.details||'').toLowerCase().includes(q));
    }
    if (ACTIVE_CATS.size > 0){
      arr = arr.filter(it => ACTIVE_CATS.has(it.category));
    }
    const s = sortEl ? sortEl.value : 'year-asc';
    arr.sort((a,b) => {
      switch (s){
        case 'year-desc': return (b.year||0) - (a.year||0);
        case 'title-asc': return (a.title||'').localeCompare(b.title||'');
        case 'title-desc': return (b.title||'').localeCompare(a.title||'');
        default: return (a.year||0) - (b.year||0);
      }
    });
    render(arr);
  }

  // API base resolver (same-origin localhost:8080 -> 127.0.0.1:8080)
  const saved = localStorage.getItem('apiBase') || '';
  const candidates = [saved, '', 'http://localhost:8080', 'http://127.0.0.1:8080'].filter(Boolean);
  async function tryBase(base){
    const url = (base ? base : '') + '/api/status';
    try{ const r = await fetch(url, { cache:'no-store' }); if(!r.ok) throw 0; const j = await r.json(); return j && j.ok===true ? base : null; }catch(e){ return null; }
  }
  async function resolveApiBase(){
    for (const base of candidates){ const ok = await tryBase(base); if (ok!==null){ if(base) localStorage.setItem('apiBase', base); return base; } }
    for (const base of ['http://localhost:8080','http://127.0.0.1:8080']){ const ok = await tryBase(base); if (ok!==null){ localStorage.setItem('apiBase', base); return base; } }
    return null;
  }

  async function fetchConnectivity(){
    try{
      setStatus('Loading details…', 'warn');
      const base = await resolveApiBase();
      if(!base && location.port !== '8080') throw new Error('API base not resolved');
      const endpoint = (base?base:'') + '/api/infrastructure';
      const r = await fetch(endpoint, { cache:'no-store' });
      if(!r.ok) throw new Error('HTTP ' + r.status);
      const json = await r.json();

      if (window.DataGuard && typeof window.DataGuard.validateInfrastructure === 'function'){
        const v = window.DataGuard.validateInfrastructure(json);
        if(!v.ok){ setStatus('Data validation failed', 'error'); return; }
        RAW = v.data;
      } else {
        RAW = Array.isArray(json) ? json : [];
      }

      buildCategoryChips(RAW);
      applyFilters();
      setStatus('');
    }catch(e){
      setStatus('API not connected', 'error');
    }
  }

  if (searchEl) searchEl.addEventListener('input', applyFilters);
  if (sortEl) sortEl.addEventListener('change', applyFilters);
  if (groupEl) groupEl.addEventListener('change', applyFilters);

  document.addEventListener('DOMContentLoaded', async () => {
    setStatus('API not connected', 'error');
    let ok = false;
    try{ await fetchConnectivity(); ok = true; }catch(_){}
    if (ok) return;
    setInterval(fetchConnectivity, 4000);
  });
})();