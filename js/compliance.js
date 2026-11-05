/* ==================================================
   合规文件中心：文件信息与 Google Drive 链接保存在本地
   使用页面内弹窗替代 window.prompt/alert，避免被浏览器或沙盒拦截。
   ================================================== */
import { DEFAULT_DOCS, escapeHTML, safeURL } from './data.js';
import { t } from './i18n.js';

const temporaryFiles = new Map();
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
  const standard = DEFAULT_DOCS.map(base => ({ ...base, ...(byId.get(base.id) || {}) }));
  const custom = docs.filter(doc => !DEFAULT_DOCS.some(base => base.id === doc.id));
  return [...standard, ...custom];
}

export function renderCompliance(docs = docsCache) {
  docsCache = docs;
  const list = normalizeDocs(docs);
  const readyCount = list.filter(d => Boolean(d.downloadPath || safeURL(d.url))).length;
  const countEl = document.getElementById('complianceCount');
  if (countEl) countEl.textContent = `${readyCount} / ${list.length}`;
  const barEl = document.getElementById('complianceProgressBar');
  if (barEl) barEl.style.width = `${(readyCount / list.length) * 100}%`;

  const gridEl = document.getElementById('complianceGrid');
  if (!gridEl) return;

  gridEl.innerHTML = list.map(doc => {
    const temp = temporaryFiles.get(doc.id);
    const safeLink = safeURL(doc.url) || doc.downloadPath;
    const ready = Boolean(safeLink);
    const status = ready ? t('已配置链接') : temp ? t('临时附件') : t('待补充');
    const statusClass = ready ? 'linked' : temp ? 'ready' : '';
    return `<article class="document-card" data-doc="${doc.id}">
      <div class="doc-top"><div class="doc-icon">▤</div><span class="doc-status ${statusClass}">${status}</span></div>
      <h3>${escapeHTML(t(doc.title))}</h3><p>${escapeHTML(t(doc.desc))}</p>
      <div class="doc-meta">${escapeHTML(t(doc.category))} · ${escapeHTML(t(doc.note || '待补充'))}</div>
      ${ready ? `<div class="doc-meta">${doc.downloadPath ? t('仓库认证文件') : t(`链接：${escapeHTML(doc.url.length > 42 ? doc.url.slice(0, 39) + '...' : doc.url)}`)}</div>` : temp ? `<div class="doc-meta">${t(`本次会话：${escapeHTML(temp.name)}`)}</div>` : ''}
      <div class="doc-actions">
        <button type="button" data-action="link" data-id="${doc.id}">${doc.url ? t('修改链接') : t('添加 Drive 链接')}</button>
        <button type="button" data-action="upload" data-id="${doc.id}">${t('本地预览')}</button>
        ${temp ? `<button type="button" data-action="temp" data-id="${doc.id}">${t('查看附件 ↗')}</button>` : ''}
      </div>
      ${ready ? `<a class="doc-download" href="${escapeHTML(safeLink)}" target="_blank" rel="noopener noreferrer" download>${doc.downloadPath ? t('下载认证资料 ↓') : t('打开 / 下载资料 ↗')}</a>` : `<button type="button" class="doc-download" disabled>${t('下载资料 (待补充)')}</button>`}
    </article>`;
  }).join('');

  gridEl.querySelectorAll('[data-action="link"]').forEach(button => {
    button.addEventListener('click', () => openComplianceModal(button.dataset.id));
  });
  gridEl.querySelectorAll('[data-action="upload"]').forEach(button => {
    button.addEventListener('click', () => chooseFile(button.dataset.id));
  });
  gridEl.querySelectorAll('[data-action="temp"]').forEach(button => {
    button.addEventListener('click', () => {
      const item = temporaryFiles.get(button.dataset.id);
      if (item?.url) window.open(item.url, '_blank', 'noopener,noreferrer');
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
    if (titleEl) titleEl.textContent = `${t('修改链接')} · ${t(doc.title)}`;
    if (titleField) titleField.hidden = true;
    titleInput.value = doc.title;
    urlInput.value = doc.url || '';
  } else {
    if (titleEl) titleEl.textContent = t('添加文件链接');
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
    onToastCallback(t('链接格式不正确，请使用 https:// 或 http:// 开头的完整链接。'));
    urlInput?.focus();
    return;
  }

  if (editingDocId) {
    const doc = docsCache.find(item => item.id === editingDocId);
    if (doc) {
      doc.url = rawUrl;
      doc.filename = rawUrl ? (doc.filename || '云端文件链接') : '';
      onChangeCallback(docsCache);
    }
  } else {
    const title = titleInput?.value.trim() || '';
    if (!title) {
      onToastCallback(t('请填写点位名称。'));
      titleInput?.focus();
      return;
    }
    docsCache.push({
      id: `custom_${Date.now()}`,
      title,
      desc: '自定义补充资料，请核对文件内容及有效期。',
      category: '补充文件',
      filename: rawUrl ? '云端文件链接' : '',
      url: rawUrl,
      note: '自定义资料'
    });
    onChangeCallback(docsCache);
  }
  closeComplianceModal();
}

function chooseFile(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.png,.jpg,.jpeg,.webp';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const previous = temporaryFiles.get(id);
    if (previous?.url) URL.revokeObjectURL(previous.url);
    const fileURL = URL.createObjectURL(file);
    temporaryFiles.set(id, { name: file.name, url: fileURL, type: file.type });
    renderCompliance(docsCache);
    onToastCallback(`${file.name} ${t('本地预览')}`);
  };
  input.click();
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
