import assert from 'assert';

// Test the logic implemented for CompletedCard and contextCompleted

const testMatches = [
  // Test Case 1: Normal completed match (186/7 vs 152/9)
  {
    id: 'c1',
    league: 'KURUKSHETRA LEAGUE • T20',
    date: 'Yesterday',
    teamA: 'Falcons CC',
    teamB: 'Warriors XI',
    scoreA: '186/7',
    oversA: '20.0 Ov',
    scoreB: '152/9',
    oversB: '20.0 Ov',
    winner: 'Falcons CC won',
    margin: 'by 34 runs',
    venue: 'Rajiv Cricket Ground, Hyderabad',
  },
  // Test Case 2: Normal completed match (11/0 vs 9/0)
  {
    id: 'c2',
    league: 'PRACTICE MATCH • T20',
    date: 'Today',
    teamA: 'Bhaiengers',
    teamB: 'Falcons CC',
    scoreA: '11/0',
    oversA: '1.0 Ov',
    scoreB: '9/0',
    oversB: '1.0 Ov',
    winner: 'Bhaiengers won',
    margin: 'by 2 runs',
    venue: 'Rajiv Cricket Ground, Hyderabad',
  },
  // Test Case 3: Tied match with Super Over + separate scores (36/0 vs 36/0, SO: 7/0 vs 6/0)
  {
    id: 'c3',
    league: 'CUSTOM • COMPLETED',
    date: '18 May 2026',
    teamA: 'Warriors XI',
    teamB: 'Falcons CC',
    scoreA: '36/0',
    oversA: '1.0 Ov',
    scoreB: '36/0',
    oversB: '1.0 Ov',
    isSuperOver: true,
    result: 'TIED',
    winner: 'Warriors XI',
    margin: 'Super Over',
    superOverScores: {
      team1: 'Warriors XI',
      score1: '7/0',
      team2: 'Falcons CC',
      score2: '6/0',
    },
    venue: 'Rajiv Cricket Ground, Hyderabad',
  },
  // Test Case 4: Tied match with Super Over without separate scores (67/0 vs 67/0)
  {
    id: 'c4',
    league: 'CITY PREMIER LEAGUE • T20',
    date: '19 May 2026',
    teamA: 'Bhaiengers',
    teamB: 'Warriors XI',
    scoreA: '67/0',
    oversA: '1.0 Ov',
    scoreB: '67/0',
    oversB: '1.0 Ov',
    isSuperOver: true,
    result: 'TIED',
    winner: 'Warriors XI won',
    margin: 'Super Over',
    venue: 'Rajiv Cricket Ground, Hyderabad',
  },
];

function processCardData(match) {
  const isSuperOver = Boolean(
    match.isSuperOver ||
    match.margin === 'Super Over' ||
    (typeof match.margin === 'string' && match.margin.toLowerCase().includes('super over')) ||
    match.superOver?.played ||
    (Array.isArray(match.superOvers) && match.superOvers.length > 0) ||
    (typeof match.winner === 'string' && match.winner.toLowerCase().includes('super over')) ||
    (typeof match.resultText === 'string' && match.resultText.toLowerCase().includes('super over')) ||
    (match.matchData && (
      match.matchData.margin === 'Super Over' ||
      (Array.isArray(match.matchData.superOvers) && match.matchData.superOvers.length > 0) ||
      match.matchData.isSuperOver
    ))
  );

  const isDrawn = !isSuperOver && (
    match.result === 'DRAW' ||
    match.margin === 'Draw' ||
    (typeof match.winner === 'string' && match.winner.toLowerCase().includes('drawn'))
  );

  let cleanWinner = match.winner || match.matchData?.winner || '';
  if (cleanWinner) {
    cleanWinner = cleanWinner
      .replace(/\s+won\s+via\s+super\s+over.*$/i, '')
      .replace(/\s+won\s+by.*$/i, '')
      .replace(/\s+won$/i, '')
      .trim();
  }

  let superOverScores = null;
  if (match.superOverScores) {
    superOverScores = match.superOverScores;
  } else {
    const soList = match.superOvers || match.matchData?.superOvers;
    if (Array.isArray(soList) && soList.length > 0) {
      const lastSO = soList[soList.length - 1];
      if (lastSO?.innings1 && lastSO?.innings2) {
        superOverScores = {
          team1: lastSO.innings1.battingTeam,
          score1: `${lastSO.innings1.totalRuns ?? 0}/${lastSO.innings1.totalWickets ?? 0}`,
          team2: lastSO.innings2.battingTeam,
          score2: `${lastSO.innings2.totalRuns ?? 0}/${lastSO.innings2.totalWickets ?? 0}`,
        };
      }
    }
  }

  let displayMargin = match.margin;
  if (displayMargin === 'Super Over' || displayMargin === 'Draw') {
    displayMargin = '';
  }
  if (!displayMargin && !isSuperOver && !isDrawn && match.resultText) {
    const marginMatch = match.resultText.match(/by\s+([^.]+)/i);
    if (marginMatch) {
      displayMargin = `by ${marginMatch[1].trim()}`;
    }
  }

  return {
    isSuperOver,
    isDrawn,
    cleanWinner,
    superOverScores,
    displayMargin,
    mainScoreA: match.scoreA,
    mainScoreB: match.scoreB,
  };
}

