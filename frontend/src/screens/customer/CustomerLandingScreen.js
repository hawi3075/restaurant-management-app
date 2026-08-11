import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomMap from '../../components/CustomMap';
import { BACKEND_URL } from '../../api/backend';

export default function CheckoutScreen({ route, navigation }) {
  const initialTotal = route?.params?.total ?? 40.99;
  const scrollViewRef = useRef(null);

  const [serviceType, setServiceType] = useState('delivery'); // 'delivery' or 'dine-in'
  
  // Customer Form State
  const [fullName, setFullName] = useState('Hawi Girma');
  const [streetAddress, setStreetAddress] = useState('ASTU Freshman Programs');
  const [city, setCity] = useState('Adama');
  const [phone, setPhone] = useState('0911223344');
  const [email, setEmail] = useState('hawig3521@gmail.com');
  const [tableNumber, setTableNumber] = useState(route?.params?.selectedTableId || '5');
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [isActivatingTelebirr, setIsActivatingTelebirr] = useState(false);
  const [paymentReference, setPaymentReference] = useState(`CHAPA-${Date.now()}`);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Inline Validation Error State
  const [errors, setErrors] = useState({});

  // Map Modal & Saved Pins State
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapLinkInput, setMapLinkInput] = useState(''); 
  const [savedPins, setSavedPins] = useState([
    { name: 'ASTU Freshman Programs', lat: 8.5638545, lng: 39.2824094, mapUrl: 'https://maps.google.com/?q=8.5638545,39.2824094' },
    { name: 'ASTU stadium', lat: 8.5647086, lng: 39.2923275, mapUrl: 'https://maps.google.com/?q=8.5647086,39.2923275' }
  ]);
  
  // Temporary map selection state inside modal
  const [tempAddress, setTempAddress] = useState('ASTU Freshman Programs');
  const [mapRegion, setMapRegion] = useState({
    latitude: 8.5638545,
    longitude: 39.2824094,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  // Load saved pins from AsyncStorage on mount
  useEffect(() => {
    const loadSavedPins = async () => {
      try {
        const storedPins = await AsyncStorage.getItem('saved_delivery_pins');
        if (storedPins) {
          setSavedPins(JSON.parse(storedPins));
        }
      } catch (e) {
        console.error('Failed to load saved pins', e);
      }
    };
    loadSavedPins();
  }, []);

  const savePinToStorage = async (newPins) => {
    setSavedPins(newPins);
    try {
      await AsyncStorage.setItem('saved_delivery_pins', JSON.stringify(newPins));
    } catch (e) {
      console.error('Failed to save pins', e);
    }
  };

  // Upgraded parser handling Google Maps Share Links (!3d / !4d) and browser URLs
  const handleParseGoogleMapsLink = async (url) => {
    setMapLinkInput(url);
    if (!url) return;

    try {
      let targetUrl = url;

      let lat = null;
      let lng = null;

      // 1. Check for standard @lat,lng pattern (from browser URL bar)
      const coordMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || targetUrl.match(/q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lng = parseFloat(coordMatch[2]);
      }

      // 2. Check for Google Maps Share link format containing data coordinates (!3dLat!4dLng)
      if (!lat || !lng) {
        const latMatch = targetUrl.match(/!3d(-?\d+\.\d+)/);
        const lngMatch = targetUrl.match(/!4d(-?\d+\.\d+)/);
        if (latMatch && lngMatch) {
          lat = parseFloat(latMatch[1]);
          lng = parseFloat(lngMatch[1]);
        }
      }

      let placeName = lat && lng ? `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` : 'Custom Pinned Location';
      
      const placeMatch = targetUrl.match(/\/place\/([^/@]+)/);
      if (placeMatch && placeMatch[1]) {
        const decoded = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        if (!decoded.includes('°') && !decoded.startsWith('data=')) {
          placeName = decoded;
        }
      }

      if (lat && lng) {
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setTempAddress(placeName);
        setStreetAddress(placeName);
        
        Alert.alert('Success! 📍', `Updated location to:\n${placeName}`);
      } else {
        Alert.alert('Note', 'Could not read coordinates from this link. Please make sure you copy the full link shared from Google Maps.');
      }
    } catch (error) {
      console.error('Error parsing map link:', error);
    }
  };

  const handleAddPin = () => {
    if (!tempAddress) return;
    const existing = savedPins.find(p => p.name.toLowerCase() === tempAddress.toLowerCase());
    const mapUrl = `https://maps.google.com/?q=${mapRegion.latitude},${mapRegion.longitude}`;
    
    if (!existing) {
      const updated = [{ name: tempAddress, lat: mapRegion.latitude, lng: mapRegion.longitude, mapUrl }, ...savedPins];
      savePinToStorage(updated);
    }
  };

  const handleDeletePin = (pinName) => {
    const updated = savedPins.filter(p => p.name !== pinName);
    savePinToStorage(updated);
  };

  const handleSelectSavedPin = (pin) => {
    setTempAddress(pin.name);
    setStreetAddress(pin.name);
    setMapRegion({
      latitude: pin.lat,
      longitude: pin.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const confirmMapSelection = () => {
    setStreetAddress(tempAddress);
    handleAddPin();
    setIsMapModalVisible(false);
  };

  useEffect(() => {
    const loadUserDataAndCart = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.email) setEmail(parsedUser.email);
          if (parsedUser?.name) setFullName(parsedUser.name);
          if (parsedUser?.phone) setPhone(parsedUser.phone);
        }

        let items = route?.params?.cartItems || [];
        if (!items || items.length === 0) {
          const storedCart = await AsyncStorage.getItem('cart');
          items = storedCart ? JSON.parse(storedCart) : [];
        }
        
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

  const totalAmount = cartItems.length > 0 
    ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : initialTotal;

  const updateItemQuantity = (index, newQuantity) => {
    const updated = [...cartItems];
    const parsedQty = parseInt(newQuantity, 10);
    
    if (isNaN(parsedQty) || parsedQty <= 0) {
      updated[index].quantity = 1;
    } else {
      updated[index].quantity = parsedQty;
    }

    setCartItems(updated);
    AsyncStorage.setItem('cart', JSON.stringify(updated)).catch(err => console.error(err));
  };

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

  const handleValidationFailed = (fieldKey, message) => {
    setErrors({ [fieldKey]: message });
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handlePlaceOrder = () => {
    setErrors({}); // Clear previous errors

    if (!fullName || fullName.trim() === '') {
      handleValidationFailed('fullName', 'plese fill the name');
      return;
    }

    if (!phone || phone.trim() === '') {
      handleValidationFailed('phone', 'plese insert the phone');
      return;
    }

    let cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('251')) {
      cleanPhone = '0' + cleanPhone.slice(3);
    }

    const phoneRegex = /^(09|07)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      handleValidationFailed('phone', 'plese insert a valid phone');
      return;
    }

    if (!email || email.trim() === '') {
      handleValidationFailed('email', 'invalide email');
      return;
    }

    if (serviceType === 'delivery') {
      if (!streetAddress || streetAddress.trim() === '') {
        handleValidationFailed('streetAddress', 'plese fill the street address');
        return;
      }
      if (!city || city.trim() === '') {
        handleValidationFailed('city', 'plese fill the city');
        return;
      }
    }

    if (serviceType === 'dine-in' && (!tableNumber || tableNumber.trim() === '')) {
      handleValidationFailed('tableNumber', 'plese fill the table number');
      return;
    }
    
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const orderItems = cartItems.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.price, menuItem: i.id }));
        const txRef = paymentReference || `CHAPA-${Date.now()}`;
        setPaymentReference(txRef);

        const currentMapUrl = `https://maps.google.com/?q=${mapRegion.latitude},${mapRegion.longitude}`;
        const locationDetails = `Delivery Address: ${streetAddress}, ${city} | GPS Coordinates -> Latitude: ${mapRegion.latitude.toFixed(5)}, Longitude: ${mapRegion.longitude.toFixed(5)} | Google Maps Link: ${currentMapUrl}`;

        const payload = {
          customer: null,
          table: serviceType === 'dine-in' ? tableNumber : null,
          waiter: null,
          orderItems,
          totalAmount,
          specialInstructions: serviceType === 'delivery' ? locationDetails : `Dine-in Table: ${tableNumber}`,
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
          const paymentResponse = await fetch(`${BACKEND_URL}/api/payments/chapa/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: totalAmount,
              tx_ref: txRef,
              email,
              first_name: fullName.split(' ')[0] || fullName,
              last_name: fullName.split(' ').slice(1).join(' ') || fullName,
              phone_number: cleanPhone,
              orderId: data.order?._id || data._id,
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
          <Text className="text-xs text-gray-500 text-center mb-6">Your payment has been verified and your order has been sent to the kitchen & driver.</Text>
          
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
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} className="px-5 pt-4 pb-32">
          
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
            {serviceType === 'delivery' ? 'Delivery Details & Location Pin' : 'Reservation & Guest Details'}
          </Text>
          
          <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mb-5 shadow-xs">
            
            {/* Full Name Input */}
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Full Name</Text>
            <TextInput 
              className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] ${errors.fullName ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
              value={fullName} 
              onChangeText={(text) => { setFullName(text); if(errors.fullName) setErrors({...errors, fullName: null}); }} 
              placeholder="Enter full name"
            />
            {errors.fullName ? <Text className="text-[10px] text-red-500 font-bold mt-1 mb-2">{errors.fullName}</Text> : <View className="mb-3" />}

            {/* Email Input */}
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Email Address (Required for Chapa)</Text>
            <TextInput 
              className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] ${errors.email ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
              value={email} 
              onChangeText={(text) => { setEmail(text); if(errors.email) setErrors({...errors, email: null}); }} 
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text className="text-[10px] text-red-500 font-bold mt-1 mb-2">{errors.email}</Text> : <View className="mb-3" />}

            {serviceType === 'delivery' ? (
              <>
                {/* Street Address Input */}
                <Text className="text-[10px] font-bold text-gray-500 mb-1">Street Address / Landmark</Text>
                <TextInput 
                  className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] ${errors.streetAddress ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
                  value={streetAddress} 
                  onChangeText={(text) => { setStreetAddress(text); if(errors.streetAddress) setErrors({...errors, streetAddress: null}); }} 
                  placeholder="e.g., ASTU stadium"
                />
                {errors.streetAddress ? <Text className="text-[10px] text-red-500 font-bold mt-1 mb-2">{errors.streetAddress}</Text> : <View className="mb-3" />}

                <View className="flex-row space-x-2 mb-3">
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-500 mb-1">City</Text>
                    <TextInput 
                      className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] ${errors.city ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
                      value={city} 
                      onChangeText={(text) => { setCity(text); if(errors.city) setErrors({...errors, city: null}); }} 
                    />
                    {errors.city ? <Text className="text-[10px] text-red-500 font-bold mt-1">{errors.city}</Text> : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-500 mb-1">Phone Number</Text>
                    <TextInput 
                      className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] ${errors.phone ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
                      value={phone} 
                      onChangeText={(text) => { setPhone(text); if(errors.phone) setErrors({...errors, phone: null}); }} 
                      placeholder="0911223344"
                      keyboardType="phone-pad"
                    />
                    {errors.phone ? <Text className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</Text> : null}
                  </View>
                </View>

                {/* Trigger Button to Open Embedded Map Modal */}
                <TouchableOpacity
                  onPress={() => {
                    setTempAddress(streetAddress);
                    setIsMapModalVisible(true);
                  }}
                  className="bg-[#FEF7F3] border border-[#B8520B]/40 py-3.5 px-4 rounded-xl flex-row items-center justify-between mb-3 shadow-xs active:opacity-90"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-[#B8520B]/10 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="map" size={16} color="#B8520B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#1F130D]" numberOfLines={1}>
                        {streetAddress || 'Pin Location on Map'}
                      </Text>
                      <Text className="text-[9px] text-[#B8520B] font-semibold">Click to paste Google Maps share link</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#B8520B" />
                </TouchableOpacity>

                {/* Detailed Location & Map Link Display Card */}
                <View className="p-3 bg-[#F8F9FC] rounded-xl border border-[#EAE3DE]">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-[10px] text-gray-700 font-bold">📍 Pinned Location Details</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL(`https://maps.google.com/?q=${mapRegion.latitude},${mapRegion.longitude}`)}
                    >
                      <Text className="text-[10px] text-[#B8520B] font-bold underline">Open Map Link ↗</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-[10px] text-[#1F130D] font-semibold mb-0.5">{streetAddress} ({city})</Text>
                  <Text className="text-[9px] text-gray-500 font-mono">
                    Lat: {mapRegion.latitude.toFixed(5)}, Lng: {mapRegion.longitude.toFixed(5)}
                  </Text>
                  <Text className="text-[9px] text-gray-400 mt-1" numberOfLines={1}>
                    URL: https://maps.google.com/?q={mapRegion.latitude.toFixed(5)},{mapRegion.longitude.toFixed(5)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="mb-3">
                  <Text className="text-[10px] font-bold text-gray-500 mb-1">Table Number / Seat</Text>
                  <TextInput 
                    className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] font-bold ${errors.tableNumber ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
                    value={tableNumber} 
                    onChangeText={(text) => { setTableNumber(text); if(errors.tableNumber) setErrors({...errors, tableNumber: null}); }} 
                    placeholder="Enter Table Number (e.g., Table 4)"
                  />
                  {errors.tableNumber ? <Text className="text-[10px] text-red-500 font-bold mt-1">{errors.tableNumber}</Text> : null}
                </View>
                <View className="mb-1">
                  <Text className="text-[10px] font-bold text-gray-500 mb-1">Phone Number</Text>
                  <TextInput 
                    className={`bg-[#F8F9FC] border p-3 rounded-xl text-xs text-[#1F130D] ${errors.phone ? 'border-red-500' : 'border-[#EAE3DE]'}`} 
                    value={phone} 
                    onChangeText={(text) => { setPhone(text); if(errors.phone) setErrors({...errors, phone: null}); }} 
                    keyboardType="phone-pad"
                  />
                  {errors.phone ? <Text className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</Text> : null}
                </View>
              </>
            )}
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

            <TouchableOpacity 
              onPress={() => setPaymentMethod('cash')}
              className={`flex-row items-center justify-between p-3 rounded-xl ${paymentMethod === 'cash' ? 'bg-[#FEF7F3] border border-[#B8520B]/30' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={16} color="#757575" />
                </View>
                <Text className="text-xs font-bold text-[#1F130D]">Cash on Delivery / Table</Text>
              </View>
              <Ionicons name={paymentMethod === 'cash' ? "radio-button-on" : "radio-button-off"} size={16} color="#B8520B" />
            </TouchableOpacity>
          </View>

          {/* Telebirr Action Button (if Telebirr selected) */}
          {paymentMethod === 'telebirr' && (
            <TouchableOpacity
              onPress={activateTelebirr}
              disabled={isActivatingTelebirr}
              className="w-full bg-[#0052CC] py-3.5 rounded-xl items-center shadow-md mb-4 flex-row justify-center space-x-2"
            >
              <Ionicons name="phone-portrait-outline" size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs uppercase tracking-wider">
                {isActivatingTelebirr ? 'Processing Telebirr...' : 'Authorize Telebirr Payment'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Place Order Button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            className="w-full bg-[#B8520B] py-4 rounded-2xl items-center shadow-lg active:opacity-95 mb-6"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">
              {paymentMethod === 'chapa' ? 'Proceed to Chapa Payment' : `Place Order • $${totalAmount.toFixed(2)}`}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {/* Map Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View className="flex-1 bg-white pt-12 px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-black text-[#1F130D]">Select Delivery Location</Text>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1F130D" />
            </TouchableOpacity>
          </View>

          <Text className="text-xs font-bold text-gray-500 mb-1">Paste Google Maps Share Link</Text>
          <TextInput
            className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs text-[#1F130D] mb-4"
            value={mapLinkInput}
            onChangeText={handleParseGoogleMapsLink}
            placeholder="Paste Google Maps URL here (e.g., https://maps.app.goo.gl/...)"
          />

          <View className="flex-1 rounded-2xl overflow-hidden border border-[#EAE3DE] mb-4">
            <CustomMap
              region={mapRegion}
              onRegionChangeComplete={(region) => setMapRegion(region)}
            />
          </View>

          <Text className="text-xs font-bold text-gray-500 mb-1">Selected Location Name</Text>
          <TextInput
            className="bg-[#F8F9FC] border border-[#EAE3DE] p-3 rounded-xl text-xs text-[#1F130D] mb-4 font-bold"
            value={tempAddress}
            onChangeText={setTempAddress}
            placeholder="Enter location name"
          />

          <TouchableOpacity
            onPress={confirmMapSelection}
            className="w-full bg-[#B8520B] py-4 rounded-xl items-center mb-6"
          >
            <Text className="text-white font-bold text-xs uppercase">Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}