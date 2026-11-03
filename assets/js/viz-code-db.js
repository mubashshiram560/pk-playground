/* Code-to-Database Visualization
   Java Entity → ID Generation → Repository Save → SQL Insert → Database Table */
(function () {
  'use strict';
  PK.chrome('viz', '../');
  var esc = PK.esc;
  var $ = function (s) { return document.querySelector(s); };

  var PIPE = ['☕ Java Entity', '🔢 ID Generation', '📦 Repository Save', '📝 SQL Insert', '🗃️ Database Table'];
  var INT_ROWS = [[1, 'Ana'], [2, 'Ben']];
  var UUID_ROWS = [['a19c03de…', 'Ana'], ['b7f2c5a1…', 'Ben']];
  var UUID = 'e42d91b0-7c3a-4f1e-9a52-0d6b3c18f7a4';

  /* step fields: stage (pipeline), java[] / sql[] (line numbers to light up),
     obj (id shown on the Java object, or undefined = object not created yet),
     set (id just assigned), rows (table rows shown), newRow, clash, error */
  function strategies(dup) {
    var dupId = dup ? 2 : 3;
    return {
      identity: {
        label: '🆔 Auto-increment (IDENTITY)', base: INT_ROWS, note: 'The database numbers the row.',
        java: [
          '@Entity',
          'public class Employee {',
          '  @Id',
          '  @GeneratedValue(strategy = GenerationType.IDENTITY)',
          '  private Long id;',
          '  private String name;',
          '}',
          '',
          'Employee e = new Employee("Mia");',
          'repository.save(e);',
          'System.out.println(e.getId()); // 3'
        ],
        sql: [
          '-- the table (already exists)',
          'CREATE TABLE employee (',
          '  id BIGINT PRIMARY KEY AUTO_INCREMENT,',
          '  name VARCHAR(50) NOT NULL',
          ');',
          '',
          '-- sent by repository.save(e)',
          'INSERT INTO employee (name)',
          "VALUES ('Mia');",
          '-- the database picks id = 3'
        ],
        steps: [
          { stage: 0, emoji: '☕', title: 'The Java Entity', text: 'An <code>@Entity</code> class is the blueprint of a table row. <code>@Id</code> marks the field that becomes the <b>Primary Key</b> — it matches the <code>id</code> column in the table on the right.', java: [0, 1, 2, 4, 5, 6], sql: [1, 2, 3, 4], rows: INT_ROWS },
          { stage: 0, emoji: '🧸', title: 'Create an object', text: 'We build a new <code>Employee</code>. It only lives in Java memory for now — and its <code>id</code> is <code>null</code>.', java: [8], obj: null, rows: INT_ROWS },
          { stage: 1, emoji: '🔢', title: 'ID Generation: IDENTITY', text: '<code>@GeneratedValue(IDENTITY)</code> says: “<i>let the <b>database</b> create the ID</i>”. Nothing is generated in Java, so the id stays <code>null</code> for now.', java: [3], sql: [2], obj: null, rows: INT_ROWS },
          { stage: 2, emoji: '📦', title: 'Repository Save', text: '<code>repository.save(e)</code> hands the object to JPA, which prepares an INSERT.', java: [9], obj: null, rows: INT_ROWS },
          { stage: 3, emoji: '📝', title: 'SQL Insert', text: 'JPA writes the SQL. See? <b>No id</b> in it — the database will add one.', java: [9], sql: [6, 7, 8], obj: null, rows: INT_ROWS },
          { stage: 4, emoji: '🗃️', title: 'Database Table', text: 'The auto-increment counter moves from 2 to <b>3</b>, and the new row lands in the table.', sql: [9], obj: null, rows: INT_ROWS.concat([[3, 'Mia']]), newRow: 2 },
          { stage: 4, emoji: '📬', title: 'The ID comes back to Java', text: 'JPA reads the generated key back and puts it into the object. <code>e.getId()</code> is now <b>3</b>! 🎉', java: [10], obj: 3, set: true, rows: INT_ROWS.concat([[3, 'Mia']]) }
        ]
      },

      sequence: {
        label: '🔢 Sequence (SEQUENCE)', base: INT_ROWS, note: 'JPA asks a sequence first, then inserts.',
        java: [
          '@Entity',
          'public class Employee {',
          '  @Id',
          '  @GeneratedValue(strategy = GenerationType.SEQUENCE,',
          '                  generator = "emp_seq")',
          '  @SequenceGenerator(name = "emp_seq",',
          '      sequenceName = "employee_seq", allocationSize = 1)',
          '  private Long id;',
          '  private String name;',
          '}',
          '',
          'Employee e = new Employee("Mia");',
          'repository.save(e);',
          'System.out.println(e.getId()); // 3'
        ],
        sql: [
          'CREATE SEQUENCE employee_seq START 1;',
          'CREATE TABLE employee (',
          '  id BIGINT PRIMARY KEY,',
          '  name VARCHAR(50) NOT NULL',
          ');',
          '',
          '-- 1) JPA asks the sequence',
          "SELECT nextval('employee_seq'); -- 3",
          '',
          '-- 2) then inserts with that id',
          'INSERT INTO employee (id, name)',
          "VALUES (3, 'Mia');"
        ],
        steps: [
          { stage: 0, emoji: '☕', title: 'The Java Entity', text: 'The entity maps to the <code>employee</code> table. This time the ID comes from a database <b>sequence</b> called <code>employee_seq</code>.', java: [0, 1, 2, 7, 8, 9], sql: [1, 2, 3, 4], rows: INT_ROWS },
          { stage: 0, emoji: '🧸', title: 'Create an object', text: 'A new <code>Employee</code> appears in Java memory with <code>id = null</code>.', java: [11], obj: null, rows: INT_ROWS },
          { stage: 1, emoji: '🔢', title: 'ID Generation: SEQUENCE', text: 'The annotations name the sequence. Before saving anything, JPA will ask it for the next number.', java: [3, 4, 5, 6], sql: [0], obj: null, rows: INT_ROWS },
          { stage: 1, emoji: '🎟️', title: 'The sequence answers: 3', text: 'JPA runs <code>nextval</code>; the sequence goes from 2 to <b>3</b>. JPA writes it into the object <b>before</b> any INSERT!', sql: [6, 7], obj: 3, set: true, rows: INT_ROWS },
          { stage: 2, emoji: '📦', title: 'Repository Save', text: '<code>repository.save(e)</code> — the object already owns its ID.', java: [12], obj: 3, rows: INT_ROWS },
          { stage: 3, emoji: '📝', title: 'SQL Insert', text: 'This time the INSERT <b>includes</b> the id column.', java: [12], sql: [9, 10, 11], obj: 3, rows: INT_ROWS },
          { stage: 4, emoji: '🗃️', title: 'Database Table', text: 'The database checks the Primary Key (unique ✅, not NULL ✅) and stores the row. 🎉', java: [13], sql: [10, 11], obj: 3, rows: INT_ROWS.concat([[3, 'Mia']]), newRow: 2 }
        ]
      },

      uuid: {
        label: '🧬 UUID (application-side)', base: UUID_ROWS, note: 'Java invents the ID itself.',
        java: [
          '@Entity',
          'public class Employee {',
          '  @Id',
          '  @GeneratedValue(strategy = GenerationType.UUID)',
          '  private UUID id;',
          '  private String name;',
          '}',
          '',
          'Employee e = new Employee("Mia");',
          'repository.save(e);',
          'System.out.println(e.getId());'
        ],
        sql: [
          'CREATE TABLE employee (',
          '  id UUID PRIMARY KEY,',
          '  name VARCHAR(50) NOT NULL',
          ');',
          '',
          '-- sent by repository.save(e)',
          'INSERT INTO employee (id, name)',
          "VALUES ('" + UUID + "', 'Mia');"
        ],
        steps: [
          { stage: 0, emoji: '☕', title: 'The Java Entity', text: 'The <code>id</code> field is a <code>UUID</code> — a long random ID. It becomes the <b>Primary Key</b> column.', java: [0, 1, 2, 4, 5, 6], sql: [0, 1, 2, 3], rows: UUID_ROWS },
          { stage: 0, emoji: '🧸', title: 'Create an object', text: 'A new <code>Employee</code> exists in memory, <code>id = null</code>.', java: [8], obj: null, rows: UUID_ROWS },
          { stage: 1, emoji: '🧬', title: 'ID Generation: UUID', text: 'JPA creates a random UUID <b>in Java memory</b> — no trip to the database needed. (Table shows it shortened.)', java: [3], obj: UUID, set: true, rows: UUID_ROWS },
          { stage: 2, emoji: '📦', title: 'Repository Save', text: '<code>repository.save(e)</code> — the object already owns its ID.', java: [9], obj: UUID, rows: UUID_ROWS },
          { stage: 3, emoji: '📝', title: 'SQL Insert', text: 'The INSERT carries the UUID that Java made.', java: [9], sql: [5, 6, 7], obj: UUID, rows: UUID_ROWS },
          { stage: 4, emoji: '🗃️', title: 'Database Table', text: 'The database still checks the Primary Key — a random UUID almost never clashes — and stores the row. 🎉', sql: [6, 7], obj: UUID, rows: UUID_ROWS.concat([['e42d91b0…', 'Mia']]), newRow: 2 },
          { stage: 4, emoji: '✅', title: 'Java already knew', text: '<code>e.getId()</code> returns the UUID straight away — it never had to wait for the database.', java: [10], obj: UUID, rows: UUID_ROWS.concat([['e42d91b0…', 'Mia']]) }
        ]
      },

      manual: {
        label: '✍️ Manual ID', base: INT_ROWS, note: 'You set the ID yourself.',
        java: [
          '@Entity',
          'public class Employee {',
          '  @Id            // no @GeneratedValue!',
          '  private Long id;',
          '  private String name;',
          '}',
          '',
          'Employee e = new Employee("Mia");',
          'e.setId(' + dupId + 'L);   // you choose the id',
          'repository.save(e);'
        ],
        sql: [
          'CREATE TABLE employee (',
          '  id BIGINT PRIMARY KEY,',
          '  name VARCHAR(50) NOT NULL',
          ');',
          '',
          '-- sent by repository.save(e)',
          'INSERT INTO employee (id, name)',
          "VALUES (" + dupId + ", 'Mia');",
          dup ? '-- ❌ duplicate key: 2 is taken!' : '-- ✅ id 3 is free'
        ],
        steps: [
          { stage: 0, emoji: '☕', title: 'The Java Entity', text: '<code>@Id</code> marks the Primary Key, but there is <b>no</b> <code>@GeneratedValue</code>. Nobody will make IDs for you!', java: [0, 1, 2, 3, 4, 5], sql: [0, 1, 2, 3], rows: INT_ROWS },
          { stage: 0, emoji: '🧸', title: 'Create an object', text: 'A new <code>Employee</code> with <code>id = null</code>.', java: [7], obj: null, rows: INT_ROWS },
          { stage: 1, emoji: '🧠', title: 'ID Generation: you!', text: 'You pick the ID by hand with <code>setId(' + dupId + ')</code>.' + (dup ? ' <b>Oops</b> — 2 already belongs to Ben! 🙈' : ' It is free, so far so good.'), java: [8], obj: dupId, set: true, rows: INT_ROWS },
          { stage: 2, emoji: '📦', title: 'Repository Save', text: '<code>repository.save(e)</code> sends the object off to JPA.', java: [9], obj: dupId, rows: INT_ROWS },
          { stage: 3, emoji: '📝', title: 'SQL Insert', text: 'The INSERT includes the id you chose.', java: [9], sql: [5, 6, 7], obj: dupId, rows: INT_ROWS },
          dup
            ? { stage: 4, emoji: '🚫', title: 'Database Table: rejected!', text: 'The database sees <code>id = 2</code> already exists, so the Primary Key rule <b>rejects</b> the row. JPA throws an exception and nothing is saved.', sql: [8], obj: dupId, rows: INT_ROWS, clash: 1, error: 'Duplicate entry \'2\' for key \'employee.PRIMARY\'' }
            : { stage: 4, emoji: '🗃️', title: 'Database Table', text: 'The id is free, so the Primary Key check passes and the row is stored. 🎉', sql: [8], obj: 3, rows: INT_ROWS.concat([[3, 'Mia']]), newRow: 2 }
        ]
      }
    };
  }

  var dupMode = false;
  var current = 'identity';
  var STRATS = strategies(dupMode);

  function codeHTML(lines, on, cls) {
    return lines.map(function (l, i) {
      return '<span class="code-line' + (on.indexOf(i) >= 0 ? ' ' + cls : '') + '">' + (l ? PK.hl(l) : '&nbsp;') + '</span>';
    }).join('');
  }

  function tableHTML(rows, s) {
    return '<table class="sim-table pk-on"><thead><tr><th class="pk">🔑 id</th><th>name</th></tr></thead><tbody>' +
      rows.map(function (r, i) {
        var c = (s.newRow === i ? 'new-row ' : '') + (s.clash === i ? 'clash' : '');
        return '<tr class="' + c + '"><td class="pk">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  var player = PK.Player({
    mount: $('#controls'),
    narrator: $('#narrator'),
    onRender: function (i, s) {
      var st = STRATS[current];
      $('#pipeline').innerHTML = PIPE.map(function (p, k) {
        var cls = k < s.stage ? 'done' : k === s.stage ? 'active' : '';
        return '<span class="pipe ' + cls + '">' + p + '</span>' + (k < PIPE.length - 1 ? '<span class="pipe-arrow">→</span>' : '');
      }).join('');
      $('#java').innerHTML = codeHTML(st.java, s.java || [], 'on');
      $('#sql').innerHTML = codeHTML(st.sql, s.sql || [], 'on-sql');
      var idv = s.obj === undefined ? null : s.obj;
      $('#obj').innerHTML = s.obj === undefined
        ? '<span class="mini-empty">(no object yet — nothing has been created in memory)</span>'
        : 'Employee {<br>&nbsp;&nbsp;id = <span class="idval' + (s.set ? ' set' : '') + '" style="word-break:break-all">' + (idv === null ? 'null' : esc(idv)) +
          '</span>,<br>&nbsp;&nbsp;name = "Mia"<br>}';
      $('#table').innerHTML = tableHTML(s.rows, s);
      $('#dbErr').innerHTML = s.error ? '<div class="banner bad db-error">❌ SQLException: ' + esc(s.error) + '</div>' : '';
    }
  });

  function drawConfig() {
    var el = $('#config');
    if (current !== 'manual') { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = '<span>🎚️ Which ID will you pick?</span>' +
      '<button type="button" class="btn btn-' + (dupMode ? 'ghost' : 'mint') + '" data-d="0">3 — free ✅</button>' +
      '<button type="button" class="btn btn-' + (dupMode ? 'pink' : 'ghost') + '" data-d="1">2 — already used ❌</button>';
  }
  $('#config').addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]');
    if (!b) return;
    dupMode = b.dataset.d === '1';
    STRATS = strategies(dupMode);
    drawConfig();
    load();
  });

  function load() {
    var st = STRATS[current];
    $('#notes').innerHTML = '<h3>📝 Handy notes</h3>' +
      '<div class="note-line">' + st.note + '</div>' +
      '<div class="note-line">👀 <b>Yellow</b> lines = Java, <b>blue</b> lines = SQL.</div>' +
      '<div class="note-line">🔑 The green <b>id</b> column is the Primary Key.</div>' +
      '<div class="note-line warn">⚠️ Simplified for learning — real SQL generated by JPA varies by database.</div>';
    player.setSteps(st.steps);
  }

  PK.chips($('#strats'), ['identity', 'sequence', 'uuid', 'manual'].map(function (k) { return { key: k, label: STRATS[k].label }; }), current, function (k) {
    current = k;
    drawConfig();
    load();
  });
  drawConfig();
  load();
})();
