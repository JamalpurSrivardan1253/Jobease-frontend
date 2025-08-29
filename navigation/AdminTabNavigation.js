import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../screen/utils/colors';

// Import your admin screens here
import AdminDashboard from '../screen/AdminDashboard';
import AdminAccountsScreen from '../screen/AdminAccountsScreen'; // List/manage users
import AdminJobsScreen from '../screen/AdminJobsScreen';         // List/manage jobs
import AdminProfileScreen from '../screen/AdminProfileScreen';   // "Me" tab

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Accounts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Me') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: '#bbb',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={AdminDashboard} />
      <Tab.Screen name="Accounts" component={AdminAccountsScreen} />
      <Tab.Screen name="Jobs" component={AdminJobsScreen} />
      <Tab.Screen name="Me" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;