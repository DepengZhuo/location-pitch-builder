/* =========================================================
   数据定义：默认评分维度、合规文件类型、格式化工具
   如需修改评分权重或文件分类，优先从本文件开始。
   ========================================================= */
export const SCORE_FACTORS = [
  { id: 'traffic', name: '人流量与可见度', help: '人流是否稳定，机器是否容易被看到', weight: 25 },
  { id: 'venueFit', name: '场地类型匹配度', help: '场地是否适合无人零售柜长期运营', weight: 20 },
  { id: 'audience', name: '目标人群匹配度', help: '住户、员工、访客是否有即时消费需求', weight: 15 },
  { id: 'convenience', name: '消费便利性', help: '营业时间、进出便利、摆放位置是否合理', weight: 15 },
  { id: 'competition', name: '周边竞争情况', help: '附近是否有便利店、自动售货机等替代选择', weight: 10 },
  { id: 'term', name: '合作期限与稳定性', help: '租期、物业稳定性及续约可能性', weight: 10 },
  { id: 'decision', name: '决策人可触达性', help: '是否找到物业经理或实际决策人', weight: 5 }
];

export const DEFAULT_SCORE = Object.fromEntries(SCORE_FACTORS.map(f => [f.id, 3]));

export const DEFAULT_DOCS = [
  { id: 'nama', title: 'NAMA 认证资料', short: 'NAMA Certification', category: '行业认证', desc: '仓库当前提供的 NAMA 认证文件。分享前请确认文件适用范围及接收对象。', filename: 'NAMA.pdf', url: '', downloadPath: './assets/certificates/NAMA.pdf', note: '仅用于 NAMA 认证资料' },
  { id: 'ul-etl', title: 'UL / ETL 电气安全资料', short: '设备电气安全', category: '设备认证', desc: '用于说明设备电气安全测试或认证情况。请上传适用于对应机器型号的真实证书。', filename: '', url: '', note: '按机器型号核对证书范围' },
  { id: 'nsf', title: 'NSF 食品卫生资料', short: '食品接触 / 卫生', category: '食品安全', desc: '用于回应物业对食品接触材料、卫生或相关标准的审查要求。', filename: '', url: '', note: '确认具体标准及适用范围' },
  { id: 'fcc', title: 'FCC 无线电合规资料', short: '无线通信合规', category: '设备认证', desc: '用于说明设备内无线通信模块或相关电子设备的 FCC 合规信息。', filename: '', url: '', note: '核对模块、型号及申报主体' },
  { id: 'ada', title: 'ADA 无障碍合规说明', short: '无障碍适用性', category: '场地合规', desc: '用于说明设备布置和使用流程对无障碍要求的考虑。不是默认存在的“ADA 认证”。', filename: '', url: '', note: '需结合安装环境和适用法规审查' },
  { id: 'coi', title: '责任保险证明（COI）', short: '保险证明', category: '保险文件', desc: '运营商向物业提供的保险凭证。领导需求中提到 $2M 责任险，实际额度以保单为准。', filename: '', url: '', note: '检查被保险人、保额、有效期及附加被保险人要求' },
  { id: 'w9', title: 'W-9 税务表格', short: '税务资料', category: '税务文件', desc: '物业可能要求运营商提供的税务信息表。该文件可能包含敏感税务识别信息。', filename: '', url: '', note: '建议仅通过权限受控渠道分享' }
];

export const MACHINE_MODELS = {
  'Mini 360': { width: 22.83, depth: 26.57, height: 76.38 },
  'Plus 440': { width: 26.77, depth: 26.38, height: 76.38 },
  'Pro 542': { width: 29.53, depth: 25.59, height: 79.53 },
  'Freezer 550': { width: 27.56, depth: 33.07, height: 79.13 },
  'Max 620S': { width: 31.50, depth: 26.38, height: 85.43 },
  'Max 660': { width: 31.50, depth: 27.95, height: 79.53 },
  'Ultra 1200': { width: 53.94, depth: 27.56, height: 79.53 }
};

export const machineFootprint = model => {
  const dimensions = MACHINE_MODELS[model];
  if (!dimensions) return null;
  return { ...dimensions, squareFeet: dimensions.width * dimensions.depth / 144 };
};

export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const money2 = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
export const number = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(Number(value) || 0);
export const dateLabel = value => value ? new Date(value).toLocaleDateString('zh-CN') : '刚刚';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const safeURL = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
};
