import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';

export default function WaiterLiveOrdersScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use base backend URL from environment or fallback to your server port
  const BACKEND_URL = 'http://localhost:5000';
  const SOCKET_URL = BACKEND_URL;

  const fetchIncomingOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = authContext?.token || '';
      const res = await fetch(`${BACKEND_URL}/api/orders/incoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const j = await res.json();
      if (res.ok) {
        const fetchedOrders = j.success ? (j.orders || []) : (Array.isArray(j) ? j : []);
        // Filter out orders that are already served or delivered so they leave the live feed
        const activeLiveOrders = fetchedOrders.filter(o => o.status !== 'Served' && o.status !== 'Delivered');
        setOrders(activeLiveOrders);
      } else {
        console.error('Failed to fetch incoming orders:', j.message);
      }
    } catch (err) {
      console.error('Fetch incoming orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [authContext?.token]);

  useEffect(() => {
    fetchIncomingOrders();

    const socket = io(SOCKET_URL, { 
      transports: ['websocket'],
      auth: { token: authContext?.token }
    });

    socket.on('new_order_placed', (o) => {
      if (o.status !== 'Served' && o.status !== 'Delivered') {
        setOrders(prev => [o, ...prev]);
      }
    });

    socket.on('order_status_updated', (data) => {
      if (data.status === 'Served' || data.status === 'Delivered') {
        // Remove from live stream if it's completed/served
        setOrders(prev => prev.filter(o => String(o._id || o.id) !== String(data.id)));
      } else {
        setOrders(prev => prev.map(o => (String(o._id || o.id) === String(data.id) ? { ...o, status: data.status } : o)));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchIncomingOrders, authContext?.token]);

  const updateStatus = async (id, status) => {
    try {
      const token = authContext?.token || '';
      const res = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed to update');
      
      // If status is 'Served', filter it out of the active live feed entirely.
      // Otherwise, update its status in place.
      if (status === 'Served' || status === 'Delivered') {
        setOrders(prev => prev.filter(o => String(o._id || o.id) !== String(id)));
      } else {
        setOrders(prev => prev.map(o => (String(o._id || o.id) === String(id) ? { ...o, status } : o)));
      }

      Alert.alert('Success', 'Order status updated');
    } catch (err) {
      console.error('Update status error', err);
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl pb-16">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-9 h-9 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-2.5">
              <Ionicons name="notifications" size={18} color="#B8520B" />
            </View>
            <View>
              <Text className="text-sm font-black text-[#1F130D]">Live Feed</Text>
              <Text className="text-[10px] text-gray-400">Real-time incoming orders</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={fetchIncomingOrders}
            className="bg-[#FEF7F3] border border-[#B8520B]/30 px-3.5 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="refresh" size={14} color="#B8520B" style={{ marginRight: 4 }} />
            <Text className="text-[#B8520B] text-xs font-bold">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Order List */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-20">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Active Stream ({orders.length})
          </Text>

          {loading && orders.length === 0 ? (
            <ActivityIndicator size="large" color="#B8520B" className="mt-10" />
          ) : orders.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 border border-[#EAE3DE] items-center mt-4">
              <Ionicons name="receipt-outline" size={40} color="#9E9E9E" style={{ marginBottom: 8 }} />
              <Text className="text-sm font-bold text-gray-600">No incoming orders</Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">New orders from customers will appear here automatically.</Text>
            </View>
          ) : (
            orders.map((o) => {
              const orderId = o._id || o.id;
              const currentStatus = o.status || o.orderStatus || 'Pending';
              
              return (
                <View key={orderId} className="bg-white rounded-3xl p-4 border border-[#EAE3DE] mb-3 shadow-xs">
                  <View className="flex-row justify-between items-center mb-2.5 pb-2.5 border-b border-[#F8F9FC]">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-black text-[#1F130D] bg-[#FEF7F3] px-2.5 py-1 rounded-lg border border-[#B8520B]/20 mr-2">
                        {o.table || `Order #${String(orderId).slice(-6)}`}
                      </Text>
                      <Text className="text-[11px] text-gray-400">{o.time || 'Just now'}</Text>
                    </View>
                    <View className="px-2.5 py-1 rounded-full bg-gray-100">
                      <Text className="text-[10px] font-bold text-gray-600">{currentStatus}</Text>
                    </View>
                  </View>

                  <Text className="text-xs text-[#1F130D] mb-3">
                    {o.orderItems 
                      ? (Array.isArray(o.orderItems) 
                          ? o.orderItems.map(it => `${it.quantity}x ${it.name || it.menuItem || ''}`).join(', ') 
                          : String(o.orderItems)) 
                      : (o.items ? o.items.map(i => i.name).join(', ') : 'Custom Order')}
                  </Text>

                  <View className="flex-row justify-end gap-2 pt-2.5 border-t border-[#F8F9FC]">
                    <TouchableOpacity 
                      onPress={() => updateStatus(orderId, 'Preparing')} 
                      className="px-3 py-1.5 bg-amber-100 rounded-xl"
                    >
                      <Text className="text-[10px] font-bold text-amber-800">Preparing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => updateStatus(orderId, 'Ready')} 
                      className="px-3 py-1.5 bg-green-100 rounded-xl"
                    >
                      <Text className="text-[10px] font-bold text-green-800">Ready</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => updateStatus(orderId, 'Served')} 
                      className="px-3 py-1.5 bg-blue-100 rounded-xl"
                    >
                      <Text className="text-[10px] font-bold text-blue-800">Served</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('WaiterDashboard')} className="items-center">
            <Ionicons name="grid-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Station</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WaiterLiveOrders')} className="items-center">
            <Ionicons name="notifications" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Live</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WaiterDashboard')} className="items-center">
            <Ionicons name="add-circle-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WaiterDashboard')} className="items-center">
            <Ionicons name="person-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}