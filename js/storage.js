/* ===================================================
   Local Storage Module: Projects & Compliance Metadata
   =================================================== */
import { DEFAULT_DOCS } from './data.js';

const STORAGE_KEY = 'haha_location_pitch_builder_v1';
const DEFAULT_SAFE_NOTES_EN = 'Any additional requirements, site-specific arrangements, or special terms agreed upon by both parties may be documented here. Final arrangements will be subject to mutual agreement between the Property Owner and the Operator.';

const cloneDocs = () => JSON.parse(JSON.stringify(DEFAULT_DOCS));

export function cleanLegacyNotes(notes) {
  if (!notes) return DEFAULT_SAFE_NOTES_EN;
  const trimmed = String(notes).trim();
  if (
    trimmed.includes('收益测算参考') ||
    trimmed.includes('非收益承诺') ||
    trimmed.includes('需进一步确认设备摆放区域、电源及网络条件') ||
    trimmed.includes('零场地改造成本：设备即插即用') ||
    trimmed.includes('Zero cost to property: Plug-and-play setup')
  ) {
    return DEFAULT_SAFE_NOTES_EN;
  }
  return trimmed;
}

export function cleanLegacyProposalData(prop) {
  if (!prop || typeof prop !== 'object') return prop;
  const out = { ...prop };
  if (out.notes) out.notes = cleanLegacyNotes(out.notes);

  // Upgrade legacy v5 service text to v6 standard
  if (
    typeof out.service === 'string' &&
    (out.service.includes('运营商负责商品采购、定期补货、设备清洁与日常运营') ||
     out.service.includes('商品补货与库存管理：由运营商负责') ||
     out.service.includes('Restocking & inventory management: Handled by the operator'))
  ) {
    delete out.service;
  }

  // Upgrade legacy v5 confirmItems text to v6 standard
  if (
    typeof out.confirmItems === 'string' &&
    (out.confirmItems.includes('现场安装位置、尺寸、电源和网络条件') ||
     out.confirmItems.includes('合作期限、分成基数、对账依据和付款日期') ||
     out.confirmItems.includes('Installation location, dimensions, power outlet'))
  ) {
    delete out.confirmItems;
  }

  // Upgrade legacy v5 warranty text to v6 standard
  if (
    typeof out.warranty === 'string' &&
    (out.warranty.includes('7×24 小时云端温控与设备状态监控') ||
     out.warranty.includes('24/7 cloud temperature & telemetry monitoring'))
  ) {
    delete out.warranty;
  }

  // Upgrade legacy v5 planogram text
  if (
    typeof out.planogram === 'string' &&
    (out.planogram.includes('饮料、瓶装水、健康零食、方便食品及日常必需品') ||
     out.planogram.includes('瓶装水、运动饮料、碳酸饮料、健康零食'))
  ) {
    delete out.planogram;
  }

  return out;
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: [], currentProjectId: null, docs: cloneDocs() };
    const parsed = JSON.parse(raw);
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    projects.forEach(p => {
      if (p?.proposal) {
        p.proposal = cleanLegacyProposalData(p.proposal);
      }
    });
    return {
      projects,
      currentProjectId: parsed.currentProjectId || null,
      docs: Array.isArray(parsed.docs) ? parsed.docs : cloneDocs()
    };
  } catch (error) {
    console.warn('Failed to load local project data; using empty state.', error);
    return { projects: [], currentProjectId: null, docs: cloneDocs() };
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch (error) {
    console.warn('Failed to save local project data:', error);
    return false;
  }
}

export function createProject(name, city = '') {
  const now = new Date().toISOString();
  return {
    id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: String(name || '').trim() || 'Untitled Location Project',
    city: String(city || '').trim(),
    createdAt: now,
    updatedAt: now,
    score: null,
    roi: null,
    proposal: null
  };
}
