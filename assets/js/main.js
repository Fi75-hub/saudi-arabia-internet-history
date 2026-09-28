function setTheme(t){document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);}function initTheme(){const t=localStorage.getItem('theme')||'dark';setTheme(t);const b=document.getElementById('themeToggle');if(b){b.textContent=t==='dark'?'Light mode':'Dark mode';b.onclick=()=>{const nt=(localStorage.getItem('theme')||'dark')==='dark'?'light':'dark';setTheme(nt);b.textContent=nt==='dark'?'Light mode':'Dark mode';};}}function attachButtonRipple(){document.querySelectorAll('.btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--mx',(e.clientX-r.left)+'px');b.style.setProperty('--my',(e.clientY-r.top)+'px');});});}function initParticles(){const c=document.createElement('canvas');c.id='bgParticles';document.body.prepend(c);const x=c.getContext('2d');let w,h;const DPR=window.devicePixelRatio||1;function R(){w=window.innerWidth;h=window.innerHeight;c.width=w*DPR;c.height=h*DPR;c.style.width=w+'px';c.style.height=h+'px';x.setTransform(DPR,0,0,DPR,0,0);}R();window.addEventListener('resize',R);const N=Math.min(140,Math.floor(w*h/14000));const P=Array.from({length:N},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.8+.6}));function T(){x.clearRect(0,0,w,h);x.fillStyle='rgba(81,226,245,.65)';for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill();}requestAnimationFrame(T);}T();}document.addEventListener('DOMContentLoaded',()=>{initTheme();attachButtonRipple();initParticles();const btn=document.querySelector('.backtop');if(btn){window.addEventListener('scroll',()=>{if(window.scrollY>240)btn.classList.add('show');else btn.classList.remove('show');});btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));}});async function fetchJSON(p,f){try{const r=await fetch(p);if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}catch(e){return f}}
// High contrast toggle
document.addEventListener('DOMContentLoaded', () => {
  const c = document.getElementById('contrastBtn');
  if(c){ c.addEventListener('click', ()=> document.body.classList.toggle('high-contrast')); }
});

// === Device Preview Switcher ===
(function(){
  const root = document.documentElement;
  const switcher = document.getElementById('deviceSwitch');
  const rotateBtn = document.getElementById('rotateBtn');
  function setDevice(kind){
    root.setAttribute('data-device', kind);
    if(switcher){
      switcher.querySelectorAll('button[data-device]').forEach(b=>{
        b.setAttribute('aria-pressed', String(b.dataset.device===kind));
      });
    }
    if(dock){
      dock.querySelectorAll('button[data-device]').forEach(b=>{
        b.setAttribute('aria-pressed', String(b.dataset.device === kind));
      });
    }
  }
  function toggleOrientation(){
    const current = root.getAttribute('data-orientation')||'portrait';
    const next = current==='portrait' ? 'landscape' : 'portrait';
    root.setAttribute('data-orientation', next);
    if(rotateBtn) rotateBtn.setAttribute('aria-pressed', String(next==='landscape'));
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    if(!root.getAttribute('data-device')) setDevice('desktop');
    if(!root.getAttribute('data-orientation')) root.setAttribute('data-orientation','portrait');
    if(switcher){
      switcher.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-device]');
        if(btn) setDevice(btn.dataset.device);
      });
    }
    if(rotateBtn) rotateBtn.addEventListener('click', toggleOrientation);
  });
})();


