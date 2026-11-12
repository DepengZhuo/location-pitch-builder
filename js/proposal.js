/* ==================================================
   Business Proposal Module (v6.2):
   - 01 Partnership Overview (Mandatory, split Contact Email & Phone)
   - 02 Recommended Equipment & Site Rendering (Mandatory:
     left side shows ONLY Machine Model & Deployment Quantity + Add Equipment;
     right preview shows 2-tier Energy/Power & Footprint/Dimensions + subtle power note + dual images)
   - 03 Venue Value Proposition (Optional, 4 bullets, auto-aligned & bolded)
   - 04 Product Mix & Merchandising (Optional)
   - 05 Partnership Model & Property Earnings (Optional)
   - 06 Daily Operations & Warranty Support (Optional)
   - 07 Compliance Documents (Optional, synced with Compliance Center)
   - 08 Final Arrangements & Additional Notes (Optional)
   - 09+ Custom Sections (No "(09)" suffix in default title)
   ================================================== */
import { escapeHTML, money, machineFootprint, MACHINE_MODELS, VENUE_TYPES, VENUE_TEMPLATES, POWER_SUPPLY_SPEC, normalizeVenue, DEFAULT_DOCS } from './data.js';
import { cleanLegacyNotes } from './storage.js';
import { getLanguage, t, translateMultiline, PROPOSAL_DEFAULTS } from './i18n.js';

const el = id => document.getElementById(id);

const DEFAULT_MODULE_FLAGS = {
  basic: true,
  equipment: true,
  venueValue: true,
  planogram: true,
  deal: true,
  operations: true,
  compliance: true,
  finalNotes: true
};

let moduleFlags = { ...DEFAULT_MODULE_FLAGS };
let machinesState = [{ id: 'm_1', model: 'Pro 542', quantity: 1 }];
let customModulesState = [];
let selectedDocIds = ['nama', 'ul-etl', 'coi'];
let cachedDocsList = DEFAULT_DOCS;
let onUpdateCallback = () => {};
let venueValueTouched = false;
let planogramTouched = false;

export function getDefaultVenueCopy(venue, lang = getLanguage()) {
  const norm = normalizeVenue(venue);
  const tpl = VENUE_TEMPLATES[norm] || VENUE_TEMPLATES['Apartment & Residential'];
  return {
    venueValue: lang === 'zh' ? tpl.valueZh : tpl.valueEn,
    planogram: lang === 'zh' ? tpl.planogramZh : tpl.planogramEn
  };
}

export function applyVenueDefaultsIfNeeded(venue, force = false) {
  const norm = normalizeVenue(venue);
  const copy = getDefaultVenueCopy(norm, getLanguage());
  const valInput = el('propVenueValue');
  const planInput = el('propPlanogram');
  if (valInput && (force || !venueValueTouched || !valInput.value.trim())) {
    valInput.value = copy.venueValue;
    if (force) venueValueTouched = false;
  }
  if (planInput && (force || !planogramTouched || !planInput.value.trim())) {
    planInput.value = copy.planogram;
    if (force) planogramTouched = false;
  }
}

export function syncProposalFormLanguage() {
  const lang = getLanguage() === 'zh' ? 'zh' : 'en';
  const d = PROPOSAL_DEFAULTS[lang];
  const venue = normalizeVenue(el('propVenue')?.value);
  const tpl = VENUE_TEMPLATES[venue] || VENUE_TEMPLATES['Apartment & Residential'];

  const valEl = el('propVenueValue');
  if (valEl) {
    const cur = valEl.value.trim();
    const matchesAnyDefault = Object.values(VENUE_TEMPLATES).some(
      v => v.valueZh.trim() === cur || v.valueEn.trim() === cur
    );
    if (!cur || matchesAnyDefault || !venueValueTouched) {
      valEl.value = lang === 'zh' ? tpl.valueZh : tpl.valueEn;
    } else {
      valEl.value = translateMultiline(valEl.value);
    }
  }

  const planEl = el('propPlanogram');
  if (planEl) {
    const cur = planEl.value.trim();
    const matchesAnyPlan = Object.values(VENUE_TEMPLATES).some(
      v => v.planogramZh.trim() === cur || v.planogramEn.trim() === cur
    ) || cur === PROPOSAL_DEFAULTS.zh.planogram.trim() || cur === PROPOSAL_DEFAULTS.en.planogram.trim();
    if (!cur || matchesAnyPlan || !planogramTouched) {
      planEl.value = lang === 'zh' ? tpl.planogramZh : tpl.planogramEn;
    } else {
      planEl.value = translateMultiline(planEl.value);
    }
  }

  const map = {
    propTitle: 'title',
    propLaunch: 'launch',
    propService: 'service',
    propWarranty: 'warranty',
    propConfirmItems: 'confirmItems',
    propNotes: 'notes'
  };
  Object.entries(map).forEach(([id, key]) => {
    const input = el(id);
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
      input.value = d[key] || '';
      return;
    }
    if (val === PROPOSAL_DEFAULTS.zh[key]?.trim() || val === PROPOSAL_DEFAULTS.en[key]?.trim()) {
      input.value = d[key];
    } else {
      input.value = translateMultiline(input.value);
    }
  });

  renderMachinesEditor();
  renderDocCheckboxes(cachedDocsList);
  renderCustomModulesEditor();
}

