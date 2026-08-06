import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewManagementScreen({ navigation }) {
  const [reviews, setReviews] = useState([
    { id: '1', user: 'Dawit Mamo', rating: 5, comment: 'Amazing food quality and super fast delivery! Highly recommended.', date: 'Today' },
    { id: '2', user: 'Marta Bekele', rating: 4, comment: 'Great taste, but packaging could be slightly improved.', date: 'Yesterday' },
  ]);

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
            <Text className="text-xl font-black text-slate-900">Review Management</Text>
            <View className="w-11" />
          </View>

          {/* Reviews List */}
          <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Customer Feedback & Ratings</Text>
          <View className="space-y-3.5 pb-6">
            {reviews.map((item) => (
              <View key={item.id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-md">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-black text-slate-900">{item.user}</Text>
                  <Text className="text-[10px] font-bold text-slate-400">{item.date}</Text>
                </View>

                {/* Star Ratings */}
                <View className="flex-row items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name={i < item.rating ? "star" : "star-outline"} 
                      size={14} 
                      color="#F59E0B" 
                    />
                  ))}
                  <Text className="text-xs font-black text-slate-700 ml-1">({item.rating}.0)</Text>
                </View>

                <Text className="text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  "{item.comment}"
                </Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}