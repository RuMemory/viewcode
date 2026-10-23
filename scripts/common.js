/* ============================================================
   viewcode — common.js
   Общее для всех страниц: RU/EN-переключатель, лайки
   (toggle + pop), demo-bar состояний мокапа.
   Инициализирует только то, что реально есть на странице
   (все элементы проверяются на null).
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Язык (визуальный переключатель мокапа) ---------- */
  var langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var isRu = langBtn.dataset.lang !== 'en';
      langBtn.dataset.lang = isRu ? 'en' : 'ru';
      langBtn.innerHTML = isRu ? 'RU / <b>EN</b>' : '<b>RU</b> / EN';
    });
  }

  /* ---------- Лайки карточек и hero проекта (toggle + pop) ---------- */
  document.querySelectorAll('.like-btn[data-likes]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var countEl = btn.querySelector('.like-count');
      var n = parseInt(btn.dataset.likes, 10);
      var liked = btn.classList.toggle('liked');
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      if (countEl) countEl.textContent = liked ? n + 1 : n;
      if (!reduceMotion) {
        btn.classList.remove('pop');
        void btn.offsetWidth; /* reflow: перезапуск анимации */
        btn.classList.add('pop');
      }
    });
  });

  /* ---------- Demo-bar: переключатель состояний мокапа ---------- */
  var demoBar = document.querySelector('.demo-bar');
  if (demoBar) {
    var demoBtns = Array.prototype.slice.call(demoBar.querySelectorAll('button'));
    demoBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        demoBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        document.body.className = 'state-' + btn.dataset.state;
        /* страничная логика (напр. сброс формы) подписывается на это событие */
        document.dispatchEvent(new CustomEvent('demo:state', { detail: { state: btn.dataset.state } }));
      });
    });
  }
})();
