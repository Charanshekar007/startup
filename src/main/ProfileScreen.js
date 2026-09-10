import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const theme = {
  bg: '#0a0a0a',
  card: '#121212',
  cardLight: '#1a1a1a',
  primary: '#23c55e',
  primaryDark: 'rgba(35, 197, 94, 0.15)',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
  danger: '#e74c3c',
  dangerDark: 'rgba(231, 76, 60, 0.15)',
};

// ==========================================
// MOCK DATA
// ==========================================
const PROFILE = {
  name: 'Rahul Kumar',
  username: '@rahulkumar',
  location: 'Hyderabad, India',
  role: 'All-Rounder',
  batting: 'Right-Handed',
  bowling: 'Right-Arm Medium',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  followers: '2.4K',
  following: '386',
  posts: '42',
  experience: 'College • Club • Turf',
  primaryTeam: 'Falcons CC',
};

const RECENT_PERFORMANCE = [
  { id: '1', score: '86*', balls: '52', fours: 7, sixes: 3, vs: 'Royal Strikers', potm: true, time: 'Yesterday', icon: 'cricket-bat' },
  { id: '2', score: '42', balls: '31', fours: 5, sixes: 1, vs: 'Warriors XI', potm: false, time: '3 days ago', icon: 'cricket-bat' },
  { id: '3', score: '3/24', balls: '4', overs: '4 Overs', vs: 'Titans CC', potm: false, time: '5 days ago', icon: 'cricket' },
];

const FORM_DATA = [
  { id: 'f1', score: 86, result: 'W' },
  { id: 'f2', score: 42, result: 'W' },
  { id: 'f3', score: 31, result: 'L' },
  { id: 'f4', score: 74, result: 'W' },
  { id: 'f5', score: 18, result: 'L' },
];

