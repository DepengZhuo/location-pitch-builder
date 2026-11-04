/* =========================================================
   合规文件中心：文件信息与 Google Drive 链接保存在本地
   本地上传仅做当前浏览器会话预览；正式长期文件建议用受控云盘。
   ========================================================= */
import { DEFAULT_DOCS, escapeHTML, safeURL } from './data.js';

const temporaryFiles = new Map();
let onChangeCallback = () => {};

export function setComplianceChangeHandler(callback) { onChangeCallback = callback; }
export function normalizeDocs(docs = []) {
  const byId = new Map(docs.map(doc => [doc.id, doc]));
  const standard = DEFAULT_DOCS.map(base => ({ ...base, ...(byId.get(base.id) || {}) }));
  const custom = docs.filter(doc => !DEFAULT_DOCS.some(base => base.id === doc.id));
  return [...standard, ...custom];
}

export function renderCompliance(docs) {
  const list = normalizeDocs(docs);
  const readyCount = list.filter(d => Boolean(d.downloadPath || safeURL(d.url))).length;
  document.getElementById('complianceCount').textContent = `${readyCount} / ${list.length}`;
  document.getElementById('complianceProgressBar').style.width = `${readyCount / list.length * 100}%`;
  document.getElementById('complianceGrid').innerHTML = list.map(doc => {
    const temp = temporaryFiles.get(doc.id);
    const safeLink = safeURL(doc.url) || doc.downloadPath;
    const ready = Boolean(safeLink);
    const status = ready ? '已配置链接' : temp ? '临时附件' : '待补充';
    const statusClass = ready ? 'linked' : temp ? 'ready' : '';
    return `<article class="document-card" data-doc="${doc.id}">
      <div class="doc-top"><div class="doc-icon">▤</div><span class="doc-status ${statusClass}">${status}</span></div>
      <h3>${escapeHTML(doc.title)}</h3><p>${escapeHTML(doc.desc)}</p>
      <div class="doc-meta">${escapeHTML(doc.category)} · ${escapeHTML(doc.note || '待补充')}</div>
      ${ready ? `<div class="doc-meta">${doc.downloadPath ? '仓库认证文件' : `链接：${escapeHTML(doc.url.length > 42 ? doc.url.slice(0,39)+'…' : doc.url)}`}</div>` : temp ? `<div class="doc-meta">本次会话：${escapeHTML(temp.name)}</div>` : ''}
      <div class="doc-actions"><button data-action="link" data-id="${doc.id}">${doc.url ? '修改链接' : '添加 Drive 链接'}</button><button data-action="upload" data-id="${doc.id}">本地预览</button>${temp ? `<button data-action="temp" data-id="${doc.id}">查看附件 ↗</button>` : ''}</div>
      ${ready ? `<a class="doc-download" href="${escapeHTML(safeLink)}" download>${doc.downloadPath ? '下载认证资料 ↓' : '打开 / 下载资料 ↗'}</a>` : '<button class="doc-download" disabled>下载资料（待补充）</button>'}
    </article>`;
  }).join('');
  document.querySelectorAll('[data-action="link"]').forEach(button => button.addEventListener('click', () => editLink(button.dataset.id, docs)));
  document.querySelectorAll('[data-action="upload"]').forEach(button => button.addEventListener('click', () => chooseFile(button.dataset.id)));
  document.querySelectorAll('[data-action="open"]').forEach(button => button.addEventListener('click', () => openDoc(button.dataset.id, docs)));
  document.querySelectorAll('[data-action="temp"]').forEach(button => button.addEventListener('click', () => { const item = temporaryFiles.get(button.dataset.id); if (item?.url) window.open(item.url, '_blank', 'noopener,noreferrer'); }));
}

function editLink(id, docs) {
  const doc = docs.find(item => item.id === id);
  if (!doc) return;
  const input = window.prompt(`请粘贴「${doc.title}」的 Google Drive / HTTPS 文件链接。\n请确认链接的访问权限已正确设置。`, doc.url || '');
  if (input === null) return;
  const trimmed = input.trim();
  if (trimmed && !safeURL(trimmed)) { window.alert('链接格式不正确，请使用 https:// 或 http:// 开头的完整链接。'); return; }
  doc.url = trimmed;
  doc.filename = trimmed ? (doc.filename || '云端文件链接') : '';
  onChangeCallback(docs);
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
    renderComplianceFromLast(docsCache);
    window.alert(`已加载 ${file.name}，仅用于当前浏览器会话预览。\n需要长期访问时，请将文件上传至权限受控的 Google Drive，再填写 Drive 链接。`);
  };
  input.click();
}

let docsCache = DEFAULT_DOCS;
function renderComplianceFromLast(docs) { renderCompliance(docs || DEFAULT_DOCS); }

function openDoc(id, docs) {
  const doc = docs.find(item => item.id === id);
  const url = safeURL(doc?.url || '');
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

export function bindComplianceAddButton(docs) {
  docsCache = docs;
  document.getElementById('addComplianceLink').addEventListener('click', () => {
    const title = window.prompt('文件名称（例如：设备规格表 / 保险附加被保险人证明）');
    if (!title?.trim()) return;
    const url = window.prompt('粘贴文件链接（HTTPS / Google Drive）');
    if (url === null) return;
    if (url.trim() && !safeURL(url.trim())) { window.alert('链接格式不正确。'); return; }
    docs.push({ id:`custom_${Date.now()}`, title:title.trim(), desc:'自定义补充资料，请核对文件内容及有效期。', category:'补充文件', filename:url.trim() ? '云端文件链接' : '', url:url.trim(), note:'自定义资料' });
    onChangeCallback(docs);
  });
}
