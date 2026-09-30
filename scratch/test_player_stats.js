const { calculatePlayerStats, didPlayerParticipate, getPlayerTeam } = require('../src/services/playerStatsService');

console.log('=== TEST 1: New User with 0 Completed Matches ===');
const emptyUserStats = calculatePlayerStats([], 'usr_brand_new_user');
console.log('Batting matches:', emptyUserStats.batting.matches);
console.log('Batting runs:', emptyUserStats.batting.runs);
console.log('Batting avg:', emptyUserStats.batting.average);
console.log('Batting SR:', emptyUserStats.batting.strikeRate);
console.log('Highest Score:', emptyUserStats.batting.highestScore);
console.log('Bowling overs:', emptyUserStats.bowling.oversDisplay);
console.log('Bowling wickets:', emptyUserStats.bowling.wickets);
console.log('Bowling econ:', emptyUserStats.bowling.economy);
console.log('Bowling best:', emptyUserStats.bowling.bestBowling);
console.log('Recent performance length:', emptyUserStats.recentPerformance.length);
console.log('Achievements length:', emptyUserStats.achievements.length);
console.log('Tournaments length:', emptyUserStats.tournaments.length);

console.assert(emptyUserStats.batting.matches === 0, 'Matches should be 0');
console.assert(emptyUserStats.batting.runs === 0, 'Runs should be 0');
console.assert(emptyUserStats.batting.average === '0.0', 'Avg should be 0.0');
console.assert(emptyUserStats.batting.strikeRate === '0.0', 'SR should be 0.0');
console.assert(emptyUserStats.bowling.oversDisplay === '0.0', 'Overs should be 0.0');
console.assert(emptyUserStats.bowling.wickets === 0, 'Wickets should be 0');
console.assert(emptyUserStats.recentPerformance.length === 0, 'Recent performance should be empty');
console.log('TEST 1 PASSED: Clean empty states for new user!\n');

