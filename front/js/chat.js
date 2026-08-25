/* ============================================================
   聊天页交互：消息渲染 / 自动滚动 / 正在输入 / 自动回复（模拟）
   MOCK 数据 —— 后端实现后替换为接口（见 docs/前端接口文档.md）：
   GET /chats/{chatId}/messages（历史消息，游标分页）
   POST /chats/{chatId}/messages（发送消息）
   WS /ws（实时消息与 typing 事件，或轮询 GET ?afterId=）
   ============================================================ */
(function () {
  'use strict';

  /* ---------- MOCK 会话 ---------- */
  var MESSAGES = [
    { type: 'day',  text: '昨天' },
    { type: 'msg',  from: 'them', time: '21:04', text: '今天的日落特别好看，随手拍了一张 🌇' },
    { type: 'msg',  from: 'me',   time: '21:05', text: '哇，这个颜色也太温柔了吧！' },
    { type: 'msg',  from: 'them', time: '21:06', text: '下次一起去江边看吧，我知道一个视野超好的位置' },
    { type: 'day',  text: '今天' },
    { type: 'msg',  from: 'me',   time: '09:12', text: '好呀，周末怎么样？' },
    { type: 'msg',  from: 'them', time: '09:30', text: '周六下午吧，我先去占位置 📷' }
  ];

  /* MOCK 自动回复池 */
  var AUTO_REPLIES = [
    '哈哈，那就说定啦 😊',
    '对了，你之前说喜欢的那家咖啡店，我找到分店了，就在江边附近 ☕',
    '周六天气应该不错，期待！'
  ];
  var replyIdx = 0;

  var chatBody = document.getElementById('chatBody');
  var msgInput = document.getElementById('msgInput');
  var sendBtn = document.getElementById('sendBtn');
  var statusText = document.getElementById('statusText');
  var chatMenu = document.getElementById('chatMenu');
  var typingEl = null;

  /* ---------- 工具 ---------- */
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

  function nowTime() {
    var d = new Date();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function scrollToBottom(smooth) {
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }

  /* ---------- 消息渲染 ---------- */
  function appendMsg(item, withFlash) {
    if (item.type === 'day') {
      var day = document.createElement('div');
      day.className = 'msg-day';
      day.textContent = item.text;
      chatBody.appendChild(day);
      return;
    }
    if (item.type === 'time') {
      var tm = document.createElement('div');
      tm.className = 'msg-time';
      tm.textContent = item.text;
      chatBody.appendChild(tm);
      return;
    }

    var row = document.createElement('div');
    row.className = 'msg-row ' + (item.from === 'me' ? 'me' : 'them');
    var bubble = document.createElement('div');
    bubble.className = 'msg ' + (item.from === 'me' ? 'me' : 'them');
    if (withFlash) bubble.classList.add('flash');
    bubble.textContent = item.text;
    row.appendChild(bubble);
    chatBody.appendChild(row);
  }

  MESSAGES.forEach(function (m) { appendMsg(m, false); });
  scrollToBottom(false);

  /* ---------- 正在输入指示 ---------- */
  function showTyping() {
    if (typingEl) return;
    statusText.classList.add('typing');
    statusText.innerHTML = '<i></i>对方正在输入...';

    var row = document.createElement('div');
    row.className = 'msg-row them';
    row.innerHTML = '<div class="typing-bubble"><i></i><i></i><i></i></div>';
    chatBody.appendChild(row);
    typingEl = row;
    scrollToBottom(true);
  }

  function hideTyping() {
    statusText.classList.remove('typing');
    statusText.innerHTML = '<i></i>在线';
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  /* ---------- 对方回复（模拟） ---------- */
  function scheduleReply() {
    setTimeout(function () {
      showTyping();
      setTimeout(function () {
        hideTyping();
        appendMsg({
          type: 'msg',
          from: 'them',
          time: nowTime(),
          text: AUTO_REPLIES[replyIdx % AUTO_REPLIES.length]
        }, true); /* 新消息闪烁 */
        replyIdx += 1;
        scrollToBottom(true);
      }, 2000);
    }, 1400);
  }

  /* ---------- 发送消息 ---------- */
  function sendMessage() {
    var text = msgInput.value.trim();
    if (!text) return;

    appendMsg({ type: 'msg', from: 'me', time: nowTime(), text: text }, false);
    msgInput.value = '';
    sendBtn.disabled = true;
    scrollToBottom(true);

    scheduleReply(); /* 模拟对方回复 */
  }

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
  msgInput.addEventListener('input', function () {
    sendBtn.disabled = msgInput.value.trim() === '';
  });

  /* ---------- 顶栏菜单 ---------- */
  var menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var show = chatMenu.hidden;
    chatMenu.hidden = !show;
    menuBtn.setAttribute('aria-expanded', String(show));
  });
  document.addEventListener('click', function (e) {
    if (!chatMenu.hidden && !chatMenu.contains(e.target) && e.target !== menuBtn) {
      chatMenu.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
  document.getElementById('clearChat').addEventListener('click', function () {
    chatMenu.hidden = true;
    chatBody.innerHTML = '';
    appendMsg({ type: 'day', text: '聊天记录已清空（演示）' });
  });
  document.getElementById('reportBtn').addEventListener('click', function () {
    chatMenu.hidden = true;
    toast('举报已提交，我们会尽快处理');
  });

  /* ---------- 表情 / 图片按钮（演示） ---------- */
  document.getElementById('emojiBtn').addEventListener('click', function () {
    msgInput.value += ' 😊';
    sendBtn.disabled = false;
    msgInput.focus();
  });
  document.getElementById('imgBtn').addEventListener('click', function () {
    toast('图片发送将在后端接入后开放');
  });

})();
