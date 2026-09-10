import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // <-- IMPORT ADDED

export default function MatchesScreen() {
  const navigation = useNavigation(); // <-- HOOK ADDED
  const [activeTab, setActiveTab] = useState('LIVE'); 
  const tabs = ['LIVE', 'UPCOMING', 'FOLLOWING', 'COMPLETED', 'MY MATCHES'];

  const colors = {
    bg: '#0a0a0a',
    cardBg: '#121212',
    primary: '#23c55e',
    upcoming: '#3498db',
    teamMember: '#f39c12',
    text: '#ffffff',
    subText: '#888888',
    border: '#222222',
    liveBorder: '#1a4024',
  };

  // ==========================================
  // ALL MOCK DATA
  // ==========================================
  
  const liveMatches = [
    { id: 'l1', league: 'KURUKSHETRA LEAGUE • T20', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '32.3 Ov', scoreB: '152/4', oversB: '30.1 Ov', status: 'Falcons CC elected to bat', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'l2', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Tigers XI', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '98/2', oversA: '11.4 Ov', scoreB: '-/-', oversB: 'Yet to bat', status: 'Tigers XI elected to bat', venue: 'Greenfield Stadium, Bengaluru' },
  ];

  const upcomingMatches = [
    { id: 'u1', dateLabel: 'TOMORROW', time: '4:00 PM', teamA: 'Falcons CC', teamB: 'Titans XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=TX&background=4a235a&color=fff', league: 'Kurukshetra League • T20', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'u2', dateLabel: 'MAY 18, 2025', time: '6:00 PM', teamA: 'Tigers XI', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', league: 'City Premier League • T20', venue: 'Greenfield Stadium, Bengaluru' },
    { id: 'u3', dateLabel: 'MAY 20, 2025', time: '10:30 AM', teamA: 'Royals CC', teamB: 'Strikers XI', logoA: 'https://ui-avatars.com/api/?name=RC&background=9a7d0a&color=fff', logoB: 'https://ui-avatars.com/api/?name=SX&background=c0392b&color=fff', league: 'City Premier League • T20', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  ];

  const followingMatches = [
    { id: 'f1', type: 'LIVE', league: 'KURUKSHETRA LEAGUE • T20', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '32.3 Ov', scoreB: '152/4', oversB: '30.1 Ov', status: 'Falcons CC elected to bat', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'f2', type: 'UPCOMING', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Tigers XI', teamB: 'Titans XI', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=TX&background=4a235a&color=fff', date: 'Tomorrow', time: '4:00 PM', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'f3', type: 'COMPLETED', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Royals CC', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=RC&background=9a7d0a&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '168/8', oversA: '20.0 Ov', scoreB: '140/10', oversB: '18.3 Ov', status: 'Royals CC won by 28 runs', venue: 'Greenfield Stadium, Bengaluru' },
  ];

  const completedMatches = [
    { id: 'c1', league: 'KURUKSHETRA LEAGUE • T20', date: 'Yesterday', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '20.0 Ov', scoreB: '152/9', oversB: '20.0 Ov', winner: 'Falcons CC won', margin: 'by 34 runs', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'c2', league: 'CITY PREMIER LEAGUE • T20', date: 'May 23, 2025', teamA: 'Tigers XI', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '198/6', oversA: '20.0 Ov', scoreB: '195/8', oversB: '20.0 Ov', winner: 'Tigers XI won', margin: 'by 6 wickets', venue: 'Greenfield Stadium, Bengaluru' },
  ];

  const playingMatches = [
    { id: 'p1', type: 'LIVE NOW', league: 'KURUKSHETRA LEAGUE • T20', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '32.3 Ov', scoreB: '152/4', oversB: '30.1 Ov', status: 'Falcons CC elected to bat', venue: 'Rajiv Cricket Ground, Hyderabad', roleTitle: 'Player', roleColor: colors.primary, roleNumber: '17', roleDesc: 'Top Order\nBatsman', isPlayer: true },
    { id: 'p2', type: 'UPCOMING', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Tigers XI', teamB: 'Titans XI', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=TX&background=4a235a&color=fff', date: 'May 26, 2025', time: '4:00 PM', venue: 'Rajiv Cricket Ground, Hyderabad', roleTitle: 'Player', roleColor: colors.upcoming, roleNumber: '8', roleDesc: 'Middle Order\nBatsman', isPlayer: true },
    { id: 'p3', type: 'UPCOMING', league: 'DELHI PREMIER LEAGUE • ODI', teamA: 'Eagles CC', teamB: 'Strikers XI', logoA: 'https://ui-avatars.com/api/?name=EC&background=2c3e50&color=fff', logoB: 'https://ui-avatars.com/api/?name=SX&background=c0392b&color=fff', date: 'May 30, 2025', time: '10:00 AM', venue: 'Arun Jaitley Stadium, Delhi', roleTitle: 'Team Member', roleColor: colors.teamMember, roleNumber: null, roleDesc: 'Squad\nMember', isPlayer: false },
  ];

  const organizingMatches = [
    { id: 'o1', type: 'UPCOMING', league: 'Kurukshetra League • T20', teamA: 'Royals CC', teamB: 'Panthers CC', logoA: 'https://ui-avatars.com/api/?name=RC&background=9a7d0a&color=fff', logoB: 'https://ui-avatars.com/api/?name=PC&background=2c3e50&color=fff', date: 'May 30, 2025', time: '3:30 PM', venue: 'Kurukshetra Sports Complex', rolePillText: 'ORGANIZER', rolePillIcon: 'account-tie' },
  ];

  const scoringMatches = [
    { id: 's1', type: 'LIVE', league: 'City Premier League • T20', teamA: 'Lions CC', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=LC&background=b9770e&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '98/2', oversA: '11.4 Ov', scoreB: '-/-', oversB: 'Yet to bat', status: null, venue: 'Greenfield Stadium, Bengaluru', rolePillText: 'SCORER', rolePillIcon: 'pencil' },
  ];


  // ==========================================
  // HEADERS
  // ==========================================
  
  const SectionHeader = ({ icon, title, iconColor }) => (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} style={{ marginRight: 8 }} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 12, marginRight: 4 }}>View all</Text>
        <Feather name="chevron-right" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const SubtitledHeader = ({ icon, title, subtitle }) => (
    <View style={{ marginBottom: 16, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 12, marginRight: 4 }}>View all</Text>
          <Feather name="chevron-right" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={{ color: colors.subText, fontSize: 12, marginTop: 4 }}>{subtitle}</Text>
    </View>
  );


  // ==========================================
  // CARD COMPONENTS (ALL TABS)
  // ==========================================
  
  const LiveCard = ({ match }) => (
    <View style={[styles.card, { borderColor: colors.liveBorder }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.livePill, { backgroundColor: colors.primary }]}><Text style={styles.livePillText}>LIVE</Text></View>
        <Text style={styles.leagueText}>{match.league}</Text>
        <View style={{ width: 34 }} />
      </View>
      <View style={styles.scoreRow}>
        <View style={styles.teamBlock}>
          <Image source={{ uri: match.logoA }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{match.teamA}</Text>
        </View>
        <View style={styles.centerBlock}>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreText}>{match.scoreA}</Text>
              <Text style={styles.oversText}>{match.oversA}</Text>
            </View>
            <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreText}>{match.scoreB}</Text>
              <Text style={styles.oversText}>{match.oversB}</Text>
            </View>
          </View>
          <View style={styles.statusPill}><Text style={styles.statusText}>{match.status}</Text></View>
        </View>
        <View style={styles.teamBlock}>
          <Image source={{ uri: match.logoB }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{match.teamB}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={styles.venueText}>{match.venue}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.subText} />
      </View>
    </View>
  );

  const UpcomingCard = ({ match }) => (
    <View style={[styles.card, { borderColor: colors.border, padding: 16 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Feather name="calendar" size={12} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>{match.dateLabel} • {match.time}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 16 }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Image source={{ uri: match.logoA }} style={styles.upcomingBigLogo} />
          <Text style={styles.upcomingBigTeamName} numberOfLines={1}>{match.teamA}</Text>
        </View>
        <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Image source={{ uri: match.logoB }} style={styles.upcomingBigLogo} />
          <Text style={styles.upcomingBigTeamName} numberOfLines={1}>{match.teamB}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Feather name="map-pin" size={12} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.metaText} numberOfLines={1}>{match.venue}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="award" size={12} color={colors.subText} style={{ marginRight: 6 }} />
            <Text style={styles.metaText} numberOfLines={1}>{match.league}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.followBtn}>
          <Feather name="plus" size={12} color={colors.primary} />
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FollowingCard = ({ match }) => {
    const isLive = match.type === 'LIVE';
    const isUpcoming = match.type === 'UPCOMING';
    const isCompleted = match.type === 'COMPLETED';

    let borderColor = colors.border;
    let pillBg = '#1a1a1a';
    let pillText = colors.subText;
    
    if (isLive) { borderColor = colors.liveBorder; pillBg = colors.primary; pillText = '#000'; } 
    else if (isUpcoming) { pillBg = 'rgba(52, 152, 219, 0.15)'; pillText = colors.upcoming; }

    return (
      <View style={[styles.card, { borderColor }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.livePill, { backgroundColor: pillBg }]}>
            <Text style={[styles.livePillText, { color: pillText }]}>{match.type}</Text>
          </View>
          <Text style={styles.leagueText}>{match.league}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <Image source={{ uri: match.logoA }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{match.teamA}</Text>
          </View>
          <View style={styles.centerBlock}>
            {isUpcoming ? (
              <View style={{ alignItems: 'center' }}>
                <Feather name="calendar" size={16} color={colors.subText} style={{ marginBottom: 6 }} />
                <Text style={{ color: colors.subText, fontSize: 11, marginBottom: 4 }}>{match.date}</Text>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{match.time}</Text>
              </View>
            ) : (
              <>
                {isCompleted && <Text style={[styles.statusText, { marginBottom: 12 }]}>{match.status}</Text>}
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreText}>{match.scoreA}</Text>
                    <Text style={[styles.oversText, { color: isLive ? colors.primary : colors.subText }]}>{match.oversA}</Text>
                  </View>
                  {isLive ? <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View> : <View style={{ width: 32, marginHorizontal: 8 }} />}
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreText}>{match.scoreB}</Text>
                    <Text style={[styles.oversText, { color: isLive ? colors.primary : colors.subText }]}>{match.oversB}</Text>
                  </View>
                </View>
                {isLive && <Text style={[styles.statusText, { marginTop: 12 }]}>{match.status}</Text>}
              </>
            )}
          </View>
          <View style={styles.teamBlock}>
            <Image source={{ uri: match.logoB }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{match.teamB}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={styles.venueText}>{match.venue}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold', marginLeft: 4, marginRight: 8 }}>Following</Text>
            <Feather name="chevron-right" size={16} color={colors.subText} />
          </View>
        </View>
      </View>
    );
  };

  const CompletedCard = ({ match }) => (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.completedHeaderRow}>
        <Text style={styles.leagueText}>{match.league}</Text>
        <Text style={styles.completedDateText}>{match.date}</Text>
      </View>
      <View style={styles.scoreRow}>
        <View style={styles.teamBlock}>
          <Image source={{ uri: match.logoA }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{match.teamA}</Text>
        </View>
        <View style={styles.centerBlock}>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreText}>{match.scoreA}</Text>
              <Text style={[styles.oversText, { color: colors.subText }]}>{match.oversA}</Text>
            </View>
            <View style={{ alignItems: 'center', paddingHorizontal: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{match.winner}</Text>
              <Text style={{ color: colors.subText, fontSize: 10, marginTop: 4 }}>{match.margin}</Text>
            </View>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreText}>{match.scoreB}</Text>
              <Text style={[styles.oversText, { color: colors.subText }]}>{match.oversB}</Text>
            </View>
          </View>
        </View>
        <View style={styles.teamBlock}>
          <Image source={{ uri: match.logoB }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{match.teamB}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={styles.venueText}>{match.venue}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.scorecardBtn}>
            <Text style={styles.scorecardBtnText}>Scorecard</Text>
          </TouchableOpacity>
          <Feather name="chevron-right" size={16} color={colors.subText} />
        </View>
      </View>
    </View>
  );

  const MyMatchesSidebarCard = ({ match }) => {
    const isLive = match.type === 'LIVE NOW';
    let borderColor = isLive ? colors.liveBorder : colors.border;
    let pillBg = isLive ? colors.primary : 'rgba(52, 152, 219, 0.15)';
    let pillText = isLive ? '#000' : colors.upcoming;

    return (
      <View style={[styles.card, { borderColor, flexDirection: 'row', overflow: 'hidden' }]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.cardHeader, { paddingRight: 8 }]}>
            <View style={[styles.livePill, { backgroundColor: pillBg }]}><Text style={[styles.livePillText, { color: pillText }]}>{match.type}</Text></View>
            <Text style={styles.leagueText} numberOfLines={1}>{match.league}</Text>
          </View>
          <View style={[styles.scoreRow, { paddingHorizontal: 12 }]}>
            <View style={styles.teamBlock}>
              <Image source={{ uri: match.logoA }} style={styles.teamLogo} />
              <Text style={styles.teamName}>{match.teamA}</Text>
            </View>
            <View style={styles.centerBlock}>
              {isLive ? (
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreText}>{match.scoreA}</Text>
                    <Text style={[styles.oversText, { color: colors.primary }]}>{match.oversA}</Text>
                  </View>
                  <View style={[styles.vsCircle, { marginHorizontal: 4 }]}><Text style={styles.vsText}>VS</Text></View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreText}>{match.scoreB}</Text>
                    <Text style={[styles.oversText, { color: colors.primary }]}>{match.oversB}</Text>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Feather name="calendar" size={14} color={colors.subText} style={{ marginBottom: 4 }} />
                  <Text style={{ color: colors.subText, fontSize: 10, marginBottom: 2 }}>{match.date}</Text>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{match.time}</Text>
                </View>
              )}
            </View>
            <View style={styles.teamBlock}>
              <Image source={{ uri: match.logoB }} style={styles.teamLogo} />
              <Text style={styles.teamName}>{match.teamB}</Text>
            </View>
          </View>
          {isLive && match.status && (
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.statusPill}><Text style={styles.statusText}>{match.status}</Text></View>
            </View>
          )}
          <View style={[styles.cardFooter, { borderTopWidth: 0, paddingHorizontal: 12, paddingBottom: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Feather name="map-pin" size={12} color={colors.primary} />
              <Text style={styles.venueText} numberOfLines={1}>{match.venue}</Text>
            </View>
          </View>
        </View>
        <View style={styles.sidebarCol}>
          <Text style={styles.sidebarRoleLabel}>YOUR ROLE</Text>
          <Text style={[styles.sidebarRoleTitle, { color: match.roleColor }]}>{match.roleTitle}</Text>
          <View style={styles.sidebarIconContainer}>
            {match.isPlayer ? (
              <>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={38} color={match.roleColor} />
                <Text style={styles.sidebarJerseyNum}>{match.roleNumber}</Text>
              </>
            ) : (
              <MaterialCommunityIcons name="account-group-outline" size={34} color={match.roleColor} />
            )}
          </View>
          <Text style={styles.sidebarRoleDesc}>{match.roleDesc}</Text>
        </View>
      </View>
    );
  };

  const MyMatchesRoleCard = ({ match }) => {
    const isLive = match.type === 'LIVE';
    let borderColor = isLive ? colors.liveBorder : colors.border;
    let pillBg = isLive ? colors.primary : 'rgba(52, 152, 219, 0.15)';
    let pillText = isLive ? '#000' : colors.upcoming;

    return (
      <View style={[styles.card, { borderColor }]}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.livePill, { backgroundColor: pillBg, marginRight: 8 }]}><Text style={[styles.livePillText, { color: pillText }]}>{match.type}</Text></View>
            <Text style={styles.leagueText} numberOfLines={1}>{match.league}</Text>
          </View>
          <View style={styles.actionRolePill}>
            <MaterialCommunityIcons name={match.rolePillIcon} size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.actionRoleText}>{match.rolePillText}</Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <Image source={{ uri: match.logoA }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{match.teamA}</Text>
          </View>
          <View style={styles.centerBlock}>
            {isLive ? (
              <View style={styles.scoreContainer}>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreText}>{match.scoreA}</Text>
                  <Text style={[styles.oversText, { color: colors.primary }]}>{match.oversA}</Text>
                </View>
                <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreText}>{match.scoreB}</Text>
                  <Text style={[styles.oversText, { color: colors.primary }]}>{match.oversB}</Text>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.subText, fontSize: 10, marginBottom: 2 }}>{match.date}</Text>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{match.time}</Text>
              </View>
            )}
          </View>
          <View style={styles.teamBlock}>
            <Image source={{ uri: match.logoB }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{match.teamB}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={styles.venueText} numberOfLines={1}>{match.venue}</Text>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold', marginRight: 4 }}>View Details</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.logoIcon, { color: colors.primary }]}>P</Text>
          <Text style={styles.headerTitle}>Matches</Text>
        </View>
        <View style={styles.headerActions}>
          {/* --- NOTIFICATIONS ONPRESS ADDED HERE --- */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Feather name="bell" size={22} color={colors.text} />
            <View style={[styles.badge, { backgroundColor: colors.primary }]}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
          {/* --- MESSAGES ONPRESS ALREADY HERE --- */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Messages')}>
            <Feather name="message-square" size={22} color={colors.text} />
            <View style={[styles.badge, { backgroundColor: colors.primary }]}><Text style={styles.badgeText}>2</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.subText }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- LIVE TAB --- */}
        {activeTab === 'LIVE' && (
          <View>
            <SectionHeader icon="record-circle-outline" title="LIVE MATCHES" iconColor={colors.primary} />
            {liveMatches.map(m => <LiveCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- UPCOMING TAB --- */}
        {activeTab === 'UPCOMING' && (
          <View>
            <SectionHeader icon="calendar-month-outline" title="UPCOMING MATCHES" iconColor={colors.primary} />
            {upcomingMatches.map(m => <UpcomingCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- FOLLOWING TAB --- */}
        {activeTab === 'FOLLOWING' && (
          <View>
             <SubtitledHeader icon="star" title="FOLLOWING MATCHES" subtitle="Matches you follow across all categories" />
             {followingMatches.map(m => <FollowingCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- COMPLETED TAB --- */}
        {activeTab === 'COMPLETED' && (
          <View>
             <SubtitledHeader icon="trophy-outline" title="COMPLETED MATCHES" subtitle="Past results and completed fixtures" />
             {completedMatches.map(m => <CompletedCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- MY MATCHES TAB --- */}
        {activeTab === 'MY MATCHES' && (
          <View>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, marginTop: 8 }}>
               <View>
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                   <MaterialCommunityIcons name="account" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                   <Text style={[styles.sectionTitle, { color: colors.text }]}>MY MATCHES</Text>
                 </View>
                 <Text style={{ color: colors.subText, fontSize: 12, marginTop: 4 }}>Matches you're part of</Text>
               </View>
               <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <Text style={{ color: colors.primary, fontSize: 12, marginRight: 4 }}>Filter</Text>
                 <Feather name="sliders" size={14} color={colors.primary} />
               </TouchableOpacity>
             </View>

             {playingMatches.map(m => <MyMatchesSidebarCard key={m.id} match={m} />)}

             <View style={{ marginTop: 12, marginBottom: 16 }}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <MaterialCommunityIcons name="shield-check" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                 <Text style={[styles.sectionTitle, { color: colors.text }]}>ORGANIZING ({organizingMatches.length})</Text>
               </View>
               <Text style={{ color: colors.subText, fontSize: 11, marginTop: 4 }}>Matches you are organizing or managing</Text>
             </View>
             
             {organizingMatches.map(m => <MyMatchesRoleCard key={m.id} match={m} />)}

             <View style={{ marginTop: 12, marginBottom: 16 }}>
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <MaterialCommunityIcons name="clipboard-check" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                 <Text style={[styles.sectionTitle, { color: colors.text }]}>SCORING ({scoringMatches.length})</Text>
               </View>
               <Text style={{ color: colors.subText, fontSize: 11, marginTop: 4 }}>Matches where you are scoring</Text>
             </View>
             
             {scoringMatches.map(m => <MyMatchesRoleCard key={m.id} match={m} />)}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// UNIFIED PIXEL-PERFECT STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  logoIcon: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { position: 'relative', marginLeft: 20 },
  badge: { position: 'absolute', top: -4, right: -6, borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  tabScroll: { paddingHorizontal: 8 },
  tab: { paddingVertical: 14, paddingHorizontal: 16, marginRight: 4 },
  tabText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  
  card: { backgroundColor: '#121212', borderWidth: 1, borderRadius: 12, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingBottom: 0 },
  livePill: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  livePillText: { fontSize: 9, fontWeight: 'bold' },
  leagueText: { color: '#888', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', flex: 1 },
  
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  teamBlock: { alignItems: 'center', width: 80 },
  teamLogo: { width: 44, height: 44, borderRadius: 22, marginBottom: 8, backgroundColor: '#222' },
  teamName: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  scoreCol: { alignItems: 'center', width: 70 },
  scoreText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  oversText: { fontSize: 11, marginTop: 4 },
  
  vsCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  vsText: { color: '#888', fontSize: 10 },
  statusText: { color: '#23c55e', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  statusPill: { borderWidth: 1, borderColor: '#23c55e', backgroundColor: '#0a1f10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#222' },
  venueText: { color: '#888', fontSize: 11, marginLeft: 6 },
  
  /* Upcoming Card Styles */
  upcomingBigLogo: { width: 56, height: 56, borderRadius: 28, marginBottom: 8, backgroundColor: '#222' },
  upcomingBigTeamName: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  metaText: { color: '#888', fontSize: 11 },
  followBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#23c55e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: 'transparent' },
  followBtnText: { color: '#23c55e', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  
  /* Completed Card Styles */
  completedHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  completedDateText: { color: '#888', fontSize: 11 },
  scorecardBtn: { borderWidth: 1, borderColor: '#1a4024', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  scorecardBtnText: { color: '#23c55e', fontSize: 11, fontWeight: '600' },

  /* My Matches Sidebar Styles */
  sidebarCol: { width: 90, borderLeftWidth: 1, borderLeftColor: '#222', backgroundColor: '#111', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4 },
  sidebarRoleLabel: { color: '#888', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  sidebarRoleTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  sidebarIconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  sidebarJerseyNum: { position: 'absolute', color: '#fff', fontSize: 11, fontWeight: 'bold', top: 12 },
  sidebarRoleDesc: { color: '#888', fontSize: 9, textAlign: 'center', lineHeight: 12 },

  /* My Matches Role Pill Styles */
  actionRolePill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#23c55e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  actionRoleText: { color: '#23c55e', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }
});