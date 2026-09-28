/* Device Switcher  */
(function () {
  const MODES = ["desktop", "tablet", "mobile"];
  const STORAGE_KEY = "ds_mode@v1";

  function currentMode() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (MODES.includes(v)) return v;
    } catch(e){}
    return "desktop";
  }

  function saveMode(m) {
    try { localStorage.setItem(STORAGE_KEY, m); } catch(e){}
  }

  function ensureViewportWrapper() {
    let vp = document.getElementById("ds-viewport");
    let canvas = document.getElementById("ds-canvas");
    if (!vp || !canvas) {
      vp = document.createElement("div");
      vp.id = "ds-viewport";
      canvas = document.createElement("div");
      canvas.id = "ds-canvas";
      const topSwitch = document.getElementById("ds-top-switch");
      const nodesToMove = [];
      for (const node of Array.from(document.body.childNodes)) {
        if (node.nodeType === 1 && node.id === "ds-top-switch") continue;
        if (node === vp) continue;
        nodesToMove.push(node);
      }
      nodesToMove.forEach(n => canvas.appendChild(n));
      vp.appendChild(canvas);
      // Put vp after the top switch if present, else at start
      if (topSwitch && topSwitch.parentNode) {
        topSwitch.parentNode.insertBefore(vp, topSwitch.nextSibling);
      } else {
        document.body.insertBefore(vp, document.body.firstChild);
      }
    }
  }

  function buildTopBar() {
    if (document.getElementById("ds-top-switch")) return;

    const bar = document.createElement("div");
    bar.id = "ds-top-switch";

    function pill(label, mode) {
      const b = document.createElement("button");
      b.className = "ds-pill";
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => setMode(mode, true));
      return b;
    }

    const pDesktop = pill("Desktop", "desktop");
    const pTablet  = pill("Tablet",  "tablet");
    const pMobile  = pill("Mobile",  "mobile");

    bar.appendChild(pDesktop);
    bar.appendChild(pTablet);
    bar.appendChild(pMobile);

    document.body.insertBefore(bar, document.body.firstChild);
  }

  function updatePills(active) {
    const pills = document.querySelectorAll("#ds-top-switch .ds-pill");
    pills.forEach(p => {
      const label = p.textContent.trim().toLowerCase();
      p.classList.toggle("active",
        (active === "desktop" && label === "desktop") ||
        (active === "tablet"  && label === "tablet")  ||
        (active === "mobile"  && label === "mobile"));
    });
  }

  function setHtmlModeAttr(mode) {
    document.documentElement.setAttribute("data-ds", mode);
  }

  function setMode(mode, persist) {
    if (!MODES.includes(mode)) mode = "desktop";
    setHtmlModeAttr(mode);
    updatePills(mode);
    if (persist) saveMode(mode);
  }

  function init() {
    buildTopBar();
    ensureViewportWrapper();
    // Apply initial mode
    setMode(currentMode(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();