// === Overlay device preview (iframe) ===
(function(){
  const root = document.documentElement;
  const switcher = document.getElementById('deviceSwitch');
  const rotateBtn = document.getElementById('rotateBtn');

  // If this is an embedded view (inside iframe), mark and bail (no overlay or switch)
  const url = new URL(window.location.href);
  const isEmbedded = url.searchParams.get('embed') === '1';
  if(isEmbedded){
    document.body.classList.add('embedded');
    return; // do not set overlay preview on embedded pages
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'deviceOverlay';
  overlay.innerHTML = `<div id="deviceBackdrop"></div><div id="deviceDock" class="device-switch">  <button data-device="desktop" title="Desktop">🖥️</button>  <button data-device="tablet" title="Tablet">📱</button>  <button data-device="mobile" title="Mobile">📳</button>  <button id="ovRotate" title="Rotate">↻</button>  <button id="ovClose"  title="Close">✕</button></div><iframe id="deviceFrame" title="Device preview"></iframe>`;
  document.body.appendChild(overlay);
  const frame = overlay.querySelector('#deviceFrame');

  let currentDevice = 'desktop';
  let orientation = 'portrait';

  function pageURLForEmbed(){
    const u = new URL(window.location.href);
    u.searchParams.set('embed','1');
    return u.toString();
  }

  // Compute frame size + scale so it’s readable and fits viewport
  function layoutFrame(){
    const vw = window.innerWidth, vh = window.innerHeight;
    let w = 1280, h = 800, scale = 1;
    if(currentDevice === 'tablet'){
      if(orientation === 'portrait'){ w = 768; h = 1024; } else { w = 1024; h = 768; }
    }else if(currentDevice === 'mobile'){
      if(orientation === 'portrait'){ w = 390; h = 844; } else { w = 844; h = 390; }
    }else{
      // desktop preview fits width
      w = Math.min(1280, vw - 48); h = Math.min(900, vh - 48); scale = 1;
    }

    // Max scale to fit within viewport with 24px margins
    const maxScaleW = (vw - 48) / w;
    const maxScaleH = (vh - 48) / h;
    scale = Math.min(maxScaleW, maxScaleH, 2.4); // cap scale to avoid pixelation

    frame.style.width = w + 'px';
    frame.style.height = h + 'px';
    frame.style.transform = 'scale(' + scale.toFixed(3) + ')';
  }

  function enterDevice(kind){
    currentDevice = kind;
    root.setAttribute('data-device', kind);
    if(kind === 'desktop'){
      overlay.classList.remove('active');
      document.body.classList.remove('previewing');
      return;
    }
    // Activate overlay
    if(!frame.src) frame.src = pageURLForEmbed();
    overlay.classList.add('active');
    document.body.classList.add('previewing');
    layoutFrame();
    // Update pressed state
    if(switcher){
      switcher.querySelectorAll('button[data-device]').forEach(b=>{
        b.setAttribute('aria-pressed', String(b.dataset.device === kind));
      });
    }
    if(dock){
      dock.querySelectorAll('button[data-device]').forEach(b=>{
        b.setAttribute('aria-pressed', String(b.dataset.device === kind));
      });
    }
  }

  function toggleOrientation(){
    orientation = orientation === 'portrait' ? 'landscape' : 'portrait';
    root.setAttribute('data-orientation', orientation);
    layoutFrame();
    if(rotateBtn) rotateBtn.setAttribute('aria-pressed', String(orientation==='landscape'));
  }

  
  // Overlay dock controls
  const dock = overlay.querySelector('#deviceDock');
  const ovRotate = overlay.querySelector('#ovRotate');
  const ovClose = overlay.querySelector('#ovClose');
  if(dock){
    dock.addEventListener('click', e=>{
      const b = e.target.closest('button[data-device]');
      if(b){ enterDevice(b.dataset.device); }
    });
  }
  if(ovRotate){ ovRotate.addEventListener('click', toggleOrientation); }
  if(ovClose){ ovClose.addEventListener('click', ()=> enterDevice('desktop')); }
// Wire buttons
  if(switcher){
    switcher.addEventListener('click', e=>{
      const b = e.target.closest('button[data-device]');
      if(b){ enterDevice(b.dataset.device); }
    });
  }
  if(rotateBtn) rotateBtn.addEventListener('click', toggleOrientation);

  // Defaults
  window.addEventListener('resize', layoutFrame);
  if(!root.getAttribute('data-orientation')) root.setAttribute('data-orientation','portrait');
  // ensure default state is desktop (overlay hidden)
  root.setAttribute('data-device', root.getAttribute('data-device') || 'desktop');
})();
