/* =============================================
   MATRIKS ALJABAR LINEAR — script.js
   ============================================= */

// ==============================
// NAVIGASI TAB
// ==============================
document.getElementById('nav').addEventListener('click', function (e) {
  if (!e.target.matches('button')) return;
  document.querySelectorAll('nav button').forEach(function (b) { b.classList.remove('active'); });
  document.querySelectorAll('.section').forEach(function (s) { s.classList.remove('active'); });
  e.target.classList.add('active');
  document.getElementById(e.target.dataset.tab).classList.add('active');
});

// ==============================
// UTILS
// ==============================
function fmt(v) {
  var r = Math.round(v * 10000) / 10000;
  return isFinite(r) ? r : '∞';
}

function getMatrix(id, rows, cols) {
  var m = [];
  for (var i = 0; i < rows; i++) {
    var row = [];
    for (var j = 0; j < cols; j++) {
      var el = document.getElementById(id + '_' + i + '_' + j);
      row.push(el ? (parseFloat(el.value) || 0) : 0);
    }
    m.push(row);
  }
  return m;
}

function renderMatrixInput(id, rows, cols, label, color) {
  color = color || 'var(--accent)';
  var html = '<div class="matrix-block">';
  html += '<div class="matrix-label" style="color:' + color + '">' + label + '</div>';
  html += '<div class="matrix-bracket">[</div>';
  html += '<div class="matrix-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">';
  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++)
      html += '<input type="number" id="' + id + '_' + i + '_' + j + '" value="0" step="any">';
  html += '</div><div class="matrix-bracket">]</div></div>';
  return html;
}

function renderResultMatrix(m) {
  var rows = m.length, cols = m[0].length;
  var html = '<div class="result-inner">';
  html += '<div class="result-bracket">[</div>';
  html += '<div class="result-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">';
  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++)
      html += '<div class="result-cell">' + fmt(m[i][j]) + '</div>';
  html += '</div><div class="result-bracket">]</div></div>';
  return html;
}

function inlineMatrix(m) {
  var rows = m.length, cols = m[0].length;
  var html = '<span class="inline-mat">';
  html += '<span class="inline-bracket">[</span>';
  html += '<span class="inline-grid" style="grid-template-columns:repeat(' + cols + ',auto)">';
  for (var i = 0; i < rows; i++)
    for (var j = 0; j < cols; j++)
      html += '<span class="inline-cell">' + fmt(m[i][j]) + '</span>';
  html += '</span><span class="inline-bracket">]</span></span>';
  return html;
}

function fillRandom() {
  var ids = Array.prototype.slice.call(arguments);
  ids.forEach(function (id) {
    document.querySelectorAll('[id^="' + id + '_"]').forEach(function (inp) {
      inp.value = Math.floor(Math.random() * 19) - 9;
    });
  });
}

function stepsBox(stepsHTML) {
  return '<div class="steps-box"><div class="steps-title">// Langkah Penyelesaian</div>' + stepsHTML + '</div>';
}

function stepItem(num, title, content) {
  return '<div class="sol-step">' +
    '<div class="sol-step-header"><span class="sol-step-num">Langkah ' + num + '</span>' +
    '<span class="sol-step-title">' + title + '</span></div>' +
    '<div class="sol-step-content">' + content + '</div></div>';
}

// ==============================
// DETERMINAN (rekursif)
// ==============================
function det(m) {
  var n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  var d = 0;
  for (var j = 0; j < n; j++) {
    var minor = m.slice(1).map(function(row){ return row.filter(function(_,c){ return c !== j; }); });
    d += (j % 2 === 0 ? 1 : -1) * m[0][j] * det(minor);
  }
  return d;
}

// ==============================
// PENJUMLAHAN
// ==============================
function renderAddMatrices() {
  var n = parseInt(document.getElementById('addSize').value);
  document.getElementById('addMatrices').innerHTML =
    renderMatrixInput('addA', n, n, 'A', 'var(--accent)') +
    '<div class="op-symbol">+/−</div>' +
    renderMatrixInput('addB', n, n, 'B', 'var(--accent2)');
  document.getElementById('addResult').innerHTML = '';
}

