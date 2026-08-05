import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WaiterScreen() {
  const [tables] = useState([
    { tableNumber: 4, capacity: 4, status: 'Occupied', time: '45m' },
    { tableNumber: 7, capacity: 2, status: 'Cleaning', time: 'Just now' },
    { tableNumber: 12, capacity: 6, status: 'Reserved', time: '7:30 PM' },
    { tableNumber: 2, capacity: 3, status: 'Occupied', time: '15m' },
    { tableNumber: 5, capacity: 4, status: 'Available', time: '-' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Occupied': return 'bg-red-100 text-red-700 border-red-300';
      case 'Reserved': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Cleaning': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Available': default: return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] pt-12 px-5">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-2xl font-black text-[#1F130D]">Table Management</Text>
          <Text className="text-xs text-gray-500">Seating status & floor tracking</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-[#B8520B] rounded-full items-center justify-center shadow-sm">
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-white flex-1 p-4 rounded-2xl border border-[#EAE3DE] mr-2 shadow-xs">
          <Text className="text-gray-400 text-[10px] font-bold uppercase">Active Tables</Text>
          <Text className="text-xl font-black text-[#1F130D] mt-1">12</Text>
        </View>
        <View className="bg-white flex-1 p-4 rounded-2xl border border-[#EAE3DE] mx-1 shadow-xs">
          <Text className="text-gray-400 text-[10px] font-bold uppercase">Pending Orders</Text>
          <Text className="text-xl font-black text-[#B8520B] mt-1">8</Text>
        </View>
        <View className="bg-white flex-1 p-4 rounded-2xl border border-[#EAE3DE] ml-2 shadow-xs">
          <Text className="text-gray-400 text-[10px] font-bold uppercase">Tips Today</Text>
          <Text className="text-xl font-black text-green-600 mt-1">$142</Text>
        </View>
      </View>

      <Text className="text-lg font-bold text-[#1F130D] mb-3">Floor Plan Status</Text>

      {/* Tables List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {tables.map((t, idx) => (
          <View key={idx} className="bg-white p-4 rounded-2xl border border-[#EAE3DE] mb-3 flex-row justify-between items-center shadow-xs">
            <View className="flex-row items-center space-x-4">
              <View className="w-12 h-12 rounded-xl bg-[#FDFBF7] border border-[#EAE3DE] items-center justify-center">
                <Text className="font-black text-base text-[#1F130D]">T{t.tableNumber}</Text>
              </View>
              <View>
                <Text className="font-bold text-sm text-[#1F130D]">Capacity: {t.capacity} Guests</Text>
                <Text className="text-xs text-gray-400 mt-0.5">Duration/Time: {t.time}</Text>
              </View>
            </View>
            <View className={`px-3 py-1 rounded-full border ${getStatusColor(t.status)}`}>
              <Text className="text-xs font-bold">{t.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}