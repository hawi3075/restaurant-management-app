import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = 'http://localhost:5000'; 

export default function LoginScreen() {
  const authContext = useContext(AuthContext);
  // Safely fallback to a no-op function if context is not yet mounted to prevent type errors
  const login = authContext?.login || (() => {
    console.warn("AuthContext is missing or login function is not available.");
  });

  const [email, setEmail] = useState('manager@restaurant.com');
  const [password, setPassword] = useState('Manager123!');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [forgotStep, setForgotStep] = useState('email'); // 'email' or 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '801403267793-ktbmci8hevllseach2e5jn101dgpf4mc.apps.googleusercontent.com',
    useProxy: true,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleBackendAuth(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleBackendAuth = async (token) => {
    try {
      setIsLoading(true);
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleUser = await userInfoResponse.json();

      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          profileImage: googleUser.picture,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');

      if (data.token && data.user) {
        await login(data.token, data.user); 
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, username: cleanEmail, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials.');
        return;
      }

      if (data.token && data.user) {
        await login(data.token, data.user); 
      }

    } catch (error) {
      setIsLoading(false);
      console.error('Login Error:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please check your network and backend URL.');
    }
  };

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset instructions.');
      }

      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
      setForgotStep('reset'); 
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Server connection failed.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword) {
      Alert.alert('Error', 'Please enter both the reset token and your new password.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password/${resetToken.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      Alert.alert('Success', 'Your password has been successfully updated! Please sign in.');
      setIsForgotPassword(false);
      setForgotStep('email');
      setResetToken('');
      setNewPassword('');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Server connection failed.');
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl overflow-hidden border-x border-[#EAE3DE]">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Back Button Header */}
        <View className="px-6 pt-6 pb-2 z-10">
          <TouchableOpacity 
            onPress={() => {
              if (isForgotPassword) {
                if (forgotStep === 'reset') {
                  setForgotStep('email');
                } else {
                  setIsForgotPassword(false);
                }
              }
            }} 
            className="w-10 h-10 bg-white rounded-2xl items-center justify-center border border-[#EAE3DE] active:scale-95 shadow-xs"
          >
            <Ionicons name="arrow-back" size={20} color="#1F130D" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-4 px-6 pb-12">
          {/* Header Title */}
          <View className="items-center mb-6">
            <View className="w-12 h-12 bg-[#FEF7F3] rounded-2xl border border-[#B8520B]/30 items-center justify-center mb-3 shadow-xs">
              <Ionicons name={isForgotPassword ? "key-outline" : "restaurant"} size={24} color="#B8520B" />
            </View>
            <Text className="text-3xl font-black text-[#1F130D] mb-1">
              {isForgotPassword ? (forgotStep === 'email' ? 'Reset Password' : 'New Password') : 'Welcome Back'}
            </Text>
            <Text className="text-xs text-gray-500 text-center px-4">
              {isForgotPassword 
                ? (forgotStep === 'email' 
                    ? 'Enter your email address and we will send you instructions.' 
                    : 'Enter the reset token from your email and your new password.')
                : 'Sign in to manage staff, kitchen & deliveries'}
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-white p-6 rounded-3xl border border-[#EAE3DE] shadow-xs mb-6">
            
            {!isForgotPassword ? (
              <>
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

                {/* Password Field with Eye Icon */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Password</Text>
                  <View className="relative justify-center">
                    <TextInput 
                      placeholder="••••••••"
                      placeholderTextColor="#9E9E9E"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl pl-4 pr-12 py-3 text-xs text-[#1F130D]"
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 p-1"
                    >
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9E9E9E" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity onPress={() => { setIsForgotPassword(true); setForgotStep('email'); }} className="self-end mb-6">
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

                {/* Social Login (Google only) */}
                <TouchableOpacity 
                  disabled={!request || isLoading}
                  onPress={() => promptAsync()}
                  className="bg-[#F8F9FC] border border-[#EAE3DE] py-3.5 rounded-2xl items-center flex-row justify-center"
                >
                  <Ionicons name="logo-google" size={16} color="#EA4335" />
                  <Text className="text-xs font-bold text-[#1F130D] ml-2">Continue with Google</Text>
                </TouchableOpacity>
              </>
            ) : forgotStep === 'email' ? (
              <>
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

                <TouchableOpacity 
                  onPress={handleSendResetLink}
                  className={`bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md mb-4 mt-2 ${isLoading ? 'opacity-60' : 'active:opacity-90'}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-black text-xs">Send Reset Instructions</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setIsForgotPassword(false)}
                  className="items-center py-2"
                >
                  <Text className="text-xs font-bold text-gray-500">Remember your password? <Text className="text-[#B8520B]">Sign In</Text></Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="mb-4">
                  <Text className="text-xs font-bold text-[#1F130D] mb-1.5">Reset Token (from Email)</Text>
                  <TextInput 
                    placeholder="Paste 64-char token here"
                    placeholderTextColor="#9E9E9E"
                    value={resetToken}
                    onChangeText={setResetToken}
                    autoCapitalize="none"
                    className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl px-4 py-3 text-xs text-[#1F130D]"
                    editable={!isLoading}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-xs font-bold text-[#1F130D] mb-1.5">New Password</Text>
                  <View className="relative justify-center">
                    <TextInput 
                      placeholder="••••••••"
                      placeholderTextColor="#9E9E9E"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      className="bg-[#F8F9FC] border border-[#EAE3DE] rounded-2xl pl-4 pr-12 py-3 text-xs text-[#1F130D]"
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 p-1"
                    >
                      <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#9E9E9E" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={handleResetPassword}
                  className={`bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md mb-4 mt-2 ${isLoading ? 'opacity-60' : 'active:opacity-90'}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-black text-xs">Update Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setForgotStep('email')}
                  className="items-center py-2"
                >
                  <Text className="text-xs font-bold text-gray-500">Didn't receive token? <Text className="text-[#B8520B]">Resend</Text></Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </ScrollView>
      </View>
    </View>
  );
}