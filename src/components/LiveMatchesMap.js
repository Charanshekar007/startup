/**
 * EZKORA Live Matches Interactive Map / Radar Component
 * 
 * Built with react-native-svg. Renders real geographic coordinates
 * relative to the user's location within the selected discovery radius.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function LiveMatchesMap({
  userLocation,
  radiusKm = 10,
  liveMatches = [],
  upcomingMatches = [],
  recruitingTeams = [],
  onExpandRadius,
}) {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width - 32; // Screen width minus padding
  const size = Math.min(screenWidth, 360);
  const center = size / 2;
  const maxRadiusPx = center - 24;

  const [selectedItem, setSelectedItem] = useState(null);

  // Convert GPS coordinates to local SVG X, Y relative to user center
  const getMarkerCoords = (itemLat, itemLon) => {
    if (!itemLat || !itemLon || !userLocation?.lat || !userLocation?.lon) {
      return null;
    }
    // 1 deg latitude ≈ 111 km
    // 1 deg longitude ≈ 111 * cos(lat) km
    const latDiffKm = (itemLat - userLocation.lat) * 111;
    const lonDiffKm = (itemLon - userLocation.lon) * 111 * Math.cos((userLocation.lat * Math.PI) / 180);

    // Distance in km
    const dist = Math.sqrt(latDiffKm * latDiffKm + lonDiffKm * lonDiffKm);
    if (dist > radiusKm * 1.05) return null; // Outside radius

    // Scale to radar canvas
    const scale = maxRadiusPx / radiusKm;
    const x = center + lonDiffKm * scale;
    const y = center - latDiffKm * scale; // Invert Y for screen coordinates

    return { x, y, dist: Math.round(dist * 10) / 10 };
  };

  // Prepare map items
  const mapItems = [
    ...liveMatches.map((m) => ({
      id: `live_${m.id}`,
      type: 'LIVE',
      title: `${m.teamA} vs ${m.teamB}`,
      score: `${m.scoreA} (${m.oversA})`,
      situation: m.situation?.text || m.status,
      venue: m.venue,
      lat: m.coords?.lat,
      lon: m.coords?.lon,
      distance: m.distance,
      raw: m,
    })),
    ...upcomingMatches.map((m) => ({
      id: `upc_${m.id}`,
      type: 'UPCOMING',
      title: `${m.teamA} vs ${m.teamB}`,
      score: m.time || 'Starting soon',
      situation: m.dateLabel ? `${m.dateLabel} • ${m.time}` : 'Starting soon',
      venue: m.venue,
      lat: m.coords?.lat,
      lon: m.coords?.lon,
      distance: m.distance,
      raw: m,
    })),
    ...recruitingTeams.map((t) => ({
      id: `rec_${t.id}`,
      type: 'RECRUITING',
      title: t.name,
      score: `Needs: ${t.needs?.join(', ') || 'Players'}`,
      situation: 'Looking for squad members',
      venue: t.location || 'Local Ground',
      lat: t.coords?.lat,
      lon: t.coords?.lon,
      distance: t.distance,
      raw: t,
    })),
  ];

  return (
    <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-4">
      {/* Map Legend */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center space-x-3">
          <View className="flex-row items-center mr-3">
            <View className="w-2.5 h-2.5 rounded-full bg-[#ef4444] mr-1.5" />
            <Text className="text-[#888888] text-[10px] font-bold">Live</Text>
          </View>
          <View className="flex-row items-center mr-3">
            <View className="w-2.5 h-2.5 rounded-full bg-[#f97316] mr-1.5" />
            <Text className="text-[#888888] text-[10px] font-bold">Starting Soon</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-[#23c55e] mr-1.5" />
            <Text className="text-[#888888] text-[10px] font-bold">Needs Players</Text>
          </View>
        </View>
        <Text className="text-[#23c55e] text-[10px] font-bold">{radiusKm} km radius</Text>
      </View>

      {/* SVG Radar Canvas */}
      <View className="items-center justify-center my-2">
        <Svg width={size} height={size}>
          {/* Radar Background Circles */}
          <Circle cx={center} cy={center} r={maxRadiusPx} fill="#0d140e" stroke="#1f2f22" strokeWidth="1.5" />
          <Circle cx={center} cy={center} r={maxRadiusPx * 0.75} fill="none" stroke="#1f2f22" strokeWidth="1" strokeDasharray="4,4" />
          <Circle cx={center} cy={center} r={maxRadiusPx * 0.5} fill="none" stroke="#1f2f22" strokeWidth="1" strokeDasharray="4,4" />
          <Circle cx={center} cy={center} r={maxRadiusPx * 0.25} fill="none" stroke="#1f2f22" strokeWidth="1" />

          {/* Crosshairs */}
          <Line x1={center} y1={center - maxRadiusPx} x2={center} y2={center + maxRadiusPx} stroke="#1f2f22" strokeWidth="1" />
          <Line x1={center - maxRadiusPx} y1={center} x2={center + maxRadiusPx} y2={center} stroke="#1f2f22" strokeWidth="1" />

          {/* Distance Labels */}
          <SvgText x={center + maxRadiusPx - 2} y={center - 4} fill="#555555" fontSize="9" textAnchor="end">
            {`${radiusKm} km`}
          </SvgText>
          <SvgText x={center + maxRadiusPx * 0.5 - 2} y={center - 4} fill="#444444" fontSize="8" textAnchor="end">
            {`${Math.round(radiusKm * 0.5)} km`}
          </SvgText>

          {/* User Center Marker (YOU) */}
          <Circle cx={center} cy={center} r={10} fill="#3b82f6" fillOpacity="0.25" />
          <Circle cx={center} cy={center} r={4} fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
          <SvgText x={center} y={center + 14} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">
            {'YOU'}
          </SvgText>

          {/* Interactive Markers */}
          {mapItems.map((item) => {
            const coords = getMarkerCoords(item.lat, item.lon);
            if (!coords) return null;

            const isSelected = selectedItem?.id === item.id;
            let markerColor = '#ef4444'; // Live
            if (item.type === 'UPCOMING') markerColor = '#f97316';
            if (item.type === 'RECRUITING') markerColor = '#23c55e';

            return (
              <G key={item.id} onPress={() => setSelectedItem(item)}>
                {/* Outer Glow Ring */}
                <Circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 14 : 9}
                  fill={markerColor}
                  fillOpacity={isSelected ? 0.4 : 0.2}
                />
                {/* Dot */}
                <Circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 6 : 4.5}
                  fill={markerColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 : 1}
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Selected Marker Callout / Preview Card */}
      {selectedItem ? (
        <View className="bg-[#181818] rounded-xl border border-[#262626] p-3.5 mt-2">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-1.5 ${
                  selectedItem.type === 'LIVE'
                    ? 'bg-[#ef4444]'
                    : selectedItem.type === 'UPCOMING'
                    ? 'bg-[#f97316]'
                    : 'bg-[#23c55e]'
                }`}
              />
              <Text
                className={`text-[10px] font-bold tracking-wider uppercase ${
                  selectedItem.type === 'LIVE'
                    ? 'text-[#ef4444]'
                    : selectedItem.type === 'UPCOMING'
                    ? 'text-[#f97316]'
                    : 'text-[#23c55e]'
                }`}
              >
                {selectedItem.type === 'LIVE'
                  ? 'LIVE NOW'
                  : selectedItem.type === 'UPCOMING'
                  ? 'STARTING SOON'
                  : 'LOOKING FOR PLAYERS'}
              </Text>
            </View>
            <Text className="text-[#23c55e] text-xs font-bold">
              {selectedItem.distance ? `${selectedItem.distance} km away` : 'Near You'}
            </Text>
          </View>

          <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>
            {selectedItem.title}
          </Text>

          {Boolean(selectedItem.score) && (
            <Text className="text-white text-xs font-semibold mb-0.5">{selectedItem.score}</Text>
          )}

          {Boolean(selectedItem.situation) && (
            <Text className="text-[#888888] text-[11px] mb-2">{selectedItem.situation}</Text>
          )}

          <View className="flex-row items-center justify-between pt-2 border-t border-[#222222]">
            <View className="flex-row items-center flex-1 mr-2">
              <Feather name="map-pin" size={11} color="#23c55e" />
              <Text className="text-[#888888] text-[10px] ml-1" numberOfLines={1}>
                {selectedItem.venue}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (selectedItem.type === 'LIVE' || selectedItem.type === 'UPCOMING') {
                  navigation.navigate('LiveScoring', {
                    matchData: selectedItem.raw.matchData || selectedItem.raw,
                    isSpectator: true,
                  });
                }
              }}
              className="bg-[#23c55e] px-3 py-1.5 rounded-lg"
            >
              <Text className="text-black text-xs font-bold">
                {selectedItem.type === 'LIVE' ? 'WATCH MATCH' : 'VIEW DETAILS'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="items-center py-2">
          <Text className="text-[#888888] text-[11px] text-center">
            Tap any marker on the map to view match scores and ground details.
          </Text>
        </View>
      )}

      {/* Empty State for Selected Radius */}
      {mapItems.length === 0 && (
        <View className="items-center py-4">
          <MaterialCommunityIcons name="radar" size={32} color="#444444" className="mb-2" />
          <Text className="text-white text-xs font-bold mb-1">No Cricket Activity Within {radiusKm} km</Text>
          <Text className="text-[#888888] text-[11px] text-center mb-3">
            Try expanding your search radius to discover matches across neighboring areas.
          </Text>
          {Boolean(onExpandRadius) && (
            <TouchableOpacity
              onPress={() => onExpandRadius(25)}
              className="border border-[#23c55e] px-3.5 py-1.5 rounded-full"
            >
              <Text className="text-[#23c55e] text-xs font-bold">Expand to 25 km</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
