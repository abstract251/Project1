/**
 * scoring.js — 各量表结果计算
 * =====================================================
 * 逻辑与小程序版 front/pages/assessment/index.js 中的
 * calculateResults 及 PSQI 组件分计算方法【完全一致】。
 * =====================================================
 */

// ===== PSQI 组件分计算——映射选项值 (1-4) 到组件分 (0-3) =====
function psqiComponentRawToScore(raw) {
  return Math.max(0, Number(raw || 0) - 1);
}

/* 睡眠效率计算并映射到 0-3 */
function psqiEfficiencyToScore(efficiency) {
  if (efficiency >= 85) return 0;
  if (efficiency >= 75) return 1;
  if (efficiency >= 65) return 2;
  return 3;
}

/* 入睡时间分钟映射到 0-3 */
function psqiSleepLatencyToScore(minutes) {
  var m = parseFloat(minutes) || 0;
  if (m <= 15) return 0;
  if (m <= 30) return 1;
  if (m < 60) return 2;
  return 3;
}

/* 睡眠时长映射到 0-3 */
function psqiDurationToScore(hours) {
  var h = parseFloat(hours) || 0;
  if (h > 7) return 0;
  if (h > 6) return 1;
  if (h >= 5) return 2;
  return 3;
}

/* 入睡时间组件分 (Q5 + Q2) */
function psqiC2Score(q5Raw, q2Minutes) {
  var a = psqiComponentRawToScore(q5Raw);
  var b = psqiSleepLatencyToScore(q2Minutes);
  var sum = a + b;
  if (sum === 0) return 0;
  if (sum <= 2) return 1;
  if (sum <= 4) return 2;
  return 3;
}

/* 睡眠障碍组件分 (Q6-Q14) */
function psqiC5Score(ans) {
  var total = 0;
  for (var i = 6; i <= 14; i++) {
    total += psqiComponentRawToScore(ans[i]);
  }
  if (total === 0) return 0;
  if (total <= 9) return 1;
  if (total <= 18) return 2;
  return 3;
}

/* 日间功能障碍组件分 (Q17+Q18) */
function psqiC7Score(q17Raw, q18Raw) {
  var a = psqiComponentRawToScore(q17Raw);
  var b = psqiComponentRawToScore(q18Raw);
  var sum = a + b;
  if (sum === 0) return 0;
  if (sum <= 2) return 1;
  if (sum <= 4) return 2;
  return 3;
}

/**
 * calculateResults(answers, personalInfo)
 * answers: { sleep50:{}, sleep50Fill:{}, psqi:{}, psqiFill:{}, phq9:{}, gad7:{}, scl90:{} }
 * personalInfo: 个人信息对象（可为 null）
 * 返回与小程序版 calculateResults 相同结构的对象
 */
