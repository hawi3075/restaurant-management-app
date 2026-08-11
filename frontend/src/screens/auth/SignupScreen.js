import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../api/backend';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  
  // State for center popup modal success/warning handling
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { message: 'Server error or invalid response format.' };
      }
      
      if (!res.ok) {
        setIsSuccess(false);
        setModalMessage(data.message || 'Google authentication failed');
        setModalVisible(true);
        return;
      }

      if (data.token && data.user) {
        const routeToRole = {
          ManagerDashboard: 'manager',
          KitchenDashboard: 'kitchen',
          WaiterDashboard: 'waiter',
          DriverDashboard: 'driver',
          CustomerLanding: 'customer'
        };
        const inferredRole = (data.user && data.user.role) ? data.user.role : (routeToRole[data.navigateTo] || 'customer');
        const userWithRole = Object.assign({}, data.user, { role: inferredRole });
        await login(data.token, userWithRole);
      }

      setModalVisible(false);
      setLoading(false);
      return;

    } catch (error) {
      setIsSuccess(false);
      setModalMessage('Network error or server is offline.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setIsSuccess(false);
      setModalMessage('Please fill in all required fields.');
      setModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setIsSuccess(false);
      setModalMessage('Passwords do not match.');
      setModalVisible(true);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role: 'customer',
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }

      if (!response.ok) {
        setIsSuccess(false);
        setModalMessage(data.message || 'Registration failed.');
        setModalVisible(true);
        setLoading(false);
        return;
      }

      if (data.token && data.user) {
        const routeToRole = {
          ManagerDashboard: 'manager',
          KitchenDashboard: 'kitchen',
          WaiterDashboard: 'waiter',
          DriverDashboard: 'driver',
          CustomerLanding: 'customer'
        };
        const inferredRole = (data.user && data.user.role) ? data.user.role : (routeToRole[data.navigateTo] || 'customer');
        const userWithRole = Object.assign({}, data.user, { role: inferredRole });
        await login(data.token, userWithRole);
      }

    } catch (error) {
      setIsSuccess(false);
      setModalMessage('Network error or server is offline.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center p-2">
      <View className="w-full max-w-[390px] h-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Back Button Header */}
        <View className="px-4 pt-2 pb-1 z-10">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-8 h-8 bg-slate-100 rounded-xl items-center justify-center border border-slate-200 active:scale-95"
          >
            <Ionicons name="arrow-back" size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={true} className="px-4 pt-0.5 pb-6">
          
          <View className="items-center mb-3">
            <View className="w-9 h-9 bg-orange-500/10 rounded-xl items-center justify-center mb-0.5">
              <Ionicons name="restaurant" size={18} color="#F97316" />
            </View>
            <Text className="text-lg font-black text-slate-900 tracking-wide">Create Account</Text>
            <Text className="text-[10px] font-bold text-slate-400">Sign up to get started with DineFlow.</Text>
          </View>

          <View className="space-y-2 mb-3">
            <View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Full Name</Text>
              <TextInput
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-xs"
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Email Address</Text>
              <TextInput
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-xs"
                placeholder="name@company.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</Text>
              <TextInput
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-xs"
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full bg-slate-50 pl-3 pr-9 py-2 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-xs"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1"
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Confirm Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full bg-slate-50 pl-3 pr-9 py-2 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-xs"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 p-1"
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="w-full bg-[#B45309] py-2.5 rounded-xl items-center shadow-md shadow-orange-900/20 active:scale-95 mb-2.5"
          >
            <Text className="text-xs font-black text-white uppercase tracking-wider">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-1.5">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="mx-2 text-[9px] font-bold text-slate-400 uppercase">Or continue with</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <View className="mb-3">
            <TouchableOpacity
              disabled={!request || loading}
              onPress={() => promptAsync()}
              className="w-full bg-white py-2 rounded-xl border-2 border-slate-200 flex-row items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
              <Ionicons name="logo-google" size={15} color="#EA4335" />
              <Text className="text-[11px] font-black text-slate-700">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center space-x-1 pb-4">
            <Text className="text-[10px] font-medium text-slate-500">Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[10px] font-black text-[#B45309]">Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* Center Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <View className="bg-white w-full max-w-[280px] p-5 rounded-3xl items-center shadow-2xl border border-slate-100">
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
              <Ionicons 
                name={isSuccess ? "checkmark-circle" : "alert-circle"} 
                size={24} 
                color={isSuccess ? "#22C55E" : "#EF4444"} 
              />
            </View>
            <Text className="text-base font-black text-slate-900 mb-1 text-center">
              {isSuccess ? 'Success' : 'Notice'}
            </Text>
            <Text className="text-xs font-bold text-slate-500 text-center mb-5">{modalMessage}</Text>
            <TouchableOpacity
              onPress={handleModalClose}
              className="w-full bg-[#B45309] py-3 rounded-xl items-center shadow-md active:scale-95"
            >
              <Text className="text-xs font-black text-white uppercase tracking-wider">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}