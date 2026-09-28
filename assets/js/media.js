
// Media injector for highlight cards + anthem hero
(function(){
  // ---- Inline fallback registry (used if JSON fetch fails) ----
  const FALLBACK = {
    timeline_by_year: {
      "1993": { img: "assets/img/y1993.png", alt: "Academic network pilots" },
      "1999": { img: "assets/img/y1999.png", alt: "Public access begins" },
      "2001": { img: "assets/img/y2001.png", alt: "Independent regulator" },
      "2017": { img: "assets/img/y2017.png", alt: "Cybersecurity baseline" },
      "2019": { img: "assets/img/p2019.png", alt: "Cloud First policy" },
      "2021": { img: "assets/img/y2021.png", alt: "Digital government" },
      "2025": { img: "assets/img/y2025.png", alt: "Gigabit era" }
    },
    policies_by_year: {
      "1997": { img: "assets/img/p1997.png", alt: "KACST ISU" },
      "2001": { img: "assets/img/y2001.png", alt: "Independent regulator" },
      "2017": { img: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Cybersecurity.png", alt:"Cybersecurity" },
      "2019": { img: "https://upload.wikimedia.org/wikipedia/commons/5/56/Cloud-Security.svg", alt:"Cloud security" },
      "2021": { img: "assets/img/y2021.png", alt: "Digital government" }
    },
    defaults: { img: "assets/img/y2025.png", alt: "Saudi flag / skyline" },
    hero_video: {
      poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/640px-Flag_of_Saudi_Arabia.svg.png",
      gif: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Animated-Flag-Saudi-Arabia.gif",
      anthem_ogg: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Aash_Al_Maleek_instrumental.ogg",
      anthem_mp3: "https://www.navyband.navy.mil/anthems/ANTHEMS/Saudi%20Arabia.mp3"
    }
  };

  function fetchRegistry(cb){
    const tries = ["data/mediaRegistry.json","../data/mediaRegistry.json","../../data/mediaRegistry.json","/data/mediaRegistry.json"];
    (function next(i){
      if(i>=tries.length) return cb(FALLBACK);
      fetch(tries[i], {cache:"no-store"})
        .then(r=>r.ok?r.json():Promise.reject())
        .then(d=>cb(Object.assign({}, FALLBACK, d)))
        .catch(()=>next(i+1));
    })(0);
  }

  function pickYear(text){
    const m = (text||'').match(/\b(19|20)\d{2}\b/);
    return m? m[0] : null;
  }

  function renderImage(slot, url, alt){
    if(!slot) return;
    slot.innerHTML = url ? `<figure><img src="${url}" alt="${alt||''}" loading="lazy" decoding="async" style="width:100%;height:240px;object-fit:cover;border-radius:14px"></figure>` : '';
  }

  function bootTimeline(reg){
    const aside = document.getElementById('tl-aside');
    const title = document.getElementById('tl-title');
    if(!aside) return;
    let slot = aside.querySelector('.media-slot');
    if(!slot){
      slot = document.createElement('div');
      slot.className = 'media-slot';
      aside.appendChild(slot);
    }
    const update = ()=>{
      const y = pickYear(title ? title.textContent : aside.textContent);
      const item = (y && reg.timeline_by_year[y]) ? reg.timeline_by_year[y] : reg.defaults;
      renderImage(slot, item.img, item.alt);
    };
    update();
    // Observe only the title node to avoid loops
    if(title){
      const mo = new MutationObserver(()=>update());
      mo.observe(title, {subtree:true, characterData:true, childList:true});
    }
  }

  function bootPolicies(reg){
    const aside = document.getElementById('pol-aside');
    const title = document.getElementById('pol-title');
    if(!aside) return;
    let slot = aside.querySelector('.media-slot');
    if(!slot){
      slot = document.createElement('div');
      slot.className = 'media-slot';
      aside.appendChild(slot);
    }
    const update = ()=>{
      const y = pickYear(title ? title.textContent : aside.textContent);
      const item = (y && reg.policies_by_year[y]) ? reg.policies_by_year[y] : reg.defaults;
      renderImage(slot, item.img, item.alt);
    };
    update();
    if(title){
      const mo = new MutationObserver(()=>update());
      mo.observe(title, {subtree:true, characterData:true, childList:true});
    }
  }

  function bootHero(reg){
    const mount = document.getElementById('hero-video-mount');
    if(!mount) return;
    const v = reg.hero_video || FALLBACK.hero_video;
    const wrap = document.createElement('section');
    wrap.className = 'hero-video';
    wrap.innerHTML = `
      <div class="anthem-hero" style="position:relative">
        <img src="${v.poster||''}" alt="Saudi flag" style="width:100%;max-height:360px;object-fit:cover;display:block"/>
        <img src="${v.gif||''}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;mix-blend-mode:lighten;opacity:.8"/>
        <button id="anthemPlay" class="fallback" aria-pressed="false">Play National Anthem</button>
        <audio id="anthemAudio" preload="none" crossorigin="anonymous"></audio>
      </div>`;
    mount.replaceWith(wrap);
    const btn = wrap.querySelector('#anthemPlay');
    const audio = wrap.querySelector('#anthemAudio');

    // Wire up the player with a source selection that prefers local MP3 (if present), then MP3, then OGG.
    const registry = reg.hero_video || {};
    const localMp3 = 'assets/audio/saudi_anthem.mp3';
    const localWav = 'assets/audio/saudi_anthem.wav';
    const tryOrder = [];
    // Prefer a local copy if the file exists. We can't probe the file system directly,
    // so we'll try to load it and fall back on error.
    tryOrder.push(localMp3);
    tryOrder.push(localWav);
    if (audio && typeof audio.canPlayType === 'function') {
      const supportsMp3 = !!audio.canPlayType('audio/mpeg');
      const supportsOgg = !!audio.canPlayType('audio/ogg');
      if (supportsMp3 && registry.anthem_mp3) tryOrder.push(registry.anthem_mp3);
      if (supportsOgg && registry.anthem_ogg) tryOrder.push(registry.anthem_ogg);
    
      if (registry.anthem_mp3 && !tryOrder.includes(registry.anthem_mp3)) tryOrder.push(registry.anthem_mp3);
      if (registry.anthem_ogg && !tryOrder.includes(registry.anthem_ogg)) tryOrder.push(registry.anthem_ogg);
    } else {
      if (registry.anthem_mp3) tryOrder.push(registry.anthem_mp3);
      if (registry.anthem_ogg) tryOrder.push(registry.anthem_ogg);
    }

    let currentIdx = 0;
    function setSource(i){
      if (i >= tryOrder.length) return;
      audio.src = tryOrder[i];
      audio.load();
    }
    setSource(currentIdx);

    function flipUI(isPlaying){
      btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      btn.textContent = isPlaying ? 'Pause' : 'Play National Anthem';
    }

    audio.addEventListener('error', ()=>{
      // Try the next source on error
      currentIdx++;
      if (currentIdx < tryOrder.length){
        setSource(currentIdx);
      } else {
        btn.disabled = true;
        btn.textContent = 'Audio unavailable';
      }
    });

    audio.addEventListener('ended', ()=> flipUI(false));

    if(btn && audio){
      btn.addEventListener('click', async ()=>{
        const on = btn.getAttribute('aria-pressed')==='true';
        try{
          
          if(on){ audio.pause(); flipUI(false); }
          else {
            const p = audio.play();
            if (p && typeof p.then === 'function') await p;
            flipUI(true);
          }
        }catch(e){
  
          currentIdx++;
          if (currentIdx < tryOrder.length){
            setSource(currentIdx);
            try{ await audio.play(); flipUI(true);}catch{}
          }
        }
      });
    }
  }

  function boot(){
    fetchRegistry((reg)=>{
      if(document.getElementById('tl-aside')) bootTimeline(reg);
      if(document.getElementById('pol-aside')) bootPolicies(reg);
      if(document.getElementById('hero-video-mount')) bootHero(reg);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