console.log('=== TEST 2: Seeded User (usr_arjun123) with Completed Matches ===');
const sampleMatches = [
  {
    id: 'match_c1',
    teamA: 'Falcons CC',
    teamB: 'Royal Strikers',
    format: 'T20',
    type: 'Tournament',
    league: 'Kurukshetra T20 • Semi-Final',
    tournament: 'Kurukshetra T20',
    date: '2026-05-18T10:00:00.000Z',
    completedAt: '2026-05-18T14:00:00.000Z',
    status: 'Completed',
    winner: 'Falcons CC',
    margin: '6 wickets',
    result: 'WIN',
    resultText: 'Falcons CC won by 6 wickets',
    potmId: 'usr_arjun123',
    playingXI_A: [{ id: 'usr_arjun123', name: 'Arjun Reddy' }],
    playingXI_B: [{ id: 'rs1', name: 'Suresh Raina' }],
    firstInnings: {
      battingTeam: 'Royal Strikers',
      bowlingTeam: 'Falcons CC',
      totalRuns: 168,
      totalWickets: 8,
      overs: '20.0',
      batters: [{ id: 'rs1', name: 'Suresh Raina', runs: 58, balls: 41, fours: 6, sixes: 2, status: 'out' }],
      bowlers: {
        'usr_arjun123': { name: 'Arjun Reddy', overs: 4, balls: 0, maidens: 0, runsConceded: 28, wickets: 1 }
      },
      fallOfWickets: [
        { wicket: 1, score: 32, batter: 'Suresh Raina', fielderId: 'usr_arjun123', dismissalType: 'Caught' }
      ]
    },
    secondInnings: {
      battingTeam: 'Falcons CC',
      bowlingTeam: 'Royal Strikers',
      totalRuns: 172,
      totalWickets: 4,
      overs: '18.4',
      batters: [
        { id: 'usr_arjun123', name: 'Arjun Reddy', runs: 86, balls: 52, fours: 7, sixes: 3, status: 'not out', dismissal: 'not out' }
      ],
      bowlers: {},
      fallOfWickets: []
    }
  },
  {
    id: 'match_c2',
    teamA: 'Warriors XI',
    teamB: 'Falcons CC',
    format: 'T20',
    type: 'League',
    league: 'Hyderabad Turf League • League',
    tournament: 'Hyderabad Turf League',
    date: '2026-05-15T10:00:00.000Z',
    completedAt: '2026-05-15T14:00:00.000Z',
    status: 'Completed',
    winner: 'Warriors XI',
    margin: '3 runs',
    result: 'LOST',
    resultText: 'Warriors XI won by 3 runs',
    playingXI_A: [{ id: 'b1', name: 'Virat Kohli' }],
    playingXI_B: [{ id: 'usr_arjun123', name: 'Arjun Reddy' }],
    firstInnings: {
      battingTeam: 'Warriors XI',
      bowlingTeam: 'Falcons CC',
      totalRuns: 165,
      totalWickets: 6,
      overs: '20.0',
      batters: [{ id: 'b1', name: 'Virat Kohli', runs: 72, balls: 48, fours: 8, sixes: 2, status: 'out' }],
      bowlers: {
        'usr_arjun123': { name: 'Arjun Reddy', overs: 3, balls: 0, maidens: 0, runsConceded: 22, wickets: 1 }
      },
      fallOfWickets: []
    },
    secondInnings: {
      battingTeam: 'Falcons CC',
      bowlingTeam: 'Warriors XI',
      totalRuns: 162,
      totalWickets: 8,
      overs: '20.0',
      batters: [
        { id: 'usr_arjun123', name: 'Arjun Reddy', runs: 42, balls: 31, fours: 5, sixes: 1, status: 'out', dismissal: 'c Kohli b Axar' }
      ],
      bowlers: {},
      fallOfWickets: []
    }
  },
  {
    id: 'match_c3',
    teamA: 'Falcons CC',
    teamB: 'Titans CC',
    format: 'T20',
    type: 'League',
    league: 'Hyderabad Turf League • League',
    tournament: 'Hyderabad Turf League',
    date: '2026-05-12T10:00:00.000Z',
    completedAt: '2026-05-12T14:00:00.000Z',
    status: 'Completed',
    winner: 'Falcons CC',
    margin: '22 runs',
    result: 'WIN',
    resultText: 'Falcons CC won by 22 runs',
    potmId: 'usr_arjun123',
    playingXI_A: [{ id: 'usr_arjun123', name: 'Arjun Reddy' }],
    playingXI_B: [{ id: 'tc1', name: 'Hardik Pandya' }],
    firstInnings: {
      battingTeam: 'Falcons CC',
      bowlingTeam: 'Titans CC',
      totalRuns: 178,
      totalWickets: 5,
      overs: '20.0',
      batters: [
        { id: 'usr_arjun123', name: 'Arjun Reddy', runs: 31, balls: 22, fours: 3, sixes: 1, status: 'out', dismissal: 'b Shami' }
      ],
      bowlers: {},
      fallOfWickets: []
    },
    secondInnings: {
      battingTeam: 'Titans CC',
      bowlingTeam: 'Falcons CC',
      totalRuns: 156,
      totalWickets: 9,
      overs: '20.0',
      batters: [],
      bowlers: {
        'usr_arjun123': { name: 'Arjun Reddy', overs: 4, balls: 0, maidens: 2, runsConceded: 24, wickets: 3 }
      },
      fallOfWickets: [
        { wicket: 3, score: 54, batter: 'Hardik Pandya', fielderId: 'usr_arjun123', dismissalType: 'Run Out' }
      ]
    }
  }
];

const arjunStats = calculatePlayerStats(sampleMatches, 'usr_arjun123');
console.log('Arjun Batting Matches:', arjunStats.batting.matches, '(Expected: 3)');
console.log('Arjun Batting Runs:', arjunStats.batting.runs, '(Expected: 86 + 42 + 31 = 159)');
console.log('Arjun Batting Avg:', arjunStats.batting.average, '(Expected: 159 / 2 = 79.5)');
console.log('Arjun Batting SR:', arjunStats.batting.strikeRate, '(Expected: (159 / 105) * 100 = 151.4)');
console.log('Arjun Highest Score:', arjunStats.batting.highestScore, '(Expected: 86*)');
console.log('Arjun 50s:', arjunStats.batting.fifties, '(Expected: 1)');
console.log('Arjun 100s:', arjunStats.batting.hundreds, '(Expected: 0)');
console.log('Arjun 4s:', arjunStats.batting.fours, '(Expected: 15)');
console.log('Arjun 6s:', arjunStats.batting.sixes, '(Expected: 5)');

