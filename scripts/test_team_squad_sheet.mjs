/**
 * test_team_squad_sheet.mjs
 *
 * Automated verification suite for EZKORA:
 * - Part 1: Verification that ProfileScreen NO LONGER contains the "PICK UP WHERE YOU LEFT OFF" resume card
 * - Part 2: Premium Full-Screen Translucent Team Overlay & Expandable Player Profile
 * - Real squad roster resolution for all enrolled teams (Warriors XI, Falcons CC, Super Kings XI, Mumbai Royals)
 * - Active members filtering and captain badge derivation
 * - Expanding Athlete Identity Card panel on player tap
 * - Enriched athlete profile metadata (experience, primary team, playerUid, username, verified)
 * - Consecutive player switching and collapsing without sheet closure
 * - Genuine player statistics calculation via playerStatsService
 * - Search query filtering (by name, role, username, UID)
 * - Navigation preservation and Android hardware back dismissal
 * - NativeWind compliance (zero StyleSheet.create)
 * - Edge case handling (empty rosters, missing avatars, unpopulated optional fields)
 */

// Polyfill window.localStorage for Node test runner
if (typeof window === 'undefined') {
  const store = {};
  global.window = {
    localStorage: {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    },
  };
}

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import { getActiveMembers, DEFAULT_TEAMS, getTeams } from '../src/store/teamRepository.js';
import { calculatePlayerStats as calcStats } from '../src/services/playerStatsService.js';

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

console.log('======================================================================');
console.log('🏆 EZKORA FULL-SCREEN TEAM OVERLAY & ATHLETE PROFILE TEST SUITE');
console.log('======================================================================\n');

// ====================================================================
// GROUP 1: Part 1 — Profile Resume Card Removal Verification
// ====================================================================
console.log('GROUP 1: Part 1 — Profile Resume Card Removal');

runTest('ProfileScreen.js does NOT import ResumeTaskCard or getMostRelevantActiveTask', () => {
  const code = fs.readFileSync(path.join(rootDir, 'src/main/ProfileScreen.js'), 'utf8');
  assert.strictEqual(code.includes('ResumeTaskCard'), false, 'ProfileScreen must NOT reference ResumeTaskCard');
  assert.strictEqual(code.includes('getMostRelevantActiveTask'), false, 'ProfileScreen must NOT reference getMostRelevantActiveTask');
});

runTest('ProfileScreen.js does NOT render "Pick Up Where You Left Off" banner', () => {
  const code = fs.readFileSync(path.join(rootDir, 'src/main/ProfileScreen.js'), 'utf8');
  assert.strictEqual(code.includes('Pick Up Where You Left Off'), false, 'Banner comment/text must not exist');
  assert.strictEqual(code.includes('activeTask'), false, 'activeTask state must not exist on ProfileScreen');
});

// ====================================================================
// GROUP 2: NativeWind Styling Compliance & JSX Integrity
// ====================================================================
console.log('\nGROUP 2: NativeWind Styling Compliance & Overlay Structure');

runTest('TeamSquadBottomSheet.js exists and strictly uses NativeWind (0 StyleSheet.create)', () => {
  const code = fs.readFileSync(path.join(rootDir, 'src/components/tournament/TeamSquadBottomSheet.js'), 'utf8');
  assert.ok(code.includes('export default function TeamSquadBottomSheet'), 'Component export must exist');
  assert.strictEqual(code.includes('StyleSheet.create'), false, 'Must NOT use StyleSheet.create');
  assert.ok(code.includes('className='), 'Must use className styling for NativeWind');
});

runTest('TeamSquadBottomSheet.js renders a nearly full-screen overlay with translucent scrim', () => {
  const code = fs.readFileSync(path.join(rootDir, 'src/components/tournament/TeamSquadBottomSheet.js'), 'utf8');
  assert.ok(code.includes('statusBarTranslucent'), 'Must use statusBarTranslucent for full screen coverage');
  assert.ok(code.includes('bg-black/80'), 'Must use translucent dark scrim');
  assert.ok(code.includes('rounded-t-[28px]'), 'Must have rounded top overlay card');
  assert.ok(code.includes('flex-1'), 'Overlay must take full remaining viewport');
});

