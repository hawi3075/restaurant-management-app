import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../api/backend';

export default function SupportMessageScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  
  // Reply modal state
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [managerResponse, setManagerResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchManagerTickets();
  }, []);

  const fetchManagerTickets = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${BACKEND_URL}/api/support/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets || []);
      } else {
        throw new Error(data.message || 'Failed to load support tickets.');
      }
    } catch (error) {
      console.error('Fetch Manager Tickets Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setManagerResponse(ticket.managerResponse || '');
    setSuccessMessage('');
    setReplyModalVisible(true);
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || (!selectedTicket._id && !selectedTicket.id)) {
      Alert.alert('Error', 'Invalid ticket reference.');
      return;
    }

    if (!managerResponse.trim()) {
      Alert.alert('Error', 'Please write a response before sending.');
      return;
    }

    const ticketId = selectedTicket._id || selectedTicket.id;

    try {
      setIsSubmitting(true);
      setSuccessMessage('');
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${BACKEND_URL}/api/support/${ticketId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ managerResponse })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send response.');

      setSuccessMessage('Send successfully! Response sent to the customer.');
      Alert.alert('Success', 'Response sent successfully!');
      
      // Refresh tickets list
      fetchManagerTickets();

      // Close modal after a brief moment so user sees green message
      setTimeout(() => {
        setReplyModalVisible(false);
        setSuccessMessage('');
      }, 1200);

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
          <Text className="text-xl font-black text-[#1F130D]">Manager Support</Text>
          <TouchableOpacity onPress={fetchManagerTickets}>
            <Ionicons name="reload" size={18} color="#B8520B" />
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-24">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Customer Support Tickets</Text>

          {tickets.length === 0 ? (
            <View className="bg-white p-6 rounded-3xl border border-[#EAE3DE] items-center mt-10">
              <Ionicons name="chatbubbles-outline" size={32} color="#9E9E9E" style={{ marginBottom: 8 }} />
              <Text className="text-xs font-bold text-[#1F130D] mb-1">No support requests</Text>
              <Text className="text-[11px] text-gray-400 text-center">Customer messages sent from profiles will show up here.</Text>
            </View>
          ) : (
            tickets.map((ticket, index) => (
              <View key={ticket._id || ticket.id || index} className="bg-white rounded-2xl p-4 border border-[#EAE3DE] mb-3 shadow-xs">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="w-7 h-7 bg-[#FEF7F3] rounded-full items-center justify-center mr-2">
                      <Ionicons name="person" size={12} color="#B8520B" />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-[#1F130D]">{ticket.name || 'Customer'}</Text>
                      <Text className="text-[10px] text-gray-400">{ticket.email || 'No email provided'}</Text>
                    </View>
                  </View>
                  <View className={`px-2.5 py-0.5 rounded-full ${ticket.managerResponse ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <Text className={`text-[9px] font-bold ${ticket.managerResponse ? 'text-green-700' : 'text-yellow-700'}`}>
                      {ticket.managerResponse ? 'REPLIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                <View className="bg-[#F8F9FC] p-3 rounded-xl border border-[#EAE3DE] mb-3">
                  <Text className="text-[11px] text-[#1F130D] font-medium">{ticket.message}</Text>
                </View>

                {ticket.managerResponse && (
                  <View className="bg-green-50/50 p-2.5 rounded-xl border border-green-200 mb-3">
                    <Text className="text-[10px] font-bold text-green-800 mb-0.5">Your Response:</Text>
                    <Text className="text-[11px] text-gray-700">{ticket.managerResponse}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  onPress={() => handleOpenReplyModal(ticket)}
                  className="bg-[#1F130D] py-2.5 rounded-xl items-center"
                >
                  <Text className="text-white text-xs font-bold">
                    {ticket.managerResponse ? 'Edit Response' : 'Reply'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Reply Modal */}
        <Modal visible={replyModalVisible} animationType="slide" transparent={true}>
          <View className="flex-1 bg-black/50 justify-end items-center">
            <View className="bg-white w-full max-w-[440px] rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-black text-[#1F130D]">Reply to Customer</Text>
                <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#1F130D" />
                </TouchableOpacity>
              </View>

              {/* Green Success Banner */}
              {successMessage ? (
                <View className="bg-green-50 border border-green-200 p-3 rounded-xl mb-3 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#15803D" style={{ marginRight: 6 }} />
                  <Text className="text-green-700 text-xs font-bold flex-1">{successMessage}</Text>
                </View>
              ) : null}

              {selectedTicket && (
                <View className="bg-[#F8F9FC] p-3 rounded-xl border border-[#EAE3DE] mb-4">
                  <Text className="text-[10px] font-bold text-gray-400 mb-1">CUSTOMER MESSAGE:</Text>
                  <Text className="text-xs text-[#1F130D]">{selectedTicket.message}</Text>
                </View>
              )}

              <Text className="text-[11px] font-bold text-gray-500 mb-1">Your Response</Text>
              <TextInput 
                className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-4 text-[#1F130D] h-28" 
                placeholder="Type your response here..."
                placeholderTextColor="#9E9E9E"
                multiline
                textAlignVertical="top"
                value={managerResponse}
                onChangeText={(text) => {
                  setManagerResponse(text);
                  if (successMessage) setSuccessMessage('');
                }} 
              />

              <TouchableOpacity 
                onPress={handleSendResponse} 
                disabled={isSubmitting}
                className="bg-[#B8520B] py-3.5 rounded-xl items-center flex-row justify-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-xs font-bold">Send Reply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}