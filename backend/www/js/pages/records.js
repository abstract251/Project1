/**
 * records.js — 测评记录列表（对应小程序 pages/assessment-records/index.js）
 * 分页加载、关键字搜索、点击记录进入测评总览，逻辑与小程序版一致。
 * 桌面端增强：宽屏数据表格展示 + "加载更多"按钮；手机端保持卡片列表 + 滚动加载。
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var records = [];
  var page = 1;
  var pageSize = 20;
  var total = 0;
  var loading = false;
  var hasMore = true;
  var keyword = '';

  // 桌面端判断（与 CSS 断点 480px 一致）
  function isDesktop() {
    return window.innerWidth > 480;
  }

  // ===== 加载记录（对应小程序 loadRecords）=====
  function loadRecords(isRefresh, forcePage) {
    var p = isRefresh ? 1 : (forcePage !== undefined ? forcePage : page);
    if (!isRefresh && loading) return;

    loading = true;
    $('loadingMore').style.display = '';

    request({
      url: API_BASE_URL + '/api/admin/sleep-records',
      method: 'GET',
      data: {
        page: p,
        page_size: pageSize,
        keyword: keyword
      }
    }).then(function (res) {
      if (res.data && res.data.code === 0) {
        var d = res.data.data;
        records = isRefresh ? d.records : records.concat(d.records);
        var typeMap = SCALE_TYPE_MAP;
        for (var i = 0; i < records.length; i++) {
          var forms = records[i].forms || [];
          for (var j = 0; j < forms.length; j++) {
            forms[j].form_name = typeMap[forms[j].scale_type] || forms[j].scale_type;
          }
        }
        page = p;
        total = d.total;
        hasMore = records.length < d.total;
        render();
      } else {
        render();
      }
      loading = false;
      $('loadingMore').style.display = 'none';
    }).catch(function () {
      loading = false;
      $('loadingMore').style.display = 'none';
      // 对应 wx.showToast({ title: '加载失败', icon: 'none' })
      showToast('加载失败', 'none');
    });
  }

  // ===== 进入总览（对应小程序 onRecordTap）=====
  function openOverview(record) {
    // 对应小程序 app.globalData.currentAssessmentOverview
    setSessionData(OVERVIEW_DATA_KEY, {
      forms: record.forms,
      user_name: record.user_name,
      gender: record.gender || '',
      age: record.age || '',
      occupation: record.occupation || '',
      work_years: record.work_years != null ? record.work_years : '',
      education: record.education || '',
      latest_time: record.latest_time,
      total_score: record.total_score,
      user_id: record.user_id || ''
    });
    // 对应 wx.navigateTo({ url: '/pages/assessment-overview/index' })
    navigateTo('overview.html');
  }

  // 查找某量表得分（forms 数组按 scale_type）
  function formScore(forms, type) {
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].scale_type === type) {
        return forms[i].total_score != null ? forms[i].total_score : '-';
      }
    }
    return '-';
  }

  // ===== 渲染：手机端卡片列表 =====
  function renderCards() {
    var html = '';
    for (var i = 0; i < records.length; i++) {
      var item = records[i];
      var formsHtml = '';
      var forms = item.forms || [];
      for (var j = 0; j < forms.length; j++) {
        var form = forms[j];
        formsHtml +=
          '<div class="form-item">' +
            '<span class="form-name">' + escapeHtml(form.form_name) + '</span>' +
            '<span class="form-score">' + (form.total_score != null ? form.total_score : '-') + '分</span>' +
          '</div>';
      }
      html +=
        '<div class="record-card" data-index="' + i + '">' +
          '<div class="card-main">' +
            '<div class="card-row row-top">' +
              '<span class="user-name">' + escapeHtml(item.user_name) + '</span>' +
              '<span class="user-gender">' + escapeHtml(item.gender || '-') + '</span>' +
              '<span class="user-info">' + escapeHtml(item.age || '-') + '岁</span>' +
              (item.occupation ? '<span class="user-info">' + escapeHtml(item.occupation) + '</span>' : '') +
            '</div>' +
            '<div class="forms-grid">' + formsHtml + '</div>' +
            '<div class="card-row row-bottom">' +
              '<span class="total-score">总分：' + (item.total_score != null ? item.total_score : 0) + '分</span>' +
              '<span class="submit-time">' + escapeHtml(item.latest_time || '') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="card-arrow">›</div>' +
        '</div>';
    }
    $('recordList').innerHTML = html;

    var cards = $('recordList').querySelectorAll('.record-card');
    for (var k = 0; k < cards.length; k++) {
      cards[k].addEventListener('click', function () {
        openOverview(records[Number(this.getAttribute('data-index'))]);
      });
    }
  }

  // ===== 渲染：桌面端宽屏数据表格 =====
  function renderTable() {
    var thead =
      '<thead>' +
        '<tr>' +
          '<th>用户</th>' +
          '<th>性别</th>' +
          '<th>年龄</th>' +
          '<th>职业</th>' +
          '<th>Sleep-50</th>' +
          '<th>PSQI</th>' +
          '<th>PHQ-9</th>' +
          '<th>GAD-7</th>' +
          '<th>SCL-90</th>' +
          '<th>总分</th>' +
          '<th>提交时间</th>' +
        '</tr>' +
      '</thead>';

    var tbody = '<tbody>';
    for (var i = 0; i < records.length; i++) {
      var item = records[i];
      var forms = item.forms || [];
      tbody +=
        '<tr class="record-row" data-index="' + i + '">' +
          '<td class="td-user"><span class="td-user-name">' + escapeHtml(item.user_name) + '</span></td>' +
          '<td>' + escapeHtml(item.gender || '-') + '</td>' +
          '<td>' + escapeHtml(item.age || '-') + '</td>' +
          '<td>' + escapeHtml(item.occupation || '-') + '</td>' +
          '<td class="td-score">' + formScore(forms, 'sleep50') + '</td>' +
          '<td class="td-score">' + formScore(forms, 'psqi') + '</td>' +
          '<td class="td-score">' + formScore(forms, 'phq9') + '</td>' +
          '<td class="td-score">' + formScore(forms, 'gad7') + '</td>' +
          '<td class="td-score">' + formScore(forms, 'scl90') + '</td>' +
          '<td class="td-total">' + (item.total_score != null ? item.total_score : 0) + '</td>' +
          '<td class="td-time">' + escapeHtml(item.latest_time || '-') + '</td>' +
        '</tr>';
    }
    tbody += '</tbody>';

    $('recordList').innerHTML =
      '<div class="table-wrap">' +
        '<table class="records-table">' + thead + tbody + '</table>' +
      '</div>';

    var rows = $('recordList').querySelectorAll('.record-row');
    for (var k = 0; k < rows.length; k++) {
      rows[k].addEventListener('click', function () {
        openOverview(records[Number(this.getAttribute('data-index'))]);
      });
    }
  }

  // ===== 渲染入口（根据设备选择卡片或表格）=====
  function render() {
    $('listTitle').textContent = '共 ' + total + ' 条记录';

    if (records.length === 0) {
      $('emptyState').style.display = '';
    } else {
      $('emptyState').style.display = 'none';
    }

    if (records.length > 0) {
      if (isDesktop()) {
        renderTable();
      } else {
        renderCards();
      }
    } else {
      $('recordList').innerHTML = '';
    }

    // 已加载全部提示（桌面端表格下同样显示）
    if (!hasMore && records.length > 0) {
      $('loadMoreTip').style.display = '';
    } else {
      $('loadMoreTip').style.display = 'none';
    }

    // "加载更多"按钮：仅桌面端显示
    if (isDesktop() && hasMore && records.length > 0) {
      $('loadMoreBtnWrap').style.display = '';
    } else {
      $('loadMoreBtnWrap').style.display = 'none';
    }
  }

  // ===== 加载更多（桌面端按钮 / 移动端滚动共用）=====
  function loadMore() {
    if (hasMore && !loading) {
      var nextPage = page + 1;
      page = nextPage;
      loadRecords(false, nextPage);
    }
  }

  // ===== 搜索（对应小程序 onSearch）=====
  function onSearch() {
    page = 1;
    loadRecords(true);
  }

  // ===== 滚动到底部加载更多（仅手机端，对应小程序 onLoadMore）=====
  window.addEventListener('scroll', function () {
    if (!isDesktop() && hasMore && !loading) {
      var doc = document.documentElement;
      if (doc.scrollTop + window.innerHeight >= doc.scrollHeight - 80) {
        loadMore();
      }
    }
  });

  // ===== 事件绑定 =====
  $('navBack').addEventListener('click', function () { navigateBack(); });
  $('searchBtn').addEventListener('click', onSearch);
  $('loadMoreBtn').addEventListener('click', loadMore);
  $('keyword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') onSearch();
  });
  $('keyword').addEventListener('input', function (e) { keyword = e.target.value; });

  // 桌面/手机切换时重渲染
  window.addEventListener('resize', function () {
    render();
  });

  // ===== 初始化（对应小程序 onLoad）=====
  loadRecords();
})();
