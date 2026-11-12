/* ===================================================
   本地存储模块：统一读写项目、当前项目和合规文件元数据
   数据使用 localStorage；不会上传到服务器。
   =================================================== */
import { DEFAULT_DOCS } from './data.js';

const STORAGE_KEY = 'haha_location_pitch_builder_v1';
const DEFAULT_SAFE_NOTES_ZH = '双方商定的任何其他要求、场地特殊安排或特别条款均可在此处记录。最终合作安排以点位方与运营商双方达成的共同协议为准。';

const cloneDocs = () => JSON.parse(JSON.stringify(DEFAULT_DOCS));

export function cleanLegacyNotes(notes) {
  if (!notes) return DEFAULT_SAFE_NOTES_ZH;
  const trimmed = String(notes).trim();
  if (
    trimmed.includes('收益测算参考') ||
    trimmed.includes('非收益承诺') ||
    trimmed.includes('需进一步确认设备摆放区域、电源及网络条件') ||
    trimmed.includes('零场地改造成本：设备即插即用') ||
    trimmed.includes('Zero cost to property: Plug-and-play setup')
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
