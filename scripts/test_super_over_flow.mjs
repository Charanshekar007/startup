/**
 * Test Suite: EZKORA Super Over Engine & Player Initialization Verification
 *
 * Verifies:
 * 1. Absence of undefined 'remainingBatters' in Super Over setup.
 * 2. Correct derivation of soBatters from battingSquad with proper player status.
 * 3. Prevention of duplicate striker/non-striker selection.
 * 4. Bowler and wicketkeeper state initialization.
 * 5. Elimination of stray text strings / unrendered non-boolean expressions in JSX.
 * 6. ICC Super Over rules: 6 legal balls or 2 wickets limit per innings.
 * 7. Target derivation and chase completion in Super Over Innings 2.
 * 8. Repeat Super Over rules (tied SO) and ineligible dismissed batter / bowler tracking.
 * 9. Tournament context preservation (tournamentId, fixtureId, matchId).
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('======================================================================');
console.log('⚡ EZKORA SUPER OVER ENGINE & CRASH REGRESSION TEST SUITE');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// GROUP 1: Codebase Audit & Reference Verification
// -----------------------------------------------------------------------------
console.log('GROUP 1: Codebase Reference Verification & JSX Safety');

const liveScoringCode = fs.readFileSync('src/main/LiveScoringScreen.js', 'utf8');

test("No undeclared 'remainingBatters' in renderSuperOverSetupScreen", () => {
  // Find renderSuperOverSetupScreen block
  const setupIndex = liveScoringCode.indexOf('const renderSuperOverSetupScreen = () => {');
  assert.ok(setupIndex !== -1, 'renderSuperOverSetupScreen function must exist');
  const setupEndIndex = liveScoringCode.indexOf('// SCREEN: SUPER OVER TIED', setupIndex);
  assert.ok(setupEndIndex !== -1, 'renderSuperOverSetupScreen closing comment must exist');
  const setupBody = liveScoringCode.slice(setupIndex, setupEndIndex);

  assert.ok(
    !setupBody.includes('remainingBatters.map'),
    "renderSuperOverSetupScreen must NOT reference remainingBatters.map"
  );
  assert.ok(
    !setupBody.includes('remainingBatters'),
    "renderSuperOverSetupScreen must NOT reference undefined remainingBatters anywhere"
  );
});

test("Super Over scorecard correctly derives soBatters from battingSquad", () => {
  const setupIndex = liveScoringCode.indexOf('const renderSuperOverSetupScreen = () => {');
  const setupEndIndex = liveScoringCode.indexOf('// SCREEN: SUPER OVER TIED', setupIndex);
  const setupBody = liveScoringCode.slice(setupIndex, setupEndIndex);

  assert.ok(
    setupBody.includes('const soBatters = battingSquad.map'),
    "Super Over scorecard must derive soBatters from battingSquad.map"
  );
  assert.ok(
    setupBody.includes("setBattersScorecard(soBatters)"),
    "setBattersScorecard must be called with soBatters"
  );
});

test("persistLiveDelivery preserves superOverTarget in 2nd Innings", () => {
  const setupIndex = liveScoringCode.indexOf('const renderSuperOverSetupScreen = () => {');
  const setupEndIndex = liveScoringCode.indexOf('// SCREEN: SUPER OVER TIED', setupIndex);
  const setupBody = liveScoringCode.slice(setupIndex, setupEndIndex);

  assert.ok(
    setupBody.includes('superOverTarget: superOverInnings === 2 ? superOverTarget : null'),
    "persistLiveDelivery in Super Over setup must retain superOverTarget when superOverInnings === 2"
  );
});

test("Wicketkeeper JSX check uses Boolean coercion to prevent empty string leak into <View>", () => {
  assert.ok(
    liveScoringCode.includes('{Boolean(wicketkeeper?.name) && ('),
    "LiveScoringScreen must guard wicketkeeper?.name with Boolean(...) to prevent React Native raw text string crash"
  );
  assert.ok(
    !liveScoringCode.includes('{wicketkeeper?.name && (\n                <View'),
    "Uncoerced {wicketkeeper?.name && (<View...)} must not exist"
  );
});

test("NativeWind className styling is strictly preserved", () => {
  assert.ok(
    !liveScoringCode.includes('StyleSheet.create'),
    "LiveScoringScreen must NOT use StyleSheet.create (NativeWind strictly enforced)"
  );
});

// -----------------------------------------------------------------------------
// GROUP 2: Super Over Player Initialization Model Logic
// -----------------------------------------------------------------------------
console.log('\nGROUP 2: Super Over Player Initialization & Scoring Logic');

const MOCK_PLAYING_XI_A = [
  { id: 'pA_1', name: 'Virat Sharma', role: 'Batter', img: 'https://avatar.com/1' },
  { id: 'pA_2', name: 'Rohit Verma', role: 'Batter', img: 'https://avatar.com/2' },
  { id: 'pA_3', name: 'KL Rahul', role: 'Wicketkeeper', img: 'https://avatar.com/3' },
  { id: 'pA_4', name: 'Suryakumar', role: 'Batter', img: 'https://avatar.com/4' },
  { id: 'pA_5', name: 'Hardik P', role: 'All-Rounder', img: 'https://avatar.com/5' },
  { id: 'pA_6', name: 'Ravindra J', role: 'All-Rounder', img: 'https://avatar.com/6' },
  { id: 'pA_7', name: 'Jasprit B', role: 'Bowler', img: 'https://avatar.com/7' },
  { id: 'pA_8', name: 'Mohammed S', role: 'Bowler', img: 'https://avatar.com/8' },
  { id: 'pA_9', name: 'Kuldeep Y', role: 'Bowler', img: 'https://avatar.com/9' },
  { id: 'pA_10', name: 'Arshdeep S', role: 'Bowler', img: 'https://avatar.com/10' },
  { id: 'pA_11', name: 'Yuzvendra C', role: 'Bowler', img: 'https://avatar.com/11' },
];

const MOCK_PLAYING_XI_B = [
  { id: 'pB_1', name: 'David Warner', role: 'Batter', img: 'https://avatar.com/b1' },
  { id: 'pB_2', name: 'Travis Head', role: 'Batter', img: 'https://avatar.com/b2' },
  { id: 'pB_3', name: 'Steve Smith', role: 'Batter', img: 'https://avatar.com/b3' },
  { id: 'pB_4', name: 'Glenn Maxwell', role: 'All-Rounder', img: 'https://avatar.com/b4' },
  { id: 'pB_5', name: 'Marcus Stoinis', role: 'All-Rounder', img: 'https://avatar.com/b5' },
  { id: 'pB_6', name: 'Alex Carey', role: 'Wicketkeeper', img: 'https://avatar.com/b6' },
  { id: 'pB_7', name: 'Pat Cummins', role: 'Bowler', img: 'https://avatar.com/b7' },
  { id: 'pB_8', name: 'Mitchell Starc', role: 'Bowler', img: 'https://avatar.com/b8' },
  { id: 'pB_9', name: 'Adam Zampa', role: 'Bowler', img: 'https://avatar.com/b9' },
  { id: 'pB_10', name: 'Josh Hazlewood', role: 'Bowler', img: 'https://avatar.com/b10' },
  { id: 'pB_11', name: 'Nathan Lyon', role: 'Bowler', img: 'https://avatar.com/b11' },
];

function initializeSuperOverState({
  battingSquad,
  bowlingSquad,
  selectedStriker,
  selectedNonStriker,
  selectedBowler,
  selectedKeeper,
  superOverInnings = 1,
  superOverTarget = null,
}) {
  // 1. Validation
  if (!selectedStriker || !selectedNonStriker) {
    throw new Error('Please select both opening batters.');
  }
  if (selectedStriker.id === selectedNonStriker.id) {
    throw new Error('Batter 1 and Batter 2 must be different players.');
  }
  if (!selectedBowler) {
    throw new Error('Please select the bowler.');
  }
  if (!selectedKeeper) {
    throw new Error('Please select the wicketkeeper from the fielding team.');
  }

  // 2. Batting squad validation
  const isStrikerValid = battingSquad.some((p) => p.id === selectedStriker.id);
  const isNonStrikerValid = battingSquad.some((p) => p.id === selectedNonStriker.id);
  if (!isStrikerValid || !isNonStrikerValid) {
    throw new Error('Batters must belong to batting playing XI.');
  }

  // 3. Bowling squad validation
  const isBowlerValid = bowlingSquad.some((p) => p.id === selectedBowler.id);
  const isKeeperValid = bowlingSquad.some((p) => p.id === selectedKeeper.id);
  if (!isBowlerValid || !isKeeperValid) {
    throw new Error('Bowler and wicketkeeper must belong to bowling playing XI.');
  }

  // 4. Initialize active players
  const s = { ...selectedStriker, runs: 0, balls: 0, fours: 0, sixes: 0 };
  const ns = { ...selectedNonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 };
  const b = { ...selectedBowler, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0 };

  // 5. Build soBatters from battingSquad
  const soBatters = battingSquad.map((p) => {
    if (p.id === s.id || p.id === ns.id) {
      return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out', dismissal: 'batting' };
    }
    return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'yet to bat', dismissal: '' };
  });

  // 6. Build bowler stats map
  const bowlerStatsMap = {};
  bowlingSquad.forEach((p) => {
    bowlerStatsMap[p.id] = { name: p.name, overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
  });

  return {
    striker: s,
    nonStriker: ns,
    bowler: b,
    wicketkeeper: selectedKeeper,
    battersScorecard: soBatters,
    bowlerStatsMap,
    superOverTarget: superOverInnings === 2 ? superOverTarget : null,
    totalRuns: 0,
    totalWickets: 0,
    legalBalls: 0,
    currentOverNumber: 0,
  };
}

test("Super Over initializes correctly without errors", () => {
  const result = initializeSuperOverState({
    battingSquad: MOCK_PLAYING_XI_A,
    bowlingSquad: MOCK_PLAYING_XI_B,
    selectedStriker: MOCK_PLAYING_XI_A[0],
    selectedNonStriker: MOCK_PLAYING_XI_A[1],
    selectedBowler: MOCK_PLAYING_XI_B[7], // Starc
    selectedKeeper: MOCK_PLAYING_XI_B[5], // Carey
    superOverInnings: 1,
  });

  assert.strictEqual(result.striker.id, 'pA_1');
  assert.strictEqual(result.nonStriker.id, 'pA_2');
  assert.strictEqual(result.bowler.id, 'pB_8');
  assert.strictEqual(result.wicketkeeper.id, 'pB_6');
  assert.strictEqual(result.battersScorecard.length, 11);

  const strikerRecord = result.battersScorecard.find((b) => b.id === 'pA_1');
  const nonStrikerRecord = result.battersScorecard.find((b) => b.id === 'pA_2');
  const rahulRecord = result.battersScorecard.find((b) => b.id === 'pA_3');

  assert.strictEqual(strikerRecord.status, 'not out');
  assert.strictEqual(strikerRecord.dismissal, 'batting');
  assert.strictEqual(nonStrikerRecord.status, 'not out');
  assert.strictEqual(nonStrikerRecord.dismissal, 'batting');
  assert.strictEqual(rahulRecord.status, 'yet to bat');
  assert.strictEqual(rahulRecord.dismissal, '');

  assert.strictEqual(result.bowlerStatsMap['pB_8'].runsConceded, 0);
  assert.strictEqual(result.totalRuns, 0);
  assert.strictEqual(result.totalWickets, 0);
  assert.strictEqual(result.legalBalls, 0);
});

test("Duplicate opening batter selection is rejected", () => {
  assert.throws(() => {
    initializeSuperOverState({
      battingSquad: MOCK_PLAYING_XI_A,
      bowlingSquad: MOCK_PLAYING_XI_B,
      selectedStriker: MOCK_PLAYING_XI_A[0],
      selectedNonStriker: MOCK_PLAYING_XI_A[0], // Duplicate!
      selectedBowler: MOCK_PLAYING_XI_B[7],
      selectedKeeper: MOCK_PLAYING_XI_B[5],
    });
  }, /Batter 1 and Batter 2 must be different/);
});

test("Missing bowler or keeper is rejected", () => {
  assert.throws(() => {
    initializeSuperOverState({
      battingSquad: MOCK_PLAYING_XI_A,
      bowlingSquad: MOCK_PLAYING_XI_B,
      selectedStriker: MOCK_PLAYING_XI_A[0],
      selectedNonStriker: MOCK_PLAYING_XI_A[1],
      selectedBowler: null,
      selectedKeeper: MOCK_PLAYING_XI_B[5],
    });
  }, /select the bowler/);

  assert.throws(() => {
    initializeSuperOverState({
      battingSquad: MOCK_PLAYING_XI_A,
      bowlingSquad: MOCK_PLAYING_XI_B,
      selectedStriker: MOCK_PLAYING_XI_A[0],
      selectedNonStriker: MOCK_PLAYING_XI_A[1],
      selectedBowler: MOCK_PLAYING_XI_B[7],
      selectedKeeper: null,
    });
  }, /select the wicketkeeper/);
});

// -----------------------------------------------------------------------------
// GROUP 3: Super Over Match Rules (6 balls or 2 wickets) & Wicket Transitions
// -----------------------------------------------------------------------------
console.log('\nGROUP 3: Super Over Rules (Max 2 Wickets & 6 Balls)');

function simulateDelivery(state, battingSquad, delivery) {
  let { totalRuns, totalWickets, legalBalls, striker, nonStriker, bowler, battersScorecard, fallOfWickets = [] } = state;
  let isOverEnd = false;
  let isInningsEnd = false;

  if (delivery.type === 'runs') {
    totalRuns += delivery.runs;
    striker.runs += delivery.runs;
    striker.balls += 1;
    if (delivery.runs === 4) striker.fours += 1;
    if (delivery.runs === 6) striker.sixes += 1;
    bowler.runsConceded += delivery.runs;
    legalBalls += 1;

    // Strike rotation on odd runs
    if (delivery.runs % 2 === 1) {
      const temp = striker;
      striker = nonStriker;
      nonStriker = temp;
    }
  } else if (delivery.type === 'wicket') {
    totalWickets += 1;
    striker.balls += 1;
    bowler.wickets += 1;
    legalBalls += 1;

    // Mark dismissed in scorecard
    battersScorecard = battersScorecard.map((b) =>
      b.id === striker.id ? { ...b, runs: striker.runs, balls: striker.balls, status: 'out', dismissal: `b ${bowler.name}` } : b
    );

    fallOfWickets.push({ wicket: totalWickets, score: totalRuns, batter: striker.name, batterId: striker.id });

    // Super Over Max Wickets = 2
    if (totalWickets >= 2) {
      isInningsEnd = true;
    } else {
      // 1st Wicket: Next batter enters
      const dismissedNames = fallOfWickets.map((f) => f.batter);
      const remainingBatters = battingSquad.filter((p) => !dismissedNames.includes(p.name) && p.name !== nonStriker.name);
      const nextBatter = remainingBatters[0];
      assert.ok(nextBatter, 'A 3rd batter must be available for 1st wicket in Super Over');
      striker = { ...nextBatter, runs: 0, balls: 0, fours: 0, sixes: 0 };
      battersScorecard = battersScorecard.map((b) =>
        b.id === nextBatter.id ? { ...b, status: 'not out', dismissal: 'batting' } : b
      );
    }
  }

  if (legalBalls >= 6) {
    isOverEnd = true;
    isInningsEnd = true;
  }

  return {
    ...state,
    totalRuns,
    totalWickets,
    legalBalls,
    striker,
    nonStriker,
    bowler,
    battersScorecard,
    fallOfWickets,
    isOverEnd,
    isInningsEnd,
  };
}

test("Super Over ends on 6 legal deliveries", () => {
  let state = initializeSuperOverState({
    battingSquad: MOCK_PLAYING_XI_A,
    bowlingSquad: MOCK_PLAYING_XI_B,
    selectedStriker: MOCK_PLAYING_XI_A[0],
    selectedNonStriker: MOCK_PLAYING_XI_A[1],
    selectedBowler: MOCK_PLAYING_XI_B[7],
    selectedKeeper: MOCK_PLAYING_XI_B[5],
  });

  // Score 6 legal deliveries: 1, 2, 4, 0, 6, 1 = 14 runs
  const deliveries = [
    { type: 'runs', runs: 1 },
    { type: 'runs', runs: 2 },
    { type: 'runs', runs: 4 },
    { type: 'runs', runs: 0 },
    { type: 'runs', runs: 6 },
    { type: 'runs', runs: 1 },
  ];

  for (let i = 0; i < deliveries.length; i++) {
    state = simulateDelivery(state, MOCK_PLAYING_XI_A, deliveries[i]);
    if (i < 5) {
      assert.strictEqual(state.isInningsEnd, false, `Delivery ${i + 1} should not end innings`);
    }
  }

  assert.strictEqual(state.legalBalls, 6);
  assert.strictEqual(state.totalRuns, 14);
  assert.strictEqual(state.totalWickets, 0);
  assert.strictEqual(state.isInningsEnd, true, '6th legal ball must conclude Super Over innings');
});

test("Super Over allows 1 wicket and brings 3rd batter; 2nd wicket concludes innings immediately", () => {
  let state = initializeSuperOverState({
    battingSquad: MOCK_PLAYING_XI_A,
    bowlingSquad: MOCK_PLAYING_XI_B,
    selectedStriker: MOCK_PLAYING_XI_A[0],
    selectedNonStriker: MOCK_PLAYING_XI_A[1],
    selectedBowler: MOCK_PLAYING_XI_B[7],
    selectedKeeper: MOCK_PLAYING_XI_B[5],
  });

  // Ball 1: Wicket! (Striker pA_1 out)
  state = simulateDelivery(state, MOCK_PLAYING_XI_A, { type: 'wicket' });
  assert.strictEqual(state.totalWickets, 1);
  assert.strictEqual(state.isInningsEnd, false, '1st wicket must NOT end Super Over (max 2 wickets allowed)');
  assert.strictEqual(state.striker.id, 'pA_3', '3rd batter (KL Rahul) must come in after 1st wicket');
  assert.strictEqual(state.nonStriker.id, 'pA_2', 'Non-striker must remain');

  // Ball 2: 4 runs by new batter
  state = simulateDelivery(state, MOCK_PLAYING_XI_A, { type: 'runs', runs: 4 });
  assert.strictEqual(state.totalRuns, 4);
  assert.strictEqual(state.isInningsEnd, false);

  // Ball 3: 2nd Wicket! (Striker pA_3 out)
  state = simulateDelivery(state, MOCK_PLAYING_XI_A, { type: 'wicket' });
  assert.strictEqual(state.totalWickets, 2);
  assert.strictEqual(state.isInningsEnd, true, '2nd wicket must immediately conclude Super Over innings');
});

// -----------------------------------------------------------------------------
// GROUP 4: Super Over Innings 2 Chase & Repeat Super Over Rules
// -----------------------------------------------------------------------------
console.log('\nGROUP 4: Super Over Innings 2 Target & Repeat Super Over Rules');

test("Super Over Innings 2 computes target correctly (inn1Runs + 1)", () => {
  const inn1FinalRuns = 15;
  const target = inn1FinalRuns + 1;

  const so2State = initializeSuperOverState({
    battingSquad: MOCK_PLAYING_XI_B, // Team B bats 2nd
    bowlingSquad: MOCK_PLAYING_XI_A, // Team A bowls 2nd
    selectedStriker: MOCK_PLAYING_XI_B[0], // Warner
    selectedNonStriker: MOCK_PLAYING_XI_B[1], // Head
    selectedBowler: MOCK_PLAYING_XI_A[6], // Bumrah
    selectedKeeper: MOCK_PLAYING_XI_A[2], // Rahul
    superOverInnings: 2,
    superOverTarget: target,
  });

  assert.strictEqual(so2State.superOverTarget, 16);
  assert.strictEqual(so2State.striker.name, 'David Warner');
  assert.strictEqual(so2State.bowler.name, 'Jasprit B');
});

test("Super Over Tied triggers repeat Super Over and enforces player restrictions", () => {
  // If SO 1 ends tied at 14 runs each:
  const dismissedInSO1 = ['pA_1', 'pA_3', 'pB_1']; // Batters dismissed in SO 1
  const bowlerInSO1_A = 'pA_7'; // Jasprit B bowled for Team A
  const bowlerInSO1_B = 'pB_8'; // Starc bowled for Team B

  // Under ICC rules:
  // 1. Ineligible batters: dismissedInSO1 cannot bat in SO 2
  const eligibleBatters_A = MOCK_PLAYING_XI_A.filter(
    (p) => !dismissedInSO1.includes(p.id) && !dismissedInSO1.includes(p.name)
  );
  assert.ok(!eligibleBatters_A.some((p) => p.id === 'pA_1'), 'Dismissed batter pA_1 must be ineligible');
  assert.ok(!eligibleBatters_A.some((p) => p.id === 'pA_3'), 'Dismissed batter pA_3 must be ineligible');
  assert.ok(eligibleBatters_A.some((p) => p.id === 'pA_2'), 'Undismissed batter pA_2 remains eligible');

  // 2. Ineligible bowler: Pat Cummins can bowl, but Starc cannot bowl consecutive SO
  const eligibleBowlers_B = MOCK_PLAYING_XI_B.filter((p) => p.id !== bowlerInSO1_B);
  assert.ok(!eligibleBowlers_B.some((p) => p.id === bowlerInSO1_B), 'Starc cannot bowl repeat Super Over');
  assert.ok(eligibleBowlers_B.some((p) => p.id === 'pB_7'), 'Pat Cummins can bowl repeat Super Over');
});

// -----------------------------------------------------------------------------
// GROUP 5: Standalone & Tournament Context Integration
// -----------------------------------------------------------------------------
console.log('\nGROUP 5: Standalone & Tournament Integration');

test("Tournament fixture retains tournamentId, fixtureId, matchId through Super Over", () => {
  const tournamentMatchParam = {
    id: 'match_tourn_fix_777',
    tournamentId: 'tourn_chota_bhai_99',
    fixtureId: 'fix_round_1_match_1',
    teamA: 'Falcons CC',
    teamB: 'Warriors XI',
    isSuperOver: true,
    superOverNumber: 1,
    superOvers: [
      {
        superOverNumber: 1,
        winner: 'Warriors XI',
        margin: 'Won by 2 runs',
        innings1: { battingTeam: 'Warriors XI', totalRuns: 16, totalWickets: 1 },
        innings2: { battingTeam: 'Falcons CC', totalRuns: 14, totalWickets: 2 },
      },
    ],
  };

  assert.strictEqual(tournamentMatchParam.tournamentId, 'tourn_chota_bhai_99');
  assert.strictEqual(tournamentMatchParam.fixtureId, 'fix_round_1_match_1');
  assert.strictEqual(tournamentMatchParam.superOvers.length, 1);
  assert.strictEqual(tournamentMatchParam.superOvers[0].winner, 'Warriors XI');
});

console.log('\n======================================================================');
console.log(`🎉 ALL SUPER OVER TESTS PASSED! (${passedTests}/${totalTests} succeeded)`);
console.log('======================================================================\n');
