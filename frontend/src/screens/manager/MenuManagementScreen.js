import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('Modern');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts'];

  const [menuItems, setMenuItems] = useState([
    { 
      id: '1', 
      name: 'Truffle Mushroom Risotto', 
      desc: 'Arborio rice, wild mushrooms, truffle oil', 
      price: 24.00, 
      category: 'Lunch', 
      style: 'Modern', 
      rating: '4.8', 
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: '2', 
      name: 'Artisanal Wagyu Burger', 
      desc: 'Wagyu beef patty, cheddar, brioche bun', 
      price: 18.50, 
      category: 'Dinner', 
      style: 'Modern', 
      rating: '4.9', 
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' 
    },
  ]);

  // Form states for adding a dish
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Lunch');
  const [newStyle, setNewStyle] = useState('Modern');

  const toggleStockStatus = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, status: item.status === 'In Stock' ? 'Out of Stock' : 'In Stock' } : item
    ));
  };

  const handleAddDish = () => {
    if (!newName || !newPrice) return;
    const newItem = {
      id: Date.now().toString(),
      name: newName,
      desc: newDesc || 'Freshly prepared specialty dish',
      price: parseFloat(newPrice) || 15.00,
      category: newCategory,
      style: newStyle,
      rating: '5.0',
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
    };
    setMenuItems([...menuItems, newItem]);
    setNewName('');
    setNewDesc('');
    setNewPrice('');
    setAddModalVisible(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStyle = item.style === selectedStyle;
    return matchesSearch && matchesCategory && matchesStyle;
  });

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl overflow-hidden border-x border-[#EAE3DE]">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 px-5 pb-24">
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-3 active:scale-95"
              >
                <Ionicons name="arrow-back" size={18} color="#1F130D" />
              </TouchableOpacity>
              <View>
                <Text className="text-2xl font-black text-[#1F130D]">Menu Management</Text>
                <Text className="text-xs text-gray-500">Manage dishes, categories & availability</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setAddModalVisible(true)} 
              className="bg-[#B8520B] px-4 py-2.5 rounded-2xl flex-row items-center shadow-md shadow-[#B8520B]/30 active:scale-95"
            >
              <Ionicons name="add" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="font-bold text-xs text-white">Add Dish</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white border border-[#EAE3DE] rounded-2xl px-4 py-3 mb-4 shadow-xs">
            <Ionicons name="search-outline" size={18} color="#757575" />
            <TextInput 
              placeholder="Search dishes or ingredients..." 
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-sm text-[#1F130D] font-medium"
            />
          </View>

          {/* Modern & Traditional Filter Tabs */}
          <View className="flex-row space-x-2 mb-4">
            {['Modern', 'Traditional'].map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => setSelectedStyle(style)}
                className={`px-4 py-1.5 rounded-full border ${selectedStyle === style ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
              >
                <Text className={`text-[10px] font-bold ${selectedStyle === style ? 'text-white' : 'text-[#757575]'}`}>
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-12">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => setSelectedCategory(cat)}
                  className={`mr-3 px-5 py-2.5 rounded-2xl border justify-center ${isSelected ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
                >
                  <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-[#1F130D]'}`}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Menu Items List with Detail Icon & Manager Actions */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-gray-400 mb-2">{selectedCategory} • {selectedStyle} Selection ({filteredItems.length})</Text>
            {filteredItems.map((item) => (
              <View 
                key={item.id} 
                className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-4 shadow-xs"
              >
                <View className="flex-row items-center mb-3">
                  <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl mr-4" />
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="font-bold text-sm text-[#1F130D] w-3/4" numberOfLines={1}>{item.name}</Text>
                      <TouchableOpacity
                        onPress={() => toggleStockStatus(item.id)}
                        className={`px-2.5 py-0.5 rounded-full border ${item.status === 'In Stock' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
                      >
                        <Text className={`text-[10px] font-bold ${item.status === 'In Stock' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.status}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>{item.desc}</Text>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="font-black text-sm text-[#1F130D]">${item.price.toFixed(2)}</Text>
                      <View className="flex-row items-center bg-[#FEF7F3] px-2 py-0.5 rounded-full border border-[#B8520B]/30">
                        <Ionicons name="star" size={10} color="#B8520B" />
                        <Text className="text-[10px] font-bold text-[#B8520B] ml-1">{item.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Buttons Row with Detail Icon */}
                <View className="flex-row space-x-2 pt-2 border-t border-gray-100">
                  <TouchableOpacity 
                    onPress={() => alert(`Dish Details:\nName: ${item.name}\nCategory: ${item.category}\nStyle: ${item.style}\nPrice: $${item.price.toFixed(2)}\nStatus: ${item.status}`)} 
                    className="flex-1 bg-gray-100 py-2 rounded-xl items-center flex-row justify-center active:scale-95"
                  >
                    <Ionicons name="information-circle-outline" size={12} color="#1F130D" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-[#1F130D]">Detail</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => toggleStockStatus(item.id)} 
                    className="flex-1 bg-[#FEF7F3] border border-[#B8520B]/40 py-2 rounded-xl items-center flex-row justify-center active:scale-95"
                  >
                    <Ionicons name="refresh-outline" size={12} color="#B8520B" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-[#B8520B]">Toggle Stock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Add Dish Modal */}
        <Modal animationType="fade" transparent={true} visible={addModalVisible} onRequestClose={() => setAddModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-[#1F130D] mb-1">Add New Menu Dish</Text>
                <Text className="text-xs text-gray-500 mb-4">Enter dish details to list on the customer menu.</Text>

                <Text className="text-xs font-bold text-gray-700 mb-1">Dish Name</Text>
                <TextInput 
                  placeholder="e.g. Grilled Ribeye Steak"
                  placeholderTextColor="#9CA3AF"
                  value={newName}
                  onChangeText={setNewName}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Description</Text>
                <TextInput 
                  placeholder="e.g. Served with garlic butter & herbs"
                  placeholderTextColor="#9CA3AF"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Price ($)</Text>
                <TextInput 
                  placeholder="e.g. 22.50"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={newPrice}
                  onChangeText={setNewPrice}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl border mr-2 ${newCategory === cat ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${newCategory === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text className="text-xs font-bold text-gray-700 mb-1">Style</Text>
                <View className="flex-row space-x-2 mb-5">
                  {['Modern', 'Traditional'].map((style) => (
                    <TouchableOpacity
                      key={style}
                      onPress={() => setNewStyle(style)}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${newStyle === style ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${newStyle === style ? 'text-white' : 'text-gray-700'}`}>{style}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => setAddModalVisible(false)} className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center">
                    <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddDish} className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/20">
                    <Text className="font-bold text-white text-sm">Save Dish</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}