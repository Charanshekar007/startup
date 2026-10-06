/**
 * Acceptance Test Suite for Frontend-Only Flow:
 * Finalize Create Team Flow (Owner + Captain + Squad Member Identity)
 * Tests All 9 User Requirements & Acceptance Criteria
 */

import { playerService } from '../src/services/playerService.js';
import { teamService } from '../src/services/teamService.js';
import { MOCK_PLAYERS, CURRENT_MOCK_USER } from '../src/data/mockPlayers.js';

let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('RUNNING FINALIZE CREATE TEAM ACCEPTANCE TESTS');
  console.log('====================================================\n');

  // Reset stores
  teamService.resetStore();
  playerService.resetCurrentUser();

  // Set logged in user as Charan (Test scenario user)
  const loggedInUser = {
    id: 'usr_charan',
    playerId: 'usr_charan',
    playerUid: 'SP-CHRN-0077',
    name: 'Charan',
    username: '@charan',
    role: 'Captain / All-Rounder',
    style: 'RHB / Right-Arm Medium',
  };
  playerService.setCurrentUser(loggedInUser);

  // ---------------------------------------------------------------
  // TEST 1 — CREATE TEAM
  // Login as user. Create "Bhaiengers".
  // Verify current user is automatically added to the squad.
  // ---------------------------------------------------------------
  console.log('--- TEST 1: CREATE TEAM & AUTOMATIC SQUAD MEMBERSHIP ---');
  const currentUser = await playerService.getCurrentUser();
  assert(currentUser.playerId === 'usr_charan', 'Current user playerId is usr_charan');
  assert(currentUser.playerUid === 'SP-CHRN-0077', 'Current user playerUid is SP-CHRN-0077');
  assert(currentUser.name === 'Charan', 'Current user name is Charan');

  const bhaiengers = await teamService.createTeam({
    name: 'Bhaiengers',
    shortName: 'BHAI',
    location: 'Hyderabad Turf Club',
    sport: 'Cricket',
    teamType: 'Club',
  });

  assert(bhaiengers && bhaiengers.id, 'Team "Bhaiengers" created successfully with unique ID');
  assert(bhaiengers.name === 'Bhaiengers', 'Team name is Bhaiengers');
  assert(bhaiengers.members.length === 1, 'Initial squad contains 1 member');
  assert(bhaiengers.members[0].playerId === currentUser.playerId, 'Current user is automatically in the squad');
  assert(bhaiengers.members[0].playerUid === currentUser.playerUid, 'Squad member has correct Player UID (SP-CHRN-0077)');

  // ---------------------------------------------------------------
  // TEST 2 — OWNER
  // Verify owner = current user
  // ---------------------------------------------------------------
  console.log('\n--- TEST 2: OWNER IDENTITY ---');
  assert(bhaiengers.ownerId === currentUser.playerId, `ownerId (${bhaiengers.ownerId}) matches current user (${currentUser.playerId})`);

  // ---------------------------------------------------------------
  // TEST 3 — CAPTAIN
  // Verify captain = current user
  // There should be NO separate captain selection step.
  // ---------------------------------------------------------------
  console.log('\n--- TEST 3: CAPTAIN IDENTITY (NO SEPARATE SELECTION STEP) ---');
  assert(bhaiengers.captainId === currentUser.playerId, `captainId (${bhaiengers.captainId}) matches current user (${currentUser.playerId})`);
  assert(bhaiengers.members[0].isCaptain === true, 'Creator in squad is marked isCaptain === true');

  // ---------------------------------------------------------------
  // TEST 4 — SQUAD
  // Add mock players. Verify creator remains in the squad.
  // Example: 1. Charan — Captain, 2. Rohit Verma, 3. Arjun Mehta, 4. Karthik Raja
  // ---------------------------------------------------------------
  console.log('\n--- TEST 4: ADD PLAYERS & SQUAD INTEGRITY ---');
  // Player 2: Arjun Mehta (SP-9X2M-44KL)
  const arjun = await playerService.searchPlayersByUid('SP-9X2M-44KL');
  assert(arjun !== null, 'Found Arjun Mehta by UID SP-9X2M-44KL');
  const addArjun = await teamService.addPlayerToTeam(bhaiengers.id, arjun);
  assert(addArjun.success === true, 'Added Arjun Mehta to Bhaiengers');

  // Player 3: Rohit Verma (SP-3B9V-11NZ)
  const rohit = await playerService.searchPlayersByUid('SP-3B9V-11NZ');
  assert(rohit !== null, 'Found Rohit Verma by UID SP-3B9V-11NZ');
  const addRohit = await teamService.addPlayerToTeam(bhaiengers.id, rohit);
  assert(addRohit.success === true, 'Added Rohit Verma to Bhaiengers');

  // Player 4: Karthik Raja (SP-5T7P-88QS)
  const karthik = await playerService.searchPlayersByUid('SP-5T7P-88QS');
  assert(karthik !== null, 'Found Karthik Raja by UID SP-5T7P-88QS');
  const addKarthik = await teamService.addPlayerToTeam(bhaiengers.id, karthik);
  assert(addKarthik.success === true, 'Added Karthik Raja to Bhaiengers');

  const updatedTeamAfter4 = await teamService.getTeam(bhaiengers.id);
  assert(updatedTeamAfter4.members.length === 4, 'Bhaiengers now has 4 squad members');
  assert(updatedTeamAfter4.members[0].playerId === currentUser.playerId, '1. Charan remains in squad as Captain');
  assert(updatedTeamAfter4.members[0].isCaptain === true, 'Charan is Captain');
  assert(updatedTeamAfter4.members[1].name === 'Arjun Mehta', '2. Arjun Mehta in squad');
  assert(updatedTeamAfter4.members[2].name === 'Rohit Verma', '3. Rohit Verma in squad');
  assert(updatedTeamAfter4.members[3].name === 'Karthik Raja', '4. Karthik Raja in squad');

  // ---------------------------------------------------------------
  // TEST 5 — DUPLICATE
  // Try adding current user again.
  // The app must prevent a duplicate.
  // ---------------------------------------------------------------
  console.log('\n--- TEST 5: PREVENT DUPLICATE ADDITION ---');
  const addDuplicateCurrentUser = await teamService.addPlayerToTeam(bhaiengers.id, currentUser);
  assert(addDuplicateCurrentUser.success === false, 'Adding current user again is blocked');
  assert(addDuplicateCurrentUser.error === 'Player is already in this team.', 'Shows error: "Player is already in this team."');

  // Also try adding existing squad member again
  const addDuplicateArjun = await teamService.addPlayerToTeam(bhaiengers.id, arjun);
  assert(addDuplicateArjun.success === false, 'Adding existing squad member again is blocked');
  assert(addDuplicateArjun.error === 'Player is already in this team.', 'Shows error: "Player is already in this team."');

  // ---------------------------------------------------------------
  // TEST 6 — SQUAD SIZE
  // Verify the team can contain more than 11 players.
  // Example: 15, 20 members. No 11-player squad limit.
  // ---------------------------------------------------------------
  console.log('\n--- TEST 6: SQUAD SIZE UNLIMITED (11+ PLAYERS) ---');
  const allMockPlayers = await playerService.getPlayers();
  for (const p of allMockPlayers) {
    if (p.playerId !== currentUser.playerId && updatedTeamAfter4.members.length < 18) {
      const res = await teamService.addPlayerToTeam(bhaiengers.id, p);
      if (res.success) {
        updatedTeamAfter4.members = res.team.members;
      }
    }
  }

  const largeTeam = await teamService.getTeam(bhaiengers.id);
  assert(largeTeam.members.length >= 15, `Team squad successfully expanded beyond 11 (current: ${largeTeam.members.length} members)`);
  assert(largeTeam.members.length === 18, 'Team squad has 18 members, proving no 11-player squad cap');

  // ---------------------------------------------------------------
  // TEST 7 — PLAYING XI
  // Create a match using the team.
  // Verify the current user appears in the Playing XI selection.
  // Select exactly 11 players. Verify: 11 / 11.
  // ---------------------------------------------------------------
  console.log('\n--- TEST 7: MATCH PLAYING XI SELECTION (11 / 11) ---');
  const acceptedMembers = await teamService.getAcceptedSquad(bhaiengers.id);
  assert(acceptedMembers.length === 18, 'All 18 members are accepted squad members');
  
  // Verify current user appears in the team's player list for Playing XI
  const userInSquad = acceptedMembers.find((m) => m.playerId === currentUser.playerId);
  assert(userInSquad !== undefined, 'Current user (Charan) is in the squad and available for Playing XI');

  // Select 11 players for Team A (including current user)
  const selectedPlayingXI_A = [currentUser.playerId, ...acceptedMembers.filter(m => m.playerId !== currentUser.playerId).slice(0, 10).map(m => m.playerId)];
  assert(selectedPlayingXI_A.length === 11, 'Selected exactly 11 players for Playing XI');
  assert(selectedPlayingXI_A.includes(currentUser.playerId), 'Current user is selected in the Playing XI');

  // Opponent Team B (Falcons CC) Playing XI
  const teamB = await teamService.getTeam('team-002');
  const selectedPlayingXI_B = (teamB.members || []).slice(0, 11).map(m => m.id);
  assert(selectedPlayingXI_B.length === 11, 'Selected exactly 11 players for Team B');

  // Create match draft
  const matchDraft = await teamService.createMatchDraft({
    teamAId: bhaiengers.id,
    teamBId: teamB.id,
    teamAPlayingXI: selectedPlayingXI_A,
    teamBPlayingXI: selectedPlayingXI_B,
  });

  assert(matchDraft.teamAPlayingXI.length === 11, 'Match draft Team A Playing XI is 11 / 11');
  assert(matchDraft.teamBPlayingXI.length === 11, 'Match draft Team B Playing XI is 11 / 11');

  // ---------------------------------------------------------------
  // TEST 8 — PLAYING XI DOES NOT MODIFY SQUAD
  // After selecting 11 players for a match, verify the team's full squad
  // still contains all members (Team Squad = 18, Playing XI = 11).
  // ---------------------------------------------------------------
  console.log('\n--- TEST 8: PLAYING XI DOES NOT MODIFY PERMANENT SQUAD ---');
  const teamAfterMatchDraft = await teamService.getTeam(bhaiengers.id);
  assert(teamAfterMatchDraft.members.length === 18, 'Permanent squad count remains 18 (NOT reduced to 11)');
  const unselectedCount = teamAfterMatchDraft.members.filter(m => !selectedPlayingXI_A.includes(m.playerId)).length;
  assert(unselectedCount === 7, 'The other 7 players remain full team squad members');

  // ---------------------------------------------------------------
  // TEST 9 — PROFILE IDENTITY
  // Verify the current user's player identity remains the same across:
  // Profile, Team, Captain, Playing XI, Match. Use the same playerId/playerUid.
  // ---------------------------------------------------------------
  console.log('\n--- TEST 9: UNIFIED PLAYER IDENTITY ACROSS FLOWS ---');
  const teamMemberIdentity = teamAfterMatchDraft.members.find(m => m.playerId === currentUser.playerId);
  assert(teamMemberIdentity.playerId === currentUser.playerId, `Team member playerId matches currentUser (${currentUser.playerId})`);
  assert(teamMemberIdentity.playerUid === currentUser.playerUid, `Team member playerUid matches currentUser (${currentUser.playerUid})`);

  const playingXIPlayerId = selectedPlayingXI_A.find(id => id === currentUser.playerId);
  assert(playingXIPlayerId === currentUser.playerId, `Playing XI player ID matches currentUser (${currentUser.playerId})`);

  assert(teamAfterMatchDraft.ownerId === currentUser.playerId, `Team ownerId matches currentUser (${currentUser.playerId})`);
  assert(teamAfterMatchDraft.captainId === currentUser.playerId, `Team captainId matches currentUser (${currentUser.playerId})`);

  console.log('\n====================================================');
  if (failedTests === 0) {
    console.log('🎉 ALL 9 ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(`💥 ${failedTests} TESTS FAILED!`);
    process.exit(1);
  }
  console.log('====================================================\n');
}

runAcceptanceTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
