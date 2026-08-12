import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../api/backend';

// Replace 'https://your-live-backend-url.com' with your actual deployed production URL (e.g., Render, Railway, Heroku)
const LIVE_BACKEND_URL = 'https://your-live-backend-url.com';

const API_URL = BACKEND_URL || (__DEV__ ? 'http://localhost:5000' : LIVE_BACKEND_URL);

export default function CustomerProfileScreen({ route, navigation }) {
  const isLoggedIn = route?.params?.isLoggedIn ?? true;
  const authContext = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Support message, success banner, & responses state
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportSuccessMsg, setSupportSuccessMsg] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  const [lastCheckedResponseCount, setLastCheckedResponseCount] = useState(0);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);

  // Fetch real profile data and support history on load
  useEffect(() => {
    fetchUserProfile();
    fetchSupportTickets();

    // Poll for manager responses every 10 seconds
    const interval = setInterval(() => {
      fetchSupportTickets(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('token');

      // Fallback/check AuthContext user if available immediately
      if (authContext?.user) {
        setName(authContext.user.name || '');
        setEmail(authContext.user.email || '');
        setPhone(authContext.user.phone || '');
        setAddress(authContext.user.address || '');
      }

      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': authContext?.user?.email || ''
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch profile.');

      const userData = data.user || data;
      setName(userData.name || authContext?.user?.name || '');
      setEmail(userData.email || authContext?.user?.email || '');
      setPhone(userData.phone || authContext?.user?.phone || '');
      setAddress(userData.address || authContext?.user?.address || '');
    } catch (error) {
      console.error('Fetch Profile Error:', error);
      // If offline or endpoint issue, we rely on authContext user already populated above
      if (!name && !email && authContext?.user) {
        setName(authContext.user.name || '');
        setEmail(authContext.user.email || '');
        setPhone(authContext.user.phone || '');
        setAddress(authContext.user.address || '');
      } else {
        Alert.alert('Error', error.message || 'Failed to load profile data from server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupportTickets = async (isPolling = false) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/support/my-tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': authContext?.user?.email || ''
        }
      });

      const data = await response.json();
      if (response.ok && (data.tickets || Array.isArray(data))) {
        const fetchedTickets = data.tickets || data;
        
        // Count how many tickets have manager responses
        const respondedCount = fetchedTickets.filter(t => (t.managerResponse || t.reply) && (t.managerResponse || t.reply).trim() !== '').length;

        // If polling and we found new manager responses, trigger alert
        if (isPolling && lastCheckedResponseCount > 0 && respondedCount > lastCheckedResponseCount) {
          Alert.alert('New Support Response', 'The manager has written a response to your support message!');
        }

        setLastCheckedResponseCount(respondedCount);
        setSupportTickets(fetchedTickets);
      }
    } catch (error) {
      console.error('Fetch Support Tickets Error:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/auth/profile`, {
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

      const updatedUser = { ...(authContext?.user || {}), name, email, phone, address };
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        if (authContext && authContext.login) {
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

      const response = await fetch(`${API_URL}/api/auth/address`, {
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

      // Update local storage with new address
      const updatedUser = { ...(authContext?.user || {}), name, email, phone, address };
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        if (authContext && authContext.login) {
          await authContext.login(token, updatedUser);
        }
      } catch (e) {
        console.warn('Failed to persist updated address locally', e);
      }

      Alert.alert('Success', 'Delivery address updated successfully!');
      setAddressModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim()) {
      Alert.alert('Error', 'Please enter a support message before sending.');
      return;
    }

    try {
      setIsSubmittingSupport(true);
      setSupportSuccessMsg('');
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': authContext?.user?.email || ''
        },
        body: JSON.stringify({ message: supportMessage, name, email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send support message.');

      setSupportSuccessMsg('Send successfully! Your message has been routed to the manager support page.');
      setSupportMessage('');
      fetchSupportTickets(); // Refresh tickets list
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmittingSupport(false);
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

        {/* Top Header with Back Button */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-9 h-9 bg-gray-100 rounded-xl items-center justify-center border border-gray-200"
            >
              <Ionicons name="arrow-back" size={18} color="#1F130D" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-[#1F130D]">My Profile</Text>
          </View>
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
            <Text className="text-base font-black text-[#1F130D] mb-0.5">{name || 'No Name Set'}</Text>
            <Text className="text-xs text-gray-400 mb-1">{email || 'No Email Set'}</Text>
            <Text className="text-xs text-gray-400 mb-3">{phone || 'No Phone Set'}</Text>
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
                  <Ionicons name="star" size={16} color="#B8520B" />
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

          {/* Enhanced Logout Button with Gradient/Shadow Effect */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-500 border border-red-600 py-4 rounded-2xl items-center mb-6 shadow-md shadow-red-500/20 active:opacity-90 flex-row justify-center space-x-2"
          >
            <View className="w-7 h-7 bg-white/20 rounded-full items-center justify-center mr-1">
              <Ionicons name="log-out" size={16} color="#FFFFFF" />
            </View>
            <Text className="text-white font-black text-xs tracking-wide">Log Out</Text>
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
                <View className="flex-row items-center space-x-2">
                  <View className="w-7 h-7 bg-[#FEF7F3] rounded-lg items-center justify-center mr-1">
                    <Ionicons name="star" size={16} color="#B8520B" />
                  </View>
                  <Text className="text-base font-black text-[#1F130D]">Your Reviews</Text>
                </View>
                <TouchableOpacity onPress={() => setReviewsModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-[#F8F9FC] p-4 rounded-2xl border border-[#EAE3DE] items-center py-8">
                  <View className="w-12 h-12 bg-amber-50 rounded-full items-center justify-center mb-2 border border-amber-200">
                    <Ionicons name="star-outline" size={24} color="#D97706" />
                  </View>
                  <Text className="text-xs font-bold text-[#1F130D] mb-1">No saved reviews yet</Text>
                  <Text className="text-[11px] text-gray-500 text-center">Your submitted food reviews will appear here once you start rating dishes.</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Help & Support Modal */}
        <Modal visible={supportModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6 max-h-[85%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Help & Support</Text>
                <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-xs font-bold text-[#1F130D] mb-1">Write your support message</Text>
                <Text className="text-[11px] text-gray-500 mb-3">Describe your issue below. Your message will be routed directly to the manager support page.</Text>
                
                {supportSuccessMsg ? (
                  <View className="bg-green-50 border border-green-200 p-3 rounded-xl mb-3 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#15803D" style={{ marginRight: 6 }} />
                    <Text className="text-green-700 text-xs font-bold flex-1">{supportSuccessMsg}</Text>
                  </View>
                ) : null}

                <TextInput 
                  className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D] h-24" 
                  placeholder="Type your message here..."
                  placeholderTextColor="#9E9E9E"
                  multiline
                  textAlignVertical="top"
                  value={supportMessage}
                  onChangeText={(text) => {
                    setSupportMessage(text);
                    if (supportSuccessMsg) setSupportSuccessMsg('');
                  }} 
                />

                <TouchableOpacity 
                  onPress={handleSendSupportMessage} 
                  disabled={isSubmittingSupport}
                  className="bg-[#B8520B] py-3 rounded-xl items-center flex-row justify-center mb-5"
                >
                  {isSubmittingSupport ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-xs font-bold">Send Message to Manager</Text>
                  )}
                </TouchableOpacity>

                <Text className="text-xs font-bold text-[#1F130D] mb-2 uppercase tracking-wider">Your Support Conversations</Text>
                {supportTickets.length === 0 ? (
                  <View className="bg-[#F8F9FC] p-4 rounded-2xl border border-[#EAE3DE] items-center mb-4">
                    <Text className="text-[11px] text-gray-500">No support tickets submitted yet.</Text>
                  </View>
                ) : (
                  supportTickets.map((ticket, index) => {
                    const replyText = ticket.managerResponse || ticket.reply;
                    return (
                      <View key={ticket._id || index} className="bg-[#F8F9FC] p-3.5 rounded-2xl border border-[#EAE3DE] mb-3">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-[10px] font-bold text-gray-400">
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                          </Text>
                          <View className={`px-2 py-0.5 rounded-full ${replyText ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <Text className={`text-[9px] font-bold ${replyText ? 'text-green-700' : 'text-yellow-700'}`}>
                              {replyText ? 'Resolved / Replied' : 'Pending'}
                            </Text>
                          </View>
                        </View>

                        <View className="bg-white p-2.5 rounded-xl border border-gray-200 mb-2">
                          <Text className="text-[10px] font-bold text-[#B8520B] mb-0.5">You:</Text>
                          <Text className="text-xs text-[#1F130D]">{ticket.message}</Text>
                        </View>

                        {replyText ? (
                          <View className="bg-green-50 p-2.5 rounded-xl border border-green-200">
                            <Text className="text-[10px] font-bold text-green-800 mb-0.5">Manager Response:</Text>
                            <Text className="text-xs text-gray-800">{replyText}</Text>
                          </View>
                        ) : (
                          <Text className="text-[10px] text-gray-400 italic mt-1">Waiting for manager response...</Text>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}