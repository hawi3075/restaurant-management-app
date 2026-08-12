import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../api/backend';

export default function ManagerSupportScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [managerResponseText, setManagerResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);

  // Fetch all support tickets on load and poll every 10 seconds
  useEffect(() => {
    fetchManagerTickets();

    const interval = setInterval(() => {
      fetchManagerTickets(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchManagerTickets = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/support/manager/tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Fetch Manager Tickets Error:', error);
      if (!isPolling) {
        Alert.alert('Error', 'Failed to load support tickets.');
      }
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  const handleOpenReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setManagerResponseText(ticket.managerResponse || ticket.reply || '');
    setReplyModalVisible(true);
  };

  const handleSendResponse = async () => {
    if (!managerResponseText.trim()) {
      Alert.alert('Error', 'Please type a response before sending.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/support/manager/reply/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ managerResponse: managerResponseText, reply: managerResponseText })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send response.');

      Alert.alert('Success', 'Response sent successfully to the customer!');
      setReplyModalVisible(false);
      fetchManagerTickets(); // Refresh list
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
      <View className="w-full max-w-[440px] flex-1 bg-white relative shadow-2xl overflow-hidden border-x border-slate-100">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-slate-100 flex-row justify-between items-center">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-slate-50 rounded-2xl border border-slate-200 items-center justify-center active:scale-95"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Management</Text>
              <Text className="text-xl font-black text-slate-900">Support Hub</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => fetchManagerTickets()}
            className="w-10 h-10 bg-orange-50 rounded-2xl border border-orange-200 items-center justify-center active:scale-95"
          >
            <Ionicons name="reload" size={18} color="#F97316" />
          </TouchableOpacity>
        </View>

        {/* Tickets List Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-24">
          <Text className="text-xs font-bold text-slate-400 uppercase mb-3 ml-1 tracking-wider">
            Customer Inquiries ({tickets.length})
          </Text>

          {tickets.length === 0 ? (
            <View className="bg-white p-6 rounded-3xl border border-slate-200 items-center mt-10 shadow-sm">
              <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center mb-3 border border-orange-100">
                <Ionicons name="chatbubbles-outline" size={30} color="#F97316" />
              </View>
              <Text className="text-sm font-bold text-slate-900 mb-1">No support tickets found</Text>
              <Text className="text-xs text-slate-400 text-center">When customers submit messages from their profile, they will appear here.</Text>
            </View>
          ) : (
            tickets.map((ticket, index) => {
              const replyText = ticket.managerResponse || ticket.reply;
              const isResolved = replyText && replyText.trim() !== '';
              return (
                <TouchableOpacity 
                  key={ticket._id || index}
                  onPress={() => handleOpenReplyModal(ticket)}
                  className="bg-white p-4 rounded-3xl border border-slate-200 mb-3 shadow-sm active:scale-[0.99]"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center space-x-2">
                      <View className="w-8 h-8 bg-orange-50 rounded-xl items-center justify-center border border-orange-200">
                        <Ionicons name="person" size={14} color="#F97316" />
                      </View>
                      <Text className="text-xs font-bold text-slate-900">{ticket.name || 'Customer'}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full border ${isResolved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                      <Text className={`text-[10px] font-bold ${isResolved ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isResolved ? 'Replied' : 'Needs Reply'}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs text-slate-700 font-medium mb-2">Customer: "{ticket.message}"</Text>
                  
                  {isResolved && (
                    <View className="bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100 mt-1 mb-2">
                      <Text className="text-[11px] text-emerald-800 font-medium">
                        Manager Reply: "{replyText}"
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center pt-2.5 border-t border-slate-100 mt-1">
                    <Text className="text-[10px] text-slate-400 font-medium">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                    </Text>
                    <Text className="text-[11px] font-bold text-orange-500">
                      {isResolved ? 'Edit Response →' : 'Reply Now →'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Reply Modal */}
        <Modal visible={replyModalVisible} animationType="fade" transparent={true} onRequestClose={() => setReplyModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-slate-900">Respond to Ticket</Text>
                <TouchableOpacity 
                  onPress={() => setReplyModalVisible(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {selectedTicket && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Customer info card */}
                  <View className="bg-orange-50 p-3.5 rounded-2xl border border-orange-200 mb-4">
                    <Text className="text-[10px] font-bold text-orange-600 uppercase mb-1">Customer Details</Text>
                    <Text className="text-xs font-bold text-slate-900">{selectedTicket.name} ({selectedTicket.email})</Text>
                    <Text className="text-xs text-slate-700 mt-1.5 italic">"{selectedTicket.message}"</Text>
                  </View>

                  <Text className="text-xs font-bold text-slate-900 mb-1">Manager Response</Text>
                  <Text className="text-[11px] text-slate-500 mb-3">Type your instructions or answer below. This will instantly show up on the customer's profile screen.</Text>

                  <TextInput 
                    className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs mb-5 text-slate-900 h-32" 
                    placeholder="Write manager reply here..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    textAlignVertical="top"
                    value={managerResponseText}
                    onChangeText={setManagerResponseText} 
                  />

                  <View className="flex-row space-x-3">
                    <TouchableOpacity 
                      onPress={() => setReplyModalVisible(false)} 
                      className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center"
                    >
                      <Text className="font-bold text-slate-700 text-sm">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={handleSendResponse} 
                      disabled={isSubmitting}
                      className="flex-1 bg-orange-500 py-3.5 rounded-2xl items-center justify-center shadow-md shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text className="text-white text-xs font-bold">Send Response</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}