/* ===================================================
   应用入口：导航、项目状态、页面之间的数据联动
   新增页面时：在 index.html 增加 section，再在这里增加路由映射。
   =================================================== */
import { DEFAULT_SCORE, DEFAULT_READINESS, DEFAULT_DOCS, dateLabel, money, escapeHTML } from './data.js';
import { loadStore, saveStore, createProject, cleanLegacyNotes } from './storage.js';
import { renderScoreFactors, renderReadinessChecks, calculateScore, paintScoreResult, normalizeRatings, normalizeReadiness } from './scorer.js';
import { readROIForm, applyROIForm, calculateROI, renderROI, bindROIInputs } from './roi.js';
import { readProposalForm, applyProposalForm, applyROIToProposal, renderProposalPreview, exportProposalHTML, bindProposalInputs, syncProposalFormLanguage } from './proposal.js';
import { renderCompliance, normalizeDocs, setComplianceChangeHandler, bindComplianceAddButton } from './compliance.js';
import { initializeLanguageToggle, onLanguageChange, t, PROPOSAL_DEFAULTS, getLanguage } from './i18n.js';

const store = loadStore();
store.docs = normalizeDocs(store.docs?.length ? store.docs : DEFAULT_DOCS);
let currentPage = 'dashboard';
let scoreValues = { ...DEFAULT_SCORE };
let readinessValues = { ...DEFAULT_READINESS };
let applyingScoreForm = false;
let toastTimer;
let pendingDeleteProjectId = null;

const $ = id => document.getElementById(id);

function toast(message) {
  const box = $('toast');
  if (!box) return;
  box.textContent = t(message);
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 2600);
}

function persist() {
  const success = saveStore(store);
  if (!success) toast('本地保存失败，请检查浏览器存储空间或隐私设置。');
  return success;
}

function currentProject() {
  return store.projects.find(project => project.id === store.currentProjectId) || null;
}

function setCurrentProject(project) {
  store.currentProjectId = project?.id || null;
  persist();
}

function ensureProject(nameHint = '') {
  let project = currentProject();
  if (project) return project;
  const name = nameHint.trim() || $('locName')?.value.trim() || $('roiLocation')?.value.trim() || $('propProperty')?.value.trim() || '未命名点位项目';
  project = createProject(name, $('locCity')?.value.trim() || $('propCity')?.value.trim() || '');
  store.projects.unshift(project);
  store.currentProjectId = project.id;
  persist();
  return project;
}

function updateProjectTimestamp(project) {
  project.updatedAt = new Date().toISOString();
}

function readScoreForm() {
  return {
    name: $('locName')?.value.trim() || '',
    city: $('locCity')?.value.trim() || '',
    type: $('locType')?.value || '公寓 / 多户住宅',
    traffic: Number($('locTraffic')?.value || 0),
    audience: $('locAudience')?.value.trim() || '',
    term: Number($('locTerm')?.value || 0),
    decision: $('locDecision')?.value.trim() || '',
    source: $('locSource')?.value || '自主开发',
    notes: $('locNotes')?.value.trim() || '',
    ratings: { ...scoreValues },
    readiness: { ...readinessValues }
  };
}

function applyScoreForm(data = {}) {
  applyingScoreForm = true;
  const map = {
    name: 'locName',
    city: 'locCity',
    type: 'locType',
    traffic: 'locTraffic',
    audience: 'locAudience',
    term: 'locTerm',
    decision: 'locDecision',
    source: 'locSource',
    notes: 'locNotes'
  };
  Object.entries(map).forEach(([key, id]) => {
    const elem = $(id);
    if (!elem) return;
    if (data[key] !== undefined && data[key] !== null) {
      elem.value = data[key];
    } else if (elem.tagName === 'SELECT') {
      elem.selectedIndex = 0;
    } else {
      elem.value = '';
    }
  });
  scoreValues = normalizeRatings(data.ratings || {});
  readinessValues = normalizeReadiness(data.readiness || {});
  renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
  renderReadinessChecks($('readinessList'), readinessValues, updateReadiness);
  updateDecisionGuide();
  paintScoreResult(calculateScore(scoreValues, readinessValues));
  applyingScoreForm = false;
}

