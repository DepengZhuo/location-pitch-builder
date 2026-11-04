/* =========================================================
   商业提案模块：将表单内容组合为物业可阅读的提案网页
   ========================================================= */
import { escapeHTML, money, machineFootprint } from './data.js';

const fields = ['propTitle','propProperty','propCity','propOperator','propContactName','propContactEmail','propVenue','propTraffic','propMachine','propQuantity','propDeal','propShare','propRent','propLaunch','propPlanogram','propService','propNotes'];
const el = id => document.getElementById(id);

export function readProposalForm() {
  return {
    title: el('propTitle').value.trim(), property: el('propProperty').value.trim(), city: el('propCity').value.trim(),
    operator: el('propOperator').value.trim(), contactName: el('propContactName').value.trim(), contactEmail: el('propContactEmail').value.trim(), venue: el('propVenue').value,
    traffic: Number(el('propTraffic').value || 0), machine: el('propMachine').value, quantity: Number(el('propQuantity').value || 1),
    deal: el('propDeal').value, share: Number(el('propShare').value || 0), rent: Number(el('propRent').value || 0), launch: el('propLaunch').value.trim(),
    planogram: el('propPlanogram').value.trim(), service: el('propService').value.trim(), notes: el('propNotes').value.trim(),
    selectedDocs: [...document.querySelectorAll('input[name="propDoc"]:checked')].map(input => input.value)
  };
}

export function applyProposalForm(data = {}) {
  const defaults = { title:'智能零售柜点位合作提案', venue:'公寓 / 多户住宅', machine:'Mini 360', quantity:1, deal:'revenueShare', share:10, rent:0,
    planogram:'饮料、瓶装水、健康零食、方便食品及日常必需品。具体 SKU 根据物业人群和销售反馈调整。',
    service:'运营商负责商品采购、定期补货、设备清洁与日常运营，并根据现场情况安排维护响应。' };
  const legacyContact = data.contact || '';
  const [legacyName, ...emailParts] = legacyContact.split(/\s*[|/]\s*/);
  const dealValue = data.deal === 'fixedRent' || String(data.deal || '').includes('固定') ? 'fixedRent' : 'revenueShare';
  const merged = { ...defaults, ...data, deal: dealValue, machine: data.machine && machineFootprint(data.machine) ? data.machine : (data.machine ? '' : defaults.machine), contactName: data.contactName ?? legacyName ?? '', contactEmail: data.contactEmail ?? emailParts.join(' / ') };
  const map = { title:'propTitle',property:'propProperty',city:'propCity',operator:'propOperator',contactName:'propContactName',contactEmail:'propContactEmail',venue:'propVenue',traffic:'propTraffic',machine:'propMachine',quantity:'propQuantity',deal:'propDeal',share:'propShare',rent:'propRent',launch:'propLaunch',planogram:'propPlanogram',service:'propService',notes:'propNotes' };
  Object.entries(map).forEach(([key,id]) => { if (el(id)) el(id).value = merged[key] ?? ''; });
  document.querySelectorAll('input[name="propDoc"]').forEach(input => { input.checked = (merged.selectedDocs || []).includes(input.value); });
  updateDealFields();
}

function updateDealFields() {
  const fixed = el('propDeal').value === 'fixedRent';
  el('propShareField').hidden = fixed;
  el('propRentField').hidden = !fixed;
}

export function applyROIToProposal(roi) {
  if (!roi) return;
  el('propDeal').value = roi.dealType || (roi.rent > 0 ? 'fixedRent' : 'revenueShare');
  el('propShare').value = roi.shareRate ?? 10;
  el('propRent').value = roi.rent ?? 0;
  updateDealFields();
}

