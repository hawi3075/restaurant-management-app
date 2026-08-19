import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../api/backend';
import { AuthContext } from '../../context/AuthContext';

export default function MenuScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const [selectedStyle, setSelectedStyle] = useState('Modern');
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts','fast food'];

  
  const cacheRef = useRef({});
  // Tracks the in-flight request so a fast tab switch cancels the
  // previous fetch instead of letting a slow, stale response overwrite
  // a faster, newer one (this was the "loads many times" flicker).
  const abortRef = useRef(null);

  const formatItems = (items) => {
    return items.map((item, index) => {
      let imageUrl = item.image || item.imageUrl;

      if (imageUrl) {
        if (imageUrl.startsWith('data:image')) {
          // base64 data URI — use as is
        } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          // full URL — use as is
        } else {
          imageUrl = `${BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
      }

      return {
        id: item._id || item.id || index + 1,
        name: item.name || 'Delicious Dish',
        desc: item.description || item.desc || 'Freshly prepared ingredients',
        ingredients: item.ingredients || item.ingredientList || '',
        cookingStyle: item.cookingStyle || item.style || selectedStyle,
        spicyLevel: item.spicyLevel || item.spice || 'Regular',
        price: item.price || 15.00,
        rating: item.rating ? item.rating.toString() : '4.8',
        image: imageUrl,
      };
    });
  };

  const fetchMenuItems = useCallback(async (category, style) => {
    const cacheKey = `${category}::${style}`;

    // Serve from cache immediately — no spinner, no network round trip.
    if (cacheRef.current[cacheKey]) {
      setMenuItems(cacheRef.current[cacheKey]);
      setIsLoading(false);
      return;
    }

    // Cancel any still-in-flight request for a previous tab.
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/menu?category=${category}&style=${style}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch menu items.');

      const raw = data.items || data || [];
      const formatted = formatItems(raw);

      cacheRef.current[cacheKey] = formatted;
      setMenuItems(formatted);
    } catch (error) {
      if (error.name === 'AbortError') return; // superseded by a newer tab tap, ignore
      console.error('Fetch Menu Error:', error);
      setMenuItems([]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems(selectedCategory, selectedStyle);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [selectedCategory, selectedStyle, fetchMenuItems]);

  const handleAddToCart = (item) => {
    navigation.navigate('CartScreen', { 
      addedItem: { ...item, quantity: 1, options: 'Regular' } 
    });
  };

  const handleQuickCheckout = (item) => {
    if (!user) {
      Alert.alert(
        'Sign In Required 🔒',
        'Please sign in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    const total = item.price + 150; // Adjusted quick fee representation to Birr if applicable, or keep numeric sum
    navigation.navigate('CheckoutScreen', {
      total: total,
      cartItems: [{ ...item, quantity: 1, options: 'Regular' }],
    });
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 px-5 pb-24">
          {/* Header with Back Button and Right Actions (Cart & Profile) */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-3"
              >
                <Ionicons name="arrow-back" size={18} color="#1F130D" />
              </TouchableOpacity>
              <View>
                <Text className="text-2xl font-black text-[#1F130D]">Explore Menu</Text>
                <Text className="text-xs text-gray-500">Fresh dishes prepared to order</Text>
              </View>
            </View>

            {/* Right Action Icons Group (Cart & Profile/Login) */}
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('CartScreen')}
                className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-2"
              >
                <Ionicons name="cart-outline" size={20} color="#1F130D" />
              </TouchableOpacity>
              {user ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CustomerProfileScreen')}
                  className="w-10 h-10 bg-[#B8520B] rounded-full items-center justify-center shadow-xs"
                >
                  <Ionicons name="person" size={18} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  className="h-10 bg-[#B8520B] px-4 rounded-full items-center justify-center shadow-xs flex-row"
                >
                  <Ionicons name="log-in-outline" size={16} color="white" style={{ marginRight: 4 }} />
                  <Text className="text-white text-[11px] font-black">Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Modern & Traditional Filter Tabs */}
          <View className="flex-row space-x-2 mb-4">
            {['Modern', 'Traditional'].map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => setSelectedStyle(style)}
                className={`px-4 py-1.5 rounded-full border ${selectedStyle === style ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-[10px] font-bold ${selectedStyle === style ? 'text-white' : 'text-[#757575]'}`}>
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-12">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => setSelectedCategory(cat)}
                  className={`mr-3 px-5 py-2.5 rounded-2xl border justify-center ${isSelected ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
                >
                  <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-[#1F130D]'}`}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Food Cards — 2-Column Square Grid */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-gray-400 mb-2">{selectedCategory} • {selectedStyle} Selection</Text>
            
            {isLoading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#B8520B" />
              </View>
            ) : menuItems.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Ionicons name="restaurant-outline" size={32} color="#B8520B" />
                <Text className="text-xs font-bold text-gray-500 mt-2">No dishes available in this category.</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {menuItems.map((item) => (
                  <View 
                    key={item.id} 
                    className="w-[48%] bg-white rounded-2xl border border-[#EAE3DE] mb-3 overflow-hidden shadow-xs"
                  >
                    <TouchableOpacity
                      onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })}
                      className="w-full h-28 bg-[#F3F4F6]"
                    >
                      <Image 
                        source={{ uri: item.image }} 
                        className="w-full h-full" 
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

                    <View className="p-3">
                      <View className="flex-row justify-between items-start mb-1">
                        <TouchableOpacity 
                          onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })}
                          className="flex-1 pr-1"
                        >
                          <Text className="font-black text-xs text-[#1F130D]" numberOfLines={1}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                        <View className="flex-row items-center bg-[#FEF7F3] px-1.5 py-0.5 rounded-full border border-[#B8520B]/30">
                          <Ionicons name="star" size={8} color="#B8520B" />
                          <Text className="text-[8px] font-black text-[#B8520B] ml-0.5">{item.rating}</Text>
                        </View>
                      </View>

                      <Text className="text-[10px] text-gray-400 mb-2" numberOfLines={2}>
                        {item.desc}
                      </Text>

                      {item.spicyLevel ? (
                        <View className="self-start bg-[#FEF7F3] px-2 py-0.5 rounded-md border border-[#B8520B]/20 mb-2">
                          <Text className="text-[9px] text-[#B8520B] font-semibold">Spice: {item.spicyLevel}</Text>
                        </View>
                      ) : null}

                      <Text className="font-black text-xs text-[#1F130D] mb-2">ETB {item.price.toFixed(2)}</Text>

                      <View className="flex-row space-x-1.5">
                        <TouchableOpacity 
                          onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })} 
                          className="w-7 h-7 bg-gray-100 rounded-xl items-center justify-center"
                          title="Detail"
                        >
                          <Ionicons name="information-circle-outline" size={13} color="#1F130D" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => handleAddToCart(item)} 
                          className="w-7 h-7 bg-[#FEF7F3] border border-[#B8520B]/40 rounded-xl items-center justify-center"
                          title="Cart"
                        >
                          <Ionicons name="cart-outline" size={13} color="#B8520B" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => handleQuickCheckout(item)} 
                          className="flex-1 bg-[#B8520B] rounded-xl items-center justify-center flex-row"
                          title="Checkout"
                        >
                          <Ionicons name="flash-outline" size={11} color="white" style={{ marginRight: 3 }} />
                          <Text className="text-[9px] font-bold text-white">Checkout</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Mobile Navigation Bar — Home, Orders, Menu, Cart, Profile */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding')} className="items-center">
            <Ionicons name="home-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Home</Text>
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistoryScreen')} className="items-center">
              <Ionicons name="receipt-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Orders</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} className="items-center">
              <Ionicons name="log-in-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Sign In</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity className="items-center">
            <Ionicons name="restaurant" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="items-center">
            <Ionicons name="cart-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Cart</Text>
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity onPress={() => navigation.navigate('CustomerProfileScreen')} className="items-center">
              <Ionicons name="person-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="items-center">
              <Ionicons name="person-add-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}