function renderMachinesEditor() {
  const container = el('propMachinesList');
  if (!container) return;
  const isZh = getLanguage() === 'zh';
  const models = Object.keys(MACHINE_MODELS);

  container.innerHTML = machinesState.map((item, idx) => {
    return `
      <div class="prop-machine-item" data-machine-id="${item.id}">
        ${machinesState.length > 1 ? `
        <div class="prop-machine-item-top">
          <strong>${isZh ? `设备 #${idx + 1}` : `Equipment #${idx + 1}`}</strong>
          <button type="button" class="text-button" data-remove-machine="${item.id}">${isZh ? '删除' : 'Remove'}</button>
        </div>` : ''}
        <div class="form-grid">
          <label class="field">
            <span>${isZh ? '选择设备型号' : 'Machine Model'}</span>
            <select data-machine-select="${item.id}">
              ${models.map(m => `<option value="${m}" ${m === item.model ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>${isZh ? '计划部署台数' : 'Deployment Quantity'}</span>
            <input type="number" min="1" max="50" value="${item.quantity || 1}" data-machine-qty="${item.id}" />
          </label>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-machine-select]').forEach(sel => {
    sel.addEventListener('change', () => {
      const target = machinesState.find(m => m.id === sel.dataset.machineSelect);
      if (target) {
        target.model = sel.value;
        onUpdateCallback();
      }
    });
  });

  container.querySelectorAll('[data-machine-qty]').forEach(inp => {
    inp.addEventListener('input', () => {
      const target = machinesState.find(m => m.id === inp.dataset.machineQty);
      if (target) {
        target.quantity = Math.max(1, Number(inp.value) || 1);
        onUpdateCallback();
      }
    });
  });

  container.querySelectorAll('[data-remove-machine]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (machinesState.length <= 1) return;
      machinesState = machinesState.filter(m => m.id !== btn.dataset.removeMachine);
      renderMachinesEditor();
      onUpdateCallback();
    });
  });
}

export function renderDocCheckboxes(docs = cachedDocsList) {
  cachedDocsList = docs || DEFAULT_DOCS;
  const grid = el('propDocSelectGrid');
  if (!grid) return;
  grid.innerHTML = cachedDocsList.map(doc => {
    const checked = selectedDocIds.includes(doc.id) ? 'checked' : '';
    return `<label><input type="checkbox" name="propDoc" value="${escapeHTML(doc.id)}" ${checked}> ${escapeHTML(t(doc.title))}</label>`;
  }).join('');

  grid.querySelectorAll('input[name="propDoc"]').forEach(input => {
    input.addEventListener('change', () => {
      selectedDocIds = [...grid.querySelectorAll('input[name="propDoc"]:checked')].map(i => i.value);
      onUpdateCallback();
    });
  });
}

