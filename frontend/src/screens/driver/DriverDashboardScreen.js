import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Modal, TextInput, ActivityIndicator, Alert, Linking, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BACKEND_URL } from '../../api/backend';
import { AuthContext } from '../../context/AuthContext';

export default function DriverDashboardScreen({ route, navigation }) {
  const authContext = useContext(AuthContext);

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  
  // Real user state initialized from AuthContext or fallback
  const [driverName, setDriverName] = useState(authContext?.user?.name || 'Driver User');
  const [driverEmail, setDriverEmail] = useState(authContext?.user?.email || 'driver@restaurant.com');
  const [driverPhone, setDriverPhone] = useState(authContext?.user?.phone || '+251 000 000 000');
  const [driverImage, setDriverImage] = useState(authContext?.user?.profileImage || authContext?.user?.avatar || null);
  
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [deliveries, setDeliveries] = useState([]);
  
  // Top Banner Alert state
  const [topAlert, setTopAlert] = useState(null);
  const alertAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // If authContext user data updates or exists, sync it
    if (authContext?.user) {
      setDriverName(authContext.user.name || driverName);
      setDriverEmail(authContext.user.email || driverEmail);
      setDriverPhone(authContext.user.phone || authContext.user.phoneNumber || driverPhone);
      setDriverImage(authContext.user.profileImage || authContext.user.avatar || driverImage);
    } else {
      // Fetch user profile directly from backend if not fully populated in context
      fetchUserProfile();
    }

    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 10000);
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
        setDriverName(userData.name || driverName);
        setDriverEmail(userData.email || driverEmail);
        setDriverPhone(userData.phone || userData.phoneNumber || driverPhone);
        setDriverImage(userData.profileImage || userData.avatar || driverImage);
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

  const fetchDeliveries = async () => {
    try {
      const token = authContext?.token || '';
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch deliveries');

      const rawOrders = data.orders || (Array.isArray(data) ? data : []);

      const mapped = rawOrders.map((order, index) => {
        const customerName = order.customer?.name || order.customerName || 'Walk-in Customer';
        const customerAddress = order.customer?.address || order.deliveryAddress || order.streetAddress || 'Delivery Address Pending';
        
        const mapsCoords = order.location?.coordinates || order.coordinates || null;
        const googleMapsUrl = mapsCoords 
          ? `https://www.google.com/maps/search/?api=1&query=${mapsCoords.latitude},${mapsCoords.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`;

        const phone = order.customer?.phone || order.phone || '+251 911 234 567';
        
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

        return {
          id: order.id || order._id || `d${index + 1}`,
          customer: customerName,
          address: customerAddress,
          googleMapsUrl: googleMapsUrl,
          phone: phone,
          time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          status: order.deliveryStatus || (order.status === 'Ready' ? 'Ready for Pickup' : order.status === 'Served' ? 'Delivered' : order.status === 'Completed' ? 'Delivered' : 'Ready for Pickup'),
          items: orderItems,
          total: `$${finalTotal.toFixed(2)}`,
        };
      });

      setDeliveries(mapped);
    } catch (error) {
      console.error('Fetch Deliveries Error:', error);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = authContext?.token || '';
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: driverName, phone: driverPhone, profileImage: driverImage })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      
      Alert.alert('Success', 'Profile updated successfully!');
      setProfileModalVisible(false);
    } catch (error) {
      console.error('Update Profile Error:', error);
      Alert.alert('Error', error.message || 'Could not update profile');
    }
  };

  const openGoogleMaps = (url) => {
    Linking.openURL(url).catch(err => {
      console.error('An error occurred opening maps', err);
      Alert.alert('Error', 'Unable to open Google Maps link');
    });
  };

  const handleLogout = async () => {
    try {
      if (authContext && authContext.logout) {
        await authContext.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    setProfileModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const pickDriverImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDriverImage(result.assets[0].uri);
    }
  };

  const updateDeliveryStatus = async (id, newStatus) => {
    try {
      const token = authContext?.token || '';
      const apiStatus = newStatus === 'On the Way' ? 'Ready' : newStatus === 'Delivered' ? 'Served' : newStatus;
      const response = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: apiStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update delivery');

      setDeliveries((prev) => prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));

      if (newStatus === 'On the Way') {
        showAlertBanner('📦 Alert: Customer notified that order is On the Way!');
      }
    } catch (error) {
      console.error('Update Delivery Error:', error);
      Alert.alert('Error', error.message || 'Unable to update delivery status');
    }
  };

  const filteredDeliveries = deliveries.filter(order => {
    if (activeTab === 'All') return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  const readyPickupCount = deliveries.filter(o => o.status === 'Ready for Pickup').length;
  const onTheWayCount = deliveries.filter(o => o.status === 'On the Way').length;

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

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="flex-row items-center">
            <View className="w-9 h-9 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-2.5 overflow-hidden">
              {driverImage ? (
                <Image source={{ uri: driverImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="car" size={16} color="#B8520B" />
              )}
            </View>
            <View>
              <Text className="text-sm font-black text-[#1F130D]">{driverName}</Text>
              <Text className="text-[10px] text-gray-400">Tap profile to edit</Text>
            </View>
          </TouchableOpacity>
          
          <View className="bg-[#FEF7F3] px-3 py-1.5 rounded-xl border border-[#B8520B]/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="text-[11px] font-bold text-[#B8520B]">Online</Text>
          </View>
        </View>

        {/* Main Content Scrollable */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-24">
          
          {/* Quick Metrics */}
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1 bg-white rounded-2xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ready for Pickup</Text>
                <Ionicons name="basket-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#B8520B]">{readyPickupCount}</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">On the Way</Text>
                <Ionicons name="navigate-outline" size={16} color="#0052CC" />
              </View>
              <Text className="text-2xl font-black text-[#1F130D]">{onTheWayCount}</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
            {['All', 'Ready for Pickup', 'On the Way', 'Delivered'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl mr-2 border ${activeTab === tab ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#1F130D]'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Deliveries Queue Header */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Active Orders Queue ({filteredDeliveries.length})
          </Text>

          {/* Delivery Cards List */}
          {isLoadingDeliveries ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#B8520B" />
            </View>
          ) : filteredDeliveries.length === 0 ? (
            <View className="py-16 items-center justify-center bg-white rounded-3xl border border-[#EAE3DE] p-6 shadow-xs">
              <Ionicons name="bicycle-outline" size={36} color="#9E9E9E" style={{ marginBottom: 8 }} />
              <Text className="text-sm font-bold text-gray-600">No deliveries available</Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">Kitchen orders ready for delivery will appear here automatically.</Text>
            </View>
          ) : filteredDeliveries.map((delivery) => (
            <View key={delivery.id} className="bg-white rounded-3xl p-4 border border-[#EAE3DE] mb-4 shadow-sm">
              
              {/* Card Header */}
              <View className="flex-row justify-between items-start mb-3 pb-3 border-b border-gray-100">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Customer</Text>
                  <Text className="text-sm font-black text-[#1F130D]">{delivery.customer}</Text>
                  <Text className="text-[10px] text-gray-400 mt-0.5">Ordered at {delivery.time}</Text>
                </View>
                
                <View className={`px-3 py-1 rounded-full ${delivery.status === 'Ready for Pickup' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : delivery.status === 'On the Way' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                  <Text className={`text-[10px] font-bold ${delivery.status === 'Ready for Pickup' ? 'text-[#B8520B]' : delivery.status === 'On the Way' ? 'text-blue-600' : 'text-green-600'}`}>
                    {delivery.status}
                  </Text>
                </View>
              </View>

              {/* Dual Address Options: Customer Text Address & Google Maps Button */}
              <View className="bg-[#F8F9FC] p-3 rounded-2xl mb-3 border border-[#EAE3DE]">
                <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-gray-200">
                  <View className="flex-row items-center flex-1 pr-2">
                    <Ionicons name="document-text-outline" size={14} color="#B8520B" style={{ marginRight: 6 }} />
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-gray-400 uppercase">Customer Address</Text>
                      <Text className="text-xs font-semibold text-[#1F130D]" numberOfLines={2}>{delivery.address}</Text>
                    </View>
                  </View>
                </View>

                {/* Google Maps Option */}
                <TouchableOpacity 
                  onPress={() => openGoogleMaps(delivery.googleMapsUrl)}
                  className="flex-row items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-200 shadow-xs"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="map" size={14} color="#0052CC" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-[#0052CC]">Open in Google Maps Pin</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={12} color="#0052CC" />
                </TouchableOpacity>

                <View className="flex-row items-center mt-2 pt-1">
                  <Ionicons name="call-outline" size={13} color="#757575" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-medium text-gray-600">{delivery.phone}</Text>
                </View>
              </View>

              {/* Order Items Breakdown */}
              <View className="mb-3 px-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Order Items</Text>
                {delivery.items.map((item, idx) => (
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

              {/* Card Footer: Total Amount & Start/Mark Actions */}
              <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 mt-1">
                <View>
                  <Text className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</Text>
                  <Text className="text-base font-black text-[#B8520B]">{delivery.total}</Text>
                </View>

                <View className="flex-row space-x-2">
                  {delivery.status === 'Ready for Pickup' && (
                    <TouchableOpacity 
                      onPress={() => updateDeliveryStatus(delivery.id, 'On the Way')}
                      className="bg-[#B8520B] px-4 py-2.5 rounded-xl flex-row items-center shadow-md active:opacity-90"
                    >
                      <Ionicons name="navigate" size={13} color="white" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-white uppercase tracking-wider">Start Delivery</Text>
                    </TouchableOpacity>
                  )}
                  {delivery.status === 'On the Way' && (
                    <TouchableOpacity 
                      onPress={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                      className="bg-green-600 px-4 py-2.5 rounded-xl flex-row items-center shadow-md active:opacity-90"
                    >
                      <Ionicons name="checkmark-done" size={13} color="white" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-white uppercase tracking-wider">Mark Delivered</Text>
                    </TouchableOpacity>
                  )}
                  {delivery.status === 'Delivered' && (
                    <View className="bg-gray-100 px-4 py-2.5 rounded-xl flex-row items-center">
                      <Ionicons name="checkmark-circle" size={13} color="#22C55E" style={{ marginRight: 5 }} />
                      <Text className="text-xs font-bold text-gray-500">Completed</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

        </ScrollView>

        {/* --- PROFILE MODAL --- */}
        <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Driver Profile</Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <View className="items-center mb-4 relative">
                <TouchableOpacity onPress={pickDriverImage} className="relative">
                  <View className="w-20 h-20 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center overflow-hidden">
                    {driverImage ? (
                      <Image source={{ uri: driverImage }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="car" size={32} color="#B8520B" />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 bg-[#B8520B] p-1.5 rounded-full border-2 border-white shadow-sm">
                    <Ionicons name="camera" size={12} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-xs font-bold text-[#B8520B] mt-2">Tap icon to change photo</Text>
              </View>

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Driver Name</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={driverName} onChangeText={setDriverName} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Email Address (Logged In)</Text>
              <TextInput className="bg-gray-100 border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-gray-500" value={driverEmail} editable={false} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Phone Number</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" value={driverPhone} onChangeText={setDriverPhone} />
              
              <TouchableOpacity onPress={handleUpdateProfile} className="bg-[#B8520B] py-3.5 rounded-xl items-center mb-3">
                <Text className="text-white text-xs font-bold uppercase tracking-wider">Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} className="bg-red-50 border border-red-200 py-3 rounded-xl items-center flex-row justify-center">
                <Ionicons name="log-out-outline" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                <Text className="text-red-600 font-bold text-xs uppercase tracking-wider">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-around items-center shadow-lg">
          <TouchableOpacity onPress={() => setActiveTab('All')} className="items-center">
            <Ionicons name="bicycle" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Deliveries</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="items-center">
            <Ionicons name="person-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Driver Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}