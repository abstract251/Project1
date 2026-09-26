/**
 * questions.js — 全部量表题目数据
 * =====================================================
 * 本文件内容与小程序版 front/pages/assessment/index.js 中
 * 的题目、选项、因子定义【逐字一致】，请勿修改文字内容。
 * =====================================================
 */

// ===== Sleep-50 选项 =====
var SLEEP50_OPTIONS = [
  { value: 1, label: '根本没有', desc: '完全没有出现过该症状' },
  { value: 2, label: '一点', desc: '偶尔出现，程度轻微' },
  { value: 3, label: '相当多', desc: '经常出现，有一定影响' },
  { value: 4, label: '非常多', desc: '频繁出现，严重影响生活' }
];

// ===== PSQI 选项 =====
var PSQI_OPTIONS_5TO14 = [
  { value: 1, label: '无' },
  { value: 2, label: '<1次/周' },
  { value: 3, label: '1-2次/周' },
  { value: 4, label: '≥3次/周' }
];
var PSQI_OPTION_15 = [
  { value: 1, label: '很好' },
  { value: 2, label: '较好' },
  { value: 3, label: '较差' },
  { value: 4, label: '很差' }
];
var PSQI_OPTION_18 = [
  { value: 1, label: '没有' },
  { value: 2, label: '偶尔有' },
  { value: 3, label: '有时有' },
  { value: 4, label: '经常有' }
];

// ===== PHQ-9 选项 =====
var PHQ9_OPTIONS = [
  { value: 0, label: '完全不会', desc: '过去两周完全没有出现这种情况' },
  { value: 1, label: '几天', desc: '过去两周中有几天出现' },
  { value: 2, label: '一半以上的天数', desc: '过去两周中超过一半的天数出现' },
  { value: 3, label: '几乎每天', desc: '过去两周中几乎每天都出现' }
];

// ===== GAD-7 选项 =====
var GAD7_OPTIONS = [
  { value: 0, label: '完全不会', desc: '过去两周完全没有出现这种情况' },
  { value: 1, label: '几天', desc: '过去两周中有几天出现' },
  { value: 2, label: '一半以上的日子', desc: '过去两周中超过一半的日子出现' },
  { value: 3, label: '几乎每天', desc: '过去两周中几乎每天都出现' }
];

// ===== SCL-90 选项 =====
var SCL90_OPTIONS = [
  { value: 1, label: '没有', desc: '自觉并无该项症状（问题）' },
  { value: 2, label: '很轻', desc: '自觉有该项症状，但并无实际影响，或影响轻微' },
  { value: 3, label: '中等', desc: '自觉有该项症状，有一定的影响' },
  { value: 4, label: '偏重', desc: '自觉常有该项症状，有相当程度的影响' },
  { value: 5, label: '严重', desc: '自觉该症状的频度和强度都十分严重，影响严重' }
];