function updateScoring(factorId, value) {
  if (factorId) scoreValues[factorId] = value;
  const result = calculateScore(scoreValues, readinessValues);
  paintScoreResult(result);
  const project = currentProject();
  if (project && !applyingScoreForm) {
    const draft = { ...readScoreForm(), result };
    if (project.score || result.isComplete) project.score = draft;
    else project.scoreDraft = draft;
    updateProjectTimestamp(project);
    persist();
    updateDashboard();
  }
  refreshProposalPreview();
  return result;
}

function updateReadiness(readinessId, value) {
  if (readinessId) readinessValues[readinessId] = value;
  const result = calculateScore(scoreValues, readinessValues);
  paintScoreResult(result);
  const project = currentProject();
  if (project && !applyingScoreForm) {
    const draft = { ...readScoreForm(), result };
    if (project.score) project.score = draft;
    else project.scoreDraft = draft;
    updateProjectTimestamp(project);
    persist();
  }
  return result;
}

function updateDecisionGuide() {
  const type = $('locType')?.value || '其他';
  const guidance = {
    '办公楼': '小办公室：Office Manager；大型办公室：Facilities / Workplace Manager；多租户办公楼：Property Manager 或前台。先确认是否存在企业级统一供应商协议。',
    '公寓 / 多户住宅': '优先联系 Property Manager（物业经理），必要时进一步确认区域 / Corporate Property Manager 是否拥有最终审批权。',
    '工厂 / 仓储': '优先联系 Plant Manager（厂长）、HR 负责人或 Facilities / EHS 部门，重点沟通夜班/倒班员工的即时餐饮福利与免人工管理优势。',
    '健身房': '独立健身房：Owner 或 General Manager；连锁 / 加盟店：General Manager，并先核实是否已有全国性合作协议。',
    '酒店': '优先联系 General Manager、Director of Operations 或 Facilities Manager；大型连锁酒店需确认品牌或集团采购要求。',
    '学校 / 教育机构': '优先联系 Facilities Manager、学校行政或采购负责人；公立机构通常还需确认招标和供应商准入流程。',
    '医院 / 医疗机构': '优先联系 Facilities / Supply Chain / Purchasing 部门，并提前了解院内供应商准入、保险及卫生审查要求。',
    '公共建筑': '关注政府网站的采购公告（RFP / RFQ），按供应商注册、投标和采购流程联系 Purchasing / Procurement 部门。',
    '其他': '通常从 Site Manager、General Manager 或 Facilities Manager 入手，再确认实际合同签署人和预算审批人。'
  };
  const guideEl = $('decisionGuideText');
  if (guideEl) guideEl.textContent = t(guidance[type] || guidance['其他']);
}

function readProposalState() {
  return readProposalForm();
}

function refreshProposalPreview() {
  const roi = calculateROI(readROIForm());
  const score = calculateScore(scoreValues, readinessValues);
  renderProposalPreview(roi, score, store.docs);
}

function updateProposalAutoSave() {
  refreshProposalPreview();
  const project = currentProject();
  if (project) {
    project.proposal = readProposalState();
    if (!project.name || project.name === '未命名点位项目') project.name = project.proposal.property || project.name;
    updateProjectTimestamp(project);
    persist();
  }
}

function saveScore() {
  const data = readScoreForm();
  if (!data.name) {
    toast('请先填写点位名称。');
    $('locName')?.focus();
    return;
  }
  const project = ensureProject(data.name);
  project.name = data.name;
  project.city = data.city;
  project.score = { ...data, result: calculateScore(scoreValues, readinessValues) };
  delete project.scoreDraft;
  updateProjectTimestamp(project);
  setCurrentProject(project);
  persist();
  updateDashboard();
  toast('点位评估已保存到本地项目。');
}

