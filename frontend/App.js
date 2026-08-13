import './src/global.css';
import React, { useContext, useEffect } from 'react';
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

// Enables deep linking / URL syncing for the web build (this app is
// deployed on Vercel, so it runs as a website in the mobile browser —
// not a native app). Without this, navigation.navigate() only changes
// React Navigation's internal state and never touches the browser's
// URL history. That meant every screen looked like the browser's only
// history entry, so the phone's back gesture/button had nothing of
// the app's own to go back to and exited straight out to whatever was
// open before the site, from ANY screen. Mapping screens to paths here
// makes each in-app navigation also push real browser history, so back
// correctly steps back through the app first.
const linking = {
  enabled: true,
  config: {
    screens: {
      // Guest / public
      CustomerLanding: '',
      MenuScreen: 'menu',
      FoodDetailScreen: 'food',
      CartScreen: 'cart',
      Login: 'login',
      Signup: 'signup',

      // Logged-in customer
      CustomerProfileScreen: 'profile',
      OrderHistoryScreen: 'orders',
      CheckoutScreen: 'checkout',

      // Manager
      ManagerDashboard: 'manager',
      ManagerProfileScreen: 'manager/profile',
      OrderManagementScreen: 'manager/orders',
      UserManagementScreen: 'manager/users',
      StaffManagementScreen: 'manager/staff',
      MenuManagementScreen: 'manager/menu',
      InventoryManagementScreen: 'manager/inventory',
      SupportMessageScreen: 'manager/support',
      ReviewManagementScreen: 'manager/reviews',

      // Kitchen
      KitchenDashboard: 'kitchen',

      // Waiter
      WaiterDashboard: 'waiter',
      WaiterLiveOrders: 'waiter/live-orders',

      // Driver
      DriverDashboard: 'driver',
    },
  },
};

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  // TEMPORARY DEBUG LOG — always fires (not gated by __DEV__, which is
  // stripped out of production builds and would otherwise hide this from
  // us on the live Vercel deployment). Remove this useEffect once the
  // routing issue is confirmed fixed.
  useEffect(() => {
    console.log('[DEBUG] AppNavigator render — loading:', loading, '| user:', user);
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FC' }}>
        <ActivityIndicator size="large" color="#B8520B" />
      </View>
    );
  }

  // Not logged in (Guest / Public Stack) - Starts at CustomerLanding
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CustomerLanding">
        <Stack.Screen name="CustomerLanding" component={CustomerLandingScreen} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} />
        <Stack.Screen name="FoodDetailScreen" component={FoodDetailScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
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
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="ManagerDashboard">
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
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="KitchenDashboard">
        <Stack.Screen name="KitchenDashboard" component={KitchenDashboardScreen} />
      </Stack.Navigator>
    );
  }

  // WAITER
  if (role === 'waiter') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="WaiterDashboard">
        <Stack.Screen name="WaiterDashboard" component={WaiterDashboardScreen} />
        <Stack.Screen name="WaiterLiveOrders" component={WaiterLiveOrdersScreen} />
      </Stack.Navigator>
    );
  }

  // DRIVER
  if (role === 'driver') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DriverDashboard">
        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      </Stack.Navigator>
    );
  }

  // LOGGED-IN CUSTOMER STACK
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CustomerLanding">
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
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}