// ===== Sleep-50 题目 (50题 + 4题附加评估) =====
var SLEEP50_QUESTIONS = [
  { id: 1, text: '打鼾', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 2, text: '出汗', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 3, text: '睡眠憋气', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 4, text: '睡醒后喘息', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 5, text: '睡醒后口干', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 6, text: '因咳嗽/憋气而醒', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 7, text: '睡醒后觉得口酸', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 8, text: '睡醒后头疼', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 9, text: '入睡困难', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 10, text: '因思虑失眠', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 11, text: '难以放松', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 12, text: '半夜醒来', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 13, text: '半夜醒后难以入睡', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 14, text: '早醒，且难以入睡', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 15, text: '睡眠浅', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 16, text: '睡眠时间少', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 17, text: '刚入睡或醒来后如大梦一场', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 18, text: '有时在公众场合睡着', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 19, text: '白天瞌睡', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 20, text: '白天情绪激动时，突然肌无力', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 21, text: '刚入睡和刚醒来时不能活动', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 22, text: '睡觉时踢腿', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 23, text: '夜间腿部肌肉痉挛或疼痛', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 24, text: '夜间腿部抖动', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 25, text: '入睡时出现"不安腿"', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 26, text: '在不同的时间入睡', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 27, text: '每次上床睡觉时间不同（>2h）', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 28, text: '日夜颠倒地工作', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 29, text: '睡眠中站立', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 30, text: '发现醒后的环境与入睡时不同', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 31, text: '发现睡眠时有活动的痕迹，但想不起来', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 32, text: '做恐怖的梦（若无，转 37 题）', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 33, text: '从恐怖的梦醒来', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 34, text: '记得这些梦的内容', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 35, text: '可以在做梦后快速定向', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 36, text: '在恐怖的梦中或梦后出现躯体症状（如：出汗、心悸、气短等）', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 37, text: '晚上卧室光线太强', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 38, text: '晚上卧室太吵', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 39, text: '晚上喝含有酒精的饮料', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 40, text: '感到悲伤和抑郁', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 41, text: '服用药物（安眠药或其他药物）', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 42, text: '常感到悲伤和抑郁', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 43, text: '对日常工作毫无兴趣', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 44, text: '起床时感到疲乏', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 45, text: '白天嗜睡并努力保持清醒', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 46, text: '我希望白天更有精力', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 47, text: '容易激惹', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 48, text: '在工作或学习上难以集中注意力', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 49, text: '担心睡眠不足', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 50, text: '总的来说，睡眠不好', scale: 'sleep50', options: SLEEP50_OPTIONS },
  { id: 51, text: 'A. 我对自己睡眠的评分为：（1=非常差，10=非常好）', scale: 'sleep50', options: [], noScore: true },
  { id: 52, text: 'B. 每晚实际睡眠时间约为：', scale: 'sleep50', options: [], noScore: true },
  { id: 53, text: 'B. 通常上床睡觉时间为：', scale: 'sleep50', options: [], noScore: true },
  { id: 54, text: 'B. 起床时间为：', scale: 'sleep50', options: [], noScore: true }
];

// ===== PSQI 题目 (18题) =====
var PSQI_QUESTIONS = [
  { id: 1, text: '近1个月，晚上上床睡觉通常是几点？', scale: 'psqi', options: [] },
  { id: 2, text: '近1个月，上床到入睡通常需要多少分钟？', scale: 'psqi', options: [] },
  { id: 3, text: '近1个月，通常早上几点起床？', scale: 'psqi', options: [] },
  { id: 4, text: '近1个月，每夜通常实际睡眠多少小时？', scale: 'psqi', options: [] },
  { id: 5, text: '5-a. 入睡困难（30分钟内不能入睡）', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 6, text: '5-b. 夜间易醒或早醒', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 7, text: '5-c. 夜间去厕所', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 8, text: '5-d. 呼吸不畅', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 9, text: '5-e. 咳嗽或鼾声高', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 10, text: '5-f. 感觉冷', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 11, text: '5-g. 感觉热', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 12, text: '5-h. 做恶梦', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 13, text: '5-i. 疼痛不适', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 14, text: '5-j. 其它影响睡眠的事情', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 15, text: '6. 近1个月，总体您认为自己的睡眠质量', scale: 'psqi', options: PSQI_OPTION_15 },
  { id: 16, text: '7. 近1个月，您用药物催眠的情况', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 17, text: '8. 近1个月，您常感到困倦吗', scale: 'psqi', options: PSQI_OPTIONS_5TO14 },
  { id: 18, text: '9. 近1个月，您做事情的精力不足吗', scale: 'psqi', options: PSQI_OPTION_18 }
];

// ===== PHQ-9 题目 (9题) =====
var PHQ9_QUESTIONS = [
  { id: 1, text: '做事时提不起劲或没有兴趣', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 2, text: '感到心情低落，沮丧或绝望', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 3, text: '入睡困难，睡不安稳或睡眠过多', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 4, text: '感觉疲倦或没有活力', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 5, text: '食欲不振或吃太多', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 6, text: '觉得自己很糟或觉得自己很失败，或让自己或家人失望', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 7, text: '对事物专注有困难，例如阅读报纸或看电视时', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 8, text: '动作或说话速度缓慢到别人已经察觉？或正好相反——烦躁或坐立不安、动来动去的情况更胜于平常', scale: 'phq9', options: PHQ9_OPTIONS },
  { id: 9, text: '有不如死掉或用某种方式伤害自己的念头', scale: 'phq9', options: PHQ9_OPTIONS }
];

