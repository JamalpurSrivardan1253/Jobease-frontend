import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { colors } from './utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';
import { launchImageLibrary } from 'react-native-image-picker';

const Recuriteraccountscreen = ({ navigation }) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);

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
      console.error('Error fetching company data:', error);
      setCompanyData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCompanyData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  // Image picker for logo
  const handlePickLogo = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setSelectedLogo(response.assets[0]);
        }
      }
    );
  };

  // Save company with logo
  const handleSaveCompany = async (companyDetails) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', companyDetails.name);
      formData.append('description', companyDetails.description);
      formData.append('location', companyDetails.location);
      formData.append('website', companyDetails.website);
      if (selectedLogo) {
        formData.append('logo', {
          uri: selectedLogo.uri,
          type: selectedLogo.type || 'image/jpeg',
          name: selectedLogo.fileName || 'logo.jpg',
        });
      }
      const response = await fetch(`${BACKEND_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Company profile saved!');
        fetchCompanyData();
      } else {
        Alert.alert('Error', result.error || 'Failed to save company');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEdit = () => {
    // Show logo picker before navigating to Companyscreen
    Alert.alert(
      'Logo',
      'Do you want to pick a logo for your company?',
      [
        { text: 'Skip', onPress: () => navigation.navigate('Companyscreen', {
            companyData: companyData,
            isEdit: !!companyData,
            onSave: fetchCompanyData
          }) },
        { text: 'Pick Logo', onPress: handlePickLogo },
      ]
    );
  };

  const handleViewProfile = () => {
    // Navigate to full company profile view
    if (companyData) {
      navigation.navigate('CompanyProfile', { companyData });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3288DD" />
          <Text style={styles.loadingText}>Loading your account...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Account</Text>
            {/* <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        {/* Profile Section */}
        <View style={styles.profileCard}>
          {companyData ? (
            <>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ 
                    uri: selectedLogo?.uri || companyData.logo || `https://via.placeholder.com/100x100/4F46E5/ffffff?text=${encodeURIComponent(companyData.name?.charAt(0) || 'C')}`
                  }}
                  style={styles.avatar}
                />
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                </View>
                <TouchableOpacity onPress={handlePickLogo} style={styles.logoPickerButton}>
                  <Text style={styles.logoPickerText}>{selectedLogo ? 'Change Logo' : 'Pick Logo'}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.companyName}>{companyData.name}</Text>
              
              {/* Company Stats */}
              {/* <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Jobs Posted</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>156</Text>
                  <Text style={styles.statLabel}>Applications</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Hired</Text>
                </View>
              </View> */}
              
              {/* Company Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>About Company</Text>
                <Text style={styles.description}>
                  {companyData.description || 'No description available. Add a company description to attract top talent.'}
                </Text>
                
                {/* Info Items */}
                <View style={styles.infoContainer}>
                  {companyData.location && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="location" size={16} color="#3288DD" />
                      </View>
                      <Text style={styles.infoText}>{companyData.location}</Text>
                    </View>
                  )}
                  
                  {companyData.website && (
                    <TouchableOpacity style={styles.infoItem}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="globe" size={16} color="#3288DD" />
                      </View>
                      <Text style={[styles.infoText, styles.linkText]}>{companyData.website}</Text>
                      <Ionicons name="open-outline" size={14} color="#3288DD" style={styles.externalIcon} />
                    </TouchableOpacity>
                  )}
                  
                  {companyData.email && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="mail" size={16} color="#3288DD" />
                      </View>
                      <Text style={styles.infoText}>{companyData.email}</Text>
                    </View>
                  )}
                  
                  {companyData.phone && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="call" size={16} color="#3288DD" />
                      </View>
                      <Text style={styles.infoText}>{companyData.phone}</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noCompanyContainer}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="business-outline" size={48} color="#ccc" />
              </View>
              <Text style={styles.noCompanyTitle}>No Company Profile</Text>
              <Text style={styles.noCompanySubtext}>
                Create your company profile to start posting jobs and attract top talent
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={handleEdit}>
                <Ionicons name="add-circle" size={20} color="#fff" style={styles.createButtonIcon} />
                <Text style={styles.createButtonText}>Create Company Profile</Text>
              </TouchableOpacity>
              {selectedLogo && (
                <Image source={{ uri: selectedLogo.uri }} style={styles.avatar} />
              )}
              <TouchableOpacity onPress={handlePickLogo} style={styles.logoPickerButton}>
                <Text style={styles.logoPickerText}>{selectedLogo ? 'Change Logo' : 'Pick Logo'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        {companyData && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>
{/*             
            <TouchableOpacity style={styles.secondaryButton} onPress={handleViewProfile}>
              <Ionicons name="eye-outline" size={20} color="#3288DD" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>View Public Profile</Text>
            </TouchableOpacity> */}
          </View>
        )}
        
        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingSectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="notifications-outline" size={20} color="#666" />
              <Text style={styles.settingItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
              <Text style={styles.settingItemText}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.settingItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="log-out-outline" size={20} color="#FF4444" />
              <Text style={[styles.settingItemText, styles.logoutText]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Header Styles
  headerContainer: {
    position: 'relative',
    paddingTop: 44,
  },
  headerGradient: {
    backgroundColor: '#3288DD',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  // Content Styles
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  // Avatar Styles
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 3,
    elevation: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3288DD',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  
  // Details Styles
  detailsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'left',
  },
  
  // Info Styles
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  linkText: {
    color: '#3288DD',
  },
  externalIcon: {
    marginLeft: 8,
  },
  
  // No Company Styles
  noCompanyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noCompanyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  noCompanySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#3288DD',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Action Buttons
  actionSection: {
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#3288DD',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3288DD',
  },
  secondaryButtonText: {
    color: '#3288DD',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  
  // Settings Styles
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF4444',
  },
  
  bottomPadding: {
    height: 32,
  },
  logoPickerButton: {
    marginTop: 8,
    backgroundColor: '#e0f1ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'center',
  },
  logoPickerText: {
    color: '#3288DD',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Recuriteraccountscreen;