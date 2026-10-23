/* ============================================================
   viewcode — forma.js
   Только форма подачи: тип проекта, импорт → превью → бейдж →
   публикация, копирование бейджа, сброс по demo-bar.
   Язык и сам demo-bar — в common.js (форма слушает «demo:state»).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Состояния мокапа: common.js переключает body.state-*, форма сбрасывается ---------- */
  document.addEventListener('demo:state', resetForm);

  /* ---------- Шаг 1: переключатель типа ---------- */
  var typeRepo = document.getElementById('typeRepo');
  var typeSite = document.getElementById('typeSite');
  var urlInput = document.getElementById('urlInput');
  var urlHint = document.getElementById('urlHint');
  var siteExtra = document.getElementById('siteExtra');

  function setType(isSite) {
    typeRepo.setAttribute('aria-pressed', isSite ? 'false' : 'true');
    typeSite.setAttribute('aria-pressed', isSite ? 'true' : 'false');
    urlInput.placeholder = isSite ? 'https://…' : 'github.com/you/project';
    urlHint.textContent = isSite
      ? '// сайт без репозитория: нужен скриншот и подтверждение домена'
      : '// вставь ссылку — название, описание, тема и теги подтянутся сами';
    siteExtra.classList.toggle('show', isSite);
    step2Meta.textContent = isSite ? '// импортировано с сайта' : '// импортировано из GitHub';
  }
  typeRepo.addEventListener('click', function () { setType(false); });
  typeSite.addEventListener('click', function () { setType(true); });

  /* зона загрузки — кликабельна и с клавиатуры */
  var uploadZone = document.querySelector('.upload-zone');
  uploadZone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); uploadZone.click(); }
  });

  /* ---------- Шаг 1 → 2: импорт со спиннером 600мс ---------- */
  var importBtn = document.getElementById('importBtn');
  var step2 = document.getElementById('step2');
  var step3 = document.getElementById('step3');
  var step2Meta = document.getElementById('step2Meta');
  var urlError = document.getElementById('urlError');
  var announcer = document.getElementById('announcer');
  var importing = false;

  function runImport() {
    if (importing) return;
    /* валидация: пустой URL — ошибка, фокус обратно в поле */
    if (!urlInput.value.trim()) {
      urlError.hidden = false;
      urlInput.setAttribute('aria-invalid', 'true');
      urlInput.closest('.search-box').classList.add('error');
      urlInput.focus();
      return;
    }
    urlError.hidden = true;
    urlInput.removeAttribute('aria-invalid');
    urlInput.closest('.search-box').classList.remove('error');
    importing = true;
    /* не disabled: иначе клавиатурный фокус падает в body */
    importBtn.setAttribute('aria-disabled', 'true');
    importBtn.innerHTML = 'импортируем<span class="spinner" aria-hidden="true">▌</span>';
    setTimeout(function () {
      importing = false;
      importBtn.removeAttribute('aria-disabled');
      importBtn.textContent = 'Импортировать';
      [step2, step3].forEach(function (s) {
        s.classList.remove('hidden');
        s.classList.add('reveal');
      });
      announcer.textContent = 'Карточка импортирована — шаг 2 из 3';
      step2.scrollIntoView({ block: 'start' });
    }, 600);
  }
  importBtn.addEventListener('click', runImport);
  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); runImport(); }
  });
  urlInput.addEventListener('input', function () {
    if (!urlError.hidden) {
      urlError.hidden = true;
      urlInput.removeAttribute('aria-invalid');
      urlInput.closest('.search-box').classList.remove('error');
    }
  });

  /* ---------- Шаг 2: превью следует за полями ---------- */
  var fName = document.getElementById('fName');
  var fDesc = document.getElementById('fDesc');
  fName.addEventListener('input', function () {
    document.getElementById('previewName').textContent = fName.value || 'Без названия';
  });
  fDesc.addEventListener('input', function () {
    document.getElementById('previewDesc').textContent = fDesc.value;
  });

  /* категории: одиночный выбор; «ещё 24…» — демо-заглушка полного списка */
  var catChips = Array.prototype.slice.call(document.querySelectorAll('#step2 .field .chips')[0].querySelectorAll('.chip'));
  catChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      catChips.forEach(function (c) {
        c.setAttribute('aria-pressed', 'false');
        c.classList.remove('chip-reco');
      });
      chip.setAttribute('aria-pressed', 'true');
      chip.classList.add('chip-reco');
      if (chip.dataset.cat) {
        document.getElementById('previewCat').textContent = chip.dataset.cat;
      } else if (chip.textContent.trim() !== 'ещё 24…') {
        document.getElementById('previewCat').textContent = chip.textContent.trim();
      }
    });
  });

  /* теги: toggle + добавление своего */
  var tagChips = document.getElementById('tagChips');
  function bindTag(chip) {
    chip.addEventListener('click', function () {
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  }
  tagChips.querySelectorAll('.chip').forEach(bindTag);

  var tagInput = document.getElementById('tagInput');
  function addTag() {
    var v = tagInput.value.trim().toLowerCase();
    if (!v) return;
    var chip = document.createElement('button');
    chip.className = 'chip';
    chip.setAttribute('aria-pressed', 'true');
    chip.textContent = v;
    bindTag(chip);
    tagChips.appendChild(chip);
    tagInput.value = '';
    tagInput.focus();
  }
  document.getElementById('tagAddBtn').addEventListener('click', addTag);
  tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  });

  /* ---------- Шаг 3: копирование бейджа ---------- */
  var copyBtn = document.getElementById('copyBadge');
  copyBtn.addEventListener('click', function () {
    var text = document.getElementById('badgeCode').textContent;
    /* отклик сразу — обещание clipboard может не завершиться без жеста/разрешения */
    copyBtn.classList.add('copied');
    copyBtn.textContent = 'скопировано ✓';
    setTimeout(function () {
      copyBtn.classList.remove('copied');
      copyBtn.textContent = 'копировать';
    }, 1800);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
    }
  });

  /* ---------- Шаг 3: проверка README → публикация ---------- */
  var verifyBtn = document.getElementById('verifyBtn');
  var verifyStatus = document.getElementById('verifyStatus');
  var publishBtn = document.getElementById('publishBtn');
  var publishNote = document.getElementById('publishNote');
  var verifying = false;

  verifyBtn.addEventListener('click', function () {
    if (verifying) return;
    verifying = true;
    /* не disabled: иначе клавиатурный фокус падает в body */
    verifyBtn.setAttribute('aria-disabled', 'true');
    verifyStatus.classList.add('show');
    verifyStatus.innerHTML = 'проверяем<span class="spinner" aria-hidden="true">▌</span>';
    setTimeout(function () {
      verifying = false;
      verifyBtn.removeAttribute('aria-disabled');
      verifyStatus.textContent = '✓ бейдж найден';
      publishBtn.disabled = false;
      publishNote.textContent = '// владение подтверждено — можно публиковать';
    }, 800);
  });

  /* ---------- Публикация → экран успеха ---------- */
  var stepsView = document.getElementById('stepsView');
  var successView = document.getElementById('successView');
  publishBtn.addEventListener('click', function () {
    stepsView.style.display = 'none';
    document.querySelector('.form-head').style.display = 'none';
    successView.classList.add('show');
    window.scrollTo({ top: 0 });
    /* фокус на заголовок успеха — иначе падает в body, скринридер молчит */
    document.getElementById('successTitle').focus();
  });

  /* сброс формы при переключении состояния мокапа */
  function resetForm() {
    [step2, step3].forEach(function (s) { s.classList.add('hidden'); s.classList.remove('reveal'); });
    stepsView.style.display = '';
    document.querySelector('.form-head').style.display = '';
    successView.classList.remove('show');
    publishBtn.disabled = true;
    publishNote.textContent = '// сначала проверь README — без бейджа не опубликуем';
    verifyStatus.classList.remove('show');
    verifyStatus.textContent = '';
    importBtn.removeAttribute('aria-disabled');
    importBtn.textContent = 'Импортировать';
    verifyBtn.removeAttribute('aria-disabled');
    urlError.hidden = true;
    urlInput.removeAttribute('aria-invalid');
    urlInput.closest('.search-box').classList.remove('error');
    announcer.textContent = '';
    setType(false);
  }
})();
