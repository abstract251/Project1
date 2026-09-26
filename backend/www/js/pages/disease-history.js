/**
 * disease-history.js — 既往病史（对应小程序 pages/disease-history/index.js）
 * 从后端 /api/admin/user-diseases/{user_id} 加载用户信息、既往病史、月经史。
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var userId = getQueryParam('user_id') || '';

  $('userName').textContent = decodeURIComponent(getQueryParam('name') || '') || '-';

  // ===== 加载（对应小程序 onLoad）=====
  if (!userId) {
    $('loadingSection').style.display = 'none';
    $('contentArea').style.display = '';
    return;
  }

  request({
    url: API_BASE_URL + '/api/admin/user-diseases/' + userId,
    method: 'GET'
  }).then(function (res) {
    if (res.data && res.data.code === 0) {
      var d = res.data.data;
      var user = d.user || {};
      var diseases = d.diseases || [];

      $('userName').textContent = user.name || $('userName').textContent;
      $('userGender').textContent = user.gender || '-';
      $('userAge').textContent = (user.age || '-') + '岁';
      $('userOccupation').textContent = user.occupation || '-';
      $('userWorkYears').textContent = user.work_years ? user.work_years + '年' : '-';
      $('userEducation').textContent = user.education || '-';

      // 既往病史
      if (diseases.length > 0) {
        $('emptyState').style.display = 'none';
        var html = '';
        for (var i = 0; i < diseases.length; i++) {
          var item = diseases[i];
          var statusText = item.status === '是' ? '患病' : (item.status === '否' ? '未患病' : item.status);
          var statusClass = item.status === '是' ? 'status-yes' : (item.status === '否' ? 'status-no' : 'status-unknown');
          html += '<div class="disease-item">' +
            '<div class="disease-header">' +
              '<span class="disease-name">' + escapeHtml(item.disease_name) + '</span>' +
              '<span class="disease-status ' + statusClass + '">' + escapeHtml(statusText) + '</span>' +
            '</div>';
          if (item.status === '是' && item.drug_name) {
            html += '<div class="disease-drug">' +
              '<span class="drug-label">用药情况：</span>' +
              '<span class="drug-value">' + escapeHtml(item.drug_name) + '</span>' +
            '</div>';
          }
          html += '</div>';
        }
        $('diseaseList').innerHTML = html;
      } else {
        $('emptyState').style.display = '';
      }

      // 月经史（仅女性）
      if (d.menstrual) {
        $('menstrualCard').style.display = '';
        var m = d.menstrual;
        var isRegularText = m.is_regular === '是' ? '规律' : (m.is_regular === '否' ? '不规律' : (m.is_regular || '-'));
        $('menstrualGrid').innerHTML =
          '<div class="menstrual-row">' +
            '<span class="m-label">初潮年龄</span><span class="m-value">' + (m.menarche_age || '-') + '岁</span>' +
            '<span class="m-label">经期天数</span><span class="m-value">' + (m.period_days || '-') + '天</span>' +
          '</div>' +
          '<div class="menstrual-row">' +
            '<span class="m-label">周期天数</span><span class="m-value">' + (m.cycle_days || '-') + '天</span>' +
            '<span class="m-label">末次月经</span><span class="m-value">' + escapeHtml(m.last_period || '-') + '</span>' +
          '</div>' +
          '<div class="menstrual-row">' +
            '<span class="m-label">经量</span><span class="m-value">' + escapeHtml(m.volume || '-') + '</span>' +
            '<span class="m-label">痛经</span><span class="m-value">' + escapeHtml(m.dysmenorrhea || '-') + '</span>' +
          '</div>' +
          '<div class="menstrual-row">' +
            '<span class="m-label">规律性</span><span class="m-value">' + escapeHtml(isRegularText) + '</span>' +
            '<span class="m-label"></span><span class="m-value"></span>' +
          '</div>';
      }
    }
    $('loadingSection').style.display = 'none';
    $('contentArea').style.display = '';
  }).catch(function () {
    $('loadingSection').style.display = 'none';
    $('contentArea').style.display = '';
  });

  // 返回
  $('navBack').addEventListener('click', function () { navigateBack(); });
})();
