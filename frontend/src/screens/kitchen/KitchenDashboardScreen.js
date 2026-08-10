import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BACKEND_URL } from '../../api/backend';

export default function KitchenDashboardScreen({ route, navigation }) {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [chefName, setChefName] = useState('Chef Gordon');
  const [chefEmail, setChefEmail] = useState('gordon.chef@restaurant.com');
  const [chefPhone, setChefPhone] = useState('+1 555 019 283');
  const [chefImage, setChefImage] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [activeTab, setActiveTab] = useState('All');
  
  const [kitchenOrders, setKitchenOrders] = useState([]);

  useEffect(() => {
    fetchKitchenOrders();
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const response = await fetch(`${BACKEND_URL}/api/orders/incoming`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch kitchen orders');

      const incoming = (data.orders || []).map((order, index) => ({
        id: order._id || order.id || `k${index + 1}`,
        table: order.table?.tableNumber ? `Table ${String(order.table.tableNumber).padStart(2, '0')}` : 'Walk-in',
        time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
        status: order.status === 'Pending' ? 'Pending' : order.status === 'Confirmed' || order.status === 'Preparing' ? 'Cooking' : order.status === 'Ready' ? 'Ready' : order.status,
        source: order.paymentMethod === 'telebirr' ? 'Telebirr Order' : 'Customer App',
        items: (order.orderItems || []).map((item) => ({
          name: `${item.quantity || 1}x ${item.name || 'Item'}`,
          note: item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : 'Regular'
        })),
        image: null
      }));

      setKitchenOrders(incoming);
    } catch (error) {
      console.error('Fetch Kitchen Orders Error:', error);
      setKitchenOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerLanding', params: { isLoggedIn: false } }],
    });
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
      const response = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update order');

      const localStatus = newStatus === 'Preparing' ? 'Cooking' : newStatus;
      setKitchenOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: localStatus } : order)));
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
              <Text className="text-sm font-black text-[#1F130D]">Kitchen Station</Text>
              <Text className="text-[10px] text-gray-400">Tap profile to edit</Text>
            </View>
          </TouchableOpacity>
          
          <View className="bg-[#FEF7F3] px-3 py-1.5 rounded-xl border border-[#B8520B]/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            <Text className="text-[11px] font-bold text-[#B8520B]">Live Feed</Text>
          </View>
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
                <Ionicons name="flame-outline" size={16} color="amber" />
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
            <View className="py-16 items-center justify-center">
              <Text className="text-sm text-gray-500">No kitchen orders yet.</Text>
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

              <View className="mb-3">
                {order.items.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between py-1 border-b border-gray-50 last:border-b-0">
                    <Text className="text-xs font-bold text-[#1F130D]">{item.name}</Text>
                    <Text className="text-[10px] text-red-500 font-semibold italic">{item.note}</Text>
                  </View>
                ))}
                {order.image && (
                  <Image source={{ uri: order.image }} className="w-full h-32 rounded-xl mt-2.5 object-cover" />
                )}
              </View>

              <View className="flex-row justify-end items-center pt-2.5 border-t border-[#F8F9FC] gap-2">
                {order.status === 'Pending' && (
                  <TouchableOpacity 
                    onPress={() => updateOrderStatus(order.id, 'Preparing')}
                    className="bg-[#B8520B] px-4 py-2 rounded-xl flex-row items-center"
                  >
                    <Ionicons name="flame" size={14} color="white" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-white">Start Cooking</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Cooking' && (
                  <TouchableOpacity 
                    onPress={() => updateOrderStatus(order.id, 'Ready')}
                    className="bg-green-600 px-4 py-2 rounded-xl flex-row items-center"
                  >
                    <Ionicons name="checkmark-circle" size={14} color="white" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-white">Mark Ready to Serve</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Ready' && (
                  <View className="bg-gray-100 px-3 py-1.5 rounded-xl">
                    <Text className="text-[10px] font-bold text-gray-500">Dispatched to Waiter</Text>
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
              
              <TouchableOpacity onPress={() => setProfileModalVisible(false)} className="bg-[#B8520B] py-3.5 rounded-xl items-center mb-3">
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