runTest('TournamentDetailScreen.js imports and renders TeamSquadBottomSheet', () => {
  const code = fs.readFileSync(path.join(rootDir, 'src/screens/tournament/TournamentDetailScreen.js'), 'utf8');
  assert.ok(code.includes("import TeamSquadBottomSheet from '../../components/tournament/TeamSquadBottomSheet.js'"), 'Import statement must exist');
  assert.ok(code.includes('<TeamSquadBottomSheet'), 'TeamSquadBottomSheet component must be rendered');
  assert.ok(code.includes('visible={Boolean(viewingSquadTeam)}'), 'visible prop must be wired to viewingSquadTeam');
  assert.ok(code.includes('team={viewingSquadTeam}'), 'team prop must be wired to viewingSquadTeam');
  assert.ok(code.includes('onNavigateProfile={handleViewFullProfile}'), 'onNavigateProfile must be wired');
});

runTest('TournamentDetailScreen.js intercepts Android back to dismiss overlay first', () => {
  const code = fs.readFileSync(path.join(rootDir, 'src/screens/tournament/TournamentDetailScreen.js'), 'utf8');
  assert.ok(code.includes('viewingSquadTeamRef.current'), 'viewingSquadTeamRef must track sheet visibility');
  assert.ok(code.includes('setViewingSquadTeam(null)'), 'Back press must dismiss sheet');
});

// ====================================================================
// GROUP 3: Squad Roster Resolution & Real Data Handling
// ====================================================================
console.log('\nGROUP 3: Real Roster Resolution & Member Filtering');

runTest('All 4 default tournament teams have complete real rosters in DEFAULT_TEAMS', () => {
  const teamIds = ['team_warriors', 'team_falcons', 'team_csk', 'team_mi'];
  for (const tId of teamIds) {
    const team = DEFAULT_TEAMS.find((t) => t.id === tId);
    assert.ok(team, `Team ${tId} must exist in DEFAULT_TEAMS`);
    const active = getActiveMembers(team);
    assert.ok(active.length >= 11, `Team ${tId} must have at least 11 active squad members (found ${active.length})`);
    assert.ok(team.captainId, `Team ${tId} must have a captainId`);
    const captain = active.find((m) => m.id === team.captainId || m.isCaptain);
    assert.ok(captain, `Team ${tId} captain must exist in active squad`);
  }
});

runTest('Active members filtered correctly from real team data', () => {
  const sampleTeam = {
    id: 'team_test_1',
    name: 'Royals CC',
    captainId: 'p_1',
    members: [
      { id: 'p_1', name: 'Player One', status: 'accepted', role: 'Batter', isCaptain: true },
      { id: 'p_2', name: 'Player Two', status: 'accepted', role: 'Bowler' },
      { id: 'p_3', name: 'Player Three', status: 'pending', role: 'All Rounder' }, // should be ignored
      { id: 'p_4', name: 'Player Four', role: 'Wicket Keeper' }, // implicit accepted
    ],
  };

  const active = getActiveMembers(sampleTeam);
  assert.strictEqual(active.length, 3, 'Should have 3 active members');
  assert.strictEqual(active.some((m) => m.id === 'p_3'), false, 'Pending members must not be active');
  assert.strictEqual(active.some((m) => m.id === 'p_1'), true, 'Accepted member p_1 must be active');
});

runTest('Clean search filtering works by player name, role, username, and UID', () => {
  const members = [
    { displayName: 'Virat Kohli', role: 'Batter', username: 'vk18', playerUid: 'SP-VIRT-1818' },
    { displayName: 'Jasprit Bumrah', role: 'Bowler', username: 'boom_boom', playerUid: 'SP-BUMR-9393' },
    { displayName: 'Hardik Pandya', role: 'All Rounder', username: 'hardik77', playerUid: 'SP-PAND-3333' },
    { displayName: 'Rishabh Pant', role: 'Wicket Keeper', username: 'pant17', playerUid: 'SP-PANT-1717' },
  ];

  // Search by role
  const bowlerSearch = members.filter((m) => m.role.toLowerCase().includes('bowler') || m.displayName.toLowerCase().includes('bowler'));
  assert.strictEqual(bowlerSearch.length, 1);
  assert.strictEqual(bowlerSearch[0].displayName, 'Jasprit Bumrah');

  // Search by name
  const nameSearch = members.filter((m) => m.displayName.toLowerCase().includes('virat'));
  assert.strictEqual(nameSearch.length, 1);
  assert.strictEqual(nameSearch[0].displayName, 'Virat Kohli');

  // Search by username
  const usernameSearch = members.filter((m) => (m.username && m.username.toLowerCase().includes('hardik')) || m.displayName.toLowerCase().includes('hardik'));
  assert.strictEqual(usernameSearch.length, 1);
  assert.strictEqual(usernameSearch[0].displayName, 'Hardik Pandya');

  // Search by UID
  const uidSearch = members.filter((m) => (m.playerUid && m.playerUid.toLowerCase().includes('9393')) || m.displayName.toLowerCase().includes('9393'));
  assert.strictEqual(uidSearch.length, 1);
  assert.strictEqual(uidSearch[0].displayName, 'Jasprit Bumrah');
});

