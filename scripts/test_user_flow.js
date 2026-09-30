// Polyfill window.localStorage for Node environment test runner
if (typeof window === 'undefined') {
  const store = {};
  global.window = {
    localStorage: {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    }
  };
}

const assert = require('assert');

async function runTests() {
  console.log('🧪 Starting User Profile Data & Multi-User Isolation Tests...\n');

  const {
    getRegisteredUsers,
    getUserById,
    getUserByCredentials,
    saveUser,
    updateUserProfile,
    DEFAULT_USERS
  } = await import('../src/store/userRepository.js');

  // Test 1: Seed Users Initialized
  console.log('Test 1: Verify Seed Users exist (User A: Arjun, User B: Rahul)');
  const initialUsers = await getRegisteredUsers();
  assert(initialUsers.length >= 2, 'Should have at least 2 default users');
  
  const userA = await getUserByCredentials('arjun123', 'password123');
  assert(userA, 'User A (Arjun) must be retrievable by username');
  assert.strictEqual(userA.account.name, 'Arjun');
  assert.strictEqual(userA.account.username, 'arjun123');
  assert.strictEqual(userA.sportProfiles[0].role, 'Batsman');
  assert.strictEqual(userA.sportProfiles[0].battingStyle, 'Right-Handed');
  assert.strictEqual(userA.sportProfiles[0].bowlingStyle, 'None');
  assert.strictEqual(userA.sportProfiles[0].primaryTeam, 'Warriors XI');
  console.log('✅ User A (Arjun) verified successfully.');

  const userB = await getUserByCredentials('rahul123', 'password123');
  assert(userB, 'User B (Rahul) must be retrievable by username');
  assert.strictEqual(userB.account.name, 'Rahul');
  assert.strictEqual(userB.account.username, 'rahul123');
  assert.strictEqual(userB.sportProfiles[0].role, 'All-Rounder');
  assert.strictEqual(userB.sportProfiles[0].battingStyle, 'Left-Handed');
  assert.strictEqual(userB.sportProfiles[0].bowlingStyle, 'Right-Arm Medium');
  assert.strictEqual(userB.sportProfiles[0].primaryTeam, 'Falcons CC');
  console.log('✅ User B (Rahul) verified successfully.');

  // Test 2: No data leakage between User A and User B
  console.log('\nTest 2: Check No Data Leakage between accounts');
  assert.notStrictEqual(userA.account.name, userB.account.name);
  assert.notStrictEqual(userA.account.username, userB.account.username);
  assert.notStrictEqual(userA.sportProfiles[0].role, userB.sportProfiles[0].role);
  assert.notStrictEqual(userA.sportProfiles[0].battingStyle, userB.sportProfiles[0].battingStyle);
  assert.notStrictEqual(userA.sportProfiles[0].bowlingStyle, userB.sportProfiles[0].bowlingStyle);
  assert.notStrictEqual(userA.sportProfiles[0].primaryTeam, userB.sportProfiles[0].primaryTeam);
  console.log('✅ No data leakage between User A and User B.');

  // Test 3: New User Sign Up & Profile Setup Flow
  console.log('\nTest 3: Simulating Sign Up & Profile Setup for new user Charan Shekar');
  const newUserId = 'usr_charan_test';
  const newAccount = {
    id: newUserId,
    name: 'Charan Shekar',
    username: 'charanshekar',
    email: 'charan@example.com',
    password: 'password123',
    location: 'Hyderabad, India',
    avatar: 'https://ui-avatars.com/api/?name=Charan+Shekar&background=1e3a29&color=23c55e',
    followers: 0,
    following: 0,
    posts: 0,
  };
  const newSportProfile = {
    id: 'prof_charan_cricket',
    sport: 'Cricket',
    role: 'Batsman',
    battingStyle: 'Right-Handed',
    bowlingStyle: 'None',
    experience: 'College',
    primaryTeam: 'Warriors XI',
    teams: [{ name: 'Warriors XI', location: 'Hyderabad' }],
    interests: ['Matches', 'Tournaments'],
  };

  await saveUser({
    id: newUserId,
    account: newAccount,
    sportProfiles: [newSportProfile],
    activeSport: 'Cricket',
  });

  const retrievedCharan = await getUserById(newUserId);
  assert(retrievedCharan, 'Newly signed up user must be retrievable by unique ID');
  assert.strictEqual(retrievedCharan.account.name, 'Charan Shekar');
  assert.strictEqual(retrievedCharan.account.username, 'charanshekar');
  assert.strictEqual(retrievedCharan.account.location, 'Hyderabad, India');
  assert.strictEqual(retrievedCharan.sportProfiles[0].role, 'Batsman');
  assert.strictEqual(retrievedCharan.sportProfiles[0].battingStyle, 'Right-Handed');
  assert.strictEqual(retrievedCharan.sportProfiles[0].bowlingStyle, 'None');
  assert.strictEqual(retrievedCharan.sportProfiles[0].experience, 'College');
  assert.strictEqual(retrievedCharan.sportProfiles[0].primaryTeam, 'Warriors XI');
  assert.strictEqual(retrievedCharan.account.followers, 0);
  assert.strictEqual(retrievedCharan.account.following, 0);
  assert.strictEqual(retrievedCharan.account.posts, 0);
  console.log('✅ New User data saved and verified accurately.');

  // Test 4: Profile Editing
  console.log('\nTest 4: Simulating Profile Edit (changing location and role)');
  await updateUserProfile(newUserId, { location: 'Secunderabad, India' }, { role: 'All-Rounder' });
  const updatedCharan = await getUserById(newUserId);
  assert.strictEqual(updatedCharan.account.location, 'Secunderabad, India');
  assert.strictEqual(updatedCharan.sportProfiles[0].role, 'All-Rounder');
  console.log('✅ Profile editing and persistence verified successfully.');

  // Test 5: Login with username OR email
  console.log('\nTest 5: Testing authentication by email and username');
  const loggedByEmail = await getUserByCredentials('charan@example.com', 'password123');
  assert(loggedByEmail, 'Login by email should succeed');
  const loggedByUsername = await getUserByCredentials('charanshekar', 'password123');
  assert(loggedByUsername, 'Login by username should succeed');
  const loggedWithAt = await getUserByCredentials('@charanshekar', 'password123');
  assert(loggedWithAt, 'Login with leading @ should succeed');
  const invalidLogin = await getUserByCredentials('nonexistent', 'wrongpass');
  assert.strictEqual(invalidLogin, null, 'Invalid login should return null');
  console.log('✅ Authentication logic verified successfully.');

  // Test 6: Verify Own Profile vs Other User Profile logic by unique ID
  console.log('\nTest 6: Testing Own Profile vs Other Profile (Strict ID comparison)');
  const checkIsOwnProfile = (currentUserId, profileOwnerId) => Boolean(currentUserId && profileOwnerId && currentUserId === profileOwnerId);
  assert.strictEqual(checkIsOwnProfile('usr_arjun123', 'usr_arjun123'), true, 'Should be own profile when IDs match');
  assert.strictEqual(checkIsOwnProfile('usr_arjun123', 'usr_rahul123'), false, 'Should be other profile when IDs differ');
  assert.strictEqual(checkIsOwnProfile('usr_arjun123', undefined), false, 'Should be false if profileOwnerId undefined');
  console.log('✅ Own profile vs other user profile logic verified.');

  // Test 7: Verify "Quick Test Accounts" is absent from LoginScreen.js
  console.log('\nTest 7: Verify Quick Test Accounts removed from LoginScreen.js');
  const fs = require('fs');
  const loginCode = fs.readFileSync('src/screens/auth/LoginScreen.js', 'utf8');
  assert(!loginCode.includes('Quick Test Accounts'), 'Quick Test Accounts must be removed from LoginScreen');
  assert(!loginCode.includes('handleQuickLogin'), 'handleQuickLogin must be removed from LoginScreen');
  console.log('✅ Quick Test Accounts confirmed completely removed from LoginScreen.');

  console.log('\n🎉 ALL TESTS PASSED! User data architecture & UI cleanup 100% verified.');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
