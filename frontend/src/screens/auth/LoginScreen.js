import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Set to localhost for your local web test
const BACKEND_URL = 'http://localhost:5000'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('manager@restaurant.com'); // Pre-filled for testing
  const [password, setPassword] = useState('Manager123!'); // Pre-filled for testing
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials.');
        return;
      }

      // --- LOGIN SUCCESS ---
      const targetScreen = data.navigateTo || 'CustomerLanding'; 
      
      console.log(`Login successful. Redirecting to: ${targetScreen}`);

      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen, params: { user: data.user, token: data.token } }],
      });

    } catch (error) {
      setIsLoading(false);
      console.error('Login Error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your network and backend URL.');
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-16 px-6 pb-24">
          {/* Header Title */}
          <View className="items-center mb-8">
            <View className="w-12 h-12 bg-[#FEF7F3] rounded-2xl border border-[#B8520B]/30 items-center justify-center mb-3 shadow-xs">
              <Ionicons name="restaurant" size={24} color="#B8520B" />
            </View>
            <Text className="text-3xl font-black text-[#1F130D] mb-1">Welcome Back</Text>
            <Text className="text-xs text-gray-500">Sign in to manage staff, kitchen & deliveries</Text>
          </View>

          {/* Form Container */}
          <View className="bg-white p-6 rounded-3xl border border-[#EAE3DE] shadow-xs mb-6">
            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Email Address</Text>
              <TextInput 
                placeholder="manager@restaurant.com"
                placeholderTextColor="#9E9E9E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl px-4 py-3 text-xs text-[#1F130D]"
                editable={!isLoading}
              />
            </View>

            {/* Password Field */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Password</Text>
              <TextInput 
                placeholder="••••••••"
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl px-4 py-3 text-xs text-[#1F130D]"
                editable={!isLoading}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-[11px] font-bold text-[#B8520B]">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              className={`bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md mb-4 ${isLoading ? 'opacity-60' : 'active:opacity-90'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-black text-xs">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-[#EAE3DE]" />
              <Text className="mx-3 text-[10px] text-gray-400 font-semibold">Or continue with</Text>
              <View className="flex-1 h-[1px] bg-[#EAE3DE]" />
            </View>

            {/* Social Logins */}
            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1 bg-[#F8F9FC] border border-[#EAE3DE] py-3 rounded-2xl items-center flex-row justify-center">
                <Ionicons name="logo-google" size={16} color="#1F130D" />
                <Text className="text-xs font-bold text-[#1F130D] ml-2">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-[#F8F9FC] border border-[#EAE3DE] py-3 rounded-2xl items-center flex-row justify-center">
                <Ionicons name="logo-apple" size={16} color="#1F130D" />
                <Text className="text-xs font-bold text-[#1F130D] ml-2">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch to Signup */}
          <View className="flex-row justify-center items-center">
            <Text className="text-xs text-gray-500">Need to create an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-xs font-bold text-[#B8520B]">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-around items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding')} className="items-center">
            <Ionicons name="home-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')} className="items-center">
            <Ionicons name="restaurant-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="items-center">
            <Ionicons name="person" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Staff Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}