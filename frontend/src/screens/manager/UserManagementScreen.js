import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../api/backend';

export default function UserManagementScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${BACKEND_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        const mapped = data.map(u => ({
          ...u,
          id: String(u._id || u.id),
          status: u.active === false ? 'Inactive' : 'Active'
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error('Fetch users error', err);
      if (!isPolling) {
        Alert.alert('Error', 'Failed to load system users.');
      }
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id || u._id === id);
    if (!user) return;
    const newActive = !(user.active === true || user.status === 'Active');
    
    // Optimistic update
    setUsers(prev => prev.map(u => (u._id === id || u.id === id) ? { ...u, status: newActive ? 'Active' : 'Inactive', active: newActive } : u));
    
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newActive })
      });
      const j = await response.json();
      if (!response.ok || !j.success) {
        console.warn('Failed to update user active status', j);
        fetchUsers(true); // Revert on failure
      }
    } catch (err) {
      console.error('User update error', err);
      fetchUsers(true); // Revert on failure
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-slate-100">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Header */}
        <View className="pt-12 pb-4 px-6 bg-white border-b border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-slate-50 rounded-2xl border border-slate-200 items-center justify-center active:scale-95"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Administration</Text>
              <Text className="text-xl font-black text-slate-900">User Management</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => fetchUsers()}
            className="w-10 h-10 bg-orange-50 rounded-2xl border border-orange-200 items-center justify-center active:scale-95"
          >
            <Ionicons name="reload" size={18} color="#F97316" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5 pb-24">
          
          {/* Total Users Counter Card */}
          <View className="bg-orange-50 border border-orange-200/60 rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-xs">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-xl bg-orange-500 items-center justify-center shadow-sm">
                <Ionicons name="people" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Total System Users</Text>
                <Text className="text-lg font-black text-slate-900">{users.length} {users.length === 1 ? 'User' : 'Users'}</Text>
              </View>
            </View>
            <View className="bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-2xs">
              <Text className="text-[10px] font-extrabold text-orange-600">
                {filteredUsers.length} Shown
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-5 shadow-sm">
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput 
              placeholder="Search by name or email..." 
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-sm text-slate-900 font-medium"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* User Cards List */}
          {filteredUsers.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center mt-6 shadow-sm">
              <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center mb-3 border border-orange-100">
                <Ionicons name="search" size={28} color="#F97316" />
              </View>
              <Text className="text-sm font-bold text-slate-900 mb-1">No users found</Text>
              <Text className="text-xs text-slate-400 text-center">Try searching with a different name or email query.</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {filteredUsers.map((user) => (
                <View
                  key={user.id}
                  className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-3 relative overflow-hidden"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center space-x-3">
                      <View className="w-11 h-11 rounded-2xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
                        <Text className="font-black text-orange-600 text-base">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-base font-black text-slate-900">{user.name || 'Unnamed User'}</Text>
                        <Text className="text-xs text-slate-500 font-medium">{user.email || 'No Email'}</Text>
                      </View>
                    </View>

                    {/* View Details Icon Button */}
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedUser(user);
                        setModalVisible(true);
                      }}
                      className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 items-center justify-center shadow-sm active:scale-95"
                    >
                      <Ionicons name="eye-outline" size={18} color="#F97316" />
                    </TouchableOpacity>
                  </View>

                  {/* Tags & Action Status */}
                  <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <View className="flex-row space-x-2">
                      <View className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100">
                        <Text className="text-[10px] font-bold text-orange-600">{user.role || 'Customer'}</Text>
                      </View>
                      <View className={`px-2.5 py-1 rounded-lg ${user.status === 'Active' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                        <Text className={`text-[10px] font-bold ${user.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{user.status}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleStatus(user.id)}
                      className={`px-3 py-1.5 rounded-xl border ${user.status === 'Active' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}
                    >
                      <Text className={`text-xs font-bold ${user.status === 'Active' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* User Detail Info Modal */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-slate-100">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 items-center justify-center mb-3">
                  <Text className="font-black text-orange-600 text-2xl">
                    {selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text className="text-xl font-black text-slate-900">{selectedUser?.name || 'User Profile'}</Text>
                <Text className="text-xs font-bold text-orange-500 mt-0.5">{selectedUser?.role || 'Customer'}</Text>
              </View>

              <View className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-bold">Email Address:</Text>
                  <Text className="text-xs text-slate-900 font-bold">{selectedUser?.email || 'N/A'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-bold">Phone Number:</Text>
                  <Text className="text-xs text-slate-900 font-bold">{selectedUser?.phone || 'N/A'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-bold">Account Status:</Text>
                  <Text className={`text-xs font-bold ${selectedUser?.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedUser?.status || 'Active'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="w-full bg-slate-900 py-3.5 rounded-2xl items-center shadow-md"
              >
                <Text className="font-bold text-white text-sm">Close Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}