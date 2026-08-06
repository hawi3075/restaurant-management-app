import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext); // Optional: to auto-login after signup

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Connect to your backend signup endpoint
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: 'customer' // default role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      Alert.alert('Success', 'Account created successfully!');
      
      // Navigate to login or automatically log them in
      navigation.navigate('Login');

    } catch (error) {
      Alert.alert('Signup Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-6">
          
          <View className="mb-8 mt-4">
            <Text className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Get Started</Text>
            <Text className="text-3xl font-black text-slate-900 tracking-wide mt-1">Create Account</Text>
            <Text className="text-xs font-medium text-slate-500 mt-1">Sign up to start ordering delicious food</Text>
          </View>

          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Full Name</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="Hawi Girma"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email Address</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="hawig3521@gmail.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="+251 91 234 5678"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Password</Text>
              <TextInput
                className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-500/30 active:scale-95 mb-6"
          >
            <Text className="text-sm font-black text-white uppercase tracking-wider">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center space-x-1">
            <Text className="text-xs font-medium text-slate-500">Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-xs font-black text-orange-500">Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}