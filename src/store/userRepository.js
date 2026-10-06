import AsyncStorageRaw from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;

export const USERS_STORAGE_KEY = '@sports_app_registered_users';

/**
 * Generate a standard public Player UID (e.g. SP-7K4M-92QX)
 * Safe format: SP-XXXX-XXXX using unambiguous uppercase alphanumeric chars.
 */
export function generatePlayerUid() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SP-${p1}-${p2}`;
}

// Pre-seeded users with public Player UIDs
export const DEFAULT_USERS = [
  {
    id: 'usr_arjun123',
    playerUid: 'SP-7K4M-92QX',
    account: {
      id: 'usr_arjun123',
      playerUid: 'SP-7K4M-92QX',
      name: 'Arjun',
      username: 'arjun123',
      email: 'arjun@test.com',
      password: 'password123',
      location: 'Hyderabad, India',
      avatar: 'https://ui-avatars.com/api/?name=Arjun&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_arjun_cricket',
        sport: 'Cricket',
        role: 'Batsman',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        experience: 'College',
        primaryTeam: 'Warriors XI',
        teams: [{ name: 'Warriors XI', location: 'Hyderabad, India' }],
        interests: ['Matches', 'Tournaments'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_rahul123',
    playerUid: 'SP-8R2L-44WK',
    account: {
      id: 'usr_rahul123',
      playerUid: 'SP-8R2L-44WK',
      name: 'Rahul Kumar',
      username: 'rahulk',
      email: 'rahul@test.com',
      password: 'password123',
      location: 'Bengaluru, India',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_rahul_cricket',
        sport: 'Cricket',
        role: 'All-Rounder',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'Club • Turf',
        primaryTeam: 'Falcons CC',
        teams: [{ name: 'Falcons CC', location: 'Bengaluru, India' }],
        interests: ['Matches', 'Tournaments', 'Stats & Analytics'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_player101',
    playerUid: 'SP-9P1M-101X',
    account: {
      id: 'usr_player101',
      playerUid: 'SP-9P1M-101X',
      name: 'Star Player',
      username: 'star_player',
      email: 'player@test.com',
      password: 'password123',
      location: 'Hyderabad, India',
      avatar: 'https://ui-avatars.com/api/?name=Star+Player&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_player_cricket',
        sport: 'Cricket',
        role: 'Batter',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'Advanced',
        primaryTeam: 'My Local Club',
        teams: [{ name: 'My Local Club', location: 'City' }],
        interests: ['Matches', 'Stats & Analytics'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_kiran_p',
    playerUid: 'SP-KIRN-2026',
    account: {
      id: 'usr_kiran_p',
      playerUid: 'SP-KIRN-2026',
      name: 'Kiran Patel',
      username: 'kiranp',
      email: 'kiran@test.com',
      password: 'password123',
      location: 'Hyderabad, India',
      avatar: 'https://ui-avatars.com/api/?name=Kiran+Patel&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_kiran_cricket',
        sport: 'Cricket',
        role: 'Batter',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        experience: 'Club',
        primaryTeam: 'Warriors XI',
        teams: [{ name: 'Warriors XI', location: 'Hyderabad, India' }],
        interests: ['Matches'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_rohit_s',
    playerUid: 'SP-ROHT-4545',
    account: {
      id: 'usr_rohit_s',
      playerUid: 'SP-ROHT-4545',
      name: 'Rohit Sharma',
      username: 'rohit_s',
      email: 'rohit@test.com',
      password: 'password123',
      location: 'Mumbai, India',
      avatar: 'https://ui-avatars.com/api/?name=Rohit+Sharma&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_rohit_cricket',
        sport: 'Cricket',
        role: 'Opening Batter',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'Professional',
        primaryTeam: 'Warriors XI',
        teams: [{ name: 'Warriors XI', location: 'Mumbai, India' }],
        interests: ['Matches', 'Tournaments'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_charan_s',
    playerUid: 'SP-CHRN-0077',
    account: {
      id: 'usr_charan_s',
      playerUid: 'SP-CHRN-0077',
      name: 'Charan Shekar',
      username: 'charan_s',
      email: 'charan@test.com',
      password: 'password123',
      location: 'Hyderabad, India',
      avatar: 'https://ui-avatars.com/api/?name=Charan+Shekar&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_charan_cricket',
        sport: 'Cricket',
        role: 'Captain / All Rounder',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Fast Medium',
        experience: 'Club Captain',
        primaryTeam: 'Warriors XI',
        teams: [{ name: 'Warriors XI', location: 'Hyderabad, India' }],
        interests: ['Matches', 'Tournaments', 'Stats & Analytics'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_virat_k',
    playerUid: 'SP-VIRT-1818',
    account: {
      id: 'usr_virat_k',
      playerUid: 'SP-VIRT-1818',
      name: 'Virat Kohli',
      username: 'virat_k',
      email: 'virat@test.com',
      password: 'password123',
      location: 'Delhi, India',
      avatar: 'https://ui-avatars.com/api/?name=Virat+Kohli&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_virat_cricket',
        sport: 'Cricket',
        role: 'Top-Order Batter',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'International',
        primaryTeam: 'Falcons CC',
        teams: [{ name: 'Falcons CC', location: 'Bengaluru, India' }],
        interests: ['Matches', 'Tournaments'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_jasprit_b',
    playerUid: 'SP-BUMR-9393',
    account: {
      id: 'usr_jasprit_b',
      playerUid: 'SP-BUMR-9393',
      name: 'Jasprit Bumrah',
      username: 'bumrah_j',
      email: 'bumrah@test.com',
      password: 'password123',
      location: 'Ahmedabad, India',
      avatar: 'https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_bumrah_cricket',
        sport: 'Cricket',
        role: 'Bowler',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast',
        experience: 'Professional',
        primaryTeam: 'Falcons CC',
        teams: [{ name: 'Falcons CC', location: 'Ahmedabad, India' }],
        interests: ['Matches'],
      },
    ],
    activeSport: 'Cricket',
  },
  {
    id: 'usr_ravindra_j',
    playerUid: 'SP-JADD-0808',
    account: {
      id: 'usr_ravindra_j',
      playerUid: 'SP-JADD-0808',
      name: 'Ravindra Jadeja',
      username: 'jaddu_r',
      email: 'jadeja@test.com',
      password: 'password123',
      location: 'Jamnagar, India',
      avatar: 'https://ui-avatars.com/api/?name=Ravindra+Jadeja&background=1e3a29&color=23c55e',
      followers: 0,
      following: 0,
      posts: 0,
    },
    sportProfiles: [
      {
        id: 'prof_jadeja_cricket',
        sport: 'Cricket',
        role: 'All Rounder',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Slow Left-Arm',
        experience: 'Professional',
        primaryTeam: 'Warriors XI',
        teams: [{ name: 'Warriors XI', location: 'Jamnagar, India' }],
        interests: ['Matches'],
      },
    ],
    activeSport: 'Cricket',
  },
];

/**
 * Fetch all registered users from AsyncStorage.
 * Initializes storage with default seed users if empty.
 */
export async function getRegisteredUsers() {
  try {
    const raw = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }

    let needsResave = false;

    // Ensure all users have public playerUid
    for (const u of parsed) {
      if (!u.playerUid || !u.account?.playerUid) {
        const uid = u.playerUid || u.account?.playerUid || generatePlayerUid();
        u.playerUid = uid;
        if (u.account) u.account.playerUid = uid;
        needsResave = true;
      }
    }

    // Ensure default test accounts exist
    for (const defUser of DEFAULT_USERS) {
      const existing = parsed.find(
        (u) =>
          u.id === defUser.id ||
          u.account?.username?.toLowerCase() === defUser.account?.username?.toLowerCase() ||
          u.account?.email?.toLowerCase() === defUser.account?.email?.toLowerCase()
      );
      if (!existing) {
        parsed.push(defUser);
        needsResave = true;
      } else {
        if (!existing.playerUid && defUser.playerUid) {
          existing.playerUid = defUser.playerUid;
          if (existing.account) existing.account.playerUid = defUser.playerUid;
          needsResave = true;
        }
      }
    }

    if (needsResave) {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (error) {
    console.error('Error fetching registered users:', error);
    return DEFAULT_USERS;
  }
}

/**
 * Get a user by unique internal database ID
 */
export async function getUserById(userId) {
  if (!userId) return null;
  const users = await getRegisteredUsers();
  return users.find((u) => u.id === userId || u.account?.id === userId) || null;
}

/**
 * Search and find a player by their public Player UID (e.g. SP-7K4M-92QX)
 * Safe, case-insensitive, ignores spacing.
 */
export async function getUserByPlayerUid(playerUid) {
  if (!playerUid) return null;
  const cleanUid = String(playerUid).trim().toUpperCase().replace(/\s+/g, '');
  const users = await getRegisteredUsers();

  return (
    users.find((u) => {
      const uUid = (u.playerUid || u.account?.playerUid || '').trim().toUpperCase().replace(/\s+/g, '');
      return uUid === cleanUid;
    }) || null
  );
}

/**
 * Authenticate or find user by username or email
 */
export async function getUserByCredentials(identifier, password) {
  if (!identifier) return null;
  const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
  const users = await getRegisteredUsers();

  const user = users.find((u) => {
    const email = u.account?.email?.toLowerCase() || '';
    const username = u.account?.username?.toLowerCase().replace(/^@/, '') || '';
    return email === cleanId || username === cleanId;
  });

  if (!user) return null;

  // If a password was provided, check it (allow login if matches or if testing mock)
  if (password && user.account?.password && user.account.password !== password) {
    return null;
  }

  return user;
}

/**
 * Save or insert a new user into persistent storage
 */
export async function saveUser(userData) {
  try {
    const users = await getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) =>
        u.id === userData.id ||
        (userData.account?.email && u.account?.email?.toLowerCase() === userData.account.email.toLowerCase()) ||
        (userData.account?.username && u.account?.username?.toLowerCase() === userData.account.username.toLowerCase())
    );

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      users.unshift(userData);
    }

    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return userData;
  } catch (error) {
    console.error('Error saving user to storage:', error);
    throw error;
  }
}

/**
 * Update an existing user's profile and persist changes
 */
export async function updateUserProfile(userId, partialAccount, partialSportProfile) {
  try {
    const users = await getRegisteredUsers();
    const index = users.findIndex((u) => u.id === userId || u.account?.id === userId);

    if (index === -1) {
      console.warn(`User with ID ${userId} not found for update`);
      return null;
    }

    const current = users[index];
    const updatedAccount = { ...current.account, ...partialAccount };

    let updatedProfiles = current.sportProfiles || [];
    if (partialSportProfile) {
      const activeSport = partialSportProfile.sport || current.activeSport || 'Cricket';
      const pIndex = updatedProfiles.findIndex((p) => p.sport === activeSport);
      if (pIndex >= 0) {
        updatedProfiles[pIndex] = { ...updatedProfiles[pIndex], ...partialSportProfile };
      } else {
        updatedProfiles.push({
          id: 'prof_' + Math.random().toString(36).substr(2, 9),
          sport: activeSport,
          ...partialSportProfile,
        });
      }
    }

    const updatedUser = {
      ...current,
      account: updatedAccount,
      sportProfiles: updatedProfiles,
    };

    users[index] = updatedUser;
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
