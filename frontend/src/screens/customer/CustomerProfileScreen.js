import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export default function CustomerProfileScreen({ route, navigation }) {
  const isLoggedIn = route?.params?.isLoggedIn ?? true;
  const authContext = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);

  // Fetch real profile data from database on load
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // Prefer token and user from AuthContext when available
      let token = await AsyncStorage.getItem('token');
      const ctxUser = authContext?.user;
      if (ctxUser && ctxUser.email) {
        setName(ctxUser.name || '');
        setEmail(ctxUser.email || '');
        setPhone(ctxUser.phone || '+1 234 567 890');
        setAddress(ctxUser.address || '123 Main Street, Apt 4B');
        // still attempt to refresh from backend if we have a token
      }

      if (!token) {
        // Fallback to route params
        if (route?.params?.user) {
          const u = route.params.user;
          setName(u.name || '');
          setEmail(u.email || '');
          setPhone(u.phone || '+1 234 567 890');
          setAddress(u.address || '123 Main Street, Apt 4B');
          setIsLoading(false);
          return;
        }
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': authContext?.user?.email || ''
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch profile.');

      setName(data.user.name || '');
      setEmail(data.user.email || '');
      setPhone(data.user.phone || '+1 234 567 890');
      setAddress(data.user.address || '123 Main Street, Apt 4B');
    } catch (error) {
      console.error('Fetch Profile Error:', error);
      // Fallback defaults so screen doesn't break
      setName('John Doe');
      setEmail('john.doe@example.com');
      setPhone('+1 234 567 890');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': authContext?.user?.email || ''
        },
        body: JSON.stringify({ name, email, phone })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile.');

      // Update stored user and auth context if available
      const updatedUser = { ...(authContext?.user || {}), name, email, phone, address };
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        if (authContext && authContext.login) {
          // re-run login to refresh context and storage
          await authContext.login(token, updatedUser);
        }
      } catch (e) {
        console.warn('Failed to persist updated user locally', e);
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/auth/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': authContext?.user?.email || ''
        },
        body: JSON.stringify({ address })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update address.');

      Alert.alert('Success', 'Delivery address updated successfully!');
      setAddressModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (authContext && authContext.logout) {
        await authContext.logout();
      } else {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    } catch (e) {
      console.warn('Logout cleanup error', e);
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerLanding', params: { isLoggedIn: false } }],
    });
  };

  if (isLoading && !name) {
    return (
      <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
        <ActivityIndicator size="large" color="#B8520B" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <Text className="text-xl font-black text-[#1F130D]">My Profile</Text>
          <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <Text className="text-xs font-bold text-[#B8520B]">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-24">
          
          {/* User Info Card */}
          <View className="bg-white rounded-3xl p-5 border border-[#EAE3DE] items-center mb-5 shadow-xs">
            <View className="w-16 h-16 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mb-3">
              <Ionicons name="person" size={28} color="#B8520B" />
            </View>
            <Text className="text-base font-black text-[#1F130D] mb-0.5">{name}</Text>
            <Text className="text-xs text-gray-400 mb-1">{email}</Text>
            <Text className="text-xs text-gray-400 mb-3">{phone}</Text>
            <View className="bg-[#FEF7F3] px-3 py-1 rounded-full border border-[#B8520B]/20">
              <Text className="text-[10px] font-bold text-[#B8520B]">Gold Member</Text>
            </View>
          </View>

          {/* Account Settings Menu */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Account Settings</Text>
          <View className="bg-white rounded-2xl border border-[#EAE3DE] mb-5 overflow-hidden shadow-xs">
            <TouchableOpacity 
              onPress={() => navigation.navigate('OrderHistoryScreen')}
              className="flex-row items-center justify-between p-4 border-b border-[#F8F9FC]"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-[#FEF7F3] rounded-xl items-center justify-center mr-3">
                  <Ionicons name="receipt-outline" size={16} color="#B8520B" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">My Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setAddressModalVisible(true)}
              className="flex-row items-center justify-between p-4 border-b border-[#F8F9FC]"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-[#FEF7F3] rounded-xl items-center justify-center mr-3">
                  <Ionicons name="location-outline" size={16} color="#B8520B" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Delivery Addresses</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setReviewsModalVisible(true)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-[#FEF7F3] rounded-xl items-center justify-center mr-3">
                  <Ionicons name="star-outline" size={16} color="#B8520B" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Your Reviews</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          {/* Preferences & Support */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Preferences & Support</Text>
          <View className="bg-white rounded-2xl border border-[#EAE3DE] mb-6 overflow-hidden shadow-xs">
            <TouchableOpacity 
              onPress={() => setNotificationSettingsVisible(true)}
              className="flex-row items-center justify-between p-4 border-b border-[#F8F9FC]"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={16} color="#757575" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#9E9E9E" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setSupportModalVisible(true)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="help-circle-outline" size={16} color="#757575" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-50 border border-red-200 py-3.5 rounded-2xl items-center mb-6 active:opacity-90 flex-row justify-center"
          >
            <Ionicons name="log-out-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
            <Text className="text-red-600 font-bold text-xs">Log Out</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* --- MODALS FOR INTERACTION --- */}

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Full Name</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={name} onChangeText={setName} />
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Email Address</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={email} onChangeText={setEmail} />
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Phone Number</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" value={phone} onChangeText={setPhone} />
              <TouchableOpacity onPress={handleUpdateProfile} className="bg-[#B8520B] py-3.5 rounded-xl items-center">
                <Text className="text-white text-xs font-bold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Delivery Address Modal */}
        <Modal visible={addressModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Delivery Address</Text>
                <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Saved Address</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" value={address} onChangeText={setAddress} multiline />
              <TouchableOpacity onPress={handleUpdateAddress} className="bg-[#B8520B] py-3.5 rounded-xl items-center">
                <Text className="text-white text-xs font-bold">Update Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Your Reviews Modal */}
        <Modal visible={reviewsModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6 max-h-[70%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Your Reviews</Text>
                <TouchableOpacity onPress={() => setReviewsModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-[#F8F9FC] p-3.5 rounded-2xl border border-[#EAE3DE] mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs font-bold text-[#1F130D]">Truffle Mushroom Risotto</Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((i) => (<Ionicons key={i} name="star" size={10} color="#F59E0B" />))}
                    </View>
                  </View>
                  <Text className="text-[11px] text-gray-500">"Absolute perfection! Super creamy and packed with flavor."</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Notifications Modal */}
        <Modal visible={notificationSettingsVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Notification Preferences</Text>
                <TouchableOpacity onPress={() => setNotificationSettingsVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mb-4">You will receive push updates regarding order statuses, delivery tracking, and exclusive discounts.</Text>
              <TouchableOpacity onPress={() => setNotificationSettingsVisible(false)} className="bg-[#B8520B] py-3.5 rounded-xl items-center">
                <Text className="text-white text-xs font-bold">Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Help & Support Modal */}
        <Modal visible={supportModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Help & Support</Text>
                <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs font-bold text-[#1F130D] mb-1">Need assistance?</Text>
              <Text className="text-[11px] text-gray-500 mb-4">Contact our 24/7 customer support team via live chat or email us at support@restaurantapp.com.</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)} className="bg-[#B8520B] py-3.5 rounded-xl items-center">
                <Text className="text-white text-xs font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Mobile Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding', { isLoggedIn })} className="items-center">
            <Ionicons name="home-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistoryScreen')} className="items-center">
            <Ionicons name="receipt-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="items-center">
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="items-center">
            <Ionicons name="notifications-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerProfileScreen', { isLoggedIn })} className="items-center">
            <Ionicons name="person" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}