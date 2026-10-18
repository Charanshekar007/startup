import assert from 'assert';

console.log('===============================================================');
console.log('EZKORA — LIVE SCORE UPDATES SYNCHRONIZATION TEST SUITE');
console.log('Testing Realtime Pub/Sub, Storage Persistence & Spectator Sync');
console.log('===============================================================\n');

// -------------------------------------------------------------
// 1. SIMULATE SHARED PERSISTENCE STORAGE (AsyncStorage Simulation)
// -------------------------------------------------------------
const MATCHES_STORAGE_KEY = '@sports_app_matches_v2';
const mockAsyncStorage = {
  store: new Map(),
  async getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  },
  async setItem(key, value) {
    this.store.set(key, String(value));
  },
  async removeItem(key) {
    this.store.delete(key);
  },
};

// -------------------------------------------------------------
// 2. MATCH CONTEXT SIMULATION (Mirroring MatchContext.js)
// -------------------------------------------------------------
const matchSubscribers = new Map();

function subscribeToMatch(matchId, callback) {
  if (!matchId || typeof callback !== 'function') return () => {};
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  const subs = matchSubscribers.get(matchId);
  subs.add(callback);
  return () => {
    subs.delete(callback);
    if (subs.size === 0) matchSubscribers.delete(matchId);
  };
}