const MATCH_HISTORY = [
  { id: 'm1', format: 'T20', league: 'Kurukshetra T20 • Semi-Final', teamA: 'Falcons CC', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', teamB: 'Royal Strikers', logoB: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff', result: 'Won by 6 wickets', myScore: '86*', myBalls: '52', myFours: 7, mySixes: 3, potm: true, time: 'Yesterday' },
  { id: 'm2', format: 'T20', league: 'Hyderabad Turf League • League', teamA: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=WX&background=8e44ad&color=fff', teamB: 'Falcons CC', logoB: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', result: 'Lost by 3 runs', myScore: '42', myBalls: '31', myFours: 5, mySixes: 1, potm: false, time: '3 days ago' },
  { id: 'm3', format: 'T20', league: 'Hyderabad Turf League • League', teamA: 'Falcons CC', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', teamB: 'Titans CC', logoB: 'https://ui-avatars.com/api/?name=TC&background=2c3e50&color=fff', result: 'Won by 22 runs', myScore: '3/24', myBalls: '4', myFours: 4, mySixes: 0, extraInfo: '4 Overs • 2 Maidens', potm: false, time: '5 days ago' },
];

const POSTS_FEED = [
  { id: 'p1', text: "Big match tonight! 💪\nLet's go Falcons! 🦅🔥", time: '2h', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likes: 128, comments: 24, shares: 12 },
  { id: 'p2', text: "Happy to contribute to the team's win today. 🙌\nGood team effort all around! 💚", time: '1d', isPerformance: true, likes: 96, comments: 18, shares: 8 },
  { id: 'p3', text: "Great practice session today!\nAlways working to get better. 🏏", time: '3d', images: [
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1624526267942-ab0f0b7148eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  ], likes: 78, comments: 14, shares: 6 }
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Overview');
  const TABS = ['Overview', 'Stats', 'Matches', 'Posts'];
  const MATCH_FILTERS = ['All', 'T20', 'ODI', 'T10', 'Turf', 'College'];
  const [activeMatchFilter, setActiveMatchFilter] = useState('All');

  // ==========================================
  // SHARED HEADER & INFO
  // ==========================================
  const renderProfileHeader = () => (
    <View style={styles.profileTopContainer}>
      
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="chevron-left" size={28} color={theme.text} /></TouchableOpacity>
        <Text style={styles.navTitle}>Profile</Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={{ marginRight: 16 }}><Feather name="share-2" size={22} color={theme.text} /></TouchableOpacity>
          <TouchableOpacity><Feather name="more-horizontal" size={24} color={theme.text} /></TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfoRow}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: PROFILE.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.profileDetails}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.nameText}>{PROFILE.name}</Text>
            <MaterialCommunityIcons name="check-decagram" size={18} color={theme.primary} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.usernameText}>{PROFILE.username}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Feather name="map-pin" size={12} color={theme.subText} />
            <Text style={styles.locationText}>{PROFILE.location}</Text>
          </View>
          
          <View style={styles.rolePill}><Text style={styles.rolePillText}>{PROFILE.role}</Text></View>
          
          <View style={styles.playStylesRow}>
            <MaterialCommunityIcons name="cricket-bat" size={14} color={theme.subText} />
            <Text style={styles.playStyleText}>{PROFILE.batting} Batter</Text>
            <View style={styles.dotSeparator} />
            <MaterialCommunityIcons name="cricket" size={14} color={theme.subText} />
            <Text style={styles.playStyleText}>{PROFILE.bowling}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.btnPrimary}>
          <MaterialCommunityIcons name="chat-outline" size={18} color="#000" style={{ marginRight: 6 }} />
          <Text style={styles.btnPrimaryText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary}>
          <Feather name="share-2" size={16} color={theme.text} style={{ marginRight: 6 }} />
          <Text style={styles.btnSecondaryText}>Share Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View style={styles.statIconRow}><Feather name="users" size={14} color={theme.subText} /><Text style={styles.statNum}>{PROFILE.followers}</Text></View>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <View style={styles.statIconRow}><Feather name="user-check" size={14} color={theme.subText} /><Text style={styles.statNum}>{PROFILE.following}</Text></View>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <View style={styles.statIconRow}><Feather name="file-text" size={14} color={theme.subText} /><Text style={styles.statNum}>{PROFILE.posts}</Text></View>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ==========================================
  // TAB 1: OVERVIEW
  // ==========================================
  const renderOverview = () => (
    <View style={styles.tabContent}>
      
      {/* Cricket Identity Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>CRICKET IDENTITY</Text>
        <View style={styles.identityGrid}>
          <View style={styles.identityItem}><Text style={styles.idLabel}>Role</Text><Text style={styles.idValue}>{PROFILE.role}</Text></View>
          <View style={styles.identityItem}><Text style={styles.idLabel}>Batting</Text><Text style={styles.idValue}>{PROFILE.batting}</Text></View>
          <View style={styles.identityItem}><Text style={styles.idLabel}>Bowling</Text><Text style={styles.idValue}>{PROFILE.bowling}</Text></View>
          <View style={styles.identityItem}><Text style={styles.idLabel}>Experience</Text><Text style={styles.idValue}>{PROFILE.experience}</Text></View>
        </View>
        <View style={styles.primaryTeamRow}>
          <Image source={{uri: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff'}} style={styles.primaryTeamLogo} />
          <View>
            <Text style={styles.idLabel}>Primary Team</Text>
            <Text style={styles.idValue}>{PROFILE.primaryTeam}</Text>
          </View>
        </View>
      </View>

      {/* Recent Performance */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleText}>Recent Performance</Text>
        <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {RECENT_PERFORMANCE.map(perf => (
          <View key={perf.id} style={styles.perfCard}>
            <View style={styles.perfTopRow}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.perfScore}>{perf.score}</Text>
                <Text style={styles.perfBalls}> ({perf.balls})</Text>
              </View>
              <View style={styles.perfIconBg}><MaterialCommunityIcons name={perf.icon} size={16} color={theme.subText} /></View>
            </View>
            <Text style={styles.perfDetails}>{perf.overs ? perf.overs : `${perf.fours} Fours • ${perf.sixes} Sixes`}</Text>
            <Text style={styles.perfVs}>vs {perf.vs}</Text>
            {perf.potm && <View style={styles.potmBadge}><Text style={styles.potmText}>Player of the Match</Text></View>}
            <View style={styles.perfFooter}>
              <Text style={styles.perfTime}>{perf.time}</Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Form & Teams Grid */}
      <View style={styles.twoColGrid}>
        {/* FORM */}
        <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.miniCardTitle}>Form <Text style={{fontWeight:'normal', color:theme.subText}}>(Last 5 Matches)</Text></Text>
          <View style={styles.formChart}>
            {FORM_DATA.map((data, idx) => {
              const isWin = data.result === 'W';
              const barHeight = Math.max((data.score / 100) * 80, 10);
              return (
                <View key={data.id} style={styles.formCol}>
                  <Text style={styles.formScoreText}>{data.score}</Text>
                  <View style={[styles.formBar, { height: barHeight, backgroundColor: isWin ? theme.primary : theme.danger }]} />
                  <View style={[styles.formResultBadge, { backgroundColor: isWin ? theme.primaryDark : theme.dangerDark, borderColor: isWin ? theme.primary : theme.danger }]}>
                    <Text style={[styles.formResultText, { color: isWin ? theme.primary : theme.danger }]}>{data.result}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* TEAMS */}
        <View style={[styles.card, { flex: 1, marginLeft: 8 }]}>
          <View style={styles.sectionHeaderRowCard}>
            <Text style={styles.miniCardTitle}>Teams</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>
          <View style={styles.teamListRow}>
            <Image source={{uri: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff'}} style={styles.smallTeamLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.teamListTitle} numberOfLines={1}>Falcons CC</Text>
              <Text style={styles.teamListSub}>All-Rounder</Text>
            </View>
            <Text style={styles.teamListYear}>2025 – Present</Text>
          </View>
          <View style={styles.teamListRow}>
            <Image source={{uri: 'https://ui-avatars.com/api/?name=WX&background=8e44ad&color=fff'}} style={styles.smallTeamLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.teamListTitle} numberOfLines={1}>Warriors XI</Text>
              <Text style={styles.teamListSub}>All-Rounder</Text>
            </View>
            <Text style={styles.teamListYear}>2024 – 2025</Text>
          </View>
        </View>
      </View>

      {/* Tournaments & Achievements Grid */}
      <View style={styles.twoColGrid}>
        {/* TOURNAMENTS */}
        <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
          <View style={styles.sectionHeaderRowCard}>
            <Text style={styles.miniCardTitle}>Tournaments</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>
          <View style={styles.teamListRow}>
            <View style={styles.trophyIconBg}><Ionicons name="trophy" size={16} color="#f1c40f" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamListTitle} numberOfLines={1}>Kurukshetra T20</Text>
              <Text style={styles.teamListSub}>Semi-Finalist • 2026</Text>
            </View>
          </View>
          <View style={styles.teamListRow}>
            <View style={styles.trophyIconBg}><Ionicons name="trophy" size={16} color="#f1c40f" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamListTitle} numberOfLines={1}>Hyderabad Turf</Text>
              <Text style={styles.teamListSub}>Winner • 2025</Text>
            </View>
          </View>
        </View>

        {/* ACHIEVEMENTS */}
        <View style={[styles.card, { flex: 1, marginLeft: 8 }]}>
          <View style={styles.sectionHeaderRowCard}>
            <Text style={styles.miniCardTitle}>Achievements</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>
          <View style={styles.teamListRow}>
            <Ionicons name="star" size={16} color="#f39c12" style={{ marginRight: 8 }} />
            <Text style={[styles.teamListTitle, { flex: 1 }]} numberOfLines={1}>POTM</Text>
            <Text style={styles.teamListYear}>8 Times</Text>
          </View>
          <View style={styles.teamListRow}>
            <MaterialCommunityIcons name="target" size={16} color="#e67e22" style={{ marginRight: 8 }} />
            <Text style={[styles.teamListTitle, { flex: 1 }]} numberOfLines={1}>500 Runs</Text>
            <Text style={styles.teamListYear}>Milestone</Text>
          </View>
          <View style={styles.teamListRow}>
            <MaterialCommunityIcons name="cricket" size={16} color="#e67e22" style={{ marginRight: 8 }} />
            <Text style={[styles.teamListTitle, { flex: 1 }]} numberOfLines={1}>50 Wickets</Text>
            <Text style={styles.teamListYear}>Milestone</Text>
          </View>
        </View>
      </View>

    </View>
  );

  // ==========================================
  // TAB 2: STATS
  // ==========================================
  const renderStats = () => (
    <View style={styles.tabContent}>
      
      {/* Batting Stats */}
      <View style={styles.statsHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="cricket-bat" size={18} color={theme.subText} style={{ marginRight: 8 }} />
          <Text style={styles.statsSectionTitle}>Batting</Text>
        </View>
        <View style={styles.formatDropdown}>
          <Text style={styles.formatDropdownText}>All Formats</Text>
          <Feather name="chevron-down" size={14} color={theme.subText} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Matches</Text><Text style={styles.statItemValue}>42</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Runs</Text><Text style={styles.statItemValue}>1,286</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Average</Text><Text style={[styles.statItemValue, { color: theme.primary }]}>38.7</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Strike Rate</Text><Text style={[styles.statItemValue, { color: theme.primary }]}>142.4</Text></View>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Highest Score</Text><Text style={styles.statItemValue}>86*</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>50s</Text><Text style={styles.statItemValue}>12</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>100s</Text><Text style={styles.statItemValue}>2</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>4s</Text><Text style={styles.statItemValue}>134</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>6s</Text><Text style={styles.statItemValue}>58</Text></View>
        </View>
      </View>

      {/* Bowling Stats */}
      <View style={styles.statsHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="cricket" size={18} color={theme.subText} style={{ marginRight: 8 }} />
          <Text style={styles.statsSectionTitle}>Bowling</Text>
        </View>
        <View style={styles.formatDropdown}>
          <Text style={styles.formatDropdownText}>All Formats</Text>
          <Feather name="chevron-down" size={14} color={theme.subText} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Matches</Text><Text style={styles.statItemValue}>42</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Overs</Text><Text style={styles.statItemValue}>126.4</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Wickets</Text><Text style={[styles.statItemValue, { color: theme.primary }]}>58</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Economy</Text><Text style={[styles.statItemValue, { color: theme.primary }]}>7.2</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Average</Text><Text style={styles.statItemValue}>17.9</Text></View>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Best Bowling</Text><Text style={styles.statItemValue}>4/18</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>5 Wickets</Text><Text style={styles.statItemValue}>1</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Maiden Overs</Text><Text style={styles.statItemValue}>6</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Dot Balls</Text><Text style={styles.statItemValue}>312</Text></View>
        </View>
      </View>

      {/* Fielding Stats */}
      <View style={styles.statsHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="hand-back-right" size={18} color={theme.subText} style={{ marginRight: 8 }} />
          <Text style={styles.statsSectionTitle}>Fielding</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Catches</Text><Text style={[styles.statItemValue, { color: theme.primary }]}>32</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Run Outs</Text><Text style={styles.statItemValue}>7</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Stumpings</Text><Text style={styles.statItemValue}>3</Text></View>
          <View style={styles.statItem}><Text style={styles.statItemLabel}>Direct Hits</Text><Text style={styles.statItemValue}>2</Text></View>
        </View>
      </View>

      {/* Performance Trend Placeholder */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="trending-up" size={16} color={theme.subText} style={{ marginRight: 8 }} />
            <View>
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>Performance Trend</Text>
              <Text style={{ color: theme.subText, fontSize: 11, marginTop: 2 }}>Last 10 Innings</Text>
            </View>
          </View>
          <View style={styles.formatDropdown}>
            <Text style={styles.formatDropdownText}>Runs</Text>
            <Feather name="chevron-down" size={14} color={theme.subText} />
          </View>
        </View>
        <View style={styles.trendGraphMock}>
           <Image source={{uri: 'https://www.transparenttextures.com/patterns/stardust.png'}} style={{position:'absolute', width:'100%', height:'100%', opacity: 0.1}}/>
           {/* Visual Mock of the Graph */}
           <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 20 }}>
             {[18, 74, 31, 86, 42, 0, 55, 24, 67, 33].map((val, i) => {
               const height = (val / 100) * 80;
               return (
                 <View key={i} style={{ alignItems: 'center' }}>
                   <Text style={{ color: theme.text, fontSize: 10, marginBottom: 4 }}>{val}{val===86?'*':''}</Text>
                   <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, marginBottom: height }} />
                   <View style={[styles.formResultBadge, { width: 16, height: 16, borderRadius: 4, paddingHorizontal: 0, justifyContent: 'center' }]}>
                     <Text style={{ color: val > 20 ? theme.primary : theme.danger, fontSize: 8, fontWeight: 'bold' }}>{val > 20 ? 'W' : 'L'}</Text>
                   </View>
                 </View>
               )
             })}
           </View>
        </View>
      </View>

    </View>
  );

  // ==========================================
  // TAB 3: MATCHES
  // ==========================================
  const renderMatches = () => (
    <View style={styles.tabContent}>
      
      {/* Match Summary */}
      <View style={styles.statsHeaderRow}>
        <Text style={styles.statsSectionTitle}>Match Summary</Text>
        <View style={styles.formatDropdown}>
          <Text style={styles.formatDropdownText}>All Formats</Text>
          <Feather name="chevron-down" size={14} color={theme.subText} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.statsGridRow}>
          <View style={styles.statItem}><Ionicons name="trophy-outline" size={18} color={theme.subText} style={{marginBottom:4}}/><Text style={styles.statItemLabel}>Matches</Text><Text style={styles.statItemValue}>42</Text></View>
          <View style={styles.statItem}><Ionicons name="medal-outline" size={18} color={theme.subText} style={{marginBottom:4}}/><Text style={styles.statItemLabel}>Won</Text><Text style={styles.statItemValue}>26</Text></View>
          <View style={styles.statItem}><Feather name="bar-chart-2" size={18} color={theme.subText} style={{marginBottom:4}}/><Text style={styles.statItemLabel}>Win %</Text><Text style={styles.statItemValue}>61.9%</Text></View>
          <View style={styles.statItem}><Feather name="star" size={18} color={theme.subText} style={{marginBottom:4}}/><Text style={styles.statItemLabel}>POTM</Text><Text style={styles.statItemValue}>8</Text></View>
        </View>
      </View>

      {/* Match History Header & Filters */}
      <View style={[styles.statsHeaderRow, { marginTop: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="calendar" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={styles.statsSectionTitle}>Match History</Text>
        </View>
        <Feather name="chevron-right" size={18} color={theme.subText} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {MATCH_FILTERS.map(filter => (
          <TouchableOpacity key={filter} style={[styles.matchFilterPill, activeMatchFilter === filter && styles.matchFilterActive]} onPress={() => setActiveMatchFilter(filter)}>
            <Text style={[styles.matchFilterText, activeMatchFilter === filter && styles.matchFilterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Match List */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {MATCH_HISTORY.map(match => (
          <View key={match.id} style={styles.matchHistoryCard}>
            <View style={styles.matchHistoryHeader}>
              <View style={styles.formatPill}><Text style={styles.formatPillText}>{match.format}</Text></View>
              <Text style={styles.matchHistoryLeague} numberOfLines={1}>{match.league}</Text>
              <Text style={styles.matchHistoryTime}>{match.time}</Text>
            </View>
            
            <View style={styles.matchHistoryBody}>
              <View style={styles.matchHistoryTeams}>
                <View style={styles.matchTeamRow}>
                  <Image source={{uri: match.logoA}} style={styles.matchTeamLogo} />
                  <Text style={styles.matchTeamName}>{match.teamA}</Text>
                </View>
                <Text style={styles.matchHistoryVS}>VS</Text>
                <View style={styles.matchTeamRow}>
                  <Image source={{uri: match.logoB}} style={styles.matchTeamLogo} />
                  <Text style={styles.matchTeamName}>{match.teamB}</Text>
                </View>
                <Text style={[styles.matchHistoryResult, { color: match.result.includes('Won') ? theme.primary : theme.danger }]}>{match.result}</Text>
              </View>

              <View style={styles.matchHistoryPerfBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.perfBoxLabel}>Your Performance</Text>
                  {match.potm && <View style={styles.potmSmallBadge}><Ionicons name="star" size={10} color="#f1c40f"/><Text style={styles.potmSmallText}>POTM</Text></View>}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.perfBoxScore}>{match.myScore}</Text>
                  <Text style={styles.perfBoxBalls}> ({match.myBalls})</Text>
                </View>
                <Text style={styles.perfBoxDetails}>{match.extraInfo ? match.extraInfo : `${match.myFours} Fours • ${match.mySixes} Sixes`}</Text>
                <Feather name="chevron-right" size={16} color={theme.subText} style={{ position: 'absolute', right: 12, top: '50%' }} />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.viewAllMatchesBtn}>
          <Text style={styles.viewAllMatchesText}>View All Matches</Text>
          <Feather name="chevron-right" size={16} color={theme.subText} />
        </TouchableOpacity>
      </View>

    </View>
  );

  // ==========================================
  // TAB 4: POSTS
  // ==========================================
  const renderPosts = () => (
    <View style={styles.tabContent}>
      
      {/* Post Filters */}
      <View style={styles.postFiltersRow}>
        <TouchableOpacity style={[styles.postFilterBtn, styles.postFilterActive]}>
          <Feather name="list" size={14} color={theme.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.postFilterText, { color: theme.text }]}>All Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postFilterBtn}>
          <Feather name="image" size={14} color={theme.subText} style={{ marginRight: 6 }} />
          <Text style={styles.postFilterText}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postFilterBtn}>
          <Feather name="play-circle" size={14} color={theme.subText} style={{ marginRight: 6 }} />
          <Text style={styles.postFilterText}>Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postFilterBtn}>
          <Feather name="bar-chart-2" size={14} color={theme.subText} style={{ marginRight: 6 }} />
          <Text style={styles.postFilterText}>Performances</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {POSTS_FEED.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeaderRow}>
            <Image source={{ uri: PROFILE.avatar }} style={styles.postAvatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.postName}>{PROFILE.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={14} color={theme.primary} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.postSubMeta}>{PROFILE.username} • {post.time}</Text>
            </View>
            <TouchableOpacity><Feather name="more-horizontal" size={20} color={theme.subText} /></TouchableOpacity>
          </View>

          <Text style={styles.postText}>{post.text}</Text>

          {/* Single Image */}
          {post.image && <Image source={{ uri: post.image }} style={styles.postFullImage} />}

          {/* Performance Embed (Mocked based on image 4) */}
          {post.isPerformance && (
            <View style={styles.postPerformanceEmbed}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="trophy" size={14} color="#f1c40f" style={{ marginRight: 6 }}/>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>Player of the Match</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.perfBoxScore}>86*</Text>
                    <Text style={styles.perfBoxBalls}> (52)</Text>
                  </View>
                  <Text style={styles.perfBoxDetails}>7 Fours • 3 Sixes</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Image source={{uri: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff'}} style={{width: 20, height: 20, borderRadius: 10, marginRight: 6}} />
                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: 'bold' }}>vs Royal Strikers</Text>
                  </View>
                  <Text style={{ color: theme.primary, fontSize: 11, fontWeight: 'bold' }}>Won by 6 wickets</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Feather name="calendar" size={12} color={theme.subText} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.subText, fontSize: 11 }}>Yesterday</Text>
                  </View>
                  <Text style={{ color: theme.subText, fontSize: 11 }}>T20 League</Text>
                </View>
              </View>
            </View>
          )}

          {/* Multiple Images Grid */}
          {post.images && (
            <View style={styles.postImageGrid}>
              <Image source={{ uri: post.images[0] }} style={[styles.postGridImg, { flex: 2, marginRight: 4 }]} />
              <View style={{ flex: 1 }}>
                <Image source={{ uri: post.images[1] }} style={[styles.postGridImg, { marginBottom: 4 }]} />
                <Image source={{ uri: post.images[2] }} style={styles.postGridImg} />
              </View>
            </View>
          )}

          <View style={styles.postActionsRow}>
            <TouchableOpacity style={styles.postActionBtn}><Feather name="heart" size={18} color={theme.subText} /><Text style={styles.postActionText}>{post.likes}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.postActionBtn}><Feather name="message-circle" size={18} color={theme.subText} /><Text style={styles.postActionText}>{post.comments}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.postActionBtn}><Feather name="corner-up-right" size={18} color={theme.subText} /><Text style={styles.postActionText}>{post.shares}</Text></TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TouchableOpacity><Feather name="bookmark" size={18} color={theme.subText} /></TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* End of posts indicator */}
      <View style={styles.endOfPosts}>
        <View style={styles.endOfPostsIcon}><Feather name="edit" size={20} color={theme.primary} /></View>
        <Text style={styles.endOfPostsTitle}>No more posts yet</Text>
        <Text style={styles.endOfPostsSub}>New posts will appear here.</Text>
      </View>

    </View>
  );


  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {renderProfileHeader()}
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Stats' && renderStats()}
        {activeTab === 'Matches' && renderMatches()}
        {activeTab === 'Posts' && renderPosts()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// UNIFIED STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  // Header & Info
  profileTopContainer: { paddingHorizontal: 16, paddingTop: 8 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  navTitle: { color: theme.text, fontSize: 16, fontWeight: 'bold' },
  navRight: { flexDirection: 'row', alignItems: 'center' },
  
  profileInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: theme.primary, padding: 2, marginRight: 16 },
  avatar: { width: '100%', height: '100%', borderRadius: 45 },
  profileDetails: { flex: 1 },
  nameText: { color: theme.text, fontSize: 20, fontWeight: 'bold' },
  usernameText: { color: theme.subText, fontSize: 13, marginTop: 2, marginBottom: 4 },
  locationText: { color: theme.subText, fontSize: 12, marginLeft: 4 },
  
  rolePill: { alignSelf: 'flex-start', backgroundColor: theme.primaryDark, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginVertical: 8 },
  rolePillText: { color: theme.primary, fontSize: 11, fontWeight: 'bold' },
  
  playStylesRow: { flexDirection: 'row', alignItems: 'center' },
  playStyleText: { color: theme.subText, fontSize: 11, marginLeft: 4 },
  dotSeparator: { width: 1, height: 12, backgroundColor: theme.border, marginHorizontal: 8 },

  actionButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  btnPrimary: { flex: 1, flexDirection: 'row', backgroundColor: theme.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
  btnSecondary: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: theme.border, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { color: theme.text, fontSize: 13, fontWeight: 'bold' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: theme.cardLight, borderRadius: 12, paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: theme.border },
  statBox: { alignItems: 'center' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statNum: { color: theme.text, fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  statLabel: { color: theme.subText, fontSize: 11 },
  statDivider: { width: 1, backgroundColor: theme.border },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: theme.primary },
  tabText: { color: theme.subText, fontSize: 13, fontWeight: '600' },
  activeTabText: { color: theme.text },

  tabContent: { paddingTop: 16 },

  // Shared Card Styles
  card: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  cardSectionTitle: { color: theme.subText, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  
  // Overview Tab
  identityGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  identityItem: { width: '50%', marginBottom: 12 },
  idLabel: { color: theme.subText, fontSize: 11, marginBottom: 4 },
  idValue: { color: theme.text, fontSize: 13, fontWeight: '600' },
  primaryTeamRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  primaryTeamLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.cardLight, marginRight: 12 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  sectionTitleText: { color: theme.text, fontSize: 16, fontWeight: 'bold' },
  seeAllText: { color: theme.primary, fontSize: 12, fontWeight: 'bold' },

  perfCard: { width: 150, backgroundColor: theme.cardLight, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginRight: 12 },
  perfTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  perfScore: { color: theme.primary, fontSize: 20, fontWeight: 'bold' },
  perfBalls: { color: theme.subText, fontSize: 11 },
  perfIconBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
  perfDetails: { color: theme.subText, fontSize: 11, marginBottom: 2 },
  perfVs: { color: theme.text, fontSize: 11, marginBottom: 8 },
  potmBadge: { backgroundColor: theme.primaryDark, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  potmText: { color: theme.primary, fontSize: 9, fontWeight: 'bold' },
  perfFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, marginTop: 'auto' },
  perfTime: { color: theme.subText, fontSize: 10 },

  twoColGrid: { flexDirection: 'row', paddingHorizontal: 16 },
  miniCardTitle: { color: theme.text, fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  sectionHeaderRowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  formChart: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16 },
  formCol: { alignItems: 'center' },
  formScoreText: { color: theme.text, fontSize: 9, marginBottom: 4 },
  formBar: { width: 14, borderTopLeftRadius: 2, borderTopRightRadius: 2, marginBottom: 4 },
  formResultBadge: { borderWidth: 1, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  formResultText: { fontSize: 8, fontWeight: 'bold' },

  teamListRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  smallTeamLogo: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.cardLight, marginRight: 10 },
  teamListTitle: { color: theme.text, fontSize: 12, fontWeight: '600' },
  teamListSub: { color: theme.subText, fontSize: 10, marginTop: 2 },
  teamListYear: { color: theme.subText, fontSize: 10 },
  trophyIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(241, 196, 15, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },

  // Stats Tab
  statsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  statsSectionTitle: { color: theme.text, fontSize: 16, fontWeight: 'bold' },
  formatDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  formatDropdownText: { color: theme.text, fontSize: 11, marginRight: 6 },
  
  statsGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', width: '22%', marginBottom: 12 },
  statItemLabel: { color: theme.subText, fontSize: 10, marginBottom: 4 },
  statItemValue: { color: theme.text, fontSize: 16, fontWeight: 'bold' },
  statsDivider: { height: 1, backgroundColor: theme.border, marginVertical: 12 },
  trendGraphMock: { height: 100, backgroundColor: theme.cardLight, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },

  // Matches Tab
  matchFilterPill: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  matchFilterActive: { backgroundColor: theme.primaryDark, borderColor: theme.primary },
  matchFilterText: { color: theme.subText, fontSize: 12, fontWeight: '600' },
  matchFilterTextActive: { color: theme.primary },

  matchHistoryCard: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 16, overflow: 'hidden' },
  matchHistoryHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  formatPill: { backgroundColor: theme.cardLight, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  formatPillText: { color: theme.primary, fontSize: 9, fontWeight: 'bold' },
  matchHistoryLeague: { color: theme.subText, fontSize: 11, flex: 1 },
  matchHistoryTime: { color: theme.subText, fontSize: 10 },
  
  matchHistoryBody: { flexDirection: 'row', padding: 12 },
  matchHistoryTeams: { flex: 1, paddingRight: 12, justifyContent: 'center' },
  matchTeamRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  matchTeamLogo: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.cardLight, marginRight: 8 },
  matchTeamName: { color: theme.text, fontSize: 13, fontWeight: '600' },
  matchHistoryVS: { color: theme.subText, fontSize: 10, fontWeight: 'bold', marginVertical: 4, paddingLeft: 8 },
  matchHistoryResult: { fontSize: 11, fontWeight: 'bold', marginTop: 8 },

  matchHistoryPerfBox: { width: 140, backgroundColor: theme.cardLight, borderRadius: 8, borderWidth: 1, borderColor: theme.border, padding: 10, position: 'relative' },
  perfBoxLabel: { color: theme.subText, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  potmSmallBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(241, 196, 15, 0.15)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  potmSmallText: { color: '#f1c40f', fontSize: 8, fontWeight: 'bold', marginLeft: 2 },
  perfBoxScore: { color: theme.text, fontSize: 18, fontWeight: 'bold' },
  perfBoxBalls: { color: theme.subText, fontSize: 11 },
  perfBoxDetails: { color: theme.subText, fontSize: 10, marginTop: 4 },

  viewAllMatchesBtn: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  viewAllMatchesText: { color: theme.text, fontSize: 12, fontWeight: 'bold', marginRight: 4 },

  // Posts Tab
  postFiltersRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  postFilterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  postFilterActive: { borderBottomColor: theme.primary },
  postFilterText: { color: theme.subText, fontSize: 12, fontWeight: '600' },

  postCard: { backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border, paddingVertical: 16, paddingHorizontal: 16 },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  postName: { color: theme.text, fontSize: 14, fontWeight: 'bold' },
  postSubMeta: { color: theme.subText, fontSize: 11, marginTop: 2 },
  postText: { color: theme.text, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  postFullImage: { width: '100%', height: 200, borderRadius: 12, backgroundColor: theme.cardLight, marginBottom: 12 },
  
  postPerformanceEmbed: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 12 },
  
  postImageGrid: { flexDirection: 'row', height: 200, marginBottom: 12 },
  postGridImg: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: theme.cardLight },

  postActionsRow: { flexDirection: 'row', alignItems: 'center' },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  postActionText: { color: theme.subText, fontSize: 12, marginLeft: 6 },

  endOfPosts: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  endOfPostsIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: theme.cardLight, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  endOfPostsTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  endOfPostsSub: { color: theme.subText, fontSize: 12 },
});