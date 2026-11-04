/* =========================================================
   应用入口：导航、项目状态、页面之间的数据联动
   新增页面时：在 index.html 增加 section，再在这里增加路由映射。
   ========================================================= */
import { DEFAULT_SCORE, DEFAULT_DOCS, dateLabel, money, escapeHTML } from './data.js';
import { loadStore, saveStore, createProject } from './storage.js';
import { renderScoreFactors, calculateScore, paintScoreResult } from './scorer.js';
import { readROIForm, applyROIForm, calculateROI, renderROI, bindROIInputs } from './roi.js';
import { readProposalForm, applyProposalForm, renderProposalPreview, exportProposalHTML, bindProposalInputs } from './proposal.js';
import { renderCompliance, normalizeDocs, setComplianceChangeHandler, bindComplianceAddButton } from './compliance.js';

const store = loadStore();
store.docs = normalizeDocs(store.docs?.length ? store.docs : DEFAULT_DOCS);
let currentPage = 'dashboard';
let scoreValues = { ...DEFAULT_SCORE };
let applyingScoreForm = false;
let toastTimer;
const $ = id => document.getElementById(id);

function toast(message) {
  const box = $('toast'); box.textContent = message; box.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => box.classList.remove('show'), 2600);
}
function persist() {
  const success = saveStore(store);
  if (!success) toast('本地保存失败，请检查浏览器存储空间或隐私设置。');
  return success;
}
function currentProject() { return store.projects.find(project => project.id === store.currentProjectId) || null; }
function setCurrentProject(project) {
  store.currentProjectId = project?.id || null;
  persist();
}
function ensureProject(nameHint = '') {
  let project = currentProject();
  if (project) return project;
  const name = nameHint.trim() || $('locName').value.trim() || $('roiLocation').value.trim() || $('propProperty').value.trim() || '未命名点位项目';
  project = createProject(name, $('locCity').value.trim() || $('propCity').value.trim());
  store.projects.unshift(project); store.currentProjectId = project.id; persist();
  return project;
}
function updateProjectTimestamp(project) { project.updatedAt = new Date().toISOString(); }
function readScoreForm() {
  return {
    name: $('locName').value.trim(), city: $('locCity').value.trim(), type: $('locType').value,
    traffic: Number($('locTraffic').value || 0), audience: $('locAudience').value.trim(), term: Number($('locTerm').value || 0),
    decision: $('locDecision').value.trim(), source: $('locSource').value, notes: $('locNotes').value.trim(), ratings: { ...scoreValues }
  };
}
function applyScoreForm(data = {}) {
  applyingScoreForm = true;
  const map = { name:'locName', city:'locCity', type:'locType', traffic:'locTraffic', audience:'locAudience', term:'locTerm', decision:'locDecision', source:'locSource', notes:'locNotes' };
  Object.entries(map).forEach(([key,id]) => { if (data[key] !== undefined) $(id).value = data[key]; else $(id).value = ''; });
  scoreValues = { ...DEFAULT_SCORE, ...(data.ratings || {}) };
  renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
  updateDecisionGuide();
  paintScoreResult(calculateScore(scoreValues));
  applyingScoreForm = false;
}
function updateScoring(factorId, value) {
  if (factorId) scoreValues[factorId] = value;
  renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
  const result = calculateScore(scoreValues); paintScoreResult(result);
  const project = currentProject();
  if (project && !applyingScoreForm) {
    const draft = { ...readScoreForm(), result };
    if (project.score) project.score = draft;
    else project.scoreDraft = draft;
    updateProjectTimestamp(project); persist();
  }
  refreshProposalPreview();
  return result;
}

