import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../screen/utils/colors';

import Recurtierdashboard from '../screen/Recurtierdashboard';
import Postjob from '../screen/Postjob';
import Recuriteraccountscreen from '../screen/Recuriteraccountscreen';
import MessagesScreen from '../screen/MessagesScreen';

const Tab = createBottomTabNavigator();

const RecruiterTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Post Job') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: '#bbb',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={Recurtierdashboard} />
      <Tab.Screen name="Post Job" component={Postjob} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Account" component={Recuriteraccountscreen} />
    </Tab.Navigator>
  );
};

export default RecruiterTabNavigator;
