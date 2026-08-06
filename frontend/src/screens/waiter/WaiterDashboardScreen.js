import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WaiterDashboardScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filters = ['All', 'Preparing', 'Ready', 'Served'];

  const [waiterOrders, setWaiterOrders] = useState([
    {
      id: '1',
      table: 'Table 04',
      waiter: 'Hawi',
      status: 'Preparing',
      time: '12m ago',
      items: [
        { name: '1x Truffle Mushroom Risotto', note: 'Extra truffle oil' },
        { name: '2x Sparkling Water', note: 'Chilled' }
      ],
      total: '45.00'
    },
    {
      id: '2',
      table: 'Table 12',
      waiter: 'Hawi',
      status: 'Ready',
      time: '4m ago',
      items: [
        { name: '1x Artisanal Wagyu Burger', note: 'Medium rare' },
        { name: '1x Caesar Salad', note: 'No croutons' }
      ],
      total: '28.50'
    },
    {
      id: '3',
      table: 'Table 08',
      waiter: 'Hawi',
      status: 'Served',
      time: '25m ago',
      items: [
        { name: '2x Grilled Ribeye Steak', note: 'Well done' },
        { name: '1x House Red Wine Bottle', note: 'Room temp' }
      ],
      total: '86.00'
    }
  ]);

  const updateOrderStatus = (id, newStatus) => {
    setWaiterOrders(waiterOrders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = waiterOrders.filter(order => {
    const matchesSearch = order.table.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'All' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' };
      case 'Preparing':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' };
      case 'Served':
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' };
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl overflow-hidden border-x border-[#EAE3DE]">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 px-5 pb-24">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#FEF7F3] rounded-full border border-[#B8520B]/30 items-center justify-center mr-3">
                <Ionicons name="person" size={18} color="#B8520B" />
              </View>
              <View>
                <Text className="text-xl font-black text-[#1F130D]">Waiter Station</Text>
                <Text className="text-xs text-gray-500">Active Tables & Live Order Status</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => alert('Navigate to New Order screen')} 
              className="bg-[#B8520B] px-4 py-2.5 rounded-2xl flex-row items-center shadow-md shadow-[#B8520B]/30 active:scale-95"
            >
              <Ionicons name="add" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="font-bold text-xs text-white">New Order</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Cards */}
          <View className="flex-row space-x-3 mb-5">
            <View className="flex-1 bg-white p-4 rounded-3xl border border-[#EAE3DE] shadow-xs">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-400 font-semibold">Active Tables</Text>
                <Ionicons name="restaurant-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#1F130D]">6</Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-3xl border border-[#EAE3DE] shadow-xs">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-400 font-semibold">Pending Orders</Text>
                <Ionicons name="time-outline" size={16} color="#B8520B" />
              </View>
              <Text className="text-2xl font-black text-[#B8520B]">
                {waiterOrders.filter(o => o.status !== 'Served').length}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white border border-[#EAE3DE] rounded-2xl px-4 py-3 mb-4 shadow-xs">
            <Ionicons name="search-outline" size={18} color="#757575" />
            <TextInput 
              placeholder="Search table number or dishes..." 
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-sm text-[#1F130D] font-medium"
            />
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-12">
            {filters.map((filter, idx) => {
              const isSelected = selectedFilter === filter;
              return (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => setSelectedFilter(filter)}
                  className={`mr-3 px-5 py-2.5 rounded-2xl border justify-center ${isSelected ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
                >
                  <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-[#1F130D]'}`}>{filter}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Orders List */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-gray-400 mb-2">Live Table Orders ({filteredOrders.length})</Text>
            {filteredOrders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <View 
                  key={order.id} 
                  className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-4 shadow-xs"
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View className="bg-[#FEF7F3] px-3 py-1.5 rounded-xl border border-[#B8520B]/30 mr-3">
                        <Text className="font-black text-xs text-[#B8520B]">{order.table}</Text>
                      </View>
                      <Text className="text-xs text-gray-400">{order.time}</Text>
                    </View>

                    <View className={`px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                      <Text className={`text-[10px] font-bold ${statusStyle.text}`}>{order.status}</Text>
                    </View>
                  </View>

                  {/* Order Items Preview */}
                  <View className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-3 space-y-1">
                    {order.items.map((item, i) => (
                      <View key={i} className="flex-row justify-between items-center">
                        <Text className="text-xs font-semibold text-[#1F130D]">{item.name}</Text>
                        <Text className="text-[10px] text-gray-400 italic">{item.note}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Footer & Actions */}
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                    <Text className="font-black text-sm text-[#1F130D]">Total: ${order.total}</Text>

                    <View className="flex-row space-x-2">
                      <TouchableOpacity 
                        onPress={() => {
                          setSelectedOrder(order);
                          setDetailModalVisible(true);
                        }}
                        className="px-3 h-8 bg-gray-100 rounded-xl items-center justify-center border border-gray-200 active:scale-95"
                      >
                        <Text className="text-[10px] font-bold text-[#1F130D]">Details</Text>
                      </TouchableOpacity>

                      {order.status === 'Ready' && (
                        <TouchableOpacity 
                          onPress={() => updateOrderStatus(order.id, 'Served')}
                          className="px-3 h-8 bg-emerald-600 rounded-xl items-center justify-center shadow-xs active:scale-95"
                        >
                          <Text className="text-[10px] font-bold text-white">Mark Served</Text>
                        </TouchableOpacity>
                      )}

                      {order.status === 'Preparing' && (
                        <TouchableOpacity 
                          onPress={() => updateOrderStatus(order.id, 'Ready')}
                          className="px-3 h-8 bg-[#FEF7F3] border border-[#B8520B]/40 rounded-xl items-center justify-center active:scale-95"
                        >
                          <Text className="text-[10px] font-bold text-[#B8520B]">Mark Ready</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Order Detail Modal */}
        <Modal animationType="fade" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100">
              {selectedOrder && (
                <View>
                  <View className="items-center mb-4">
                    <View className="w-14 h-14 bg-[#FEF7F3] rounded-2xl items-center justify-center mb-2 border border-[#B8520B]/30">
                      <Ionicons name="receipt-outline" size={24} color="#B8520B" />
                    </View>
                    <Text className="text-xl font-black text-[#1F130D]">{selectedOrder.table}</Text>
                    <Text className="text-xs text-gray-400">Assigned Waiter: {selectedOrder.waiter}</Text>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4 space-y-2">
                    <Text className="text-xs font-bold text-[#1F130D] mb-1">Ordered Items:</Text>
                    {selectedOrder.items.map((item, idx) => (
                      <View key={idx} className="flex-row justify-between py-1 border-b border-gray-200/50">
                        <Text className="text-xs text-gray-700 font-medium">{item.name}</Text>
                        <Text className="text-[10px] text-gray-400 italic">{item.note}</Text>
                      </View>
                    ))}
                    <View className="flex-row justify-between pt-2">
                      <Text className="text-xs font-bold text-[#1F130D]">Total Amount:</Text>
                      <Text className="text-xs font-black text-[#B8520B]">${selectedOrder.total}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => setDetailModalVisible(false)} 
                    className="w-full bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/30"
                  >
                    <Text className="font-bold text-white text-sm">Close</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}