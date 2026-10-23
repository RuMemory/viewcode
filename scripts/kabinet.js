/* ============================================================
   viewcode — kabinet.js
   Кабинет рекламодателя: вкладки (стрелки), форма новой
   кампании (лидер, итог, запуск), алерт «повысить ставку»,
   пополнение баланса, demo-состояния до/после порога.
   Язык, лайки и сам demo-bar — в common.js («demo:state»).
   IIFE, все элементы проверяются на null.
   Валюта — доллары (решение владельца 2026-10-22).
   ============================================================ */
(function () {
  'use strict';

  var live = document.getElementById('live');
  function say(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  }
  function fmt(n) { return '$' + n.toFixed(2); }

  /* ================= ВКЛАДКИ ================= */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (moveFocus) tab.focus();
  }
  if (tabs.length) {
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = -1;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next >= 0) { e.preventDefault(); selectTab(tabs[next], true); }
      });
    });
  }

  /* ================= ФОРМА НОВОЙ КАМПАНИИ ================= */
  var SLOTS = {
    attention: { min: 1.50, leader: 1.90, label: 'Обратите внимание — главная' },
    best:      { min: 0.50, leader: 1.50, label: 'Лучшее предложение — категория' }
  };
  var newCampBtn = document.getElementById('newCampBtn');
  var campForm = document.getElementById('campForm');
  var campBid = document.getElementById('campBid');
  var campDays = document.getElementById('campDays');
  var campProject = document.getElementById('campProject');
  var leaderVal = document.getElementById('leaderVal');
  var leaderState = document.getElementById('leaderState');
  var totalLine = document.getElementById('totalLine');
  var campsTable = document.getElementById('campsTable');
  var alertBox = document.getElementById('outbidAlert');

  function currentSlot() {
    var r = campForm && campForm.querySelector('input[name="slot"]:checked');
    return SLOTS[r ? r.value : 'attention'];
  }
  function updateCalc() {
    if (!campForm || !campBid || !campDays || !leaderVal || !leaderState || !totalLine) return;
    var slot = currentSlot();
    var bid = parseFloat(campBid.value) || 0;
    var days = parseInt(campDays.value, 10) || 0;
    leaderVal.textContent = fmt(slot.leader);
    if (bid > slot.leader) {
      leaderState.textContent = 'вы лидируете ✓';
      leaderState.className = 'ok';
    } else {
      leaderState.textContent = 'вас обгонят';
      leaderState.className = 'bad';
    }
    totalLine.innerHTML = 'Итого: ' + fmt(bid) + ' × ' + days + ' дней = <b>' + fmt(bid * days) + '</b>';
  }
  if (campForm) {
    campForm.querySelectorAll('input[name="slot"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var slot = currentSlot();
        if (campBid) { campBid.min = slot.min; campBid.value = (slot.leader + 0.10).toFixed(2); }
        updateCalc();
      });
    });
    if (campBid) campBid.addEventListener('input', updateCalc);
    if (campDays) campDays.addEventListener('input', updateCalc);

    campForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var slot = currentSlot();
      var bid = parseFloat(campBid && campBid.value) || 0;
      var days = parseInt(campDays && campDays.value, 10) || 0;
      var project = campProject ? campProject.value : 'MaxGraph';
      if (bid < slot.min || days < 1) {
        say('Проверьте ставку и срок: ставка от ' + fmt(slot.min) + '/день, срок от 1 дня');
        return;
      }
      var until = new Date();
      until.setDate(until.getDate() + days);
      var dd = ('0' + until.getDate()).slice(-2) + '.' + ('0' + (until.getMonth() + 1)).slice(-2);
      if (campsTable) {
        var tr = document.createElement('tr');
        tr.className = 'row-new';
        tr.innerHTML =
          '<td></td><td></td>' +
          '<td class="num">' + fmt(bid) + '/день</td>' +
          '<td class="st-lead">● лидируете</td>' +
          '<td class="num">0</td><td class="num">0</td><td class="num">—</td>' +
          '<td class="num">до ' + dd + '</td>';
        tr.children[0].textContent = project;
        tr.children[1].textContent = slot.label;
        campsTable.querySelector('tbody').appendChild(tr);
      }
      campForm.hidden = true;
      if (newCampBtn) newCampBtn.setAttribute('aria-expanded', 'false');
      if (alertBox) alertBox.classList.add('hidden');
      say('Кампания запущена: ' + project + ', слот «' + slot.label + '», ставка ' + fmt(bid) + '/день на ' + days + ' дней');
    });
  }
  if (newCampBtn && campForm) {
    newCampBtn.addEventListener('click', function () {
      var open = campForm.hidden;
      campForm.hidden = !open;
      newCampBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { updateCalc(); var f = document.getElementById('campProject'); if (f) f.focus(); }
    });
  }

  /* ================= АЛЕРТ «ПОВЫСИТЬ ДО $1.60» ================= */
  var raiseBtn = document.getElementById('raiseBtn');
  if (raiseBtn) {
    raiseBtn.addEventListener('click', function () {
      var row = document.getElementById('camp-2');
      if (row) {
        var bidCell = row.querySelector('[data-cell="bid"]');
        var stCell = row.querySelector('[data-cell="status"]');
        if (bidCell) bidCell.textContent = '$1.60/день';
        if (stCell) { stCell.textContent = '● лидируете'; stCell.className = 'st-lead'; }
      }
      if (alertBox) alertBox.classList.add('hidden');
      say('Ставка повышена до $1.60/день — вы снова лидируете в слоте «Лучшее предложение — Инструменты кода»');
    });
  }

  /* ================= ПОПОЛНЕНИЕ ================= */
  var balanceVal = document.getElementById('balanceVal');
  var topupBtn = document.getElementById('topupBtn');
  var topupLabel = document.getElementById('topupLabel');
  var customAmount = document.getElementById('customAmount');
  var historyTable = document.getElementById('historyTable');
  var amountPills = Array.prototype.slice.call(document.querySelectorAll('.topup-row .pill'));
  var balance = 15.00;

  if (amountPills.length) {
    amountPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        amountPills.forEach(function (p) { p.setAttribute('aria-pressed', p === pill ? 'true' : 'false'); });
        if (customAmount) customAmount.value = '';
      });
    });
  }
  if (customAmount) {
    customAmount.addEventListener('input', function () {
      if (customAmount.value) amountPills.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
    });
  }
  if (topupBtn && balanceVal) {
    topupBtn.addEventListener('click', function () {
      var amount = 0;
      if (customAmount && customAmount.value) {
        amount = parseFloat(customAmount.value) || 0;
      } else {
        var pressed = document.querySelector('.topup-row .pill[aria-pressed="true"]');
        if (pressed) amount = parseFloat(pressed.dataset.amount) || 0;
      }
      if (amount < 5) { say('Минимальная сумма пополнения — $5.00'); return; }

      topupBtn.disabled = true;
      var spinner = topupBtn.querySelector('.spinner');
      if (spinner) spinner.hidden = false;
      if (topupLabel) topupLabel.textContent = 'Зачисляем…';

      setTimeout(function () {
        balance += amount;
        balanceVal.textContent = fmt(balance);
        if (historyTable) {
          var today = new Date();
          var ds = ('0' + today.getDate()).slice(-2) + '.' + ('0' + (today.getMonth() + 1)).slice(-2) + '.' + today.getFullYear();
          var tr = document.createElement('tr');
          tr.className = 'row-new';
          tr.innerHTML =
            '<td class="num">' + ds + '</td>' +
            '<td class="num">+' + fmt(amount) + '</td>' +
            '<td>карта •• 4321</td>' +
            '<td class="st-lead">✓ зачислено</td>';
          var tbody = historyTable.querySelector('tbody');
          if (tbody) tbody.insertBefore(tr, tbody.firstChild);
        }
        topupBtn.disabled = false;
        if (spinner) spinner.hidden = true;
        if (topupLabel) topupLabel.textContent = 'Пополнить через ЮKassу';
        say('Баланс пополнен на ' + fmt(amount) + ' — теперь ' + fmt(balance));
      }, 800);
    });
  }

  /* ================= DEMO-СОСТОЯНИЯ (до/после порога) ================= */
  document.addEventListener('demo:state', function (e) {
    if (!e.detail) return;
    say(e.detail.state === 'pre'
      ? 'Режим «до порога монетизации»: все цены и платежи — демо, списаний нет'
      : 'Режим «после порога монетизации»: обычный вид кабинета');
  });
})();
