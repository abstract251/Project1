/**
 * home.js — 首页（对应小程序 pages/home/index.js）
 * 开始测评：每次进入测评前生成新的 visitor_id，确保多次提交可区分
 * （对应 getApp().refreshVisitorId()，然后跳转个人信息页）
 */

(function () {
  document.getElementById('goToSleep').addEventListener('click', function () {
    // 每次进入测评前生成新的 visitor_id，确保多次提交可区分
    refreshVisitorId();
    // 对应 wx.navigateTo({ url: '/pages/personal-info/index' })
    navigateTo('personal-info.html');
  });
})();
