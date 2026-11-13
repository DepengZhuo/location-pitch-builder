/* ===================================================
   Application Entry: Navigation, Project State & Sync
   =================================================== */
import { DEFAULT_SCORE, DEFAULT_READINESS, DEFAULT_DOCS, dateLabel, money, escapeHTML, normalizeVenue } from './data.js';
import { loadStore, saveStore, createProject, cleanLegacyNotes } from './storage.js';
import { renderScoreFactors, renderReadinessChecks, calculateScore, paintScoreResult, normalizeRatings, normalizeReadiness } from './scorer.js';
import { readROIForm, applyROIForm, calculateROI, renderROI, bindROIInputs } from './roi.js';
import { readProposalForm, applyProposalForm, applyROIToProposal, renderProposalPreview, exportProposalHTML, bindProposalInputs, syncProposalFormLanguage, renderDocCheckboxes, removeDeletedDocFromSelection } from './proposal.js';
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
  if (!success) toast('Local save failed. Please check browser storage or privacy settings.');
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
  const name = nameHint.trim() || $('locName')?.value.trim() || $('roiLocation')?.value.trim() || $('propProperty')?.value.trim() || 'Untitled Location Project';
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
    type: normalizeVenue($('locType')?.value),
    traffic: Number($('locTraffic')?.value || 0),
    audience: $('locAudience')?.value.trim() || '',
    term: Number($('locTerm')?.value || 0),
    decision: $('locDecision')?.value.trim() || '',
    source: $('locSource')?.value || 'Direct Outreach',
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
      elem.value = key === 'type' ? normalizeVenue(data[key]) : data[key];
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
  const type = normalizeVenue($('locType')?.value);
  const guidance = {
    'Office & Corporate Campus': 'Small office: Office Manager; Large office: Facilities / Workplace Manager; Multi-tenant building: Property Manager or front desk. Confirm whether an enterprise vendor agreement exists.',
    'Apartment & Residential': 'Contact the Property Manager first, and confirm whether a Regional or Corporate Property Manager holds final approval authority.',
    'Factory & Industrial Plant': 'Contact the Plant Manager, HR lead, or Facilities / EHS manager; highlight 24/7 refreshment access across shifts with zero staffing burden.',
    'Gym & Fitness Center': 'Independent gym: Owner or General Manager; Chain / franchise: General Manager, and verify whether a national vendor contract is already in place.',
    'Hotel & Hospitality': 'Contact the General Manager, Director of Operations, or Facilities Manager; for hotel chains, verify brand or corporate procurement standards.',
    'School & University Campus': 'Contact the Facilities Manager, administration, or purchasing lead; public institutions usually require RFP and vendor onboarding steps.',
    'Hospital & Medical Center': 'Contact Facilities, Supply Chain, or Purchasing, and review hospital vendor onboarding, insurance, and health compliance requirements.',
    'Airport & Transit Hub': 'Contact Airport/Transit Concessions, Commercial Management, or Facilities to confirm security clearance, compliance credentials, and power access.',
    'Construction Site': 'Contact the Project Manager, Site Superintendent, or EHS lead; highlight heat-safety hydration, on-site crew refueling, and stable 110–120V power.'
  };
  const guideEl = $('decisionGuideText');
  if (guideEl) guideEl.textContent = t(guidance[type] || guidance['Office & Corporate Campus']);
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
    if (!project.name || project.name === 'Untitled Location Project' || project.name === '未命名点位项目') {
      project.name = project.proposal.property || project.name;
    }
    updateProjectTimestamp(project);
    persist();
  }
}

