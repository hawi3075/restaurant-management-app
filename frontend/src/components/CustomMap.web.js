import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomMap({ mapRegion, streetAddress }) {
  const openExternalMapPicker = () => {
    // Get the current window origin (e.g. http://localhost:8081) to redirect back after selection
    const currentOrigin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : '';
    const returnUrl = encodeURIComponent(`${currentOrigin}/checkout`);

    // Open Google Maps search/pin point query with return callback instructions
    const url = `https://www.google.com/maps/search/?api=1&query=ASTU+Visual+Arts+Society+Club&return_url=${returnUrl}`;
    
    Linking.openURL(url);
  };

  return (
    <View className="h-44 w-full bg-[#FEF7F3] items-center justify-center p-4 border border-[#B8520B]/20 rounded-xl">
      <View className="w-10 h-10 bg-[#B8520B]/10 rounded-full items-center justify-center mb-2">
        <Ionicons name="map-outline" size={20} color="#B8520B" />
      </View>
      
      <Text className="text-xs font-black text-[#1F130D] mb-0.5 text-center">Interactive Map View</Text>
      <Text className="text-[10px] text-gray-500 text-center mb-3" numberOfLines={1}>
        📍 {streetAddress || 'ASTU Visual Arts Society Club'}
      </Text>

      <TouchableOpacity
        onPress={openExternalMapPicker}
        className="bg-[#B8520B] px-4 py-2 rounded-xl flex-row items-center shadow-sm active:opacity-95"
      >
        <Ionicons name="navigate-outline" size={12} color="#white" style={{ marginRight: 6 }} />
        <Text className="text-white font-bold text-[10px] uppercase tracking-wider">Pick Location on Map</Text>
      </TouchableOpacity>
    </View>
  );
}