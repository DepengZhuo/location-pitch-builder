/* ==================================================
   Compliance Documents Module:
   - Standard 7 documents are permanent (cannot be deleted)
   - User-added custom documents support Delete
   - Supports 4 document statuses for accurate Print/PDF verification checklists:
     1. 'attached' (Included / Link Ready)
     2. 'on_request' (Available Upon Request)
     3. 'pending' (In Progress / Pending Verification)
     4. 'not_applicable' (Not Applicable / Per Site Requirement)
   ================================================== */
import { DEFAULT_DOCS, escapeHTML, safeURL } from './data.js';
import { t } from './i18n.js';

const DEFAULT_DOC_IDS = new Set(DEFAULT_DOCS.map(d => d.id));
export const DOC_STATUS_OPTIONS = [
  { value: 'attached', label: 'Included / Link Ready', printLabel: 'Included with proposal / Link ready' },
  { value: 'on_request', label: 'Available Upon Request', printLabel: 'Verified & available upon request' },
  { value: 'pending', label: 'Pending / In Progress', printLabel: 'Pending site-specific verification' },
  { value: 'not_applicable', label: 'Not Applicable', printLabel: 'Not applicable for this site' }
];

let onChangeCallback = () => {};
let onToastCallback = () => {};
let docsCache = [...DEFAULT_DOCS];
let editingDocId = null;

export function setComplianceChangeHandler(callback, toastFn) {
  onChangeCallback = callback;
  if (toastFn) onToastCallback = toastFn;
}

export function normalizeDocs(docs = []) {
  const safeList = Array.isArray(docs) ? docs : [];
  const byId = new Map(safeList.map(doc => [doc.id, doc]));
  const standard = DEFAULT_DOCS.map(base => {
    const saved = byId.get(base.id) || {};
    const url = saved.url || base.url || '';
    const hasLink = Boolean(safeURL(url) || base.downloadPath);
    const defaultStatus = hasLink ? 'attached' : 'on_request';
    return {
      ...base,
      url,
      filename: saved.filename || base.filename || '',
      docStatus: saved.docStatus || (hasLink ? 'attached' : defaultStatus)
    };
  });
  const custom = safeList
    .filter(doc => doc && doc.id && !DEFAULT_DOC_IDS.has(doc.id))
    .map(doc => {
      const hasLink = Boolean(safeURL(doc.url) || doc.downloadPath);
      return {
        ...doc,
        docStatus: doc.docStatus || (hasLink ? 'attached' : 'on_request')
      };
    });
  return [...standard, ...custom];
}

