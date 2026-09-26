/**
 * assessment.js — 测评页（对应小程序 pages/assessment/index.js）
 * =====================================================
 * 所有题目数据见 js/questions.js（与小程序版逐字一致）；
 * 计分逻辑见 js/scoring.js（与小程序版一致）。
 * 本文件复刻小程序的答题交互与跳转逻辑：
 *   - Sleep-50 第32题选"根本没有"(value=1) → 跳过33~36直接到37；从37返回时跳回32
 *   - PSQI 第14题选非"无"必须填写原因
 *   - 提交前检查未答题并跳到最早未答题
 *   - 全部量表完成后顺序提交5张表到后端（避免部分成功导致数据不完整）
 * =====================================================
 */

(function () {
  'use strict';

  // ===== 状态（对应小程序 Page.data）=====
  var state = {
    currentTab: 0,
    currentScaleKey: SCALES[0].key,
    currentQuestionId: 1,
    answers: {
      sleep50: {},
      sleep50Fill: {},
      psqi: {},
      psqiFill: {},
      phq9: {},
      gad7: {},
      scl90: {}
    },
    submitted: {
      sleep50: false,
      psqi: false,
      phq9: false,
      gad7: false,
      scl90: false
    },
    allDone: false,
    isSubmitting: false,
    // 视图状态（动态计算）
    currentInstructions: SCALES[0].instructions,
    currentQuestionText: SLEEP50_QUESTIONS[0].text,
    currentOptions: SLEEP50_OPTIONS,
    currentQuestionIndex: 0,
    currentTotal: 50,
    progressPercent: '2.0',
    isFillBlank: false,
    fillPickerType: 'input',
    fillTimeValue: nowTimeString(),
    fillPlaceholder: '',
    fillType: 'text',
    fillHint: '',
    fillValue: '',
    psqiOtherReason: '',
    selectedValue: null,
    isLastQuestion: false,
    // 结果数据
    results: null
  };

  // ===== DOM =====
  function $(id) { return document.getElementById(id); }

  var elScaleTabs = $('scaleTabs');
  var elQuizMode = $('quizMode');
  var elReportArea = $('reportArea');
  var elInstructions = $('instructions');
  var elProgressFill = $('progressFill');
  var elProgressText = $('progressText');
  var elQuestionIcon = $('questionIcon');
  var elQuestionText = $('questionText');
  var elFillBlankArea = $('fillBlankArea');
  var elTimePickerWrap = $('timePickerWrap');
  var elTimePicker = $('timePicker');
  var elFillInputWrap = $('fillInputWrap');
  var elFillInput = $('fillInput');
  var elFillHint = $('fillHint');
  var elOptionsArea = $('optionsArea');
  var elPsqiOther = $('psqiOther');
  var elPsqiOtherInput = $('psqiOtherInput');
  var elPageIndicator = $('pageIndicator');
  var elPrevBtn = $('prevBtn');
  var elNextBtn = $('nextBtn');
  var elSubmitBtn = $('submitBtn');

  // ===== 缓存（对应小程序 onLoad 中的本地缓存恢复）=====
  function loadCache() {
    // 恢复本地缓存的答题数据（防网络波动导致数据丢失）
    var cache = getStorage(ASSESSMENT_CACHE_KEY);
    // 兼容旧缓存 key 'sleep_cache'
    if (!cache || !cache.answers) {
      cache = getStorage(OLD_SLEEP_CACHE_KEY);
    }
    if (cache) {
      state.answers = cache.answers || { sleep50: {}, sleep50Fill: {}, psqi: {}, psqiFill: {}, phq9: {}, gad7: {}, scl90: {} };
      state.submitted = cache.submitted || { sleep50: false, psqi: false, phq9: false, gad7: false, scl90: false };
      state.psqiOtherReason = cache.psqiOtherReason || '';
    }
  }

  // 将当前答题数据缓存到本地（对应小程序 _saveCache）
  function saveCache() {
    setStorage(ASSESSMENT_CACHE_KEY, {
      answers: state.answers,
      submitted: state.submitted,
      psqiOtherReason: state.psqiOtherReason
    });
  }

  // ===== 根据当前 tab 和 questionId 更新视图状态（对应小程序 updateViewState）=====
  function updateViewState() {
    var scale = SCALES[state.currentTab];
    var questions = scale.questions;
    var qIndex = 0;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].id === state.currentQuestionId) {
        qIndex = i;
        break;
      }
    }
    var question = questions[qIndex];
    var isFill = false;
    for (var j = 0; j < scale.fillBlankIndices.length; j++) {
      if (scale.fillBlankIndices[j] === question.id) {
        isFill = true;
        break;
      }
    }

    var fillPlaceholder = '';
    var fillType = 'text';
    var fillHint = '';
    var fillPickerType = 'input';
    var fillTimeValue = '22:00';
    var opts = question.options || [];

    if (isFill) {
      if (question.id === 1) {
        fillPlaceholder = '例 22:30（时:分）';
        fillType = 'text';
        fillHint = '请选择具体时间（时:分）';
        fillPickerType = 'time';
      } else if (question.id === 2) {
        fillPlaceholder = '请输入分钟数';
        fillType = 'digit';
        fillHint = '请输入具体分钟数';
      } else if (question.id === 3) {
        fillPlaceholder = '例 07:00（时:分）';
        fillType = 'text';
        fillHint = '请选择具体时间（时:分）';
        fillPickerType = 'time';
      } else if (question.id === 4) {
        fillPlaceholder = '请输入小时数';
        fillType = 'digit';
        fillHint = '请输入具体小时数';
      } else if (question.id === 51) {
        fillPlaceholder = '分值 1-10（1=非常差，10=非常好）';
        fillType = 'number';
        fillHint = '请输入 1-10 之间的整数';
      } else if (question.id === 52) {
        fillPlaceholder = '请输入小时数';
        fillType = 'digit';
        fillHint = '请输入每晚实际睡眠小时数';
      } else if (question.id === 53) {
        fillPlaceholder = '例 22（0-23 点）';
        fillType = 'number';
        fillHint = '请输入上床睡觉的小时数（0-23）';
      } else if (question.id === 54) {
        fillPlaceholder = '例 7（0-23 点）';
        fillType = 'number';
        fillHint = '请输入起床的小时数（0-23）';
      }
    }

    var ansKey = scale.key;
    var selectedValue = null;
    var fillValue = '';

    if (isFill) {
      var fillAnsKey = (scale.key === 'psqi') ? 'psqiFill' : (scale.key + 'Fill');
      var fillAns = state.answers[fillAnsKey] || {};
      fillValue = fillAns[question.id] !== undefined ? String(fillAns[question.id]) : '';
      if (fillPickerType === 'time') {
        fillTimeValue = fillValue || nowTimeString();
      }
    } else {
      var scaleAns = state.answers[ansKey] || {};
      selectedValue = scaleAns[question.id] !== undefined ? Number(scaleAns[question.id]) : null;
    }

    var isLast = qIndex === questions.length - 1;
    var percent = ((qIndex + 1) / questions.length * 100).toFixed(1);

    state.currentInstructions = scale.instructions;
    state.currentQuestionText = question.text;
    state.currentOptions = opts;
    state.currentQuestionIndex = qIndex;
    state.currentTotal = questions.length;
    state.progressPercent = percent;
    state.isFillBlank = isFill;
    state.fillPickerType = fillPickerType;
    state.fillTimeValue = fillTimeValue;
    state.fillPlaceholder = fillPlaceholder;
    state.fillType = fillType;
    state.fillHint = fillHint;
    state.fillValue = fillValue;
    state.selectedValue = selectedValue;
    state.isLastQuestion = isLast;

    renderQuiz();
  }

  // ===== 渲染：量表标签 =====
  function renderTabs() {
    var html = '';
    for (var i = 0; i < SCALES.length; i++) {
      var item = SCALES[i];
      var active = (i === state.currentTab) ? ' active' : '';
      var badge = state.submitted[item.key] ? ' scale-badge show' : ' scale-badge';
      html += '<div class="scale-tab' + active + '" data-index="' + i + '">' +
        escapeHtml(item.name) + '<span class="' + badge.trim() + '">✓</span></div>';
    }
    elScaleTabs.innerHTML = html;

    var tabs = elScaleTabs.querySelectorAll('.scale-tab');
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].addEventListener('click', function () {
        // 对应小程序 switchTab
        var index = parseInt(this.getAttribute('data-index'), 10);
        state.currentTab = index;
        state.currentScaleKey = SCALES[index].key;
        state.currentQuestionId = SCALES[index].questions[0].id;
        updateViewState();
        renderTabs();
      });
    }
  }

  // ===== 渲染：答题界面 =====
  function renderQuiz() {
    elInstructions.textContent = state.currentInstructions;
    elProgressFill.style.width = state.progressPercent + '%';
    elProgressText.textContent = (state.currentQuestionIndex + 1) + ' / ' + state.currentTotal;
    elQuestionIcon.textContent = state.currentQuestionIndex + 1;
    elQuestionText.textContent = state.currentQuestionText;
    elPageIndicator.textContent = (state.currentQuestionIndex + 1) + ' / ' + state.currentTotal;

    // 上一题：第一题时不可再退（对应小程序 prevQuestion 中 idx<=0 直接返回）
    elPrevBtn.disabled = (state.currentQuestionIndex === 0);

    // 最后一题显示"提交本量表"，否则"下一题"
    if (state.isLastQuestion) {
      elSubmitBtn.style.display = '';
      elNextBtn.style.display = 'none';
    } else {
      elSubmitBtn.style.display = 'none';
      elNextBtn.style.display = '';
    }

    // 填空题
    if (state.isFillBlank) {
      elFillBlankArea.style.display = '';
      elOptionsArea.style.display = 'none';
      if (state.fillPickerType === 'time') {
        elTimePickerWrap.style.display = '';
        elFillInputWrap.style.display = 'none';
        elTimePicker.value = state.fillTimeValue;
      } else {
        elTimePickerWrap.style.display = 'none';
        elFillInputWrap.style.display = '';
        elFillInput.placeholder = state.fillPlaceholder;
        elFillInput.value = state.fillValue;
      }
      elFillHint.textContent = state.fillHint;
    } else {
      elFillBlankArea.style.display = 'none';
      elOptionsArea.style.display = '';
      // 渲染选择题（对应小程序 wx:for currentOptions）
      var optsHtml = '';
      var opts = state.currentOptions;
      for (var i = 0; i < opts.length; i++) {
        var o = opts[i];
        var selected = (state.selectedValue === o.value) ? ' selected' : '';
        optsHtml +=
          '<div class="option' + selected + '" data-value="' + o.value + '">' +
            '<div class="radio-circle"><div class="radio-inner"></div></div>' +
            '<div class="option-content">' +
              '<div class="option-level">' + o.value + '.' + escapeHtml(o.label) + '</div>' +
              (o.desc ? '<div class="option-desc">' + escapeHtml(o.desc) + '</div>' : '') +
            '</div>' +
          '</div>';
      }
      elOptionsArea.innerHTML = optsHtml;
      var optionEls = elOptionsArea.querySelectorAll('.option');
      for (var j = 0; j < optionEls.length; j++) {
        optionEls[j].addEventListener('click', function () {
          selectOption(Number(this.getAttribute('data-value')));
        });
      }
    }

    // PSQI 第14题：选择非"无"时附加原因说明
    // （对应小程序 wx:if="{{currentScaleKey === 'psqi' && currentQuestionId === 14 && selectedValue > 1}}"）
    if (state.currentScaleKey === 'psqi' && state.currentQuestionId === 14 && state.selectedValue > 1) {
      elPsqiOther.style.display = '';
      // 回填已保存的原因（对应小程序 value="{{psqiOtherReason}}"）
      elPsqiOtherInput.value = state.psqiOtherReason;
    } else {
      elPsqiOther.style.display = 'none';
    }
  }

  // ===== 选择选项（对应小程序 selectOption）=====
  function selectOption(value) {
    var scale = SCALES[state.currentTab];
    var qId = state.currentQuestionId;
    state.answers[scale.key][qId] = value;
    state.selectedValue = value;
    // PSQI Q14 选"无"时清除原因
    if (qId === 14 && value === 1) {
      state.psqiOtherReason = '';
      elPsqiOtherInput.value = '';
    }
    renderQuiz();
    renderTabs();
    saveCache();
  }

  // ===== 填空题输入（对应小程序 onFillInput）=====
  function onFillInput(value) {
    var qId = state.currentQuestionId;
    var scale = SCALES[state.currentTab];
    var fillAnsKey = (scale.key === 'psqi') ? 'psqiFill' : (scale.key + 'Fill');

    // 仅 PSQI Q1/Q3（时间输入如 22:30）保留冒号，其余填空只允许数字
    var keepColon = (fillAnsKey === 'psqiFill' && (qId === 1 || qId === 3));
    if (!keepColon) {
      value = String(value).replace(/[^0-9]/g, '');
      if (value === '') {
        state.fillValue = '';
        elFillInput.value = '';
        return;
      }
    }

    // Sleep-50 附加题范围限制
    if (qId === 51) {
      var v = parseInt(value, 10);
      if (v < 1) value = '1';
      if (v > 10) value = '10';
    } else if (qId === 52) {
      var v = parseInt(value, 10);
      if (v > 24) value = '24';
    } else if (qId === 53 || qId === 54) {
      var v = parseInt(value, 10);
      if (v > 23) value = '23';
    }

    state.answers[fillAnsKey][qId] = value;
    state.fillValue = value;
    elFillInput.value = value;
    saveCache();
  }

  // ===== 时间选择（对应小程序 onTimeChange）=====
  function onTimeChange(value) {
    var qId = state.currentQuestionId;
    var scale = SCALES[state.currentTab];
    var fillAnsKey = (scale.key === 'psqi') ? 'psqiFill' : (scale.key + 'Fill');
    state.answers[fillAnsKey][qId] = value;
    state.fillTimeValue = value;
    saveCache();
  }

  // ===== PSQI Q14 附加原因说明输入（对应小程序 onPsqiOtherInput）=====
  function onPsqiOtherInput(value) {
    state.psqiOtherReason = value;
  }

  // ===== 下一题（对应小程序 nextQuestion，含 Sleep-50 第32题跳转）=====
  function nextQuestion() {
    var scale = SCALES[state.currentTab];
    var questions = scale.questions;
    var idx = -1;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].id === state.currentQuestionId) {
        idx = i;
        break;
      }
    }
    if (idx >= questions.length - 1) return;

    var nextId = questions[idx + 1].id;

    // Sleep-50 第32题跳转：选"根本没有"(value=1) → 跳过33~36，直接到37
    if (scale.key === 'sleep50' && state.currentQuestionId === 32) {
      var answer32 = state.answers.sleep50['32'];
      if (answer32 === 1) {
        for (var q = 33; q <= 36; q++) {
          state.answers.sleep50[q] = 1;
        }
        state.currentQuestionId = 37;
        saveCache();
        updateViewState();
        renderTabs();
        return;
      }
    }

    state.currentQuestionId = nextId;
    updateViewState();
  }

  // ===== 上一题（对应小程序 prevQuestion，含 Sleep-50 第37题回退）=====
  function prevQuestion() {
    var scale = SCALES[state.currentTab];
    var questions = scale.questions;
    var idx = -1;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].id === state.currentQuestionId) {
        idx = i;
        break;
      }
    }
    if (idx <= 0) return;

    var prevId = questions[idx - 1].id;

    // Sleep-50 第37题回退：如果Q32选了"根本没有"(value=1)，则跳回Q32而非Q36
    if (scale.key === 'sleep50' && state.currentQuestionId === 37) {
      var answer32 = state.answers.sleep50['32'];
      if (answer32 === 1) {
        state.currentQuestionId = 32;
        updateViewState();
        return;
      }
    }

    state.currentQuestionId = prevId;
    updateViewState();
  }

  // ===== 提交当前量表（所有题必须答完才能提交，否则跳转到最早未答题）=====
  // （对应小程序 submitScale）
  function submitScale() {
    var scale = SCALES[state.currentTab];
    var questions = scale.questions;
    var key = scale.key;
    var fillAnsKey = (key === 'psqi') ? 'psqiFill' : (key + 'Fill');

    // 找到第一道未答题
    var firstUnanswered = -1;
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var answered = false;
      if (scale.fillBlankIndices.indexOf(q.id) !== -1) {
        answered = !!(state.answers[fillAnsKey][q.id]);
      } else {
        answered = state.answers[key][q.id] !== undefined;
      }
      if (!answered) {
        firstUnanswered = i;
        break;
      }
    }

    if (firstUnanswered === -1 && key === 'psqi') {
      // PSQI Q14：选了非"无"必须填写原因
      var q14Ans = state.answers.psqi['14'];
      if (q14Ans && q14Ans !== 1 && !state.psqiOtherReason.trim()) {
        state.currentQuestionId = 14;
        updateViewState();
        showToast('请说明其他影响睡眠的具体原因', 'none', 2000);
        return;
      }
    }

    if (firstUnanswered !== -1) {
      var q = questions[firstUnanswered];
      state.currentQuestionId = q.id;
      updateViewState();
      showToast('还有题目未回答，请先完成', 'none', 2000);
      return;
    }

    doSubmit();
  }

  // ===== 执行提交（对应小程序 doSubmit）=====
  function doSubmit() {
    if (state.isSubmitting) {
      return;
    }
    state.isSubmitting = true;

    var key = SCALES[state.currentTab].key;

    // 检查是否所有量表都已提交（基于当前实际 completed 状态 + 本次提交的量表）
    var allDone = true;
    for (var k in state.submitted) {
      if (k === key) continue;  // 当前量表本次提交
      if (!state.submitted[k]) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      // 从会话数据获取个人信息（已在 personal-info 页面填写）
      var personalInfo = getSessionData(PERSONAL_INFO_KEY);
      if (!personalInfo || !personalInfo.name) {
        showToast('个人信息缺失，请重新填写', 'none');
        state.isSubmitting = false;
        return;
      }

      var results = calculateResults(state.answers, personalInfo);
      if (!getVisitorId()) {
        // 无 visitor_id，直接显示结果
        state.isSubmitting = false;
        state.allDone = true;
        state.results = results;
        renderReport();
        return;
      }

      // 有 visitor_id，顺序提交全部5张表到后端（避免部分成功导致数据不完整）
      showLoading('正在保存数据...');

      var user = {
        name: personalInfo.name || '匿名',
        gender: personalInfo.gender || '',
        age: parseInt(personalInfo.age) || 0,
        birth_date: personalInfo.birthDate || null,
        occupation: personalInfo.occupation || '',
        work_unit: personalInfo.workUnit || '',
        education: personalInfo.education || '',
        work_years: parseInt(personalInfo.workYears) || 0,
        exercise: personalInfo.exercise || '',
        smoking: personalInfo.smoking || '',
        drinking: personalInfo.drinking || '',
        // 既往病史
        diseases: [
          { disease_name: '高血压', status: personalInfo.hypertension || '', drug_name: personalInfo.hypertensionDrug || '' },
          { disease_name: '糖尿病', status: personalInfo.diabetes || '', drug_name: personalInfo.diabetesDrug || '' },
          { disease_name: '高脂血症', status: personalInfo.hyperlipidemia || '', drug_name: personalInfo.hyperlipidemiaDrug || '' },
          { disease_name: '呼吸系统疾病', status: personalInfo.respiratory || '', drug_name: personalInfo.respiratoryDrug || '' }
        ],
        // 月经史（仅女性）
        menstrual: {
          menarche_age: parseInt(personalInfo.menarcheAge) || null,
          period_days: parseInt(personalInfo.periodDays) || null,
          last_period: personalInfo.lastPeriod || null,
          cycle_days: parseInt(personalInfo.cycleDays) || null,
          volume: personalInfo.menstrualVolume || '',
          dysmenorrhea: personalInfo.dysmenorrhea || '',
          is_regular: personalInfo.isRegular || ''
        }
      };
      var ans = state.answers;
      var baseUrl = API_BASE_URL + '/api/submit';

      // 所有量表都已完成 — 顺序提交（避免部分成功导致数据不完整）
      // 注：与小程序版一致，此处不随请求上传 psqi_other_reason（Q14 原因仅在本地校验）
      var scalesToSubmit = [
        { key: 'Sleep-50', type: 'sleep50', answers: ans.sleep50, fill_answers: ans.sleep50Fill, result: { total_score: results.sleep50Total, avg_score: parseFloat(results.sleep50Avg), interpretation: results.sleep50Text } },
        { key: 'PSQI',     type: 'psqi',    answers: ans.psqi,    fill_answers: ans.psqiFill,    result: { total_score: results.psqiTotal,    interpretation: results.psqiText } },
        { key: 'PHQ-9',    type: 'phq9',    answers: ans.phq9,                                 result: { total_score: results.phq9Total,    severity: results.phq9Level,               interpretation: results.phq9Text } },
        { key: 'GAD-7',    type: 'gad7',    answers: ans.gad7,                                 result: { total_score: results.gad7Total,    severity: results.gad7Level,               interpretation: results.gad7Text } },
        { key: 'SCL-90',   type: 'scl90',   answers: ans.scl90,                                result: { total_score: results.scl90Total,   avg_score: parseFloat(results.scl90GSI),    positive_items: results.scl90PositiveItems, psdl: parseFloat(results.scl90PSDL), interpretation: results.scl90Text } }
      ];
      var submitIdx = 0;

      function submitNext() {
        if (submitIdx >= scalesToSubmit.length) {
          // 全部成功 → 此时才标记 submitted 和展示结果
          hideLoading();
          removeStorage(ASSESSMENT_CACHE_KEY);
          removeStorage(OLD_SLEEP_CACHE_KEY);  // 清理旧 key
          var finalSubmitted = {};
          for (var k in state.submitted) finalSubmitted[k] = true;
          state.isSubmitting = false;
          state.submitted = finalSubmitted;
          state.allDone = true;
          state.results = results;
          renderReport();
          return;
        }
        var s = scalesToSubmit[submitIdx];
        request({
          url: baseUrl,
          method: 'POST',
          data: { visitor_id: getVisitorId(), user: user, scale_type: s.type, answers: s.answers, fill_answers: s.fill_answers || {}, result: s.result }
        }).then(function (r) {
          if (r.data && r.data.code === 0) {
            submitIdx++;
            submitNext();
          } else {
            hideLoading();
            showModal({ title: '提交失败', content: s.key + ': ' + (r.data ? r.data.message : '服务器返回异常'), showCancel: false });
            state.isSubmitting = false;
          }
        }).catch(function () {
          hideLoading();
          showModal({ title: '提交失败', content: s.key + ' 网络错误，请检查网络后重试', showCancel: false });
          state.isSubmitting = false;
        });
      }
      submitNext();
      return;
    } else {
      // 标记当前量表已提交，找到下一个未完成的量表
      var newSubmitted = {};
      for (var k in state.submitted) {
        newSubmitted[k] = state.submitted[k];
      }
      newSubmitted[key] = true;
      var currentIdx = state.currentTab;
      var nextIdx = -1;
      for (var i = currentIdx + 1; i < SCALES.length; i++) {
        if (!newSubmitted[SCALES[i].key]) {
          nextIdx = i;
          break;
        }
      }
      if (nextIdx === -1) {
        for (var i = 0; i < currentIdx; i++) {
          if (!newSubmitted[SCALES[i].key]) {
            nextIdx = i;
            break;
          }
        }
      }

      // 防御性检查：若仍未找到（理论上不会发生），跳回首页
      if (nextIdx === -1) {
        state.submitted = newSubmitted;
        state.isSubmitting = false;
        // 对应 wx.redirectTo({ url: '/pages/home/index' })
        redirectTo('home.html');
        return;
      }

      state.submitted = newSubmitted;
      state.isSubmitting = false;
      state.currentTab = nextIdx;
      state.currentScaleKey = SCALES[nextIdx].key;
      state.currentQuestionId = SCALES[nextIdx].questions[0].id;
      saveCache();
      updateViewState();
      renderTabs();
      showToast('请完成「' + SCALES[nextIdx].name + '」', 'none', 2000);
    }
  }

  // ===== 渲染测评结果分析报告（对应小程序报告 WXML）=====
  function renderReport() {
    elQuizMode.style.display = 'none';
    elReportArea.style.display = '';

    var r = state.results;
    var html = '';

    // ---------- PSQI 报告 ----------
    html += '<div class="report-page">';
    html += '<div class="report-section">';
    // 用户信息表
    html += '<div class="report-info-table">';
    html += '<div class="report-info-row">' +
      '<div class="report-info-label">姓名</div><div class="report-info-val">' + escapeHtml(r.userName) + '</div>' +
      '<div class="report-info-label">性别</div><div class="report-info-val">' + escapeHtml(r.userGender) + '</div>' +
      '<div class="report-info-label">年龄</div><div class="report-info-val">' + escapeHtml(r.userAge) + '</div>' +
      '</div>';
    html += '<div class="report-info-row">' +
      '<div class="report-info-label">工作年限</div><div class="report-info-val">' + escapeHtml(r.userWorkYears) + '年</div>' +
      '<div class="report-info-label">文化程度</div><div class="report-info-val">' + escapeHtml(r.userEducation) + '</div>' +
      '<div class="report-info-label">岗位</div><div class="report-info-val">' + escapeHtml(r.userOccupation) + '</div>' +
      '</div>';
    html += '</div>';

    html += '<div class="report-h1">匹兹堡睡眠质量指数量表测评(PSQI)结果分析报告</div>';

    // PSQI 测评结果及因子得分
    html += '<div class="report-h2">测评结果及因子得分（总分：<span class="report-score-num">' + r.psqiTotal + '</span> 分）</div>';

    html += '<div class="report-table-wrap">';
    html += '<div class="report-thead"><div class="report-th">因子</div><div class="report-th">得分</div><div class="report-th">因子</div><div class="report-th">得分</div></div>';
    html += '<div class="report-tbody">';
    for (var pi = 0; pi < r.psqiFactorPairs.length; pi++) {
      var pair = r.psqiFactorPairs[pi];
      html += '<div class="report-tr">' +
        '<div class="report-td shade">' + escapeHtml(pair[0].name) + '</div>' +
        '<div class="report-td score">' + pair[0].score + '</div>';
      if (pair[1]) {
        html += '<div class="report-td shade">' + escapeHtml(pair[1].name) + '</div>' +
          '<div class="report-td score">' + pair[1].score + '</div>';
      } else {
        html += '<div class="report-td"></div><div class="report-td"></div>';
      }
      html += '</div>';
    }
    html += '</div></div>';

    html += '<div class="report-note"><span class="report-note-label">得分解释：</span><span>各维度根据严重程度按照 0～3 分计分，总分为 0～21 分，得分越高睡眠质量越差。</span></div>';
    html += '<div class="report-note"><span class="report-note-label red">总分解释：</span><span>总分>7分提示存在睡眠质量差，需进一步关注；≤5分表示睡眠质量较好，6-7分处于临界状态。</span></div>';
    html += '<div class="report-note"><span class="report-note-label">结论：</span><span>本次测评 PSQI 总分为 ' + r.psqiTotal + ' 分，睡眠质量' + r.psqiQuality + '。</span></div>';
    html += '<div class="report-footnote">（本报告只作为临床参考）</div>';
    html += '</div>';

    // ---------- Sleep-50 报告 ----------
    html += '<div class="report-section">';
    html += '<div class="report-h1">Sleep-50 结果分析报告</div>';

    html += '<div class="report-h2">测评结果及因子得分（总分：<span class="report-score-num">' + r.sleep50Total + '</span> 分）</div>';

    html += '<div class="report-table-wrap">';
    html += '<div class="report-thead"><div class="report-th">因子</div><div class="report-th">得分</div><div class="report-th">因子</div><div class="report-th">得分</div></div>';
    html += '<div class="report-tbody">';
    for (var si = 0; si < r.sleep50FactorPairs.length; si++) {
      var spair = r.sleep50FactorPairs[si];
      html += '<div class="report-tr">' +
        '<div class="report-td shade">' + escapeHtml(spair[0].name) + '</div>' +
        '<div class="report-td score">' + spair[0].score + '</div>';
      if (spair[1]) {
        html += '<div class="report-td shade">' + escapeHtml(spair[1].name) + '</div>' +
          '<div class="report-td score">' + spair[1].score + '</div>';
      } else {
        html += '<div class="report-td"></div><div class="report-td"></div>';
      }
      html += '</div>';
    }
    html += '</div></div>';

    html += '<div class="report-note"><span class="report-note-label">得分解释：</span><span>各因子得分≥界限分时提示存在该维度问题（失眠≥15、睡眠呼吸障碍≥12、不宁腿综合征≥10、昼夜节律紊乱≥8、睡眠行为异常≥6）。总分范围 0～200 分，得分越高表示睡眠问题越严重。</span></div>';
    html += '<div class="report-note"><span class="report-note-label red">总分解释：</span><span>0-50 分：睡眠质量良好 | 51-100 分：轻度睡眠问题 | 101-150 分：中度睡眠障碍 | 151-200 分：严重睡眠障碍</span></div>';
    html += '<div class="report-note"><span class="report-note-label">结论：</span><span>' + escapeHtml(r.sleep50Text) + '</span></div>';
    html += '<div class="report-footnote">（本报告只作为临床参考）</div>';
    html += '</div>';

    // ---------- SCL-90 整体指标 ----------
    html += '<div class="report-section">';
    html += '<div class="report-h1">症状自评量表(SCL-90)测评结果及整体指标</div>';

    html += '<div style="height:40px;"></div>';
    html += '<div class="report-section-caption">整体测评指标</div>';

    html += '<div class="report-table-wrap">';
    html += '<div class="report-thead"><div class="report-th">测评指标</div><div class="report-th">分值</div><div class="report-th">参考 (M±SD)</div></div>';
    html += '<div class="report-tbody">';
    html += '<div class="report-tr"><div class="report-td shade">总分</div><div class="report-td score-num">' + r.scl90Total + '</div><div class="report-td">129.96 ± 38.76</div></div>';
    html += '<div class="report-tr"><div class="report-td shade">均分</div><div class="report-td score-num">' + r.scl90GSI + '</div><div class="report-td">1.44 ± 0.43</div></div>';
    html += '<div class="report-tr"><div class="report-td shade">阳性项目数</div><div class="report-td score-num">' + r.scl90PositiveItems + '</div><div class="report-td">24.92 ± 18.41</div></div>';
    html += '<div class="report-tr"><div class="report-td shade">阴性项目数</div><div class="report-td score-num">' + r.scl90NegativeItems + '</div><div class="report-td">65.08 ± 18.33</div></div>';
    html += '<div class="report-tr"><div class="report-td shade">阳性项目均分</div><div class="report-td score-num">' + r.scl90PSDL + '</div><div class="report-td">2.60 ± 0.59</div></div>';
    html += '</div></div>';

    html += '<div class="report-note"><span class="report-note-label">得分解释：</span><span>单项分 1~5 分。因子均分 = 该因子总分 ÷ 项目数。程度判定：＜ M+SD 为轻度，M+SD ~ M+2SD 为中度，≥ M+2SD 为重度。</span></div>';
    html += '<div class="report-note"><span class="report-note-label red">结论：</span><span>' + escapeHtml(r.scl90Text) + '</span></div>';
    html += '<div class="report-footnote">（本报告只作为临床参考）</div>';
    html += '</div>';

    // ---------- SCL-90 各因子得分及程度 ----------
    html += '<div class="report-section">';
    html += '<div class="report-section-caption">各因子得分及程度</div>';

    html += '<div class="report-table-wrap">';
    html += '<div class="report-thead"><div class="report-th">因子</div><div class="report-th">得分</div><div class="report-th">参考 (M±SD)</div><div class="report-th">程度</div></div>';
    html += '<div class="report-tbody">';
    for (var fi = 0; fi < r.scl90FactorRows.length; fi++) {
      var frow = r.scl90FactorRows[fi];
      var levelClass = '';
      if (frow.level === '轻') levelClass = ' level-light';
      else if (frow.level === '中') levelClass = ' level-medium';
      else if (frow.level === '重') levelClass = ' level-heavy';
      html += '<div class="report-tr">' +
        '<div class="report-td shade">' + escapeHtml(frow.name) + '</div>' +
        '<div class="report-td score">' + frow.score + '</div>' +
        '<div class="report-td">' + escapeHtml(frow.ref) + '</div>' +
        '<div class="report-td' + levelClass + '">' + escapeHtml(frow.level) + '</div>' +
        '</div>';
    }
    html += '</div></div>';
    html += '</div>';

    // ---------- PHQ-9 报告 ----------
    html += '<div class="report-section">';
    html += '<div class="report-h1">患者健康问卷(PHQ-9)测评结果</div>';

    html += '<div class="report-table-wrap">';
    html += '<div class="report-thead"><div class="report-th">指标</div><div class="report-th">分值</div></div>';
    html += '<div class="report-tbody">';
    html += '<div class="report-tr"><div class="report-td shade">总分</div><div class="report-td score">' + r.phq9Total + '</div></div>';
    html += '</div></div>';

    html += '<div class="report-note"><span class="report-note-label">得分解释：</span><span>共 9 个条目，每项评分 0~3 分，得分越高表示症状出现频率越高。</span></div>';
    html += '<div class="report-note"><span class="report-note-label red">总分解释：</span><span>PHQ-9 ≥ 5 分认为存在抑郁。</span></div>';
    html += '<div class="report-note"><span class="report-note-label">结论：</span><span>本次测评 PHQ-9 总分为 ' + r.phq9Total + ' 分，评定为 ' + r.phq9Level + '。' + escapeHtml(r.phq9Text) + '</span></div>';
    html += '<div class="report-footnote">（本报告只作为临床参考）</div>';
    html += '</div>';

    // ---------- GAD-7 报告 ----------
    html += '<div class="report-section">';
    html += '<div class="report-h1">焦虑障碍量表(GAD-7)测评结果</div>';

    html += '<div class="report-table-wrap">';
    html += '<div class="report-thead"><div class="report-th">指标</div><div class="report-th">分值</div></div>';
    html += '<div class="report-tbody">';
    html += '<div class="report-tr"><div class="report-td shade">总分</div><div class="report-td score">' + r.gad7Total + '</div></div>';
    html += '</div></div>';

    html += '<div class="report-note"><span class="report-note-label">得分解释：</span><span>共 7 个条目，每项评分 0~3 分，得分越高表示症状出现频率越高。</span></div>';
    html += '<div class="report-note"><span class="report-note-label red">总分解释：</span><span>GAD-7 ≥ 5 分认为存在焦虑。</span></div>';
    html += '<div class="report-note"><span class="report-note-label">结论：</span><span>本次测评 GAD-7 总分为 ' + r.gad7Total + ' 分，评定为 ' + r.gad7Level + '。' + escapeHtml(r.gad7Text) + '</span></div>';
    html += '<div class="report-footnote">（本报告只作为临床参考）</div>';
    html += '</div>';

    // ---------- 免责声明 ----------
    html += '<div class="report-warning">本测评结果仅供参考，不能替代专业医疗诊断。如您感到困扰，建议寻求专业心理咨询师、睡眠专科医生或精神科医生的帮助。</div>';

    // ---------- 返回首页 ----------
    html += '<button class="report-back-btn" id="reportBackBtn">返回首页</button>';
    html += '</div>';

    elReportArea.innerHTML = html;
    $('reportBackBtn').addEventListener('click', function () {
      // 对应小程序 backToHome: wx.redirectTo({ url: '/pages/home/index' })
      redirectTo('home.html');
    });
  }

  // ===== 返回首页（结果页按钮之外，供其它入口使用）=====
  function backToHome() {
    redirectTo('home.html');
  }

  // ===== 事件绑定 =====
  elPrevBtn.addEventListener('click', prevQuestion);
  elNextBtn.addEventListener('click', nextQuestion);
  elSubmitBtn.addEventListener('click', submitScale);

  elFillInput.addEventListener('input', function (e) {
    onFillInput(e.target.value);
  });

  elTimePicker.addEventListener('change', function (e) {
    onTimeChange(e.target.value);
  });

  elPsqiOtherInput.addEventListener('input', function (e) {
    onPsqiOtherInput(e.target.value);
  });

  // ===== 初始化（对应小程序 onLoad）=====
  loadCache();
  updateViewState();
  renderTabs();

  // 暴露给外部（供调试/测试）
  window.assessmentApp = {
    state: state,
    updateViewState: updateViewState,
    renderTabs: renderTabs,
    selectOption: selectOption,
    nextQuestion: nextQuestion,
    prevQuestion: prevQuestion,
    submitScale: submitScale,
    doSubmit: doSubmit,
    backToHome: backToHome
  };
})();