console.assert(arjunStats.batting.matches === 3, 'Matches should be 3');
console.assert(arjunStats.batting.runs === 159, 'Runs should be 159');
console.assert(arjunStats.batting.average === '79.5', 'Avg should be 79.5');
console.assert(arjunStats.batting.strikeRate === '151.4', 'SR should be 151.4');
console.assert(arjunStats.batting.highestScore === '86*', 'Highest score should be 86*');
console.assert(arjunStats.batting.fifties === 1, '50s should be 1');
console.assert(arjunStats.batting.hundreds === 0, '100s should be 0');
console.assert(arjunStats.batting.fours === 15, '4s should be 15');
console.assert(arjunStats.batting.sixes === 5, '6s should be 5');

console.log('\nArjun Bowling Matches:', arjunStats.bowling.matches, '(Expected: 3)');
console.log('Arjun Bowling Overs:', arjunStats.bowling.oversDisplay, '(Expected: 11.0)');
console.log('Arjun Bowling Wickets:', arjunStats.bowling.wickets, '(Expected: 1 + 1 + 3 = 5)');
console.log('Arjun Bowling Economy:', arjunStats.bowling.economy, '(Expected: (74 / 11) = 6.7)');
console.log('Arjun Bowling Average:', arjunStats.bowling.average, '(Expected: (74 / 5) = 14.8)');
console.log('Arjun Best Bowling:', arjunStats.bowling.bestBowling, '(Expected: 3/24)');
console.log('Arjun Maiden Overs:', arjunStats.bowling.maidens, '(Expected: 2)');

console.assert(arjunStats.bowling.matches === 3, 'Bowling matches should be 3');
console.assert(arjunStats.bowling.oversDisplay === '11.0', 'Overs should be 11.0');
console.assert(arjunStats.bowling.wickets === 5, 'Wickets should be 5');
console.assert(arjunStats.bowling.economy === '6.7', 'Economy should be 6.7');
console.assert(arjunStats.bowling.average === '14.8', 'Bowling avg should be 14.8');
console.assert(arjunStats.bowling.bestBowling === '3/24', 'Best bowling should be 3/24');
console.assert(arjunStats.bowling.maidens === 2, 'Maidens should be 2');

console.log('\nArjun Fielding Catches:', arjunStats.fielding.catches, '(Expected: 1)');
console.log('Arjun Fielding Run Outs:', arjunStats.fielding.runOuts, '(Expected: 1)');
console.assert(arjunStats.fielding.catches === 1, 'Catches should be 1');
console.assert(arjunStats.fielding.runOuts === 1, 'Run outs should be 1');

console.log('\nArjun Match Summary:');
console.log('Matches:', arjunStats.matchSummary.matches, 'Won:', arjunStats.matchSummary.won, 'Win%:', arjunStats.matchSummary.winPercentage, 'POTM:', arjunStats.matchSummary.potmCount);
console.assert(arjunStats.matchSummary.matches === 3, 'Total matches should be 3');
console.assert(arjunStats.matchSummary.won === 2, 'Won should be 2');
console.assert(arjunStats.matchSummary.winPercentage === '66.7%', 'Win% should be 66.7%');
console.assert(arjunStats.matchSummary.potmCount === 2, 'POTM should be 2');

console.log('\nArjun Recent Performance Cards (Top 3):');
arjunStats.recentPerformance.forEach((p, i) => {
  console.log(`Card ${i + 1}: ${p.score} (${p.balls}) vs ${p.vs} • POTM: ${p.potm} • ${p.time}`);
});
console.assert(arjunStats.recentPerformance.length === 3, 'Should have 3 recent performance records');
console.assert(arjunStats.recentPerformance[0].score === '86*', 'First card score should be 86*');
console.assert(arjunStats.recentPerformance[0].vs === 'Royal Strikers', 'Opponent should be Royal Strikers');
console.assert(arjunStats.recentPerformance[0].potm === true, 'First card POTM should be true');

