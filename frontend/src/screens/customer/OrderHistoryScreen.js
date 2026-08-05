import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderHistoryScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  
  const isLoggedIn = route?.params?.isLoggedIn ?? false;

  const activeOrders = [
    {
      id: 'ORD-9821',
      date: 'Aug 5, 2026 • 6:45 PM',
      status: 'Preparing',
      items: '1x Truffle Mushroom Risotto, 1x Seared Salmon Plate',
      total: '$50.00',
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80',
    }
  ];

  const pastOrders = [
    {
      id: 'ORD-9742',
      date: 'Jul 28, 2026 • 1:15 PM',
      status: 'Delivered',
      items: '2x Classic Cheeseburger Combo',
      total: '$34.50',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'ORD-9610',
      date: 'Jul 20, 2026 • 8:30 PM',
      status: 'Delivered',
      items: '1x Margherita Pizza, 1x Iced Lemon Tea',
      total: '$22.00',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    }
  ];

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <Text className="text-xl font-black text-[#1F130D]">My Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="relative">
            <Ionicons name="cart-outline" size={22} color="#1F130D" />
          </TouchableOpacity>
        </View>

        {/* Tabs Switcher */}
        <View className="px-5 mt-4 mb-2">
          <View className="flex-row bg-[#EAE3DE]/50 p-1 rounded-2xl">
            <TouchableOpacity 
              onPress={() => setActiveTab('active')} 
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'active' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === 'active' ? 'text-[#B8520B]' : 'text-gray-500'}`}>
                Active Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('history')} 
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'history' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === 'history' ? 'text-[#B8520B]' : 'text-gray-500'}`}>
                Order History
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders List */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-2 pb-24">
          {displayedOrders.length === 0 ? (
            <View className="items-center justify-center pt-20">
              <View className="w-16 h-16 bg-[#FEF7F3] rounded-full items-center justify-center mb-3 border border-[#B8520B]/20">
                <Ionicons name="receipt-outline" size={28} color="#B8520B" />
              </View>
              <Text className="text-sm font-bold text-[#1F130D] mb-1">No orders found</Text>
              <Text className="text-[11px] text-gray-400 text-center px-6">
                You don't have any {activeTab === 'active' ? 'active' : 'past'} orders right now.
              </Text>
            </View>
          ) : (
            displayedOrders.map((order) => (
              <View key={order.id} className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-3 shadow-xs">
                <View className="flex-row justify-between items-center mb-3 border-b border-[#F8F9FC] pb-2.5">
                  <View>
                    <Text className="text-xs font-black text-[#1F130D]">{order.id}</Text>
                    <Text className="text-[9px] text-gray-400">{order.date}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${order.status === 'Preparing' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : 'bg-green-50 border border-green-200'}`}>
                    <Text className={`text-[9px] font-bold ${order.status === 'Preparing' ? 'text-[#B8520B]' : 'text-green-600'}`}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-3">
                  <Image source={{ uri: order.image }} className="w-14 h-14 rounded-xl mr-3" />
                  <View className="flex-1">
                    <Text className="text-[11px] font-bold text-[#1F130D] mb-1" numberOfLines={2}>{order.items}</Text>
                    <Text className="text-xs font-black text-[#B8520B]">{order.total}</Text>
                  </View>
                </View>

                <View className="flex-row justify-end space-x-2 pt-2 border-t border-[#F8F9FC]">
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('MenuScreen')}
                    className="bg-[#FEF7F3] border border-[#B8520B]/30 px-3 py-1.5 rounded-xl"
                  >
                    <Text className="text-[10px] font-bold text-[#B8520B]">Reorder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Bottom Mobile Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding', { isLoggedIn })} className="items-center">
            <Ionicons name="home-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistoryScreen')} className="items-center">
            <Ionicons name="receipt" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="items-center">
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="items-center">
            <Ionicons name="notifications-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate(isLoggedIn ? 'CustomerProfileScreen' : 'Signup')} 
            className="items-center"
          >
            <Ionicons name={isLoggedIn ? "person-outline" : "person-add-outline"} size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">{isLoggedIn ? 'Profile' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}