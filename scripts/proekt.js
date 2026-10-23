/* ============================================================
   viewcode — proekt.js
   Только страница проекта: лайки комментариев, модалка дизлайка
   (фокус-трап, обязательная причина), копирование ссылки.
   Язык, лайк проекта, demo-bar — в common.js.
   ============================================================ */
(function () {
  'use strict';

  var lastFocus = null;

  /* ---------- Лайки комментариев ---------- */
  document.querySelectorAll('.c-like').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('liked');
      btn.setAttribute('aria-pressed', btn.classList.contains('liked') ? 'true' : 'false');
    });
  });

  /* ---------- Дизлайк: модалка с обязательной причиной ---------- */
  var modal = document.getElementById('dislikeModal');
  var dislikeBtn = document.getElementById('dislikeBtn');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.reason-chip'));
  var reasonText = document.getElementById('dislikeText');
  var error = document.getElementById('dislikeError');

  function openModal() {
    lastFocus = document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; /* scroll-lock фона под модалкой */
    chips[0].focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    error.classList.remove('show');
    if (lastFocus) lastFocus.focus();
  }
  dislikeBtn.addEventListener('click', openModal);
  document.getElementById('dislikeCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!modal.classList.contains('open')) return;
      closeModal();
      return;
    }
    /* focus-trap: Tab/Shift+Tab крутятся внутри модалки */
    if (e.key === 'Tab' && modal.classList.contains('open')) {
      var focusables = modal.querySelectorAll('button, textarea, [href], [tabindex]');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      error.classList.remove('show');
    });
  });
  reasonText.addEventListener('input', function () { error.classList.remove('show'); });

  document.getElementById('dislikeSubmit').addEventListener('click', function () {
    var hasChip = chips.some(function (c) { return c.getAttribute('aria-pressed') === 'true'; });
    var hasText = reasonText.value.trim().length > 0;
    if (!hasChip && !hasText) {
      error.classList.add('show');
      return;
    }
    /* мокап: подтверждаем и закрываем */
    dislikeBtn.style.color = 'var(--text)';
    dislikeBtn.style.borderColor = 'var(--border-strong)';
    closeModal();
  });

  /* ---------- Копировать ссылку ---------- */
  var copyBtn = document.getElementById('copyLink');
  var copyLabel = document.getElementById('copyLabel');
  copyBtn.addEventListener('click', function () {
    var url = location.href;
    function done() {
      copyBtn.classList.add('copied');
      copyLabel.textContent = 'скопировано ✓';
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        copyLabel.textContent = 'ссылка';
      }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else { done(); }
  });
})();
