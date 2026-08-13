import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../api/backend';

export default function CustomerLandingScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading]        = useState(true);
  const [cartCount, setCartCount]        = useState(0);
  const [successItemHoverId, setSuccessItemHoverId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm]   = useState(false);
  
  // Auth warning modal state for checkout
  const [showAuthWarning, setShowAuthWarning]       = useState(false);

  // ── Reviews (inline panel) state ───────────────────────────────────────
  const [expandedReviewsId, setExpandedReviewsId] = useState(null);
  const [reviewsData, setReviewsData] = useState({}); // { [itemId]: { loading, items } }

  const categories = [
    { 
      name: 'Breakfast', 
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=300&q=80' 
    },
    { 
      name: 'Lunch',     
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80' 
    },
    { 
      name: 'Dinner',    
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' 
    },
    { 
      name: 'Fast Food', 
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' 
    },
    { 
      name: 'Drinks',    
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80' 
    },
    { 
      name: 'Desserts',  
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80' 
    },
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

      const fallbackImages = [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=400&q=80'
      ];

      // Same image-resolution logic as MenuScreen: handles item.image OR
      // item.imageUrl, base64 data URIs, full URLs, and relative backend
      // paths — instead of only trusting item.image + a leading "http".
      const formatted = raw.slice(0, 6).map((item, i) => {
        let imageUrl = item.image || item.imageUrl;

        if (imageUrl) {
          if (imageUrl.startsWith('data:image')) {
            // base64 data URI — use as is
          } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // already a full URL — use as is
          } else {
            // relative path from the backend — qualify it
            imageUrl = `${BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
        } else {
          imageUrl = fallbackImages[i % fallbackImages.length];
        }

        return {
          id:    item._id || item.id || i,
          name:   item.name || 'Delicious Dish',
          price:  item.price || 15.00,
          rating: item.rating?.toString() || '4.8',
          desc:   item.description || item.desc || '',
          // Extra manager-uploaded details, so FoodDetailScreen actually
          // has something to show instead of blank fields.
          ingredients:  item.ingredients || item.ingredientList || '',
          cookingStyle: item.cookingStyle || item.style || '',
          spicyLevel:   item.spicyLevel || item.spice || '',
          image: imageUrl,
        };
      });
      setFeaturedItems(formatted);
    } catch (e) {
      console.error('Landing fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Cart & Navigation helpers ─────────────────────────────────────────────
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

      setSuccessItemHoverId(item.id);
      setTimeout(() => {
        setSuccessItemHoverId((currentId) => (currentId === item.id ? null : currentId));
      }, 1800);

    } catch (e) {
      console.error('Add to cart error:', e);
    }
  };

  const handleGoToCart = () => {
    navigation.navigate('CartScreen');
  };

  const handleGoToCheckout = (item) => {
    // Check if user is logged in before proceeding to checkout
    if (!user) {
      setShowAuthWarning(true);
      return;
    }
    navigation.navigate('CheckoutScreen', { item });
  };

  const handleGoToDetails = (item) => {
    // FoodDetailScreen reads route.params.foodItem, not route.params.item —
    // this was silently sending the item under the wrong key.
    navigation.navigate('FoodDetailScreen', { foodItem: item });
  };

  // ── Inline reviews toggle ─────────────────────────────────────────────
  const handleToggleReviews = async (item) => {
    const isOpen = expandedReviewsId === item.id;

    if (isOpen) {
      setExpandedReviewsId(null);
      return;
    }

    setExpandedReviewsId(item.id);

    if (!reviewsData[item.id]) {
      setReviewsData(prev => ({ ...prev, [item.id]: { loading: true, items: [] } }));
      try {
        const res  = await fetch(`${BACKEND_URL}/api/reviews?itemId=${item.id}`);
        const data = await res.json();
        const list = data.reviews || data.items || data || [];
        setReviewsData(prev => ({ ...prev, [item.id]: { loading: false, items: list } }));
      } catch (e) {
        console.error('Reviews fetch error:', e);
        setReviewsData(prev => ({ ...prev, [item.id]: { loading: false, items: [] } }));
      }
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const performLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
    } catch (err) {
      console.error('Logout execution error:', err);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 relative shadow-2xl">
        <StatusBar barStyle="light-content" backgroundColor="#1F130D" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">

          {/* ══ HERO ══════════════════════════════════════════════════════ */}
          <View className="bg-[#1F130D] px-5 pt-12 pb-8 relative overflow-hidden">
            <View className="absolute right-[-30] top-[-20] opacity-10">
              <Ionicons name="restaurant" size={190} color="#B8520B" />
            </View>

            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-[10px] font-black text-[#B8520B] uppercase tracking-widest">
                  Welcome to
                </Text>
                <Text className="text-xl font-black text-white">ROMS Restaurant 🍽️</Text>
              </View>

              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={handleGoToCart}
                  className="w-10 h-10 bg-[#B8520B]/20 rounded-2xl items-center justify-center border border-[#B8520B]/40 relative"
                  title="Cart"
                >
                  <Ionicons name="cart-outline" size={20} color="#B8520B" />
                  {cartCount > 0 && (
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-[#B8520B] rounded-full items-center justify-center">
                      <Text className="text-white text-[9px] font-black">{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

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

            <Text className="text-3xl font-black text-white leading-tight mb-2">
              Fresh Food,{'\n'}
              <Text className="text-[#B8520B]">Fast Delivery</Text>
            </Text>
            <Text className="text-slate-400 text-xs font-medium mb-5 leading-relaxed">
              Order your favourite meals — dine-in or delivered right to your door.
            </Text>

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

          {/* ══ USER GREETING CARD ═══════════════════════════════════════ */}
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
                  <View className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#EAE3DE] mb-1 shadow-xs">
                    <Image source={{ uri: cat.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <Text className="text-[10px] font-bold text-[#1F130D]">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ══ FEATURED DISHES ══════════════════════════════════════════ */}
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
              <View className="flex-row flex-wrap justify-between">
                {featuredItems.map((item) => {
                  const isAddedSuccessfully = successItemHoverId === item.id;
                  const isReviewsOpen = expandedReviewsId === item.id;
                  const itemReviews = reviewsData[item.id];

                  return (
                    <View
                      key={item.id}
                      className="w-[48%] bg-white rounded-2xl border border-[#EAE3DE] mb-3 overflow-hidden shadow-xs"
                    >
                      <TouchableOpacity 
                        onPress={() => handleGoToDetails(item)}
                        className="relative w-full h-28 bg-[#F3F4F6]"
                      >
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />

                        {isAddedSuccessfully && (
                          <View className="absolute inset-0 bg-[#1F130D]/85 items-center justify-center p-2">
                            <Ionicons name="checkmark-circle" size={24} color="#B8520B" style={{ marginBottom: 2 }} />
                            <Text className="text-[10px] font-black text-white text-center leading-tight">
                              Added to Cart Successfully!
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <View className="p-3 justify-between flex-1">
                        <View>
                          <View className="flex-row justify-between items-start mb-1">
                            <TouchableOpacity 
                              onPress={() => handleGoToDetails(item)}
                              className="flex-1 pr-1"
                            >
                              <Text
                                className="font-black text-xs text-[#1F130D]"
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                              onPress={() => handleToggleReviews(item)}
                              className="flex-row items-center bg-[#FEF7F3] px-1.5 py-0.5 rounded-full border border-[#B8520B]/20"
                            >
                              <Ionicons name="star" size={8} color="#B8520B" />
                              <Text className="text-[8px] font-black text-[#B8520B] ml-0.5">
                                {item.rating}
                              </Text>
                              <Ionicons name="chatbubble-outline" size={8} color="#B8520B" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                          </View>

                          {!!item.desc && (
                            <Text className="text-[10px] text-gray-400 mb-2" numberOfLines={2}>
                              {item.desc}
                            </Text>
                          )}
                        </View>

                        <View className="mt-auto pt-1">
                          <View className="flex-row justify-between items-center mb-1.5">
                            <Text className="font-black text-xs text-[#1F130D]">
                              ${item.price.toFixed(2)}
                            </Text>

                            <View className="flex-row items-center space-x-1">
                              <TouchableOpacity
                                onPress={() => handleGoToDetails(item)}
                                className="w-7 h-7 bg-[#FEF7F3] border border-[#B8520B]/30 rounded-xl items-center justify-center"
                                title="View Details"
                              >
                                <Ionicons name="eye-outline" size={13} color="#B8520B" />
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => handleAddToCart(item)}
                                className="w-7 h-7 bg-[#B8520B] rounded-xl items-center justify-center"
                                title="Add to Cart"
                              >
                                <Ionicons name="cart" size={13} color="white" />
                              </TouchableOpacity>

                              <TouchableOpacity
                                onPress={() => handleToggleReviews(item)}
                                className="w-7 h-7 bg-[#FEF7F3] border border-[#B8520B]/30 rounded-xl items-center justify-center"
                                title="Customer Reviews"
                              >
                                <Ionicons
                                  name={isReviewsOpen ? 'chatbubbles' : 'chatbubbles-outline'}
                                  size={13}
                                  color="#B8520B"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Checkout Button */}
                          <TouchableOpacity
                            onPress={() => handleGoToCheckout(item)}
                            className="w-full bg-[#1F130D] py-1.5 rounded-xl flex-row items-center justify-center space-x-1 border border-[#B8520B]/40"
                            title="Checkout Now"
                          >
                            <Ionicons name="flash-outline" size={11} color="#B8520B" />
                            <Text className="text-[10px] font-black text-white">Checkout Now</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* INLINE REVIEWS PANEL */}
                      {isReviewsOpen && (
                        <View className="border-t border-[#EAE3DE] bg-[#FAFAFA] p-3">
                          {itemReviews?.loading ? (
                            <View className="py-3 items-center">
                              <ActivityIndicator size="small" color="#B8520B" />
                            </View>
                          ) : itemReviews?.items?.length ? (
                            itemReviews.items.map((rev, idx) => (
                              <View
                                key={rev._id || rev.id || idx}
                                className="mb-2 pb-2 border-b border-[#EAE3DE]"
                              >
                                <View className="flex-row items-center mb-0.5">
                                  <Ionicons name="star" size={10} color="#B8520B" />
                                  <Text className="text-[10px] font-black text-[#1F130D] ml-1">
                                    {rev.rating || '—'} {rev.author ? `· ${rev.author}` : ''}
                                  </Text>
                                </View>
                                <Text className="text-[10px] text-gray-500" numberOfLines={3}>
                                  {rev.comment || rev.text || ''}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text className="text-[10px] text-gray-400 text-center py-1">
                              No reviews yet.
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ══ SIGN-UP PROMO CARD ═══════════════════════════════════════ */}
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

        {/* ══ SIGN IN REQUIRED MODAL FOR CHECKOUT ════════════════════ */}
        {showAuthWarning && (
          <View className="absolute inset-0 bg-black/70 z-50 items-center justify-center p-5">
            <View className="w-full max-w-xs bg-[#1F130D] border border-[#B8520B]/40 rounded-3xl p-6 items-center shadow-2xl">
              <View className="w-12 h-12 bg-[#B8520B]/20 rounded-2xl items-center justify-center mb-3 border border-[#B8520B]/40">
                <Ionicons name="lock-closed-outline" size={24} color="#B8520B" />
              </View>
              <Text className="text-white text-base font-black mb-1 text-center">Please Sign In</Text>
              <Text className="text-slate-400 text-xs text-center mb-5 leading-relaxed">
                You need to sign in or log in before you can proceed to checkout.
              </Text>
              <View className="flex-row space-x-3 w-full">
                <TouchableOpacity
                  onPress={() => setShowAuthWarning(false)}
                  className="flex-1 bg-white/10 py-2.5 rounded-xl items-center border border-white/20"
                >
                  <Text className="text-white text-xs font-black">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAuthWarning(false);
                    navigation.navigate('Login');
                  }}
                  className="flex-1 bg-[#B8520B] py-2.5 rounded-xl items-center"
                >
                  <Text className="text-white text-xs font-black">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ══ LOGOUT CONFIRMATION CUSTOM MODAL ════════════════════════ */}
        {showLogoutConfirm && (
          <View className="absolute inset-0 bg-black/70 z-50 items-center justify-center p-5">
            <View className="w-full max-w-xs bg-[#1F130D] border border-[#B8520B]/40 rounded-3xl p-6 items-center shadow-2xl">
              <View className="w-12 h-12 bg-[#B8520B]/20 rounded-2xl items-center justify-center mb-3 border border-[#B8520B]/40">
                <Ionicons name="log-out-outline" size={24} color="#B8520B" />
              </View>
              <Text className="text-white text-base font-black mb-1 text-center">Confirm Logout</Text>
              <Text className="text-slate-400 text-xs text-center mb-5 leading-relaxed">
                Are you sure you want to logout from your account?
              </Text>
              <View className="flex-row space-x-3 w-full">
                <TouchableOpacity
                  onPress={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-white/10 py-2.5 rounded-xl items-center border border-white/20"
                >
                  <Text className="text-white text-xs font-black">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowLogoutConfirm(false);
                    performLogout();
                  }}
                  className="flex-1 bg-[#B8520B] py-2.5 rounded-xl items-center"
                >
                  <Text className="text-white text-xs font-black">Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ══ BOTTOM NAV BAR ════════════════════════════════════════════ */}
        {/* Order fixed to match MenuScreen / CartScreen: Home, Orders, Menu, Cart, Profile */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <View className="items-center">
            <Ionicons name="home" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Home</Text>
          </View>

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

          <TouchableOpacity
            onPress={() => navigation.navigate('MenuScreen')}
            className="items-center"
          >
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGoToCart} className="items-center relative">
            <Ionicons name="cart-outline" size={18} color="#757575" />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#B8520B] rounded-full items-center justify-center">
                <Text className="text-white text-[8px] font-black">{cartCount}</Text>
              </View>
            )}
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Cart</Text>
          </TouchableOpacity>

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
      </View>
    </View>
  );
}