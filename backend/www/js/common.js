/**
 * common.js — 公共工具库
 * =====================================================
 * 把小程序版 wx.* API 映射为 Web 实现：
 *   wx.getStorageSync / setStorageSync / removeStorageSync → localStorage
 *   wx.showToast / showModal / showLoading / hideLoading / showActionSheet → 自定义 DOM 组件
 *   wx.request → request()（fetch 封装，返回 Promise）
 *   wx.redirectTo → location.replace；wx.navigateTo → location.href
 *   getApp().globalData（会话级数据）→ sessionStorage
 * =====================================================
 */

/* ========== 存储 ========== */

// 持久化存储（对应 wx.setStorageSync）
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('setStorage 失败:', e);
  }
}

// 读取持久化存储（对应 wx.getStorageSync）
function getStorage(key) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return '';
    return JSON.parse(raw);
  } catch (e) {
    return '';
  }
}

// 删除持久化存储（对应 wx.removeStorageSync）
function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('removeStorage 失败:', e);
  }
}

// 会话级数据（对应小程序 app.globalData —— 同一浏览器标签页内有效，关闭即失效）
function setSessionData(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('setSessionData 失败:', e);
  }
}

function getSessionData(key) {
  try {
    var raw = sessionStorage.getItem(key);
    if (raw === null || raw === undefined) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function removeSessionData(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error('removeSessionData 失败:', e);
  }
}

/* ========== 访客 ID（对应小程序版 app.js 的 visitorId 逻辑）========== */

// 生成或取回访客 ID（同一浏览器同一用户，不换不丢）
function getVisitorId() {
  var visitorId = getStorage(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setStorage(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

// 生成新的访客 ID，每次进入测评时调用以确保多次提交可区分
// （对应小程序版 app.refreshVisitorId）
function refreshVisitorId() {
  var newId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  setStorage(VISITOR_ID_KEY, newId);
  return newId;
}

/* ========== Toast（对应 wx.showToast）========== */

var _toastTimer = null;

function showToast(title, icon, duration) {
  icon = icon || 'none';
  duration = duration || 2000;
  removeToast();
  var el = document.createElement('div');
  el.className = 'dsh-toast ' + (icon === 'success' ? 'dsh-toast-success' : '');
  el.innerHTML = (icon === 'success' ? '<div class="dsh-toast-icon">✓</div>' : '') +
    '<div class="dsh-toast-text">' + escapeHtml(title) + '</div>';
  document.body.appendChild(el);
  _toastTimer = setTimeout(removeToast, duration);
}

function removeToast() {
  if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
  var els = document.querySelectorAll('.dsh-toast');
  for (var i = 0; i < els.length; i++) els[i].remove();
}

/* ========== Modal（对应 wx.showModal）========== */

// opts: { title, content, showCancel, confirmText, cancelText }
// 返回 Promise<{ confirm: boolean, cancel: boolean }>
function showModal(opts) {
  opts = opts || {};
  return new Promise(function (resolve) {
    var overlay = document.createElement('div');
    overlay.className = 'dsh-modal-mask';
    overlay.innerHTML =
      '<div class="dsh-modal">' +
        (opts.title ? '<div class="dsh-modal-title">' + escapeHtml(opts.title) + '</div>' : '') +
        '<div class="dsh-modal-content">' + escapeHtml(opts.content || '') + '</div>' +
        '<div class="dsh-modal-btns">' +
          (opts.showCancel === false ? '' : '<button class="dsh-modal-btn dsh-modal-cancel">' + escapeHtml(opts.cancelText || '取消') + '</button>') +
          '<button class="dsh-modal-btn dsh-modal-confirm">' + escapeHtml(opts.confirmText || '确定') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    // 注意：showCancel:false 时没有取消按钮，必须先判空再绑定，
    // 否则 null.addEventListener 抛错会导致"确定"按钮无法绑定事件、弹窗关不掉
    var cancelBtn = overlay.querySelector('.dsh-modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () { close({ confirm: false, cancel: true }); });
    }
    var confirmBtn = overlay.querySelector('.dsh-modal-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () { close({ confirm: true, cancel: false }); });
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && opts.showCancel !== false) close({ confirm: false, cancel: true });
    });
  });
}

// 仅确定按钮（对应 wx.showModal showCancel: false）
function showAlert(title, content) {
  return showModal({ title: title, content: content, showCancel: false });
}

/* ========== Loading（对应 wx.showLoading / wx.hideLoading）========== */

function showLoading(title) {
  hideLoading();
  var el = document.createElement('div');
  el.className = 'dsh-loading-mask';
  el.innerHTML = '<div class="dsh-loading"><div class="dsh-loading-spinner"></div>' +
    (title ? '<div class="dsh-loading-text">' + escapeHtml(title) + '</div>' : '') + '</div>';
  document.body.appendChild(el);
}

function hideLoading() {
  var els = document.querySelectorAll('.dsh-loading-mask');
  for (var i = 0; i < els.length; i++) els[i].remove();
}

/* ========== ActionSheet（对应 wx.showActionSheet）========== */

// itemList: 字符串数组；返回 Promise<{ tapIndex: number } | { cancel: true }>
function showActionSheet(itemList) {
  return new Promise(function (resolve) {
    var overlay = document.createElement('div');
    overlay.className = 'dsh-actionsheet-mask';
    var itemsHtml = '';
    for (var i = 0; i < itemList.length; i++) {
      itemsHtml += '<div class="dsh-actionsheet-item" data-index="' + i + '">' + escapeHtml(itemList[i]) + '</div>';
    }
    overlay.innerHTML =
      '<div class="dsh-actionsheet">' +
        '<div class="dsh-actionsheet-list">' + itemsHtml + '</div>' +
        '<div class="dsh-actionsheet-cancel">取消</div>' +
      '</div>';
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    var cancelBtn = overlay.querySelector('.dsh-actionsheet-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        close();
        resolve({ cancel: true });
      });
    }
    var items = overlay.querySelectorAll('.dsh-actionsheet-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        close();
        resolve({ tapIndex: idx });
      });
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { close(); resolve({ cancel: true }); }
    });
  });
}

