import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminDashboard({ navigation }) {
  return (
    <View className="flex-1 bg-[#F8F9FC] pt-12 px-5">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-2xl font-black text-[#1F130D]">Admin Overview</Text>
          <Text className="text-xs text-gray-500">System health & database monitoring</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('RestaurantSettings')} className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs">
          <Ionicons name="settings-outline" size={18} color="#1F130D" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* System Health Metric Cards */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-white p-4 rounded-3xl border border-[#EAE3DE] flex-1 mr-2 shadow-xs">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">System Health</Text>
            <Text className="text-xl font-black text-green-600 mt-1">99.9%</Text>
            <Text className="text-[10px] text-gray-400 mt-1">Operational API</Text>
          </View>
          <View className="bg-white p-4 rounded-3xl border border-[#EAE3DE] flex-1 ml-2 shadow-xs">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Total Users</Text>
            <Text className="text-xl font-black text-[#B8520B] mt-1">1,248</Text>
            <Text className="text-[10px] text-gray-400 mt-1">Active Accounts</Text>
          </View>
        </View>

        {/* Management Quick Link Modules */}
        <Text className="text-lg font-bold text-[#1F130D] mb-3">System Controls</Text>
        <View className="space-y-3 mb-8">
          {[
            { title: 'User Account Management', screen: 'UserManagement', icon: 'people-outline' },
            { title: 'Restaurant Configuration & Settings', screen: 'RestaurantSettings', icon: 'business-outline' },
            { title: 'System Security Activity Logs', screen: 'ActivityLogs', icon: 'shield-checkmark-outline' }
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx}
              onPress={() => navigation.navigate(item.screen)}
              className="bg-white p-4 rounded-2xl border border-[#EAE3DE] flex-row justify-between items-center shadow-xs"
            >
              <View className="flex-row items-center space-x-3">
                <View className="w-10 h-10 bg-[#FEF7F3] rounded-xl items-center justify-center border border-[#B8520B]/20">
                  <Ionicons name={item.icon} size={18} color="#B8520B" />
                </View>
                <Text className="font-bold text-sm text-[#1F130D]">{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}