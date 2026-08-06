import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StaffManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form states for adding staff
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newShift, setNewShift] = useState('08:00 AM - 04:00 PM');

  // Custom Time Interval States
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [shiftMode, setShiftMode] = useState('preset');

  const [staffList, setStaffList] = useState([
    { 
      id: '1', 
      name: 'Abebe Bekele', 
      role: 'Head Chef', 
      email: 'abebe.chef@restaurant.com', 
      phone: '+251 91 112 2334', 
      shift: '06:00 AM - 02:00 PM', 
      status: 'On Duty' 
    },
    { 
      id: '2', 
      name: 'Mekdes Tadesse', 
      role: 'Cashier', 
      email: 'mekdes.cashier@restaurant.com', 
      phone: '+251 92 334 4556', 
      shift: '02:00 PM - 10:00 PM', 
      status: 'Off Duty' 
    },
    { 
      id: '3', 
      name: 'Samuel Lemma', 
      role: 'Delivery Driver', 
      email: 'samuel.driver@restaurant.com', 
      phone: '+251 93 556 7788', 
      shift: '09:00 AM - 09:00 PM', 
      status: 'On Duty' 
    },
  ]);

  const categories = ['All', 'Head Chef', 'Cashier', 'Delivery Driver', 'Waiter'];

  const presetShifts = [
    '06:00 AM - 02:00 PM (Morning)',
    '02:00 PM - 10:00 PM (Evening)',
    '10:00 PM - 06:00 AM (Night)',
    '09:00 AM - 09:00 PM (Full Day)',
  ];

  const toggleDutyStatus = (id) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, status: s.status === 'On Duty' ? 'Off Duty' : 'On Duty' } : s));
  };

  const handleAddStaff = () => {
    if (!newName || !newRole || !newEmail || !newPhone) return;
    const assignedShift = shiftMode === 'custom' ? `${startTime} - ${endTime}` : newShift;
    const newMember = {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      email: newEmail,
      phone: newPhone,
      shift: assignedShift,
      status: 'On Duty',
    };
    setStaffList([...staffList, newMember]);
    setNewName('');
    setNewRole('');
    setNewEmail('');
    setNewPhone('');
    setAddModalVisible(false);
  };

  const handleUpdateShift = () => {
    const updatedShiftString = shiftMode === 'custom' ? `${startTime} - ${endTime}` : newShift;
    setStaffList(staffList.map(s => s.id === selectedStaff.id ? { ...s, shift: updatedShiftString } : s));
    setShiftModalVisible(false);
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.role.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const onDutyCount = staffList.filter(s => s.status === 'On Duty').length;

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-slate-100">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Header */}
        <View className="pt-12 pb-4 px-6 bg-white border-b border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-slate-50 rounded-2xl border border-slate-200 items-center justify-center active:scale-95"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Time & Operations</Text>
              <Text className="text-xl font-black text-slate-900">Staff Management</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => setAddModalVisible(true)}
            className="w-10 h-10 bg-orange-500 rounded-2xl items-center justify-center shadow-md shadow-orange-500/30 active:scale-95"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5 pb-24">
          
          {/* Metrics summary banner */}
          <View className="flex-row space-x-3 mb-5">
            <View className="flex-1 bg-orange-50 border border-orange-100 p-4 rounded-3xl">
              <Text className="text-[10px] font-bold text-orange-600 uppercase">Total Team</Text>
              <Text className="text-xl font-black text-slate-900 mt-1">{staffList.length} Members</Text>
            </View>
            <View className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-3xl">
              <Text className="text-[10px] font-bold text-emerald-600 uppercase">Currently On Duty</Text>
              <Text className="text-xl font-black text-slate-900 mt-1">{onDutyCount} Active</Text>
            </View>
          </View>

          {/* Search bar */}
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-4 shadow-sm">
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput 
              placeholder="Search staff name or role..." 
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-sm text-slate-900 font-medium"
            />
          </View>

          {/* Position Category Filter List */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 space-x-2">
            {categories.map((cat, index) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-2xl border mr-2 ${isSelected ? 'bg-orange-500 border-orange-500 shadow-sm shadow-orange-500/30' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Staff List Cards */}
          <View className="space-y-3">
            {filteredStaff.map((member) => (
              <View 
                key={member.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-3 relative overflow-hidden"
              >
                {/* Top Row: Avatar, Position Badge, Name, Detail Icon & Status Button */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center space-x-3 flex-1 mr-2">
                    <View className="w-11 h-11 rounded-2xl bg-orange-500/10 items-center justify-center border border-orange-500/20 shrink-0">
                      <Text className="font-black text-orange-600 text-base">{member.name.charAt(0)}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="self-start bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full mb-1">
                        <Text className="text-[10px] font-black text-orange-600 uppercase">{member.role}</Text>
                      </View>
                      <Text className="text-base font-black text-slate-900">{member.name}</Text>
                      <Text className="text-xs text-slate-500 mt-0.5 font-medium">{member.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    {/* Replaced Call Icon with Detail Icon */}
                    <TouchableOpacity 
                      onPress={() => {
                        // Handle viewing staff details here (e.g. open profile or alert)
                        alert(`Staff Details:\nName: ${member.name}\nRole: ${member.role}\nEmail: ${member.email}\nPhone: ${member.phone}`);
                      }}
                      className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 items-center justify-center shadow-sm active:scale-95"
                    >
                      <Ionicons name="information-circle-outline" size={18} color="#F97316" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleDutyStatus(member.id)}
                      className={`px-3 py-1.5 rounded-full border shrink-0 ${member.status === 'On Duty' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}
                    >
                      <Text className={`text-[10px] font-bold ${member.status === 'On Duty' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {member.status}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Shift Details Box */}
                <View className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-2 flex-1 mr-2">
                    <Ionicons name="time-outline" size={15} color="#F97316" />
                    <Text className="text-xs font-bold text-slate-700" numberOfLines={1}>Shift: {member.shift}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedStaff(member);
                      setShiftMode('preset');
                      setShiftModalVisible(true);
                    }}
                    className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl shrink-0"
                  >
                    <Text className="text-[11px] font-bold text-orange-600">Change Time</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Add Staff Modal */}
        <Modal animationType="fade" transparent={true} visible={addModalVisible} onRequestClose={() => setAddModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-slate-900 mb-1">Add New Staff Member</Text>
                <Text className="text-xs text-slate-500 mb-4">Register credentials and assign shift hours.</Text>

                <Text className="text-xs font-bold text-slate-700 mb-1">Full Name</Text>
                <TextInput 
                  placeholder="e.g. Dawit Tadesse"
                  placeholderTextColor="#94A3B8"
                  value={newName}
                  onChangeText={setNewName}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 mb-3"
                />

                <Text className="text-xs font-bold text-slate-700 mb-1">Role / Position</Text>
                <TextInput 
                  placeholder="e.g. Waiter, Chef, Cashier"
                  placeholderTextColor="#94A3B8"
                  value={newRole}
                  onChangeText={setNewRole}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 mb-3"
                />

                <Text className="text-xs font-bold text-slate-700 mb-1">Email Address</Text>
                <TextInput 
                  placeholder="e.g. dawit@restaurant.com"
                  placeholderTextColor="#94A3B8"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 mb-3"
                />

                <Text className="text-xs font-bold text-slate-700 mb-1">Phone Number</Text>
                <TextInput 
                  placeholder="e.g. +251 91 000 0000"
                  placeholderTextColor="#94A3B8"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 mb-4"
                />

                {/* Mode Selector */}
                <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-4">
                  <TouchableOpacity 
                    onPress={() => setShiftMode('preset')}
                    className={`flex-1 py-2 rounded-xl items-center ${shiftMode === 'preset' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${shiftMode === 'preset' ? 'text-orange-600' : 'text-slate-500'}`}>Preset Shifts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setShiftMode('custom')}
                    className={`flex-1 py-2 rounded-xl items-center ${shiftMode === 'custom' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${shiftMode === 'custom' ? 'text-orange-600' : 'text-slate-500'}`}>Custom Interval</Text>
                  </TouchableOpacity>
                </View>

                {shiftMode === 'preset' ? (
                  <View className="space-y-2 mb-5">
                    {presetShifts.map((s, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setNewShift(s)}
                        className={`p-3 rounded-xl border flex-row justify-between items-center ${newShift === s ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${newShift === s ? 'text-orange-600' : 'text-slate-700'}`}>{s}</Text>
                        {newShift === s && <Ionicons name="checkmark-circle" size={16} color="#F97316" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className="mb-5 space-y-3">
                    <View>
                      <Text className="text-[11px] font-bold text-slate-600 mb-1">Start Time Interval</Text>
                      <TextInput 
                        placeholder="e.g. 08:00 AM"
                        placeholderTextColor="#94A3B8"
                        value={startTime}
                        onChangeText={setStartTime}
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900"
                      />
                    </View>
                    <View>
                      <Text className="text-[11px] font-bold text-slate-600 mb-1">End Time Interval</Text>
                      <TextInput 
                        placeholder="e.g. 05:00 PM"
                        placeholderTextColor="#94A3B8"
                        value={endTime}
                        onChangeText={setEndTime}
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900"
                      />
                    </View>
                  </View>
                )}

                <View className="flex-row space-x-3 mt-2">
                  <TouchableOpacity onPress={() => setAddModalVisible(false)} className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center">
                    <Text className="font-bold text-slate-700 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddStaff} className="flex-1 bg-orange-500 py-3.5 rounded-2xl items-center shadow-md shadow-orange-500/20">
                    <Text className="font-bold text-white text-sm">Add Staff</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Change Time / Shift Modal */}
        <Modal animationType="fade" transparent={true} visible={shiftModalVisible} onRequestClose={() => setShiftModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90%]">
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-black text-slate-900 mb-1">Update Shift Schedule</Text>
                <Text className="text-xs text-slate-500 mb-4">Set work interval for <Text className="font-bold text-slate-900">{selectedStaff?.name}</Text></Text>

                {/* Mode Selector */}
                <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-4">
                  <TouchableOpacity 
                    onPress={() => setShiftMode('preset')}
                    className={`flex-1 py-2 rounded-xl items-center ${shiftMode === 'preset' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${shiftMode === 'preset' ? 'text-orange-600' : 'text-slate-500'}`}>Preset Shifts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setShiftMode('custom')}
                    className={`flex-1 py-2 rounded-xl items-center ${shiftMode === 'custom' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${shiftMode === 'custom' ? 'text-orange-600' : 'text-slate-500'}`}>Custom Interval</Text>
                  </TouchableOpacity>
                </View>

                {shiftMode === 'preset' ? (
                  <View className="space-y-2 mb-5">
                    {presetShifts.map((s, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setNewShift(s)}
                        className={`p-3.5 rounded-2xl border flex-row justify-between items-center ${newShift === s ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${newShift === s ? 'text-orange-600' : 'text-slate-700'}`}>{s}</Text>
                        {newShift === s && <Ionicons name="checkmark-circle" size={18} color="#F97316" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className="mb-5 space-y-3">
                    <View>
                      <Text className="text-[11px] font-bold text-slate-600 mb-1">Start Time Interval</Text>
                      <TextInput 
                        placeholder="e.g. 10:00 AM"
                        placeholderTextColor="#94A3B8"
                        value={startTime}
                        onChangeText={setStartTime}
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900"
                      />
                    </View>
                    <View>
                      <Text className="text-[11px] font-bold text-slate-600 mb-1">End Time Interval</Text>
                      <TextInput 
                        placeholder="e.g. 06:00 PM"
                        placeholderTextColor="#94A3B8"
                        value={endTime}
                        onChangeText={setEndTime}
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900"
                      />
                    </View>
                  </View>
                )}

                <View className="flex-row space-x-3 mt-2">
                  <TouchableOpacity onPress={() => setShiftModalVisible(false)} className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center">
                    <Text className="font-bold text-slate-700 text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateShift} className="flex-1 bg-orange-500 py-3.5 rounded-2xl items-center shadow-md shadow-orange-500/20">
                    <Text className="font-bold text-white text-sm">Save Shift</Text>
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