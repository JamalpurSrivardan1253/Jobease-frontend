import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import { colors } from './utils/colors'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../utils/config';

const Loginscreen = () => {
const navigation = useNavigation();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [checkingToken, setCheckingToken] = useState(true);

useEffect(() => {
    const checkToken = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            try {
                // Check if token is still valid by hitting a protected endpoint
                const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Redirect based on role
                if (userRes.data.roleId?.name === 'Recruiter') {
                    navigation.reset({ index: 0, routes: [{ name: 'RecruiterTabs' }] });
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
                }
                return;
            } catch (e) {
                // Token invalid or expired, continue to login
                await AsyncStorage.removeItem('token');
            }
        }
        setCheckingToken(false);
    };
    checkToken();
}, [navigation]);

if (checkingToken) {
    return null; // Or a loading spinner
}

const validateAndLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.')
        return
    }
    if (password.length < 6) {
        Alert.alert('Invalid Password', 'Password must be at least 6 characters.')
        return
    }
    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email,
            password,
        });
        if (response.status === 200 || response.status === 201)  {
            if (response.data.token) {
                console.log('Login successful:', response.data.token);
                console.log('User ID:', response.data);
                await AsyncStorage.setItem('token', response.data.token);
                // Fetch user info to get role and store userId
                const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${response.data.token}` }
                });
                if (userRes.data?._id) {
                    await AsyncStorage.setItem('userId', userRes.data._id);
                }
                //optional alert
                setTimeout(() => {
               
                }, 300);

                console.log("userdata:",userRes.data);
                
                // Redirect based on role
                setTimeout(()=>{
                    if (userRes.data.roleId?.name === 'Recruiter') {
                    navigation.reset({ index: 0, routes: [{ name: 'RecruiterTabs' }] });
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
                }
                },500);
                
            }
        } else {
            Alert.alert('Login Failed', response.data.message || 'Something went wrong.');
        }
    } catch (error) {
        if (error.response) {
            Alert.alert('Login Failed', error.response.data.message || 'Invalid credentials.');
        } else if (error.request) {
            Alert.alert('Network Error', 'No response from server.');
        } else {
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    }
}

return (
    <View style={styles.container}>
        <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
                style={styles.inputField}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.inputField}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                style={{
                    backgroundColor: (email && password) ? colors.blue : '#b0c4de',
                    borderRadius: 8,
                    paddingVertical: 12,
                    marginTop: 16,
                }}
                onPress={validateAndLogin}
                disabled={!(email && password)}
            >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                    Login
                </Text>
            </TouchableOpacity>

            {/* Don't have account? Sign up link */}
            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                    onPress={() => navigation?.navigate('Signup')}
                    accessible={true}
                    accessibilityLabel="Navigate to registration screen"
                >
                    <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
)
}

export default Loginscreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
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
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signupText: {
        fontSize: 16,
        color: '#666',
    },
    signupLink: {
        fontSize: 16,
        color: colors.blue,
        fontWeight: 'bold',
    },
})