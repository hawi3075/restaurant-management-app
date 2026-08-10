import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewManagementScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reviews');
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
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
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
      const res = await fetch(`http://localhost:5000/api/reviews/${selected._id}`, {
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
          const res = await fetch(`http://localhost:5000/api/reviews/${id}`, { method: 'DELETE' });
          const j = await res.json();
          if (j.success) setReviews(prev => prev.filter(r => r._id !== id));
        } catch (err) { console.error('Delete review error', err); }
      } }
    ]);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x-2 border-slate-200">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-10 pb-24 px-5">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-11 h-11 bg-slate-50 rounded-2xl border-2 border-slate-200 items-center justify-center shadow-md active:scale-95">
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-slate-900">Review Management</Text>
            <View className="w-11" />
          </View>

          <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Customer Feedback</Text>
          <View className="space-y-3.5 pb-6">
            {reviews.map((r) => (
              <View key={r._id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-md">
                <View className="flex-row justify-between items-center mb-2">
                  <View>
                    <Text className="text-base font-black text-slate-900">{r.user?.name || r.user?.email || 'Guest'}</Text>
                    <Text className="text-xs text-slate-500">{r.menuItem?.name || 'Menu Item'}</Text>
                  </View>
                  <Text className="text-[12px] font-bold">{r.rating} ★</Text>
                </View>
                <Text className="text-sm text-slate-700 mb-3">{r.comment}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${r.status === 'Pending' ? 'bg-orange-100 text-orange-600' : r.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {r.status}
                  </Text>
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity onPress={() => open(r)} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                      <Text className="text-xs font-bold">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeStatus(r._id, r.status === 'Approved' ? 'Rejected' : 'Approved')} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Text className="text-xs font-bold">Toggle Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(r._id)} className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100">
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
            <View className="w-full max-w-[440px] bg-white rounded-t-[32px] p-6 border-t-2 border-slate-200 shadow-2xl">
              <Text className="text-base font-black text-slate-900 mb-3">Edit Review</Text>
              <TextInput value={replyText} onChangeText={setReplyText} multiline className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-medium text-sm mb-4 h-28" />
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center">
                  <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveComment} className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center">
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