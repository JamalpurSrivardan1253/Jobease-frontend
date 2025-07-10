import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, PermissionsAndroid, Platform } from 'react-native';
import { colors } from './utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

import { BACKEND_URL } from '../utils/config';

const validateUrl = (url) => {
  if (!url) return true; // URL is optional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const Companyscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { companyData, isEdit, onSave } = route.params || {};

  const [name, setName] = useState(companyData?.name || '');
  const [description, setDescription] = useState(companyData?.description || '');
  const [location, setLocation] = useState(companyData?.location || '');
  const [website, setWebsite] = useState(companyData?.website || '');
  const [logo, setLogo] = useState(companyData?.logo || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs access to your storage to select images.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Please grant storage permission to select images');
        return;
      }

      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 200,
        maxWidth: 200,
        quality: 0.7,
        selectionLimit: 1,
      };

      console.log('Opening image picker...');
      const result = await launchImageLibrary(options);
      console.log('Image picker result:', result);

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (!result.assets || result.assets.length === 0) {
        console.log('No image selected');
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        throw new Error('No base64 data received from image');
      }

      const base64Image = `data:${asset.type};base64,${asset.base64}`;
      console.log('Setting logo with base64 image data');
      setLogo(base64Image);
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again or choose a different image.'
      );
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (website && !validateUrl(website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit 
        ? `${BACKEND_URL}/api/companies/${companyData._id}` 
        : `${BACKEND_URL}/api/companies`;

      console.log('Making request to:', url, { companyData });
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          location: location.trim(),
          website: website.trim(),
          logo, // Include logo in the request
        }),
      });

      let data;
      try {
        const textResponse = await response.text();
        console.log('Server response:', textResponse);
        
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('Failed to parse response:', textResponse);
          throw new Error('Server returned invalid JSON');
        }
      } catch (error) {
        console.error('Error reading response:', error);
        throw new Error('Failed to read server response');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save company');
      }

      Alert.alert(
        'Success', 
        `Company ${isEdit ? 'updated' : 'created'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSave) onSave();
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      const message = error.message === 'Failed to fetch' 
        ? 'Network error. Please check your connection.'
        : error.message;
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isEdit ? 'Edit Company' : 'Create Company'}</Text>
        
        <Text style={styles.label}>Company Name*</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors((prev) => ({ ...prev, name: null }));
          }}
          placeholder="Enter company name"
          placeholderTextColor="#666"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setErrors((prev) => ({ ...prev, description: null }));
          }}
          placeholder="Enter company description"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

        <Text style={styles.label}>Location*</Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          value={location}
          onChangeText={(text) => {
            setLocation(text);
            setErrors((prev) => ({ ...prev, location: null }));
          }}
          placeholder="Enter company location"
          placeholderTextColor="#666"
        />
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

        <Text style={styles.label}>Website</Text>
        <TextInput
          style={[styles.input, errors.website && styles.inputError]}
          value={website}
          onChangeText={(text) => {
            setWebsite(text);
            setErrors((prev) => ({ ...prev, website: null }));
          }}
          placeholder="Enter company website (e.g., https://example.com)"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
        />
        {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}

        <Text style={styles.label}>Logo</Text>
        <TouchableOpacity 
          style={styles.logoPicker}
          onPress={pickImage}
        >
          {logo ? (
            <Image source={{ uri: logo }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoPlaceholder}>Pick a logo image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEdit ? 'Update Company' : 'Create Company'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    height: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoPicker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginTop: 16,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  logoPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
});

export default Companyscreen;
