/**
 * tournamentRepository.js
 * 
 * Persistent storage and domain operations for EZKORA Tournaments.
 * Backed by AsyncStorage under key '@ezkora_tournaments_v1'.
 * Reuses existing teams, users, and match models.
 */

import AsyncStorageRaw from '@react-native-async-storage/async-storage';
import { getTeams } from './teamRepository.js';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;
export const TOURNAMENTS_STORAGE_KEY = '@ezkora_tournaments_v1';

// In-memory pub/sub for real-time tournament updates
const tournamentSubscribers = new Map();

export function subscribeToTournament(tournamentId, callback) {
  if (!tournamentId || typeof callback !== 'function') return () => {};
  if (!tournamentSubscribers.has(tournamentId)) {
    tournamentSubscribers.set(tournamentId, new Set());
  }
  const set = tournamentSubscribers.get(tournamentId);
  set.add(callback);
  return () => {
    set.delete(callback);
    if (set.size === 0) tournamentSubscribers.delete(tournamentId);
  };
}

export function notifyTournamentSubscribers(tournamentId, tournamentData) {
  if (!tournamentId || !tournamentSubscribers.has(tournamentId)) return;
  const set = tournamentSubscribers.get(tournamentId);
  set.forEach((cb) => {
    try {
      cb(tournamentData);
    } catch (err) {
      console.warn('[tournamentRepository] Subscriber error:', err);
    }
  });
}

/**
 * Seed Tournaments for EZKORA platform (referencing existing teams and context)
 */
