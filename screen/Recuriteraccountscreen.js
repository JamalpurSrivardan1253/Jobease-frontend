import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from './utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';

const Recuriteraccountscreen = ({ navigation }) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // First get user data to check if they have a companyId
      const userResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User response status:', userResponse.status);
      const userData = await userResponse.json();
      console.log('User data:', userData);

      if (userResponse.ok) {
        if (userData.companyId) {
          console.log('Fetching company with ID:', userData.companyId);
          // Fetch company data using the companyId
          const companyResponse = await fetch(`${BACKEND_URL}/api/companies?id=${userData.companyId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Company response status:', companyResponse.status);
          const companies = await companyResponse.json();
          console.log('Companies data:', companies);

          if (companyResponse.ok) {
            if (companies && companies.length > 0) {
              setCompanyData(companies[0]);
              console.log('Company data set:', companies[0]);
            } else {
              console.log('No company found');
              setCompanyData(null);
            }
          } else {
            console.log('Company response not ok');
            setCompanyData(null);
          }
        } else {
          console.log('No companyId in user data');
          setCompanyData(null);
        }
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      // Only log error, do not show alert
      console.error('Error fetching company data:', error);
      setCompanyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleEdit = () => {
    // Navigate to company creation/edit screen
    navigation.navigate('Companyscreen', {
      companyData: companyData,
      isEdit: !!companyData, // true if companyData exists, false otherwise
      onSave: fetchCompanyData // Callback to refresh data after save
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Account</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" style={styles.menuIcon} />
      </View>
      
      <View style={styles.profileSection}>
        {companyData ? (
          <>
            <Image
              source={{ 
                uri: companyData.logo || 'https://via.placeholder.com/90x90?text=' + encodeURIComponent(companyData.name?.charAt(0) || 'C')
              }}
              style={styles.avatar}
            />
            <Text style={styles.companyName}>{companyData.name}</Text>
            
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
            <Text style={styles.description}>
              {companyData.description || 'No description available'}
            </Text>
            
            {companyData.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={colors.blue} style={styles.infoIcon} />
                <Text style={styles.infoText}>{companyData.location}</Text>
              </View>
            )}
            
            {companyData.website && (
              <View style={styles.infoRow}>
                <Ionicons name="globe-outline" size={20} color={colors.blue} style={styles.infoIcon} />
                <Text style={styles.infoText}>{companyData.website}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noCompanyContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/90x90?text=No+Logo' }}
              style={[styles.avatar, styles.placeholderAvatar]}
            />
            <Text style={styles.noCompanyText}>Company Not Added</Text>
            <Text style={styles.noCompanySubtext}>
              Create your company profile to showcase your organization
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>
            {companyData ? 'Edit' : 'Create Company'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.blue,
  },
  headerBg: {
    width: '100%',
    backgroundColor: '#22223b',
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuIcon: {
    position: 'absolute',
    top: 52,
    right: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  placeholderAvatar: {
    opacity: 0.5,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#222',
  },
  noCompanyContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  noCompanyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  noCompanySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#bbb',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 36,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Recuriteraccountscreen;