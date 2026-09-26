/**
 * login.js — 管理员登录（对应小程序 pages/login/index.js）
 * 登录成功 → 保存 adminUser → 1秒后跳转管理后台
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  $('loginBtn').addEventListener('click', function () {
    var username = $('username').value;
    var password = $('password').value;

    if (!username || !password) {
      // 对应 wx.showToast({ title: '请输入账号密码', icon: 'none' })
      showToast('请输入账号密码', 'none');
      return;
    }

    request({
      url: API_BASE_URL + '/api/login',
      method: 'POST',
      data: {
        name: username,
        password: password
      }
    }).then(function (res) {
      if (res.data && res.data.code === 0) {
        // 对应 wx.showToast({ title: '登录成功', icon: 'success' })
        showToast('登录成功', 'success');
        // 对应 wx.setStorageSync('adminUser', res.data.data)
        setStorage(ADMIN_USER_KEY, res.data.data);
        setTimeout(function () {
          // 对应 wx.navigateTo({ url: '/pages/admin/index' })
          navigateTo('admin.html');
        }, 1000);
      } else {
        // 对应 wx.showToast({ title: res.data.message || '账号或密码错误', icon: 'none' })
        showToast((res.data && res.data.message) || '账号或密码错误', 'none');
      }
    }).catch(function () {
      // 对应 wx.showToast({ title: '网络错误，无法连接服务器', icon: 'none' })
      showToast('网络错误，无法连接服务器', 'none');
    });
  });

  // 返回首页
  // 注：小程序版此处为 wx.navigateBack()，但 Web 版若用 history.back()，
  // 会回退到"未登录重定向前访问过的管理员页面"（如 admin.html），
  // 因此这里直接跳转到入口页 index.html（位于上级目录）
  $('backBtn').addEventListener('click', function () {
    navigateTo('../index.html');
  });
})();