function matrixAdd(sign) {
  var n = parseInt(document.getElementById('addSize').value);
  var A = getMatrix('addA', n, n);
  var B = getMatrix('addB', n, n);
  var C = A.map(function(row, i){ return row.map(function(v, j){ return v + sign * B[i][j]; }); });
  var op = sign === 1 ? '+' : '−';
  var label = sign === 1 ? 'A + B' : 'A − B';

  var s = '';
  s += stepItem(1, 'Periksa Ukuran Matriks',
    'Matriks A dan B sama-sama berukuran <span class="hl">' + n + '×' + n + '</span>. ' +
    'Operasi dapat dilakukan karena ukurannya sama.');

  s += stepItem(2, 'Rumus Elemen per Elemen',
    'C<sub>ij</sub> = A<sub>ij</sub> ' + op + ' B<sub>ij</sub>');

  var detail = '<div class="calc-grid" style="grid-template-columns:repeat(' + n + ',1fr)">';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      detail += '<div class="calc-cell">' +
        '<span style="color:var(--muted);font-size:0.68rem">c<sub>' + (i+1) + (j+1) + '</sub></span><br>' +
        '<span class="calc-eq">' + A[i][j] + ' ' + op + ' ' + B[i][j] + '</span><br>' +
        '<span class="calc-res">' + fmt(C[i][j]) + '</span></div>';
    }
  }
  detail += '</div>';
  s += stepItem(3, 'Hitung Setiap Elemen', detail);
  s += stepItem(4, 'Matriks Hasil ' + label, inlineMatrix(C));

  document.getElementById('addResult').innerHTML =
    '<div class="result-box"><div class="result-label">// ' + label + '</div>' +
    renderResultMatrix(C) + '</div>' + stepsBox(s);
}

// ==============================
// PERKALIAN
// ==============================
function renderMulMatrices() {
  var rA = parseInt(document.getElementById('mulRowA').value);
  var cA = parseInt(document.getElementById('mulColA').value);
  document.getElementById('mulRowB').value = cA;
  var cB = parseInt(document.getElementById('mulColB').value);
  document.getElementById('mulMatrices').innerHTML =
    renderMatrixInput('mulA', rA, cA, 'A', 'var(--accent)') +
    '<div class="op-symbol">×</div>' +
    renderMatrixInput('mulB', cA, cB, 'B', 'var(--accent2)');
  document.getElementById('mulResult').innerHTML = '';
}

function matrixMul() {
  var rA = parseInt(document.getElementById('mulRowA').value);
  var cA = parseInt(document.getElementById('mulColA').value);
  var cB = parseInt(document.getElementById('mulColB').value);
  var A = getMatrix('mulA', rA, cA);
  var B = getMatrix('mulB', cA, cB);

  var C = [];
  for (var i = 0; i < rA; i++) {
    var row = [];
    for (var j = 0; j < cB; j++) {
      var sum = 0;
      for (var k = 0; k < cA; k++) sum += A[i][k] * B[k][j];
      row.push(sum);
    }
    C.push(row);
  }

  var s = '';
  s += stepItem(1, 'Periksa Kesesuaian Dimensi',
    'A: <span class="hl">' + rA + '×' + cA + '</span> &nbsp;|&nbsp; B: <span class="hl">' + cA + '×' + cB + '</span><br>' +
    'Kolom A = Baris B = <span class="hl">' + cA + '</span> ✓ &nbsp;→&nbsp; Hasil: <span class="hl">' + rA + '×' + cB + '</span>');

  s += stepItem(2, 'Rumus',
    'C<sub>ij</sub> = Σ<sub>k=1..n</sub> A<sub>ik</sub> × B<sub>kj</sub>');

  var detail = '';
  for (var i = 0; i < rA; i++) {
    for (var j = 0; j < cB; j++) {
      var terms = [];
      for (var k = 0; k < cA; k++) terms.push(A[i][k] + '×' + B[k][j]);
      detail += '<div class="step-row">' +
        '<span class="hl">C<sub>' + (i+1) + (j+1) + '</sub></span> = ' +
        terms.join(' + ') + ' = <span class="hl-green">' + fmt(C[i][j]) + '</span></div>';
    }
  }
  s += stepItem(3, 'Hitung Setiap Elemen C<sub>ij</sub>', detail);
  s += stepItem(4, 'Matriks Hasil A × B', inlineMatrix(C));

  document.getElementById('mulResult').innerHTML =
    '<div class="result-box"><div class="result-label">// A × B</div>' +
    renderResultMatrix(C) + '</div>' + stepsBox(s);
}

