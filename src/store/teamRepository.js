import AsyncStorageRaw from '@react-native-async-storage/async-storage';
import { getUserByPlayerUid, getUserById } from './userRepository.js';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;
export const TEAMS_STORAGE_KEY = '@sports_app_teams_v1';

export const DEFAULT_TEAMS = [
  {
    id: 'team_warriors',
    name: 'Warriors XI',
    shortName: 'WX',
    logo: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
    location: 'Hyderabad, India',
    captainId: 'usr_arjun123',
    inviteCode: 'WARRIORS-2026',
    members: [
      {
        id: 'usr_arjun123',
        playerId: 'usr_arjun123',
        userId: 'usr_arjun123',
        playerUid: 'SP-7K4M-92QX',
        name: 'Arjun',
        username: 'arjun123',
        role: 'All Rounder',
        style: 'RHB / RAM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Medium',
        isCaptain: true,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Arjun&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_player101',
        playerId: 'usr_player101',
        userId: 'usr_player101',
        playerUid: 'SP-9P1M-101X',
        name: 'Star Player',
        username: 'star_player',
        role: 'Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Star+Player&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'usr_kiran_p',
        playerId: 'usr_kiran_p',
        userId: 'usr_kiran_p',
        playerUid: 'SP-KIRN-2026',
        name: 'Kiran Patel',
        username: 'kiranp',
        role: 'Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Kiran+Patel&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-03T00:00:00.000Z',
      },
      {
        id: 'usr_rohit_s',
        playerId: 'usr_rohit_s',
        userId: 'usr_rohit_s',
        playerUid: 'SP-ROHT-4545',
        name: 'Rohit Sharma',
        username: 'rohit_s',
        role: 'Opening Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Rohit+Sharma&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-04T00:00:00.000Z',
      },
      {
        id: 'usr_charan_s',
        playerId: 'usr_charan_s',
        userId: 'usr_charan_s',
        playerUid: 'SP-CHRN-0077',
        name: 'Charan Shekar',
        username: 'charan_s',
        role: 'All Rounder',
        style: 'RHB / RAM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Charan+Shekar&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'usr_ravindra_j',
        playerId: 'usr_ravindra_j',
        userId: 'usr_ravindra_j',
        playerUid: 'SP-JADD-0808',
        name: 'Ravindra Jadeja',
        username: 'jaddu_r',
        role: 'All Rounder',
        style: 'LHB / SLA',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Slow Left-Arm',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Ravindra+Jadeja&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-06T00:00:00.000Z',
      },
      {
        id: 'usr_jasprit_b',
        playerId: 'usr_jasprit_b',
        userId: 'usr_jasprit_b',
        playerUid: 'SP-BUMR-9393',
        name: 'Jasprit Bumrah',
        username: 'bumrah_j',
        role: 'Bowler',
        style: 'RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-07T00:00:00.000Z',
      },
      {
        id: 'usr_shami_m',
        playerId: 'usr_shami_m',
        userId: 'usr_shami_m',
        playerUid: 'SP-SHAM-1111',
        name: 'Mohammed Shami',
        username: 'shami_m',
        role: 'Bowler',
        style: 'RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=MS&background=b9770e&color=fff',
        joinedAt: '2026-01-08T00:00:00.000Z',
      },
      {
        id: 'usr_shubman_g',
        playerId: 'usr_shubman_g',
        userId: 'usr_shubman_g',
        playerUid: 'SP-GILL-7777',
        name: 'Shubman Gill',
        username: 'shubman_g',
        role: 'Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=SG&background=b9770e&color=fff',
        joinedAt: '2026-01-09T00:00:00.000Z',
      },
      {
        id: 'usr_hardik_p',
        playerId: 'usr_hardik_p',
        userId: 'usr_hardik_p',
        playerUid: 'SP-HARD-3333',
        name: 'Hardik Pandya',
        username: 'hardik_p',
        role: 'All Rounder',
        style: 'RHB / RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=HP&background=b9770e&color=fff',
        joinedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'usr_rishabh_p',
        playerId: 'usr_rishabh_p',
        userId: 'usr_rishabh_p',
        playerUid: 'SP-PANT-1717',
        name: 'Rishabh Pant (WK)',
        username: 'rishabh_p',
        role: 'WK Batter',
        style: 'LHB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=RP&background=b9770e&color=fff',
        joinedAt: '2026-01-11T00:00:00.000Z',
      },
      {
        id: 'usr_suryakumar',
        playerId: 'usr_suryakumar',
        userId: 'usr_suryakumar',
        playerUid: 'SP-SKYY-6363',
        name: 'Suryakumar Yadav',
        username: 'sky_surya',
        role: 'Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Spin',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=SKY&background=b9770e&color=fff',
        joinedAt: '2026-01-12T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'team_falcons',
    name: 'Falcons CC',
    shortName: 'FC',
    logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
    location: 'Bengaluru, India',
    captainId: 'usr_rahul123',
    inviteCode: 'FALCONS-2026',
    members: [
      {
        id: 'usr_rahul123',
        playerId: 'usr_rahul123',
        userId: 'usr_rahul123',
        playerUid: 'SP-8R2L-44WK',
        name: 'Rahul Kumar',
        username: 'rahulk',
        role: 'All Rounder',
        style: 'LHB / RAM',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Medium',
        isCaptain: true,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_virat_k',
        playerId: 'usr_virat_k',
        userId: 'usr_virat_k',
        playerUid: 'SP-VIRT-1818',
        name: 'Virat Kohli',
        username: 'virat_k',
        role: 'Top-Order Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Medium',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Virat+Kohli&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'usr_kl_rahul',
        playerId: 'usr_kl_rahul',
        userId: 'usr_kl_rahul',
        playerUid: 'SP-KLRA-0101',
        name: 'KL Rahul (WK)',
        username: 'kl_rahul',
        role: 'WK Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=KLR&background=1e3a29&color=fff',
        joinedAt: '2026-01-03T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_4',
        playerId: 'usr_falcons_4',
        userId: 'usr_falcons_4',
        name: 'Sameer Patel',
        role: 'Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=SP&background=1e3a29&color=fff',
        joinedAt: '2026-01-04T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_5',
        playerId: 'usr_falcons_5',
        userId: 'usr_falcons_5',
        name: 'Harpreet Singh',
        role: 'All Rounder',
        style: 'LHB / OB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Off Break',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=HS&background=1e3a29&color=fff',
        joinedAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_6',
        playerId: 'usr_falcons_6',
        userId: 'usr_falcons_6',
        name: 'Devdutt Padikkal',
        role: 'Batter',
        style: 'LHB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'None',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=DP&background=1e3a29&color=fff',
        joinedAt: '2026-01-06T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_7',
        playerId: 'usr_falcons_7',
        userId: 'usr_falcons_7',
        name: 'Washington Sundar',
        role: 'All Rounder',
        style: 'LHB / OB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Off Break',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=WS&background=1e3a29&color=fff',
        joinedAt: '2026-01-07T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_8',
        playerId: 'usr_falcons_8',
        userId: 'usr_falcons_8',
        name: 'Yuzvendra Chahal',
        role: 'Bowler',
        style: 'LB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Leg Break',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=YC&background=1e3a29&color=fff',
        joinedAt: '2026-01-08T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_9',
        playerId: 'usr_falcons_9',
        userId: 'usr_falcons_9',
        name: 'Prasidh Krishna',
        role: 'Bowler',
        style: 'RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=PK&background=1e3a29&color=fff',
        joinedAt: '2026-01-09T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_10',
        playerId: 'usr_falcons_10',
        userId: 'usr_falcons_10',
        name: 'Kuldeep Yadav',
        role: 'Bowler',
        style: 'SLC',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Slow Left-Arm Chinaman',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=KY&background=1e3a29&color=fff',
        joinedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_11',
        playerId: 'usr_falcons_11',
        userId: 'usr_falcons_11',
        name: 'Arshdeep Singh',
        role: 'Bowler',
        style: 'LFM',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Left-Fast Medium',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=AS&background=1e3a29&color=fff',
        joinedAt: '2026-01-11T00:00:00.000Z',
      },
      {
        id: 'usr_falcons_12',
        playerId: 'usr_falcons_12',
        userId: 'usr_falcons_12',
        name: 'Navdeep Saini',
        role: 'Bowler',
        style: 'RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=NS&background=1e3a29&color=fff',
        joinedAt: '2026-01-12T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'team_csk',
    name: 'Super Kings XI',
    shortName: 'SKX',
    logo: 'https://ui-avatars.com/api/?name=SKX&background=f1c40f&color=000',
    location: 'Chennai, India',
    captainId: 'usr_ruturaj_g',
    inviteCode: 'SKX-2026',
    members: [
      {
        id: 'usr_ruturaj_g',
        playerId: 'usr_ruturaj_g',
        userId: 'usr_ruturaj_g',
        playerUid: 'SP-RUTU-3131',
        name: 'Ruturaj Gaikwad',
        username: 'ruturaj_g',
        role: 'Opening Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'Professional',
        primaryTeam: 'Super Kings XI',
        isCaptain: true,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Ruturaj+Gaikwad&background=f1c40f&color=000',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_ms_dhoni',
        playerId: 'usr_ms_dhoni',
        userId: 'usr_ms_dhoni',
        playerUid: 'SP-MSD7-0707',
        name: 'MS Dhoni',
        username: 'mahi_07',
        role: 'Wicketkeeper Batter',
        style: 'RHB / WK',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'Legend',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=MS+Dhoni&background=f1c40f&color=000',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_ravindra_j',
        playerId: 'usr_ravindra_j',
        userId: 'usr_ravindra_j',
        playerUid: 'SP-JADD-0808',
        name: 'Ravindra Jadeja',
        username: 'jaddu_r',
        role: 'All Rounder',
        style: 'LHB / SLA',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Slow Left-Arm',
        experience: 'International',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Ravindra+Jadeja&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'usr_shivam_d',
        playerId: 'usr_shivam_d',
        userId: 'usr_shivam_d',
        playerUid: 'SP-DUBE-2525',
        name: 'Shivam Dube',
        username: 'shivam_d',
        role: 'All Rounder',
        style: 'LHB / RAM',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'State',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Shivam+Dube&background=f1c40f&color=000',
        joinedAt: '2026-01-03T00:00:00.000Z',
      },
      {
        id: 'usr_moeen_a',
        playerId: 'usr_moeen_a',
        userId: 'usr_moeen_a',
        playerUid: 'SP-MOEN-1818',
        name: 'Moeen Ali',
        username: 'moeen_a',
        role: 'All Rounder',
        style: 'LHB / OB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'International',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Moeen+Ali&background=f1c40f&color=000',
        joinedAt: '2026-01-04T00:00:00.000Z',
      },
      {
        id: 'usr_deepak_c',
        playerId: 'usr_deepak_c',
        userId: 'usr_deepak_c',
        playerUid: 'SP-CHAH-9090',
        name: 'Deepak Chahar',
        username: 'deepak_c',
        role: 'Bowler',
        style: 'RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        experience: 'State',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Deepak+Chahar&background=f1c40f&color=000',
        joinedAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'usr_shardul_t',
        playerId: 'usr_shardul_t',
        userId: 'usr_shardul_t',
        playerUid: 'SP-THAK-5454',
        name: 'Shardul Thakur',
        username: 'shardul_t',
        role: 'All Rounder',
        style: 'RHB / RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        experience: 'International',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Shardul+Thakur&background=f1c40f&color=000',
        joinedAt: '2026-01-06T00:00:00.000Z',
      },
      {
        id: 'usr_tushar_d',
        playerId: 'usr_tushar_d',
        userId: 'usr_tushar_d',
        playerUid: 'SP-DESH-2424',
        name: 'Tushar Deshpande',
        username: 'tushar_d',
        role: 'Bowler',
        style: 'RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        experience: 'Club',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Tushar+Deshpande&background=f1c40f&color=000',
        joinedAt: '2026-01-07T00:00:00.000Z',
      },
      {
        id: 'usr_ajinkya_r',
        playerId: 'usr_ajinkya_r',
        userId: 'usr_ajinkya_r',
        playerUid: 'SP-RAHN-2727',
        name: 'Ajinkya Rahane',
        username: 'ajinkya_r',
        role: 'Top-Order Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'Veteran',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Ajinkya+Rahane&background=f1c40f&color=000',
        joinedAt: '2026-01-08T00:00:00.000Z',
      },
      {
        id: 'usr_devon_c',
        playerId: 'usr_devon_c',
        userId: 'usr_devon_c',
        playerUid: 'SP-CONW-8888',
        name: 'Devon Conway',
        username: 'devon_c',
        role: 'Opening Batter',
        style: 'LHB / WK',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Medium',
        experience: 'International',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Devon+Conway&background=f1c40f&color=000',
        joinedAt: '2026-01-09T00:00:00.000Z',
      },
      {
        id: 'usr_matheesha_p',
        playerId: 'usr_matheesha_p',
        userId: 'usr_matheesha_p',
        playerUid: 'SP-PATH-9999',
        name: 'Matheesha Pathirana',
        username: 'matheesha_p',
        role: 'Fast Bowler',
        style: 'RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Sling',
        experience: 'Professional',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Matheesha+Pathirana&background=f1c40f&color=000',
        joinedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'usr_sameer_r',
        playerId: 'usr_sameer_r',
        userId: 'usr_sameer_r',
        playerUid: 'SP-RIZV-1212',
        name: 'Sameer Rizvi',
        username: 'sameer_r',
        role: 'Middle-Order Batter',
        style: 'RHB / OB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'Youth',
        primaryTeam: 'Super Kings XI',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Sameer+Rizvi&background=f1c40f&color=000',
        joinedAt: '2026-01-11T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'team_mi',
    name: 'Mumbai Royals',
    shortName: 'MR',
    logo: 'https://ui-avatars.com/api/?name=MR&background=2980b9&color=fff',
    location: 'Mumbai, India',
    captainId: 'usr_rohit_s',
    inviteCode: 'ROYALS-2026',
    members: [
      {
        id: 'usr_rohit_s',
        playerId: 'usr_rohit_s',
        userId: 'usr_rohit_s',
        playerUid: 'SP-ROHT-4545',
        name: 'Rohit Sharma',
        username: 'rohit_s',
        role: 'Opening Batter',
        style: 'RHB / OB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'Legend',
        primaryTeam: 'Mumbai Royals',
        isCaptain: true,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Rohit+Sharma&background=2980b9&color=fff',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_surya_y',
        playerId: 'usr_surya_y',
        userId: 'usr_surya_y',
        playerUid: 'SP-SKYY-6363',
        name: 'Suryakumar Yadav',
        username: 'surya_y',
        role: 'Top-Order Batter',
        style: 'RHB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Spin',
        experience: 'International',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Suryakumar+Yadav&background=2980b9&color=fff',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_jasprit_b',
        playerId: 'usr_jasprit_b',
        userId: 'usr_jasprit_b',
        playerUid: 'SP-BUMR-9393',
        name: 'Jasprit Bumrah',
        username: 'bumrah_j',
        role: 'Fast Bowler',
        style: 'RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast',
        experience: 'International',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=1e3a29&color=23c55e',
        joinedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'usr_hardik_p',
        playerId: 'usr_hardik_p',
        userId: 'usr_hardik_p',
        playerUid: 'SP-PAND-3333',
        name: 'Hardik Pandya',
        username: 'hardik_p',
        role: 'All Rounder',
        style: 'RHB / RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        experience: 'International',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Hardik+Pandya&background=2980b9&color=fff',
        joinedAt: '2026-01-03T00:00:00.000Z',
      },
      {
        id: 'usr_tilak_v',
        playerId: 'usr_tilak_v',
        userId: 'usr_tilak_v',
        playerUid: 'SP-VARMA-7272',
        name: 'Tilak Varma',
        username: 'tilak_v',
        role: 'Middle-Order Batter',
        style: 'LHB / OB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'State',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Tilak+Varma&background=2980b9&color=fff',
        joinedAt: '2026-01-04T00:00:00.000Z',
      },
      {
        id: 'usr_ishan_k',
        playerId: 'usr_ishan_k',
        userId: 'usr_ishan_k',
        playerUid: 'SP-KISH-3232',
        name: 'Ishan Kishan',
        username: 'ishan_k',
        role: 'Wicketkeeper Batter',
        style: 'LHB / WK',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'None',
        experience: 'State',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Ishan+Kishan&background=2980b9&color=fff',
        joinedAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'usr_tim_d',
        playerId: 'usr_tim_d',
        userId: 'usr_tim_d',
        playerUid: 'SP-DAVI-1717',
        name: 'Tim David',
        username: 'tim_d',
        role: 'Power Batter',
        style: 'RHB / OB',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Arm Off Break',
        experience: 'Club',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Tim+David&background=2980b9&color=fff',
        joinedAt: '2026-01-06T00:00:00.000Z',
      },
      {
        id: 'usr_piyush_c',
        playerId: 'usr_piyush_c',
        userId: 'usr_piyush_c',
        playerUid: 'SP-CHAW-1111',
        name: 'Piyush Chawla',
        username: 'piyush_c',
        role: 'Leg Spinner',
        style: 'LHB / LB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Leg Break',
        experience: 'Veteran',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Piyush+Chawla&background=2980b9&color=fff',
        joinedAt: '2026-01-07T00:00:00.000Z',
      },
      {
        id: 'usr_akash_m',
        playerId: 'usr_akash_m',
        userId: 'usr_akash_m',
        playerUid: 'SP-MADH-4444',
        name: 'Akash Madhwal',
        username: 'akash_m',
        role: 'Medium Pacer',
        style: 'RHB / RFM',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Medium',
        experience: 'Club',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Akash+Madhwal&background=2980b9&color=fff',
        joinedAt: '2026-01-08T00:00:00.000Z',
      },
      {
        id: 'usr_gerald_c',
        playerId: 'usr_gerald_c',
        userId: 'usr_gerald_c',
        playerUid: 'SP-COET-6262',
        name: 'Gerald Coetzee',
        username: 'gerald_c',
        role: 'Fast Bowler',
        style: 'RHB / RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast',
        experience: 'Professional',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Gerald+Coetzee&background=2980b9&color=fff',
        joinedAt: '2026-01-09T00:00:00.000Z',
      },
      {
        id: 'usr_nehal_w',
        playerId: 'usr_nehal_w',
        userId: 'usr_nehal_w',
        playerUid: 'SP-WADH-1919',
        name: 'Nehal Wadhera',
        username: 'nehal_w',
        role: 'Middle-Order Batter',
        style: 'LHB / LB',
        battingStyle: 'Left-Handed',
        bowlingStyle: 'Right-Arm Leg Break',
        experience: 'Youth',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Nehal+Wadhera&background=2980b9&color=fff',
        joinedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'usr_nuwan_t',
        playerId: 'usr_nuwan_t',
        userId: 'usr_nuwan_t',
        playerUid: 'SP-THUS-7777',
        name: 'Nuwan Thushara',
        username: 'nuwan_t',
        role: 'Sling Pacer',
        style: 'RHB / RF',
        battingStyle: 'Right-Handed',
        bowlingStyle: 'Right-Fast Sling',
        experience: 'Club',
        primaryTeam: 'Mumbai Royals',
        isCaptain: false,
        status: 'accepted',
        avatar: 'https://ui-avatars.com/api/?name=Nuwan+Thushara&background=2980b9&color=fff',
        joinedAt: '2026-01-11T00:00:00.000Z',
      },
    ],
  },
];

/**
 * Filter only active (accepted) members of a team.
 * Requirement 6: "Only accepted members should count toward the team's active squad."
 */
export function getActiveMembers(team) {
  if (!team || !Array.isArray(team.members)) return [];
  return team.members.filter((m) => m && (m.status === 'accepted' || (!m.status && m.id)));
}

/**
 * Filter pending invitations for a team.
 */
export function getPendingMembers(team) {
  if (!team || !Array.isArray(team.members)) return [];
  return team.members.filter((m) => m && m.status === 'pending');
}

/**
 * Check if a team is ready for matches (at least 11 accepted members).
 * Requirement 3: MINIMUM TEAM MEMBERS = 11.
 */
export function isSquadMatchReady(team) {
  return getActiveMembers(team).length >= 11;
}

/**
 * Fetch all registered teams from AsyncStorage.
 * Initializes storage with default seed teams if empty.
 */
export async function getTeams() {
  try {
    const raw = await AsyncStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(DEFAULT_TEAMS));
      return DEFAULT_TEAMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(DEFAULT_TEAMS));
      return DEFAULT_TEAMS;
    }

    let updated = false;
    for (const defTeam of DEFAULT_TEAMS) {
      const exists = parsed.some((t) => t.id === defTeam.id || t.name.toLowerCase() === defTeam.name.toLowerCase());
      if (!exists) {
        parsed.push(defTeam);
        updated = true;
      }
    }

    if (updated) {
      await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return DEFAULT_TEAMS;
  }
}

/**
 * Get team by unique ID
 */
export async function getTeamById(teamId) {
  if (!teamId) return null;
  const teams = await getTeams();
  return teams.find((t) => t.id === teamId) || null;
}

/**
 * Search teams by name, short code, or invite code (Requirement 12)
 */
export async function searchTeams(query = '') {
  const teams = await getTeams();
  if (!query || !query.trim()) return teams;
  const q = query.trim().toLowerCase();
  return teams.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.shortName && t.shortName.toLowerCase().includes(q)) ||
      (t.inviteCode && t.inviteCode.toLowerCase().includes(q))
  );
}

/**
 * Create or save a new team to persistent storage.
 * Requirement 2: Authenticated user automatically becomes Captain/Owner.
 * Initial squad has ONLY the captain (count = 1). NO fake players!
 */
export async function saveTeam(teamData) {
  try {
    const teams = await getTeams();
    const existingIndex = teams.findIndex((t) => t.id === teamData.id);

    const teamToSave = {
      id: teamData.id || `team_${Date.now()}`,
      name: teamData.name || 'Custom Team',
      shortName: teamData.shortName || (teamData.name ? teamData.name.substring(0, 3).toUpperCase() : 'CT'),
      logo: teamData.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamData.name || 'CT')}&background=1e3a29&color=fff`,
      location: teamData.location || 'Local Ground',
      captainId: teamData.captainId || null,
      inviteCode: teamData.inviteCode || `${(teamData.shortName || 'TM').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      members: Array.isArray(teamData.members) ? teamData.members : [],
      createdAt: teamData.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      teams[existingIndex] = { ...teams[existingIndex], ...teamToSave };
    } else {
      teams.unshift(teamToSave);
    }

    await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    return teamToSave;
  } catch (error) {
    console.error('Error saving team:', error);
    throw error;
  }
}

/**
 * Invite a player to a team using their public Player UID (Requirements 5, 6, 7 & 25).
 * Validates player existence, prevents duplicate invites, sets status = 'pending'.
 */
export async function invitePlayerByUid(teamId, playerUid, invitedByUserId) {
  if (!teamId) return { success: false, error: 'MISSING_TEAM', message: 'Team ID is required.' };
  if (!playerUid || !playerUid.trim()) {
    return { success: false, error: 'MISSING_UID', message: 'Player UID is required.' };
  }

  try {
    const cleanUid = playerUid.trim().toUpperCase();
    const player = await getUserByPlayerUid(cleanUid);

    if (!player) {
      return {
        success: false,
        error: 'PLAYER_NOT_FOUND',
        message: 'Player not found. Check the Player UID and try again.',
      };
    }

    const teams = await getTeams();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) {
      return { success: false, error: 'TEAM_NOT_FOUND', message: 'Team not found.' };
    }

    const team = teams[index];
    const playerId = player.id;
    const existing = (team.members || []).find((m) => m.playerId === playerId || m.id === playerId || m.userId === playerId);

    if (existing) {
      if (existing.status === 'accepted') {
        return {
          success: false,
          error: 'ALREADY_MEMBER',
          message: 'Player is already in this team.',
          player,
        };
      }
      if (existing.status === 'pending') {
        return {
          success: false,
          error: 'ALREADY_INVITED',
          message: 'Invitation already sent.',
          player,
        };
      }
    }

    const activeProfile = player.sportProfiles?.[0] || {};
    const newMembership = {
      teamId,
      playerId,
      id: playerId,
      userId: playerId,
      playerUid: player.playerUid || cleanUid,
      name: player.account?.name || player.name || 'Player',
      username: (player.account?.username || player.username || 'player').replace(/^@/, ''),
      role: activeProfile.role || 'Batter',
      style: activeProfile.battingStyle || 'Right-Handed',
      battingStyle: activeProfile.battingStyle || 'Right-Handed',
      bowlingStyle: activeProfile.bowlingStyle || 'None',
      avatar:
        player.account?.avatar ||
        player.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(player.account?.name || 'P')}&background=1e3a29&color=fff`,
      isCaptain: false,
      status: 'pending',
      invitedBy: invitedByUserId,
      invitedAt: new Date().toISOString(),
    };

    if (existing) {
      // Re-invite previously removed or rejected member
      team.members = team.members.map((m) =>
        m.playerId === playerId || m.id === playerId ? newMembership : m
      );
    } else {
      team.members = [...(team.members || []), newMembership];
    }

    teams[index] = team;
    await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));

    return {
      success: true,
      team,
      player: {
        id: playerId,
        playerUid: cleanUid,
        name: newMembership.name,
        username: newMembership.username,
        avatar: newMembership.avatar,
        role: newMembership.role,
      },
    };
  } catch (error) {
    console.error('Error inviting player by UID:', error);
    return { success: false, error: 'UNKNOWN', message: error.message };
  }
}

/**
 * Accept a team invitation (Requirement 6)
 * Changes status: 'pending' -> 'accepted'
 */
export async function acceptTeamInvitation(teamId, playerId) {
  if (!teamId || !playerId) return { success: false, message: 'Invalid team or player ID' };

  try {
    const teams = await getTeams();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return { success: false, message: 'Team not found' };

    const team = teams[index];
    let found = false;

    team.members = (team.members || []).map((m) => {
      if (m.playerId === playerId || m.id === playerId || m.userId === playerId) {
        found = true;
        return {
          ...m,
          status: 'accepted',
          joinedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    if (!found) {
      return { success: false, message: 'Invitation not found for this player' };
    }

    teams[index] = team;
    await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    return { success: true, team };
  } catch (error) {
    console.error('Error accepting team invitation:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Reject or cancel a team invitation
 */
export async function rejectTeamInvitation(teamId, playerId) {
  if (!teamId || !playerId) return { success: false, message: 'Invalid team or player ID' };

  try {
    const teams = await getTeams();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return { success: false, message: 'Team not found' };

    const team = teams[index];
    team.members = (team.members || []).filter(
      (m) => !(m.playerId === playerId || m.id === playerId || m.userId === playerId)
    );

    teams[index] = team;
    await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    return { success: true, team };
  } catch (error) {
    console.error('Error rejecting team invitation:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Remove an active member from a team (Requirement 10).
 * Validates minimum 11 active members limit.
 */
export async function removeMemberFromTeam(teamId, playerId, { force = false } = {}) {
  if (!teamId || !playerId) return { success: false, message: 'Invalid team or player ID' };

  try {
    const teams = await getTeams();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return { success: false, message: 'Team not found' };

    const team = teams[index];
    const targetMember = (team.members || []).find(
      (m) => m.playerId === playerId || m.id === playerId || m.userId === playerId
    );

    if (!targetMember) return { success: false, message: 'Member not found in team.' };

    if (targetMember.isCaptain || team.captainId === playerId) {
      return { success: false, error: 'CANNOT_REMOVE_CAPTAIN', message: 'Team captain cannot be removed.' };
    }

    const currentActive = getActiveMembers(team);
    // Requirement 10: "If removing a member would reduce the squad below 11, show a clear message: Your team needs at least 11 members."
    if (!force && currentActive.length <= 11 && targetMember.status === 'accepted') {
      return {
        success: false,
        error: 'MIN_SQUAD_LIMIT',
        message: 'Your team needs at least 11 members.',
      };
    }

    team.members = (team.members || []).filter(
      (m) => !(m.playerId === playerId || m.id === playerId || m.userId === playerId)
    );

    teams[index] = team;
    await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    return { success: true, team };
  } catch (error) {
    console.error('Error removing member from team:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Get all teams where a player is an accepted member or captain
 */
export async function getTeamsForPlayer(playerId) {
  if (!playerId) return [];
  const teams = await getTeams();
  return teams.filter((t) => {
    if (t.captainId === playerId) return true;
    const active = getActiveMembers(t);
    return active.some((m) => m.playerId === playerId || m.id === playerId || m.userId === playerId);
  });
}
