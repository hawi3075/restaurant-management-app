import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Modal, TextInput, ActivityIndicator, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BACKEND_URL } from '../../api/backend';
import { AuthContext } from '../../context/AuthContext';

export default function WaiterDashboardScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  
  const [waiterName, setWaiterName] = useState(authContext?.user?.name || 'Waiter User');
  const [waiterEmail, setWaiterEmail] = useState(authContext?.user?.email || 'waiter@restaurant.com');
  const [waiterPhone, setWaiterPhone] = useState(authContext?.user?.phone || '+251 000 000 000');
  const [waiterImage, setWaiterImage] = useState(authContext?.user?.profileImage || authContext?.user?.avatar || null);
  
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  
  // Top Banner Alert state
  const [topAlert, setTopAlert] = useState(null);
  const alertAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    if (authContext?.user) {
      setWaiterName(authContext.user.name || waiterName);
      setWaiterEmail(authContext.user.email || waiterEmail);
      setWaiterPhone(authContext.user.phone || authContext.user.phoneNumber || waiterPhone);
      setWaiterImage(authContext.user.profileImage || authContext.user.avatar || waiterImage);
    } else {
      fetchUserProfile();
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [authContext?.user]);

  const fetchUserProfile = async () => {
    try {
      const token = authContext?.token || '';
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok && data) {
        const userData = data.user || data;
        setWaiterName(userData.name || waiterName);
        setWaiterEmail(userData.email || waiterEmail);
        setWaiterPhone(userData.phone || userData.phoneNumber || waiterPhone);
        setWaiterImage(userData.profileImage || userData.avatar || waiterImage);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const showAlertBanner = (message) => {
    setTopAlert(message);
    Animated.timing(alertAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(alertAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setTopAlert(null));
    }, 4000);
  };

  const executeLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      if (authContext?.logout && typeof authContext.logout === 'function') {
        authContext.logout();
      }
      
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('Login');
      } else if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setWaiterImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = authContext?.token || '';
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: waiterName,
          phone: waiterPhone,
          profileImage: waiterImage
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      showAlertBanner('✨ Profile updated successfully!');
      setProfileModalVisible(false);
    } catch (error) {
      console.error('Save Profile Error:', error);
      alert(error.message || 'Could not save profile settings.');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = authContext?.token || '';
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned HTML instead of JSON. Check if backend route/server is running correctly.");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch orders');

      const rawOrders = data.orders || (Array.isArray(data) ? data : []);

      const mapped = rawOrders.map((order, index) => {
        const customerName = order.customer?.name || order.customerName || 'Table Guest';
        const tableNumber = order.tableNumber || order.table || 'Table 1';
        
        const orderItems = (order.orderItems || order.items || []).map(item => {
          const qty = Number(item.quantity) || 1;
          const price = Number(item.unitPrice || item.price || item.menuItem?.price) || 0;
          return {
            name: item.name || item.menuItem?.name || 'Item',
            quantity: qty,
            unitPrice: price
          };
        });

        const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const finalTotal = Number(order.totalAmount || order.total || calculatedTotal || 0);

        let mappedStatus = 'Pending';
        if (order.status === 'Ready' || order.status === 'Ready for Pickup') mappedStatus = 'Ready';
        if (order.status === 'Served') mappedStatus = 'Served';
        if (order.status === 'Completed' || order.status === 'Delivered') mappedStatus = 'Completed';

        return {
          id: order.id || order._id || `w${index + 1}`,
          customer: customerName,
          tableNumber: tableNumber,
          time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          status: mappedStatus,
          items: orderItems,
          total: `$${finalTotal.toFixed(2)}`,
        };
      });

      setOrders(mapped);
    } catch (error) {
      console.error('Fetch Orders Error:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const token = authContext?.token || '';
      
      const response = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update order status');

      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));

      if (newStatus === 'Served') {
        showAlertBanner('✅ Order successfully marked as Served.');
      } else {
        showAlertBanner(`✅ Order status updated to ${newStatus}.`);
      }
    } catch (error) {
      console.error('Update Order Status Error:', error);
      alert(error.message || 'Unable to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  const readyCount = orders.filter(o => o.status === 'Ready').length;
  const servedCount = orders.filter(o => o.status === 'Served').length;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl pb-16">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Alert Banner Notification */}
        {topAlert && (
          <Animated.View 
            style={{ transform: [{ translateY: alertAnim }] }}
            className="absolute top-12 left-5 right-5 z-50 bg-[#B8520B] p-3.5 rounded-2xl shadow-lg flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <Ionicons name="notifications-circle" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-xs font-bold flex-1">{topAlert}</Text>
            </View>
          </Animated.View>
        )}

        {/* Top Header with Profile & Logout Actions */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="flex-row items-center flex-1 pr-2">
            <View className="w-10 h-10 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-2.5 overflow-hidden">
              {waiterImage ? (
                <Image source={{ uri: waiterImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={18} color="#B8520B" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-[#1F130D]" numberOfLines={1}>{waiterName}</Text>
              <View className="flex-row items-center mt-0.5">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                <Text className="text-[10px] text-gray-400">Online • Tap profile</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View className="flex-row items-center space-x-2">
            {/* Profile Button */}
            <TouchableOpacity 
              onPress={() => setProfileModalVisible(true)}
              className="bg-[#FEF7F3] w-9 h-9 rounded-xl border border-[#B8520B]/20 items-center justify-center shadow-xs"
            >
              <Ionicons name="person-outline" size={17} color="#B8520B" />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-red-50 w-9 h-9 rounded-xl border border-red-200 items-center justify-center shadow-xs"
            >
              <Ionicons name="log-out-outline" size={17} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Scrollable */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-24">
          
          {/* Quick Metrics */}
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1 bg-white rounded-2xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ready to Serve</Text>
                <Ionicons name="fast-food-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#B8520B]">{readyCount}</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Served Orders</Text>
                <Ionicons name="checkmark-circle-outline" size={16} color="#0052CC" />
              </View>
              <Text className="text-2xl font-black text-[#1F130D]">{servedCount}</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
            {['All', 'Pending', 'Ready', 'Served', 'Completed'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl mr-2 border ${activeTab === tab ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#1F130D]'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active Orders Header */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Table Service Queue ({filteredOrders.length})
          </Text>

          {/* Orders List */}
          {isLoadingOrders ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#B8520B" />
            </View>
          ) : filteredOrders.length === 0 ? (
            <View className="py-16 items-center justify-center bg-white rounded-3xl border border-[#EAE3DE] p-6 shadow-xs">
              <Ionicons name="restaurant-outline" size={36} color="#9E9E9E" style={{ marginBottom: 8 }} />
              <Text className="text-sm font-bold text-gray-600">No active orders</Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">New table orders will appear here automatically.</Text>
            </View>
          ) : filteredOrders.map((order) => (
            <View key={order.id} className="bg-white rounded-3xl p-4 border border-[#EAE3DE] mb-4 shadow-sm">
              
              {/* Card Header */}
              <View className="flex-row justify-between items-start mb-3 pb-3 border-b border-gray-100">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{order.tableNumber}</Text>
                  <Text className="text-sm font-black text-[#1F130D]">{order.customer}</Text>
                  <Text className="text-[10px] text-gray-400 mt-0.5">Ordered at {order.time}</Text>
                </View>
                
                <View className={`px-3 py-1 rounded-full ${order.status === 'Ready' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : order.status === 'Served' ? 'bg-blue-50 border border-blue-200' : order.status === 'Completed' ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
                  <Text className={`text-[10px] font-bold ${order.status === 'Ready' ? 'text-[#B8520B]' : order.status === 'Served' ? 'text-blue-600' : order.status === 'Completed' ? 'text-green-600' : 'text-gray-500'}`}>
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* Order Items Breakdown */}
              <View className="mb-3 px-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Order Items</Text>
                {order.items.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between items-center py-1 border-b border-gray-50">
                    <View className="flex-row items-center">
                      <View className="bg-gray-100 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-[10px] font-bold text-gray-700">{item.quantity}x</Text>
                      </View>
                      <Text className="text-xs font-medium text-[#1F130D]">{item.name}</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-600">${(item.unitPrice * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              {/* Card Footer: Total Amount & Actions */}
              <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 mt-1">
                <View>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</Text>
                  <Text className="text-base font-black text-[#B8520B]">{order.total}</Text>
                </View>

                <View className="flex-row space-x-2">
                  {order.status === 'Ready' && (
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => updateOrderStatus(order.id, 'Served')}
                      className="bg-[#B8520B] px-4 py-2.5 rounded-xl flex-row items-center shadow-md"
                    >
                      <Ionicons name="restaurant" size={13} color="white" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-white uppercase tracking-wider">Mark Served</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'Served' && (
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => updateOrderStatus(order.id, 'Completed')}
                      className="bg-green-600 px-4 py-2.5 rounded-xl flex-row items-center shadow-md"
                    >
                      <Ionicons name="checkmark-done" size={13} color="white" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-white uppercase tracking-wider">Complete</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'Completed' && (
                    <View className="bg-gray-100 px-4 py-2.5 rounded-xl flex-row items-center">
                      <Ionicons name="checkmark-circle" size={13} color="#22C55E" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-gray-500">Done</Text>
                    </View>
                  )}
                  {order.status === 'Pending' && (
                    <View className="bg-gray-100 px-4 py-2.5 rounded-xl flex-row items-center">
                      <Ionicons name="time-outline" size={13} color="#9E9E9E" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-gray-500">In Kitchen</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

        </ScrollView>

        {/* Profile Management Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="w-full max-w-[440px] bg-white rounded-t-3xl p-6 shadow-2xl">
              
              <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <Text className="text-base font-black text-[#1F130D]">Waiter Profile Settings</Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#9E9E9E" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
                {/* Avatar Picker */}
                <View className="items-center mb-5">
                  <TouchableOpacity onPress={handlePickImage} className="relative">
                    <View className="w-20 h-20 rounded-full bg-[#FEF7F3] border-2 border-[#B8520B] items-center justify-center overflow-hidden">
                      {waiterImage ? (
                        <Image source={{ uri: waiterImage }} className="w-full h-full" />
                      ) : (
                        <Ionicons name="person" size={32} color="#B8520B" />
                      )}
                    </View>
                    <View className="absolute bottom-0 right-0 bg-[#B8520B] p-1.5 rounded-full border-2 border-white">
                      <Ionicons name="camera" size={12} color="white" />
                    </View>
                  </TouchableOpacity>
                  <Text className="text-xs font-bold text-[#B8520B] mt-2">Tap to change avatar</Text>
                </View>

                {/* Name Input */}
                <View className="mb-3.5">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Full Name</Text>
                  <TextInput 
                    value={waiterName}
                    onChangeText={setWaiterName}
                    placeholder="Enter full name"
                    className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-xl px-4 py-3 text-sm text-[#1F130D]"
                  />
                </View>

                {/* Email Input */}
                <View className="mb-3.5">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Email Address</Text>
                  <TextInput 
                    value={waiterEmail}
                    editable={false}
                    className="bg-gray-100 border border-[#EAE3DE] rounded-xl px-4 py-3 text-sm text-gray-400"
                  />
                </View>

                {/* Phone Input */}
                <View className="mb-5">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</Text>
                  <TextInput 
                    value={waiterPhone}
                    onChangeText={setWaiterPhone}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-xl px-4 py-3 text-sm text-[#1F130D]"
                  />
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mt-4 pt-4 border-t border-gray-100">
                <TouchableOpacity 
                  onPress={() => setProfileModalVisible(false)}
                  className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
                >
                  <Text className="text-xs font-bold text-gray-600 uppercase">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSaveProfile}
                  className="flex-1 bg-[#B8520B] py-3.5 rounded-xl items-center shadow-md"
                >
                  <Text className="text-xs font-bold text-white uppercase tracking-wider">Save Changes</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Beautiful Custom Logout Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={logoutModalVisible}
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl items-center border border-gray-100">
              
              <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4 border border-red-100">
                <Ionicons name="log-out" size={28} color="#DC2626" />
              </View>

              <Text className="text-lg font-black text-[#1F130D] text-center mb-1">Log Out Account</Text>
              <Text className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
                Are you sure you want to end your current session? You'll need to sign back in to view table orders.
              </Text>

              <View className="flex-row space-x-3 w-full">
                <TouchableOpacity 
                  onPress={() => setLogoutModalVisible(false)}
                  className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center border border-gray-200"
                >
                  <Text className="text-xs font-bold text-gray-600 uppercase">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    setLogoutModalVisible(false);
                    executeLogout();
                  }}
                  className="flex-1 bg-red-600 py-3.5 rounded-2xl items-center shadow-md shadow-red-200"
                >
                  <Text className="text-xs font-bold text-white uppercase tracking-wider">Log Out</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}