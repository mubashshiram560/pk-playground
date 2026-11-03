/* Custom ID Visualization — IDs built from coloured segments */
(function () {
  'use strict';
  PK.chrome('viz', '../');
  var esc = PK.esc;
  var $ = function (s) { return document.querySelector(s); };

  var KIND = {
    prefix: ['k-prefix', 'Prefix'], seq: ['k-seq', 'Sequence'], date: ['k-date', 'Date'], random: ['k-random', 'Random'],
    dept: ['k-dept', 'Department'], etype: ['k-etype', 'Employee type'], version: ['k-version', 'Version bits'],
    raw: ['k-raw', 'Counter value'], pad: ['k-pad', 'Zero padding'], bad: ['k-bad', 'Not allowed'], sep: ['k-sep', 'Separator']
  };
  var ICON = { wait: '⏳', pass: '✅', fail: '❌', skip: '➖' };

  /* seeded random so “Previous step” always shows the same thing */
  var seed = 2026;
  function rng(s) {
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickChars(r, chars, n) { var o = ''; for (var i = 0; i < n; i++) o += chars.charAt(Math.floor(r() * chars.length)); return o; }

  var S = function (kind, text, cap, why) { return { kind: kind, text: text, cap: cap || '', why: why || '' }; };
  var SEP = function (t) { return { kind: 'sep', text: t, sep: true, cap: '' }; };
  var pad = function (n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; };

  /* ---------- turn the segments of ID #1 into build-up stages ---------- */
  function appendStages(segs) {
    var stages = [], pend = [];
    segs.forEach(function (s, i) {
      if (s.sep) { pend.push(i); return; }
      if (s.why || !stages.length) {
        stages.push({ upto: i, pop: pend.concat([i]), seg: s });
      } else {
        var st = stages[stages.length - 1];
        st.upto = i; st.pop = st.pop.concat(pend, [i]);
      }
      pend = [];
    });
    return stages;
  }
  function bumpIdx(segs, prev) {
    var out = [];
    segs.forEach(function (s, i) {
      if (s.sep) return;
      var p = prev.filter(function (x) { return x.kind === s.kind; })[0];
      if (!p || p.text !== s.text) out.push(i);
    });
    return out;
  }
  var idText = function (segs) { return segs.map(function (s) { return s.text; }).join(''); };

  /* ids: [{segs, ctx, note, custom:[stages]}]  → full list of player steps */
  function assemble(ids, o) {
    var steps = [], hist = [];
    steps.push({ emoji: '🎨', title: o.introTitle || 'Ready to build IDs?', text: o.intro, segs: [], pop: [], bump: [], hist: [] });
    ids.forEach(function (id, k) {
      var text = idText(id.segs);
      if (k === 0) {
        var list = id.custom || appendStages(id.segs).map(function (st) {
          return {
            emoji: '🧱', title: 'Add the ' + KIND[st.seg.kind][1].toLowerCase(), text: st.seg.why || 'Another piece joins in.',
            segs: id.segs.slice(0, st.upto + 1), pop: st.pop
          };
        });
        list.forEach(function (st) {
          st.bump = []; st.hist = hist.slice(); st.ctx = st.ctx || null;
          steps.push(st);
        });
        hist.push(text);
        steps.push({ emoji: '🎉', title: 'ID #1 is ready: <code>' + esc(text) + '</code>', text: o.first || 'The finished ID is saved as the Primary Key of the first row.', segs: id.segs, pop: [], bump: [], hist: hist.slice(), histNew: true, ctx: id.ctx });
      } else {
        var prev = ids[k - 1].segs;
        hist.push(text);
        steps.push({
          emoji: '➡️', title: 'ID #' + (k + 1) + ': <code>' + esc(text) + '</code>', text: id.note || o.next || 'Only the highlighted parts change — the rest is copied.',
          segs: id.segs, pop: [], bump: bumpIdx(id.segs, prev), hist: hist.slice(), histNew: true, ctx: id.ctx
        });
      }
    });
    steps.push({ emoji: '💡', title: 'Remember!', text: o.summary, segs: ids[ids.length - 1].segs, pop: [], bump: [], hist: hist.slice() });
    return steps;
  }

  /* ---------- recipes ---------- */
  var TYPES = {
    prefix: {
      label: '🏷️ Prefix + Sequence', title: '🏷️ Prefix + Sequence',
      fields: [
        { id: 'prefix', label: 'Prefix', type: 'text', def: 'EMP', max: 5 },
        { id: 'width', label: 'Digits', type: 'select', opts: [2, 3, 4, 5], def: 3 },
        { id: 'start', label: 'Start at', type: 'number', def: 1, min: 0, max: 9996 },
        { id: 'sep', label: 'Separator', type: 'select', opts: [['', 'none'], ['-', '-'], ['_', '_']], def: '' }
      ],
      notes: ['good|Easy to read and sort: EMP001, EMP002…', 'warn|Counters need care when many apps create IDs at the same time — keep ONE counter (e.g. a DB sequence).'],
      build: function (c) {
        var p = c.prefix || 'EMP', ids = [];
        for (var k = 0; k < 3; k++) {
          var segs = [S('prefix', p, 'Prefix: what it is', 'The <b>prefix</b> <code>' + esc(p) + '</code> tells people what the ID is about (EMP = employee 👩‍💼). It never changes.')];
          if (c.sep) segs.push(SEP(c.sep));
          segs.push(S('seq', pad(c.start + k, c.width), 'Sequence: the counter', 'The <b>sequence</b> is a counter that goes up by 1 each time. We pad it with zeros to <b>' + c.width + '</b> digits so IDs stay neat.'));
          ids.push({ segs: segs });
        }
        return assemble(ids, {
          intro: 'This recipe glues a fixed <b>prefix</b> to a counting <b>sequence</b>. Press <b>▶ Start</b> to build the first ID piece by piece!',
          next: 'The <b>prefix stays</b> the same. Only the <b>sequence</b> (highlighted) jumps by +1. 🐸',
          summary: '<b>Prefix + Sequence</b> = a fixed label + a counter. Simple, readable, sortable.'
        });
      }
    },

    date: {
      label: '📅 Date + Sequence', title: '📅 Date + Sequence',
      fields: [
        { id: 'prefix', label: 'Prefix', type: 'text', def: 'EMP', max: 5 },
        { id: 'fmt', label: 'Date format', type: 'select', opts: [['YYYYMMDD', 'YYYYMMDD'], ['YYMMDD', 'YYMMDD'], ['YYYYMM', 'YYYYMM']], def: 'YYYYMMDD' },
        { id: 'width', label: 'Digits', type: 'select', opts: [2, 3, 4], def: 3 },
        { id: 'sep', label: 'Separator', type: 'select', opts: [['-', '-'], ['', 'none'], ['_', '_']], def: '-' }
      ],
      notes: ['good|The ID tells you <i>when</i> it was made, and the counter restarts each period.', 'warn|The counter must reset <b>and</b> never repeat inside one period, or the PK clashes.'],
      build: function (c) {
        var p = c.prefix || 'EMP';
        var today = new Date();
        var monthOnly = c.fmt === 'YYYYMM';
        function fmtDate(d) {
          var y = String(d.getFullYear()), m = pad(d.getMonth() + 1, 2), dd = pad(d.getDate(), 2);
          return c.fmt === 'YYYYMMDD' ? y + m + dd : c.fmt === 'YYMMDD' ? y.slice(2) + m + dd : y + m;
        }
        var later = new Date(today.getFullYear(), today.getMonth() + (monthOnly ? 1 : 0), today.getDate() + (monthOnly ? 0 : 1));
        var plan = [[today, 1], [today, 2], [later, 1]];
        var ids = plan.map(function (pl, k) {
          var segs = [S('prefix', p, 'Prefix', 'The <b>prefix</b> <code>' + esc(p) + '</code> says what kind of record this is.')];
          if (c.sep) segs.push(SEP(c.sep));
          segs.push(S('date', fmtDate(pl[0]), 'Date: when', 'The <b>date</b> part is ' + (k === 0 ? 'today' : 'the day') + ' in <code>' + c.fmt + '</code> format — it tells you <i>when</i> the ID was created. 💙'));
          if (c.sep) segs.push(SEP(c.sep));
          segs.push(S('seq', pad(pl[1], c.width), 'Sequence: today’s counter', 'The <b>sequence</b> counts how many IDs were created in this ' + (monthOnly ? 'month' : 'day') + '.'));
          return {
            segs: segs,
            ctx: k === 2 ? '🌙 A new ' + (monthOnly ? 'month' : 'day') + ' begins → the counter restarts at ' + pad(1, c.width) : null,
            note: k === 1 ? 'Same ' + (monthOnly ? 'month' : 'day') + ', so the <b>date stays</b> and only the <b>sequence</b> grows.' :
              'The ' + (monthOnly ? 'month' : 'day') + ' changed! The <b>date</b> moves on and the <b>sequence restarts</b> from 1. 🔄'
          };
        });
        return assemble(ids, {
          intro: 'This recipe adds the <b>date</b> between the prefix and the sequence. Watch what happens when the date changes!',
          summary: '<b>Date + Sequence</b> = prefix + a date + a counter that restarts per day/month. Great for orders and invoices.'
        });
      }
    },

    uuid: {
      label: '🧬 UUID', title: '🧬 UUID',
      fields: [{ id: 'shuffle', label: '', type: 'button', text: '🎲 New random IDs' }],
      notes: ['good|Practically unique everywhere — apps can make IDs without asking the database.', 'warn|Long and unreadable (36 characters), and random order can make indexes slower.'],
      build: function () {
        var r = rng(seed), H = '0123456789abcdef', ids = [];
        for (var k = 0; k < 3; k++) {
          var segs = [
            S('random', pickChars(r, H, 8), '8 random hex', '<b>Random hex digits</b> (0-9, a-f). Nobody can guess the next one! 🎲'),
            SEP('-'),
            S('random', pickChars(r, H, 4), '4 random hex', 'Another random group — this is what makes collisions almost impossible.'),
            SEP('-'),
            S('version', '4', 'version', 'This <b>4</b> means “version 4 UUID” — made from random numbers. It’s the same in every v4 UUID. 💛'),
            S('random', pickChars(r, H, 3), '3 random hex'),
            SEP('-'),
            S('version', pickChars(r, '89ab', 1), 'variant', 'This <b>variant</b> digit is always <code>8</code>, <code>9</code>, <code>a</code> or <code>b</code> — it tells which UUID layout is used. 💛'),
            S('random', pickChars(r, H, 3), '3 random hex'),
            SEP('-'),
            S('random', pickChars(r, H, 12), '12 random hex', 'The last <b>12 random digits</b> complete the 128-bit ID.')
          ];
          ids.push({ segs: segs });
        }
        return assemble(ids, {
          intro: 'A <b>UUID</b> is a 128-bit random ID. Most of it is random (lavender); a few digits (yellow) say which kind of UUID it is.',
          next: 'A brand-new UUID: <b>every</b> random part changed — there is no counter at all. 🎲',
          summary: '<b>UUID</b> = random pieces + a couple of fixed “version” digits. Unique without any central counter.'
        });
      }
    },

    token: {
      label: '🎫 Random / Token', title: '🎫 Random / Token',
      fields: [
        { id: 'prefix', label: 'Prefix', type: 'text', def: 'TKN', max: 5 },
        { id: 'len', label: 'Length', type: 'select', opts: [6, 8, 10, 12], def: 8 },
        { id: 'set', label: 'Characters', type: 'select', opts: [['ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 'A–Z + 2–9'], ['0123456789', 'digits'], ['0123456789ABCDEF', 'hex']], def: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' },
        { id: 'shuffle', label: '', type: 'button', text: '🎲 New random IDs' }
      ],
      notes: ['good|Hard to guess — nice for share links, coupons and public IDs.', 'warn|Random does <b>not</b> guarantee uniqueness. Keep the Primary Key check and retry on a clash.'],
      build: function (c) {
        var r = rng(seed + 7), p = c.prefix || 'TKN', ids = [];
        for (var k = 0; k < 3; k++) {
          var segs = [S('prefix', p, 'Prefix', 'An optional <b>prefix</b> <code>' + esc(p) + '</code> shows what kind of token it is.'), SEP('-'),
            S('random', pickChars(r, c.set, c.len), c.len + ' random chars', '<b>' + c.len + ' random characters</b> picked from the allowed set. There is no counter and no meaning — that’s the point! 🎫')];
          ids.push({ segs: segs });
        }
        return assemble(ids, {
          intro: 'A <b>token</b> is a short random string. Press <b>▶ Start</b> to see it being picked character by character.',
          next: 'Same prefix, <b>completely different</b> random part. You can’t guess the next one. 🙈',
          summary: '<b>Random / Token</b> = a (maybe) prefix + random characters. Short, unguessable — but the database must still reject a clash.'
        });
      }
    },

    business: {
      label: '🏢 Business-rule-based', title: '🏢 Business-rule-based',
      fields: [
        { id: 'dept', label: 'Department', type: 'select', opts: [['ENG', 'Engineering'], ['HR', 'People Ops'], ['FIN', 'Finance'], ['MKT', 'Marketing']], def: 'ENG' },
        { id: 'etype', label: 'Employee type', type: 'select', opts: [['FT', 'Full-time'], ['PT', 'Part-time'], ['CT', 'Contractor']], def: 'FT' }
      ],
      notes: ['good|IDs carry meaning your business cares about.', 'warn|If the rule data changes (someone moves department), the ID would be wrong — so many teams avoid putting changeable facts into IDs.'],
      build: function (c) {
        var DEPTS = [['ENG', 'Engineering'], ['HR', 'People Ops'], ['FIN', 'Finance'], ['MKT', 'Marketing']];
        var TYPE = { FT: 'Full-time', PT: 'Part-time', CT: 'Contractor' };
        var order = ['FT', 'PT', 'CT'];
        var dIdx = DEPTS.map(function (d) { return d[0]; }).indexOf(c.dept);
        var otherDept = DEPTS[(dIdx + 1) % DEPTS.length];
        var otherType = order[(order.indexOf(c.etype) + 1) % order.length];
        var yy = String(new Date().getFullYear()).slice(2);
        var hires = [
          { d: DEPTS[dIdx], t: c.etype, seq: 1 },
          { d: DEPTS[dIdx], t: otherType, seq: 2 },
          { d: otherDept, t: c.etype, seq: 1 }
        ];
        var ids = hires.map(function (h, k) {
          return {
            ctx: '👩‍💻 New hire: ' + h.d[1] + ' · ' + TYPE[h.t] + ' · joined 20' + yy,
            segs: [
              S('dept', h.d[0], 'Department', 'The <b>department code</b> comes from the business rule: ' + h.d[1] + ' → <code>' + h.d[0] + '</code>. 🍑'),
              SEP('-'),
              S('etype', h.t, 'Type', 'The <b>employee type</b> code: ' + TYPE[h.t] + ' → <code>' + h.t + '</code>. 💛'),
              SEP('-'),
              S('date', yy, 'Year', 'The <b>year</b> they joined (last 2 digits). 💙'),
              SEP('-'),
              S('seq', pad(h.seq, 3), 'Sequence (per dept)', 'The <b>sequence</b> counts hires <i>inside this department</i>.')
            ],
            note: k === 1 ? 'Same department → its counter goes to <b>002</b>. The type changed too. 🍑' :
              'A different department! Its <b>own counter starts at 001</b> — rules decide every piece. 🔁'
          };
        });
        return assemble(ids, {
          intro: 'Here the pieces come from <b>business rules</b>: department, employee type and year. Pick a department and type above, then press <b>▶ Start</b>.',
          summary: '<b>Business-rule IDs</b> = pieces looked up from your rules + a counter. Readable, but changing the rules later is hard.'
        });
      }
    },

    seqfmt: {
      label: '🔢 Sequence formatting', title: '🔢 Sequence formatting',
      fields: [
        { id: 'prefix', label: 'Prefix', type: 'text', def: 'EMP', max: 5 },
        { id: 'width', label: 'Width', type: 'select', opts: [2, 3, 4, 5, 6], def: 3 },
        { id: 'start', label: 'Counter starts at', type: 'number', def: 7, min: 0, max: 99998 },
        { id: 'overflow', label: '', type: 'button', text: '🧪 Overflow demo (998, width 3)' }
      ],
      notes: ['good|Zero-padding keeps IDs the same length, so they sort nicely as text.', 'warn|Padding never cuts digits — pass the limit (999 → 1000) and the ID just gets longer.'],
      build: function (c) {
        var p = c.prefix || 'EMP', w = c.width, ids = [];
        for (var k = 0; k < 3; k++) {
          var n = c.start + k, ns = String(n), z = '0'.repeat(Math.max(0, w - ns.length));
          var segs = [S('prefix', p, 'Prefix')];
          var padIdx = -1;
          if (z) { padIdx = segs.length; segs.push(S('pad', z, 'zero padding')); }
          var rawIdx = segs.length; segs.push(S('raw', ns, 'counter value'));
          var id = { segs: segs, ctx: ns.length > w ? '⚠️ ' + ns + ' has ' + ns.length + ' digits but the width is ' + w + ' — padding never cuts digits, so the ID just gets longer.' : null };
          if (k === 0) {
            var raw = S('raw', ns, 'counter value');
            id.custom = [
              { emoji: '🔢', title: 'Start with the plain counter', text: 'The counter hands out the plain number <b>' + ns + '</b>. Not pretty yet!', segs: [raw], pop: [0] },
              z ? { emoji: '0️⃣', title: 'Pad with zeros', text: 'We want <b>' + w + '</b> digits, so add <b>' + z.length + '</b> zero' + (z.length > 1 ? 's' : '') + ' in front → <code>' + z + ns + '</code>.', segs: [S('pad', z, 'zero padding'), raw], pop: [0] }
                : { emoji: '0️⃣', title: 'Check the width', text: '<b>' + ns + '</b> already has ' + (ns.length === w ? 'exactly ' : 'at least ') + w + ' digits, so no padding is needed.', segs: [raw], pop: [] },
              { emoji: '🏷️', title: 'Add the prefix', text: 'Finally glue the prefix <code>' + esc(p) + '</code> in front.', segs: segs, pop: [0] }
            ];
          } else {
            id.note = ns.length > w ? 'Uh-oh — the number outgrew the width. The ID is simply longer: <code>' + esc(p + ns) + '</code>.' :
              'The counter moved to <b>' + ns + '</b> and the <b>zero padding</b> adjusts to keep ' + w + ' digits.';
          }
          ids.push(id);
        }
        return assemble(ids, {
          intro: 'This recipe focuses on <b>formatting</b> the counter: a plain number is padded with zeros and given a prefix. Try the <b>overflow demo</b> to see what happens when the number gets too big!',
          summary: '<b>Sequence formatting</b> = take the raw number → pad with zeros → add the prefix. Choose the width with growth in mind.'
        });
      }
    },

    manual: {
      label: '✍️ Manual custom ID', title: '✍️ Manual custom ID',
      fields: [
        { id: 'i1', label: 'ID 1', type: 'rawtext', def: 'EMP003', max: 10 },
        { id: 'i2', label: 'ID 2', type: 'rawtext', def: 'EMP002', max: 10 },
        { id: 'i3', label: 'ID 3', type: 'rawtext', def: 'emp-4', max: 10 },
        { id: 'note', label: '', type: 'note', text: 'Rule: 3 CAPITAL letters + 3 digits. Already in the table: EMP001, EMP002' }
      ],
      notes: ['good|Full control — good for IDs people already use (like a staff badge).', 'warn|Nothing generates it: YOUR code must check the format and uniqueness — and the PK will still say no to duplicates.'],
      build: function (c) {
        var existing = ['EMP001', 'EMP002'], hist = [], steps = [];
        var RULE = /^[A-Z]{3}\d{3}$/;
        steps.push({ emoji: '✍️', title: 'You choose the IDs', text: 'In this recipe <b>nobody generates</b> the ID — you type it. The app can only <b>check</b> it: format first, then uniqueness. Type your own IDs above, then press <b>▶ Start</b>!', segs: [], pop: [], bump: [], hist: [], existing: existing.slice() });
        [c.i1, c.i2, c.i3].forEach(function (raw, k) {
          var t = raw.trim();
          var segs = [];
          if (!t) segs = [S('bad', 'NULL', 'empty!')];
          else {
            (t.match(/[A-Z]+|\d+|[^A-Z\d]+/g) || []).forEach(function (part) {
              if (/^[A-Z]+$/.test(part)) segs.push(S('prefix', part, 'letters'));
              else if (/^\d+$/.test(part)) segs.push(S('seq', part, 'digits'));
              else segs.push(S('bad', part, 'not allowed'));
            });
          }
          var all = segs.map(function (s, i) { return i; });
          var fmtOk = RULE.test(t);
          var dup = existing.indexOf(t) >= 0;
          var shown = t || 'NULL';
          steps.push({ emoji: '⌨️', title: 'You type <code>' + esc(shown) + '</code> (ID ' + (k + 1) + ')', text: 'The pieces are coloured: <b>letters</b> pink, <b>digits</b> mint, anything unexpected red.', segs: segs, pop: all, bump: [], hist: hist.slice(), existing: existing.slice() });
          if (!fmtOk) {
            steps.push({
              emoji: '🚫', title: 'Format check failed', text: 'The rule needs <b>3 capital letters + 3 digits</b> (like <code>EMP003</code>). <code>' + esc(shown) + '</code> doesn’t match, so it is rejected before it reaches the database.',
              segs: segs, pop: [], bump: [], hist: hist.slice(), existing: existing.slice(),
              checks: [{ t: '🔤 Format: 3 capitals + 3 digits', s: 'fail' }, { t: '🔑 Not already in the table', s: 'skip' }],
              result: { ok: false, msg: '❌ Rejected: wrong format.' }
            });
          } else {
            steps.push({
              emoji: '🔤', title: 'Format check passed', text: 'Looks good: 3 capitals + 3 digits. Next question: is anyone already using it?',
              segs: segs, pop: [], bump: [], hist: hist.slice(), existing: existing.slice(),
              checks: [{ t: '🔤 Format: 3 capitals + 3 digits', s: 'pass' }, { t: '🔑 Not already in the table', s: 'wait' }]
            });
            if (dup) {
              steps.push({
                emoji: '🚫', title: 'Duplicate ID rejected', text: '<code>' + esc(t) + '</code> is already in the table (red). A Primary Key must be unique, so the INSERT fails.',
                segs: segs, pop: [], bump: [], hist: hist.slice(), existing: existing.slice(), clash: t,
                checks: [{ t: '🔤 Format: 3 capitals + 3 digits', s: 'pass' }, { t: '🔑 Not already in the table', s: 'fail' }],
                result: { ok: false, msg: '❌ Rejected: duplicate key ' + esc(t) + '.' }
              });
            } else {
              existing.push(t); hist.push(t);
              steps.push({
                emoji: '✅', title: '<code>' + esc(t) + '</code> accepted!', text: 'Correct format <b>and</b> nobody else has it, so it becomes a new Primary Key. 🎉',
                segs: segs, pop: [], bump: [], hist: hist.slice(), histNew: true, existing: existing.slice(), newId: t,
                checks: [{ t: '🔤 Format: 3 capitals + 3 digits', s: 'pass' }, { t: '🔑 Not already in the table', s: 'pass' }],
                result: { ok: true, msg: '✅ Saved as a new Primary Key.' }
              });
            }
          }
        });
        steps.push({ emoji: '💡', title: 'Remember!', text: '<b>Manual custom IDs</b> give you freedom, but you must validate the <b>format</b> and rely on the Primary Key to enforce <b>uniqueness</b>.', segs: [], pop: [], bump: [], hist: hist.slice(), existing: existing.slice() });
        return steps;
      }
    }
  };

  /* ---------- state & rendering ---------- */
  var current = 'prefix';
  var cfg = {};

  function defaults(t) {
    var c = {};
    TYPES[t].fields.forEach(function (f) { if (f.def !== undefined) c[f.id] = f.def; });
    return c;
  }

  function drawConfig() {
    var T = TYPES[current];
    $('#config').innerHTML = T.fields.map(function (f) {
      if (f.type === 'button') return '<button type="button" class="btn btn-lav" data-act="' + f.id + '">' + f.text + '</button>';
      if (f.type === 'note') return '<span class="cfg-note">' + esc(f.text) + '</span>';
      if (f.type === 'select') {
        return '<label>' + f.label + ' <select data-f="' + f.id + '">' + f.opts.map(function (o) {
          var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
          return '<option value="' + esc(v) + '"' + (String(cfg[f.id]) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
        }).join('') + '</select></label>';
      }
      if (f.type === 'number') {
        return '<label>' + f.label + ' <input type="number" data-f="' + f.id + '" min="' + f.min + '" max="' + f.max + '" value="' + cfg[f.id] + '"></label>';
      }
      return '<label>' + f.label + ' <input type="text" data-f="' + f.id + '" maxlength="' + f.max + '" value="' + esc(cfg[f.id]) + '" autocomplete="off"></label>';
    }).join('');
  }

  function readField(f, el) {
    var v = el.value;
    if (f.type === 'number') { v = parseInt(v, 10); if (isNaN(v)) v = f.def; v = Math.max(f.min, Math.min(f.max, v)); }
    else if (f.type === 'select') { v = /^\d+$/.test(v) ? parseInt(v, 10) : v; }
    else if (f.type === 'text') { v = v.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
    return v;
  }

  $('#config').addEventListener('change', function (e) {
    var el = e.target.closest('[data-f]');
    if (!el) return;
    var f = TYPES[current].fields.filter(function (x) { return x.id === el.dataset.f; })[0];
    cfg[f.id] = readField(f, el);
    rebuild();
  });
  $('#config').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('[data-f]')) e.target.dispatchEvent(new Event('change', { bubbles: true }));
  });
  $('#config').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'shuffle') seed = Math.floor(Math.random() * 1e9);
    if (b.dataset.act === 'overflow') { cfg.start = 998; cfg.width = 3; drawConfig(); }
    rebuild();
  });

  function segHTML(s, i, step) {
    var cls = 'seg' + (step.pop.indexOf(i) >= 0 ? ' pop' : '') + (step.bump.indexOf(i) >= 0 ? ' bump' : '');
    return '<div class="' + cls + '"><div class="seg-pill ' + KIND[s.kind][0] + '">' + esc(s.text) + '</div>' +
      (s.cap ? '<div class="seg-cap">' + esc(s.cap) + '</div>' : '') + '</div>';
  }

  function render(i, s) {
    var kinds = [];
    s.segs.forEach(function (g) { if (!g.sep && kinds.indexOf(g.kind) < 0) kinds.push(g.kind); });
    var html = '';
    if (s.ctx) html += '<div class="ctx-card">' + s.ctx + '</div>';
    if (s.existing) {
      html += '<div class="existing" aria-label="IDs already in the table"><span class="label cfg-note">Already in the table:</span>' +
        s.existing.map(function (x) { return '<span class="hist' + (s.clash === x ? ' clash' : '') + '">' + esc(x) + '</span>'; }).join('') + '</div>';
    }
    html += '<div class="seg-row">' + (s.segs.length ? s.segs.map(function (g, k) { return segHTML(g, k, s); }).join('') :
      '<span class="seg-empty">…waiting for the first piece ✨</span>') + '</div>';
    if (s.checks) {
      html += '<div class="checks">' + s.checks.map(function (c) {
        return '<div class="check ' + (c.s === 'wait' ? '' : c.s) + '">' + ICON[c.s] + ' ' + c.t + '</div>';
      }).join('') + '</div>';
    }
    if (s.result) html += '<div class="banner ' + (s.result.ok ? 'ok' : 'bad') + '">' + s.result.msg + '</div>';
    if (kinds.length) {
      html += '<div class="legend" aria-label="Colour legend">' + kinds.map(function (k) {
        return '<span class="' + KIND[k][0] + '">' + KIND[k][1] + '</span>';
      }).join('') + '</div>';
    }
    $('#segStage').innerHTML = html;

    var h = '<span class="label">Created:</span>';
    if (!s.hist.length) h += '<span class="mini-empty">nothing yet</span>';
    h += s.hist.map(function (x, k) {
      var last = k === s.hist.length - 1 && s.histNew;
      return (k ? '<span class="arrow">→</span>' : '') + '<span class="hist' + (last ? ' pop' : '') + '">' + esc(x) + '</span>';
    }).join('');
    $('#history').innerHTML = h;
  }

  var player = PK.Player({ mount: $('#controls'), narrator: $('#narrator'), onRender: render });

  function rebuild() {
    var T = TYPES[current];
    player.setSteps(T.build(cfg));
  }

  function setType(t) {
    current = t;
    cfg = defaults(t);
    var T = TYPES[t];
    $('#typeTitle').textContent = T.title;
    $('#notes').innerHTML = '<h3>📝 Handy notes</h3>' + T.notes.map(function (n) {
      var p = n.split('|');
      return '<div class="note-line ' + p[0] + '">' + (p[0] === 'good' ? '👍 ' : '⚠️ ') + p[1] + '</div>';
    }).join('');
    drawConfig();
    rebuild();
  }

  PK.chips($('#types'), Object.keys(TYPES).map(function (k) { return { key: k, label: TYPES[k].label }; }), current, setType);
  setType('prefix');
})();
