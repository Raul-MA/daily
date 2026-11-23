import { categories, isWingspan } from './categories.js';
import { buildWingspanStats } from './statistics.js';
import { wingspanCopy } from './copy.js';
import { escapeHtml, option } from '../../frontend/components/components.js';

export function renderWingspanReports(data, { filters = {}, language = 'en' } = {}) {
  const copy = (text, params) => wingspanCopy(language, text, params);
  const ids = new Set(data.sessions.filter(isWingspan).map(session => session.gameId));
  const games = data.games.filter(game => isWingspan(game) || ids.has(game.id));
  if (!games.length) return '';
  const gameId = games.some(game => game.id === filters.gameId) ? filters.gameId : '';
  const allPlayers = buildWingspanStats(data, { gameId }).players;
  const playerId = allPlayers.some(player => player.playerId === filters.playerId) ? filters.playerId : '';
  const report = buildWingspanStats(data, { gameId, playerId });
  const largest = Math.max(1, ...report.players.flatMap(player => Object.values(player.categories).map(metric => metric.average)));
  return `<section class="ledger-block wingspan-reports" data-testid="wingspan-reports">
    <h2>${copy('Wingspan category reports')}</h2>
    <p class="subtle">${copy('Averages compare points per completed game. Bird points are not bird counts.')}</p>
    <div class="wingspan-report-filters">
      <label>${copy('Game')}<select data-testid="wingspan-report-game-filter">${option('', copy('All Wingspan games'), gameId)}${games.map(game => option(game.id, game.name, gameId)).join('')}</select></label>
      <label>${copy('Player')}<select data-testid="wingspan-report-player-filter">${option('', copy('All players'), playerId)}${allPlayers.map(player => option(player.playerId, player.name, playerId)).join('')}</select></label>
    </div>
    <p>${copy('Scored games: {count}', { count: report.recordedSessions })}</p>
    <p class="subtle">${copy('Older games without category data: {count}', { count: report.uncategorizedSessions })}</p>
    <div class="wingspan-report-grid">${report.players.map(player => renderPlayerReport(player, language, largest)).join('') || `<p class="empty">${copy('Complete a Wingspan game to compare category scores here.')}</p>`}</div>
  </section>`;
}

function renderPlayerReport(player, language, largest) {
  const copy = (text, params) => wingspanCopy(language, text, params);
  const names = player.leadingCategories.map(id => copy(categories.find(category => category.id === id).label)).join(', ');
  return `<article class="wingspan-report-player" data-testid="wingspan-report-player">
    <h3>${escapeHtml(player.name)}</h3><p>${copy('Completed games: {count}', { count: player.played })}</p>
    <p class="subtle">${names ? `${copy('Largest scoring contribution')}: ${names}` : copy('No scoring contribution yet.')}</p>
    ${categories.map(category => renderMetric({ category, metric: player.categories[category.id], largest, language })).join('')}
  </article>`;
}

function renderMetric({ category, metric, largest, language }) {
  const copy = text => wingspanCopy(language, text);
  const number = value => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);
  return `<div class="wingspan-report-category">
    <div class="wingspan-report-average"><strong>${copy(category.label)}</strong><span>${copy('Average per game')}: <b>${number(metric.average)}</b></span></div>
    <meter min="0" max="${largest}" value="${metric.average}" aria-label="${copy(category.label)} · ${copy('Average per game')}">${number(metric.average)}</meter>
    <dl><div><dt>${copy('Category total')}</dt><dd>${number(metric.total)}</dd></div>
    <div><dt>${copy('Best game')}</dt><dd>${number(metric.best)}</dd></div>
    <div><dt>${copy('Point share')}</dt><dd>${metric.share === null ? '—' : `${number(metric.share)}%`}</dd></div></dl>
  </div>`;
}
