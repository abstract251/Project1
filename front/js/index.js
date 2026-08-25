/* ============================================================
   缘遇 YUANYU · 首页交互
   1. 导航栏滚动态 / 移动端菜单
   2. 漂浮爱心（纯 ♥ 字符，离线可用）
   3. 滚动视差（Hero 场景与内容分层移动）
   4. 区块入场动画（IntersectionObserver + stagger）
   5. 数据滚动计数
   6. 导航滚动高亮（section spy）
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var navbar = document.getElementById('navbar');
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  /* ---------- 1. 导航栏：滚动后加毛玻璃背景 ---------- */
  function onScrollNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- 1.1 移动端菜单 ---------- */
  navToggle.addEventListener('click', function () {
    var open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- 2. 漂浮爱心 ---------- */
  if (!prefersReducedMotion) {
    var heartsWrap = document.getElementById('hearts');
    var HEART_COLORS = ['#E8A0BF', '#F7C5A8', '#C9A9A9', '#F5E6D3'];
    for (var i = 0; i < 14; i++) {
      var h = document.createElement('span');
      h.className = 'heart';
      h.textContent = '\u2665'; /* ♥ */
      h.style.left = (Math.random() * 100).toFixed(2) + '%';
      h.style.fontSize = (12 + Math.random() * 18).toFixed(1) + 'px';
      h.style.color = HEART_COLORS[i % HEART_COLORS.length];
      h.style.animationDuration = (9 + Math.random() * 10).toFixed(1) + 's';
      h.style.animationDelay = (Math.random() * 10).toFixed(1) + 's';
      heartsWrap.appendChild(h);
    }
  }

  /* ---------- 3. Hero 视差 ---------- */
  if (!prefersReducedMotion) {
    var scene = document.getElementById('heroScene');
    var content = document.getElementById('heroContent');
    var ticking = false;

    function updateParallax() {
      var y = window.scrollY;
      var vh = window.innerHeight;
      if (y < vh) {
        /* 背景层移动慢，内容层移动快一些，形成层次感 */
        scene.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
        content.style.transform = 'translate3d(0,' + (y * 0.45).toFixed(1) + 'px,0)';
        content.style.opacity = String(Math.max(0, 1 - y / (vh * 0.85)));
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- 4. 区块入场动画（stagger） ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) {
    revealIO.observe(el);
  });

  /* ---------- 5. 数据滚动计数 ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    var duration = 1600;
    var start = null;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function step(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * easeOutCubic(p)).toLocaleString('en-US');
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        animateCount(e.target);
        countIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.count').forEach(function (c) {
    countIO.observe(c);
  });

  /* ---------- 6. 导航滚动高亮 ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var spyIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { spyIO.observe(s); });

})();
