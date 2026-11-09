/* =========================================================
   点位方收益测算模型（参考 partner-benefits-earnings-v4 重构）：
   - 01 Location & Sales Assumptions（点位名称、场地类型、日均件数、均价、营业天数、数字月份合作期限）
   - 02 Partnership Setup（按销售额分成 / 固定月租 / 纯便民配套 三选一）
   - Estimated Monthly Partner Earnings（右侧实时汇总卡片）
   ========================================================= */
import { money } from './data.js';
import { t } from './i18n.js';

const ids = [
  'roiLocation', 'roiVenue', 'roiOrders', 'roiTicket',
  'roiDays', 'roiPeriod', 'roiDealType', 'roiShare', 'roiRent'
];
const read = id => document.getElementById(id);
const val = id => Number(read(id)?.value || 0);

export function readROIForm() {
  const dealType = read('roiDealType')?.value || 'revenueShare';
  const periodRaw = val('roiPeriod');
  return {
    location: read('roiLocation')?.value.trim() || '',
    venue: read('roiVenue')?.value || '公寓 / 多户住宅',
    orders: Math.max(0, val('roiOrders')),
    ticket: Math.max(0, val('roiTicket')),
    days: Math.min(31, Math.max(0, val('roiDays'))),
    period: periodRaw > 0 ? periodRaw : 30,
    dealType,
    shareRate: Math.min(100, Math.max(0, val('roiShare'))),
    rent: Math.max(0, val('roiRent'))
  };
}

export function applyROIForm(data = {}) {
  const defaults = {
    location: 'Sunrise Apartments',
    venue: '公寓 / 多户住宅',
    orders: 55,
    ticket: 5.00,
    days: 30,
    period: 30,
    dealType: 'revenueShare',
    shareRate: 10,
    rent: 200
  };
  let inferredDeal = data.dealType;
  if (!['revenueShare', 'fixedRent', 'amenity'].includes(inferredDeal)) {
    inferredDeal = Number(data.rent) > 0 ? 'fixedRent' : 'revenueShare';
  }
  const merged = { ...defaults, ...data, dealType: inferredDeal };
  const map = {
    location: 'roiLocation',
    venue: 'roiVenue',
    orders: 'roiOrders',
    ticket: 'roiTicket',
    days: 'roiDays',
    period: 'roiPeriod',
    dealType: 'roiDealType',
    shareRate: 'roiShare',
    rent: 'roiRent'
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = read(id);
    if (!el) return;
    if (key === 'ticket') {
      el.value = Number(merged.ticket ?? defaults.ticket).toFixed(2);
    } else {
      el.value = merged[key] ?? defaults[key];
    }
  });
  syncModeUI(merged.dealType);
}

function syncModeUI(mode) {
  const dealInput = read('roiDealType');
  if (dealInput) dealInput.value = mode;

  document.querySelectorAll('#roiModeGrid .roi-mode-card').forEach(card => {
    const active = card.dataset.mode === mode;
    card.classList.toggle('active', active);
    card.setAttribute('aria-checked', String(active));
  });

  if (read('roiShareField')) read('roiShareField').hidden = mode !== 'revenueShare';
  if (read('roiRentField')) read('roiRentField').hidden = mode !== 'fixedRent';
  if (read('roiAmenityField')) read('roiAmenityField').hidden = mode !== 'amenity';
}

export function calculateROI(input = readROIForm()) {
  const monthlyRevenue = input.orders * input.ticket * input.days;
  let landlordIncome = 0;
  if (input.dealType === 'revenueShare') {
    landlordIncome = monthlyRevenue * (input.shareRate / 100);
  } else if (input.dealType === 'fixedRent') {
    landlordIncome = input.rent;
  } else {
    landlordIncome = 0;
  }
  const landlordAnnualIncome = landlordIncome * 12;
  const landlordPeriodIncome = landlordIncome * input.period;
  return {
    ...input,
    monthlyRevenue,
    landlordIncome,
    landlordAnnualIncome,
    landlordPeriodIncome
  };
}

export function renderROI() {
  const input = readROIForm();
  syncModeUI(input.dealType);
  const result = calculateROI(input);

  const monthlyEl = read('landlordMonthly');
  if (monthlyEl) monthlyEl.textContent = money(result.landlordIncome);

  const annualEl = read('landlordAnnual');
  if (annualEl) annualEl.textContent = money(result.landlordAnnualIncome);

  const termTotalEl = read('landlordTermTotal');
  if (termTotalEl) termTotalEl.textContent = money(result.landlordPeriodIncome);

  const salesEl = read('roiMonthlySales');
  if (salesEl) salesEl.textContent = money(result.monthlyRevenue);

  const typeBasisEl = read('roiEarningsType');
  const modelLabelEl = read('roiModelLabel');
  if (input.dealType === 'revenueShare') {
    if (typeBasisEl) typeBasisEl.textContent = t(`基于 ${input.shareRate}% 销售额分成`);
    if (modelLabelEl) modelLabelEl.textContent = t(`${input.shareRate}% 销售额分成`);
  } else if (input.dealType === 'fixedRent') {
    if (typeBasisEl) typeBasisEl.textContent = t('基于约定的固定月租金');
    if (modelLabelEl) modelLabelEl.textContent = t(`固定月租 ${money(input.rent)}`);
  } else {
    if (typeBasisEl) typeBasisEl.textContent = t('纯便民配套投放（无直接货币分成）');
    if (modelLabelEl) modelLabelEl.textContent = t('纯便民配套投放');
  }

  const termLabelEl = read('roiTermLabel');
  if (termLabelEl) termLabelEl.textContent = t(`${input.period} 个月`);

  return result;
}

export function bindROIInputs(onUpdate = () => {}) {
  ids.forEach(id => {
    const el = read(id);
    if (!el) return;
    el.addEventListener('input', () => onUpdate(renderROI()));
    el.addEventListener('change', () => onUpdate(renderROI()));
  });

  document.querySelectorAll('#roiModeGrid .roi-mode-card').forEach(card => {
    const activate = () => {
      syncModeUI(card.dataset.mode);
      onUpdate(renderROI());
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
}
