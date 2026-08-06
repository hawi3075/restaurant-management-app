import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SupportMessageScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: '1', user: 'Abebe Kebede', message: 'Hello, when will my delivery arrive?', time: '10:42 AM', status: 'Pending' },
    { id: '2', user: 'Sara Tadesse', message: 'Can I change my order item after checkout?', time: '09:15 AM', status: 'Resolved' },
  ]);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpenReply = (item) => {
    setSelectedChat(item);
    setReplyText('');
    setIsModalVisible(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message.');
      return;
    }

    // Update message status to resolved and close modal
    setMessages(messages.map(m => m.id === selectedChat.id ? { ...m, status: 'Resolved' } : m));
    setIsModalVisible(false);
    Alert.alert('Success', 'Reply sent successfully!');
  };

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
            <Text className="text-xl font-black text-slate-900">Support Messages</Text>
            <View className="w-11" />
          </View>

          {/* Chat List */}
          <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Customer Inquiries</Text>
          <View className="space-y-3.5 pb-6">
            {messages.map((item) => (
              <View key={item.id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-md">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-black text-slate-900">{item.user}</Text>
                  <Text className="text-[10px] font-bold text-slate-400">{item.time}</Text>
                </View>
                <Text className="text-xs font-medium text-slate-600 mb-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {item.message}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${item.status === 'Pending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                    {item.status}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleOpenReply(item)}
                    className="px-4 py-2 bg-slate-900 rounded-xl shadow-sm active:scale-95"
                  >
                    <Text className="text-xs font-black text-white">Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>

        {/* Reply Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="w-full max-w-[440px] bg-white rounded-t-[32px] p-6 border-t-2 border-slate-200 shadow-2xl">
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-slate-900">
                  Reply to {selectedChat?.user}
                </Text>
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                "{selectedChat?.message}"
              </Text>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Your Response</Text>
              <TextInput
                className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-medium text-sm mb-4 h-28 text-top"
                placeholder="Type your message here..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                value={replyText}
                onChangeText={setReplyText}
              />

              <TouchableOpacity
                onPress={handleSendReply}
                className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg active:scale-95"
              >
                <Text className="text-sm font-black text-white uppercase tracking-wider">Send Reply</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}