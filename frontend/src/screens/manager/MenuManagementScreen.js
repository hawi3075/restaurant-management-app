import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Image, Modal, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Centralized API URL configuration using your Render live backend
const API_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000')
  : 'https://restaurant-management-app-wqmp.onrender.com';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

// Helper to sanitize blob or local file URIs which break on React Native Web refreshes
const sanitizeImage = (uri) => {
  if (!uri || typeof uri !== 'string' || uri.startsWith('blob:') || uri.startsWith('file:')) {
    return FALLBACK_IMAGE;
  }
  return uri;
};

export default function MenuManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('Modern');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editRating, setEditRating] = useState('4.9');
  const [editImage, setEditImage] = useState('');
  const [editCategory, setEditCategory] = useState('Lunch');
  const [editStyle, setEditStyle] = useState('Modern');

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts', 'Fast Food'];

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

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/api/menu`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map(i => ({
            id: String(i._id || i.id),
            name: i.name,
            desc: i.description || i.desc || '',
            price: i.price || 0,
            category: i.category,
            style: i.style || 'Modern',
            rating: String(i.rating || 5),
            status: i.availabilityStatus ? 'In Stock' : 'Out of Stock',
            image: sanitizeImage(i.image)
          }));
          setMenuItems(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch menu items from live server', err);
      }
    };

    fetchMenu();
  }, []);

  // Form states
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newRating, setNewRating] = useState('4.9');
  const [imageSourceType, setImageSourceType] = useState('url'); // 'url' or 'device'
  const [newImage, setNewImage] = useState('');
  const [newCategory, setNewCategory] = useState('Lunch');
  const [newStyle, setNewStyle] = useState('Modern');

  const pickImageFromDevice = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setNewImage(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setNewImage(sanitizeImage(asset.uri));
        }
      }
    } catch (error) {
      console.log('Error picking image: ', error);
    }
  };

  const toggleStockStatus = (id) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    const newStatus = item.status === 'In Stock' ? false : true;
    setMenuItems(menuItems.map(i => i.id === id ? { ...i, status: newStatus ? 'In Stock' : 'Out of Stock' } : i));
    fetch(`${API_URL}/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: newStatus })
    }).then(r => r.json()).then(j => {
      if (!j.success) console.warn('Failed to update stock status on live server', j);
    }).catch(err => console.error('Menu update error', err));
  };

  const handleAddDish = () => {
    if (!newName || !newPrice) return;
    const payload = {
      name: newName,
      category: newCategory,
      description: newDesc,
      price: parseFloat(newPrice) || 0,
      preparationTime: 15,
      image: sanitizeImage(newImage.trim()),
      availabilityStatus: true,
      rating: parseFloat(newRating) || 5
    };
    fetch(`${API_URL}/api/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(j => {
      if (j.success && j.item) {
        const added = {
          id: String(j.item._id || j.item.id),
          name: j.item.name,
          desc: j.item.description || newDesc,
          price: j.item.price,
          category: j.item.category,
          style: 'Modern',
          rating: String(j.item.rating || 5),
          status: j.item.availabilityStatus ? 'In Stock' : 'Out of Stock',
          image: sanitizeImage(j.item.image)
        };
        setMenuItems(prev => [added, ...prev]);
        setNewName('');
        setNewDesc('');
        setNewPrice('');
        setNewRating('4.9');
        setNewImage('');
        setImageSourceType('url');
        setAddModalVisible(false);
      } else {
        alert('Failed to add dish to live server');
      }
    }).catch(err => {
      console.error('Add dish error', err);
      alert('Failed to connect to live backend');
    });
  };

  const openEditModal = (item) => {
    setSelectedDish(item);
    setEditName(item.name || '');
    setEditDesc(item.desc || '');
    setEditPrice(item.price ? String(item.price) : '');
    setEditRating(item.rating || '4.9');
    setEditImage(sanitizeImage(item.image));
    setEditCategory(item.category || 'Lunch');
    setEditStyle(item.style || 'Modern');
    setEditModalVisible(true);
  };

  const confirmDelete = (id) => {
    Alert.alert('Delete Dish', 'Are you sure you want to delete this dish?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteDish(id) }
    ]);
  };

  const handleDeleteDish = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/menu/${id}`, { method: 'DELETE' });
      const j = await res.json();
      if (j.success) {
        setMenuItems(prev => prev.filter(i => String(i.id || i._id) !== String(id)));
      } else {
        Alert.alert('Error', j.message || 'Failed to delete dish');
      }
    } catch (err) {
      console.error('Delete error', err);
      Alert.alert('Error', 'Failed to connect to live server');
    }
  };

  const handleUpdateDish = async () => {
    if (!selectedDish) return;
    const id = selectedDish.id;
    const payload = {
      name: editName,
      description: editDesc,
      price: parseFloat(editPrice) || 0,
      image: sanitizeImage(editImage),
      category: editCategory,
      style: editStyle,
      rating: parseFloat(editRating) || 5
    };
    try {
      const res = await fetch(`${API_URL}/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.success && j.item) {
        const updated = {
          id: String(j.item._id || j.item.id),
          name: j.item.name,
          desc: j.item.description || editDesc,
          price: j.item.price,
          category: j.item.category,
          style: j.item.style || editStyle,
          rating: String(j.item.rating || editRating),
          status: j.item.availabilityStatus ? 'In Stock' : 'Out of Stock',
          image: sanitizeImage(j.item.image)
        };
        setMenuItems(prev => prev.map(m => (m.id === id ? updated : m)));
        setEditModalVisible(false);
        setSelectedDish(null);
      } else {
        alert('Failed to update dish on live server');
      }
    } catch (err) {
      console.error('Update error', err);
      alert('Failed to connect to live backend');
    }
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
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl border-x border-[#EAE3DE]">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-12 px-5 pb-24">
          
          {/* Header */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center shadow-xs mr-3 active:scale-95"
              >
                <Ionicons name="arrow-back" size={18} color="#1F130D" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-black text-[#1F130D]">Menu Management</Text>
                <Text className="text-xs text-gray-500">Live Render Server Connected</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setAddModalVisible(true)} 
              className="bg-[#B8520B] w-full py-3 rounded-2xl flex-row items-center justify-center shadow-md shadow-[#B8520B]/30 active:scale-95"
            >
              <Ionicons name="add" size={18} color="white" style={{ marginRight: 6 }} />
              <Text className="font-bold text-sm text-white">Add New Dish</Text>
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

          {/* Menu Items List */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-gray-400 mb-2">{selectedCategory} • {selectedStyle} Selection ({filteredItems.length})</Text>
            {filteredItems.map((item) => (
              <View 
                key={item.id} 
                className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-4 shadow-xs"
              >
                <View className="flex-row items-center mb-3">
                  <Image source={{ uri: sanitizeImage(item.image) }} className="w-20 h-20 rounded-2xl mr-4" />
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

                {/* Bottom Action Buttons */}
                <View className="flex-row space-x-2 pt-2 border-t border-gray-100">
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedDish(item);
                      setDetailModalVisible(true);
                    }} 
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

                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    className="flex-1 bg-white border border-[#EAE3DE] py-2 rounded-xl items-center flex-row justify-center active:scale-95"
                  >
                    <Ionicons name="create-outline" size={12} color="#1F130D" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-[#1F130D]">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmDelete(item.id)}
                    className="flex-1 bg-white border border-rose-100 py-2 rounded-xl items-center flex-row justify-center active:scale-95"
                  >
                    <Ionicons name="trash-outline" size={12} color="#E11D48" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-bold text-rose-600">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Dish Detail Modal */}
        <Modal animationType="fade" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100">
              {selectedDish && (
                <View>
                  <View className="items-center mb-4">
                    <Image source={{ uri: sanitizeImage(selectedDish.image) }} className="w-28 h-28 rounded-2xl mb-3 shadow-md" />
                    <View className="flex-row items-center bg-[#FEF7F3] px-3 py-1 rounded-full border border-[#B8520B]/30 mb-2">
                      <Ionicons name="star" size={12} color="#B8520B" />
                      <Text className="text-xs font-bold text-[#B8520B] ml-1">{selectedDish.rating} Rating</Text>
                    </View>
                    <Text className="text-xl font-black text-[#1F130D] text-center">{selectedDish.name}</Text>
                    <Text className="text-xs text-gray-500 text-center mt-1 px-2">{selectedDish.desc}</Text>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 mb-5">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Category:</Text>
                      <Text className="text-xs font-bold text-[#1F130D]">{selectedDish.category}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Style:</Text>
                      <Text className="text-xs font-bold text-[#1F130D]">{selectedDish.style}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Price:</Text>
                      <Text className="text-xs font-black text-[#B8520B]">${selectedDish.price.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Stock Status:</Text>
                      <Text className={`text-xs font-bold ${selectedDish.status === 'In Stock' ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedDish.status}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => setDetailModalVisible(false)} 
                    className="w-full bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/30"
                  >
                    <Text className="font-bold text-white text-sm">Close Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Dish Modal */}
        <Modal animationType="fade" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-[#1F130D] mb-1">Edit Menu Dish</Text>
                <Text className="text-xs text-gray-500 mb-4">Update dish details on the live database.</Text>

                <Text className="text-xs font-bold text-gray-700 mb-1">Dish Name</Text>
                <TextInput 
                  placeholder="e.g. Grilled Ribeye Steak"
                  placeholderTextColor="#9CA3AF"
                  value={editName}
                  onChangeText={setEditName}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Description</Text>
                <TextInput 
                  placeholder="e.g. Served with garlic butter & herbs"
                  placeholderTextColor="#9CA3AF"
                  value={editDesc}
                  onChangeText={setEditDesc}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Price ($)</Text>
                <TextInput 
                  placeholder="e.g. 22.50"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={editPrice}
                  onChangeText={setEditPrice}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Rating Score</Text>
                <TextInput 
                  placeholder="e.g. 4.8"
                  placeholderTextColor="#9CA3AF"
                  value={editRating}
                  onChangeText={setEditRating}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Image URL</Text>
                <TextInput 
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor="#9CA3AF"
                  value={editImage}
                  onChangeText={setEditImage}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts', 'Fast Food'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setEditCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl border mr-2 ${editCategory === cat ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${editCategory === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text className="text-xs font-bold text-gray-700 mb-1">Style</Text>
                <View className="flex-row space-x-2 mb-5">
                  {['Modern', 'Traditional'].map((style) => (
                    <TouchableOpacity
                      key={style}
                      onPress={() => setEditStyle(style)}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${editStyle === style ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${editStyle === style ? 'text-white' : 'text-gray-700'}`}>{style}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center">
                    <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateDish} className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/20">
                    <Text className="font-bold text-white text-sm">Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Dish Modal with Dual Image Option (URL or Device) */}
        <Modal animationType="fade" transparent={true} visible={addModalVisible} onRequestClose={() => setAddModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-[#1F130D] mb-1">Add New Menu Dish</Text>
                <Text className="text-xs text-gray-500 mb-4">Sync item directly to your live Render backend.</Text>

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

                <Text className="text-xs font-bold text-gray-700 mb-1">Rating Score</Text>
                <TextInput 
                  placeholder="e.g. 4.8"
                  placeholderTextColor="#9CA3AF"
                  value={newRating}
                  onChangeText={setNewRating}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                {/* Image Selection Option Switch */}
                <Text className="text-xs font-bold text-gray-700 mb-1">Dish Image Source</Text>
                <View className="flex-row space-x-2 mb-3">
                  <TouchableOpacity 
                    onPress={() => setImageSourceType('url')}
                    className={`flex-1 py-2 rounded-xl border items-center flex-row justify-center ${imageSourceType === 'url' ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Ionicons name="link-outline" size={14} color={imageSourceType === 'url' ? 'white' : '#757575'} style={{ marginRight: 4 }} />
                    <Text className={`text-xs font-bold ${imageSourceType === 'url' ? 'text-white' : 'text-gray-700'}`}>URL Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setImageSourceType('device')}
                    className={`flex-1 py-2 rounded-xl border items-center flex-row justify-center ${imageSourceType === 'device' ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Ionicons name="phone-portrait-outline" size={14} color={imageSourceType === 'device' ? 'white' : '#757575'} style={{ marginRight: 4 }} />
                    <Text className={`text-xs font-bold ${imageSourceType === 'device' ? 'text-white' : 'text-gray-700'}`}>Device Gallery</Text>
                  </TouchableOpacity>
                </View>

                {imageSourceType === 'url' ? (
                  <TextInput 
                    placeholder="https://images.unsplash.com/..."
                    placeholderTextColor="#9CA3AF"
                    value={newImage}
                    onChangeText={setNewImage}
                    autoCapitalize="none"
                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                  />
                ) : (
                  <View className="mb-3 items-center">
                    <TouchableOpacity 
                      onPress={pickImageFromDevice}
                      className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-2xl py-4 items-center justify-center flex-row"
                    >
                      <Ionicons name="cloud-upload-outline" size={18} color="#B8520B" style={{ marginRight: 6 }} />
                      <Text className="text-xs font-bold text-[#B8520B]">
                        {newImage ? 'Change Image from Device' : 'Pick Image from Device'}
                      </Text>
                    </TouchableOpacity>
                    {newImage ? (
                      <Text className="text-[10px] text-emerald-600 font-bold mt-1" numberOfLines={1}>Image successfully selected</Text>
                    ) : null}
                  </View>
                )}

                <Text className="text-xs font-bold text-gray-700 mb-1">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts', 'Fast Food'].map((cat) => (
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
                    <Text className="font-bold text-white text-sm">Add Dish</Text>
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