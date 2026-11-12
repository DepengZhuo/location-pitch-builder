import { VENUE_TEMPLATES } from './data.js';
/* =========================================================
   Internationalization Module (i18n) — Inverted Architecture:
   - Default & Source Language: English ('en')
   - Optional Target Mapping: Chinese ('zh')
   ========================================================= */
export const PROPOSAL_DEFAULTS = {
  en: {
    title: 'Smart Retail Amenity Partnership Proposal',
    launch: '2-4 weeks after approval',
    planogram: `• Beverages: Bottled water, sparkling water, milk/plant milk, juice, soft drinks, and tea.
• Food: Breakfast pastries, yogurt, convenience meals, chips, nuts, and ice cream/frozen food (with freezer models).
• Daily Essentials: Tissues, wet wipes, laundry pods, trash bags, toothbrushes/toothpaste, personal care, and batteries.
Key Focus: High-frequency drinks + Late-night snacks + Household emergency essentials.`,
    planogramExample: `• Beverages: Bottled water, sparkling water, milk/plant milk, juice, soft drinks, and tea.
• Food: Breakfast pastries, yogurt, convenience meals, chips, nuts, and ice cream/frozen food (with freezer models).
• Daily Essentials: Tissues, wet wipes, laundry pods, trash bags, toothbrushes/toothpaste, personal care, and batteries.
Key Focus: High-frequency drinks + Late-night snacks + Household emergency essentials.`,
    service: `The Operator is responsible for product sourcing, regular restocking, machine cleaning, and routine maintenance. The Operator will monitor inventory and machine status, and coordinate with the Property Owner regarding site access and operational arrangements.
The Property Owner agrees to provide a suitable installation area, access to electricity, and reasonable site access for restocking, cleaning, and maintenance. Both parties will coordinate any site-specific requirements to ensure smooth daily operations.`,
    warranty: `The Operator is responsible for monitoring machine alerts, coordinating troubleshooting and repair services, and handling warranty claims through the equipment manufacturer, subject to applicable warranty terms. The Operator will maintain applicable business liability insurance and provide proof of coverage upon request.
The Property Owner agrees to notify the Operator of any equipment issues, damage, or unusual conditions observed on-site, and to avoid unauthorized relocation, opening, or tampering with the machine. The Operator will coordinate necessary follow-up actions and keep the Property Owner informed of relevant service arrangements.`,
    confirmItems: `The following details will be confirmed by both parties before installation:
- Final machine placement and installation area.
- Power supply and network availability.
- Approved product categories and any site-specific restrictions.
- Responsibility for electricity and other applicable site costs.
- Revenue-sharing percentage or rental arrangement.
- Installation date, site access, and operating hours.`,
    notes: 'Any additional requirements, site-specific arrangements, or special terms agreed upon by both parties may be documented here. Final arrangements will be subject to mutual agreement between the Property Owner and the Operator.'
  },
  zh: {
    title: '智能零售柜点位合作提案',
    launch: '双方确认后 2-4 周',
    planogram: `• 饮料：瓶装水、气泡水、牛奶/植物奶、果汁、碳酸饮料、茶饮。
• 食品：早餐面包、酸奶、方便食品、薯片、坚果、雪糕/冷冻食品（如使用冷冻机型）。
• 日用品：纸巾、湿巾、洗衣凝珠、垃圾袋、牙刷牙膏、卫生用品、电池等应急生活用品。
推荐重点：高频饮品 + 夜间零食 + 家庭应急日用品。`,
    planogramExample: `• 饮料：瓶装水、气泡水、牛奶/植物奶、果汁、碳酸饮料、茶饮。
• 食品：早餐面包、酸奶、方便食品、薯片、坚果、雪糕/冷冻食品（如使用冷冻机型）。
• 日用品：纸巾、湿巾、洗衣凝珠、垃圾袋、牙刷牙膏、卫生用品、电池等应急生活用品。
推荐重点：高频饮品 + 夜间零食 + 家庭应急日用品。`,
    service: `运营商负责商品采购、定期补货、设备清洁及日常维护，并持续关注商品库存和设备运行状态。运营商与点位方协调现场进出及日常运营安排。
点位方负责提供合适的设备安装区域、电源及合理的现场进出权限，以便运营商开展补货、清洁和维护工作。双方共同协调场地特殊要求，确保日常运营顺利进行。`,
    warranty: `运营商负责关注设备异常提醒、协调故障排查及维修服务，并根据适用的设备质保条款，通过设备制造商协调质保申请及技术支持。运营商应维持适用的商业责任保险，并根据要求提供保险证明。
点位方负责及时告知运营商现场发现的设备故障、损坏或异常情况，不得擅自移动、开启或拆卸设备。运营商负责协调后续处理，并及时向点位方同步相关服务安排。`,
    confirmItems: `设备安装前，双方需进一步确认以下事项：
- 最终设备摆放位置及安装区域。
- 现场电源及网络条件。
- 允许销售的商品类别及场地特殊限制。
- 电费及其他相关场地费用的承担方式。
- 销售分成比例或固定场地租金。
- 设备安装时间、现场进出权限及运营时间。`,
    notes: '双方商定的任何其他要求、场地特殊安排或特别条款均可在此处记录。最终合作安排以点位方与运营商双方达成的共同协议为准。'
  }
};