function saveScore() {
  const data = readScoreForm();
  if (!data.name) {
    toast('Please enter a location name first.');
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
  toast('Location assessment saved to local project.');
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
  toast('Site partner earnings estimate saved to current project.');
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
  toast('Proposal details saved to current project.');
}

function loadProject(project) {
  store.currentProjectId = project.id;
  if (project.score || project.scoreDraft) applyScoreForm(project.score || project.scoreDraft);
  else applyScoreForm({ name: project.name, city: project.city });
  if (project.roi) applyROIForm(project.roi);
  else applyROIForm({ location: project.name, venue: (project.score || project.scoreDraft)?.type || 'Apartment & Residential' });
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
  toast(`Opened project: ${project.name}`);
}

function setPage(page) {
  if (!$(`page-${page}`)) return;
  currentPage = page;
  document.querySelectorAll('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  const names = {
    dashboard: 'Dashboard',
    scorer: 'Location Assessment',
    roi: 'Site Partner Earnings',
    proposal: 'Business Proposal',
    compliance: 'Compliance Documents',
    projects: 'My Projects'
  };
  if ($('breadcrumbCurrent')) $('breadcrumbCurrent').textContent = t(names[page] || 'Dashboard');
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

function updateDashboard() {
  const projects = store.projects;
  const scores = projects
    .map(p => (p.score || p.scoreDraft)?.result?.score)
    .filter(s => typeof s === 'number' && !Number.isNaN(s));
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '-';
  const stats = [
    [t('Total Projects'), projects.length, t('Saved in this browser')],
    [t('Assessments Completed'), scores.length, t('Projects with a location assessment')],
    [t('Average Location Score'), avg, scores.length ? t('Out of 100') : t('Shown after assessment')],
    [t('Proposals Created'), projects.filter(p => p.proposal?.property || p.proposal?.title).length, t('Proposals with saved details')]
  ];
  if ($('dashboardStats')) {
    $('dashboardStats').innerHTML = stats.map(s => `<div class="stat-card"><span>${s[0]}</span><strong>${s[1]}</strong><small>${s[2]}</small></div>`).join('');
  }
  const recent = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const recentEl = $('recentProjects');
  if (recentEl) {
    recentEl.innerHTML = recent.length
      ? recent.map(project => `<div class="recent-row"><div><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.city || t('City not provided'))} · ${t(`Updated ${dateLabel(project.updatedAt)}`)}</small></div><button type="button" data-open-project="${project.id}">${t('Open')}</button></div>`).join('')
      : `<div class="recent-empty">${t('No projects yet')}</div>`;
    recentEl.querySelectorAll('[data-open-project]').forEach(button => {
      button.addEventListener('click', () => {
        const project = store.projects.find(p => p.id === button.dataset.openProject);
        if (project) loadProject(project);
      });
    });
  }
}

function openDeleteModal(projectId) {
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return;
  pendingDeleteProjectId = projectId;
  const msgEl = $('deleteModalMessage');
  if (msgEl) {
    msgEl.textContent = t(`Delete project "${project.name}"? This action cannot be undone.`);
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
  toast('Project deleted.');
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
    $('projectCountLabel').textContent = t(`${filtered.length} projects`);
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
              <span class="project-type">${hasScore ? t('Assessed') : t('In Progress')}</span>
              ${project.id === store.currentProjectId ? `<span class="project-badge">${t('Current Project')}</span>` : ''}
            </div>
            <h3>${escapeHTML(project.name)}</h3>
            <p>${escapeHTML(project.city || t('City not provided'))} · ${t(`Updated ${dateLabel(project.updatedAt)}`)}</p>
            <div class="project-card-bottom">
              <small>${t(`Score: ${hasScore ? scoreVal : t('Not assessed')} / 100`)}</small>
              <span>
                <button type="button" data-open-project="${project.id}">${t('Open')}</button>
                <button type="button" data-delete-project="${project.id}">${t('Delete')}</button>
              </span>
            </div>
          </article>`;
      }).join('')
    : `<div class="recent-empty">${t('No matching projects')}</div>`;

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
    toast('Please enter a project name.');
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
  toast('Project created. Start entering location details.');
});

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
  toast('Assessment ratings and readiness checks reset.');
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
    if (id === 'locType') {
      updateDecisionGuide();
      const nv = normalizeVenue($('locType')?.value);
      if ($('roiVenue')) $('roiVenue').value = nv;
      if ($('propVenue')) $('propVenue').value = nv;
    }
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
    if (id === 'locType') {
      updateDecisionGuide();
      const nv = normalizeVenue($('locType')?.value);
      if ($('roiVenue')) $('roiVenue').value = nv;
      if ($('propVenue')) $('propVenue').value = nv;
    }
  });
});

bindROIInputs(result => {
  const project = currentProject();
  if (project) {
    project.roi = { ...readROIForm(), result };
    if (result.location && (!project.name || project.name === 'Untitled Location Project' || project.name === '未命名点位项目')) {
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
  toast('Partner earnings assumptions restored to example values.');
});
$('roiToProposal')?.addEventListener('click', () => {
  const roi = readROIForm();
  const scoreData = readScoreForm();
  if (scoreData.city && $('propCity')) $('propCity').value = scoreData.city;
  applyROIToProposal(roi);
  refreshProposalPreview();
  setPage('proposal');
});

bindProposalInputs(updateProposalAutoSave);
$('saveProposal')?.addEventListener('click', saveProposal);
$('exportProposal')?.addEventListener('click', () => {
  if (!$('propProperty')?.value.trim()) {
    toast('Please enter the property or location name before exporting.');
    $('propProperty')?.focus();
    return;
  }
  exportProposalHTML(calculateROI(readROIForm()), calculateScore(scoreValues, readinessValues), store.docs);
  saveProposal();
  toast('Standalone proposal HTML exported.');
});
$('printProposal')?.addEventListener('click', () => {
  refreshProposalPreview();
  window.print();
});
$('loadProposalExample')?.addEventListener('click', () => {
  const d = PROPOSAL_DEFAULTS[getLanguage() === 'zh' ? 'zh' : 'en'];
  applyProposalForm({
    title: d.title,
    property: 'Sunrise Apartments',
    city: 'Tampa, FL',
    operator: 'HAHA Vending Operator LLC',
    contactName: 'Alex Carter',
    contactEmail: 'alex@hahavending-operator.com',
    contactPhone: '(813) 555-0192',
    venue: 'Apartment & Residential',
    machines: [{ id: 'm_1', model: 'Pro 542', quantity: 1 }],
    deal: 'revenueShare',
    share: 10,
    launch: d.launch,
    service: d.service,
    warranty: d.warranty,
    confirmItems: d.confirmItems,
    notes: d.notes
  });
  updateProposalAutoSave();
  toast('Example proposal loaded. Replace with actual property details.');
});
$('syncFromRoi')?.addEventListener('click', () => {
  const roi = calculateROI(readROIForm());
  applyROIToProposal(roi);
  updateProposalAutoSave();
  toast('Synced site partner earnings data to proposal.');
});

setComplianceChangeHandler((docs, deletedId = null) => {
  store.docs = docs;
  if (deletedId) {
    removeDeletedDocFromSelection(deletedId);
    const proj = currentProject();
    if (proj?.proposal?.selectedDocs) {
      proj.proposal.selectedDocs = proj.proposal.selectedDocs.filter(id => id !== deletedId);
    }
  }
  persist();
  renderCompliance(store.docs);
  renderDocCheckboxes(store.docs);
  refreshProposalPreview();
  if (!deletedId) toast('Document link saved locally.');
}, toast);
bindComplianceAddButton(store.docs);
renderCompliance(store.docs);
renderDocCheckboxes(store.docs);

onLanguageChange(() => {
  const names = {
    dashboard: 'Dashboard',
    scorer: 'Location Assessment',
    roi: 'Site Partner Earnings',
    proposal: 'Business Proposal',
    compliance: 'Compliance Documents',
    projects: 'My Projects'
  };
  if ($('breadcrumbCurrent')) $('breadcrumbCurrent').textContent = t(names[currentPage] || 'Dashboard');
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

function initialize() {
  const project = currentProject();
  if (project) {
    if (project.score || project.scoreDraft) applyScoreForm(project.score || project.scoreDraft);
    else applyScoreForm({ name: project.name, city: project.city });
    if (project.roi) applyROIForm(project.roi);
    else applyROIForm({ location: project.name, venue: (project.score || project.scoreDraft)?.type || 'Apartment & Residential' });
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
