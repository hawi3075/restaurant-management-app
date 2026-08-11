import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { BACKEND_URL } from '../api/backend';

export default function OrderManagementScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/orders`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Establish Socket.io connection for real-time order updates
    const socket = io(BACKEND_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to socket server for real-time orders');
    });

    socket.on('newOrder', (newOrder) => {
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    });

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(ord => (ord._id === updatedOrder._id ? updatedOrder : ord))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Calculate top summary metrics
  const totalOrdersCount = orders.length;
  const totalRevenueSum = orders.reduce((sum, ord) => sum + Number(ord.totalAmount || ord.total || 0), 0);

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-[#EAE3DE]">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Header */}
        <View className="pt-12 px-5 pb-4 border-b border-[#EAE3DE] flex-row items-center justify-between bg-white z-10">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-white rounded-2xl border border-[#EAE3DE] items-center justify-center shadow-xs active:scale-95 mr-3"
            >
              <Ionicons name="arrow-back" size={18} color="#1F130D" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-black text-[#B8520B] uppercase tracking-widest">Control Center</Text>
              <Text className="text-xl font-black text-[#1F130D] tracking-wide">Order Management</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={fetchOrders}
            className="w-10 h-10 bg-[#FEF7F3] rounded-2xl border border-[#B8520B]/30 items-center justify-center shadow-xs active:scale-95"
          >
            <Ionicons name="sync-outline" size={18} color="#B8520B" />
          </TouchableOpacity>
        </View>

        {/* Content list */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
          {/* Top Summary Banner */}
          {!loading && orders.length > 0 && (
            <View className="mb-5 flex-row space-x-3">
              <View className="flex-1 bg-[#FEF7F3] p-4 rounded-3xl border border-[#B8520B]/30">
                <Text className="text-[10px] font-black text-[#B8520B] uppercase tracking-wider">Total Orders</Text>
                <Text className="text-xl font-black text-[#1F130D] mt-1">{totalOrdersCount}</Text>
              </View>
              <View className="flex-1 bg-emerald-50 p-4 rounded-3xl border border-emerald-200">
                <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Total Revenue</Text>
                <Text className="text-xl font-black text-[#1F130D] mt-1">${totalRevenueSum.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#B8520B" />
              <Text className="text-xs font-bold text-gray-400 mt-3">Loading orders...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
              <Text className="text-sm font-black text-[#1F130D] mt-3">No Orders Found</Text>
              <Text className="text-xs text-gray-400 mt-1">Orders placed by customers will appear here in real-time.</Text>
            </View>
          ) : (
            <View className="space-y-4 pb-24">
              {orders.map((order, index) => {
                const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
                const formattedDate = orderDate.toLocaleDateString();
                const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const totalMoney = Number(order.totalAmount || order.total || 0).toFixed(2);
                
                const itemsList = order.orderItems || order.items || [];

                return (
                  <View key={order._id || index} className="bg-white p-4 rounded-3xl border border-[#EAE3DE] shadow-xs">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center space-x-2">
                        <View className="w-8 h-8 rounded-xl bg-[#FEF7F3] items-center justify-center border border-[#B8520B]/30 mr-2">
                          <Ionicons name="fast-food-outline" size={16} color="#B8520B" />
                        </View>
                        <Text className="text-xs font-black text-[#1F130D]">Order #{order._id ? order._id.slice(-6).toUpperCase() : index + 1}</Text>
                      </View>
                      <View className="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <Text className="text-[10px] font-black text-emerald-600 uppercase">{order.status || 'Completed'}</Text>
                      </View>
                    </View>

                    {/* Customer & Date Info */}
                    <View className="border-t border-gray-100 pt-2.5 mt-1 space-y-1">
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] font-medium text-gray-500">Customer:</Text>
                        <Text className="text-[11px] font-bold text-[#1F130D]">
                          {order.customerName || order.customer?.name || order.user?.name || 'Walk-in / Guest Customer'}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] font-medium text-gray-500">Date & Time:</Text>
                        <Text className="text-[11px] font-bold text-[#1F130D]">{formattedDate} at {formattedTime}</Text>
                      </View>
                    </View>

                    {/* Food Items Preview */}
                    <View className="border-t border-gray-100 pt-2.5 mt-2.5 space-y-2">
                      <Text className="text-[10px] font-black text-gray-400 uppercase">Ordered Items ({itemsList.length})</Text>
                      {itemsList.map((item, itemIdx) => {
                        const foodName = item.name || item.menuItem?.name || item.title || 'Food Item';
                        const foodImage = item.image || item.menuItem?.image || item.img;
                        const qty = item.quantity || item.qty || 1;
                        const price = item.price || 0;

                        return (
                          <View key={itemIdx} className="flex-row items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <View className="flex-row items-center space-x-2.5 flex-1">
                              {foodImage ? (
                                <Image source={{ uri: foodImage }} className="w-10 h-10 rounded-xl bg-gray-200 mr-2.5" resizeMode="cover" />
                              ) : (
                                <View className="w-10 h-10 rounded-xl bg-[#FEF7F3] items-center justify-center border border-[#B8520B]/30 mr-2.5">
                                  <Ionicons name="fast-food" size={16} color="#B8520B" />
                                </View>
                              )}
                              <View className="flex-1">
                                <Text className="text-xs font-black text-[#1F130D]" numberOfLines={1}>{foodName}</Text>
                                <Text className="text-[10px] font-bold text-gray-500">Qty: {qty} x ${Number(price).toFixed(2)}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Total Amount Footer */}
                    <View className="border-t border-gray-100 pt-3 mt-3 flex-row items-center justify-between">
                      <Text className="text-xs font-black text-gray-400 uppercase">Total Amount</Text>
                      <Text className="text-base font-black text-[#B8520B]">${totalMoney}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}