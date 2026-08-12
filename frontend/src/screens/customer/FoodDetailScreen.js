import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, TextInput, Animated } from 'react-native';
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

  // Animation values for interactive polish
  const [scrollY] = useState(new Animated.Value(0));

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
      <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#FEF7F3] rounded-full items-center justify-center mb-4 border border-[#B8520B]/20 shadow-sm">
            <Ionicons name="restaurant-outline" size={36} color="#B8520B" />
          </View>
          <Text className="text-base font-black text-[#1F130D] mb-1">No dish selected</Text>
          <Text className="text-xs text-gray-400 text-center px-6 mb-6 leading-relaxed">Open a dish from the menu to explore live details, customization options, and customer reviews.</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('MenuScreen')} 
            className="bg-[#B8520B] px-8 py-3.5 rounded-2xl shadow-md shadow-[#B8520B]/30 active:opacity-95"
          >
            <Text className="text-white text-xs font-bold tracking-wide">Explore Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl overflow-hidden">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Floating Header Actions Bar */}
        <View className="absolute top-0 left-0 right-0 z-20 pt-12 px-5 pb-3 flex-row justify-between items-center pointer-events-box-none">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full border border-gray-100 items-center justify-center shadow-md active:scale-95"
          >
            <Ionicons name="arrow-back" size={18} color="#1F130D" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CartScreen')}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full border border-gray-100 items-center justify-center shadow-md active:scale-95"
          >
            <Ionicons name="cart-outline" size={18} color="#B8520B" />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Stunning Immersive Image Header */}
          <View className="relative h-80 w-full bg-gray-200">
            <Image source={{ uri: foodItem.image }} className="w-full h-full" resizeMode="cover" />
            {/* Gradient Overlay for Smooth Depth */}
            <View className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F8F9FC]/80" />
            
            {/* Floating Badge on Image */}
            <div className="absolute bottom-4 left-5 flex-row items-center space-x-2"></div>
            <View className="absolute bottom-5 left-5 flex-row items-center space-x-2">
              <View className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center shadow-sm border border-white/40">
                <Ionicons name="star" size={12} color="#D97706" style={{ marginRight: 4 }} />
                <Text className="text-xs font-black text-[#1F130D]">{foodItem.rating} <Text className="text-[10px] font-normal text-gray-500">(120+ reviews)</Text></Text>
              </View>
              <View className="bg-[#B8520B]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center shadow-sm">
                <Ionicons name="time-outline" size={12} color="white" style={{ marginRight: 4 }} />
                <Text className="text-xs font-bold text-white">20-30 min</Text>
              </View>
            </View>
          </View>

          {/* Main Content Sheet Container */}
          <View className="px-5 -mt-6 pt-2 pb-28">
            
            {/* Primary Details Card */}
            <View className="bg-white rounded-3xl p-6 border border-[#EAE3DE] shadow-xl shadow-gray-200/50 mb-5">
              
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-xl font-black text-[#1F130D] flex-1 mr-3 leading-tight">{foodItem.name}</Text>
                <View className="bg-[#FEF7F3] px-3.5 py-1.5 rounded-2xl border border-[#B8520B]/20">
                  <Text className="text-sm font-black text-[#B8520B]">${(foodItem.price * quantity).toFixed(2)}</Text>
                </View>
              </View>

              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</Text>
              <Text className="text-xs text-gray-600 leading-relaxed mb-6">{foodItem.desc}</Text>

              {/* Size Selector */}
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Choose Portion Size</Text>
              <View className="flex-row space-x-3 mb-6">
                {['Regular', 'Large'].map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      className={`flex-1 py-3 rounded-2xl border items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-[#FEF7F3] border-[#B8520B] shadow-sm shadow-[#B8520B]/10' 
                          : 'bg-[#F8F9FC] border-[#EAE3DE]'
                      }`}
                    >
                      <Text className={`font-black text-xs ${isSelected ? 'text-[#B8520B]' : 'text-gray-500'}`}>{size}</Text>
                      <Text className={`text-[9px] mt-0.5 ${isSelected ? 'text-[#B8520B]/80 font-bold' : 'text-gray-400'}`}>
                        {size === 'Regular' ? 'Standard serving' : '+ $2.00 extra portion'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quantity Counter Row */}
              <View className="flex-row justify-between items-center mb-6 bg-[#F8F9FC] p-3.5 rounded-2xl border border-[#EAE3DE]">
                <View>
                  <Text className="text-xs font-black text-[#1F130D]">Quantity</Text>
                  <Text className="text-[10px] text-gray-400">Select how many items you want</Text>
                </View>
                <View className="flex-row items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-[#EAE3DE] shadow-xs">
                  <TouchableOpacity 
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 bg-[#F8F9FC] rounded-lg border border-[#EAE3DE] items-center justify-center active:bg-gray-100"
                  >
                    <Ionicons name="remove" size={14} color="#1F130D" />
                  </TouchableOpacity>
                  <Text className="font-black text-xs text-[#1F130D] px-2">{quantity}</Text>
                  <TouchableOpacity 
                    onPress={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 bg-[#F8F9FC] rounded-lg border border-[#EAE3DE] items-center justify-center active:bg-gray-100"
                  >
                    <Ionicons name="add" size={14} color="#1F130D" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={handleAddToCart}
                  className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-3.5 rounded-2xl items-center flex-row justify-center shadow-xs active:opacity-90"
                >
                  <Ionicons name="cart-outline" size={16} color="#B8520B" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-black text-[#B8520B]">Add To Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleQuickCheckout}
                  className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-[#B8520B]/30 active:opacity-90"
                >
                  <Ionicons name="flash-outline" size={16} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-black text-white">Buy Now</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* Customer Reviews Section */}
            <View className="bg-white rounded-3xl p-6 border border-[#EAE3DE] shadow-xl shadow-gray-200/50">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-sm font-black text-[#1F130D]">Customer Reviews</Text>
                  <Text className="text-[10px] text-gray-400">Based on recent verified purchases</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowReviewModal(!showReviewModal)}
                  className="bg-[#FEF7F3] border border-[#B8520B]/30 px-3.5 py-2 rounded-xl flex-row items-center active:scale-95"
                >
                  <Ionicons name="create-outline" size={14} color="#B8520B" style={{ marginRight: 4 }} />
                  <Text className="text-[11px] font-black text-[#B8520B]">Write Review</Text>
                </TouchableOpacity>
              </View>

              {/* Write Review Form Expandable Box */}
              {showReviewModal && (
                <View className="bg-[#F8F9FC] p-4 rounded-2xl border border-[#EAE3DE] mb-5 shadow-inner">
                  <Text className="text-xs font-black text-[#1F130D] mb-1">Rate this dish</Text>
                  <Text className="text-[10px] text-gray-400 mb-3">Tap stars to assign a rating score</Text>
                  
                  <View className="flex-row space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setUserRating(star)} className="p-1">
                        <Ionicons 
                          name={star <= userRating ? "star" : "star-outline"} 
                          size={24} 
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
                    className="bg-white border border-[#EAE3DE] rounded-xl p-3 text-xs text-[#1F130D] mb-3"
                    style={{ textAlignVertical: 'top', minHeight: 70 }}
                  />

                  <TouchableOpacity 
                    onPress={handleAddReview}
                    className="bg-[#B8520B] py-3 rounded-xl items-center shadow-sm active:opacity-90"
                  >
                    <Text className="text-xs font-black text-white">Post Review</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* List of Reviews */}
              {isLoadingReviews ? (
                <View className="py-6 items-center">
                  <Text className="text-xs text-gray-400">Loading reviews...</Text>
                </View>
              ) : reviews.length === 0 ? (
                <View className="py-6 items-center bg-[#F8F9FC] rounded-2xl border border-dashed border-gray-200">
                  <Ionicons name="chatbubble-outline" size={24} color="#B8520B" style={{ marginBottom: 6 }} />
                  <Text className="text-xs font-bold text-[#1F130D]">No reviews yet</Text>
                  <Text className="text-[10px] text-gray-400 mt-0.5">Be the first customer to share your thoughts!</Text>
                </View>
              ) : (
                reviews.map((rev, index) => (
                  <View 
                    key={rev.id || index} 
                    className="bg-[#F8F9FC] p-4 rounded-2xl border border-[#EAE3DE] mb-3 last:mb-0"
                  >
                    <View className="flex-row justify-between items-center mb-1.5">
                      <View className="flex-row items-center space-x-2">
                        <View className="w-6 h-6 bg-[#B8520B]/10 rounded-full items-center justify-center">
                          <Text className="text-[10px] font-black text-[#B8520B]">{rev.name.charAt(0)}</Text>
                        </View>
                        <Text className="font-black text-xs text-[#1F130D]">{rev.name}</Text>
                      </View>
                      <Text className="text-[10px] text-gray-400">{rev.date}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Ionicons 
                          key={i} 
                          name={i < Math.floor(rev.rating) ? "star" : "star-outline"} 
                          size={12} 
                          color="#B8520B" 
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    <Text className="text-xs text-gray-600 leading-relaxed">{rev.comment}</Text>
                  </View>
                ))
              )}
            </View>

          </View>
        </Animated.ScrollView>

      </View>
    </View>
  );
}