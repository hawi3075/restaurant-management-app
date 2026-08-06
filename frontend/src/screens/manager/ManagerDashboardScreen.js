import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManagerDashboardScreen({ navigation }) {
  const stats = [
    { title: "Today's Revenue", value: '$1,245.80', icon: 'cash-outline', color: '#EA580C', bg: 'bg-[#FFF7ED]' },
    { title: 'Active Orders', value: '14', icon: 'receipt-outline', color: '#F97316', bg: 'bg-[#FFF7ED]' },
    { title: 'Total Staff', value: '8 On Duty', icon: 'people-outline', color: '#C2410C', bg: 'bg-[#FFF7ED]' },
    { title: 'Inventory', value: '3 Items', icon: 'cube-outline', color: '#EA580C', bg: 'bg-[#FFF7ED]' },
  ];

  const modules = [
    { title: 'User Management', desc: 'Manage customer accounts and roles', icon: 'person-circle-outline', screen: 'UserManagementScreen' },
    { title: 'Staff Management', desc: 'Monitor staff schedules and shifts', icon: 'shield-checkmark-outline', screen: 'StaffManagementScreen' },
    { title: 'Menu Management', desc: 'Add, update or remove food items', icon: 'restaurant-outline', screen: 'MenuManagementScreen' },
    { title: 'Inventory Management', desc: 'Track stock levels and supplies', icon: 'cube-outline', screen: 'InventoryManagementScreen' },
  ];

  return (
    <View className="flex-1 bg-[#FFF5EB] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#FFFAF5] relative shadow-2xl overflow-hidden border-x border-[#FFE4D6]">
        <StatusBar barStyle="dark-content" backgroundColor="#FFF5EB" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-[11px] font-bold text-[#EA580C] uppercase tracking-widest">Executive Portal</Text>
              <Text className="text-2xl font-black text-[#2C221E] tracking-wide">Manager Dashboard</Text>
            </View>
            <TouchableOpacity className="w-11 h-11 bg-white rounded-2xl border border-[#FED7AA] items-center justify-center shadow-sm active:scale-95">
              <Ionicons name="notifications-outline" size={20} color="#EA580C" />
            </TouchableOpacity>
          </View>

          {/* Banner Card */}
          <View className="bg-gradient-to-r from-[#C2410C] to-[#9A3412] p-5 rounded-3xl mb-6 shadow-lg relative overflow-hidden">
            <View className="absolute right-[-20] bottom-[-20] opacity-10">
              <Ionicons name="restaurant" size={120} color="#FFFFFF" />
            </View>
            <Text className="text-orange-200 font-bold text-xs uppercase mb-1">Live Status</Text>
            <Text className="text-white text-lg font-black mb-2">Kitchen is running smoothly 🚀</Text>
            <Text className="text-orange-100 text-xs">All orders are up to date with zero major bottlenecks reported today.</Text>
          </View>

          {/* Metrics Grid */}
          <Text className="text-xs font-bold text-[#9A3412] uppercase tracking-wider mb-3">Performance Overview</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            {stats.map((stat, index) => (
              <View key={index} className="w-[48%] bg-white p-4 rounded-3xl border border-[#FED7AA] mb-3 shadow-sm">
                <View className={`w-9 h-9 rounded-2xl ${stat.bg} items-center justify-center mb-3 border border-orange-200`}>
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text className="text-[10px] font-bold text-[#9A3412] uppercase tracking-wider">{stat.title}</Text>
                <Text className="text-lg font-black text-[#2C221E] mt-0.5">{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Management Modules Navigation */}
          <Text className="text-xs font-bold text-[#9A3412] uppercase tracking-wider mb-3">Management Modules</Text>
          <View className="space-y-3">
            {modules.map((mod, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(mod.screen)}
                className="bg-white p-4 rounded-3xl border border-[#FED7AA] flex-row items-center justify-between shadow-sm mb-3 active:scale-[0.98]"
              >
                <View className="flex-row items-center space-x-3.5">
                  <View className="w-11 h-11 rounded-2xl bg-[#FFF7ED] items-center justify-center border border-orange-200">
                    <Ionicons name={mod.icon} size={22} color="#EA580C" />
                  </View>
                  <View>
                    <Text className="text-sm font-black text-[#2C221E]">{mod.title}</Text>
                    <Text className="text-[11px] text-[#9A3412] mt-0.5">{mod.desc}</Text>
                  </View>
                </View>
                <View className="w-8 h-8 rounded-full bg-[#FFF7ED] items-center justify-center border border-orange-200">
                  <Ionicons name="chevron-forward" size={16} color="#EA580C" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}