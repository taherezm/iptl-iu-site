/* ============================================================
   Shared scripts: cursor glow and scroll reveal.
   ============================================================ */
(function(){
  // Cursor follower
  var glow = document.querySelector('.cursor-glow');
  if (glow && matchMedia('(hover: hover)').matches){
    var tx = window.innerWidth/2, ty = window.innerHeight/2, cx = tx, cy = ty, raf;
    function tick(){
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('is-visible');
      if (!raf) tick();
    }, { passive: true });
  }

  // Scroll reveal
  var targets = document.querySelectorAll('[data-reveal], .page-hero > *, .form-section .form, .form-section h2, .form-section .lead');
  targets.forEach(function(el){ el.classList.add('reveal'); });
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function(el){ io.observe(el); });
  } else {
    targets.forEach(function(el){ el.classList.add('is-in'); });
  }
})();
