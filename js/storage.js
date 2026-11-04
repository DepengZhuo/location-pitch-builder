/* =========================================================
   本地存储模块：统一读写项目、当前项目和合规文件元数据
   数据使用 localStorage；不会上传到服务器。
   ========================================================= */
import { DEFAULT_DOCS } from './data.js';

const STORAGE_KEY = 'haha_location_pitch_builder_v1';

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: [], currentProjectId: null, docs: structuredClone(DEFAULT_DOCS) };
    const parsed = JSON.parse(raw);
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      currentProjectId: parsed.currentProjectId || null,
      docs: Array.isArray(parsed.docs) ? parsed.docs : structuredClone(DEFAULT_DOCS)
    };
  } catch (error) {
    console.warn('读取本地项目数据失败，已使用空白数据。', error);
    return { projects: [], currentProjectId: null, docs: structuredClone(DEFAULT_DOCS) };
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch (error) {
    console.error('保存本地数据失败：', error);
    return false;
  }
}

export function createProject(name, city = '') {
  const now = new Date().toISOString();
  return {
    id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(), city: city.trim(),
    createdAt: now, updatedAt: now,
    score: null, roi: null, proposal: null
  };
}