// ==============================
// TRANSPOSE
// ==============================
function renderTransMatrix() {
  var n = parseInt(document.getElementById('transSize').value);
  document.getElementById('transMatrix').innerHTML =
    renderMatrixInput('transA', n, n, 'A', 'var(--accent)');
  document.getElementById('transResult').innerHTML = '';
}

function doTranspose() {
  var n = parseInt(document.getElementById('transSize').value);
  var A = getMatrix('transA', n, n);
  var T = A[0].map(function(_, j){ return A.map(function(row){ return row[j]; }); });

  var s = '';
  s += stepItem(1, 'Definisi Transpose',
    '(A<sup>T</sup>)<sub>ij</sub> = A<sub>ji</sub> — tukar posisi baris dan kolom.');

  s += stepItem(2, 'Matriks Awal A', inlineMatrix(A));

  var detail = '<div class="calc-grid" style="grid-template-columns:repeat(' + n + ',1fr)">';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      detail += '<div class="calc-cell">' +
        '<span style="color:var(--muted);font-size:0.68rem">T<sub>' + (i+1) + (j+1) + '</sub></span><br>' +
        '<span style="color:var(--muted);font-size:0.65rem">← A<sub>' + (j+1) + (i+1) + '</sub></span><br>' +
        '<span class="calc-res">' + fmt(T[i][j]) + '</span></div>';
    }
  }
  detail += '</div>';
  s += stepItem(3, 'Pemetaan Posisi Elemen', detail);
  s += stepItem(4, 'Matriks Hasil A<sup>T</sup>', inlineMatrix(T));

  document.getElementById('transResult').innerHTML =
    '<div class="result-box"><div class="result-label">// Aᵀ</div>' +
    renderResultMatrix(T) + '</div>' + stepsBox(s);
}

// ==============================
// DETERMINAN (UI)
// ==============================
function renderDetMatrix() {
  var n = parseInt(document.getElementById('detSize').value);
  document.getElementById('detMatrix').innerHTML =
    renderMatrixInput('detA', n, n, 'A', 'var(--accent)');
  document.getElementById('detResult').innerHTML = '';
}

