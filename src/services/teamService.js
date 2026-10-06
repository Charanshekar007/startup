/**
 * Frontend Team Service
 * Service layer abstraction for team operations, squad management, and match drafts.
 * Currently operates on frontend state. Can be swapped with real API calls later.
 */

import { INITIAL_MOCK_TEAMS } from '../data/mockTeams.js';
import { playerService } from './playerService.js';

// In-memory frontend store of teams
let teamsStore = JSON.parse(JSON.stringify(INITIAL_MOCK_TEAMS));

// In-memory match draft store
let currentMatchDraft = null;

// Simulate slight async network delay
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const teamService = {
  /**
   * Get all available teams
   */
  async getTeams() {
    await delay(100);
    return JSON.parse(JSON.stringify(teamsStore));
  },

  /**
   * Get teams owned by or associated with the current user
   */
  async getMyTeams() {
    await delay(100);
    const currentUser = await playerService.getCurrentUser();
    const creatorId = currentUser.playerId || currentUser.id;

    const myTeams = teamsStore.filter((t) => {
      if (t.ownerId === creatorId || t.captainId === creatorId) return true;
      return (t.members || []).some(
        (m) =>
          (m.playerId === creatorId ||
            m.id === creatorId ||
            (m.playerUid && m.playerUid === currentUser.playerUid)) &&
          m.status === 'accepted'
      );
    });
    return JSON.parse(JSON.stringify(myTeams));
  },

  /**
   * Search teams by team name or short code
   */
  async searchTeams(query) {
    await delay(150);
    if (!query || !query.trim()) {
      return JSON.parse(JSON.stringify(teamsStore));
    }
    const clean = query.trim().toLowerCase();
    const filtered = teamsStore.filter(
      (t) =>
        t.name.toLowerCase().includes(clean) ||
        (t.shortName && t.shortName.toLowerCase().includes(clean))
    );
    return JSON.parse(JSON.stringify(filtered));
  },

  /**
   * Get a single team by teamId
   */
  async getTeam(teamId) {
    await delay(80);
    const team = teamsStore.find((t) => t.id === teamId || t.teamId === teamId);
    return team ? JSON.parse(JSON.stringify(team)) : null;
  },

  /**
   * Get all members of a team (both accepted and pending)
   */
  async getTeamMembers(teamId) {
    await delay(80);
    const team = teamsStore.find((t) => t.id === teamId || t.teamId === teamId);
    return team ? JSON.parse(JSON.stringify(team.members || [])) : [];
  },

  /**
   * Get accepted squad members only (used for match readiness & Playing XI)
   */
  async getAcceptedSquad(teamId) {
    await delay(80);
    const team = teamsStore.find((t) => t.id === teamId || t.teamId === teamId);
    if (!team) return [];
    const accepted = (team.members || []).filter((m) => m.status === 'accepted');
    return JSON.parse(JSON.stringify(accepted));
  },

  /**
   * Create a new team
   * The authenticated user automatically becomes:
   * 1. Team Owner (ownerId)
   * 2. Team Captain (captainId)
   * 3. Initial Squad Member (members[0], with isCaptain: true)
   */
  async createTeam(
    { name, shortName, location, logo, sport = 'Cricket', teamType = 'Club' },
    customCreator = null
  ) {
    await delay(200);
    const currentUser = customCreator || (await playerService.getCurrentUser());
    const creatorId = currentUser.playerId || currentUser.id;

    const newTeamId = `team-${Date.now()}`;
    const cleanName = (name || '').trim();
    const cleanShort = (shortName || cleanName.slice(0, 3)).trim().toUpperCase();
    const cleanLocation = (location || 'Local Ground').trim();

    // The creator is automatically Owner, Captain, and initial Squad Member
    const captainMember = {
      id: creatorId,
      playerId: creatorId,
      userId: creatorId,
      playerUid: currentUser.playerUid,
      name: currentUser.name || currentUser.fullName,
      username: (currentUser.username || '').replace(/^@/, ''),
      role: currentUser.role || 'Captain / All-Rounder',
      style: currentUser.style || 'RHB / RAM',
      isCaptain: true,
      status: 'accepted',
      avatar: currentUser.avatar || null,
    };

    const newTeam = {
      id: newTeamId,
      teamId: newTeamId,
      name: cleanName,
      shortName: cleanShort,
      location: cleanLocation,
      sport: sport || 'Cricket',
      teamType: teamType || 'Club',
      ownerId: creatorId,
      captainId: creatorId,
      logo:
        logo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          cleanName
        )}&background=1e3a29&color=23c55e&bold=true`,
      members: [captainMember],
    };

    teamsStore.unshift(newTeam);
    return JSON.parse(JSON.stringify(newTeam));
  },

  /**
   * Add a player to a team's squad
   * Prevents duplicates (checks playerId and playerUid).
   * Prevents adding creator/captain a second time.
   * Squad size is NOT capped at 11 (can grow to 15, 20, 25, 30+).
   * Returns { success: boolean, team?: object, error?: string }
   */
  async addPlayerToTeam(teamId, playerOrId) {
    await delay(150);
    const team = teamsStore.find((t) => t.id === teamId || t.teamId === teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    let playerObj = null;
    if (typeof playerOrId === 'string') {
      playerObj = await playerService.getPlayerById(playerOrId);
    } else {
      playerObj = playerOrId;
    }

    if (!playerObj) {
      return { success: false, error: 'Player not found' };
    }

    const playerId = playerObj.playerId || playerObj.id;
    const playerUid = playerObj.playerUid;

    // Check duplicate: already in team? (Prevent adding creator or existing member again)
    const alreadyExists = (team.members || []).some(
      (m) =>
        m.playerId === playerId ||
        m.id === playerId ||
        (playerUid && m.playerUid && m.playerUid.toUpperCase() === playerUid.toUpperCase())
    );

    if (alreadyExists || team.captainId === playerId || team.ownerId === playerId) {
      return { success: false, error: 'Player is already in this team.' };
    }

    // Add to squad
    const newMember = {
      id: playerId,
      playerId: playerId,
      userId: playerId,
      playerUid: playerUid || `SP-${Date.now().toString(36).toUpperCase()}`,
      name: playerObj.name,
      username: (playerObj.username || '').replace(/^@/, ''),
      role: playerObj.role || 'Squad Member',
      style: playerObj.style || 'Cricket Player',
      isCaptain: playerId === team.captainId,
      status: 'accepted',
      avatar: playerObj.avatar || null,
    };

    team.members = [...(team.members || []), newMember];

    return {
      success: true,
      team: JSON.parse(JSON.stringify(team)),
      member: newMember,
    };
  },

  /**
   * Remove a player from team squad
   * Captain / Owner cannot be removed.
   */
  async removePlayerFromTeam(teamId, playerId) {
    await delay(100);
    const team = teamsStore.find((t) => t.id === teamId || t.teamId === teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    if (playerId === team.captainId || playerId === team.ownerId) {
      return { success: false, error: 'Cannot remove the Team Captain / Owner.' };
    }

    team.members = (team.members || []).filter(
      (m) => m.playerId !== playerId && m.id !== playerId
    );

    return {
      success: true,
      team: JSON.parse(JSON.stringify(team)),
    };
  },

  /**
   * Save Match Draft State
   * Kept separate from permanent team squad. Does NOT mutate team.members.
   */
  async createMatchDraft(draft) {
    await delay(100);
    currentMatchDraft = {
      teamAId: draft.teamAId,
      teamBId: draft.teamBId,
      teamAPlayingXI: [...(draft.teamAPlayingXI || [])],
      teamBPlayingXI: [...(draft.teamBPlayingXI || [])],
      updatedAt: new Date().toISOString(),
    };
    return { ...currentMatchDraft };
  },

  /**
   * Get current match draft
   */
  async getMatchDraft() {
    await delay(50);
    return currentMatchDraft ? { ...currentMatchDraft } : null;
  },

  /**
   * Reset teams store back to initial mock data (useful for test resets)
   */
  resetStore() {
    teamsStore = JSON.parse(JSON.stringify(INITIAL_MOCK_TEAMS));
    currentMatchDraft = null;
  },
};

export default teamService;
