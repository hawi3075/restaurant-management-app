import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuManagementScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Truffle Mushroom Risotto', price: '$24.00', category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Classic Cheeseburger', price: '$15.50', category: 'Fast Food', available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' }
  ]);

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

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
              <Text className="text-xl font-black text-[#1F130D]">Menu Management</Text>
            </View>
            <TouchableOpacity className="bg-[#B8520B] px-3 py-2 rounded-xl flex-row items-center shadow-md">
              <Ionicons name="add" size={14} color="white" style={{ marginRight: 4 }} />
              <Text className="text-xs font-bold text-white">Add Dish</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items List */}
          {menuItems.map((dish) => (
            <View key={dish.id} className="bg-white p-3 rounded-3xl border border-[#EAE3DE] mb-3 flex-row items-center shadow-xs">
              <Image source={{ uri: dish.image }} className="w-16 h-16 rounded-2xl mr-3" />
              <View className="flex-1 mr-2">
                <Text className="text-xs font-black text-[#1F130D]">{dish.name}</Text>
                <Text className="text-xs font-bold text-[#B8520B] mb-1">{dish.price}</Text>
                <Text className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full self-start">{dish.category}</Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => toggleAvailability(dish.id)}
                className={`px-3 py-1.5 rounded-xl border ${dish.available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
              >
                <Text className={`text-[10px] font-bold ${dish.available ? 'text-green-600' : 'text-red-600'}`}>
                  {dish.available ? 'In Stock' : 'Sold Out'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

        </ScrollView>
      </View>
    </View>
  );
}