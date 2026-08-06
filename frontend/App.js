import './src/global.css';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

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

// Import Manager, Waiter, Kitchen & Driver Screens
import ManagerDashboardScreen from './src/screens/manager/ManagerDashboardScreen';
import UserManagementScreen from './src/screens/manager/UserManagementScreen';
import StaffManagementScreen from './src/screens/manager/StaffManagementScreen';
import MenuManagementScreen from './src/screens/manager/MenuManagementScreen';
import InventoryManagementScreen from './src/screens/manager/InventoryManagementScreen';
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import KitchenDashboardScreen from './src/screens/kitchen/KitchenDashboardScreen';
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useContext(AuthContext); // Get authenticated user state

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always register common auth & navigation routes */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />

        {/* Customer Screens */}
        <Stack.Screen name="CustomerLanding" component={CustomerLandingScreen} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} />
        <Stack.Screen name="FoodDetailScreen" component={FoodDetailScreen} />
        <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />
        <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />

        {/* Role-Based Dashboards */}
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
        <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} />
        <Stack.Screen name="StaffManagementScreen" component={StaffManagementScreen} />
        <Stack.Screen name="MenuManagementScreen" component={MenuManagementScreen} />
        <Stack.Screen name="InventoryManagementScreen" component={InventoryManagementScreen} />
        <Stack.Screen name="WaiterDashboard" component={WaiterDashboardScreen} />
        <Stack.Screen name="KitchenDashboard" component={KitchenDashboardScreen} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}