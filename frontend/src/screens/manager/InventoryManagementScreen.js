import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('Kg');
  const [editSupplier, setEditSupplier] = useState('');

  const categories = ['All', 'Ingredients', 'Beverages', 'Packaging', 'Cleaning'];

  const [inventoryItems, setInventoryItems] = useState([
    { 
      id: '1', 
      name: 'White Truffle Oil', 
      category: 'Ingredients', 
      quantity: 2, 
      unit: 'Liters', 
      status: 'Low Stock', 
      supplier: 'Gourmet Imports Ltd.', 
      cost: '$45.00' 
    },
    { 
      id: '2', 
      name: 'Arborio Rice', 
      category: 'Ingredients', 
      quantity: 25, 
      unit: 'Kg', 
      status: 'Optimal', 
      supplier: 'Milan Provisions', 
      cost: '$3.50/kg' 
    },
    { 
      id: '3', 
      name: 'Fresh Forest Mushrooms', 
      category: 'Ingredients', 
      quantity: 5, 
      unit: 'Kg', 
      status: 'Medium', 
      supplier: 'Local Farm Co.', 
      cost: '$12.00/kg' 
    },
    { 
      id: '4', 
      name: 'Sparkling Water Bottles', 
      category: 'Beverages', 
      quantity: 120, 
      unit: 'Bottles', 
      status: 'Optimal', 
      supplier: 'AquaPure Distributors', 
      cost: '$1.20' 
    },
    { 
      id: '5', 
      name: 'Eco-Friendly Takeaway Boxes', 
      category: 'Packaging', 
      quantity: 15, 
      unit: 'Boxes', 
      status: 'Low Stock', 
      supplier: 'GreenPack Solutions', 
      cost: '$0.50' 
    }
  ]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/inventory');
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map(i => ({
            id: String(i._id || i.id),
            name: i.ingredientName,
            category: 'Ingredients',
            quantity: i.quantity,
            unit: i.unit,
            status: i.quantity < (i.minimumLevel || 5) ? (i.quantity < 5 ? 'Low Stock' : 'Medium') : 'Optimal',
            supplier: i.supplier || '',
            cost: i.unitCost || ''
          }));
          setInventoryItems(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch inventory', err);
      }
    };
    fetchInventory();
  }, []);

  // Form states for adding items
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Ingredients');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('Kg');
  const [newSupplier, setNewSupplier] = useState('');
  const [newCost, setNewCost] = useState('');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Low Stock':
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' };
      case 'Medium':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' };
      case 'Optimal':
      default:
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' };
    }
  };

  const handleAddItem = () => {
    if (!newName || !newQuantity) return;
    const qty = parseInt(newQuantity) || 0;
    const payload = {
      name: newName,
      quantity: qty,
      unit: newUnit,
      supplier: newSupplier,
      minimumLevel: 5
    };
    fetch('http://localhost:5000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(j => {
      if (j.success && j.item) {
        const i = j.item;
        const mapped = {
          id: String(i._id || i.id),
          name: i.ingredientName,
          category: 'Ingredients',
          quantity: i.quantity,
          unit: i.unit,
          status: i.quantity < (i.minimumLevel || 5) ? (i.quantity < 5 ? 'Low Stock' : 'Medium') : 'Optimal',
          supplier: i.supplier || '',
          cost: ''
        };
        setInventoryItems(prev => [mapped, ...prev]);
        setNewName('');
        setNewQuantity('');
        setNewSupplier('');
        setNewCost('');
        setAddModalVisible(false);
      } else {
        alert('Failed to add inventory item');
      }
    }).catch(err => {
      console.error('Add inventory error', err);
      alert('Failed to add inventory item');
    });
  };

  const updateQuantity = (id, amount) => {
    // Optimistic update
    setInventoryItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedQty = Math.max(0, item.quantity + amount);
        let status = 'Optimal';
        if (updatedQty < 5) status = 'Low Stock';
        else if (updatedQty < 15) status = 'Medium';
        return { ...item, quantity: updatedQty, status };
      }
      return item;
    }));

    fetch(`http://localhost:5000/api/inventory/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    }).then(r => r.json()).then(j => {
      if (!j.success) console.warn('Failed to adjust inventory', j);
    }).catch(err => console.error('Adjust error', err));
  };

  const openEditItem = (item) => {
    setSelectedItem(item);
    setEditName(item.name || '');
    setEditQuantity(String(item.quantity || ''));
    setEditUnit(item.unit || 'Kg');
    setEditSupplier(item.supplier || '');
    setEditModalVisible(true);
  };

  const confirmDeleteItem = (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this inventory item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(id) }
    ]);
  };

  const handleDeleteItem = async (id) => {
    try {
      console.log('Deleting inventory id=', id);
      const res = await fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' });
      const j = await res.json();
      console.log('Delete response', j);
      if (j.success) setInventoryItems(prev => prev.filter(i => String(i.id || i._id) !== String(id)));
      else Alert.alert('Error', j.message || 'Failed to delete');
    } catch (err) {
      console.error('Delete inventory error', err);
      Alert.alert('Error', 'Failed to delete');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        name: editName,
        quantity: parseInt(editQuantity) || 0,
        unit: editUnit,
        supplier: editSupplier
      };
      const id = selectedItem.id || selectedItem._id;
      const res = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.success && j.item) {
        const i = j.item;
        const mapped = {
          id: String(i._id || i.id),
          name: i.ingredientName,
          category: 'Ingredients',
          quantity: i.quantity,
          unit: i.unit,
          status: i.quantity < (i.minimumLevel || 5) ? (i.quantity < 5 ? 'Low Stock' : 'Medium') : 'Optimal',
          supplier: i.supplier || '',
          cost: i.unitCost || ''
        };
        setInventoryItems(prev => prev.map(it => (it.id === mapped.id || it._id === mapped.id ? mapped : it)));
        setEditModalVisible(false);
      } else {
        alert('Failed to update item');
      }
    } catch (err) {
      console.error('Update inventory error', err);
      alert('Failed to update item');
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
                <Text className="text-2xl font-black text-[#1F130D]">Inventory Stock</Text>
                <Text className="text-xs text-gray-500">Track supplies, stock levels & vendors</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setAddModalVisible(true)} 
              className="bg-[#B8520B] px-4 py-2.5 rounded-2xl flex-row items-center shadow-md shadow-[#B8520B]/30 active:scale-95"
            >
              <Ionicons name="add" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="font-bold text-xs text-white">Add Item</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white border border-[#EAE3DE] rounded-2xl px-4 py-3 mb-4 shadow-xs">
            <Ionicons name="search-outline" size={18} color="#757575" />
            <TextInput 
              placeholder="Search stock items or suppliers..." 
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-sm text-[#1F130D] font-medium"
            />
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

          {/* Inventory List */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-gray-400 mb-2">{selectedCategory} Inventory ({filteredItems.length})</Text>
            {filteredItems.map((item) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <View 
                  key={item.id} 
                  className="bg-white p-4 rounded-3xl border border-[#EAE3DE] mb-4 shadow-xs"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="font-bold text-sm text-[#1F130D]" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-xs text-gray-400 mt-0.5">Available: <Text className="font-bold text-[#1F130D]">{item.quantity} {item.unit}</Text></Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.border}`}>
                      <Text className={`text-[10px] font-bold ${statusStyle.text}`}>{item.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <View>
                      <Text className="text-[10px] text-gray-400">Supplier</Text>
                      <Text className="text-xs font-semibold text-[#1F130D]">{item.supplier}</Text>
                    </View>

                    {/* Quick Adjustment & Detail Buttons */}
                    <View className="flex-row items-center space-x-2">
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center border border-gray-200 active:scale-95"
                      >
                        <Ionicons name="remove" size={14} color="#1F130D" />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-[#FEF7F3] rounded-xl items-center justify-center border border-[#B8520B]/30 active:scale-95"
                      >
                        <Ionicons name="add" size={14} color="#B8520B" />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        onPress={() => {
                          setSelectedItem(item);
                          setDetailModalVisible(true);
                        }}
                        className="px-3 h-8 bg-gray-100 rounded-xl items-center justify-center border border-gray-200 active:scale-95 ml-1"
                      >
                        <Text className="text-[10px] font-bold text-[#1F130D]">Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openEditItem(item)}
                        className="px-3 h-8 bg-white rounded-xl items-center justify-center border border-gray-200 active:scale-95 ml-1"
                      >
                        <Text className="text-[10px] font-bold text-[#1F130D]">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDeleteItem(item.id)}
                        className="px-3 h-8 bg-rose-50 rounded-xl items-center justify-center border border-rose-100 active:scale-95 ml-1"
                      >
                        <Text className="text-[10px] font-bold text-rose-600">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Item Detail Modal */}
        <Modal animationType="fade" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100">
              {selectedItem && (
                <View>
                  <View className="items-center mb-4">
                    <View className="w-16 h-16 bg-[#FEF7F3] rounded-2xl items-center justify-center mb-3 border border-[#B8520B]/30">
                      <Ionicons name="cube-outline" size={28} color="#B8520B" />
                    </View>
                    <Text className="text-xl font-black text-[#1F130D] text-center">{selectedItem.name}</Text>
                    <Text className="text-xs text-gray-400 mt-0.5">{selectedItem.category}</Text>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5 mb-5">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Stock Quantity:</Text>
                      <Text className="text-xs font-bold text-[#1F130D]">{selectedItem.quantity} {selectedItem.unit}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Status:</Text>
                      <Text className="text-xs font-bold text-[#B8520B]">{selectedItem.status}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Supplier:</Text>
                      <Text className="text-xs font-bold text-[#1F130D]">{selectedItem.supplier}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Unit Cost:</Text>
                      <Text className="text-xs font-black text-[#B8520B]">{selectedItem.cost}</Text>
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

        {/* Edit Item Modal */}
        <Modal animationType="fade" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-[#1F130D] mb-1">Edit Inventory Item</Text>

                <Text className="text-xs font-bold text-gray-700 mb-1">Item Name</Text>
                <TextInput value={editName} onChangeText={setEditName} className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3" />

                <View className="flex-row space-x-2 mb-3">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-700 mb-1">Quantity</Text>
                    <TextInput value={editQuantity} onChangeText={setEditQuantity} keyboardType="numeric" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D]" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-700 mb-1">Unit</Text>
                    <TextInput value={editUnit} onChangeText={setEditUnit} className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D]" />
                  </View>
                </View>

                <Text className="text-xs font-bold text-gray-700 mb-1">Supplier</Text>
                <TextInput value={editSupplier} onChangeText={setEditSupplier} className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-4" />

                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center">
                    <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSaveEdit} className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/20">
                    <Text className="font-bold text-white text-sm">Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Item Modal */}
        <Modal animationType="fade" transparent={true} visible={addModalVisible} onRequestClose={() => setAddModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-[#1F130D] mb-1">Add Inventory Stock</Text>
                <Text className="text-xs text-gray-500 mb-4">Register new stock items and quantities.</Text>

                <Text className="text-xs font-bold text-gray-700 mb-1">Item Name</Text>
                <TextInput 
                  placeholder="e.g. Organic Olive Oil"
                  placeholderTextColor="#9CA3AF"
                  value={newName}
                  onChangeText={setNewName}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {['Ingredients', 'Beverages', 'Packaging', 'Cleaning'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl border mr-2 ${newCategory === cat ? 'bg-[#B8520B] border-[#B8520B]' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${newCategory === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View className="flex-row space-x-2 mb-3">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-700 mb-1">Quantity</Text>
                    <TextInput 
                      placeholder="e.g. 10"
                      placeholderTextColor="#9CA3AF"
                      keyboardDataType="numeric"
                      value={newQuantity}
                      onChangeText={setNewQuantity}
                      className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D]"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-700 mb-1">Unit</Text>
                    <TextInput 
                      placeholder="e.g. Kg / Liters"
                      placeholderTextColor="#9CA3AF"
                      value={newUnit}
                      onChangeText={setNewUnit}
                      className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D]"
                    />
                  </View>
                </View>

                <Text className="text-xs font-bold text-gray-700 mb-1">Supplier Name</Text>
                <TextInput 
                  placeholder="e.g. Global Foods Inc."
                  placeholderTextColor="#9CA3AF"
                  value={newSupplier}
                  onChangeText={setNewSupplier}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-3"
                />

                <Text className="text-xs font-bold text-gray-700 mb-1">Unit Cost ($)</Text>
                <TextInput 
                  placeholder="e.g. 15.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={newCost}
                  onChangeText={setNewCost}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#1F130D] mb-5"
                />

                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => setAddModalVisible(false)} className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center">
                    <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddItem} className="flex-1 bg-[#B8520B] py-3.5 rounded-2xl items-center shadow-md shadow-[#B8520B]/20">
                    <Text className="font-bold text-white text-sm">Save Item</Text>
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