export function renderProposalPreview(roiData = null, scoreData = null, complianceDocs = []) {
  const p = readProposalForm();
  const safe = key => escapeHTML(p[key] || '待补充');
  const sales = roiData ? money(roiData.monthlyRevenue) : '待测算';
  const landlord = roiData ? money(roiData.landlordIncome) : '待测算';
  const score = scoreData ? `${scoreData.score}/100` : '待评估';
  const selectedDocs = (complianceDocs || []).filter(doc => (p.selectedDocs || []).includes(doc.id));
  const docsSection = selectedDocs.length ? `<ul>${selectedDocs.map(doc => {
    const url = doc.url || doc.downloadPath || '';
    const href = /^https?:\/\//i.test(url) ? escapeHTML(url) : (doc.downloadPath ? `https://depengzhuo.github.io/location-pitch-builder/${escapeHTML(doc.downloadPath.replace(/^\.\//, ''))}` : '');
    const link = href ? `<a href="${href}" download>${escapeHTML('下载 ' + doc.title)} ↓</a>` : '文件链接待补充';
    return `<li>${escapeHTML(doc.title)} — ${link}</li>`;
  }).join('')}</ul>` : '<p>本次提案暂未附带合规文件。根据物业审查要求，可在合规文件中心配置资料链接后重新勾选。</p>';
  const note = p.notes ? `<div class="proposal-callout">${safe('notes').replace(/\n/g,'<br>')}</div>` : '<div class="proposal-callout">最终点位布局、用电、网络、安装位置、访问权限及合同条款，以双方现场确认和书面协议为准。</div>';
  const dimensions = machineFootprint(p.machine);
  const dimensionsText = dimensions ? `${dimensions.width.toFixed(2)} × ${dimensions.depth.toFixed(2)} × ${dimensions.height.toFixed(2)} in` : '待确认';
  const area = dimensions ? `${dimensions.squareFeet.toFixed(2)} sq ft` : '待确认';
  const imageUrl = dimensions ? `https://depengzhuo.github.io/location-pitch-builder/assets/images/${encodeURIComponent(p.machine)}_front%20view.webp` : '';
  const deal = p.deal === 'fixedRent' ? `固定月租 ${money(p.rent)}` : `按销售额分成 ${p.share}%`;
  const landlordDeal = p.deal === 'fixedRent' ? `固定月租 ${money(p.rent)}` : `销售额分成 ${p.share}%`;
  const html = `
    <div class="proposal-brand"><div class="proposal-logo">HAHA VENDING</div><div class="proposal-doc-type">LOCATION PARTNERSHIP PROPOSAL</div></div>
    <h1 class="proposal-title">${safe('title')}</h1><div class="proposal-subtitle">为物业空间提供便捷的智能零售服务合作方案</div>
    <section class="proposal-section"><h3>01 · 合作方案概述</h3><p>我们建议在贵物业合适的公共区域部署 ${p.quantity || 1} 台 ${safe('machine')}，为住户、员工及访客提供更方便的日常商品购买体验。设备位置、商品结构和最终部署数量将根据现场条件共同确认。</p><div class="proposal-overview"><div class="proposal-meta"><div><span>提案对象</span><strong>${safe('property')}</strong></div><div><span>所在城市</span><strong>${safe('city')}</strong></div><div><span>合作运营商</span><strong>${safe('operator')}</strong></div><div><span>联系人</span><strong>${safe('contactName')}</strong></div><div><span>联系人邮箱</span><strong>${safe('contactEmail')}</strong></div><div><span>场地类型</span><strong>${safe('venue')}</strong></div><div><span>预计上线时间</span><strong>${safe('launch')}</strong></div></div><aside class="proposal-machine-card">${dimensions ? `<img src="${imageUrl}" alt="${escapeHTML(p.machine)} front view">` : '<div class="machine-image-pending">请先选择机器型号</div>'}<strong>${escapeHTML(p.machine || '待选择型号')}</strong><span>Machine dimensions: ${dimensionsText}</span><span>Footprint: ${area} / machine</span></aside></div><div class="proposal-stat-row"><div class="proposal-stat"><span>建议部署数量</span><strong>${p.quantity || 1} 台</strong></div><div class="proposal-stat"><span>预估日均人流</span><strong>${p.traffic ? `${p.traffic} 人` : '待确认'}</strong></div><div class="proposal-stat"><span>点位评估得分</span><strong>${score}</strong></div></div></section>
    <section class="proposal-section"><h3>02 · 商品组合与陈列建议</h3><p>${safe('planogram').replace(/\n/g,'<br>')}</p></section>
    <section class="proposal-section"><h3>03 · 物业合作与收益方式</h3><p>建议合作方式：<strong>${deal}</strong>。结算周期、报表口径及付款日期以双方书面协议为准。</p><div class="proposal-stat-row"><div class="proposal-stat"><span>预计月销售额</span><strong>${sales}</strong></div><div class="proposal-stat"><span>点位方预计月收益</span><strong>${landlord}</strong></div><div class="proposal-stat"><span>合作方式</span><strong>${landlordDeal}</strong></div></div><p>以上为输入参数下的测算示例，不构成销售额或点位方收益保证。实际结果取决于现场客流、商品、价格、营业时间及运营情况。</p></section>
    <section class="proposal-section"><h3>04 · 日常运营与服务</h3><p>${safe('service').replace(/\n/g,'<br>')}</p><ul><li>商品补货与库存管理：由运营商负责，具体频率根据销售情况确定。</li><li>设备维护与故障响应：双方确认服务时间、报修渠道及响应标准。</li><li>现场运营协调：明确设备摆放区域、营业时间、用电及网络安排。</li></ul></section>
    <section class="proposal-section"><h3>05 · 合规资料</h3>${docsSection}<p>文件链接的可访问权限和有效期由资料提供方负责确认；敏感文件仅向授权接收人分享。</p></section>
    <section class="proposal-section"><h3>06 · 后续确认事项</h3><ul><li>现场安装位置、尺寸、电源和网络条件。</li><li>合作期限、分成基数、对账依据和付款日期。</li><li>电费承担、保险与赔偿责任、访问权限和营业时间。</li><li>合同终止、续租、独家经营及设备移除安排。</li></ul>${note}</section>
    <div class="proposal-footer"><span>HAHA VENDING · LOCATION PARTNERSHIP</span><span>提案草案 · 以双方最终书面协议为准</span></div>`;
  el('proposalPreview').innerHTML = html;
  return p;
}

