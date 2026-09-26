/**
 * sidebar.js — 桌面端左侧固定导航栏（管理类页面）
 * =====================================================
 * 仅在桌面端（>480px）渲染；手机端保持小程序样式不显示。
 * 管理类页面（admin / records / overview / record-detail /
 * disease-history）通过 <aside class="side-nav" id="sidebar">
 * 容器引入本脚本，菜单与小程序版管理后台的快捷功能一致：
 *   后台管理 / 测评记录 / 用户管理（即将开发）/ 导出数据 /
 *   系统设置（即将开发）/ 退出登录
 * =====================================================
 */

(function () {
  'use strict';

  function isDesktop() {
    return window.innerWidth > 480;
  }

  // 当前页面 → 高亮菜单 key（详情类页面归属"测评记录"）
  function currentKey() {
    var page = window.location.pathname.split('/').pop();
    if (page === 'admin.html') return 'admin';
    if (page === 'records.html' || page === 'overview.html' ||
        page === 'record-detail.html' || page === 'disease-history.html') {
      return 'records';
    }
    return '';
  }

  // 导出数据（与 admin.js exportData 一致：浏览器直接下载 hospital_data.zip）
  function exportData() {
    showLoading('正在导出...');
    var a = document.createElement('a');
    a.href = API_BASE_URL + '/api/export/csv';
    a.download = 'hospital_data.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(hideLoading, 800);
  }

  // 退出登录（与 admin.js onLogout 一致）
  function onLogout() {
    showModal({
      title: '退出登录',
      content: '确定要退出当前管理员账号吗？'
    }).then(function (res) {
      if (res.confirm) {
        removeStorage(ADMIN_USER_KEY);
        redirectTo('login.html');
      }
    });
  }

  function render() {
    var container = document.getElementById('sidebar');
    if (!container) return;

    if (!isDesktop()) {
      container.innerHTML = '';
      return;
    }

    var active = currentKey();
    var items = [
      { key: 'admin',    icon: '🏠', label: '后台管理',  href: 'admin.html',   action: null },
      { key: 'records',  icon: '📝', label: '测评记录',  href: 'records.html', action: null },
      { key: 'users',    icon: '👤', label: '用户管理',  href: null,           action: 'soon' },
      { key: 'export',   icon: '📤', label: '导出数据',  href: null,           action: 'export' },
      { key: 'settings', icon: '⚙️', label: '系统设置',  href: null,           action: 'soon' },
      { key: 'logout',   icon: '🚪', label: '退出登录',  href: null,           action: 'logout', danger: true }
    ];

    var html = '<div class="side-nav-inner">';
    html += '<div class="side-brand">' +
      '<span class="side-brand-icon">🧠</span>' +
      '<div>' +
        '<span class="side-brand-title">心理测评系统</span>' +
        '<span class="side-brand-sub">管理后台</span>' +
      '</div>' +
    '</div>';
    html += '<div class="side-menu">';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var cls = 'side-menu-item' + (it.danger ? ' danger' : '') + (it.key === active ? ' active' : '');
      var href = it.href ? ' href="' + it.href + '"' : '';
      html += '<a class="' + cls + '"' + href + ' data-key="' + it.key + '">' +
        '<span class="side-menu-icon">' + it.icon + '</span>' +
        '<span>' + it.label + '</span>' +
      '</a>';
    }
    html += '</div>';
    html += '<div class="side-foot">本系统测评结果仅供参考，<br>不能替代专业医疗诊断</div>';
    html += '</div>';
    container.innerHTML = html;

    // 绑定事件
    var menuEls = container.querySelectorAll('.side-menu-item');
    for (var j = 0; j < menuEls.length; j++) {
      menuEls[j].addEventListener('click', function (e) {
        var key = this.getAttribute('data-key');
        if (key === 'users' || key === 'settings') {
          e.preventDefault();
          // 对应小程序 onQuickTap: wx.showToast({ title: '即将开发', icon: 'none' })
          showToast('即将开发', 'none');
        } else if (key === 'export') {
          e.preventDefault();
          exportData();
        } else if (key === 'logout') {
          e.preventDefault();
          onLogout();
        }
        // admin / records 为普通链接跳转
      });
    }
  }

  render();
  // 窗口在手机/桌面间切换时重新渲染
  window.addEventListener('resize', function () {
    render();
  });
})();
