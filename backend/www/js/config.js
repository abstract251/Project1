/**
 * config.js — 全局配置
 * =====================================================
 * Web 版心理测评系统 前端全局配置
 * 对应小程序版 front/app.js 中的 globalData 配置
 * =====================================================
 */

// ===== API 后端地址（部署到云服务器后改这里）=====
// 小程序版默认: 'https://hospitalsurvey.online'
// 示例：
//   本地联调: 'http://127.0.0.1:5000'
//   云服务器: 'https://你的域名'
var API_BASE_URL = 'https://hospitalsurvey.online';

// ===== 量表类型 → 展示名称映射（与小程序版 app.js 一致）=====
var SCALE_TYPE_MAP = {
  'sleep50': 'Sleep-50',
  'psqi': 'PSQI',
  'phq9': 'PHQ-9',
  'gad7': 'GAD-7',
  'scl90': 'SCL-90'
};

// ===== 访客 ID 相关（对应小程序版 app.js 的 visitorId 逻辑）=====
var VISITOR_ID_KEY = 'visitor_id';
var ADMIN_USER_KEY = 'adminUser';
var ASSESSMENT_CACHE_KEY = 'assessment_cache';
var OLD_SLEEP_CACHE_KEY = 'sleep_cache';        // 兼容旧缓存 key
var PERSONAL_INFO_KEY = 'personalInfo';          // 对应 globalData.personalInfo（会话级）
var OVERVIEW_DATA_KEY = 'currentAssessmentOverview'; // 对应 globalData.currentAssessmentOverview（会话级）
