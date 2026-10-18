/**
 * tournamentService.js
 * 
 * Core domain service for EZKORA Tournaments:
 * - Format engines: League, Groups + Playoffs, Direct Knockout.
 * - Idempotent fixture generation with automatic byes.
 * - Authoritative Net Run Rate (NRR) and standings calculation.
 * - Knockout bracket tree progression.
 * - Organizer invitations and team applications management.
 * - Integration with MatchContext and LiveScoring match engine.
 */

import {
  getTournaments,
  getTournamentById,
  saveTournament,
  deleteTournament,
} from '../store/tournamentRepository.js';
import { getTeams, getTeamById } from '../store/teamRepository.js';

/**
 * Convert cricket overs string/number (e.g., "19.3" or 19.3) to exact decimal overs.
 * In cricket: 19.3 overs means 19 completed overs + 3 balls = 19 + 3/6 = 19.5 overs.
 */
export function cricketOversToDecimal(overs) {
  if (overs === null || overs === undefined) return 0;
  const str = String(overs).trim().replace(/[^\d.]/g, '');
  if (!str) return 0;
  const parts = str.split('.');
  const wholeOvers = parseInt(parts[0], 10) || 0;
  const balls = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
  return wholeOvers + Math.min(balls, 6) / 6;
}

/**
 * Format decimal overs back to cricket overs string (e.g. 19.5 -> "19.3")
 */
export function decimalToCricketOvers(decimal) {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '0.0';
  const wholeOvers = Math.floor(decimal);
  const remainingBalls = Math.round((decimal - wholeOvers) * 6);
  if (remainingBalls >= 6) return `${wholeOvers + 1}.0`;
  return `${wholeOvers}.${remainingBalls}`;
}

