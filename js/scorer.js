/* ==================================================
   点位评分模块：渲染打分项、计算总分、生成行动建议
   评分方式：每项 1-5 分，按权重折算为 100 分制。
   ================================================== */
import { SCORE_FACTORS, DEFAULT_SCORE } from './data.js';
import { t } from './i18n.js';

export function renderScoreFactors(container, values = DEFAULT_SCORE, onChange = () => {}) {
  if (!container) return;
  container.innerHTML = SCORE_FACTORS.map(factor => `
    <div class="factor-row">
      <div><strong>${t(factor.name)}</strong><small>${t(factor.help)}</small></div>
      <div class="factor-buttons" role="group" aria-label="${t(factor.name)}">
        ${[1, 2, 3, 4, 5].map(score => `<button type="button" data-factor="${factor.id}" data-score="${score}" class="${Number(values[factor.id] ?? 3) === score ? 'selected' : ''}" aria-pressed="${Number(values[factor.id] ?? 3) === score}">${score}</button>`).join('')}
      </div>
      <span class="factor-weight">${factor.weight}%</span>
    </div>`).join('');
  container.querySelectorAll('[data-factor]').forEach(button => {
    button.addEventListener('click', () => onChange(button.dataset.factor, Number(button.dataset.score)));
  });
}

export function calculateScore(values = DEFAULT_SCORE) {
  const total = SCORE_FACTORS.reduce((sum, factor) => sum + (Number(values[factor.id] ?? 3) / 5) * factor.weight, 0);
  const score = Math.round(total);
  const rating = score >= 85 ? '优质点位' : score >= 70 ? '值得重点跟进' : score >= 50 ? '建议补充信息' : '暂不建议优先投入';
  const summary = score >= 85
    ? '当前条件较好，可以进入商务沟通和收益测算阶段。'
    : score >= 70
      ? '点位具备开发潜力，建议核实关键经营条件后推进。'
      : score >= 50
        ? '目前存在一些信息缺口或经营风险，建议先补充调研。'
        : '现阶段经营条件偏弱，建议谨慎投入开发资源。';
  const weakFactors = SCORE_FACTORS.filter(f => Number(values[f.id] ?? 3) <= 2).sort((a, b) => a.weight - b.weight).reverse();
  let nextStep = '准备初次沟通材料，联系物业或场地负责人，确认合作方式与现场条件。';
  if (weakFactors.length) {
    nextStep = `优先核实：${weakFactors.slice(0, 2).map(f => f.name).join('、')}。补充现场信息后再决定是否投入提案资源。`;
  }
  return {
    score,
    rating,
    summary,
    nextStep,
    factors: SCORE_FACTORS.map(f => ({
      ...f,
      value: Number(values[f.id] ?? 3),
      weighted: Math.round((Number(values[f.id] ?? 3) / 5) * f.weight)
    }))
  };
}

export function paintScoreResult(result) {
  const scoreValue = document.getElementById('scoreValue');
  if (!scoreValue) return;
  scoreValue.textContent = result.score;
  const ring = document.getElementById('scoreRing');
  if (ring) {
    ring.style.background = `conic-gradient(#111 ${result.score * 3.6}deg, #e9e9e9 0deg)`;
  }
  const statusEl = document.getElementById('scoreStatus');
  if (statusEl) statusEl.textContent = t(result.rating);
  const summaryEl = document.getElementById('scoreSummary');
  if (summaryEl) summaryEl.textContent = t(result.summary);
  const nextEl = document.getElementById('scoreNextStep');
  if (nextEl) nextEl.textContent = t(result.nextStep);
  const breakdownEl = document.getElementById('scoreBreakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML = result.factors.map(f => `
      <div class="breakdown-row"><span>${t(f.name)}</span><div class="breakdown-track"><i style="width:${f.value * 20}%"></i></div><b>${f.value}/5</b></div>`).join('');
  }
}
