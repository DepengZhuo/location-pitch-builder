/* ==================================================
   Location Assessment Module:
   - 2. Rate the Location (5 criteria: Strong / Average / Weak / Not sure)
   - 3. Deployment Readiness (4 checks)
   - Assessment Summary & Live LOCATION SCORE Sidebar
   ================================================== */
import { SCORE_CRITERIA, READINESS_ITEMS, DEFAULT_SCORE, DEFAULT_READINESS } from './data.js';
import { t } from './i18n.js';

const SCORE_MAP = { strong: 1, average: 0.5, weak: 0 };
const VALID_CHOICES = new Set(['strong', 'average', 'weak', 'unknown', '']);
const VALID_READINESS = new Set(['pending', 'yes', 'no']);

export function normalizeRatings(raw = {}) {
  const out = { ...DEFAULT_SCORE };
  if (!raw || typeof raw !== 'object') return out;

  const legacyMap = {
    traffic: raw.traffic,
    customers: raw.customers ?? raw.audience ?? raw.venueFit,
    need: raw.need ?? raw.convenience ?? raw.competition,
    placement: raw.placement ?? raw.traffic,
    operations: raw.operations ?? raw.term ?? raw.decision
  };

  SCORE_CRITERIA.forEach(c => {
    const val = raw[c.id] ?? legacyMap[c.id];
    if (typeof val === 'string' && VALID_CHOICES.has(val)) {
      out[c.id] = val;
    } else if (typeof val === 'number' && !Number.isNaN(val)) {
      out[c.id] = val >= 4 ? 'strong' : val === 3 ? 'average' : val >= 1 ? 'weak' : '';
    }
  });
  return out;
}

export function normalizeReadiness(raw = {}) {
  const out = { ...DEFAULT_READINESS };
  if (!raw || typeof raw !== 'object') return out;
  READINESS_ITEMS.forEach(item => {
    const val = raw[item.id];
    if (typeof val === 'string' && VALID_READINESS.has(val)) {
      out[item.id] = val;
    }
  });
  return out;
}

export function renderScoreFactors(container, values = DEFAULT_SCORE, onChange = () => {}) {
  if (!container) return;
  const normalized = normalizeRatings(values);
  const choicesMeta = [
    { value: 'strong', label: 'Strong' },
    { value: 'average', label: 'Average' },
    { value: 'weak', label: 'Weak' },
    { value: 'unknown', label: 'Not sure' }
  ];

  container.innerHTML = SCORE_CRITERIA.map(c => {
    const current = normalized[c.id] || '';
    return `
      <article class="criterion" data-key="${c.id}" data-weight="${c.weight}">
        <div class="criterion-top">
          <div class="criterion-title-wrap">
            <span class="criterion-num">${c.num}</span>
            <div>
              <h4>${t(c.name)}</h4>
              <div class="criterion-kicker">${t(c.kicker)}</div>
            </div>
          </div>
          <span class="criterion-weight">${t(`${c.weight} points`)}</span>
        </div>
        <p class="criterion-question">${t(c.question)}</p>
        <div class="choices" role="radiogroup" aria-label="${t(c.name)}">
          ${choicesMeta.map(choice => {
            const inputId = `rate-${c.id}-${choice.value}`;
            const checked = current === choice.value ? 'checked' : '';
            return `
              <div class="choice" data-value="${choice.value}">
                <input type="radio" id="${inputId}" name="rate_${c.id}" value="${choice.value}" ${checked} />
                <label for="${inputId}">${t(choice.label)}</label>
              </div>`;
          }).join('')}
        </div>
        <div class="help-row">
          ${c.hints.map(h => `<span>${t(h)}</span>`).join('')}
        </div>
      </article>`;
  }).join('');

  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      const factorId = input.name.replace(/^rate_/, '');
      onChange(factorId, input.value);
    });
  });
}