// Source (en) -> Target (zh) mapping
const enToZh = {
  'The operator handles product sourcing, scheduled restocking, machine cleaning, and daily operations, with maintenance response tailored to site needs.': '运营商负责商品采购、定期补货、设备清洁与日常运营，并根据现场情况安排维护响应。',
  'Restocking & inventory management: Handled by the operator with frequency adjusted to actual sales.': '商品补货与库存管理：由运营商负责，具体频率根据销售情况确定。',
  'Equipment maintenance & support: Service hours, reporting channels, and response SLAs confirmed by both parties.': '设备维护与故障响应：双方确认服务时间、报修渠道及响应标准。',
  'On-site coordination: Confirm placement area, operating hours, power outlet, and network connectivity.': '现场运营协调：明确设备投放区域、营业时间、用电及网络安排。',
  'Installation location, dimensions, power outlet, and network conditions.': '现场安装位置、尺寸、电源和网络条件。',
  'Partnership term, revenue share basis, reconciliation statements, and payout schedule.': '合作期限、分成基数、对账依据和付款日期。',
  'Utility responsibility, insurance and indemnification, building access, and operating hours.': '电费承担、保险与赔偿责任、访问权限和营业时间。',
  'Termination, renewal, exclusivity, and equipment removal provisions.': '合同终止、续租、独家经营及设备移除安排。',
  'Pilot Evaluation: 60-day trial period with full operator support.': '试运营评估：首期 60 天试运营，期间由运营商提供全流程支持。',
  'Custom Merchandising: Product mix tailored to seasonal feedback.': '定制化选品：根据现场反馈按月优化商品结构。',
  'Beverages, bottled water, healthy snacks, convenience foods, and daily essentials. Exact SKU mix is tailored to resident/visitor preferences and sales data.': '饮料、瓶装水、健康零食、方便食品及日常必需品。具体 SKU 根据物业人群和销售反馈调整。',
  'Bottled water, sports drinks, soft drinks, healthy snacks, grab-and-go meals, and daily essentials. Continuously optimized based on resident demographics and sales velocity.': '瓶装水、运动饮料、碳酸饮料、健康零食、方便食品及日常必需品。根据住户画像和销售数据持续优化 SKU。',
  'Document deleted.': '文件已删除。',
  'Restore Default List': '恢复默认文件',
  'Default compliance documents restored.': '已恢复默认合规文件列表。',
  'Workspace': '工作空间',
  'Dashboard': '工作台',
  'Location Assessment': '点位评估',
  'Site Partner Earnings': '点位方收益测算',
  'Business Proposal': '商业提案',
  'Compliance Documents': '合规文件中心',
  'My Projects': '我的项目',
  'Local Workspace': '本地工作模式',
  'Data is saved in this browser': '数据保存在当前浏览器',
  'Saved locally': '本地自动保存',
  '+ New Location Project': '+ 新建点位项目',
  '+ New Project': '+ 新建项目',
  '+ Add File Link': '+ 添加文件链接',
  'New Location Project': '新建点位项目',
  'Start a New Project': '开始一个新项目',
  'Turn every location into a new business opportunity.': '把每一个点位，变成新的商业机会。',
  'Prepare for location development with assessment, earnings estimates, proposals, and compliance files in one place.': '从点位评估、收益测算到商务提案与合规资料，一站式完成点位开发准备。',
  'Present a clear business case with useful data and professional materials.': '用清晰的数据和专业的材料，让物业更容易理解合作价值。',
  'Project Overview': '项目概览',
  'Location projects saved in this browser': '当前浏览器中保存的点位开发项目',
  'View All Projects →': '查看全部项目 →',
  'View All Projects': '查看全部项目',
  'Recent Projects': '最近项目',
  'Continue working on locations in progress': '继续完善你正在开发的点位',
  'All Projects →': '全部项目 →',
  'All Projects': '全部项目',
  'Quick Start': '快速开始',
  'Choose what to work on next': '选择下一步要完成的工作',
  'Assess a Location': '评估一个新点位',
  'Review site conditions and business potential': '分析场地条件和经营潜力',
  'Estimate Partner Earnings': '测算合作收益',
  'Calculate site partner share and term earnings': '计算物业分成和合作周期总收益',
  'Create a Business Proposal': '生成商业提案',
  'Prepare a proposal for a property': '为物业整理一份合作方案',
  'Prepare Compliance Documents': '准备合规文件',
  'Manage certificates, insurance, and tax documents': '管理证书、保险和税务材料',
  'Note:': '使用提示：',
  'Project data is saved locally in this browser. Earnings figures are illustrative estimates and do not constitute a sales or operating guarantee.': '项目数据保存在当前浏览器本地；收益数据为测算参考，不构成销售或经营承诺。',
  'Smart Retail Partnership Workspace': '智能零售点位合作工作台',
  'Reset Scores': '重置评分',
  'Save Assessment': '保存评估',
  'Answer five quick questions to understand a location’s potential. You can use your best estimate — exact traffic data is not required.': '先判断这个点位是否值得投入时间开发。回答 5 个快速问题即可评估潜力，无需精确人流统计。',
  '1. Location Details': '1. 点位基本信息',
  'Location Details': '点位基本信息',
  'A few basics to identify the site. These fields do not affect the score.': '根据已知情况填写，未知项可以暂时留空；基本信息不影响分数计算。',
  'Location Name': '点位名称',
  'City / State': '城市 / 州',
  'Venue Type': '场地类型',
  'Estimated Daily Foot Traffic': '预估日均人流量',
  'Primary Audience': '主要服务人群',
  'Lease / Partnership Term (Months)': '租赁 / 合作期限（月）',
  'Decision Maker / Contact': '决策人 / 联系人',
  'Lead Source': '点位来源',
  'Site Observations and Notes': '现场观察与备注',
  'Recommended Contact': '建议联系对象',
  'Choose a venue type to see the usual decision maker.': '选择场地类型后，这里会显示通常需要联系的关键决策人。',
  '2. Rate the Location': '2. 点位条件评估',
  'Choose one answer for each item. Select "Not sure" when you need to check.': '每项选择一个最符合现场情况的答案；如果暂时不确定，可以选择“待确认”。',
  '5 items · 2–3 min': '5 项 · 2–3 分钟',
  'Foot Traffic & Consistency': '人流量与稳定性',
  'Foot traffic': '人流量',
  'Are people here regularly?': '这里平时人流稳定吗？',
  'Think about how busy the location is during a normal day — not just its busiest hour.': '观察日常全天的繁忙程度，而不仅是最高峰的那一小时。',
  'Strong: steady activity throughout the day': '强：全天人流活动稳定',
  'Average: busy at certain times': '一般：仅在特定时段繁忙',
  'Weak: limited daily activity': '弱：日常人流活动有限',
  'Visit during both busy and quiet hours to see how steady the traffic really is.': '建议在高峰和平峰时段分别实地观察，核实全天真实人流的稳定性。',
  'Target Customer Fit': '目标客群匹配度',
  'Customer fit': '客群匹配',
  'Are the right people here?': '来往的是目标客群吗？',
  'Consider whether people spend enough time here and are likely to use a convenient snack or drink option.': '考虑人群在此停留的时间，以及使用便捷零食或饮料柜的可能性。',
  'Strong: residents, employees, students or guests': '强：住户、员工、学生或住客',
  'Average: some potential buyers': '一般：有一定潜在购买人群',
  'Weak: mostly pass-through visitors': '弱：以匆忙路过的访客为主',
  'Identify who is most likely to use the machine and when they would need it.': '明确哪些人群最可能高频使用设备，以及他们产生即时消费需求的时间段。',
  'Consumer Need & Convenience': '消费需求与便利性',
  'Consumer need': '消费需求',
  'Is it easy to buy nearby?': '周边买东西方便吗？',
  'Look at nearby stores, cafés and food options. Is there an unmet need for convenient access?': '观察附近的便利店、咖啡馆和餐饮选择，是否存在未被满足的即时便利需求？',
  'Strong: few convenient options nearby': '强：周边几乎没有便利替代选项',
  'Average: alternatives exist but have limits': '一般：有替代选项但营业或距离受限',
  'Weak: needs are already well served': '弱：现有消费需求已被充分满足',
  'Check nearby stores, their hours and the products people cannot easily get on site.': '核查周边便利店和餐饮的营业时间与距离，找出场地内难以即时买到的高频商品。',
  'Placement Visibility & Access': '摆放位置可见度与动线',
  'Placement': '位置可见度',
  'Can people easily see and reach it?': '大家容易看到和走到吗？',
  'Think about a visible, convenient spot along the normal path people take through the location.': '考虑在人群进出该场地的日常必经动线上，是否有显眼、方便停留的位置。',
  'Strong: visible common area or main walkway': '强：显眼的公共区域或主通道',
  'Average: usable, but off the main path': '一般：位置可用，但偏离主动线',
  'Weak: hidden or hard to access': '弱：位置隐蔽或难以到达',
  'Walk the normal customer route and identify a visible, convenient placement spot.': '沿用户日常进出动线走一遍，确认一个显眼、驻足方便且不影响通行的具体点位。',
  'Operational Feasibility': '运营与补货可行性',
  'Operations': '运营可行性',
  'Can you operate it without hassle?': '日常运营省心吗？',
  'Consider space, power, network signal, and how easy it is to restock and service the machine.': '综合考虑摆放空间、电源插座、网络信号，以及日常补货和设备维护的便利程度。',
  'Strong: space, power and restocking are easy': '强：空间、电源与补货都很顺畅',
  'Average: a few items need checking': '一般：有少数条件需进一步核实',
  'Weak: major access or setup issues': '弱：存在明显的进场或安装障碍',
  'Confirm space, power, network signal and a practical route for restocking.': '现场确认安装空间尺寸、独立电源插座、4G/网络信号强度以及补货推车进出路线。',
  'Strong': '强',
  'Average': '一般',
  'Weak': '弱',
  'Not sure': '待确认',
  '3. Deployment Readiness': '3. 部署准备度核查',
  'These checks do not affect the location score. They help identify what must be confirmed before installation.': '以下检查项不影响点位评分，用于梳理正式进场安装前必须落实的条件。',
  'Separate check': '独立核查项',
  'Property approval': '物业审批许可',
  'Has the property approved a vending machine?': '物业方是否已批准投放智能零售柜？',
  'Space & power': '空间与电源条件',
  'Is there enough space and a suitable power outlet?': '现场是否有足够摆放空间和合适的电源插座？',
  'Restocking access': '补货与维保通行',
  'Can you access the location for restocking and service?': '运营人员是否方便进出场地进行补货与维护？',
  'Property contact & terms': '物业对接人与合作条款',
  'Do you know who makes the decision and the basic terms?': '是否已明确关键决策人及基本合作条件？',
  'Need to check': '待核实',
  'Confirmed': '已确认',
  'Not available / Not permitted': '不具备 / 不允许',
  'Tip: "Need to check" is a perfectly valid answer. It simply means this item should be confirmed before you move forward.': '提示：选择“待核实”完全正常，仅代表该事项需要在正式推进安装前与物业进一步确认。',
  'Assessment Summary': '评估总结分析',
  'A quick snapshot of what looks promising and what needs attention.': '快速梳理当前点位的核心优势与需要重点核实的事项。',
  'Your next move': '行动建议',
  'What looks promising': '优势亮点',
  'What needs attention': '待关注项',
  'No standout strengths yet. Review the ratings and site details.': '暂无突出优势项，建议结合现场情况复核评分与细节。',
  'No major gaps were identified in the five ratings.': '五项核心评分中未发现明显短板。',
  'main concern': '主要顾虑',
  'could be improved': '有提升空间',
  'Recommended next step': '建议下一步行动',
  'Visit the location': '实地考察点位',
  'Confirm the busiest hours, best placement area and basic operating conditions.': '确认高峰时段人流、最佳摆放位置以及基本运营条件。',
  'Confirm the site in person': '现场确认部署条件',
  'The five core factors look positive. Visit the site, confirm deployment conditions and speak with the property contact.': '五项核心条件表现良好。建议实地拜访点位，核实安装条件并与物业负责人深入沟通。',
  'This score is an initial site assessment based on the information provided. It is not a sales forecast or a guarantee of performance. Actual results depend on customer demand, product selection, pricing, placement and day-to-day operations.': '本评分为基于当前已知信息的初步场地评估，不构成销售额预测或经营结果承诺。实际表现取决于客流需求、商品选品、定价、摆放位置及日常运营质量。',
  'Not completed': '未开始',
  'In progress': '评估进行中',
  'Strong Potential': '潜力优秀',
  'Worth Exploring': '值得跟进',
  'Lower Priority': '优先级较低',
  'SCORE BREAKDOWN': '评分拆解',
  'DEPLOYMENT STATUS': '部署准备状态',
  'Checks not completed': '核查项待确认',
  'Review the four conditions on the left before installation.': '进场安装前请核实左侧 4 项基础部署条件。',
  'Resolve before installation': '安装前需解决阻碍',
  'Confirmation needed': '有待进一步确认',
  'Ready for the next step': '已具备推进条件',
  'All four deployment conditions are marked as confirmed.': '四项部署准备条件均已确认为具备。',
  'How scoring works': '计分规则说明',
  'Keep it simple: choose the answer that best describes the site.': '化繁为简：为每项选择最符合现场实际情况的描述。',
  '100% of points': '获得 100% 权重分',
  '50% of points': '获得 50% 权重分',
  '0 points': '0 分',
  'Not scored': '暂不计分',
  '"Not sure" is not a penalty. Complete all five ratings to receive a final score.': '“待确认”不会扣分。完成全部 5 项有效评估后即可生成最终总分。',
  'Live assessment results': '实时评估结果',
  'Next: Site Partner Earnings →': '下一步：点位方收益测算 →',
  'Next: Site Partner Earnings': '下一步：点位方收益测算',
  'Reset example': '恢复示例参数',
  'Save Estimate': '保存测算',
  'Estimate what the property could earn and choose the right partnership setup for the location.': '估算物业方在合作期内的潜在收益，并明确分成比例、固定月租或纯便民配套的合作方案。',
  'Location & Sales Assumptions': '点位与销售预估',
  'Use a reasonable estimate. Exact sales data is not required at this stage.': '使用合理预估即可，现阶段无需精确历史销售数据。',
  'Property earnings estimate': '物业收益测算',
  'Estimated Items Sold / Day': '预估日均销售件数 (件)',
  'Average Selling Price / Item': '平均商品售价 ($ / 件)',
  'Operating Days / Month': '每月营业天数',
  'Partnership Term (Months)': '合作期限 (月)',
  'Enter months directly, e.g. 30': '直接输入月份数，如 30',
  'Estimated monthly sales = daily items sold × average selling price × operating days. The estimate is used only to calculate the property’s potential earnings.': '预计月销售额 = 日均销售件数 × 平均商品售价 × 每月营业天数。该估算仅用于计算点位方的潜在合作收益。',
  'Partnership Setup': '合作模式设置',
  'Choose how the property will benefit financially from the placement.': '选择物业方从本次智能零售柜投放中获得收益或价值的方式。',
  'Choose one': '三选一',
  'Partnership Model': '合作方式',
  'Revenue Share': '按销售额分成',
  'Property receives an agreed percentage of sales.': '物业按约定的月销售额比例获得分成。',
  'Fixed Monthly Rent': '固定月租',
  'Operator pays an agreed monthly placement fee.': '运营商按月向物业支付固定的场地租金。',
  'Amenity-Only': '纯便民配套',
  'No direct payment; the cooler is provided as a site amenity.': '无直接租金；设备作为场地便民福利配套提供。',
  'Property Revenue Share (%)': '点位方销售额分成比例 (%)',
  'Site Partner Share of Sales (%)': '点位方销售额分成 (%)',
  'Example: 10% of the agreed sales base.': '示例：按双方约定销售额基数的 10% 计算分成。',
  'Fixed Monthly Rent ($)': '固定场地月租金 ($ / 月)',
  'Enter the monthly placement fee agreed with the property.': '输入与物业方约定的每月固定场地费用。',
  'The Smart Cooler is provided as a site amenity. Direct monthly payment is $0; the value is convenience and service rather than revenue share or rent.': '智能零售柜作为场地便民福利设施免费投放，直接月度分成或租金为 $0；核心价值在于为住户、员工或访客提供 24/7 即时便利服务，无需物业投入人力物力。',
  'Define the sales basis in the written agreement (for example, gross sales or sales after refunds, discounts and applicable taxes). This calculator does not determine the contract definition.': '请在书面合作协议中明确销售额核算基数（例如总销售额，或扣除退款、折扣及适用税费后的净销售额）。本测算工具不决定具体合同条款定义。',
  'Estimated Monthly Partner Earnings': '物业预计每月可获得',
  'Estimated Annual Earnings': '预计年收益',
  'Partnership-Term Earnings': '合作期累计收益',
  'Estimated Monthly Sales': '预计月销售额',
  'Partnership Term': '合作期限',
  'Based on agreed fixed monthly rent': '基于约定的固定月租金',
  'No direct monetary payment': '纯便民配套投放（无直接货币分成）',
  'Amenity-Only Placement': '纯便民配套投放',
  'Amenity-Only ($0 Monthly Fee)': '纯便民配套（$0 月租）',
  'Illustrative estimate, not a sales or earnings guarantee. Actual results depend on sales, operating days and the written partnership terms.': '以上为基于输入参数的测算示例，不构成销售额或收益保证。实际结果取决于现场销量、营业天数及书面合作条款。',
  'Next: Create a Business Proposal →': '下一步：创建商业提案 →',
  'Next: Create a Business Proposal': '下一步：创建商业提案',
  'Edit or toggle proposal modules on the left to update the live preview on the right; export as a webpage or print/save as PDF.': '左侧按模块填写或勾选内容，右侧实时生成提案预览；支持一键导出独立网页或打印保存 PDF。',
  'Load Example': '载入示例',
  'Export Proposal ↗': '导出提案网页 ↗',
  'Proposal Modules': '提案模块设置',
  'Modules 01 & 02 are required core sections; check or uncheck 03–08 as needed.': '01、02 为必选核心模块；03–08 可按需打勾启用或取消隐藏',
  'Partnership Overview': '合作方案概述',
  'REQUIRED': '必选模块',
  'Proposal Title': '提案标题',
  'Property / Location Name': '物业 / 点位名称',
  'City': '所在城市',
  'Estimated Launch Date': '预计上线时间',
  'Operator Name': '运营商名称',
  'Contact Name': '联系人',
  'Contact Email': '联系人邮箱',
  'Contact Phone': '联系电话',
  'Recommended Equipment & Site Rendering': '推荐设备与部署方案',
  '+ Add Equipment': '+ 增加设备',
  'Venue Value Proposition': '场地合作价值',
  'Reset Default Copy': '恢复默认文案',
  'Auto-populated 4 core value points by venue (each line formats as a bullet item; text before ":" is automatically bolded)': '根据场地类型自动匹配 4 条核心价值（每行自动按圆点列表对齐，包含冒号“：”会自动加粗前缀）',
  'Product Mix & Merchandising': '商品组合与陈列建议',
  'Reset Product Mix': '恢复默认组合',
  'Auto-populated product mix by venue (each line formats as a bullet item; category names before ":" are automatically bolded)': '根据场地类型自动带入推荐商品组合（每行自动按圆点列表对齐，包含冒号“：”会自动加粗类别名）',
  'Partnership Model & Property Earnings': '物业合作与收益方式',
  'Sync Earnings Estimate': '同步收益测算数据',
  'Daily Operations & Warranty Support': '日常运营与质保售后',
  'TURNKEY OPS': '省心托管',
  '1. Daily Operations': '1. 日常运营说明',
  '2. Warranty & After-Sales Support': '2. 质保与售后说明',
  'Manage Compliance Docs →': '管理合规文件库 →',
  'Check compliance files to attach (new files added in Compliance Center sync here automatically)': '勾选本次提案需要附带的合规资料（在「合规文件中心」新增的文件会自动同步到此处）',
  'Exported web proposals include download links for configured files; printing or saving as PDF automatically formats them as a formal verification checklist.': '导出网页版提案时将附带已配置的文件下载链接；打印或保存 PDF 时将自动转换为正式的纸质资质核验清单。',
  'Final Arrangements & Additional Notes': '后续确认事项与补充说明',
  'PRE-INSTALL': '安装前确认',
  '1. Items to Be Confirmed': '1. 后续确认事项',
  '2. Additional Notes': '2. 补充说明',
  '+ Add Custom Section': '+ 添加自定义模块',
  'Save to Current Project': '保存到当前项目',
  'Live preview updates automatically as you toggle or edit modules': '提案预览会随勾选和输入自动实时更新',
  'Live Preview': '实时预览',
  'Print / Save as PDF ↗': '打印 / 保存 PDF ↗',
  'Organize equipment certificates, food safety materials, insurance, and tax documents for property reviews.': '集中管理设备认证、食品安全资料、保险证明和税务文件，按物业要求整理材料。',
  'Add File Link': '添加文件链接',
  'Make property reviews clearer and more efficient.': '让物业审查更清晰、更高效。',
  'Add access-controlled Google Drive or HTTPS file links. No fictional certifications are included.': '填写权限受控的 Google Drive 或 HTTPS 文件链接。当前页面不包含任何虚构认证。',
  'Document Handling Notice': '资料管理注意事项',
  'W-9 forms may contain tax IDs and COI files may contain policy details. Keep them in access-controlled Google Drive folders rather than public GitHub repositories. Present ADA details as accessibility guidance rather than an unverified certification.': 'W-9 可能包含企业税务识别信息，COI 也可能包含保单信息。建议放在有访问权限控制的 Google Drive 中，不要将敏感文件提交到公开 GitHub 仓库。ADA 通常应作为无障碍合规说明或适用性资料呈现，不应在未核实的情况下称为“认证”。',
  'View and manage location projects saved in this browser.': '查看和管理保存在当前浏览器中的点位项目。',
  'Search location or city': '搜索点位名称或城市',
  'Name the project first, then add the location assessment, earnings estimate, and proposal details.': '先创建项目名称，之后可以逐步补充点位评估、收益测算和提案内容。',
  'Project / Location Name': '项目 / 点位名称',
  'Cancel': '取消',
  'Save': '保存',
  'Create Project ↗': '创建项目 ↗',
  'Confirm Project Deletion': '确认删除项目',
  'Confirm Delete': '确认删除',
  'Enter an access-controlled Google Drive or HTTPS file link.': '请填写受控访问的 Google Drive 或 HTTPS 文件链接。',
  'Document Title': '文件名称',
  'File Link (HTTPS / Google Drive)': '文件链接 (HTTPS / Google Drive)',
  'Total Projects': '项目总数',
  'Assessments Completed': '已完成评估',
  'Average Location Score': '平均点位得分',
  'Proposals Created': '已生成提案',
  'Saved in this browser': '当前浏览器已保存',
  'Projects with a location assessment': '包含点位评分的项目',
  'Out of 100': '满分 100',
  'Shown after assessment': '完成评估后显示',
  'Proposals with saved details': '已填写提案内容',
  'No projects yet': '暂无项目数据',
  'No matching projects': '暂无相关项目',
  'Estimated Monthly Site Partner Earnings': '点位方预计月收益',
  'Gym & Fitness Center': '健身房与运动中心',
  'Factory & Industrial Plant': '工厂与工业园区',
  'Airport & Transit Hub': '机场与交通枢纽',
  'Apartment & Residential': '公寓与住宅社区',
  'Construction Site': '建筑工地与施工现场',
  'Hospital & Medical Center': '医院与医疗中心',
  'Hotel & Hospitality': '酒店与文旅住宿',
  'Office & Corporate Campus': '写字楼与企业园区',
  'School & University Campus': '学校与大学校园',
  'Direct Outreach': '自主开发',
  'Website Inquiry': '网站留言',
  'Customer / Friend Referral': '客户 / 朋友推荐',
  'Other': '其他',
  'Small office: Office Manager; Large office: Facilities / Workplace Manager; Multi-tenant building: Property Manager or front desk. Confirm whether an enterprise vendor agreement exists.': '小办公室：Office Manager；大型办公室：Facilities / Workplace Manager；多租户办公楼：Property Manager 或前台。先确认是否存在企业级统一供应商协议。',
  'Contact the Property Manager first, and confirm whether a Regional or Corporate Property Manager holds final approval authority.': '优先联系 Property Manager（物业经理），必要时进一步确认区域 / Corporate Property Manager 是否拥有最终审批权。',
  'Contact the Plant Manager, HR lead, or Facilities / EHS manager; highlight 24/7 refreshment access across shifts with zero staffing burden.': '优先联系 Plant Manager（厂长）、HR 负责人或 Facilities / EHS 部门，重点沟通夜班/倒班员工的即时餐饮福利与免人工管理优势。',
  'Independent gym: Owner or General Manager; Chain / franchise: General Manager, and verify whether a national vendor contract is already in place.': '独立健身房：Owner 或 General Manager；连锁 / 加盟店：General Manager，并先核实是否已有全国性合作协议。',
  'Contact the General Manager, Director of Operations, or Facilities Manager; for hotel chains, verify brand or corporate procurement standards.': '优先联系 General Manager、Director of Operations 或 Facilities Manager；大型连锁酒店需确认品牌或集团采购要求。',
  'Contact the Facilities Manager, administration, or purchasing lead; public institutions usually require RFP and vendor onboarding steps.': '优先联系 Facilities Manager、学校行政或采购负责人；公立机构通常还需确认招标和供应商准入流程。',
  'Contact Facilities, Supply Chain, or Purchasing, and review hospital vendor onboarding, insurance, and health compliance requirements.': '优先联系 Facilities / Supply Chain / Purchasing 部门，并提前了解院内供应商准入、保险及卫生审查要求。',
  'Contact Airport/Transit Concessions, Commercial Management, or Facilities to confirm security clearance, compliance credentials, and power access.': '优先联系机场/车站商业管理部（Concessions / Commercial Management）或 Facilities 部门，提前核实安检准入、合规资质与供电条件。',
  'Contact the Project Manager, Site Superintendent, or EHS lead; highlight heat-safety hydration, on-site crew refueling, and stable 110–120V power.': '优先联系项目经理（Project Manager）、Site Superintendent 或安全/后勤负责人，重点沟通高温补水、工间补给及临时电源稳定保障。',
  'NAMA Certification': 'NAMA 认证资料',
  'UL / ETL Electrical Safety': 'UL / ETL 电气安全资料',
  'NSF Sanitation & Food Safety': 'NSF 食品卫生资料',
  'FCC Wireless Compliance': 'FCC 无线电合规资料',
  'ADA Accessibility Guidance': 'ADA 无障碍合规说明',
  'Certificate of Insurance (COI)': '责任保险证明 (COI)',
  'W-9 Tax Form': 'W-9 税务表格',
  'Industry Certification': '行业认证',
  'Equipment Certification': '设备认证',
  'Food Safety': '食品安全',
  'Site Compliance': '场地合规',
  'Insurance': '保险文件',
  'Tax Document': '税务文件',
  'Supplemental Document': '补充文件',
  'Custom supplemental document. Please verify content and validity.': '自定义补充资料，请核对文件内容及有效期。',
  'Custom document': '自定义资料',
  'NAMA certification file included in the repository. Verify applicability and recipient before sharing.': '仓库当前提供的 NAMA 认证文件。分享前请确认文件适用范围及接收对象。',
  'Documents electrical safety testing and certification. Provide the certificate matching the selected machine model.': '用于说明设备电气安全测试或认证情况。请上传适用于对应机器型号的真实证书。',
  'Addresses property review requirements regarding food-contact materials and sanitation standards.': '用于回应物业对食品接触材料、卫生或相关标准的审查要求。',
  'Details FCC compliance for wireless communication modules and electronics inside the machine.': '用于说明设备内无线通信模块或相关电子设备的 FCC 合规信息。',
  'Explains placement and operational accessibility considerations. Not a standalone "ADA certificate".': '用于说明设备布置和使用流程对无障碍要求的考虑。不是默认存在的“ADA 认证”。',
  'Operator liability insurance certificate for the property (typically $2M coverage; verify actual policy limits).': '运营商向物业提供的保险凭证。领导需求中提到 $2M 责任险，实际额度以保单为准。',
  'Tax identification form requested by properties for commission payouts. Contains sensitive tax information.': '物业可能要求运营商提供的税务信息表。该文件可能包含敏感税务识别信息。',
  'For NAMA certification reference only': '仅用于 NAMA 认证资料',
  'Verify certificate scope by machine model': '按机器型号核对证书范围',
  'Confirm specific standards and scope': '确认具体标准及适用范围',
  'Verify module, model, and filing entity': '核对模块、型号及申报主体',
  'Review with site layout and local regulations': '需结合安装环境和适用法规审查',
  'Check insured entity, coverage limits, expiration, and additional insured terms': '检查被保险人、保额、有效期及附加被保险人要求',
  'Share only through access-controlled channels': '建议仅通过授权受控渠道分享',
  'Link Configured': '已配置链接',
  'To Be Provided': '待补充',
  'Repository Certificate File': '仓库认证文件',
  'Edit Link': '修改链接',
  'Add Drive Link': '添加 Drive 链接',
  'Download Certificate ↓': '下载认证资料 ↓',
  'Open / Download File ↗': '打开 / 下载资料 ↗',
  'Link Not Configured': '下载资料 (待补充)',
  'Assessed': '已评估',
  'In Progress': '进行中',
  'Current Project': '当前项目',
  'Open': '打开',
  'Delete': '删除',
  'City not provided': '城市待补充',
  'Not assessed': '待评估',
  'Estimate needed': '待测算',
  'Just now': '刚刚',
  'Untitled Location Project': '未命名点位项目',
  'e.g. Sunrise Apartments': '例如: Sunrise Apartments',
  'e.g. Tampa, FL': '例如: Tampa, FL',
  'e.g. 300': '例如: 300',
  'e.g. Residents, employees, visitors': '例如: 住户、员工、访客',
  'e.g. 30': '例如: 30',
  'e.g. Property Manager': '例如: Property Manager',
  'e.g. Lobby lounge area, keycard access for residents, no convenience store nearby...': '例如: 大堂有休息区，住户刷卡进入，附近没有便利店......',
  'Property name': '物业名称',
  'Operator company name': '运营公司名称',
  'Full name': '姓名',
  'e.g. 2-4 weeks after approval': '例如: 双方确认后 2-4 周',
  'e.g. Machine Spec Sheet / Additional Insured Endorsement': '例如: 设备规格表 / 保险附加被保险人证明',
  'Smart Retail Amenity Partnership Proposal': '智能零售柜点位合作提案',
  'A turnkey smart retail amenity proposal tailored for your property': '为物业空间提供便捷的智能零售服务合作方案',
  'Prepared For': '提案对象',
  'Operating Partner': '合作运营商',
  'Proposal Draft · Subject to final written agreement': '提案草案 · 以双方最终书面协议为准',
  'Digital copy available upon request': '可按需提供电子版',
  'Verified & available for property review': '资质已备齐，随提案附交或按需提供',
  'No compliance documents are attached to this proposal yet. Configure links in the Compliance Center and check the items to include.': '本次提案暂未附带合规文件。根据物业审查要求，可在合规文件中心配置资料链接后重新勾选。',
  'Link permissions and validity are managed by the document provider; sensitive files are shared only with authorized recipients.': '文件链接的可访问权限和有效期由资料提供方负责确认；敏感文件仅向授权接收人分享。',
  'The figures above are model estimates based on input assumptions and do not guarantee sales or property revenue. Actual results depend on foot traffic, product mix, pricing, and operating hours.': '以上为输入参数下的测算示例，不构成销售额或点位方收益保证。实际结果取决于现场客流、商品、价格、营业时间及运营情况。',
  'The Operator is responsible for product sourcing, regular restocking, machine cleaning, and routine maintenance. The Operator will monitor inventory and machine status, and coordinate with the Property Owner regarding site access and operational arrangements.': '运营商负责商品采购、定期补货、设备清洁及日常维护，并持续关注商品库存和设备运行状态。运营商与点位方协调现场进出及日常运营安排。',
  'The Property Owner agrees to provide a suitable installation area, access to electricity, and reasonable site access for restocking, cleaning, and maintenance. Both parties will coordinate any site-specific requirements to ensure smooth daily operations.': '点位方负责提供合适的设备安装区域、电源及合理的现场进出权限，以便运营商开展补货、清洁和维护工作。双方共同协调场地特殊要求，确保日常运营顺利进行。',
  'The Operator is responsible for monitoring machine alerts, coordinating troubleshooting and repair services, and handling warranty claims through the equipment manufacturer, subject to applicable warranty terms. The Operator will maintain applicable business liability insurance and provide proof of coverage upon request.': '运营商负责关注设备异常提醒、协调故障排查及维修服务，并根据适用的设备质保条款，通过设备制造商协调质保申请及技术支持。运营商应维持适用的商业责任保险，并根据要求提供保险证明。',
  'The Property Owner agrees to notify the Operator of any equipment issues, damage, or unusual conditions observed on-site, and to avoid unauthorized relocation, opening, or tampering with the machine. The Operator will coordinate necessary follow-up actions and keep the Property Owner informed of relevant service arrangements.': '点位方负责及时告知运营商现场发现的设备故障、损坏或异常情况，不得擅自移动、开启或拆卸设备。运营商负责协调后续处理，并及时向点位方同步相关服务安排。',
  'The following details will be confirmed by both parties before installation:': '设备安装前，双方需进一步确认以下事项：',
  'Final machine placement and installation area.': '最终设备摆放位置及安装区域。',
  'Power supply and network availability.': '现场电源及网络条件。',
  'Approved product categories and any site-specific restrictions.': '允许销售的商品类别及场地特殊限制。',
  'Responsibility for electricity and other applicable site costs.': '电费及其他相关场地费用的承担方式。',
  'Revenue-sharing percentage or rental arrangement.': '销售分成比例或固定场地租金。',
  'Installation date, site access, and operating hours.': '设备安装时间、现场进出权限及运营时间。',
  'Any additional requirements, site-specific arrangements, or special terms agreed upon by both parties may be documented here. Final arrangements will be subject to mutual agreement between the Property Owner and the Operator.': '双方商定的任何其他要求、场地特殊安排或特别条款均可在此处记录。最终合作安排以点位方与运营商双方达成的共同协议为准。',
  '2-4 weeks after approval': '双方确认后 2-4 周',
  'Open menu': '打开菜单',
  'Close': '关闭',
  'HAHA Vending Home': 'HAHA Vending 首页',
  'Main Navigation': '主导航',
  'Please enter a location name first.': '请先填写点位名称。',
  'Location assessment saved to local project.': '点位评估已保存到本地项目。',
  'Site partner earnings estimate saved to current project.': '点位方收益测算已保存到当前项目。',
  'Proposal details saved to current project.': '提案信息已保存到当前项目。',
  'Please enter a project name.': '请填写项目名称。',
  'Project created. Start entering location details.': '项目已创建，开始填写点位信息。',
  'Assessment ratings and readiness checks reset.': '点位评估参数已重置。',
  'Partner earnings assumptions restored to example values.': '收益测算参数已恢复为示例值。',
  'Please enter the property or location name before exporting.': '建议先填写物业 / 点位名称，再导出提案。',
  'Standalone proposal HTML exported.': '已导出独立提案网页 HTML。',
  'Example proposal loaded. Replace with actual property details.': '已载入示例提案内容，请替换为真实信息。',
  'Synced site partner earnings data to proposal.': '已同步点位方收益测算数据到提案。',
  'Document link saved locally.': '文件链接信息已保存到本地。',
  'Project deleted.': '项目已删除。',
  'Local save failed. Please check browser storage or privacy settings.': '本地保存失败，请检查浏览器存储空间或隐私设置。',
  'Invalid URL format. Please enter a full URL starting with https:// or http://.': '链接格式不正确，请使用 https:// 或 http:// 开头的完整链接。',
  'Special Partnership Terms': '特别合作约定'
};