export function exportProposalHTML(roiData = null, scoreData = null, complianceDocs = []) {
  renderProposalPreview(roiData, scoreData, complianceDocs);
  const p = readProposalForm();
  const paper = el('proposalPreview').innerHTML;
  const standalone = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(p.title || '点位合作提案')}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f3f3f2;color:#222;font-family:Arial,"Microsoft YaHei",sans-serif}.paper{width:min(1000px,calc(100% - 32px));margin:32px auto;background:#fff;padding:48px 52px}.proposal-brand{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #111;padding-bottom:15px}.proposal-logo{font-weight:900;letter-spacing:1px;font-size:17px}.proposal-doc-type{font-size:12px;letter-spacing:1.3px;color:#666}.proposal-title{margin:28px 0 9px;font-size:30px}.proposal-subtitle{font-size:14px;color:#666}.proposal-section{margin:24px 0;page-break-inside:avoid}.proposal-section h3{font-size:17px;margin:0 0 9px;padding-bottom:8px;border-bottom:1px solid #ddd}.proposal-section p,.proposal-section li{font-size:14px;line-height:1.75;color:#444}.proposal-section ul{padding-left:18px}.proposal-overview{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:14px;align-items:stretch}.proposal-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#f5f5f5;padding:16px;margin:14px 0}.proposal-meta div span{font-size:12px;color:#666;display:block;margin-bottom:5px}.proposal-meta div strong{font-size:14px}.proposal-machine-card{display:flex;flex-direction:column;gap:7px;align-items:center;justify-content:center;border:1px solid #ddd;background:#fafafa;padding:10px;text-align:center}.proposal-machine-card img{width:100%;height:145px;object-fit:contain}.proposal-machine-card strong{font-size:16px}.proposal-machine-card span{font-size:12px;color:#555}.proposal-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.proposal-stat{background:#111;color:#fff;padding:14px}.proposal-stat span{font-size:12px;color:#ddd;display:block}.proposal-stat strong{font-size:16px;display:block;margin-top:7px}.proposal-callout{background:#f4f4f4;border-left:3px solid #111;padding:13px;font-size:14px;line-height:1.8;color:#444}.proposal-footer{border-top:1px solid #ddd;margin-top:30px;padding-top:12px;display:flex;justify-content:space-between;color:#666;font-size:12px}@media(max-width:650px){.paper{padding:24px 18px}.proposal-overview{grid-template-columns:1fr}.proposal-stat-row{grid-template-columns:1fr}}@media print{body{background:#fff}.paper{width:100%;margin:0;padding:25px 35px}}
  </style></head><body><main class="paper">${paper}</main></body></html>`;
  const blob = new Blob([standalone], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(p.property || 'Location').replace(/[^\w\u4e00-\u9fa5-]/g,'_')}_Proposal.html`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export function bindProposalInputs(onUpdate = () => {}) {
  fields.forEach(id => el(id)?.addEventListener('input', () => onUpdate()));
  fields.forEach(id => el(id)?.addEventListener('change', () => onUpdate()));
  el('propDeal')?.addEventListener('change', updateDealFields);
  document.querySelectorAll('input[name="propDoc"]').forEach(input => input.addEventListener('change', () => onUpdate()));
}