function doDeterminant() {
  var n = parseInt(document.getElementById('detSize').value);
  var A = getMatrix('detA', n, n);
  var d = Math.round(det(A) * 10000) / 10000;
  var s = '';

  if (n === 2) {
    s += stepItem(1, 'Rumus Determinan 2×2',
      'det(A) = a<sub>11</sub>·a<sub>22</sub> − a<sub>12</sub>·a<sub>21</sub>');
    s += stepItem(2, 'Substitusi Nilai',
      'det(A) = (' + A[0][0] + ')·(' + A[1][1] + ') − (' + A[0][1] + ')·(' + A[1][0] + ')');
    var p1 = A[0][0] * A[1][1], p2 = A[0][1] * A[1][0];
    s += stepItem(3, 'Hitung',
      '<div class="step-row">= ' + fmt(p1) + ' − ' + fmt(p2) + ' = <span class="hl-green">' + d + '</span></div>');

  } else if (n === 3) {
    s += stepItem(1, 'Metode Ekspansi Kofaktor (Baris 1)',
      'det(A) = a<sub>11</sub>·C<sub>11</sub> + a<sub>12</sub>·C<sub>12</sub> + a<sub>13</sub>·C<sub>13</sub>');

    var cofactors = [];
    var minorDetail = '';
    for (var j = 0; j < 3; j++) {
      var minor = A.slice(1).map(function(row, ri, arr){ return row.filter(function(_,c){ return c !== j; }); });
      // closure workaround
      (function(jj) {
        var mn = A.slice(1).map(function(row){ return row.filter(function(_,c){ return c !== jj; }); });
        var mdet = det(mn);
        var sign = (jj % 2 === 0) ? 1 : -1;
        var cof = sign * mdet;
        cofactors.push(cof);
        var signStr = jj % 2 === 0 ? '+' : '−';
        minorDetail += '<div class="step-row">' +
          'M<sub>1' + (jj+1) + '</sub> = det' + inlineMatrix(mn) + ' = ' + fmt(mdet) +
          ' &nbsp;→&nbsp; C<sub>1' + (jj+1) + '</sub> = ' + signStr + '|' + fmt(Math.abs(mdet)) + '| = <span class="hl">' + fmt(cof) + '</span>' +
          '</div>';
      })(j);
    }
    s += stepItem(2, 'Hitung Minor & Kofaktor', minorDetail);

    var expanded = A[0].map(function(v, j){ return '(' + fmt(v) + '×' + fmt(cofactors[j]) + ')'; }).join(' + ');
    var terms = A[0].map(function(v, j){ return fmt(v * cofactors[j]); });
    s += stepItem(3, 'Ekspansi',
      '<div class="step-row">det(A) = ' + expanded + '</div>' +
      '<div class="step-row">= ' + terms.join(' + ') + ' = <span class="hl-green">' + d + '</span></div>');

  } else {
    // 4×4
    s += stepItem(1, 'Ekspansi Kofaktor 4×4 (Baris 1)',
      'det(A) = Σ<sub>j=1..4</sub> a<sub>1j</sub> · (−1)<sup>1+j</sup> · M<sub>1j</sub>');
    var termRows = '';
    for (var j = 0; j < 4; j++) {
      (function(jj){
        var mn = A.slice(1).map(function(row){ return row.filter(function(_,c){ return c !== jj; }); });
        var mdet = det(mn);
        var sign = (jj % 2 === 0) ? 1 : -1;
        var contrib = sign * A[0][jj] * mdet;
        var signStr = jj % 2 === 0 ? '+' : '−';
        termRows += '<div class="step-row">' +
          'a<sub>1' + (jj+1) + '</sub>·C<sub>1' + (jj+1) + '</sub> = ' + fmt(A[0][jj]) +
          ' × (' + signStr + fmt(Math.abs(mdet)) + ') = <span class="hl">' + fmt(contrib) + '</span></div>';
      })(j);
    }
    s += stepItem(2, 'Kontribusi Tiap Elemen Baris 1', termRows);
    s += stepItem(3, 'Jumlahkan Semua Kontribusi',
      '<div class="step-row">det(A) = <span class="hl-green">' + d + '</span></div>');
  }

  var lastStep = n === 4 ? 4 : 4;
  s += stepItem(lastStep, 'Kesimpulan',
    'det(A) = <span class="hl-green" style="font-size:1.1rem;font-weight:700">' + d + '</span><br>' +
    (d !== 0
      ? '<span style="color:var(--accent)">✓ Matriks invertibel (det ≠ 0) — invers ada</span>'
      : '<span style="color:var(--accent3)">✗ Matriks singular (det = 0) — invers tidak ada</span>'));

  document.getElementById('detResult').innerHTML =
    '<div class="result-box"><div class="result-label">// det(A)</div>' +
    '<div class="result-scalar">' + d + '</div>' +
    '<div class="result-note">' +
      (d !== 0 ? '✓ Matriks invertibel (det ≠ 0)' : '✗ Matriks singular (det = 0, tidak ada invers)') +
    '</div></div>' + stepsBox(s);
}

// ==============================
// INVERS
// ==============================
function renderInvMatrix() {
  var n = parseInt(document.getElementById('invSize').value);
  document.getElementById('invMatrix').innerHTML =
    renderMatrixInput('invA', n, n, 'A', 'var(--accent)');
  document.getElementById('invResult').innerHTML = '';
}

function cofactorMatrix(m) {
  var n = m.length;
  var C = [];
  for (var i = 0; i < n; i++) {
    var row = [];
    for (var j = 0; j < n; j++) {
      var minor = m.filter(function(_,r){ return r !== i; })
                   .map(function(r){ return r.filter(function(_,c){ return c !== j; }); });
      row.push(((i+j) % 2 === 0 ? 1 : -1) * det(minor));
    }
    C.push(row);
  }
  return C;
}

function adjoint(m) {
  var C = cofactorMatrix(m);
  return C[0].map(function(_,j){ return C.map(function(row){ return row[j]; }); });
}

