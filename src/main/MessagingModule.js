import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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

// --- MOCK DATA ---
const MOCK_INBOX = [
  { id: '1', type: 'DIRECT', name: 'Rahul Kumar', avatar: 'https://ui-avatars.com/api/?name=RK&background=2c3e50&color=fff', lastMessage: 'Hey, are you playing today?', time: '9:30 AM', unread: 2 },
  { id: '2', type: 'TEAM', name: 'Thunder CC', avatar: 'https://ui-avatars.com/api/?name=TC&background=1e3a29&color=fff', lastMessage: 'Captain: Match tomorrow at 6 PM', time: '8:45 AM', muted: true },
  { id: '3', type: 'GROUP', name: 'Saturday Turf Cricket', avatar: 'https://ui-avatars.com/api/?name=ST&background=8e44ad&color=fff', lastMessage: "Arjun: I'll be there by 5", time: 'Yesterday', unread: 1 },
  { id: '4', type: 'MATCH', name: 'Thunder CC vs R. Strikers', avatar: 'https://ui-avatars.com/api/?name=VS&background=b9770e&color=fff', lastMessage: 'Vikram: Need 42 from 30', time: 'Yesterday', unread: 4 },
  { id: '5', type: 'TOURNAMENT', name: 'Kurukshetra Tournament', avatar: 'https://ui-avatars.com/api/?name=KT&background=c0392b&color=fff', lastMessage: 'Organizer: Quarter finals fixed', time: 'Mon' },
];

const MOCK_PLAYERS = [
  { id: 'p1', name: 'Rahul Kumar', role: 'Cricket • All-Rounder', avatar: 'https://ui-avatars.com/api/?name=RK&background=2c3e50&color=fff' },
  { id: 'p2', name: 'Arjun Singh', role: 'Cricket • Batter', avatar: 'https://ui-avatars.com/api/?name=AS&background=27ae60&color=fff' },
  { id: 'p3', name: 'Vikram Rao', role: 'Cricket • Bowler', avatar: 'https://ui-avatars.com/api/?name=VR&background=c0392b&color=fff' },
  { id: 'p4', name: 'Karthik Nair', role: 'Cricket • Wicket Keeper', avatar: 'https://ui-avatars.com/api/?name=KN&background=8e44ad&color=fff' },
  { id: 'p5', name: 'Charan Teja', role: 'Cricket • All-Rounder', avatar: 'https://ui-avatars.com/api/?name=CT&background=d35400&color=fff' },
];

