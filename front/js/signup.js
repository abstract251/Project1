/* ============================================================
   注册 / 登录页交互
   标签切换 / 密码可见切换 / 强度指示 / 表单校验 / 提交加载
   MOCK 提交 —— 后端实现后替换为接口（见 docs/前端接口文档.md）：
   POST /auth/register、POST /auth/login、POST /auth/sms
   ============================================================ */
(function () {
  'use strict';

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

  var PHONE_RE = /^1[3-9]\d{9}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- 1. 注册 / 登录 标签切换 ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.auth-tab'));
  var signupForm = document.getElementById('signupForm');
  var loginForm = document.getElementById('loginForm');

  function switchTab(name) {
    tabs.forEach(function (t) {
      var active = t.dataset.tab === name;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    signupForm.hidden = name !== 'signup';
    loginForm.hidden = name !== 'login';
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { switchTab(t.dataset.tab); });
  });

  /* ---------- 2. 密码显示 / 隐藏切换 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.eye-toggle'), function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.dataset.target);
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('off', show);
    });
  });

  /* ---------- 3. 性别单选药丸样式 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.radio-pill'), function (pill) {
    var radio = pill.querySelector('input');
    radio.addEventListener('change', function () {
      Array.prototype.forEach.call(pill.parentNode.children, function (p) {
        p.classList.remove('checked');
      });
      if (radio.checked) pill.classList.add('checked');
    });
  });

  /* ---------- 4. 出生日期下拉 ---------- */
  var yearSel = document.getElementById('birthYear');
  var monthSel = document.getElementById('birthMonth');
  var daySel = document.getElementById('birthDay');

  for (var y = 1970; y <= 2008; y++) {
    var o = document.createElement('option');
    o.value = String(y);
    o.textContent = y + ' 年';
    yearSel.appendChild(o);
  }
  for (var m = 1; m <= 12; m++) {
    var om = document.createElement('option');
    om.value = String(m);
    om.textContent = m + ' 月';
    monthSel.appendChild(om);
  }
  for (var d = 1; d <= 31; d++) {
    var od = document.createElement('option');
    od.value = String(d);
    od.textContent = d + ' 日';
    daySel.appendChild(od);
  }
  function fillDays() {
    var year = parseInt(yearSel.value, 10) || 2000;
    var month = parseInt(monthSel.value, 10) || 1;
    var max = new Date(year, month, 0).getDate();
    var current = daySel.value;
    daySel.innerHTML = '';
    for (var i = 1; i <= max; i++) {
      var oi = document.createElement('option');
      oi.value = String(i);
      oi.textContent = i + ' 日';
      if (String(i) === current) oi.selected = true;
      daySel.appendChild(oi);
    }
  }
  yearSel.addEventListener('change', fillDays);
  monthSel.addEventListener('change', fillDays);

  /* ---------- 5. 密码强度指示 ---------- */
  var strength = document.getElementById('strength');
  var strengthText = document.getElementById('strengthText');
  var suPwd = document.getElementById('suPwd');
  var suPwd2 = document.getElementById('suPwd2');
  var pwd2Field = document.getElementById('pwd2Field');
  var pwd2Hint = document.getElementById('pwd2Hint');

  function scorePassword(pwd) {
    var s = 0;
    if (pwd.length >= 8) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[a-zA-Z]/.test(pwd)) s += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) s += 1;
    return s;
  }
  suPwd.addEventListener('input', function () {
    var s = scorePassword(suPwd.value);
    strength.className = 'strength' + (suPwd.value ? ' s' + Math.min(Math.max(s - 1, 1), 3) : '');
    strengthText.textContent = !suPwd.value ? '密码强度'
      : s <= 1 ? '弱'
      : s <= 2 ? '中'
      : s === 3 ? '较强' : '强';
    checkSignupValid();
  });
  suPwd2.addEventListener('input', function () {
    var mismatch = suPwd2.value !== '' && suPwd2.value !== suPwd.value;
    pwd2Field.classList.toggle('has-error', mismatch);
    pwd2Hint.textContent = mismatch ? '两次输入的密码不一致' : '';
    checkSignupValid();
  });

  /* ---------- 6. 注册按钮可用性校验 ---------- */
  var suSubmit = document.getElementById('suSubmit');
  function getGender() {
    var g = document.querySelector('input[name="gender"]:checked');
    return g ? g.value : '';
  }
  function checkSignupValid() {
    var account = document.getElementById('suAccount').value.trim();
    var okAccount = PHONE_RE.test(account) || EMAIL_RE.test(account);
    var okPwd = suPwd.value.length >= 8;
    var okPwd2 = suPwd2.value !== '' && suPwd2.value === suPwd.value;
    var okGender = getGender() !== '';
    var okBirth = yearSel.value && monthSel.value && daySel.value;
    suSubmit.disabled = !(okAccount && okPwd && okPwd2 && okGender && okBirth);
  }
  document.getElementById('suAccount').addEventListener('input', checkSignupValid);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="gender"]'), function (r) {
    r.addEventListener('change', checkSignupValid);
  });

  /* ---------- 7. 注册提交（模拟） ---------- */
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (suSubmit.disabled) return;
    suSubmit.classList.add('loading');
    suSubmit.textContent = '注册中';
    setTimeout(function () {
      suSubmit.classList.remove('loading');
      suSubmit.textContent = '注册';
      toast('注册成功，欢迎加入缘遇 ♥（演示，未接入后端）');
      signupForm.reset();
      strength.className = 'strength';
      strengthText.textContent = '密码强度';
      Array.prototype.forEach.call(document.querySelectorAll('.radio-pill'), function (p) {
        p.classList.remove('checked');
      });
      checkSignupValid();
    }, 1300);
  });

  /* ---------- 8. 登录表单 ---------- */
  var liSubmit = document.getElementById('liSubmit');
  function checkLoginValid() {
    var account = document.getElementById('liAccount').value.trim();
    var pwd = document.getElementById('liPwd').value;
    liSubmit.disabled = !(account && pwd);
  }
  document.getElementById('liAccount').addEventListener('input', checkLoginValid);
  document.getElementById('liPwd').addEventListener('input', checkLoginValid);

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (liSubmit.disabled) return;
    liSubmit.classList.add('loading');
    liSubmit.textContent = '登录中';
    setTimeout(function () {
      liSubmit.classList.remove('loading');
      liSubmit.textContent = '登录';
      toast('登录成功，欢迎回来 ♥（演示，未接入后端）');
    }, 1200);
  });

  /* ---------- 9. 其他演示入口 ---------- */
  document.getElementById('forgotBtn').addEventListener('click', function () {
    toast('找回密码将在后端接入后开放');
  });
  document.getElementById('wxBtn').addEventListener('click', function () {
    toast('微信登录将在后端接入后开放');
  });
  document.getElementById('phoneBtn').addEventListener('click', function () {
    toast('快捷登录将在后端接入后开放');
  });

})();
