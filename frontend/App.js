import './src/global.css';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';

// Import Customer Screens
import CustomerLandingScreen from './src/screens/customer/CustomerLandingScreen';
import MenuScreen from './src/screens/customer/MenuScreen';
import FoodDetailScreen from './src/screens/customer/FoodDetailScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import OrderHistoryScreen from './src/screens/customer/OrderHistoryScreen';
import CustomerProfileScreen from './src/screens/customer/CustomerProfileScreen';
import CartScreen from './src/screens/customer/CartScreen';
import CheckoutScreen from './src/screens/customer/CheckoutScreen';

// Import Manager Screens
import ManagerDashboardScreen from './src/screens/manager/ManagerDashboardScreen';
import UserManagementScreen from './src/screens/manager/UserManagementScreen';
import StaffManagementScreen from './src/screens/manager/StaffManagementScreen';
import MenuManagementScreen from './src/screens/manager/MenuManagementScreen';
import InventoryManagementScreen from './src/screens/manager/InventoryManagementScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // Toggle this to 'manager' or 'customer' to preview different roles instantly, 
  // or hook this up to your AuthContext user state later.
  const [userRole, setUserRole] = useState('manager'); // Options: 'manager' | 'customer'

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {userRole === 'manager' ? (
            // --- MANAGER STACK ---
            <>
              <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
              <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} />
              <Stack.Screen name="StaffManagementScreen" component={StaffManagementScreen} />
              <Stack.Screen name="MenuManagementScreen" component={MenuManagementScreen} />
              <Stack.Screen name="InventoryManagementScreen" component={InventoryManagementScreen} />
            </>
          ) : (
            // --- CUSTOMER STACK ---
            <>
              <Stack.Screen name="CustomerLanding" component={CustomerLandingScreen} />
              <Stack.Screen name="MenuScreen" component={MenuScreen} />
              <Stack.Screen name="FoodDetailScreen" component={FoodDetailScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="SignupScreen" component={SignupScreen} />
              <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />
              <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CartScreen" component={CartScreen} />
              <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}