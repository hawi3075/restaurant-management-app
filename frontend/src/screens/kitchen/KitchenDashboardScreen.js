import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import io from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';

const BACKEND_URL = 'http://localhost:5000'; 
const SOCKET_URL = BACKEND_URL;

export default function KitchenDashboardScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [chefName, setChefName] = useState('Chef Alex');
  const [chefEmail, setChefEmail] = useState('kitchen@restaurant.com');
  const [chefPhone, setChefPhone] = useState('+251 911 223 344');
  const [chefImage, setChefImage] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [activeTab, setActiveTab] = useState('All');
  const [kitchenOrders, setKitchenOrders] = useState([]);

  const formatOrderData = (ordersList) => {
    return (ordersList || []).map((order, index) => {
      let formattedAddress = null;
      if (order.deliveryAddress) {
        if (typeof order.deliveryAddress === 'object') {
          const { street, city } = order.deliveryAddress;
          formattedAddress = [street, city].filter(Boolean).join(', ') || 'GPS Location Coordinates';
        } else {
          formattedAddress = String(order.deliveryAddress);
        }
      }

      return {
        id: order._id || order.id || `k${index + 1}`,
        table: order.table?.tableNumber ? `Table ${String(order.table.tableNumber).padStart(2, '0')}` : (order.table || 'Walk-in'),
        time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
        status: order.status === 'Pending' ? 'Pending' : order.status === 'Confirmed' || order.status === 'Preparing' || order.status === 'Cooking' ? 'Cooking' : order.status === 'Ready' ? 'Ready' : order.status,
        source: order.paymentMethod === 'telebirr' ? 'Telebirr Order' : (order.serviceType || 'Customer App'),
        deliveryAddress: formattedAddress,
        phone: order.phone || order.customerPhone || null,
        items: (order.orderItems || order.items || []).map((item) => ({
          name: `${item.quantity || 1}x ${item.name || item.menuItem?.name || item.title || 'Item'}`,
          note: item.note ? `Note: ${item.note}` : (item.unitPrice ? `ETB ${item.unitPrice.toFixed(2)}` : 'Regular')
        })),
        image: null
      };
    });
  };

  const fetchKitchenOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const token = authContext?.token || await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/orders/incoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch kitchen orders');

      const rawOrders = data.success ? (data.orders || []) : (Array.isArray(data) ? data : (data.orders || []));
      const activeOrders = rawOrders.filter(o => {
        const st = (o.status || 'Pending').toLowerCase();
        return st !== 'served' && st !== 'delivered' && st !== 'cancelled';
      });

      setKitchenOrders(formatOrderData(activeOrders));
    } catch (error) {
      console.error('Fetch Kitchen Orders Error:', error);
      setKitchenOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [authContext?.token]);

  useEffect(() => {
    loadChefProfile();
    fetchKitchenOrders();

    const token = authContext?.token;
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }
    });

    socket.on('new_order_placed', (newOrder) => {
      setKitchenOrders(prev => [formatOrderData([newOrder])[0], ...prev]);
    });

    socket.on('order_status_updated', (data) => {
      const targetId = data.id || data._id;
      const updatedStatus = data.status === 'Preparing' || data.status === 'Cooking' ? 'Cooking' : data.status;
      
      setKitchenOrders(prev => prev.map(o => {
        if (String(o.id) === String(targetId)) {
          return { ...o, status: updatedStatus };
        }
        return o;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchKitchenOrders, authContext?.token]);

  const loadChefProfile = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) setChefName(parsedUser.name);
        if (parsedUser.email) setChefEmail(parsedUser.email);
        if (parsedUser.phone) setChefPhone(parsedUser.phone);
        if (parsedUser.image) setChefImage(parsedUser.image);
      }
    } catch (error) {
      console.error('Error loading stored chef profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.clear();
      setProfileModalVisible(false);
      if (navigation?.replace) {
        navigation.replace('CustomerLanding');
      }
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out properly.');
    }
  };

  const saveProfileChanges = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      let parsedUser = storedUser ? JSON.parse(storedUser) : {};
      
      parsedUser.name = chefName;
      parsedUser.email = chefEmail;
      parsedUser.phone = chefPhone;
      if (chefImage) parsedUser.image = chefImage;

      await AsyncStorage.setItem('user', JSON.stringify(parsedUser));
      setProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Save Profile Error:', error);
      Alert.alert('Error', 'Failed to save profile changes.');
    }
  };

  const pickChefImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setChefImage(result.assets[0].uri);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = authContext?.token || await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update order');

      const localStatus = newStatus === 'Preparing' || newStatus === 'Cooking' ? 'Cooking' : newStatus;
      setKitchenOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: localStatus } : order)));
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Update Kitchen Order Error:', error);
      Alert.alert('Error', error.message || 'Unable to update order status');
    }
  };

  const filteredOrders = kitchenOrders.filter(order => {
    if (activeTab === 'All') return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  const pendingCount = kitchenOrders.filter(o => o.status === 'Pending').length;
  const cookingCount = kitchenOrders.filter(o => o.status === 'Cooking').length;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl pb-16">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="flex-row items-center">
            <View className="w-9 h-9 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-2.5 overflow-hidden">
              {chefImage ? (
                <Image source={{ uri: chefImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="restaurant" size={16} color="#B8520B" />
              )}
            </View>
            <View>
              <Text className="text-sm font-black text-[#1F130D]">{chefName}</Text>
              <Text className="text-[10px] text-gray-400">Tap profile to edit</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={fetchKitchenOrders} className="bg-[#FEF7F3] px-3 py-1.5 rounded-xl border border-[#B8520B]/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            <Text className="text-[11px] font-bold text-[#B8520B]">Sync Live</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Scrollable */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-20">
          
          {/* Quick Metrics */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-3xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Orders</Text>
                <Ionicons name="alert-circle-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#B8520B]">{pendingCount}</Text>
            </View>
            <View className="flex-1 bg-white rounded-3xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cooking Now</Text>
                <Ionicons name="flame-outline" size={16} color="#E67E22" />
              </View>
              <Text className="text-2xl font-black text-[#1F130D]">{cookingCount}</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
            {['All', 'Pending', 'Cooking', 'Ready'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl mr-2 border ${activeTab === tab ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#1F130D]'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Orders Queue Header */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Active Kitchen Tickets ({filteredOrders.length})
          </Text>

          {/* Orders List */}
          {isLoadingOrders ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#B8520B" />
            </View>
          ) : filteredOrders.length === 0 ? (
            <View className="py-16 items-center justify-center bg-white rounded-3xl border border-[#EAE3DE] p-6">
              <Ionicons name="restaurant-outline" size={36} color="#9E9E9E" style={{ marginBottom: 8 }} />
              <Text className="text-sm font-bold text-gray-600">No active kitchen orders</Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">New orders from customer checkouts will appear here instantly.</Text>
            </View>
          ) : filteredOrders.map((order) => (
            <View key={order.id} className={`bg-white rounded-3xl p-4 border mb-3 shadow-xs ${order.status === 'Pending' ? 'border-[#B8520B]' : 'border-[#EAE3DE]'}`}>
              <View className="flex-row justify-between items-center mb-2.5 pb-2.5 border-b border-[#F8F9FC]">
                <View className="flex-row items-center">
                  <Text className="text-xs font-black text-[#1F130D] bg-[#FEF7F3] px-2.5 py-1 rounded-lg border border-[#B8520B]/20 mr-2">
                    {order.table}
                  </Text>
                  <Text className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded mr-2">{order.source}</Text>
                  <Text className="text-[11px] text-gray-400">{order.time}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${order.status === 'Pending' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : order.status === 'Cooking' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                  <Text className={`text-[10px] font-bold ${order.status === 'Pending' ? 'text-[#B8520B]' : order.status === 'Cooking' ? 'text-amber-600' : 'text-green-600'}`}>
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* Checkout Delivery & Contact Meta Data */}
              {(order.deliveryAddress || order.phone) && (
                <View className="bg-[#F8F9FC] p-2.5 rounded-2xl mb-3 border border-[#EAE3DE]">
                  <Text className="text-[10px] font-bold text-[#1F130D] mb-0.5">Checkout Info for Driver Coordination:</Text>
                  {order.deliveryAddress && <Text className="text-[10px] text-gray-600">📍 {order.deliveryAddress}</Text>}
                  {order.phone && <Text className="text-[10px] text-gray-600 mt-0.5">📞 {order.phone}</Text>}
                </View>
              )}

              {/* Order Items */}
              <View className="mb-3">
                {order.items.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between py-1 border-b border-gray-50">
                    <Text className="text-xs font-bold text-[#1F130D]">{item.name}</Text>
                    <Text className="text-[10px] text-[#B8520B] font-semibold">{item.note}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-end items-center pt-2.5 border-t border-[#F8F9FC] gap-2">
                {order.status === 'Pending' && (
                  <TouchableOpacity 
                    onPress={() => updateOrderStatus(order.id, 'Preparing')}
                    className="bg-[#B8520B] px-4 py-2 rounded-xl flex-row items-center"
                  >
                    <Ionicons name="flame" size={14} color="white" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-white">Accept & Cook</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Cooking' && (
                  <TouchableOpacity 
                    onPress={() => updateOrderStatus(order.id, 'Ready')}
                    className="bg-green-600 px-4 py-2 rounded-xl flex-row items-center"
                  >
                    <Ionicons name="checkmark-circle" size={14} color="white" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-white">Mark as Ready</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Ready' && (
                  <View className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                    <Text className="text-[10px] font-bold text-green-700">Ready for Waiter / Driver Pickup</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

        </ScrollView>

        {/* --- PROFILE MODAL --- */}
        <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Head Chef Profile</Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <View className="items-center mb-4 relative">
                <TouchableOpacity onPress={pickChefImage} className="relative">
                  <View className="w-20 h-20 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center overflow-hidden">
                    {chefImage ? (
                      <Image source={{ uri: chefImage }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="restaurant" size={32} color="#B8520B" />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 bg-[#B8520B] p-1.5 rounded-full border-2 border-white shadow-sm">
                    <Ionicons name="camera" size={12} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-xs font-bold text-[#B8520B] mt-2">Tap icon to change photo</Text>
              </View>

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Chef Name</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={chefName} onChangeText={setChefName} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Email Address</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={chefEmail} onChangeText={setChefEmail} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Phone Number</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" value={chefPhone} onChangeText={setChefPhone} />
              
              <TouchableOpacity onPress={saveProfileChanges} className="bg-[#B8520B] py-3.5 rounded-xl items-center mb-3">
                <Text className="text-white text-xs font-bold">Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} className="bg-red-50 border border-red-200 py-3 rounded-xl items-center flex-row justify-center">
                <Ionicons name="log-out-outline" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                <Text className="text-red-600 font-bold text-xs">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-around items-center shadow-lg">
          <TouchableOpacity onPress={() => setActiveTab('All')} className="items-center">
            <Ionicons name="fast-food" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Kitchen Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="items-center">
            <Ionicons name="person-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Chef Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}