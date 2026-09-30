import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// --- DESIGN SYSTEM & COLORS ---
const theme = {
  bg: '#0a0a0a',
  surface: '#121212',
  surfaceLight: '#1a1a1a',
  primary: '#23c55e',
  primaryDark: '#112b18',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
  danger: '#e74c3c',
  chatRight: '#1a4024',
  chatLeft: '#1e1e1e',
};

// --- REAL DATA - FETCHED FROM BACKEND ---
const [inbox, setInbox] = useState([]);
const [players, setPlayers] = useState([]);
const [isLoading, setIsLoading] = useState(true);

// Fetch messaging data on component load
useEffect(() => {
  const fetchMessagingData = async () => {
    try {
      // Fetch inbox data
      const inboxResponse = await fetch('/api/messages/inbox');
      if (inboxResponse.ok) {
        const inboxData = await inboxResponse.json();
        setInbox(inboxData);
      } else {
        console.error('Failed to fetch inbox data');
        setInbox([]); // Empty state on error
      }

      // Fetch players/suggestions data
      const playersResponse = await fetch('/api/messages/suggestions');
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        setPlayers(playersData);
      } else {
        console.error('Failed to fetch players data');
        setPlayers([]); // Empty state on error
      }
    } catch (error) {
      console.error('Error fetching messaging data:', error);
      // Set empty states on error
      setInbox([]);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchMessagingData();
}, []); // Empty deps array means run once on mount

  // Fetch messages when active chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await fetch(`/api/messages/${activeChat.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error('Failed to fetch messages');
          setMessages([]); // Empty state on error
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]); // Empty state on error
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeChat]); // Run whenever activeChat changes