function doInverse() {
  var n = parseInt(document.getElementById('invSize').value);
  var A = getMatrix('invA', n, n);
  var d = Math.round(det(A) * 10000) / 10000;

  if (d === 0) {
    document.getElementById('invResult').innerHTML =
      '<div class="error-msg">✗ Matriks singular: det(A) = 0, invers tidak ada.</div>';
    return;
  }

  var adj = adjoint(A);
  var inv = adj.map(function(row){ return row.map(function(v){ return v / d; }); });

  var s = '';
  s += stepItem(1, 'Hitung Determinan',
    'det(A) = <span class="hl-green">' + d + '</span> ≠ 0 → invers ada ✓');

  if (n === 2) {
    s += stepItem(2, 'Rumus Invers 2×2',
      'A⁻¹ = (1/det) × ' +
      inlineMatrix([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]]) +
      '<br><small style="color:var(--muted)">Tukar diagonal utama, negasikan anti-diagonal</small>');
    s += stepItem(3, 'Hitung A⁻¹ = (1/' + d + ') × adj(A)',
      inlineMatrix(inv));
  } else {
    var cofMat = cofactorMatrix(A);
    var cofDetail = '<div class="calc-grid" style="grid-template-columns:repeat(3,1fr)">';
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++) {
        var sn = (i+j)%2===0 ? '+' : '−';
        cofDetail += '<div class="calc-cell">' +
          '<span style="color:var(--muted);font-size:0.68rem">C<sub>' + (i+1) + (j+1) + '</sub></span><br>' +
          '<span style="color:var(--muted);font-size:0.65rem">' + sn + 'M<sub>' + (i+1) + (j+1) + '</sub></span><br>' +
          '<span class="calc-res">' + fmt(cofMat[i][j]) + '</span></div>';
      }
    cofDetail += '</div>';
    s += stepItem(2, 'Hitung Matriks Kofaktor C', cofDetail);
    s += stepItem(3, 'Transpose Kofaktor → adj(A)', inlineMatrix(adj));
    s += stepItem(4, 'A⁻¹ = (1/' + d + ') × adj(A)', inlineMatrix(inv));
  }

  var vStep = n === 2 ? 4 : 5;
  var check = [];
  for (var i = 0; i < n; i++){
    var row = [];
    for (var j2 = 0; j2 < n; j2++){
      var s2 = 0;
      for (var k = 0; k < n; k++) s2 += A[i][k] * inv[k][j2];
      row.push(Math.round(s2 * 100) / 100);
    }
    check.push(row);
  }
  s += stepItem(vStep, 'Verifikasi: A × A⁻¹ = I',
    'A × A⁻¹ = ' + inlineMatrix(check) + ' ≈ I ✓');

  document.getElementById('invResult').innerHTML =
    '<div class="result-box"><div class="result-label">// A⁻¹</div>' +
    renderResultMatrix(inv) + '</div>' + stepsBox(s);
}

// ==============================
// INISIALISASI
// ==============================
document.addEventListener('DOMContentLoaded', function () {
  renderAddMatrices();
  renderMulMatrices();
  renderTransMatrix();
  renderDetMatrix();
  renderInvMatrix();
  document.getElementById('mulRowA').addEventListener('change', renderMulMatrices);
});

// ==============================
// GAUSS / GAUSS-JORDAN
// ==============================

var GAUSS_N = 3;
var VARS = ['x₁','x₂','x₃','x₄'];
var VARNAMES = ['x1','x2','x3','x4'];

function renderGaussMatrix() {
  GAUSS_N = parseInt(document.getElementById('gaussSize').value);
  var n = GAUSS_N;

  // label row: x1..xn | b
  var labelRow = document.getElementById('gaussVarLabels');
  var labHtml = '';
  for (var j = 0; j < n; j++) labHtml += '<span class="aug-var-label">x' + (j+1) + '</span>';
  labHtml += '<span class="aug-var-label b-label">b</span>';
  labelRow.innerHTML = labHtml;

  // input rows
  var area = document.getElementById('gaussInputArea');
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<div class="aug-row">';
    html += '<span class="aug-row-label">b' + (i+1) + '</span>';
    for (var j = 0; j < n; j++) {
      html += '<input type="number" id="g_' + i + '_' + j + '" value="0" step="any">';
    }
    html += '<div class="aug-separator"></div>';
    html += '<input type="number" id="g_' + i + '_b" value="0" step="any" class="b-input">';
    html += '</div>';
  }
  area.innerHTML = html;
  document.getElementById('gaussResult').innerHTML = '';
}

