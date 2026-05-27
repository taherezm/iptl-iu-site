/* ============================================================
   Theme toggle controller.
   Reads localStorage, applies CSS vars synchronously (no flash),
   builds the slider UI when the body is available.
   ============================================================ */
(function(){
  var STORAGE_KEY = 'site-lum';
  var lum = parseFloat(localStorage.getItem(STORAGE_KEY));
  if (!isFinite(lum)) lum = 0;
  lum = Math.max(0, Math.min(1, lum));

  function smoothstep(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function parseHex(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(function(c){ return c + c; }).join('');
    return [parseInt(h.slice(0,2), 16), parseInt(h.slice(2,4), 16), parseInt(h.slice(4,6), 16)];
  }
  function mix(aHex, bHex, t) {
    var a = parseHex(aHex), b = parseHex(bHex);
    return [
      Math.round(a[0] + (b[0]-a[0])*t),
      Math.round(a[1] + (b[1]-a[1])*t),
      Math.round(a[2] + (b[2]-a[2])*t)
    ];
  }
  function rgb(c, a) {
    return a == null
      ? 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')'
      : 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + a + ')';
  }

  function apply(l) {
    var r = document.documentElement;

    // Background — linear scale from dark to a warm off-white
    var bg     = mix('#0b0d10', '#f6f3ec', l);
    var bgTop  = mix('#12161b', '#ffffff', l);
    var bgBot  = mix('#08090b', '#ece8df', l);
    var bgElev = mix('#101317', '#ffffff', l);

    // Ink — smoothstep through the middle so contrast stays high
    // outside a narrow crossover band.
    var inkT = smoothstep(0.42, 0.58, l);
    var ink      = mix('#e9e7e1', '#15140f', inkT);
    var inkDim   = mix('#a8a59c', '#46443d', inkT);
    var inkFaint = mix('#7c7a72', '#8a877e', inkT);

    r.style.setProperty('--bg', rgb(bg));
    r.style.setProperty('--bg-base', rgb(bg));
    r.style.setProperty('--bg-top', rgb(bgTop));
    r.style.setProperty('--bg-bottom', rgb(bgBot));
    r.style.setProperty('--bg-elev', rgb(bgElev));
    r.style.setProperty('--bg-rgb', bg[0] + ', ' + bg[1] + ', ' + bg[2]);

    r.style.setProperty('--ink', rgb(ink));
    r.style.setProperty('--ink-dim', rgb(inkDim));
    r.style.setProperty('--ink-faint', rgb(inkFaint));

    // Rules + glass tints follow ink color
    r.style.setProperty('--rule', rgb(ink, 0.10));
    r.style.setProperty('--rule-strong', rgb(ink, 0.22));
    r.style.setProperty('--glass-bg', rgb(ink, 0.035));
    r.style.setProperty('--glass-bg-hover', rgb(ink, 0.07));
    r.style.setProperty('--glass-border', rgb(ink, 0.10));
    r.style.setProperty('--glass-border-hover', rgb(ink, 0.22));
    r.style.setProperty('--glass-highlight', rgb(ink, 0.12));

    // Atmospheric layers fade as we approach white
    r.style.setProperty('--orb-opacity', (0.35 * (1 - l*0.85)).toFixed(3));
    r.style.setProperty('--glow-opacity', (1 - l*0.85).toFixed(3));
    r.style.setProperty('--grain-opacity', (0.5 * (1 - l*0.7)).toFixed(3));

    r.dataset.lum = l.toFixed(3);
  }

  apply(lum);

  function attach() {
    if (document.querySelector('.theme-toggle')) return; // idempotent
    var wrap = document.createElement('div');
    wrap.className = 'theme-toggle';
    wrap.innerHTML =
      '<span class="tt-icon tt-moon" aria-hidden="true" title="Dark"></span>' +
      '<input type="range" min="0" max="1" step="0.001" value="' + lum + '" aria-label="Background lightness">' +
      '<span class="tt-icon tt-sun" aria-hidden="true" title="Light"></span>';

    // Prefer to sit inside the nav, after nav-links, so it feels native.
    var nav = document.querySelector('.nav .nav-inner');
    if (nav) {
      nav.appendChild(wrap);
    } else {
      document.body.appendChild(wrap);
    }

    var input = wrap.querySelector('input');
    input.addEventListener('input', function(e){
      lum = parseFloat(e.target.value);
      apply(lum);
      try { localStorage.setItem(STORAGE_KEY, String(lum)); } catch(err){}
    });
  }

  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach, { once: true });
})();
