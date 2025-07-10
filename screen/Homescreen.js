import { StyleSheet, Text, View, Image,TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from './utils/colors'
import { useNavigation } from '@react-navigation/native'

const Homescreen = () => {
  const navigation = useNavigation();
  const handleLOGIN = () => {
    navigation.navigate('Login');
  };

  const handleSIGNUP = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>JOBEASE</Text>
      <TouchableOpacity style={styles.button} onPress={handleLOGIN}>
        <Text>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSIGNUP}>
        <Text>SIGNUP</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Homescreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:colors.blue, // Use a light background color
    // Add your styles here if needed
  },
  logo:{
    width: 230,
    height: 150,
    marginBottom: 10,
  },
  title:{
    fontSize: 34,
    fontWeight: 'bold',
    color: "#ffffff",
    marginBottom: 20,
    // fontFamily: fonts.regular,
  },
button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    width: 200,
    height: 50,
    justifyContent: 'center',
  }


})