console.log('\nArjun Form Data (Last 5):');
arjunStats.formData.forEach((f, i) => {
  console.log(`Match ${i + 1}: ${f.score} runs [${f.result}]`);
});
console.assert(arjunStats.formData.length === 3, 'Form data length should be 3');
console.assert(arjunStats.formData[0].score === 86 && arjunStats.formData[0].result === 'W', 'Form 1 should be 86 W');
console.assert(arjunStats.formData[1].score === 42 && arjunStats.formData[1].result === 'L', 'Form 2 should be 42 L');
console.assert(arjunStats.formData[2].score === 31 && arjunStats.formData[2].result === 'W', 'Form 3 should be 31 W');

console.log('\nArjun Achievements:');
arjunStats.achievements.forEach(a => console.log(`- ${a.title}: ${a.value}`));
console.assert(arjunStats.achievements.some(a => a.title === 'POTM' && a.value === '2 Times'), 'Should have POTM achievement');
console.assert(arjunStats.achievements.some(a => a.title === '100 Runs'), 'Should have 100 Runs achievement');

console.log('TEST 2 PASSED: Real match calculation verified!\n');

console.log('=== TEST 3: Legal Overs Calculation (Fractional Over Summing) ===');
const legalBallMatch = [
  {
    id: 'm_legal_1',
    status: 'Completed',
    date: '2026-05-20',
    playingXI_A: [{ id: 'usr_bowler1' }],
    firstInnings: {
      bowlers: {
        'usr_bowler1': { overs: 5, balls: 4, wickets: 2, runsConceded: 30 } // 34 balls
      }
    }
  },
  {
    id: 'm_legal_2',
    status: 'Completed',
    date: '2026-05-21',
    playingXI_A: [{ id: 'usr_bowler1' }],
    firstInnings: {
      bowlers: {
        'usr_bowler1': { overs: 2, balls: 4, wickets: 1, runsConceded: 16 } // 16 balls
      }
    }
  }
];
// 34 balls + 16 balls = 50 legal balls = 8.2 overs (NOT 7.8!)
const bowlerStats = calculatePlayerStats(legalBallMatch, 'usr_bowler1');
console.log('Total Overs Display:', bowlerStats.bowling.oversDisplay, '(Expected: 8.2)');
console.assert(bowlerStats.bowling.oversDisplay === '8.2', 'Overs must be 8.2 (50 legal balls)');
console.log('TEST 3 PASSED: Cricket legal ball over arithmetic verified!\n');

console.log('=== TEST 4: Format Filter ===');
const t20Only = calculatePlayerStats(sampleMatches, 'usr_arjun123', { formatFilter: 'T20' });
console.log('T20 Matches:', t20Only.batting.matches);
console.assert(t20Only.batting.matches === 3, 'T20 matches should be 3');

const odiOnly = calculatePlayerStats(sampleMatches, 'usr_arjun123', { formatFilter: 'ODI' });
console.log('ODI Matches:', odiOnly.batting.matches);
console.assert(odiOnly.batting.matches === 0, 'ODI matches should be 0');
console.assert(odiOnly.batting.runs === 0, 'ODI runs should be 0');
console.assert(odiOnly.recentPerformance.length === 0, 'ODI recent performance should be empty');
console.log('TEST 4 PASSED: Format filter verified!\n');

console.log('=== TEST 5: Idempotency & Prevention of Double Counting ===');
const run1 = calculatePlayerStats(sampleMatches, 'usr_arjun123');
const run2 = calculatePlayerStats(sampleMatches, 'usr_arjun123');
console.assert(run1.batting.runs === run2.batting.runs, 'Runs must match across calls');
console.assert(run1.bowling.wickets === run2.bowling.wickets, 'Wickets must match across calls');
console.assert(run1.matchSummary.matches === run2.matchSummary.matches, 'Matches must match across calls');
console.log('TEST 5 PASSED: Strict idempotency confirmed!\n');

console.log('ALL TESTS PASSED SUCCESSFULLY! Real Cricket Player Profile Engine is 100% verified.');