// ===== GAD-7 题目 (7题) =====
var GAD7_QUESTIONS = [
  { id: 1, text: '感觉紧张，焦虑或急切', scale: 'gad7', options: GAD7_OPTIONS },
  { id: 2, text: '不能够停止或控制担忧', scale: 'gad7', options: GAD7_OPTIONS },
  { id: 3, text: '对各种各样的事情担忧过多', scale: 'gad7', options: GAD7_OPTIONS },
  { id: 4, text: '很难放松下来', scale: 'gad7', options: GAD7_OPTIONS },
  { id: 5, text: '由于不安而无法静坐', scale: 'gad7', options: GAD7_OPTIONS },
  { id: 6, text: '变得容易烦恼或急躁', scale: 'gad7', options: GAD7_OPTIONS },
  { id: 7, text: '感到似乎将有可怕的事情发生而害怕', scale: 'gad7', options: GAD7_OPTIONS }
];

// ===== SCL-90 题目 (90题) =====
var SCL90_QUESTIONS = [
  { id: 1, text: '头痛', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 2, text: '神经过敏，心中不踏实', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 3, text: '头脑中有不必要的想法或字句盘旋', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 4, text: '头晕和昏倒', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 5, text: '对异性的兴趣减退', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 6, text: '对旁人责备求全', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 7, text: '感到别人能控制您的思想', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 8, text: '责怪别人制造麻烦', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 9, text: '忘记性大', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 10, text: '担心自己的衣饰整齐及仪态的端正', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 11, text: '容易烦恼和激动', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 12, text: '胸痛', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 13, text: '害怕空旷的场所或街道', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 14, text: '感到自己的精力下降，活动减慢', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 15, text: '想结束自己的生命', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 16, text: '听到旁人听不到的声音', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 17, text: '发抖', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 18, text: '感到大多数人都不可信任', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 19, text: '胃口不好', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 20, text: '容易哭泣', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 21, text: '同异性相处时感到害羞不自在', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 22, text: '感到受骗、中了圈套或有人想抓住您', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 23, text: '无缘无故地突然感到害怕', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 24, text: '自己不能控制地发脾气', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 25, text: '怕单独出门', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 26, text: '经常责怪自己', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 27, text: '腰痛', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 28, text: '感到难以完成任务', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 29, text: '感到孤独', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 30, text: '感到苦闷', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 31, text: '过分担忧', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 32, text: '对事物不感兴趣', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 33, text: '感到害怕', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 34, text: '我的感情容易受到伤害', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 35, text: '旁人能知道您的私下想法', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 36, text: '感到别人不理解您不同情您', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 37, text: '感到人们对您不友好，不喜欢您', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 38, text: '做事必须做得很慢以保证做得正确', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 39, text: '心跳得很厉害', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 40, text: '恶心或胃部不舒服', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 41, text: '感到比不上他人', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 42, text: '肌肉酸痛', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 43, text: '感到有人在监视您谈论您', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 44, text: '难以入睡', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 45, text: '做事必须反复检查', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 46, text: '难以作出决定', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 47, text: '怕乘电车、公共汽车、地铁或火车', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 48, text: '呼吸有困难', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 49, text: '一阵阵发冷或发热', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 50, text: '因为感到害怕而避开某些东西、场合或活动', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 51, text: '脑子变空了', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 52, text: '身体发麻或刺痛', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 53, text: '喉咙有梗塞感', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 54, text: '感到没有前途没有希望', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 55, text: '不能集中注意', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 56, text: '感到身体的某一部分软弱无力', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 57, text: '感到紧张或容易紧张', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 58, text: '感到手或脚发重', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 59, text: '想到死亡的事', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 60, text: '吃得太多', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 61, text: '当别人看着您或谈论您时感到不自在', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 62, text: '有一些不属于您自己的想法', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 63, text: '有想打人或伤害他人的冲动', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 64, text: '醒得太早', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 65, text: '必须反复洗手、点数目或触摸某些东西', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 66, text: '睡得不稳不深', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 67, text: '有想摔坏或破坏东西的冲动', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 68, text: '有一些别人没有的想法或念头', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 69, text: '感到对别人神经过敏', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 70, text: '在商店或电影院等人多的地方感到不自在', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 71, text: '感到任何事情都很困难', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 72, text: '一阵阵恐惧或惊恐', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 73, text: '感到在公共场合吃东西很不舒服', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 74, text: '经常与人争论', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 75, text: '单独一人时神经很紧张', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 76, text: '别人对您的成绩没有作出恰当的评价', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 77, text: '即使和别人在一起也感到孤单', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 78, text: '感到坐立不安心神不定', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 79, text: '感到自己没有什么价值', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 80, text: '感到熟悉的东西变成陌生或不象是真的', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 81, text: '大叫或摔东西', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 82, text: '害怕会在公共场合昏倒', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 83, text: '感到别人想占您的便宜', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 84, text: '为一些有关"性"的想法而很苦恼', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 85, text: '您认为应该因为自己的过错而受到惩罚', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 86, text: '感到要赶快把事情做完', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 87, text: '感到自己的身体有严重问题', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 88, text: '从未感到和其他人很亲近', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 89, text: '感到自己有罪', scale: 'scl90', options: SCL90_OPTIONS },
  { id: 90, text: '感到自己的脑子有毛病', scale: 'scl90', options: SCL90_OPTIONS }
];