export const tournamentService = {
  /**
   * Fetch all tournaments
   */
  async getAllTournaments() {
    return await getTournaments();
  },

  /**
   * Fetch single tournament by ID
   */
  async getTournament(id) {
    return await getTournamentById(id);
  },

  /**
   * Create or update a tournament
   */
  async saveTournament(data) {
    return await saveTournament(data);
  },

  /**
   * Explicitly create a tournament
   */
  async createTournament(data) {
    return await saveTournament({
      ...data,
      status: data.status || 'published',
    });
  },

  /**
   * Save tournament as draft with complete state
   */
  async saveDraft(data) {
    return await saveTournament({
      ...data,
      status: 'draft',
      lastSavedStep: data.lastSavedStep || data.currentStep || 1,
    });
  },

  /**
   * Delete a tournament draft or tournament (organizer only)
   */
  async deleteTournament(tournamentId, userId) {
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) return false;
    if (userId && tournament.organizerId && tournament.organizerId !== userId) {
      throw new Error('PERMISSION_DENIED: Only the tournament organizer can delete this tournament.');
    }
    return await deleteTournament(tournamentId);
  },

  /**
   * Get all tournaments organized by or involving the specified user
   */
  async getUserTournaments(userId) {
    if (!userId) return [];
    const all = await getTournaments();
    return all.filter((t) => {
      if (t.organizerId === userId) return true;
      const registered = t.registration?.teams || [];
      return registered.some((rt) => rt.captainId === userId || rt.ownerId === userId);
    });
  },

  /**
   * Get public or accessible tournaments for discovery (excluding tournaments organized by current user)
   */
  async getDiscoverTournaments(userId) {
    const all = await getTournaments();
    return all.filter((t) => {
      // Drafts are never part of public discovery
      if (t.status === 'draft') return false;

      // Exclude tournaments organized by current user (those belong in My Tournaments)
      if (userId && t.organizerId === userId) return false;

      // Include all public tournaments
      if (t.visibility === 'public') return true;

      // For private tournaments, only include if user's team is invited or registered
      if (userId) {
        const registered = t.registration?.teams || [];
        return registered.some((rt) => rt.captainId === userId || rt.ownerId === userId);
      }

      return false;
    });
  },

  // =========================================================================
  // 1. REGISTRATION, INVITATION & APPLICATION MANAGEMENT
  // =========================================================================

  /**
   * Organizer invites a team to a tournament
   */
  async inviteTeam(tournamentId, teamOrId, organizerUserId) {
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found.');

    if (tournament.organizerId !== organizerUserId) {
      throw new Error('PERMISSION_DENIED: Only the tournament organizer can invite teams.');
    }

    const teamId = typeof teamOrId === 'string' ? teamOrId : teamOrId?.id;
    let team = typeof teamOrId === 'object' && teamOrId?.name ? teamOrId : null;
    if (!team) {
      team = await getTeamById(teamId);
    }
    if (!team) throw new Error('Team not found.');

    const teamsList = tournament.registration?.teams || [];
    const existing = teamsList.find((t) => t.teamId === teamId);

    if (existing) {
      if (existing.status === 'accepted') throw new Error('Team is already in the tournament.');
      if (existing.status === 'pending') throw new Error('An invitation or application is already pending for this team.');
    }

    const maxTeams = tournament.registration?.maxTeams || 16;
    const acceptedCount = teamsList.filter((t) => t.status === 'accepted').length;
    if (acceptedCount >= maxTeams) {
      throw new Error(`Tournament capacity reached (${maxTeams} teams).`);
    }

    const newEntry = {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
      logo: team.logo,
      location: team.location || 'Local Ground',
      status: 'pending',
      type: 'invitation',
      invitedBy: organizerUserId,
      registeredAt: new Date().toISOString(),
    };

    const updatedTeams = existing
      ? teamsList.map((t) => (t.teamId === teamId ? newEntry : t))
      : [...teamsList, newEntry];

    tournament.registration.teams = updatedTeams;
    return await saveTournament(tournament);
  },

  /**
   * Team captain or owner applies to join a public tournament
   */
  async applyToTournament(tournamentId, teamOrId, userId) {
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found.');

    if (tournament.visibility === 'private' && tournament.registration?.mode === 'invite_only') {
      throw new Error('This tournament is invite-only.');
    }

    // Verify registration deadline
    if (tournament.registrationDeadline) {
      const deadline = new Date(tournament.registrationDeadline).getTime();
      if (!isNaN(deadline) && Date.now() > deadline) {
        throw new Error('Registration deadline has passed.');
      }
    }

    const teamId = typeof teamOrId === 'string' ? teamOrId : teamOrId?.id;
    let team = typeof teamOrId === 'object' && teamOrId?.name ? teamOrId : null;
    if (!team) {
      team = await getTeamById(teamId);
    }
    if (!team) throw new Error('Team not found.');

    // Check user is captain or owner of team
    const isAuthorized =
      !userId ||
      team.captainId === userId ||
      team.ownerId === userId ||
      (team.members || []).length === 0 ||
      (team.members || []).some((m) => (m.userId === userId || m.playerId === userId) && m.isCaptain);

    if (!isAuthorized) {
      throw new Error('PERMISSION_DENIED: Only the team captain or owner can register the team for a tournament.');
    }

    const teamsList = tournament.registration?.teams || [];
    const existing = teamsList.find((t) => t.teamId === teamId);

    if (existing) {
      if (existing.status === 'accepted') throw new Error('Team is already participating in this tournament.');
      if (existing.status === 'pending') throw new Error('Application is already pending approval.');
    }

    const maxTeams = tournament.registration?.maxTeams || 16;
    const acceptedCount = teamsList.filter((t) => t.status === 'accepted').length;
    const isFull = acceptedCount >= maxTeams;

    const newEntry = {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
      logo: team.logo,
      location: team.location || 'Local Ground',
      status: isFull ? 'waitlisted' : 'pending',
      type: 'application',
      invitedBy: null,
      registeredAt: new Date().toISOString(),
    };

    const updatedTeams = existing
      ? teamsList.map((t) => (t.teamId === teamId ? newEntry : t))
      : [...teamsList, newEntry];

    tournament.registration.teams = updatedTeams;
    return await saveTournament(tournament);
  },

  /**
   * Organizer approves, rejects or waitlists a team application
   */
  async decideApplication(tournamentId, teamId, decision, organizerUserId) {
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found.');

    if (tournament.organizerId !== organizerUserId) {
      throw new Error('PERMISSION_DENIED: Only the tournament organizer can review applications.');
    }

    const teamsList = tournament.registration?.teams || [];
    const teamEntry = teamsList.find((t) => t.teamId === teamId);
    if (!teamEntry) throw new Error('Team application not found.');

    let normalized = decision;
    if (decision === 'accept' || decision === 'accepted') normalized = 'accepted';
    else if (decision === 'reject' || decision === 'rejected') normalized = 'rejected';
    else if (decision === 'waitlist' || decision === 'waitlisted') normalized = 'waitlisted';

    if (normalized === 'accepted') {
      const maxTeams = tournament.registration?.maxTeams || 16;
      const acceptedCount = teamsList.filter((t) => t.status === 'accepted').length;
      if (acceptedCount >= maxTeams) {
        throw new Error(`Cannot accept team. Tournament has reached max capacity (${maxTeams} teams).`);
      }
    }

    teamEntry.status = normalized;
    teamEntry.decidedAt = new Date().toISOString();

    return await saveTournament(tournament);
  },

  /**
   * Team captain responds to an invitation (accept or decline)
   */
  async respondToInvitation(tournamentId, teamId, decision, userId) {
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found.');

    const teamsList = tournament.registration?.teams || [];
    const teamEntry = teamsList.find((t) => t.teamId === teamId);
    if (!teamEntry) throw new Error('Invitation not found.');

    const team = await getTeamById(teamId);
    if (team && userId) {
      const isAuthorized =
        team.captainId === userId ||
        team.ownerId === userId ||
        (team.members || []).some((m) => (m.userId === userId || m.playerId === userId) && m.isCaptain);

      if (!isAuthorized) {
        throw new Error('PERMISSION_DENIED: Only the team captain or owner can respond to invitations.');
      }
    }

    if (decision === 'accepted' || decision === 'accept') {
      const maxTeams = tournament.registration?.maxTeams || 16;
      const acceptedCount = teamsList.filter((t) => t.status === 'accepted').length;
      if (acceptedCount >= maxTeams) {
        throw new Error(`Tournament is now full (${maxTeams} teams).`);
      }
      teamEntry.status = 'accepted';
    } else {
      teamEntry.status = 'declined';
    }

    teamEntry.decidedAt = new Date().toISOString();
    return await saveTournament(tournament);
  },

  // =========================================================================
  // 2. FIXTURE GENERATION ENGINES (LEAGUE, GROUPS, KNOCKOUT)
  // =========================================================================

  /**
   * Format A: League (Round Robin) Fixture Generator
   * Uses Berger Round Robin algorithm to generate balanced schedule.
   */
  generateLeagueFixtures(tournament, options = {}) {
    const acceptedTeams = (tournament.registration?.teams || [])
      .filter((t) => t.status === 'accepted');

    if (acceptedTeams.length < 2) {
      throw new Error('At least 2 accepted teams are required to generate league fixtures.');
    }

    const teams = [...acceptedTeams];
    // If odd number of teams, add a dummy team for byes
    const isOdd = teams.length % 2 !== 0;
    if (isOdd) {
      teams.push({ id: '__BYE__', name: 'BYE', isDummy: true });
    }

    const totalRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;
    const fixtures = [];
    let matchCounter = 1;

    const venue = tournament.venue || 'Main Cricket Ground';
    const startDate = new Date(tournament.startDate || Date.now());

    // Round robin circle rotation
    const rotation = [...teams];

    for (let r = 0; r < totalRounds; r++) {
      const roundDate = new Date(startDate);
      roundDate.setDate(startDate.getDate() + r * 2);
      const dateStr = roundDate.toISOString().split('T')[0];

      for (let m = 0; m < matchesPerRound; m++) {
        const team1 = rotation[m];
        const team2 = rotation[rotation.length - 1 - m];

        // Skip byes
        if (team1.isDummy || team2.isDummy) continue;

        const timeSlot = m % 2 === 0 ? '09:30 AM' : '02:30 PM';
        const fixtureId = `fix_${tournament.id}_r${r + 1}_m${matchCounter}`;

        fixtures.push({
          id: fixtureId,
          tournamentId: tournament.id,
          stage: 'LEAGUE',
          stageName: `Round ${r + 1}`,
          group: null,
          round: r + 1,
          matchNumber: matchCounter++,
          teamA: { id: team1.teamId || team1.id, name: team1.teamName || team1.name, shortName: team1.shortName || 'T1', logo: team1.logo },
          teamB: { id: team2.teamId || team2.id, name: team2.teamName || team2.name, shortName: team2.shortName || 'T2', logo: team2.logo },
          date: dateStr,
          time: timeSlot,
          venue: venue,
          matchId: `match_${fixtureId}`,
          status: 'Scheduled',
          winnerId: null,
          resultText: null,
        });
      }

      // Rotate circle: keep index 0 fixed, rotate others clockwise
      const fixed = rotation[0];
      const rest = rotation.slice(1);
      const last = rest.pop();
      rotation.splice(0, rotation.length, fixed, last, ...rest);
    }

    // Double round robin if requested
    if (tournament.format?.roundRobinType === 'double') {
      const returnFixtures = fixtures.map((f, idx) => {
        const nextRound = f.round + totalRounds;
        const retDate = new Date(startDate);
        retDate.setDate(startDate.getDate() + (nextRound - 1) * 2);
        const fixId = `fix_${tournament.id}_r${nextRound}_m${matchCounter}`;
        return {
          ...f,
          id: fixId,
          stageName: `Round ${nextRound} (Reverse)`,
          round: nextRound,
          matchNumber: matchCounter++,
          teamA: f.teamB,
          teamB: f.teamA,
          date: retDate.toISOString().split('T')[0],
          matchId: `match_${fixId}`,
        };
      });
      fixtures.push(...returnFixtures);
    }

    return fixtures;
  },

  /**
   * Format B: Groups + Playoffs Fixture Generator
   * Groups teams into A, B, etc., generates round robin per group,
   * then generates Semi-Final & Final playoff slots.
   */
  generateGroupsFixtures(tournament, options = {}) {
    const acceptedTeams = (tournament.registration?.teams || [])
      .filter((t) => t.status === 'accepted');

    const groupCount = tournament.format?.groupCount || 2;
    if (acceptedTeams.length < groupCount * 2) {
      throw new Error(`At least ${groupCount * 2} accepted teams are required for ${groupCount} groups.`);
    }

    // Distribute teams into groups (A, B, C...)
    const groupLetters = ['A', 'B', 'C', 'D'].slice(0, groupCount);
    const groups = {};
    groupLetters.forEach((letter) => { groups[letter] = []; });

    acceptedTeams.forEach((team, idx) => {
      const letter = team.group && groupLetters.includes(team.group)
        ? team.group
        : groupLetters[idx % groupCount];
      groups[letter].push(team);
      team.group = letter;
    });

    const fixtures = [];
    let matchCounter = 1;
    const startDate = new Date(tournament.startDate || Date.now());

    // Generate round robin per group
    groupLetters.forEach((letter, gIdx) => {
      const gTeams = groups[letter];
      for (let i = 0; i < gTeams.length; i++) {
        for (let j = i + 1; j < gTeams.length; j++) {
          const t1 = gTeams[i];
          const t2 = gTeams[j];
          const fixDate = new Date(startDate);
          fixDate.setDate(startDate.getDate() + Math.floor((matchCounter - 1) / 2));
          const timeSlot = matchCounter % 2 === 0 ? '02:30 PM' : '09:30 AM';
          const fixId = `fix_${tournament.id}_grp${letter}_m${matchCounter}`;

          fixtures.push({
            id: fixId,
            tournamentId: tournament.id,
            stage: 'GROUP_STAGE',
            stageName: `Group ${letter}`,
            group: letter,
            round: 1,
            matchNumber: matchCounter++,
            teamA: { id: t1.teamId || t1.id, name: t1.teamName || t1.name, shortName: t1.shortName || 'T1', logo: t1.logo },
            teamB: { id: t2.teamId || t2.id, name: t2.teamName || t2.name, shortName: t2.shortName || 'T2', logo: t2.logo },
            date: fixDate.toISOString().split('T')[0],
            time: timeSlot,
            venue: tournament.venue || 'Main Oval',
            matchId: `match_${fixId}`,
            status: 'Scheduled',
            winnerId: null,
            resultText: null,
          });
        }
      }
    });

    // Generate Playoff slots
    const playoffDate = new Date(startDate);
    playoffDate.setDate(startDate.getDate() + 10);
    const finalDate = new Date(startDate);
    finalDate.setDate(startDate.getDate() + 12);

    if (groupCount === 2) {
      const sf1Id = `fix_${tournament.id}_sf1`;
      const sf2Id = `fix_${tournament.id}_sf2`;
      const finalId = `fix_${tournament.id}_final`;

      // Semi Final 1: Winner Group A vs Runner-up Group B
      fixtures.push({
        id: sf1Id,
        tournamentId: tournament.id,
        stage: 'SEMI_FINAL',
        stageName: 'Semi Final 1 (1st Group A vs 2nd Group B)',
        group: null,
        round: 2,
        matchNumber: matchCounter++,
        teamA: { id: 'TBD_A1', name: '1st Group A', shortName: '1A' },
        teamB: { id: 'TBD_B2', name: '2nd Group B', shortName: '2B' },
        date: playoffDate.toISOString().split('T')[0],
        time: '09:30 AM',
        venue: tournament.venue || 'Main Oval',
        matchId: `match_${sf1Id}`,
        status: 'Scheduled',
        winnerId: null,
        resultText: null,
        nextFixtureId: finalId,
        nextFixtureSlot: 'teamA',
      });

      // Semi Final 2: Winner Group B vs Runner-up Group A
      fixtures.push({
        id: sf2Id,
        tournamentId: tournament.id,
        stage: 'SEMI_FINAL',
        stageName: 'Semi Final 2 (1st Group B vs 2nd Group A)',
        group: null,
        round: 2,
        matchNumber: matchCounter++,
        teamA: { id: 'TBD_B1', name: '1st Group B', shortName: '1B' },
        teamB: { id: 'TBD_A2', name: '2nd Group A', shortName: '2A' },
        date: playoffDate.toISOString().split('T')[0],
        time: '02:30 PM',
        venue: tournament.venue || 'Main Oval',
        matchId: `match_${sf2Id}`,
        status: 'Scheduled',
        winnerId: null,
        resultText: null,
        nextFixtureId: finalId,
        nextFixtureSlot: 'teamB',
      });

      // Final: Winner SF1 vs Winner SF2
      fixtures.push({
        id: finalId,
        tournamentId: tournament.id,
        stage: 'FINAL',
        stageName: 'Grand Final',
        group: null,
        round: 3,
        matchNumber: matchCounter++,
        teamA: { id: 'TBD_SF1', name: 'Winner Semi-Final 1', shortName: 'SF1' },
        teamB: { id: 'TBD_SF2', name: 'Winner Semi-Final 2', shortName: 'SF2' },
        date: finalDate.toISOString().split('T')[0],
        time: '03:00 PM',
        venue: tournament.venue || 'Main Oval',
        matchId: `match_${finalId}`,
        status: 'Scheduled',
        winnerId: null,
        resultText: null,
      });
    }

    return fixtures;
  },

  /**
   * Format C: Direct Knockout Bracket Generator with Byes
   * Handles non-power-of-2 team counts (e.g. 5, 6, 7 teams) via automatic Byes.
   */
  generateKnockoutFixtures(tournament, options = {}) {
    const acceptedTeams = (tournament.registration?.teams || [])
      .filter((t) => t.status === 'accepted');

    const count = acceptedTeams.length;
    if (count < 2) {
      throw new Error('At least 2 accepted teams are required for a knockout tournament.');
    }

    // Determine nearest power of 2: 2, 4, 8, 16, 32
    let bracketSize = 2;
    while (bracketSize < count) {
      bracketSize *= 2;
    }

    const byesCount = bracketSize - count;
    const fixtures = [];
    let matchCounter = 1;
    const startDate = new Date(tournament.startDate || Date.now());

    // Determine rounds needed:
    // bracketSize = 8 -> Quarter Finals (R1), Semi Finals (R2), Final (R3)
    // bracketSize = 4 -> Semi Finals (R1), Final (R2)
    const getStageName = (size) => {
      if (size === 2) return 'FINAL';
      if (size === 4) return 'SEMI_FINAL';
      if (size === 8) return 'QUARTER_FINAL';
      if (size === 16) return 'ROUND_OF_16';
      return `ROUND_OF_${size}`;
    };

    const getStageTitle = (stage) => {
      if (stage === 'FINAL') return 'Final';
      if (stage === 'SEMI_FINAL') return 'Semi Final';
      if (stage === 'QUARTER_FINAL') return 'Quarter Final';
      if (stage === 'ROUND_OF_16') return 'Round of 16';
      return stage;
    };

    // Build the bracket tree starting from the Final backwards
    // A binary tree of fixtures:
    const roundsList = [];
    let currentRoundTeams = bracketSize;
    let roundIndex = 1;

    while (currentRoundTeams >= 2) {
      roundsList.push({
        roundNumber: roundIndex++,
        stage: getStageName(currentRoundTeams),
        stageTitle: getStageTitle(getStageName(currentRoundTeams)),
        teamsInRound: currentRoundTeams,
        matchCount: currentRoundTeams / 2,
      });
      currentRoundTeams /= 2;
    }

    // Create fixture placeholders from later rounds down to round 1
    const roundFixturesMap = {};

    for (let r = roundsList.length - 1; r >= 0; r--) {
      const roundInfo = roundsList[r];
      roundFixturesMap[roundInfo.roundNumber] = [];

      for (let m = 0; m < roundInfo.matchCount; m++) {
        const fixId = `fix_${tournament.id}_r${roundInfo.roundNumber}_m${m + 1}`;
        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + (roundInfo.roundNumber - 1) * 3);

        const fixture = {
          id: fixId,
          tournamentId: tournament.id,
          stage: roundInfo.stage,
          stageName: `${roundInfo.stageTitle} ${roundInfo.matchCount > 1 ? m + 1 : ''}`.trim(),
          group: null,
          round: roundInfo.roundNumber,
          matchNumber: matchCounter++,
          teamA: { id: `TBD_R${roundInfo.roundNumber}_M${m + 1}_A`, name: 'TBD' },
          teamB: { id: `TBD_R${roundInfo.roundNumber}_M${m + 1}_B`, name: 'TBD' },
          date: matchDate.toISOString().split('T')[0],
          time: m % 2 === 0 ? '09:30 AM' : '02:30 PM',
          venue: tournament.venue || 'Main Stadium',
          matchId: `match_${fixId}`,
          status: 'Scheduled',
          winnerId: null,
          resultText: null,
          nextFixtureId: null,
          nextFixtureSlot: null,
        };

        // Link to next round fixture if not Final
        if (roundInfo.roundNumber < roundsList.length) {
          const nextRoundNum = roundInfo.roundNumber + 1;
          const parentMatchIndex = Math.floor(m / 2);
          const parentSlot = m % 2 === 0 ? 'teamA' : 'teamB';
          const parentFixId = `fix_${tournament.id}_r${nextRoundNum}_m${parentMatchIndex + 1}`;
          fixture.nextFixtureId = parentFixId;
          fixture.nextFixtureSlot = parentSlot;
        }

        roundFixturesMap[roundInfo.roundNumber].push(fixture);
      }
    }

    // Now seed teams into Round 1 fixtures
    // Assign Byes to top seeds:
    const seededTeams = [...acceptedTeams];
    // Create pairing slots of size bracketSize
    const pairs = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      pairs.push({ teamA: null, teamB: null });
    }

    // Fill slots with byes distributed across pairings
    // Teams get paired up, remaining get byes
    let assignedCount = 0;
    for (let i = 0; i < pairs.length; i++) {
      if (assignedCount < seededTeams.length) {
        pairs[i].teamA = seededTeams[assignedCount++];
      }
      if (assignedCount < seededTeams.length && (byesCount === 0 || i >= byesCount)) {
        pairs[i].teamB = seededTeams[assignedCount++];
      } else {
        pairs[i].teamB = { id: '__BYE__', name: 'BYE', isBye: true };
      }
    }

    // Populate Round 1 fixtures with paired teams and resolve Byes
    const r1Fixtures = roundFixturesMap[1] || [];
    for (let i = 0; i < r1Fixtures.length; i++) {
      const fix = r1Fixtures[i];
      const pair = pairs[i] || { teamA: { name: 'TBD' }, teamB: { name: 'TBD' } };

      const tA = pair.teamA;
      const tB = pair.teamB;

      fix.teamA = tA ? { id: tA.teamId || tA.id, name: tA.teamName || tA.name, shortName: tA.shortName || 'T1', logo: tA.logo } : { id: 'TBD', name: 'TBD' };
      fix.teamB = tB ? { id: tB.teamId || tB.id, name: tB.teamName || tB.name, shortName: tB.shortName || 'T2', logo: tB.logo } : { id: 'TBD', name: 'TBD' };

      // If team B is a Bye, team A automatically advances!
      if (tB && tB.isBye) {
        fix.status = 'Completed';
        fix.isBye = true;
        fix.winnerId = fix.teamA.id;
        fix.resultText = `${fix.teamA.name} advanced via Bye`;

        // Advance to next round fixture slot directly
        if (fix.nextFixtureId) {
          const nextRoundFix = roundFixturesMap[2]?.find((f) => f.id === fix.nextFixtureId);
          if (nextRoundFix) {
            nextRoundFix[fix.nextFixtureSlot] = { ...fix.teamA };
          }
        }
      }
    }

    // Flatten all round fixtures into tournament fixtures list
    Object.keys(roundFixturesMap).forEach((rKey) => {
      fixtures.push(...roundFixturesMap[rKey]);
    });

    return fixtures;
  },

  /**
   * Top-level auto generator matching tournament format
   */
  generateFixtures(tournament, options = {}) {
    if (!tournament) throw new Error('Tournament required.');
    const formatType = tournament.format?.type || 'LEAGUE';

    if (formatType === 'LEAGUE') {
      return this.generateLeagueFixtures(tournament, options);
    } else if (formatType === 'GROUPS_PLAYOFFS') {
      return this.generateGroupsFixtures(tournament, options);
    } else if (formatType === 'KNOCKOUT') {
      return this.generateKnockoutFixtures(tournament, options);
    } else {
      return this.generateLeagueFixtures(tournament, options);
    }
  },

  // =========================================================================
  // 3. STANDINGS & NET RUN RATE (NRR) ENGINE
  // =========================================================================

  /**
   * Authoritative ICC Net Run Rate & Standings Calculation.
   * Pure, deterministic, and idempotent.
   */
  calculateStandings(tournament) {
    if (!tournament) return [];

    const acceptedTeams = (tournament.registration?.teams || [])
      .filter((t) => t.status === 'accepted');

    const rules = tournament.rules || {};
    const ptsWin = rules.pointsWin !== undefined ? rules.pointsWin : 2;
    const ptsTie = rules.pointsTie !== undefined ? rules.pointsTie : 1;
    const ptsNR = rules.pointsNoResult !== undefined ? rules.pointsNoResult : 1;
    const ptsLoss = rules.pointsLoss !== undefined ? rules.pointsLoss : 0;
    const maxOvers = rules.oversPerInnings || 20;

    const fixtures = (tournament.fixtures || []).filter(
      (f) => f.status === 'Completed' && !f.isBye
    );

    // If groups format, group standings by group (A, B, etc.)
    const isGroupsFormat = tournament.format?.type === 'GROUPS_PLAYOFFS';
    const groupsList = isGroupsFormat ? ['A', 'B', 'C', 'D'].slice(0, tournament.format?.groupCount || 2) : [null];

    const allGroupStandings = {};

    groupsList.forEach((groupKey) => {
      // Filter teams belonging to this group
      const groupTeams = groupKey
        ? acceptedTeams.filter((t) => (t.group || 'A') === groupKey)
        : acceptedTeams;

      // Initialize table
      const table = {};
      groupTeams.forEach((t) => {
        const tId = t.teamId || t.id;
        table[tId] = {
          teamId: tId,
          teamName: t.teamName || t.name,
          shortName: t.shortName || (t.teamName || t.name).slice(0, 3).toUpperCase(),
          logo: t.logo,
          group: groupKey,
          played: 0,
          won: 0,
          lost: 0,
          tied: 0,
          noResult: 0,
          points: 0,
          runsFor: 0,
          oversFor: 0, // decimal overs
          runsAgainst: 0,
          oversAgainst: 0, // decimal overs
          nrr: 0.000,
          recentForm: [],
        };
      });

      // Process fixtures for this group
      const relevantFixtures = fixtures.filter((f) => {
        if (groupKey) return f.group === groupKey;
        return f.stage === 'LEAGUE' || !f.stage;
      });

      relevantFixtures.forEach((fix) => {
        const idA = fix.teamA?.id;
        const idB = fix.teamB?.id;

        if (!table[idA] && groupTeams.some((t) => (t.teamId || t.id) === idA)) {
          table[idA] = {
            teamId: idA,
            teamName: fix.teamA.name,
            shortName: fix.teamA.shortName || 'T1',
            logo: fix.teamA.logo,
            group: groupKey,
            played: 0, won: 0, lost: 0, tied: 0, noResult: 0, points: 0,
            runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0, nrr: 0, recentForm: [],
          };
        }
        if (!table[idB] && groupTeams.some((t) => (t.teamId || t.id) === idB)) {
          table[idB] = {
            teamId: idB,
            teamName: fix.teamB.name,
            shortName: fix.teamB.shortName || 'T2',
            logo: fix.teamB.logo,
            group: groupKey,
            played: 0, won: 0, lost: 0, tied: 0, noResult: 0, points: 0,
            runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0, nrr: 0, recentForm: [],
          };
        }

        const rowA = table[idA];
        const rowB = table[idB];
        if (!rowA || !rowB) return;

        rowA.played += 1;
        rowB.played += 1;

        // Parse scores & overs
        const parseRuns = (str) => {
          if (!str) return 0;
          return parseInt(String(str).split('/')[0], 10) || 0;
        };
        const parseWickets = (str) => {
          if (!str) return 0;
          const parts = String(str).split('/');
          return parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
        };

        const runsA = fix.totalRunsA !== undefined ? fix.totalRunsA : parseRuns(fix.scoreA);
        const wicketsA = parseWickets(fix.scoreA);
        const decOversA = fix.oversA ? cricketOversToDecimal(fix.oversA) : maxOvers;

        const runsB = fix.totalRunsB !== undefined ? fix.totalRunsB : parseRuns(fix.scoreB);
        const wicketsB = parseWickets(fix.scoreB);
        const decOversB = fix.oversB ? cricketOversToDecimal(fix.oversB) : maxOvers;

        // ICC All-Out Rule: If team is all out (10 wickets), full allocated overs count
        const effectiveOversA = wicketsA >= 10 ? maxOvers : (decOversA || maxOvers);
        const effectiveOversB = wicketsB >= 10 ? maxOvers : (decOversB || maxOvers);

        rowA.runsFor += runsA;
        rowA.oversFor += effectiveOversA;
        rowA.runsAgainst += runsB;
        rowA.oversAgainst += effectiveOversB;

        rowB.runsFor += runsB;
        rowB.oversFor += effectiveOversB;
        rowB.runsAgainst += runsA;
        rowB.oversAgainst += effectiveOversA;

        // Winner and Points
        if (fix.winnerId === idA) {
          rowA.won += 1;
          rowA.points += ptsWin;
          rowA.recentForm.push('W');
          rowB.lost += 1;
          rowB.points += ptsLoss;
          rowB.recentForm.push('L');
        } else if (fix.winnerId === idB) {
          rowB.won += 1;
          rowB.points += ptsWin;
          rowB.recentForm.push('W');
          rowA.lost += 1;
          rowA.points += ptsLoss;
          rowA.recentForm.push('L');
        } else if (fix.isTied || fix.resultText?.toLowerCase().includes('tied')) {
          rowA.tied += 1;
          rowA.points += ptsTie;
          rowA.recentForm.push('T');
          rowB.tied += 1;
          rowB.points += ptsTie;
          rowB.recentForm.push('T');
        } else {
          // Abandoned / No Result
          rowA.noResult += 1;
          rowA.points += ptsNR;
          rowA.recentForm.push('NR');
          rowB.noResult += 1;
          rowB.points += ptsNR;
          rowB.recentForm.push('NR');
        }
      });

      // Calculate NRR for each team: (RunsFor / OversFor) - (RunsAgainst / OversAgainst)
      const rows = Object.values(table).map((row) => {
        let nrr = 0;
        if (row.oversFor > 0 && row.oversAgainst > 0) {
          const runRateFor = row.runsFor / row.oversFor;
          const runRateAgainst = row.runsAgainst / row.oversAgainst;
          nrr = parseFloat((runRateFor - runRateAgainst).toFixed(3));
        }
        return {
          ...row,
          nrr,
          oversForDisplay: decimalToCricketOvers(row.oversFor),
          oversAgainstDisplay: decimalToCricketOvers(row.oversAgainst),
        };
      });

      // Deterministic Sort: Points (desc) -> NRR (desc) -> Won (desc) -> Alphabetical
      rows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.nrr !== a.nrr) return b.nrr - a.nrr;
        if (b.won !== a.won) return b.won - a.won;
        return a.teamName.localeCompare(b.teamName);
      });

      // Add position rank
      const ranked = rows.map((r, idx) => ({ ...r, rank: idx + 1 }));
      allGroupStandings[groupKey || 'LEAGUE'] = ranked;
    });

    return isGroupsFormat ? allGroupStandings : (allGroupStandings['LEAGUE'] || []);
  },

  // =========================================================================
  // 4. MATCH ENGINE INTEGRATION & BRACKET PROGRESSION
  // =========================================================================

  /**
   * Prepare Match data payload for existing LiveScoring engine
   */
  async getFixtureMatchData(tournament, fixture) {
    if (!tournament || !fixture) return null;

    const matchId = fixture.matchId || `match_${fixture.id}`;
    if (!fixture.matchId) {
      fixture.matchId = matchId;
      await saveTournament(tournament);
    }

    const allTeams = await getTeams();
    const teamAObj = allTeams.find((t) => t.id === fixture.teamA?.id) || {
      id: fixture.teamA?.id,
      name: fixture.teamA?.name,
      shortName: fixture.teamA?.shortName,
      members: [],
    };
    const teamBObj = allTeams.find((t) => t.id === fixture.teamB?.id) || {
      id: fixture.teamB?.id,
      name: fixture.teamB?.name,
      shortName: fixture.teamB?.shortName,
      members: [],
    };

    const rules = tournament.rules || {};
    const overs = rules.oversPerInnings || 20;
    const format = rules.matchFormat || 'T20';

    return {
      id: matchId,
      fixtureId: fixture.id,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      stageName: fixture.stageName,
      round: fixture.round,
      teamA: fixture.teamA.name,
      teamB: fixture.teamB.name,
      teamAId: fixture.teamA.id,
      teamBId: fixture.teamB.id,
      teamAObj,
      teamBObj,
      format,
      type: 'Competitive',
      oversPerInnings: overs,
      venue: fixture.venue || tournament.venue,
      date: fixture.date || new Date().toISOString().split('T')[0],
      time: fixture.time || '10:00 AM',
      status: fixture.status === 'Completed' ? 'Completed' : 'Live',
      isFreshMatch: fixture.status !== 'Completed',
      creatorId: tournament.organizerId,
      ownerId: tournament.organizerId,
      scorerId: tournament.organizerId,
      scorers: [tournament.organizerId],
    };
  },

  /**
   * Sync a completed match result back to tournament fixtures,
   * advancing brackets and updating standings idempotently.
   */
  async syncMatchResultToFixture(tournamentId, fixtureId, completedMatch) {
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) return null;

    const fixtures = tournament.fixtures || [];
    const fixture = fixtures.find((f) => f.id === fixtureId || f.matchId === completedMatch?.id);
    if (!fixture) return tournament;

    const winner = completedMatch.winner || completedMatch.matchResult?.winner;
    let winnerId = null;

    if (winner) {
      if (winner === fixture.teamA?.name || winner === fixture.teamA?.id) {
        winnerId = fixture.teamA.id;
      } else if (winner === fixture.teamB?.name || winner === fixture.teamB?.id) {
        winnerId = fixture.teamB.id;
      }
    }

    const winningTeamObj = winnerId === fixture.teamA.id ? fixture.teamA : fixture.teamB;

    // Update fixture state
    fixture.status = 'Completed';
    fixture.winnerId = winnerId;
    fixture.resultText = completedMatch.matchResult?.resultText || `${winner} won`;
    fixture.scoreA = completedMatch.scoreA || fixture.scoreA;
    fixture.oversA = completedMatch.oversA || fixture.oversA;
    fixture.scoreB = completedMatch.scoreB || fixture.scoreB;
    fixture.oversB = completedMatch.oversB || fixture.oversB;

    // Bracket Advancement (for Knockout & Playoffs)
    if (fixture.nextFixtureId && winningTeamObj) {
      const nextFix = fixtures.find((f) => f.id === fixture.nextFixtureId);
      if (nextFix && fixture.nextFixtureSlot) {
        nextFix[fixture.nextFixtureSlot] = {
          id: winningTeamObj.id,
          name: winningTeamObj.name,
          shortName: winningTeamObj.shortName || winningTeamObj.name.slice(0, 3).toUpperCase(),
          logo: winningTeamObj.logo,
        };
      }
    }

    // Advance Groups Playoffs if all group matches completed
    if (tournament.format?.type === 'GROUPS_PLAYOFFS') {
      this.checkAndAdvanceGroupPlayoffs(tournament);
    }

    // Save and notify
    return await saveTournament(tournament);
  },

  /**
   * Check if group stage is completed and seed playoff fixtures
   */
  checkAndAdvanceGroupPlayoffs(tournament) {
    const fixtures = tournament.fixtures || [];
    const groupMatches = fixtures.filter((f) => f.stage === 'GROUP_STAGE');
    const allGroupMatchesDone = groupMatches.every((f) => f.status === 'Completed');

    if (!allGroupMatchesDone) return;

    // Compute group standings
    const standings = this.calculateStandings(tournament);
    const groupA = standings['A'] || [];
    const groupB = standings['B'] || [];

    if (groupA.length >= 2 && groupB.length >= 2) {
      const a1 = groupA[0];
      const a2 = groupA[1];
      const b1 = groupB[0];
      const b2 = groupB[1];

      // SF1: A1 vs B2
      const sf1 = fixtures.find((f) => f.stage === 'SEMI_FINAL' && f.stageName?.includes('1st Group A'));
      if (sf1) {
        sf1.teamA = { id: a1.teamId, name: a1.teamName, shortName: a1.shortName, logo: a1.logo };
        sf1.teamB = { id: b2.teamId, name: b2.teamName, shortName: b2.shortName, logo: b2.logo };
      }

      // SF2: B1 vs A2
      const sf2 = fixtures.find((f) => f.stage === 'SEMI_FINAL' && f.stageName?.includes('1st Group B'));
      if (sf2) {
        sf2.teamA = { id: b1.teamId, name: b1.teamName, shortName: b1.shortName, logo: b1.logo };
        sf2.teamB = { id: a2.teamId, name: a2.teamName, shortName: a2.shortName, logo: a2.logo };
      }
    }
  },
};
