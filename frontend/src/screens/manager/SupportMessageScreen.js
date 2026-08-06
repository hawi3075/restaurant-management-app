import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SupportMessageScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: '1', user: 'Abebe Kebede', message: 'Hello, when will my delivery arrive?', time: '10:42 AM', status: 'Pending' },
    { id: '2', user: 'Sara Tadesse', message: 'Can I change my order item after checkout?', time: '09:15 AM', status: 'Resolved' },
  ]);
  const [replyText, setReplyText] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

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
                    onPress={() => setSelectedChat(item.id)}
                    className="px-4 py-2 bg-slate-900 rounded-xl shadow-sm"
                  >
                    <Text className="text-xs font-black text-white">Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}