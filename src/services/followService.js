/**
 * EZKORA Follow Service
 * 
 * Manages followed matches, players, and teams in persistent AsyncStorage.
 * Synchronizes with the existing following ecosystem.
 */

import AsyncStorageRaw from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;
const FOLLOW_STORAGE_KEY = '@ezkora_followed_entities_v1';

// In-memory cache
let followedState = {
  matches: new Set(['f1', 'c1']),
  players: new Set(['usr_rahul123', 'usr_arjun123', 'p1', 'p2']),
  teams: new Set(['Falcons CC', 'Warriors XI']),
  initialized: false,
};

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn({ ...followedState });
    } catch (e) {}
  });
}

export async function initFollowService() {
  if (followedState.initialized) return;
  try {
    const raw = await AsyncStorage.getItem(FOLLOW_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.matches)) followedState.matches = new Set(parsed.matches);
      if (Array.isArray(parsed.players)) followedState.players = new Set(parsed.players);
      if (Array.isArray(parsed.teams)) followedState.teams = new Set(parsed.teams);
    }
  } catch (err) {
    console.warn('Error loading follow state:', err);
  } finally {
    followedState.initialized = true;
    notifyListeners();
  }
}

async function persistFollowState() {
  try {
    const payload = {
      matches: Array.from(followedState.matches),
      players: Array.from(followedState.players),
      teams: Array.from(followedState.teams),
    };
    await AsyncStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(payload));
    notifyListeners();
  } catch (err) {
    console.warn('Error persisting follow state:', err);
  }
}

export function isMatchFollowed(matchId) {
  if (!matchId) return false;
  return followedState.matches.has(String(matchId));
}

export async function toggleFollowMatch(matchId) {
  if (!matchId) return false;
  const idStr = String(matchId);
  const nowFollowing = !followedState.matches.has(idStr);
  if (nowFollowing) {
    followedState.matches.add(idStr);
  } else {
    followedState.matches.delete(idStr);
  }
  await persistFollowState();
  return nowFollowing;
}

export function isPlayerFollowed(playerId) {
  if (!playerId) return false;
  return followedState.players.has(String(playerId));
}

export async function toggleFollowPlayer(playerId) {
  if (!playerId) return false;
  const idStr = String(playerId);
  const nowFollowing = !followedState.players.has(idStr);
  if (nowFollowing) {
    followedState.players.add(idStr);
  } else {
    followedState.players.delete(idStr);
  }
  await persistFollowState();
  return nowFollowing;
}

export function isTeamFollowed(teamNameOrId) {
  if (!teamNameOrId) return false;
  return followedState.teams.has(String(teamNameOrId));
}

export async function toggleFollowTeam(teamNameOrId) {
  if (!teamNameOrId) return false;
  const idStr = String(teamNameOrId);
  const nowFollowing = !followedState.teams.has(idStr);
  if (nowFollowing) {
    followedState.teams.add(idStr);
  } else {
    followedState.teams.delete(idStr);
  }
  await persistFollowState();
  return nowFollowing;
}

export function subscribeToFollowChanges(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
