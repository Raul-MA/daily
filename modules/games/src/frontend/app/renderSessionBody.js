import { renderCollaborativeOutcome } from './renderCollaborativeOutcome.js';
import { renderOutcomeSession } from './renderOutcomeSession.js';
import { renderScoreSession } from './renderScoreSession.js';

export function renderSessionBody(session, readOnly) { if (session.isCollaborative) return renderCollaborativeOutcome(session, { readOnly }); if (session.scoringMode === 'win_loss_tie') return renderOutcomeSession(session, { readOnly }); return renderScoreSession(session, { readOnly }); }
