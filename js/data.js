/* =========================================================
   数据定义：5项点位条件评估、4项部署准备度、9大场地类型、机型参数、合规文件与格式化工具
   ========================================================= */
export const VENUE_TYPES = [
  { id: 'Gym & Fitness Center', zh: '健身房与运动中心', en: 'Gym & Fitness Center' },
  { id: 'Factory & Industrial Plant', zh: '工厂与工业园区', en: 'Factory & Industrial Plant' },
  { id: 'Airport & Transit Hub', zh: '机场与交通枢纽', en: 'Airport & Transit Hub' },
  { id: 'Apartment & Residential', zh: '公寓与住宅社区', en: 'Apartment & Residential' },
  { id: 'Construction Site', zh: '建筑工地与施工现场', en: 'Construction Site' },
  { id: 'Hospital & Medical Center', zh: '医院与医疗中心', en: 'Hospital & Medical Center' },
  { id: 'Hotel & Hospitality', zh: '酒店与文旅住宿', en: 'Hotel & Hospitality' },
  { id: 'Office & Corporate Campus', zh: '写字楼与企业园区', en: 'Office & Corporate Campus' },
  { id: 'School & University Campus', zh: '学校与大学校园', en: 'School & University Campus' }
];

export const LEGACY_VENUE_MAP = {
  '公寓 / 多户住宅': 'Apartment & Residential',
  'Apartments / Multifamily': 'Apartment & Residential',
  '公寓与住宅社区 (Apartment & Residential)': 'Apartment & Residential',
  '公寓与住宅社区': 'Apartment & Residential',
  '办公楼': 'Office & Corporate Campus',
  'Office Building': 'Office & Corporate Campus',
  '写字楼与企业园区 (Office & Corporate Campus)': 'Office & Corporate Campus',
  '写字楼与企业园区': 'Office & Corporate Campus',
  '工厂 / 仓储': 'Factory & Industrial Plant',
  'Factory / Warehouse': 'Factory & Industrial Plant',
  '工厂与工业园区 (Factory & Industrial Plant)': 'Factory & Industrial Plant',
  '工厂与工业园区': 'Factory & Industrial Plant',
  '酒店': 'Hotel & Hospitality',
  'Hotel / Hospitality': 'Hotel & Hospitality',
  '酒店与文旅住宿 (Hotel & Hospitality)': 'Hotel & Hospitality',
  '酒店与文旅住宿': 'Hotel & Hospitality',
  '健身房': 'Gym & Fitness Center',
  'Gym / Fitness Center': 'Gym & Fitness Center',
  '健身房与运动中心 (Gym & Fitness Center)': 'Gym & Fitness Center',
  '健身房与运动中心': 'Gym & Fitness Center',
  '学校 / 教育机构': 'School & University Campus',
  'School / Education': 'School & University Campus',
  '学校与大学校园 (School & University Campus)': 'School & University Campus',
  '学校与大学校园': 'School & University Campus',
  '医院 / 医疗机构': 'Hospital & Medical Center',
  'Hospital / Healthcare': 'Hospital & Medical Center',
  '医院与医疗中心 (Hospital & Medical Center)': 'Hospital & Medical Center',
  '医院与医疗中心': 'Hospital & Medical Center',
  '公共建筑': 'Airport & Transit Hub',
  'Public Building': 'Airport & Transit Hub',
  '机场与交通枢纽 (Airport & Transit Hub)': 'Airport & Transit Hub',
  '机场与交通枢纽': 'Airport & Transit Hub',
  '建筑工地与施工现场 (Construction Site)': 'Construction Site',
  '建筑工地与施工现场': 'Construction Site',
  '其他': 'Office & Corporate Campus',
  'Other': 'Office & Corporate Campus'
};

export function normalizeVenue(val) {
  if (!val) return 'Apartment & Residential';
  if (VENUE_TYPES.some(v => v.id === val)) return val;
  return LEGACY_VENUE_MAP[val] || 'Apartment & Residential';
}

