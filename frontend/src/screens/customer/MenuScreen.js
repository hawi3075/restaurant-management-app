import React, { useState, useEffect, useContext } from 'react';
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

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts'];

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory, selectedStyle]);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/menu?category=${selectedCategory}&style=${selectedStyle}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch menu items.');

      const items = data.items || data || [];

      // Map items and ensure image URLs are fully qualified with BACKEND_URL if they are relative paths
      const formattedItems = items.map((item, index) => {
        let imageUrl = item.image;
        if (imageUrl) {
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = `${BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
        } else {
          imageUrl = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80';
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
          image: imageUrl
        };
      });

      setMenuItems(formattedItems);
    } catch (error) {
      console.error('Fetch Menu Error:', error);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

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
    const total = item.price + 3.99;
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

          {/* Food Cards Grid List with Detail, Cart, and Checkout Actions */}
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
              menuItems.map((item) => (
                <View 
                  key={item.id} 
                  className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-4 shadow-xs"
                >
                  <View className="flex-row items-start mb-3">
                    <Image 
                      source={{ uri: item.image }} 
                      className="w-20 h-20 rounded-2xl mr-4 mt-1 bg-gray-100" 
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text className="font-bold text-sm text-[#1F130D] w-3/4" numberOfLines={1}>{item.name}</Text>
                        <View className="flex-row items-center bg-[#FEF7F3] px-2 py-0.5 rounded-full border border-[#B8520B]/30">
                          <Ionicons name="star" size={10} color="#B8520B" />
                          <Text className="text-[10px] font-bold text-[#B8520B] ml-1">{item.rating}</Text>
                        </View>
                      </View>

                      {/* Full description uploaded by manager */}
                      <Text className="text-xs text-gray-600 mt-1.5 leading-relaxed" numberOfLines={3}>
                        {item.desc}
                      </Text>

                      {/* Additional Manager Upload Details (Ingredients / Spicy level) */}
                      {(item.ingredients || item.spicyLevel) && (
                        <View className="mt-2 pt-2 border-t border-gray-100 flex-row flex-wrap gap-2">
                          {item.ingredients ? (
                            <View className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                              <Text className="text-[9px] text-gray-500 font-medium">
                                <Text className="font-bold text-[#1F130D]">Ingredients:</Text> {item.ingredients}
                              </Text>
                            </View>
                          ) : null}
                          {item.spicyLevel && (
                            <View className="bg-[#FEF7F3] px-2 py-0.5 rounded-md border border-[#B8520B]/20">
                              <Text className="text-[9px] text-[#B8520B] font-semibold">
                                Spice: {item.spicyLevel}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      <Text className="font-black text-sm text-[#1F130D] mt-2.5">${item.price.toFixed(2)}</Text>
                    </View>
                  </View>

                  {/* Bottom Action Buttons Row: Detail, Cart, and Checkout */}
                  <View className="flex-row space-x-2 pt-2.5 border-t border-gray-100">
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('FoodDetailScreen', { foodItem: item })} 
                      className="flex-1 bg-gray-100 py-2 rounded-xl items-center flex-row justify-center"
                    >
                      <Ionicons name="information-circle-outline" size={12} color="#1F130D" style={{ marginRight: 3 }} />
                      <Text className="text-[10px] font-bold text-[#1F130D]">Detail</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => handleAddToCart(item)} 
                      className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-2 rounded-xl items-center flex-row justify-center"
                    >
                      <Ionicons name="cart-outline" size={12} color="#B8520B" style={{ marginRight: 3 }} />
                      <Text className="text-[10px] font-bold text-[#B8520B]">Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => handleQuickCheckout(item)} 
                      className="flex-1 bg-[#B8520B] py-2 rounded-xl items-center flex-row justify-center"
                    >
                      <Ionicons name="flash-outline" size={12} color="white" style={{ marginRight: 3 }} />
                      <Text className="text-[10px] font-bold text-white">Checkout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

          {/* Bottom Mobile Navigation Bar */}
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