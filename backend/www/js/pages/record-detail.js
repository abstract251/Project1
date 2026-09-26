/**
 * record-detail.js — 测评详情（对应小程序 pages/record-detail/index.js）
 * 按量表类型渲染对应的结果分析报告、填空题详情、答题详情。
 * 数据来自后端 /api/records/detail/{id}，渲染逻辑与小程序 WXML 一致。
 */

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var recordId = getQueryParam('id');

  // ===== 加载详情（对应小程序 loadDetail）=====
  function loadDetail() {
    $('loadingSection').style.display = '';
    $('pageContent').style.display = 'none';

    request({
      url: API_BASE_URL + '/api/records/detail/' + recordId,
      method: 'GET'
    }).then(function (res) {
      if (res.data && res.data.code === 0) {
        render(res.data.data);
      } else {
        $('loadingSection').style.display = 'none';
        // 对应 wx.showToast({ title: '加载失败', icon: 'none' })
        showToast('加载失败', 'none');
      }
    }).catch(function () {
      $('loadingSection').style.display = 'none';
      // 对应 wx.showToast({ title: '网络错误', icon: 'none' })
      showToast('网络错误', 'none');
    });
  }

  // ===== 渲染（对应小程序 onLoad 成功回调中的数据处理与 WXML）=====
  function render(d) {
    var rec = d.record || {};

    // PSQI 因子处理
    var psqiFactors = d.psqi_factors || [];
    var psqiTotal = d.psqi_total != null ? d.psqi_total : (rec.total_score || 0);
    var psqiInterpretation = rec.interpretation || '';

    // Sleep-50 因子处理
    var sleep50Data = d.sleep50_data || null;
    var sleep50Factors = [];
    var sleep50Total = 0;
    var sleep50Text = '';
    if (sleep50Data) {
      sleep50Factors = sleep50Data.factors || [];
      sleep50Total = sleep50Data.total || 0;
    }
    sleep50Text = rec.interpretation || '';

    // SCL-90 数据
    var scl90FactorRows = d.scl90_factor_rows || null;
    var scl90Total = rec.total_score || 0;
    var scl90GSI = rec.avg_score != null ? Number(rec.avg_score).toFixed(2) : '0.00';
    var scl90PositiveItems = rec.positive_items || 0;
    var scl90NegativeItems = 90 - scl90PositiveItems;
    var scl90PSDL = rec.psdl != null ? Number(rec.psdl).toFixed(2) : '0.00';
    var scl90Interpretation = rec.interpretation || '';

    // PHQ-9 数据
    var phq9Total = rec.total_score || 0;
    var phq9Level = rec.severity || '';
    var phq9Interpretation = rec.interpretation || '';

    // GAD-7 数据
    var gad7Total = rec.total_score || 0;
    var gad7Level = rec.severity || '';
    var gad7Interpretation = rec.interpretation || '';

    var allFills = d.psqi_fills || [];
    var psqiFills = [];
    var sleep50Fills = [];
    for (var fi = 0; fi < allFills.length; fi++) {
      var qid = allFills[fi].question_id;
      if (qid >= 1 && qid <= 14) {
        psqiFills.push(allFills[fi]);
      } else if (qid >= 51 && qid <= 54) {
        sleep50Fills.push(allFills[fi]);
      }
    }

    // PSQI 因子配对（7因子 → 4行, 2列）
    var psqiFactorPairs = [];
    for (var pi = 0; pi < psqiFactors.length; pi += 2) {
      psqiFactorPairs.push([psqiFactors[pi], psqiFactors[pi + 1] || null]);
    }

    // Sleep-50 因子配对（5因子 → 3行, 2列）
    var sleep50FactorPairs = [];
    for (var si = 0; si < sleep50Factors.length; si += 2) {
      sleep50FactorPairs.push([sleep50Factors[si], sleep50Factors[si + 1] || null]);
    }

    var answers = d.answers || [];
    var factors = d.factors || [];

    var html = '';

    // ===== 用户信息卡片 =====
    html += '<div class="info-card">';
    html += '<div class="info-row"><span class="info-label">用户姓名</span><span class="info-value">' + escapeHtml(rec.user_name || '') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">性别</span><span class="info-value">' + escapeHtml(rec.gender || '-') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">年龄</span><span class="info-value">' + escapeHtml(rec.age || '-') + '岁</span></div>';
    html += '<div class="info-row"><span class="info-label">岗位</span><span class="info-value">' + escapeHtml(rec.occupation || '-') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">工作年限</span><span class="info-value">' + (rec.work_years != null ? rec.work_years + '年' : '-') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">文化程度</span><span class="info-value">' + escapeHtml(rec.education || '-') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">提交时间</span><span class="info-value">' + escapeHtml(rec.created_at || '-') + '</span></div>';
    html += '</div>';

    // ===== PSQI 量表：结果分析 =====
    if (rec.scale_type === 'psqi') {
      html += '<div class="psqi-result-card">';
      html += '<span class="psqi-result-title">测评结果及因子得分（总分：' + psqiTotal + ' 分）</span>';

      if (psqiFactorPairs.length > 0) {
        html += '<div class="psqi-table-wrap">';
        html += '<div class="psqi-thead"><div class="psqi-th">因子</div><div class="psqi-th">得分</div><div class="psqi-th">因子</div><div class="psqi-th">得分</div></div>';
        for (var pi2 = 0; pi2 < psqiFactorPairs.length; pi2++) {
          var pair = psqiFactorPairs[pi2];
          html += '<div class="psqi-tr">' +
            '<div class="psqi-td shade">' + escapeHtml(pair[0].name) + '</div>' +
            '<div class="psqi-td score">' + pair[0].score + '</div>';
          if (pair[1]) {
            html += '<div class="psqi-td shade">' + escapeHtml(pair[1].name) + '</div><div class="psqi-td score">' + pair[1].score + '</div>';
          } else {
            html += '<div class="psqi-td"></div><div class="psqi-td"></div>';
          }
          html += '</div>';
        }
        html += '</div>';
      }

      html += '<div class="psqi-note"><span class="psqi-note-label">得分解释：</span><span>各维度根据严重程度按照 0～3 分计分，总分为 0～21 分，得分越高睡眠质量越差。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label red">总分解释：</span><span>总分>7分提示存在睡眠质量差，需进一步关注；≤5分表示睡眠质量较好，6-7分处于临界状态。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label">结论：</span><span>' + escapeHtml(psqiInterpretation) + '</span></div>';
      html += '</div>';
    }

    // ===== Sleep-50 量表：结果分析 =====
    if (rec.scale_type === 'sleep50') {
      html += '<div class="psqi-result-card">';
      html += '<span class="psqi-result-title">Sleep-50 测评结果及因子得分（总分：' + sleep50Total + ' 分）</span>';

      if (sleep50FactorPairs.length > 0) {
        html += '<div class="psqi-table-wrap">';
        html += '<div class="psqi-thead"><div class="psqi-th">因子</div><div class="psqi-th">得分</div><div class="psqi-th">因子</div><div class="psqi-th">得分</div></div>';
        for (var si2 = 0; si2 < sleep50FactorPairs.length; si2++) {
          var spair = sleep50FactorPairs[si2];
          html += '<div class="psqi-tr">' +
            '<div class="psqi-td shade">' + escapeHtml(spair[0].name) + '</div>' +
            '<div class="psqi-td score">' + spair[0].score + '</div>';
          if (spair[1]) {
            html += '<div class="psqi-td shade">' + escapeHtml(spair[1].name) + '</div><div class="psqi-td score">' + spair[1].score + '</div>';
          } else {
            html += '<div class="psqi-td"></div><div class="psqi-td"></div>';
          }
          html += '</div>';
        }
        html += '</div>';
      }

      html += '<div class="psqi-note"><span class="psqi-note-label">得分解释：</span><span>各因子得分≥界限分时提示存在该维度问题（失眠≥15、睡眠呼吸障碍≥12、不宁腿综合征≥10、昼夜节律紊乱≥8、睡眠行为异常≥6）。总分范围 0～200 分，得分越高表示睡眠问题越严重。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label red">总分解释：</span><span>0-50 分：睡眠质量良好 | 51-100 分：轻度睡眠问题 | 101-150 分：中度睡眠障碍 | 151-200 分：严重睡眠障碍</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label">结论：</span><span>' + escapeHtml(sleep50Text) + '</span></div>';
      html += '<div class="psqi-note" style="color:#999;font-size:12px;margin-top:10px;"><span>（本报告只作为临床参考）</span></div>';
      html += '</div>';
    }

    // ===== Sleep-50 附加评估题目（Q51-Q54）=====
    if (rec.scale_type === 'sleep50' && sleep50Fills.length > 0) {
      html += '<div class="answers-card">';
      html += '<span class="section-title">附加评估题目</span>';
      html += '<div class="answers-list">';
      for (var fi2 = 0; fi2 < sleep50Fills.length; fi2++) {
        var fitem = sleep50Fills[fi2];
        var suffix = '';
        if (fitem.question_id === 51) suffix = ' 分';
        else if (fitem.question_id === 52) suffix = ' 小时';
        else if (fitem.question_id === 53) suffix = ' 点';
        else if (fitem.question_id === 54) suffix = ' 点';
        html += '<div class="answer-item">' +
          '<div class="answer-header">' +
            '<span class="question-num">第' + fitem.question_id + '题</span>' +
            '<span class="answer-score">' + escapeHtml(fitem.fill_value) + suffix + '</span>' +
          '</div>' +
          '<div class="question-text">' + escapeHtml(fitem.question_text || '附加评估') + '</div>' +
        '</div>';
      }
      html += '</div></div>';
    }

    // ===== SCL-90 量表：结果分析 =====
    if (rec.scale_type === 'scl90' && scl90FactorRows) {
      html += '<div class="psqi-result-card">';
      html += '<span class="psqi-result-title">症状自评量表(SCL-90)测评结果及整体指标</span>';

      html += '<div class="psqi-table-wrap">';
      html += '<div class="psqi-thead"><div class="psqi-th">测评指标</div><div class="psqi-th">分值</div><div class="psqi-th">参考 (M±SD)</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">总分</div><div class="psqi-td score">' + scl90Total + '</div><div class="psqi-td">129.96 ± 38.76</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">总均分</div><div class="psqi-td score">' + scl90GSI + '</div><div class="psqi-td">1.44 ± 0.43</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">阳性项目数</div><div class="psqi-td score">' + scl90PositiveItems + '</div><div class="psqi-td">24.92 ± 18.41</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">阴性项目数</div><div class="psqi-td score">' + scl90NegativeItems + '</div><div class="psqi-td">65.08 ± 18.33</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">阳性项目均分</div><div class="psqi-td score">' + scl90PSDL + '</div><div class="psqi-td">2.60 ± 0.59</div></div>';
      html += '</div>';

      html += '<div style="height:16px;"></div>';
      html += '<span class="psqi-result-title" style="font-size:14px;">各因子得分及程度</span>';

      html += '<div class="psqi-table-wrap">';
      html += '<div class="psqi-thead"><div class="psqi-th">因子</div><div class="psqi-th">均分</div><div class="psqi-th">参考 (M±SD)</div><div class="psqi-th">程度</div></div>';
      for (var fi3 = 0; fi3 < scl90FactorRows.length; fi3++) {
        var frow = scl90FactorRows[fi3];
        var levelClass = '';
        if (frow.level === '中') levelClass = ' level-medium';
        else if (frow.level === '重') levelClass = ' level-heavy';
        html += '<div class="psqi-tr">' +
          '<div class="psqi-td shade">' + escapeHtml(frow.name) + '</div>' +
          '<div class="psqi-td score">' + frow.score + '</div>' +
          '<div class="psqi-td">' + escapeHtml(frow.ref) + '</div>' +
          '<div class="psqi-td' + levelClass + '">' + escapeHtml(frow.level) + '</div>' +
        '</div>';
      }
      html += '</div>';

      html += '<div class="psqi-note"><span class="psqi-note-label">得分解释：</span><span>单项分 1~5 分。因子均分 = 该因子总分 ÷ 项目数。程度判定：＜ M+SD 为轻度，M+SD ~ M+2SD 为中度，≥ M+2SD 为重度。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label red">结论：</span><span>' + escapeHtml(scl90Interpretation) + '</span></div>';
      html += '<div class="psqi-note" style="color:#999;font-size:12px;margin-top:10px;"><span>（本报告只作为临床参考）</span></div>';
      html += '</div>';
    }

    // ===== PHQ-9 量表：结果分析 =====
    if (rec.scale_type === 'phq9') {
      html += '<div class="psqi-result-card">';
      html += '<span class="psqi-result-title">患者健康问卷(PHQ-9)测评结果</span>';

      html += '<div class="psqi-table-wrap">';
      html += '<div class="psqi-thead"><div class="psqi-th">指标</div><div class="psqi-th">分值</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">总分</div><div class="psqi-td score">' + phq9Total + '</div></div>';
      html += '</div>';

      html += '<div class="psqi-note"><span class="psqi-note-label">得分解释：</span><span>共 9 个条目，每项评分 0~3 分，得分越高表示症状出现频率越高。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label red">总分解释：</span><span>PHQ-9 ≥ 5 分认为存在抑郁。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label">结论：</span><span>' + escapeHtml(phq9Interpretation) + '</span></div>';
      html += '<div class="psqi-note" style="color:#999;font-size:12px;margin-top:10px;"><span>（本报告只作为临床参考）</span></div>';
      html += '</div>';
    }

    // ===== GAD-7 量表：结果分析 =====
    if (rec.scale_type === 'gad7') {
      html += '<div class="psqi-result-card">';
      html += '<span class="psqi-result-title">焦虑障碍量表(GAD-7)测评结果</span>';

      html += '<div class="psqi-table-wrap">';
      html += '<div class="psqi-thead"><div class="psqi-th">指标</div><div class="psqi-th">分值</div></div>';
      html += '<div class="psqi-tr"><div class="psqi-td shade">总分</div><div class="psqi-td score">' + gad7Total + '</div></div>';
      html += '</div>';

      html += '<div class="psqi-note"><span class="psqi-note-label">得分解释：</span><span>共 7 个条目，每项评分 0~3 分，得分越高表示症状出现频率越高。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label red">总分解释：</span><span>GAD-7 ≥ 5 分认为存在焦虑。</span></div>';
      html += '<div class="psqi-note"><span class="psqi-note-label">结论：</span><span>' + escapeHtml(gad7Interpretation) + '</span></div>';
      html += '<div class="psqi-note" style="color:#999;font-size:12px;margin-top:10px;"><span>（本报告只作为临床参考）</span></div>';
      html += '</div>';
    }

    // ===== 因子得分（非 scl90/psqi/sleep50 的其它量表）=====
    if (factors.length > 0 && rec.scale_type !== 'scl90' && rec.scale_type !== 'psqi' && rec.scale_type !== 'sleep50') {
      html += '<div class="factors-card">';
      html += '<span class="section-title">因子得分</span>';
      html += '<div class="factors-list">';
      for (var fi4 = 0; fi4 < factors.length; fi4++) {
        var fitem2 = factors[fi4];
        html += '<div class="factor-item"><span class="factor-name">' + escapeHtml(fitem2.factor_name) + '</span><span class="factor-score">' + fitem2.factor_score + '</span></div>';
      }
      html += '</div></div>';
    }

    // ===== PSQI 填空题详情 =====
    if (rec.scale_type === 'psqi' && psqiFills.length > 0) {
      html += '<div class="answers-card">';
      html += '<span class="section-title">填空题详情</span>';
      html += '<div class="answers-list">';
      for (var fi5 = 0; fi5 < psqiFills.length; fi5++) {
        var pf = psqiFills[fi5];
        html += '<div class="answer-item">';
        html += '<div class="answer-header">' +
          '<span class="question-num">第' + pf.question_id + '题</span>';
        if (pf.question_id !== 14) {
          html += '<span class="answer-score">' + escapeHtml(pf.fill_value) + '</span>';
        }
        html += '</div>';
        html += '<div class="question-text">' + escapeHtml(pf.question_text || '近1个月，关于睡眠的问题') + '</div>';
        if (pf.question_id === 14) {
          html += '<div class="fill-reason">' + escapeHtml(pf.fill_value) + '</div>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }

    // ===== 答题详情 =====
    if (answers.length > 0) {
      html += '<div class="answers-card">';
      html += '<span class="section-title">答题详情</span>';
      html += '<div class="answers-list">';
      for (var fi6 = 0; fi6 < answers.length; fi6++) {
        var a = answers[fi6];
        html += '<div class="answer-item">' +
          '<div class="answer-header">' +
            '<span class="question-num">第' + a.question_id + '题</span>' +
            '<span class="answer-score">' + escapeHtml(a.option_label || '') + '</span>' +
          '</div>' +
          '<div class="question-text">' + escapeHtml(a.question_text || '') + '</div>' +
          (a.option_desc ? '<div class="answer-desc">' + escapeHtml(a.option_desc) + '</div>' : '') +
        '</div>';
      }
      html += '</div></div>';
    }

    $('pageContent').innerHTML = html;
    $('loadingSection').style.display = 'none';
    $('pageContent').style.display = '';
  }

  // 返回
  $('navBack').addEventListener('click', function () { navigateBack(); });

  // ===== 初始化（对应小程序 onLoad(options)）=====
  loadDetail();
})();
