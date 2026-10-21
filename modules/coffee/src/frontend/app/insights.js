import { getInsights } from '../../backend/features/insights.js';
import { coffee } from './context.js';
import { pageHeader, metric, formatRatio, formatDate } from './format.js';
import { tr } from './copy.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { formatDrinkType } from './composition.js';

export function renderInsights() {
  const insights = getInsights();
  coffee.app.innerHTML = `
    ${pageHeader(tr("pageInsightsTitle"), tr("pageInsightsSubtitle"))}
    <div class="insight-grid" data-testid="${testIds.insightGrid}">
      ${metric(tr("metricLoggedDrinks"), insights.totalEntries)}
      ${metric(tr("metricScoredDrinks"), insights.scoredEntries)}
      ${metric(tr("metricTopScores"), insights.topRatedEntries)}
      ${metric(tr("metricTopRatioAvg"), insights.averageTopRatio ? `1:${insights.averageTopRatio}` : "-")}
    </div>
    <section class="specimen-section insights-best-cup" data-testid="${testIds.bestCup}">
      <header><p>${escapeHtml(tr("bestCup"))}</p><h2>${insights.bestBean ? `${escapeHtml(insights.bestBean.brand)} / ${escapeHtml(insights.bestBean.blend)}` : escapeHtml(tr("emptyNoScoredDrinks"))}</h2></header>
      <div class="section-body">
        <p class="quiet">${insights.bestEntry ? escapeHtml(tr("bestCupSummary", {
          score: insights.bestEntry.taste.overallScore,
          drink: formatDrinkType(insights.bestEntry.brew.drinkType),
          ratio: formatRatio(insights.bestEntry.brew.ratio),
          date: formatDate(insights.bestEntry.meta.brewedAt)
        })) : escapeHtml(tr("emptyScoresUnlock"))}</p>
      </div>
    </section>
  `;
}