export const DEFAULT_TOURNAMENTS = [
  {
    id: 'tourn_kurukshetra_2026',
    name: 'Kurukshetra Champions Trophy 2026',
    shortName: 'KCT 2026',
    description: 'The premier Hyderabad amateur cricket championship. High-intensity cricket with group stages leading to eliminator and finals.',
    logo: 'https://ui-avatars.com/api/?name=KCT&background=c0392b&color=fff&bold=true',
    banner: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr_arjun123',
    organizerName: 'Arjun (Warriors XI)',
    city: 'Hyderabad',
    venue: 'Rajiv Cricket Ground, Hyderabad',
    grounds: ['Main Oval', 'Ground B'],
    startDate: '2026-05-10',
    endDate: '2026-05-25',
    registrationDeadline: '2026-05-05',
    visibility: 'public',
    status: 'in_progress',
    rules: {
      ballType: 'Leather',
      matchFormat: 'T20',
      oversPerInnings: 20,
      playersPerSide: 11,
      maxSquadSize: 20,
      pointsWin: 2,
      pointsTie: 1,
      pointsNoResult: 1,
      pointsLoss: 0,
      tieBreakRules: ['Points', 'NRR', 'Wins', 'Head-to-head'],
    },
    registration: {
      mode: 'open',
      maxTeams: 4,
      teams: [
        {
          teamId: 'team_warriors',
          teamName: 'Warriors XI',
          shortName: 'WX',
          logo: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
          location: 'Hyderabad, India',
          status: 'accepted',
          type: 'invitation',
          invitedBy: 'usr_arjun123',
          registeredAt: '2026-04-15T10:00:00Z',
          group: 'A',
        },
        {
          teamId: 'team_falcons',
          teamName: 'Falcons CC',
          shortName: 'FC',
          logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
          location: 'Bengaluru, India',
          status: 'accepted',
          type: 'application',
          invitedBy: null,
          registeredAt: '2026-04-16T11:00:00Z',
          group: 'A',
        },
        {
          teamId: 'team_csk',
          teamName: 'Super Kings XI',
          shortName: 'SKX',
          logo: 'https://ui-avatars.com/api/?name=SKX&background=f1c40f&color=000',
          location: 'Chennai, India',
          status: 'accepted',
          type: 'invitation',
          invitedBy: 'usr_arjun123',
          registeredAt: '2026-04-17T12:00:00Z',
          group: 'B',
        },
        {
          teamId: 'team_mi',
          teamName: 'Mumbai Royals',
          shortName: 'MR',
          logo: 'https://ui-avatars.com/api/?name=MR&background=2980b9&color=fff',
          location: 'Mumbai, India',
          status: 'accepted',
          type: 'application',
          invitedBy: null,
          registeredAt: '2026-04-18T13:00:00Z',
          group: 'B',
        },
      ],
    },
    format: {
      type: 'GROUPS_PLAYOFFS',
      groupCount: 2,
      qualifiersPerGroup: 1,
      playoffFormat: 'FINAL_ONLY',
    },
    fixtures: [
      {
        id: 'fix_kct_1',
        tournamentId: 'tourn_kurukshetra_2026',
        stage: 'GROUP_STAGE',
        stageName: 'Group A Round 1',
        group: 'A',
        round: 1,
        matchNumber: 1,
        teamA: { id: 'team_warriors', name: 'Warriors XI', shortName: 'WX' },
        teamB: { id: 'team_falcons', name: 'Falcons CC', shortName: 'FC' },
        date: '2026-05-10',
        time: '09:00 AM',
        venue: 'Rajiv Cricket Ground, Hyderabad',
        matchId: 'match_kct_001',
        status: 'Completed',
        winnerId: 'team_warriors',
        resultText: 'Warriors XI won by 4 wickets',
        scoreA: '154/6',
        oversA: '19.2 Ov',
        scoreB: '150/8',
        oversB: '20.0 Ov',
        nextFixtureId: 'fix_kct_final',
        nextFixtureSlot: 'teamA',
      },
      {
        id: 'fix_kct_2',
        tournamentId: 'tourn_kurukshetra_2026',
        stage: 'GROUP_STAGE',
        stageName: 'Group B Round 1',
        group: 'B',
        round: 1,
        matchNumber: 2,
        teamA: { id: 'team_csk', name: 'Super Kings XI', shortName: 'SKX' },
        teamB: { id: 'team_mi', name: 'Mumbai Royals', shortName: 'MR' },
        date: '2026-05-11',
        time: '02:00 PM',
        venue: 'Rajiv Cricket Ground, Hyderabad',
        matchId: 'match_kct_002',
        status: 'Completed',
        winnerId: 'team_csk',
        resultText: 'Super Kings XI won by 15 runs',
        scoreA: '172/4',
        oversA: '20.0 Ov',
        scoreB: '157/9',
        oversB: '20.0 Ov',
        nextFixtureId: 'fix_kct_final',
        nextFixtureSlot: 'teamB',
      },
      {
        id: 'fix_kct_final',
        tournamentId: 'tourn_kurukshetra_2026',
        stage: 'FINAL',
        stageName: 'Championship Final',
        group: null,
        round: 2,
        matchNumber: 3,
        teamA: { id: 'team_warriors', name: 'Warriors XI', shortName: 'WX' },
        teamB: { id: 'team_csk', name: 'Super Kings XI', shortName: 'SKX' },
        date: '2026-05-18',
        time: '03:00 PM',
        venue: 'Rajiv Cricket Ground, Hyderabad',
        matchId: 'match_kct_final',
        status: 'Scheduled',
        winnerId: null,
        resultText: null,
      },
    ],
    createdAt: '2026-04-10T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'tourn_bangalore_league_2026',
    name: 'Bengaluru Super League 2026',
    shortName: 'BSL 2026',
    description: 'City-wide round-robin cricket tournament. Every team plays each other in pure league format.',
    logo: 'https://ui-avatars.com/api/?name=BSL&background=27ae60&color=fff&bold=true',
    banner: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr_rahul123',
    organizerName: 'Rahul Kumar (Falcons CC)',
    city: 'Bengaluru',
    venue: 'Alur Cricket Ground, Bengaluru',
    grounds: ['Alur Ground 1'],
    startDate: '2026-06-01',
    endDate: '2026-06-20',
    registrationDeadline: '2026-05-25',
    visibility: 'public',
    status: 'published',
    rules: {
      ballType: 'Leather',
      matchFormat: 'T20',
      oversPerInnings: 20,
      playersPerSide: 11,
      maxSquadSize: 18,
      pointsWin: 2,
      pointsTie: 1,
      pointsNoResult: 1,
      pointsLoss: 0,
      tieBreakRules: ['Points', 'NRR', 'Wins', 'Head-to-head'],
    },
    registration: {
      mode: 'open',
      maxTeams: 4,
      teams: [
        {
          teamId: 'team_falcons',
          teamName: 'Falcons CC',
          shortName: 'FC',
          logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
          location: 'Bengaluru, India',
          status: 'accepted',
          type: 'invitation',
          invitedBy: 'usr_rahul123',
          registeredAt: '2026-04-20T10:00:00Z',
        },
        {
          teamId: 'team_warriors',
          teamName: 'Warriors XI',
          shortName: 'WX',
          logo: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
          location: 'Hyderabad, India',
          status: 'accepted',
          type: 'application',
          invitedBy: null,
          registeredAt: '2026-04-21T11:00:00Z',
        },
      ],
    },
    format: {
      type: 'LEAGUE',
      roundRobinType: 'single',
    },
    fixtures: [],
    createdAt: '2026-04-12T00:00:00Z',
    updatedAt: '2026-04-12T00:00:00Z',
  },
  {
    id: 'tourn_knockout_cup_2026',
    name: 'South India Knockout Cup 2026',
    shortName: 'SIKC 2026',
    description: 'Direct elimination knockout championship. One loss and you are out. Winner takes the trophy!',
    logo: 'https://ui-avatars.com/api/?name=SIKC&background=e67e22&color=fff&bold=true',
    banner: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr_arjun123',
    organizerName: 'Arjun (Warriors XI)',
    city: 'Hyderabad',
    venue: 'Gymkhana Cricket Stadium, Secunderabad',
    grounds: ['Main Stadium'],
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    registrationDeadline: '2026-06-20',
    visibility: 'public',
    status: 'draft',
    rules: {
      ballType: 'Leather',
      matchFormat: 'T20',
      oversPerInnings: 20,
      playersPerSide: 11,
      maxSquadSize: 20,
      pointsWin: 2,
      pointsTie: 1,
      pointsNoResult: 1,
      pointsLoss: 0,
      tieBreakRules: ['Points', 'NRR', 'Wins'],
    },
    registration: {
      mode: 'open',
      maxTeams: 8,
      teams: [
        {
          teamId: 'team_warriors',
          teamName: 'Warriors XI',
          shortName: 'WX',
          logo: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
          location: 'Hyderabad, India',
          status: 'accepted',
          type: 'invitation',
        },
      ],
    },
    format: {
      type: 'KNOCKOUT',
      hasThirdPlace: false,
    },
    fixtures: [],
    createdAt: '2026-04-14T00:00:00Z',
    updatedAt: '2026-04-14T00:00:00Z',
  },
];