function updateDecisionGuide() {
  const type = $('locType').value;
  const guidance = {
    '办公楼': '小办公室：Office Manager；大型办公室：Facilities / Workplace Manager；多租户办公楼：Property Manager 或前台。先确认是否存在企业级统一供应商协议。',
    '公寓 / 多户住宅': '优先联系 Property Manager（物业经理），必要时进一步确认区域 / Corporate Property Manager 是否拥有最终审批权。',
    '健身房': '独立健身房：Owner 或 General Manager；连锁 / 加盟店：General Manager，并先核实是否已有全国性合作协议。',
    '酒店': '优先联系 General Manager、Director of Operations 或 Facilities Manager；大型连锁酒店需确认品牌或集团采购要求。',
    '学校 / 教育机构': '优先联系 Facilities Manager、学校行政或采购负责人；公立机构通常还需确认招标和供应商准入流程。',
    '医院 / 医疗机构': '优先联系 Facilities / Supply Chain / Purchasing 部门，并提前了解院内供应商准入、保险及卫生审查要求。',
    '公共建筑': '关注政府网站的采购公告（RFP / RFQ），按供应商注册、投标和采购流程联系 Purchasing / Procurement 部门。',
    '其他': '通常从 Site Manager、General Manager 或 Facilities Manager 入手，再确认实际合同签署人和预算审批人。'
  };
  $('decisionGuideText').textContent = guidance[type] || guidance['其他'];
}

function readProposalState() { return readProposalForm(); }
function refreshProposalPreview() {
  const roi = calculateROI(readROIForm());
  const score = calculateScore(scoreValues);
  renderProposalPreview(roi, score, store.docs);
}
function updateProposalAutoSave() {
  refreshProposalPreview();
  const project = currentProject();
  if (project) {
    project.proposal = readProposalState();
    if (!project.name || project.name === '未命名点位项目') project.name = project.proposal.property || project.name;
    updateProjectTimestamp(project); persist();
  }
}
function saveScore() {
  const data = readScoreForm();
  if (!data.name) { toast('请先填写点位名称。'); $('locName').focus(); return; }
  const project = ensureProject(data.name);
  project.name = data.name; project.city = data.city;
  project.score = { ...data, result: calculateScore(scoreValues) };
  delete project.scoreDraft;
  updateProjectTimestamp(project); setCurrentProject(project); persist();
  updateDashboard(); toast('点位评估已保存到本地项目。');
}
function saveROI() {
  const data = readROIForm();
  const project = ensureProject(data.location);
  project.roi = { ...data, result: calculateROI(data) };
  if (data.location) project.name = data.location;
  updateProjectTimestamp(project); setCurrentProject(project); persist();
  updateDashboard(); toast('ROI 测算已保存到当前项目。');
}
function saveProposal() {
  const data = readProposalState();
  const project = ensureProject(data.property);
  project.proposal = data;
  if (data.property) project.name = data.property;
  if (data.city) project.city = data.city;
  updateProjectTimestamp(project); setCurrentProject(project); persist();
  updateDashboard(); toast('提案信息已保存到当前项目。');
}
function loadProject(project) {
  store.currentProjectId = project.id;
  if (project.score || project.scoreDraft) applyScoreForm(project.score || project.scoreDraft);
  else applyScoreForm({ name:project.name, city:project.city });
  if (project.roi) applyROIForm(project.roi);
  else applyROIForm({ location:project.name });
  if (project.proposal) applyProposalForm(project.proposal);
  else applyProposalForm({ property:project.name, city:project.city });
  renderROI(); refreshProposalPreview(); persist();
  setPage('scorer'); toast(`已打开项目：${project.name}`);
}

