/**
 * auth.js — 管理员页面登录检测
 * =====================================================
 * 使用方法：在管理员页面的 <head> 中引入本脚本（在渲染前执行），
 * 未登录（localStorage 中无 adminUser）时立即重定向到登录页。
 *
 * 需要登录检测的页面：admin / records / overview / record-detail / disease-history
 * 不需要检测的页面：index（入口）、home、personal-info、assessment、login
 *
 * 本脚本零依赖（不依赖 config.js / common.js），放在 <head> 中同步执行，
 * 页面内容渲染前即完成检测，避免闪屏。
 * 重定向使用 location.replace：不产生历史记录，
 * 用户无法通过浏览器"后退"回到未登录的管理员页面。
 * =====================================================
 */

(function () {
  'use strict';

  // 与 js/config.js 中 ADMIN_USER_KEY 保持一致（'adminUser'）
  var ADMIN_USER_KEY = 'adminUser';

  function isLoggedIn() {
    try {
      var raw = localStorage.getItem(ADMIN_USER_KEY);
      if (!raw) return false;
      var user = JSON.parse(raw);
      return !!(user && user.name);
    } catch (e) {
      return false;
    }
  }

  if (!isLoggedIn()) {
    // 对应页面位于 frontend/html/ 子目录，登录页 login.html 同目录
    window.location.replace('login.html');
  }
})();
