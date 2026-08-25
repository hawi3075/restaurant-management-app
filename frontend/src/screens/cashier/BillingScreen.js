import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BillingScreen() {
  const [selectedMethod, setSelectedMethod] = useState('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);

  const items = [
    {
      id: 1,
      name: 'Truffle Mushroom Risotto',
      qty: 2,
      price: 24.0,
    },
    {
      id: 2,
      name: 'Artisanal Wagyu Burger',
      qty: 1,
      price: 24.0,
    },
    {
      id: 3,
      name: 'Craft Lemonade',
      qty: 3,
      price: 4.5,
    },
  ];

  // Calculate subtotal
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // Tax
  const taxRate = 0.085;
  const tax = subtotal * taxRate;

  // Final total
  const total = subtotal + tax;

  // Payment methods
  const paymentMethods = [
    {
      name: 'Cash',
      icon: 'cash-outline',
    },
    {
      name: 'Credit Card',
      icon: 'card-outline',
    },
    {
      name: 'Mobile Money',
      icon: 'phone-portrait-outline',
    },
    {
      name: 'Bank Transfer',
      icon: 'business-outline',
    },
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      Alert.alert(
        'Payment Method Required',
        'Please select a payment method.'
      );
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      Alert.alert(
        'Payment Successful',
        `Payment of $${total.toFixed(
          2
        )} has been processed using ${selectedMethod}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Payment completed');
            },
          },
        ]
      );
    }, 1200);
  };

  const handlePrint = () => {
    Alert.alert(
      'Print Receipt',
      'The receipt is ready to be printed.'
    );
  };

  return (
    <View className="flex-1 bg-[#F8F9FC]">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FC"
      />

      {/* Header */}
      <View className="pt-12 px-5">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-black text-[#1F130D]">
              Billing & Payment
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              Order #ORD-402 • Table 12
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePrint}
            activeOpacity={0.7}
            className="w-10 h-10 bg-white rounded-full border border-[#EAE3DE] items-center justify-center"
          >
            <Ionicons
              name="print-outline"
              size={20}
              color="#1F130D"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {/* Invoice Breakdown */}
        <View className="bg-white p-5 rounded-2xl border border-[#EAE3DE] mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-bold text-[#1F130D]">
              Invoice Breakdown
            </Text>

            <View className="bg-[#FEF7F3] px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-[#B8520B]">
                {items.length} Items
              </Text>
            </View>
          </View>

          {/* Items */}
          {items.map((item, idx) => (
            <View
              key={item.id}
              className={`flex-row justify-between items-center py-3 ${
                idx !== items.length - 1
                  ? 'border-b border-gray-100'
                  : ''
              }`}
            >
              <View className="flex-1 pr-4">
                <Text
                  className="text-sm font-semibold text-[#1F130D]"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text className="text-xs text-gray-400 mt-1">
                  ${item.price.toFixed(2)} × {item.qty}
                </Text>
              </View>

              <Text className="text-sm font-bold text-[#1F130D]">
                ${(item.price * item.qty).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Summary */}
          <View className="mt-5">
            <View className="flex-row justify-between mb-3">
              <Text className="text-xs text-gray-500">
                Subtotal
              </Text>

              <Text className="text-xs font-bold text-[#1F130D]">
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="text-xs text-gray-500">
                Tax (8.5%)
              </Text>

              <Text className="text-xs font-bold text-[#1F130D]">
                ${tax.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between pt-4 border-t border-gray-200">
              <Text className="text-base font-black text-[#1F130D]">
                Total Due
              </Text>

              <Text className="text-lg font-black text-[#B8520B]">
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-2">
          <Text className="text-lg font-bold text-[#1F130D] mb-3">
            Select Payment Method
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {paymentMethods.map((method) => {
              const isSelected =
                selectedMethod === method.name;

              return (
                <TouchableOpacity
                  key={method.name}
                  onPress={() =>
                    setSelectedMethod(method.name)
                  }
                  activeOpacity={0.7}
                  className={`w-[48%] p-4 rounded-2xl border mb-3 ${
                    isSelected
                      ? 'bg-[#FEF7F3] border-[#B8520B]'
                      : 'bg-white border-[#EAE3DE]'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={method.icon}
                      size={22}
                      color={
                        isSelected
                          ? '#B8520B'
                          : '#777777'
                      }
                    />

                    <View className="ml-3 flex-1">
                      <Text
                        className={`font-bold text-xs ${
                          isSelected
                            ? 'text-[#B8520B]'
                            : 'text-[#1F130D]'
                        }`}
                      >
                        {method.name}
                      </Text>

                      <Text className="text-[10px] text-gray-400 mt-1">
                        {isSelected
                          ? 'Selected'
                          : 'Tap to select'}
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        isSelected
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={19}
                      color={
                        isSelected
                          ? '#B8520B'
                          : '#B0B0B0'
                      }
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Payment Information */}
        <View className="bg-white rounded-2xl border border-[#EAE3DE] p-4 mt-2 mb-5">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#FEF7F3] items-center justify-center">
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#B8520B"
              />
            </View>

            <View className="ml-3">
              <Text className="text-xs text-gray-400">
                Payment method
              </Text>

              <Text className="text-sm font-bold text-[#1F130D]">
                {selectedMethod}
              </Text>
            </View>
          </View>
        </View>

        {/* Process Payment */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.8}
          className={`py-4 rounded-2xl items-center mb-4 ${
            isProcessing
              ? 'bg-[#D49A75]'
              : 'bg-[#B8520B]'
          }`}
        >
          <View className="flex-row items-center">
            <Ionicons
              name={
                isProcessing
                  ? 'hourglass-outline'
                  : 'card-outline'
              }
              size={20}
              color="#FFFFFF"
            />

            <Text className="text-white font-black text-sm tracking-wide ml-2">
              {isProcessing
                ? 'Processing Payment...'
                : 'Process Payment & Print Receipt'}
            </Text>
          </View>
        </TouchableOpacity>

       
        <TouchableOpacity
          onPress={() => console.log('Payment cancelled')}
          activeOpacity={0.7}
          className="py-3 items-center mb-5"
        >
          <Text className="text-sm font-bold text-gray-500">
            Cancel Payment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}