/* 导航：切换单页应用中的主内容区域 */
function setPage(page) {
  if (!$(`page-${page}`)) return;
  currentPage = page;
  document.querySelectorAll('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  const names = { dashboard:'工作台', scorer:'点位评估', roi:'ROI 收益测算', proposal:'商业提案', compliance:'合规文件中心', projects:'我的项目' };
  $('breadcrumbCurrent').textContent = names[page] || '工作台';
  $('sidebar').classList.remove('open');
  if (page === 'dashboard') updateDashboard();
  if (page === 'projects') renderProjects();
  if (page === 'compliance') renderCompliance(store.docs);
  if (page === 'proposal') refreshProposalPreview();
}
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setPage(button.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(button => button.addEventListener('click', () => setPage(button.dataset.goto)));
$('mobileMenu').addEventListener('click', () => $('sidebar').classList.toggle('open'));

/* 工作台数据卡片 */
function updateDashboard() {
  const projects = store.projects;
  const scores = projects.filter(p => p.score?.result?.score !== undefined).map(p => p.score.result.score);
  const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b,0)/scores.length) : '—';
  const stats = [
    ['项目总数', projects.length, '当前浏览器已保存'],
    ['已完成评估', scores.length, '包含点位评分的项目'],
    ['平均点位得分', avg, scores.length ? '满分 100' : '完成评估后显示'],
    ['已生成提案', projects.filter(p => p.proposal?.property || p.proposal?.title).length, '已填写提案内容']
  ];
  $('dashboardStats').innerHTML = stats.map(s => `<div class="stat-card"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
  const recent = projects.slice().sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,4);
  $('recentProjects').innerHTML = recent.length ? recent.map(project => `<div class="recent-row"><div><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.city || '城市待补充')} · 更新于 ${dateLabel(project.updatedAt)}</small></div><div class="recent-score">${project.score?.result?.score ?? '—'}<small> / 100</small></div></div>`).join('') : '<div class="empty-state"><strong>还没有点位项目</strong>创建你的第一个项目，开始评估并制作提案。</div>';
}

/* 项目管理页：搜索、打开、删除 */
function renderProjects() {
  const query = $('projectSearch').value.trim().toLowerCase();
  const filtered = store.projects.filter(p => `${p.name} ${p.city}`.toLowerCase().includes(query)).sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
  $('projectCountLabel').textContent = `${filtered.length} 个项目`;
  $('projectsGrid').innerHTML = filtered.length ? filtered.map(project => `
    <article class="project-card"><div class="project-card-top"><span class="project-type">${project.score ? '已评估' : '进行中'}</span>${project.id === store.currentProjectId ? '<span class="project-type">当前项目</span>' : ''}</div>
      <h3>${escapeHTML(project.name)}</h3><p>${escapeHTML(project.city || '城市待补充')} · 更新于 ${dateLabel(project.updatedAt)}</p>
      <div class="project-card-bottom"><small>点位评分：${project.score?.result?.score ?? '待评估'} / 100</small><span><button data-open-project="${project.id}">打开 →</button> <button data-delete-project="${project.id}">删除</button></span></div></article>`).join('') : '<div class="empty-state"><strong>没有找到项目</strong>试试其他关键词，或新建一个点位项目。</div>';
  document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => { const project = store.projects.find(p => p.id === button.dataset.openProject); if (project) loadProject(project); }));
  document.querySelectorAll('[data-delete-project]').forEach(button => button.addEventListener('click', () => {
    const project = store.projects.find(p => p.id === button.dataset.deleteProject);
    if (!project || !window.confirm(`确定删除「${project.name}」吗？此操作不可恢复。`)) return;
    store.projects = store.projects.filter(p => p.id !== project.id);
    if (store.currentProjectId === project.id) store.currentProjectId = null;
    persist(); renderProjects(); updateDashboard(); toast('项目已删除。');
  }));
}
$('projectSearch').addEventListener('input', renderProjects);

/* 新建项目弹窗 */
function openNewProjectModal() { $('newProjectModal').hidden = false; $('newProjectName').value = ''; $('newProjectCity').value = ''; $('newProjectName').focus(); }
function closeNewProjectModal() { $('newProjectModal').hidden = true; }
['newProjectTop','startNewProject','newProjectList'].forEach(id => $(id).addEventListener('click', openNewProjectModal));
['closeModal','cancelNewProject'].forEach(id => $(id).addEventListener('click', closeNewProjectModal));
$('newProjectModal').addEventListener('click', event => { if (event.target === $('newProjectModal')) closeNewProjectModal(); });
$('confirmNewProject').addEventListener('click', () => {
  const name = $('newProjectName').value.trim();
  if (!name) { toast('请填写项目名称。'); $('newProjectName').focus(); return; }
  const project = createProject(name, $('newProjectCity').value);
  store.projects.unshift(project); store.currentProjectId = project.id; persist();
  applyScoreForm({ name, city:project.city }); applyROIForm({ location:name }); applyProposalForm({ property:name, city:project.city });
  closeNewProjectModal(); setPage('scorer'); updateDashboard(); toast('项目已创建，开始填写点位信息。');
});

/* 点位评估 */
renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
updateDecisionGuide();
$('saveScore').addEventListener('click', saveScore);
$('resetScore').addEventListener('click', () => { scoreValues = { ...DEFAULT_SCORE }; renderScoreFactors($('scoreFactors'), scoreValues, updateScoring); updateScoring(); toast('评分已重置为 3 分。'); });
$('scoreToProposal').addEventListener('click', () => {
  const location = readScoreForm();
  if (location.name) $('propProperty').value = location.name;
  if (location.city) $('propCity').value = location.city;
  if (location.type) $('propVenue').value = location.type;
  if (location.traffic) $('propTraffic').value = location.traffic;
  if (currentProject()) { currentProject().score = { ...location, result: calculateScore(scoreValues) }; persist(); }
  refreshProposalPreview(); setPage('proposal');
});
['locName','locCity','locType','locTraffic','locAudience','locTerm','locDecision','locSource','locNotes'].forEach(id => $(id).addEventListener('input', () => {
  if (id === 'locType') updateDecisionGuide();
  const project = currentProject(); if (project) { if ($('locName').value.trim()) project.name = $('locName').value.trim(); if ($('locCity').value.trim()) project.city = $('locCity').value.trim(); const draft = { ...readScoreForm(), result: calculateScore(scoreValues) }; if (project.score) project.score = draft; else project.scoreDraft = draft; updateProjectTimestamp(project); persist(); }
}));

/* ROI 测算 */
bindROIInputs(result => {
  const project = currentProject();
  if (project) { project.roi = { ...readROIForm(), result }; updateProjectTimestamp(project); persist(); }
  refreshProposalPreview();
});
$('saveRoi').addEventListener('click', saveROI);
$('resetRoi').addEventListener('click', () => { applyROIForm(); renderROI(); refreshProposalPreview(); toast('ROI 参数已恢复为示例值。'); });

/* 商业提案 */
bindProposalInputs(updateProposalAutoSave);
$('saveProposal')?.addEventListener('click', saveProposal);
$('exportProposal').addEventListener('click', () => {
  if (!$('propProperty').value.trim()) { toast('建议先填写物业 / 点位名称，再导出提案。'); $('propProperty').focus(); return; }
  exportProposalHTML(calculateROI(readROIForm()), calculateScore(scoreValues), store.docs);
  saveProposal(); toast('已导出独立提案网页 HTML。');
});
$('printProposal').addEventListener('click', () => { refreshProposalPreview(); window.print(); });
$('loadProposalExample').addEventListener('click', () => {
  applyProposalForm({ title:'智能零售柜点位合作提案', property:'Sunrise Apartments', city:'Tampa, FL', operator:'Independent Vending Operator', contact:'Property Management Team', venue:'公寓 / 多户住宅', traffic:300, machine:'HAHA 智能零售柜', quantity:1, deal:'销售额分成', share:10, launch:'双方确认后 2–4 周', planogram:'瓶装水、运动饮料、碳酸饮料、健康零食、方便食品及日常必需品。根据住户画像和销售数据持续优化 SKU。', service:'运营商负责商品采购、定期补货、设备清洁与日常运营，并根据现场情况安排维护响应。', notes:'需进一步确认设备摆放区域、电源及网络条件、电费承担方式、物业访问权限和最终合作协议。' });
  updateProposalAutoSave(); toast('已载入示例提案内容，请替换为真实信息。');
});
$('syncFromRoi').addEventListener('click', () => {
  const roi = calculateROI(readROIForm()); $('propShare').value = roi.shareRate;
  $('propNotes').value = `收益测算参考：预计月销售额 ${money(roi.monthlyRevenue)}；物业预计月收益 ${money(roi.landlordIncome)}。以上为假设测算，非收益承诺。`;
  updateProposalAutoSave(); toast('已将 ROI 分成比例和测算结果同步到提案。');
});

/* 合规文件中心 */
setComplianceChangeHandler(docs => { store.docs = docs; persist(); renderCompliance(store.docs); toast('文件链接信息已保存到本地。'); });
bindComplianceAddButton(store.docs);
renderCompliance(store.docs);

/* 页面初始化：恢复当前项目及首页统计 */
function initialize() {
  const project = currentProject();
  if (project) {
    if (project.score || project.scoreDraft) applyScoreForm(project.score || project.scoreDraft); else applyScoreForm({ name:project.name, city:project.city });
    if (project.roi) applyROIForm(project.roi); else applyROIForm({ location:project.name });
    if (project.proposal) applyProposalForm(project.proposal); else applyProposalForm({ property:project.name, city:project.city });
  } else {
    renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
    applyROIForm();
    applyProposalForm();
  }
  renderROI(); updateScoring(); refreshProposalPreview(); updateDashboard();
}
initialize();
