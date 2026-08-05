import './src/global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';

// Import Screens with correct paths
import CustomerLandingScreen from './src/screens/customer/CustomerLandingScreen';
import MenuScreen from './src/screens/customer/MenuScreen';
import FoodDetailScreen from './src/screens/customer/FoodDetailScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import OrderHistoryScreen from './src/screens/customer/OrderHistoryScreen';
import CustomerProfileScreen from './src/screens/customer/CustomerProfileScreen';
import CartScreen from './src/screens/customer/CartScreen';
import CheckoutScreen from './src/screens/customer/CheckoutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CustomerLanding">
          <Stack.Screen name="CustomerLanding" component={CustomerLandingScreen} />
          <Stack.Screen name="MenuScreen" component={MenuScreen} />
          <Stack.Screen name="FoodDetailScreen" component={FoodDetailScreen} />
          {/* Register both variants so whichever one gets called, it matches */}
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />
          <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}