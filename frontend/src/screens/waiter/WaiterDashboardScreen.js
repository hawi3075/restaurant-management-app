import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function WaiterDashboardScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Profile state
  const [name, setName] = useState('Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@restaurant.com');
  const [phone, setPhone] = useState('+1 987 654 321');
  const [profileImage, setProfileImage] = useState(null);

  // New order modal state
  const [newOrderModalVisible, setNewOrderModalVisible] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [orderImage, setOrderImage] = useState(null);
  
  // Filter and API state
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Base API URL (adjust to match your backend port/host)
  const API_URL = 'http://localhost:5000/api';

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = authContext?.token || '';
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (err) {
      console.error('Network request failed:', err);
    } finally {
      setLoading(false);
    }
  }, [authContext?.token]);

  useEffect(() => {
    fetchOrders();
    // Optional: set up interval to poll for new orders live
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleLogout = () => {
    (async () => {
      try {
        if (authContext && authContext.logout) await authContext.logout();
      } catch (err) {
        console.error('Logout failed', err);
      }
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    })();
  };

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const pickOrderImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setOrderImage(result.assets[0].uri);
    }
  };

  const handleCreateOrder = async () => {
    if (!tableNumber || !orderDetails) return;
    
    try {
      setSubmitting(true);
      const token = authContext?.token || '';
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: `Table ${tableNumber}`,
          items: [{ name: orderDetails, note: 'Custom manual entry' }],
          source: 'Waiter Entry',
          image: orderImage
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOrders([data, ...orders]);
        setTableNumber('');
        setOrderDetails('');
        setOrderImage(null);
        setNewOrderModalVisible(false);
        fetchOrders(); // Refresh list
      } else {
        alert(data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Create order error:', err);
      alert('Network error while creating order.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = authContext?.token || '';
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(order => order.id === id || order._id === id ? { ...order, status: newStatus } : order));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || (order.status && order.status.toLowerCase() === activeTab.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      order.table?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.items?.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const newOrdersCount = orders.filter(o => o.status === 'New').length;
  const activeTablesCount = new Set(orders.map(o => o.table)).size;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl pb-16">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setEditModalVisible(true)} className="flex-row items-center">
            <View className="w-9 h-9 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-2.5 overflow-hidden">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={18} color="#B8520B" />
              )}
            </View>
            <View>
              <Text className="text-sm font-black text-[#1F130D]">Waiter Station</Text>
              <Text className="text-[10px] text-gray-400">Tap profile to edit</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setNewOrderModalVisible(true)}
            className="bg-[#B8520B] px-3.5 py-2 rounded-xl flex-row items-center shadow-xs active:opacity-90"
          >
            <Ionicons name="add" size={16} color="white" style={{ marginRight: 4 }} />
            <Text className="text-white text-xs font-bold">New Order</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Scrollable */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-20">
          
          {/* Quick Metrics */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-3xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Tables</Text>
                <Ionicons name="grid-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#1F130D]">{activeTablesCount}</Text>
            </View>
            <View className="flex-1 bg-white rounded-3xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Incoming Orders</Text>
                <Ionicons name="notifications-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#B8520B]">{newOrdersCount}</Text>
            </View>
          </View>

          {/* Search bar */}
          <View className="bg-white border border-[#EAE3DE] rounded-2xl px-4 py-2.5 flex-row items-center mb-4 shadow-xs">
            <Ionicons name="search-outline" size={16} color="#757575" style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search table number or dishes..." 
              placeholderTextColor="#9E9E9E"
              className="flex-1 text-xs text-[#1F130D]"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
            {['All', 'New', 'Preparing', 'Ready', 'Served'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl mr-2 border ${activeTab === tab ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#1F130D]'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Live Table Orders Header */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Live Table Orders ({filteredOrders.length})
          </Text>

          {loading && orders.length === 0 ? (
            <ActivityIndicator size="large" color="#B8520B" className="mt-10" />
          ) : (
            filteredOrders.map((order) => {
              const orderId = order.id || order._id;
              return (
                <View key={orderId} className={`bg-white rounded-3xl p-4 border mb-3 shadow-xs ${order.status === 'New' ? 'border-[#B8520B]' : 'border-[#EAE3DE]'}`}>
                  <View className="flex-row justify-between items-center mb-2.5 pb-2.5 border-b border-[#F8F9FC]">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-black text-[#1F130D] bg-[#FEF7F3] px-2.5 py-1 rounded-lg border border-[#B8520B]/20 mr-2">
                        {order.table}
                      </Text>
                      <Text className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded mr-2">{order.source || 'Customer App'}</Text>
                      <Text className="text-[11px] text-gray-400">{order.time || 'Just now'}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${order.status === 'New' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : 'bg-gray-100'}`}>
                      <Text className={`text-[10px] font-bold ${order.status === 'New' ? 'text-[#B8520B]' : 'text-gray-600'}`}>{order.status}</Text>
                    </View>
                  </View>

                  <View className="mb-3">
                    {order.items?.map((item, idx) => (
                      <View key={idx} className="flex-row justify-between py-0.5">
                        <Text className="text-xs font-semibold text-[#1F130D]">{item.name}</Text>
                        <Text className="text-[10px] text-gray-400 italic">{item.note}</Text>
                      </View>
                    ))}
                    {order.image && (
                      <Image source={{ uri: order.image }} className="w-full h-32 rounded-xl mt-2.5 object-cover" />
                    )}
                  </View>

                  <View className="flex-row justify-between items-center pt-2.5 border-t border-[#F8F9FC]">
                    <Text className="text-xs font-black text-[#1F130D]">Total: {order.total || '$0.00'}</Text>
                    
                    <View className="flex-row gap-2">
                      {order.status === 'New' && (
                        <TouchableOpacity 
                          onPress={() => updateOrderStatus(orderId, 'Preparing')}
                          className="bg-[#B8520B] px-3 py-1.5 rounded-xl"
                        >
                          <Text className="text-[10px] font-bold text-white">Accept Order</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'Preparing' && (
                        <TouchableOpacity 
                          onPress={() => updateOrderStatus(orderId, 'Ready')}
                          className="bg-amber-500 px-3 py-1.5 rounded-xl"
                        >
                          <Text className="text-[10px] font-bold text-white">Mark Ready</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'Ready' && (
                        <TouchableOpacity 
                          onPress={() => updateOrderStatus(orderId, 'Served')}
                          className="bg-green-600 px-3 py-1.5 rounded-xl"
                        >
                          <Text className="text-[10px] font-bold text-white">Mark Served</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}

        </ScrollView>

        {/* --- MODALS --- */}

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Waiter Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <View className="items-center mb-4 relative">
                <TouchableOpacity onPress={pickProfileImage} className="relative">
                  <View className="w-20 h-20 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="person" size={32} color="#B8520B" />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 bg-[#B8520B] p-1.5 rounded-full border-2 border-white shadow-sm">
                    <Ionicons name="camera" size={12} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-xs font-bold text-[#B8520B] mt-2">Tap icon to change photo</Text>
              </View>

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Full Name</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={name} onChangeText={setName} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Email Address</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={email} onChangeText={setEmail} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Phone Number</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" value={phone} onChangeText={setPhone} />
              
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="bg-[#B8520B] py-3.5 rounded-xl items-center mb-3">
                <Text className="text-white text-xs font-bold">Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} className="bg-red-50 border border-red-200 py-3 rounded-xl items-center flex-row justify-center">
                <Ionicons name="log-out-outline" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                <Text className="text-red-600 font-bold text-xs">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* New Order Modal */}
        <Modal visible={newOrderModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">New Customer Order</Text>
                <TouchableOpacity onPress={() => setNewOrderModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Table Number</Text>
              <TextInput 
                placeholder="e.g. 05" 
                placeholderTextColor="#9E9E9E"
                className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" 
                value={tableNumber} 
                onChangeText={setTableNumber} 
              />

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Order Details / Dishes</Text>
              <TextInput 
                placeholder="e.g. 1x Burger Combo, 2x Coke" 
                placeholderTextColor="#9E9E9E"
                className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" 
                value={orderDetails} 
                onChangeText={setOrderDetails} 
                multiline 
              />

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Attach Image (Optional)</Text>
              <TouchableOpacity 
                onPress={pickOrderImage}
                className="bg-[#F8F9FC] border border-dashed border-[#B8520B]/40 p-4 rounded-xl items-center justify-center mb-5 flex-row"
              >
                <Ionicons name="camera-outline" size={18} color="#B8520B" style={{ marginRight: 6 }} />
                <Text className="text-xs font-bold text-[#B8520B]">
                  {orderImage ? 'Image Attached (Tap to change)' : 'Upload Dish / Receipt Photo'}
                </Text>
              </TouchableOpacity>
              
              {orderImage && (
                <View className="mb-4 relative items-center">
                  <Image source={{ uri: orderImage }} className="w-24 h-24 rounded-xl object-cover border border-[#EAE3DE]" />
                  <TouchableOpacity 
                    onPress={() => setOrderImage(null)} 
                    className="absolute top-1 right-1 bg-red-600 rounded-full p-1"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity 
                onPress={handleCreateOrder} 
                disabled={submitting}
                className="bg-[#B8520B] py-3.5 rounded-xl items-center opacity-100"
              >
                {submitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-xs font-bold">Submit Order to Kitchen</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('WaiterDashboard')} className="items-center">
            <Ionicons name="grid" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Station</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WaiterLiveOrders')} className="items-center">
            <Ionicons name="notifications" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Live</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNewOrderModalVisible(true)} className="items-center">
            <Ionicons name="add-circle-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditModalVisible(true)} className="items-center">
            <Ionicons name="person-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}