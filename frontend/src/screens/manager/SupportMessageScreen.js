import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
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
      <View className="flex-1 bg-[#F8F9FC] items-center justify-center">
        <ActivityIndicator size="large" color="#B8520B" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={20} color="#1F130D" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-[#1F130D]">Manager Support Hub</Text>
          </View>
          <TouchableOpacity onPress={() => fetchManagerTickets()}>
            <Ionicons name="reload" size={18} color="#B8520B" />
          </TouchableOpacity>
        </View>

        {/* Tickets List Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-24">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider">
            Customer Inquiries ({tickets.length})
          </Text>

          {tickets.length === 0 ? (
            <View className="bg-white p-6 rounded-3xl border border-[#EAE3DE] items-center mt-10">
              <Ionicons name="chatbubbles-outline" size={40} color="#9E9E9E" style={{ marginBottom: 10 }} />
              <Text className="text-sm font-bold text-[#1F130D] mb-1">No support tickets found</Text>
              <Text className="text-xs text-gray-400 text-center">When customers submit messages from their profile, they will appear here.</Text>
            </View>
          ) : (
            tickets.map((ticket, index) => {
              const replyText = ticket.managerResponse || ticket.reply;
              const isResolved = replyText && replyText.trim() !== '';
              return (
                <TouchableOpacity 
                  key={ticket._id || index}
                  onPress={() => handleOpenReplyModal(ticket)}
                  className="bg-white p-4 rounded-2xl border border-[#EAE3DE] mb-3 shadow-xs active:opacity-90"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View className="w-7 h-7 bg-[#FEF7F3] rounded-full items-center justify-center mr-2">
                        <Ionicons name="person" size={13} color="#B8520B" />
                      </View>
                      <Text className="text-xs font-bold text-[#1F130D]">{ticket.name || 'Customer'}</Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-full ${isResolved ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <Text className={`text-[9px] font-bold ${isResolved ? 'text-green-700' : 'text-yellow-700'}`}>
                        {isResolved ? 'Replied' : 'Needs Reply'}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs text-gray-800 font-medium mb-1">Customer: "{ticket.message}"</Text>
                  
                  {isResolved && (
                    <Text className="text-[11px] text-green-700 bg-green-50 p-2 rounded-xl mt-1 mb-1">
                      Manager Reply: "{replyText}"
                    </Text>
                  )}

                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 mt-2">
                    <Text className="text-[10px] text-gray-400">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                    </Text>
                    <Text className="text-[11px] font-bold text-[#B8520B]">
                      {isResolved ? 'Edit Response →' : 'Reply Now →'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Reply Modal */}
        <Modal visible={replyModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6 max-h-[85%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Respond to Ticket</Text>
                <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              {selectedTicket && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Customer info card */}
                  <View className="bg-[#FEF7F3] p-3.5 rounded-2xl border border-[#B8520B]/20 mb-4">
                    <Text className="text-[10px] font-bold text-[#B8520B] uppercase mb-1">Customer Details</Text>
                    <Text className="text-xs font-bold text-[#1F130D]">{selectedTicket.name} ({selectedTicket.email})</Text>
                    <Text className="text-xs text-gray-700 mt-2 italic">"{selectedTicket.message}"</Text>
                  </View>

                  <Text className="text-xs font-bold text-[#1F130D] mb-1">Manager Response</Text>
                  <Text className="text-[11px] text-gray-500 mb-3">Type your instructions or answer below. This will instantly show up on the customer's profile screen.</Text>

                  <TextInput 
                    className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-4 text-[#1F130D] h-32" 
                    placeholder="Write manager reply here..."
                    placeholderTextColor="#9E9E9E"
                    multiline
                    textAlignVertical="top"
                    value={managerResponseText}
                    onChangeText={setManagerResponseText} 
                  />

                  <TouchableOpacity 
                    onPress={handleSendResponse} 
                    disabled={isSubmitting}
                    className="bg-[#B8520B] py-3.5 rounded-xl items-center flex-row justify-center mb-4"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-white text-xs font-bold">Send Response to Customer</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}