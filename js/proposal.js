/* ==================================================
   商业提案模块：将表单内容组合为物业可阅读的提案网页
   ================================================== */
import { escapeHTML, money, machineFootprint } from './data.js';
import { cleanLegacyNotes } from './storage.js';
import { getLanguage, t, translateMultiline, PROPOSAL_DEFAULTS } from './i18n.js';

const fields = [
  'propTitle', 'propProperty', 'propCity', 'propOperator',
  'propContactName', 'propContactEmail', 'propVenue',
  'propMachine', 'propQuantity', 'propDeal', 'propShare', 'propRent',
  'propLaunch', 'propPlanogram', 'propService', 'propConfirmItems', 'propNotes'
];
const el = id => document.getElementById(id);

export function syncProposalFormLanguage() {
  if (el('propNotes')) {
    el('propNotes').value = cleanLegacyNotes(el('propNotes').value);
  }
  const map = {
    propTitle: 'title',
    propLaunch: 'launch',
    propPlanogram: 'planogram',
    propService: 'service',
    propConfirmItems: 'confirmItems',
    propNotes: 'notes'
  };
  Object.entries(map).forEach(([id, key]) => {
    const input = el(id);
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    if (
      val === PROPOSAL_DEFAULTS.zh[key]?.trim() ||
      val === PROPOSAL_DEFAULTS.en[key]?.trim() ||
      (key === 'planogram' && (val === PROPOSAL_DEFAULTS.zh.planogramExample.trim() || val === PROPOSAL_DEFAULTS.en.planogramExample.trim()))
    ) {
      if (key === 'planogram' && (val === PROPOSAL_DEFAULTS.zh.planogramExample.trim() || val === PROPOSAL_DEFAULTS.en.planogramExample.trim())) {
        input.value = getLanguage() === 'en' ? PROPOSAL_DEFAULTS.en.planogramExample : PROPOSAL_DEFAULTS.zh.planogramExample;
      } else {
        input.value = getLanguage() === 'en' ? PROPOSAL_DEFAULTS.en[key] : PROPOSAL_DEFAULTS.zh[key];
      }
    } else {
      input.value = translateMultiline(input.value);
    }
  });
}

export function readProposalForm() {
  const rawNotes = el('propNotes')?.value.trim() || '';
  return {
    title: el('propTitle')?.value.trim() || '',
    property: el('propProperty')?.value.trim() || '',
    city: el('propCity')?.value.trim() || '',
    operator: el('propOperator')?.value.trim() || '',
    contactName: el('propContactName')?.value.trim() || '',
    contactEmail: el('propContactEmail')?.value.trim() || '',
    venue: el('propVenue')?.value || '公寓 / 多户住宅',
    machine: el('propMachine')?.value || 'Mini 360',
    quantity: Number(el('propQuantity')?.value || 1),
    deal: el('propDeal')?.value || 'revenueShare',
    share: Number(el('propShare')?.value || 0),
    rent: Number(el('propRent')?.value || 0),
    launch: el('propLaunch')?.value.trim() || '',
    planogram: el('propPlanogram')?.value.trim() || '',
    service: el('propService')?.value.trim() || '',
    confirmItems: el('propConfirmItems')?.value.trim() || '',
    notes: cleanLegacyNotes(rawNotes),
    selectedDocs: [...document.querySelectorAll('input[name="propDoc"]:checked')].map(input => input.value)
  };
}

export function applyProposalForm(data = {}) {
  const lang = getLanguage() === 'en' ? 'en' : 'zh';
  const d = PROPOSAL_DEFAULTS[lang];
  const defaults = {
    title: d.title,
    venue: '公寓 / 多户住宅',
    machine: 'Mini 360',
    quantity: 1,
    deal: 'revenueShare',
    share: 10,
    rent: 0,
    launch: d.launch,
    planogram: d.planogram,
    service: d.service,
    confirmItems: d.confirmItems,
    notes: d.notes
  };
  const legacyContact = data.contact || '';
  const [legacyName, ...emailParts] = legacyContact.split(/\s*[/|]\s*/);
  const dealValue = data.deal === 'fixedRent' || String(data.deal || '').includes('固定') ? 'fixedRent' : 'revenueShare';
  const cleanedNotes = data.notes !== undefined ? cleanLegacyNotes(data.notes) : defaults.notes;
  const merged = {
    ...defaults,
    ...data,
    notes: cleanedNotes,
    deal: dealValue,
    machine: data.machine && machineFootprint(data.machine) ? data.machine : (data.machine ? '' : defaults.machine),
    contactName: data.contactName ?? legacyName ?? '',
    contactEmail: data.contactEmail ?? emailParts.join(' / ')
  };
  const map = {
    title: 'propTitle',
    property: 'propProperty',
    city: 'propCity',
    operator: 'propOperator',
    contactName: 'propContactName',
    contactEmail: 'propContactEmail',
    venue: 'propVenue',
    machine: 'propMachine',
    quantity: 'propQuantity',
    deal: 'propDeal',
    share: 'propShare',
    rent: 'propRent',
    launch: 'propLaunch',
    planogram: 'propPlanogram',
    service: 'propService',
    confirmItems: 'propConfirmItems',
    notes: 'propNotes'
  };
  Object.entries(map).forEach(([key, id]) => {
    if (el(id)) el(id).value = merged[key] ?? '';
  });
  syncProposalFormLanguage();
  document.querySelectorAll('input[name="propDoc"]').forEach(input => {
    input.checked = (merged.selectedDocs || []).includes(input.value);
  });
  updateDealFields();
}

