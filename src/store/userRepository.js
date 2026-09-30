import AsyncStorageRaw from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;

export const USERS_STORAGE_KEY = '@sports_app_registered_users';

// Pre-seeded users as specified in Acceptance Criteria (Section 23 of task)
export const DEFAULT_USERS = [
  {
    id: 'usr_arjun123',
    account: {
      id: 'usr_arjun123',
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
    account: {
      id: 'usr_rahul123',
      name: 'Rahul',
      username: 'rahul123',
      email: 'rahul@test.com',
      password: 'password123',
      location: 'Bengaluru, India',
      avatar: 'https://ui-avatars.com/api/?name=Rahul&background=1e3a29&color=23c55e',
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
    account: {
      id: 'usr_player101',
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

    // Ensure default test accounts (User A & User B) exist for verification
    let needsResave = false;
    for (const defUser of DEFAULT_USERS) {
      const exists = parsed.some(
        (u) =>
          u.id === defUser.id ||
          u.account?.username?.toLowerCase() === defUser.account?.username?.toLowerCase() ||
          u.account?.email?.toLowerCase() === defUser.account?.email?.toLowerCase()
      );
      if (!exists) {
        parsed.push(defUser);
        needsResave = true;
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
 * Get a user by unique ID
 */
export async function getUserById(userId) {
  if (!userId) return null;
  const users = await getRegisteredUsers();
  return users.find((u) => u.id === userId || u.account?.id === userId) || null;
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
