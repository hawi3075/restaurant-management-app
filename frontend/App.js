import './src/global.css';
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Auth
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';

// Customer
import CustomerLandingScreen from './src/screens/customer/CustomerLandingScreen';
import MenuScreen from './src/screens/customer/MenuScreen';
import FoodDetailScreen from './src/screens/customer/FoodDetailScreen';
import OrderHistoryScreen from './src/screens/customer/OrderHistoryScreen';
import CustomerProfileScreen from './src/screens/customer/CustomerProfileScreen';
import CartScreen from './src/screens/customer/CartScreen';
import CheckoutScreen from './src/screens/customer/CheckoutScreen';

// Manager
import ManagerDashboardScreen from './src/screens/manager/ManagerDashboardScreen';
import ManagerProfileScreen from './src/screens/manager/ManagerProfileScreen';
import UserManagementScreen from './src/screens/manager/UserManagementScreen';
import StaffManagementScreen from './src/screens/manager/StaffManagementScreen';
import MenuManagementScreen from './src/screens/manager/MenuManagementScreen';
import InventoryManagementScreen from './src/screens/manager/InventoryManagementScreen';
import SupportMessageScreen from './src/screens/manager/SupportMessageScreen';
import ReviewManagementScreen from './src/screens/manager/ReviewManagementScreen';
import OrderManagementScreen from './src/screens/manager/OrderManagementScreen';

// Staff
import WaiterDashboardScreen from './src/screens/waiter/WaiterDashboardScreen';
import WaiterLiveOrdersScreen from './src/screens/waiter/WaiterLiveOrdersScreen';
import KitchenDashboardScreen from './src/screens/kitchen/KitchenDashboardScreen';
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (__DEV__) {
    console.log('AppNavigator user state:', user);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FC' }}>
        <ActivityIndicator size="large" color="#B8520B" />
      </View>
    );
  }

  // Not logged in (Auth Stack)
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  const role = String(user.role || 'customer')
    .toLowerCase()
    .trim();

  // MANAGER / ADMIN
  if (role === 'manager' || role === 'admin') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
        <Stack.Screen name="ManagerProfileScreen" component={ManagerProfileScreen} />
        <Stack.Screen name="OrderManagementScreen" component={OrderManagementScreen} />
        <Stack.Screen name="UserManagementScreen" component={UserManagementScreen} />
        <Stack.Screen name="StaffManagementScreen" component={StaffManagementScreen} />
        <Stack.Screen name="MenuManagementScreen" component={MenuManagementScreen} />
        <Stack.Screen name="InventoryManagementScreen" component={InventoryManagementScreen} />
        <Stack.Screen name="SupportMessageScreen" component={SupportMessageScreen} />
        <Stack.Screen name="ReviewManagementScreen" component={ReviewManagementScreen} />
      </Stack.Navigator>
    );
  }

  // KITCHEN
  if (role === 'kitchen') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="KitchenDashboard" component={KitchenDashboardScreen} />
      </Stack.Navigator>
    );
  }

  // WAITER
  if (role === 'waiter') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WaiterDashboard" component={WaiterDashboardScreen} />
        <Stack.Screen name="WaiterLiveOrders" component={WaiterLiveOrdersScreen} />
      </Stack.Navigator>
    );
  }

  // DRIVER
  if (role === 'driver') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      </Stack.Navigator>
    );
  }

  // CUSTOMER (Default fallback stack)
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerLanding" component={CustomerLandingScreen} />
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
      <Stack.Screen name="FoodDetailScreen" component={FoodDetailScreen} />
      <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />
      <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}