import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 px-6 pb-24">
          <View className="items-center mb-6">
            <View className="w-12 h-12 bg-[#FEF7F3] rounded-2xl border border-[#B8520B]/30 items-center justify-center mb-3 shadow-xs">
              <Ionicons name="person-add" size={22} color="#B8520B" />
            </View>
            <Text className="text-3xl font-black text-[#1F130D] mb-1">Create Account</Text>
            <Text className="text-xs text-gray-500">Sign up to get started with delicious dining</Text>
          </View>

          <View className="bg-white p-6 rounded-3xl border border-[#EAE3DE] shadow-xs mb-6">
            <View className="mb-4">
              <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Full Name</Text>
              <TextInput 
                placeholder="John Doe"
                placeholderTextColor="#9E9E9E"
                value={fullName}
                onChangeText={setFullName}
                className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl px-4 py-3 text-xs text-[#1F130D]"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Email Address</Text>
              <TextInput 
                placeholder="name@company.com"
                placeholderTextColor="#9E9E9E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl px-4 py-3 text-xs text-[#1F130D]"
              />
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Password</Text>
              <TextInput 
                placeholder="••••••••"
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl px-4 py-3 text-xs text-[#1F130D]"
              />
            </View>

            {/* Redirects to CustomerLanding with isLoggedIn flag set to true */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('CustomerLanding', { isLoggedIn: true })}
              className="bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md active:opacity-90 mb-4"
            >
              <Text className="text-white font-black text-xs">Create Account</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center">
            <Text className="text-xs text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-xs font-bold text-[#B8520B]">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-between items-center shadow-lg">
          <TouchableOpacity onPress={() => navigation.navigate('CustomerLanding', { isLoggedIn: false })} className="items-center">
            <Ionicons name="home-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Home</Text>
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
            <Ionicons name="notifications-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="items-center">
            <Ionicons name="person-add" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}