export default function MessagingModule() {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('INBOX');
  const [activeChat, setActiveChat] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const navigate = (screen, data = null) => {
    setActiveChat(data);
    setCurrentScreen(screen);
  };

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================
  
  const BottomNav = () => (
    <View style={styles.bottomNav}>
      {['Home', 'Matches', 'Create', 'Discover', 'Profile'].map((tab) => (
        <TouchableOpacity 
          key={tab} 
          style={styles.navItem}
          onPress={() => {
            // FIX: Tell the app to route back through the MainTabs navigator!
            navigation.navigate('MainTabs', { screen: tab });
          }}
        >
          {tab === 'Create' ? (
            <View style={styles.navFab}><Feather name="plus" size={20} color="#000" /></View>
          ) : (
            <>
              <Feather 
                name={tab === 'Home' ? 'home' : tab === 'Matches' ? 'award' : tab === 'Discover' ? 'search' : 'user'} 
                size={22} color={theme.subText}
              />
              <Text style={[styles.navText, { color: theme.subText }]}>{tab}</Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const Header = ({ title, showBack = true, rightIcon, onRightPress, subTitle }) => (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showBack && (
          <TouchableOpacity onPress={() => navigate('INBOX')} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subTitle && <Text style={styles.headerSubtitle}>{subTitle}</Text>}
        </View>
      </View>
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress}>
          <Feather name={rightIcon} size={22} color={theme.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const UserListItem = ({ avatar, name, subtitle, rightElement, onPress }) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.listContent}>
        <Text style={styles.listName}>{name}</Text>
        {subtitle && <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {rightElement && <View>{rightElement}</View>}
    </TouchableOpacity>
  );

  // ==========================================
  // SCREEN 1: INBOX (MAIN)
  // ==========================================
  const renderInbox = () => (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: 24 }]}>Messages</Text>
        </View>
        <TouchableOpacity onPress={() => navigate('NEW_MESSAGE_MENU')}>
          <Feather name="edit" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={styles.searchBar} onPress={() => navigate('SEARCH')}>
          <Feather name="search" size={18} color={theme.subText} />
          <Text style={styles.searchText}>Search messages...</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.requestsBanner} onPress={() => navigate('REQUESTS')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="message-circle" size={18} color={theme.primary} style={{ marginRight: 12 }} />
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Message Requests</Text>
          </View>
          <View style={styles.unreadBadge}><Text style={styles.unreadText}>3</Text></View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>CONVERSATIONS</Text>

        {inbox.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatRow}
            onPress={() => navigate('CHAT', chat)}
          >
            <Image source={{ uri: chat.avatar }} style={styles.chatAvatar} />
            <View style={styles.chatDetails}>
              <View style={styles.chatNameRow}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <View style={styles.chatMessageRow}>
                <Text style={[styles.chatLastMessage, chat.unread && { color: '#fff', fontWeight: '600' }]} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.unread && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{chat.unread}</Text></View>}
                {chat.muted && <Feather name="bell-off" size={14} color={theme.subText} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <BottomNav />
      
    </View>
  );

  // ==========================================
  // SCREEN 2: SEARCH
  // ==========================================
  const renderSearch = () => (
    <View style={styles.container}>
      <View style={[styles.header, { paddingBottom: 8 }]}>
        <TouchableOpacity onPress={() => navigate('INBOX')} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { flex: 1, marginBottom: 0 }]}>
          <Feather name="search" size={18} color={theme.subText} />
          <TextInput 
            style={[styles.searchText, { flex: 1, color: '#fff' }]} 
            placeholder="Thunder" 
            placeholderTextColor={theme.subText}
            autoFocus
          />
          <Feather name="x-circle" size={18} color={theme.subText} />
        </View>
      </View>
      
      <View style={styles.filterTabs}>
        {['All', 'People', 'Groups', 'Teams', 'Matches', 'Tournaments'].map((f, i) => (
          <Text key={f} style={[styles.filterTab, i === 0 && styles.filterTabActive]}>{f}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>People</Text>
        {players.map((p) => (
          <UserListItem avatar={p.avatar} name={p.name} subtitle={p.role} rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>} />
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Teams / Groups</Text>
        {/* TODO: Replace with real teams/groups data from API */}
        <UserListItem avatar="https://ui-avatars.com/api/?name=TC&background=1e3a29&color=fff" name="Thunder CC" subtitle="Cricket Team • 18 Members" rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>} />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Matches</Text>
        {/* TODO: Replace with real matches data from API */}
        <UserListItem avatar="https://ui-avatars.com/api/?name=VS&background=b9770e&color=fff" name="Thunder CC vs Royal Strikers" subtitle="T20 • May 18, 2025" rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>} />
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN 3: MESSAGE REQUESTS
  // ==========================================
  const renderRequests = () => (
    <View style={styles.container}>
      <Header title="Message Requests" />
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity style={styles.requestTabActive}><Text style={{ color: theme.primary, fontSize: 13, fontWeight: 'bold' }}>Direct Requests</Text></TouchableOpacity>
        <TouchableOpacity style={styles.requestTab}><Text style={{ color: theme.subText, fontSize: 13, fontWeight: '600' }}>Group Invitations</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View style={styles.card}>
          <UserListItem avatar={inbox[0]?.avatar || ''} name={inbox[0]?.name || 'Rahul Kumar'} subtitle="Hey, are you looking for a player?" rightElement={<Text style={styles.chatTime}>Today</Text>} />
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Accept</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary}><Text style={styles.btnSecondaryText}>Delete</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnDanger}><Text style={styles.btnDangerText}>Block</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 12 }]}>GROUP INVITATIONS</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Image source={{ uri: inbox[1]?.avatar || '' }} style={[styles.avatar, { width: 32, height: 32 }]} />
            <Text style={[styles.listSubtitle, { marginLeft: 12 }]}>{inbox[1]?.name || 'Arjun Singh'} invited you to:</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: theme.surfaceLight, padding: 12, borderRadius: 8 }}>
            <Image source={{ uri: inbox[2]?.avatar || '' }} style={styles.avatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.listName}>{inbox[2]?.name || 'Saturday Turf Cricket'}</Text>
              <Text style={styles.listSubtitle}>8 members</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]}><Text style={styles.btnPrimaryText}>Join</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btnSecondary, { flex: 1 }]}><Text style={styles.btnSecondaryText}>Decline</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN 4: NEW MESSAGE MENU
  // ==========================================
  const renderNewMessageMenu = () => (
    <View style={styles.container}>
      <Header title="New Message" subTitle="Choose how you want to start" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={styles.menuRow} onPress={() => navigate('NEW_DM')}>
          <View style={styles.menuIcon}><Feather name="user" size={20} color={theme.primary} /></View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>New Direct Message</Text>
            <Text style={styles.menuDesc}>Message a player directly</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => navigate('CREATE_GROUP')}>
          <View style={styles.menuIcon}><Feather name="users" size={20} color={theme.primary} /></View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Create Group</Text>
            <Text style={styles.menuDesc}>Create a custom group chat</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <View style={styles.menuIcon}><MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.primary} /></View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Team Chat</Text>
            <Text style={styles.menuDesc}>Chat with your verified team</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          {/* FIX APPLIED HERE: Replaced Ionicons with MaterialCommunityIcons */}
          <View style={styles.menuIcon}><MaterialCommunityIcons name="cricket" size={22} color={theme.danger} /></View>
          <View style={styles.menuTextCol}>
            <Text style={styles.menuTitle}>Match Discussion</Text>
            <Text style={styles.menuDesc}>Discuss a specific match</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </View>
  );

  // ==========================================
  // SCREEN 5: NEW DIRECT MESSAGE
  // ==========================================
  const renderNewDM = () => (
    <View style={styles.container}>
      <Header title="New Message" />
      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={theme.subText} />
          <TextInput style={styles.searchText} placeholder="Search people..." placeholderTextColor={theme.subText} />
        </View>
        <Text style={styles.sectionTitle}>PEOPLE</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {players.map((p) => (
          <UserListItem
            key={p.id} avatar={p.avatar} name={p.name} subtitle={p.role}
            rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>}
            onPress={() => navigate('CHAT', { type: 'DIRECT', name: p.name, avatar: p.avatar })}
          />
        ))}
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN 6: CREATE GROUP (FLOW)
  // ==========================================
  const renderCreateGroup = () => {
    const toggleMember = (id) => {
      setSelectedMembers(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
    };

    return (
      <View style={styles.container}>
        <Header title="Select Members" />
        
        <View style={styles.stepper}>
          <View style={[styles.stepDot, styles.stepActive]}><Text style={styles.stepTextActive}>1</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}><Text style={styles.stepText}>2</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}><Text style={styles.stepText}>3</Text></View>
        </View>
        <View style={styles.stepperLabels}>
          <Text style={styles.stepLabelActive}>Members</Text>
          <Text style={styles.stepLabel}>Info</Text>
          <Text style={styles.stepLabel}>Create</Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={theme.subText} />
            <TextInput style={styles.searchText} placeholder="Search people..." placeholderTextColor={theme.subText} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {players.map((p) => {
            const isSelected = selectedMembers.includes(p.id);
            return (
              <UserListItem
                key={p.id} avatar={p.avatar} name={p.name} subtitle={p.role}
                onPress={() => toggleMember(p.id)}
                rightElement={
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Feather name="check" size={14} color="#000" />}
                  </View>
                }
              />
            )
          })}
        </ScrollView>
        
        <View style={styles.floatingFooter}>
          <TouchableOpacity
            style={[styles.btnPrimary, { flex: 1, paddingVertical: 14 }]}
            onPress={() => navigate('CHAT', inbox[2] || {})}
          >
            <Text style={[styles.btnPrimaryText, { fontSize: 16 }]}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==========================================
  // SCREEN 7-12: UNIFIED CHAT SCREEN
  // ==========================================
  const renderChat = () => {
    const isDirect = activeChat?.type === 'DIRECT';
    const isGroup = activeChat?.type === 'GROUP';
    const isTeam = activeChat?.type === 'TEAM';
    const isMatch = activeChat?.type === 'MATCH';
    const isTournament = activeChat?.type === 'TOURNAMENT';

    return (
      <View style={styles.container}>
        
        <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={() => navigate('INBOX')} style={{ marginRight: 12 }}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              onPress={() => isGroup ? navigate('GROUP_INFO') : null}
            >
              <Image source={{ uri: activeChat?.avatar }} style={styles.chatHeaderAvatar} />
              <View>
                <Text style={styles.headerTitle} numberOfLines={1}>{activeChat?.name}</Text>
                {isDirect && <Text style={styles.headerSubtitle}>Online</Text>}
                {isGroup && <Text style={styles.headerSubtitle}>8 members</Text>}
                {isTeam && <Text style={styles.headerSubtitle}>Team Chat • 16 Members</Text>}
                {isMatch && <Text style={styles.headerSubtitle}>Match Discussion</Text>}
                {isTournament && <Text style={styles.headerSubtitle}>Tournament Discussion</Text>}
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            {isDirect && <Feather name="phone" size={20} color={theme.primary} style={{ marginRight: 16 }} />}
            {isDirect && <Feather name="video" size={20} color={theme.primary} style={{ marginRight: 16 }} />}
            <Feather name="more-vertical" size={20} color={theme.subText} />
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            
            {isMatch && (
              <View style={styles.contextCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Image source={{ uri: activeChat?.teamAAvatar || 'https://ui-avatars.com/api/?name=TC&background=1e3a29&color=fff' }} style={{width:40, height:40, borderRadius:20}} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{activeChat?.teamAScore || '0'}/{activeChat?.teamBWickets || '0'}</Text>
                    <Text style={{ color: theme.subText, fontSize: 12 }}>{activeChat?.overs || '0.0'} Overs</Text>
                  </View>
                  <Image source={{ uri: activeChat?.teamBAvatar || 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff' }} style={{width:40, height:40, borderRadius:20}} />
                </View>
                <Text style={{ color: theme.primary, textAlign: 'center', fontSize: 12, marginTop: 12 }}>{activeChat?.matchStatus || ''}</Text>
              </View>
            )}

            {isTournament && (
              <View style={styles.contextCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={{ uri: activeChat.avatar }} style={{width:48, height:48, borderRadius:8, marginRight: 12}} />
                  <View>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{activeChat?.name || 'Tournament'}</Text>
                    <Text style={{ color: theme.subText, fontSize: 12, marginTop: 2 }}>{activeChat?.details || ''}</Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.dateSeparator}>Today</Text>

            {isDirect ? (
              <>
                {isLoadingMessages ? (
                  <>
                    <View style={styles.bubbleLeft}>
                      <Text style={styles.bubbleText}>Loading messages...</Text>
                      <Text style={styles.bubbleTime}>Just now</Text>
                    </View>
                  </>
                ) : messages.length === 0 ? (
                  <>
                    <View style={styles.bubbleLeft}>
                      <Text style={styles.bubbleText}>No messages yet</Text>
                      <Text style={styles.bubbleTime}>Just now</Text>
                    </View>
                  </>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      msg.sender === 'user' ? (
                        <View key={msg.id} style={styles.bubbleRight}>
                          <Text style={styles.bubbleText}>{msg.text}</Text>
                          <Text style={styles.bubbleTime}>{msg.time} <Feather name="check-circle" size={10} color={theme.primary}/></Text>
                        </View>
                      ) : (
                        <View key={msg.id} style={styles.bubbleLeft}>
                          <Text style={styles.bubbleText}>{msg.text}</Text>
                          <Text style={styles.bubbleTime}>{msg.time}</Text>
                        </View>
                      )
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                {isLoadingMessages ? (
                  <>
                    <View style={styles.bubbleLeft}>
                      <Text style={styles.bubbleText}>Loading messages...</Text>
                      <Text style={styles.bubbleTime}>Just now</Text>
                    </View>
                  </>
                ) : messages.length === 0 ? (
                  <>
                    <View style={styles.bubbleLeft}>
                      <Text style={styles.bubbleText}>No messages yet</Text>
                      <Text style={styles.bubbleTime}>Just now</Text>
                    </View>
                  </>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      msg.sender === 'user' ? (
                        <View key={msg.id} style={styles.bubbleRight}>
                          <Text style={styles.bubbleText}>{msg.text}</Text>
                          <Text style={styles.bubbleTime}>{msg.time} <Feather name="check-circle" size={10} color={theme.primary}/></Text>
                        </View>
                      ) : (
                        <View key={msg.id} style={styles.bubbleLeft}>
                          <Text style={styles.bubbleText}>{msg.text}</Text>
                          <Text style={styles.bubbleTime}>{msg.time}</Text>
                        </View>
                      )
                    ))}
                  </>
                )}

                {isTeam && (
                  <View style={styles.matchUpdateBubble}>
                    <Text style={styles.matchUpdateTitle}>Match Update</Text>
                    <Text style={styles.bubbleText}>{activeChat?.matchUpdateText || 'Practice match added'}</Text>
                    <Text style={[styles.bubbleTime, { marginTop: 4, color: theme.subText }]}>{activeChat?.matchUpdateTime || 'Sun, 18 May • 4:00 PM'}</Text>
                    <Text style={[styles.bubbleTime, { color: theme.subText }]}>{activeChat?.matchUpdateLocation || 'City Arena'}</Text>
                    <TouchableOpacity style={styles.btnOutline}><Text style={styles.btnOutlineText}>View Match</Text></TouchableOpacity>
                  </View>
                )}

                {isTournament && (
                  <View style={styles.bubbleLeft}>
                    <Text style={[styles.senderName, { color: '#f39c12' }]}>{activeChat?.organizerName || 'Organizer'}</Text>
                    <Text style={styles.bubbleText}>{activeChat?.organizerMessage || 'Quarter finals fixtures are out. Check the fixtures section.'}</Text>
                    <View style={styles.attachmentBubble}>
                      <View style={styles.fileIcon}><Feather name="file-text" size={20} color="#fff" /></View>
                      <View>
                        <Text style={{color:'#fff', fontSize: 13, fontWeight: '500'}}>{activeChat?.attachmentName || 'Quarter_Finals_Fixtures.pdf'}</Text>
                        <Text style={{color: theme.subText, fontSize: 11}}>{activeChat?.attachmentSize || 'PDF • 1.2 MB'}</Text>
                      </View>
                    </View>
                    <Text style={styles.bubbleTime}>{activeChat?.organizerTime || 'Yesterday'}</Text>
                  </View>
                )}
              </>
            )}

          </ScrollView>

          <View style={styles.composerContainer}>
            <TouchableOpacity style={styles.composerIcon}><Feather name="plus" size={22} color={theme.subText} /></TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.composerInput}
                placeholder="Message..."
                placeholderTextColor={theme.subText}
                multiline
              />
              <TouchableOpacity style={styles.inputRightIcon}><Feather name="camera" size={18} color={theme.subText} /></TouchableOpacity>
              <TouchableOpacity style={styles.inputRightIcon}><Feather name="smile" size={18} color={theme.subText} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sendButton}><Feather name="send" size={16} color="#000" /></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  // ==========================================
  // SCREEN 8: GROUP INFO
  // ==========================================
  const renderGroupInfo = () => (
    <View style={styles.container}>
      <Header title="" rightIcon="more-vertical" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image source={{ uri: activeChat?.avatar }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }} />
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>{activeChat?.name}</Text>
          <Text style={{ color: theme.subText, fontSize: 14 }}>8 members</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
          {[
            { icon: 'phone', label: 'Audio' },
            { icon: 'video', label: 'Video' },
            { icon: 'user-plus', label: 'Add' },
            { icon: 'search', label: 'Search' },
          ].map((action, i) => (
            <View key={i} style={{ alignItems: 'center', marginHorizontal: 16 }}>
              <TouchableOpacity style={styles.actionCircle}><Feather name={action.icon} size={20} color={theme.primary} /></TouchableOpacity>
              <Text style={{ color: theme.text, fontSize: 12, marginTop: 8 }}>{action.label}</Text>
            </View>
          ))}
        </View>

        {[
          { icon: 'info', title: 'Group Description', subtitle: 'Regular weekend turf cricket' },
          { icon: 'image', title: 'Media, Links & Files', subtitle: '142 items' },
          { icon: 'bell', title: 'Notifications', subtitle: 'All Messages' },
          { icon: 'users', title: 'Members', subtitle: '8 Members' },
          { icon: 'link', title: 'Invite to Group', subtitle: 'Share link to invite' },
          { icon: 'settings', title: 'Group Permissions', subtitle: 'Only admins can send messages' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.settingsRow}>
            <Feather name={item.icon} size={20} color={theme.subText} style={{ width: 24, marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsTitle}>{item.title}</Text>
              <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.border} />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );

  // ==========================================
  // MAIN ROUTER RENDER
  // ==========================================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {currentScreen === 'INBOX' && renderInbox()}
      {currentScreen === 'SEARCH' && renderSearch()}
      {currentScreen === 'REQUESTS' && renderRequests()}
      {currentScreen === 'NEW_MESSAGE_MENU' && renderNewMessageMenu()}
      {currentScreen === 'NEW_DM' && renderNewDM()}
      {currentScreen === 'CREATE_GROUP' && renderCreateGroup()}
      {currentScreen === 'CHAT' && renderChat()}
      {currentScreen === 'GROUP_INFO' && renderGroupInfo()}
    </SafeAreaView>
  );
}

// ==========================================
// STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text },
  headerSubtitle: { fontSize: 12, color: theme.subText, marginTop: 2 },
  
  // Inputs & Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surfaceLight, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16 },
  searchText: { color: theme.subText, fontSize: 15, marginLeft: 10, flex: 1 },
  
  // Sections & Text
  sectionTitle: { color: theme.subText, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  
  // Lists
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  listContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  listName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listSubtitle: { color: theme.subText, fontSize: 13 },
  
  // Inbox Specific
  requestsBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.primaryDark, padding: 16, borderRadius: 12, marginBottom: 24 },
  chatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  chatAvatar: { width: 52, height: 52, borderRadius: 26 },
  chatDetails: { flex: 1, marginLeft: 16, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 16 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  chatTime: { color: theme.subText, fontSize: 12 },
  chatMessageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatLastMessage: { color: theme.subText, fontSize: 14, flex: 1, marginRight: 16 },
  unreadBadge: { backgroundColor: theme.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  unreadText: { color: '#000', fontSize: 11, fontWeight: 'bold' },

  // Search Tabs
  filterTabs: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 12, marginBottom: 12 },
  filterTab: { color: theme.subText, fontSize: 13, fontWeight: '600', marginRight: 20 },
  filterTabActive: { color: theme.primary },

  // Buttons & Actions
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btnPrimary: { backgroundColor: theme.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  btnSecondary: { borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  btnSecondaryText: { color: theme.subText, fontWeight: 'bold', fontSize: 13 },
  btnDanger: { borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  btnDangerText: { color: theme.danger, fontWeight: 'bold', fontSize: 13 },
  
  // Message Requests Tabs
  requestTabActive: { borderWidth: 1, borderColor: theme.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8 },
  requestTab: { borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8 },

  // New Message Menu
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuTextCol: { flex: 1 },
  menuTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  menuDesc: { color: theme.subText, fontSize: 13 },

  // Create Group Stepper & Checkbox
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: theme.primary },
  stepText: { color: theme.subText, fontSize: 12, fontWeight: 'bold' },
  stepTextActive: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  stepLine: { flex: 1, height: 2, backgroundColor: theme.surfaceLight, marginHorizontal: 8 },
  stepperLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 8 },
  stepLabel: { color: theme.subText, fontSize: 11 },
  stepLabelActive: { color: theme.primary, fontSize: 11, fontWeight: 'bold' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  floatingFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border },

  // Chat Screen
  chatHeaderAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  dateSeparator: { color: theme.subText, fontSize: 11, textAlign: 'center', marginVertical: 16 },
  bubbleLeft: { backgroundColor: theme.chatLeft, padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: '80%', alignSelf: 'flex-start', marginBottom: 8 },
  bubbleRight: { backgroundColor: theme.chatRight, padding: 12, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '80%', alignSelf: 'flex-end', marginBottom: 8 },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 20 },
  bubbleTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  senderName: { color: theme.primary, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  
  // Custom Context Chat Bubbles
  contextCard: { backgroundColor: theme.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  matchUpdateBubble: { backgroundColor: theme.surfaceLight, padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: '85%', alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  matchUpdateTitle: { color: theme.primary, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  btnOutline: { borderWidth: 1, borderColor: theme.border, padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnOutlineText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  attachmentBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, marginTop: 8 },
  fileIcon: { backgroundColor: theme.danger, padding: 8, borderRadius: 8, marginRight: 12 },

  // Chat Composer
  composerContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border },
  composerIcon: { padding: 8 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surfaceLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 8 },
  composerInput: { flex: 1, color: '#fff', fontSize: 15, maxHeight: 100 },
  inputRightIcon: { marginLeft: 12 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },

  // Group Info
  actionCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  settingsTitle: { color: '#fff', fontSize: 15, fontWeight: '500' },
  settingsSubtitle: { color: theme.subText, fontSize: 13, marginTop: 2 },

  // Bottom Navigation (Mimicking Home)
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 12, paddingBottom: 24 },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  navFab: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginTop: -20 },
});