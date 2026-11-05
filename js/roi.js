/* =========================================================
   点位方收益测算模型：固定月租或销售额分成（二选一）
   ========================================================= */
import { money } from './data.js';
import { getLanguage, t } from './i18n.js';

const ids = [
  'roiLocation', 'roiInvestment', 'roiOrders', 'roiTicket', 'roiDays',
  'roiCogs', 'roiDealType', 'roiShare', 'roiRent', 'roiLabor',
  'roiRestock', 'roiServiceCost', 'roiOpex', 'roiPeriod'
];
const read = id => document.getElementById(id);
const val = id => Number(read(id)?.value || 0);

export function readROIForm() {
  const labor = val('roiLabor');
  const restock = val('roiRestock');
  const serviceCost = val('roiServiceCost');
  const other = val('roiOpex');
  return {
    location: read('roiLocation')?.value.trim() || '',
    investment: val('roiInvestment'),
    orders: val('roiOrders'),
    ticket: val('roiTicket'),
    days: val('roiDays'),
    cogsRate: val('roiCogs'),
    dealType: read('roiDealType')?.value || 'revenueShare',
    shareRate: val('roiShare'),
    rent: val('roiRent'),
    labor,
    restock,
    serviceCost,
    other,
    opex: labor + restock + serviceCost + other,
    period: val('roiPeriod') || 36
  };
}

export function applyROIForm(data = {}) {
  const legacy = data.opex !== undefined && data.labor === undefined && data.restock === undefined && data.serviceCost === undefined && data.other === undefined;
  const defaults = {
    location: '',
    investment: 5500,
    orders: 50,
    ticket: 5.5,
    days: 30,
    cogsRate: 45,
    dealType: 'revenueShare',
    shareRate: 10,
    rent: 0,
    labor: 0,
    restock: 150,
    serviceCost: 50,
    other: 50,
    period: 36
  };
  const inferredDeal = data.dealType || (Number(data.rent) > 0 ? 'fixedRent' : 'revenueShare');
  const merged = { ...defaults, ...data, dealType: inferredDeal };
  if (legacy) {
    merged.labor = 0;
    merged.restock = 0;
    merged.serviceCost = 0;
    merged.other = Number(data.opex) || 0;
  }
  const map = {
    location: 'roiLocation',
    investment: 'roiInvestment',
    orders: 'roiOrders',
    ticket: 'roiTicket',
    days: 'roiDays',
    cogsRate: 'roiCogs',
    dealType: 'roiDealType',
    shareRate: 'roiShare',
    rent: 'roiRent',
    labor: 'roiLabor',
    restock: 'roiRestock',
    serviceCost: 'roiServiceCost',
    other: 'roiOpex',
    period: 'roiPeriod'
  };
  Object.entries(map).forEach(([key, id]) => {
    if (read(id)) read(id).value = merged[key] ?? defaults[key];
  });
  const periodLabel = document.getElementById('roiPeriodLabel');
  if (periodLabel) periodLabel.textContent = t(`${merged.period} 个月`);
  updateDealFields();
}

function updateDealFields() {
  const fixed = read('roiDealType')?.value === 'fixedRent';
  if (read('roiShareField')) read('roiShareField').hidden = fixed;
  if (read('roiRentField')) read('roiRentField').hidden = !fixed;
}

export function calculateROI(input = readROIForm()) {
  const monthlyRevenue = input.orders * input.ticket * input.days;
  const cogs = monthlyRevenue * input.cogsRate / 100;
  const grossProfit = monthlyRevenue - cogs;
  const propertyCommission = input.dealType === 'revenueShare' ? monthlyRevenue * input.shareRate / 100 : 0;
  const landlordIncome = input.dealType === 'fixedRent' ? input.rent : propertyCommission;
  const operatorProfit = grossProfit - landlordIncome - input.opex;
  const paybackMonths = operatorProfit > 0 ? input.investment / operatorProfit : null;
  const operatorPeriodNet = operatorProfit * input.period - input.investment;
  const landlordPeriodIncome = landlordIncome * input.period;
  return {
    ...input,
    monthlyRevenue,
    cogs,
    grossProfit,
    propertyCommission,
    landlordIncome,
    operatorProfit,
    paybackMonths,
    operatorPeriodNet,
    landlordPeriodIncome
  };
}

