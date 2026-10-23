/* ============================================================
   viewcode — kategoriya.js
   Только страница категории: фильтр по тегам (обе сетки),
   табы сортировки, «показать ещё».
   Язык, лайки — в common.js.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Сетки ---------- */
  var top5Grid = document.getElementById('top5Grid');
  var grid = document.getElementById('cardGrid');
  var top5Cards = Array.prototype.slice.call(top5Grid.querySelectorAll('.card'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var top5Empty = document.getElementById('top5Empty');
  var gridEmpty = document.getElementById('gridEmpty');
  var gridCount = document.getElementById('gridCount');

  var activeTag = 'all';

  function matchesTag(card) {
    if (activeTag === 'all') return true;
    var tags = (card.dataset.tags || '').split(/\s+/);
    return tags.indexOf(activeTag) !== -1;
  }

  function applyFilter() {
    var topShown = 0;
    top5Cards.forEach(function (card) {
      var show = matchesTag(card);
      card.classList.toggle('hidden', !show);
      if (show) topShown++;
    });
    top5Empty.classList.toggle('show', topShown === 0);

    var shown = 0;
    cards.forEach(function (card) {
      /* extra-карточки без revealed всегда скрыты независимо от фильтра */
      var show = matchesTag(card) && !card.classList.contains('extra');
      card.classList.toggle('hidden', !show);
      if (show) shown++;
    });
    gridEmpty.classList.toggle('show', shown === 0);
    gridCount.textContent = shown + ' из 36';
  }

  /* ---------- Пилюли тегов: фильтруют обе сетки ---------- */
  var pills = Array.prototype.slice.call(document.querySelectorAll('#tagsBar .pill'));
  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.setAttribute('aria-pressed', p === pill ? 'true' : 'false'); });
      activeTag = pill.dataset.tag;
      applyFilter();
    });
  });

  /* ---------- Табы сортировки основной сетки ---------- */
  var sortTabs = Array.prototype.slice.call(document.querySelectorAll('#sortTabs .pill'));
  var sortMeta = document.getElementById('sortMeta');
  var sortLabels = { score: 'сортировка: популярные', date: 'сортировка: сначала новые', stars: 'сортировка: по звёздам' };

  function sortGrid(key) {
    var sorted = cards.slice().sort(function (a, b) {
      return parseFloat(b.dataset[key]) - parseFloat(a.dataset[key]); /* даты ISO сравниваются как числа после замены */
    });
    if (key === 'date') {
      sorted = cards.slice().sort(function (a, b) {
        return b.dataset.date < a.dataset.date ? -1 : (b.dataset.date > a.dataset.date ? 1 : 0);
      });
    }
    sorted.forEach(function (card) { grid.appendChild(card); });
  }

  sortTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      sortTabs.forEach(function (t) { t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'); });
      sortGrid(tab.dataset.sort);
      sortMeta.textContent = sortLabels[tab.dataset.sort];
      applyFilter(); /* порядок сохраняется, видимость пересчитывается под активный тег */
    });
  });

  /* ---------- Показать ещё ---------- */
  var showMore = document.getElementById('showMore');
  var moreDone = document.getElementById('moreDone');
  showMore.addEventListener('click', function () {
    cards.forEach(function (card) {
      if (card.classList.contains('extra')) {
        card.classList.remove('extra');
        card.classList.add('revealed');
      }
    });
    showMore.parentNode.style.display = 'none';
    moreDone.classList.add('show');
    applyFilter();
  });

  applyFilter();
})();