function updateDealFields() {
  const fixed = el('propDeal')?.value === 'fixedRent';
  if (el('propShareField')) el('propShareField').hidden = fixed;
  if (el('propRentField')) el('propRentField').hidden = !fixed;
}

export function applyROIToProposal(roi) {
  if (!roi) return;
  if (el('propDeal')) el('propDeal').value = roi.dealType || (roi.rent > 0 ? 'fixedRent' : 'revenueShare');
  if (el('propShare')) el('propShare').value = roi.shareRate ?? 10;
  if (el('propRent')) el('propRent').value = roi.rent ?? 0;
  if (el('propNotes')) el('propNotes').value = cleanLegacyNotes(el('propNotes').value);
  updateDealFields();
}

function renderRichLines(rawText) {
  const translated = translateMultiline(rawText || '');
  const lines = translated.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return `<p>${escapeHTML(t('待补充'))}</p>`;
  const paragraphs = [];
  const bullets = [];
  lines.forEach(line => {
    if (/^[-•*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-•*]\s+/, ''));
    } else {
      paragraphs.push(line);
    }
  });
  const pHtml = paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
  const ulHtml = bullets.length ? `<ul>${bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}</ul>` : '';
  return pHtml + ulHtml;
}

export function renderProposalPreview(roiData = null, scoreData = null, complianceDocs = []) {
  const previewEl = el('proposalPreview');
  if (!previewEl) return null;
  if (el('propNotes')) {
    const cleaned = cleanLegacyNotes(el('propNotes').value);
    if (el('propNotes').value !== cleaned) {
      el('propNotes').value = cleaned;
      syncProposalFormLanguage();
    }
  }
  const p = readProposalForm();
  const isEn = getLanguage() === 'en';
  const safe = key => escapeHTML(p[key] ? translateMultiline(p[key]) : t('待补充'));
  const sales = roiData ? money(roiData.monthlyRevenue) : t('待测算');
  const landlord = roiData ? money(roiData.landlordIncome) : t('待测算');
  const selectedDocs = (complianceDocs || []).filter(doc => (p.selectedDocs || []).includes(doc.id));

  const docsSection = selectedDocs.length
    ? `<ul>${selectedDocs.map(doc => {
        const url = doc.url || doc.downloadPath || '';
        const href = /^https?:\/\//i.test(url)
          ? escapeHTML(url)
          : (doc.downloadPath ? `https://depengzhuo.github.io/location-pitch-builder/${escapeHTML(doc.downloadPath.replace(/^\.\//, ''))}` : '');
        const webAction = href
          ? `<a class="doc-web-link doc-web-only" href="${href}" target="_blank" rel="noopener noreferrer" download>${escapeHTML(t('查看 / 下载 ' + doc.title + ' ↗'))}</a>`
          : `<span class="doc-web-status doc-web-only">（${escapeHTML(t('可按需提供电子版'))}）</span>`;
        const printBadge = `<span class="doc-print-only"> — ✓ ${escapeHTML(t('资质已备齐，随提案附交或按需提供'))}</span>`;
        return `<li><strong>${escapeHTML(t(doc.title))}</strong> <span class="doc-web-only">— </span>${webAction}${printBadge}</li>`;
      }).join('')}</ul>`
    : `<p>${t('本次提案暂未附带合规文件。根据物业审查要求，可在合规文件中心配置资料链接后重新勾选。')}</p>`;

  const note = p.notes
    ? `<div class="proposal-callout">${escapeHTML(translateMultiline(p.notes)).replace(/\n/g, '<br>')}</div>`
    : `<div class="proposal-callout">${t('最终点位布局、用电、网络、安装位置、访问权限及合同条款，以双方现场确认和书面协议为准。')}</div>`;

  const dimensions = machineFootprint(p.machine);
  const dimensionsText = dimensions ? `${dimensions.width.toFixed(2)} × ${dimensions.depth.toFixed(2)} × ${dimensions.height.toFixed(2)} in` : t('待确认');
  const area = dimensions ? `${dimensions.squareFeet.toFixed(2)} sq ft` : t('待确认');
  const localImg = dimensions ? `./assets/images/${encodeURIComponent(p.machine)}_front%20view.webp` : '';
  const fallbackImg = dimensions ? `https://raw.githubusercontent.com/DepengZhuo/location-pitch-builder/main/assets/images/${encodeURIComponent(p.machine)}_front%20view.webp` : '';
  const deal = p.deal === 'fixedRent' ? t(`固定月租 ${money(p.rent)}`) : t(`按销售额分成 ${p.share}%`);
  const landlordDeal = p.deal === 'fixedRent' ? t(`固定月租 ${money(p.rent)}`) : t(`销售额分成 ${p.share}%`);

  const introParagraph = isEn
    ? `We propose deploying ${p.quantity || 1} ${escapeHTML(p.machine || 'smart vending')} unit(s) in a convenient common area at your property to provide 24/7 grab-and-go beverages, snacks, and daily essentials for residents, employees, and visitors. Exact placement, product mix, and unit count will be confirmed following a site walk-through.`
    : `我们建议在贵物业合适的公共区域部署 ${p.quantity || 1} 台 ${escapeHTML(p.machine || '智能零售柜')}，为住户、员工及访客提供更方便的日常商品购买体验。设备位置、商品结构和最终部署数量将根据现场条件共同确认。`;

  const dealParagraph = isEn
    ? `Proposed partnership model: <strong>${deal}</strong>. Settlement cycle, reporting statements, and payout dates will be defined in the written agreement.`
    : `建议合作方式：<strong>${deal}</strong>。结算周期、报表口径及付款日期以双方书面协议为准。`;

  const html = `
    <div class="proposal-brand"><div class="proposal-logo">HAHA VENDING</div><div class="proposal-doc-type">LOCATION PARTNERSHIP PROPOSAL</div></div>
    <h1 class="proposal-title">${safe('title')}</h1>
    <div class="proposal-subtitle">${t('为物业空间提供便捷的智能零售服务合作方案')}</div>
    <section class="proposal-section">
      <h3>${t('01 · 合作方案概述')}</h3>
      <p>${introParagraph}</p>
      <div class="proposal-overview">
        <div class="proposal-meta">
          <div><span>${t('提案对象')}</span><strong>${safe('property')}</strong></div>
          <div><span>${t('所在城市')}</span><strong>${safe('city')}</strong></div>
          <div><span>${t('合作运营商')}</span><strong>${safe('operator')}</strong></div>
          <div><span>${t('联系人')}</span><strong>${safe('contactName')}</strong></div>
          <div><span>${t('联系人邮箱')}</span><strong>${safe('contactEmail')}</strong></div>
          <div><span>${t('场地类型')}</span><strong>${escapeHTML(t(p.venue || '公寓 / 多户住宅'))}</strong></div>
          <div><span>${t('预计上线时间')}</span><strong>${safe('launch')}</strong></div>
        </div>
        <aside class="proposal-machine-card">
          ${dimensions ? `<img src="${localImg}" data-fallback="${fallbackImg}" data-model="${escapeHTML(p.machine)}" alt="${escapeHTML(p.machine)} front view">` : `<div class="machine-image-pending">${t('请先选择机器型号')}</div>`}
          <strong>${escapeHTML(p.machine || t('待选择型号'))}</strong>
        </aside>
      </div>
      <div class="proposal-stat-row">
        <div class="proposal-stat"><span>${t('建议部署数量')}</span><strong>${t(`${p.quantity || 1} 台`)}</strong></div>
        <div class="proposal-stat"><span>${t('设备尺寸 (宽×深×高)')}</span><strong>${dimensionsText}</strong></div>
        <div class="proposal-stat"><span>${t('单台占地面积')}</span><strong>${area}</strong></div>
      </div>
    </section>
    <section class="proposal-section">
      <h3>${t('02 · 商品组合与陈列建议')}</h3>
      ${renderRichLines(p.planogram)}
    </section>
    <section class="proposal-section">
      <h3>${t('03 · 物业合作与收益方式')}</h3>
      <p>${dealParagraph}</p>
      <div class="proposal-stat-row">
        <div class="proposal-stat"><span>${t('预计月销售额')}</span><strong>${sales}</strong></div>
        <div class="proposal-stat"><span>${t('点位方预计月收益')}</span><strong>${landlord}</strong></div>
        <div class="proposal-stat"><span>${t('合作方式')}</span><strong>${landlordDeal}</strong></div>
      </div>
      <p>${t('以上为输入参数下的测算示例，不构成销售额或点位方收益保证。实际结果取决于现场客流、商品、价格、营业时间及运营情况。')}</p>
    </section>
    <section class="proposal-section">
      <h3>${t('04 · 日常运营与服务')}</h3>
      ${renderRichLines(p.service)}
    </section>
    <section class="proposal-section">
      <h3>${t('05 · 合规资料')}</h3>
      ${docsSection}
      <p class="doc-web-footnote">${t('文件链接的可访问权限和有效期由资料提供方负责确认；敏感文件仅向授权接收人分享。')}</p>
    </section>
    <section class="proposal-section">
      <h3>${t('06 · 后续确认事项')}</h3>
      ${renderRichLines(p.confirmItems)}
      ${note}
    </section>
    <div class="proposal-footer">
      <span>HAHA VENDING · LOCATION PARTNERSHIP</span>
      <span>${t('提案草案 · 以双方最终书面协议为准')}</span>
    </div>`;

  previewEl.innerHTML = html;
  const imgEl = previewEl.querySelector('.proposal-machine-card img');
  if (imgEl) {
    imgEl.addEventListener('error', () => {
      if (imgEl.dataset.fallback && imgEl.src !== imgEl.dataset.fallback) {
        imgEl.src = imgEl.dataset.fallback;
      }
    }, { once: true });
  }
  return p;
}

