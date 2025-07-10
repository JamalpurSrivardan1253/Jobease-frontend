import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from './utils/colors';
import { useNavigation } from '@react-navigation/native';

const Homescreen = () => {
  const navigation = useNavigation();
  const handleGetStarted = () => {
    navigation.navigate('Home');
  };
  return (
    <View style={styles.container}>
    <Image source={require('./assets/logo.png')} style={styles.logo} />
    <Text style={styles.title}>JOBEASE</Text>
    <Text style={styles.subtitle}>The Bridge Between Talent & Opportunity.</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text>Get Started</Text>
      </TouchableOpacity>
    </View>
  </View>
);}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:colors.blue,
  },
  logo:{
    width: 230,
    height: 150,
    marginBottom: 10,
  }
  ,
  title:{
    fontSize: 34,
    fontWeight: 'bold',
    color: "#ffffff",
    marginBottom: 20,
    // fontFamily: fonts.regular,
  },
  subtitle:{
    fontSize: 18,
    color: "#ffffff",
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  }
});
export default Homescreen;