export const VENUE_TEMPLATES = {
  'Gym & Fitness Center': {
    valueZh: `• 场内运动营养补给：让会员在训练前后方便购买蛋白饮料、运动饮料和健康零食。
• PIN 码会员专属福利：健身房可通过 PIN 码向会员发放饮品额度、新会员福利或活动奖励。
• 减轻前台售卖负担：会员自主选购和付款，减少前台处理商品销售的工作。
• 升级场馆配套体验：增加实用的全天候自助健身配套服务。`,
    valueEn: `• On-Site Sports Nutrition: Convenient access to protein shakes, sports drinks, and healthy snacks before and after workouts.
• Member Rewards with PIN: Issue drink credits, new-member perks, or challenge rewards directly via PIN codes.
• Less Front Desk Work: Members self-select and pay, reducing front-desk retail handling.
• Enhanced Member Experience: Adds a practical, modern fitness amenity for members.`,
    planogramZh: `• 饮料：瓶装水、蛋白饮料、电解质饮料、运动饮料。
• 食品：蛋白棒、能量棒、坚果、低糖零食。
• 其他：运动营养补给类商品（根据设备温控和当地销售规定）。
推荐重点：蛋白饮料 + 电解质饮料 + 蛋白棒。`,
    planogramEn: `• Beverages: Bottled water, protein shakes, electrolyte drinks, and sports drinks.
• Food: Protein bars, energy bars, mixed nuts, and low-sugar snacks.
• Other: Sports nutrition items (configured per temperature control and local rules).
Key Focus: Protein drinks + Electrolyte drinks + Protein bars.`
  },
  'Factory & Industrial Plant': {
    valueZh: `• 全班次全天候便利：为白班和夜班员工提供随时可购买的食品和饮料。
• PIN 码员工福利发放：管理方可通过 PIN 码发放加班补贴、夜班福利或节日奖励。
• 节省工间休息时间：员工无需离开厂区即可购买食品和饮品，节省休息时间。
• 实用省心的厂区配套：在不增加餐厅或人工成本的情况下，提升厂区福利配套。`,
    valueEn: `• Convenience for Every Shift: 24/7 access to food and beverages for both day and night shifts.
• Employee Benefits with PIN: Management can distribute overtime allowances, night-shift perks, or holiday rewards via PIN codes.
• Saves Break Time: Workers buy food and drinks without leaving the plant, saving break time.
• Practical Workplace Amenity: Upgrades facility amenities without adding cafeteria or staffing costs.`,
    planogramZh: `• 饮料：功能饮料、咖啡饮料、瓶装水、碳酸饮料、茶饮。
• 食品：三明治、面包、方便面/速食、饭团、饼干、巧克力、坚果。
• 其他：纸巾、湿巾、口香糖等日常小物件。
推荐重点：高饱腹感食品 + 功能饮料 + 夜班即食商品。`,
    planogramEn: `• Beverages: Energy drinks, ready-to-drink coffee, bottled water, soft drinks, and tea.
• Food: Sandwiches, pastries, cup noodles/instant meals, rice balls, crackers, chocolate, and nuts.
• Other: Tissues, wet wipes, chewing gum, and daily small essentials.
Key Focus: Filling food + Energy drinks + Night-shift ready-to-eat items.`
  },
  'Airport & Transit Hub': {
    valueZh: `• 旅客快速自助购买：为赶时间的旅客提供即拿即走的快速自助购买体验。
• 24 小时全天候供应：在部分商铺打烊后，仍能提供基础饮品、零食和旅行用品。
• 占地小且摆放灵活：机身紧凑，可灵活部署在候机区、到达层、员工区或通道附近。
• 兼顾旅客与员工需求：同时服务过往旅客与场站现场工作人员。`,
    valueEn: `• Fast Self-Service for Travelers: Quick grab-and-go checkout for time-sensitive passengers.
• 24/7 Availability: Provides essential drinks, snacks, and travel items even after terminal shops close.
• Small Footprint, Flexible Placement: Compact footprint fits waiting areas, arrival levels, staff zones, or concourses.
• Staff & Passenger Support: Serves both travelers and on-site transit personnel.`,
    planogramZh: `• 饮料：瓶装水、咖啡、功能饮料、果汁、茶饮。
• 食品：三明治、面包、能量棒、坚果、饼干、巧克力、便携零食。
• 旅行日用品：纸巾、湿巾、充电线、一次性洗漱用品、眼罩、耳塞。
推荐重点：即拿即走食品 + 瓶装水 + 旅行应急用品。`,
    planogramEn: `• Beverages: Bottled water, coffee, energy drinks, juice, and tea.
• Food: Sandwiches, pastries, energy bars, nuts, crackers, chocolate, and portable snacks.
• Travel Essentials: Tissues, wet wipes, charging cables, disposable toiletries, sleep masks, and earplugs.
Key Focus: Grab-and-go food + Bottled water + Emergency travel supplies.`
  },
  'Apartment & Residential': {
    valueZh: `• 住户楼下日常便利：住户无需外出即可在楼下购买常用饮品、零食和日用品。
• PIN 码住户福利互动：物业可通过 PIN 码向新住户、续租住户或社区活动发放消费福利。
• 现代化社区配套形象：提升公寓公共区域的便利性和现代化科技形象。
• 不增加物业人员负担：由运营商负责补货和日常维护，物业无需投入额外人力。`,
    valueEn: `• Everyday Convenience for Residents: Residents can buy everyday drinks, snacks, and household basics downstairs without going out.
• Resident Perks with PIN: Property teams can issue move-in gifts, lease renewal rewards, or event perks via PIN codes.
• Modern Community Amenity: Enhances the convenience and modern appeal of common areas.
• No Extra Work for Property Staff: Restocking and routine maintenance are fully handled by the operator.`,
    planogramZh: `• 饮料：瓶装水、气泡水、牛奶/植物奶、果汁、碳酸饮料、茶饮。
• 食品：早餐面包、酸奶、方便食品、薯片、坚果、雪糕/冷冻食品（如使用冷冻机型）。
• 日用品：纸巾、湿巾、洗衣凝珠、垃圾袋、牙刷牙膏、卫生用品、电池等应急生活用品。
推荐重点：高频饮品 + 夜间零食 + 家庭应急日用品。`,
    planogramEn: `• Beverages: Bottled water, sparkling water, milk/plant milk, juice, soft drinks, and tea.
• Food: Breakfast pastries, yogurt, convenience meals, chips, nuts, and ice cream/frozen food (with freezer models).
• Daily Essentials: Tissues, wet wipes, laundry pods, trash bags, toothbrushes/toothpaste, personal care, and batteries.
Key Focus: High-frequency drinks + Late-night snacks + Household emergency essentials.`
  },
  'Construction Site': {
    valueZh: `• 现场冰水与能量补给：方便现场人员随时补充冰水、功能饮料和饱腹食品。
• PIN 码施工团队福利：项目方可通过 PIN 码向施工团队发放高温补贴或福利额度。
• 减少外出提升效率：减少人员外出买水买饭的时间，提高现场作业效率。
• 点位部署灵活便捷：适合放置在项目部、休息区、集装箱办公区等位置。`,
    valueEn: `• Quick Access to Cold Drinks & Food: Easy access to ice-cold water, energy drinks, and filling food on site.
• Crew Support with PIN: Project managers can issue heat-relief allowances or crew rewards via PIN codes.
• Keeps Workers On Site: Reduces time spent leaving the site for water and meals, improving productivity.
• Flexible Deployment: Ideal for site trailers, break zones, and container offices.`,
    planogramZh: `• 饮料：大容量瓶装水、电解质水、运动饮料、功能饮料、冰咖啡、碳酸饮料。
• 食品：三明治、肉卷、面包、方便面、能量棒、饼干、牛肉干、坚果。
• 其他：湿巾、纸巾、防暑降温小用品（视情况配置）。
推荐重点：大容量冰水 + 电解质/功能饮料 + 高热量饱腹食品。`,
    planogramEn: `• Beverages: Large bottled water, electrolyte water, sports drinks, energy drinks, iced coffee, and soft drinks.
• Food: Sandwiches, wraps, pastries, instant noodles, energy bars, crackers, beef jerky, and nuts.
• Other: Wet wipes, tissues, and heat-relief supplies (as needed).
Key Focus: Large ice-cold water + Electrolyte/energy drinks + High-calorie filling food.`
  },
  'Hospital & Medical Center': {
    valueZh: `• 医护与家属 24 小时补给：为夜班医护人员和患者家属提供全天候食品和饮品支持。
• PIN 码医护关怀福利：院方可通过 PIN 码向医护人员发放夜班补贴或关怀福利。
• 候诊与探视就近便利：减少家属和访客离开院区寻找餐饮的不便。
• 整洁规范的托管运营：由运营商定期补货、清洁和维护，减少院方后勤管理负担。`,
    valueEn: `• 24/7 Access for Staff & Visitors: Round-the-clock food and beverage support for night-shift staff and patient families.
• Staff Appreciation with PIN: Hospital administration can issue night-shift allowances or care perks via PIN codes.
• Convenient Waiting Area Service: Saves families and visitors from leaving the medical center to find refreshments.
• Clean & Managed Operation: Scheduled restocking, sanitizing, and maintenance handled by the operator.`,
    planogramZh: `• 饮料：瓶装水、低糖茶饮、牛奶、酸奶饮品、咖啡、果汁、电解质饮料。
• 食品：三明治、沙拉、全麦面包、燕麦杯、酸奶、坚果、蛋白棒、清淡小零食。
• 日用品：纸巾、湿巾、口罩、免洗消毒用品、旅行装洗漱用品、充电线。
推荐重点：健康轻食 + 提神饮品 + 探视/陪护应急用品。`,
    planogramEn: `• Beverages: Bottled water, low-sugar tea, milk, yogurt drinks, coffee, juice, and electrolyte drinks.
• Food: Sandwiches, salads, whole-wheat bread, oatmeal cups, yogurt, nuts, protein bars, and light snacks.
• Essentials: Tissues, wet wipes, masks, hand sanitizer, travel toiletries, and charging cables.
Key Focus: Healthy light meals + Refreshing beverages + Visitor/caregiver emergency supplies.`
  },
  'Hotel & Hospitality': {
    valueZh: `• 住客 24 小时自助便利：为住客提供全天候饮品、零食和旅行用品购买服务。
• PIN 码宾客欢迎礼遇：酒店可通过 PIN 码向 VIP 客人、会员或活动住客发放欢迎福利。
• 智能商品识别与结算：设备通过智能识别技术自动完成商品识别与结算，减少传统开放式货架的人工核对和损耗问题。
• 减轻前台夜间工作量：减少前台夜间售卖商品或处理零散需求的工作负担。`,
    valueEn: `• 24/7 Guest Convenience: Round-the-clock access to beverages, snacks, and travel essentials for guests.
• Guest Welcome Perks with PIN: Hotels can issue welcome credits to VIPs, loyalty members, or event guests via PIN codes.
• AI-Powered Product Recognition & Transaction Tracking: Smart recognition automatically identifies products and completes checkout, delivering reduced shrinkage compared to open shelves.
• Lower Front Desk Workload: Reduces front-desk night sales and manual item handling.`,
    planogramZh: `• 饮料：瓶装水、气泡水、咖啡、果汁、茶饮、碳酸饮料、能量饮料。
• 食品：三明治、早餐糕点、方便面、薯片、坚果、巧克力、饼干、冰淇淋（如适用）。
• 旅行日用品：牙刷牙膏、剃须用品、湿巾、纸巾、充电线、耳塞、眼罩、女性护理用品。
推荐重点：夜间零食饮品 + 早餐轻食 + 旅行应急用品。`,
    planogramEn: `• Beverages: Bottled water, sparkling water, coffee, juice, tea, soft drinks, and energy drinks.
• Food: Sandwiches, breakfast pastries, instant noodles, chips, nuts, chocolate, cookies, and ice cream (where applicable).
• Travel Essentials: Toothbrush/toothpaste, shaving kits, wet wipes, tissues, charging cables, earplugs, sleep masks, and feminine care.
Key Focus: Late-night snacks & drinks + Breakfast light food + Emergency travel essentials.`
  },
  'Office & Corporate Campus': {
    valueZh: `• 楼内便捷餐饮与下午茶：员工在楼内即可随时购买咖啡、饮料、轻食和零食。
• PIN 码企业员工福利：企业或物业可通过 PIN 码发放员工福利、加班补贴或活动奖励。
• 节省工作日外出时间：减少员工外出买水、买咖啡或买零食的时间，提升办公效率。
• 现代化办公空间配套：提升写字楼或企业园区的整体配套服务品质。`,
    valueEn: `• Convenient Workplace Refreshments: Employees can buy coffee, beverages, light meals, and snacks right inside the building.
• Employee Perks with PIN: Employers or property teams can distribute staff perks, overtime subsidies, or event rewards via PIN codes.
• Saves Time During Workdays: Reduces time spent leaving the building for water, coffee, or snacks.
• Modern Office Amenity: Upgrades the amenity quality of office buildings and corporate campuses.`,
    planogramZh: `• 饮料：即饮咖啡、无糖茶、气泡水、果汁、牛奶、功能饮料、瓶装水。
• 食品：三明治、沙拉、酸奶、早餐面包、坚果、蛋白棒、黑巧、低负担零食。
• 其他：口香糖、薄荷糖、纸巾、湿巾、应急办公/个人小用品。
推荐重点：咖啡茶饮 + 早餐轻食 + 下午茶健康零食。`,
    planogramEn: `• Beverages: Ready-to-drink coffee, unsweetened tea, sparkling water, juice, milk, energy drinks, and bottled water.
• Food: Sandwiches, salads, yogurt, breakfast pastries, nuts, protein bars, dark chocolate, and light snacks.
• Other: Chewing gum, mints, tissues, wet wipes, and emergency office/personal items.
Key Focus: Coffee & tea + Breakfast light meals + Healthy afternoon snacks.`
  },
  'School & University Campus': {
    valueZh: `• 校园全天候便捷补给：方便学生和教职工在教学楼、图书馆、宿舍或活动中心随时购买饮品和食品。
• PIN 码校园活动与关怀福利：校方或合作方可通过 PIN 码发放活动奖励、志愿者补贴或关怀福利。
• 覆盖夜间自习与住宿时段：在食堂闭餐后，仍能为晚自习和住宿学生提供即时能量补给。
• 省心易管理的校园配套：由运营商负责日常补货、清洁与设备维护，不增加校方管理负担。`,
    valueEn: `• Convenient Campus Access: Easy access to drinks and food in academic buildings, libraries, dorms, or student centers.
• Student & Staff Perks with PIN: Schools or partners can issue event rewards, volunteer stipends, or care perks via PIN codes.
• Supports Extended Campus Hours: Provides refreshments for late-night study and dorm students after dining halls close.
• Easy-to-Manage Campus Service: Routine restocking, cleaning, and maintenance are fully handled by the operator.`,
    planogramZh: `• 饮料：瓶装水、茶饮、咖啡、碳酸饮料、果汁、牛奶、运动饮料、功能饮料（按学校规定配置）。
• 食品：面包、三明治、饭团、方便食品、酸奶、薯片、饼干、巧克力、坚果、能量棒。
• 日用品：纸巾、湿巾、文具应急品、充电线、个人护理用品（尤其适合宿舍区）。
推荐重点：高性价比饮品 + 课间/夜宵食品 + 宿舍日常应急用品。`,
    planogramEn: `• Beverages: Bottled water, tea, coffee, soft drinks, juice, milk, sports drinks, and energy drinks (per school policy).
• Food: Pastries, sandwiches, rice balls, convenience foods, yogurt, chips, cookies, chocolate, nuts, and energy bars.
• Daily Essentials: Tissues, wet wipes, emergency stationery, charging cables, and personal care items (ideal for dorms).
Key Focus: Great-value drinks + Between-class/late-night food + Dorm emergency essentials.`
  }
};

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

