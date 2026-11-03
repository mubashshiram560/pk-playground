/* ==========================================================
   PK Playground — shared helpers (no dependencies) 🎀
   - PK.esc      : escape text for HTML
   - PK.hl       : tiny Java/SQL syntax highlighter
   - PK.chrome   : header + footer
   - PK.chips    : single-choice chip group
   - PK.Player   : Start / Pause / Next / Previous / Replay / Reset / Speed
   ========================================================== */
(function () {
  'use strict';
  var PK = (window.PK = window.PK || {});

  PK.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- tiny syntax highlighter (Java + SQL) ---------- */
  var KW = 'public|class|private|new|return|void|static|final|import|SELECT|INSERT|INTO|VALUES|CREATE|TABLE|SEQUENCE|PRIMARY|KEY|NOT|NULL|AUTO_INCREMENT|UPDATE|SET|WHERE|FROM|START|Long|String|UUID|BIGINT|VARCHAR';
  var HL_RE = new RegExp(
    '(\\/\\/.*|--.*)|("[^"]*"|\'[^\']*\')|(@\\w+)|\\b(' + KW + ')\\b|\\b(\\d+)\\b', 'g'
  );
  PK.hl = function (line) {
    var out = '', last = 0, m;
    HL_RE.lastIndex = 0;
    while ((m = HL_RE.exec(line))) {
      out += PK.esc(line.slice(last, m.index));
      var e = PK.esc(m[0]);
      if (m[1]) out += '<span class="tok-com">' + e + '</span>';
      else if (m[2]) out += '<span class="tok-str">' + e + '</span>';
      else if (m[3]) out += '<span class="tok-ann">' + e + '</span>';
      else if (m[4]) out += '<span class="tok-kw">' + e + '</span>';
      else out += '<span class="tok-num">' + e + '</span>';
      last = m.index + m[0].length;
    }
    return out + PK.esc(line.slice(last));
  };

  /* ---------- header & footer ---------- */
  PK.chrome = function (active, base) {
    base = base || './';
    var link = function (key, href, label) {
      return '<a href="' + base + href + '" class="' + (active === key ? 'active' : '') + '">' + label + '</a>';
    };
    var h = document.createElement('header');
    h.className = 'site-header';
    h.innerHTML =
      '<a class="brand" href="' + base + 'index.html" style="display:inline-flex;align-items:center;gap:.5rem">' +
      '<img src="' + base + 'assets/logo.svg" alt="" width="44" height="44"> PK Playground</a>' +
      '<nav aria-label="Main">' +
      link('home', 'index.html', '🏠 Welcome') +
      link('pk', 'primary-key/index.html', '🔑 Primary Key') +
      link('custom', 'custom-primary-key/index.html', '✨ Custom Primary Key') +
      link('viz', 'visualization/index.html', '🎨 Visualization Studio') +
      '</nav>';
    document.body.insertBefore(h, document.body.firstChild);
    if (!document.querySelector('link[rel~="icon"]')) {
      var ic = document.createElement('link');
      ic.rel = 'icon'; ic.type = 'image/svg+xml'; ic.href = base + 'assets/logo.svg';
      document.head.appendChild(ic);
    }
    var f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML = 'Made with 💖 for curious beginners · everything here is a friendly simulation — no real database is harmed 🐣';
    document.body.appendChild(f);
  };

  /* ---------- chips ---------- */
  PK.chips = function (el, items, active, onPick) {
    function draw() {
      el.innerHTML = items.map(function (i) {
        var on = i.key === active;
        return '<button type="button" class="chip' + (on ? ' active' : '') + '" data-k="' + i.key +
          '" aria-pressed="' + on + '">' + i.label + '</button>';
      }).join('');
    }
    draw();
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b || !el.contains(b)) return;
      active = b.dataset.k;
      draw();
      onPick(active);
    });
    return { set: function (k) { active = k; draw(); } };
  };

  /* ---------- the player ---------- */
  PK.Player = function (o) {
    var mount = o.mount, narr = o.narrator, onRender = o.onRender;
    var steps = [], idx = 0, playing = false, timer = null, speed = 1;

    mount.innerHTML =
      '<div class="controls">' +
      '<div class="ctl-row" role="group" aria-label="Playback controls">' +
      '<button type="button" class="btn btn-mint" data-a="start">▶ Start</button>' +
      '<button type="button" class="btn btn-yellow" data-a="pause">⏸ Pause</button>' +
      '<button type="button" class="btn btn-pink" data-a="replay">🔁 Replay</button>' +
      '<button type="button" class="btn btn-ghost" data-a="reset">↺ Reset</button>' +
      '</div>' +
      '<div class="ctl-row ctl-nav" role="group" aria-label="Go back or forward">' +
      '<button type="button" class="btn btn-ghost" data-a="back3" title="Go back 3 steps (Shift + ←)">⏪ Back 3</button>' +
      '<button type="button" class="btn btn-ghost" data-a="prev" title="Go back 1 step (←)">◀ Previous</button>' +
      '<button type="button" class="btn btn-blue" data-a="next" title="Go forward 1 step (→)">Next ▶</button>' +
      '<button type="button" class="btn btn-ghost" data-a="fwd3" title="Go forward 3 steps (Shift + →)">Forward 3 ⏩</button>' +
      '<label class="scrub">Step <input type="range" min="1" max="1" value="1" step="1" aria-label="Jump to any step"></label>' +
      '</div>' +
      '<div class="ctl-row ctl-meta">' +
      '<div class="ctl-row"><div class="dots" role="group" aria-label="Jump to step"></div><span class="step-count"></span></div>' +
      '<label class="speed">🐢 <input type="range" min="0.5" max="3" step="0.25" value="1" aria-label="Animation speed"> 🐇 <span class="speed-val">1×</span></label>' +
      '</div></div>';

    var q = function (s) { return mount.querySelector(s); };
    var btn = function (a) { return mount.querySelector('[data-a="' + a + '"]'); };
    var dotsEl = q('.dots'), countEl = q('.step-count');
    var speedIn = q('.speed input'), speedVal = q('.speed-val'), scrub = q('.scrub input');

    function delay() { return 3400 / speed; }
    function stop() { playing = false; clearTimeout(timer); ui(); }
    function schedule() {
      clearTimeout(timer);
      if (!playing) return;
      timer = setTimeout(function () {
        if (idx >= steps.length - 1) { stop(); return; }
        go(idx + 1);
        if (idx >= steps.length - 1) stop(); else schedule();
      }, delay());
    }
    function ui() {
      btn('start').disabled = playing || !steps.length;
      btn('pause').disabled = !playing;
      btn('prev').disabled = idx <= 0;
      btn('back3').disabled = idx <= 0;
      btn('next').disabled = idx >= steps.length - 1;
      btn('fwd3').disabled = idx >= steps.length - 1;
      scrub.max = Math.max(1, steps.length);
      scrub.value = idx + 1;
      scrub.disabled = steps.length < 2;
      btn('replay').disabled = !steps.length;
      btn('reset').disabled = !steps.length;
      countEl.textContent = steps.length ? 'Step ' + (idx + 1) + ' of ' + steps.length : '';
      var d = '';
      for (var i = 0; i < steps.length; i++) {
        d += '<button type="button" class="dot ' + (i < idx ? 'past' : i === idx ? 'now' : '') +
          '" data-i="' + i + '" aria-label="Go to step ' + (i + 1) + '"></button>';
      }
      dotsEl.innerHTML = d;
    }
    function render() {
      var s = steps[idx];
      if (!s) return;
      onRender(idx, s);
      if (narr) {
        narr.innerHTML =
          '<div class="narr-head"><span class="narr-badge">Step ' + (idx + 1) + ' / ' + steps.length +
          '</span><span class="narr-emoji" aria-hidden="true">' + (s.emoji || '🎀') + '</span></div>' +
          '<div class="pop-in"><h3>' + s.title + '</h3><p>' + s.text + '</p></div>';
      }
      ui();
    }
    function go(i) { idx = Math.max(0, Math.min(steps.length - 1, i)); render(); }

    var api = {
      setSteps: function (arr) { stop(); steps = arr; idx = 0; render(); },
      go: function (i) { stop(); go(i); },
      start: function () {
        if (!steps.length) return;
        if (idx >= steps.length - 1) go(0);
        playing = true; ui(); schedule();
      },
      pause: stop,
      next: function () { stop(); go(idx + 1); },
      prev: function () { stop(); go(idx - 1); },
      jump: function (n) { stop(); go(idx + n); },
      back3: function () { api.jump(-3); },
      fwd3: function () { api.jump(3); },
      replay: function () { stop(); go(0); api.start(); },
      reset: function () { stop(); go(0); },
      get index() { return idx; },
      get length() { return steps.length; },
      get playing() { return playing; }
    };

    mount.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || !mount.contains(b)) return;
      if (b.dataset.i !== undefined) { api.go(+b.dataset.i); return; }
      var a = b.dataset.a;
      if (a && api[a]) api[a]();
    });
    speedIn.addEventListener('input', function () {
      speed = parseFloat(speedIn.value);
      speedVal.textContent = speed + '×';
      if (playing) schedule();
    });
    scrub.addEventListener('input', function () { api.go(parseInt(scrub.value, 10) - 1); });
    document.addEventListener('keydown', function (e) {
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.shiftKey ? api.jump(3) : api.next(); }
      else if (e.key === 'ArrowLeft') { e.shiftKey ? api.jump(-3) : api.prev(); }
    });
    return api;
  };
})();