export function renderReadinessChecks(container, readiness = DEFAULT_READINESS, onChange = () => {}) {
  if (!container) return;
  const normalized = normalizeReadiness(readiness);
  const options = [
    { value: 'pending', label: 'Need to check' },
    { value: 'yes', label: 'Confirmed' },
    { value: 'no', label: 'Not available / Not permitted' }
  ];

  container.innerHTML = READINESS_ITEMS.map(item => {
    const current = normalized[item.id] || 'pending';
    return `
      <div class="readiness-item">
        <div>
          <div class="readiness-label">${t(item.label)}</div>
          <div class="readiness-help">${t(item.help)}</div>
        </div>
        <select class="status-select readiness-select" data-readiness="${item.id}" aria-label="${t(item.label)}">
          ${options.map(opt => `<option value="${opt.value}" ${current === opt.value ? 'selected' : ''}>${t(opt.label)}</option>`).join('')}
        </select>
      </div>`;
  }).join('');

  container.querySelectorAll('.readiness-select').forEach(select => {
    select.addEventListener('change', () => {
      onChange(select.dataset.readiness, select.value);
    });
  });
}

export function calculateScore(values = DEFAULT_SCORE, readiness = DEFAULT_READINESS) {
  const normalized = normalizeRatings(values);
  const normReadiness = normalizeReadiness(readiness);

  let total = 0;
  let answeredCount = 0;
  let unknownCount = 0;

  const factors = SCORE_CRITERIA.map(c => {
    const val = normalized[c.id] || '';
    let points = null;
    if (val in SCORE_MAP) {
      points = c.weight * SCORE_MAP[val];
      total += points;
      answeredCount += 1;
    } else if (val === 'unknown') {
      unknownCount += 1;
    }
    return { ...c, value: val, points };
  });

  const isComplete = answeredCount === SCORE_CRITERIA.length;
  const score = isComplete ? Math.round(total) : null;

  let rating = answeredCount === 0 && unknownCount === 0 ? 'Not completed' : 'In progress';
  let statusClass = '';
  let nextTitle = 'Visit the location';
  let nextStep = 'Confirm the busiest hours, best placement area and basic operating conditions.';

  if (isComplete) {
    if (score >= 80) {
      rating = 'Strong Potential';
      statusClass = 'good';
    } else if (score >= 60) {
      rating = 'Worth Exploring';
      statusClass = 'warn';
    } else {
      rating = 'Lower Priority';
      statusClass = 'bad';
    }

    const weakest = [...factors].sort((a, b) => (a.points ?? 0) / a.weight - (b.points ?? 0) / b.weight)[0];
    if (weakest && weakest.value === 'strong') {
      nextTitle = 'Confirm the site in person';
      nextStep = 'The five core factors look positive. Visit the site, confirm deployment conditions and speak with the property contact.';
    } else if (weakest) {
      nextTitle = `Check: ${weakest.short}`;
      nextStep = weakest.action;
    }
  }

  return {
    score,
    isComplete,
    answeredCount,
    unknownCount,
    rating,
    statusClass,
    nextTitle,
    nextStep,
    factors,
    readiness: normReadiness
  };
}