function calculateResults(answers, personalInfo) {
  var info = personalInfo || {};

  // ===== Sleep-50 =====
  var sleep50Total = 0;
  var sleep50Count = 0;
  for (var i = 1; i <= 50; i++) {
    var v = Number(answers.sleep50[i] || 0);
    if (v > 0) {
      sleep50Total += v;
      sleep50Count++;
    }
  }
  var sleep50Avg = sleep50Count > 0 ? (sleep50Total / sleep50Count).toFixed(2) : '0.00';

  // Sleep-50 因子分组（按标准量表条目编号，排列顺序对应报告模板显示顺序）
  var SLEEP50_FACTOR_GROUPS = [
    { name: '失眠',          items: [1,  2,  3,  4,  5,  6,  7,  8,  9,  10] },
    { name: '昼夜节律紊乱',   items: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
    { name: '睡眠呼吸障碍',   items: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { name: '睡眠行为异常',   items: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50] },
    { name: '不宁腿综合征',   items: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] }
  ];
  var sleep50FactorRows = [];
  for (var fi = 0; fi < SLEEP50_FACTOR_GROUPS.length; fi++) {
    var f = SLEEP50_FACTOR_GROUPS[fi];
    var sum = 0;
    for (var ki = 0; ki < f.items.length; ki++) {
      sum += Number(answers.sleep50[f.items[ki]] || 0);
    }
    var fScore = sum;
    sleep50FactorRows.push({ name: f.name, score: fScore });
  }

  var sleep50FactorPairs = [];
  for (var spi = 0; spi < sleep50FactorRows.length; spi += 2) {
    sleep50FactorPairs.push([sleep50FactorRows[spi], sleep50FactorRows[spi + 1] || null]);
  }

  var sleep50Text = '';
  if (sleep50Total <= 50) {
    sleep50Text = '您的睡眠状况总体良好，各维度症状较轻。';
  } else if (sleep50Total <= 100) {
    sleep50Text = '您存在轻度睡眠问题，建议关注睡眠卫生，适当调整作息。';
  } else if (sleep50Total <= 150) {
    sleep50Text = '您存在中度睡眠问题，可能对日常生活造成一定影响，建议寻求专业睡眠评估。';
  } else {
    sleep50Text = '您的睡眠问题较为严重，强烈建议尽快就诊睡眠专科或精神心理科。';
  }

  // ===== PSQI 7 组件分 =====
  var psqiFill = answers.psqiFill || {};
  var psqiAns = answers.psqi || {};

  // C1 主观睡眠质量 (Q15): 很好→0, 较好→1, 较差→2, 很差→3
  var c1 = psqiComponentRawToScore(psqiAns[15]);

  // C2 入睡时间: Q5 (选项) + Q2 (分钟填空)
  var c2 = psqiC2Score(psqiAns[5], psqiFill[2]);

  // C3 睡眠时间: Q4 (小时填空)
  var c3 = psqiDurationToScore(psqiFill[4]);

  // C4 睡眠效率: (Q4小时 / (Q3起床 - Q1上床)) * 100
  var c4 = 0;
  var q1Time = psqiFill[1] || '';
  var q3Time = psqiFill[3] || '';
  var q4Hours = parseFloat(psqiFill[4]);
  if (q1Time && q3Time && q4Hours && q4Hours > 0) {
    var p1 = q1Time.split(':');
    var p3 = q3Time.split(':');
    if (p1.length >= 2 && p3.length >= 2) {
      var bedMin = parseInt(p1[0]) * 60 + parseInt(p1[1]);
      var wakeMin = parseInt(p3[0]) * 60 + parseInt(p3[1]);
      if (wakeMin <= bedMin) wakeMin += 1440;
      var timeInBed = wakeMin - bedMin;
      if (timeInBed > 0) {
        var efficiency = (q4Hours * 60) / timeInBed * 100;
        c4 = psqiEfficiencyToScore(efficiency);
      }
    }
  }

  // C5 睡眠障碍: Q6-Q14
  var c5 = psqiC5Score(psqiAns);

  // C6 催眠药物: Q16
  var c6 = psqiComponentRawToScore(psqiAns[16]);

  // C7 日间功能障碍: Q17+Q18
  var c7 = psqiC7Score(psqiAns[17], psqiAns[18]);

  var psqiComponentTotal = c1 + c2 + c3 + c4 + c5 + c6 + c7;
  var psqiFactorRows = [
    { name: '睡眠质量', score: c1 },
    { name: '入睡时间', score: c2 },
    { name: '睡眠时间', score: c3 },
    { name: '睡眠效率', score: c4 },
    { name: '睡眠障碍', score: c5 },
    { name: '催眠药物', score: c6 },
    { name: '日间功能障碍', score: c7 }
  ];

  var psqiFactorPairs = [];
  for (var ppi = 0; ppi < psqiFactorRows.length; ppi += 2) {
    psqiFactorPairs.push([psqiFactorRows[ppi], psqiFactorRows[ppi + 1] || null]);
  }

  var psqiQuality = '';
  var psqiText = '';
  if (psqiComponentTotal <= 5) {
    psqiQuality = '较好';
    psqiText = 'PSQI总分≤5分表示睡眠质量较好。';
  } else if (psqiComponentTotal <= 7) {
    psqiQuality = '临界';
    psqiText = 'PSQI总分6-7分处于临界状态，建议关注睡眠习惯。';
  } else {
    psqiQuality = '差';
    psqiText = 'PSQI总分>7分提示存在睡眠质量差，需进一步关注。';
  }

  // ===== PHQ-9 =====
  var phq9Total = 0;
  for (var i = 1; i <= 9; i++) {
    phq9Total += Number(answers.phq9[i] || 0);
  }
  var phq9Level = '';
  var phq9Text = '';
  if (phq9Total < 5) {
    phq9Level = '无抑郁';
    phq9Text = 'PHQ-9 总分 < 5 分，无抑郁症状。';
  } else {
    phq9Level = '抑郁';
    phq9Text = 'PHQ-9 总分 ≥ 5 分，存在抑郁症状。';
  }

  // ===== GAD-7 =====
  var gad7Total = 0;
  for (var i = 1; i <= 7; i++) {
    gad7Total += Number(answers.gad7[i] || 0);
  }
  var gad7Level = '';
  var gad7Text = '';
  if (gad7Total < 5) {
    gad7Level = '无焦虑';
    gad7Text = 'GAD-7 总分 < 5 分，无焦虑症状。';
  } else {
    gad7Level = '焦虑';
    gad7Text = 'GAD-7 总分 ≥ 5 分，存在焦虑症状。';
  }

  // ===== SCL-90 =====
  // 各因子参考常模 (M ± SD)
  var SCL90_NORMS = {
    '躯体化':        { m: 1.37, sd: 0.48 },
    '强迫症状':      { m: 1.62, sd: 0.58 },
    '人际关系敏感':  { m: 1.65, sd: 0.51 },
    '抑郁':          { m: 1.50, sd: 0.59 },
    '焦虑':          { m: 1.39, sd: 0.43 },
    '敌对':          { m: 1.48, sd: 0.56 },
    '恐怖':          { m: 1.23, sd: 0.41 },
    '偏执':          { m: 1.43, sd: 0.57 },
    '精神病性':      { m: 1.29, sd: 0.42 },
    '其他':          { m: 0, sd: 0 }
  };

  /* 程度判定：< M+1SD→轻, M+1SD~M+2SD→中, >=M+2SD→重 */
  function degreeLevel(score, norm) {
    if (!norm || !norm.m) return '—';
    if (score < norm.m + norm.sd) return '轻';
    if (score < norm.m + 2 * norm.sd) return '中';
    return '重';
  }

  // SCL-90 指标计算（按标准公式）
  // 总分: 90个单项分之和
  // 总均分: 总分÷90
  // 阴性项目数: 单项分=1的项目数
  // 阳性项目数: 单项分≥2的项目数
  // 阳性均分: 阳性项目总分÷阳性项目数
  // 因子均分: 各因子得分÷该因子项目数
  var scl90Total = 0;
  var scl90PositiveItems = 0;
  var scl90PositiveSum = 0;
  for (var i = 1; i <= 90; i++) {
    var v = Number(answers.scl90[i] || 0);
    if (v > 0) {
      scl90Total += v;
      if (v >= 2) {
        scl90PositiveItems++;
        scl90PositiveSum += v;
      }
    }
  }
  var scl90NegativeItems = 90 - scl90PositiveItems;
  var scl90GSI = (scl90Total / 90).toFixed(2);
  var scl90PSDL = scl90PositiveItems > 0 ? (scl90PositiveSum / scl90PositiveItems).toFixed(2) : '0.00';

  var scl90FactorRows = [];
  for (var fi = 0; fi < SCL90_FACTORS.length; fi++) {
    var factor = SCL90_FACTORS[fi];
    var sum = 0;
    for (var ki = 0; ki < factor.items.length; ki++) {
      sum += Number(answers.scl90[factor.items[ki]] || 0);
    }
    var fAvg = Math.round(sum / factor.items.length * 100) / 100;
    var norm = SCL90_NORMS[factor.name];
    var level = norm && norm.m ? degreeLevel(fAvg, norm) : '—';
    var ref = norm && norm.m ? (norm.m.toFixed(2) + ' ± ' + norm.sd.toFixed(2)) : '—';
    scl90FactorRows.push({
      name: factor.name,
      score: fAvg.toFixed(2),
      ref: ref,
      level: level,
      highlight: fAvg >= 2.5
    });
  }

  var gsiNum = parseFloat(scl90GSI);
  var scl90Text = '';
  if (gsiNum < 1) {
    scl90Text = '您的总体心理健康状况良好，各症状维度得分均在正常范围内。';
  } else if (gsiNum < 1.5) {
    scl90Text = '您存在轻微的心理症状，但总体影响较小。建议关注自身情绪变化，适当放松减压。';
  } else if (gsiNum < 2) {
    scl90Text = '您存在中等程度的心理症状，可能对日常生活造成一定影响。建议寻求专业心理咨询。';
  } else {
    scl90Text = '您的心理症状较为明显，可能对日常生活造成较大影响。强烈建议尽快寻求专业帮助。';
  }

  // 用户个人信息（从 globalData）
  return {
    userName: info.name || '—',
    userGender: info.gender || '—',
    userAge: info.age != null && info.age !== '' ? info.age : '—',
    userWorkYears: info.workYears != null && info.workYears !== '' ? info.workYears : '—',
    userEducation: info.education || '—',
    userOccupation: info.occupation || '—',

    sleep50Total: sleep50Total,
    sleep50Avg: sleep50Avg,
    sleep50Text: sleep50Text,
    sleep50FactorPairs: sleep50FactorPairs,

    psqiTotal: psqiComponentTotal,
    psqiQuality: psqiQuality,
    psqiText: psqiText,
    psqiFactorPairs: psqiFactorPairs,

    phq9Total: phq9Total,
    phq9Level: phq9Level,
    phq9Text: phq9Text,

    gad7Total: gad7Total,
    gad7Level: gad7Level,
    gad7Text: gad7Text,

    scl90Total: scl90Total,
    scl90GSI: scl90GSI,
    scl90PositiveItems: scl90PositiveItems,
    scl90NegativeItems: scl90NegativeItems,
    scl90PSDL: scl90PSDL,
    scl90Text: scl90Text,
    scl90FactorRows: scl90FactorRows
  };
}