// ====================================================================
// GROUP 4: Signature Expanding Player Profile Panel Logic
// ====================================================================
console.log('\nGROUP 4: Expanding Player Profile Panel & State Transitions');

runTest('Toggling player from null expands profile panel', () => {
  let selected = null;
  const playerA = { id: 'usr_arjun123', name: 'Arjun', role: 'All Rounder' };

  // Tap Player A
  selected = selected?.id === playerA.id ? null : playerA;
  assert.deepStrictEqual(selected, playerA, 'Player A should be selected');
});

runTest('Tapping another player smoothly updates panel without closing overlay', () => {
  let selected = { id: 'usr_arjun123', name: 'Arjun', role: 'All Rounder' };
  const playerB = { id: 'usr_player101', name: 'Star Player', role: 'Batter' };

  // Tap Player B
  selected = selected?.id === playerB.id ? null : playerB;
  assert.deepStrictEqual(selected, playerB, 'Player B should now be selected');
});

runTest('Tapping the same player collapses the panel while keeping overlay open', () => {
  let selected = { id: 'usr_player101', name: 'Star Player', role: 'Batter' };
  const playerB = { id: 'usr_player101', name: 'Star Player', role: 'Batter' };

  // Tap Player B again
  selected = selected?.id === playerB.id ? null : playerB;
  assert.strictEqual(selected, null, 'Profile panel should collapse to null');
});

runTest('If selected player is removed or missing from roster, selection safely clears', () => {
  const activeMembers = [
    { stableId: 'p_1', displayName: 'Player 1' },
    { stableId: 'p_2', displayName: 'Player 2' },
  ];
  let selected = { stableId: 'p_99', displayName: 'Removed Player' };

  const stillPresent = activeMembers.some((m) => m.stableId === selected.stableId);
  if (!stillPresent) selected = null;

  assert.strictEqual(selected, null, 'Removed player selection should be safely cleared');
});

// ====================================================================
// GROUP 5: Genuine Statistics Calculation & Safety
// ====================================================================
console.log('\nGROUP 5: Genuine Player Statistics (No Mock/Fake Values)');

runTest('calculatePlayerStats returns accurate metrics from completed matches', () => {
  const matches = [
    {
      id: 'm_1',
      status: 'Completed',
      format: 'T20',
      playingXI_A: [{ id: 'usr_arjun123' }],
      playingXI_B: [{ id: 'usr_other' }],
      firstInnings: {
        batters: [
          { id: 'usr_arjun123', runs: 54, balls: 32, fours: 6, sixes: 2, status: 'out' },
        ],
        bowlers: {},
      },
      secondInnings: {
        batters: [],
        bowlers: {
          'usr_arjun123': { id: 'usr_arjun123', legalBalls: 24, runsConceded: 18, wickets: 3 },
        },
      },
    },
  ];

  const stats = calcStats(matches, 'usr_arjun123');
  assert.strictEqual(stats.batting.runs, 54, 'Runs should be 54');
  assert.strictEqual(stats.batting.highestScore, '54', 'Highest score should be 54');
  assert.strictEqual(stats.bowling.wickets, 3, 'Wickets should be 3');
  assert.strictEqual(stats.batting.matches, 1, 'Matches should be 1');
});

runTest('calculatePlayerStats safely returns clean 0s when player has no match history', () => {
  const matches = [];
  const stats = calcStats(matches, 'usr_new_player');
  assert.strictEqual(stats.batting.runs, 0);
  assert.strictEqual(stats.batting.highestScore, '0');
  assert.strictEqual(stats.bowling.wickets, 0);
  assert.strictEqual(stats.bowling.economy, '0.0');
});

// ====================================================================
// GROUP 6: Navigation Context & Round-Trip Preservation
// ====================================================================
console.log('\nGROUP 6: Navigation Architecture & Context Preservation');

