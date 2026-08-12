import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, Image, ActivityIndicator, Alert, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../api/backend';

export default function CustomerLandingScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [cartCount, setCartCount]         = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const categories = [
    { name: 'Breakfast', icon: 'sunny-outline' },
    { name: 'Lunch',     icon: 'restaurant-outline' },
    { name: 'Dinner',    icon: 'moon-outline' },
    { name: 'Drinks',    icon: 'cafe-outline' },
    { name: 'Desserts',  icon: 'ice-cream-outline' },
  ];

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchFeaturedItems();
    loadCartCount();
  }, []);

  // Refresh cart count whenever screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCartCount);
    return unsubscribe;
  }, [navigation]);

  const loadCartCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      const items  = stored ? JSON.parse(stored) : [];
      setCartCount(items.reduce((sum, i) => sum + (i.quantity || 1), 0));
    } catch (_) {}
  };

  const fetchFeaturedItems = async () => {
    try {
      setIsLoading(true);
      const res  = await fetch(`${BACKEND_URL}/api/menu?category=Lunch`);
      const data = await res.json();
      const raw  = data.items || data || [];

      const formatted = raw.slice(0, 6).map((item, i) => ({
        id:    item._id || item.id || i,
        name:   item.name || 'Delicious Dish',
        price:  item.price || 15.00,
        rating: item.rating?.toString() || '4.8',
        desc:   item.description || item.desc || '',
        image:  item.image && item.image.startsWith('http')
                ? item.image
                : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      }));
      setFeaturedItems(formatted);
    } catch (e) {
      console.error('Landing fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const handleAddToCart = async (item) => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      let cart     = stored ? JSON.parse(stored) : [];
      const exists = cart.find(i => String(i.id) === String(item.id));
      if (exists) {
        cart = cart.map(i =>
          String(i.id) === String(item.id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        cart.unshift({ ...item, quantity: 1, options: 'Regular' });
      }
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      const total = cart.reduce((s, i) => s + (i.quantity || 1), 0);
      setCartCount(total);
      Alert.alert('Added to Cart 🛒', `${item.name} has been added to your cart.`);
    } catch (e) {
      console.error('Add to cart error:', e);
    }
  };

  const handleGoToCart = () => {
    navigation.navigate('CartScreen');
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const performLogout = async () => {
    setShowLogoutModal(false);
    try {
      if (logout) {
        await logout();
      }
    } catch (err) {
      console.error('Logout execution error:', err);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 relative shadow-2xl">
        <StatusBar barStyle="light-content" backgroundColor="#1F130D" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">

          {/* ══ HERO ══════════════════════════════════════════════════════ */}
          <View className="bg-[#1F130D] px-5 pt-12 pb-8 relative overflow-hidden">
            {/* Decorative icon */}
            <View className="absolute right-[-30] top-[-20] opacity-10">
              <Ionicons name="restaurant" size={190} color="#B8520B" />
            </View>

            {/* Top nav row */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-[10px] font-black text-[#B8520B] uppercase tracking-widest">
                  Welcome to
                </Text>
                <Text className="text-xl font-black text-white">ROMS Restaurant 🍽️</Text>
              </View>

              <View className="flex-row items-center space-x-2">
                {/* Cart badge */}
                <TouchableOpacity
                  onPress={handleGoToCart}
                  className="w-10 h-10 bg-[#B8520B]/20 rounded-2xl items-center justify-center border border-[#B8520B]/40 relative"
                >
                  <Ionicons name="cart-outline" size={20} color="#B8520B" />
                  {cartCount > 0 && (
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-[#B8520B] rounded-full items-center justify-center">
                      <Text className="text-white text-[9px] font-black">{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Auth button */}
                {user ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CustomerProfileScreen')}
                    className="w-10 h-10 bg-[#B8520B] rounded-2xl items-center justify-center"
                  >
                    <Ionicons name="person" size={18} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="bg-[#B8520B] px-4 py-2 rounded-2xl"
                  >
                    <Text className="text-white text-[11px] font-black">Sign In</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Headline */}
            <Text className="text-3xl font-black text-white leading-tight mb-2">
              Fresh Food,{'\n'}
              <Text className="text-[#B8520B]">Fast Delivery</Text>
            </Text>
            <Text className="text-slate-400 text-xs font-medium mb-5 leading-relaxed">
              Order your favourite meals — dine-in or delivered right to your door.
            </Text>

            {/* CTA buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('MenuScreen')}
                className="flex-1 bg-[#B8520B] py-3 rounded-2xl items-center flex-row justify-center"
              >
                <Ionicons name="restaurant-outline" size={16} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white font-black text-sm">Browse Menu</Text>
              </TouchableOpacity>

              {!user ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup')}
                  className="flex-1 bg-white/10 border border-white/20 py-3 rounded-2xl items-center flex-row justify-center"
                >
                  <Ionicons name="person-add-outline" size={16} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-white font-black text-sm">Sign Up</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('OrderHistoryScreen')}
                  className="flex-1 bg-white/10 border border-white/20 py-3 rounded-2xl items-center flex-row justify-center"
                >
                  <Ionicons name="receipt-outline" size={16} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-white font-black text-sm">My Orders</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ══ USER GREETING CARD (logged-in only) ═══════════════════════ */}
          {user && (
            <View className="mx-5 mt-4 bg-white rounded-2xl border border-[#EAE3DE] p-4 flex-row items-center shadow-xs">
              <View className="w-10 h-10 bg-[#B8520B]/10 rounded-2xl items-center justify-center mr-3 border border-[#B8520B]/20">
                <Ionicons name="person" size={18} color="#B8520B" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logged in as</Text>
                <Text className="text-sm font-black text-[#1F130D]" numberOfLines={1}>
                  {user.name || user.email}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleLogoutPress}
                className="flex-row items-center px-3 py-2 bg-[#FEF3EC] rounded-xl border border-[#B8520B]/30 active:bg-[#B8520B]/10"
              >
                <Ionicons name="log-out-outline" size={13} color="#B8520B" style={{ marginRight: 4 }} />
                <Text className="text-[10px] font-black text-[#B8520B]">Logout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ CATEGORIES ════════════════════════════════════════════════ */}
          <View className="px-5 mt-6">
            <Text className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
              Browse by Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => navigation.navigate('MenuScreen')}
                  className="items-center mr-4"
                >
                  <View className="w-14 h-14 bg-white rounded-2xl border-2 border-[#EAE3DE] items-center justify-center mb-1 shadow-xs">
                    <Ionicons name={cat.icon} size={22} color="#B8520B" />
                  </View>
                  <Text className="text-[10px] font-bold text-[#1F130D]">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ══ FEATURED DISHES ═══════════════════════════════════════════ */}
          <View className="px-5 mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Featured Dishes
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')}>
                <Text className="text-xs font-bold text-[#B8520B]">See All →</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="py-14 items-center">
                <ActivityIndicator size="large" color="#B8520B" />
              </View>
            ) : featuredItems.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="restaurant-outline" size={32} color="#B8520B" />
                <Text className="text-xs text-gray-400 mt-2 text-center">
                  No featured items right now.{'\n'}Tap "Browse Menu" to see everything.
                </Text>
              </View>
            ) : (
              featuredItems.map((item) => (
                <View
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#EAE3DE] mb-3 overflow-hidden shadow-xs"
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 96, height: 96, backgroundColor: '#F3F4F6' }}
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-3 justify-between">
                      <View>
                        <View className="flex-row justify-between items-start">
                          <Text
                            className="font-black text-sm text-[#1F130D] flex-1 pr-2"
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <View className="flex-row items-center bg-[#FEF7F3] px-1.5 py-0.5 rounded-full border border-[#B8520B]/20">
                            <Ionicons name="star" size={9} color="#B8520B" />
                            <Text className="text-[9px] font-black text-[#B8520B] ml-0.5">
                              {item.rating}
                            </Text>
                          </View>
                        </View>
                        {!!item.desc && (
                          <Text className="text-[10px] text-gray-400 mt-1" numberOfLines={2}>
                            {item.desc}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row justify-between items-center mt-2">
                        <Text className="font-black text-sm text-[#1F130D]">
                          ${item.price.toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleAddToCart(item)}
                          className="flex-row items-center bg-[#B8520B] px-3 py-1.5 rounded-xl"
                        >
                          <Ionicons name="add" size={12} color="white" />
                          <Text className="text-white text-[10px] font-black ml-1">Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ══ SIGN-UP PROMO CARD (guest only) ══════════════════════════ */}
          {!user && (
            <View className="mx-5 mt-4 mb-4 bg-[#1F130D] rounded-3xl p-5 relative overflow-hidden">
              <View className="absolute right-[-20] bottom-[-20] opacity-10">
                <Ionicons name="star" size={120} color="#B8520B" />
              </View>
              <Text className="text-[10px] font-black text-[#B8520B] uppercase tracking-widest mb-1">
                Create Account
              </Text>
              <Text className="text-white text-lg font-black mb-1">
                Join for Exclusive{'\n'}
                <Text className="text-[#B8520B]">Offers & Rewards 🎁</Text>
              </Text>
              <Text className="text-slate-400 text-xs mb-4 leading-relaxed">
                Sign up now and get priority order tracking, saved addresses, and exclusive member deals.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                className="bg-[#B8520B] py-3 rounded-2xl items-center"
              >
                <Text className="text-white font-black text-sm">Create Free Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ══ BOTTOM NAV BAR ════════════════════════════════════════════ */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          {/* Home — always active on this screen */}
          <View className="items-center">
            <Ionicons name="home" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Home</Text>
          </View>

          {/* Menu */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MenuScreen')}
            className="items-center"
          >
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>

          {/* Cart with badge */}
          <TouchableOpacity onPress={handleGoToCart} className="items-center relative">
            <Ionicons name="cart-outline" size={18} color="#757575" />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#B8520B] rounded-full items-center justify-center">
                <Text className="text-white text-[8px] font-black">{cartCount}</Text>
              </View>
            )}
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Cart</Text>
          </TouchableOpacity>

          {/* Orders / Sign In */}
          {user ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderHistoryScreen')}
              className="items-center"
            >
              <Ionicons name="receipt-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Orders</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="items-center"
            >
              <Ionicons name="log-in-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Sign In</Text>
            </TouchableOpacity>
          )}

          {/* Profile / Sign Up */}
          {user ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('CustomerProfileScreen')}
              className="items-center"
            >
              <Ionicons name="person-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="items-center"
            >
              <Ionicons name="person-add-outline" size={18} color="#757575" />
              <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ══ CUSTOM LOGOUT CONFIRMATION MODAL ═══════════════════════════ */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center px-8">
            <View className="w-full max-w-[320px] bg-white rounded-3xl p-6 items-center">
              {/* Icon badge */}
              <View className="w-14 h-14 bg-[#FEF3EC] rounded-2xl items-center justify-center mb-4 border border-[#B8520B]/20">
                <Ionicons name="log-out-outline" size={26} color="#B8520B" />
              </View>

              <Text className="text-lg font-black text-[#1F130D] mb-1 text-center">
                Log Out?
              </Text>
              <Text className="text-xs text-gray-400 text-center mb-6 leading-relaxed">
                Are you sure you want to logout of your account?
              </Text>

              <View className="flex-row w-full space-x-3">
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-2xl items-center border border-gray-200"
                >
                  <Text className="text-xs font-black text-gray-600">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={performLogout}
                  className="flex-1 bg-[#B8520B] py-3 rounded-2xl items-center"
                >
                  <Text className="text-xs font-black text-white">Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}