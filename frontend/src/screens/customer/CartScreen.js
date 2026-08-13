import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

export default function CartScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);

  // Helper: require login before going to checkout.
  // Redirects straight to the Login screen instead of showing a
  // confirm/cancel alert first.
  const requireLogin = (onSuccess) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    onSuccess();
  };
  const [cartItems, setCartItems] = useState([]);

  // Load cart from AsyncStorage and accept addedItem from navigation
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem('cart');
        let parsed = stored ? JSON.parse(stored) : [];
        // If route provided an addedItem, merge it
        const added = route?.params?.addedItem;
        if (added) {
          const existing = parsed.find(i => String(i.id) === String(added.id));
          if (existing) {
            parsed = parsed.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + (added.quantity || 1) } : i);
          } else {
            parsed.unshift(added);
          }
          await AsyncStorage.setItem('cart', JSON.stringify(parsed));
        }
        setCartItems(parsed || []);
      } catch (err) {
        console.error('Load cart error', err);
        setCartItems([]);
      }
    };
    loadCart();
  }, [route?.params?.addedItem]);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => {
      const next = prev.map(item => {
        if (String(item.id) === String(id)) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
      AsyncStorage.setItem('cart', JSON.stringify(next)).catch(e => console.error('Save cart', e));
      return next;
    });
  };

  const removeItem = (id) => {
    const next = cartItems.filter(item => String(item.id) !== String(id));
    setCartItems(next);
    AsyncStorage.setItem('cart', JSON.stringify(next)).catch(e => console.error('Save cart', e));
  };

  const handleSingleItemCheckout = (item) => {
    requireLogin(() => {
      const singleItemTotal = (item.price * item.quantity) + 150.00; // Adjusted delivery fee placeholder in Birr
      navigation.navigate('CheckoutScreen', {
        total: singleItemTotal,
        cartItems: [item],
      });
    });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 150.00 : 0; // Standard delivery fee in Birr
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
            <Ionicons name="arrow-back" size={20} color="#1F130D" />
            <Text className="text-sm font-bold text-[#1F130D] ml-2">Back to Menu</Text>
          </TouchableOpacity>
          <Text className="text-base font-black text-[#1F130D]">Shopping Cart</Text>
        </View>

        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-32">
          <Text className="text-sm font-black text-[#1F130D] mb-1">Your Cart</Text>
          <Text className="text-xs text-gray-400 mb-4">Review your items or checkout individually.</Text>

          {cartItems.length === 0 ? (
            <View className="items-center justify-center pt-24">
              <View className="w-16 h-16 bg-[#FEF7F3] rounded-full items-center justify-center mb-3 border border-[#B8520B]/20">
                <Ionicons name="cart-outline" size={28} color="#B8520B" />
              </View>
              <Text className="text-sm font-bold text-[#1F130D] mb-1">Your cart is empty</Text>
              <Text className="text-[11px] text-gray-400 text-center px-6 mb-5">Add some delicious items from the menu to start your order.</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('MenuScreen')}
                className="bg-[#B8520B] px-6 py-3 rounded-2xl"
              >
                <Text className="text-white text-xs font-bold">Explore Menu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {cartItems.map((item) => (
                <View key={item.id} className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-3 shadow-xs">
                  <View className="flex-row items-center mb-3">
                    <Image source={{ uri: item.image }} className="w-14 h-14 rounded-xl mr-3" />
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-xs font-black text-[#1F130D] flex-1">{item.name}</Text>
                        <TouchableOpacity onPress={() => removeItem(item.id)}>
                          <Text className="text-[10px] font-bold text-red-500">delete</Text>
                        </TouchableOpacity>
                      </View>
                      <Text className="text-[10px] text-gray-400 mt-0.5">{item.options}</Text>
                      <Text className="text-xs font-black text-[#B8520B] mt-1">Br {(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-2.5 border-t border-[#F8F9FC]">
                    <View className="flex-row items-center bg-[#F8F9FC] border border-[#EAE3DE] rounded-xl px-2 py-1">
                      <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} className="px-2">
                        <Text className="text-xs font-bold text-[#1F130D]">-</Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-black text-[#1F130D] px-2">{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} className="px-2">
                        <Text className="text-xs font-bold text-[#B8520B]">+</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Minimized Single-Item Checkout Button */}
                    <TouchableOpacity 
                      onPress={() => handleSingleItemCheckout(item)}
                      className="bg-[#FEF7F3] border border-[#B8520B]/40 px-3 py-1.5 rounded-xl flex-row items-center active:opacity-90"
                    >
                      <Ionicons name="flash-outline" size={12} color="#B8520B" style={{ marginRight: 4 }} />
                      <Text className="text-[#B8520B] font-bold text-[11px]">Checkout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Bill Summary */}
              <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mt-2 mb-6 shadow-xs">
                <Text className="text-xs font-black text-[#1F130D] mb-3">Order Summary (All Items)</Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs text-gray-500">Subtotal</Text>
                  <Text className="text-xs font-bold text-[#1F130D]">Br {subtotal.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-3 pb-3 border-b border-[#F8F9FC]">
                  <Text className="text-xs text-gray-500">Delivery Fee</Text>
                  <Text className="text-xs font-bold text-[#1F130D]">Br {deliveryFee.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-sm font-black text-[#1F130D]">Total Amount</Text>
                  <Text className="text-base font-black text-[#B8520B]">Br {total.toFixed(2)}</Text>
                </View>

                {/* Checkout All Button — redirects straight to Login if signed out */}
                <TouchableOpacity
                  onPress={() => requireLogin(() => navigation.navigate('CheckoutScreen', { total, cartItems }))}
                  className="bg-[#B8520B] py-3.5 rounded-xl items-center shadow-md active:opacity-95"
                >
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">
                    {user ? 'Checkout All Items' : '🔒 Sign In to Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Navigation — Home, Orders, Menu, Cart, Profile */}
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
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="items-center">
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="cart" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Cart</Text>
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity onPress={() => navigation.navigate('CustomerProfileScreen')} className="items-center">
              <Ionicons name="person" size={18} color="#757575" />
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