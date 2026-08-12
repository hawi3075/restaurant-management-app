import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../api/backend';

export default function ReviewManagementScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/reviews`);
        const data = await res.json();
        if (Array.isArray(data)) setReviews(data);
      } catch (err) {
        console.error('Fetch reviews error', err);
      }
    };
    fetchReviews();
  }, []);

  const open = (r) => {
    setSelected(r);
    setReplyText(r.comment || '');
    setModalVisible(true);
  };

  const changeStatus = async (id, status) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const j = await res.json();
      if (j.success && j.review) {
        setReviews(prev => prev.map(r => (r._id === j.review._id ? j.review : r)));
      }
    } catch (err) {
      console.error('Status update error', err);
    }
  };

  const saveComment = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: replyText })
      });
      const j = await res.json();
      if (j.success && j.review) {
        setReviews(prev => prev.map(r => (r._id === j.review._id ? j.review : r)));
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Save comment error', err);
      Alert.alert('Error', 'Failed to save comment');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Review', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/reviews/${id}`, { method: 'DELETE' });
          const j = await res.json();
          if (j.success) setReviews(prev => prev.filter(r => r._id !== id));
        } catch (err) { console.error('Delete review error', err); }
      } }
    ]);
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-[#EAE3DE]">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-11 h-11 bg-white rounded-2xl border border-[#EAE3DE] items-center justify-center shadow-xs active:scale-95">
              <Ionicons name="arrow-back" size={20} color="#1F130D" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-[#1F130D]">Review Management</Text>
            <View className="w-11" />
          </View>

          <Text className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Customer Feedback</Text>
          <View className="space-y-3.5 pb-6">
            {reviews.map((r) => (
              <View key={r._id} className="bg-white p-4 rounded-3xl border border-[#EAE3DE] shadow-xs mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-black text-[#1F130D]" numberOfLines={1}>{r.user?.name || r.user?.email || 'Guest'}</Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>{r.menuItem?.name || 'Menu Item'}</Text>
                  </View>
                  <View className="flex-row items-center bg-[#FEF7F3] px-2.5 py-0.5 rounded-full border border-[#B8520B]/30">
                    <Ionicons name="star" size={10} color="#B8520B" />
                    <Text className="text-xs font-bold text-[#B8520B] ml-1">{r.rating}</Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-700 mb-3">{r.comment}</Text>
                <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                  <Text className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${r.status === 'Pending' ? 'bg-orange-50 border-orange-200 text-orange-600' : r.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                    {r.status}
                  </Text>
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity onPress={() => open(r)} className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 active:scale-95">
                      <Text className="text-xs font-bold text-[#1F130D]">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeStatus(r._id, r.status === 'Approved' ? 'Rejected' : 'Approved')} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 active:scale-95">
                      <Text className="text-xs font-bold text-emerald-600">Toggle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(r._id)} className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 active:scale-95">
                      <Text className="text-xs font-bold text-rose-600">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="w-full max-w-[440px] bg-white rounded-t-[32px] p-6 border-t border-[#EAE3DE] shadow-2xl">
              <Text className="text-base font-black text-[#1F130D] mb-3">Edit Review Comment</Text>
              <TextInput value={replyText} onChangeText={setReplyText} multiline className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-200 text-[#1F130D] font-medium text-sm mb-4 h-28" />
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center active:scale-95">
                  <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveComment} className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/20 active:scale-95">
                  <Text className="font-bold text-white text-sm">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}