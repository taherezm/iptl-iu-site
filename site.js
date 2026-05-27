/* ============================================================
   Shared scripts: cursor glow, scroll reveal, Netlify forms.
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

  // Netlify Forms — async submit, inline confirmation, no redirect
  function encodeFormData(formData){
    var pairs = [];
    formData.forEach(function(value, key){
      if (value instanceof File) return;
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return pairs.join('&');
  }

  function makeSuccessCard(message){
    var done = document.createElement('div');
    done.className = 'form-success';
    var tag = document.createElement('span');
    tag.className = 'eyebrow-tag';
    tag.textContent = 'Received';
    var p1 = document.createElement('p');
    p1.textContent = message || 'Thanks — we\u2019ve received your submission. We read carefully and reply as time allows.';
    done.appendChild(tag);
    done.appendChild(p1);
    return done;
  }

  document.querySelectorAll('form.netlify-form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type="submit"]');
      var originalLabel;
      if (status){ status.classList.remove('is-error'); status.textContent = ''; }
      if (btn){
        btn.disabled = true;
        var label = btn.querySelector('span:first-child');
        if (label){ originalLabel = label.textContent; label.textContent = 'Sending\u2026'; }
      }

      var fd = new FormData(form);
      var isMultipart = (form.getAttribute('enctype') || '').toLowerCase() === 'multipart/form-data';

      // Netlify Forms quirk: multipart submissions (file uploads) must POST to
      // the form's own page URL, not to "/". URL-encoded forms can use "/".
      var actionUrl = form.getAttribute('action') || '/';
      if (isMultipart) actionUrl = window.location.pathname || '/';

      var fetchOpts = isMultipart
        ? { method: 'POST', body: fd }
        : { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encodeFormData(fd) };

      fetch(actionUrl, fetchOpts)
        .then(function(res){
          if (!res.ok) {
            // Surface the actual status to the console for debugging
            return res.text().then(function(body){
              console.error('Form submission HTTP', res.status, res.statusText, body.slice(0, 400));
              throw new Error('HTTP ' + res.status);
            }, function(){ throw new Error('HTTP ' + res.status); });
          }
          var customMsg = form.getAttribute('data-success-message');
          form.replaceWith(makeSuccessCard(customMsg));
        })
        .catch(function(err){
          if (status){
            status.classList.add('is-error');
            status.textContent = 'Something went wrong sending that. Please email us directly at undergradtechlaw@iu.edu.';
          }
          if (btn){
            btn.disabled = false;
            var label2 = btn.querySelector('span:first-child');
            if (label2 && originalLabel) label2.textContent = originalLabel;
          }
          console.error('Form submission failed:', err);
        });
    });
  });
})();