export function renderROI() {
  const input = readROIForm();
  const result = calculateROI(input);
  const isEn = getLanguage() === 'en';
  const periodLabel = document.getElementById('roiPeriodLabel');
  if (periodLabel) periodLabel.textContent = t(`${input.period} 个月`);
  updateDealFields();

  const monthlyEl = document.getElementById('landlordMonthly');
  if (monthlyEl) monthlyEl.textContent = money(result.landlordIncome);
  const annualEl = document.getElementById('landlordAnnual');
  if (annualEl) {
    annualEl.textContent = t(`年预计 ${money(result.landlordIncome * 12)} · ${input.period} 个月累计 ${money(result.landlordPeriodIncome)}`);
  }

  const dealText = input.dealType === 'fixedRent'
    ? t(`固定月租 ${money(input.rent)}`)
    : t(`销售额分成 ${input.shareRate}%`);

  const metrics = [
    [t('预计月销售额'), money(result.monthlyRevenue), t('日均销量 × 平均售价 × 营业天数')],
    [t('预计月商品毛利'), money(result.grossProfit), t(`商品成本率 ${input.cogsRate}%`)],
    [t('点位方预计月收入'), money(result.landlordIncome), dealText],
    [t('运营商预计月净收益'), money(result.operatorProfit), t(`商品毛利 - 点位方收入 - 运营成本 ${money(input.opex)}`)],
    [t('运营商预计回本周期'), result.paybackMonths ? t(`${result.paybackMonths.toFixed(1)} 个月`) : t('当前假设下无法回本'), t('初始投入 ÷ 运营商月净收益')],
    [t(`${input.period} 个月运营商净收益`), money(result.operatorPeriodNet), t('运营月净收益 × 测算期 - 初始投入')]
  ];

  const gridEl = document.getElementById('roiMetricGrid');
  if (gridEl) {
    gridEl.innerHTML = metrics.map(m => `<div class="metric-card"><span>${m[0]}</span><strong>${m[1]}</strong><small>${m[2]}</small></div>`).join('');
  }

  renderChart(result);

  const narrativeEl = document.getElementById('roiNarrative');
  if (narrativeEl) {
    if (isEn) {
      const expenseLines = [`Labor ${money(input.labor)}`, `Restocking/Travel ${money(input.restock)}`, `Payment/Network ${money(input.serviceCost)}`, `Other ${money(input.other)}`].join(' + ');
      const formula = input.dealType === 'fixedRent' ? `Fixed rent ${money(input.rent)}` : `${money(result.monthlyRevenue)} monthly sales × ${input.shareRate}%`;
      narrativeEl.innerHTML = `With <strong>${dealText}</strong>, the site partner earns an estimated <strong>${money(result.landlordIncome)}/mo</strong> (Formula: ${formula}). Operator monthly net earnings = Gross profit ${money(result.grossProfit)} - Partner earnings ${money(result.landlordIncome)} - Operating costs ${money(input.opex)} (${expenseLines}) = <strong>${money(result.operatorProfit)}</strong>. Over ${input.period} months, cumulative site partner revenue is est. <strong>${money(result.landlordPeriodIncome)}</strong> and cumulative operator net profit after initial investment is est. <strong>${money(result.operatorPeriodNet)}</strong>. Static estimate based on input assumptions; excludes taxes, depreciation, financing, and shrinkage.`;
    } else {
      const expenseLines = [`人工 ${money(input.labor)}`, `补货 / 交通 ${money(input.restock)}`, `支付 / 网络 ${money(input.serviceCost)}`, `其他 ${money(input.other)}`].join(' + ');
      const formula = input.dealType === 'fixedRent' ? `固定月租 ${money(input.rent)}` : `${money(result.monthlyRevenue)} 月销售额 × ${input.shareRate}%`;
      narrativeEl.innerHTML = `点位方选择<strong>${dealText}</strong>，每月预计获得 <strong>${money(result.landlordIncome)}</strong>。测算公式：点位方收入 = ${formula}。运营商月净收益 = 商品毛利 ${money(result.grossProfit)} - 点位方收入 ${money(result.landlordIncome)} - 运营成本 ${money(input.opex)} (${expenseLines}) = <strong>${money(result.operatorProfit)}</strong>。${input.period} 个月内点位方累计收入约 <strong>${money(result.landlordPeriodIncome)}</strong>；运营商扣除初始投入后的累计净收益约 <strong>${money(result.operatorPeriodNet)}</strong>。这是基于输入假设的静态估算，不包含税费、折旧、融资成本、库存损耗或未录入成本。`;
    }
  }
  return result;
}

function renderChart(result) {
  const chartEl = document.getElementById('roiChart');
  if (!chartEl) return;
  const buckets = 6;
  const values = Array.from({ length: buckets }, (_, i) => result.landlordIncome * result.period * ((i + 1) / buckets));
  const max = Math.max(1, ...values);
  chartEl.innerHTML = values.map((value, i) => {
    const isLast = i === buckets - 1;
    const months = Math.round(result.period * (i + 1) / buckets);
    return `
      <div class="chart-bar-wrap ${isLast ? 'highlight' : ''}">
        <span class="chart-bar-value">${money(value)}</span>
        <div class="chart-bar ${isLast ? 'highlight' : ''}" style="height:${Math.max(6, value / max * 100)}%" title="${money(value)}"></div>
        <small>${t(`${months}个月`)}</small>
      </div>`;
  }).join('');
}

export function bindROIInputs(onUpdate = () => {}) {
  ids.forEach(id => read(id)?.addEventListener('input', () => { onUpdate(renderROI()); }));
  read('roiDealType')?.addEventListener('change', () => { updateDealFields(); onUpdate(renderROI()); });
}
