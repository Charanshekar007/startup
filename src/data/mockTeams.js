/**
 * Frontend Mock Teams Data
 * Realistic teams with varying squad sizes (20, 15, 18, 13 players)
 */

import { MOCK_PLAYERS, CURRENT_MOCK_USER } from './mockPlayers.js';

const buildSquad = (playerIds, captainId) => {
  return playerIds.map((id) => {
    const p = MOCK_PLAYERS.find((item) => item.playerId === id);
    if (!p) return null;
    return {
      id: p.playerId,
      playerId: p.playerId,
      userId: p.playerId,
      playerUid: p.playerUid,
      name: p.name,
      username: p.username.replace('@', ''),
      role: p.role,
      style: p.style,
      isCaptain: p.playerId === captainId,
      status: 'accepted',
      avatar: p.avatar,
    };
  }).filter(Boolean);
};

export const INITIAL_MOCK_TEAMS = [
  {
    id: 'team-001',
    teamId: 'team-001',
    name: 'Warriors XI',
    shortName: 'WX',
    location: 'Gymkhana Grounds, Secunderabad',
    sport: 'Cricket',
    teamType: 'Club',
    ownerId: CURRENT_MOCK_USER.playerId,
    captainId: CURRENT_MOCK_USER.playerId,
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80',
    // 20 players squad
    members: buildSquad(
      [
        'player-001', 'player-002', 'player-003', 'player-004', 'player-005',
        'player-006', 'player-007', 'player-008', 'player-009', 'player-010',
        'player-011', 'player-012', 'player-013', 'player-014', 'player-015',
        'player-016', 'player-017', 'player-018', 'player-019', 'player-020',
      ],
      'player-001'
    ),
  },
  {
    id: 'team-002',
    teamId: 'team-002',
    name: 'Falcons CC',
    shortName: 'FCC',
    location: 'Rajiv Gandhi Stadium, Hyderabad',
    sport: 'Cricket',
    teamType: 'Club',
    ownerId: 'player-002',
    captainId: 'player-002',
    logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&auto=format&fit=crop&q=80',
    // 15 players squad
    members: buildSquad(
      [
        'player-002', 'player-003', 'player-004', 'player-005', 'player-006',
        'player-007', 'player-008', 'player-009', 'player-010', 'player-011',
        'player-012', 'player-013', 'player-014', 'player-015', 'player-016',
      ],
      'player-002'
    ),
  },
  {
    id: 'team-003',
    teamId: 'team-003',
    name: 'Titans Cricket Club',
    shortName: 'TCC',
    location: 'LB Stadium, Hyderabad',
    sport: 'Cricket',
    teamType: 'College',
    ownerId: 'player-003',
    captainId: 'player-003',
    logo: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=150&auto=format&fit=crop&q=80',
    // 18 players squad
    members: buildSquad(
      [
        'player-003', 'player-004', 'player-005', 'player-006', 'player-007',
        'player-008', 'player-009', 'player-010', 'player-011', 'player-012',
        'player-013', 'player-014', 'player-015', 'player-016', 'player-017',
        'player-018', 'player-019', 'player-020',
      ],
      'player-003'
    ),
  },
  {
    id: 'team-004',
    teamId: 'team-004',
    name: 'Hyderabad Strikers',
    shortName: 'HYS',
    location: 'Gachibowli Sports Complex, Hyderabad',
    sport: 'Cricket',
    teamType: 'Turf',
    ownerId: 'player-004',
    captainId: 'player-004',
    logo: 'https://images.unsplash.com/photo-1512719355462-e755517260a0?w=150&auto=format&fit=crop&q=80',
    // 13 players squad
    members: buildSquad(
      [
        'player-004', 'player-005', 'player-006', 'player-007', 'player-008',
        'player-009', 'player-010', 'player-011', 'player-012', 'player-013',
        'player-014', 'player-015', 'player-016',
      ],
      'player-004'
    ),
  },
];
