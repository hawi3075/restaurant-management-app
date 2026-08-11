import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Image, ImageBackground, ActivityIndicator, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../api/backend';

export default function CustomerLandingScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedItemReviews, setSelectedItemReviews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  
  const isLoggedIn = !!user;

  const [activeDeliveryAlert, setActiveDeliveryAlert] = useState(null);
  const alertAnim = useRef(new Animated.Value(-100)).current;

  const categories = [
    { name: 'Breakfast', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80' },
    { name: 'Lunch', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Dinner', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
    { name: 'Drinks', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fast Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
  ];

  const trendingItems = menuItems.slice(0, 4);
  const categoryCounts = categories.reduce((counts, category) => {
    counts[category.name] = menuItems.filter((item) => item.category === category.name).length;
    return counts;
  }, {});

  const handleAddToCart = (item) => {
    navigation.navigate('CartScreen', { 
      addedItem: { ...item, quantity: 1, options: 'Regular' } 
    });
  };

  const handleQuickCheckout = (item) => {
    const total = item.price + 3.99;
    navigation.navigate('CheckoutScreen', { 
      total: total, 
      cartItems: [{ ...item, quantity: 1, options: 'Regular' }] 
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [menuRes, tablesRes, reviewsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/menu`),
          fetch(`${BACKEND_URL}/api/tables`),
          fetch(`${BACKEND_URL}/api/reviews`).catch(() => null)
        ]);
        const menuJson = await menuRes.json();
        const tablesJson = await tablesRes.json();
        
        let reviewsData = [];
        if (reviewsRes && reviewsRes.ok) {
          const revJson = await reviewsRes.json();
          reviewsData = revJson.reviews || revJson || [];
        }

        if (!reviewsData || reviewsData.length === 0) {
          reviewsData = [
            { id: 1, name: 'Abebe Kebede', rating: 5, comment: 'The absolute best burger and fast delivery! Highly recommended.', date: 'Yesterday' },
            { id: 2, name: 'Sara Tadesse', rating: 5, comment: 'Amazing food quality and very warm customer service. Will order again!', date: '2 days ago' },
            { id: 3, name: 'Dawit Mekonnen', rating: 4, comment: 'Fresh ingredients and great taste. Packaging was very neat.', date: '3 days ago' }
          ];
        }
        
        // Reverse reviews so the last/newest order review appears first
        setReviews([...reviewsData].reverse());

        const items = menuJson.items || menuJson || [];
        if (items && items.length > 0) {
          setMenuItems(items.map((it, idx) => {
            let imageUrl = it.image || it.img;
            
            if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '' || imageUrl.startsWith('blob:')) {
              imageUrl = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80';
            } else if (imageUrl.startsWith('/')) {
              imageUrl = `${BACKEND_URL}${imageUrl}`;
            }

            return {
              id: it._id || it.id || idx,
              name: it.name || it.title || 'Menu Item',
              desc: it.description || it.desc || '',
              price: Number(it.price || 0),
              rating: Number(it.rating || 4.8).toFixed(1),
              image: imageUrl,
              category: it.category || 'Uncategorized'
            };
          }));
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error('CustomerLanding loadData error', err);
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkLiveDeliveries = async () => {
      try {
        const authToken = token || user?.token || '';
        const response = await fetch(`${BACKEND_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          return;
        }

        const data = await response.json();
        const ordersList = data.orders || (Array.isArray(data) ? data : []);
        
        const onTheWayOrder = ordersList.find(o => 
          o.status === 'Ready' || o.deliveryStatus === 'On the Way' || o.deliveryStatus === 'Ready for Pickup'
        );

        if (onTheWayOrder) {
          setActiveDeliveryAlert({
            id: onTheWayOrder._id || onTheWayOrder.id,
            text: '🛵 Your delicious food is On the Way from the driver!'
          });
          
          Animated.timing(alertAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.timing(alertAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setActiveDeliveryAlert(null));
        }
      } catch (error) {
        // Suppress network poll errors
      }
    };

    checkLiveDeliveries();
    const interval = setInterval(checkLiveDeliveries, 10000); 
    return () => clearInterval(interval);
  }, [isLoggedIn, token, user]);

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {activeDeliveryAlert && (
          <Animated.View 
            style={{ transform: [{ translateY: alertAnim }] }}
            className="absolute top-12 left-5 right-5 z-50 bg-[#B8520B] p-3.5 rounded-2xl shadow-xl flex-row items-center justify-between border border-white/30"
          >
            <TouchableOpacity 
              onPress={() => navigation.navigate('OrderHistoryScreen')}
              className="flex-row items-center flex-1 pr-2"
            >
              <View className="w-7 h-7 bg-white/20 rounded-full items-center justify-center mr-2.5">
                <Ionicons name="bicycle" size={15} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-[11px] font-black tracking-wide">Live Delivery Update</Text>
                <Text className="text-white/90 text-[10px] font-medium">{activeDeliveryAlert.text}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80' }}
            className="pt-12 pb-6 px-5 justify-end"
            style={{ height: 410 }}
          >
            <View className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

            <View className="absolute top-10 left-5 right-5 flex-row justify-end items-center z-10">
              <TouchableOpacity 
                onPress={() => {
                  if (isLoggedIn) {
                    const role = user?.role?.toLowerCase()?.trim();
                    if (role === 'manager' || role === 'admin') {
                      navigation.navigate('ManagerDashboard');
                    } else {
                      navigation.navigate('CustomerProfileScreen');
                    }
                  } else {
                    navigation.navigate('Signup');
                  }
                }} 
                className="bg-gradient-to-r from-[#B8520B] to-[#D35400] px-4 py-2 rounded-full shadow-lg border border-white/20 flex-row items-center active:opacity-90"
              >
                <Ionicons name={isLoggedIn ? "person" : "sparkles"} size={11} color="white" style={{ marginRight: 4 }} />
                <Text className="text-white font-black text-[10px] tracking-wide">{isLoggedIn ? 'My Profile' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>

            <View className="z-10 mb-2">
              <Text className="text-2xl font-black text-white leading-tight mb-1 shadow-sm">
                Taste the <Text className="text-[#FF9F43]">Masterpiece</Text> in Every Bite
              </Text>
              <Text className="text-[11px] text-gray-200 mb-4 leading-relaxed font-medium">
                Freshly prepared, mouth-watering dishes crafted by expert chefs to satisfy your deepest cravings.
              </Text>

              <TouchableOpacity 
                onPress={() => navigation.navigate('MenuScreen')}
                className="bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-lg shadow-[#B8520B]/40 mb-3.5 active:opacity-95 border border-white/10"
              >
                <Text className="text-white font-black text-xs tracking-wider uppercase">Order Now</Text>
              </TouchableOpacity>

              <View className="bg-white/95 backdrop-blur-lg rounded-2xl px-4 py-3 flex-row items-center shadow-xl border border-white/40">
                <Ionicons name="search" size={16} color="#B8520B" style={{ marginRight: 10 }} />
                <TextInput 
                  placeholder="Search burgers, pizza, sushi, drinks..."
                  placeholderTextColor="#888888"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-xs text-[#1F130D] font-semibold"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#B8520B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ImageBackground>

          <View className="px-5 mt-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-black text-[#1F130D]">Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="flex-row items-center">
                <Text className="text-xs font-bold text-[#B8520B]">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {categories.map((cat, idx) => (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => navigation.navigate('MenuScreen')}
                  className="w-[31%] h-28 rounded-2xl overflow-hidden mb-3 relative shadow-xs"
                >
                  <Image source={{ uri: cat.image }} className="w-full h-full absolute" />
                  <View className="absolute inset-0 bg-black/40" />

                  <View className="absolute bottom-2 left-2 right-2">
                    <Text className="text-white font-black text-[11px]" numberOfLines={1}>{cat.name}</Text>
                    <Text className="text-gray-200 text-[8px] font-semibold">{categoryCounts[cat.name] || 0} Items</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="px-5 mt-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('MenuScreen')}
              className="bg-[#1F130D] rounded-2xl p-4 flex-row justify-between items-center shadow-md border border-[#B8520B]/40"
            >
              <View className="flex-1 pr-2">
                <View className="bg-[#B8520B] self-start px-2 py-0.5 rounded-md mb-1">
                  <Text className="text-[9px] font-bold text-white uppercase tracking-wider">Weekly Special Offer</Text>
                </View>
                <Text className="text-white font-black text-sm mb-0.5">Every Sunday 10% Discount</Text>
                <Text className="text-gray-300 text-[10px]">Enjoy your family favorites with special weekend savings!</Text>
              </View>
              <Ionicons name="gift-outline" size={32} color="#E67E22" />
            </TouchableOpacity>
          </View>

          <View className="px-5 mt-5 mb-10">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-black text-[#1F130D]">Trending Now</Text>
              <View className="flex-row space-x-1.5">
                <TouchableOpacity className="w-7 h-7 bg-gray-200 rounded-full items-center justify-center">
                  <Ionicons name="chevron-back" size={12} color="#1F130D" />
                </TouchableOpacity>
                <TouchableOpacity className="w-7 h-7 bg-gray-200 rounded-full items-center justify-center">
                  <Ionicons name="chevron-forward" size={12} color="#1F130D" />
                </TouchableOpacity>
              </View>
            </View>

            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#B8520B" />
              </View>
            ) : trendingItems.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-xs text-gray-500">No menu items available yet.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
                {trendingItems.map((item) => (
                <View key={item.id} className="bg-white w-64 rounded-2xl border border-[#EAE3DE] overflow-hidden mr-3 shadow-xs">
                  
                  <View className="relative h-32 w-full">
                    <Image 
                      source={{ uri: item.image }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/10" />
                  </View>

                  <View className="p-3">
                    <View className="flex-row justify-between items-start mb-0.5">
                      <Text className="font-bold text-xs text-[#1F130D] w-36" numberOfLines={1}>{item.name}</Text>
                      <View className="flex-row items-center bg-[#FEF7F3] px-1.5 py-0.5 rounded-full border border-[#B8520B]/30">
                        <Ionicons name="star" size={8} color="#B8520B" />
                        <Text className="text-[9px] font-bold text-[#B8520B] ml-0.5">{item.rating}</Text>
                      </View>
                    </View>
                    <Text className="text-[10px] text-gray-400 mb-2" numberOfLines={2}>{item.desc}</Text>
                    
                    <View className="flex-row justify-between items-center mb-2.5">
                      <Text className="font-black text-xs text-[#1F130D]">${item.price.toFixed(2)}</Text>
                    </View>

                    {/* Action buttons row with Review button placed right next to Detail button */}
                    <View className="flex-row space-x-1 mb-1.5">
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })} 
                        className="flex-1 bg-gray-100 py-1.5 rounded-xl items-center flex-row justify-center"
                      >
                        <Ionicons name="information-circle-outline" size={10} color="#1F130D" style={{ marginRight: 2 }} />
                        <Text className="text-[8px] font-bold text-[#1F130D]">Detail</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => setSelectedItemReviews(item)} 
                        className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-1.5 rounded-xl items-center flex-row justify-center"
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={10} color="#B8520B" style={{ marginRight: 2 }} />
                        <Text className="text-[8px] font-bold text-[#B8520B]">Reviews</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => handleAddToCart(item)} 
                        className="flex-1 bg-gray-100 py-1.5 rounded-xl items-center flex-row justify-center"
                      >
                        <Ionicons name="cart-outline" size={10} color="#1F130D" style={{ marginRight: 2 }} />
                        <Text className="text-[8px] font-bold text-[#1F130D]">Cart</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      onPress={() => handleQuickCheckout(item)} 
                      className="w-full bg-[#B8520B] py-2 rounded-xl items-center flex-row justify-center shadow-xs"
                    >
                      <Ionicons name="flash-outline" size={11} color="white" style={{ marginRight: 3 }} />
                      <Text className="text-[9px] font-bold text-white uppercase">Checkout</Text>
                    </TouchableOpacity>

                  </View>
                </View>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        {/* Dedicated Modal Popup for Item Reviews (Newest order reviews first) */}
        <Modal
          visible={!!selectedItemReviews}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedItemReviews(null)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[360px] rounded-3xl p-5 shadow-2xl border border-gray-100">
              <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="chatbubbles" size={18} color="#B8520B" />
                  <Text className="text-sm font-black text-[#1F130D]">Customer Reviews</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedItemReviews(null)} className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons name="close" size={14} color="#1F130D" />
                </TouchableOpacity>
              </View>

              {selectedItemReviews && (
                <View className="flex-row items-center mb-4 bg-[#FEF7F3] p-2.5 rounded-2xl border border-[#B8520B]/20">
                  <Image source={{ uri: selectedItemReviews.image }} className="w-10 h-10 rounded-xl mr-3" />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#1F130D]" numberOfLines={1}>{selectedItemReviews.name}</Text>
                    <Text className="text-[10px] text-[#B8520B] font-semibold">${selectedItemReviews.price.toFixed(2)}</Text>
                  </View>
                </View>
              )}

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-72 space-y-2.5">
                {reviews.map((rev, idx) => (
                  <View key={idx} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-2">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs font-bold text-[#1F130D]">{rev.name || 'Customer'}</Text>
                      <View className="flex-row items-center bg-[#FEF7F3] px-2 py-0.5 rounded-full border border-[#B8520B]/30">
                        <Ionicons name="star" size={9} color="#B8520B" />
                        <Text className="text-[9px] font-bold text-[#B8520B] ml-1">{rev.rating || 5}</Text>
                      </View>
                    </View>
                    <Text className="text-[11px] text-gray-600 leading-snug">{rev.comment || rev.text}</Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity 
                onPress={() => setSelectedItemReviews(null)}
                className="mt-4 bg-[#1F130D] py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-xs">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding')} className="items-center">
            <Ionicons name="home" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Home</Text>
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
            <Ionicons name="cart-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              if (isLoggedIn) {
                const role = user?.role?.toLowerCase()?.trim();
                if (role === 'manager' || role === 'admin') {
                  navigation.navigate('ManagerDashboard');
                } else {
                  navigation.navigate('CustomerProfileScreen');
                }
              } else {
                navigation.navigate('Signup');
              }
            }} 
            className="items-center"
          >
            <Ionicons 
              name={isLoggedIn ? "person" : "person-add-outline"} 
              size={18} 
              color={isLoggedIn ? "#B8520B" : "#757575"} 
            />
            <Text className={`text-[9px] ${isLoggedIn ? 'font-bold text-[#B8520B]' : 'font-semibold text-gray-500'} mt-0.5`}>
              {isLoggedIn ? 'Profile' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}