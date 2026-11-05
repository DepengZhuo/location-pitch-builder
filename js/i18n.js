/* =========================================================
   中英文切换模块（i18n）
   修复要点：
   1. 防止 MutationObserver 自触发递归与主线程锁死（isTranslating 互斥锁）
   2. 保护 <select> 的 option.value 不被英文翻译覆盖，确保评分/建议/同步逻辑正常
   3. 支持正反向词典与动态组件重渲染回调，切换中文/英文双向 100% 还原
   ========================================================= */
const translations = {
  '工作空间': 'Workspace',
  '工作台': 'Dashboard',
  '点位评估': 'Location Assessment',
  '点位收益测算': 'Site Partner Earnings',
  '点位方收益测算': 'Site Partner Earnings',
  'ROI 收益测算': 'Site Partner Earnings',
  '商业提案': 'Business Proposal',
  '商业提案生成': 'Business Proposal',
  '合规文件中心': 'Compliance Documents',
  '我的项目': 'My Projects',
  '本地工作模式': 'Local Workspace',
  '数据保存在当前浏览器': 'Data is saved in this browser',
  '本地自动保存': 'Saved locally',
  '+ 新建点位项目': '+ New Location Project',
  '+ 新建项目': '+ New Project',
  '+ 添加文件链接': '+ Add File Link',
  '新建点位项目': 'New Location Project',
  '开始一个新项目': 'Start a New Project',
  '把每一个点位，变成新的商业机会。': 'Turn every location into a new business opportunity.',
  '从点位评估、收益测算到商务提案与合规资料，一站式完成点位开发准备。': 'Prepare for location development with assessment, earnings estimates, proposals, and compliance files in one place.',
  '用清晰的数据和专业的材料，让物业更容易理解合作价值。': 'Present a clear business case with useful data and professional materials.',
  '产品效果图位置 · 后续替换为官方机器素材': 'Product image placeholder · Replace with official machine artwork',
  '项目概览': 'Project Overview',
  '当前浏览器中保存的点位开发项目': 'Location projects saved in this browser',
  '查看全部项目 →': 'View All Projects →',
  '查看全部项目': 'View All Projects',
  '最近项目': 'Recent Projects',
  '继续完善你正在开发的点位': 'Continue working on locations in progress',
  '全部项目 →': 'All Projects →',
  '全部项目': 'All Projects',
  '快速开始': 'Quick Start',
  '选择下一步要完成的工作': 'Choose what to work on next',
  '评估一个新点位': 'Assess a Location',
  '分析场地条件和经营潜力': 'Review site conditions and business potential',
  '测算合作收益': 'Estimate Partner Earnings',
  '计算物业分成和运营商收益': 'Estimate site partner and operator earnings',
  '生成商业提案': 'Create a Business Proposal',
  '为物业整理一份合作方案': 'Prepare a proposal for a property',
  '准备合规文件': 'Prepare Compliance Documents',
  '管理证书、保险和税务材料': 'Manage certificates, insurance, and tax documents',
  '使用提示：': 'Note: ',
  '本工具为第一版本本地原型。当前数据只保存在本浏览器，不会自动同步到其他设备；收益数据为测算结果，不构成销售或经营承诺。': 'This is an early local prototype. Data stays in this browser and is not synced to other devices. Earnings are estimates, not sales or operating guarantees.',
  '重置评分': 'Reset Scores',
  '保存评估': 'Save Assessment',
  '点位基本信息': 'Location Details',
  '根据已知情况填写，未知项可以暂时留空': 'Enter what you know; unknown fields can be left blank.',
  '点位名称': 'Location Name',
  '城市 / 州': 'City / State',
  '场地类型': 'Venue Type',
  '预估日均人流量': 'Estimated Daily Foot Traffic',
  '预计日均人流量': 'Estimated Daily Foot Traffic',
  '主要服务人群': 'Primary Audience',
  '租赁 / 合作期限（月）': 'Lease / Partnership Term (Months)',
  '租赁 / 合作期限 (月)': 'Lease / Partnership Term (Months)',
  '决策人 / 联系人': 'Decision Maker / Contact',
  '点位来源': 'Lead Source',
  '现场观察与备注': 'Site Observations and Notes',
  '建议联系对象': 'Recommended Contact',
  '选择场地类型后，这里会显示通常需要联系的关键决策人。': 'Choose a venue type to see the usual decision maker.',
  '点位质量评分': 'Location Quality Score',
  '每项选择 1-5 分：1 分较弱，5 分优秀': 'Rate each item from 1 to 5: 1 is weak, 5 is excellent.',
  '可按实际业务调整': 'Adjust to fit your operation',
  '评分模型为本工具的初始建议：人流量 25%、场地匹配度 20%、目标人群 15%、消费便利性 15%、竞争情况 10%、合作期限 10%、决策人可触达性 5%。请结合实际运营数据持续校准。': 'Default weighting: Foot Traffic 25%, Venue Fit 20%, Audience Fit 15%, Convenience 15%, Competition 10%, Term Stability 10%, Decision Maker Access 5%. Adjust with real operating data.',
  '等待填写': 'Waiting for input',
  '填写左侧信息后，系统将生成点位评估结果。': 'Complete the details on the left to generate an assessment.',
  '评分拆解': 'Score Breakdown',
  '建议下一步': 'Recommended Next Step',
  '先补充人流量、场地类型和决策人信息。': 'Add foot traffic, venue type, and decision maker details.',
  '下一步：点位收益测算 →': 'Next: Site Partner Earnings →',
  '下一步：点位收益测算': 'Next: Site Partner Earnings',
  '恢复示例参数': 'Restore Example Inputs',
  '保存测算': 'Save Estimate',
  '先选择固定月租或按销售额分成，再查看点位方收益与运营商回本周期估算。': 'Choose fixed monthly rent or a percentage of sales, then review site partner earnings and operator payback estimates.',
  '经营参数': 'Operating Assumptions',
  '根据点位和运营方案输入预估数据；初始数字仅为示例': 'Enter estimates for this location. Starting values are examples.',
  '机器 / 项目初始投入 ($)': 'Machine / Project Initial Investment ($)',
  '日均销售商品件数 (件)': 'Items Sold per Day',
  '平均商品售价 ($ / 件)': 'Average Price per Item ($)',
  '每月营业天数': 'Operating Days per Month',
  '商品成本率 (%)': 'Product Cost Rate (%)',
  '合作方式': 'Partnership Model',
  '按销售额分成': 'Percentage of Sales',
  '固定月租': 'Fixed Monthly Rent',
  '点位方销售额分成 (%)': 'Site Partner Share of Sales (%)',
  '固定场地租金 (月 / $)': 'Fixed Monthly Site Rent ($)',
  '每月运营人工成本 ($)': 'Monthly Labor Cost ($)',
  '每月补货 / 交通成本 ($)': 'Monthly Restocking / Travel Cost ($)',
  '每月支付 / 网络成本 ($)': 'Monthly Payment / Network Cost ($)',
  '其他月运营成本 ($)': 'Other Monthly Operating Costs ($)',
  '预计合作测算期 (月)': 'Estimated Partnership Period (Months)',
  '月销售额 = 日均销量 × 平均售价 × 营业天数。运营商月净收益 = 商品毛利 - 点位分成或固定租金 - 人工 - 补货交通 - 支付网络 - 其他运营成本；每项成本都会计入计算。未计入税费、折旧、融资成本及库存损耗。': 'Monthly sales = items sold per day × average price × operating days. Operator net earnings = gross profit - site partner share or rent - labor - restocking and travel - payment and network costs - other operating costs. Taxes, depreciation, financing, and inventory loss are excluded.',
  '物业预计每月可获得': 'Estimated Monthly Site Partner Earnings',
  '经营测算结果': 'Estimate Summary',
  '根据当前输入实时更新': 'Updates as you change the inputs',
  '实时计算': 'Live',
  '测算周期内点位方累计收入': 'Cumulative Site Partner Earnings',
  '估算累计值 · 美元': 'Estimated total · USD',
  '下一步：创建商业提案 →': 'Next: Create a Business Proposal →',
  '下一步：创建商业提案': 'Next: Create a Business Proposal',
  '测算说明': 'Estimate Details',
  '帮助物业理解收益来源': 'See how the earnings estimate is calculated',
  '填写合作信息，生成可预览、可导出为独立网页的物业合作提案。': 'Enter partnership details to preview and export a standalone proposal webpage.',
  '载入示例': 'Load Example',
  '导出提案网页 ↗': 'Export Proposal ↗',
  '提案内容设置': 'Proposal Settings',
  '以下内容将自动同步到右侧提案预览': 'Changes automatically sync to the live proposal preview on the right.',
  '提案标题': 'Proposal Title',
  '物业 / 点位名称': 'Property / Location Name',
  '所在城市': 'City',
  '运营商名称': 'Operator Name',
  '联系人': 'Contact Name',
  '联系人邮箱': 'Contact Email',
  '建议机器型号': 'Recommended Machine Model',
  '请选择型号': 'Select a model',
  '计划部署数量': 'Number of Machines',
  '固定月租 ($)': 'Fixed Monthly Rent ($)',
  '预计上线时间': 'Estimated Launch Date',
  '商品组合 / Planogram': 'Product Mix / Planogram',
  '补货与维护安排': 'Restocking and Maintenance',
  '其他合作说明': 'Other Partnership Notes',
  '提案附带的合规资料（仅勾选本次需要分享的文件）': 'Compliance documents to include (select only files approved for sharing)',
  '只将已确认可向该物业分享的文件链接写入导出的提案；W-9 等敏感文件请谨慎选择。': 'Only include file links approved for sharing with this property. Use care with sensitive files such as W-9 forms.',
  '同步收益测算数据': 'Sync Earnings Estimate',
  '保存到当前项目': 'Save to Current Project',
  '提案预览会随输入自动更新': 'The proposal preview updates as you edit',
  '实时预览': 'Live Preview',
  '打印 / 保存 PDF ↗': 'Print / Save as PDF ↗',
  '集中管理设备认证、食品安全资料、保险证明和税务文件，按物业要求整理材料。': 'Organize equipment certificates, food safety materials, insurance, and tax documents for property reviews.',
  '添加文件链接': 'Add File Link',
  '让物业审查更清晰、更高效。': 'Make property reviews clearer and more efficient.',
  '上传真实证书，或填写权限受控的 Google Drive 文件链接。当前页面不包含任何虚构认证。': 'Upload a genuine certificate or add a restricted Google Drive link. No fictional certifications are included.',
  '已配置文件': 'Files configured',
  '资料管理注意事项': 'Document Handling Notice',
  'W-9 可能包含企业税务识别信息，COI 也可能包含保单信息。建议放在有访问权限控制的 Google Drive 中，不要将敏感文件提交到公开 GitHub 仓库。ADA 通常应作为无障碍合规说明或适用性资料呈现，不应在未核实的情况下称为“认证”。': 'W-9 forms may contain tax IDs and COI files may contain policy details. Keep them in access-controlled Google Drive folders rather than public GitHub repositories. Present ADA details as accessibility guidance rather than an unverified certification.',
  '查看和管理保存在当前浏览器中的点位项目。': 'View and manage location projects saved in this browser.',
  '搜索点位名称或城市': 'Search location or city',
  '第一版原型 · 数据存储于本地浏览器': 'Prototype v1 · Data stored in local browser',
  '先创建项目名称，之后可以逐步补充点位评估、收益测算和提案内容。': 'Name the project first, then add the location assessment, earnings estimate, and proposal details.',
  '项目 / 点位名称': 'Project / Location Name',
  '取消': 'Cancel',
  '保存': 'Save',
  '创建项目 ↗': 'Create Project ↗',
  '确认删除项目': 'Confirm Project Deletion',
  '确认删除': 'Confirm Delete',
  '请填写受控访问的 Google Drive 或 HTTPS 文件链接。': 'Enter an access-controlled Google Drive or HTTPS file link.',
  '文件名称': 'Document Title',
  '文件链接 (HTTPS / Google Drive)': 'File Link (HTTPS / Google Drive)',
  '项目总数': 'Total Projects',
  '已完成评估': 'Assessments Completed',
  '平均点位得分': 'Average Location Score',
  '已生成提案': 'Proposals Created',
  '当前浏览器已保存': 'Saved in this browser',
  '包含点位评分的项目': 'Projects with a location assessment',
  '满分 100': 'Out of 100',
  '完成评估后显示': 'Shown after assessment',
  '已填写提案内容': 'Proposals with saved details',
  '暂无项目数据': 'No projects yet',
  '暂无相关项目': 'No matching projects',
  '人流量与可见度': 'Foot Traffic and Visibility',
  '人流是否稳定，机器是否容易被看到': 'Traffic stability and machine visibility',
  '场地类型匹配度': 'Venue Fit',
  '场地是否适合无人零售柜长期运营': 'Suitability for unattended retail',
  '目标人群匹配度': 'Audience Fit',
  '住户、员工、访客是否有即时消费需求': 'Immediate needs of residents, employees, and visitors',
  '消费便利性': 'Convenience',
  '营业时间、进出便利性和摆放位置': 'Hours, access, and placement',
  '周边竞争情况': 'Nearby Competition',
  '附近是否有便利店、自动售货机等替代选择': 'Nearby convenience stores or vending alternatives',
  '合作期限与稳定性': 'Partnership Term and Stability',
  '租期、物业稳定性及续约可能性': 'Term, property stability, and renewal potential',
  '决策人可触达性': 'Decision Maker Access',
  '是否找到物业经理或实际决策人': 'Whether the property manager or decision maker is known',
  '优质点位': 'Strong Location',
  '值得重点跟进': 'Worth Prioritizing',
  '建议补充信息': 'More Information Needed',
  '暂不建议优先投入': 'Low Priority for Now',
  '当前条件较好，可以进入商务沟通和收益测算阶段。': 'Conditions look strong. Proceed to partner discussions and earnings modeling.',
  '点位具备开发潜力，建议核实关键经营条件后推进。': 'Promising location. Verify key operating conditions before moving forward.',
  '目前存在一些信息缺口或经营风险，建议先补充调研。': 'Information gaps or operating risks remain. Conduct further site research first.',
  '现阶段经营条件偏弱，建议谨慎投入开发资源。': 'Current site conditions are weak. Be cautious with development resources.',
  '准备初次沟通材料，联系物业或场地负责人，确认合作方式与现场条件。': 'Prepare outreach materials and contact the property manager to confirm partnership terms and site conditions.',
  '预计月销售额': 'Estimated Monthly Sales',
  '日均销量 × 平均售价 × 营业天数': 'Daily items × average price × operating days',
  '预计月商品毛利': 'Estimated Monthly Gross Profit',
  '点位方预计月收入': 'Estimated Monthly Site Partner Earnings',
  '点位方预计月收益': 'Estimated Monthly Site Partner Earnings',
  '运营商预计月净收益': 'Estimated Monthly Operator Net Earnings',
  '运营商预计回本周期': 'Estimated Operator Payback Period',
  '当前假设下无法回本': 'No payback under current assumptions',
  '初始投入 ÷ 运营商月净收益': 'Initial investment ÷ monthly operator net earnings',
  '运营月净收益 × 测算期 - 初始投入': 'Monthly operator net earnings × period - initial investment',
  '公寓 / 多户住宅': 'Apartments / Multifamily',
  '办公楼': 'Office Building',
  '健身房': 'Gym / Fitness Center',
  '酒店': 'Hotel / Hospitality',
  '学校 / 教育机构': 'School / Education',
  '医院 / 医疗机构': 'Hospital / Healthcare',
  '公共建筑': 'Public Building',
  '其他': 'Other',
  '自主开发': 'Direct Outreach',
  '网站留言': 'Website Inquiry',
  '客户 / 朋友推荐': 'Customer / Friend Referral',
  '小办公室：Office Manager；大型办公室：Facilities / Workplace Manager；多租户办公楼：Property Manager 或前台。先确认是否存在企业级统一供应商协议。': 'Small office: Office Manager; Large office: Facilities / Workplace Manager; Multi-tenant building: Property Manager or front desk. Confirm whether an enterprise vendor agreement exists.',
  '优先联系 Property Manager（物业经理），必要时进一步确认区域 / Corporate Property Manager 是否拥有最终审批权。': 'Contact the Property Manager first, and confirm whether a Regional or Corporate Property Manager holds final approval authority.',
  '独立健身房：Owner 或 General Manager；连锁 / 加盟店：General Manager，并先核实是否已有全国性合作协议。': 'Independent gym: Owner or General Manager; Chain / franchise: General Manager, and verify whether a national vendor contract is already in place.',
  '优先联系 General Manager、Director of Operations 或 Facilities Manager；大型连锁酒店需确认品牌或集团采购要求。': 'Contact the General Manager, Director of Operations, or Facilities Manager; for hotel chains, verify brand or corporate procurement standards.',
  '优先联系 Facilities Manager、学校行政或采购负责人；公立机构通常还需确认招标和供应商准入流程。': 'Contact the Facilities Manager, administration, or purchasing lead; public institutions usually require RFP and vendor onboarding steps.',
  '优先联系 Facilities / Supply Chain / Purchasing 部门，并提前了解院内供应商准入、保险及卫生审查要求。': 'Contact Facilities, Supply Chain, or Purchasing, and review hospital vendor onboarding, insurance, and health compliance requirements.',
  '关注政府网站的采购公告（RFP / RFQ），按供应商注册、投标和采购流程联系 Purchasing / Procurement 部门。': 'Monitor government procurement notices (RFP / RFQ) and follow vendor registration and bidding procedures with the Purchasing department.',
  '通常从 Site Manager、General Manager 或 Facilities Manager 入手，再确认实际合同签署人和预算审批人。': 'Start with the Site Manager, General Manager, or Facilities Manager, then confirm the contract signer and budget approver.',
  'NAMA 认证资料': 'NAMA Certification',
  'UL / ETL 电气安全资料': 'UL / ETL Electrical Safety',
  'NSF 食品卫生资料': 'NSF Sanitation & Food Safety',
  'FCC 无线电合规资料': 'FCC Wireless Compliance',
  'ADA 无障碍说明': 'ADA Accessibility Guidance',
  'ADA 无障碍合规说明': 'ADA Accessibility Guidance',
  'COI 责任保险证明': 'Certificate of Insurance (COI)',
  '责任保险证明 (COI)': 'Certificate of Insurance (COI)',
  'W-9 税务表格': 'W-9 Tax Form',
  '行业认证': 'Industry Certification',
  '设备认证': 'Equipment Certification',
  '食品安全': 'Food Safety',
  '场地合规': 'Site Compliance',
  '保险文件': 'Insurance',
  '税务文件': 'Tax Document',
  '补充文件': 'Supplemental Document',
  '仓库当前提供的 NAMA 认证文件。分享前请确认文件适用范围及接收对象。': 'NAMA certification file included in the repository. Verify applicability and recipient before sharing.',
  '用于说明设备电气安全测试或认证情况。请上传适用于对应机器型号的真实证书。': 'Documents electrical safety testing and certification. Upload the certificate matching the selected machine model.',
  '用于回应物业对食品接触材料、卫生或相关标准的审查要求。': 'Addresses property review requirements regarding food-contact materials and sanitation standards.',
  '用于说明设备内无线通信模块或相关电子设备的 FCC 合规信息。': 'Details FCC compliance for wireless communication modules and electronics inside the machine.',
  '用于说明设备布置和使用流程对无障碍要求的考虑。不是默认存在的“ADA 认证”。': 'Explains placement and operational accessibility considerations. Not a standalone "ADA certificate".',
  '运营商向物业提供的保险凭证。领导需求中提到 $2M 责任险，实际额度以保单为准。': 'Operator liability insurance certificate for the property (typically $2M coverage; verify actual policy limits).',
  '物业可能要求运营商提供的税务信息表。该文件可能包含敏感税务识别信息。': 'Tax identification form requested by properties for commission payouts. Contains sensitive tax information.',
  '仅用于 NAMA 认证资料': 'For NAMA certification reference only',
  '按机器型号核对证书范围': 'Verify certificate scope by machine model',
  '确认具体标准及适用范围': 'Confirm specific standards and scope',
  '核对模块、型号及申报主体': 'Verify module, model, and filing entity',
  '需结合安装环境和适用法规审查': 'Review with site layout and local regulations',
  '检查被保险人、保额、有效期及附加被保险人要求': 'Check insured entity, coverage limits, expiration, and additional insured terms',
  '建议仅通过授权受控渠道分享': 'Share only through access-controlled channels',
  '已配置链接': 'Link Configured',
  '临时附件': 'Session File',
  '待补充': 'To Be Provided',
  '仓库认证文件': 'Repository Certificate File',
  '修改链接': 'Edit Link',
  '添加 Drive 链接': 'Add Drive Link',
  '本地预览': 'Local Preview',
  '查看附件 ↗': 'View File ↗',
  '下载认证资料 ↓': 'Download Certificate ↓',
  '打开 / 下载资料 ↗': 'Open / Download File ↗',
  '下载资料 (待补充)': 'Download (Not Configured)',
  '已评估': 'Assessed',
  '进行中': 'In Progress',
  '当前项目': 'Current Project',
  '打开': 'Open',
  '删除': 'Delete',
  '城市待补充': 'City not provided',
  '待评估': 'Not assessed',
  '待测算': 'Estimate needed',
  '待确认': 'To be confirmed',
  '刚刚': 'Just now',
  '未命名点位项目': 'Untitled Location Project',
  '例如: Sunrise Apartments': 'e.g. Sunrise Apartments',
  '例如: Tampa, FL': 'e.g. Tampa, FL',
  '例如: 300': 'e.g. 300',
  '例如: 住户、员工、访客': 'e.g. Residents, employees, visitors',
  '例如: 24': 'e.g. 24',
  '例如: Property Manager': 'e.g. Property Manager',
  '例如: 大堂有休息区，住户刷卡进入，附近没有便利店......': 'e.g. Lobby lounge area, keycard access for residents, no convenience store nearby...',
  '物业名称': 'Property name',
  '运营公司名称': 'Operator company name',
  '姓名': 'Full name',
  '例如: 双方确认后 2-4 周': 'e.g. 2-4 weeks after approval',
  '可填写电费、网络、访问权限、营业时间等需要进一步确认的事项': 'Add items to confirm such as utilities, network, access permissions, and operating hours',
  '例如: 设备规格表 / 保险附加被保险人证明': 'e.g. Machine Spec Sheet / Additional Insured Endorsement',
  '智能零售柜点位合作提案': 'Smart Retail Amenity Partnership Proposal',
  '为物业空间提供便捷的智能零售服务合作方案': 'A turnkey smart retail amenity proposal tailored for your property',
  '01 · 合作方案概述': '01 · Partnership Overview',
  '02 · 商品组合与陈列建议': '02 · Product Mix & Merchandising',
  '03 · 物业合作与收益方式': '03 · Partnership Model & Property Earnings',
  '04 · 日常运营与服务': '04 · Routine Operations & Service',
  '05 · 合规资料': '05 · Compliance Documents',
  '06 · 后续确认事项': '06 · Next Steps & Items to Confirm',
  '提案对象': 'Prepared For',
  '合作运营商': 'Operating Partner',
  '建议部署数量': 'Recommended Units',
  '预估日均人流': 'Est. Daily Foot Traffic',
  '点位评估得分': 'Location Score',
  '请先选择机器型号': 'Select a machine model first',
  '待选择型号': 'Model to be selected',
  '提案草案 · 以双方最终书面协议为准': 'Proposal Draft · Subject to final written agreement',
  '文件链接待补充': 'File link to be provided',
  '本次提案暂未附带合规文件。根据物业审查要求，可在合规文件中心配置资料链接后重新勾选。': 'No compliance documents are attached to this proposal yet. Configure links in the Compliance Center and check the items to include.',
  '最终点位布局、用电、网络、安装位置、访问权限及合同条款，以双方现场确认和书面协议为准。': 'Final placement, power, network, installation area, access permissions, and contract terms are subject to site walk-through and written agreement.',
  '文件链接的可访问权限和有效期由资料提供方负责确认；敏感文件仅向授权接收人分享。': 'Link permissions and validity are managed by the document provider; sensitive files are shared only with authorized recipients.',
  '以上为输入参数下的测算示例，不构成销售额或点位方收益保证。实际结果取决于现场客流、商品、价格、营业时间及运营情况。': 'The figures above are model estimates based on input assumptions and do not guarantee sales or property revenue. Actual results depend on foot traffic, product mix, pricing, and operating hours.',
  '商品补货与库存管理：由运营商负责，具体频率根据销售情况确定。': 'Restocking & inventory management: Handled by the operator with frequency adjusted to actual sales.',
  '设备维护与故障响应：双方确认服务时间、报修渠道及响应标准。': 'Equipment maintenance & support: Service hours, reporting channels, and response SLAs confirmed by both parties.',
  '现场运营协调：明确设备投放区域、营业时间、用电及网络安排。': 'On-site coordination: Confirm placement area, operating hours, power outlet, and network connectivity.',
  '现场安装位置、尺寸、电源和网络条件。': 'Installation location, dimensions, power outlet, and network conditions.',
  '合作期限、分成基数、对账依据和付款日期。': 'Partnership term, revenue share basis, reconciliation statements, and payout schedule.',
  '电费承担、保险与赔偿责任、访问权限和营业时间。': 'Utility responsibility, insurance and indemnification, building access, and operating hours.',
  '合同终止、续租、独家经营及设备移除安排。': 'Termination, renewal, exclusivity, and equipment removal provisions.',
  '打开菜单': 'Open menu',
  '关闭': 'Close',
  'HAHA Vending 首页': 'HAHA Vending Home',
  '主导航': 'Main Navigation',
  '请先填写点位名称。': 'Please enter a location name first.',
  '点位评估已保存到本地项目。': 'Location assessment saved to local project.',
  'ROI 测算已保存到当前项目。': 'ROI estimate saved to current project.',
  '提案信息已保存到当前项目。': 'Proposal details saved to current project.',
  '请填写项目名称。': 'Please enter a project name.',
  '项目已创建，开始填写点位信息。': 'Project created. Start entering location details.',
  '点位评估参数已重置。': 'Assessment scores reset to default (3).',
  'ROI 参数已恢复为示例值。': 'ROI assumptions restored to example values.',
  '建议先填写物业 / 点位名称，再导出提案。': 'Please enter the property or location name before exporting.',
  '已导出独立提案网页 HTML。': 'Standalone proposal HTML exported.',
  '已载入示例提案内容，请替换为真实信息。': 'Example proposal loaded. Replace with actual property details.',
  '合作提案已下载；所选认证资料可在提案中直接下载。': 'Proposal downloaded. Selected certificates are linked in the proposal.',
  '文件链接信息已保存到本地。': 'Document link saved locally.',
  '项目已删除。': 'Project deleted.',
  '本地保存失败，请检查浏览器存储空间或隐私设置。': 'Local save failed. Please check browser storage or privacy settings.',
  '链接格式不正确，请使用 https:// 或 http:// 开头的完整链接。': 'Invalid URL format. Please enter a full URL starting with https:// or http://.'
};

