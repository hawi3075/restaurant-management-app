import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([
    { id: 1, name: 'Hawi Girma', email: 'hawig3521@gmail.com', role: 'Customer', status: 'Active' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'Customer', status: 'Active' },
    { id: 3, name: 'Daniel Kebede', email: 'daniel@example.com', role: 'VIP Customer', status: 'Inactive' },
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => user.id === id ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } : user));
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-3">
              <Ionicons name="arrow-back" size={18} color="#1F130D" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-[#1F130D]">User Management</Text>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white border border-[#EAE3DE] rounded-2xl px-4 py-2 mb-5 shadow-xs">
            <Ionicons name="search-outline" size={16} color="#757575" style={{ marginRight: 8 }} />
            <TextInput placeholder="Search customers..." placeholderTextColor="#9E9E9E" className="flex-1 text-xs text-[#1F130D]" />
          </View>

          {/* Users List */}
          <div className="space-y-3">
            {users.map((item) => (
              <View key={item.id} className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-3 shadow-xs flex-row justify-between items-center">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-black text-[#1F130D]">{item.name}</Text>
                  <Text className="text-[10px] text-gray-400 mb-1">{item.email}</Text>
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-[9px] font-bold bg-[#FEF7F3] text-[#B8520B] px-2 py-0.5 rounded-full">{item.role}</Text>
                    <Text className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{item.status}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => toggleUserStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl border ${item.status === 'Active' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
                >
                  <Text className={`text-[10px] font-bold ${item.status === 'Active' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </div>

        </ScrollView>
      </View>
    </View>
  );
}