console.log('Testing Completed Card logic across all cases...');

// Test 1: 186/7 vs 152/9 (Normal match)
const r1 = processCardData(testMatches[0]);
assert.strictEqual(r1.isSuperOver, false, 'r1 should NOT be Super Over');
assert.strictEqual(r1.cleanWinner, 'Falcons CC', 'r1 clean winner should be Falcons CC');
assert.strictEqual(r1.displayMargin, 'by 34 runs', 'r1 margin should be by 34 runs');
assert.strictEqual(r1.mainScoreA, '186/7');
assert.strictEqual(r1.mainScoreB, '152/9');
console.log('✔ Test 1 Passed: Normal match 186/7 vs 152/9');

// Test 2: 11/0 vs 9/0 (Normal match)
const r2 = processCardData(testMatches[1]);
assert.strictEqual(r2.isSuperOver, false, 'r2 should NOT be Super Over');
assert.strictEqual(r2.cleanWinner, 'Bhaiengers', 'r2 clean winner should be Bhaiengers');
assert.strictEqual(r2.displayMargin, 'by 2 runs', 'r2 margin should be by 2 runs');
assert.strictEqual(r2.mainScoreA, '11/0');
assert.strictEqual(r2.mainScoreB, '9/0');
console.log('✔ Test 2 Passed: Normal match 11/0 vs 9/0');

// Test 3: 36/0 vs 36/0 (Tied + Super Over with SO scores)
const r3 = processCardData(testMatches[2]);
assert.strictEqual(r3.isSuperOver, true, 'r3 MUST be Super Over');
assert.strictEqual(r3.cleanWinner, 'Warriors XI');
assert.strictEqual(r3.mainScoreA, '36/0', 'Main score A must remain 36/0, NOT overwritten');
assert.strictEqual(r3.mainScoreB, '36/0', 'Main score B must remain 36/0, NOT overwritten');
assert.deepStrictEqual(r3.superOverScores, {
  team1: 'Warriors XI',
  score1: '7/0',
  team2: 'Falcons CC',
  score2: '6/0',
});
console.log('✔ Test 3 Passed: 36/0 vs 36/0 with separate Super Over scores 7/0 vs 6/0');

// Test 4: 67/0 vs 67/0 (Tied + Super Over WITHOUT SO scores)
const r4 = processCardData(testMatches[3]);
assert.strictEqual(r4.isSuperOver, true, 'r4 MUST be Super Over');
assert.strictEqual(r4.cleanWinner, 'Warriors XI');
assert.strictEqual(r4.mainScoreA, '67/0', 'Main score A must remain 67/0');
assert.strictEqual(r4.mainScoreB, '67/0', 'Main score B must remain 67/0');
assert.strictEqual(r4.superOverScores, null, 'Super Over scores should NOT be fabricated when absent');
console.log('✔ Test 4 Passed: 67/0 vs 67/0 with no fabricated Super Over scores');

// Test 5: Dynamic Context Completed Match from LiveScoring engine
const dynamicLiveScoringCompletedMatch = {
  id: 'dyn_1',
  format: 'T20',
  teamA: 'Warriors XI',
  teamB: 'Falcons CC',
  scoreA: '36/0',
  oversA: '1.0 Ov',
  scoreB: '36/0',
  oversB: '1.0 Ov',
  status: 'Completed',
  winner: 'Warriors XI',
  margin: 'Super Over',
  result: 'WIN',
  resultText: 'Warriors XI won via Super Over.',
  superOvers: [
    {
      superOverNumber: 1,
      innings1: {
        battingTeam: 'Falcons CC',
        bowlingTeam: 'Warriors XI',
        totalRuns: 6,
        totalWickets: 0,
        overs: '1.0',
      },
      innings2: {
        battingTeam: 'Warriors XI',
        bowlingTeam: 'Falcons CC',
        totalRuns: 7,
        totalWickets: 0,
        overs: '0.4',
      },
      winner: 'Warriors XI',
      isTied: false,
    },
  ],
};

const r5 = processCardData(dynamicLiveScoringCompletedMatch);
assert.strictEqual(r5.isSuperOver, true);
assert.strictEqual(r5.cleanWinner, 'Warriors XI');
assert.strictEqual(r5.mainScoreA, '36/0');
assert.strictEqual(r5.mainScoreB, '36/0');
assert.deepStrictEqual(r5.superOverScores, {
  team1: 'Falcons CC',
  score1: '6/0',
  team2: 'Warriors XI',
  score2: '7/0',
});
console.log('✔ Test 5 Passed: Dynamic MatchContext Super Over match correctly parsed');

console.log('\nALL TESTS PASSED SUCCESSFULLY! 🎯');
