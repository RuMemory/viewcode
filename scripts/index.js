/* ============================================================
   viewcode — index.js
   Только главная: одометр статистики, стаггер карточек,
   фильтр категорий + живой поиск, Ctrl+K, подписка на дайджест.
   Язык, лайки — в common.js.
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Одометр статистики ---------- */
  function cubicEase(t) { /* приближение cubic-bezier(0.4,0,0.2,1) */
    return t < 0.5 ? 4 * t * t * t * 1.02 : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  var counters = document.querySelectorAll('[data-count]');
  counters.forEach(function (el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 700;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(cubicEase(p) * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* ---------- Стаггер карточек по колонкам (blur → sharp) ---------- */
  var grid = document.getElementById('cardGrid');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));

  function columnCount() {
    var cols = window.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    return Math.max(cols, 1);
  }
  function revealVisible() {
    var visible = cards.filter(function (c) { return !c.classList.contains('hidden'); });
    var cols = columnCount();
    visible.forEach(function (card, i) {
      card.classList.remove('reveal');
      var col = i % cols, row = Math.floor(i / cols);
      card.style.animationDelay = reduceMotion ? '0ms' : (col * 100 + row * 40) + 'ms';
    });
    void grid.offsetWidth; /* reflow: перезапуск анимации */
    visible.forEach(function (card) { card.classList.add('reveal'); });
  }
  revealVisible();

  /* ---------- Фильтрация: пилюли категорий + живой поиск ---------- */
  var pills = document.querySelectorAll('#catsBar .pill');
  var emptyNote = document.getElementById('emptyNote');
  var searchInput = document.getElementById('searchInput');
  var activeFilter = 'all';

  /* единая точка фильтрации: категория AND текстовый запрос */
  function applyFilters() {
    var q = searchInput.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var inCat = activeFilter === 'all' || card.dataset.cat === activeFilter;
      var haystack = (card.querySelector('.card-name').textContent + ' ' +
                      card.querySelector('.card-desc').textContent).toLowerCase();
      var inQuery = !q || haystack.indexOf(q) !== -1;
      var show = inCat && inQuery;
      card.classList.toggle('hidden', !show);
      if (show) shown++;
    });
    emptyNote.textContent = q
      ? '// ничего не нашлось — попробуйте другой запрос'
      : '// в этой категории сегодня тихо — загляните завтра';
    emptyNote.classList.toggle('show', shown === 0);
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.setAttribute('aria-pressed', p === pill ? 'true' : 'false'); });
      activeFilter = pill.dataset.filter;
      applyFilters();
      revealVisible();
    });
  });

  /* живой поиск по мере ввода; без revealVisible — стаггер на каждый keystroke был бы мерцанием */
  searchInput.addEventListener('input', applyFilters);

  /* Ctrl/Cmd+K — фокус в поиск (как в GitHub/Vercel); e.code, чтобы работало и на русской раскладке */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  /* ---------- Подписка ---------- */
  var form = document.getElementById('digestForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.style.display = 'none';
    document.getElementById('digestDone').classList.add('show');
  });

  /* ---------- Пересчёт стаггера при смене числа колонок ---------- */
  var lastCols = columnCount();
  window.addEventListener('resize', function () {
    var c = columnCount();
    if (c !== lastCols) { lastCols = c; revealVisible(); }
  });
})();