const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim();
Object.values(VENUE_TEMPLATES || {}).forEach(tpl => {
  const pairs = [
    [tpl.valueEn, tpl.valueZh],
    [tpl.planogramEn, tpl.planogramZh]
  ];
  pairs.forEach(([enBlock, zhBlock]) => {
    if (!enBlock || !zhBlock) return;
    enToZh[normalize(enBlock)] = zhBlock;
    const enLines = enBlock.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    const zhLines = zhBlock.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    if (enLines.length === zhLines.length) {
      enLines.forEach((eLine, i) => {
        enToZh[normalize(eLine)] = zhLines[i];
      });
    }
  });
});
const zhToEn = Object.fromEntries(
  Object.entries(enToZh).map(([en, zh]) => [normalize(zh), en])
);

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const listeners = new Set();

function readInitialLanguage() {
  try {
    return localStorage.getItem('haha_pitch_lang_v2') === 'zh' ? 'zh' : 'en';
  } catch {
    return 'en';
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

export function translateToZh(value) {
  const key = normalize(value);
  if (!key) return value;
  if (enToZh[key]) return enToZh[key];

  let match = key.match(/^(\d+) points$/);
  if (match) return `${match[1]} 分`;

  match = key.match(/^(\d+) of (\d+) rated · (\d+) to verify$/);
  if (match) return `已评 ${match[1]} / ${match[2]} 项 · ${match[3]} 项待确认`;

  match = key.match(/^(\d+) of (\d+) rated$/);
  if (match) return `已评 ${match[1]} / ${match[2]} 项`;

  match = key.match(/^Check: (.+)$/);
  if (match) return `重点核查：${translateToZh(match[1])}`;

  match = key.match(/^(\d+) conditions? marked unavailable\. Confirm whether the issue can be resolved\.$/);
  if (match) return `有 ${match[1]} 项条件标记为不具备或不允许，请确认是否可以协调解决。`;

  match = key.match(/^(\d+) items? still need to be checked before installation\.$/);
  if (match) return `还有 ${match[1]} 项条件需要在正式安装前进一步核实。`;

  match = key.match(/^Based on (\d+(?:\.\d+)?)% revenue share$/);
  if (match) return `基于 ${match[1]}% 销售额分成`;

  match = key.match(/^(\d+(?:\.\d+)?)% Revenue Share$/);
  if (match) return `${match[1]}% 销售额分成`;

  match = key.match(/^(\d+(?:\.\d+)?)% of monthly sales$/);
  if (match) return `按销售额分成 ${match[1]}%`;

  match = key.match(/^Fixed monthly rent (.+)$/);
  if (match) return `固定月租 ${match[1]}`;

  match = key.match(/^Opened project: (.+)$/);
  if (match) return `已打开项目：${match[1]}`;

  match = key.match(/^Delete project "(.+)"\? This action cannot be undone\.$/);
  if (match) return `确定删除「${match[1]}」吗？此操作不可恢复。`;

  match = key.match(/^(\d+) projects?$/);
  if (match) return `${match[1]} 个项目`;

  match = key.match(/^(\d+(?:\.\d+)?)\s*months?$/);
  if (match) return `${match[1]} 个月`;

  match = key.match(/^(\d+) unit\(s\)$/);
  if (match) return `${match[1]} 台`;

  match = key.match(/^Updated (.+)$/);
  if (match) return `更新于 ${translateToZh(match[1])}`;

  match = key.match(/^(.+) · Updated (.+)$/);
  if (match) return `${translateToZh(match[1])} · 更新于 ${translateToZh(match[2])}`;

  match = key.match(/^Score: (.+) \/ 100$/);
  if (match) return `点位评分：${translateToZh(match[1])} / 100`;

  match = key.match(/^View \/ Download (.+) ↗$/);
  if (match) return `查看 / 下载 ${translateToZh(match[1])} ↗`;

  match = key.match(/^Link: (.+)$/);
  if (match) return `链接：${match[1]}`;

  return value;
}

export function translateToEn(value) {
  const key = normalize(value);
  if (!key) return value;
  if (zhToEn[key]) return zhToEn[key];

  let match = key.match(/^(\d+) 分$/);
  if (match) return `${match[1]} points`;

  match = key.match(/^已评 (\d+) \/ (\d+) 项 · (\d+) 项待确认$/);
  if (match) return `${match[1]} of ${match[2]} rated · ${match[3]} to verify`;

  match = key.match(/^已评 (\d+) \/ (\d+) 项$/);
  if (match) return `${match[1]} of ${match[2]} rated`;

  match = key.match(/^重点核查：(.+)$/);
  if (match) return `Check: ${translateToEn(match[1])}`;

  match = key.match(/^基于 (\d+(?:\.\d+)?)% 销售额分成$/);
  if (match) return `Based on ${match[1]}% revenue share`;

  match = key.match(/^(\d+(?:\.\d+)?)% 销售额分成$/);
  if (match) return `${match[1]}% Revenue Share`;

  match = key.match(/^按销售额分成 (\d+(?:\.\d+)?)%$/);
  if (match) return `${match[1]}% of monthly sales`;

  match = key.match(/^固定月租 (.+)$/);
  if (match) return `Fixed monthly rent ${match[1]}`;

  match = key.match(/^(\d+(?:\.\d+)?)\s*个月$/);
  if (match) return `${match[1]} months`;

  match = key.match(/^查看 \/ 下载 (.+) ↗$/);
  if (match) return `View / Download ${translateToEn(match[1])} ↗`;

  return value;
}

export function t(value) {
  return language === 'zh' ? translateToZh(value) : translateToEn(value);
}

export function translateMultiline(text) {
  if (!text) return '';
  const raw = String(text).trim();
  for (const field of Object.keys(PROPOSAL_DEFAULTS.en)) {
    if (raw === PROPOSAL_DEFAULTS.en[field].trim() || raw === PROPOSAL_DEFAULTS.zh[field].trim()) {
      return language === 'zh' ? PROPOSAL_DEFAULTS.zh[field] : PROPOSAL_DEFAULTS.en[field];
    }
  }
  for (const tpl of Object.values(VENUE_TEMPLATES || {})) {
    if (raw === tpl.valueEn.trim() || raw === tpl.valueZh.trim()) {
      return language === 'zh' ? tpl.valueZh : tpl.valueEn;
    }
    if (raw === tpl.planogramEn.trim() || raw === tpl.planogramZh.trim()) {
      return language === 'zh' ? tpl.planogramZh : tpl.planogramEn;
    }
  }
  return String(text)
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      const bulletMatch = trimmed.match(/^([-•*])\s+(.*)$/);
      if (bulletMatch) {
        const marker = bulletMatch[1];
        const core = bulletMatch[2];
        const converted = language === 'zh' ? translateToZh(core) : translateToEn(core);
        return `${marker} ${converted}`;
      }
      return language === 'zh' ? translateToZh(trimmed) : translateToEn(trimmed);
    })
    .join('\n');
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
  } else if (!restore && enToZh[currentTrimmed]) {
    originalText.set(node, currentRaw);
  }

  const savedRaw = originalText.get(node);
  if (restore) {
    const restored = zhToEn[currentTrimmed]
      ? currentRaw.replace(currentRaw.trim(), zhToEn[currentTrimmed])
      : savedRaw;
    if (node.nodeValue !== restored) {
      node.nodeValue = restored;
    }
    return;
  }

  const sourceTrimmed = normalize(savedRaw);
  const translatedCore = translateToZh(sourceTrimmed);
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
        const nextValue = restore ? original : translateToZh(original);
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
  language = next === 'zh' ? 'zh' : 'en';
  try {
    localStorage.setItem('haha_pitch_lang_v2', language);
  } catch {
    // ignore storage restriction
  }
  document.documentElement.lang = language === 'zh' ? 'zh' : 'en';
  document.body.dataset.language = language;
  lockSelectOptionValues();
  listeners.forEach(fn => {
    try { fn(language); } catch (e) { console.error(e); }
  });
  // Source DOM is English ('en'): restore=true when language === 'en', translate to 'zh' when language === 'zh'
  visit(document.body, language === 'en');
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
      setLanguage(language === 'en' ? 'zh' : 'en');
    });
  }

  if (!observerInitialized) {
    observerInitialized = true;
    const observer = new MutationObserver(records => {
      if (language !== 'zh' || isTranslating) return;
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