const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([zh, en]) => [normalize(en), zh])
);

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const listeners = new Set();

function readInitialLanguage() {
  try {
    return localStorage.getItem('haha_pitch_language') === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

let language = readInitialLanguage();
let isTranslating = false;

export function getLanguage() {
  return language;
}

export function onLanguageChange(fn) {
  if (typeof fn === 'function') listeners.add(fn);
}

export function translate(value) {
  const key = normalize(value);
  if (!key) return value;
  if (translations[key]) return translations[key];

  let match = key.match(/^年预计 (.+) · (\d+) 个月累计 (.+)$/);
  if (match) return `Annual est. ${match[1]} · ${match[2]}-mo total ${match[3]}`;

  match = key.match(/^已打开项目：(.+)$/);
  if (match) return `Opened project: ${match[1]}`;

  match = key.match(/^(\d+) 个项目$/);
  if (match) return `${match[1]} projects`;

  match = key.match(/^(\d+)\s*个月$/);
  if (match) return `${match[1]} mos`;

  match = key.match(/^(\d+(?:\.\d+)?) 个月$/);
  if (match) return `${match[1]} mos`;

  match = key.match(/^(\d+) 个月运营商净收益$/);
  if (match) return `${match[1]}-Mo Operator Net Earnings`;

  match = key.match(/^商品成本率 (\d+(?:\.\d+)?)%$/);
  if (match) return `Product cost rate ${match[1]}%`;

  match = key.match(/^商品毛利 - 点位方收入 - 运营成本 (.+)$/);
  if (match) return `Gross profit - partner share - opex ${match[1]}`;

  match = key.match(/^固定月租 (.+)$/);
  if (match) return `Fixed monthly rent ${match[1]}`;

  match = key.match(/^按销售额分成 (\d+(?:\.\d+)?)%$/);
  if (match) return `${match[1]}% of monthly sales`;

  match = key.match(/^销售额分成 (\d+(?:\.\d+)?)%$/);
  if (match) return `${match[1]}% revenue share`;

  match = key.match(/^(\d+) 人$/);
  if (match) return `${match[1]} people`;

  match = key.match(/^(\d+) 台$/);
  if (match) return `${match[1]} units`;

  match = key.match(/^(.+) · 更新于 (.+)$/);
  if (match) return `${translate(match[1])} · Updated ${ translate(match[2]) }`;

  match = key.match(/^点位评分：(.+) \/ 100$/);
  if (match) return `Score: ${translate(match[1])} / 100`;

  match = key.match(/^优先核实：(.+)。补充现场信息后再决定是否投入提案资源。$/);
  if (match) {
    const parts = match[1].split('、').map(item => translate(item)).join(', ');
    return `Verify first: ${parts}. Gather site details before committing proposal resources.`;
  }

  match = key.match(/^下载 (.+) ↓$/);
  if (match) return `Download ${translate(match[1])} ↓`;

  match = key.match(/^链接：(.+)$/);
  if (match) return `Link: ${match[1]}`;

  match = key.match(/^本次会话：(.+)$/);
  if (match) return `Session file: ${match[1]}`;

  return value;
}

export function t(value) {
  return language === 'en' ? translate(value) : value;
}

function translateTextNode(node, restore = false) {
  if (!node || !node.nodeValue) return;
  if (node.parentElement?.closest('#languageToggle')) return;
  const tag = node.parentElement?.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return;

  const currentRaw = node.nodeValue;
  const currentTrimmed = normalize(currentRaw);
  if (!currentTrimmed) return;

  if (!originalText.has(node)) {
    originalText.set(node, currentRaw);
  } else if (!restore && translations[currentTrimmed]) {
    originalText.set(node, currentRaw);
  }

  const savedRaw = originalText.get(node);
  if (restore) {
    const restored = reverseTranslations[currentTrimmed]
      ? currentRaw.replace(currentRaw.trim(), reverseTranslations[currentTrimmed])
      : savedRaw;
    if (node.nodeValue !== restored) {
      node.nodeValue = restored;
    }
    return;
  }

  const sourceTrimmed = normalize(savedRaw);
  const translatedCore = translate(sourceTrimmed);
  if (translatedCore !== sourceTrimmed) {
    const leading = (savedRaw.match(/^\s*/) || [''])[0];
    const trailing = (savedRaw.match(/\s*$/) || [''])[0];
    const nextValue = `${leading}${translatedCore}${trailing}`;
    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
  }
}

export function visit(root, restore = false) {
  if (!root || isTranslating) return;
  isTranslating = true;
  try {
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, restore);
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      translateTextNode(node, restore);
    }

    root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach(element => {
      if (element.closest('#languageToggle')) return;
      for (const name of ['placeholder', 'aria-label', 'title']) {
        if (!element.hasAttribute(name)) continue;
        let saved = originalAttributes.get(element);
        if (!saved) {
          saved = {};
          originalAttributes.set(element, saved);
        }
        if (saved[name] === undefined) {
          saved[name] = element.getAttribute(name);
        }
        const original = saved[name];
        const nextValue = restore ? original : translate(original);
        if (element.getAttribute(name) !== nextValue) {
          element.setAttribute(name, nextValue);
        }
      }
    });
  } finally {
    isTranslating = false;
  }
}

