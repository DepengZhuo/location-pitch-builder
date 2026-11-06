/* =========================================================
   数据定义：5项点位条件评估、4项部署准备度、合规文件与格式化工具
   ========================================================= */
export const SCORE_CRITERIA = [
  {
    id: 'traffic',
    num: '01',
    name: '人流量与稳定性',
    short: '人流量',
    kicker: '这里平时人流稳定吗？',
    question: '观察日常全天的繁忙程度，而不仅是最高峰的那一小时。',
    weight: 25,
    hints: [
      '强：全天人流活动稳定',
      '一般：仅在特定时段繁忙',
      '弱：日常人流活动有限'
    ],
    action: '建议在高峰和平峰时段分别实地观察，核实全天真实人流的稳定性。'
  },
  {
    id: 'customers',
    num: '02',
    name: '目标客群匹配度',
    short: '客群匹配',
    kicker: '来往的是目标客群吗？',
    question: '考虑人群在此停留的时间，以及使用便捷零食或饮料柜的可能性。',
    weight: 25,
    hints: [
      '强：住户、员工、学生或住客',
      '一般：有一定潜在购买人群',
      '弱：以匆忙路过的访客为主'
    ],
    action: '明确哪些人群最可能高频使用设备，以及他们产生即时消费需求的时间段。'
  },
  {
    id: 'need',
    num: '03',
    name: '消费需求与便利性',
    short: '消费需求',
    kicker: '周边买东西方便吗？',
    question: '观察附近的便利店、咖啡馆和餐饮选择，是否存在未被满足的即时便利需求？',
    weight: 20,
    hints: [
      '强：周边几乎没有便利替代选项',
      '一般：有替代选项但营业或距离受限',
      '弱：现有消费需求已被充分满足'
    ],
    action: '核查周边便利店和餐饮的营业时间与距离，找出场地内难以即时买到的高频商品。'
  },
  {
    id: 'placement',
    num: '04',
    name: '摆放位置可见度与动线',
    short: '位置可见度',
    kicker: '大家容易看到和走到吗？',
    question: '考虑在人群进出该场地的日常必经动线上，是否有显眼、方便停留的位置。',
    weight: 15,
    hints: [
      '强：显眼的公共区域或主通道',
      '一般：位置可用，但偏离主动线',
      '弱：位置隐蔽或难以到达'
    ],
    action: '沿用户日常进出动线走一遍，确认一个显眼、驻足方便且不影响通行的具体点位。'
  },
  {
    id: 'operations',
    num: '05',
    name: '运营与补货可行性',
    short: '运营可行性',
    kicker: '日常运营省心吗？',
    question: '综合考虑摆放空间、电源插座、网络信号，以及日常补货和设备维护的便利程度。',
    weight: 15,
    hints: [
      '强：空间、电源与补货都很顺畅',
      '一般：有少数条件需进一步核实',
      '弱：存在明显的进场或安装障碍'
    ],
    action: '现场确认安装空间尺寸、独立电源插座、4G/网络信号强度以及补货推车进出路线。'
  }
];

export const SCORE_FACTORS = SCORE_CRITERIA;

export const READINESS_ITEMS = [
  {
    id: 'approval',
    label: '物业审批许可',
    help: '物业方是否已批准投放智能零售柜？'
  },
  {
    id: 'spacePower',
    label: '空间与电源条件',
    help: '现场是否有足够摆放空间和合适的电源插座？'
  },
  {
    id: 'restockAccess',
    label: '补货与维保通行',
    help: '运营人员是否方便进出场地进行补货与维护？'
  },
  {
    id: 'contactTerms',
    label: '物业对接人与合作条款',
    help: '是否已明确关键决策人及基本合作条件？'
  }
];

export const DEFAULT_SCORE = Object.fromEntries(SCORE_CRITERIA.map(c => [c.id, '']));
export const DEFAULT_READINESS = Object.fromEntries(READINESS_ITEMS.map(r => [r.id, 'pending']));

export const DEFAULT_DOCS = [
  { id: 'nama', title: 'NAMA 认证资料', short: 'NAMA Certification', category: '行业认证', desc: '仓库当前提供的 NAMA 认证文件。分享前请确认文件适用范围及接收对象。', filename: 'NAMA.pdf', url: '', downloadPath: './assets/certificates/NAMA.pdf', note: '仅用于 NAMA 认证资料' },
  { id: 'ul-etl', title: 'UL / ETL 电气安全资料', short: '设备电气安全', category: '设备认证', desc: '用于说明设备电气安全测试或认证情况。请上传适用于对应机器型号的真实证书。', filename: '', url: '', note: '按机器型号核对证书范围' },
  { id: 'nsf', title: 'NSF 食品卫生资料', short: '食品接触 / 卫生', category: '食品安全', desc: '用于回应物业对食品接触材料、卫生或相关标准的审查要求。', filename: '', url: '', note: '确认具体标准及适用范围' },
  { id: 'fcc', title: 'FCC 无线电合规资料', short: '无线通信合规', category: '设备认证', desc: '用于说明设备内无线通信模块或相关电子设备的 FCC 合规信息。', filename: '', url: '', note: '核对模块、型号及申报主体' },
  { id: 'ada', title: 'ADA 无障碍合规说明', short: '无障碍适用性', category: '场地合规', desc: '用于说明设备布置和使用流程对无障碍要求的考虑。不是默认存在的“ADA 认证”。', filename: '', url: '', note: '需结合安装环境和适用法规审查' },
  { id: 'coi', title: '责任保险证明 (COI)', short: '保险证明', category: '保险文件', desc: '运营商向物业提供的保险凭证。领导需求中提到 $2M 责任险，实际额度以保单为准。', filename: '', url: '', note: '检查被保险人、保额、有效期及附加被保险人要求' },
  { id: 'w9', title: 'W-9 税务表格', short: '税务资料', category: '税务文件', desc: '物业可能要求运营商提供的税务信息表。该文件可能包含敏感税务识别信息。', filename: '', url: '', note: '建议仅通过授权受控渠道分享' }
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
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};
