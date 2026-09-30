import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const theme = {
  bg: '#0a0a0a',
  surface: '#121212',
  surfaceLight: '#1a1a1a',
  primary: '#23c55e',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
  unreadBg: '#0d1f13', // Very subtle green tint for unread
};

// --- MOCK NOTIFICATIONS ---
const MOCK_NOTIFICATIONS = [
  {
    id: '1', type: 'TEAM_INVITE', unread: true, time: '10m',
    avatar: 'https://ui-avatars.com/api/?name=TC&background=1e3a29&color=fff',
    title: 'Team Invitation',
    message: 'Captain Arjun invited you to join Thunder CC as an All-Rounder.',
    hasActions: true
  },
  {
    id: '2', type: 'MATCH_ALERT', unread: true, time: '1h',
    icon: 'whistle', iconColor: '#f39c12',
    title: 'Match Starting',
    message: 'Toss update: Thunder CC won the toss and elected to bat first against Warriors XI.',
  },
  {
    id: '3', type: 'LIKE', unread: false, time: '3h',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    title: 'Rahul Kumar',
    message: 'liked your match highlights video.',
    postImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '4', type: 'FOLLOW', unread: false, time: '1d',
    avatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    title: 'Sneha Iyer',
    message: 'started following you.',
    isFollowing: false
  },
  {
    id: '5', type: 'TOURNAMENT', unread: false, time: '2d',
    icon: 'trophy', iconColor: '#3498db',
    title: 'Tournament Update',
    message: 'Kurukshetra Tournament fixtures for the Quarter Finals have been released.',
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('All');

  const renderNotification = (item) => {
    return (
      <TouchableOpacity key={item.id} style={[styles.notificationCard, item.unread && styles.unreadCard]}>
        
        {/* Left Side: Avatar or Icon */}
        <View style={styles.iconContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.systemIcon, { backgroundColor: `${item.iconColor}20` }]}>
              <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
            </View>
          )}
          {item.type === 'LIKE' && (
            <View style={styles.smallBadge}><Feather name="heart" size={10} color="#fff" /></View>
          )}
        </View>

        {/* Center: Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>
            {item.title} <Text style={styles.messageText}>{item.message}</Text>
          </Text>
          <Text style={styles.timeText}>{item.time} ago</Text>

          {/* Conditional Actions based on type */}
          {item.type === 'TEAM_INVITE' && item.hasActions && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Accept</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>Decline</Text></TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right Side: Post Image or Follow Button */}
        {item.postImage && (
          <Image source={{ uri: item.postImage }} style={styles.postThumbnail} />
        )}
        {item.type === 'FOLLOW' && (
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['All', 'Mentions', 'Matches', 'Teams'].map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {MOCK_NOTIFICATIONS.map(renderNotification)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.text },
  
  filterTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  filterTab: { paddingVertical: 10, marginRight: 24 },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: theme.primary },
  filterTabText: { color: theme.subText, fontSize: 14, fontWeight: '600' },
  filterTabTextActive: { color: theme.primary },

  notificationCard: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  unreadCard: { backgroundColor: theme.unreadBg },
  
  iconContainer: { marginRight: 12, position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  systemIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  smallBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#e74c3c', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.bg },
  
  contentContainer: { flex: 1, justifyContent: 'center' },
  titleText: { fontSize: 14, fontWeight: 'bold', color: theme.text, lineHeight: 20 },
  messageText: { fontWeight: 'normal', color: '#cccccc' },
  timeText: { fontSize: 12, color: theme.subText, marginTop: 4 },
  
  postThumbnail: { width: 48, height: 48, borderRadius: 8, marginLeft: 12 },
  followBtn: { backgroundColor: theme.surfaceLight, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, height: 32, borderRadius: 16, justifyContent: 'center', alignSelf: 'center', marginLeft: 12 },
  followBtnText: { color: theme.text, fontSize: 12, fontWeight: '600' },

  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btnPrimary: { backgroundColor: theme.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnPrimaryText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  btnSecondary: { borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnSecondaryText: { color: theme.subText, fontWeight: 'bold', fontSize: 12 },
});