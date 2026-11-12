/* ==================================================
   Compliance Documents Module: Link Management & Download
   ================================================== */
import { DEFAULT_DOCS, escapeHTML, safeURL } from './data.js';
import { t } from './i18n.js';

let onChangeCallback = () => {};
let onToastCallback = () => {};
let docsCache = DEFAULT_DOCS;
let editingDocId = null;

export function setComplianceChangeHandler(callback, toastFn) {
  onChangeCallback = callback;
  if (toastFn) onToastCallback = toastFn;
}

export function normalizeDocs(docs = []) {
  const byId = new Map(docs.map(doc => [doc.id, doc]));
  const standard = DEFAULT_DOCS.map(base => {
    const saved = byId.get(base.id) || {};
    return {
      ...base,
      url: saved.url || base.url || '',
      filename: saved.filename || base.filename || ''
    };
  });
  const custom = docs.filter(doc => !DEFAULT_DOCS.some(base => base.id === doc.id));
  return [...standard, ...custom];
}

export function renderCompliance(docs = docsCache) {
  docsCache = docs;
  const list = normalizeDocs(docs);

  const gridEl = document.getElementById('complianceGrid');
  if (!gridEl) return;

  gridEl.innerHTML = list.map(doc => {
    const safeLink = safeURL(doc.url) || doc.downloadPath;
    const ready = Boolean(safeLink);
    const status = ready ? t('Link Configured') : t('To Be Provided');
    const statusClass = ready ? 'linked' : '';
    return `<article class="document-card" data-doc="${doc.id}">
      <div class="doc-top"><div class="doc-icon">▤</div><span class="doc-status ${statusClass}">${status}</span></div>
      <h3>${escapeHTML(t(doc.title))}</h3><p>${escapeHTML(t(doc.desc))}</p>
      <div class="doc-meta">${escapeHTML(t(doc.category))} · ${escapeHTML(t(doc.note || 'To Be Provided'))}</div>
      ${ready ? `<div class="doc-meta">${doc.downloadPath && !doc.url ? t('Repository Certificate File') : t(`Link: ${escapeHTML(doc.url.length > 42 ? doc.url.slice(0, 39) + '...' : doc.url)}`)}</div>` : ''}
      <div class="doc-actions">
        <button type="button" data-action="link" data-id="${doc.id}">${doc.url ? t('Edit Link') : t('Add Drive Link')}</button>
      </div>
      ${ready ? `<a class="doc-download" href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer" download>${doc.downloadPath && !doc.url ? t('Download Certificate ↓') : t('Open / Download File ↗')}</a>` : `<button type="button" class="doc-download" disabled>${t('Link Not Configured')}</button>`}
    </article>`;
  }).join('');

  gridEl.querySelectorAll('[data-action="link"]').forEach(button => {
    button.addEventListener('click', () => openComplianceModal(button.dataset.id));
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
      onChangeCallback(docsCache);
    }
  } else {
    const title = titleInput?.value.trim() || '';
    if (!title) {
      onToastCallback(t('Please enter a location name first.'));
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
      note: 'Custom document'
    });
    onChangeCallback(docsCache);
  }
  closeComplianceModal();
}

export function bindComplianceAddButton(docs) {
  docsCache = docs;
  document.getElementById('addComplianceLink')?.addEventListener('click', () => openComplianceModal(null));
  document.getElementById('closeComplianceModal')?.addEventListener('click', closeComplianceModal);
  document.getElementById('cancelComplianceModal')?.addEventListener('click', closeComplianceModal);
  document.getElementById('confirmComplianceModal')?.addEventListener('click', saveComplianceModal);
  document.getElementById('complianceModal')?.addEventListener('click', event => {
    if (event.target === document.getElementById('complianceModal')) closeComplianceModal();
  });
}
