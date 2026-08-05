import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const [selectedStyle, setSelectedStyle] = useState('Modern');

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts'];

  const menuItems = [
    { id: 1, name: 'Truffle Mushroom Risotto', desc: 'Arborio rice, wild mushrooms, truffle oil', price: 24.00, rating: '4.8', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Artisanal Wagyu Burger', desc: 'Wagyu beef patty, cheddar, brioche bun', price: 18.50, rating: '4.9', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
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

            {/* Right Action Icons Group (Cart & Profile) */}
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                onPress={() => navigation.navigate('CartScreen')} 
                className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-2"
              >
                <Ionicons name="cart-outline" size={20} color="#1F130D" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('CustomerProfileScreen')} 
                className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs"
              >
                <Ionicons name="person-outline" size={20} color="#1F130D" />
              </TouchableOpacity>
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

          {/* Food Cards Grid List with Detail, Cart, and Checkout Actions */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-gray-400 mb-2">{selectedCategory} • {selectedStyle} Selection</Text>
            {menuItems.map((item) => (
              <View 
                key={item.id} 
                className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-4 shadow-xs"
              >
                <View className="flex-row items-center mb-3">
                  <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl mr-4" />
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="font-bold text-sm text-[#1F130D] w-3/4" numberOfLines={1}>{item.name}</Text>
                      <View className="flex-row items-center bg-[#FEF7F3] px-2 py-0.5 rounded-full border border-[#B8520B]/30">
                        <Ionicons name="star" size={10} color="#B8520B" />
                        <Text className="text-[10px] font-bold text-[#B8520B] ml-1">{item.rating}</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>{item.desc}</Text>
                    <Text className="font-black text-sm text-[#1F130D] mt-2">${item.price.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Bottom Action Buttons Row: Detail, Cart, and Checkout */}
                <View className="flex-row space-x-2 pt-2 border-t border-gray-100">
                  {/* Detail Button */}
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })} 
                    className="flex-1 bg-gray-100 py-2 rounded-xl items-center flex-row justify-center"
                  >
                    <Ionicons name="information-circle-outline" size={12} color="#1F130D" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-[#1F130D]">Detail</Text>
                  </TouchableOpacity>

                  {/* Cart Button */}
                  <TouchableOpacity 
                    onPress={() => handleAddToCart(item)} 
                    className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-2 rounded-xl items-center flex-row justify-center"
                  >
                    <Ionicons name="cart-outline" size={12} color="#B8520B" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-[#B8520B]">Cart</Text>
                  </TouchableOpacity>

                  {/* Checkout Button */}
                  <TouchableOpacity 
                    onPress={() => handleQuickCheckout(item)} 
                    className="flex-1 bg-[#B8520B] py-2 rounded-xl items-center flex-row justify-center"
                  >
                    <Ionicons name="flash-outline" size={12} color="white" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-white">Checkout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Mobile Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding')} className="items-center">
            <Ionicons name="home-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistoryScreen')} className="items-center">
            <Ionicons name="receipt-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="items-center">
            <Ionicons name="restaurant" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} className="items-center">
            <Ionicons name="cart-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerProfileScreen')} className="items-center">
            <Ionicons name="person-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}