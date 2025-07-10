// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { colors } from './utils/colors';

// const BACKEND_URL = 'http://localhost:3000'; // Change to your backend IP if needed

// const Postjob = ({ navigation }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [location, setLocation] = useState('');
//   const [salary, setSalary] = useState('');
//   const [category, setCategory] = useState('');

//   const handlePostJob = async () => {
//     if (!title || !description || !location || !salary || !category) {
//       Alert.alert('All fields are required');
//       return;
//     }
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('You must be logged in as a recruiter to post a job.');
//         return;
//       }
//       await axios.post(
//         `${BACKEND_URL}/api/jobs/`,
//         { title, description, location, salary: Number(salary), category },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       Alert.alert('Job posted successfully!');
//       setTitle('');
//       setDescription('');
//       setLocation('');
//       setSalary('');
//       setCategory('');
//       if (navigation) navigation.goBack();
//     } catch (error) {
//       Alert.alert(
//         'Failed to post job',
//         error.response?.data?.error || error.response?.data?.message || 'Server error'
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Post a Job</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Job Title*"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Description*"
//         value={description}
//         onChangeText={setDescription}
//         multiline
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Location*"
//         value={location}
//         onChangeText={setLocation}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Salary* (number)"
//         value={salary}
//         onChangeText={setSalary}
//         keyboardType="numeric"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Category*"
//         value={category}
//         onChangeText={setCategory}
//       />
//       <TouchableOpacity style={styles.button} onPress={handlePostJob}>
//         <Text style={styles.buttonText}>Post Job</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.blue,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 24,
//   },
//   input: {
//     width: '100%',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 14,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#2563eb',
//     borderRadius: 8,
//     paddingVertical: 14,
//     paddingHorizontal: 32,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//     textAlign: 'center',
//   },
// });

// export default Postjob;




import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '../utils/config'; // Change to your backend IP if needed

const Postjob = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [category, setCategory] = useState('');

  const handlePostJob = async () => {
    if (!title || !description || !location || !salary || !category) {
      Alert.alert('All fields are required');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('You must be logged in as a recruiter to post a job.');
        return;
      }
      await axios.post(
        `${BACKEND_URL}/api/jobs/`,
        { title, description, location, salary: Number(salary), category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Job posted successfully!');
      setTitle('');
      setDescription('');
      setLocation('');
      setSalary('');
      setCategory('');
      if (navigation) navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Failed to post job',
        error.response?.data?.error || error.response?.data?.message || 'Server error'
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Post a Job</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Job Title*"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description*"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Location*"
            value={location}
            onChangeText={setLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Salary* (number)"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Category*"
            value={category}
            onChangeText={setCategory}
          />
          <TouchableOpacity style={styles.button} onPress={handlePostJob}>
            <Text style={styles.buttonText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937', // dark gray
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Postjob;