export default function MessagingModule() {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('INBOX'); 
  const [activeChat, setActiveChat] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const navigate = (screen, data = null) => {
    setActiveChat(data);
    setCurrentScreen(screen);
  };

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================
  
  const BottomNav = () => (
    <View className="flex-row justify-around items-center bg-[#0a0a0a] border-t border-[#222222] py-3 pb-6">
      {['Home', 'Matches', 'Create', 'Discover', 'Profile'].map((tab) => (
        <TouchableOpacity 
          key={tab} 
          className="items-center"
          onPress={() => {
            // FIX: Tell the app to route back through the MainTabs navigator!
            navigation.navigate('MainTabs', { screen: tab });
          }}
        >
          {tab === 'Create' ? (
            <View className="w-12 h-12 rounded-full bg-[#23c55e] items-center justify-center -mt-5"><Feather name="plus" size={20} color="#000" /></View>
          ) : (
            <>
              <Feather 
                name={tab === 'Home' ? 'home' : tab === 'Matches' ? 'award' : tab === 'Discover' ? 'search' : 'user'} 
                size={22} color={theme.subText}
              />
              <Text className="text-[10px] font-semibold mt-1 text-[#888888]">{tab}</Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const Header = ({ title, showBack = true, rightIcon, onRightPress, subTitle }) => (
    <View className="flex-row items-center justify-between px-4 pt-3 pb-4">
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity onPress={() => navigate('INBOX')} className="mr-4">
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <View>
          <Text className="text-xl font-bold text-white">{title}</Text>
          {subTitle && <Text className="text-xs text-[#888888] mt-0.5">{subTitle}</Text>}
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
    <TouchableOpacity className="flex-row items-center mb-4" onPress={onPress}>
      <Image source={{ uri: avatar }} className="w-11 h-11 rounded-full" />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-white text-[15px] font-semibold mb-0.5">{name}</Text>
        {subtitle && <Text className="text-[#888888] text-[13px]" numberOfLines={1}>{subtitle}</Text>}
      </View>
      {rightElement && <View>{rightElement}</View>}
    </TouchableOpacity>
  );

  // ==========================================
  // SCREEN 1: INBOX (MAIN)
  // ==========================================
  const renderInbox = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      
      <View className="flex-row items-center justify-between px-4 pt-3 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Messages</Text>
        </View>
        <TouchableOpacity onPress={() => navigate('NEW_MESSAGE_MENU')}>
          <Feather name="edit" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity className="flex-row items-center bg-[#1a1a1a] rounded-full px-4 py-2.5 mb-4" onPress={() => navigate('SEARCH')}>
          <Feather name="search" size={18} color={theme.subText} />
          <Text className="text-[#888888] text-[15px] ml-2.5 flex-1">Search messages...</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between bg-[#112b18] p-4 rounded-xl mb-6" onPress={() => navigate('REQUESTS')}>
          <View className="flex-row items-center">
            <Feather name="message-circle" size={18} color={theme.primary} style={{ marginRight: 12 }} />
            <Text className="text-white text-sm font-semibold">Message Requests</Text>
          </View>
          <View className="bg-[#23c55e] rounded-[10px] px-1.5 py-0.5 min-w-[20px] items-center"><Text className="text-black text-[11px] font-bold">3</Text></View>
        </TouchableOpacity>

        <Text className="text-[#888888] text-xs font-bold tracking-widest uppercase mb-3">CONVERSATIONS</Text>

        {MOCK_INBOX.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            className="flex-row items-center mb-5"
            onPress={() => navigate('CHAT', chat)}
          >
            <Image source={{ uri: chat.avatar }} className="w-[52px] h-[52px] rounded-full" />
            <View className="flex-1 ml-4 border-b border-[#222222] pb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-white text-base font-semibold">{chat.name}</Text>
                <Text className="text-[#888888] text-xs">{chat.time}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className={`text-sm flex-1 mr-4 ${chat.unread ? 'text-white font-semibold' : 'text-[#888888]'}`} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.unread && <View className="bg-[#23c55e] rounded-[10px] px-1.5 py-0.5 min-w-[20px] items-center"><Text className="text-black text-[11px] font-bold">{chat.unread}</Text></View>}
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
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <TouchableOpacity onPress={() => navigate('INBOX')} className="mr-3">
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View className="flex-row items-center bg-[#1a1a1a] rounded-full px-4 py-2.5 flex-1 mb-0">
          <Feather name="search" size={18} color={theme.subText} />
          <TextInput 
            className="text-[15px] ml-2.5 flex-1 text-white" 
            placeholder="Thunder" 
            placeholderTextColor={theme.subText}
            autoFocus
          />
          <Feather name="x-circle" size={18} color={theme.subText} />
        </View>
      </View>
      
      <View className="flex-row px-4 border-b border-[#222222] pb-3 mb-3">
        {['All', 'People', 'Groups', 'Teams', 'Matches', 'Tournaments'].map((f, i) => (
          <Text key={f} className={`text-[13px] font-semibold mr-5 ${i === 0 ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{f}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-[#888888] text-xs font-bold tracking-widest uppercase mb-3">People</Text>
        <UserListItem avatar={MOCK_PLAYERS[0].avatar} name="Rahul Kumar" subtitle="Cricket • All-Rounder" rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>} />
        
        <Text className="text-[#888888] text-xs font-bold tracking-widest uppercase mb-3 mt-6">Teams / Groups</Text>
        <UserListItem avatar={MOCK_INBOX[1].avatar} name="Thunder CC" subtitle="Cricket Team • 18 Members" rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>} />
        
        <Text className="text-[#888888] text-xs font-bold tracking-widest uppercase mb-3 mt-6">Matches</Text>
        <UserListItem avatar={MOCK_INBOX[3].avatar} name="Thunder CC vs Royal Strikers" subtitle="T20 • May 18, 2025" rightElement={<Feather name="chevron-right" size={16} color={theme.subText}/>} />
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN 3: MESSAGE REQUESTS
  // ==========================================
  const renderRequests = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <Header title="Message Requests" />
      <View className="flex-row px-4 mb-4">
        <TouchableOpacity className="border border-[#23c55e] py-2 px-4 rounded-full mr-2"><Text className="text-[#23c55e] text-[13px] font-bold">Direct Requests</Text></TouchableOpacity>
        <TouchableOpacity className="border border-[#222222] py-2 px-4 rounded-full mr-2"><Text className="text-[#888888] text-[13px] font-semibold">Group Invitations</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View className="bg-[#121212] rounded-2xl p-4 mb-4 border border-[#222222]">
          <UserListItem avatar={MOCK_PLAYERS[0].avatar} name="Rahul Kumar" subtitle="Hey, are you looking for a player?" rightElement={<Text className="text-[#888888] text-xs">Today</Text>} />
          <View className="flex-row mt-3 gap-2">
            <TouchableOpacity className="bg-[#23c55e] py-2 px-4 rounded-lg items-center"><Text className="text-black font-bold text-[13px]">Accept</Text></TouchableOpacity>
            <TouchableOpacity className="border border-[#222222] py-2 px-4 rounded-lg items-center"><Text className="text-[#888888] font-bold text-[13px]">Delete</Text></TouchableOpacity>
            <TouchableOpacity className="border border-[#222222] py-2 px-4 rounded-lg items-center"><Text className="text-[#e74c3c] font-bold text-[13px]">Block</Text></TouchableOpacity>
          </View>
        </View>

        <Text className="text-[#888888] text-xs font-bold tracking-widest uppercase mb-3 mt-4">GROUP INVITATIONS</Text>
        
        <View className="bg-[#121212] rounded-2xl p-4 mb-4 border border-[#222222]">
          <View className="flex-row items-center mb-4">
            <Image source={{ uri: MOCK_PLAYERS[1].avatar }} className="w-8 h-8 rounded-full" />
            <Text className="text-[#888888] text-[13px] ml-3">Arjun Singh invited you to:</Text>
          </View>
          <View className="flex-row items-center mb-4 bg-[#1a1a1a] p-3 rounded-lg">
            <Image source={{ uri: MOCK_INBOX[2].avatar }} className="w-11 h-11 rounded-full" />
            <View className="ml-3">
              <Text className="text-white text-[15px] font-semibold mb-0.5">Saturday Turf Cricket</Text>
              <Text className="text-[#888888] text-[13px]">8 members</Text>
            </View>
          </View>
          <View className="flex-row mt-3 gap-2">
            <TouchableOpacity className="bg-[#23c55e] py-2 px-4 rounded-lg items-center flex-1"><Text className="text-black font-bold text-[13px]">Join</Text></TouchableOpacity>
            <TouchableOpacity className="border border-[#222222] py-2 px-4 rounded-lg items-center flex-1"><Text className="text-[#888888] font-bold text-[13px]">Decline</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // ==========================================
  // SCREEN 4: NEW MESSAGE MENU
  // ==========================================
  const renderNewMessageMenu = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <Header title="New Message" subTitle="Choose how you want to start" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity className="flex-row items-center bg-[#121212] p-4 rounded-xl mb-3 border border-[#222222]" onPress={() => navigate('NEW_DM')}>
          <View className="w-10 h-10 rounded-full bg-[#1a1a1a] items-center justify-center mr-4"><Feather name="user" size={20} color={theme.primary} /></View>
          <View className="flex-1">
            <Text className="text-white text-[15px] font-semibold mb-0.5">New Direct Message</Text>
            <Text className="text-[#888888] text-[13px]">Message a player directly</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-[#121212] p-4 rounded-xl mb-3 border border-[#222222]" onPress={() => navigate('CREATE_GROUP')}>
          <View className="w-10 h-10 rounded-full bg-[#1a1a1a] items-center justify-center mr-4"><Feather name="users" size={20} color={theme.primary} /></View>
          <View className="flex-1">
            <Text className="text-white text-[15px] font-semibold mb-0.5">Create Group</Text>
            <Text className="text-[#888888] text-[13px]">Create a custom group chat</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-[#121212] p-4 rounded-xl mb-3 border border-[#222222]">
          <View className="w-10 h-10 rounded-full bg-[#1a1a1a] items-center justify-center mr-4"><MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.primary} /></View>
          <View className="flex-1">
            <Text className="text-white text-[15px] font-semibold mb-0.5">Team Chat</Text>
            <Text className="text-[#888888] text-[13px]">Chat with your verified team</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-[#121212] p-4 rounded-xl mb-3 border border-[#222222]">
          {/* FIX APPLIED HERE: Replaced Ionicons with MaterialCommunityIcons */}
          <View className="w-10 h-10 rounded-full bg-[#1a1a1a] items-center justify-center mr-4"><MaterialCommunityIcons name="cricket" size={22} color={theme.danger} /></View>
          <View className="flex-1">
            <Text className="text-white text-[15px] font-semibold mb-0.5">Match Discussion</Text>
            <Text className="text-[#888888] text-[13px]">Discuss a specific match</Text>
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
    <View className="flex-1 bg-[#0a0a0a]">
      <Header title="New Message" />
      <View className="px-4">
        <View className="flex-row items-center bg-[#1a1a1a] rounded-full px-4 py-2.5 mb-4">
          <Feather name="search" size={18} color={theme.subText} />
          <TextInput className="text-[#888888] text-[15px] ml-2.5 flex-1 text-white" placeholder="Search people..." placeholderTextColor={theme.subText} />
        </View>
        <Text className="text-[#888888] text-xs font-bold tracking-widest uppercase mb-3">PEOPLE</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {MOCK_PLAYERS.map(p => (
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
      <View className="flex-1 bg-[#0a0a0a]">
        <Header title="Select Members" />
        
        <View className="flex-row items-center justify-center px-8">
          <View className="w-7 h-7 rounded-full items-center justify-center bg-[#23c55e]"><Text className="text-black text-xs font-bold">1</Text></View>
          <View className="flex-1 h-0.5 bg-[#1a1a1a] mx-2" />
          <View className="w-7 h-7 rounded-full bg-[#1a1a1a] items-center justify-center"><Text className="text-[#888888] text-xs font-bold">2</Text></View>
          <View className="flex-1 h-0.5 bg-[#1a1a1a] mx-2" />
          <View className="w-7 h-7 rounded-full bg-[#1a1a1a] items-center justify-center"><Text className="text-[#888888] text-xs font-bold">3</Text></View>
        </View>
        <View className="flex-row justify-between px-6 mt-2">
          <Text className="text-[#23c55e] text-[11px] font-bold">Members</Text>
          <Text className="text-[#888888] text-[11px]">Info</Text>
          <Text className="text-[#888888] text-[11px]">Create</Text>
        </View>

        <View className="px-4 mt-4">
          <View className="flex-row items-center bg-[#1a1a1a] rounded-full px-4 py-2.5 mb-4">
            <Feather name="search" size={18} color={theme.subText} />
            <TextInput className="text-[#888888] text-[15px] ml-2.5 flex-1 text-white" placeholder="Search people..." placeholderTextColor={theme.subText} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {MOCK_PLAYERS.map(p => {
            const isSelected = selectedMembers.includes(p.id);
            return (
              <UserListItem 
                key={p.id} avatar={p.avatar} name={p.name} subtitle={p.role} 
                onPress={() => toggleMember(p.id)}
                rightElement={
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-[#23c55e] border-[#23c55e]' : 'border-[#222222]'}`}>
                    {isSelected && <Feather name="check" size={14} color="#000" />}
                  </View>
                }
              />
            )
          })}
        </ScrollView>
        
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#222222]">
          <TouchableOpacity 
            className="bg-[#23c55e] py-3.5 px-4 rounded-lg items-center flex-1"
            onPress={() => navigate('CHAT', MOCK_INBOX[2])} 
          >
            <Text className="text-black font-bold text-base">Next</Text>
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
      <View className="flex-1 bg-[#0a0a0a]">
        
        <View className="flex-row items-center justify-between px-4 pt-3 pb-3 border-b border-[#222222]">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => navigate('INBOX')} className="mr-3">
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center flex-1"
              onPress={() => isGroup ? navigate('GROUP_INFO') : null}
            >
              <Image source={{ uri: activeChat?.avatar }} className="w-9 h-9 rounded-full mr-3" />
              <View>
                <Text className="text-xl font-bold text-white" numberOfLines={1}>{activeChat?.name}</Text>
                {isDirect && <Text className="text-xs text-[#888888] mt-0.5">Online</Text>}
                {isGroup && <Text className="text-xs text-[#888888] mt-0.5">8 members</Text>}
                {isTeam && <Text className="text-xs text-[#888888] mt-0.5">Team Chat • 16 Members</Text>}
                {isMatch && <Text className="text-xs text-[#888888] mt-0.5">Match Discussion</Text>}
                {isTournament && <Text className="text-xs text-[#888888] mt-0.5">Tournament Discussion</Text>}
              </View>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row">
            {isDirect && <Feather name="phone" size={20} color={theme.primary} style={{ marginRight: 16 }} />}
            {isDirect && <Feather name="video" size={20} color={theme.primary} style={{ marginRight: 16 }} />}
            <Feather name="more-vertical" size={20} color={theme.subText} />
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            
            {isMatch && (
              <View className="bg-[#1a1a1a] rounded-xl p-4 mb-4 border border-[#222222]">
                <View className="flex-row justify-between items-center">
                  <Image source={{ uri: 'https://ui-avatars.com/api/?name=TC&background=1e3a29&color=fff' }} className="w-10 h-10 rounded-full" />
                  <View className="items-center">
                    <Text className="text-white text-2xl font-bold">152/4</Text>
                    <Text className="text-[#888888] text-xs">18.3 Overs</Text>
                  </View>
                  <Image source={{ uri: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff' }} className="w-10 h-10 rounded-full" />
                </View>
                <Text className="text-[#23c55e] text-center text-xs mt-3">Thunder CC need 48 runs from 9 balls</Text>
              </View>
            )}

            {isTournament && (
              <View className="bg-[#1a1a1a] rounded-xl p-4 mb-4 border border-[#222222]">
                <View className="flex-row items-center">
                  <Image source={{ uri: activeChat.avatar }} className="w-12 h-12 rounded-lg mr-3" />
                  <View>
                    <Text className="text-white font-bold text-sm">Kurukshetra Tournament</Text>
                    <Text className="text-[#888888] text-xs mt-0.5">Quarter Finals • May 20 - May 25</Text>
                  </View>
                </View>
              </View>
            )}

            <Text className="text-[#888888] text-[11px] text-center my-4">Today</Text>

            {isDirect ? (
              <>
                <View className="bg-[#1e1e1e] p-3 rounded-2xl rounded-bl-[4px] max-w-[80%] self-start mb-2">
                  <Text className="text-white text-[15px] leading-5">Hey, are you playing today?</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:30 AM</Text>
                </View>
                <View className="bg-[#1a4024] p-3 rounded-2xl rounded-br-[4px] max-w-[80%] self-end mb-2">
                  <Text className="text-white text-[15px] leading-5">Yes, I'm playing.</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:31 AM <Feather name="check-circle" size={10} color={theme.primary}/></Text>
                </View>
                <View className="bg-[#1e1e1e] p-3 rounded-2xl rounded-bl-[4px] max-w-[80%] self-start mb-2">
                  <Text className="text-white text-[15px] leading-5">Great! Which ground?</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:31 AM</Text>
                </View>
                <View className="bg-[#1a4024] p-3 rounded-2xl rounded-br-[4px] max-w-[80%] self-end mb-2">
                  <Text className="text-white text-[15px] leading-5">City Arena, 6 PM.</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:32 AM <Feather name="check-circle" size={10} color={theme.primary}/></Text>
                </View>
              </>
            ) : (
              <>
                <View className="bg-[#1e1e1e] p-3 rounded-2xl rounded-bl-[4px] max-w-[80%] self-start mb-2">
                  <Text className="text-[#23c55e] text-xs font-bold mb-1">{MOCK_PLAYERS[0].name}</Text>
                  <Text className="text-white text-[15px] leading-5">Who is playing tomorrow?</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:30 AM</Text>
                </View>

                {isTeam && (
                  <View className="bg-[#1a1a1a] p-3 rounded-2xl rounded-bl-[4px] max-w-[85%] self-start mb-2 border border-[#222222]">
                    <Text className="text-[#23c55e] text-xs font-bold mb-2">Match Update</Text>
                    <Text className="text-white text-[15px] leading-5">Practice match added</Text>
                    <Text className="text-xs text-[#888888] self-end mt-1">Sun, 18 May • 4:00 PM</Text>
                    <Text className="text-xs text-[#888888] self-end mt-0.5">City Arena</Text>
                    <TouchableOpacity className="border border-[#222222] p-2.5 rounded-lg items-center mt-3"><Text className="text-white text-[13px] font-semibold">View Match</Text></TouchableOpacity>
                  </View>
                )}

                {isTournament && (
                  <View className="bg-[#1e1e1e] p-3 rounded-2xl rounded-bl-[4px] max-w-[80%] self-start mb-2">
                    <Text className="text-xs font-bold mb-1 text-[#f39c12]">Organizer</Text>
                    <Text className="text-white text-[15px] leading-5">Quarter finals fixtures are out. Check the fixtures section.</Text>
                    <View className="flex-row items-center bg-black/20 p-3 rounded-lg mt-2">
                      <View className="bg-[#e74c3c] p-2 rounded-lg mr-3"><Feather name="file-text" size={20} color="#fff" /></View>
                      <View>
                        <Text className="text-white text-[13px] font-medium">Quarter_Finals_Fixtures.pdf</Text>
                        <Text className="text-[#888888] text-[11px]">PDF • 1.2 MB</Text>
                      </View>
                    </View>
                    <Text className="text-white/50 text-[10px] self-end mt-1">Yesterday</Text>
                  </View>
                )}

                <View className="bg-[#1a4024] p-3 rounded-2xl rounded-br-[4px] max-w-[80%] self-end mb-2">
                  <Text className="text-white text-[15px] leading-5">I'm in.</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:31 AM <Feather name="check-circle" size={10} color={theme.primary}/></Text>
                </View>

                <View className="bg-[#1e1e1e] p-3 rounded-2xl rounded-bl-[4px] max-w-[80%] self-start mb-2">
                  <Text className="text-xs font-bold mb-1 text-[#e74c3c]">{MOCK_PLAYERS[2].name}</Text>
                  <Text className="text-white text-[15px] leading-5">{isMatch ? "Need 42 from 30." : "Same."}</Text>
                  <Text className="text-white/50 text-[10px] self-end mt-1">9:32 AM</Text>
                </View>
              </>
            )}

          </ScrollView>

          <View className="flex-row items-center p-3 bg-[#0a0a0a] border-t border-[#222222]">
            <TouchableOpacity className="p-2"><Feather name="plus" size={22} color={theme.subText} /></TouchableOpacity>
            <View className="flex-1 flex-row items-center bg-[#1a1a1a] rounded-[20px] px-4 py-2 mx-2">
              <TextInput 
                className="flex-1 text-white text-[15px] max-h-[100px]"
                placeholder="Message..."
                placeholderTextColor={theme.subText}
                multiline
              />
              <TouchableOpacity className="ml-3"><Feather name="camera" size={18} color={theme.subText} /></TouchableOpacity>
              <TouchableOpacity className="ml-3"><Feather name="smile" size={18} color={theme.subText} /></TouchableOpacity>
            </View>
            <TouchableOpacity className="w-9 h-9 rounded-full bg-[#23c55e] items-center justify-center"><Feather name="send" size={16} color="#000" /></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  // ==========================================
  // SCREEN 8: GROUP INFO
  // ==========================================
  const renderGroupInfo = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <Header title="" rightIcon="more-vertical" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        <View className="items-center mb-6">
          <Image source={{ uri: activeChat?.avatar }} className="w-[100px] h-[100px] rounded-full mb-4" />
          <Text className="text-white text-[22px] font-bold mb-1">{activeChat?.name}</Text>
          <Text className="text-[#888888] text-sm">8 members</Text>
        </View>

        <View className="flex-row justify-center mb-8">
          {[
            { icon: 'phone', label: 'Audio' },
            { icon: 'video', label: 'Video' },
            { icon: 'user-plus', label: 'Add' },
            { icon: 'search', label: 'Search' },
          ].map((action, i) => (
            <View key={i} className="items-center mx-4">
              <TouchableOpacity className="w-12 h-12 rounded-full bg-[#1a1a1a] items-center justify-center"><Feather name={action.icon} size={20} color={theme.primary} /></TouchableOpacity>
              <Text className="text-white text-xs mt-2">{action.label}</Text>
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
          <TouchableOpacity key={i} className="flex-row items-center py-4 border-b border-[#222222]">
            <Feather name={item.icon} size={20} color={theme.subText} style={{ width: 24, marginRight: 16 }} />
            <View className="flex-1">
              <Text className="text-white text-[15px] font-medium">{item.title}</Text>
              <Text className="text-[#888888] text-[13px] mt-0.5">{item.subtitle}</Text>
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
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
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