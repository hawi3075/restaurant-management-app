import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManagerProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Hawi Girma');
  const [email, setEmail] = useState('manager@restaurant.com');
  const [phone, setPhone] = useState('+251 91 234 5678');

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-slate-100">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 bg-slate-50 rounded-2xl border border-slate-200 items-center justify-center shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-slate-900">Manager Profile</Text>
            <TouchableOpacity 
              onPress={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20"
            >
              <Text className="text-xs font-black text-orange-500">{isEditing ? 'Save' : 'Edit Profile'}</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Card (Name, Email, Phone, Image only) */}
          <View className="bg-slate-50 p-6 rounded-3xl border border-slate-100 items-center mb-6 shadow-sm">
            <TouchableOpacity 
              disabled={!isEditing} 
              className="relative w-24 h-24 rounded-full bg-orange-500/10 items-center justify-center border-2 border-orange-500/30 mb-4 shadow-sm"
            >
              <Ionicons name="person" size={40} color="#F97316" />
              {isEditing && (
                <View className="absolute bottom-0 right-0 bg-orange-500 w-7 h-7 rounded-full items-center justify-center border-2 border-white shadow">
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {isEditing ? (
              <View className="w-full space-y-3">
                <View>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</Text>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-bold text-sm"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</Text>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-bold text-sm"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</Text>
                  <TextInput
                    className="w-full bg-white px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-bold text-sm"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xl font-black text-slate-900 mb-1">{name}</Text>
                <Text className="text-xs font-medium text-slate-500 mb-0.5">{email}</Text>
                <Text className="text-xs font-semibold text-orange-500">{phone}</Text>
              </View>
            )}
          </View>

          {/* Logout Option */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-red-50 p-4 rounded-3xl border border-red-100 flex-row items-center justify-between shadow-sm"
          >
            <View className="flex-row items-center space-x-3.5">
              <View className="w-10 h-10 rounded-2xl bg-red-500/10 items-center justify-center border border-red-500/20">
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