function saveROI() {
  const data = readROIForm();
  const project = ensureProject(data.location);
  project.roi = { ...data, result: calculateROI(data) };
  if (data.location) project.name = data.location;
  updateProjectTimestamp(project);
  setCurrentProject(project);
  persist();
  updateDashboard();
  toast('点位方收益测算已保存到当前项目。');
}

function saveProposal() {
  const data = readProposalState();
  const project = ensureProject(data.property);
  project.proposal = data;
  if (data.property) project.name = data.property;
  if (data.city) project.city = data.city;
  updateProjectTimestamp(project);
  setCurrentProject(project);
  persist();
  updateDashboard();
  toast('提案信息已保存到当前项目。');
}

function loadProject(project) {
  store.currentProjectId = project.id;
  if (project.score || project.scoreDraft) applyScoreForm(project.score || project.scoreDraft);
  else applyScoreForm({ name: project.name, city: project.city });
  if (project.roi) applyROIForm(project.roi);
  else applyROIForm({ location: project.name, venue: (project.score || project.scoreDraft)?.type || '公寓 / 多户住宅' });
  if (project.proposal) {
    project.proposal.notes = cleanLegacyNotes(project.proposal.notes);
    applyProposalForm(project.proposal);
  } else {
    applyProposalForm({ property: project.name, city: project.city });
  }
  renderROI();
  refreshProposalPreview();
  persist();
  setPage('scorer');
  toast(`已打开项目：${project.name}`);
}

/* 导航：切换单页应用中的主内容区域，并自动滚回页面最顶端 */
function setPage(page) {
  if (!$(`page-${page}`)) return;
  currentPage = page;
  document.querySelectorAll('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  const names = {
    dashboard: '工作台',
    scorer: '点位评估',
    roi: '点位方收益测算',
    proposal: '商业提案',
    compliance: '合规文件中心',
    projects: '我的项目'
  };
  if ($('breadcrumbCurrent')) $('breadcrumbCurrent').textContent = t(names[page] || '工作台');
  $('sidebar')?.classList.remove('open');
  if (page === 'dashboard') updateDashboard();
  if (page === 'projects') renderProjects();
  if (page === 'compliance') renderCompliance(store.docs);
  if (page === 'roi') renderROI();
  if (page === 'proposal') refreshProposalPreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => setPage(button.dataset.page));
});
document.querySelectorAll('[data-goto]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    setPage(button.dataset.goto);
  });
});
$('mobileMenu')?.addEventListener('click', () => $('sidebar')?.classList.toggle('open'));