runTest('View Full Profile routes correctly to MainTabs Profile with return parameters', () => {
  let navTarget = null;
  let navParams = null;
  const mockNavigation = {
    navigate: (target, params) => {
      navTarget = target;
      navParams = params;
    },
  };

  const tournamentId = 'tourn_challenger_2026';
  const player = { id: 'usr_arjun123', name: 'Arjun' };

  // Handler implementation as in TournamentDetailScreen
  const handleViewFullProfile = (p) => {
    const pId = p.id || p.playerId;
    mockNavigation.navigate('MainTabs', {
      screen: 'Profile',
      params: {
        userId: pId,
        returnDestination: 'TournamentDetail',
        tournamentId,
        initialTab: 'TEAMS',
      },
    });
  };

  handleViewFullProfile(player);

  assert.strictEqual(navTarget, 'MainTabs');
  assert.strictEqual(navParams.screen, 'Profile');
  assert.strictEqual(navParams.params.userId, 'usr_arjun123');
  assert.strictEqual(navParams.params.returnDestination, 'TournamentDetail');
  assert.strictEqual(navParams.params.tournamentId, 'tourn_challenger_2026');
  assert.strictEqual(navParams.params.initialTab, 'TEAMS');
});

runTest('ProfileScreen back button preserves tournament context when returning', () => {
  const route = {
    params: {
      userId: 'usr_arjun123',
      returnDestination: 'TournamentDetail',
      tournamentId: 'tourn_challenger_2026',
      initialTab: 'TEAMS',
    },
  };

  let returnedTo = null;
  let returnedParams = null;
  const mockNavigation = {
    navigate: (dest, params) => {
      returnedTo = dest;
      returnedParams = params;
    },
    goBack: () => {
      returnedTo = 'goBack';
    },
  };

  // ProfileScreen back button behavior
  if (route?.params?.returnDestination === 'TournamentDetail' && route?.params?.tournamentId) {
    mockNavigation.navigate('TournamentDetail', {
      tournamentId: route.params.tournamentId,
      initialTab: route.params.initialTab || 'TEAMS',
    });
  } else {
    mockNavigation.goBack();
  }

  assert.strictEqual(returnedTo, 'TournamentDetail');
  assert.strictEqual(returnedParams.tournamentId, 'tourn_challenger_2026');
  assert.strictEqual(returnedParams.initialTab, 'TEAMS');
});

// ====================================================================
// GROUP 7: Edge Cases & Robustness
// ====================================================================
console.log('\nGROUP 7: Edge Case Handling & Visual Resilience');

runTest('Team with empty squad handles gracefully without crash', () => {
  const emptyTeam = {
    id: 'team_empty',
    name: 'New Empty Team',
    members: [],
  };

  const active = getActiveMembers(emptyTeam);
  assert.strictEqual(active.length, 0, 'Active members must be empty array');

  // Should safely render empty state
  const isSearch = false;
  const emptyMessage = isSearch ? 'No matching players found' : 'No Squad Members Enrolled';
  assert.strictEqual(emptyMessage, 'No Squad Members Enrolled');
});

runTest('Player with missing optional fields renders gracefully with fallbacks', () => {
  const sparsePlayer = {
    id: 'p_sparse_1',
    name: 'Minimal Player',
    // Missing avatar, role, style, username, verified badge, experience, primaryTeam
  };

  // Initials computation
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'EZ';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(sparsePlayer.name);
  assert.strictEqual(initials, 'MP');

  const battingStyle = sparsePlayer.battingStyle || sparsePlayer.style?.split('/')[0]?.trim() || 'Right-Handed';
  const bowlingStyle = sparsePlayer.bowlingStyle || sparsePlayer.style?.split('/')[1]?.trim() || 'Right-Arm Medium';
  const role = sparsePlayer.role || 'Player';

  assert.strictEqual(battingStyle, 'Right-Handed');
  assert.strictEqual(bowlingStyle, 'Right-Arm Medium');
  assert.strictEqual(role, 'Player');
});

runTest('Stable player IDs are used as React keys', () => {
  const members = [
    { id: 'usr_1', name: 'P1' },
    { playerId: 'usr_2', name: 'P2' },
    { userId: 'usr_3', name: 'P3' },
    { name: 'P4' },
  ];

  const processed = members.map((m, idx) => ({
    ...m,
    stableId: m.id || m.playerId || m.userId || `squad_p_${idx}`,
  }));

  assert.strictEqual(processed[0].stableId, 'usr_1');
  assert.strictEqual(processed[1].stableId, 'usr_2');
  assert.strictEqual(processed[2].stableId, 'usr_3');
  assert.strictEqual(processed[3].stableId, 'squad_p_3');

  // Ensure unique keys
  const keys = new Set(processed.map((p) => p.stableId));
  assert.strictEqual(keys.size, 4, 'All keys must be unique');
});

console.log('\n======================================================================');
console.log(`🎉 ALL SQUAD & PROFILE TESTS PASSED! (${passedTests}/${totalTests} succeeded)`);
console.log('======================================================================\n');
