import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../api/backend';

const API_URL = BACKEND_URL;

export default function FoodDetailScreen({ route, navigation }) {
  const foodItem = route?.params?.foodItem || null;

  const [selectedSize, setSelectedSize] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const response = await fetch(`${API_URL}/api/reviews`);
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.reviews || [];
        setReviews(
          items.slice(0, 5).map((review) => ({
            id: review._id || review.id,
            name: review.user?.name || 'Guest',
            rating: Number(review.rating || 5),
            comment: review.comment || '',
            date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently',
          }))
        );
      } catch (error) {
        console.error('Fetch Reviews Error:', error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, []);

  const handleAddToCart = () => {
    if (!foodItem) return;
    navigation.navigate('CartScreen', { 
      addedItem: { ...foodItem, quantity, options: selectedSize } 
    });
  };

  const handleQuickCheckout = () => {
    if (!foodItem) return;
    const itemPrice = foodItem.price * quantity;
    const total = itemPrice + 3.99;
    navigation.navigate('CheckoutScreen', { 
      total: total, 
      cartItems: [{ ...foodItem, quantity, options: selectedSize }] 
    });
  };

  const handleAddReview = () => {
    if (!userComment.trim()) return;
    const newReview = {
      id: Date.now(),
      name: 'Hawi Girma',
      rating: userRating,
      comment: userComment,
      date: 'Just now'
    };
    setReviews([newReview, ...reviews]);
    setUserComment('');
    setShowReviewModal(false);
  };

  if (!foodItem) {
    return (
      <View className="flex-1 bg-[#F8F9FC] items-center">
        <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl items-center justify-center px-6">
          <Ionicons name="restaurant-outline" size={32} color="#B8520B" />
          <Text className="text-sm font-bold text-[#1F130D] mt-3">No dish selected</Text>
          <Text className="text-[11px] text-gray-400 text-center px-8 mt-1">Open a dish from the menu to view live details and reviews.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="mt-5 bg-[#B8520B] px-5 py-3 rounded-2xl">
            <Text className="text-white text-xs font-bold">Go to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          {/* Back Button Header */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-3"
            >
              <Ionicons name="arrow-back" size={18} color="#1F130D" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-[#1F130D]">Dish Details</Text>
          </View>

          {/* Clean Image Container */}
          <View className="relative h-64 w-full rounded-3xl overflow-hidden mb-5 shadow-xs">
            <Image source={{ uri: foodItem.image }} className="w-full h-full" />
            <View className="absolute inset-0 bg-black/10" />
          </View>

          {/* Details Content Card */}
          <View className="bg-white rounded-3xl p-5 border border-[#EAE3DE] shadow-xs mb-6">
            
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-base font-black text-[#1F130D] flex-1 mr-2">{foodItem.name}</Text>
              <View className="flex-row items-center bg-[#FEF7F3] px-2 py-0.5 rounded-full border border-[#B8520B]/30">
                <Ionicons name="star" size={10} color="#B8520B" />
                <Text className="text-[10px] font-bold text-[#B8520B] ml-1">{foodItem.rating}</Text>
              </View>
            </View>

            <Text className="text-base font-black text-[#B8520B] mb-4">${(foodItem.price * quantity).toFixed(2)}</Text>

            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</Text>
            <Text className="text-xs text-gray-600 leading-relaxed mb-5">{foodItem.desc}</Text>

            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Choose Size</Text>
            <View className="flex-row space-x-3 mb-5">
              {['Regular', 'Large'].map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`flex-1 py-2.5 rounded-2xl border items-center justify-center ${isSelected ? 'bg-[#FEF7F3] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
                  >
                    <Text className={`font-bold text-xs ${isSelected ? 'text-[#B8520B]' : 'text-[#757575]'}`}>{size}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row justify-between items-center mb-5 bg-gray-50 p-3 rounded-2xl border border-[#EAE3DE]">
              <Text className="text-xs font-bold text-[#1F130D]">Quantity</Text>
              <View className="flex-row items-center space-x-3">
                <TouchableOpacity 
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs"
                >
                  <Ionicons name="remove" size={12} color="#1F130D" />
                </TouchableOpacity>
                <Text className="font-black text-xs text-[#1F130D]">{quantity}</Text>
                <TouchableOpacity 
                  onPress={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs"
                >
                  <Ionicons name="add" size={12} color="#1F130D" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Actions: Add to Cart & Checkout */}
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                onPress={handleAddToCart}
                className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-2.5 rounded-xl items-center flex-row justify-center shadow-xs"
              >
                <Ionicons name="cart-outline" size={12} color="#B8520B" style={{ marginRight: 4 }} />
                <Text className="text-[10px] font-bold text-[#B8520B]">Add To Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleQuickCheckout}
                className="flex-1 bg-[#B8520B] py-2.5 rounded-xl items-center flex-row justify-center shadow-md"
              >
                <Ionicons name="flash-outline" size={12} color="white" style={{ marginRight: 4 }} />
                <Text className="text-[10px] font-bold text-white">Checkout Now</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Customer Reviews Section */}
          <View className="bg-white rounded-3xl p-5 border border-[#EAE3DE] shadow-xs mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-black text-[#1F130D]">Customer Reviews ({reviews.length})</Text>
              <TouchableOpacity 
                onPress={() => setShowReviewModal(!showReviewModal)}
                className="bg-[#FEF7F3] border border-[#B8520B]/30 px-3 py-1.5 rounded-xl flex-row items-center"
              >
                <Ionicons name="create-outline" size={12} color="#B8520B" style={{ marginRight: 4 }} />
                <Text className="text-[10px] font-bold text-[#B8520B]">Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* Write Review Form Toggle Box */}
            {showReviewModal && (
              <View className="bg-gray-50 p-4 rounded-2xl border border-[#EAE3DE] mb-4">
                <Text className="text-xs font-bold text-[#1F130D] mb-2">Rate this dish</Text>
                
                <View className="flex-row space-x-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                      <Ionicons 
                        name={star <= userRating ? "star" : "star-outline"} 
                        size={20} 
                        color="#B8520B" 
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput 
                  placeholder="Share your experience with this food..."
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={3}
                  value={userComment}
                  onChangeText={setUserComment}
                  className="bg-white border border-[#EAE3DE] rounded-xl p-3 text-xs text-[#1F130D] mb-3 textAlignVertical-top"
                />

                <TouchableOpacity 
                  onPress={handleAddReview}
                  className="bg-[#B8520B] py-2 rounded-xl items-center"
                >
                  <Text className="text-xs font-bold text-white">Submit Review</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* List of Reviews */}
            {isLoadingReviews ? (
              <Text className="text-xs text-gray-400">Loading reviews...</Text>
            ) : reviews.length === 0 ? (
              <Text className="text-xs text-gray-400">No reviews yet.</Text>
            ) : reviews.map((rev) => (
              <View key={rev.id} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-xs text-[#1F130D]">{rev.name}</Text>
                  <Text className="text-[9px] text-gray-400">{rev.date}</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name={i < Math.floor(rev.rating) ? "star" : "star-outline"} 
                      size={10} 
                      color="#B8520B" 
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text className="text-xs text-gray-600">{rev.comment}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}