// SCL-90 因子定义
var SCL90_FACTORS = [
  { name: '躯体化',      items: [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58] },
  { name: '强迫症状',    items: [3, 9, 10, 28, 38, 45, 46, 51, 55, 65] },
  { name: '人际关系敏感',items: [6, 21, 34, 36, 37, 41, 61, 69, 73] },
  { name: '抑郁',        items: [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79] },
  { name: '焦虑',        items: [2, 17, 23, 33, 39, 57, 72, 78, 80, 86] },
  { name: '敌对',        items: [11, 24, 63, 67, 74, 81] },
  { name: '恐怖',        items: [13, 25, 47, 50, 70, 75, 82] },
  { name: '偏执',        items: [8, 18, 43, 68, 76, 83] },
  { name: '精神病性',    items: [7, 16, 35, 62, 77, 84, 85, 87, 88, 90] },
  { name: '其他',        items: [19, 44, 59, 60, 64, 66, 89] }
];

// ===== 量表配置 =====
var SCALES = [
  {
    key: 'sleep50',
    name: 'Sleep-50 问卷',
    totalQ: 54,
    instructions: '请阅读以下每个描述，选出最近四周最符合您情况的选项。评分方法：受试者根据最近一个月的体验，对量表的每一个条目从 1分（"根本没有"）到 4分（"非常多"）进行相应的评分。',
    questions: SLEEP50_QUESTIONS,
    fillBlankIndices: [51, 52, 53, 54]
  },
  {
    key: 'psqi',
    name: 'PSQI 睡眠质量',
    totalQ: 18,
    instructions: '请根据近1个月的睡眠情况如实填写。以下问题涉及您最近1个月的睡眠习惯。',
    questions: PSQI_QUESTIONS,
    fillBlankIndices: [1, 2, 3, 4]
  },
  {
    key: 'phq9',
    name: 'PHQ-9 抑郁筛查',
    totalQ: 9,
    instructions: '在过去的两周内，以下情况烦扰您有多频繁？',
    questions: PHQ9_QUESTIONS,
    fillBlankIndices: []
  },
  {
    key: 'gad7',
    name: 'GAD-7 焦虑筛查',
    totalQ: 7,
    instructions: '在过去的两周内，有多少时候您受到以下任何问题困扰？',
    questions: GAD7_QUESTIONS,
    fillBlankIndices: []
  },
  {
    key: 'scl90',
    name: 'SCL-90 症状自评',
    totalQ: 90,
    instructions: '请根据最近一周的实际情况，对以下 90 个项目进行 1~5 级评分。1=无，2=轻度，3=中度，4=偏重，5=严重。',
    questions: SCL90_QUESTIONS,
    fillBlankIndices: []
  }
];
