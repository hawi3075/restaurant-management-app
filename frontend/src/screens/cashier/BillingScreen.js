import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function BillingScreen() {
  const [selectedMethod, setSelectedMethod] = useState('Credit Card');

  const items = [
    { name: 'Truffle Mushroom Risotto', qty: 2, price: 24.00 },
    { name: 'Artisanal Wagyu Burger', qty: 1, price: 24.00 },
    { name: 'Craft Lemonade', qty: 3, price: 4.50 },
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.085; // 8.5% tax per SRS module 8
  const total = subtotal + tax;

  return (
    <View className="flex-1 bg-[#F8F9FC] pt-12 px-5">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-2xl font-black text-[#1F130D]">Billing & Payment</Text>
          <Text className="text-xs text-gray-500">Order #ORD-402 • Table 12</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs">
          <Ionicons name="print-outline" size={20} color="#1F130D" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Invoice Summary */}
        <View className="bg-white p-5 rounded-2xl border border-[#EAE3DE] mb-6 shadow-xs">
          <Text className="text-base font-bold text-[#1F130D] mb-4">Invoice Breakdown</Text>
          {items.map((item, idx) => (
            <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <View className="w-3/5">
                <Text className="text-sm font-semibold text-[#1F130D]">{item.name}</Text>
                <Text className="text-xs text-gray-400">Qty: {item.qty}</Text>
              </View>
              <Text className="text-sm font-bold text-[#1F130D]">${(item.price * item.qty).toFixed(2)}</Text>
            </View>
          ))}

          <View className="mt-4 space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500">Subtotal</Text>
              <Text className="text-xs font-bold text-[#1F130D]">${subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-500">Tax (8.5%)</Text>
              <Text className="text-xs font-bold text-[#1F130D]">${tax.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-base font-black text-[#1F130D]">Total Due</Text>
              <Text className="text-base font-black text-[#B8520B]">${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods Selection (SRS Module 8) */}
        <Text className="text-lg font-bold text-[#1F130D] mb-3">Select Payment Method</Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer'].map((method, idx) => {
            const isSelected = selectedMethod === method;
            return (
              <TouchableOpacity 
                key={idx}
                onPress={() => setSelectedMethod(method)}
                className={`w-[48%] p-4 rounded-2xl border mb-3 flex-row items-center space-x-3 ${isSelected ? 'bg-[#FEF7F3] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Ionicons 
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'} 
                  size={20} 
                  color={isSelected ? '#B8520B' : '#9E9E9E'} 
                />
                <Text className={`font-bold text-xs ${isSelected ? 'text-[#B8520B]' : 'text-[#1F130D]'}`}>{method}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity className="bg-[#B8520B] py-4 rounded-2xl items-center shadow-md mb-8">
          <Text className="text-white font-black text-sm tracking-wide">Process Payment & Print Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}