export const POWER_SUPPLY_SPEC = '110–120V / 60Hz';

export const MACHINE_MODELS = {
  'Mini 360': { width: 22.83, depth: 26.57, height: 76.38, kwh: '2.52 kWh / 24h', voltage: '110–120V / 60Hz', power: '210W' },
  'Plus 440': { width: 26.77, depth: 26.38, height: 76.38, kwh: '3.8 kWh / 24h', voltage: '110–120V / 60Hz', power: '365W' },
  'Pro 542': { width: 29.53, depth: 25.59, height: 79.53, kwh: '5.96 kWh / 24h', voltage: '110–120V / 60Hz', power: '380W' },
  'Freezer 550': { width: 27.56, depth: 33.07, height: 79.13, kwh: '8.59 kWh / 24h', voltage: '110–120V / 60Hz', power: '500W' },
  'Max 620S': { width: 31.50, depth: 26.38, height: 85.43, kwh: '6.96 kWh / 24h', voltage: '110–120V / 60Hz', power: '470W' },
  'Max 660': { width: 31.50, depth: 27.95, height: 79.53, kwh: '6.48 kWh / 24h', voltage: '110–120V / 60Hz', power: '450W' },
  'Ultra 1200': { width: 53.94, depth: 27.56, height: 79.53, kwh: '8.75 kWh / 24h', voltage: '110–120V / 60Hz', power: '703W' }
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
