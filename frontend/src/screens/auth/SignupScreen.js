import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = 'http://localhost:5000';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleUser = await userInfoResponse.json();

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
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

      // Successfully authenticated with Google, navigate to customer landing
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerLanding' }],
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: 'customer',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      Alert.alert('Success', 'Account created successfully!');
      
      // Successfully created account manually, navigate to customer landing
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerLanding' }],
      });

    } catch (error) {
      Alert.alert('Signup Error', error.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-10 pb-20 px-6">
          
          <View className="items-center mb-6 mt-2">
            <View className="w-12 h-12 bg-orange-500/10 rounded-2xl items-center justify-center mb-2">
              <Ionicons name="restaurant" size={24} color="#F97316" />
            </View>
            <Text className="text-2xl font-black text-slate-900 tracking-wide">Create Account</Text>
            <Text className="text-xs font-bold text-slate-400 mt-1">Sign up to get started with DineFlow.</Text>
          </View>

          <View className="space-y-3 mb-5">
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Full Name</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="name@company.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Phone Number</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Password</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Confirm Password</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="w-full bg-[#B45309] py-4 rounded-2xl items-center shadow-lg shadow-orange-900/20 active:scale-95 mb-5"
          >
            <Text className="text-sm font-black text-white uppercase tracking-wider">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-3">
            <View className="flex-1 h-0.5 bg-slate-200" />
            <Text className="mx-3 text-[11px] font-bold text-slate-400 uppercase">Or continue with</Text>
            <View className="flex-1 h-0.5 bg-slate-200" />
          </View>

          <View className="mb-6">
            <TouchableOpacity
              disabled={!request || loading}
              onPress={() => promptAsync()}
              className="w-full bg-white py-3.5 rounded-2xl border-2 border-slate-200 flex-row items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text className="text-xs font-black text-slate-700">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center space-x-1 pb-4">
            <Text className="text-xs font-medium text-slate-500">Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-xs font-black text-[#B45309]">Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}