function renderCustomModulesEditor() {
  const container = el('propCustomModulesList');
  if (!container) return;
  const isZh = getLanguage() === 'zh';

  container.innerHTML = customModulesState.map((cm, idx) => {
    const num = idx + 9;
    const numStr = num < 10 ? `0${num}` : `${num}`;
    // Strip any legacy trailing " (09)" from title
    const cleanTitle = String(cm.title || '').replace(/\s*\(\d+\)\s*$/, '').trim();
    cm.title = cleanTitle;
    const displayTitle = cleanTitle ? t(cleanTitle) : (isZh ? '特别合作约定' : 'Special Partnership Terms');
    return `
      <div class="prop-module-card ${cm.enabled === false ? 'is-unchecked' : ''}" data-cmod-id="${cm.id}">
        <div class="prop-module-head">
          <label class="prop-module-check">
            <input type="checkbox" data-cmod-toggle="${cm.id}" ${cm.enabled !== false ? 'checked' : ''} />
            <span class="criterion-num">${numStr}</span>
            <strong>${escapeHTML(displayTitle)}</strong>
          </label>
          <button type="button" class="text-button" data-cmod-del="${cm.id}">${isZh ? '删除模块' : 'Delete'}</button>
        </div>
        <div class="prop-module-body">
          <div class="form-grid">
            <label class="field full">
              <span>${isZh ? '模块标题' : 'Section Title'}</span>
              <input type="text" data-cmod-title="${cm.id}" value="${escapeHTML(displayTitle)}" placeholder="${isZh ? '例如：特别合作约定' : 'e.g. Special Partnership Terms'}" />
            </label>
            <label class="field full">
              <span>${isZh ? '模块内容（支持多行输入，右侧实时同步）' : 'Section Content (multi-line supported)'}</span>
              <textarea rows="4" data-cmod-body="${cm.id}">${escapeHTML(cm.content || '')}</textarea>
            </label>
          </div>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-cmod-toggle]').forEach(chk => {
    chk.addEventListener('change', () => {
      const target = customModulesState.find(m => m.id === chk.dataset.cmodToggle);
      if (target) {
        target.enabled = chk.checked;
        chk.closest('.prop-module-card')?.classList.toggle('is-unchecked', !chk.checked);
        onUpdateCallback();
      }
    });
  });

  container.querySelectorAll('[data-cmod-title]').forEach(inp => {
    inp.addEventListener('input', () => {
      const target = customModulesState.find(m => m.id === inp.dataset.cmodTitle);
      if (target) {
        target.title = inp.value.replace(/\s*\(\d+\)\s*$/, '');
        const headStrong = inp.closest('.prop-module-card')?.querySelector('.prop-module-check strong');
        if (headStrong) headStrong.textContent = target.title || (getLanguage() === 'zh' ? '特别合作约定' : 'Special Partnership Terms');
        onUpdateCallback();
      }
    });
  });

  container.querySelectorAll('[data-cmod-body]').forEach(ta => {
    ta.addEventListener('input', () => {
      const target = customModulesState.find(m => m.id === ta.dataset.cmodBody);
      if (target) {
        target.content = ta.value;
        onUpdateCallback();
      }
    });
  });

  container.querySelectorAll('[data-cmod-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      customModulesState = customModulesState.filter(m => m.id !== btn.dataset.cmodDel);
      renderCustomModulesEditor();
      onUpdateCallback();
    });
  });
}

export function readProposalForm() {
  const venue = normalizeVenue(el('propVenue')?.value);
  const totalQty = machinesState.reduce((sum, m) => sum + (Number(m.quantity) || 1), 0);
  moduleFlags.basic = true;
  moduleFlags.equipment = true;
  return {
    modulesEnabled: { ...moduleFlags, basic: true, equipment: true },
    title: el('propTitle')?.value.trim() || '',
    property: el('propProperty')?.value.trim() || '',
    city: el('propCity')?.value.trim() || '',
    operator: el('propOperator')?.value.trim() || '',
    contactName: el('propContactName')?.value.trim() || '',
    contactEmail: el('propContactEmail')?.value.trim() || '',
    contactPhone: el('propContactPhone')?.value.trim() || '',
    venue,
    machines: JSON.parse(JSON.stringify(machinesState)),
    machine: machinesState[0]?.model || 'Pro 542',
    quantity: totalQty,
    venueValue: el('propVenueValue')?.value.trim() || '',
    planogram: el('propPlanogram')?.value.trim() || '',
    deal: el('propDeal')?.value || 'revenueShare',
    share: Number(el('propShare')?.value || 0),
    rent: Number(el('propRent')?.value || 0),
    launch: el('propLaunch')?.value.trim() || '',
    service: el('propService')?.value.trim() || '',
    warranty: el('propWarranty')?.value.trim() || '',
    confirmItems: el('propConfirmItems')?.value.trim() || '',
    notes: cleanLegacyNotes(el('propNotes')?.value.trim() || ''),
    selectedDocs: [...selectedDocIds],
    customModules: JSON.parse(JSON.stringify(customModulesState))
  };
}

export function applyProposalForm(data = {}) {
  const lang = getLanguage() === 'zh' ? 'zh' : 'en';
  const d = PROPOSAL_DEFAULTS[lang];
  const venue = normalizeVenue(data.venue || 'Apartment & Residential');
  const vCopy = getDefaultVenueCopy(venue, lang);

  moduleFlags = { ...DEFAULT_MODULE_FLAGS, ...(data.modulesEnabled || {}), basic: true, equipment: true };
  document.querySelectorAll('[data-mod-key]').forEach(chk => {
    const k = chk.dataset.modKey;
    chk.checked = moduleFlags[k] !== false;
    chk.closest('.prop-module-card')?.classList.toggle('is-unchecked', !chk.checked);
  });

  if (Array.isArray(data.machines) && data.machines.length > 0) {
    machinesState = data.machines.map((m, idx) => ({
      id: m.id || `m_${idx + 1}`,
      model: MACHINE_MODELS[m.model] ? m.model : 'Pro 542',
      quantity: Math.max(1, Number(m.quantity) || 1)
    }));
  } else {
    const singleModel = data.machine && MACHINE_MODELS[data.machine] ? data.machine : 'Pro 542';
    machinesState = [{ id: 'm_1', model: singleModel, quantity: Math.max(1, Number(data.quantity) || 1) }];
  }

  customModulesState = Array.isArray(data.customModules)
    ? data.customModules.map(cm => ({
        ...cm,
        title: String(cm.title || '').replace(/\s*\(\d+\)\s*$/, '').trim()
      }))
    : [];
  selectedDocIds = Array.isArray(data.selectedDocs) ? [...data.selectedDocs] : ['nama', 'ul-etl', 'coi'];

  let dealValue = 'revenueShare';
  if (data.deal === 'amenity' || String(data.deal || '').includes('便民')) {
    dealValue = 'amenity';
  } else if (data.deal === 'fixedRent' || String(data.deal || '').includes('固定')) {
    dealValue = 'fixedRent';
  }

  let emailVal = data.contactEmail ?? '';
  let phoneVal = data.contactPhone ?? '';
  if (!phoneVal && emailVal.includes('|')) {
    const parts = emailVal.split('|').map(s => s.trim());
    emailVal = parts[0] || '';
    phoneVal = parts[1] || '';
  }

  let incomingVenueVal = data.venueValue || '';
  if (incomingVenueVal.includes('核心人群：') || incomingVenueVal.includes('Core Audience:')) {
    incomingVenueVal = '';
  }

  const merged = {
    title: data.title ?? d.title,
    property: data.property ?? '',
    city: data.city ?? '',
    operator: data.operator ?? '',
    contactName: data.contactName ?? '',
    contactEmail: emailVal,
    contactPhone: phoneVal,
    venue,
    deal: dealValue,
    share: data.share ?? 10,
    rent: data.rent ?? 200,
    launch: data.launch ?? d.launch,
    venueValue: incomingVenueVal || vCopy.venueValue,
    planogram: data.planogram || vCopy.planogram,
    service: data.service ?? d.service,
    warranty: data.warranty ?? d.warranty,
    confirmItems: data.confirmItems ?? d.confirmItems,
    notes: data.notes !== undefined ? cleanLegacyNotes(data.notes) : d.notes
  };

  venueValueTouched = Boolean(incomingVenueVal);
  planogramTouched = Boolean(data.planogram);

  const map = {
    title: 'propTitle',
    property: 'propProperty',
    city: 'propCity',
    operator: 'propOperator',
    contactName: 'propContactName',
    contactEmail: 'propContactEmail',
    contactPhone: 'propContactPhone',
    venue: 'propVenue',
    deal: 'propDeal',
    share: 'propShare',
    rent: 'propRent',
    launch: 'propLaunch',
    venueValue: 'propVenueValue',
    planogram: 'propPlanogram',
    service: 'propService',
    warranty: 'propWarranty',
    confirmItems: 'propConfirmItems',
    notes: 'propNotes'
  };
  Object.entries(map).forEach(([key, id]) => {
    if (el(id)) el(id).value = merged[key] ?? '';
  });

  syncProposalFormLanguage();
  updateDealFields();
}

function updateDealFields() {
  const mode = el('propDeal')?.value || 'revenueShare';
  if (el('propShareField')) el('propShareField').hidden = mode !== 'revenueShare';
  if (el('propRentField')) el('propRentField').hidden = mode !== 'fixedRent';
}

export function applyROIToProposal(roi) {
  if (!roi) return;
  if (roi.location && el('propProperty')) el('propProperty').value = roi.location;
  if (roi.venue && el('propVenue')) {
    const norm = normalizeVenue(roi.venue);
    el('propVenue').value = norm;
    applyVenueDefaultsIfNeeded(norm, false);
  }
  if (el('propDeal')) el('propDeal').value = roi.dealType || 'revenueShare';
  if (el('propShare')) el('propShare').value = roi.shareRate ?? 10;
  if (el('propRent')) el('propRent').value = roi.rent ?? 200;
  updateDealFields();
}

function formatInlineRich(text) {
  let safe = escapeHTML(text);
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  if (safe.includes('<strong>')) return safe;

  const idxZh = safe.indexOf('：');
  const idxEn = safe.indexOf(':');
  let splitIdx = -1;
  if (idxZh > 0 && idxZh < 36) splitIdx = idxZh;
  else if (idxEn > 0 && idxEn < 42) splitIdx = idxEn;
  if (splitIdx > 0 && splitIdx < safe.length - 1) {
    return `<strong>${safe.slice(0, splitIdx + 1)}</strong>${safe.slice(splitIdx + 1)}`;
  }
  return safe;
}

function renderRichLines(rawText, mode = 'auto') {
  const translated = translateMultiline(rawText || '');
  const lines = translated.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return `<p>${escapeHTML(t('To Be Provided'))}</p>`;

  if (mode === 'bullets') {
    const items = [];
    const extras = [];
    lines.forEach(line => {
      const clean = line.replace(/^([-•*]|\d+\.)\s*/, '').trim();
      if (/^(推荐重点|Key Focus)[：:]/i.test(clean)) {
        extras.push(`<div class="proposal-focus-bar">${formatInlineRich(clean)}</div>`);
      } else if (/[：:]$/.test(clean)) {
        extras.unshift(`<p>${formatInlineRich(clean)}</p>`);
      } else {
        items.push(`<li>${formatInlineRich(clean)}</li>`);
      }
    });
    const ulHtml = items.length ? `<ul>${items.join('')}</ul>` : '';
    return ulHtml + extras.join('');
  }

  const blocks = [];
  let currentUl = [];

  const flushUl = () => {
    if (currentUl.length) {
      blocks.push(`<ul>${currentUl.map(b => `<li>${formatInlineRich(b)}</li>`).join('')}</ul>`);
      currentUl = [];
    }
  };

  lines.forEach(line => {
    if (/^([-•*]|\d+\.)\s+/.test(line)) {
      currentUl.push(line.replace(/^([-•*]|\d+\.)\s+/, ''));
    } else {
      flushUl();
      blocks.push(`<p>${formatInlineRich(line)}</p>`);
    }
  });
  flushUl();
  return blocks.join('');
}

export function renderProposalPreview(roiData = null, scoreData = null, complianceDocs = []) {
  const previewEl = el('proposalPreview');
  if (!previewEl) return null;
  if (complianceDocs && complianceDocs.length) {
    cachedDocsList = complianceDocs;
  }

  const p = readProposalForm();
  const isZh = getLanguage() === 'zh';
  const flags = p.modulesEnabled || DEFAULT_MODULE_FLAGS;
  const safe = key => escapeHTML(p[key] ? translateMultiline(p[key]) : t('To Be Provided'));
  const venueObj = VENUE_TYPES.find(v => v.id === p.venue) || VENUE_TYPES[3];
  const venueDisplay = isZh ? venueObj.zh : venueObj.en;

  let secIdx = 0;
  const nextNum = () => {
    secIdx += 1;
    return secIdx < 10 ? `0${secIdx}` : `${secIdx}`;
  };

  const sections = [];

  // Module 01: Partnership Overview (Mandatory)
  {
    const n = nextNum();
    const introParagraph = isZh
      ? `我们建议在 <strong>${escapeHTML(p.property || '贵物业')}</strong> 部署 ${p.quantity || 1} 台 HAHA Vending 智能零售柜，为现场人群提供 24/7 即拿即走的饮品、零食与日常必需品服务。`
      : `We propose deploying ${p.quantity || 1} HAHA Vending smart retail unit(s) at <strong>${escapeHTML(p.property || 'your property')}</strong> to provide 24/7 grab-and-go beverages, fresh snacks, and daily essentials.`;

    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '合作方案概述' : 'Partnership Overview'}</h3>
        <p>${introParagraph}</p>
        <div class="proposal-meta" style="margin-top:12px;">
          <div><span>${t('Prepared For')}</span><strong>${safe('property')}</strong></div>
          <div><span>${t('City')}</span><strong>${safe('city')}</strong></div>
          <div><span>${t('Venue Type')}</span><strong>${escapeHTML(venueDisplay)}</strong></div>
          <div><span>${t('Estimated Launch Date')}</span><strong>${safe('launch')}</strong></div>
          <div><span>${t('Operating Partner')}</span><strong>${safe('operator')}</strong></div>
          <div><span>${t('Contact Name')}</span><strong>${safe('contactName')}</strong></div>
          <div><span>${t('Contact Email')}</span><strong>${safe('contactEmail')}</strong></div>
          <div><span>${t('Contact Phone')}</span><strong>${safe('contactPhone')}</strong></div>
        </div>
      </section>`);
  }

  // Module 02: Recommended Equipment (Mandatory)
  {
    const n = nextNum();
    const primaryModel = p.machines[0]?.model || 'Pro 542';
    const localMachineImg = `./assets/images/${encodeURIComponent(primaryModel)}_front%20view.webp`;
    const fallbackMachineImg = `https://raw.githubusercontent.com/DepengZhuo/location-pitch-builder/main/assets/images/${encodeURIComponent(primaryModel)}_front%20view.webp`;
    const localSiteImg = `./assets/site_images/${encodeURIComponent(p.venue)}.jpg`;
    const fallbackSiteImg = `https://raw.githubusercontent.com/DepengZhuo/location-pitch-builder/main/assets/site_images/${encodeURIComponent(p.venue)}.jpg`;

    const machineRowsHtml = p.machines.map(m => {
      const sp = machineFootprint(m.model) || machineFootprint('Pro 542');
      const dimStr = `${sp.width.toFixed(2)} × ${sp.depth.toFixed(2)} × ${sp.height.toFixed(2)} in`;
      const areaStr = `${sp.squareFeet.toFixed(2)} sq ft`;
      return `
        <div class="proposal-machine-row">
          <div class="proposal-machine-model-col">
            <strong>HAHA ${escapeHTML(m.model)}</strong>
            <span>${isZh ? `部署数量：${m.quantity} 台` : `Qty: ${m.quantity} Unit(s)`}</span>
          </div>
          <div class="prop-spec-box">
            <span class="spec-kicker">${isZh ? '24小时能耗 / 台' : '24h Energy Consumption / Unit'}</span>
            <strong class="spec-primary">${sp.kwh}</strong>
            <small class="spec-secondary">${isZh ? `额定功率：${sp.power}` : `Rated Power: ${sp.power}`}</small>
          </div>
          <div class="prop-spec-box">
            <span class="spec-kicker">${isZh ? '单台占地面积 & 尺寸' : 'Footprint & Dimensions'}</span>
            <strong class="spec-primary">${areaStr}</strong>
            <small class="spec-secondary">${isZh ? `尺寸：${dimStr}` : `W×D×H: ${dimStr}`}</small>
          </div>
        </div>`;
    }).join('');

    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '推荐设备与部署方案' : 'Recommended Equipment & Site Rendering'}</h3>
        <div class="proposal-machines-table">${machineRowsHtml}</div>
        <div class="proposal-power-note">${isZh ? `标准供电要求：${POWER_SUPPLY_SPEC} 普通三孔插座` : `Standard power supply requirement: ${POWER_SUPPLY_SPEC} outlet`}</div>
        <div class="proposal-dual-gallery">
          <div class="proposal-gallery-card">
            <img src="${localMachineImg}" data-fallback="${fallbackMachineImg}" data-model="${escapeHTML(primaryModel)}" alt="${escapeHTML(primaryModel)} front view">
            <strong>${isZh ? `设备产品正视图 · ${primaryModel}` : `Equipment Front View · ${primaryModel}`}</strong>
          </div>
          <div class="proposal-gallery-card">
            <img class="site-photo" src="${localSiteImg}" data-fallback="${fallbackSiteImg}" alt="${escapeHTML(venueDisplay)}">
            <strong>${isZh ? `场景部署效果图 · ${venueDisplay}` : `Deployment Scene · ${venueDisplay}`}</strong>
          </div>
        </div>
      </section>`);
  }

  // Module 03: Venue Value Proposition
  if (flags.venueValue !== false) {
    const n = nextNum();
    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '场地合作价值' : 'Venue Value Proposition'}</h3>
        ${renderRichLines(p.venueValue, 'bullets')}
      </section>`);
  }

  // Module 04: Product Mix & Merchandising
  if (flags.planogram !== false) {
    const n = nextNum();
    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '商品组合与陈列建议' : 'Product Mix & Merchandising'}</h3>
        ${renderRichLines(p.planogram, 'bullets')}
      </section>`);
  }

  // Module 05: Partnership Model & Property Earnings
  if (flags.deal !== false) {
    const n = nextNum();
    const sales = roiData ? money(roiData.monthlyRevenue) : t('Estimate needed');
    let landlord = t('Estimate needed');
    if (p.deal === 'amenity') {
      landlord = '$0';
    } else if (p.deal === 'fixedRent') {
      landlord = money(p.rent);
    } else if (roiData) {
      landlord = money((roiData.monthlyRevenue || 0) * (p.share / 100));
    }

    let deal = '';
    let landlordDeal = '';
    if (p.deal === 'fixedRent') {
      deal = t(`Fixed monthly rent ${money(p.rent)}`);
      landlordDeal = t(`Fixed monthly rent ${money(p.rent)}`);
    } else if (p.deal === 'amenity') {
      deal = t('Amenity-Only ($0 Monthly Fee)');
      landlordDeal = t('Amenity-Only Placement');
    } else {
      deal = t(`${p.share}% of monthly sales`);
      landlordDeal = t(`${p.share}% Revenue Share`);
    }

    const dealParagraph = isZh
      ? `建议合作方式：<strong>${deal}</strong>。结算周期、报表口径及付款日期以双方书面协议为准。`
      : `Proposed partnership model: <strong>${deal}</strong>. Settlement cycle, reporting statements, and payout dates will be defined in the written agreement.`;

    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '物业合作与收益方式' : 'Partnership Model & Property Earnings'}</h3>
        <p>${dealParagraph}</p>
        <div class="proposal-stat-row">
          <div class="proposal-stat"><span>${t('Estimated Monthly Sales')}</span><strong>${sales}</strong></div>
          <div class="proposal-stat"><span>${t('Estimated Monthly Site Partner Earnings')}</span><strong>${landlord}</strong></div>
          <div class="proposal-stat"><span>${t('Partnership Model')}</span><strong>${landlordDeal}</strong></div>
        </div>
        <p>${t('The figures above are model estimates based on input assumptions and do not guarantee sales or property revenue. Actual results depend on foot traffic, product mix, pricing, and operating hours.')}</p>
      </section>`);
  }

  // Module 06: Daily Operations & Warranty Support
  if (flags.operations !== false) {
    const n = nextNum();
    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '日常运营与质保售后' : 'Daily Operations & Warranty Support'}</h3>
        <div class="proposal-subblock">
          <h4 class="proposal-subhead">${isZh ? '1. 日常运营说明' : '1. Daily Operations'}</h4>
          ${renderRichLines(p.service, 'paragraphs')}
        </div>
        <div class="proposal-subblock">
          <h4 class="proposal-subhead">${isZh ? '2. 质保与售后说明' : '2. Warranty & After-Sales Support'}</h4>
          ${renderRichLines(p.warranty, 'paragraphs')}
        </div>
      </section>`);
  }

  // Module 07: Compliance Documents
  if (flags.compliance !== false) {
    const n = nextNum();
    const selectedDocs = (cachedDocsList || []).filter(doc => (p.selectedDocs || []).includes(doc.id));
    const docsSection = selectedDocs.length
      ? `<ul>${selectedDocs.map(doc => {
          const url = doc.url || doc.downloadPath || '';
          const href = /^https?:\/\//i.test(url)
            ? escapeHTML(url)
            : (doc.downloadPath ? `https://depengzhuo.github.io/location-pitch-builder/${escapeHTML(doc.downloadPath.replace(/^\.\//, ''))}` : '');
          const webAction = href
            ? `<a class="doc-web-link doc-web-only" href="${href}" target="_blank" rel="noopener noreferrer" download>${escapeHTML(t(`View / Download ${doc.title} ↗`))}</a>`
            : `<span class="doc-web-status doc-web-only">(${escapeHTML(t('Digital copy available upon request'))})</span>`;
          const printBadge = `<span class="doc-print-only"> — ✓ ${escapeHTML(t('Verified & available for property review'))}</span>`;
          return `<li><strong>${escapeHTML(t(doc.title))}</strong> <span class="doc-web-only">— </span>${webAction}${printBadge}</li>`;
        }).join('')}</ul>`
      : `<p>${t('No compliance documents are attached to this proposal yet. Configure links in the Compliance Center and check the items to include.')}</p>`;

    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '合规资料' : 'Compliance Documents'}</h3>
        ${docsSection}
        <p class="doc-web-footnote">${t('Link permissions and validity are managed by the document provider; sensitive files are shared only with authorized recipients.')}</p>
      </section>`);
  }

  // Module 08: Final Arrangements & Additional Notes
  if (flags.finalNotes !== false) {
    const n = nextNum();
    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${isZh ? '后续确认事项与补充说明' : 'Final Arrangements & Additional Notes'}</h3>
        <div class="proposal-subblock">
          <h4 class="proposal-subhead">${isZh ? '1. 后续确认事项' : '1. Items to Be Confirmed'}</h4>
          ${renderRichLines(p.confirmItems, 'bullets')}
        </div>
        <div class="proposal-subblock">
          <h4 class="proposal-subhead">${isZh ? '2. 补充说明' : '2. Additional Notes'}</h4>
          <div class="proposal-callout">${renderRichLines(p.notes, 'paragraphs')}</div>
        </div>
      </section>`);
  }

  // Custom Modules (09, 10...)
  (p.customModules || []).forEach(cm => {
    if (cm.enabled === false) return;
    const n = nextNum();
    const rawTitle = String(cm.title || '').replace(/\s*\(\d+\)\s*$/, '').trim();
    const cTitle = rawTitle ? translateMultiline(rawTitle) : (isZh ? '特别合作约定' : 'Special Partnership Terms');
    sections.push(`
      <section class="proposal-section">
        <h3>${n} · ${escapeHTML(cTitle)}</h3>
        ${renderRichLines(cm.content || '', 'auto')}
      </section>`);
  });

  const html = `
    <div class="proposal-brand"><div class="proposal-logo">HAHA VENDING</div><div class="proposal-doc-type">LOCATION PARTNERSHIP PROPOSAL</div></div>
    <h1 class="proposal-title">${safe('title')}</h1>
    <div class="proposal-subtitle">${t('A turnkey smart retail amenity proposal tailored for your property')}</div>
    ${sections.join('')}
    <div class="proposal-footer">
      <span>HAHA VENDING · LOCATION PARTNERSHIP</span>
      <span>${t('Proposal Draft · Subject to final written agreement')}</span>
    </div>`;

  previewEl.innerHTML = html;
  previewEl.querySelectorAll('img[data-fallback]').forEach(imgEl => {
    imgEl.addEventListener('error', () => {
      if (imgEl.dataset.fallback && imgEl.src !== imgEl.dataset.fallback) {
        imgEl.src = imgEl.dataset.fallback;
      }
    }, { once: true });
  });
  return p;
}

export function exportProposalHTML(roiData = null, scoreData = null, complianceDocs = []) {
  renderProposalPreview(roiData, scoreData, complianceDocs);
  const p = readProposalForm();
  const clone = el('proposalPreview')?.cloneNode(true);
  if (clone) {
    clone.querySelectorAll('img[data-fallback]').forEach(img => {
      if (img.dataset.fallback) img.setAttribute('src', img.dataset.fallback);
    });
  }
  const paper = clone ? clone.innerHTML : (el('proposalPreview')?.innerHTML || '');
  const standalone = `<!doctype html><html lang="${getLanguage() === 'zh' ? 'zh' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(translateMultiline(p.title) || 'Location Partnership Proposal')}</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f3f2;color:#222;font-family:Arial,"Microsoft YaHei",sans-serif}.paper{width:min(1000px,calc(100% - 32px));margin:32px auto;background:#fff;padding:48px 52px;border-radius:10px}.proposal-brand{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #111;padding-bottom:15px}.proposal-logo{font-weight:900;letter-spacing:1px;font-size:17px}.proposal-doc-type{font-size:12px;letter-spacing:1.3px;color:#666;font-weight:700}.proposal-title{margin:28px 0 9px;font-size:30px}.proposal-subtitle{font-size:14px;color:#666;margin-bottom:20px}.proposal-section{margin:24px 0;page-break-inside:avoid}.proposal-section h3{font-size:17px;margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid #ddd}.proposal-section p,.proposal-section li{font-size:14px;line-height:1.75;color:#333;margin:0 0 6px}.proposal-section ul{padding-left:18px;margin:6px 0}.proposal-subblock{margin:10px 0 14px}.proposal-subhead{font-size:14px;font-weight:800;color:#111;margin:0 0 6px}.proposal-focus-bar{margin-top:8px;padding:9px 12px;background:#f5f5f3;border-left:3px solid #111;border-radius:0 6px 6px 0;font-size:13px;color:#222}.proposal-callout{background:#f4f4f4;border-left:3px solid #111;padding:12px 14px;font-size:13px;line-height:1.7;color:#333;border-radius:0 6px 6px 0;margin-top:6px}.proposal-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f5f5f5;padding:16px;border-radius:8px}.proposal-meta div span{font-size:12px;color:#666;display:block;margin-bottom:4px}.proposal-meta div strong{font-size:14px;color:#111}.proposal-machines-table{display:grid;gap:10px;margin:12px 0 6px}.proposal-power-note{font-size:12px;color:#666;margin:4px 0 12px}.proposal-machine-row{border:1px solid #ddd;border-radius:10px;padding:12px 14px;background:#fafafa;display:grid;grid-template-columns:.9fr 1.25fr 1.25fr;gap:10px;align-items:stretch}.proposal-machine-model-col{display:flex;flex-direction:column;justify-content:center}.proposal-machine-model-col strong{font-size:15px;color:#111;font-weight:900}.proposal-machine-model-col span{display:inline-block;margin-top:5px;font-size:12px;font-weight:700;background:#e8e8e5;padding:3px 9px;border-radius:999px;align-self:flex-start}.prop-spec-box{background:#fff;border:1px solid #e5e5e2;border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;justify-content:center}.prop-spec-box .spec-kicker{display:block;font-size:11px;color:#666;font-weight:700;margin-bottom:4px}.prop-spec-box .spec-primary{display:block;font-size:16px;color:#111;font-weight:900}.prop-spec-box .spec-secondary{display:block;font-size:12px;color:#555;font-weight:600;margin-top:4px}.proposal-dual-gallery{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}.proposal-gallery-card{border:1px solid #ddd;border-radius:10px;background:#fff;padding:12px;text-align:center}.proposal-gallery-card img{width:100%;height:250px;object-fit:contain;border-radius:6px;display:block;background:#f9f9f8}.proposal-gallery-card img.site-photo{object-fit:cover}.proposal-gallery-card img[data-model="Ultra 1200"]{object-fit:cover;object-position:18% 50%}.proposal-gallery-card strong{display:inline-block;margin-top:8px;font-size:12px;background:#eee;padding:4px 12px;border-radius:999px}.proposal-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.proposal-stat{background:#111;color:#fff;padding:14px;border-radius:8px}.proposal-stat span{font-size:12px;color:#ccc;display:block}.proposal-stat strong{font-size:15px;display:block;margin-top:6px}.proposal-footer{border-top:1px solid #ddd;margin-top:30px;padding-top:12px;display:flex;justify-content:space-between;color:#666;font-size:12px}.doc-print-only{display:none}.doc-web-link{color:#111;font-weight:700}@media(max-width:650px){.paper{padding:24px 18px}.proposal-dual-gallery,.proposal-machine-row,.proposal-stat-row{grid-template-columns:1fr}}@media print{body{background:#fff}.paper{width:100%;margin:0;padding:20px 28px}.doc-web-only,.doc-web-footnote{display:none!important}.doc-print-only{display:inline!important;color:#333;font-size:13px}}</style></head><body><main class="paper">${paper}</main></body></html>`;
  const blob = new Blob([standalone], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(p.property || 'Location').replace(/[^\w\u4e00-\u9fa5]/g, '_')}_Proposal.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function bindProposalInputs(onUpdate = () => {}) {
  onUpdateCallback = onUpdate;
  const staticFields = [
    'propTitle', 'propProperty', 'propCity', 'propOperator',
    'propContactName', 'propContactEmail', 'propContactPhone', 'propVenue',
    'propDeal', 'propShare', 'propRent', 'propLaunch',
    'propVenueValue', 'propPlanogram', 'propService', 'propWarranty',
    'propConfirmItems', 'propNotes'
  ];
  staticFields.forEach(id => {
    el(id)?.addEventListener('input', () => {
      if (id === 'propVenueValue') venueValueTouched = true;
      if (id === 'propPlanogram') planogramTouched = true;
      onUpdate();
    });
    el(id)?.addEventListener('change', () => onUpdate());
  });

  el('propVenue')?.addEventListener('change', () => {
    const v = normalizeVenue(el('propVenue').value);
    applyVenueDefaultsIfNeeded(v, true);
    onUpdate();
  });

  el('propDeal')?.addEventListener('change', updateDealFields);

  document.querySelectorAll('[data-mod-key]').forEach(chk => {
    chk.addEventListener('change', () => {
      const k = chk.dataset.modKey;
      moduleFlags[k] = chk.checked;
      chk.closest('.prop-module-card')?.classList.toggle('is-unchecked', !chk.checked);
      onUpdate();
    });
  });

  el('addMachineRowBtn')?.addEventListener('click', () => {
    const order = ['Pro 542', 'Freezer 550', 'Plus 440', 'Max 620S', 'Max 660', 'Mini 360', 'Ultra 1200'];
    const used = machinesState.map(m => m.model);
    const nextModel = order.find(m => !used.includes(m)) || 'Pro 542';
    machinesState.push({
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      model: nextModel,
      quantity: 1
    });
    renderMachinesEditor();
    onUpdate();
  });

  el('resetVenueValueBtn')?.addEventListener('click', () => {
    venueValueTouched = false;
    applyVenueDefaultsIfNeeded(el('propVenue')?.value, true);
    onUpdate();
  });

  el('resetPlanogramBtn')?.addEventListener('click', () => {
    planogramTouched = false;
    applyVenueDefaultsIfNeeded(el('propVenue')?.value, true);
    onUpdate();
  });

  el('addCustomModuleBtn')?.addEventListener('click', () => {
    const isZh = getLanguage() === 'zh';
    customModulesState.push({
      id: `cmod_${Date.now()}`,
      enabled: true,
      title: isZh ? '特别合作约定' : 'Special Partnership Terms',
      content: isZh
        ? `- 试运营评估：首期 60 天试运营，期间由运营商提供全流程支持。\n- 定制化选品：根据现场反馈按月优化商品结构。`
        : `- Pilot Evaluation: 60-day trial period with full operator support.\n- Custom Merchandising: Product mix tailored to seasonal feedback.`
    });
    renderCustomModulesEditor();
    onUpdate();
  });
}
