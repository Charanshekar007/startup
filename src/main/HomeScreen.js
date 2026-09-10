import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // <-- IMPORT ADDED
import { useAuthStore } from '../store/authStore';

export default function HomeScreen() {
  const navigation = useNavigation(); // <-- HOOK ADDED
  const { activeSport } = useAuthStore();
  const [activeTab, setActiveTab] = useState('FOR_YOU'); // Defaulting to FOR_YOU to match Image 2

  // --- UI COLORS ---
  const colors = {
    bg: '#0a0a0a',
    card: '#161616',
    primary: '#2ecc71',
    text: '#ffffff',  
    subText: '#888888',
    border: '#222222',
    accent: '#1e3a29' // Subtle green background for tags
  };

  // --- MOCK DATA: GLOBAL FEED ---
  const feedPosts = [
    {
      id: '1',
      name: 'Arjun Reddy',
      username: '@arjunreddy07',
      sport: 'Cricket',
      location: 'Hyderabad, India',
      time: '2h',
      caption: 'Match day! Nothing feels better than doing what you love. 💚🏏',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 128,
      comments: 24,
    },
    {
      id: '2',
      name: 'Sneha Iyer',
      username: '@snehaiyer11',
      sport: 'Football',
      location: 'Bengaluru, India',
      time: '4h',
      caption: 'Training hard today for a stronger tomorrow. One step at a time. ⚽✨',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 96,
      comments: 18,
    }
  ];

  // --- MOCK DATA: TRENDING (FOR YOU) ---
  const trendingVideos = [
    { id: 't1', title: "Kohli's century powers India to victory", time: '2h ago', views: '12K views', image: 'https://images.unsplash.com/photo-1624526267942-ab0f0b7148eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 't2', title: "Mumbai win the T20 Championship 2025", time: '5h ago', views: '18K views', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 't3', title: "Top 5 finishes of the IPL 2025", time: '1d ago', views: '25K views', image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      
      {/* --- 1. CUSTOM TOP HEADER --- */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoIcon, { color: colors.primary }]}>P</Text>
          <Text style={[styles.logoText, { color: colors.text }]}>PLAYFIELD</Text>
        </View>

        <TouchableOpacity style={[styles.locationPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.text }]}>Hyderabad</Text>
          <Feather name="chevron-down" size={14} color={colors.subText} />
        </TouchableOpacity>

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
          <TouchableOpacity>
            <Image source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 2. SEARCH BAR --- */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={20} color={colors.subText} style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search players, teams, matches..."
            placeholderTextColor={colors.subText}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 3. CUSTOM TOP TABS (FEED vs FOR YOU) --- */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.topTab, activeTab === 'FEED' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('FEED')}
        >
          <Text style={[styles.topTabText, { color: activeTab === 'FEED' ? colors.primary : colors.subText }]}>FEED</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.topTab, activeTab === 'FOR_YOU' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('FOR_YOU')}
        >
          <Text style={[styles.topTabText, { color: activeTab === 'FOR_YOU' ? colors.primary : colors.subText }]}>FOR YOU</Text>
        </TouchableOpacity>
      </View>

      {/* --- 4. SCROLLABLE CONTENT AREA --- */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'FEED' ? (
          /* ==========================================
             TAB 1: GLOBAL FEED
          ========================================== */
          <View>
            {feedPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar} />
                  <View style={styles.postMeta}>
                    <View style={styles.postAuthorRow}>
                      <Text style={[styles.postName, { color: colors.text }]}>{post.name}</Text>
                      <Feather name="check-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={[styles.postSubMeta, { color: colors.subText }]}>
                      {post.username} • <Text style={{ color: post.sport === 'Cricket' ? colors.primary : '#3498db' }}>{post.sport}</Text>
                    </Text>
                    <Text style={[styles.postSubMeta, { color: colors.subText, fontSize: 11 }]}>
                      <Feather name="map-pin" size={10} /> {post.location} • {post.time}
                    </Text>
                  </View>
                  <TouchableOpacity><Feather name="more-vertical" size={20} color={colors.subText} /></TouchableOpacity>
                </View>

                <Image source={{ uri: post.image }} style={styles.postImage} />
                <Text style={[styles.postCaption, { color: colors.text }]}>{post.caption}</Text>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="heart" size={20} color="#e74c3c" />
                    <Text style={[styles.actionText, { color: colors.text }]}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="message-circle" size={20} color={colors.subText} />
                    <Text style={[styles.actionText, { color: colors.text }]}>{post.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="share" size={20} color={colors.subText} />
                    <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <TouchableOpacity><Feather name="bookmark" size={20} color={colors.subText} /></TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.postDivider, { backgroundColor: colors.border }]} />
              </View>
            ))}
          </View>
        ) : (
          /* ==========================================
             TAB 2: FOR YOU (PERSONALIZED CRICKET)
          ========================================== */
          <View style={styles.forYouContainer}>
            
            {/* For You Header */}
            <View style={styles.forYouHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={18} color={colors.primary} />
                  <Text style={[styles.forYouTitle, { color: colors.text }]}> For You • {activeSport || 'Cricket'}</Text>
                </View>
                <Text style={[styles.forYouSubtitle, { color: colors.subText }]}>Personalized cricket content for you.</Text>
              </View>
              <TouchableOpacity style={[styles.customizeBtn, { borderColor: colors.border }]}>
                <Feather name="sliders" size={14} color={colors.primary} />
                <Text style={[styles.customizeText, { color: colors.primary }]}>Customize</Text>
              </TouchableOpacity>
            </View>

            {/* --- WIDGET 1: Player to Watch --- */}
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.primary }]}>Player to Watch</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.playerTopRow}>
                <Image source={{uri: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}} style={styles.playerImage} />
                <View style={styles.playerInfo}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[styles.playerName, { color: colors.text }]}>Shubman Gill </Text>
                    <Feather name="check-circle" size={14} color={colors.primary} />
                  </View>
                  <Text style={[styles.playerSub, { color: colors.subText }]}>Top Order Batter • Team India</Text>
                  <Text style={[styles.playerDesc, { color: colors.subText }]}>In exceptional form this season.</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Matches</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Runs</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>842</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>Avg</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>70.16</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>SR</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>94.3</Text>
                </View>
                <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.primary }]}>
                  <Text style={[styles.outlineBtnText, { color: colors.primary }]}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- WIDGET 2: Recent Performance --- */}
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.primary }]}>Recent Performance</Text>
              <Text style={[styles.viewAllText, { color: colors.subText }]}>View all</Text>
            </View>
            <View style={[styles.card, styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={{uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}} style={styles.perfImage} />
              <View style={styles.perfInfo}>
                <Text style={[styles.playerName, { color: colors.text }]}>Shubman Gill</Text>
                <Text style={[styles.perfScore, { color: colors.primary }]}>112 (98)</Text>
                <Text style={[styles.playerSub, { color: colors.subText }]}>vs Australia</Text>
                <Text style={[styles.playerSub, { color: colors.subText, fontSize: 11 }]}>ODI Series • 2d ago</Text>
              </View>
              <View style={styles.perfResult}>
                <Text style={[styles.resultText, { color: colors.primary }]}>Team India won</Text>
                <Text style={[styles.resultSub, { color: colors.subText }]}>by 36 runs</Text>
                <View style={[styles.tagPill, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>Player of the Match</Text>
                </View>
              </View>
            </View>

            {/* --- WIDGET 3: Upcoming Match --- */}
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.primary }]}>Upcoming Match</Text>
              <Text style={[styles.viewAllText, { color: colors.subText }]}>View all</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.matchTop}>
                <Text style={[styles.matchSeries, { color: colors.subText }]}>ODI Series • 1st ODI</Text>
              </View>
              <View style={styles.matchTeamsRow}>
                <View style={styles.teamSide}>
                  <View style={styles.mockLogoTeamA}><MaterialCommunityIcons name="cricket" size={24} color="#fff"/></View>
                  <Text style={[styles.teamName, { color: colors.text }]}>India</Text>
                  <Text style={[styles.teamSub, { color: colors.subText }]}>Men</Text>
                </View>
                <View style={styles.matchCenter}>
                  <Text style={[styles.vsText, { color: colors.text }]}>VS</Text>
                  <Text style={[styles.matchTime, { color: colors.subText }]}>Tomorrow • 2:00 PM</Text>
                  <Text style={[styles.matchTime, { color: colors.subText }]}>Hyderabad</Text>
                </View>
                <View style={styles.teamSide}>
                  <Text style={[styles.teamName, { color: colors.text }]}>England</Text>
                  <Text style={[styles.teamSub, { color: colors.subText }]}>Men</Text>
                  <View style={styles.mockLogoTeamB}><MaterialCommunityIcons name="shield-star-outline" size={24} color="#fff"/></View>
                </View>
              </View>
            </View>

            {/* --- WIDGET 4: Recommended Team --- */}
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.primary }]}>Recommended Team</Text>
              <Text style={[styles.viewAllText, { color: colors.subText }]}>View all</Text>
            </View>
            <View style={[styles.card, styles.teamRowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.srhLogo}><Text style={{color: '#fff', fontWeight: 'bold'}}>SRH</Text></View>
              <View style={styles.teamInfo}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[styles.playerName, { color: colors.text }]}>Sunrisers Hyderabad </Text>
                  <Feather name="check-circle" size={14} color={colors.primary} />
                </View>
                <Text style={[styles.playerSub, { color: colors.subText }]}>T20 Franchise</Text>
                <Text style={[styles.playerSub, { color: colors.subText, fontSize: 12, marginTop: 2 }]}>Strong squad for this season.</Text>
              </View>
              <View style={styles.followAction}>
                <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.primary }]}>
                  <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Follow</Text>
                </TouchableOpacity>
                <Text style={[styles.followersText, { color: colors.subText }]}>28K Followers</Text>
              </View>
            </View>

            {/* --- WIDGET 5: Trending in Cricket --- */}
            <View style={styles.widgetHeader}>
              <Text style={[styles.widgetTitle, { color: colors.primary }]}>Trending in Cricket</Text>
              <Text style={[styles.viewAllText, { color: colors.subText }]}>View all</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
              {trendingVideos.map((video) => (
                <View key={video.id} style={styles.trendingCard}>
                  <View style={styles.trendingImageContainer}>
                    <Image source={{uri: video.image}} style={styles.trendingImage} />
                    <View style={styles.playIconOverlay}>
                      <Feather name="play" size={16} color={colors.primary} />
                    </View>
                  </View>
                  <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
                  <Text style={[styles.trendingMeta, { color: colors.subText }]}>{video.time} • {video.views}</Text>
                </View>
              ))}
            </ScrollView>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', marginRight: 4 },
  logoText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  locationPill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  locationText: { fontSize: 12, fontWeight: '600', marginHorizontal: 6 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { position: 'relative', marginRight: 16 },
  badge: { position: 'absolute', top: -4, right: -6, borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  
  searchWrapper: { paddingHorizontal: 16, paddingBottom: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, height: 44 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14 },

  tabContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  topTab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  topTabText: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },

  scrollContent: { paddingBottom: 100 },
  
  /* Global Feed Styles */
  postCard: { paddingTop: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333', marginRight: 12 },
  postMeta: { flex: 1 },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center' },
  postName: { fontSize: 15, fontWeight: '700' },
  postSubMeta: { fontSize: 12, marginTop: 2 },
  postImage: { width: '100%', height: 240, backgroundColor: '#222', borderRadius: 12, alignSelf: 'center', width: '92%' },
  postCaption: { fontSize: 14, lineHeight: 20, paddingHorizontal: 16, marginTop: 12 },
  postActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, marginBottom: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  postDivider: { height: 1, width: '100%' },

  /* For You Tab Styles */
  forYouContainer: { padding: 16 },
  forYouHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  forYouTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 4 },
  forYouSubtitle: { fontSize: 13, marginTop: 4, marginLeft: 22 },
  customizeBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  customizeText: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
  
  widgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8, paddingHorizontal: 4 },
  widgetTitle: { fontSize: 13, fontWeight: '600' },
  viewAllText: { fontSize: 12 },
  
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 8 },
  
  /* Player to Watch Card */
  playerTopRow: { flexDirection: 'row' },
  playerImage: { width: 70, height: 90, borderRadius: 8, marginRight: 16, backgroundColor: '#222' },
  playerInfo: { flex: 1, justifyContent: 'center' },
  playerName: { fontSize: 16, fontWeight: 'bold' },
  playerSub: { fontSize: 13, marginTop: 4 },
  playerDesc: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  statBox: { alignItems: 'flex-start' },
  statLabel: { fontSize: 11, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  outlineBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  outlineBtnText: { fontSize: 12, fontWeight: 'bold' },

  /* Recent Performance Card */
  rowCard: { flexDirection: 'row', alignItems: 'center' },
  perfImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  perfInfo: { flex: 1 },
  perfScore: { fontSize: 16, fontWeight: 'bold', marginTop: 2, marginBottom: 2 },
  perfResult: { alignItems: 'flex-end' },
  resultText: { fontSize: 12, fontWeight: '600' },
  resultSub: { fontSize: 11, marginTop: 2 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 8 },
  tagText: { fontSize: 10, fontWeight: 'bold' },

  /* Upcoming Match Card */
  matchTop: { alignItems: 'center', marginBottom: 16 },
  matchSeries: { fontSize: 12 },
  matchTeamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamSide: { alignItems: 'center', width: '30%' },
  mockLogoTeamA: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  mockLogoTeamB: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  teamName: { fontSize: 14, fontWeight: 'bold' },
  teamSub: { fontSize: 11, marginTop: 2 },
  matchCenter: { alignItems: 'center' },
  vsText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  matchTime: { fontSize: 11, marginTop: 2 },

  /* Recommended Team Card */
  teamRowCard: { flexDirection: 'row', alignItems: 'center' },
  srhLogo: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#d35400', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  teamInfo: { flex: 1 },
  followAction: { alignItems: 'flex-end' },
  followersText: { fontSize: 10, marginTop: 6 },

  /* Trending Scroll */
  trendingScroll: { overflow: 'visible' },
  trendingCard: { width: 220, marginRight: 16 },
  trendingImageContainer: { position: 'relative' },
  trendingImage: { width: 220, height: 130, borderRadius: 12, backgroundColor: '#222' },
  playIconOverlay: { position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2ecc71' },
  trendingTitle: { fontSize: 13, fontWeight: '600', marginTop: 8, lineHeight: 18 },
  trendingMeta: { fontSize: 11, marginTop: 4 }
});