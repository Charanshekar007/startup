/**
 * test_tournament_flow.mjs
 * 
 * Comprehensive automated verification suite for EZKORA Tournament V1:
 * - Tournament creation, draft lifecycle, and validation
 * - Organizer invitations and team applications with strict permission checks
 * - Format A: League (round-robin, deterministic tie-breaks, ICC NRR math with all-outs & decimal balls)
 * - Format B: Groups + Playoffs (group seeding, round-robin, automated playoff qualification)
 * - Format C: Direct Knockout (byes for non-power-of-2 team counts, automatic bye progression, bracket tree)
 * - Match Engine Integration (fixture-to-match linking, idempotent result finalization)
 */

// Polyfill window.localStorage for Node test runner
if (typeof window === 'undefined') {
  const store = {};
  global.window = {
    localStorage: {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    }
  };
}

import assert from 'assert';
import {
  tournamentService,
  cricketOversToDecimal,
  decimalToCricketOvers,
} from '../src/services/tournamentService.js';
import {
  getTournaments,
  getTournamentById,
  saveTournament,
} from '../src/store/tournamentRepository.js';

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('======================================================================');
  console.log('🏏 EZKORA TOURNAMENT V1 — AUTOMATED VERIFICATION SUITE');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // 1. CRICKET OVERS & ICC NRR MATH
  // -------------------------------------------------------------------------
  console.log('SECTION 1: Cricket Overs Conversion & ICC NRR Precision');
  runTest('cricketOversToDecimal converts completed overs correctly', () => {
    assert.strictEqual(cricketOversToDecimal(20), 20);
    assert.strictEqual(cricketOversToDecimal('20.0'), 20);
    assert.strictEqual(cricketOversToDecimal('0'), 0);
  });

  runTest('cricketOversToDecimal accurately converts balls to fractional 6ths', () => {
    // 19.3 overs = 19 + 3/6 = 19.5
    assert.strictEqual(cricketOversToDecimal('19.3'), 19.5);
    // 19.1 overs = 19 + 1/6 = 19.16666...
    const dec1 = cricketOversToDecimal('19.1');
    assert(Math.abs(dec1 - (19 + 1 / 6)) < 0.0001);
    // 19.5 overs = 19 + 5/6 = 19.8333...
    const dec5 = cricketOversToDecimal('19.5');
    assert(Math.abs(dec5 - (19 + 5 / 6)) < 0.0001);
  });

  runTest('decimalToCricketOvers converts decimal overs back to cricket balls', () => {
    assert.strictEqual(decimalToCricketOvers(20), '20.0');
    assert.strictEqual(decimalToCricketOvers(19.5), '19.3');
    assert.strictEqual(decimalToCricketOvers(19 + 1 / 6), '19.1');
    assert.strictEqual(decimalToCricketOvers(19 + 5 / 6), '19.5');
  });

  // -------------------------------------------------------------------------
  // 2. DRAFT CREATION & REPOSITORY PERSISTENCE
  // -------------------------------------------------------------------------
  console.log('\nSECTION 2: Tournament Draft Lifecycle & Persistence');
  const testTournamentId = `test_tourn_${Date.now()}`;
  const organizerId = 'user_organizer_01';

  await runAsyncTest('Create and persist draft tournament', async () => {
    const draftData = {
      id: testTournamentId,
      name: 'Bangalore Premier Cup 2026',
      description: 'Official Club Championship',
      organizerId,
      organizerName: 'Arjun Scorer',
      status: 'draft',
      visibility: 'public',
      city: 'Bengaluru',
      venue: 'Chinnaswamy Annexe Ground',
      startDate: '2026-11-01',
      endDate: '2026-11-15',
      registrationDeadline: '2026-10-25',
      rules: {
        ballType: 'Leather',
        matchFormat: 'T20',
        oversPerInnings: 20,
        playersPerSide: 11,
        pointsWin: 2,
        pointsTie: 1,
        pointsNoResult: 1,
        pointsLoss: 0,
      },
      registration: {
        capacity: 8,
        maxTeams: 8,
        teams: [
          { teamId: 'tm_warriors', teamName: 'Warriors XI', status: 'accepted', joinedAt: Date.now() },
          { teamId: 'tm_falcons', teamName: 'Falcons CC', status: 'accepted', joinedAt: Date.now() },
        ],
      },
      format: {
        type: 'LEAGUE',
        leagueRounds: 'single',
      },
      fixtures: [],
    };

    const saved = await tournamentService.saveTournament(draftData);
    assert(saved, 'Tournament must be saved');
    assert.strictEqual(saved.id, testTournamentId);
    assert.strictEqual(saved.status, 'draft');

    const fetched = await tournamentService.getTournament(testTournamentId);
    assert(fetched, 'Must fetch persisted tournament');
    assert.strictEqual(fetched.name, 'Bangalore Premier Cup 2026');
  });

  // -------------------------------------------------------------------------
  // 3. REGISTRATION & INVITATIONS WORKFLOW WITH PERMISSIONS
  // -------------------------------------------------------------------------
  console.log('\nSECTION 3: Registration, Applications & Organizer Permissions');

  await runAsyncTest('Organizer invites a team (status becomes pending)', async () => {
    const updated = await tournamentService.inviteTeam(testTournamentId, {
      id: 'tm_spartans',
      name: 'Spartans CC',
      logo: 'https://ui-avatars.com/api/?name=SP',
    }, organizerId);

    const teamEntry = updated.registration.teams.find((t) => t.teamId === 'tm_spartans');
    assert(teamEntry, 'Spartans CC must be in registration list');
    assert.strictEqual(teamEntry.status, 'pending');
    assert.strictEqual(teamEntry.type, 'invitation');
  });

  await runAsyncTest('Non-organizer cannot invite teams', async () => {
    await assert.rejects(
      async () => {
        await tournamentService.inviteTeam(testTournamentId, {
          id: 'tm_bad_team',
          name: 'Bad Team',
        }, 'unauthorized_stranger_user');
      },
      /organizer/i,
      'Must reject unauthorized invitation'
    );
  });

  await runAsyncTest('Duplicate team invitation is prevented', async () => {
    await assert.rejects(
      async () => {
        await tournamentService.inviteTeam(testTournamentId, {
          id: 'tm_spartans',
          name: 'Spartans CC',
        }, organizerId);
      },
      /already/i,
      'Must reject duplicate team invitation'
    );
  });

  await runAsyncTest('Invited team responds and accepts invitation', async () => {
    const updated = await tournamentService.respondToInvitation(testTournamentId, 'tm_spartans', 'accept');
    const teamEntry = updated.registration.teams.find((t) => t.teamId === 'tm_spartans');
    assert.strictEqual(teamEntry.status, 'accepted');
  });

  await runAsyncTest('External team applies to tournament (status pending application)', async () => {
    const updated = await tournamentService.applyToTournament(testTournamentId, {
      id: 'tm_titans',
      name: 'Titans XI',
      logo: 'https://ui-avatars.com/api/?name=TX',
    }, 'capt_titans_01');

    const teamEntry = updated.registration.teams.find((t) => t.teamId === 'tm_titans');
    assert(teamEntry, 'Titans XI must be registered');
    assert.strictEqual(teamEntry.status, 'pending');
    assert.strictEqual(teamEntry.type, 'application');
  });

  await runAsyncTest('Non-organizer cannot decide team application', async () => {
    await assert.rejects(
      async () => {
        await tournamentService.decideApplication(testTournamentId, 'tm_titans', 'accept', 'stranger_user_99');
      },
      /organizer/i,
      'Unauthorized decision must be rejected'
    );
  });

  await runAsyncTest('Authorized organizer approves team application', async () => {
    const updated = await tournamentService.decideApplication(testTournamentId, 'tm_titans', 'accept', organizerId);
    const teamEntry = updated.registration.teams.find((t) => t.teamId === 'tm_titans');
    assert.strictEqual(teamEntry.status, 'accepted');
  });

  // -------------------------------------------------------------------------
  // 4. FORMAT A: LEAGUE ROUND-ROBIN GENERATION & STANDINGS
  // -------------------------------------------------------------------------
  console.log('\nSECTION 4: Format A — League Fixtures & Standings Computation');

  await runAsyncTest('Generate single round-robin fixtures for 4 accepted teams', async () => {
    const tournament = await tournamentService.getTournament(testTournamentId);
    const acceptedTeams = tournament.registration.teams.filter((t) => t.status === 'accepted');
    assert.strictEqual(acceptedTeams.length, 4, 'Must have 4 accepted teams: Warriors, Falcons, Spartans, Titans');

    const fixtures = tournamentService.generateLeagueFixtures(tournament);
    // For 4 teams: N*(N-1)/2 = 4*3/2 = 6 fixtures across 3 rounds
    assert.strictEqual(fixtures.length, 6, 'Single round-robin for 4 teams must have exactly 6 fixtures');
    const roundCount = Math.max(...fixtures.map((f) => f.round));
    assert.strictEqual(roundCount, 3, 'Must have 3 rounds');

    tournament.fixtures = fixtures;
    tournament.status = 'published';
    await tournamentService.saveTournament(tournament);
  });

  await runAsyncTest('Simulate League matches and compute ICC Net Run Rate', async () => {
    const tournament = await tournamentService.getTournament(testTournamentId);

    // Match 1: Warriors XI (200/4 in 20.0 ov) vs Falcons CC (160/10 all out in 18.2 ov)
    // IMPORTANT: Since Falcons CC was all-out in 18.2 ov, ICC NRR rule mandates
    // their overs counted against them is FULL 20.0 overs!
    const fix1 = tournament.fixtures[0];
    fix1.status = 'Completed';
    fix1.teamA = { id: 'tm_warriors', name: 'Warriors XI', shortName: 'WAR' };
    fix1.teamB = { id: 'tm_falcons', name: 'Falcons CC', shortName: 'FAL' };
    fix1.winnerId = 'tm_warriors';
    fix1.resultText = 'Warriors XI won by 40 runs';
    fix1.scoreA = '200/4';
    fix1.oversA = '20.0';
    fix1.scoreB = '160/10';
    fix1.oversB = '18.2';

    // Match 2: Spartans CC (150/5 in 20.0 ov) vs Titans XI (152/2 in 19.3 ov)
    // Titans reached target in 19.3 overs (19.5 decimal overs)
    const fix2 = tournament.fixtures[1];
    fix2.status = 'Completed';
    fix2.teamA = { id: 'tm_spartans', name: 'Spartans CC', shortName: 'SPA' };
    fix2.teamB = { id: 'tm_titans', name: 'Titans XI', shortName: 'TIT' };
    fix2.winnerId = 'tm_titans';
    fix2.resultText = 'Titans XI won by 8 wickets';
    fix2.scoreA = '150/5';
    fix2.oversA = '20.0';
    fix2.scoreB = '152/2';
    fix2.oversB = '19.3';

    await tournamentService.saveTournament(tournament);

    const standings = tournamentService.calculateStandings(tournament);
    assert(Array.isArray(standings), 'Standings must be an array for League format');
    assert.strictEqual(standings.length, 4);

    // Warriors: Played 1, Won 1, Pts 2
    // Runs For: 200 in 20.0 ov (RR: 10.000)
    // Runs Against: 160 in 20.0 ov (because Falcons all out! RR: 8.000)
    // NRR: 10.000 - 8.000 = +2.000
    const warRow = standings.find((s) => s.teamId === 'tm_warriors');
    assert(warRow, 'Warriors row must exist');
    assert.strictEqual(warRow.points, 2);
    assert.strictEqual(warRow.won, 1);
    assert.strictEqual(warRow.nrr, 2.0);

    // Falcons: Played 1, Lost 1, Pts 0
    // NRR: -2.000
    const falRow = standings.find((s) => s.teamId === 'tm_falcons');
    assert.strictEqual(falRow.points, 0);
    assert.strictEqual(falRow.lost, 1);
    assert.strictEqual(falRow.nrr, -2.0);

    // Titans: Played 1, Won 1, Pts 2
    // Runs For: 152 in 19.5 ov (RR: 152/19.5 = 7.795)
    // Runs Against: 150 in 20.0 ov (RR: 7.500)
    // NRR: 7.795 - 7.500 = +0.295
    const titRow = standings.find((s) => s.teamId === 'tm_titans');
    assert.strictEqual(titRow.points, 2);
    assert.strictEqual(titRow.nrr, 0.295);

    // Standings sort order: Rank 1 Warriors (Pts 2, NRR +2.000), Rank 2 Titans (Pts 2, NRR +0.295)
    assert.strictEqual(standings[0].teamId, 'tm_warriors');
    assert.strictEqual(standings[1].teamId, 'tm_titans');
  });

  // -------------------------------------------------------------------------
  // 5. FORMAT B: GROUPS + PLAYOFFS
  // -------------------------------------------------------------------------
  console.log('\nSECTION 5: Format B — Groups + Playoffs Generation & Seeding');

  await runAsyncTest('Configure Groups + Playoffs for 6 teams into 2 groups of 3', async () => {
    const groupsTournId = `test_groups_${Date.now()}`;
    const groupsTournament = {
      id: groupsTournId,
      name: 'South India Trophy 2026',
      organizerId,
      status: 'published',
      rules: { oversPerInnings: 20, pointsWin: 2, pointsTie: 1, pointsNoResult: 1 },
      registration: {
        capacity: 6,
        maxTeams: 6,
        teams: [
          { teamId: 't1', teamName: 'Alpha XI', group: 'A', status: 'accepted' },
          { teamId: 't2', teamName: 'Beta XI', group: 'A', status: 'accepted' },
          { teamId: 't3', teamName: 'Gamma XI', group: 'A', status: 'accepted' },
          { teamId: 't4', teamName: 'Delta XI', group: 'B', status: 'accepted' },
          { teamId: 't5', teamName: 'Epsilon XI', group: 'B', status: 'accepted' },
          { teamId: 't6', teamName: 'Zeta XI', group: 'B', status: 'accepted' },
        ],
      },
      format: {
        type: 'GROUPS_PLAYOFFS',
        groupCount: 2,
        qualifiersPerGroup: 2,
        playoffType: 'SEMI_AND_FINAL',
      },
      fixtures: [],
    };

    const fixtures = tournamentService.generateGroupsFixtures(groupsTournament);
    // Group A (3 teams): 3 matches
    // Group B (3 teams): 3 matches
    // Playoffs: SF1 (A1 vs B2), SF2 (B1 vs A2), Final = 3 matches
    // Total = 9 fixtures
    assert.strictEqual(fixtures.length, 9);

    const groupMatches = fixtures.filter((f) => f.stage === 'GROUP_STAGE');
    assert.strictEqual(groupMatches.length, 6);
    const playoffMatches = fixtures.filter((f) => f.stage !== 'GROUP_STAGE');
    assert.strictEqual(playoffMatches.length, 3);

    groupsTournament.fixtures = fixtures;
    await tournamentService.saveTournament(groupsTournament);
  });

  await runAsyncTest('Complete group matches and verify automatic playoff qualification seeding', async () => {
    const groupsTourn = (await getTournaments()).find((t) => t.format?.type === 'GROUPS_PLAYOFFS' && t.name === 'South India Trophy 2026');
    assert(groupsTourn, 'Groups tournament must exist');

    // Simulate Group A results: Alpha (Won 2), Beta (Won 1, Lost 1), Gamma (Lost 2)
    // Simulate Group B results: Delta (Won 2), Epsilon (Won 1, Lost 1), Zeta (Lost 2)
    const gm = groupsTourn.fixtures.filter((f) => f.stage === 'GROUP_STAGE');
    
    // Group A fixtures
    const gmA = gm.filter((f) => f.group === 'A');
    gmA[0].status = 'Completed';
    gmA[0].winnerId = 't1'; // Alpha won
    gmA[0].scoreA = '180/3'; gmA[0].oversA = '20.0';
    gmA[0].scoreB = '140/8'; gmA[0].oversB = '20.0';

    gmA[1].status = 'Completed';
    gmA[1].winnerId = 't1'; // Alpha won
    gmA[1].scoreA = '175/5'; gmA[1].oversA = '20.0';
    gmA[1].scoreB = '150/9'; gmA[1].oversB = '20.0';

    gmA[2].status = 'Completed';
    gmA[2].winnerId = 't2'; // Beta won
    gmA[2].scoreA = '160/6'; gmA[2].oversA = '20.0';
    gmA[2].scoreB = '130/10'; gmA[2].oversB = '19.1';

    // Group B fixtures
    const gmB = gm.filter((f) => f.group === 'B');
    gmB[0].status = 'Completed';
    gmB[0].winnerId = 't4'; // Delta won
    gmB[0].scoreA = '190/4'; gmB[0].oversA = '20.0';
    gmB[0].scoreB = '150/8'; gmB[0].oversB = '20.0';

    gmB[1].status = 'Completed';
    gmB[1].winnerId = 't4'; // Delta won
    gmB[1].scoreA = '205/2'; gmB[1].oversA = '20.0';
    gmB[1].scoreB = '160/7'; gmB[1].oversB = '20.0';

    gmB[2].status = 'Completed';
    gmB[2].winnerId = 't5'; // Epsilon won
    gmB[2].scoreA = '145/8'; gmB[2].oversA = '20.0';
    gmB[2].scoreB = '140/9'; gmB[2].oversB = '20.0';

    // Trigger group stage advancement
    tournamentService.checkAndAdvanceGroupPlayoffs(groupsTourn);
    await tournamentService.saveTournament(groupsTourn);

    // Verify SF1 and SF2 are seeded:
    // SF1: 1st Group A (Alpha XI / t1) vs 2nd Group B (Epsilon XI / t5)
    // SF2: 1st Group B (Delta XI / t4) vs 2nd Group A (Beta XI / t2)
    const sf1 = groupsTourn.fixtures.find((f) => f.stage === 'SEMI_FINAL' && f.stageName.includes('1st Group A'));
    assert(sf1, 'SF1 fixture must exist');
    assert.strictEqual(sf1.teamA?.id, 't1', 'SF1 team A must be Alpha XI (t1)');
    assert.strictEqual(sf1.teamB?.id, 't5', 'SF1 team B must be Epsilon XI (t5)');

    const sf2 = groupsTourn.fixtures.find((f) => f.stage === 'SEMI_FINAL' && f.stageName.includes('1st Group B'));
    assert(sf2, 'SF2 fixture must exist');
    assert.strictEqual(sf2.teamA?.id, 't4', 'SF2 team A must be Delta XI (t4)');
    assert.strictEqual(sf2.teamB?.id, 't2', 'SF2 team B must be Beta XI (t2)');
  });

  // -------------------------------------------------------------------------
  // 6. FORMAT C: DIRECT KNOCKOUT WITH BYES & PROGRESSION
  // -------------------------------------------------------------------------
  console.log('\nSECTION 6: Format C — Direct Knockout with Byes & Bracket Progression');

  await runAsyncTest('Knockout with non-power-of-2 team count (5 teams in 8-bracket = 3 Byes)', async () => {
    const koTournId = `test_ko_${Date.now()}`;
    const koTournament = {
      id: koTournId,
      name: 'Karnataka Knockout Shield 2026',
      organizerId,
      status: 'published',
      rules: { oversPerInnings: 20 },
      registration: {
        capacity: 8,
        maxTeams: 8,
        teams: [
          { teamId: 'k1', teamName: 'Seed 1 Team', status: 'accepted' },
          { teamId: 'k2', teamName: 'Seed 2 Team', status: 'accepted' },
          { teamId: 'k3', teamName: 'Seed 3 Team', status: 'accepted' },
          { teamId: 'k4', teamName: 'Seed 4 Team', status: 'accepted' },
          { teamId: 'k5', teamName: 'Seed 5 Team', status: 'accepted' },
        ],
      },
      format: {
        type: 'KNOCKOUT',
        seeding: 'manual',
      },
      fixtures: [],
    };

    const fixtures = tournamentService.generateKnockoutFixtures(koTournament);
    // Bracket size for 5 teams is 8.
    // Round 1 (QF): 4 matches. Total bracket matches: 4 + 2 (SF) + 1 (Final) = 7 fixtures.
    assert.strictEqual(fixtures.length, 7, '8-bracket must have 7 fixtures');

    // Number of Byes for 5 teams in 8-bracket is 8 - 5 = 3 Byes.
    const byeMatches = fixtures.filter((f) => f.isBye);
    assert.strictEqual(byeMatches.length, 3, 'Must have exactly 3 bye fixtures');

    // Check that top 3 seeds received byes and were marked Completed
    byeMatches.forEach((f) => {
      assert.strictEqual(f.status, 'Completed', 'Bye fixture must be marked Completed');
      assert(f.winnerId, 'Bye fixture must have winner set');
    });

    // Check that bye winners automatically advanced to Round 2 (Semi-Finals)
    const sfFixtures = fixtures.filter((f) => f.round === 2);
    const sfParticipants = sfFixtures.flatMap((f) => [f.teamA?.id, f.teamB?.id]).filter(Boolean);
    assert(sfParticipants.includes('k1'), 'Seed 1 must advance to SF');
    assert(sfParticipants.includes('k2'), 'Seed 2 must advance to SF');
    assert(sfParticipants.includes('k3'), 'Seed 3 must advance to SF');

    koTournament.fixtures = fixtures;
    await tournamentService.saveTournament(koTournament);
  });

  await runAsyncTest('Complete remaining QF match and advance winner to Semi-Final', async () => {
    const koTourn = (await getTournaments()).find((t) => t.name === 'Karnataka Knockout Shield 2026');
    assert(koTourn, 'Knockout tournament must exist');

    // The only non-bye QF match is between Seed 4 and Seed 5
    const liveQF = koTourn.fixtures.find((f) => f.round === 1 && !f.isBye);
    assert(liveQF, 'Must find live QF match');
    assert.strictEqual(liveQF.teamA?.id, 'k4');
    assert.strictEqual(liveQF.teamB?.id, 'k5');

    // Simulate match completion: Seed 4 wins
    const simulatedMatch = {
      id: `match_${liveQF.id}`,
      winner: liveQF.teamA.name,
      matchResult: { winner: liveQF.teamA.name, resultText: 'Seed 4 Team won by 15 runs' },
      scoreA: '170/6',
      oversA: '20.0',
      scoreB: '155/9',
      oversB: '20.0',
    };

    await tournamentService.syncMatchResultToFixture(koTourn.id, liveQF.id, simulatedMatch);

    const reloaded = await tournamentService.getTournament(koTourn.id);
    const updatedQF = reloaded.fixtures.find((f) => f.id === liveQF.id);
    assert.strictEqual(updatedQF.status, 'Completed');
    assert.strictEqual(updatedQF.winnerId, 'k4');

    // Check that next fixture (SF2) received Seed 4
    const nextFix = reloaded.fixtures.find((f) => f.id === liveQF.nextFixtureId);
    assert(nextFix, 'Next fixture must exist');
    assert.strictEqual(nextFix[liveQF.nextFixtureSlot]?.id, 'k4', 'Seed 4 must advance to SF slot');
  });

  // -------------------------------------------------------------------------
  // 7. MATCH ENGINE INTEGRATION & IDEMPOTENT FINALIZATION
  // -------------------------------------------------------------------------
  console.log('\nSECTION 7: Match Engine Integration & Idempotent Result Processing');

  await runAsyncTest('getFixtureMatchData returns full payload without duplicate scoring tables', async () => {
    const tournament = await tournamentService.getTournament(testTournamentId);
    const fixture = tournament.fixtures[2];
    assert(fixture, 'Fixture 3 must exist');

    const matchPayload = await tournamentService.getFixtureMatchData(tournament, fixture);
    assert(matchPayload, 'Match payload must be generated');
    assert.strictEqual(matchPayload.tournamentId, tournament.id);
    assert.strictEqual(matchPayload.fixtureId, fixture.id);
    assert.strictEqual(matchPayload.format, 'T20');
    assert.strictEqual(matchPayload.oversPerInnings, 20);
    assert.strictEqual(matchPayload.creatorId, organizerId);
    assert(Array.isArray(matchPayload.scorers), 'Scorers array must exist');

    // Ensure fixture now persistently stores matchId
    const savedTourn = await tournamentService.getTournament(testTournamentId);
    const savedFix = savedTourn.fixtures.find((f) => f.id === fixture.id);
    assert.strictEqual(savedFix.matchId, matchPayload.id, 'Fixture must link to match ID');
  });

  await runAsyncTest('syncMatchResultToFixture is idempotent (repeated calls do not duplicate points)', async () => {
    const tournament = await tournamentService.getTournament(testTournamentId);
    const fixture = tournament.fixtures[2];

    const matchResult = {
      id: fixture.matchId,
      winner: fixture.teamA.name,
      matchResult: { winner: fixture.teamA.name, resultText: `${fixture.teamA.name} won by 6 wickets` },
      scoreA: '140/4',
      oversA: '17.2',
      scoreB: '138/9',
      oversB: '20.0',
    };

    // Call sync 1st time
    await tournamentService.syncMatchResultToFixture(tournament.id, fixture.id, matchResult);
    const standings1 = tournamentService.calculateStandings(await tournamentService.getTournament(tournament.id));
    const teamARow1 = standings1.find((s) => s.teamId === fixture.teamA.id);
    const points1 = teamARow1.points;
    const played1 = teamARow1.played;

    // Call sync 2nd time with same result (idempotency test)
    await tournamentService.syncMatchResultToFixture(tournament.id, fixture.id, matchResult);
    const standings2 = tournamentService.calculateStandings(await tournamentService.getTournament(tournament.id));
    const teamARow2 = standings2.find((s) => s.teamId === fixture.teamA.id);

    assert.strictEqual(teamARow2.points, points1, 'Points must remain identical across repeated sync calls');
    assert.strictEqual(teamARow2.played, played1, 'Matches played must remain identical across repeated sync calls');
  });

  console.log('\n======================================================================');
  console.log(`🎉 ALL TESTS PASSED! (${passedTests}/${totalTests} tests succeeded)`);
  console.log('======================================================================\n');
}

main().catch((err) => {
  console.error('\n💥 FATAL TEST ERROR:', err);
  process.exit(1);
});