function fillGaussRandom() {
  var n = GAUSS_N;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      document.getElementById('g_' + i + '_' + j).value = Math.floor(Math.random()*13)-3;
    }
    document.getElementById('g_' + i + '_b').value = Math.floor(Math.random()*20)+5;
  }
}

function resetGauss() {
  var n = GAUSS_N;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) document.getElementById('g_'+i+'_'+j).value = 0;
    document.getElementById('g_'+i+'_b').value = 0;
  }
  document.getElementById('gaussResult').innerHTML = '';
}

function getAugmented() {
  var n = GAUSS_N;
  var M = [];
  for (var i = 0; i < n; i++) {
    var row = [];
    for (var j = 0; j < n; j++) row.push(parseFloat(document.getElementById('g_'+i+'_'+j).value)||0);
    row.push(parseFloat(document.getElementById('g_'+i+'_b').value)||0);
    M.push(row);
  }
  return M;
}

function cloneMatrix(M) {
  return M.map(function(row){ return row.slice(); });
}

function fmtG(v) {
  var r = Math.round(v * 100000) / 100000;
  if (Math.abs(r) < 1e-9) return '0';
  // show as fraction-like decimal, max 5 decimal places
  var s = parseFloat(r.toFixed(5)).toString();
  return s;
}

// Render augmented matrix as HTML table, with highlight info
// pivotRow, pivotCol: highlight pivot cell
// changedRows: array of row indices that changed
// changedCols: array of col indices changed (null = all)
function renderAugTable(M, pivotRow, pivotCol, changedRows) {
  var n = M.length;
  var cols = M[0].length; // n+1
  var html = '<table class="aug-table"><tbody>';
  for (var i = 0; i < n; i++) {
    html += '<tr>';
    html += '<td class="row-lbl">b' + (i+1) + '</td>';
    for (var j = 0; j < cols; j++) {
      if (j === n) {
        // separator before b column
        html += '<td class="sep-cell"></td>';
        var cls = 'mat-cell b-cell';
        if (changedRows && changedRows.indexOf(i) !== -1) cls += ' changed';
        html += '<td class="' + cls + '">' + fmtG(M[i][j]) + '</td>';
      } else {
        var cls = 'mat-cell';
        if (i === pivotRow && j === pivotCol) cls += ' pivot';
        else if (changedRows && changedRows.indexOf(i) !== -1) cls += ' changed';
        if (Math.abs(M[i][j]) < 1e-9) cls += ' zero';
        html += '<td class="' + cls + '">' + fmtG(M[i][j]) + '</td>';
      }
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function gaussBlock(stepNum, opText, M, pivotRow, pivotCol, changedRows) {
  return '<div class="gauss-step-block">' +
    '<div class="gauss-step-header">' +
      '<span class="gauss-step-badge">Step ' + stepNum + '</span>' +
      '<span class="gauss-op-text">' + opText + '</span>' +
    '</div>' +
    '<div class="gauss-step-body">' +
      renderAugTable(M, pivotRow, pivotCol, changedRows) +
    '</div>' +
  '</div>';
}

function doGauss() {
  var n = GAUSS_N;
  var method = document.getElementById('gaussMethod').value;
  var M = getAugmented();
  var steps = '';
  var stepNum = 0;

  // Step 0: matriks awal
  stepNum++;
  steps += gaussBlock(stepNum, 'Matriks Awal [A|b]', M, -1, -1, []);

  // ---- FORWARD ELIMINATION ----
  for (var col = 0; col < n; col++) {
    // Cari pivot (partial pivoting)
    var maxRow = col;
    for (var r = col+1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }

    // Swap jika perlu
    if (maxRow !== col) {
      var tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp;
      stepNum++;
      steps += gaussBlock(stepNum, 'Tukar baris b' + (col+1) + ' ↔ b' + (maxRow+1), cloneMatrix(M), col, col, [col, maxRow]);
    }

    // Cek pivot nol
    if (Math.abs(M[col][col]) < 1e-10) continue;

    // Normalisasi baris pivot (untuk Gauss-Jordan)
    if (method === 'jordan') {
      var piv = M[col][col];
      if (Math.abs(piv - 1) > 1e-9) {
        var v = fmtG(piv);
        for (var j = col; j <= n; j++) M[col][j] /= piv;
        stepNum++;
        steps += gaussBlock(stepNum,
          'v = ' + v + ' &nbsp;|&nbsp; b' + (col+1) + ' = b' + (col+1) + ' / v',
          cloneMatrix(M), col, col, [col]);
      }
    }

    // Eliminasi ke bawah
    for (var row = col+1; row < n; row++) {
      if (Math.abs(M[row][col]) < 1e-10) continue;
      var factor = M[row][col] / M[col][col];
      var factorStr = fmtG(factor);
      for (var j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
      stepNum++;
      steps += gaussBlock(stepNum,
        'p = ' + factorStr + ' &nbsp;|&nbsp; b' + (row+1) + ' = b' + (row+1) + ' − p × b' + (col+1),
        cloneMatrix(M), col, col, [row]);
    }

    // Untuk Gauss-Jordan: juga eliminasi ke atas
    if (method === 'jordan') {
      for (var row = col-1; row >= 0; row--) {
        if (Math.abs(M[row][col]) < 1e-10) continue;
        var factor = M[row][col] / M[col][col];
        var factorStr = fmtG(factor);
        for (var j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
        stepNum++;
        steps += gaussBlock(stepNum,
          'p = ' + factorStr + ' &nbsp;|&nbsp; b' + (row+1) + ' = b' + (row+1) + ' − p × b' + (col+1),
          cloneMatrix(M), col, col, [row]);
      }
    }
  }

  // ---- BACK SUBSTITUTION (Gauss saja) ----
  var solution = new Array(n).fill(null);

  if (method === 'gauss') {
    // Normalisasi diagonal & back-sub
    for (var i = n-1; i >= 0; i--) {
      if (Math.abs(M[i][i]) < 1e-10) continue;
      var v = M[i][n];
      for (var j = i+1; j < n; j++) v -= M[i][j] * solution[j];
      solution[i] = v / M[i][i];
    }
  } else {
    // Jordan: normalisasi diagonal → baca solusi langsung
    for (var i = 0; i < n; i++) {
      if (Math.abs(M[i][i]) > 1e-10) {
        // normalisasi jika belum
        var piv = M[i][i];
        if (Math.abs(piv - 1) > 1e-9) {
          for (var j = i; j <= n; j++) M[i][j] /= piv;
        }
        solution[i] = M[i][n];
      }
    }
    // Tampilkan matriks RREF final
    stepNum++;
    steps += gaussBlock(stepNum, 'Matriks RREF [I|x]', cloneMatrix(M), -1, -1, []);
  }

  // ---- OUTPUT ----
  var solHtml = '<div class="gauss-solution"><div class="sol-title">// Solusi x</div>';
  var valid = true;
  for (var i = 0; i < n; i++) {
    if (solution[i] === null) { valid = false; break; }
    var val = Math.round(solution[i] * 100000) / 100000;
    solHtml += '<div class="gauss-sol-row">' +
      '<span class="gauss-sol-var">x' + (i+1) + '</span>' +
      '<span style="color:var(--muted)">=</span>' +
      '<span class="gauss-sol-val">' + val + '</span>' +
      '</div>';
  }
  if (!valid) {
    solHtml += '<div style="color:var(--accent3);margin-top:0.5rem">⚠ Sistem tidak memiliki solusi unik (matriks singular)</div>';
  }
  solHtml += '</div>';

  document.getElementById('gaussResult').innerHTML =
    '<div class="steps-box" style="border-left-color:var(--accent)">' +
      '<div class="steps-title" style="color:var(--accent)">// Langkah Eliminasi ' + (method === 'jordan' ? 'Gauss-Jordan' : 'Gauss') + '</div>' +
      '<div style="padding:1rem 1.5rem">' + steps + '</div>' +
    '</div>' + solHtml;
}

// Init Gauss on load
document.addEventListener('DOMContentLoaded', function() {
  renderGaussMatrix();
  document.getElementById('gaussSize').addEventListener('change', renderGaussMatrix);
});