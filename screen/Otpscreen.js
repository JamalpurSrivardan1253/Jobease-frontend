import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BACKEND_URL } from '../utils/config';

const Otpscreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = [useRef(), useRef(), useRef(), useRef()];
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email;

  const handleChange = (text, idx) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (text && idx < 3) {
        inputs[idx + 1].current.focus();
      }
    }
  };

  const handleConfirm = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (res.ok && data.resetToken) {
        Alert.alert('Success', 'OTP verified. Please set your new password.');
        navigation.navigate('ResetPasswordScreen', { resetToken: data.resetToken, email });
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Enter 4 digit code</Text>
        <Text style={styles.subtitle}>
          A four-digit code should have come to your email address that you indicated.
        </Text>
        <View style={styles.otpRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={inputs[idx]}
              style={styles.otpInput}
              value={digit}
              onChangeText={text => handleChange(text, idx)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={idx === 0}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={loading}>
            <Text style={styles.confirmText}>{loading ? '...' : 'Confirm'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '90%', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#444', marginBottom: 18, textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    fontSize: 28,
    textAlign: 'center',
    marginHorizontal: 6,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  confirmButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginRight: 8,
  },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  cancelText: { color: '#3498db', fontWeight: 'bold', fontSize: 16 },
});

export default Otpscreen;