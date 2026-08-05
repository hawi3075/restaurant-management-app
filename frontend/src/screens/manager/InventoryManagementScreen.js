import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryManagementScreen({ navigation }) {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'White Truffle Oil', stock: '2 Liters', status: 'Low Stock', statusColor: 'text-red-600 bg-red-50 border-red-200' },
    { id: 2, name: 'Arborio Rice', stock: '25 Kg', status: 'Optimal', statusColor: 'text-green-600 bg-green-50 border-green-200' },
    { id: 3, name: 'Fresh Forest Mushrooms', stock: '5 Kg', status: 'Medium', statusColor: 'text-amber-600 bg-amber-50 border-amber-200' },
  ]);

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 pb-24 px-5">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-3">
                <Ionicons name="arrow-back" size={18} color="#1F130D" />
              </TouchableOpacity>
              <Text className="text-xl font-black text-[#1F130D]">Inventory Stock</Text>
            </View>
            <TouchableOpacity className="bg-[#B8520B] px-3 py-2 rounded-xl flex-row items-center shadow-md">
              <Ionicons name="add" size={14} color="white" style={{ marginRight: 4 }} />
              <Text className="text-xs font-bold text-white">Add Item</Text>
            </TouchableOpacity>
          </View>

          {/* Inventory Items List */}
          {inventory.map((item) => (
            <View key={item.id} className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-3 flex-row justify-between items-center shadow-xs">
              <View>
                <Text className="text-sm font-black text-[#1F130D]">{item.name}</Text>
                <Text className="text-xs text-gray-500">Available: <Text className="font-bold text-[#1F130D]">{item.stock}</Text></Text>
              </View>
              <View className={`px-3 py-1 rounded-full border ${item.statusColor}`}>
                <Text className="text-[10px] font-bold">{item.status}</Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
    </View>
  );
}