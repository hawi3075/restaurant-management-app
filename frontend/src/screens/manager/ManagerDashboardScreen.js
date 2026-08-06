import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManagerDashboardScreen({ navigation }) {
  const stats = [
    { title: "Today's Revenue", value: '$1,245.80', icon: 'cash-outline', color: '#F97316', bg: 'bg-orange-500/10' },
    { title: 'Active Orders', value: '14', icon: 'receipt-outline', color: '#38BDF8', bg: 'bg-sky-500/10' },
    { title: 'Total Staff', value: '8 On Duty', icon: 'people-outline', color: '#34D399', bg: 'bg-emerald-500/10' },
    { title: 'Inventory', value: '3 Items', icon: 'cube-outline', color: '#A855F7', bg: 'bg-purple-500/10' },
  ];

  const modules = [
    { title: 'User Management', desc: 'Manage customer accounts and roles', icon: 'person-circle-outline', screen: 'UserManagementScreen' },
    { title: 'Staff Management', desc: 'Monitor staff schedules and shifts', icon: 'shield-checkmark-outline', screen: 'StaffManagementScreen' },
    { title: 'Menu Management', desc: 'Add, update or remove food items', icon: 'restaurant-outline', screen: 'MenuManagementScreen' },
    { title: 'Inventory Management', desc: 'Track stock levels and supplies', icon: 'cube-outline', screen: 'InventoryManagementScreen' },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-slate-100">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          
          {/* Header with Title and Profile / Notification Icons on the Right */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">Executive Portal</Text>
              <Text className="text-2xl font-black text-slate-900 tracking-wide">Manager Dashboard</Text>
            </View>

            <View className="flex-row items-center space-x-2.5">
              {/* Profile Icon Button */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('CustomerProfileScreen')}
                className="w-11 h-11 bg-orange-500/10 rounded-2xl border border-orange-500/20 items-center justify-center shadow-sm active:scale-95"
              >
                <Ionicons name="person" size={20} color="#F97316" />
              </TouchableOpacity>

              {/* Notification Button */}
              <TouchableOpacity className="w-11 h-11 bg-slate-50 rounded-2xl border border-slate-200 items-center justify-center shadow-sm active:scale-95">
                <Ionicons name="notifications-outline" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Card */}
          <View className="bg-slate-900 p-5 rounded-3xl mb-6 shadow-xl relative overflow-hidden">
            <View className="absolute right-[-20] bottom-[-20] opacity-10">
              <Ionicons name="restaurant" size={120} color="#F97316" />
            </View>
            <Text className="text-orange-400 font-bold text-xs uppercase mb-1">Live Status</Text>
            <Text className="text-white text-lg font-black mb-2">Kitchen is running smoothly 🚀</Text>
            <Text className="text-slate-400 text-xs">All orders are up to date with zero major bottlenecks reported today.</Text>
          </View>

          {/* Metrics Grid */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Performance Overview</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            {stats.map((stat, index) => (
              <View key={index} className="w-[48%] bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-3 shadow-sm">
                <View className={`w-9 h-9 rounded-2xl ${stat.bg} items-center justify-center mb-3`}>
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</Text>
                <Text className="text-lg font-black text-slate-900 mt-0.5">{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Management Modules Navigation */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Management Modules</Text>
          <View className="space-y-3">
            {modules.map((mod, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(mod.screen)}
                className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex-row items-center justify-between shadow-sm mb-3 active:scale-[0.98]"
              >
                <View className="flex-row items-center space-x-3.5">
                  <View className="w-11 h-11 rounded-2xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
                    <Ionicons name={mod.icon} size={22} color="#F97316" />
                  </View>
                  <View>
                    <Text className="text-sm font-black text-slate-900">{mod.title}</Text>
                    <Text className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</Text>
                  </View>
                </View>
                <View className="w-8 h-8 rounded-full bg-white items-center justify-center border border-slate-200">
                  <Ionicons name="chevron-forward" size={16} color="#64748B" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}