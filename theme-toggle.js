/* ============================================================
   Theme toggle controller.
   Reads localStorage, applies CSS vars synchronously (no flash),
   builds the toggle UI when the body is available.
   ============================================================ */
(function(){
  var STORAGE_KEY = 'site-lum';
  var lum = parseFloat(localStorage.getItem(STORAGE_KEY));
  if (!isFinite(lum)) lum = 0;
  lum = Math.max(0, Math.min(1, lum));
  lum = lum >= 0.5 ? 1 : 0;

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

    // Background: linear scale from dark to a warm off-white
    var bg     = mix('#0b0d10', '#f6f3ec', l);
    var bgTop  = mix('#12161b', '#ffffff', l);
    var bgBot  = mix('#08090b', '#ece8df', l);
    var bgElev = mix('#101317', '#ffffff', l);

    // Ink: smoothstep through the middle so contrast stays high
    // outside a narrow crossover band.
    var inkT = smoothstep(0.42, 0.58, l);
    var ink      = mix('#e9e7e1', '#15140f', inkT);
    var inkDim   = mix('#a8a59c', '#46443d', inkT);
    var inkFaint = mix('#7c7a72', '#6f6a5f', inkT);
    var gold     = mix('#c9a84c', '#80651b', l);
    var resolved = mix('#a8a59c', '#5a554c', l);

    r.style.setProperty('--bg', rgb(bg));
    r.style.setProperty('--bg-base', rgb(bg));
    r.style.setProperty('--bg-top', rgb(bgTop));
    r.style.setProperty('--bg-bottom', rgb(bgBot));
    r.style.setProperty('--bg-elev', rgb(bgElev));
    r.style.setProperty('--bg-rgb', bg[0] + ', ' + bg[1] + ', ' + bg[2]);

    r.style.setProperty('--ink', rgb(ink));
    r.style.setProperty('--ink-dim', rgb(inkDim));
    r.style.setProperty('--ink-faint', rgb(inkFaint));
    r.style.setProperty('--gold', rgb(gold));
    r.style.setProperty('--resolved', rgb(resolved));

    // Rules + glass tints follow ink color
    r.style.setProperty('--rule', rgb(ink, 0.10));
    r.style.setProperty('--rule-strong', rgb(ink, 0.22));
    r.style.setProperty('--glass-bg', rgb(ink, 0.035));
    r.style.setProperty('--glass-bg-hover', rgb(ink, 0.07));
    r.style.setProperty('--glass-border', rgb(ink, 0.10));
    r.style.setProperty('--glass-border-hover', rgb(ink, 0.22));
    r.style.setProperty('--glass-highlight', rgb(ink, 0.12));

    // The grain fades as the background approaches white.
    r.style.setProperty('--grain-opacity', (0.5 * (1 - l*0.7)).toFixed(3));

    r.dataset.lum = l.toFixed(3);
  }

  apply(lum);

  function attach() {
    if (document.querySelector('.theme-toggle')) return; // idempotent
    var wrap = document.createElement('div');
    wrap.className = 'theme-toggle';
    wrap.innerHTML =
      '<button type="button">' +
        '<span class="tt-track" aria-hidden="true">' +
          '<span class="tt-icon tt-moon"><svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg></span>' +
          '<span class="tt-icon tt-sun"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.9 4.9l1.4 1.4"></path><path d="M17.7 17.7l1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.9 19.1l1.4-1.4"></path><path d="M17.7 6.3l1.4-1.4"></path></svg></span>' +
        '</span>' +
      '</button>';

    // Keep the toggle in the header row with the other top navigation.
    var nav = document.querySelector('.nav .nav-inner');
    if (nav) {
      nav.appendChild(wrap);
    } else {
      document.body.appendChild(wrap);
    }

    var button = wrap.querySelector('button');
    function syncButton() {
      var light = lum >= 0.5;
      wrap.dataset.mode = light ? 'light' : 'dark';
      button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
      button.setAttribute('aria-pressed', light ? 'true' : 'false');
      button.title = light ? 'Dark mode' : 'Light mode';
    }

    syncButton();
    button.addEventListener('click', function(){
      lum = lum >= 0.5 ? 0 : 1;
      apply(lum);
      syncButton();
      try { localStorage.setItem(STORAGE_KEY, String(lum)); } catch(err){}
    });
  }

  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach, { once: true });
})();
