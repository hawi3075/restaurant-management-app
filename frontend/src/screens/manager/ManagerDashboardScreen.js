import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManagerDashboardScreen({ navigation }) {
  const stats = [
    { title: "Today's Revenue", value: '$1,245.80', icon: 'cash-outline', color: '#B8520B' },
    { title: 'Active Orders', value: '14', icon: 'receipt-outline', color: '#3B82F6' },
    { title: 'Total Staff', value: '8 On Duty', icon: 'people-outline', color: '#10B981' },
    { title: 'Low Inventory', value: '3 Items', icon: 'alert-circle-outline', color: '#EF4444' },
  ];

  const modules = [
    { title: 'User Management', desc: 'Manage customer accounts and roles', icon: 'person-circle-outline', screen: 'UserManagementScreen' },
    { title: 'Staff Management', desc: 'Monitor staff schedules and shifts', icon: 'shield-checkmark-outline', screen: 'StaffManagementScreen' },
    { title: 'Menu Management', desc: 'Add, update or remove food items', icon: 'restaurant-outline', screen: 'MenuManagementScreen' },
    { title: 'Inventory Management', desc: 'Track stock levels and supplies', icon: 'cube-outline', screen: 'InventoryManagementScreen' },
  ];

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Welcome Back</Text>
              <Text className="text-xl font-black text-[#1F130D]">Manager Portal</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs">
              <Ionicons name="notifications-outline" size={18} color="#1F130D" />
            </TouchableOpacity>
          </View>

          {/* Metrics Grid */}
          <View className="flex-row flex-wrap justify-between mb-6">
            {stats.map((stat, index) => (
              <View key={index} className="w-[48%] bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-3 shadow-xs">
                <View className="w-8 h-8 rounded-full bg-[#FEF7F3] items-center justify-center mb-2">
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
                <Text className="text-[10px] font-bold text-gray-400 uppercase">{stat.title}</Text>
                <Text className="text-base font-black text-[#1F130D]">{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Quick Management Navigation Cards */}
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Management Modules</Text>
          <View className="space-y-3">
            {modules.map((mod, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(mod.screen)}
                className="bg-white p-4 rounded-3xl border border-[#EAE3DE] flex-row items-center justify-between shadow-xs mb-3"
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 rounded-2xl bg-[#FEF7F3] items-center justify-center border border-[#B8520B]/20">
                    <Ionicons name={mod.icon} size={20} color="#B8520B" />
                  </View>
                  <View>
                    <Text className="text-sm font-black text-[#1F130D]">{mod.title}</Text>
                    <Text className="text-[10px] text-gray-500">{mod.desc}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#757575" />
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}