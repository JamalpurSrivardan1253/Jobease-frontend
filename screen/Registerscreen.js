import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from './utils/colors'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set your backend IP
import { BACKEND_URL } from '../utils/config';

const Registerscreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [userType, setUserType] = useState('Seeker') // Seeker or Recruiter

const validateAndRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        Alert.alert('Missing Fields', 'Please fill all required fields.')
        return
    }
    if (password.length < 8) {
        Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.')
        return
    }

    if (!agreeTerms) {
        Alert.alert('Terms Required', 'You must agree to the terms and conditions.')
        return
    }

    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
            firstName,
            lastName,
            email,
            password,
            roleName: userType, // Make sure this matches backend key
        })
        console.log(response);

        if (response.status === 200 || response.status === 201) {
            navigation.replace('Login');
        } else {
            Alert.alert('Registration Failed', response.data.message || 'Something went wrong.')
        }
    } catch (error) {
        if (error.response) {
            // Server responded with a status other than 2xx
            console.log('Response error:', error.response.data)
            Alert.alert('Registration Failed', error.response.data.message || 'Invalid input.')
        } else if (error.request) {
            // Request was made but no response received
            console.log('Request error:', error.request)
            Alert.alert('Network Error', 'No response from server.')
        } else {
            // Something else happened
            console.log('Error:', error.message)
            Alert.alert('Error', 'An unexpected error occurred.')
        }
    }
}

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Register</Text>

                <View style={styles.toggleContainer}>
                    {['Seeker', 'Recruiter'].map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.toggleButton, userType === type && styles.activeToggle]}
                            onPress={() => setUserType(type)}
                        >
                            <Text style={{ color: userType === type ? '#fff' : '#333', fontWeight: 'bold' }}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.inputField} placeholder="Enter your first name" value={firstName} onChangeText={setFirstName} />

                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.inputField} placeholder="Enter your last name" value={lastName} onChangeText={setLastName} />

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.inputField}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.inputField}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.inputField}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                />

                <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
                    >
                        {agreeTerms && <View style={styles.checkboxInner} />}
                    </TouchableOpacity>
                    <Text style={{ fontSize: 14, color: '#555' }}>I agree to the Terms and Conditions</Text>
                </View>

                <TouchableOpacity style={styles.registerButton} onPress={validateAndRegister}>
                    <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>

                {/* Already have account? Sign in link */}
                <View style={styles.signinContainer}>
                    <Text style={styles.signinText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.signinLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Registerscreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#333',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        marginTop: 12,
    },
    inputField: {
        height: 44,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fafafa',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    toggleButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    activeToggle: {
        backgroundColor: colors.blue,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.blue,
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    registerButton: {
        backgroundColor: colors.blue,
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 16,
    },
    registerButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    signinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signinText: {
        fontSize: 16,
        color: '#666',
    },
    signinLink: {
        fontSize: 16,
        color: colors.blue,
        fontWeight: 'bold',
    },
})