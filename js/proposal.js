/* =========================================================
   商业提案模块：将表单内容组合为物业可阅读的提案网页
   右侧为页面内预览；导出按钮会下载独立 HTML 文件。
   ========================================================= */
import { escapeHTML, money } from './data.js';

const fields = ['propTitle','propProperty','propCity','propOperator','propContact','propVenue','propTraffic','propMachine','propQuantity','propDeal','propShare','propLaunch','propPlanogram','propService','propNotes'];
const el = id => document.getElementById(id);

export function readProposalForm() {
  return {
    title: el('propTitle').value.trim(), property: el('propProperty').value.trim(), city: el('propCity').value.trim(),
    operator: el('propOperator').value.trim(), contact: el('propContact').value.trim(), venue: el('propVenue').value,
    traffic: Number(el('propTraffic').value || 0), machine: el('propMachine').value, quantity: Number(el('propQuantity').value || 1),
    deal: el('propDeal').value, share: Number(el('propShare').value || 0), launch: el('propLaunch').value.trim(),
    planogram: el('propPlanogram').value.trim(), service: el('propService').value.trim(), notes: el('propNotes').value.trim(),
    selectedDocs: [...document.querySelectorAll('input[name=\"propDoc\"]:checked')].map(input => input.value)
  };
}

export function applyProposalForm(data = {}) {
  const defaults = { title:'智能零售柜点位合作提案', venue:'公寓 / 多户住宅', machine:'HAHA 智能零售柜', quantity:1, deal:'销售额分成', share:10,
    planogram:'饮料、瓶装水、健康零食、方便食品及日常必需品。具体 SKU 根据物业人群和销售反馈调整。',
    service:'运营商负责商品采购、定期补货、设备清洁与日常运营，并根据现场情况安排维护响应。' };
  const merged = { ...defaults, ...data };
  const map = { title:'propTitle',property:'propProperty',city:'propCity',operator:'propOperator',contact:'propContact',venue:'propVenue',traffic:'propTraffic',machine:'propMachine',quantity:'propQuantity',deal:'propDeal',share:'propShare',launch:'propLaunch',planogram:'propPlanogram',service:'propService',notes:'propNotes' };
  Object.entries(map).forEach(([key,id]) => { if (el(id)) el(id).value = merged[key] ?? ''; });
  document.querySelectorAll('input[name=\"propDoc\"]').forEach(input => { input.checked = (merged.selectedDocs || []).includes(input.value); });
}

