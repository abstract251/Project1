/**
 * entry.js — 入口页（对应小程序 pages/entry/index.js）
 * 跳转逻辑与小程序版一致：
 *   1. 通过 ?from=qr 进入 → 直接 redirectTo 首页（对应小程序扫码进入）
 *   2. 点击卡片 → 填写问卷 → 首页；管理员登录 → 登录页
 */

(function () {
  // 对应小程序 app.js 的扫码检测（scene=1011/1047）与 ?from=qr 参数
  // 方式1: 通过 URL 参数 from=qr（对应小程序 app.globalData.isQRCodeEntry）
  // 方式2: 通过页面路径参数 ?from=qr（调试/自定义二维码）
  var params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'qr') {
    // 对应 wx.redirectTo({ url: '/pages/home/index' })
    // 入口页 index.html 位于 frontend 根目录，其余页面位于 html/ 子目录
    redirectTo('html/home.html');
    return;
  }

  document.getElementById('goToHome').addEventListener('click', function () {
    // 对应 wx.navigateTo({ url: '/pages/home/index' })
    navigateTo('html/home.html');
  });

  document.getElementById('goToLogin').addEventListener('click', function () {
    // 对应 wx.navigateTo({ url: '/pages/login/index' })
    navigateTo('html/login.html');
  });
})();
