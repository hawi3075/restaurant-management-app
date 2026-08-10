import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../api/backend';

export default function CheckoutScreen({ route, navigation }) {
  const totalAmount = route?.params?.total ?? 40.99;

  const [serviceType, setServiceType] = useState('delivery'); // 'delivery' or 'dine-in'
  
  // Customer Form State
  const [fullName, setFullName] = useState('Jane Doe');
  const [streetAddress, setStreetAddress] = useState('123 Main St, Apt 4B');
  const [city, setCity] = useState('New York');
  const [phone, setPhone] = useState('+251 911 234 567');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');

  const handlePlaceOrder = () => {
    if (!fullName || !streetAddress || !phone) {
      Alert.alert('Missing Fields', 'Please fill in all required delivery details.');
      return;
    }
    
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        // Build order items from route cartItems or from defaults
        let items = route?.params?.cartItems || [];
        if ((!items || items.length === 0)) {
          // Try load from persisted cart
          const stored = await AsyncStorage.getItem('cart');
          items = stored ? JSON.parse(stored) : [];
        }
        const orderItems = items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price, menuItem: i.id }));

        const payload = {
          customer: null,
          table: route?.params?.selectedTableId || null,
          waiter: null,
          orderItems,
          totalAmount,
          specialInstructions: ''
        };

        const res = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to place order');

        Alert.alert('Order Placed Successfully!', 'Your order has been sent to the kitchen.', [
          { text: 'View Orders', onPress: () => navigation.navigate('OrderHistoryScreen') }
        ]);
      } catch (err) {
        console.error('Place Order Error:', err);
        Alert.alert('Order Failed', err.message || 'Unable to place order');
      }
    })();
  };

  return (
    <View className="flex-1 bg-[#F8F9FC] items-center">
      <View className="w-full max-w-[440px] flex-1 bg-[#F8F9FC] relative shadow-2xl">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />

        {/* Top Header */}
        <View className="pt-12 px-5 pb-4 bg-white border-b border-[#EAE3DE] flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
            <Text className="text-xs font-bold text-[#B8520B]">Close</Text>
          </TouchableOpacity>
          <Text className="text-base font-black text-[#1F130D]">Checkout</Text>
          <View style={{ width: 35 }} />
        </View>

        {/* Form Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-32">
          
          {/* Service Type Selection */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Service Type</Text>
          <View className="flex-row space-x-3 mb-5">
            <TouchableOpacity 
              onPress={() => setServiceType('delivery')}
              className={`flex-1 flex-row items-center justify-center p-3.5 rounded-2xl border ${serviceType === 'delivery' ? 'bg-[#FEF7F3] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
            >
              <Ionicons name="car-outline" size={18} color={serviceType === 'delivery' ? '#B8520B' : '#757575'} />
              <Text className={`text-xs font-bold ml-2 ${serviceType === 'delivery' ? 'text-[#B8520B]' : 'text-gray-500'}`}>Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setServiceType('dine-in')}
              className={`flex-1 flex-row items-center justify-center p-3.5 rounded-2xl border ${serviceType === 'dine-in' ? 'bg-[#FEF7F3] border-[#B8520B]' : 'bg-white border-[#EAE3DE]'}`}
            >
              <Ionicons name="restaurant-outline" size={18} color={serviceType === 'dine-in' ? '#B8520B' : '#757575'} />
              <Text className={`text-xs font-bold ml-2 ${serviceType === 'dine-in' ? 'text-[#B8520B]' : 'text-gray-500'}`}>Dine-in</Text>
            </TouchableOpacity>
          </View>

          {/* Customer Form Inputs */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">
            {serviceType === 'delivery' ? 'Delivery Details' : 'Reservation & Guest Details'}
          </Text>
          
          <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-5 shadow-xs">
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Full Name</Text>
            <TextInput 
              className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" 
              value={fullName} 
              onChangeText={setFullName} 
              placeholder="Enter full name"
            />

            <Text className="text-[10px] font-bold text-gray-500 mb-1">Street Address</Text>
            <TextInput 
              className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs mb-3 text-[#1F130D]" 
              value={streetAddress} 
              onChangeText={setStreetAddress} 
              placeholder="House/Apt and street"
            />

            <View className="flex-row space-x-2 mb-3">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-gray-500 mb-1">City</Text>
                <TextInput 
                  className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs text-[#1F130D]" 
                  value={city} 
                  onChangeText={setCity} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-gray-500 mb-1">Phone Number</Text>
                <TextInput 
                  className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs text-[#1F130D]" 
                  value={phone} 
                  onChangeText={setPhone} 
                />
              </View>
            </View>
          </View>

          {/* Payment Method with Telebirr */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Payment Method</Text>
          <View className="bg-white rounded-2xl border border-[#EAE3DE] p-3 mb-6 shadow-xs">
            
            {/* Telebirr Option */}
            <TouchableOpacity 
              onPress={() => setPaymentMethod('telebirr')}
              className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${paymentMethod === 'telebirr' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-50 rounded-xl items-center justify-center mr-3 border border-blue-200">
                  <Ionicons name="phone-portrait-outline" size={16} color="#0052CC" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#1F130D]">Telebirr</Text>
                  <Text className="text-[9px] text-gray-400">Fast mobile wallet payment</Text>
                </View>
              </View>
              <Ionicons name={paymentMethod === 'telebirr' ? "radio-button-on" : "radio-button-off"} size={16} color="#B8520B" />
            </TouchableOpacity>

            {/* Credit Card Option */}
            <TouchableOpacity 
              onPress={() => setPaymentMethod('card')}
              className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${paymentMethod === 'card' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="card-outline" size={16} color="#757575" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Credit / Debit Card</Text>
              </View>
              <Ionicons name={paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"} size={16} color="#B8520B" />
            </TouchableOpacity>

            {/* Cash on Delivery Option */}
            <TouchableOpacity 
              onPress={() => setPaymentMethod('cash')}
              className={`flex-row items-center justify-between p-3 rounded-xl ${paymentMethod === 'cash' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={16} color="#757575" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Cash on Delivery</Text>
              </View>
              <Ionicons name={paymentMethod === 'cash' ? "radio-button-on" : "radio-button-off"} size={16} color="#B8520B" />
            </TouchableOpacity>
          </View>

          {/* Total & Checkout Action */}
          <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-4 shadow-xs">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs text-gray-500">Total Payable</Text>
              <Text className="text-base font-black text-[#B8520B]">${totalAmount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              onPress={handlePlaceOrder}
              className="bg-[#B8520B] py-4 rounded-xl items-center shadow-md active:opacity-95"
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Place Order Now</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}