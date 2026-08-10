import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManagerDashboardScreen({ navigation }) {
  const [stats, setStats] = React.useState([
    { title: "Today's Revenue", value: '$0.00', icon: 'cash-outline', color: '#F97316', bg: 'bg-orange-500/10' },
    { title: 'Active Orders', value: '0', icon: 'receipt-outline', color: '#38BDF8', bg: 'bg-sky-500/10' },
    { title: 'Total Staff', value: '0', icon: 'people-outline', color: '#34D399', bg: 'bg-emerald-500/10' },
    { title: 'Inventory', value: '0 Items', icon: 'cube-outline', color: '#A855F7', bg: 'bg-purple-500/10' },
  ]);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/metrics');
        const j = await res.json();
        if (j) {
          setStats([
            { title: "Today's Revenue", value: `$${(j.revenue||0).toFixed(2)}`, icon: 'cash-outline', color: '#F97316', bg: 'bg-orange-500/10' },
            { title: 'Active Orders', value: String(j.activeOrders||0), icon: 'receipt-outline', color: '#38BDF8', bg: 'bg-sky-500/10' },
            { title: 'Total Staff', value: String(j.totalStaff||0)+' Members', icon: 'people-outline', color: '#34D399', bg: 'bg-emerald-500/10' },
            { title: 'Inventory', value: String(j.inventoryItems||0)+' Items', icon: 'cube-outline', color: '#A855F7', bg: 'bg-purple-500/10' },
          ]);
        }
      } catch (err) {
        console.error('Fetch metrics error', err);
      }
    };
    fetchMetrics();
  }, []);

  // Allow manual refresh
  const refreshMetrics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/metrics');
      const j = await res.json();
      if (j) {
        setStats([
          { title: "Today's Revenue", value: `$${(j.revenue||0).toFixed(2)}`, icon: 'cash-outline', color: '#F97316', bg: 'bg-orange-500/10' },
          { title: 'Active Orders', value: String(j.activeOrders||0), icon: 'receipt-outline', color: '#38BDF8', bg: 'bg-sky-500/10' },
          { title: 'Total Staff', value: String(j.totalStaff||0)+' Members', icon: 'people-outline', color: '#34D399', bg: 'bg-emerald-500/10' },
          { title: 'Inventory', value: String(j.inventoryItems||0)+' Items', icon: 'cube-outline', color: '#A855F7', bg: 'bg-purple-500/10' },
        ]);
      }
    } catch (err) {
      console.error('Refresh metrics error', err);
    }
  };

  const modules = [
    { title: 'User Management', desc: 'Manage customer accounts and roles', icon: 'person-circle-outline', screen: 'UserManagementScreen' },
    { title: 'Staff Management', desc: 'Monitor staff schedules and shifts', icon: 'shield-checkmark-outline', screen: 'StaffManagementScreen' },
    { title: 'Menu Management', desc: 'Add, update or remove food items', icon: 'restaurant-outline', screen: 'MenuManagementScreen' },
    { title: 'Inventory Management', desc: 'Track stock levels and supplies', icon: 'cube-outline', screen: 'InventoryManagementScreen' },
    { title: 'Support Messages', desc: 'Respond to customer chats & queries', icon: 'chatbubbles-outline', screen: 'SupportMessageScreen' },
    { title: 'Review Management', desc: 'Monitor and moderate customer feedback', icon: 'star-outline', screen: 'ReviewManagementScreen' },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-10 pb-24 px-5">
          
          {/* Top Row: Profile & Notification Icons Aligned to the Right */}
          <View className="flex-row justify-end items-center space-x-3 mb-3">
            <TouchableOpacity 
              onPress={() => navigation.navigate('ManagerProfileScreen')}
              className="w-11 h-11 bg-orange-500/10 rounded-2xl border-2 border-orange-500/30 items-center justify-center shadow-md active:scale-95"
            >
              <Ionicons name="person" size={20} color="#F97316" />
            </TouchableOpacity>

            <TouchableOpacity onPress={refreshMetrics} className="w-11 h-11 bg-slate-50 rounded-2xl border-2 border-slate-200 items-center justify-center shadow-md active:scale-95">
              <Ionicons name="sync-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Title Section Below Icons */}
          <View className="mb-6">
            <Text className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Executive Portal</Text>
            <Text className="text-2xl font-black text-slate-900 tracking-wide">Manager Dashboard</Text>
          </View>

          {/* Stylish Banner Card */}
          <View className="bg-slate-900 p-6 rounded-3xl mb-6 shadow-xl relative overflow-hidden border-2 border-slate-800">
            <View className="absolute right-[-20] bottom-[-20] opacity-15">
              <Ionicons name="restaurant" size={130} color="#F97316" />
            </View>
            <View className="flex-row items-center space-x-2 mb-2">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <Text className="text-orange-400 font-black text-xs uppercase tracking-wider">Live System Status</Text>
            </View>
            <Text className="text-white text-xl font-black mb-2">Operations running smoothly 🚀</Text>
            <Text className="text-slate-400 text-xs font-medium leading-relaxed">All active orders and inventory metrics are up to date with zero bottlenecks reported.</Text>
          </View>

          {/* Metrics Grid */}
          <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Performance Overview</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            {stats.map((stat, index) => (
              <View key={index} className="w-[48%] bg-white p-4 rounded-3xl border-2 border-slate-100 mb-3 shadow-md">
                <View className={`w-10 h-10 rounded-2xl ${stat.bg} items-center justify-center mb-3 border border-slate-200/50`}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.title}</Text>
                <Text className="text-lg font-black text-slate-900 mt-0.5">{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Management Modules Navigation */}
          <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Management Control Center</Text>
          <View className="space-y-3.5 pb-6">
            {modules.map((mod, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(mod.screen)}
                className="bg-white p-4 rounded-3xl border-2 border-slate-100 flex-row items-center justify-between shadow-md active:scale-[0.98]"
              >
                <View className="flex-row items-center space-x-4">
                  <View className="w-12 h-12 rounded-2xl bg-orange-500/10 items-center justify-center border-2 border-orange-500/20 shadow-sm">
                    <Ionicons name={mod.icon} size={22} color="#F97316" />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-black text-slate-900 tracking-wide">{mod.title}</Text>
                    <Text className="text-[11px] font-medium text-slate-500 mt-0.5">{mod.desc}</Text>
                  </View>
                </View>
                <View className="w-9 h-9 rounded-2xl bg-slate-50 items-center justify-center border-2 border-slate-200 shadow-sm">
                  <Ionicons name="chevron-forward" size={16} color="#0F172A" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}