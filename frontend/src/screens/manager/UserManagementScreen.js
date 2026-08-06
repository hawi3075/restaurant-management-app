import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [users, setUsers] = useState([
    { id: '1', name: 'Hawi Girma', email: 'hawig3521@gmail.com', phone: '+251 91 234 5678', role: 'Customer', status: 'Active' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah@example.com', phone: '+1 555 019 2834', role: 'Customer', status: 'Active' },
    { id: '3', name: 'Daniel Kebede', email: 'daniel@example.com', phone: '+251 92 876 5432', role: 'VIP Customer', status: 'Inactive' },
  ]);

  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5 pb-24">
          
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
          <View className="space-y-3">
            {filteredUsers.map((user) => (
              <View
                key={user.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-3 relative overflow-hidden"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-11 h-11 rounded-2xl bg-orange-500/10 items-center justify-center border border-orange-500/20">
                      <Text className="font-black text-orange-600 text-base">{user.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-black text-slate-900">{user.name}</Text>
                      <Text className="text-xs text-slate-500 font-medium">{user.email}</Text>
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
                      <Text className="text-[10px] font-bold text-orange-600">{user.role}</Text>
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
        </ScrollView>

        {/* User Detail Info Modal */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-slate-100">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 items-center justify-center mb-3">
                  <Text className="font-black text-orange-600 text-2xl">{selectedUser?.name.charAt(0)}</Text>
                </View>
                <Text className="text-xl font-black text-slate-900">{selectedUser?.name}</Text>
                <Text className="text-xs font-bold text-orange-500 mt-0.5">{selectedUser?.role}</Text>
              </View>

              <View className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-bold">Email Address:</Text>
                  <Text className="text-xs text-slate-900 font-bold">{selectedUser?.email}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-bold">Phone Number:</Text>
                  <Text className="text-xs text-slate-900 font-bold">{selectedUser?.phone}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-slate-500 font-bold">Account Status:</Text>
                  <Text className={`text-xs font-bold ${selectedUser?.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedUser?.status}</Text>
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