function lockSelectOptionValues() {
  document.querySelectorAll('option:not([value])').forEach(option => {
    const raw = originalText.get(option.firstChild) || option.textContent;
    option.setAttribute('value', raw.trim());
  });
}

export function setLanguage(next) {
  language = next === 'en' ? 'en' : 'zh';
  try {
    localStorage.setItem('haha_pitch_language', language);
  } catch {
    // ignore storage restriction in sandboxed iframe
  }
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  document.body.dataset.language = language;
  lockSelectOptionValues();
  listeners.forEach(fn => {
    try { fn(language); } catch (e) { console.error(e); }
  });
  visit(document.body, language === 'zh');
  const button = document.getElementById('languageToggle');
  if (button) {
    button.textContent = language === 'en' ? '中文' : 'EN';
    button.setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
  }
}

let observerInitialized = false;

export function initializeLanguageToggle() {
  lockSelectOptionValues();
  const button = document.getElementById('languageToggle');
  if (button && !button.dataset.bound) {
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      setLanguage(language === 'zh' ? 'en' : 'zh');
    });
  }

  if (!observerInitialized) {
    observerInitialized = true;
    const observer = new MutationObserver(records => {
      if (language !== 'en' || isTranslating) return;
      for (const record of records) {
        if (record.type !== 'childList') continue;
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            visit(node, false);
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setLanguage(language);
}