export function paintScoreResult(result) {
  const scoreEl = document.getElementById('scoreValue');
  if (!scoreEl) return;

  const statusEl = document.getElementById('scoreStatus');
  const progressFill = document.getElementById('scoreProgressFill');
  const progressText = document.getElementById('scoreProgressText');
  const progressPercent = document.getElementById('scoreProgressPercent');
  const breakdownEl = document.getElementById('scoreBreakdown');
  const detailedEl = document.getElementById('detailedResult');

  const totalCriteria = SCORE_CRITERIA.length;
  const pct = Math.round((result.answeredCount / totalCriteria) * 100);

  if (progressFill) progressFill.style.width = `${pct}%`;
  if (progressText) {
    const baseText = result.unknownCount
      ? `${result.answeredCount} of ${totalCriteria} rated · ${result.unknownCount} to verify`
      : `${result.answeredCount} of ${totalCriteria} rated`;
    progressText.textContent = t(baseText);
  }
  if (progressPercent) progressPercent.textContent = `${pct}%`;

  if (breakdownEl) {
    breakdownEl.innerHTML = result.factors.map(c => {
      const pointsText = c.points === null
        ? `— / ${c.weight}`
        : `${Number.isInteger(c.points) ? c.points : c.points.toFixed(1)} / ${c.weight}`;
      const width = c.points === null ? 0 : (c.points / c.weight) * 100;
      return `
        <div class="breakdown-item">
          <div class="breakdown-head">
            <span>${t(c.short)}</span>
            <strong>${pointsText}</strong>
          </div>
          <div class="mini-track"><div class="mini-fill" style="width:${width}%"></div></div>
        </div>`;
    }).join('');
  }

  if (result.isComplete && result.score !== null) {
    scoreEl.className = 'score-number';
    scoreEl.textContent = result.score;
    if (statusEl) {
      statusEl.className = `status-chip ${result.statusClass}`;
      statusEl.textContent = t(result.rating);
    }
    if (detailedEl) detailedEl.classList.add('show');

    const strengths = result.factors.filter(x => x.value === 'strong');
    const gaps = result.factors.filter(x => x.value === 'average' || x.value === 'weak');
    const strengthList = document.getElementById('strengthList');
    const attentionList = document.getElementById('attentionList');

    if (strengthList) {
      strengthList.innerHTML = strengths.length
        ? strengths.map(x => `<li>${t(x.name)}</li>`).join('')
        : `<li>${t('No standout strengths yet. Review the ratings and site details.')}</li>`;
    }
    if (attentionList) {
      attentionList.innerHTML = gaps.length
        ? gaps.map(x => `<li>${t(x.name)}: ${t(x.value === 'weak' ? 'main concern' : 'could be improved')}</li>`).join('')
        : `<li>${t('No major gaps were identified in the five ratings.')}</li>`;
    }

    const nextTitleEl = document.getElementById('scoreNextTitle');
    const nextStepEl = document.getElementById('scoreNextStep');
    if (nextTitleEl) nextTitleEl.textContent = t(result.nextTitle);
    if (nextStepEl) nextStepEl.textContent = t(result.nextStep);
  } else {
    scoreEl.className = 'score-placeholder';
    scoreEl.textContent = '—';
    if (statusEl) {
      statusEl.className = 'status-chip';
      statusEl.textContent = t(result.rating);
    }
    if (detailedEl) detailedEl.classList.remove('show');
  }

  paintReadinessSummary(result.readiness);
}

export function paintReadinessSummary(readiness = DEFAULT_READINESS) {
  const norm = normalizeReadiness(readiness);
  const statuses = Object.values(norm);
  const blocked = statuses.filter(x => x === 'no').length;
  const pending = statuses.filter(x => x === 'pending').length;

  const summary = document.getElementById('readinessSummary');
  const headline = document.getElementById('readinessHeadline');
  const copy = document.getElementById('readinessCopy');
  if (!summary || !headline || !copy) return;

  if (blocked > 0) {
    summary.className = 'readiness-summary blocked';
    headline.textContent = t('Resolve before installation');
    copy.textContent = t(`${blocked} condition${blocked > 1 ? 's' : ''} marked unavailable. Confirm whether the issue can be resolved.`);
  } else if (pending > 0) {
    summary.className = 'readiness-summary';
    headline.textContent = t('Confirmation needed');
    copy.textContent = t(`${pending} item${pending > 1 ? 's' : ''} still need to be checked before installation.`);
  } else {
    summary.className = 'readiness-summary ready';
    headline.textContent = t('Ready for the next step');
    copy.textContent = t('All four deployment conditions are marked as confirmed.');
  }
}
