import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StaffManagementScreen({ navigation }) {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Abebe Bekele', role: 'Head Chef', shift: 'Morning (6AM - 2PM)', status: 'On Duty' },
    { id: 2, name: 'Mekdes Tadesse', role: 'Cashier', shift: 'Evening (2PM - 10PM)', status: 'Off Duty' },
    { id: 3, name: 'Samuel Lemma', role: 'Delivery Driver', shift: 'Full Day', status: 'On Duty' },
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
              <Text className="text-xl font-black text-[#1F130D]">Staff Management</Text>
            </View>
            <TouchableOpacity className="bg-[#B8520B] w-9 h-9 rounded-full items-center justify-center shadow-md">
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Staff List */}
          {staff.map((member) => (
            <View key={member.id} className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-3 shadow-xs">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-sm font-black text-[#1F130D]">{member.name}</Text>
                  <Text className="text-[10px] font-bold text-[#B8520B]">{member.role}</Text>
                </View>
                <Text className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${member.status === 'On Duty' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {member.status}
                </Text>
              </View>
              <View className="flex-row items-center bg-gray-50 p-2 rounded-xl">
                <Ionicons name="time-outline" size={12} color="#757575" style={{ marginRight: 6 }} />
                <Text className="text-[10px] text-gray-600 font-bold">Shift: {member.shift}</Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
    </View>
  );
}