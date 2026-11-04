/* =========================================================
   点位方收益模型：固定月租或销售额分成（二选一）
   ========================================================= */
import { money } from './data.js';

const ids = ['roiLocation','roiInvestment','roiOrders','roiTicket','roiDays','roiCogs','roiDealType','roiShare','roiRent','roiLabor','roiRestock','roiServiceCost','roiOpex','roiPeriod'];
const read = id => document.getElementById(id);
const val = id => Number(read(id)?.value || 0);

export function readROIForm() {
  const labor = val('roiLabor'), restock = val('roiRestock'), serviceCost = val('roiServiceCost'), other = val('roiOpex');
  return {
    location: read('roiLocation').value.trim(), investment: val('roiInvestment'), orders: val('roiOrders'), ticket: val('roiTicket'),
    days: val('roiDays'), cogsRate: val('roiCogs'), dealType: read('roiDealType').value,
    shareRate: val('roiShare'), rent: val('roiRent'), labor, restock, serviceCost, other,
    opex: labor + restock + serviceCost + other, period: val('roiPeriod')
  };
}

export function applyROIForm(data = {}) {
  const legacy = data.opex !== undefined && data.labor === undefined && data.restock === undefined && data.serviceCost === undefined && data.other === undefined;
  const defaults = { investment: 5500, orders: 50, ticket: 5.5, days: 30, cogsRate: 45, dealType: 'revenueShare', shareRate: 10, rent: 0, labor: 0, restock: 150, serviceCost: 50, other: 50, period: 36 };
  const inferredDeal = data.dealType || (Number(data.rent) > 0 ? 'fixedRent' : 'revenueShare');
  const merged = { ...defaults, ...data, dealType: inferredDeal };
  if (legacy) { merged.labor = 0; merged.restock = 0; merged.serviceCost = 0; merged.other = Number(data.opex) || 0; }
  const map = { location:'roiLocation', investment:'roiInvestment', orders:'roiOrders', ticket:'roiTicket', days:'roiDays', cogsRate:'roiCogs', dealType:'roiDealType', shareRate:'roiShare', rent:'roiRent', labor:'roiLabor', restock:'roiRestock', serviceCost:'roiServiceCost', other:'roiOpex', period:'roiPeriod' };
  Object.entries(map).forEach(([key, id]) => { if (read(id)) read(id).value = merged[key] ?? defaults[key]; });
  document.getElementById('roiPeriodLabel').textContent = `${merged.period} 个月`;
  updateDealFields();
}

function updateDealFields() {
  const fixed = read('roiDealType').value === 'fixedRent';
  read('roiShareField').hidden = fixed;
  read('roiRentField').hidden = !fixed;
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
  return { ...input, monthlyRevenue, cogs, grossProfit, propertyCommission, landlordIncome, operatorProfit, paybackMonths, operatorPeriodNet, landlordPeriodIncome };
}

export function renderROI() {
  const input = readROIForm();
  const result = calculateROI(input);
  document.getElementById('roiPeriodLabel').textContent = `${input.period} 个月`;
  updateDealFields();
  document.getElementById('landlordMonthly').textContent = money(result.landlordIncome);
  document.getElementById('landlordAnnual').textContent = `年预计 ${money(result.landlordIncome * 12)} · ${input.period} 个月累计 ${money(result.landlordPeriodIncome)}`;
  const dealText = input.dealType === 'fixedRent' ? `固定月租 ${money(input.rent)}` : `销售额分成 ${input.shareRate}%`;
  const metrics = [
    ['预计月销售额', money(result.monthlyRevenue), '日均销量 × 平均售价 × 营业天数'],
    ['预计月商品毛利', money(result.grossProfit), `商品成本率 ${input.cogsRate}%`],
    ['点位方预计月收入', money(result.landlordIncome), dealText],
    ['运营商预计月净收益', money(result.operatorProfit), `商品毛利 − 点位方收入 − 运营成本 ${money(input.opex)}`],
    ['运营商预计回本周期', result.paybackMonths ? `${result.paybackMonths.toFixed(1)} 个月` : '当前假设下无法回本', '初始投入 ÷ 运营商月净收益'],
    [`${input.period} 个月运营商净收益`, money(result.operatorPeriodNet), '运营商月净收益 × 测算期 − 初始投入']
  ];
  document.getElementById('roiMetricGrid').innerHTML = metrics.map(m => `<div class="metric-card"><span>${m[0]}</span><strong>${m[1]}</strong><small>${m[2]}</small></div>`).join('');
  renderChart(result);
  const expenseLines = [`人工 ${money(input.labor)}`, `补货 / 交通 ${money(input.restock)}`, `支付 / 网络 ${money(input.serviceCost)}`, `其他 ${money(input.other)}`].join(' + ');
  const formula = input.dealType === 'fixedRent' ? `固定月租 ${money(input.rent)}` : `${money(result.monthlyRevenue)} 月销售额 × ${input.shareRate}%`;
  document.getElementById('roiNarrative').innerHTML = `点位方选择<strong>${dealText}</strong>，每月预计获得 <strong>${money(result.landlordIncome)}</strong>。测算公式：点位方收入 = ${formula}。运营商月净收益 = 商品毛利 ${money(result.grossProfit)} − 点位方收入 ${money(result.landlordIncome)} − 运营成本 ${money(input.opex)}（${expenseLines}）= <strong>${money(result.operatorProfit)}</strong>。${input.period} 个月内点位方累计收入约 <strong>${money(result.landlordPeriodIncome)}</strong>；运营商扣除初始投入后的累计净收益约 <strong>${money(result.operatorPeriodNet)}</strong>。这是基于输入假设的静态估算，不包含税费、折旧、融资成本、库存损耗或未录入成本。`;
  return result;
}

function renderChart(result) {
  const buckets = 6;
  const values = Array.from({ length: buckets }, (_, i) => result.landlordIncome * result.period * ((i + 1) / buckets));
  const max = Math.max(1, ...values);
  document.getElementById('roiChart').innerHTML = values.map((value, i) => `
    <div class="chart-bar-wrap"><div class="chart-bar ${i === buckets - 1 ? 'highlight' : ''}" style="height:${Math.max(3, value / max * 100)}%" title="${money(value)}"></div><small>${Math.round(result.period * (i + 1) / buckets)}个月</small></div>`).join('');
}

export function bindROIInputs(onUpdate = () => {}) {
  ids.forEach(id => read(id)?.addEventListener('input', () => { onUpdate(renderROI()); }));
  read('roiDealType')?.addEventListener('change', () => { updateDealFields(); onUpdate(renderROI()); });
}
