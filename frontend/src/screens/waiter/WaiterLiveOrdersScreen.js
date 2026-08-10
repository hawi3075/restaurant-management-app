import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';
const SOCKET_URL = BACKEND_URL;

export default function WaiterLiveOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const socket = io(SOCKET_URL, { transports: ['websocket'] });

  useEffect(() => {
    // Fetch existing incoming orders
    fetch(`${BACKEND_URL}/api/orders/incoming`).then(r => r.json()).then(j => {
      if (j.success) setOrders(j.orders || j.orders?.length ? j.orders : []);
    }).catch(err => console.error('Fetch incoming orders', err));

    socket.on('new_order_placed', (o) => {
      setOrders(prev => [o, ...prev]);
    });

    socket.on('order_status_updated', (data) => {
      setOrders(prev => prev.map(o => (String(o._id || o.id) === String(data.id) ? { ...o, status: data.status } : o)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed to update');
      Alert.alert('Success', 'Order status updated');
    } catch (err) {
      console.error('Update status error', err);
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[940px] flex-1 bg-white relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        <ScrollView className="p-5">
          <Text className="text-xl font-black mb-4">Live Orders</Text>
          {orders.length === 0 ? (
            <Text className="text-sm text-gray-500">No incoming orders</Text>
          ) : (
            orders.map((o) => (
              <View key={o._id || o.id} className="border rounded-2xl p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-bold">Order {o._id ? o._id.slice(-6) : o.id}</Text>
                  <Text className="text-sm text-gray-500">{o.status || o.orderStatus || 'Pending'}</Text>
                </View>
                <Text className="text-xs text-gray-500 mb-2">{o.orderItems ? (Array.isArray(o.orderItems) ? o.orderItems.map(it => `${it.quantity}x ${it.name || it.menuItem || ''}`).join(', ') : '') : ''}</Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity onPress={() => updateStatus(o._id || o.id, 'Preparing')} className="px-3 py-1 bg-yellow-100 rounded-xl">
                    <Text className="text-xs font-bold">Preparing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateStatus(o._id || o.id, 'Ready')} className="px-3 py-1 bg-green-100 rounded-xl">
                    <Text className="text-xs font-bold">Ready</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateStatus(o._id || o.id, 'Served')} className="px-3 py-1 bg-blue-100 rounded-xl">
                    <Text className="text-xs font-bold">Served</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
