import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

enableScreens();

import Landingscreen from './screen/Landingscreen';
import Homescreen from './screen/Homescreen';
import Loginscreen from './screen/Loginscreen';
import Registerscreen from './screen/Registerscreen';
import Jobscreen from './screen/Jobscreen';
import Companyscreen from './screen/Companyscreen';
import SearchResultsScreen from './screen/SearchResultsScreen';
import EditProfileScreen from './screen/EditProfileScreen';
import ApplicationsScreen from './screen/ApplicationsScreen';
import JobApplicationsScreen from './screen/JobApplicationsScreen';


// Import Tab Navigators
import TabNavigator from './navigation/TabNavigator';
import RecruiterTabNavigator from './navigation/RecruiterTabNavigator';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landingscreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landingscreen" component={Landingscreen} />
        <Stack.Screen name="Home" component={Homescreen} />
        <Stack.Screen name="Login" component={Loginscreen} />
        <Stack.Screen name="Signup" component={Registerscreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="RecruiterTabs" component={RecruiterTabNavigator} />
        <Stack.Screen name="Jobscreen" component={Jobscreen} />
        <Stack.Screen name="Companyscreen" component={Companyscreen} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="ApplicationsScreen" component={ApplicationsScreen} />
        <Stack.Screen name="JobApplicationsScreen" component={JobApplicationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}



export default App;
