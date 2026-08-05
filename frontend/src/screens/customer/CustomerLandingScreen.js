import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerLandingScreen({ route, navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track authentication status via route params (defaults to false / guest)
  const isLoggedIn = route?.params?.isLoggedIn ?? false;

  const categories = [
    { name: 'Breakfast', count: '18 Items', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80' },
    { name: 'Lunch', count: '32 Items', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Dinner', count: '24 Items', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
    { name: 'Drink', count: '40 Items', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' },
    { name: 'Dessert', count: '15 Items', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fast Food', count: '20 Items', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
  ];

  const trendingItems = [
    { id: 1, name: 'Truffle Mushroom Risotto', desc: 'Creamy arborio rice, wild mushrooms, white truffle oil.', price: 24.00, rating: '4.9', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Seared Salmon Plate', desc: 'Pan-seared Atlantic salmon with asparagus.', price: 26.00, rating: '4.8', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80' },
  ];

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

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">
          {/* Top Hero Banner */}
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' }}
            className="pt-12 pb-6 px-5 justify-end"
            style={{ height: 380 }}
          >
            <View className="absolute inset-0 bg-black/60" />

            {/* Clean Header with Sign Up / Profile Header Button */}
            <View className="absolute top-10 left-5 right-5 flex-row justify-end items-center z-10">
              <TouchableOpacity 
                onPress={() => navigation.navigate(isLoggedIn ? 'CustomerProfileScreen' : 'Signup')} 
                className="bg-[#B8520B] px-4 py-1.5 rounded-full shadow-md border border-white/20 active:opacity-80"
              >
                <Text className="text-white font-bold text-[10px]">{isLoggedIn ? 'Profile' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>

            {/* Hero Content */}
            <View className="z-10 mb-2">
              <Text className="text-2xl font-black text-white leading-tight mb-1">
                Craving Something <Text className="text-[#E67E22]">Extraordinary?</Text>
              </Text>
              <Text className="text-[11px] text-gray-200 mb-4 leading-relaxed">
                Experience culinary perfection delivered straight to your table or door.
              </Text>

              <TouchableOpacity 
                onPress={() => navigation.navigate('MenuScreen')}
                className="bg-[#B8520B] py-3 rounded-2xl items-center shadow-md mb-3 active:opacity-90"
              >
                <Text className="text-white font-black text-xs tracking-wide">Order Now</Text>
              </TouchableOpacity>

              {/* Search Bar */}
              <View className="bg-white rounded-2xl px-3 py-2.5 flex-row items-center shadow-sm">
                <Ionicons name="search-outline" size={16} color="#757575" style={{ marginRight: 8 }} />
                <TextInput 
                  placeholder="Search dishes..."
                  placeholderTextColor="#9E9E9E"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-xs text-[#1F130D]"
                />
              </View>
            </View>
          </ImageBackground>

          {/* Categories Grid Section */}
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
                    <Text className="text-gray-200 text-[8px] font-semibold">{cat.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Special Promotional Promo Banner */}
          <View className="px-5 mt-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('MenuScreen')}
              className="bg-[#1F130D] rounded-2xl p-4 flex-row justify-between items-center shadow-md border border-[#B8520B]/40"
            >
              <View className="flex-1 pr-2">
                <View className="bg-[#B8520B] self-start px-2 py-0.5 rounded-md mb-1">
                  <Text className="text-[9px] font-bold text-white uppercase tracking-wider">Special Offer</Text>
                </View>
                <Text className="text-white font-black text-sm mb-0.5">Weekend Mega Bundle 20% Off</Text>
                <Text className="text-gray-300 text-[10px]">Use code <Text className="text-[#E67E22] font-bold">TASTE20</Text> at checkout.</Text>
              </View>
              <Ionicons name="gift-outline" size={32} color="#E67E22" />
            </TouchableOpacity>
          </View>

          {/* Trending Now Horizontal Carousel with Clean Images and Bottom Action Buttons */}
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
              {trendingItems.map((item) => (
                <View key={item.id} className="bg-white w-64 rounded-2xl border border-[#EAE3DE] overflow-hidden mr-3 shadow-xs">
                  
                  {/* Clean Image Container (No overlays on image) */}
                  <View className="relative h-32 w-full">
                    <Image source={{ uri: item.image }} className="w-full h-full" />
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

                    {/* Bottom Action Buttons Row: Detail, Cart, and Checkout */}
                    <View className="flex-row space-x-1.5">
                      {/* Detail Button */}
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })} 
                        className="flex-1 bg-gray-100 py-1.5 rounded-xl items-center flex-row justify-center"
                      >
                        <Ionicons name="information-circle-outline" size={11} color="#1F130D" style={{ marginRight: 2 }} />
                        <Text className="text-[9px] font-bold text-[#1F130D]">Detail</Text>
                      </TouchableOpacity>

                      {/* Cart Button */}
                      <TouchableOpacity 
                        onPress={() => handleAddToCart(item)} 
                        className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-1.5 rounded-xl items-center flex-row justify-center"
                      >
                        <Ionicons name="cart-outline" size={11} color="#B8520B" style={{ marginRight: 2 }} />
                        <Text className="text-[9px] font-bold text-[#B8520B]">Cart</Text>
                      </TouchableOpacity>

                      {/* Checkout Button */}
                      <TouchableOpacity 
                        onPress={() => handleQuickCheckout(item)} 
                        className="flex-1 bg-[#B8520B] py-1.5 rounded-xl items-center flex-row justify-center"
                      >
                        <Ionicons name="flash-outline" size={11} color="white" style={{ marginRight: 2 }} />
                        <Text className="text-[9px] font-bold text-white">Checkout</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Bottom Mobile Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding', { isLoggedIn })} className="items-center">
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
            onPress={() => navigation.navigate(isLoggedIn ? 'CustomerProfileScreen' : 'Signup')} 
            className="items-center"
          >
            <Ionicons 
              name={isLoggedIn ? "person-outline" : "person-add-outline"} 
              size={18} 
              color="#757575" 
            />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">
              {isLoggedIn ? 'Profile' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}