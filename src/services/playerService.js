/**
 * Frontend Player Service
 * Service layer abstraction for player data operations
 * Operates on frontend mock data & authenticated session state.
 */

import { MOCK_PLAYERS, CURRENT_MOCK_USER } from '../data/mockPlayers.js';
import { useAuthStore } from '../store/authStore.js';

// Simulate slight network latency for realistic UX / loading states
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// Explicit user override (used for test scenarios or manual profile switching)
let activeUserOverride = null;

export const playerService = {
  /**
   * Set or override current user (used during tests or auth switching)
   */
  setCurrentUser(user) {
    if (!user) {
      activeUserOverride = null;
      return;
    }
    const pId = user.playerId || user.id;
    activeUserOverride = {
      id: pId,
      playerId: pId,
      userId: pId,
      playerUid: user.playerUid || 'SP-7K4M-92QX',
      name: user.name || user.fullName || 'Cricket Player',
      username: (user.username || 'player').startsWith('@')
        ? user.username
        : `@${(user.username || 'player').replace(/^@/, '')}`,
      role: user.role || 'Captain / All-Rounder',
      style: user.style || user.battingStyle || 'RHB / Right-Arm Medium',
      avatar: user.avatar || null,
    };
  },

  /**
   * Reset user override back to default
   */
  resetCurrentUser() {
    activeUserOverride = null;
  },

  /**
   * Get current authenticated user
   * Precedence:
   * 1. Explicit override (if set via setCurrentUser)
   * 2. Active logged-in user from useAuthStore
   * 3. Default mock user (CURRENT_MOCK_USER - Rahul Kumar)
   */
  async getCurrentUser() {
    await delay(50);
    if (activeUserOverride) {
      return { ...activeUserOverride };
    }

    try {
      if (typeof useAuthStore?.getState === 'function') {
        const authState = useAuthStore.getState();
        const authAccount = authState?.accountData;
        if (authAccount && (authAccount.id || authAccount.playerId)) {
          const pId = authAccount.playerId || authAccount.id;
          const pUid =
            authAccount.playerUid ||
            (authAccount.account && authAccount.account.playerUid);
          const cricketProfile =
            (authState.sportProfiles || []).find(
              (p) => p.sport === (authState.activeSport || 'Cricket')
            ) ||
            (authState.sportProfiles || [])[0] ||
            {};

          return {
            id: pId,
            playerId: pId,
            userId: pId,
            playerUid: pUid || 'SP-7K4M-92QX',
            name: authAccount.name || authAccount.fullName || 'Cricket Player',
            username: (authAccount.username || 'player').startsWith('@')
              ? authAccount.username
              : `@${(authAccount.username || 'player').replace(/^@/, '')}`,
            role: cricketProfile.role || 'Captain / All-Rounder',
            style:
              cricketProfile.battingStyle ||
              cricketProfile.style ||
              'RHB / Right-Arm Medium',
            avatar: authAccount.avatar || null,
          };
        }
      }
    } catch {
      // Fallback gracefully to CURRENT_MOCK_USER
    }

    return { ...CURRENT_MOCK_USER };
  },

  /**
   * Get all registered mock players
   */
  async getPlayers() {
    await delay(100);
    return [...MOCK_PLAYERS];
  },

  /**
   * Get player by internal playerId
   */
  async getPlayerById(playerId) {
    await delay(100);
    if (activeUserOverride && (activeUserOverride.playerId === playerId || activeUserOverride.id === playerId)) {
      return { ...activeUserOverride };
    }
    const player = MOCK_PLAYERS.find(
      (p) => p.playerId === playerId || p.id === playerId
    );
    return player ? { ...player } : null;
  },

  /**
   * Search player by public Player UID (e.g. "SP-7K4M-92QX")
   * Trims whitespace and is case-insensitive.
   */
  async searchPlayersByUid(uid) {
    await delay(250); // Simulate network round-trip for search
    if (!uid || typeof uid !== 'string') return null;

    const cleanUid = uid.trim().toUpperCase();
    if (!cleanUid) return null;

    let found = MOCK_PLAYERS.find(
      (p) => p.playerUid && p.playerUid.toUpperCase() === cleanUid
    );

    if (!found && activeUserOverride && activeUserOverride.playerUid?.toUpperCase() === cleanUid) {
      found = activeUserOverride;
    }

    return found ? { ...found } : null;
  },
};

export default playerService;
