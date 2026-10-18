/**
 * taskRecovery.js
 * 
 * Centralized utility for EZKORA's "Pick Up Where You Left Off" system:
 * Evaluates current user's state across matches and tournaments to determine
 * the single most relevant resumable task with deterministic priority:
 * 1. Unfinished Live Match (in progress)
 * 2. Unfinished Tournament Creation Draft
 * 3. Next Tournament Fixture ready to be played
 */

import { getTournaments } from '../store/tournamentRepository.js';

function getStepTitle(step) {
  switch (step) {
    case 1:
      return 'Tournament Details';
    case 2:
      return 'Rules & Playing Conditions';
    case 3:
      return 'Teams & Registration';
    case 4:
      return 'Competition Format';
    case 5:
      return 'Fixtures & Schedule';
    case 6:
      return 'Review & Publish';
    default:
      return 'Tournament Setup';
  }
}

/**
 * Get the single most relevant active unfinished task for the current user
 */
export function getActiveRecoveryTask({ currentUserId, tournaments = [], matches = [] }) {
  if (!currentUserId) return null;

  // -------------------------------------------------------------------------
  // 1. PRIORITY 1: Unfinished Live Match (user is scorer or creator)
  // -------------------------------------------------------------------------
  const liveMatches = (matches || []).filter((m) => {
    if (!m) return false;
    const isLive = m.status === 'Live' || m.status === 'In Progress';
    if (!isLive) return false;
    const isUserScorer =
      m.creatorId === currentUserId ||
      m.ownerId === currentUserId ||
      m.scorerId === currentUserId ||
      (Array.isArray(m.scorers) && m.scorers.includes(currentUserId));
    return isUserScorer;
  });

  if (liveMatches.length > 0) {
    // Sort by lastScoredAt or updatedAt descending
    liveMatches.sort((a, b) => (b.lastScoredAt || b.updatedAt || 0) - (a.lastScoredAt || a.updatedAt || 0));
    const match = liveMatches[0];

    const currentScore = match.liveState?.currentInnings === 2
      ? `${match.scoreB || '0/0'} (${match.oversB || '0.0'})`
      : `${match.scoreA || '0/0'} (${match.oversA || '0.0'})`;

    return {
      type: 'LIVE_MATCH',
      badge: 'LIVE MATCH',
      statusBadge: 'LIVE MATCH',
      badgeColor: '#ef4444',
      title: `${match.teamA} vs ${match.teamB}`,
      subtitle: match.tournamentName ? `Tournament • ${match.tournamentName}` : (match.venue || 'Match in Progress'),
      situation: match.matchSituationText || currentScore,
      actionText: 'Resume Match',
      icon: 'radio',
      data: match,
      route: 'LiveScoring',
      targetScreen: 'LiveScoring',
      params: {
        matchData: match,
        isScorer: true,
        tournamentId: match.tournamentId,
        fixtureId: match.fixtureId,
        returnDestination: match.tournamentId ? 'MyTournaments' : 'Matches',
      },
      targetParams: {
        matchData: match,
        isScorer: true,
        tournamentId: match.tournamentId,
        fixtureId: match.fixtureId,
        returnDestination: match.tournamentId ? 'MyTournaments' : 'Matches',
      },
    };
  }

  // -------------------------------------------------------------------------
  // 2. PRIORITY 2: Tournament Draft (user is organizer)
  // -------------------------------------------------------------------------
  const drafts = (tournaments || []).filter(
    (t) => t && t.status === 'draft' && t.organizerId === currentUserId
  );

  if (drafts.length > 0) {
    // Sort by updatedAt descending
    drafts.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    const draft = drafts[0];
    const stepNum = draft.lastSavedStep || 1;

    return {
      type: 'TOURNAMENT_DRAFT',
      badge: 'DRAFT',
      statusBadge: 'SAVED DRAFT',
      badgeColor: '#f59e0b',
      title: draft.name || 'Untitled Tournament Draft',
      subtitle: `Step ${stepNum} of 6 • ${getStepTitle(stepNum)}`,
      situation: `Format: ${draft.format?.type?.replace('_', ' ') || 'League'} • ${draft.city || 'Local'}`,
      actionText: 'Continue Draft',
      icon: 'edit-3',
      data: draft,
      route: 'TournamentWizard',
      targetScreen: 'TournamentWizard',
      params: { existingDraft: draft },
      targetParams: { initialStep: stepNum, existingDraft: draft },
    };
  }

  // -------------------------------------------------------------------------
  // 3. PRIORITY 3: Active Tournament with Next Fixture
  // -------------------------------------------------------------------------
  const myPublishedTournaments = (tournaments || []).filter(
    (t) => t && t.status === 'published' && t.organizerId === currentUserId
  );

  for (const t of myPublishedTournaments) {
    const nextFix = (t.fixtures || []).find(
      (f) => f && f.status === 'Scheduled' && !f.isBye && f.teamA?.id && f.teamB?.id
    );
    if (nextFix) {
      return {
        type: 'TOURNAMENT_FIXTURE',
        badge: 'NEXT FIXTURE',
        statusBadge: 'NEXT FIXTURE',
        badgeColor: '#23c55e',
        title: `${nextFix.teamA?.name} vs ${nextFix.teamB?.name}`,
        subtitle: `${t.name} • ${nextFix.stageName || 'Upcoming Match'}`,
        situation: `${nextFix.date || 'Scheduled'} • ${nextFix.time || '10:00 AM'}`,
        actionText: 'Open Fixtures',
        icon: 'calendar',
        data: t,
        fixture: nextFix,
        route: 'TournamentDetail',
        targetScreen: 'TournamentDetail',
        params: { tournamentId: t.id, initialTab: 'Fixtures', returnDestination: 'MyTournaments' },
        targetParams: { tournamentId: t.id, initialTab: 'Fixtures', returnDestination: 'MyTournaments' },
      };
    }
  }

  return null;
}

/**
 * Async convenience function that automatically loads tournaments from repository
 */
export async function getMostRelevantActiveTask(currentUserId, matches = []) {
  if (!currentUserId) return null;
  const tournaments = await getTournaments();
  return getActiveRecoveryTask({ currentUserId, tournaments, matches });
}
