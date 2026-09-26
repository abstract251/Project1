/**
 * personal-info.js — 个人信息采集（对应小程序 pages/personal-info/index.js）
 * 所有字段、联动显示、提交前校验逻辑与小程序版【完全一致】。
 */

(function () {
  'use strict';

  // ===== 工具方法：过滤非数字字符（对应小程序 _filterDigits）=====
  function filterDigits(value) {
    return String(value).replace(/[^\d]/g, '');
  }

  // ===== DOM 快捷获取 =====
  function $(id) { return document.getElementById(id); }

  // 读取单选组当前选中值（name 相同的一组 radio）
  function radioValue(name) {
    var radios = document.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return '';
  }

  // ===== 数据对象（对应小程序 data 字段）=====
  var data = {
    name: '',
    gender: '',
    age: '',
    birthDate: '',
    occupation: '',
    workUnit: '',
    education: '',
    workYears: '',
    exercise: '',

    // 月经史
    menarcheAge: '',
    periodDays: '',
    lastPeriod: '',
    cycleDays: '',
    menstrualVolume: '',
    dysmenorrhea: '',
    isRegular: '',

    // 既往病史
    hypertension: '',
    hypertensionDrug: '',
    diabetes: '',
    diabetesDrug: '',
    hyperlipidemia: '',
    hyperlipidemiaDrug: '',
    respiratory: '',
    respiratoryDrug: '',

    // 吸烟饮酒
    smoking: '',
    drinking: ''
  };

  // ===== 事件绑定 =====

  // 个人基本信息
  $('name').addEventListener('input', function (e) { data.name = e.target.value; });
  $('gender').addEventListener('change', function (e) { data.gender = e.target.value; toggleMenstrual(); });
  $('age').addEventListener('input', function (e) { data.age = filterDigits(e.target.value); e.target.value = data.age; });
  $('birthDate').addEventListener('change', function (e) { data.birthDate = e.target.value; });
  $('occupation').addEventListener('input', function (e) { data.occupation = e.target.value; });
  $('workUnit').addEventListener('input', function (e) { data.workUnit = e.target.value; });
  $('education').addEventListener('change', function (e) { data.education = e.target.value; });
  $('workYears').addEventListener('input', function (e) { data.workYears = filterDigits(e.target.value); e.target.value = data.workYears; });
  $('exercise').addEventListener('change', function (e) { data.exercise = e.target.value; });

  // 月经史
  $('menarcheAge').addEventListener('input', function (e) { data.menarcheAge = filterDigits(e.target.value); e.target.value = data.menarcheAge; });
  $('periodDays').addEventListener('input', function (e) { data.periodDays = filterDigits(e.target.value); e.target.value = data.periodDays; });
  $('lastPeriod').addEventListener('change', function (e) { data.lastPeriod = e.target.value; });
  $('cycleDays').addEventListener('input', function (e) { data.cycleDays = filterDigits(e.target.value); e.target.value = data.cycleDays; });
  $('menstrualVolume').addEventListener('change', function (e) { data.menstrualVolume = e.target.value; });
  $('dysmenorrhea').addEventListener('change', function (e) { data.dysmenorrhea = e.target.value; });
  document.querySelectorAll('input[name="isRegular"]').forEach(function (el) {
    el.addEventListener('change', function (e) { data.isRegular = e.target.value; });
  });

  // 既往病史（选"是"显示药物输入框，对应小程序 showXxxDrug）
  var diseases = [
    { key: 'hypertension', name: '高血压' },
    { key: 'diabetes', name: '糖尿病' },
    { key: 'hyperlipidemia', name: '高脂血症' },
    { key: 'respiratory', name: '呼吸系统疾病' }
  ];
  diseases.forEach(function (item) {
    document.querySelectorAll('input[name="' + item.key + '"]').forEach(function (el) {
      el.addEventListener('change', function (e) {
        data[item.key] = e.target.value;
        // 对应小程序：showHypertensionDrug = (val === '是')
        $('' + item.key + 'Drug').style.display = (data[item.key] === '是') ? '' : 'none';
      });
    });
    $('' + item.key + 'Drug').addEventListener('input', function (e) {
      data[item.key + 'Drug'] = e.target.value;
    });
  });

  // 吸烟饮酒
  document.querySelectorAll('input[name="smoking"]').forEach(function (el) {
    el.addEventListener('change', function (e) { data.smoking = e.target.value; });
  });
  document.querySelectorAll('input[name="drinking"]').forEach(function (el) {
    el.addEventListener('change', function (e) { data.drinking = e.target.value; });
  });

  // 月经史卡片：仅女性显示（对应小程序 wx:if="{{gender === '女'}}"）
  function toggleMenstrual() {
    $('menstrualCard').style.display = (data.gender === '女') ? '' : 'none';
  }

  // 返回（对应小程序页面导航返回）
  $('navBack').addEventListener('click', function () {
    navigateBack();
  });

  // ===== 提交前的完整性校验（对应小程序 _validate，错误提示顺序一致）=====
  function validate() {
    var errors = [];

    // 个人基本信息
    if (!data.name.trim()) errors.push('请输入姓名');
    if (!data.gender) errors.push('请选择性别');
    if (!data.age) {
      errors.push('请输入年龄');
    } else {
      var ageNum = parseInt(data.age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
        errors.push('请输入合理的年龄（1~150）');
      }
    }

    // 既往病史：每一项必须选择状态，选"是"必须填药物
    var diseaseChecks = [
      { status: data.hypertension, drug: data.hypertensionDrug, name: '高血压' },
      { status: data.diabetes, drug: data.diabetesDrug, name: '糖尿病' },
      { status: data.hyperlipidemia, drug: data.hyperlipidemiaDrug, name: '高脂血症' },
      { status: data.respiratory, drug: data.respiratoryDrug, name: '呼吸系统疾病' }
    ];
    for (var i = 0; i < diseaseChecks.length; i++) {
      var item = diseaseChecks[i];
      if (!item.status) {
        errors.push('请选择是否有"' + item.name + '"');
      } else if (item.status === '是' && !item.drug.trim()) {
        errors.push('请填写"' + item.name + '"的药物名称');
      }
    }

    // 吸烟饮酒：必须选择
    if (!data.smoking) errors.push('请选择吸烟史');
    if (!data.drinking) errors.push('请选择饮酒史');

    // 月经史：仅女性需要校验数值
    if (data.gender === '女') {
      if (!data.menarcheAge) {
        errors.push('请输入初潮年龄');
      } else {
        var mAge = parseInt(data.menarcheAge);
        if (isNaN(mAge) || mAge <= 0 || mAge > 25) {
          errors.push('初潮年龄应在 1~25 岁之间');
        }
      }
      if (!data.periodDays) {
        errors.push('请输入经期天数');
      } else {
        var pDays = parseInt(data.periodDays);
        if (isNaN(pDays) || pDays <= 0 || pDays > 15) {
          errors.push('经期天数应在 1~15 天之间');
        }
      }
      if (!data.cycleDays) {
        errors.push('请输入周期天数');
      } else {
        var cDays = parseInt(data.cycleDays);
        if (isNaN(cDays) || cDays <= 0 || cDays > 60) {
          errors.push('周期天数应在 1~60 天之间');
        }
      }
      if (!data.menstrualVolume) errors.push('请选择经量');
      if (!data.dysmenorrhea) errors.push('请选择是否有痛经');
      if (!data.isRegular) errors.push('请选择经期是否规律');
      if (!data.lastPeriod) errors.push('请选择末次月经日期');
    }

    return errors;
  }

  // ===== 提交（仅暂存，不交到数据库，对应小程序 onSubmit）=====
  $('submitBtn').addEventListener('click', function () {
    var errors = validate();
    if (errors.length > 0) {
      // 对应 wx.showToast({ title: errors[0], icon: 'none', duration: 2000 })
      showToast(errors[0], 'none', 2000);
      return;
    }

    // 构建个人信息对象（字段与小程序版完全一致）
    var personalInfo = {
      name: data.name.trim(),
      gender: data.gender,
      age: parseInt(data.age),
      birthDate: data.birthDate,
      occupation: data.occupation.trim(),
      workUnit: data.workUnit.trim(),
      education: data.education,
      workYears: data.workYears ? parseInt(data.workYears) : 0,
      exercise: data.exercise,
      // 月经史
      menarcheAge: data.menarcheAge ? parseInt(data.menarcheAge) : null,
      periodDays: data.periodDays ? parseInt(data.periodDays) : null,
      lastPeriod: data.lastPeriod,
      cycleDays: data.cycleDays ? parseInt(data.cycleDays) : null,
      menstrualVolume: data.menstrualVolume,
      dysmenorrhea: data.dysmenorrhea,
      isRegular: data.isRegular,
      // 既往病史
      hypertension: data.hypertension,
      hypertensionDrug: data.hypertensionDrug.trim(),
      diabetes: data.diabetes,
      diabetesDrug: data.diabetesDrug.trim(),
      hyperlipidemia: data.hyperlipidemia,
      hyperlipidemiaDrug: data.hyperlipidemiaDrug.trim(),
      respiratory: data.respiratory,
      respiratoryDrug: data.respiratoryDrug.trim(),
      // 吸烟饮酒
      smoking: data.smoking,
      drinking: data.drinking
    };

    // 暂存到会话数据（对应小程序 app.globalData.personalInfo，留给 assessment 页面一起提交）
    setSessionData(PERSONAL_INFO_KEY, personalInfo);

    // 对应 wx.redirectTo({ url: '/pages/assessment/index' })
    redirectTo('assessment.html');
  });
})();
