import React, { useState } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import {pick, types} from '@react-native-documents/picker';

  

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    console.log("Requesting storage permission for Android");
    try {
      let permission;

      if (Platform.Version >= 33) {
        // ✅ Android 13+ (API 33+): SAF handles document picking, no permission required for general files like PDFs
        console.log("No permission needed for Android 13+ when using SAF for picking documents.");
        return true;
      } else {
        // ✅ Android 12 and below
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        console.log("Requesting READ_EXTERNAL_STORAGE permission for Android 12 and below");

        const granted = await PermissionsAndroid.request(permission, {
          title: "Storage Permission",
          message: "App needs access to your storage to select documents.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        });

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn("Permission error:", err);
      return false;
    }
  } else {
    // ✅ iOS or others
    return true;
  }
};


//   const handlePickDocument = async () => {
//   console.log("handlePickDocument triggered");
//   const hasPermission = await requestStoragePermission();
//   console.log("Permission granted:", hasPermission);

//   if (!hasPermission) {
//     Alert.alert('Permission Denied', 'You need to allow file access to upload your resume.');
//     return;
//   }

//   try {
//     const res = await DocumentPicker.pick({
//       type: [DocumentPicker.types.pdf, DocumentPicker.types.docx],
//     });

//     console.log('Picked file:', res);

//     const token = await AsyncStorage.getItem('token');
//     if (!token) {
//       Alert.alert('Error', 'You must be logged in to upload your resume.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('resume', {
//       uri: res[0].uri,
//       type: res[0].type || 'application/pdf',
//       name: res[0].name || 'resume.pdf',
//     });

//     const response = await fetch(`${BACKEND_URL}/api/auth/upload-resume`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'multipart/form-data',
//       },
//       body: formData,
//     });

//     const textResponse = await response.text();
//     let data;
//     try {
//       data = JSON.parse(textResponse);
//     } catch (parseError) {
//       console.error('Failed to parse response:', textResponse);
//       throw new Error('Server returned invalid JSON');
//     }

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to upload resume');
//     }

//     Alert.alert('Success', 'Resume uploaded successfully!');
//     fetchUserData();
//   } catch (err) {
//     if (DocumentPicker.isCancel(err)) {
//       console.log('User cancelled document picker');
//     } else {
//       console.error('Error picking or uploading document:', err);
//       Alert.alert('Error', 'Something went wrong while picking or uploading the document.');
//     }
//   }

//   console.log('Document picker finished');
// };
const handlePickDocument = async () => {
  console.log("handlePickDocument triggered");
  const hasPermission = await requestStoragePermission();
  console.log("Permission granted:", hasPermission);

  if (!hasPermission) {
    Alert.alert('Permission Denied', 'You need to allow file access to upload your resume.');
    return;
  }

  try {
    console.log('Starting document picker...');
    const res = await pick({
    type: [types.pdf, types.docx],
  }

    );

    console.log('Picked file:', res);

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to upload your resume.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', {
      uri: res[0].uri,
      type: res[0].type || 'application/pdf',
      name: res[0].name || 'resume.pdf',
    });

    const response = await fetch(`${BACKEND_URL}/api/auth/upload-resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
   console.log('Response from server:', response);
    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Failed to parse response:', textResponse);
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload resume');
    }

    Alert.alert('Success', 'Resume uploaded successfully!');
    fetchUserData();
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled document picker');
    } else {
      console.error('Error picking or uploading document:', err);
      Alert.alert('Error', 'Something went wrong while picking or uploading the document.');
    }
  }

};


 
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, // <-- uncommented
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Linking,
  SafeAreaView
} from 'react-native';
import { colors } from './utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../utils/config';
import { useFocusEffect } from '@react-navigation/native';


const Accountscreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false); // For ellipsis dropdown
  // const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );
 // Navigation to EditProfileScreen
  const navigateToEditProfile = () => {
    navigation.navigate('EditProfileScreen', { userData });
  };
  const fetchUserData = async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      setError('Failed to load user data. Please try again.');
      setUserData(null);
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleResumeDownload = async () => {
    try {
      if (!userData?.resume) return;
      await Linking.openURL(userData.resume);
    } catch (err) {
      Alert.alert('Error', 'Failed to download resume');
    }
  };

  // ...existing code...


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity onPress={fetchUserData} style={{ backgroundColor: colors.blue, padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg}>
          {/* Settings icon in header */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <Ionicons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
          {/* Profile Picture */}
          {userData?.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#e0e7ef', justifyContent: 'center', alignItems: 'center' }]}> 
              <Ionicons name="person" size={48} color="#888" />
            </View>
          )}
          <Text style={styles.name}>{userData?.firstName} {userData?.lastName}</Text>
          <Text style={styles.role}>{userData?.jobTitle || 'Professional'}</Text>
        </View>

        {/* Bio or Intro Text */}
        <Text style={styles.introText}>
          {userData?.bio && userData.bio.trim() !== ''
            ? userData.bio
            : 'Explore my professional journey and achievements – view my profile.'}
        </Text>

        {/* Resume Card with Pick and Download Button */}
        <View style={styles.resumeCardRow}>
          <View style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>My Resume</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={[styles.editButtonCard]} onPress={handlePickDocument}>
              <Ionicons name="cloud-upload" size={16} color="#fff" />
            </TouchableOpacity>
            {userData?.resume && (
              <TouchableOpacity style={[styles.editButtonCard]} onPress={handleResumeDownload}>
                <Ionicons name="download" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Education Section with Edit Button */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity 
              style={styles.editButtonSection}
              onPress={navigateToEditProfile}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          {userData?.education && userData.education.length > 0 ? (
            userData.education.map((edu, index) => (
              <View key={index} style={styles.educationCard}>
                <Text style={styles.educationDegree}>{edu.degree}</Text>
                <Text style={styles.educationBranch}>{edu.branch}</Text>
                <Text style={styles.educationInstitute}>{edu.institute}</Text>
                <View style={styles.educationDetails}>
                  <Text style={styles.educationYear}>Year: {edu.year}</Text>
                  <Text style={styles.educationCgpa}>CGPA: {edu.cgpa}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No education details added yet</Text>
          )}
        </View>

        {/* Experience Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {userData?.experience && userData.experience.length > 0 ? (
            userData.experience.map((exp, index) => (
              <View key={index} style={styles.experienceCard}>
                <Text style={styles.experienceTitle}>{exp.jobTitle}</Text>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceDuration}>{exp.startDate} - {exp.endDate || 'Present'}</Text>
                {exp.description && <Text style={styles.experienceDescription}>{exp.description}</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No work experience added yet</Text>
          )}
        </View>

        {/* Certifications Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {userData?.certifications && userData.certifications.length > 0 ? (
            userData.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationCard}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
                <Text style={styles.certificationDate}>Issued: {cert.issueDate}</Text>
                {cert.expiryDate && <Text style={styles.certificationExpiry}>Expires: {cert.expiryDate}</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No certifications added yet</Text>
          )}
        </View>

        {/* Skills Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillRow}>
            {userData?.skills &&
              (Array.isArray(userData.skills)
                ? userData.skills.length > 0
                  ? userData.skills.map((skill, index) => (
                      <View key={index} style={styles.skillBox}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))
                  : <Text style={styles.noDataText}>No skills added yet</Text>
                : typeof userData.skills === 'string' && userData.skills.trim() !== ''
                  ? userData.skills.split(',').map((skill, index) => (
                      <View key={index} style={styles.skillBox}>
                        <Text style={styles.skillText}>{skill.trim()}</Text>
                      </View>
                    ))
                  : <Text style={styles.noDataText}>No skills added yet</Text>
              )}
          </View>
        </View>

        {/* Company Logo Section */}
        <View style={styles.companyLogoContainer}>
          {userData?.companyId && userData?.company?.logo ? (
            <Image source={{ uri: userData.company.logo }} style={styles.companyLogo} />
          ) : (
            <Image source={require('./assets/logo.png')} style={styles.companyLogo} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBg: {
    width: '100%',
    backgroundColor: '#22223b',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    top: 48,
    padding: 8,
    zIndex: 2,
  },
  menuDropdown: {
    position: 'absolute',
    right: 20,
    top: 76,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 120,
    zIndex: 10,
  },
  menuDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  menuDropdownText: {
    color: '#dc3545',
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
    textAlign: 'center',
  },
  role: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: '#222',
    marginTop: 18,
    marginBottom: 18,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  resumeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 18,
    width: '85%',
    alignSelf: 'center',
  },
  resumeCard: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    width: '85%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  editButtonCard: {
    backgroundColor: colors.blue,
    padding: 8,
    borderRadius: 16,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  resumeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  resumeFile: {
    color: '#e0e7ef',
    fontSize: 13,
  },
  sectionContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  editButtonSection: {
    backgroundColor: colors.blue,
    padding: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  educationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeft: 4,
    borderLeftColor: colors.blue,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  educationBranch: {
    fontSize: 14,
    color: colors.blue,
    marginBottom: 4,
  },
  educationInstitute: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  educationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  educationYear: {
    fontSize: 12,
    color: '#888',
  },
  educationCgpa: {
    fontSize: 12,
    color: '#888',
  },
  experienceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeft: 4,
    borderLeftColor: '#28a745',
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 4,
  },
  experienceDuration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  certificationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeft: 4,
    borderLeftColor: '#ffc107',
  },
  certificationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  certificationIssuer: {
    fontSize: 14,
    color: '#ffc107',
    marginBottom: 4,
  },
  certificationDate: {
    fontSize: 12,
    color: '#666',
  },
  certificationExpiry: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 2,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBox: {
    backgroundColor: colors.lightBlue,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    alignItems: 'center',
  },
  skillText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 14,
  },
  noDataText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  companyLogoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  companyLogo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
});

export default Accountscreen;