import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, // <-- uncommented
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert
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

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const navigateToEditProfile = () => {
    setShowMenu(false);
    navigation.navigate('EditProfileScreen', { userData, onUpdate: fetchUserData });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBg}>
        {/* Ellipsis menu at previous edit button position */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity onPress={handleLogout} style={styles.menuDropdownItem}>
              <Text style={styles.menuDropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
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

      {/* Resume Card without Edit Button */}
      <View style={styles.resumeCard}>
        <Text style={styles.resumeTitle}>My Resume</Text>
        <Text style={styles.resumeFile}>{userData?.resume || 'No resume uploaded'}</Text>
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
    </ScrollView>
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
});

export default Accountscreen;