import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function DriverDashboardScreen({ route, navigation }) {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [driverName, setDriverName] = useState('Alex Rider');
  const [driverEmail, setDriverEmail] = useState('alex.driver@restaurant.com');
  const [driverPhone, setDriverPhone] = useState('+1 444 892 109');
  const [driverImage, setDriverImage] = useState(null);

  const [activeTab, setActiveTab] = useState('All');
  
  // Delivery Orders Queue
  const [deliveries, setDeliveries] = useState([
    {
      id: 'd1',
      customer: 'Sarah Jenkins',
      address: '123 Maple Street, Apt 4B',
      phone: '+1 987 654 321',
      time: '10m ago',
      status: 'Ready for Pickup',
      items: [
        { name: '1x Family Combo Meal', note: 'Extra napkins' },
        { name: '2x Large Cokes', note: 'Cold' }
      ],
      total: '$45.00',
      image: null
    },
    {
      id: 'd2',
      customer: 'Michael Scott',
      address: '1725 Slough Avenue',
      phone: '+1 570 555 019',
      time: '25m ago',
      status: 'On the Way',
      items: [
        { name: '2x Pepperoni Pizzas', note: 'Well done crust' }
      ],
      total: '$32.00',
      image: null
    },
    {
      id: 'd3',
      customer: 'Pam Beesly',
      address: '88 Scranton Business Park',
      phone: '+1 570 555 882',
      time: '1h ago',
      status: 'Delivered',
      items: [
        { name: '1x Caesar Salad', note: 'Dressing on the side' }
      ],
      total: '$18.50',
      image: null
    }
  ]);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerLanding', params: { isLoggedIn: false } }],
    });
  };

  const pickDriverImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDriverImage(result.assets[0].uri);
    }
  };

  const updateDeliveryStatus = (id, newStatus) => {
    setDeliveries(deliveries.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  const filteredDeliveries = deliveries.filter(order => {
    if (activeTab === 'All') return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  const readyPickupCount = deliveries.filter(o => o.status === 'Ready for Pickup').length;
  const onTheWayCount = deliveries.filter(o => o.status === 'On the Way').length;

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl pb-16">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="flex-row items-center">
            <View className="w-9 h-9 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-2.5 overflow-hidden">
              {driverImage ? (
                <Image source={{ uri: driverImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="car" size={16} color="#B8520B" />
              )}
            </View>
            <View>
              <Text className="text-sm font-black text-[#1F130D]">Driver Dispatch</Text>
              <Text className="text-[10px] text-gray-400">Tap profile to edit</Text>
            </View>
          </TouchableOpacity>
          
          <View className="bg-[#FEF7F3] px-3 py-1.5 rounded-xl border border-[#B8520B]/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            <Text className="text-[11px] font-bold text-[#B8520B]">Online</Text>
          </View>
        </View>

        {/* Main Content Scrollable */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-20">
          
          {/* Quick Metrics */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-3xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ready for Pickup</Text>
                <Ionicons name="basket-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#B8520B]">{readyPickupCount}</Text>
            </View>
            <View className="flex-1 bg-white rounded-3xl p-4 border border-[#EAE3DE] shadow-xs">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">On the Way</Text>
                <Ionicons name="navigate-outline" size={16} color="amber" />
              </View>
              <Text className="text-2xl font-black text-[#1F130D]">{onTheWayCount}</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
            {['All', 'Ready for Pickup', 'On the Way', 'Delivered'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl mr-2 border ${activeTab === tab ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#1F130D]'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Deliveries Queue Header */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Active Deliveries ({filteredDeliveries.length})
          </Text>

          {/* Delivery Cards List */}
          {filteredDeliveries.map((delivery) => (
            <View key={delivery.id} className={`bg-white rounded-3xl p-4 border mb-3 shadow-xs ${delivery.status === 'Ready for Pickup' ? 'border-[#B8520B]' : 'border-[#EAE3DE]'}`}>
              <View className="flex-row justify-between items-center mb-2.5 pb-2.5 border-b border-[#F8F9FC]">
                <View className="flex-row items-center">
                  <Text className="text-xs font-black text-[#1F130D] bg-[#FEF7F3] px-2.5 py-1 rounded-lg border border-[#B8520B]/20 mr-2">
                    {delivery.customer}
                  </Text>
                  <Text className="text-[11px] text-gray-400">{delivery.time}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${delivery.status === 'Ready for Pickup' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : delivery.status === 'On the Way' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                  <Text className={`text-[10px] font-bold ${delivery.status === 'Ready for Pickup' ? 'text-[#B8520B]' : delivery.status === 'On the Way' ? 'text-amber-600' : 'text-green-600'}`}>
                    {delivery.status}
                  </Text>
                </View>
              </View>

              {/* Delivery Address & Phone */}
              <View className="bg-[#F8F9FC] p-3 rounded-2xl mb-3 border border-[#EAE3DE]">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="location-outline" size={14} color="#B8520B" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-semibold text-[#1F130D]">{delivery.address}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={14} color="#757575" style={{ marginRight: 6 }} />
                  <Text className="text-[11px] text-gray-500">{delivery.phone}</Text>
                </View>
              </View>

              <View className="mb-3">
                {delivery.items.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between py-0.5">
                    <Text className="text-xs font-semibold text-[#1F130D]">{item.name}</Text>
                    <Text className="text-[10px] text-gray-400 italic">{item.note}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row justify-between items-center pt-2.5 border-t border-[#F8F9FC]">
                <Text className="text-xs font-black text-[#1F130D]">Total: {delivery.total}</Text>

                <View className="flex-row gap-2">
                  {delivery.status === 'Ready for Pickup' && (
                    <TouchableOpacity 
                      onPress={() => updateDeliveryStatus(delivery.id, 'On the Way')}
                      className="bg-[#B8520B] px-3 py-1.5 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="navigate" size={12} color="white" style={{ marginRight: 4 }} />
                      <Text className="text-[10px] font-bold text-white">Start Delivery</Text>
                    </TouchableOpacity>
                  )}
                  {delivery.status === 'On the Way' && (
                    <TouchableOpacity 
                      onPress={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                      className="bg-green-600 px-3 py-1.5 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="checkmark-done" size={12} color="white" style={{ marginRight: 4 }} />
                      <Text className="text-[10px] font-bold text-white">Mark Delivered</Text>
                    </TouchableOpacity>
                  )}
                  {delivery.status === 'Delivered' && (
                    <View className="bg-gray-100 px-3 py-1.5 rounded-xl">
                      <Text className="text-[10px] font-bold text-gray-500">Completed</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

        </ScrollView>

        {/* --- PROFILE MODAL --- */}
        <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Driver Profile</Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              <View className="items-center mb-4 relative">
                <TouchableOpacity onPress={pickDriverImage} className="relative">
                  <View className="w-20 h-20 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center overflow-hidden">
                    {driverImage ? (
                      <Image source={{ uri: driverImage }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="car" size={32} color="#B8520B" />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 bg-[#B8520B] p-1.5 rounded-full border-2 border-white shadow-sm">
                    <Ionicons name="camera" size={12} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-xs font-bold text-[#B8520B] mt-2">Tap icon to change photo</Text>
              </View>

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Driver Name</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={driverName} onChangeText={setDriverName} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Email Address</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" value={driverEmail} onChangeText={setDriverEmail} />
              
              <Text className="text-[11px] font-bold text-gray-500 mb-1">Phone Number</Text>
              <TextInput className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-5 text-[#1F130D]" value={driverPhone} onChangeText={setDriverPhone} />
              
              <TouchableOpacity onPress={() => setProfileModalVisible(false)} className="bg-[#B8520B] py-3.5 rounded-xl items-center mb-3">
                <Text className="text-white text-xs font-bold">Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} className="bg-red-50 border border-red-200 py-3 rounded-xl items-center flex-row justify-center">
                <Ionicons name="log-out-outline" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                <Text className="text-red-600 font-bold text-xs">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EAE3DE] px-6 py-2.5 flex-row justify-around items-center shadow-lg">
          <TouchableOpacity onPress={() => setActiveTab('All')} className="items-center">
            <Ionicons name="bicycle" size={18} color="#B8520B" />
            <Text className="text-[9px] font-bold text-[#B8520B] mt-0.5">Deliveries</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)} className="items-center">
            <Ionicons name="person-outline" size={18} color="#757575" />
            <Text className="text-[9px] font-semibold text-gray-500 mt-0.5">Driver Profile</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}