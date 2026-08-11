import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';

// Updated with your actual Render backend URL
const API_URL = 'https://restaurant-management-app-wqmp.onrender.com';

export default function ManagerProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const authContext = useContext(AuthContext);

  const handlePickImage = async () => {
    if (!isEditing) return; // Only allow picking image when in edit mode

    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setProfileImage(pickerResult.assets[0].uri);
    }
  };

  const handleSave = () => {
    // save to backend
    fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    }).then(r => r.json()).then(j => {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }).catch(err => {
      console.error('Profile update error', err);
      Alert.alert('Error', 'Failed to update profile');
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/profile`);
        const j = await res.json();
        if (j.success && j.user) {
          setName(j.user.name || '');
          setEmail(j.user.email || '');
          setPhone(j.user.phone || '');
        }
      } catch (err) {
        console.error('Fetch profile error', err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-10 pb-24 px-5">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-11 h-11 bg-slate-50 rounded-2xl border-2 border-slate-200 items-center justify-center shadow-md active:scale-95"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-slate-900">Manager Profile</Text>
            <TouchableOpacity 
              onPress={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="px-4 py-2 bg-orange-500/10 rounded-xl border-2 border-orange-500/20 active:scale-95"
            >
              <Text className="text-xs font-black text-orange-500">{isEditing ? 'Save' : 'Edit Profile'}</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 items-center mb-6 shadow-md">
            <TouchableOpacity 
              onPress={handlePickImage}
              disabled={!isEditing} 
              className="relative w-28 h-28 rounded-full bg-orange-500/10 items-center justify-center border-2 border-orange-500/30 mb-4 shadow-sm overflow-hidden"
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full rounded-full" />
              ) : (
                <Ionicons name="person" size={48} color="#F97316" />
              )}
              
              {isEditing && (
                <View className="absolute bottom-0 right-0 bg-orange-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-md">
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {isEditing ? (
              <View className="w-full space-y-3">
                <View>
                  <Text className="text-[10px] font-black text-slate-400 uppercase mb-1">Full Name</Text>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-black text-slate-400 uppercase mb-1">Email Address</Text>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-black text-slate-400 uppercase mb-1">Phone Number</Text>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xl font-black text-slate-900 mb-1">{name}</Text>
                <Text className="text-xs font-semibold text-slate-500 mb-0.5">{email}</Text>
                <Text className="text-xs font-bold text-orange-500">{phone}</Text>
              </View>
            )}
          </View>

          {/* Logout Option */}
          <TouchableOpacity
            onPress={async () => {
              try {
                await authContext.logout();
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              } catch (err) {
                console.error('Logout navigation error', err);
                navigation.navigate('Login');
              }
            }}
            className="bg-red-50 p-4 rounded-3xl border-2 border-red-100 flex-row items-center justify-between shadow-md active:scale-95"
          >
            <View className="flex-row items-center space-x-3.5">
              <View className="w-10 h-10 rounded-2xl bg-red-500/10 items-center justify-center border-2 border-red-500/20">
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <Text className="text-sm font-black text-red-600">Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}