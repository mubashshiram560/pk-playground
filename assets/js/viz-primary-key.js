/* Primary Key Visualization — single & composite keys */
(function () {
  'use strict';
  PK.chrome('viz', '../');
  var esc = PK.esc;
  var $ = function (s) { return document.querySelector(s); };

  var ICON = { wait: '⏳', pass: '✅', fail: '❌', skip: '➖' };
  var fmtSql = function (v) { return v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + v + "'"; };
  var cell = function (v) { return v === null ? '<span class="null">NULL</span>' : esc(v); };

  /* ---------- scripted scenarios ---------- */
  function singleSpec() {
    var R0 = [[101, 'Aria', 'Design'], [102, 'Bo', 'Sales'], [103, 'Cleo', 'Tech']];
    var R1 = R0.concat([[104, 'Dev', 'Sales']]);
    var R2 = R1.concat([[105, 'Fay', 'Design']]);
    var L = ['🔎 ID is not NULL', '🔑 ID is unique (no twin in the table)'];
    var inc = function (vals, a, b, result, msg) {
      return { vals: vals, checks: [{ t: L[0], s: a }, { t: L[1], s: b }], result: result || null, msg: msg || '' };
    };
    return {
      table: 'employee', title: '🧑‍💼 employee table',
      cols: [{ n: 'emp_id', pk: true }, { n: 'name' }, { n: 'department' }],
      base: R0, composite: false,
      sandbox: [{ id: 'a', label: 'emp_id', ph: 'e.g. 106' }, { id: 'b', label: 'name', ph: 'e.g. Gus' }],
      sbRow: function (v) { return [v.a, v.b || 'Guest', 'Tech']; },
      sbKey: function (v) { return [v.a]; },
      sbKeyCols: [0],
      sbDup: function () { return { a: '102', b: 'Twin' }; },
      sbNull: function () { return { a: '', b: 'Ghost' }; },
      notes: [
        '<div class="note-line good">✅ A Primary Key must be <b>UNIQUE</b>.</div>',
        '<div class="note-line good">✅ A Primary Key must be <b>NOT NULL</b>.</div>',
        '<div class="note-line">🧠 One table has <b>one</b> Primary Key — here it is just one column.</div>',
        '<div class="note-line warn">⚠️ Changing a PK value later is risky: other tables may point to it.</div>'
      ],
      steps: [
        { emoji: '🧑‍💼', title: 'Meet the employee table', text: 'Each row is one employee. But if two rows looked alike, how would the database know which one you mean? 🤔', rows: R0 },
        { emoji: '🔑', title: 'The Primary Key column', text: 'The glowing green column <code>emp_id</code> is the <b>Primary Key (PK)</b> — the official ID card of every row.', rows: R0, pk: true },
        { emoji: '🎯', title: 'One ID → exactly one row', text: 'Ask for <code>emp_id = 102</code> and the database finds Bo — and only Bo. No other row may share that ID.', rows: R0, pk: true, hlRows: [1], hlCells: [[1, 0]],
          incoming: { query: 'SELECT * FROM employee WHERE emp_id = 102;', msg: '🎯 Found exactly 1 row: Bo' } },
        { emoji: '📨', title: 'A new employee arrives', text: 'We want to <code>INSERT</code> employee 104. Before saving, the database runs two quick Primary Key checks…', rows: R0, pk: true, incoming: inc([104, 'Dev', 'Sales'], 'wait', 'wait') },
        { emoji: '✅', title: 'Both checks passed!', text: '104 is not empty and nobody else has it, so the row is saved. 🎉', rows: R1, pk: true, newRow: 3, incoming: inc([104, 'Dev', 'Sales'], 'pass', 'pass', 'ok', '✅ Saved! The ID 104 is new and not empty.') },
        { emoji: '👀', title: 'Another one: ID 102 again', text: 'Eli arrives with <code>emp_id = 102</code>… but Bo already has that ID. Let’s see what happens.', rows: R1, pk: true, incoming: inc([102, 'Eli', 'Tech'], 'wait', 'wait') },
        { emoji: '🚫', title: 'Duplicate ID rejected', text: 'The unique check finds a twin (the red row). Two rows can never share a Primary Key, so the INSERT is <b>rejected</b>.', rows: R1, pk: true, clashRow: 1,
          incoming: inc([102, 'Eli', 'Tech'], 'pass', 'fail', 'bad', '❌ Rejected: duplicate key — 102 already exists.') },
        { emoji: '🫥', title: 'What about an empty ID?', text: 'Fay arrives with no ID at all (<code>NULL</code> means “unknown”).', rows: R1, pk: true, incoming: inc([null, 'Fay', 'Design'], 'wait', 'wait') },
        { emoji: '🚫', title: 'NULL ID rejected', text: 'You can’t identify a row with an unknown value, so PK columns can <b>never</b> be NULL. (The unique check is skipped.)', rows: R1, pk: true,
          incoming: inc([null, 'Fay', 'Design'], 'fail', 'skip', 'bad', '❌ Rejected: a Primary Key cannot be NULL.') },
        { emoji: '🎉', title: 'Fixed — and saved', text: 'Fay tries again with a fresh ID, 105. Both checks pass, so she joins the table.', rows: R2, pk: true, newRow: 4, incoming: inc([105, 'Fay', 'Design'], 'pass', 'pass', 'ok', '✅ Saved with the fresh ID 105.') },
        { emoji: '💡', title: 'Remember!', text: 'Primary Key = <b>UNIQUE</b> + <b>NOT NULL</b>. One column gave every row its own identity. Next, try the <b>Composite</b> key with the chips above! ✨', rows: R2, pk: true }
      ]
    };
  }

  function compositeSpec() {
    var R0 = [[1, 'CS101', 'A'], [1, 'MA201', 'B'], [2, 'CS101', 'A']];
    var R1 = R0.concat([[2, 'MA201', 'A']]);
    var R2 = R1.concat([[3, 'CS101', 'B']]);
    var L = ['🔎 No key part is NULL', '🔑 The (student_id, course_id) pair is unique'];
    var inc = function (vals, a, b, result, msg) {
      return { vals: vals, checks: [{ t: L[0], s: a }, { t: L[1], s: b }], result: result || null, msg: msg || '' };
    };
    return {
      table: 'enrollment', title: '🎓 enrollment table',
      cols: [{ n: 'student_id', pk: true }, { n: 'course_id', pk: true }, { n: 'grade' }],
      base: R0, composite: true,
      sandbox: [{ id: 'a', label: 'student_id', ph: 'e.g. 3' }, { id: 'b', label: 'course_id', ph: 'e.g. MA201' }],
      sbRow: function (v) { return [v.a, v.b, 'A']; },
      sbKey: function (v) { return [v.a, v.b]; },
      sbKeyCols: [0, 1],
      sbDup: function () { return { a: '1', b: 'CS101' }; },
      sbNull: function () { return { a: '3', b: '' }; },
      notes: [
        '<div class="note-line good">✅ A <b>composite</b> key uses 2+ columns <b>together</b>.</div>',
        '<div class="note-line good">✅ The <b>combination</b> must be unique — each part alone may repeat.</div>',
        '<div class="note-line warn">⚠️ <b>No</b> part of a composite key may be NULL.</div>',
        '<div class="note-line">🧑‍💻 In JPA you model this with <code>@EmbeddedId</code> or <code>@IdClass</code>.</div>'
      ],
      steps: [
        { emoji: '🎓', title: 'Meet the enrollment table', text: 'Each row says “this student takes this course”. There is no single obvious ID column here…', rows: R0 },
        { emoji: '👯', title: 'student_id repeats', text: 'Student 1 appears <b>twice</b> (two courses). So <code>student_id</code> alone can’t be unique — it can’t be the Primary Key by itself.', rows: R0, hlCells: [[0, 0], [1, 0]] },
        { emoji: '👯', title: 'course_id repeats too', text: 'Course CS101 appears twice as well (two students). So <code>course_id</code> alone can’t be the key either.', rows: R0, hlCells: [[0, 1], [2, 1]] },
        { emoji: '🔑', title: 'Two columns, one key!', text: 'Together, the <b>pair</b> <code>(student_id, course_id)</code> is different on every row. That pair is a <b>Composite Primary Key</b>.', rows: R0, pk: true },
        { emoji: '📨', title: 'A new enrollment arrives', text: 'Student 2 wants to join MA201. Student 2 exists and MA201 exists — but is the <b>pair</b> new?', rows: R0, pk: true, incoming: inc([2, 'MA201', 'A'], 'wait', 'wait') },
        { emoji: '✅', title: 'The pair is new — saved!', text: 'No part is NULL and <code>(2, MA201)</code> is a brand-new pair. Saved! 🎉', rows: R1, pk: true, newRow: 3, incoming: inc([2, 'MA201', 'A'], 'pass', 'pass', 'ok', '✅ Saved! The pair (2, MA201) is new.') },
        { emoji: '👀', title: 'Same pair twice?', text: 'Student 1 tries to enrol in CS101 <b>again</b>…', rows: R1, pk: true, incoming: inc([1, 'CS101', 'C'], 'wait', 'wait') },
        { emoji: '🚫', title: 'Duplicate pair rejected', text: 'The pair <code>(1, CS101)</code> already exists (red row), so the INSERT is <b>rejected</b>.', rows: R1, pk: true, clashRow: 0,
          incoming: inc([1, 'CS101', 'C'], 'pass', 'fail', 'bad', '❌ Rejected: duplicate key (1, CS101).') },
        { emoji: '🫥', title: 'A missing key part?', text: 'Student 3 arrives, but the course is empty (<code>NULL</code>).', rows: R1, pk: true, incoming: inc([3, null, 'B'], 'wait', 'wait') },
        { emoji: '🚫', title: 'NULL part rejected', text: 'Every part of a composite key must be NOT NULL — half an ID is no ID. 🙅', rows: R1, pk: true,
          incoming: inc([3, null, 'B'], 'fail', 'skip', 'bad', '❌ Rejected: key part course_id is NULL.') },
        { emoji: '🎉', title: 'Fixed — and saved', text: 'Student 3 picks CS101. A fresh pair, so it is accepted.', rows: R2, pk: true, newRow: 4, incoming: inc([3, 'CS101', 'B'], 'pass', 'pass', 'ok', '✅ Saved! The pair (3, CS101) is new.') },
        { emoji: '💡', title: 'Remember!', text: 'A composite key = <b>several columns that are unique together</b>. Each column may repeat on its own, but never the full combination.', rows: R2, pk: true }
      ]
    };
  }

  var SPECS = { single: singleSpec(), composite: compositeSpec() };
  var mode = 'single';

  /* ---------- rendering ---------- */
  function tableHTML(spec, s) {
    var pk = !!s.pk;
    var head = '';
    if (spec.composite && pk) {
      head += '<tr><th class="pk-bracket" colspan="2">🔑 Composite Primary Key</th><th class="blank-h"></th></tr>';
    }
    head += '<tr>' + spec.cols.map(function (c) {
      return '<th class="' + (c.pk && pk ? 'pk' : '') + '">' + (c.pk && pk ? '🔑 ' : '') + esc(c.n) + '</th>';
    }).join('') + '</tr>';
    var hlCells = (s.hlCells || []).map(function (x) { return x.join(','); });
    var body = s.rows.map(function (r, ri) {
      var cls = [];
      if ((s.hlRows || []).indexOf(ri) >= 0) cls.push('hl');
      if (s.clashRow === ri) cls.push('clash');
      if (s.newRow === ri) cls.push('new-row');
      return '<tr class="' + cls.join(' ') + '">' + r.map(function (v, ci) {
        var c = [];
        if (spec.cols[ci].pk && pk) c.push('pk');
        if (hlCells.indexOf(ri + ',' + ci) >= 0) c.push('hl-cell');
        return '<td class="' + c.join(' ') + '">' + cell(v) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<table class="sim-table' + (pk ? ' pk-on' : '') + '"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  function incomingHTML(spec, s) {
    var inc = s.incoming;
    if (!inc) {
      return '<div class="hint-box">🎈 Press <b>▶ Start</b> or <b>Next</b> — new rows will knock on the table’s door here.</div>';
    }
    if (inc.query) {
      return '<div class="incoming"><h4>🔎 A question for the database</h4><div class="sqlbox">' + esc(inc.query) +
        '</div><div class="banner ok" style="margin-top:.6rem">' + inc.msg + '</div></div>';
    }
    var sql = 'INSERT INTO ' + spec.table + ' VALUES (' + inc.vals.map(fmtSql).join(', ') + ');';
    return '<div class="incoming' + (inc.result === 'bad' ? ' shake' : '') + '"><h4>📨 Incoming row</h4>' +
      '<div class="sqlbox">' + esc(sql) + '</div>' +
      '<div class="checks">' + inc.checks.map(function (c) {
        return '<div class="check ' + (c.s === 'wait' ? '' : c.s) + '">' + ICON[c.s] + ' ' + c.t + '</div>';
      }).join('') + '</div>' +
      (inc.result ? '<div class="banner ' + (inc.result === 'ok' ? 'ok' : 'bad') + '">' + inc.msg + '</div>' : '') + '</div>';
  }

  var player = PK.Player({
    mount: $('#controls'),
    narrator: $('#narrator'),
    onRender: function (i, s) {
      var spec = SPECS[mode];
      $('#table').innerHTML = tableHTML(spec, s);
      $('#incoming').innerHTML = incomingHTML(spec, s);
    }
  });

  var chips = PK.chips($('#modes'), [
    { key: 'single', label: '🔑 Single-column Primary Key' },
    { key: 'composite', label: '🔑🔑 Composite Primary Key' }
  ], mode, function (k) { setMode(k); });

  function setMode(k) {
    mode = k;
    var spec = SPECS[k];
    $('#tableName').textContent = spec.title;
    $('#notes').innerHTML = '<h3>📝 Handy notes</h3>' + spec.notes.join('');
    player.setSteps(spec.steps);
    sandboxReset();
  }

  /* ---------- sandbox: user inserts their own rows ---------- */
  var sb = { rows: [], newRow: null, clash: null };
  function sandboxForm() {
    var spec = SPECS[mode];
    $('#sbForm').innerHTML = spec.sandbox.map(function (f) {
      return '<label>' + esc(f.label) + ' <input id="sb_' + f.id + '" placeholder="' + esc(f.ph) + '" autocomplete="off"></label>';
    }).join('') +
      '<button type="button" class="btn btn-mint btn-small" id="sbIns">➕ Insert</button>' +
      '<button type="button" class="btn btn-ghost btn-small" id="sbDup">🧪 Try a duplicate</button>' +
      '<button type="button" class="btn btn-ghost btn-small" id="sbNull">🫥 Try a NULL</button>' +
      '<button type="button" class="btn btn-ghost btn-small" id="sbReset">↺ Reset table</button>';
    $('#sbIns').onclick = sandboxInsert;
    $('#sbDup').onclick = function () { fill(spec.sbDup()); };
    $('#sbNull').onclick = function () { fill(spec.sbNull()); };
    $('#sbReset').onclick = sandboxReset;
    spec.sandbox.forEach(function (f) {
      $('#sb_' + f.id).addEventListener('keydown', function (e) { if (e.key === 'Enter') sandboxInsert(); });
    });
  }
  function fill(v) {
    Object.keys(v).forEach(function (k) { $('#sb_' + k).value = v[k]; });
    sandboxInsert();
  }
  function sandboxDraw() {
    var spec = SPECS[mode];
    $('#sbTable').innerHTML = tableHTML(spec, { rows: sb.rows, pk: true, newRow: sb.newRow, clashRow: sb.clash });
  }
  function sandboxReset() {
    var spec = SPECS[mode];
    sb = { rows: spec.base.map(function (r) { return r.slice(); }), newRow: null, clash: null };
    sandboxForm();
    var m = $('#sbMsg'); m.textContent = ''; m.className = 'msg';
    sandboxDraw();
  }
  function parse(x) {
    x = (x || '').trim();
    if (x === '') return null;
    return /^\d+$/.test(x) ? Number(x) : x.toUpperCase() === x ? x : x.charAt(0).toUpperCase() + x.slice(1);
  }
  function sandboxInsert() {
    var spec = SPECS[mode];
    var v = {};
    spec.sandbox.forEach(function (f) { v[f.id] = parse($('#sb_' + f.id).value); });
    if (spec.sandbox.length === 2 && v.b !== null && mode === 'composite') v.b = String(v.b).toUpperCase();
    var row = spec.sbRow(v), key = spec.sbKey(v);
    var msg = $('#sbMsg');
    sb.newRow = null; sb.clash = null;
    var hasNull = key.some(function (k) { return k === null; });
    if (hasNull) {
      msg.className = 'msg bad';
      msg.textContent = '❌ Rejected — a Primary Key can’t be NULL (empty). Every key part needs a value!';
    } else {
      var at = -1;
      sb.rows.forEach(function (r, ri) {
        if (spec.sbKeyCols.every(function (c, j) { return String(r[c]) === String(key[j]); })) at = ri;
      });
      if (at >= 0) {
        sb.clash = at;
        msg.className = 'msg bad';
        msg.textContent = '❌ Rejected — duplicate key (' + key.join(', ') + '). That key is already used by the red row!';
      } else {
        sb.rows.push(row); sb.newRow = sb.rows.length - 1;
        msg.className = 'msg ok';
        msg.textContent = '✅ Saved! The key (' + key.join(', ') + ') is unique and not NULL. 🎉';
      }
    }
    sandboxDraw();
  }

  setMode('single');
})();
