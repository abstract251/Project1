/* ============================================================
   个人资料页交互：完整度动画 / 头像放大 / 演示提示
   MOCK 数据 —— 后端实现后替换为接口（见 docs/前端接口文档.md）：
   GET /profile/me（我的资料）
   PUT /profile/me（更新资料）
   POST /profile/photos（上传照片）
   ============================================================ */
(function () {
  'use strict';

  var FINAL_SCORE = 85; /* MOCK：资料完整度，后端由 GET /profile/me 返回 */

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 350);
    }, 2200);
  }

  /* ---------- 1. 资料完整度：进度条 + 数字动画 ---------- */
  var compBar = document.getElementById('compBar');
  var compNum = document.getElementById('compNum');

  requestAnimationFrame(function () { compBar.style.width = FINAL_SCORE + '%'; });

  (function animateScore() {
    var duration = 1400;
    var start = null;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function step(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      compNum.textContent = String(Math.round(FINAL_SCORE * easeOutCubic(p)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })();

  /* ---------- 2. 头像点击放大 ---------- */
  var lightbox = document.getElementById('lightbox');
  document.getElementById('avatarBtn').addEventListener('click', function () {
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
  });
  lightbox.addEventListener('click', function () {
    lightbox.classList.remove('open');
    setTimeout(function () { lightbox.hidden = true; }, 320);
  });

  /* ---------- 3. 演示提示（待后端接入） ---------- */
  document.getElementById('editBtn').addEventListener('click', function () {
    toast('编辑资料将在后端接入后开放（PUT /profile/me）');
  });
  document.getElementById('shareBtn').addEventListener('click', function () {
    toast('分享链接已复制（演示）');
  });
  document.getElementById('addPhoto').addEventListener('click', function () {
    toast('照片上传将在后端接入后开放（POST /profile/photos）');
  });

})();