/* 工作台数据卡片 */
function updateDashboard() {
  const projects = store.projects;
  const scores = projects
    .map(p => (p.score || p.scoreDraft)?.result?.score)
    .filter(s => typeof s === 'number' && !Number.isNaN(s));
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '-';
  const stats = [
    [t('项目总数'), projects.length, t('当前浏览器已保存')],
    [t('已完成评估'), scores.length, t('包含点位评分的项目')],
    [t('平均点位得分'), avg, scores.length ? t('满分 100') : t('完成评估后显示')],
    [t('已生成提案'), projects.filter(p => p.proposal?.property || p.proposal?.title).length, t('已填写提案内容')]
  ];
  if ($('dashboardStats')) {
    $('dashboardStats').innerHTML = stats.map(s => `<div class="stat-card"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
  }
  const recent = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const recentEl = $('recentProjects');
  if (recentEl) {
    recentEl.innerHTML = recent.length
      ? recent.map(project => `<div class="recent-row"><div><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.city || t('城市待补充'))} · ${t(`更新于 ${dateLabel(project.updatedAt)}`)}</small></div><button type="button" data-open-project="${project.id}">${t('打开')}</button></div>`).join('')
      : `<div class="recent-empty">${t('暂无项目数据')}</div>`;
    recentEl.querySelectorAll('[data-open-project]').forEach(button => {
      button.addEventListener('click', () => {
        const project = store.projects.find(p => p.id === button.dataset.openProject);
        if (project) loadProject(project);
      });
    });
  }
}

/* 项目管理页：搜索、打开、删除 */
function openDeleteModal(projectId) {
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return;
  pendingDeleteProjectId = projectId;
  const msgEl = $('deleteModalMessage');
  if (msgEl) {
    msgEl.textContent = t(`确定删除「${project.name}」吗？此操作不可恢复。`);
  }
  if ($('deleteConfirmModal')) $('deleteConfirmModal').hidden = false;
}

function closeDeleteModal() {
  pendingDeleteProjectId = null;
  if ($('deleteConfirmModal')) $('deleteConfirmModal').hidden = true;
}

function confirmDeleteProject() {
  if (!pendingDeleteProjectId) return;
  store.projects = store.projects.filter(p => p.id !== pendingDeleteProjectId);
  if (store.currentProjectId === pendingDeleteProjectId) store.currentProjectId = null;
  closeDeleteModal();
  persist();
  renderProjects();
  updateDashboard();
  toast('项目已删除。');
}

$('closeDeleteModal')?.addEventListener('click', closeDeleteModal);
$('cancelDeleteModal')?.addEventListener('click', closeDeleteModal);
$('confirmDeleteModal')?.addEventListener('click', confirmDeleteProject);
$('deleteConfirmModal')?.addEventListener('click', event => {
  if (event.target === $('deleteConfirmModal')) closeDeleteModal();
});

function renderProjects() {
  const query = ($('projectSearch')?.value || '').trim().toLowerCase();
  const filtered = store.projects
    .filter(p => `${p.name} ${p.city}`.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if ($('projectCountLabel')) {
    $('projectCountLabel').textContent = t(`${filtered.length} 个项目`);
  }
  const gridEl = $('projectsGrid');
  if (!gridEl) return;
  gridEl.innerHTML = filtered.length
    ? filtered.map(project => {
        const scoreVal = (project.score || project.scoreDraft)?.result?.score;
        const hasScore = typeof scoreVal === 'number' && !Number.isNaN(scoreVal);
        return `
          <article class="project-card">
            <div class="project-card-top">
              <span class="project-type">${hasScore ? t('已评估') : t('进行中')}</span>
              ${project.id === store.currentProjectId ? `<span class="project-badge">${t('当前项目')}</span>` : ''}
            </div>
            <h3>${escapeHTML(project.name)}</h3>
            <p>${escapeHTML(project.city || t('城市待补充'))} · ${t(`更新于 ${dateLabel(project.updatedAt)}`)}</p>
            <div class="project-card-bottom">
              <small>${t(`点位评分：${hasScore ? scoreVal : t('待评估')} / 100`)}</small>
              <span>
                <button type="button" data-open-project="${project.id}">${t('打开')}</button>
                <button type="button" data-delete-project="${project.id}">${t('删除')}</button>
              </span>
            </div>
          </article>`;
      }).join('')
    : `<div class="recent-empty">${t('暂无相关项目')}</div>`;

  gridEl.querySelectorAll('[data-open-project]').forEach(button => {
    button.addEventListener('click', () => {
      const project = store.projects.find(p => p.id === button.dataset.openProject);
      if (project) loadProject(project);
    });
  });
  gridEl.querySelectorAll('[data-delete-project]').forEach(button => {
    button.addEventListener('click', () => openDeleteModal(button.dataset.deleteProject));
  });
}

$('projectSearch')?.addEventListener('input', renderProjects);

/* 新建项目弹窗 */
function openNewProjectModal() {
  if (!$('newProjectModal')) return;
  $('newProjectModal').hidden = false;
  if ($('newProjectName')) $('newProjectName').value = '';
  if ($('newProjectCity')) $('newProjectCity').value = '';
  $('newProjectName')?.focus();
}

function closeNewProjectModal() {
  if ($('newProjectModal')) $('newProjectModal').hidden = true;
}

['newProjectTop', 'startNewProject', 'newProjectList'].forEach(id => {
  $(id)?.addEventListener('click', openNewProjectModal);
});
['closeModal', 'cancelNewProject'].forEach(id => {
  $(id)?.addEventListener('click', closeNewProjectModal);
});
$('newProjectModal')?.addEventListener('click', event => {
  if (event.target === $('newProjectModal')) closeNewProjectModal();
});
$('confirmNewProject')?.addEventListener('click', () => {
  const name = ($('newProjectName')?.value || '').trim();
  if (!name) {
    toast('请填写项目名称。');
    $('newProjectName')?.focus();
    return;
  }
  const project = createProject(name, $('newProjectCity')?.value || '');
  store.projects.unshift(project);
  store.currentProjectId = project.id;
  persist();
  applyScoreForm({ name, city: project.city });
  applyROIForm({ location: name });
  applyProposalForm({ property: name, city: project.city });
  closeNewProjectModal();
  setPage('scorer');
  updateDashboard();
  toast('项目已创建，开始填写点位信息。');
});

/* 点位评估 */
renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
renderReadinessChecks($('readinessList'), readinessValues, updateReadiness);
updateDecisionGuide();
$('saveScore')?.addEventListener('click', saveScore);
$('resetScore')?.addEventListener('click', () => {
  scoreValues = { ...DEFAULT_SCORE };
  readinessValues = { ...DEFAULT_READINESS };
  renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
  renderReadinessChecks($('readinessList'), readinessValues, updateReadiness);
  updateScoring();
  toast('点位评估参数已重置。');
});

function advanceScoreToRoi() {
  const location = readScoreForm();
  if (location.name && $('propProperty')) $('propProperty').value = location.name;
  if (location.city && $('propCity')) $('propCity').value = location.city;
  if (location.type && $('propVenue')) $('propVenue').value = location.type;
  if (location.name && $('roiLocation')) $('roiLocation').value = location.name;
  if (location.type && $('roiVenue')) $('roiVenue').value = location.type;
  if (location.term > 0 && $('roiPeriod')) $('roiPeriod').value = location.term;
  if (currentProject()) {
    currentProject().score = { ...location, result: calculateScore(scoreValues, readinessValues) };
    persist();
  }
  renderROI();
  setPage('roi');
}

$('scoreToRoi')?.addEventListener('click', advanceScoreToRoi);

['locName', 'locCity', 'locType', 'locTraffic', 'locAudience', 'locTerm', 'locDecision', 'locSource', 'locNotes'].forEach(id => {
  $(id)?.addEventListener('input', () => {
    if (id === 'locType') updateDecisionGuide();
    const project = currentProject();
    if (project) {
      if ($('locName')?.value.trim()) project.name = $('locName').value.trim();
      if ($('locCity')?.value.trim()) project.city = $('locCity').value.trim();
      project.scoreDraft = { ...readScoreForm(), result: calculateScore(scoreValues, readinessValues) };
      persist();
      updateDashboard();
    }
  });
  $(id)?.addEventListener('change', () => {
    if (id === 'locType') updateDecisionGuide();
  });
});

/* 点位方收益测算 */
bindROIInputs(result => {
  const project = currentProject();
  if (project) {
    project.roi = { ...readROIForm(), result };
    if (result.location && (!project.name || project.name === '未命名点位项目')) {
      project.name = result.location;
    }
    updateProjectTimestamp(project);
    persist();
  }
  refreshProposalPreview();
});
$('saveRoi')?.addEventListener('click', saveROI);
$('resetRoi')?.addEventListener('click', () => {
  applyROIForm();
  renderROI();
  refreshProposalPreview();
  toast('收益测算参数已恢复为示例值。');
});
$('roiToProposal')?.addEventListener('click', () => {
  const roi = readROIForm();
  const scoreData = readScoreForm();
  if (scoreData.city && $('propCity')) $('propCity').value = scoreData.city;
  applyROIToProposal(roi);
  refreshProposalPreview();
  setPage('proposal');
});

/* 商业提案 */
bindProposalInputs(updateProposalAutoSave);
$('saveProposal')?.addEventListener('click', saveProposal);
$('exportProposal')?.addEventListener('click', () => {
  if (!$('propProperty')?.value.trim()) {
    toast('建议先填写物业 / 点位名称，再导出提案。');
    $('propProperty')?.focus();
    return;
  }
  exportProposalHTML(calculateROI(readROIForm()), calculateScore(scoreValues, readinessValues), store.docs);
  saveProposal();
  toast('已导出独立提案网页 HTML。');
});
$('printProposal')?.addEventListener('click', () => {
  refreshProposalPreview();
  window.print();
});
$('loadProposalExample')?.addEventListener('click', () => {
  const d = PROPOSAL_DEFAULTS[getLanguage() === 'en' ? 'en' : 'zh'];
  applyProposalForm({
    title: d.title,
    property: 'Sunrise Apartments',
    city: 'Tampa, FL',
    operator: 'Independent Vending Operator',
    contactName: 'Property Management Team',
    contactEmail: 'leasing@sunrise-apts.example.com',
    venue: '公寓 / 多户住宅',
    machine: 'Mini 360',
    quantity: 1,
    deal: 'revenueShare',
    share: 10,
    launch: d.launch,
    planogram: d.planogramExample,
    service: d.service,
    confirmItems: d.confirmItems,
    notes: d.notes
  });
  updateProposalAutoSave();
  toast('已载入示例提案内容，请替换为真实信息。');
});
$('syncFromRoi')?.addEventListener('click', () => {
  const roi = calculateROI(readROIForm());
  applyROIToProposal(roi);
  updateProposalAutoSave();
  toast('已同步点位方收益测算数据到提案。');
});

/* 合规文件中心 */
setComplianceChangeHandler(docs => {
  store.docs = docs;
  persist();
  renderCompliance(store.docs);
  refreshProposalPreview();
  toast('文件链接信息已保存到本地。');
}, toast);
bindComplianceAddButton(store.docs);
renderCompliance(store.docs);

/* 语言切换时同步重绘所有动态内容 */
onLanguageChange(() => {
  const names = {
    dashboard: '工作台',
    scorer: '点位评估',
    roi: '点位方收益测算',
    proposal: '商业提案',
    compliance: '合规文件中心',
    projects: '我的项目'
  };
  if ($('breadcrumbCurrent')) $('breadcrumbCurrent').textContent = t(names[currentPage] || '工作台');
  const roiNavBtn = document.querySelector('.nav-item[data-page="roi"]');
  if (roiNavBtn) {
    roiNavBtn.innerHTML = `<span class="nav-icon">$</span> ${getLanguage() === 'en' ? 'Site Partner Earnings' : '点位方收益测算'}`;
  }
  syncProposalFormLanguage();
  updateDecisionGuide();
  renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
  renderReadinessChecks($('readinessList'), readinessValues, updateReadiness);
  paintScoreResult(calculateScore(scoreValues, readinessValues));
  renderROI();
  refreshProposalPreview();
  renderCompliance(store.docs);
  updateDashboard();
  renderProjects();
});

/* 页面初始化：恢复当前项目及首页统计 */
function initialize() {
  const project = currentProject();
  if (project) {
    if (project.score || project.scoreDraft) applyScoreForm(project.score || project.scoreDraft);
    else applyScoreForm({ name: project.name, city: project.city });
    if (project.roi) applyROIForm(project.roi);
    else applyROIForm({ location: project.name, venue: (project.score || project.scoreDraft)?.type || '公寓 / 多户住宅' });
    if (project.proposal) {
      project.proposal.notes = cleanLegacyNotes(project.proposal.notes);
      applyProposalForm(project.proposal);
      persist();
    } else {
      applyProposalForm({ property: project.name, city: project.city });
    }
  } else {
    renderScoreFactors($('scoreFactors'), scoreValues, updateScoring);
    renderReadinessChecks($('readinessList'), readinessValues, updateReadiness);
    applyROIForm();
    applyProposalForm();
  }
  renderROI();
  updateScoring();
  refreshProposalPreview();
  updateDashboard();
  renderProjects();
}

initialize();
initializeLanguageToggle();