function notifyMatchSubscribers(matchId, matchData) {
  if (!matchId) return;
  const subs = matchSubscribers.get(matchId);
  if (subs && subs.size > 0) {
    subs.forEach((cb) => {
      try {
        cb(matchData);
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }
}

class MatchContextManager {
  constructor() {
    this.matches = [];
  }

  async init(initialMatches = []) {
    this.matches = initialMatches;
    await mockAsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(initialMatches));
  }

  async updateMatch(matchId, updatedFields) {
    let updatedTarget = null;
    let nextMatches = [];

    const existingIdx = this.matches.findIndex((m) => m.id === matchId);
    if (existingIdx !== -1) {
      nextMatches = this.matches.map((m, idx) => {
        if (idx === existingIdx) {
          const merged = { ...m, ...updatedFields, updatedAt: new Date().toISOString() };
          updatedTarget = merged;
          return merged;
        }
        return m;
      });
    } else {
      updatedTarget = { id: matchId, ...updatedFields, updatedAt: new Date().toISOString() };
      nextMatches = [updatedTarget, ...this.matches];
    }

    // Await persistence BEFORE updating local state
    await mockAsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(nextMatches));
    this.matches = nextMatches;

    // Notify real-time pub/sub subscribers
    notifyMatchSubscribers(matchId, updatedTarget);
    return updatedTarget;
  }

  async refreshMatchFromStorage(matchId) {
    const raw = await mockAsyncStorage.getItem(MATCHES_STORAGE_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw);
    const found = list.find((m) => m.id === matchId);
    if (found) {
      notifyMatchSubscribers(matchId, found);
    }
    return found;
  }
}

// -------------------------------------------------------------
// 3. SCORER & SPECTATOR CLIENT SIMULATION (Mirroring LiveScoringScreen.js)
// -------------------------------------------------------------
class LiveScoringClient {
  constructor({ id, matchId, isAuthorizedScorer, isSpectatorMode, user, contextManager }) {
    this.clientId = id;
    this.matchId = matchId;
    this.isAuthorizedScorer = isAuthorizedScorer;
    this.isSpectatorMode = isSpectatorMode;
    this.user = user;
    this.contextManager = contextManager;

    // Delivery sequence tracker & idempotency guards
    this.deliverySequence = 0;
    this.lastAppliedSequence = 0;
    this.lastAppliedTimestamp = 0;

    // Live state
    this.liveState = {
      totalRuns: 0,
      totalWickets: 0,
      currentOverNumber: 0,
      legalBalls: 0,
      currentInnings: 1,
      targetRuns: null,
      striker: { id: 'p1', name: 'Rohit Sharma', runs: 0, balls: 0, fours: 0, sixes: 0 },
      nonStriker: { id: 'p2', name: 'KL Rahul', runs: 0, balls: 0, fours: 0, sixes: 0 },
      bowler: { id: 'b1', name: 'Mitchell Starc', runs: 0, overs: '0.0', wickets: 0, ballsThisOver: [] },
      commentary: [],
      pastOvers: [],
      status: 'Live',
    };

    this.updatesReceivedCount = 0;
    this.unsubscribe = null;
    this.isPollingActive = false;
  }

  mount() {
    // 1. Subscribe to realtime pub/sub
    this.unsubscribe = subscribeToMatch(this.matchId, (matchData) => {
      this.handleMatchUpdate(matchData, 'realtime_subscription');
    });

    // 2. Fetch fresh initial state
    this.contextManager.refreshMatchFromStorage(this.matchId).then((fresh) => {
      if (fresh) this.handleMatchUpdate(fresh, 'initial_mount');
    });
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isPollingActive = false;
  }

  handleMatchUpdate(matchData, source) {
    if (!matchData) return;
    const incomingLive = matchData.liveState || matchData;

    const incomingSeq = incomingLive.sequenceNumber || matchData.deliverySequence || 0;
    const incomingTs = matchData.updatedAt ? new Date(matchData.updatedAt).getTime() : 0;

    const isCompleted = matchData.status === 'Completed' || incomingLive.status === 'Completed';

    // Idempotency check: Ignore stale or already applied updates (unless match is completed)
    if (!isCompleted) {
      if (incomingSeq > 0 && incomingSeq <= this.lastAppliedSequence) {
        return; // Already applied
      }
      if (incomingSeq === 0 && (this.lastAppliedSequence > 0 || (incomingTs > 0 && incomingTs <= this.lastAppliedTimestamp))) {
        return; // Stale timestamp or unsequenced older update
      }
    }

    if (incomingSeq > 0) this.lastAppliedSequence = incomingSeq;
    if (incomingTs > 0) this.lastAppliedTimestamp = incomingTs;

    // Apply live state
    this.applyLiveState(incomingLive);
    if (matchData.status) this.liveState.status = matchData.status;
    this.updatesReceivedCount++;
  }

  applyLiveState(data) {
    if (data.totalRuns !== undefined) this.liveState.totalRuns = data.totalRuns;
    if (data.totalWickets !== undefined) this.liveState.totalWickets = data.totalWickets;
    if (data.currentOverNumber !== undefined) this.liveState.currentOverNumber = data.currentOverNumber;
    if (data.legalBalls !== undefined) this.liveState.legalBalls = data.legalBalls;
    if (data.striker) this.liveState.striker = { ...data.striker };
    if (data.nonStriker) this.liveState.nonStriker = { ...data.nonStriker };
    if (data.bowler) this.liveState.bowler = { ...data.bowler };
    if (data.commentary) this.liveState.commentary = [...data.commentary];
    if (data.status) this.liveState.status = data.status;
  }

  assertScorerPermission() {
    if (!this.isAuthorizedScorer || this.isSpectatorMode) {
      return false;
    }
    return true;
  }

  async recordDelivery({ runs = 0, isExtra = false, extraType = null, isWicket = false, wicketType = null }) {
    if (!this.assertScorerPermission()) {
      throw new Error('PERMISSION_DENIED: Spectators cannot score or modify deliveries');
    }

    this.deliverySequence += 1;
    const seq = this.deliverySequence;

    // Calculate updated state
    let runsScored = runs;
    let extraRuns = 0;
    let countsAsLegalBall = true;

    if (isExtra) {
      if (extraType === 'wide' || extraType === 'noball') {
        extraRuns = 1;
        countsAsLegalBall = false;
      }
    }

    const totalDeliveryRuns = runsScored + extraRuns;
    const newTotalRuns = this.liveState.totalRuns + totalDeliveryRuns;
    let newLegalBalls = this.liveState.legalBalls;
    let newOverNumber = this.liveState.currentOverNumber;

    if (countsAsLegalBall) {
      newLegalBalls += 1;
      if (newLegalBalls >= 6) {
        newLegalBalls = 0;
        newOverNumber += 1;
      }
    }

    let newTotalWickets = this.liveState.totalWickets;
    if (isWicket) {
      newTotalWickets += 1;
    }

    const striker = { ...this.liveState.striker };
    if (!isExtra || extraType === 'noball') {
      striker.runs += runsScored;
      if (countsAsLegalBall) striker.balls += 1;
      if (runsScored === 4) striker.fours += 1;
      if (runsScored === 6) striker.sixes += 1;
    }

    const bowler = { ...this.liveState.bowler };
    bowler.runs += totalDeliveryRuns;
    if (isWicket && wicketType !== 'runout') bowler.wickets += 1;

    const commEntry = {
      ballText: `${newOverNumber}.${newLegalBalls}`,
      runs: totalDeliveryRuns,
      text: isWicket
        ? `OUT! ${striker.name} dismissed (${wicketType})`
        : isExtra
        ? `${extraType.toUpperCase()} + ${runsScored} run(s)`
        : `${runsScored} run(s) scored by ${striker.name}`,
      timestamp: Date.now(),
    };

    const newCommentary = [commEntry, ...this.liveState.commentary];

    // Local state update
    this.liveState.totalRuns = newTotalRuns;
    this.liveState.totalWickets = newTotalWickets;
    this.liveState.currentOverNumber = newOverNumber;
    this.liveState.legalBalls = newLegalBalls;
    this.liveState.striker = striker;
    this.liveState.bowler = bowler;
    this.liveState.commentary = newCommentary;
    this.lastAppliedSequence = seq;

    // Build complete match payload
    const snapshot = {
      ...this.liveState,
      sequenceNumber: seq,
      oversDisplay: `${newOverNumber}.${newLegalBalls}`,
    };

    // Await persistence to database/storage source of truth
    await this.contextManager.updateMatch(this.matchId, {
      scoreA: `${newTotalRuns}/${newTotalWickets}`,
      oversA: `${newOverNumber}.${newLegalBalls} Ov`,
      totalRuns: newTotalRuns,
      totalWickets: newTotalWickets,
      deliverySequence: seq,
      liveState: snapshot,
    });

    return snapshot;
  }
}

// -------------------------------------------------------------
// TEST EXECUTION
// -------------------------------------------------------------
async function runTests() {
  const matchId = 'match_ezkora_live_999';
  const contextManager = new MatchContextManager();

  await contextManager.init([
    {
      id: matchId,
      teamA: 'Bangalore Tigers',
      teamB: 'Chennai Super Kings',
      scoreA: '0/0',
      oversA: '0.0 Ov',
      totalRuns: 0,
      totalWickets: 0,
      status: 'Live',
      creatorId: 'usr_scorer_01',
      createdBy: 'usr_scorer_01',
      scorerId: 'usr_scorer_01',
    },
  ]);

  // Session 1: Authorized Scorer
  const scorerSession = new LiveScoringClient({
    id: 'session_scorer',
    matchId,
    isAuthorizedScorer: true,
    isSpectatorMode: false,
    user: { id: 'usr_scorer_01', name: 'Official Scorer' },
    contextManager,
  });

  // Session 2: Spectator View
  const spectatorSession = new LiveScoringClient({
    id: 'session_spectator',
    matchId,
    isAuthorizedScorer: false,
    isSpectatorMode: true,
    user: { id: 'usr_fan_99', name: 'Cricket Fan' },
    contextManager,
  });

  scorerSession.mount();
  spectatorSession.mount();
  await new Promise((r) => setTimeout(r, 20));

  console.log('✓ Initialized Scorer and Spectator sessions connected to shared match:', matchId);

  // -------------------------------------------------------------
  // STEP 4A & 4B: Record Legal Delivery & Verify Persistence
  // -------------------------------------------------------------
  console.log('\n--- Step 4A & 4B: Authorized Scorer records 1 legal delivery (1 run) ---');
  await scorerSession.recordDelivery({ runs: 1 });

  // Verify in Scorer local state
  assert.strictEqual(scorerSession.liveState.totalRuns, 1, 'Scorer total runs must be 1');
  assert.strictEqual(scorerSession.liveState.legalBalls, 1, 'Scorer legal balls must be 1');
  assert.strictEqual(scorerSession.liveState.currentOverNumber, 0, 'Scorer over number must be 0');

  // Verify in Shared Storage
  const storedJson = await mockAsyncStorage.getItem(MATCHES_STORAGE_KEY);
  const storedMatches = JSON.parse(storedJson);
  const persistedMatch = storedMatches.find((m) => m.id === matchId);

  assert.ok(persistedMatch, 'Match must exist in storage');
  assert.strictEqual(persistedMatch.scoreA, '1/0', 'Persisted scoreA must be 1/0');
  assert.strictEqual(persistedMatch.oversA, '0.1 Ov', 'Persisted oversA must be 0.1 Ov');
  assert.strictEqual(persistedMatch.deliverySequence, 1, 'Delivery sequence must be 1');
  console.log('✓ Delivery 1 correctly persisted to AsyncStorage with sequence 1');

  // -------------------------------------------------------------
  // STEP 4C: Spectator receives updated score, overs, commentary without refresh
  // -------------------------------------------------------------
  console.log('\n--- Step 4C: Verify Spectator automatically synchronizes ---');
  assert.strictEqual(spectatorSession.liveState.totalRuns, 1, 'Spectator must see 1 run');
  assert.strictEqual(spectatorSession.liveState.legalBalls, 1, 'Spectator must see ball 1');
  assert.strictEqual(spectatorSession.liveState.striker.runs, 1, 'Spectator must see striker on 1 run');
  assert.strictEqual(spectatorSession.liveState.commentary.length, 1, 'Spectator must have 1 commentary entry');
  assert.ok(spectatorSession.liveState.commentary[0].text.includes('1 run(s) scored'), 'Commentary must reflect delivery');
  console.log('✓ Spectator received updated score (1/0, 0.1 ov) and commentary automatically');

  // -------------------------------------------------------------
  // STEP 4D: Record 2nd delivery & verify it appears exactly once
  // -------------------------------------------------------------
  console.log('\n--- Step 4D: Record 2nd delivery (4 runs) and verify idempotency ---');
  const prevUpdateCount = spectatorSession.updatesReceivedCount;
  await scorerSession.recordDelivery({ runs: 4 });

  // Simulate concurrent storage polling firing simultaneously with pub/sub
  await contextManager.refreshMatchFromStorage(matchId);

  assert.strictEqual(spectatorSession.liveState.totalRuns, 5, 'Score must be 5 (1 + 4)');
  assert.strictEqual(spectatorSession.liveState.legalBalls, 2, 'Overs must be 0.2');
  assert.strictEqual(spectatorSession.liveState.striker.runs, 5, 'Striker runs must be 5');
  assert.strictEqual(spectatorSession.liveState.striker.fours, 1, 'Striker fours must be 1');
  assert.strictEqual(spectatorSession.liveState.commentary.length, 2, 'Commentary must have exactly 2 entries (no duplicates)');
  console.log('✓ Delivery 2 appears exactly once (5/0, 0.2 ov). Idempotency guard prevented double count.');

  // -------------------------------------------------------------
  // STEP 4E: Extras and Wicket testing
  // -------------------------------------------------------------
  console.log('\n--- Step 4E: Extras (Wide) and Wicket testing ---');

  // 1. Wide delivery (+1 run, legal ball count unchanged)
  await scorerSession.recordDelivery({ runs: 0, isExtra: true, extraType: 'wide' });
  assert.strictEqual(spectatorSession.liveState.totalRuns, 6, 'Score must be 6 after wide');
  assert.strictEqual(spectatorSession.liveState.legalBalls, 2, 'Legal ball count must remain 2 after wide');
  console.log('✓ Wide delivery handled correctly (+1 run, ball count unchanged at 0.2 ov)');

  // 2. Wicket (Bowled, striker dismissed)
  await scorerSession.recordDelivery({ runs: 0, isWicket: true, wicketType: 'bowled' });
  assert.strictEqual(spectatorSession.liveState.totalRuns, 6, 'Score remains 6');
  assert.strictEqual(spectatorSession.liveState.totalWickets, 1, 'Wickets must be 1');
  assert.strictEqual(spectatorSession.liveState.legalBalls, 3, 'Legal balls must advance to 3');
  assert.strictEqual(spectatorSession.liveState.commentary[0].text, 'OUT! Rohit Sharma dismissed (bowled)');
  console.log('✓ Wicket recorded and synchronized to spectator (6/1, 0.3 ov, commentary: OUT)');

  // -------------------------------------------------------------
  // STEP 4F: Connectivity Interrupt & Catch-up Test
  // -------------------------------------------------------------
  console.log('\n--- Step 4F: Simulate Network Disconnect & Catch-up on Reconnect ---');
  // Disconnect spectator (e.g. app went to background or packet drop)
  spectatorSession.unmount();
  console.log('  [Spectator offline/backgrounded]');

  // Scorer scores 2 deliveries while spectator is offline
  await scorerSession.recordDelivery({ runs: 2 });
  await scorerSession.recordDelivery({ runs: 1 });

  // Spectator reconnects (e.g. returns to foreground)
  spectatorSession.mount();
  // Allow async mount catch-up
  await new Promise((r) => setTimeout(r, 50));

  assert.strictEqual(spectatorSession.liveState.totalRuns, 9, 'Spectator caught up to 9 runs');
  assert.strictEqual(spectatorSession.liveState.legalBalls, 5, 'Spectator caught up to 0.5 overs');
  assert.strictEqual(spectatorSession.liveState.commentary.length, 6, 'Spectator caught up to 6 deliveries');
  console.log('✓ Spectator successfully caught up on reconnect to latest persisted state (9/1, 0.5 ov, 6 deliveries)');

  // -------------------------------------------------------------
  // STEP 4G: Permissions Guard — Spectator cannot mutate scores
  // -------------------------------------------------------------
  console.log('\n--- Step 4G: Permissions Guard — Spectator mutation block ---');
  let spectatorError = null;
  try {
    await spectatorSession.recordDelivery({ runs: 6 });
  } catch (err) {
    spectatorError = err.message;
  }
  assert.ok(spectatorError, 'Spectator mutation must throw an error');
  assert.ok(spectatorError.includes('PERMISSION_DENIED'), 'Error must be PERMISSION_DENIED');
  assert.strictEqual(scorerSession.liveState.totalRuns, 9, 'Score in match must remain untouched at 9');
  console.log('✓ Spectator mutation strictly blocked by permission guard');

  // -------------------------------------------------------------
  // STEP 4H: Match Completion Handling
  // -------------------------------------------------------------
  console.log('\n--- Step 4H: Completed matches stop being live & retain final score ---');
  await contextManager.updateMatch(matchId, {
    status: 'Completed',
    matchResult: 'Bangalore Tigers won by 4 runs',
    winner: 'Bangalore Tigers',
  });

  const finalMatch = await contextManager.refreshMatchFromStorage(matchId);
  assert.strictEqual(finalMatch.status, 'Completed', 'Match status must be Completed');
  assert.strictEqual(spectatorSession.liveState.status, 'Completed', 'Spectator must see Completed');
  console.log('✓ Match marked Completed, stops being live, retains final score');

  console.log('\n===============================================================');
  console.log('ALL SYNCHRONIZATION TESTS PASSED SUCCESSFULLY! (8/8 Verified)');
  console.log('===============================================================');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
