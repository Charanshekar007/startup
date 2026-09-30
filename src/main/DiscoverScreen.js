import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const theme = {
  bg: '#0a0a0a',
  card: '#121212',
  cardLight: '#161616',
  primary: '#23c55e',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
  iconBg: 'rgba(35, 197, 94, 0.1)', // Subtle green tint for category icons
};

// ==========================================
// REAL DATA - FETCHED FROM BACKEND
// ==========================================
const [discoverCategories, setDiscoverCategories] = useState([]);
const [trendingNow, setTrendingNow] = useState([]);
const [searchResults, setSearchResults] = useState({
  players: [],
  teams: [],
  matches: [],
  tournaments: []
});
const SEARCH_TABS = ['All', 'Players', 'Teams', 'Matches', 'Tournaments', 'Grounds', 'Events'];

// Fetch data on component load
useEffect(() => {
  const fetchDiscoverData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/discover/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setDiscoverCategories(categoriesData);
      }

      // Fetch trending now
      const trendingResponse = await fetch('/api/discover/trending');
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingNow(trendingData);
      }

      // Initial empty search results
      setSearchResults({
        players: [],
        teams: [],
        matches: [],
        tournaments: []
      });
    } catch (error) {
      console.error('Error fetching discover data:', error);
      // Set empty states on error
      setDiscoverCategories([]);
      setTrendingNow([]);
      setSearchResults({
        players: [],
        teams: [],
        matches: [],
        tournaments: []
      });
    }
  };

  fetchDiscoverData();
}, []);

