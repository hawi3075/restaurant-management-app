import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ManagerScreen() {
  return (
    <View className="flex-1 bg-[#F8F9FC] pt-12 px-5">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
      
      <View className="mb-6">
        <Text className="text-2xl font-black text-[#1F130D]">Manager Dashboard</Text>
        <Text className="text-xs text-gray-500">Live operational metrics & analytics overview</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between mb-4">
          <View className="bg-white p-4 rounded-2xl border border-[#EAE3DE] flex-1 mr-2 shadow-xs">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Daily Revenue</Text>
            <Text className="text-xl font-black text-[#1F130D] mt-1">$4,250</Text>
            <Text className="text-[10px] text-green-600 font-bold mt-1">+12% from yesterday</Text>
          </View>
          <View className="bg-white p-4 rounded-2xl border border-[#EAE3DE] flex-1 ml-2 shadow-xs">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Total Orders</Text>
            <Text className="text-xl font-black text-[#B8520B] mt-1">184</Text>
            <Text className="text-[10px] text-gray-400 font-bold mt-1">Steady volume</Text>
          </View>
        </View>

        <View className="bg-white p-5 rounded-2xl border border-[#EAE3DE] mb-6 shadow-xs">
          <Text className="text-base font-bold text-[#1F130D] mb-3">Inventory Health Alert</Text>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm font-semibold text-[#1F130D]">Tomatoes (Stock Low)</Text>
            <Text className="text-xs font-bold text-red-500">3 kg left</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm font-semibold text-[#1F130D]">Mozzarella Cheese</Text>
            <Text className="text-xs font-bold text-green-600">18 kg left</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}