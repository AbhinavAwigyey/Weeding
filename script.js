// ---------- Envelope open ----------
  document.getElementById('sealBtn').addEventListener('click', function(){
    var wrap = document.getElementById('envelopeWrap');
    wrap.classList.add('open');
    setTimeout(function(){
      document.getElementById('envelope-screen').classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 900);
  });
  document.body.style.overflow = 'hidden';

  // ---------- Scratch to reveal ----------
  (function(){
    var canvas = document.getElementById('scratchCanvas');
    var ctx = canvas.getContext('2d');
    var hint = document.getElementById('scratchHint');
    var dpr = window.devicePixelRatio || 1;

    function resizeCanvas(){
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paintScratchLayer(){
      // use CSS pixel sizes for drawing; ctx is scaled by dpr
      var cw = canvas.width / (window.devicePixelRatio || 1);
      var ch = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0,0, canvas.width, canvas.height);
      var grad = ctx.createLinearGradient(0,0,cw,ch);
      grad.addColorStop(0, '#e9a4ae');
      grad.addColorStop(1, '#c9707f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cw/2, ch/2, Math.min(cw,ch)/2, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = Math.max(12, Math.round(cw * 0.055)) + 'px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCRATCH HERE', cw/2, ch/2);
    }

    // initialize sizing and paint
    resizeCanvas();
    paintScratchLayer();

    var isDown = false;
    var totalChecks = 0;

    function getPos(e){
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function scratchAt(pos){
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 22, 0, Math.PI*2);
      ctx.fill();
      totalChecks++;
      if (totalChecks % 6 === 0) checkDone();
    }

    function checkDone(){
      try{
        var data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
      }catch(e){ return; }
      var transparent = 0;
      for (var i = 3; i < data.length; i += 40){
        if (data[i] < 30) transparent++;
      }
      var ratio = transparent / (data.length/40);
      if (ratio > 0.5){
        canvas.style.transition = 'opacity 0.5s ease';
        canvas.style.opacity = '0';
        hint.style.opacity = '0';
        setTimeout(function(){ canvas.style.display='none'; }, 500);
      }
    }

    function start(e){ isDown = true; scratchAt(getPos(e)); e.preventDefault(); }
    function move(e){ if(!isDown) return; scratchAt(getPos(e)); e.preventDefault(); }
    function end(){ isDown = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, {passive:false});
    canvas.addEventListener('touchmove', move, {passive:false});
    canvas.addEventListener('touchend', end);

    // debounce resize
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){ resizeCanvas(); paintScratchLayer(); }, 120);
    });
  })();

  // ---------- Countdown ----------
  (function(){
    // TODO: set your real wedding date/time here (ISO format)
    var target = new Date('2026-12-02T23:59:00');
    function tick(){
      var now = new Date();
      var diff = Math.max(0, target - now);
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      document.getElementById('cdDays').textContent = String(d).padStart(2,'0');
      document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
      document.getElementById('cdMins').textContent = String(m).padStart(2,'0');
      document.getElementById('cdSecs').textContent = String(s).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
  })();

  // ---------- Scroll reveal ----------
  (function(){
    var els = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add('in'); }
      });
    }, { threshold: 0.15 });
    els.forEach(function(el){ io.observe(el); });
  })();

  // ---------- Falling rose petals ----------
  (function(){
    var layer = document.getElementById('petal-layer');
    if (!layer) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var sizeClasses = ['small', '', '', 'large'];
    var colorClasses = ['', '', '', 'gold'];
    var maxPetals = 16;
    var active = 0;

    function spawnPetal(){
      if (active >= maxPetals) return;
      active++;

      var petal = document.createElement('div');
      var sizeCls = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
      var colorCls = colorClasses[Math.floor(Math.random() * colorClasses.length)];
      petal.className = ('petal ' + sizeCls + ' ' + colorCls).trim();

      var startX = Math.random() * 100; // vw
      var fallDuration = 9 + Math.random() * 8; // seconds
      var swayDuration = 2.5 + Math.random() * 2.5;
      var delay = Math.random() * 2;
      var rotateStart = Math.random() * 360;

      petal.style.left = startX + 'vw';
      petal.style.transform = 'rotate(' + rotateStart + 'deg)';
      petal.style.animationDuration = fallDuration + 's, ' + swayDuration + 's';
      petal.style.animationDelay = delay + 's, 0s';

      layer.appendChild(petal);

      setTimeout(function(){
        petal.remove();
        active--;
      }, (fallDuration + delay) * 1000 + 200);
    }

    // seed an initial batch, staggered
    for (var i = 0; i < 8; i++){
      setTimeout(spawnPetal, i * 500);
    }
    // keep spawning new petals over time
    setInterval(spawnPetal, 1400);
  })();
 

 