export function exportProposalHTML(roiData = null, scoreData = null, complianceDocs = []) {
  renderProposalPreview(roiData, scoreData, complianceDocs);
  const p = readProposalForm();
  const clone = el('proposalPreview')?.cloneNode(true);
  if (clone) {
    const img = clone.querySelector('.proposal-machine-card img');
    if (img && img.dataset.fallback) {
      img.setAttribute('src', img.dataset.fallback);
    }
  }
  const paper = clone ? clone.innerHTML : (el('proposalPreview')?.innerHTML || '');
  const standalone = `<!doctype html><html lang="${getLanguage() === 'en' ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(translateMultiline(p.title) || 'Location Partnership Proposal')}</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f3f2;color:#222;font-family:Arial,"Microsoft YaHei",sans-serif}.paper{width:min(1000px,calc(100% - 32px));margin:32px auto;background:#fff;padding:48px 52px;border-radius:10px}.proposal-brand{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #111;padding-bottom:15px}.proposal-logo{font-weight:900;letter-spacing:1px;font-size:17px}.proposal-doc-type{font-size:12px;letter-spacing:1.3px;color:#666;font-weight:700}.proposal-title{margin:28px 0 9px;font-size:30px}.proposal-subtitle{font-size:14px;color:#666;margin-bottom:20px}.proposal-section{margin:24px 0;page-break-inside:avoid}.proposal-section h3{font-size:17px;margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid #ddd}.proposal-section p,.proposal-section li{font-size:14px;line-height:1.75;color:#333;margin:0 0 6px}.proposal-section ul{padding-left:18px;margin:6px 0}.proposal-overview{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:16px;align-items:stretch;margin:14px 0}.proposal-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f5f5f5;padding:16px;border-radius:8px;align-content:center}.proposal-meta div span{font-size:12px;color:#666;display:block;margin-bottom:4px}.proposal-meta div strong{font-size:14px;color:#111}.proposal-machine-card{display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;border:1px solid #ddd;background:#fff;padding:12px 10px;border-radius:8px;text-align:center;overflow:hidden}.proposal-machine-card img{width:100%;height:285px;object-fit:contain;object-position:center}.proposal-machine-card img[data-model="Ultra 1200"]{object-fit:cover;object-position:18% 50%}.proposal-machine-card strong{font-size:13px;background:#eee;padding:4px 14px;border-radius:999px}.proposal-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.proposal-stat{background:#111;color:#fff;padding:14px;border-radius:8px}.proposal-stat span{font-size:12px;color:#ccc;display:block}.proposal-stat strong{font-size:15px;display:block;margin-top:6px}.proposal-callout{background:#f4f4f4;border-left:3px solid #111;padding:13px 15px;font-size:13px;line-height:1.75;color:#333;margin-top:10px}.proposal-footer{border-top:1px solid #ddd;margin-top:30px;padding-top:12px;display:flex;justify-content:space-between;color:#666;font-size:12px}.doc-print-only{display:none}.doc-web-link{color:#111;font-weight:700}@media(max-width:650px){.paper{padding:24px 18px}.proposal-overview{grid-template-columns:1fr}.proposal-stat-row{grid-template-columns:1fr}}@media print{body{background:#fff}.paper{width:100%;margin:0;padding:20px 28px}.doc-web-only,.doc-web-footnote{display:none!important}.doc-print-only{display:inline!important;color:#333;font-size:13px}}</style></head><body><main class="paper">${paper}</main></body></html>`;
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
  fields.forEach(id => el(id)?.addEventListener('input', () => onUpdate()));
  fields.forEach(id => el(id)?.addEventListener('change', () => onUpdate()));
  el('propDeal')?.addEventListener('change', updateDealFields);
  document.querySelectorAll('input[name="propDoc"]').forEach(input => input.addEventListener('change', () => onUpdate()));
}