/**
 * Get all tournaments from storage (initializing with defaults if empty)
 */
export async function getTournaments() {
  try {
    const raw = await AsyncStorage.getItem(TOURNAMENTS_STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_TOURNAMENTS));
      return JSON.parse(JSON.stringify(DEFAULT_TOURNAMENTS));
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await AsyncStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_TOURNAMENTS));
      return JSON.parse(JSON.stringify(DEFAULT_TOURNAMENTS));
    }
    return parsed;
  } catch (err) {
    console.error('Error fetching tournaments from storage:', err);
    return JSON.parse(JSON.stringify(DEFAULT_TOURNAMENTS));
  }
}

/**
 * Get tournament by ID
 */
export async function getTournamentById(id) {
  if (!id) return null;
  const list = await getTournaments();
  return list.find((t) => t.id === id) || null;
}

/**
 * Save or update a tournament in persistent storage
 */
export async function saveTournament(tournamentData) {
  if (!tournamentData) return null;
  const list = await getTournaments();
  const id = tournamentData.id || `tourn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const prepared = {
    ...tournamentData,
    id,
    updatedAt: now,
    createdAt: tournamentData.createdAt || now,
  };

  const idx = list.findIndex((t) => t.id === id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...list];
    updatedList[idx] = prepared;
  } else {
    updatedList = [prepared, ...list];
  }

  await AsyncStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(updatedList));
  notifyTournamentSubscribers(id, prepared);
  return prepared;
}

/**
 * Delete a tournament
 */
export async function deleteTournament(id) {
  if (!id) return false;
  const list = await getTournaments();
  const filtered = list.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
