import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../api/backend';

export default function OrderHistoryScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);

  // Review Modal State
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const isLoggedIn = route?.params?.isLoggedIn ?? true;

  useEffect(() => {
    fetchUserOrders();

    const socket = io(BACKEND_URL);

    socket.on('order_status_updated', () => {
      fetchUserOrders();
    });

    socket.on('new_kitchen_order', () => {
      fetchUserOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/orders/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch orders.');

      const allOrders = data.orders || (Array.isArray(data) ? data : []);
      
      const active = allOrders.filter(o => {
        const status = o.status || 'Pending';
        return status !== 'Delivered' && status !== 'Cancelled' && status !== 'Served';
      });
      
      const past = allOrders.filter(o => {
        const status = o.status || 'Pending';
        return status === 'Delivered' || status === 'Cancelled' || status === 'Served';
      });

      setActiveOrders(active);
      setPastOrders(past);

    } catch (error) {
      console.error('Fetch Orders Error:', error);
      setActiveOrders([]);
      setPastOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setRating(5);
    setReviewComment('');
    setIsReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderForReview) return;
    try {
      setIsSubmittingReview(true);
      const token = await AsyncStorage.getItem('token');
      
      const firstItem = selectedOrderForReview.orderItems?.[0] || {};
      const menuItemId = firstItem.menuItem?._id || firstItem.menuItem || firstItem._id;

      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orderId: selectedOrderForReview._id || selectedOrderForReview.id,
          menuItemId: menuItemId,
          rating: rating,
          comment: reviewComment
        })
      });

      if (response.ok) {
        alert('Thank you! Your review has been submitted successfully.');
        setIsReviewModalVisible(false);
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      alert('Network error submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center shadow-xs">
          <Text className="text-xl font-black text-[#1F130D]">My Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="w-9 h-9 bg-[#FEF7F3] rounded-full items-center justify-center border border-[#B8520B]/20">
            <Ionicons name="cart-outline" size={18} color="#B8520B" />
          </TouchableOpacity>
        </View>

        {/* Tabs Switcher */}
        <View className="px-5 mt-4 mb-2">
          <View className="flex-row bg-[#EAE3DE]/50 p-1 rounded-2xl">
            <TouchableOpacity 
              onPress={() => setActiveTab('active')} 
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'active' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === 'active' ? 'text-[#B8520B]' : 'text-gray-500'}`}>
                Active Orders ({activeOrders.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('history')} 
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'history' ? 'bg-white shadow-xs' : ''}`}
            >
              <Text className={`text-xs font-bold ${activeTab === 'history' ? 'text-[#B8520B]' : 'text-gray-500'}`}>
                Order History ({pastOrders.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders List */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-2 pb-24">
          {isLoading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#B8520B" />
            </View>
          ) : displayedOrders.length === 0 ? (
            <View className="items-center justify-center pt-20">
              <View className="w-16 h-16 bg-[#FEF7F3] rounded-full items-center justify-center mb-3 border border-[#B8520B]/20">
                <Ionicons name="receipt-outline" size={28} color="#B8520B" />
              </View>
              <Text className="text-sm font-bold text-[#1F130D] mb-1">No orders found</Text>
              <Text className="text-[11px] text-gray-400 text-center px-6">
                You don't have any {activeTab === 'active' ? 'active' : 'past'} orders right now.
              </Text>
            </View>
          ) : (
            displayedOrders.map((order, index) => {
              const uniqueKey = order._id || order.id || index.toString();
              
              // Safe Item extraction & details
              let itemNames = 'Order Item';
              let firstItemImage = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80';
              
              if (order.orderItems && order.orderItems.length > 0) {
                itemNames = order.orderItems.map(i => `${i.quantity || 1}x ${i.name || i.menuItem?.name || 'Dish'}`).join(', ');
                firstItemImage = order.orderItems[0].image || order.orderItems[0].menuItem?.image || firstItemImage;
              } else if (order.items) {
                itemNames = order.items;
              }

              const orderIdDisplay = `#${order._id ? order._id.slice(-6).toUpperCase() : '000000'}`;
              
              // Safe Date Parsing
              let orderDate = 'Recent Order';
              const rawDate = order.createdAt || order.date;
              if (rawDate) {
                const parsed = new Date(rawDate);
                if (!isNaN(parsed.getTime())) {
                  orderDate = parsed.toLocaleDateString() + ' ' + parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
              }

              const totalVal = Number(order.totalAmount ?? order.total ?? 0);
              const orderStatus = order.status || 'Pending';

              return (
                <View key={uniqueKey} className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-3 shadow-xs">
                  <View className="flex-row justify-between items-center mb-3 border-b border-[#F8F9FC] pb-2.5">
                    <View>
                      <Text className="text-xs font-black text-[#1F130D]">{orderIdDisplay}</Text>
                      <Text className="text-[9px] text-gray-400">{orderDate}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${orderStatus === 'Preparing' || orderStatus === 'Pending' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : 'bg-green-50 border border-green-200'}`}>
                      <Text className={`text-[9px] font-bold ${orderStatus === 'Preparing' || orderStatus === 'Pending' ? 'text-[#B8520B]' : 'text-green-600'}`}>
                        {orderStatus}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-3">
                    {/* Fetch Real Thumbnail Image instead of generic icon box */}
                    <Image 
                      source={{ uri: firstItemImage }} 
                      className="w-14 h-14 rounded-xl mr-3 bg-gray-100 border border-[#EAE3DE]" 
                    />
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold text-[#1F130D] mb-1" numberOfLines={2}>{itemNames}</Text>
                      <Text className="text-xs font-black text-[#B8520B]">ETB {totalVal.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-2 border-t border-[#F8F9FC]">
                    <Text className="text-[10px] text-gray-400 uppercase font-semibold">Payment: {order.paymentMethod || 'Cash'}</Text>
                    
                    <View className="flex-row space-x-2">
                      {/* Review Button for Delivered/Served Orders */}
                      {activeTab === 'history' && (
                        <TouchableOpacity 
                          onPress={() => handleOpenReviewModal(order)}
                          className="bg-[#FEF7F3] border border-[#B8520B]/40 px-3 py-1.5 rounded-xl flex-row items-center"
                        >
                          <Ionicons name="star-outline" size={11} color="#B8520B" style={{ marginRight: 3 }} />
                          <Text className="text-[10px] font-bold text-[#B8520B]">Write Review</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity 
                        onPress={() => navigation.navigate('MenuScreen')}
                        className="bg-[#B8520B] px-3.5 py-1.5 rounded-xl"
                      >
                        <Text className="text-[10px] font-bold text-white">Reorder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Review & Rating Modal */}
        <Modal
          visible={isReviewModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsReviewModalVisible(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[360px] rounded-3xl p-5 shadow-2xl border border-[#EAE3DE]">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-black text-[#1F130D]">Rate Your Order</Text>
                <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#757575" />
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-gray-500 mb-4">How was your meal? Tap stars to rate.</Text>

              {/* Star Rating Picker */}
              <View className="flex-row justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} className="p-1">
                    <Ionicons 
                      name={star <= rating ? "star" : "star-outline"} 
                      size={28} 
                      color="#E67E22" 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Review Comment Input */}
              <TextInput
                placeholder="Write your review or feedback here..."
                placeholderTextColor="#888888"
                multiline={true}
                numberOfLines={4}
                value={reviewComment}
                onChangeText={setReviewComment}
                className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl p-3 text-xs text-[#1F130D] h-24 mb-4 text-top"
              />

              <TouchableOpacity 
                onPress={handleSubmitReview}
                disabled={isSubmittingReview}
                className="bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md"
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-black text-xs uppercase tracking-wide">Submit Review</Text>
                )}
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
            <Ionicons name="receipt" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="items-center">
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="items-center">
            <Ionicons name="notifications-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate(isLoggedIn ? 'CustomerProfileScreen' : 'Signup', { isLoggedIn })} 
            className="items-center"
          >
            <Ionicons name={isLoggedIn ? "person-outline" : "person-add-outline"} size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">{isLoggedIn ? 'Profile' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}