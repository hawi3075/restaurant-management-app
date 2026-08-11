import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../api/backend';

export default function CheckoutScreen({ route, navigation }) {
  const initialTotal = route?.params?.total ?? 40.99;

  const [serviceType, setServiceType] = useState('delivery'); // 'delivery' or 'dine-in'
  
  // Customer Form State
  const [fullName, setFullName] = useState('Jane Doe');
  const [streetAddress, setStreetAddress] = useState('123 Main St, Apt 4B');
  const [city, setCity] = useState('New York');
  const [phone, setPhone] = useState('+251 911 234 567');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [isActivatingTelebirr, setIsActivatingTelebirr] = useState(false);
  const [paymentReference, setPaymentReference] = useState(`CHAPA-${Date.now()}`);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadUserDataAndCart = async () => {
      try {
        // Load user profile
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.email) setEmail(parsedUser.email);
          if (parsedUser?.name) setFullName(parsedUser.name);
          if (parsedUser?.phone) setPhone(parsedUser.phone);
        }

        // Load cart items for amount breakdown
        let items = route?.params?.cartItems || [];
        if (!items || items.length === 0) {
          const storedCart = await AsyncStorage.getItem('cart');
          items = storedCart ? JSON.parse(storedCart) : [];
        }
        
        // Ensure each item has a numeric quantity and price
        const formattedItems = items.map(i => ({
          ...i,
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0
        }));

        setCartItems(formattedItems);
      } catch (error) {
        console.error('Load checkout data error', error);
      }
    };

    loadUserDataAndCart();
  }, []);

  // Calculate total amount dynamically based on cart items quantities
  const totalAmount = cartItems.length > 0 
    ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : initialTotal;

  // Handle quantity changes (+, -, or direct text input)
  const updateItemQuantity = (index, newQuantity) => {
    const updated = [...cartItems];
    const parsedQty = parseInt(newQuantity, 10);
    
    if (isNaN(parsedQty) || parsedQty <= 0) {
      // Remove item or set to 1 minimum
      updated[index].quantity = 1;
    } else {
      updated[index].quantity = parsedQty;
    }

    setCartItems(updated);
    AsyncStorage.setItem('cart', JSON.stringify(updated)).catch(err => console.error(err));
  };

  // Listen for deep link callback when returning from Chapa web view/browser
  useEffect(() => {
    const handleDeepLink = (event) => {
      if (event.url.includes('checkout') || event.url.includes('success') || event.url.includes('status=success')) {
        setIsOrderComplete(true);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('checkout') || url.includes('success') || url.includes('status=success'))) {
        setIsOrderComplete(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const paymentLabels = {
    telebirr: 'Telebirr',
    chapa: 'Chapa',
    card: 'Credit / Debit Card',
    cash: 'Cash on Delivery'
  };

  const activateTelebirr = async () => {
    setIsActivatingTelebirr(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Telebirr Prompt Sent 📱',
        `A payment request for $${Number(totalAmount).toFixed(2)} has been sent to your phone (${phone}). Please enter your Telebirr PIN on your device to authorize.`,
        [
          { 
            text: 'Simulate Success ✅', 
            onPress: () => {
              Alert.alert('Payment Verified!', 'Telebirr payment successful. You can now tap "Place Order Now".');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Telebirr Failed', 'Unable to reach Telebirr service.');
    } finally {
      setIsActivatingTelebirr(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!fullName || !streetAddress || !phone) {
      Alert.alert('Missing Fields', 'Please fill in all required delivery details.');
      return;
    }
    
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const orderItems = cartItems.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price, menuItem: i.id }));
        const txRef = paymentReference || `CHAPA-${Date.now()}`;
        setPaymentReference(txRef);

        const payload = {
          customer: null,
          table: route?.params?.selectedTableId || null,
          waiter: null,
          orderItems,
          totalAmount,
          specialInstructions: '',
          paymentMethod,
          paymentReference: ['telebirr', 'chapa'].includes(paymentMethod) ? txRef : '',
          paymentStatus: paymentMethod === 'chapa' ? 'Pending' : 'Pending'
        };

        const res = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to place order');

        if (paymentMethod === 'chapa') {
          if (!email) {
            throw new Error('Please sign in or provide an email before paying with Chapa.');
          }

          // Clean phone number format for Chapa (removes spaces, +, and dashes)
          const formattedPhone = phone.replace(/[\s+\-]/g, '');

          const paymentResponse = await fetch(`${BACKEND_URL}/api/payments/chapa/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: totalAmount,
              tx_ref: txRef,
              email,
              first_name: fullName.split(' ')[0] || fullName,
              last_name: fullName.split(' ').slice(1).join(' ') || fullName,
              phone_number: formattedPhone,
              orderId: data.order?._id,
            }),
          });

          const paymentData = await paymentResponse.json();
          if (!paymentResponse.ok) {
            throw new Error(paymentData.message || 'Unable to initialize Chapa payment.');
          }

          const checkoutUrl = paymentData.checkout_url || paymentData.data?.checkout_url;
          if (!checkoutUrl) {
            throw new Error('Chapa did not return a checkout URL.');
          }

          Alert.alert('Redirecting to Chapa', 'Complete the payment in Chapa to confirm your order.');
          await Linking.openURL(checkoutUrl);
          
          setTimeout(() => {
            setIsOrderComplete(true);
          }, 4000);

          return;
        }

        setIsOrderComplete(true);
      } catch (err) {
        console.error('Place Order Error:', err);
        Alert.alert('Order Failed', err.message || 'Unable to place order');
      }
    })();
  };

  if (isOrderComplete) {
    return (
      <View className="flex-1 bg-[#F8F9FC] items-center justify-center p-5">
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FC" />
        <View className="bg-white w-full max-w-[380px] p-6 rounded-3xl items-center shadow-xl border border-[#EAE3DE]">
          <View className="w-16 h-16 bg-green-50 rounded-2xl items-center justify-center mb-4 border border-green-200">
            <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
          </View>
          <Text className="text-lg font-black text-[#1F130D] mb-1 text-center">Order Placed Successfully!</Text>
          <Text className="text-xs text-gray-500 text-center mb-6">Your payment has been verified and your order has been sent to the kitchen.</Text>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderHistoryScreen')}
            className="w-full bg-[#B8520B] py-3.5 rounded-xl items-center shadow-md active:opacity-95 mb-3"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-wider">View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            className="w-full bg-gray-100 py-3.5 rounded-xl items-center active:opacity-95"
          >
            <Text className="text-gray-700 font-bold text-xs uppercase tracking-wider">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

          {/* Order Amount Summary & Quantity Controls */}
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Order Amount Summary</Text>
          <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-5 shadow-xs">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <View key={index} className="py-3 border-b border-gray-100">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-bold text-[#1F130D] flex-1 pr-2" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-xs font-bold text-[#B8520B]">${(item.price * item.quantity).toFixed(2)}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-gray-400">Unit Price: ${item.price?.toFixed(2)}</Text>
                    
                    {/* Quantity Control Buttons & Input */}
                    <View className="flex-row items-center space-x-2">
                      <TouchableOpacity 
                        onPress={() => updateItemQuantity(index, item.quantity - 1)}
                        className="w-7 h-7 bg-gray-100 rounded-lg items-center justify-center border border-gray-200"
                      >
                        <Ionicons name="remove" size={14} color="#757575" />
                      </TouchableOpacity>

                      <TextInput
                        className="w-10 h-7 bg-[#F8F9FC] border border-[#EAE3DE] rounded-lg text-center text-xs font-bold text-[#1F130D]"
                        keyboardType="numeric"
                        value={String(item.quantity)}
                        onChangeText={(val) => updateItemQuantity(index, val)}
                      />

                      <TouchableOpacity 
                        onPress={() => updateItemQuantity(index, item.quantity + 1)}
                        className="w-7 h-7 bg-[#FEF7F3] rounded-lg items-center justify-center border border-[#B8520B]/30"
                      >
                        <Ionicons name="add" size={14} color="#B8520B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-2">
                <Text className="text-xs text-gray-400 italic mb-2">Standard Package</Text>
                <Text className="text-xs font-bold text-[#1F130D]">Default Item</Text>
              </View>
            )}

            <View className="flex-row justify-between items-center pt-3 mt-1">
              <Text className="text-xs text-gray-500">Service / Delivery Fee</Text>
              <Text className="text-xs font-bold text-gray-700">Free</Text>
            </View>

            <View className="flex-row justify-between items-center pt-3 mt-2 border-t border-[#EAE3DE]">
              <Text className="text-xs font-black text-[#1F130D]">Total Amount</Text>
              <Text className="text-sm font-black text-[#B8520B]">${totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Methods */}
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

            {/* Chapa Option */}
            <TouchableOpacity 
              onPress={() => setPaymentMethod('chapa')}
              className={`flex-row items-center justify-between p-3 rounded-xl mb-2 ${paymentMethod === 'chapa' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-50 rounded-xl items-center justify-center mr-3 border border-green-200">
                  <Ionicons name="card-outline" size={16} color="#008000" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#1F130D]">Chapa</Text>
                  <Text className="text-[9px] text-gray-400">Pay via Chapa payment gateway</Text>
                </View>
              </View>
              <Ionicons name={paymentMethod === 'chapa' ? "radio-button-on" : "radio-button-off"} size={16} color="#B8520B" />
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

          {/* Checkout Action Section */}
          <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-4 shadow-xs">
            {paymentMethod === 'telebirr' ? (
              <View className="mb-3 rounded-2xl border border-[#B8520B]/20 bg-[#FEF7F3] p-3">
                <Text className="text-xs font-bold text-[#1F130D]">Telebirr reference</Text>
                <Text className="text-[11px] text-gray-600 mt-1">{paymentReference}</Text>
                <TouchableOpacity
                  onPress={activateTelebirr}
                  disabled={isActivatingTelebirr}
                  className="bg-[#0052CC] py-3 rounded-xl items-center shadow-md active:opacity-95 mt-3"
                >
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">
                    {isActivatingTelebirr ? 'Activating Telebirr...' : 'Activate Telebirr Payment'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {paymentMethod === 'chapa' ? (
              <View className="mb-3 rounded-2xl border border-[#B8520B]/20 bg-[#FEF7F3] p-3">
                <Text className="text-xs font-bold text-[#1F130D]">Chapa Reference</Text>
                <Text className="text-[11px] text-gray-600 mt-1">{paymentReference}</Text>
                <Text className="text-[10px] text-gray-500 mt-2">The app will open Chapa when you place the order.</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              onPress={handlePlaceOrder}
              className="bg-[#B8520B] py-4 rounded-xl items-center shadow-md active:opacity-95"
            >
              <Text className="text-white font-bold text-xs uppercase tracking-wider">
                Place Order Now {paymentLabels[paymentMethod] ? `with ${paymentLabels[paymentMethod]}` : ''}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}