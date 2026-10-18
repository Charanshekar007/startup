/**
 * EZKORA WORKFLOW, PERSISTENCE AND MATCH RECOVERY VERIFICATION SUITE
 * Run with: node scripts/test_workflow_recovery.mjs
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

import { tournamentService } from '../src/services/tournamentService.js';
import { getMostRelevantActiveTask } from '../src/utils/taskRecovery.js';
import { getTournamentById, getTournaments, saveTournament } from '../src/store/tournamentRepository.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runWorkflowRecoveryTests() {
  console.log('======================================================================');
  console.log('🔄 EZKORA WORKFLOW, PERSISTENCE & MATCH RECOVERY TEST SUITE');
  console.log('======================================================================\n');

  const testUserId = `usr_test_${Date.now()}`;
  const otherUserId = `usr_other_${Date.now()}`;

  // -------------------------------------------------------------------
  // TEST GROUP 1: DRAFT PERSISTENCE, STABLE ID & LAST SAVED STEP
  // -------------------------------------------------------------------
  console.log('GROUP 1: Draft Persistence, Stable ID & Last Saved Step');

  // Step 1: Save draft initially
  const draftData = {
    name: 'Premier Cup 2026',
    shortName: 'PC26',
    sport: 'Cricket',
    category: 'Open',
    city: 'Bangalore',
    venue: 'Chinnaswamy Stadium',
    organizerId: testUserId,
    status: 'draft',
    currentStep: 3,
    lastSavedStep: 3,
  };

  const savedDraft = await tournamentService.saveDraft(draftData);
  assert(savedDraft && savedDraft.id, 'Draft created with persistent ID: ' + savedDraft?.id);
  assert(savedDraft.status === 'draft', 'Draft has draft status');
  assert(savedDraft.lastSavedStep === 3, 'Draft recorded lastSavedStep = 3');

  // Step 2: Re-save existing draft (should NOT create a duplicate tournament)
  const initialTournCount = (await getTournaments()).length;
  const updatedDraft = await tournamentService.saveDraft({
    ...savedDraft,
    currentStep: 5,
    lastSavedStep: 5,
    rules: { oversPerInnings: 20, matchFormat: 'T20' },
  });

  const countAfterUpdate = (await getTournaments()).length;
  assert(updatedDraft.id === savedDraft.id, 'Stable draft ID preserved across wizard steps');
  assert(countAfterUpdate === initialTournCount, 'Re-saving draft does NOT create duplicate records');
  assert(updatedDraft.lastSavedStep === 5, 'Updated draft preserved lastSavedStep = 5');
  assert(updatedDraft.rules?.oversPerInnings === 20, 'Draft field updates preserved');

  // Step 3: Delete draft authorization
  let unauthorizedDeleteFailed = false;
  try {
    await tournamentService.deleteTournament(savedDraft.id, otherUserId);
  } catch (e) {
    unauthorizedDeleteFailed = true;
  }
  assert(unauthorizedDeleteFailed, 'Non-organizer is prevented from deleting draft');

  const draftDeleteSuccess = await tournamentService.deleteTournament(savedDraft.id, testUserId);
  assert(draftDeleteSuccess === true, 'Organizer successfully deleted draft');
  const deletedFetch = await getTournamentById(savedDraft.id);
  assert(deletedFetch === null, 'Deleted draft no longer exists in repository');

  // -------------------------------------------------------------------
  // TEST GROUP 2: MY TOURNAMENTS VS DISCOVER TOURNAMENTS
  // -------------------------------------------------------------------
  console.log('\nGROUP 2: My Tournaments vs Discover Tournaments Segregation');

  // Create an organizer tournament
  const myTourn = await tournamentService.createTournament({
    name: 'My Organizer Cup',
    organizerId: testUserId,
    status: 'published',
    visibility: 'public',
  });

  // Create another organizer draft
  const myDraft = await tournamentService.saveDraft({
    name: 'My Incomplete Cup',
    organizerId: testUserId,
    status: 'draft',
    lastSavedStep: 2,
  });

  // Create a third-party public tournament
  const thirdPartyTourn = await tournamentService.createTournament({
    name: 'City Premier League',
    organizerId: otherUserId,
    status: 'published',
    visibility: 'public',
  });

  // Create a third-party draft (should never show in discover or my tournaments)
  const thirdPartyDraft = await tournamentService.saveDraft({
    name: 'Private Third Party Draft',
    organizerId: otherUserId,
    status: 'draft',
    visibility: 'private',
  });

  const myTournamentsList = await tournamentService.getUserTournaments(testUserId);
  const myIds = myTournamentsList.map((t) => t.id);

  assert(myIds.includes(myTourn.id), 'My Tournaments contains user-organized tournament');
  assert(myIds.includes(myDraft.id), 'My Tournaments contains user-saved draft');
  assert(!myIds.includes(thirdPartyDraft.id), 'My Tournaments does NOT leak other users drafts');
  assert(!myIds.includes(thirdPartyTourn.id), 'My Tournaments excludes uncaptained third-party tournaments');

  const discoverList = await tournamentService.getDiscoverTournaments(testUserId);
  const discoverIds = discoverList.map((t) => t.id);

  assert(discoverIds.includes(thirdPartyTourn.id), 'Discover Tournaments lists third-party public tournaments');
  assert(!discoverIds.includes(myTourn.id), 'Discover Tournaments does NOT include tournaments user already organizes');
  assert(!discoverIds.includes(thirdPartyDraft.id), 'Discover Tournaments never displays unpublished drafts');

  // -------------------------------------------------------------------
  // TEST GROUP 3: TOURNAMENT FIXTURE TO MATCH LINKING & CONTEXT
  // -------------------------------------------------------------------
  console.log('\nGROUP 3: Tournament Fixture to Match Linking & Context');

  const fixtureTournament = await tournamentService.createTournament({
    name: 'Championship Trophy',
    organizerId: testUserId,
    status: 'published',
    rules: { oversPerInnings: 20, matchFormat: 'T20' },
  });

  const dummyFixture = {
    id: `fix_test_101`,
    stage: 'KNOCKOUT',
    stageName: 'Quarter Final',
    teamA: { id: 'team_a', name: 'Alpha Hawks' },
    teamB: { id: 'team_b', name: 'Bravo Titans' },
    status: 'Scheduled',
    venue: 'Bangalore Stadium',
    date: '2026-10-25',
    time: '14:00',
  };

  fixtureTournament.fixtures = [dummyFixture];
  await saveTournament(fixtureTournament);

  const matchPayload = await tournamentService.getFixtureMatchData(fixtureTournament, dummyFixture);
  assert(matchPayload && matchPayload.id, 'Generated match payload has stable match ID: ' + matchPayload?.id);
  assert(matchPayload.tournamentId === fixtureTournament.id, 'Match payload retains tournamentId context');
  assert(matchPayload.fixtureId === dummyFixture.id, 'Match payload retains fixtureId context');
  assert(matchPayload.tournamentName === fixtureTournament.name, 'Match payload retains tournament name');
  assert(dummyFixture.matchId === matchPayload.id, 'Fixture successfully linked to match ID');

  // Complete the match and sync back to fixture
  const completedMatchData = {
    id: matchPayload.id,
    winner: 'Alpha Hawks',
    matchResult: {
      winner: 'Alpha Hawks',
      resultText: 'Alpha Hawks won by 24 runs',
    },
    scoreA: '168/4',
    oversA: '20.0 Ov',
    scoreB: '144/9',
    oversB: '20.0 Ov',
  };

  const syncedTournament = await tournamentService.syncMatchResultToFixture(
    fixtureTournament.id,
    dummyFixture.id,
    completedMatchData
  );

  const updatedFixture = syncedTournament.fixtures.find((f) => f.id === dummyFixture.id);
  assert(updatedFixture.status === 'Completed', 'Tournament fixture updated to Completed');
  assert(updatedFixture.winnerId === 'team_a', 'Winning team correctly identified on fixture');
  assert(updatedFixture.resultText === 'Alpha Hawks won by 24 runs', 'Result text recorded on fixture');
  assert(updatedFixture.scoreA === '168/4', 'Score A persisted on fixture');
  assert(updatedFixture.scoreB === '144/9', 'Score B persisted on fixture');

  // -------------------------------------------------------------------
  // TEST GROUP 4: DETERMINISTIC "PICK UP WHERE YOU LEFT OFF" PRIORITIZATION
  // -------------------------------------------------------------------
  console.log('\nGROUP 4: Deterministic Task Recovery Prioritization');

  // Scenario A: Unfinished Live Match present -> Must be #1 priority
  const mockLiveMatch = {
    id: 'match_live_test_01',
    creatorId: testUserId,
    teamA: 'Hawks',
    teamB: 'Titans',
    status: 'Live',
    scoreA: '45/1',
    oversA: '5.2 Ov',
    scoreB: '-/-',
    oversB: '0.0 Ov',
    tournamentName: 'Championship Trophy',
  };

  const activeTaskWithLiveMatch = await getMostRelevantActiveTask(testUserId, [mockLiveMatch]);
  assert(activeTaskWithLiveMatch !== null, 'Found active task when live match exists');
  assert(activeTaskWithLiveMatch.type === 'LIVE_MATCH', 'Prioritizes LIVE_MATCH over drafts');
  assert(activeTaskWithLiveMatch.statusBadge === 'LIVE MATCH', 'Displays LIVE MATCH badge');
  assert(activeTaskWithLiveMatch.targetScreen === 'LiveScoring', 'Routes directly to LiveScoring');

  // Scenario B: No live match, but saved tournament draft exists -> Must be #1 priority
  const activeTaskWithDraftOnly = await getMostRelevantActiveTask(testUserId, []);
  assert(activeTaskWithDraftOnly !== null, 'Found active task for saved draft');
  assert(activeTaskWithDraftOnly.type === 'TOURNAMENT_DRAFT', 'Prioritizes TOURNAMENT_DRAFT when no live match');
  assert(activeTaskWithDraftOnly.statusBadge === 'SAVED DRAFT', 'Displays SAVED DRAFT badge');
  assert(activeTaskWithDraftOnly.targetScreen === 'TournamentWizard', 'Routes to TournamentWizard');
  assert(activeTaskWithDraftOnly.targetParams?.initialStep === 2, 'Restores wizard at saved step 2');

  // -------------------------------------------------------------------
  // TEST GROUP 5: GLOBAL NAVIGATION ARCHITECTURE & BACK HANDLERS
  // -------------------------------------------------------------------
  console.log('\nGROUP 5: Global Navigation Architecture & Back Handlers');

  const fs = await import('fs');
  const tournDetailCode = fs.readFileSync('src/screens/tournament/TournamentDetailScreen.js', 'utf8');
  const myTournamentsCode = fs.readFileSync('src/screens/tournament/MyTournamentsScreen.js', 'utf8');
  const wizardCode = fs.readFileSync('src/screens/tournament/TournamentWizardScreen.js', 'utf8');
  const appJsCode = fs.readFileSync('App.js', 'utf8');
  const liveScoringCode = fs.readFileSync('src/main/LiveScoringScreen.js', 'utf8');
  const discoverCode = fs.readFileSync('src/main/DiscoverScreen.js', 'utf8');
  const profileCode = fs.readFileSync('src/main/ProfileScreen.js', 'utf8');
  const createCode = fs.readFileSync('src/main/CreateScreen.js', 'utf8');

  // 1. TournamentDetail Back contract
  assert(
    tournDetailCode.includes("handleBackToLogicalParent") &&
    tournDetailCode.includes("navigation.navigate('MyTournaments')") &&
    tournDetailCode.includes("navigation.navigate('MainTabs', { screen: 'Discover' })"),
    'TournamentDetail explicit back handler navigates directly to MyTournaments or logical parent'
  );
  assert(
    tournDetailCode.includes("BackHandler.addEventListener('hardwareBackPress'"),
    'TournamentDetail registers Android hardwareBackPress listener'
  );
  assert(
    !tournDetailCode.includes("onPress={() => navigation.goBack()}"),
    'TournamentDetail header does NOT call blind goBack()'
  );

  // 2. MyTournamentsScreen Back contract
  assert(
    myTournamentsCode.includes("handleBackToParent") &&
    myTournamentsCode.includes("navigation.navigate('MainTabs', { screen: 'Create' })"),
    'MyTournaments header back navigates directly to MainTabs -> Create'
  );
  assert(
    myTournamentsCode.includes("BackHandler.addEventListener('hardwareBackPress'"),
    'MyTournaments registers Android hardwareBackPress listener'
  );
  assert(
    !myTournamentsCode.includes("onPress={() => navigation.goBack()}"),
    'MyTournaments header does NOT call blind goBack()'
  );
  assert(
    myTournamentsCode.includes("returnDestination: 'MyTournaments'"),
    'MyTournaments passes returnDestination to child tournament dashboards'
  );

  // 3. TournamentWizard Back contract & Android hardware back
  assert(
    wizardCode.includes("BackHandler.addEventListener('hardwareBackPress'"),
    'TournamentWizard registers Android hardwareBackPress listener'
  );
  assert(
    wizardCode.includes("exitWizard") && wizardCode.includes("setCurrentStep((prev) => prev - 1)"),
    'TournamentWizard handles step backward and safe exit confirmation'
  );

  // 4. LiveScoring Back contract & Android hardware back
  assert(
    liveScoringCode.includes("handleExitScoring") &&
    liveScoringCode.includes("BackHandler.addEventListener('hardwareBackPress'"),
    'LiveScoring registers Android hardwareBackPress listener'
  );
  assert(
    liveScoringCode.includes("setCurrentScreen('MAIN')"),
    'LiveScoring hardware back gracefully returns from sub-screens to MAIN'
  );
  assert(
    liveScoringCode.includes("initialTab: 'Fixtures'") &&
    liveScoringCode.includes("navigation.navigate('TournamentDetail'"),
    'LiveScoring Match Result navigates back to TournamentDetail with initialTab: Fixtures'
  );
  assert(
    liveScoringCode.includes("navigation.navigate('MainTabs', { screen: 'Matches' })"),
    'LiveScoring preserves standalone match return to MainTabs -> Matches'
  );

  // 5. App.js Stack.Screen config & Deduplication
  assert(
    appJsCode.includes('getId={({ params }) => params?.tournamentId}'),
    'App.js registers getId on TournamentDetail to prevent duplicate screens in stack'
  );
  assert(
    appJsCode.includes('getId={({ params }) => params?.existingDraft?.id'),
    'App.js registers getId on TournamentWizard for draft deduplication'
  );

  // 6. Discover & Profile entry points
  assert(
    discoverCode.includes("returnDestination: 'Discover'"),
    'DiscoverScreen passes returnDestination Discover to TournamentDetail'
  );
  assert(
    !discoverCode.includes("tourn_kct_2026"),
    'DiscoverScreen does not reference nonexistent hardcoded tournament IDs'
  );
  assert(
    profileCode.includes("returnDestination: 'Profile'"),
    'ProfileScreen passes returnDestination Profile when opening MyTournaments'
  );
  assert(
    createCode.includes("returnDestination: 'Create'"),
    'CreateScreen passes returnDestination Create when opening MyTournaments'
  );

  // -------------------------------------------------------------------
  // TEST GROUP 6: NATIVEWIND STYLING COMPLIANCE AUDIT
  // -------------------------------------------------------------------
  console.log('\nGROUP 6: NativeWind Styling Compliance Audit');
  const filesToAudit = [
    { name: 'TournamentDetailScreen.js', code: tournDetailCode },
    { name: 'MyTournamentsScreen.js', code: myTournamentsCode },
    { name: 'TournamentWizardScreen.js', code: wizardCode },
    { name: 'LiveScoringScreen.js', code: liveScoringCode },
    { name: 'CreateScreen.js', code: createCode },
  ];

  for (const f of filesToAudit) {
    assert(
      !f.code.includes('StyleSheet.create('),
      `Zero StyleSheet.create() used in ${f.name} (NativeWind strictly preserved)`
    );
  }

  // Clean up test tournament
  await tournamentService.deleteTournament(myTourn.id, testUserId);
  await tournamentService.deleteTournament(myDraft.id, testUserId);
  await tournamentService.deleteTournament(thirdPartyTourn.id, otherUserId);
  await tournamentService.deleteTournament(thirdPartyDraft.id, otherUserId);
  await tournamentService.deleteTournament(fixtureTournament.id, testUserId);

  console.log('\n======================================================================');
  if (failed === 0) {
    console.log(`🎉 ALL WORKFLOW RECOVERY TESTS PASSED! (${passed}/${passed} succeeded)`);
  } else {
    console.error(`💥 SOME TESTS FAILED! (${passed} passed, ${failed} failed)`);
  }
  console.log('======================================================================\n');

  return failed === 0;
}

runWorkflowRecoveryTests().then((ok) => {
  if (!ok) process.exit(1);
});