/* ========== 网络请求（对应 wx.request）========== */

/**
 * request({ url, method, data })
 * 返回 Promise<{ statusCode, data }>，data 为后端 JSON（{code, message, data}）
 * 网络错误时 reject
 */
function request(opts) {
  return new Promise(function (resolve, reject) {
    var url = opts.url;
    var method = (opts.method || 'GET').toUpperCase();
    var data = opts.data;

    var fetchOpts = { method: method, headers: {} };
    if (method === 'POST' || method === 'PUT') {
      fetchOpts.headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(data || {});
    } else if (data) {
      var qs = [];
      for (var k in data) {
        if (data.hasOwnProperty(k)) qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
      }
      if (qs.length) url += (url.indexOf('?') === -1 ? '?' : '&') + qs.join('&');
    }

    fetch(url, fetchOpts).then(function (resp) {
      return resp.json().then(function (json) {
        resolve({ statusCode: resp.status, data: json });
      }).catch(function () {
        resolve({ statusCode: resp.status, data: null });
      });
    }).catch(function () {
      reject(new Error('network error'));
    });
  });
}

/* ========== 页面跳转 ========== */

// 对应 wx.navigateTo（压栈，可返回）
function navigateTo(url) {
  window.location.href = url;
}

// 对应 wx.redirectTo（替换当前页，不可返回）
function redirectTo(url) {
  window.location.replace(url);
}

// 对应 wx.navigateBack
// 注：页面位于 frontend/html/ 子目录，兜底回退到入口页 index.html（位于上级目录）
function navigateBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '../index.html';
  }
}

/* ========== 其它工具 ========== */

// 转义 HTML，防止注入
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 过滤非数字字符（对应小程序版 personal-info 的 _filterDigits）
function filterDigits(value) {
  return String(value).replace(/[^\d]/g, '');
}

// 获取 URL 查询参数
function getQueryParam(name) {
  var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
}

// 格式化两位数字（如 9 → "09"）
function pad2(n) {
  return String(n).padStart(2, '0');
}

// 当前时间字符串 HH:MM（对应小程序版 fillTimeValue 初始值）
function nowTimeString() {
  var d = new Date();
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
