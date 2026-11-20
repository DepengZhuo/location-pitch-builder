/* ==================================================
   Compliance Documents Module:
   - 4 Fixed HAHA Certifications (read-only, direct PDF download)
   - Operator Custom Documents (Add, Edit Link, Open / Download, Delete)
   - Preserves existing LocalStorage custom links while filtering legacy defaults
   ================================================== */
import { DEFAULT_DOCS, LEGACY_DEFAULT_DOC_IDS, escapeHTML, safeURL } from './data.js';
import { t } from './i18n.js';

const FIXED_DOC_IDS = new Set(DEFAULT_DOCS.map(d => d.id));
const GH_PAGES_BASE = 'https://depengzhuo.github.io/location-pitch-builder/';
const GH_RAW_BASE = 'https://raw.githubusercontent.com/DepengZhuo/location-pitch-builder/main/';

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
  const fixed = DEFAULT_DOCS.map(base => ({ ...base }));
  const custom = safeList
    .filter(doc => doc && doc.id && !FIXED_DOC_IDS.has(doc.id) && !LEGACY_DEFAULT_DOC_IDS.has(doc.id))
    .map(doc => {
      const cleaned = { ...doc };
      delete cleaned.docStatus;
      return cleaned;
    });
  return [...fixed, ...custom];
}

export function resolveDocHref(doc) {
  if (!doc) return '';
  if (doc.url && safeURL(doc.url)) return doc.url;
  if (doc.downloadPath) {
    if (/^https?:\/\//i.test(doc.downloadPath)) return doc.downloadPath;
    return doc.downloadPath;
  }
  return '';
}

export function resolveExportDocHref(doc) {
  if (!doc) return '';
  if (doc.url && safeURL(doc.url)) return doc.url;
  if (doc.downloadPath) {
    if (/^https?:\/\//i.test(doc.downloadPath)) return doc.downloadPath;
    const rel = doc.downloadPath.replace(/^\.\//, '');
    return GH_PAGES_BASE + encodeURI(rel);
  }
  return '';
}

export function renderCompliance(docs = docsCache) {
  docsCache = normalizeDocs(docs);

  const gridEl = document.getElementById('complianceGrid');
  if (!gridEl) return;

  gridEl.innerHTML = docsCache.map(doc => {
    const isFixed = Boolean(doc.isFixed || FIXED_DOC_IDS.has(doc.id));

    if (isFixed) {
      const href = encodeURI(doc.downloadPath || '');
      const logoSrc = encodeURI(doc.logoPath || '');
      const rawFallbackLogo = doc.logoPath
        ? GH_RAW_BASE + encodeURI(doc.logoPath.replace(/^\.\//, ''))
        : '';
      return `<article class="document-card" data-doc="${escapeHTML(doc.id)}">
        <div class="doc-top">
          ${logoSrc ? `<img class="doc-cert-logo" src="${escapeHTML(logoSrc)}" data-fallback="${escapeHTML(rawFallbackLogo)}" alt="${escapeHTML(t(doc.title))}" />` : '<div class="doc-icon">▤</div>'}
        </div>
        <h3>${escapeHTML(t(doc.title))}</h3>
        <p>${escapeHTML(t(doc.desc))}</p>
        <div class="doc-meta">${escapeHTML(t(doc.category))}</div>
        <a class="doc-download" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" download="${escapeHTML(doc.filename || '')}">${t('Download')} ↓</a>
      </article>`;
    }

    const safeLink = safeURL(doc.url) || '';
    return `<article class="document-card" data-doc="${escapeHTML(doc.id)}">
      <div class="doc-top"><div class="doc-icon">▤</div></div>
      <h3>${escapeHTML(doc.title)}</h3>
      <div class="doc-meta">${escapeHTML(t(doc.category || 'Supplemental Document'))}</div>
      <div class="doc-actions">
        <button type="button" data-action="link" data-id="${escapeHTML(doc.id)}">${t('Edit Link')}</button>
        <button type="button" class="doc-delete-btn" data-action="delete" data-id="${escapeHTML(doc.id)}">${t('Delete')}</button>
      </div>
      ${safeLink
        ? `<a class="doc-download" href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer">${t('Open / Download')} ↗</a>`
        : `<button type="button" class="doc-download" disabled>${t('Open / Download')}</button>`}
    </article>`;
  }).join('');

  gridEl.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback && img.src !== img.dataset.fallback) {
        img.src = img.dataset.fallback;
      }
    }, { once: true });
  });

  gridEl.querySelectorAll('[data-action="link"]').forEach(button => {
    button.addEventListener('click', () => openComplianceModal(button.dataset.id));
  });

  gridEl.querySelectorAll('[data-action="delete"]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      if (FIXED_DOC_IDS.has(id)) return;
      docsCache = docsCache.filter(item => item.id !== id);
      onChangeCallback(docsCache, id);
      onToastCallback(t('Custom document deleted.'));
    });
  });
}

function openComplianceModal(docId = null) {
  if (docId && FIXED_DOC_IDS.has(docId)) return;
  editingDocId = docId;
  const modal = document.getElementById('complianceModal');
  const titleEl = document.getElementById('complianceModalTitle');
  const titleField = document.getElementById('complianceTitleField');
  const titleInput = document.getElementById('complianceDocTitle');
  const urlInput = document.getElementById('complianceDocUrl');
  if (!modal || !titleInput || !urlInput) return;

  if (titleField) titleField.hidden = false;

  if (docId) {
    const doc = docsCache.find(item => item.id === docId);
    if (!doc) return;
    if (titleEl) titleEl.textContent = `${t('Edit Link')} · ${doc.title}`;
    titleInput.value = doc.title || '';
    urlInput.value = doc.url || '';
  } else {
    if (titleEl) titleEl.textContent = t('Add File Link');
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
  const title = titleInput?.value.trim() || '';
  const rawUrl = urlInput?.value.trim() || '';

  if (!title) {
    onToastCallback(t('Please enter a document title first.'));
    titleInput?.focus();
    return;
  }
  if (!rawUrl || !safeURL(rawUrl)) {
    onToastCallback(t('Please enter a valid HTTPS or Google Drive link.'));
    urlInput?.focus();
    return;
  }

  if (editingDocId) {
    const doc = docsCache.find(item => item.id === editingDocId);
    if (doc && !FIXED_DOC_IDS.has(doc.id)) {
      doc.title = title;
      doc.url = rawUrl;
      onChangeCallback(docsCache);
    }
  } else {
    docsCache.push({
      id: `custom_${Date.now()}`,
      title,
      category: 'Supplemental Document',
      url: rawUrl,
      isFixed: false
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
