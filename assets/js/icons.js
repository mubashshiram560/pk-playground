/* ==========================================================
   PK Playground — sketchy hand-drawn icons ✏️
   Replaces every standard (keyboard) emoji on the page with a
   cute sketch-style SVG icon. Works for text added later too.
   ========================================================== */
(function () {
  'use strict';
  var PK = (window.PK = window.PK || {});

  var INK = '#2f3b48', SKY = '#8ccbf3', SKY2 = '#d4ebfc', GRAY = '#d3dbe3', GRAY2 = '#a3afbc',
    WHITE = '#ffffff', YEL = '#ffe28a', GRN = '#9be0bb', RED = '#f5a3b4';

  /* ---------- drawing helpers (24 x 24 grid) ---------- */
  function circ(cx, cy, r) {
    return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0z';
  }
  /* filled shape: a marker-coloured copy slightly offset + the pencil outline on top */
  function f(d, fill) {
    return '<path d="' + d + '" fill="' + fill + '" stroke="none" transform="translate(.8 .7)"/><path d="' + d + '" fill="none"/>';
  }
  function fc(cx, cy, r, fill) { return f(circ(cx, cy, r), fill); }
  function l(d, col, w) {
    return '<path d="' + d + '" fill="none"' + (col ? ' stroke="' + col + '"' : '') + (w ? ' stroke-width="' + w + '"' : '') + '/>';
  }
  function dot(x, y, r, col) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 1) + '" fill="' + (col || INK) + '" stroke="none"/>'; }
  function eyes(y, dx) { y = y || 11; dx = dx || 3; return dot(12 - dx, y, 1.05) + dot(12 + dx, y, 1.05); }
  function smile(y, w) { y = y || 14.5; w = w || 2; return l('M' + (12 - w) + ' ' + y + 'q' + w + ' 2 ' + (2 * w) + ' 0'); }
  function blush(y, dx) { y = y || 14; dx = dx || 5.2; return '<ellipse cx="' + (12 - dx) + '" cy="' + y + '" rx="1.5" ry=".9" fill="' + SKY + '" stroke="none"/><ellipse cx="' + (12 + dx) + '" cy="' + y + '" rx="1.5" ry=".9" fill="' + SKY + '" stroke="none"/>'; }
  function gear(cx, cy, ro, ri, teeth) {
    var n = teeth * 4, p = '';
    for (var i = 0; i < n; i++) {
      var a = (Math.PI * 2 * i) / n, r = ((i >> 1) % 2 === 0) ? ro : ri;
      p += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2);
    }
    return p + 'z';
  }
  function person(body) {
    return fc(12, 8, 3.6, WHITE) + f('M5 21c0-4.5 3-7 7-7s7 2.5 7 7z', SKY) + dot(10.6, 7.8, .8) + dot(13.4, 7.8, .8) + l('M11 10q1 1 2 0') + body;
  }
  function faceCircle(fill) { return fc(12, 12, 8.5, fill) + eyes(11) + smile(14.5) + blush(14); }

  /* ---------- the icons ---------- */
  var I = {
    key: fc(9, 9, 5.8, SKY) + dot(7, 8.6, .9) + dot(11, 8.6, .9) + l('M7.6 11q1.4 1.4 2.8 0') +
      f('M13 14.4l1.4-1.4 6.6 6.6-1.4 1.4z', GRAY) + l('M17.6 18l1.8-1.8 M19.6 20l1.6-1.6'),
    check: f('M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z', GRN) + l('M7.5 12.5l3 3.2 6-7.2', '#1f7a4d', 2.3),
    tick: l('M5 12.5l4.5 4.5L19.5 7', '#1f7a4d', 2.6),
    cross: f('M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z', RED) + l('M8 8l8 8 M16 8l-8 8', '#a8243b', 2.3),
    ban: fc(12, 12, 8.5, RED) + l('M6 6l12 12', '#a8243b', 2.4),
    warn: f('M12 3.5L21.5 20h-19z', YEL) + l('M12 9.5v5', INK, 2) + dot(12, 17.3, 1.1),
    hourglass: l('M6.5 3.5h11 M6.5 20.5h11') + f('M7.5 3.5h9c0 4-3 5.5-4.5 8.5C10.5 9 7.5 7.5 7.5 3.5z', SKY2) + f('M12 12c1.5 3 4.5 4.5 4.5 8.5h-9c0-4 3-5.5 4.5-8.5z', SKY),
    minus: f('M6.5 10.6h11a1.4 1.4 0 0 1 0 2.8h-11a1.4 1.4 0 0 1 0-2.8z', GRAY),
    plus: l('M12 5.5v13 M5.5 12h13', INK, 2.4),
    sparkle: f('M12 3c.8 5 2.2 6.4 7 7-4.8.6-6.2 2-7 7-.8-5-2.2-6.4-7-7 4.8-.6 6.2-2 7-7z', YEL) + f('M19 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z', SKY2),
    party: f('M4 20.5L8 9l7.5 7.5z', SKY) + l('M6 15.5l3.5 3.5') + l('M13 11.5q5-1 6.5-6.5', GRAY2, 1.6) + l('M12 5.5l1-2 M17 9.5l2.5-.5 M15.5 3.5v.01 M20 12.5v.01', INK, 2),
    note: f('M6 3.5h9l3.5 3.5v13.5H6z', WHITE) + l('M15 3.5V7h3.5') + l('M8.5 11h7 M8.5 14h7 M8.5 17h4'),
    tag: f('M3.5 12.5v-8h8l9 9-8 8z', SKY) + fc(8, 8.5, 1.3, WHITE),
    cabinet: f('M5 3.5h14v17H5z', GRAY) + l('M5 12h14 M10.5 8h3 M10.5 16.5h3'),
    filebox: f('M4 4.5h16v4.5H4z', SKY2) + f('M5 9h14v11.5H5z', GRAY) + l('M10 13.5h4'),
    clipboard: f('M5.5 5h13v16h-13z', WHITE) + f('M9 3.5h6v3.5H9z', GRAY2) + l('M8.5 12h7 M8.5 15h7 M8.5 18h4'),
    package: f('M3.5 8L12 4l8.5 4v9L12 21l-8.5-4z', GRAY) + l('M3.5 8L12 12l8.5-4 M12 12v9') + l('M7.8 6l8.5 4', SKY, 2.2),
    cup: f('M5 9h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z', WHITE) + l('M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16') + l('M8 3.5q1 1.5 0 3 M12 3.5q1 1.5 0 3', GRAY2) + l('M4 21.5h13') + l('M5.5 11.5h10', SKY, 2),
    dice: f('M5 4.5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z', WHITE) + dot(8.5, 8.5, 1.3) + dot(12, 12, 1.3) + dot(15.5, 15.5, 1.3) + dot(15.5, 8.5, 1.3) + dot(8.5, 15.5, 1.3),
    pencil: f('M4 20.5l1-4.2L16 5.3l3.2 3.2L8.2 19.5z', YEL) + l('M14 7.3l3.2 3.2 M4 20.5l4.2-1') + l('M16 5.3l1.6-1.6a1.5 1.5 0 0 1 2.1 0l1 1a1.5 1.5 0 0 1 0 2.1L19.2 8.5', INK),
    brain: f('M12 5c-1.5-2-5-1.5-5.5 1.2C4.5 6.8 4 9 5 10.5 4 12 4.5 14.5 6.5 15c.3 2.2 3.5 3.3 5.5 1.5 2 1.8 5.2.7 5.5-1.5 2-.5 2.5-3 1.5-4.5 1-1.5.5-3.7-1.5-4.3C17 3.5 13.5 3 12 5z', SKY2) +
      l('M12 5v11.5') + l('M8.5 9.5q1.6 0 2 1.6 M15.5 9.5q-1.6 0-2 1.6 M8.5 13q1.4 0 2 1', GRAY2, 1.2),
    laptop: f('M5.5 5.5h13v9h-13z', SKY2) + f('M3 17.5h18l-1.5 2.2h-15z', GRAY) + dot(9.6, 9, .9) + dot(14.4, 9, .9) + l('M10.3 11.6q1.7 1.4 3.4 0'),
    teddy: fc(6.8, 6.8, 2.6, GRAY) + fc(17.2, 6.8, 2.6, GRAY) + fc(12, 13, 7, GRAY) + f('M12 17.8c-2.4 0-3.4-1.2-3.4-2.4s1.4-1.9 3.4-1.9 3.4.7 3.4 1.9-1 2.4-3.4 2.4z', WHITE) + dot(9.2, 11, 1) + dot(14.8, 11, 1) + dot(12, 14.2, .9),
    devperson: person(f('M8 18.3h8v2.7H8z', GRAY)),
    bizperson: person(f('M12 14.6l-1.4 2 1.4 3.4 1.4-3.4z', WHITE)),
    dna: l('M8 3c0 6 8 6 8 9s-8 3-8 9 M16 3c0 6-8 6-8 9s8 3 8 9') + l('M9.3 6.4h5.4 M10 12h4 M9.3 17.6h5.4', SKY, 2),
    ticket: f('M3.5 7.5h17v3.2a1.8 1.8 0 0 0 0 3.6v3.2h-17v-3.2a1.8 1.8 0 0 0 0-3.6z', SKY) + l('M14.5 8.5v1.6 M14.5 11.2v1.6 M14.5 14v1.6', INK, 1.4) + l('M7 12h4.5', INK, 1.6),
    target: fc(12, 12, 9, WHITE) + fc(12, 12, 5.8, SKY) + fc(12, 12, 2.6, WHITE) + l('M12 12l7.5-7.5 M17.5 3.5l2-.5.5 2', INK, 1.7),
    puzzle: f('M4 8h4.2a2.2 2.2 0 1 1 4.4 0H17v4.2a2.2 2.2 0 1 1 0 4.4V20H4z', SKY),
    house: f('M2.8 12L12 4l9.2 8z', SKY) + f('M5.5 12v8.5h13V12', WHITE) + f('M10.5 20.5v-5h3v5z', GRAY),
    calendar: f('M4.5 6h15v14.5h-15z', WHITE) + f('M4.5 6h15v4h-15z', SKY) + l('M8.5 3.5v4 M15.5 3.5v4') + dot(8.5, 13.5, .9) + dot(12, 13.5, .9) + dot(15.5, 13.5, .9) + dot(8.5, 17, .9) + dot(12, 17, .9),
    heart: f('M12 20C4 14.5 3 10 3 8a4.2 4.2 0 0 1 9-1.5A4.2 4.2 0 0 1 21 8c0 2-1 6.5-9 12z', SKY),
    building: f('M6 20.5V4.5h12v16z', GRAY) + f('M9 7.5h2v2H9z M13 7.5h2v2h-2z M9 12h2v2H9z M13 12h2v2h-2z', WHITE) + f('M10.5 20.5v-3.5h3v3.5z', SKY),
    replay: l('M18.8 8.6A7.5 7.5 0 1 0 19.6 13.6', INK, 1.9) + l('M19.2 4.2v4.6h-4.6', INK, 1.9),
    flask: f('M10.5 3.5v6L5 19.5a1.5 1.5 0 0 0 1.3 2.2h11.4a1.5 1.5 0 0 0 1.3-2.2L13.5 9.5v-6z', WHITE) + l('M9.5 3.5h5') + f('M7.8 15.5h8.4l2 3.8a1 1 0 0 1-.9 1.5H6.7a1 1 0 0 1-.9-1.5z', SKY) + dot(11, 13, .8, SKY) + dot(13, 11.5, .6, SKY),
    envelope: f('M3.5 6.5h17v12h-17z', WHITE) + l('M3.8 7l8.2 6.3L20.2 7'),
    eyes: f('M4 12a4 5 0 1 0 8 0 4 5 0 1 0-8 0z', WHITE) + f('M12 12a4 5 0 1 0 8 0 4 5 0 1 0-8 0z', WHITE) + dot(9, 13, 1.6) + dot(17, 13, 1.6),
    toolbox: f('M3.5 9h17v11.5h-17z', SKY) + l('M9 9V6.5h6V9 M3.5 14h17') + f('M10.8 12.8h2.4v2.4h-2.4z', WHITE),
    factory: f('M3.5 20.5v-9l5.5 3.5v-3.5l5.5 3.5V5h4.5v15.5z', GRAY) + f('M6 17h2v2H6z M11 17h2v2h-2z M16 8h2v2h-2z M16 13h2v2h-2z', WHITE) + l('M16.8 3.4q1-1 0-2', GRAY2),
    magnifier: fc(10, 10, 6, SKY2) + l('M14.6 14.6l6 6', INK, 2.4) + l('M7.4 8.4q.8-1.6 2.4-1.8', WHITE, 1.4),
    gear: f(gear(12, 12, 9.5, 7.6, 8), GRAY) + fc(12, 12, 3, WHITE),
    play: f('M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7z', SKY),
    prev: '<g transform="translate(24 0) scale(-1 1)">' + f('M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7z', SKY) + '</g>',
    pause: f('M6.5 4.5h4v15h-4z', SKY) + f('M13.5 4.5h4v15h-4z', SKY),
    rewind: '<g transform="translate(24 0) scale(-1 1)">' + f('M3.5 5.5l8 6.5-8 6.5z', SKY) + f('M12.5 5.5l8 6.5-8 6.5z', SKY) + '</g>',
    forward: f('M3.5 5.5l8 6.5-8 6.5z', SKY) + f('M12.5 5.5l8 6.5-8 6.5z', SKY),
    chick: fc(12, 13, 7.5, YEL) + l('M11.5 5.6q-1.5-2.4.8-2.8 M13.5 5.8q1.2-2 2.6-1.4') + dot(9.2, 12, 1) + dot(14.8, 12, 1) + f('M10.8 14l1.2 1.8 1.2-1.8z', GRAY2) + l('M9 20.5v1.5 M15 20.5v1.5') + blush(14.6, 5.4),
    turtle: f('M4.5 16a7.5 6.5 0 0 1 15 0z', SKY) + l('M9 10l1.4 6 M15 10l-1.4 6 M7.5 13.5h9', GRAY2, 1.2) + fc(20.5, 12.8, 2.1, GRAY) + dot(21.2, 12.4, .6) + f('M6.5 16v3h3v-3 M14.5 16v3h3v-3', GRAY) + l('M4.5 15.5l-2 1.2'),
    rabbit: f('M4 18a6 4 0 0 1 12 0z', WHITE) + fc(16.5, 11.5, 3.2, WHITE) + f('M15.2 9.4c-1.4-4-.6-6 .8-5.7s1 2.8.7 5.7z', WHITE) + f('M17.6 9.4c-.2-3.6 1-5.6 2.2-4.8s0 3.2-1 5.2z', WHITE) + dot(17.4, 11.2, .8) + fc(4.3, 16, 1.5, WHITE) + l('M8 18v2 M13 18v2'),
    robot: f('M5.5 7.5h13v11h-13z', GRAY) + l('M12 7.5V4.5') + fc(12, 3.8, 1, SKY) + f('M8 11h3v3H8z', SKY) + f('M13 11h3v3h-3z', SKY) + l('M9.5 16.5h5 M3.5 11.5v4 M20.5 11.5v4'),
    gradcap: f('M2.5 9L12 4.5 21.5 9 12 13.5z', SKY) + f('M6.5 11.5v4.5c3 2.5 8 2.5 11 0v-4.5', GRAY) + l('M21 9v6'),
    twopeople: fc(8, 8, 3, WHITE) + fc(16, 8, 3, WHITE) + f('M3 19.5c0-3.8 2.5-5.5 5-5.5s5 1.7 5 5.5z', SKY) + f('M11 19.5c0-3.8 2.5-5.5 5-5.5s5 1.7 5 5.5z', GRAY),
    rainbow: l('M3.5 18a8.5 8.5 0 0 1 17 0', SKY, 2.4) + l('M7 18a5 5 0 0 1 10 0', GRAY2, 2.4) + l('M10.2 18a1.8 1.8 0 0 1 3.6 0', YEL, 2.4) + fc(3.2, 18.6, 1.6, WHITE) + fc(20.8, 18.6, 1.6, WHITE),
    brick: f('M3.5 6.5h17v4h-17z', GRAY) + f('M3.5 10.5h17v4h-17z', SKY2) + f('M3.5 14.5h17v4h-17z', GRAY) + l('M9 6.5v4 M15 10.5v4 M9 14.5v4'),
    arrowr: f('M4 10h9V6l7.5 6-7.5 6v-4H4z', SKY),
    frog: f('M4 14a8 6 0 1 0 16 0 8 6 0 1 0-16 0z', SKY) + fc(7.8, 8.8, 3, WHITE) + fc(16.2, 8.8, 3, WHITE) + dot(8, 9, 1) + dot(16, 9, 1) + l('M7.5 15q4.5 4 9 0'),
    moon: f('M16.5 4.5A8.5 8.5 0 1 0 19.5 16 7 7 0 0 1 16.5 4.5z', YEL) + dot(10, 12, .8) + l('M9.5 15q1.4 1 2.8 0') + f('M19.5 5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z', SKY2),
    gamepad: f('M4 8.5h16a2.5 2.5 0 0 1 2.5 2.5v3.5a3 3 0 0 1-5.4 1.8L16 14.5H8l-1.1 1.8a3 3 0 0 1-5.4-1.8V11A2.5 2.5 0 0 1 4 8.5z', SKY2) + l('M7 10.6v3 M5.5 12.1h3') + dot(16, 11.3, 1) + dot(18.3, 13, 1),
    shield: f('M12 3.5l7.5 2.7v5.6c0 4.7-3.2 7.8-7.5 9.7-4.3-1.9-7.5-5-7.5-9.7V6.2z', SKY) + l('M8.5 12l2.5 2.5 4.5-5', INK, 1.9),
    bolt: f('M13.5 2.5L5.5 13.5H11l-1 8 8-11.5h-5.5z', YEL),
    question: fc(12, 12, 9, SKY2) + l('M9.2 9.4a2.9 2.9 0 1 1 4.6 2.3c-1.2.8-1.8 1.3-1.8 2.7', INK, 1.9) + dot(12, 17.4, 1.1),
    book: f('M12 6.5c-2-1.5-5-1.8-8.5-1v13c3.5-.8 6.5-.5 8.5 1 2-1.5 5-1.8 8.5-1v-13c-3.5-.8-6.5-.5-8.5 1z', WHITE) + l('M12 6.5v13') + l('M6 9c1.5-.2 3 0 4.5.5 M6 12c1.5-.2 3 0 4.5.5 M13.5 9.5c1.5-.5 3-.7 4.5-.5 M13.5 12.5c1.5-.5 3-.7 4.5-.5', GRAY2, 1.2),
    thinking: faceCircle(YEL).replace(smile(14.5), l('M10 15.5h4')) + l('M6.8 8.2l3-.9', INK, 1.4) + fc(17, 17.5, 2.4, YEL),
    balloon: f('M12 3c-3.6 0-6 2.8-6 6s2.4 6.5 6 7.5c3.6-1 6-4.3 6-7.5s-2.4-6-6-6z', SKY) + l('M11 17.5l1 1.5 1-1.5') + l('M12 19q-1.8 1.4 0 2.4', GRAY2) + l('M9 6.5q.8-1.2 2-1.4', WHITE, 1.4),
    peach: f('M12 7c-4.5-1.5-8 1.5-7.5 6 .5 4 4 7 7.5 7s7-3 7.5-7c.5-4.5-3-7.5-7.5-6z', SKY2) + l('M12 7q.2 5 0 13', GRAY2, 1.2) + f('M12 7q1.5-3 4-3-.5 2.5-4 3z', GRAY),
    thumbs: f('M3.5 11h4v9.5h-4z', SKY) + f('M7.5 11l3.5-7c1.6 0 2.4 1.6 1.9 3.2L12 10h6.6a2 2 0 0 1 2 2.4l-1.3 6a2 2 0 0 1-2 1.6H7.5z', WHITE),
    dotted: '<g stroke-dasharray="2.2 2">' + fc(12, 12, 8.5, WHITE) + '</g>' + eyes(11) + l('M10 15h4'),
    peek: fc(12, 12, 8.5, GRAY) + f('M5.5 10.2a3.2 2.4 0 1 0 6.4 0 3.2 2.4 0 1 0-6.4 0z', SKY) + f('M12.1 10.2a3.2 2.4 0 1 0 6.4 0 3.2 2.4 0 1 0-6.4 0z', SKY) + l('M10 16.5q2 1.3 4 0'),
    sliders: l('M4.5 6h15 M4.5 12h15 M4.5 18h15') + f('M6.5 4h3v4h-3z', SKY) + f('M14 10h3v4h-3z', SKY) + f('M9 16h3v4H9z', SKY),
    palette: f('M12 3.5c-5 0-9 3.8-9 8.5s4 8 8.5 8c2 0 2-1.8 1-2.8-1.1-1.2-.3-3 1.5-3H18c2 0 3.5-1.2 3.5-3.4C21.5 6.5 17.5 3.5 12 3.5z', WHITE) + dot(8, 9.5, 1.5, SKY) + dot(12, 7, 1.5, GRAY2) + dot(16, 9.5, 1.5, YEL) + dot(7.2, 14, 1.5, SKY2),
    numbers: f('M3.5 5h17v14h-17z', SKY2) + '<text x="12" y="15.4" text-anchor="middle" font-size="8.6" font-weight="800" fill="' + INK + '" stroke="none" font-family="\'Comic Sans MS\',\'Segoe Print\',ui-rounded,sans-serif">123</text>',
    abc: f('M3.5 5h17v14h-17z', SKY2) + '<text x="12" y="15.4" text-anchor="middle" font-size="8.6" font-weight="800" fill="' + INK + '" stroke="none" font-family="\'Comic Sans MS\',\'Segoe Print\',ui-rounded,sans-serif">abc</text>',
    bulb: f('M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.6h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z', YEL) + l('M9.8 19h4.4 M10.6 21h2.8') + l('M10.2 7q-1 1 -.8 2.6', WHITE, 1.4),
    idcard: f('M3.5 6h17v12h-17z', SKY2) + fc(8.5, 11, 2, WHITE) + l('M5.5 16c.5-2 5-2 6 0') + l('M13.5 10h5 M13.5 13.5h4', INK, 1.6),
    keyboard: f('M2.8 7h18.4a1 1 0 0 1 1 1v8.6a1 1 0 0 1-1 1H2.8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z', GRAY) + l('M5 10h.01 M8.5 10h.01 M12 10h.01 M15.5 10h.01 M19 10h.01 M5 13.2h.01 M8.5 13.2h.01 M12 13.2h.01 M15.5 13.2h.01 M19 13.2h.01', INK, 1.8) + l('M7.5 15.4h9', INK, 1.6),
    bow: f('M12 12C8 8 3.5 8 3.5 12s4.5 4 8.5 0z', SKY) + f('M12 12c4-4 8.5-4 8.5 0s-4.5 4-8.5 0z', SKY) + l('M11 13.6l-2 6 M13 13.6l2 6') + fc(12, 12, 2, SKY2)
  };

  var MAP = {
    '🔑': 'key', '✅': 'check', '✔': 'tick', '❌': 'cross', '🚫': 'ban', '🙅': 'ban', '⚠': 'warn', '⏳': 'hourglass', '➖': 'minus',
    '➕': 'plus', '✨': 'sparkle', '🎉': 'party', '📝': 'note', '🏷': 'tag', '🗄': 'cabinet', '🗃': 'filebox', '📋': 'clipboard',
    '📦': 'package', '☕': 'cup', '🎲': 'dice', '✍': 'pencil', '✏': 'pencil', '🧠': 'brain', '💻': 'laptop', '🧸': 'teddy',
    '🧑‍💻': 'devperson', '👩‍💻': 'devperson', '🧑‍💼': 'bizperson', '👩‍💼': 'bizperson', '🧬': 'dna',
    '🎫': 'ticket', '🎟': 'ticket', '🎯': 'target', '🧩': 'puzzle', '🏠': 'house', '📅': 'calendar', '💛': 'heart', '💙': 'heart',
    '💖': 'heart', '🏢': 'building', '🔁': 'replay', '🔄': 'replay', '↺': 'replay', '🧪': 'flask', '📬': 'envelope', '📨': 'envelope',
    '👀': 'eyes', '🧰': 'toolbox', '🏭': 'factory', '🔎': 'magnifier', '🔍': 'magnifier', '⚙': 'gear', '▶': 'play', '◀': 'prev',
    '⏸': 'pause', '⏪': 'rewind', '⏩': 'forward', '🐣': 'chick', '🐢': 'turtle', '🐇': 'rabbit', '🤖': 'robot', '🎓': 'gradcap',
    '👯': 'twopeople', '🌈': 'rainbow', '🧱': 'brick', '➡': 'arrowr', '🐸': 'frog', '🌙': 'moon', '🎮': 'gamepad', '🛡': 'shield',
    '⚡': 'bolt', '❓': 'question', '📖': 'book', '🤔': 'thinking', '🎈': 'balloon', '🍑': 'peach', '👍': 'thumbs', '🫥': 'dotted',
    '🙈': 'peek', '🆔': 'idcard', '⌨': 'keyboard', '🎚': 'sliders', '🎨': 'palette', '🔢': 'numbers', '🔤': 'abc', '💡': 'bulb', '🎀': 'bow'
  };

  PK.icon = function (name) {
    var inner = I[name] || I.sparkle;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<g filter="url(#sk-rough)">' + inner + '</g></svg>';
  };
  PK.iconNames = Object.keys(I);

  /* ---------- emoji → icon replacement ---------- */
  var EMOJI = /[0-9#*]️?⃣|(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2328}\u{23E9}-\u{23FF}\u{2B00}-\u{2BFF}\u{25B6}\u{25C0}\u{21BA}\u{2139}])️?(?:‍(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}])️?)*/gu;

  function iconEl(glyph) {
    var key = glyph.replace(/️/g, '');
    var name = key.slice(-1) === '⃣' ? 'numbers' : (MAP[key] || 'sparkle');
    var s = document.createElement('span');
    s.className = 'sk sk-' + name;
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', name);
    s.innerHTML = PK.icon(name);
    return s;
  }

  function fix(textNode) {
    var t = textNode.nodeValue;
    EMOJI.lastIndex = 0;
    if (!EMOJI.test(t)) return;
    EMOJI.lastIndex = 0;
    var frag = document.createDocumentFragment(), last = 0, m;
    while ((m = EMOJI.exec(t))) {
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      frag.appendChild(iconEl(m[0]));
      last = m.index + m[0].length;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    if (textNode.parentNode) textNode.parentNode.replaceChild(frag, textNode);
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { fix(root); return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA|TITLE|SVG)$/i.test(root.nodeName)) return;
    var nodes = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return /^(SCRIPT|STYLE|TEXTAREA|TITLE|text)$/i.test(p) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(fix);
  }
  PK.sketchify = walk;

  function start() {
    if (!document.getElementById('sk-defs')) {
      var d = document.createElement('div');
      d.id = 'sk-defs';
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      d.innerHTML = '<svg width="0" height="0"><defs><filter id="sk-rough" x="-12%" y="-12%" width="124%" height="124%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="7" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.25" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>';
      document.body.insertBefore(d, document.body.firstChild);
    }
    walk(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'characterData') fix(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
