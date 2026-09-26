/**
 * overview.js — 测评总览（对应小程序 pages/assessment-overview/index.js）
 * 数据来源：记录列表页暂存的 currentAssessmentOverview（对应 app.globalData）
 * 跳转逻辑：既往病史 → disease-history；各表单 → record-detail?id=xxx
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  // ===== 读取暂存数据（对应小程序 onLoad 读取 globalData.currentAssessmentOverview）=====
  var data = getSessionData(OVERVIEW_DATA_KEY) || {};
  var forms = data.forms || [];
  var typeMap = SCALE_TYPE_MAP;
  for (var i = 0; i < forms.length; i++) {
    forms[i].form_name = typeMap[forms[i].scale_type] || forms[i].scale_type;
  }

  $('userName').textContent = data.user_name || '-';
  $('gender').textContent = data.gender || '-';
  $('age').textContent = (data.age || '-') + '岁';
  $('occupation').textContent = data.occupation || '-';
  $('workYears').textContent = data.work_years ? data.work_years + '年' : '-';
  $('education').textContent = data.education || '-';
  $('latestTime').textContent = data.latest_time || '-';

  var userId = data.user_id || '';

  // ===== 各表单列表 =====
  var html = '';
  for (var j = 0; j < forms.length; j++) {
    var form = forms[j];
    html +=
      '<button class="form-card" data-index="' + j + '">' +
        '<div class="form-header">' +
          '<span class="form-title">' + escapeHtml(form.form_name) + '</span>' +
          '<span class="form-score">' + (form.total_score != null ? form.total_score : '-') + '分</span>' +
        '</div>' +
        '<span class="form-arrow">›</span>' +
      '</button>';
  }
  $('formList').innerHTML = html;

  var cards = $('formList').querySelectorAll('.form-card');
  for (var k = 0; k < cards.length; k++) {
    cards[k].addEventListener('click', function () {
      var form = forms[Number(this.getAttribute('data-index'))];
      // 对应 wx.navigateTo({ url: '/pages/record-detail/index?id=' + form.id })
      navigateTo('record-detail.html?id=' + form.id);
    });
  }

  // ===== 既往病史（对应小程序 onDiseaseHistoryTap）=====
  $('diseaseHistoryCard').addEventListener('click', function () {
    // 对应 wx.navigateTo({ url: '/pages/disease-history/index?user_id=' + ... + '&name=' + encodeURIComponent(...) })
    navigateTo('disease-history.html?user_id=' + userId + '&name=' + encodeURIComponent(data.user_name || ''));
  });

  // 返回
  $('navBack').addEventListener('click', function () { navigateBack(); });
})();
