/* ============================================================
   发现页交互：滑动卡片 / 筛选 / 空状态
   MOCK 数据 —— 后端实现后替换为接口（见 docs/前端接口文档.md）：
   GET /users/recommend（候选列表）
   POST /users/{id}/swipe（滑动上报，匹配成功返回 matched）
   ============================================================ */
(function () {
  'use strict';

  /* ---------- MOCK 候选用户 ---------- */
  var ALL_USERS = [
    { id: 1,  name: '苏晴',   age: 28, city: '杭州', job: 'UI 设计师',   tags: ['摄影', '咖啡', '艺术展'], mutual: '你们都喜欢爵士乐', grad: 'grad-1' },
    { id: 2,  name: '顾言',   age: 30, city: '上海', job: '产品经理',     tags: ['健身', '徒步', '纪录片'], mutual: '你们都喜欢 Citywalk', grad: 'grad-2' },
    { id: 3,  name: '林晚',   age: 27, city: '北京', job: '插画师',       tags: ['养猫', '手账', '独立音乐'], mutual: '你们都喜欢小动物', grad: 'grad-3' },
    { id: 4,  name: '叶楠',   age: 29, city: '成都', job: '中学教师',     tags: ['美食', '旅行', '瑜伽'],   mutual: '你们都去过稻城', grad: 'grad-4' },
    { id: 5,  name: '许川',   age: 32, city: '深圳', job: '软件架构师',   tags: ['阅读', '咖啡', '马拉松'], mutual: '你们都喜欢村上春树', grad: 'grad-5' },
    { id: 6,  name: '陈知夏', age: 26, city: '南京', job: '儿科医生',     tags: ['钢琴', '烘焙', '骑行'],   mutual: '你们都喜欢烘焙', grad: 'grad-6' },
    { id: 7,  name: '陆之遥', age: 31, city: '苏州', job: '律师',         tags: ['戏剧', '红酒', '滑雪'],   mutual: '你们都爱看话剧', grad: 'grad-1' },
    { id: 8,  name: '江晚晴', age: 28, city: '广州', job: '旅行博主',     tags: ['潜水', '胶片相机', '海边'], mutual: '你们都喜欢看海', grad: 'grad-2' }
  ];

  var FILTER_TAG_OPTIONS = ['旅行', '摄影', '健身', '美食', '阅读', '咖啡', '宠物', '音乐', '运动', '艺术'];
  var SWIPE_THRESHOLD = 90;   /* 超过该位移触发滑动 */

  /* ---------- 状态 ---------- */
  var deck = [];          /* 当前候选列表 */
  var index = 0;          /* 当前第几张 */
  var dragging = false;
  var busy = false;       /* 飞出动画期间禁止操作 */
  var startX = 0, startY = 0, dx = 0;

  /* ---------- DOM ---------- */
  var deckEl = document.getElementById('deck');
  var progressEl = document.getElementById('deckProgress');
  var emptyEl = document.getElementById('deckEmpty');
  var emptyTitle = document.getElementById('emptyTitle');
  var emptyDesc = document.getElementById('emptyDesc');
  var emptyBtn = document.getElementById('emptyBtn');
  var filterPanel = document.getElementById('filterPanel');
  var filterBtn = document.getElementById('filterBtn');
  var tagBox = document.getElementById('filterTags');

  /* ---------- 工具：toast ---------- */
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

  /* ---------- 筛选面板 ---------- */
  function fillAgeSelect(sel, min, max, selected) {
    sel.innerHTML = '';
    for (var v = min; v <= max; v++) {
      var o = document.createElement('option');
      o.value = String(v);
      o.textContent = v + ' 岁';
      if (v === selected) o.selected = true;
      sel.appendChild(o);
    }
  }
  fillAgeSelect(document.getElementById('ageMin'), 18, 50, 18);
  fillAgeSelect(document.getElementById('ageMax'), 18, 50, 45);

  FILTER_TAG_OPTIONS.forEach(function (t, i) {
    var label = document.createElement('label');
    label.className = 'filter-tag';
    label.innerHTML = '<input type="checkbox" value="' + t + '"' + (i < 2 ? ' checked' : '') + '/><span>' + t + '</span>';
    tagBox.appendChild(label);
  });

  filterBtn.addEventListener('click', function () {
    var open = filterPanel.hidden;
    filterPanel.hidden = !open;
    filterBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (!filterPanel.hidden && !filterPanel.contains(e.target) && e.target !== filterBtn && !filterBtn.contains(e.target)) {
      filterPanel.hidden = true;
      filterBtn.setAttribute('aria-expanded', 'false');
    }
  });

  function currentFilter() {
    return {
      ageMin: parseInt(document.getElementById('ageMin').value, 10),
      ageMax: parseInt(document.getElementById('ageMax').value, 10),
      distance: parseInt(document.getElementById('distance').value, 10),
      tags: Array.prototype.map.call(tagBox.querySelectorAll('input:checked'), function (i) { return i.value; })
    };
  }

  function resetFilter() {
    document.getElementById('ageMin').value = '18';
    document.getElementById('ageMax').value = '45';
    document.getElementById('distance').value = '0';
    tagBox.querySelectorAll('input').forEach(function (i) {
      i.checked = FILTER_TAG_OPTIONS.indexOf(i.value) < 2;
    });
  }

  document.getElementById('filterReset').addEventListener('click', function () {
    resetFilter();
    applyFilter();
  });
  document.getElementById('filterApply').addEventListener('click', applyFilter);

  function applyFilter() {
    var f = currentFilter();
    deck = ALL_USERS.filter(function (u) {
      if (u.age < f.ageMin || u.age > f.ageMax) return false;
      if (f.tags.length) {
        var hit = u.tags.some(function (t) { return f.tags.indexOf(t) >= 0; });
        if (!hit) return false;
      }
      return true;
    });
    index = 0;
    filterPanel.hidden = true;
    filterBtn.setAttribute('aria-expanded', 'false');
    render();
  }

  /* ---------- 卡片渲染 ---------- */
  function buildCard(u) {
    var card = document.createElement('article');
    card.className = 'swipe-card card-enter';
    var tagsHtml = u.tags.map(function (t) {
      return '<span class="pill pill--pink">' + t + '</span>';
    }).join('');
    card.innerHTML =
      '<div class="card-photo ' + u.grad + '">' +
        '<span class="ph-initial">' + u.name.charAt(0) + '</span>' +
        '<div class="card-tint like">♥ 喜欢</div>' +
        '<div class="card-tint nope">✕ 不喜欢</div>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-head"><span class="card-name">' + u.name + '</span><span class="card-age">' + u.age + '</span></div>' +
        '<p class="card-job">' + u.city + ' · ' + u.job + '</p>' +
        '<div class="card-tags">' + tagsHtml + '</div>' +
        '<div class="mutual">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5.35-8-11.2A4.4 4.4 0 0 1 12 6.2a4.4 4.4 0 0 1 8 3.6C20 15.65 12 21 12 21z"/></svg>' +
          u.mutual +
        '</div>' +
      '</div>';
    bindSwipe(card);
    return card;
  }

  function render() {
    deckEl.innerHTML = '';
    if (deck.length === 0) {
      showEmpty('没有符合条件的人选', '试试放宽年龄或标签筛选', '重置筛选', function () {
        resetFilter();
        applyFilter();
      });
      return;
    }
    if (index >= deck.length) {
      showEmpty('今天的人选都看完啦', '明天会有新朋友加入，晚点再来看看', '重新浏览', function () {
        resetFilter();
        applyFilter();
      });
      return;
    }
    emptyEl.hidden = true;
    deckEl.appendChild(buildCard(deck[index]));
    updateProgress();
  }

  function updateProgress() {
    progressEl.textContent = '第 ' + (index + 1) + ' / ' + deck.length + ' 位';
  }

  function showEmpty(title, desc, btnText, action) {
    emptyTitle.textContent = title;
    emptyDesc.textContent = desc;
    emptyBtn.textContent = btnText;
    emptyBtn.onclick = action;
    progressEl.textContent = '';
    emptyEl.hidden = false;
  }

  /* ---------- 滑动逻辑（指针事件，兼容鼠标/触屏） ---------- */
  function setTint(card, direction, strength) {
    var like = card.querySelector('.card-tint.like');
    var nope = card.querySelector('.card-tint.nope');
    like.style.opacity = direction > 0 ? String(strength) : '0';
    nope.style.opacity = direction < 0 ? String(strength) : '0';
  }

  function bindSwipe(card) {
    card.addEventListener('pointerdown', function (e) {
      if (busy) return;
      dragging = true;
      dx = 0;
      startX = e.clientX;
      startY = e.clientY;
      card.classList.add('dragging');
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    });

    card.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      var dy = e.clientY - startY;
      card.style.transform = 'translate(' + dx + 'px,' + (dy * 0.3).toFixed(1) + 'px) rotate(' + (dx * 0.07).toFixed(2) + 'deg)';
      setTint(card, dx, Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1));
    });

    function endSwipe() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('dragging');
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        flyOut(card, dx > 0 ? 1 : -1);
      } else {
        card.style.transition = 'transform .4s cubic-bezier(.22, .8, .35, 1)';
        card.style.transform = '';
        setTint(card, 0, 0);
        setTimeout(function () { card.style.transition = ''; }, 420);
      }
    }
    card.addEventListener('pointerup', endSwipe);
    card.addEventListener('pointercancel', endSwipe);
  }

  /* 飞出 + 切换到下一张 */
  function flyOut(card, dir) {
    busy = true;
    card.classList.add('animating');
    card.style.transform = 'translate(' + (dir * 560) + 'px,' + (dir * -30) + 'px) rotate(' + (dir * 22) + 'deg)';
    card.style.opacity = '0';
    setTimeout(function () {
      card.remove();
      index += 1;
      render();
      busy = false;
    }, 400);
  }

  /* ---------- 按钮操作 ---------- */
  document.getElementById('btnNope').addEventListener('click', function () {
    if (busy || !deckEl.firstElementChild) return;
    toast('已跳过，缘分在别处');
    flyOut(deckEl.firstElementChild, -1);
  });
  document.getElementById('btnLike').addEventListener('click', function () {
    if (busy || !deckEl.firstElementChild) return;
    var u = deck[index];
    toast('已心动 · ' + u.name);
    flyOut(deckEl.firstElementChild, 1);
  });

  /* ---------- 初始渲染 ---------- */
  deck = ALL_USERS.slice();
  render();

})();
