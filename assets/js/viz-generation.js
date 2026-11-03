/* Generation Strategy Visualization — animated flowcharts */
(function () {
  'use strict';
  PK.chrome('viz', '../');
  var esc = PK.esc;
  var $ = function (s) { return document.querySelector(s); };

  var NAME = 'Mia';
  var INT_ROWS = [[1, 'Ana'], [2, 'Ben']];
  var UUID_ROWS = [['a19c-03de', 'Ana'], ['b7f2-c5a1', 'Ben']];
  var NEW_UUID = 'e42d-91b0';
  var NEW_OBJ = 'Employee e = new Employee("Mia");';

  /* every step is one node of the flowchart.
     obj    : value of the Java object's id (null = still empty)
     set    : the id was assigned in this step (pop animation)
     src    : the "ID source" box (counter, sequence, table…)
     stored : the new row is in the table
     code   : the Java / SQL line that matters right now */
  var FLOWS = {
    manual: {
      group: 's', label: '✍️ Manual ID assignment', title: '✍️ Manual ID assignment', base: INT_ROWS, newId: 3,
      good: 'Importing old data, or when the ID has real-world meaning.',
      warn: 'Humans can pick the same ID twice — the database will reject it, so your code must handle the error.',
      steps: [
        { e: '🧑‍💻', label: 'Create the object', sub: 'new Employee("Mia")', title: 'Create the Java object', text: 'You build an <code>Employee</code> object. Its <code>id</code> is still empty (<code>null</code>).', obj: null, code: NEW_OBJ },
        { e: '🧠', label: 'You choose the ID', sub: 'you pick 3', title: 'You pick the ID yourself', text: 'With manual assignment <b>you</b> decide the ID — from a form, a spreadsheet, or by checking the last one used. Nobody will do it for you!', obj: 3, set: true, src: { title: '🧠 ID source', val: 'you!', sub: 'a human decides' }, code: 'e.setId(3L);', carry: 'id = 3' },
        { e: '📦', label: 'repository.save(e)', sub: 'ORM gets an object with an id', title: 'Hand the object to the repository', text: 'The ORM sees the <code>id</code> is already filled in, so it won’t generate anything.', obj: 3, src: { title: '🧠 ID source', val: 'you!', sub: 'a human decides' }, code: 'repository.save(e);', carry: 'id = 3' },
        { e: '📝', label: 'SQL INSERT with the id', sub: 'VALUES (3, "Mia")', title: 'The INSERT carries your ID', text: 'The SQL includes the ID you chose.', obj: 3, code: "INSERT INTO employee (id, name)\nVALUES (3, 'Mia');", carry: 'id = 3' },
        { e: '🛡️', label: 'Database checks the PK', sub: 'unique? not NULL?', title: 'Primary Key check', text: 'If an employee 3 already existed, the database would <b>reject</b> this row. It’s free ✅ — so we continue!', obj: 3, code: '-- unique? ✅   not NULL? ✅' },
        { e: '🗃️', label: 'Row stored 🎉', sub: 'id 3 is in the table', title: 'Row stored', text: 'The row is saved with exactly the ID you chose.', obj: 3, stored: true, code: '-- 1 row inserted.' }
      ]
    },

    database: {
      group: 's', label: '🗄️ Database-side generation', title: '🗄️ Database-side generation', base: INT_ROWS, newId: 3,
      good: 'Simple and safe: the database never hands out the same number twice.',
      warn: 'Your Java object does not know its ID until after the INSERT.',
      steps: [
        { e: '🧑‍💻', label: 'Create the object', sub: 'id is null', title: 'Create the Java object', text: 'The <code>id</code> stays <code>null</code> — we’ll let the database fill it in.', obj: null, code: NEW_OBJ },
        { e: '📦', label: 'repository.save(e)', sub: 'ORM prepares an INSERT', title: 'Save the object', text: 'The ORM sees no ID, so it writes an <code>INSERT</code> <b>without</b> the id column.', obj: null, code: 'repository.save(e);' },
        { e: '📝', label: 'INSERT without an id', sub: 'only name is sent', title: 'INSERT sent to the database', text: 'Notice: no id in the SQL! The database will add one.', obj: null, code: "INSERT INTO employee (name)\nVALUES ('Mia');" },
        { e: '🔢', label: 'DB counter makes the ID', sub: 'last was 2 → next is 3', title: 'The database generates the ID', text: 'An <b>auto-increment</b> counter remembers the last number (2) and hands out the next one: <b>3</b>.', obj: null, src: { title: '🔢 Auto-increment counter', val: '2 → 3', sub: 'owned by the database' }, code: '-- AUTO_INCREMENT: next id = 3', carry: 'id = 3' },
        { e: '🗃️', label: 'Row stored', sub: 'with id 3', title: 'Row stored', text: 'The database saves Mia with the brand-new ID.', obj: null, src: { title: '🔢 Auto-increment counter', val: '3', sub: 'now at 3' }, stored: true, code: '-- 1 row inserted (id = 3).', carry: 'id = 3' },
        { e: '📬', label: 'ID returned to Java', sub: 'e.getId() → 3', title: 'The ID travels back', text: 'The database sends the generated key back and the ORM writes it into the object. Now Java knows it too!', obj: 3, set: true, src: { title: '🔢 Auto-increment counter', val: '3', sub: 'now at 3' }, stored: true, code: 'System.out.println(e.getId()); // 3', carry: 'id = 3' }
      ]
    },

    application: {
      group: 's', label: '💻 Application-side generation', title: '💻 Application-side generation', base: UUID_ROWS, newId: NEW_UUID,
      good: 'The ID exists before saving, and several apps can create IDs without asking the database.',
      warn: 'Long random IDs (like UUIDs) use more space and are harder to read than 1, 2, 3.',
      steps: [
        { e: '🧑‍💻', label: 'Create the object', sub: 'id is null', title: 'Create the Java object', text: 'The app builds the object. <code>id</code> is empty for now.', obj: null, code: NEW_OBJ },
        { e: '🎲', label: 'App generates an ID', sub: 'UUID.randomUUID()', title: 'Your application makes the ID', text: 'The <b>application code</b> creates a random UUID — no database trip needed. (Shortened here to <code>' + NEW_UUID + '</code>.)', obj: null, src: { title: '🎲 UUID.randomUUID()', val: NEW_UUID, sub: 'created in Java memory' }, code: 'UUID id = UUID.randomUUID();', carry: NEW_UUID },
        { e: '🏷️', label: 'Assign it to the object', sub: 'e.setId(id)', title: 'ID assigned', text: 'The object now carries its own ID <b>before</b> touching the database.', obj: NEW_UUID, set: true, src: { title: '🎲 UUID.randomUUID()', val: NEW_UUID, sub: 'created in Java memory' }, code: 'e.setId(id);', carry: NEW_UUID },
        { e: '📦', label: 'repository.save(e)', sub: 'ORM sends INSERT', title: 'Save the object', text: 'The ORM sees the ID is already set and just sends it along.', obj: NEW_UUID, code: 'repository.save(e);', carry: NEW_UUID },
        { e: '📝', label: 'SQL INSERT with the id', sub: 'VALUES (uuid, "Mia")', title: 'INSERT carries the UUID', text: 'The SQL includes the ID the application created.', obj: NEW_UUID, code: "INSERT INTO employee (id, name)\nVALUES ('" + NEW_UUID + "…', 'Mia');", carry: NEW_UUID },
        { e: '🗃️', label: 'Database checks & stores', sub: 'unique ✅ not NULL ✅', title: 'Checked and stored', text: 'A random UUID almost never clashes, but the database still checks the Primary Key. ✅', obj: NEW_UUID, stored: true, code: '-- 1 row inserted.', carry: NEW_UUID }
      ]
    },

    orm: {
      group: 's', label: '🧰 ORM / JPA-managed generation', title: '🧰 ORM / JPA-managed generation', base: INT_ROWS, newId: 3,
      good: 'You just write <code>@GeneratedValue</code> and the ORM handles the rest.',
      warn: 'Which generator runs depends on the strategy — check the AUTO / IDENTITY / SEQUENCE / TABLE chips!',
      steps: [
        { e: '🏷️', label: 'Annotate the entity', sub: '@Id @GeneratedValue', title: 'Mark the ID as “generated”', text: 'You tell JPA: “<i>this field is the ID, and you create it</i>” with <code>@GeneratedValue</code>.', obj: null, code: '@Id\n@GeneratedValue\nprivate Long id;' },
        { e: '📦', label: 'repository.save(e)', sub: 'persist the new object', title: 'Save the object', text: 'The ORM notices the new object has no ID yet, so it needs to create one.', obj: null, code: 'repository.save(e);' },
        { e: '🏭', label: 'Ask the ID generator', sub: 'chosen by the strategy', title: 'The ORM calls its ID generator', text: 'Depending on the strategy (AUTO, IDENTITY, SEQUENCE, TABLE) the generator uses the database or its own logic to find the next ID: <b>3</b>.', obj: null, src: { title: '🏭 ID generator', val: '→ 3', sub: 'strategy decides how' }, code: '// generator.next() → 3', carry: 'id = 3' },
        { e: '🏷️', label: 'ID assigned to the object', sub: 'id = 3', title: 'ID assigned', text: 'The ORM writes the new ID into your object.', obj: 3, set: true, src: { title: '🏭 ID generator', val: '→ 3', sub: 'strategy decides how' }, code: 'e.getId(); // 3', carry: 'id = 3' },
        { e: '📝', label: 'SQL INSERT', sub: 'sent on flush / commit', title: 'INSERT is sent', text: 'When the ORM “flushes” its changes, it sends the INSERT.', obj: 3, code: "INSERT INTO employee (id, name)\nVALUES (3, 'Mia');", carry: 'id = 3' },
        { e: '🗃️', label: 'Row stored 🎉', sub: 'id 3 is in the table', title: 'Row stored', text: 'Done! Mia has her ID and you wrote almost no code.', obj: 3, stored: true, code: '-- 1 row inserted.', carry: 'id = 3' }
      ]
    },

    auto: {
      group: 'j', label: '🤖 AUTO', title: '🤖 JPA GenerationType.AUTO', base: INT_ROWS, newId: 3,
      good: 'Great default — works across databases without choosing.',
      warn: 'The exact choice depends on your JPA provider and version, so check what it picked.',
      steps: [
        { e: '🏷️', label: 'Annotate with AUTO', sub: 'strategy = AUTO', title: '@GeneratedValue(AUTO)', text: 'You say “<i>JPA, you choose the best way!</i>”', obj: null, code: '@Id\n@GeneratedValue(strategy = GenerationType.AUTO)\nprivate Long id;' },
        { e: '📦', label: 'repository.save(e)', sub: 'persist', title: 'Save the object', text: 'JPA needs an ID, so it must first decide <i>how</i> to make one.', obj: null, code: 'repository.save(e);' },
        { e: '🔍', label: 'Check the database', sub: 'which tools does it have?', title: 'The provider inspects the database', text: 'It looks at your database type: does it support <b>sequences</b>? <b>identity</b> columns?', obj: null, src: { title: '🔍 Database features', val: 'sequence ✔', sub: 'identity ✔ · table ✔' }, code: '// dialect: PostgreSQL' },
        { e: '🎯', label: 'Pick a strategy', sub: 'e.g. SEQUENCE', title: 'A strategy is chosen', text: 'Often <b>SEQUENCE</b> when available (e.g. PostgreSQL), otherwise IDENTITY or TABLE. The exact rule depends on provider &amp; version.', obj: null, src: { title: '🎯 Chosen strategy', val: 'SEQUENCE', sub: 'AUTO delegated to it' }, code: '// AUTO → SEQUENCE' },
        { e: '🔢', label: 'Get the next ID', sub: 'nextval → 3', title: 'The chosen strategy makes the ID', text: 'From here it works just like the SEQUENCE flow: the sequence moves from 2 to <b>3</b>.', obj: 3, set: true, src: { title: '🔢 Sequence', val: '2 → 3', sub: 'AUTO → SEQUENCE' }, code: "SELECT nextval('employee_seq'); -- 3", carry: 'id = 3' },
        { e: '📝', label: 'SQL INSERT with the id', sub: 'VALUES (3, "Mia")', title: 'INSERT is sent', text: 'Now the object has an ID, so the INSERT includes it.', obj: 3, code: "INSERT INTO employee (id, name)\nVALUES (3, 'Mia');", carry: 'id = 3' },
        { e: '🗃️', label: 'Row stored 🎉', sub: 'id 3 is in the table', title: 'Row stored', text: 'AUTO did the thinking for you.', obj: 3, stored: true, code: '-- 1 row inserted.', carry: 'id = 3' }
      ]
    },

    identity: {
      group: 'j', label: '🆔 IDENTITY', title: '🆔 JPA GenerationType.IDENTITY', base: INT_ROWS, newId: 3,
      good: 'Easy; works with MySQL, SQL Server, PostgreSQL identity columns.',
      warn: 'The INSERT must run immediately to learn the ID, so batching inserts is limited.',
      steps: [
        { e: '🏷️', label: 'Annotate with IDENTITY', sub: 'strategy = IDENTITY', title: '@GeneratedValue(IDENTITY)', text: 'The ID column is an <b>auto-increment / identity</b> column in the database.', obj: null, code: '@Id\n@GeneratedValue(strategy = GenerationType.IDENTITY)\nprivate Long id;' },
        { e: '⚡', label: 'persist → INSERT right now', sub: 'no id in the SQL', title: 'INSERT runs immediately', text: 'JPA can’t know the ID until the row exists, so it sends the INSERT <b>right away</b>, without an id.', obj: null, code: "INSERT INTO employee (name)\nVALUES ('Mia');" },
        { e: '🔢', label: 'Database creates the ID', sub: 'identity column: 2 → 3', title: 'The identity column counts', text: 'The database adds <b>1</b> to its counter: the new ID is <b>3</b>.', obj: null, src: { title: '🔢 Identity counter', val: '2 → 3', sub: 'owned by the database' }, code: '-- identity: next id = 3', carry: 'id = 3' },
        { e: '🗃️', label: 'Row stored', sub: 'with id 3', title: 'Row stored', text: 'Mia is in the table with ID 3.', obj: null, src: { title: '🔢 Identity counter', val: '3', sub: 'now at 3' }, stored: true, code: '-- 1 row inserted (id = 3).', carry: 'id = 3' },
        { e: '📬', label: 'Generated key returned', sub: 'getGeneratedKeys()', title: 'The key comes back', text: 'The database hands the new ID back to JPA (JDBC <code>getGeneratedKeys()</code>).', obj: null, src: { title: '🔢 Identity counter', val: '3', sub: 'key sent to JPA' }, stored: true, code: '-- returned generated key: 3', carry: 'id = 3' },
        { e: '🏷️', label: 'ID set on the object', sub: 'e.getId() → 3', title: 'ID set on the object', text: 'JPA puts <b>3</b> into your object. Now it is managed and has an ID!', obj: 3, set: true, src: { title: '🔢 Identity counter', val: '3', sub: 'key sent to JPA' }, stored: true, code: 'e.getId(); // 3', carry: 'id = 3' }
      ]
    },

    sequence: {
      group: 'j', label: '🔢 SEQUENCE', title: '🔢 JPA GenerationType.SEQUENCE', base: INT_ROWS, newId: 3,
      good: 'Fast and flexible: the ID is known <i>before</i> the INSERT, so batching works.',
      warn: 'Needs a database with sequences (PostgreSQL, Oracle…). By default JPA can reserve a <b>block</b> of IDs (<code>allocationSize</code>) to ask the DB less often.',
      steps: [
        { e: '🏷️', label: 'Annotate with SEQUENCE', sub: '@SequenceGenerator', title: '@GeneratedValue(SEQUENCE)', text: 'You name a database <b>sequence</b> — a counter that lives in the database.', obj: null, code: '@GeneratedValue(strategy = GenerationType.SEQUENCE,\n                generator = "emp_seq")\n@SequenceGenerator(name = "emp_seq",\n    sequenceName = "employee_seq", allocationSize = 1)' },
        { e: '❓', label: 'Ask the sequence', sub: 'nextval(employee_seq)', title: 'JPA asks for the next number', text: 'Before inserting anything, JPA runs a quick query asking the sequence for its next value.', obj: null, src: { title: '🔢 employee_seq', val: '2', sub: 'last value used' }, code: "SELECT nextval('employee_seq');" },
        { e: '🔢', label: 'Sequence answers: 3', sub: '2 → 3', title: 'The sequence moves forward', text: 'The sequence adds 1 and answers <b>3</b>. That number is now “used up” forever.', obj: null, src: { title: '🔢 employee_seq', val: '2 → 3', sub: 'next value handed out' }, code: '-- nextval returns 3', carry: 'id = 3' },
        { e: '🏷️', label: 'ID set on the object', sub: 'before any INSERT!', title: 'ID assigned before the INSERT', text: 'JPA writes <b>3</b> into your object <i>before</i> sending any INSERT. That’s the big difference from IDENTITY.', obj: 3, set: true, src: { title: '🔢 employee_seq', val: '3', sub: 'now at 3' }, code: 'e.getId(); // 3 (already known!)', carry: 'id = 3' },
        { e: '📝', label: 'SQL INSERT with the id', sub: 'on flush / commit', title: 'INSERT is sent later', text: 'On flush or commit, JPA sends the INSERT with the ID it already holds.', obj: 3, src: { title: '🔢 employee_seq', val: '3', sub: 'now at 3' }, code: "INSERT INTO employee (id, name)\nVALUES (3, 'Mia');", carry: 'id = 3' },
        { e: '🗃️', label: 'Row stored 🎉', sub: 'id 3 is in the table', title: 'Row stored', text: 'Mia is saved with her sequence-made ID.', obj: 3, src: { title: '🔢 employee_seq', val: '3', sub: 'now at 3' }, stored: true, code: '-- 1 row inserted.', carry: 'id = 3' }
      ]
    },

    table: {
      group: 'j', label: '📋 TABLE', title: '📋 JPA GenerationType.TABLE', base: INT_ROWS, newId: 3,
      good: 'Works on any database, because it only uses an ordinary table.',
      warn: 'Slowest of the four: extra reads, updates and locking just to get a number.',
      steps: [
        { e: '🏷️', label: 'Annotate with TABLE', sub: '@TableGenerator', title: '@GeneratedValue(TABLE)', text: 'JPA keeps its counter in a <b>normal table</b> — like a notebook of “next number” values.', obj: null, code: '@GeneratedValue(strategy = GenerationType.TABLE,\n                generator = "emp_gen")\n@TableGenerator(name = "emp_gen", table = "id_generator")' },
        { e: '📖', label: 'Read the counter table', sub: 'SELECT next_val …', title: 'Look in the notebook', text: 'JPA reads (and locks) the row that holds the next number for employees: <code>next_val = 3</code>.', obj: null, src: { title: '📋 id_generator table', val: 'next_val = 3', sub: 'row is locked while reading' }, code: "SELECT next_val FROM id_generator\nWHERE gen_name = 'employee' FOR UPDATE;" },
        { e: '✏️', label: 'Update the counter', sub: 'next_val = 4', title: 'Move the counter forward', text: 'Right away it writes <code>4</code> back, so nobody else receives <b>3</b>.', obj: null, src: { title: '📋 id_generator table', val: 'next_val = 4', sub: 'ID 3 is reserved for Mia' }, code: "UPDATE id_generator SET next_val = 4\nWHERE gen_name = 'employee';", carry: 'id = 3' },
        { e: '🏷️', label: 'ID set on the object', sub: 'id = 3', title: 'ID assigned', text: 'JPA puts <b>3</b> into your object.', obj: 3, set: true, src: { title: '📋 id_generator table', val: 'next_val = 4', sub: 'ID 3 is reserved for Mia' }, code: 'e.getId(); // 3', carry: 'id = 3' },
        { e: '📝', label: 'SQL INSERT with the id', sub: 'on flush / commit', title: 'INSERT is sent', text: 'Now the real INSERT is sent with the ID.', obj: 3, code: "INSERT INTO employee (id, name)\nVALUES (3, 'Mia');", carry: 'id = 3' },
        { e: '🗃️', label: 'Row stored 🎉', sub: 'id 3 is in the table', title: 'Row stored', text: 'Mia is saved. It took more steps than the others — that’s the price of working everywhere.', obj: 3, stored: true, code: '-- 1 row inserted.', carry: 'id = 3' }
      ]
    }
  };

  var current = 'manual';
  var flowEl = $('#flow');
  var nodes = [], conns = [];

  function buildFlow(f) {
    flowEl.innerHTML = f.steps.map(function (s, i) {
      return '<div class="node" data-i="' + i + '"><div class="n-emoji" aria-hidden="true">' + s.e + '</div><div>' +
        '<div class="n-label">' + (i + 1) + '. ' + s.label + '</div><div class="n-sub">' + esc(s.sub) + '</div>' +
        '<span class="carry" hidden></span></div></div>' +
        (i < f.steps.length - 1 ? '<div class="conn"></div>' : '');
    }).join('');
    nodes = [].slice.call(flowEl.querySelectorAll('.node'));
    conns = [].slice.call(flowEl.querySelectorAll('.conn'));
  }

  function renderState(f, s) {
    var rows = f.base.map(function (r) { return '<div class="mini-row">' + esc(r[0]) + ' · ' + esc(r[1]) + '</div>'; });
    if (s.stored) rows.push('<div class="mini-row new">' + esc(f.newId) + ' · ' + NAME + '</div>');
    var idv = s.obj === null ? 'null' : esc(s.obj);
    var src = s.src
      ? '<div class="mini"><h4>' + s.src.title + '</h4><div class="counter-val' + (String(s.src.val).length > 8 ? ' small' : '') + '">' +
        esc(s.src.val) + '</div><div class="sub">' + esc(s.src.sub || '') + '</div></div>'
      : '<div class="mini"><h4>🧰 ID source</h4><div class="mini-empty">nothing has generated an ID yet…</div></div>';
    $('#state').innerHTML =
      '<div class="mini"><h4>☕ Java object</h4><div class="obj">Employee {<br>&nbsp;&nbsp;id = <span class="idval' + (s.set ? ' set' : '') + '">' + idv +
      '</span>,<br>&nbsp;&nbsp;name = "' + NAME + '"<br>}</div></div>' + src +
      '<div class="mini"><h4>🗄️ employee table</h4><div class="mini-rows">' + rows.join('') + '</div></div>';
  }

  var player = PK.Player({
    mount: $('#controls'),
    narrator: $('#narrator'),
    onRender: function (i, s) {
      var f = FLOWS[current];
      nodes.forEach(function (n, k) {
        n.className = 'node' + (k < i ? ' done' : k === i ? ' active' : '');
        var steps = f.steps;
        var c = n.querySelector('.carry');
        var show = k <= i && steps[k].carry;
        c.hidden = !show;
        if (show) c.textContent = steps[k].carry;
      });
      conns.forEach(function (c, k) { c.classList.toggle('filled', k < i); });
      renderState(f, s);
      $('#code').innerHTML = s.code.split('\n').map(PK.hl).join('\n');
    }
  });

  var strat = PK.chips($('#gStrat'), ['manual', 'database', 'application', 'orm'].map(function (k) { return { key: k, label: FLOWS[k].label }; }), current, pick);
  var jpa = PK.chips($('#gJpa'), ['auto', 'identity', 'sequence', 'table'].map(function (k) { return { key: k, label: FLOWS[k].label }; }), null, pick);

  function pick(k) {
    current = k;
    var f = FLOWS[k];
    if (f.group === 's') jpa.set(null); else strat.set(null);
    $('#flowTitle').textContent = f.title;
    buildFlow(f);
    $('#notes').innerHTML = '<h3>📝 Handy notes</h3>' +
      '<div class="note-line good">👍 <b>Good for:</b> ' + f.good + '</div>' +
      '<div class="note-line warn">⚠️ <b>Watch out:</b> ' + f.warn + '</div>';
    player.setSteps(f.steps);
  }
  strat.set('manual');
  pick('manual');
})();