export function renderProposalPreview(roiData = null, scoreData = null, complianceDocs = []) {
  const p = readProposalForm();
  const safe = key => escapeHTML(p[key] || '待补充');
  const sales = roiData ? money(roiData.monthlyRevenue) : '待测算';
  const landlord = roiData ? money(roiData.landlordIncome) : '待测算';
  const score = scoreData ? `${scoreData.score}/100` : '待评估';
  const selectedDocs = (complianceDocs || []).filter(doc => (p.selectedDocs || []).includes(doc.id));
  const docsSection = selectedDocs.length ? `<ul>${selectedDocs.map(doc => {
    const hasLink = /^https?:\/\//i.test(doc.url || '');
    const link = hasLink ? `<a href="${escapeHTML(doc.url)}" target="_blank" rel="noopener noreferrer">查看资料 ↗</a>` : '链接待补充';
    return `<li>${escapeHTML(doc.title)} — ${link}</li>`;
  }).join('')}</ul>` : '<p>本次提案暂未附带合规文件。根据物业审查要求，可在合规文件中心配置资料链接后重新勾选。</p>';
  const note = p.notes ? `<div class="proposal-callout">${safe('notes').replace(/\n/g,'<br>')}</div>` : '<div class="proposal-callout">最终点位布局、用电、网络、安装位置、访问权限及合同条款，以双方现场确认和书面协议为准。</div>';
  const html = `
    <div class="proposal-brand"><div class="proposal-logo"><span>H</span> HAHA VENDING</div><div class="proposal-doc-type">LOCATION PARTNERSHIP PROPOSAL</div></div>
    <h1 class="proposal-title">${safe('title')}</h1><div class="proposal-subtitle">为物业空间提供便捷的智能零售服务合作方案</div>
    <div class="proposal-meta"><div><span>提案对象</span><strong>${safe('property')}</strong></div><div><span>所在城市</span><strong>${safe('city')}</strong></div><div><span>合作运营商</span><strong>${safe('operator')}</strong></div><div><span>联系人</span><strong>${safe('contact')}</strong></div><div><span>场地类型</span><strong>${safe('venue')}</strong></div><div><span>预计上线时间</span><strong>${safe('launch')}</strong></div></div>
    <section class="proposal-section"><h3>01 · 合作方案概述</h3><p>我们建议在贵物业合适的公共区域部署 ${p.quantity || 1} 台 ${safe('machine')}，为住户、员工及访客提供更方便的日常商品购买体验。设备位置、商品结构和最终部署数量将根据现场条件共同确认。</p><div class="proposal-machine-placeholder">机器效果图 / 现场布局图<br>请替换为对应型号的官方产品图片或现场渲染图</div><div class="proposal-stat-row"><div class="proposal-stat"><span>建议部署数量</span><strong>${p.quantity || 1} 台</strong></div><div class="proposal-stat"><span>预估日均人流</span><strong>${p.traffic ? `${p.traffic} 人` : '待确认'}</strong></div><div class="proposal-stat"><span>点位评估得分</span><strong>${score}</strong></div></div></section>
    <section class="proposal-section"><h3>02 · 商品组合与陈列建议</h3><p>${safe('planogram').replace(/\n/g,'<br>')}</p></section>
    <section class="proposal-section"><h3>03 · 物业合作与收益方式</h3><p>建议合作方式：<strong>${safe('deal')}</strong>。物业分成比例：<strong>${p.share}%</strong>（具体计算基数、结算周期、报表口径及付款日期以双方书面协议为准）。</p><div class="proposal-stat-row"><div class="proposal-stat"><span>预计月销售额</span><strong>${sales}</strong></div><div class="proposal-stat"><span>物业预计月收益</span><strong>${landlord}</strong></div><div class="proposal-stat"><span>分成比例</span><strong>${p.share}%</strong></div></div><p>以上为输入参数下的测算示例，不构成销售额、物业收益或投资回报保证。实际结果取决于现场客流、商品、价格、营业时间及运营情况。</p></section>
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
  *{box-sizing:border-box}body{margin:0;background:#f3f3f2;color:#222;font-family:Arial,"Microsoft YaHei",sans-serif}.paper{width:min(900px,calc(100% - 32px));margin:32px auto;background:#fff;padding:50px 60px;box-shadow:0 8px 30px rgba(0,0,0,.08)}.proposal-brand{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #111;padding-bottom:15px}.proposal-logo{font-weight:900;letter-spacing:1px;font-size:15px}.proposal-logo span{display:inline-grid;place-items:center;background:#fff200;width:26px;height:26px;margin-right:7px}.proposal-doc-type{font-size:8px;letter-spacing:1.3px;color:#888}.proposal-title{margin:35px 0 9px;font-size:30px}.proposal-subtitle{font-size:11px;color:#888}.proposal-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f7f7f6;padding:16px;margin:22px 0}.proposal-meta div span{font-size:9px;color:#999;display:block;margin-bottom:5px}.proposal-meta div strong{font-size:11px}.proposal-section{margin:26px 0;page-break-inside:avoid}.proposal-section h3{font-size:13px;margin:0 0 9px;padding-bottom:8px;border-bottom:1px solid #eee}.proposal-section p,.proposal-section li{font-size:10px;line-height:1.8;color:#666}.proposal-section ul{padding-left:18px}.proposal-machine-placeholder{height:145px;border:1px dashed #ccc;background:#fafafa;display:grid;place-items:center;text-align:center;color:#aaa;font-size:10px;line-height:1.7;margin:14px 0}.proposal-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.proposal-stat{background:#111;color:#fff;padding:14px}.proposal-stat span{font-size:8px;color:#aaa;display:block}.proposal-stat strong{font-size:15px;display:block;margin-top:7px}.proposal-callout{background:#fffde8;border-left:3px solid #d9cf00;padding:13px;font-size:10px;line-height:1.8;color:#666}.proposal-footer{border-top:1px solid #eee;margin-top:30px;padding-top:12px;display:flex;justify-content:space-between;color:#aaa;font-size:8px}@media(max-width:600px){.paper{padding:24px 18px}.proposal-title{font-size:24px}.proposal-stat-row{grid-template-columns:1fr}}@media print{body{background:#fff}.paper{width:100%;margin:0;padding:25px 35px;box-shadow:none}}
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
  document.querySelectorAll('input[name=\"propDoc\"]').forEach(input => input.addEventListener('change', () => onUpdate()));
}
