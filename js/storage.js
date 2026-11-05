/* ===================================================
   本地存储模块：统一读写项目、当前项目和合规文件元数据
   数据使用 localStorage；不会上传到服务器。
   =================================================== */
import { DEFAULT_DOCS } from './data.js';

const STORAGE_KEY = 'haha_location_pitch_builder_v1';
const DEFAULT_SAFE_NOTES_ZH = '零场地改造成本：设备即插即用（仅需标准 110V 电源插座，内置 4G/LTE 无线通信模块，无需拉网线）；运营商承担 100% 设备投放、安装、日常补货、维保及 $2M 商业责任险费用；支持首期 90 天试运营评估与灵活退换机制。';

const cloneDocs = () => JSON.parse(JSON.stringify(DEFAULT_DOCS));

export function cleanLegacyNotes(notes) {
  if (!notes) return DEFAULT_SAFE_NOTES_ZH;
  const trimmed = String(notes).trim();
  if (
    trimmed.includes('收益测算参考') ||
    trimmed.includes('非收益承诺') ||
    trimmed.includes('需进一步确认设备摆放区域、电源及网络条件')
  ) {
    return DEFAULT_SAFE_NOTES_ZH;
  }
  return trimmed;
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: [], currentProjectId: null, docs: cloneDocs() };
    const parsed = JSON.parse(raw);
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    projects.forEach(p => {
      if (p?.proposal?.notes) {
        p.proposal.notes = cleanLegacyNotes(p.proposal.notes);
      }
    });
    return {
      projects,
      currentProjectId: parsed.currentProjectId || null,
      docs: Array.isArray(parsed.docs) ? parsed.docs : cloneDocs()
    };
  } catch (error) {
    console.warn('读取本地项目数据失败，已使用空白数据。', error);
    return { projects: [], currentProjectId: null, docs: cloneDocs() };
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch (error) {
    console.warn('保存本地数据失败：', error);
    return false;
  }
}

export function createProject(name, city = '') {
  const now = new Date().toISOString();
  return {
    id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: String(name || '').trim() || '未命名点位项目',
    city: String(city || '').trim(),
    createdAt: now,
    updatedAt: now,
    score: null,
    roi: null,
    proposal: null
  };
}
