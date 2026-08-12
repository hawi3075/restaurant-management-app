import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../api/backend';

const API_URL = BACKEND_URL;

export default function UserManagementScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states for editing user or roles
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server returned non-JSON response (Status ${response.status}). Please check backend routes.`);
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch users.');

      // Backend returns a plain array from User.find(); fall back to
      // data.users / data.data in case the response shape ever changes.
      setUsers(Array.isArray(data) ? data : (data.users || data.data || []));
    } catch (error) {
      console.error('Fetch Users Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setName(user.name || '');
    setEmail(user.email || '');
    setRole(user.role || 'customer');
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, role })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response during update.');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update user.');

      Alert.alert('Success', 'User updated successfully!');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete._id;

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response during deletion.');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete user.');

      Alert.alert('Success', 'User deleted successfully.');
      setDeleteModalVisible(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.message);
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading && users.length === 0) {
    return (
      <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
        <ActivityIndicator size="large" color="#B8520B" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={20} color="#1F130D" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-[#1F130D]">User Management</Text>
          </View>
          <TouchableOpacity onPress={fetchUsers}>
            <Ionicons name="refresh-outline" size={20} color="#B8520B" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-5 pt-4 pb-2">
          <View className="bg-white flex-row items-center px-3 py-2.5 rounded-2xl border border-[#EAE3DE]">
            <Ionicons name="search" size={16} color="#9E9E9E" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-xs text-[#1F130D]"
              placeholder="Search by name or email..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Users List */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-2 pb-24">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">
            Registered Users ({filteredUsers.length})
          </Text>

          {filteredUsers.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl border border-[#EAE3DE] items-center mt-4">
              <Ionicons name="people-outline" size={36} color="#9E9E9E" style={{ marginBottom: 8 }} />
              <Text className="text-xs font-bold text-[#1F130D] mb-1">No users found</Text>
              <Text className="text-[11px] text-gray-500 text-center">Try searching with a different term.</Text>
            </View>
          ) : (
            filteredUsers.map((item) => (
              <View key={item._id} className="bg-white p-4 rounded-2xl border border-[#EAE3DE] mb-3 shadow-xs">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-9 h-9 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-3">
                      <Ionicons name="person" size={16} color="#B8520B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-black text-[#1F130D]" numberOfLines={1}>{item.name || 'No Name'}</Text>
                      <Text className="text-[11px] text-gray-400" numberOfLines={1}>{item.email}</Text>
                    </View>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-[#FEF7F3] border border-[#B8520B]/20">
                    <Text className="text-[10px] font-bold text-[#B8520B] capitalize">{item.role || 'customer'}</Text>
                  </View>
                </View>

                <View className="flex-row justify-end space-x-2 pt-2 border-t border-[#F8F9FC]">
                  <TouchableOpacity 
                    onPress={() => handleOpenEdit(item)}
                    className="px-3 py-1.5 bg-gray-100 rounded-xl flex-row items-center mr-2"
                  >
                    <Ionicons name="create-outline" size={14} color="#1F130D" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-bold text-[#1F130D]">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => confirmDeleteUser(item)}
                    className="px-3 py-1.5 bg-red-50 rounded-xl flex-row items-center border border-red-100"
                  >
                    <Ionicons name="trash-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-bold text-red-600">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Edit User Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Edit User Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Full Name</Text>
              <TextInput 
                className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" 
                value={name} 
                onChangeText={setName} 
              />

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Email Address</Text>
              <TextInput 
                className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" 
                value={email} 
                onChangeText={setEmail} 
              />

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Role (customer, manager, driver, staff)</Text>
              <TextInput 
                className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" 
                value={role} 
                onChangeText={setRole} 
              />

              <TouchableOpacity 
                onPress={handleUpdateUser} 
                disabled={isLoading}
                className="bg-[#B8520B] py-3.5 rounded-xl items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-xs font-bold">Save User Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Delete Confirmation Modal */}
        <Modal animationType="fade" transparent={true} visible={deleteModalVisible} onRequestClose={() => setDeleteModalVisible(false)}>
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100 items-center">
              <View className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 items-center justify-center mb-3">
                <Ionicons name="trash-outline" size={24} color="#E11D48" />
              </View>
              <Text className="text-lg font-black text-[#1F130D] mb-1 text-center">Delete User?</Text>
              <Text className="text-xs text-gray-500 text-center mb-6 px-2">
                Are you sure you want to remove <Text className="font-bold text-[#1F130D]">{userToDelete?.name || 'this user'}</Text> from the system? This action cannot be undone.
              </Text>

              <View className="flex-row space-x-3 w-full">
                <TouchableOpacity
                  onPress={() => setDeleteModalVisible(false)}
                  className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center active:scale-95"
                >
                  <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteUser}
                  className="flex-1 bg-rose-600 py-3.5 rounded-2xl items-center shadow-md shadow-rose-600/30 active:scale-95"
                >
                  <Text className="font-bold text-white text-sm">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}