export function renderCompliance(docs = docsCache) {
  docsCache = normalizeDocs(docs);

  const gridEl = document.getElementById('complianceGrid');
  if (!gridEl) return;

  gridEl.innerHTML = docsCache.map(doc => {
    const safeLink = safeURL(doc.url) || doc.downloadPath;
    const ready = Boolean(safeLink);
    const status = ready ? t('Link Configured') : t('To Be Provided');
    const statusClass = ready ? 'linked' : '';
    const isCustom = !DEFAULT_DOC_IDS.has(doc.id);
    const curDocStatus = doc.docStatus || (ready ? 'attached' : 'on_request');
    return `<article class="document-card" data-doc="${escapeHTML(doc.id)}">
      <div class="doc-top"><div class="doc-icon">▤</div><span class="doc-status ${statusClass}">${status}</span></div>
      <h3>${escapeHTML(t(doc.title))}</h3><p>${escapeHTML(t(doc.desc))}</p>
      <div class="doc-meta">${escapeHTML(t(doc.category))} · ${escapeHTML(t(doc.note || 'To Be Provided'))}</div>
      ${ready ? `<div class="doc-meta">${doc.downloadPath && !doc.url ? t('Repository Certificate File') : t(`Link: ${escapeHTML(doc.url.length > 42 ? doc.url.slice(0, 39) + '...' : doc.url)}`)}</div>` : ''}
      <label class="field doc-status-field">
        <span>${t('Print / Review Status')}</span>
        <select class="doc-status-select" data-doc-status="${escapeHTML(doc.id)}">
          ${DOC_STATUS_OPTIONS.map(opt => `<option value="${opt.value}" ${curDocStatus === opt.value ? 'selected' : ''}>${t(opt.label)}</option>`).join('')}
        </select>
      </label>
      <div class="doc-actions">
        <button type="button" data-action="link" data-id="${escapeHTML(doc.id)}">${doc.url ? t('Edit Link') : t('Add Drive Link')}</button>
        ${isCustom ? `<button type="button" class="doc-delete-btn" data-action="delete" data-id="${escapeHTML(doc.id)}">${t('Delete')}</button>` : ''}
      </div>
      ${ready ? `<a class="doc-download" href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer" download>${doc.downloadPath && !doc.url ? t('Download Certificate ↓') : t('Open / Download File ↗')}</a>` : `<button type="button" class="doc-download" disabled>${t('Link Not Configured')}</button>`}
    </article>`;
  }).join('');

  gridEl.querySelectorAll('[data-action="link"]').forEach(button => {
    button.addEventListener('click', () => openComplianceModal(button.dataset.id));
  });

  gridEl.querySelectorAll('.doc-status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const target = docsCache.find(item => item.id === sel.dataset.docStatus);
      if (target) {
        target.docStatus = sel.value;
        onChangeCallback(docsCache);
      }
    });
  });

  gridEl.querySelectorAll('[data-action="delete"]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      if (DEFAULT_DOC_IDS.has(id)) return;
      docsCache = docsCache.filter(item => item.id !== id);
      onChangeCallback(docsCache, id);
      onToastCallback(t('Custom document deleted.'));
    });
  });
}

function openComplianceModal(docId = null) {
  editingDocId = docId;
  const modal = document.getElementById('complianceModal');
  const titleEl = document.getElementById('complianceModalTitle');
  const titleField = document.getElementById('complianceTitleField');
  const titleInput = document.getElementById('complianceDocTitle');
  const urlInput = document.getElementById('complianceDocUrl');
  if (!modal || !titleInput || !urlInput) return;

  if (docId) {
    const doc = docsCache.find(item => item.id === docId);
    if (!doc) return;
    if (titleEl) titleEl.textContent = `${t('Edit Link')} · ${t(doc.title)}`;
    if (titleField) titleField.hidden = true;
    titleInput.value = doc.title;
    urlInput.value = doc.url || '';
  } else {
    if (titleEl) titleEl.textContent = t('Add File Link');
    if (titleField) titleField.hidden = false;
    titleInput.value = '';
    urlInput.value = '';
  }
  modal.hidden = false;
  (docId ? urlInput : titleInput).focus();
}

function closeComplianceModal() {
  const modal = document.getElementById('complianceModal');
  if (modal) modal.hidden = true;
  editingDocId = null;
}

function saveComplianceModal() {
  const titleInput = document.getElementById('complianceDocTitle');
  const urlInput = document.getElementById('complianceDocUrl');
  const rawUrl = urlInput?.value.trim() || '';
  if (rawUrl && !safeURL(rawUrl)) {
    onToastCallback(t('Invalid URL format. Please enter a full URL starting with https:// or http://.'));
    urlInput?.focus();
    return;
  }

  if (editingDocId) {
    const doc = docsCache.find(item => item.id === editingDocId);
    if (doc) {
      doc.url = rawUrl;
      doc.filename = rawUrl ? (doc.filename || 'Cloud File Link') : '';
      if (rawUrl) doc.docStatus = 'attached';
      onChangeCallback(docsCache);
    }
  } else {
    const title = titleInput?.value.trim() || '';
    if (!title) {
      onToastCallback(t('Please enter a document title first.'));
      titleInput?.focus();
      return;
    }
    docsCache.push({
      id: `custom_${Date.now()}`,
      title,
      desc: 'Custom supplemental document. Please verify content and validity.',
      category: 'Supplemental Document',
      filename: rawUrl ? 'Cloud File Link' : '',
      url: rawUrl,
      docStatus: rawUrl ? 'attached' : 'on_request',
      note: 'Custom document'
    });
    onChangeCallback(docsCache);
  }
  closeComplianceModal();
}

export function bindComplianceAddButton(docs) {
  docsCache = normalizeDocs(docs);
  document.getElementById('addComplianceLink')?.addEventListener('click', () => openComplianceModal(null));
  document.getElementById('closeComplianceModal')?.addEventListener('click', closeComplianceModal);
  document.getElementById('cancelComplianceModal')?.addEventListener('click', closeComplianceModal);
  document.getElementById('confirmComplianceModal')?.addEventListener('click', saveComplianceModal);
  document.getElementById('complianceModal')?.addEventListener('click', event => {
    if (event.target === document.getElementById('complianceModal')) closeComplianceModal();
  });
}
