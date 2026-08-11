import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../api/backend';

export default function OrderManagementScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const baseUrl = typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/orders`);
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
  }, []);

  // Calculate top summary metrics
  const totalOrdersCount = orders.length;
  const totalRevenueSum = orders.reduce((sum, ord) => sum + Number(ord.totalAmount || ord.total || 0), 0);

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Header */}
        <View className="pt-10 px-5 pb-4 border-b-2 border-slate-100 flex-row items-center justify-between bg-white z-10">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-slate-50 rounded-2xl border-2 border-slate-200 items-center justify-center shadow-sm active:scale-95"
            >
              <Ionicons name="arrow-back" size={18} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Control Center</Text>
              <Text className="text-xl font-black text-slate-900 tracking-wide">Order Management</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={fetchOrders}
            className="w-10 h-10 bg-orange-500/10 rounded-2xl border-2 border-orange-500/20 items-center justify-center shadow-sm active:scale-95"
          >
            <Ionicons name="sync-outline" size={18} color="#F97316" />
          </TouchableOpacity>
        </View>

        {/* Content list */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
          {/* Top Summary Banner */}
          {!loading && orders.length > 0 && (
            <View className="mb-5 flex-row space-x-3">
              <View className="flex-1 bg-orange-500/10 p-4 rounded-3xl border-2 border-orange-500/20">
                <Text className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Total Orders</Text>
                <Text className="text-xl font-black text-slate-900 mt-1">{totalOrdersCount}</Text>
              </View>
              <View className="flex-1 bg-emerald-500/10 p-4 rounded-3xl border-2 border-emerald-500/20">
                <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Total Revenue</Text>
                <Text className="text-xl font-black text-slate-900 mt-1">${totalRevenueSum.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#F97316" />
              <Text className="text-xs font-bold text-slate-400 mt-3">Loading orders...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
              <Text className="text-sm font-black text-slate-700 mt-3">No Orders Found</Text>
              <Text className="text-xs text-slate-400 mt-1">Orders placed by customers will appear here.</Text>
            </View>
          ) : (
            <View className="space-y-3.5 pb-24">
              {orders.map((order, index) => {
                const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
                const formattedDate = orderDate.toLocaleDateString();
                const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const totalMoney = Number(order.totalAmount || order.total || 0).toFixed(2);
                
                // Use orderItems from your database schema
                const itemsList = order.orderItems || order.items || [];

                return (
                  <View key={order._id || index} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-md">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center space-x-2">
                        <View className="w-8 h-8 rounded-xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
                          <Ionicons name="fast-food-outline" size={16} color="#F97316" />
                        </View>
                        <Text className="text-xs font-black text-slate-900">Order #{order._id ? order._id.slice(-6).toUpperCase() : index + 1}</Text>
                      </View>
                      <View className="bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                        <Text className="text-[10px] font-black text-emerald-600 uppercase">{order.status || 'Completed'}</Text>
                      </View>
                    </View>

                    {/* Customer & Date Info */}
                    <View className="border-t border-slate-100 pt-2.5 mt-1 space-y-1">
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] font-medium text-slate-500">Customer:</Text>
                        <Text className="text-[11px] font-bold text-slate-800">
                          {order.customerName || order.customer?.name || order.user?.name || 'Walk-in / Guest Customer'}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] font-medium text-slate-500">Date & Time:</Text>
                        <Text className="text-[11px] font-bold text-slate-800">{formattedDate} at {formattedTime}</Text>
                      </View>
                    </View>

                    {/* Food Items Preview (Image, Name & Quantity) */}
                    <View className="border-t border-slate-100 pt-2.5 mt-2.5 space-y-2">
                      <Text className="text-[10px] font-black text-slate-400 uppercase">Ordered Items ({itemsList.length})</Text>
                      {itemsList.map((item, itemIdx) => {
                        const foodName = item.name || item.menuItem?.name || item.title || 'Food Item';
                        const foodImage = item.image || item.menuItem?.image || item.img;
                        const qty = item.quantity || item.qty || 1;
                        const price = item.price || 0;

                        return (
                          <View key={itemIdx} className="flex-row items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            <View className="flex-row items-center space-x-2.5 flex-1">
                              {foodImage ? (
                                <Image source={{ uri: foodImage }} className="w-10 h-10 rounded-xl bg-slate-200" resizeMode="cover" />
                              ) : (
                                <View className="w-10 h-10 rounded-xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
                                  <Ionicons name="fast-food" size={16} color="#F97316" />
                                </View>
                              )}
                              <View className="flex-1">
                                <Text className="text-xs font-black text-slate-900" numberOfLines={1}>{foodName}</Text>
                                <Text className="text-[10px] font-bold text-slate-500">Qty: {qty} x ${Number(price).toFixed(2)}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Total Amount Footer */}
                    <View className="border-t border-slate-100 pt-3 mt-3 flex-row items-center justify-between">
                      <Text className="text-xs font-black text-slate-400 uppercase">Total Amount</Text>
                      <Text className="text-base font-black text-orange-500">${totalMoney}</Text>
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