/* =========================================================
   ROI 模块：经营测算公式集中在 calculateROI() 中
   所有金额单位为美元。当前为简化模型，不代表财务承诺。
   ========================================================= */
import { money, money2 } from './data.js';

const ids = ['roiLocation','roiInvestment','roiOrders','roiTicket','roiDays','roiCogs','roiShare','roiShareBase','roiRent','roiOpex','roiPeriod'];
const read = id => document.getElementById(id);
const val = id => Number(read(id)?.value || 0);

export function readROIForm() {
  return {
    location: read('roiLocation').value.trim(), investment: val('roiInvestment'), orders: val('roiOrders'), ticket: val('roiTicket'),
    days: val('roiDays'), cogsRate: val('roiCogs'), shareRate: val('roiShare'), shareBase: read('roiShareBase').value,
    rent: val('roiRent'), opex: val('roiOpex'), period: val('roiPeriod')
  };
}

export function applyROIForm(data = {}) {
  const defaults = { investment: 5500, orders: 50, ticket: 5.5, days: 30, cogsRate: 45, shareRate: 10, shareBase: 'revenue', rent: 0, opex: 250, period: 36 };
  const merged = { ...defaults, ...data };
  const map = { location:'roiLocation', investment:'roiInvestment', orders:'roiOrders', ticket:'roiTicket', days:'roiDays', cogsRate:'roiCogs', shareRate:'roiShare', shareBase:'roiShareBase', rent:'roiRent', opex:'roiOpex', period:'roiPeriod' };
  Object.entries(map).forEach(([key, id]) => { if (read(id)) read(id).value = merged[key] ?? defaults[key]; });
  document.getElementById('roiPeriodLabel').textContent = `${merged.period} 个月`;
}

export function calculateROI(input = readROIForm()) {
  const monthlyRevenue = input.orders * input.ticket * input.days;
  const cogs = monthlyRevenue * input.cogsRate / 100;
  const grossProfit = monthlyRevenue - cogs;
  const commissionBase = input.shareBase === 'grossProfit' ? grossProfit : monthlyRevenue;
  const propertyCommission = commissionBase * input.shareRate / 100;
  const landlordIncome = propertyCommission + input.rent;
  const operatorProfit = grossProfit - propertyCommission - input.rent - input.opex;
  const paybackMonths = operatorProfit > 0 ? input.investment / operatorProfit : null;
  const periodProfit = operatorProfit * input.period;
  const periodNet = periodProfit - input.investment;
  const roi = input.investment > 0 ? (periodNet / input.investment) * 100 : null;
  const landlordPeriodIncome = landlordIncome * input.period;
  return { ...input, monthlyRevenue, cogs, grossProfit, propertyCommission, landlordIncome, operatorProfit, paybackMonths, periodProfit, periodNet, roi, landlordPeriodIncome };
}

export function renderROI() {
  const input = readROIForm();
  const result = calculateROI(input);
  document.getElementById('roiPeriodLabel').textContent = `${input.period} 个月`;
  document.getElementById('landlordMonthly').textContent = money(result.landlordIncome);
  document.getElementById('landlordAnnual').textContent = `年预计 ${money(result.landlordIncome * 12)} · 测算期累计 ${money(result.landlordPeriodIncome)}`;
  const metrics = [
    ['预计月销售额', money(result.monthlyRevenue), '日均销售件数 × 平均售价 × 营业天数'],
    ['预计月商品毛利', money(result.grossProfit), `商品成本率 ${input.cogsRate}%`],
    ['运营商预计月净收益', money(result.operatorProfit), '扣除分成、租金和其他运营成本'],
    ['预计回本周期', result.paybackMonths ? `${result.paybackMonths.toFixed(1)} 个月` : '暂无法回本', '基于当前月净收益估算'],
    [`${input.period} 个月 ROI`, result.roi === null ? '—' : `${result.roi.toFixed(1)}%`, '测算期净收益 ÷ 初始投入'],
    ['物业测算期累计收益', money(result.landlordPeriodIncome), '分成收入 + 固定租金']
  ];
  document.getElementById('roiMetricGrid').innerHTML = metrics.map(m => `<div class="metric-card"><span>${m[0]}</span><strong>${m[1]}</strong><small>${m[2]}</small></div>`).join('');
  renderChart(result);
  document.getElementById('roiNarrative').innerHTML = `按当前输入，预计每月销售额约为 <strong>${money(result.monthlyRevenue)}</strong>，物业每月预计获得 <strong>${money(result.landlordIncome)}</strong>（${input.shareRate}% ${input.shareBase === 'grossProfit' ? '商品毛利分成' : '销售额分成'}${input.rent > 0 ? ` + ${money(input.rent)} 固定月租` : ''}）。运营商预计月净收益为 <strong>${money(result.operatorProfit)}</strong>。以上是基于假设的静态测算，实际结果会受到人流、商品结构、营业天数、支付费用、税费、损耗及运营效率影响。`;
  return result;
}

function renderChart(result) {
  const buckets = 6;
  const values = Array.from({ length: buckets }, (_, i) => Math.max(0, result.landlordIncome * result.period * ((i + 1) / buckets)));
  const max = Math.max(1, ...values);
  document.getElementById('roiChart').innerHTML = values.map((value, i) => `
    <div class="chart-bar-wrap"><div class="chart-bar ${i === buckets - 1 ? 'highlight' : ''}" style="height:${Math.max(3, value / max * 100)}%" title="${money(value)}"></div><small>${Math.round(result.period * (i + 1) / buckets)}个月</small></div>`).join('');
}

export function bindROIInputs(onUpdate = () => {}) {
  ids.forEach(id => read(id)?.addEventListener('input', () => { onUpdate(renderROI()); }));
  read('roiShareBase')?.addEventListener('change', () => onUpdate(renderROI()));
}