// Search function
const handleSearch = async (query, tab) => {
  if (!query.trim()) {
    setSearchResults({
      players: [],
      teams: [],
      matches: [],
      tournaments: []
    });
    return;
  }

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${tab.toLowerCase()}`);
    if (response.ok) {
      const results = await response.json();
      setSearchResults(results);
    }
  } catch (error) {
    console.error('Error searching:', error);
    // Keep previous results or set empty
  }
};

export default function DiscoverScreen() {
  const navigation = useNavigation();
  
  // Toggles between the Discover Dashboard and Search Results View
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('All');

  // ==========================================
  // VIEW 1: MAIN DISCOVER DASHBOARD
  // ==========================================
  const renderDiscoverMain = () => (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Discover</Text>
          <Text style={styles.pageSubtitle}>Explore the cricket world around you.</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color={theme.text} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* FAKE SEARCH BAR (Triggers Search State) */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={[styles.searchBar, { flex: 1 }]}
            onPress={() => setIsSearchActive(true)}
            activeOpacity={0.9}
          >
            <Feather name="search" size={20} color={theme.subText} style={{ marginRight: 10 }} />
            <Text style={styles.searchPlaceholder}>Search players, teams, matches...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="sliders" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* CATEGORY GRID */}
        <View style={styles.gridContainer}>
          {discoverCategories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.gridItem}>
              <View style={styles.gridIconContainer}>
                <MaterialCommunityIcons name={cat.icon} size={28} color={theme.primary} />
              </View>
              <Text style={styles.gridTitle}>{cat.title}</Text>
              <Text style={styles.gridSubtitle}>{cat.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TRENDING NOW SCROLL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
          {trendingNow.map(item => (
            <TouchableOpacity key={item.id} style={styles.trendingCard}>
              <Image source={{ uri: item.image }} style={styles.trendingImage} />
              <View style={styles.trendingOverlay}>
                <Text style={styles.trendingCardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {item.isLive && <View style={styles.liveDot} />}
                  <Text style={[styles.trendingCardSub, item.isLive && { color: theme.primary }]}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );

  // ==========================================
  // VIEW 2: SEARCH RESULTS
  // ==========================================
  const renderSearchResults = () => (
    <View style={styles.container}>
      {/* SEARCH HEADER */}
      <View style={styles.searchActiveHeader}>
        <TouchableOpacity 
          onPress={() => {
            setIsSearchActive(false);
            setSearchQuery('');
            Keyboard.dismiss();
          }} 
          style={{ paddingRight: 16 }}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={[styles.searchBar, { flex: 1, height: 44, marginVertical: 0 }]}>
          <Feather name="search" size={18} color={theme.subText} style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.searchInputActive}
            placeholder="Search..."
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={{ paddingLeft: 16 }}>
          <Feather name="sliders" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* SEARCH TABS */}
      <View style={styles.searchTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.searchTabsScroll}>
          {SEARCH_TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.searchTab, activeSearchTab === tab && styles.searchTabActive]}
              onPress={() => setActiveSearchTab(tab)}
            >
              <Text style={[styles.searchTabText, activeSearchTab === tab && styles.searchTabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PLAYERS RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Players') && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.resultsSectionTitle}>Players</Text>
              {activeSearchTab === 'All' && <TouchableOpacity><Text style={styles.viewAllText}>See All</Text></TouchableOpacity>}
            </View>
            <View style={styles.resultsCard}>
              {SEARCH_RESULTS.players.map((p, index) => (
                <TouchableOpacity key={p.id} style={[styles.resultRow, index !== SEARCH_RESULTS.players.length -1 && styles.borderBottom]}>
                  <Image source={{ uri: p.avatar }} style={styles.resultAvatar} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{p.name}</Text>
                    <Text style={styles.resultSub}>{p.role}</Text>
                    <Text style={styles.resultSubLoc}>{p.location}</Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Feather name="star" size={10} color={theme.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.ratingText}>{p.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* TEAMS RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Teams') && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.resultsSectionTitle}>Teams</Text>
              {activeSearchTab === 'All' && <TouchableOpacity><Text style={styles.viewAllText}>See All</Text></TouchableOpacity>}
            </View>
            <View style={styles.resultsCard}>
              {SEARCH_RESULTS.teams.map((t, index) => (
                <TouchableOpacity key={t.id} style={[styles.resultRow, index !== SEARCH_RESULTS.teams.length -1 && styles.borderBottom]}>
                  <Image source={{ uri: t.logo }} style={styles.resultLogo} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{t.name}</Text>
                    <Text style={styles.resultSubLoc}>{t.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* MATCHES RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Matches') && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.resultsSectionTitle}>Matches</Text>
              {activeSearchTab === 'All' && <TouchableOpacity><Text style={styles.viewAllText}>See All</Text></TouchableOpacity>}
            </View>
            {SEARCH_RESULTS.matches.map((m) => (
              <TouchableOpacity key={m.id} style={styles.matchCard}>
                <Text style={styles.matchLeague}>{m.league}</Text>
                <View style={styles.matchScoreRow}>
                  <View style={styles.matchTeamBlock}>
                    <Image source={{ uri: m.logoA }} style={styles.matchLogo} />
                    <Text style={styles.matchTeamName}>{m.teamA}</Text>
                    <Text style={styles.matchScore}>{m.scoreA}</Text>
                    <Text style={styles.matchOvers}>({m.oversA})</Text>
                  </View>
                  <Text style={styles.matchVS}>VS</Text>
                  <View style={styles.matchTeamBlock}>
                    <Image source={{ uri: m.logoB }} style={styles.matchLogo} />
                    <Text style={styles.matchTeamName}>{m.teamB}</Text>
                    <Text style={styles.matchScore}>{m.scoreB}</Text>
                    <Text style={styles.matchOvers}>({m.oversB})</Text>
                  </View>
                </View>
                <View style={styles.matchFooter}>
                  <Feather name="map-pin" size={12} color={theme.subText} style={{ marginRight: 6 }} />
                  <Text style={styles.matchVenue}>{m.venue}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TOURNAMENTS RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Tournaments') && (
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.resultsSectionTitle}>Tournaments</Text>
            </View>
            <View style={styles.resultsCard}>
              {SEARCH_RESULTS.tournaments.map((t, index) => (
                <TouchableOpacity key={t.id} style={[styles.resultRow, index !== SEARCH_RESULTS.tournaments.length -1 && styles.borderBottom]}>
                  <Image source={{ uri: t.logo }} style={[styles.resultLogo, { borderRadius: 8 }]} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{t.name}</Text>
                    <Text style={styles.resultSub}>{t.season}</Text>
                    <Text style={styles.resultSub}>{t.dates}</Text>
                    <Text style={styles.resultSubLoc}><Feather name="map-pin" size={10}/> {t.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {isSearchActive ? renderSearchResults() : renderDiscoverMain()}
    </SafeAreaView>
  );
}

// ==========================================
// UNIFIED STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { paddingBottom: 100 },

  // --- DISCOVER MAIN HEADER ---
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: theme.text, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: theme.subText },
  bellBtn: { position: 'relative', marginTop: 8 },
  bellBadge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#e74c3c' },

  searchSection: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, marginBottom: 24, alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardLight, borderRadius: 12, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: theme.border },
  searchPlaceholder: { color: theme.subText, fontSize: 15 },
  filterBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.cardLight, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },

  // --- DISCOVER CATEGORY GRID ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  gridItem: { width: (width - 44) / 3, backgroundColor: theme.card, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  gridIconContainer: { marginBottom: 12 },
  gridTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  gridSubtitle: { color: theme.subText, fontSize: 10, textAlign: 'center' },

  // --- TRENDING SCROLL ---
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  viewAllText: { fontSize: 13, fontWeight: 'bold', color: theme.primary },
  
  trendingScroll: { paddingHorizontal: 16 },
  trendingCard: { width: 140, height: 180, borderRadius: 16, marginRight: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  trendingImage: { width: '100%', height: '100%' },
  trendingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 24 },
  trendingCardTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  trendingCardSub: { color: theme.subText, fontSize: 11 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, marginRight: 4 },

  // --- SEARCH RESULTS STATE ---
  searchActiveHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  searchInputActive: { flex: 1, color: theme.text, fontSize: 15 },
  
  searchTabsWrapper: { borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 0 },
  searchTabsScroll: { paddingHorizontal: 16 },
  searchTab: { paddingBottom: 12, marginRight: 24 },
  searchTabActive: { borderBottomWidth: 2, borderBottomColor: theme.primary },
  searchTabText: { color: theme.subText, fontSize: 14, fontWeight: '600' },
  searchTabTextActive: { color: theme.text },

  resultsSection: { paddingHorizontal: 16, marginTop: 16 },
  resultsSectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  
  resultsCard: { backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  resultRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: theme.border },
  
  resultAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  resultLogo: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: theme.cardLight },
  resultInfo: { flex: 1 },
  resultName: { color: theme.text, fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  resultSub: { color: theme.subText, fontSize: 12, marginBottom: 2 },
  resultSubLoc: { color: '#666', fontSize: 11 },
  
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardLight, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: theme.text, fontSize: 11, fontWeight: 'bold' },

  matchCard: { backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 },
  matchLeague: { color: theme.subText, fontSize: 11, textAlign: 'center', marginBottom: 16 },
  matchScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  matchTeamBlock: { alignItems: 'center', flex: 1 },
  matchLogo: { width: 48, height: 48, borderRadius: 24, marginBottom: 8, backgroundColor: theme.cardLight },
  matchTeamName: { color: theme.subText, fontSize: 11, marginBottom: 8 },
  matchScore: { color: theme.text, fontSize: 20, fontWeight: 'bold' },
  matchOvers: { color: theme.subText, fontSize: 11, marginTop: 4 },
  matchVS: { color: theme.subText, fontSize: 12, fontWeight: 'bold', width: 30, textAlign: 'center' },
  
  matchFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, marginTop: 8 },
  matchVenue: { color: theme.subText, fontSize: 11 },
});