/**
 * EZKORA Cricket Match Situation Engine
 * 
 * Computes exact match situations from real match state without fabricating statistics:
 * - Second Innings: Target, runs needed, balls remaining, RRR, CRR
 * - First Innings: Current Run Rate (CRR), Projected Score
 * - Inactive scoring detection (configurable threshold)
 */

export const INACTIVITY_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Check if a match is considered "Scoring Inactive"
 */
export function isMatchScoringInactive(match) {
  if (!match) return false;
  if (match.status !== 'Live' && match.status !== 'LIVE') return false;

  const lastUpdated = match.lastScoredAt || match.updatedAt || match.completedAt;
  if (!lastUpdated) return false;

  const timeDiff = Date.now() - new Date(lastUpdated).getTime();
  return timeDiff > INACTIVITY_THRESHOLD_MS;
}

/**
 * Parse overs string like "17.2 Ov" or "17.2" into legal balls bowled
 */
export function oversToBalls(oversStr) {
  if (!oversStr) return 0;
  const clean = String(oversStr).replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  const overs = parseInt(parts[0], 10) || 0;
  const balls = parseInt(parts[1], 10) || 0;
  return overs * 6 + balls;
}

/**
 * Parse score string like "142/5" or "142" into runs and wickets
 */
export function parseScore(scoreStr) {
  if (!scoreStr || scoreStr === '-/-') return { runs: 0, wickets: 0 };
  const parts = String(scoreStr).split('/');
  return {
    runs: parseInt(parts[0], 10) || 0,
    wickets: parseInt(parts[1], 10) || 0,
  };
}

/**
 * Calculate match situation string and metrics
 */
export function getMatchSituation(match) {
  if (!match) return { text: '', crr: null, rrr: null, isInactive: false };

  const isInactive = isMatchScoringInactive(match);
  if (isInactive) {
    return {
      text: 'Scoring inactive',
      displayText: 'Scoring inactive',
      crr: null,
      rrr: null,
      isInactive: true,
    };
  }

  const maxOvers = match.oversPerInnings || match.totalOvers || 20;
  const maxBalls = maxOvers * 6;

  // Check if we are in 2nd innings
  const isInnings2 = Boolean(
    match.currentInnings === 2 ||
    match.target ||
    match.targetRuns ||
    match.firstInnings ||
    (match.scoreB && match.scoreB !== '-/-' && match.scoreB !== 'Yet to bat')
  );

  if (isInnings2) {
    const target = match.targetRuns || match.target || ((parseScore(match.scoreA).runs || 0) + 1);
    const chasingScore = parseScore(match.scoreB);
    const ballsBowled = oversToBalls(match.oversB);
    const ballsRemaining = Math.max(0, maxBalls - ballsBowled);
    const runsNeeded = Math.max(0, target - chasingScore.runs);

    let crr = null;
    if (ballsBowled > 0) {
      crr = ((chasingScore.runs / ballsBowled) * 6).toFixed(2);
    }

    let rrr = null;
    if (ballsRemaining > 0) {
      rrr = ((runsNeeded / ballsRemaining) * 6).toFixed(2);
    }

    if (chasingScore.runs >= target) {
      return {
        text: 'Target reached',
        displayText: 'Target reached',
        crr,
        rrr: '0.00',
        target,
        runsNeeded: 0,
        ballsRemaining,
        isInactive: false,
      };
    }

    if (ballsRemaining === 0 || chasingScore.wickets >= 10) {
      const concludedText = `Innings concluded • Short by ${runsNeeded} runs`;
      return {
        text: concludedText,
        displayText: concludedText,
        crr,
        rrr: null,
        target,
        runsNeeded,
        ballsRemaining: 0,
        isInactive: false,
      };
    }

    const situationText = `Need ${runsNeeded} runs from ${ballsRemaining} balls`;
    return {
      text: situationText,
      displayText: situationText,
      subText: `Target: ${target} • RRR: ${rrr || '—'}`,
      crr,
      rrr,
      target,
      runsNeeded,
      ballsRemaining,
      isInactive: false,
    };
  }

  // First Innings
  const batScore = parseScore(match.scoreA);
  const ballsBowled = oversToBalls(match.oversA);

  if (ballsBowled > 0) {
    const crr = ((batScore.runs / ballsBowled) * 6).toFixed(2);
    const projected = Math.round(parseFloat(crr) * maxOvers);
    const crrText = `CRR: ${crr} • Proj: ${projected}`;
    return {
      text: crrText,
      displayText: crrText,
      crr,
      rrr: null,
      isInactive: false,
    };
  }

  // Pre-scoring or toss
  if (match.status && match.status !== 'Live' && match.status !== 'LIVE') {
    return { text: match.status, displayText: match.status, crr: null, rrr: null, isInactive: false };
  }

  const tossDesc = match.tossWinner
    ? `${match.tossWinner} elected to ${match.decision || 'Bat'}`
    : '1st Innings in progress';

  return { text: tossDesc, displayText: tossDesc, crr: null, rrr: null, isInactive: false };
}

export const calculateMatchSituation = getMatchSituation;
