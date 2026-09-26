/**
 * admin.js — 管理后台（对应小程序 pages/admin/index.js）
 * 统计加载、快捷功能、导出、退出登录等逻辑与小程序版一致。
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var stats = {
    today_sleep: 0,
    total_sleep: 0,
    today_users: 0
  };

  // ===== 加载统计（对应小程序 onShow + loadStats）=====
  function loadStats() {
    request({
      url: API_BASE_URL + '/api/stats/today',
      method: 'GET'
    }).then(function (res) {
      if (res.data && res.data.code === 0) {
        var d = res.data.data;
        stats = {
          today_sleep: d.today_sleep || 0,
          total_sleep: d.total_sleep || 0,
          today_users: d.today_users || 0
        };
        $('statToday').textContent = stats.today_sleep + '人';
        $('statTotal').textContent = stats.total_sleep + '人';
        $('statUsers').textContent = stats.today_users + '人';
      }
    }).catch(function () {});
  }

  // ===== 主卡片 → 测评记录（对应小程序 onCardTap）=====
  $('mainCard').addEventListener('click', function () {
    // 对应 wx.navigateTo({ url: '/pages/assessment-records/index' })
    navigateTo('records.html');
  });

  // ===== 快捷功能（对应小程序 onQuickTap）=====
  var quickItems = document.querySelectorAll('.quick-item');
  for (var i = 0; i < quickItems.length; i++) {
    quickItems[i].addEventListener('click', function () {
      var item = this.getAttribute('data-item');
      if (item === 'records') {
        // 对应 wx.navigateTo({ url: '/pages/assessment-records/index' })
        navigateTo('records.html');
      } else if (item === 'users') {
        // 对应 wx.showToast({ title: '即将开发', icon: 'none' })
        showToast('即将开发', 'none');
      } else if (item === 'export') {
        exportData();
      } else {
        // 对应 wx.showToast({ title: '即将开发', icon: 'none' })
        showToast('即将开发', 'none');
      }
    });
  }

  // ===== 导出数据（对应小程序 exportData）=====
  // 小程序版为 wx.downloadFile + wx.shareFileMessage；
  // Web 版直接触发浏览器下载 hospital_data.zip
  function exportData() {
    showLoading('正在导出...');
    var a = document.createElement('a');
    a.href = API_BASE_URL + '/api/export/csv';
    a.download = 'hospital_data.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 下载由浏览器处理，短暂延迟后隐藏 loading
    setTimeout(hideLoading, 800);
  }

  // ===== Tab 栏（对应小程序 onTabTap）=====
  var tabItems = document.querySelectorAll('.tab-item');
  for (var j = 0; j < tabItems.length; j++) {
    tabItems[j].addEventListener('click', function () {
      var tab = this.getAttribute('data-tab');
      if (tab === 'home') {
        // 切换高亮
        for (var k = 0; k < tabItems.length; k++) {
          tabItems[k].classList.remove('active');
        }
        this.classList.add('active');
        loadStats();
      } else if (tab === 'profile') {
        // 对应小程序 showLogout（wx.showActionSheet）
        showLogout();
      } else {
        showToast('即将开发', 'none');
      }
    });
  }

  // ===== 退出登录（对应小程序 showLogout + onLogout）=====
  function showLogout() {
    showActionSheet(['退出登录']).then(function (res) {
      if (res.tapIndex === 0) {
        onLogout();
      }
    });
  }

  function onLogout() {
    showModal({
      title: '退出登录',
      content: '确定要退出当前管理员账号吗？'
    }).then(function (res) {
      if (res.confirm) {
        // 对应 wx.removeStorageSync('adminUser')
        removeStorage(ADMIN_USER_KEY);
        // 对应 wx.redirectTo({ url: '/pages/login/index' })
        redirectTo('login.html');
      }
    });
  }

  // ===== 用户头像（对应小程序 onUserTap）=====
  $('userAvatar').addEventListener('click', function () {
    // 对应 wx.showModal({ title: '管理员', content: '账号：admin\n角色：系统管理员', showCancel: false })
    showModal({
      title: '管理员',
      content: '账号：admin\n角色：系统管理员',
      showCancel: false
    });
  });

  // ===== 初始化 =====
  loadStats();
})();
