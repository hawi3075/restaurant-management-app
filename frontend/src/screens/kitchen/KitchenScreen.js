import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function KitchenScreen() {
  const [orders, setOrders] = useState([
    { id: 'ORD-402', table: 'Tbl 12', time: '24m', status: 'Pending', items: ['1x Ribeye Steak (Med Rare)', '2x Truffle Fries (Extra Crispy)'], alert: 'urgent' },
    { id: 'ORD-403', table: 'Tbl 04', time: '18m', status: 'Preparing', items: ['2x Grilled Salmon (Lemon on side)', '1x Asparagus'], alert: 'warning' },
    { id: 'ORD-404', table: 'Bar 02', time: '08m', status: 'Preparing', items: ['3x Craft Burger (Sub GF Bun)', '1x Spicy Wings'], alert: 'normal' },
  ]);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <View className="flex-1 bg-[#121212] pt-12">
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-800">
        <View className="flex-row items-center space-x-3">
          <MaterialCommunityIcons name="chef-hat" size={28} color="#E67E22" />
          <Text className="text-base font-bold text-white tracking-wider">KITCHEN DISPLAY SYSTEM</Text>
        </View>
        <View className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500">
          <Text className="text-red-400 font-bold text-[10px]">LIVE SERVICE</Text>
        </View>
      </View>

      {/* Orders Queue */}
      <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
        {orders.map((order, idx) => {
          const isUrgent = order.alert === 'urgent';
          const isWarning = order.alert === 'warning';

          return (
            <View 
              key={idx} 
              className={`bg-[#1E1E1E] rounded-2xl mb-4 border ${isUrgent ? 'border-red-500' : isWarning ? 'border-orange-500' : 'border-blue-500'} overflow-hidden shadow-lg`}
            >
              {/* Card Ribbon */}
              <View className={`px-4 py-3 flex-row justify-between items-center ${isUrgent ? 'bg-red-500/25' : isWarning ? 'bg-orange-500/25' : 'bg-blue-500/25'}`}>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-white font-black text-base">{order.table}</Text>
                  <Text className="text-gray-400 text-xs">({order.id})</Text>
                </View>
                <View className="flex-row items-center space-x-1">
                  <Ionicons name="time-outline" size={14} color={isUrgent ? '#ef4444' : '#f97316'} />
                  <Text className={`font-bold text-xs ${isUrgent ? 'text-red-400' : 'text-orange-400'}`}>{order.time}</Text>
                </View>
              </View>

              {/* Items List */}
              <View className="p-4 space-y-2">
                {order.items.map((item, iIdx) => (
                  <View key={iIdx} className="py-1 border-b border-gray-800/60">
                    <Text className="text-gray-200 text-sm font-medium">• {item}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons (Module 7: Preparing -> Ready -> Completed) */}
              <View className="p-4 pt-0 flex-row space-x-2">
                {order.status === 'Pending' && (
                  <TouchableOpacity 
                    onPress={() => updateStatus(order.id, 'Preparing')}
                    className="flex-1 bg-blue-600 py-3 rounded-xl items-center shadow"
                  >
                    <Text className="text-white font-bold text-xs tracking-wider">START COOKING</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Preparing' && (
                  <TouchableOpacity 
                    onPress={() => updateStatus(order.id, 'Completed')}
                    className="flex-1 bg-green-600 py-3 rounded-xl items-center shadow"
                  >
                    <Text className="text-white font-bold text-xs tracking-wider">MARK READY</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Completed' && (
                  <View className="flex-1 bg-gray-800 py-3 rounded-xl items-center">
                    <Text className="text-gray-400 font-bold text-xs tracking-wider">COMPLETED</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}