import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { colors } from './utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../utils/config';
import { Dropdown } from 'react-native-element-dropdown';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = ({ route, navigation }) => {
  const { userData, onUpdate } = route.params;
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    jobTitle: userData?.jobTitle || '',
    bio: userData?.bio || '',
  });

  // Education State
  const [education, setEducation] = useState(userData?.education || []);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [currentEducation, setCurrentEducation] = useState({
    degree: '',
    branch: '',
    institute: '',
    year: '',
    cgpa: '',
  });
  const [editingEducationIndex, setEditingEducationIndex] = useState(-1);

  // Experience State
  const [experience, setExperience] = useState(userData?.experience || []);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [currentExperience, setCurrentExperience] = useState({
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrentJob: false,
  });
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(-1);

  // Certifications State
  const [certifications, setCertifications] = useState(userData?.certifications || []);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [currentCertification, setCurrentCertification] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
  });
  const [editingCertificationIndex, setEditingCertificationIndex] = useState(-1);

  // Skills State
  const [skills, setSkills] = useState(
    Array.isArray(userData?.skills)
      ? userData.skills
      : typeof userData?.skills === 'string' && userData.skills
      ? userData.skills.split(',').map(s => s.trim()).filter(s => s)
      : []
  );
  const [profileImage, setProfileImage] = useState(userData?.profileImage || null);

  const [loading, setLoading] = useState(false);

  // Skills data (categorized, flat for dropdown)
  const skillsOptions = [
    // Programming Languages
    { label: 'Java', value: 'Java', category: 'Programming Languages' },
    { label: 'Python', value: 'Python', category: 'Programming Languages' },
    { label: 'JavaScript', value: 'JavaScript', category: 'Programming Languages' },
    { label: 'TypeScript', value: 'TypeScript', category: 'Programming Languages' },
    { label: 'C#', value: 'C#', category: 'Programming Languages' },
    { label: 'C++', value: 'C++', category: 'Programming Languages' },
    { label: 'PHP', value: 'PHP', category: 'Programming Languages' },
    { label: 'Ruby', value: 'Ruby', category: 'Programming Languages' },
    { label: 'Go', value: 'Go', category: 'Programming Languages' },
    { label: 'Kotlin', value: 'Kotlin', category: 'Programming Languages' },
    { label: 'Swift', value: 'Swift', category: 'Programming Languages' },
    { label: 'Dart', value: 'Dart', category: 'Programming Languages' },
    { label: 'Rust', value: 'Rust', category: 'Programming Languages' },
    { label: 'SQL', value: 'SQL', category: 'Programming Languages' },
    { label: 'Bash/Shell', value: 'Bash/Shell', category: 'Programming Languages' },
    { label: 'R', value: 'R', category: 'Programming Languages' },
    { label: 'Scala', value: 'Scala', category: 'Programming Languages' },
    { label: 'Objective-C', value: 'Objective-C', category: 'Programming Languages' },
    { label: 'Perl', value: 'Perl', category: 'Programming Languages' },
    // Web Technologies
    { label: 'HTML', value: 'HTML', category: 'Web Technologies' },
    { label: 'CSS', value: 'CSS', category: 'Web Technologies' },
    { label: 'REST API', value: 'REST API', category: 'Web Technologies' },
    { label: 'GraphQL', value: 'GraphQL', category: 'Web Technologies' },
    { label: 'AJAX', value: 'AJAX', category: 'Web Technologies' },
    { label: 'WebSockets', value: 'WebSockets', category: 'Web Technologies' },
    // Frontend Frameworks
    { label: 'React.js', value: 'React.js', category: 'Frontend' },
    { label: 'Angular', value: 'Angular', category: 'Frontend' },
    { label: 'Vue.js', value: 'Vue.js', category: 'Frontend' },
    { label: 'Svelte', value: 'Svelte', category: 'Frontend' },
    { label: 'jQuery', value: 'jQuery', category: 'Frontend' },
    { label: 'Bootstrap', value: 'Bootstrap', category: 'Frontend' },
    { label: 'Tailwind CSS', value: 'Tailwind CSS', category: 'Frontend' },
    // Backend Frameworks
    { label: 'Node.js', value: 'Node.js', category: 'Backend' },
    { label: 'Express.js', value: 'Express.js', category: 'Backend' },
    { label: 'Spring Boot', value: 'Spring Boot', category: 'Backend' },
    { label: 'Django', value: 'Django', category: 'Backend' },
    { label: 'Flask', value: 'Flask', category: 'Backend' },
    { label: 'Laravel', value: 'Laravel', category: 'Backend' },
    { label: 'Ruby on Rails', value: 'Ruby on Rails', category: 'Backend' },
    { label: 'ASP.NET', value: 'ASP.NET', category: 'Backend' },
    { label: 'FastAPI', value: 'FastAPI', category: 'Backend' },
    // Databases
    { label: 'MySQL', value: 'MySQL', category: 'Databases' },
    { label: 'PostgreSQL', value: 'PostgreSQL', category: 'Databases' },
    { label: 'MongoDB', value: 'MongoDB', category: 'Databases' },
    { label: 'Oracle', value: 'Oracle', category: 'Databases' },
    { label: 'SQLite', value: 'SQLite', category: 'Databases' },
    { label: 'Microsoft SQL Server', value: 'Microsoft SQL Server', category: 'Databases' },
    { label: 'Firebase Realtime DB', value: 'Firebase Realtime DB', category: 'Databases' },
    { label: 'Redis', value: 'Redis', category: 'Databases' },
    { label: 'DynamoDB', value: 'DynamoDB', category: 'Databases' },
    // DevOps & Cloud
    { label: 'AWS', value: 'AWS', category: 'DevOps & Cloud' },
    { label: 'Microsoft Azure', value: 'Microsoft Azure', category: 'DevOps & Cloud' },
    { label: 'Google Cloud Platform (GCP)', value: 'Google Cloud Platform (GCP)', category: 'DevOps & Cloud' },
    { label: 'Docker', value: 'Docker', category: 'DevOps & Cloud' },
    { label: 'Kubernetes', value: 'Kubernetes', category: 'DevOps & Cloud' },
    { label: 'Jenkins', value: 'Jenkins', category: 'DevOps & Cloud' },
    { label: 'GitHub Actions', value: 'GitHub Actions', category: 'DevOps & Cloud' },
    { label: 'Terraform', value: 'Terraform', category: 'DevOps & Cloud' },
    { label: 'Ansible', value: 'Ansible', category: 'DevOps & Cloud' },
    { label: 'CI/CD', value: 'CI/CD', category: 'DevOps & Cloud' },
    // Mobile App Development
    { label: 'React Native', value: 'React Native', category: 'Mobile App Development' },
    { label: 'Flutter', value: 'Flutter', category: 'Mobile App Development' },
    { label: 'Android (Java/Kotlin)', value: 'Android (Java/Kotlin)', category: 'Mobile App Development' },
    { label: 'iOS (Swift/Objective-C)', value: 'iOS (Swift/Objective-C)', category: 'Mobile App Development' },
    { label: 'Xamarin', value: 'Xamarin', category: 'Mobile App Development' },
    { label: 'Ionic', value: 'Ionic', category: 'Mobile App Development' },
    // Testing Tools
    { label: 'Selenium', value: 'Selenium', category: 'Testing Tools' },
    { label: 'Cypress', value: 'Cypress', category: 'Testing Tools' },
    { label: 'JUnit', value: 'JUnit', category: 'Testing Tools' },
    { label: 'TestNG', value: 'TestNG', category: 'Testing Tools' },
    { label: 'Postman', value: 'Postman', category: 'Testing Tools' },
    { label: 'JMeter', value: 'JMeter', category: 'Testing Tools' },
    { label: 'Playwright', value: 'Playwright', category: 'Testing Tools' },
    { label: 'Appium', value: 'Appium', category: 'Testing Tools' },
    // Version Control & Collaboration
    { label: 'Git', value: 'Git', category: 'Version Control & Collaboration' },
    { label: 'GitHub', value: 'GitHub', category: 'Version Control & Collaboration' },
    { label: 'GitLab', value: 'GitLab', category: 'Version Control & Collaboration' },
    { label: 'Bitbucket', value: 'Bitbucket', category: 'Version Control & Collaboration' },
    { label: 'Jira', value: 'Jira', category: 'Version Control & Collaboration' },
    { label: 'Trello', value: 'Trello', category: 'Version Control & Collaboration' },
    { label: 'Slack', value: 'Slack', category: 'Version Control & Collaboration' },
    // Data Science / Machine Learning
    { label: 'NumPy', value: 'NumPy', category: 'Data Science / Machine Learning' },
    { label: 'Pandas', value: 'Pandas', category: 'Data Science / Machine Learning' },
    { label: 'Scikit-learn', value: 'Scikit-learn', category: 'Data Science / Machine Learning' },
    { label: 'TensorFlow', value: 'TensorFlow', category: 'Data Science / Machine Learning' },
    { label: 'PyTorch', value: 'PyTorch', category: 'Data Science / Machine Learning' },
    { label: 'Keras', value: 'Keras', category: 'Data Science / Machine Learning' },
    { label: 'Matplotlib', value: 'Matplotlib', category: 'Data Science / Machine Learning' },
    { label: 'Tableau', value: 'Tableau', category: 'Data Science / Machine Learning' },
    { label: 'Power BI', value: 'Power BI', category: 'Data Science / Machine Learning' },
    // Other Tools / Platforms
    { label: 'WordPress', value: 'WordPress', category: 'Other Tools / Platforms' },
    { label: 'Shopify', value: 'Shopify', category: 'Other Tools / Platforms' },
    { label: 'Magento', value: 'Magento', category: 'Other Tools / Platforms' },
    { label: 'Salesforce', value: 'Salesforce', category: 'Other Tools / Platforms' },
    { label: 'ServiceNow', value: 'ServiceNow', category: 'Other Tools / Platforms' },
    { label: 'Figma', value: 'Figma', category: 'Other Tools / Platforms' },
    { label: 'Adobe XD', value: 'Adobe XD', category: 'Other Tools / Platforms' },
    { label: 'Notion', value: 'Notion', category: 'Other Tools / Platforms' },
  ];

  // Education Functions
  const addOrUpdateEducation = () => {
    if (!currentEducation.degree || !currentEducation.institute) {
      Alert.alert('Error', 'Please fill in degree and institute fields');
      return;
    }

    const newEducation = [...education];
    if (editingEducationIndex >= 0) {
      newEducation[editingEducationIndex] = currentEducation;
    } else {
      newEducation.push(currentEducation);
    }

    setEducation(newEducation);
    setShowEducationModal(false);
    resetEducationForm();
  };

  const editEducation = (index) => {
    setCurrentEducation(education[index]);
    setEditingEducationIndex(index);
    setShowEducationModal(true);
  };

  const deleteEducation = (index) => {
    Alert.alert(
      'Delete Education',
      'Are you sure you want to delete this education entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newEducation = education.filter((_, i) => i !== index);
            setEducation(newEducation);
          },
        },
      ]
    );
  };

  const resetEducationForm = () => {
    setCurrentEducation({
      degree: '',
      branch: '',
      institute: '',
      year: '',
      cgpa: '',
    });
    setEditingEducationIndex(-1);
  };

  // Experience Functions
  const addOrUpdateExperience = () => {
    if (!currentExperience.jobTitle || !currentExperience.company) {
      Alert.alert('Error', 'Please fill in job title and company fields');
      return;
    }

    const newExperience = [...experience];
    const expToSave = {
      ...currentExperience,
      endDate: currentExperience.isCurrentJob ? null : currentExperience.endDate,
    };

    if (editingExperienceIndex >= 0) {
      newExperience[editingExperienceIndex] = expToSave;
    } else {
      newExperience.push(expToSave);
    }

    setExperience(newExperience);
    setShowExperienceModal(false);
    resetExperienceForm();
  };

  const editExperience = (index) => {
    const exp = experience[index];
    setCurrentExperience({
      ...exp,
      isCurrentJob: !exp.endDate,
      endDate: exp.endDate || '',
    });
    setEditingExperienceIndex(index);
    setShowExperienceModal(true);
  };

  const deleteExperience = (index) => {
    Alert.alert(
      'Delete Experience',
      'Are you sure you want to delete this experience entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newExperience = experience.filter((_, i) => i !== index);
            setExperience(newExperience);
          },
        },
      ]
    );
  };

  const resetExperienceForm = () => {
    setCurrentExperience({
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentJob: false,
    });
    setEditingExperienceIndex(-1);
  };

  // Certification Functions
  const addOrUpdateCertification = () => {
    if (!currentCertification.name || !currentCertification.issuer) {
      Alert.alert('Error', 'Please fill in certification name and issuer fields');
      return;
    }

    const newCertifications = [...certifications];
    if (editingCertificationIndex >= 0) {
      newCertifications[editingCertificationIndex] = currentCertification;
    } else {
      newCertifications.push(currentCertification);
    }

    setCertifications(newCertifications);
    setShowCertificationModal(false);
    resetCertificationForm();
  };

  const editCertification = (index) => {
    setCurrentCertification(certifications[index]);
    setEditingCertificationIndex(index);
    setShowCertificationModal(true);
  };

  const deleteCertification = (index) => {
    Alert.alert(
      'Delete Certification',
      'Are you sure you want to delete this certification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newCertifications = certifications.filter((_, i) => i !== index);
            setCertifications(newCertifications);
          },
        },
      ]
    );
  };

  const resetCertificationForm = () => {
    setCurrentCertification({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
    });
    setEditingCertificationIndex(-1);
  };

  // Image Picker Handler (updated)
  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'ImagePicker Error: ' + response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  // Save Profile
  const saveProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const updatedData = {
        ...basicInfo,
        profileImage,
        skills: Array.isArray(skills) ? skills : [],
        education,
        experience,
        certifications,
      };
      console.log('Sending to backend:', updatedData);

      const response = await axios.put(
        `${BACKEND_URL}/api/users/${userData._id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              onUpdate && onUpdate();
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error?.response?.data || error.message || error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProfile}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <TouchableOpacity onPress={pickImage}>
          <View style={{ borderRadius: 60, overflow: 'hidden', borderWidth: 2, borderColor: colors.blue }}>
            <Image
              source={profileImage ? { uri: profileImage } : { uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={{ width: 120, height: 120 }}
            />
          </View>
          <Text style={{ color: colors.blue, marginTop: 8, fontWeight: 'bold' }}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={basicInfo.firstName}
                onChangeText={(text) => setBasicInfo({...basicInfo, firstName: text})}
                placeholder="First Name"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={basicInfo.lastName}
                onChangeText={(text) => setBasicInfo({...basicInfo, lastName: text})}
                placeholder="Last Name"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.email}
            onChangeText={(text) => setBasicInfo({...basicInfo, email: text})}
            placeholder="Email"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.phone}
            onChangeText={(text) => setBasicInfo({...basicInfo, phone: text})}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Job Title</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.jobTitle}
            onChangeText={(text) => setBasicInfo({...basicInfo, jobTitle: text})}
            placeholder="e.g., Software Engineer"
          />

          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={basicInfo.bio}
            onChangeText={(text) => {
              // Limit bio to 20 words
              const words = text.split(/\s+/).filter(Boolean);
              if (words.length <= 20) {
                setBasicInfo({ ...basicInfo, bio: text });
              } else {
                setBasicInfo({ ...basicInfo, bio: words.slice(0, 20).join(' ') });
              }
            }}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                resetEducationForm();
                setShowEducationModal(true);
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {education.map((edu, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{edu.degree}</Text>
                <Text style={styles.itemSubtitle}>{edu.branch}</Text>
                <Text style={styles.itemDescription}>{edu.institute}</Text>
                <Text style={styles.itemDetails}>Year: {edu.year} | CGPA: {edu.cgpa}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editActionButton}
                  onPress={() => editEducation(index)}
                >
                  <Ionicons name="pencil" size={16} color={colors.blue} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteActionButton}
                  onPress={() => deleteEducation(index)}
                >
                  <Ionicons name="trash" size={16} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                resetExperienceForm();
                setShowExperienceModal(true);
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {experience.map((exp, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{exp.jobTitle}</Text>
                <Text style={styles.itemSubtitle}>{exp.company}</Text>
                <Text style={styles.itemDetails}>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </Text>
                {exp.description ? (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                ) : null}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editActionButton}
                  onPress={() => editExperience(index)}
                >
                  <Ionicons name="pencil" size={16} color={colors.blue} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteActionButton}
                  onPress={() => deleteExperience(index)}
                >
                  <Ionicons name="trash" size={16} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                resetCertificationForm();
                setShowCertificationModal(true);
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {certifications.map((cert, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{cert.name}</Text>
                <Text style={styles.itemSubtitle}>{cert.issuer}</Text>
                <Text style={styles.itemDetails}>
                  Issued: {cert.issueDate}
                  {cert.expiryDate && ` | Expires: ${cert.expiryDate}`}
                </Text>
                {cert.credentialId && (
                  <Text style={styles.itemDescription}>ID: {cert.credentialId}</Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editActionButton}
                  onPress={() => editCertification(index)}
                >
                  <Ionicons name="pencil" size={16} color={colors.blue} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteActionButton}
                  onPress={() => deleteCertification(index)}
                >
                  <Ionicons name="trash" size={16} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.inputLabel}>Skills (search and select multiple)</Text>
          <Dropdown
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 50 }}
            data={skillsOptions}
            labelField="label"
            valueField="value"
            placeholder="Select skills"
            search
            searchPlaceholder="Search skills..."
            value={skills}
            onChange={items => {
              // Always expect an array of objects for multi-select
              if (Array.isArray(items)) {
                setSkills(items.map(i => i.value));
              } else if (items && items.value) {
                setSkills([items.value]);
              } else {
                setSkills([]);
              }
            }}
            multiple
            selectedTextStyle={{ color: colors.blue }}
            itemContainerStyle={{ borderBottomWidth: 0 }}
            containerStyle={{ maxHeight: 300 }}
          />
        </View>
      </ScrollView>

      {/* Education Modal */}
      <Modal
        visible={showEducationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEducationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEducationIndex >= 0 ? 'Edit Education' : 'Add Education'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Degree *</Text>
              <TextInput
                style={styles.input}
                value={currentEducation.degree}
                onChangeText={(text) => setCurrentEducation({...currentEducation, degree: text})}
                placeholder="e.g., Bachelor of Technology"
              />

              <Text style={styles.inputLabel}>Branch/Specialization</Text>
              <TextInput
                style={styles.input}
                value={currentEducation.branch}
                onChangeText={(text) => setCurrentEducation({...currentEducation, branch: text})}
                placeholder="e.g., Computer Science Engineering"
              />

              <Text style={styles.inputLabel}>Institute/University *</Text>
              <TextInput
                style={styles.input}
                value={currentEducation.institute}
                onChangeText={(text) => setCurrentEducation({...currentEducation, institute: text})}
                placeholder="e.g., IIT Delhi"
              />

              <View style={styles.inputRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Year of Graduation</Text>
                  <TextInput
                    style={styles.input}
                    value={currentEducation.year}
                    onChangeText={(text) => setCurrentEducation({...currentEducation, year: text})}
                    placeholder="2024"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>CGPA/Percentage</Text>
                  <TextInput
                    style={styles.input}
                    value={currentEducation.cgpa}
                    onChangeText={(text) => setCurrentEducation({...currentEducation, cgpa: text})}
                    placeholder="8.5"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEducationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addOrUpdateEducation}
              >
                <Text style={styles.confirmButtonText}>
                  {editingEducationIndex >= 0 ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Experience Modal */}
      <Modal
        visible={showExperienceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExperienceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExperienceIndex >= 0 ? 'Edit Experience' : 'Add Experience'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={currentExperience.jobTitle}
                onChangeText={(text) => setCurrentExperience({...currentExperience, jobTitle: text})}
                placeholder="e.g., Software Engineer"
              />

              <Text style={styles.inputLabel}>Company *</Text>
              <TextInput
                style={styles.input}
                value={currentExperience.company}
                onChangeText={(text) => setCurrentExperience({...currentExperience, company: text})}
                placeholder="e.g., Google"
              />

              <View style={styles.inputRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TextInput
                    style={styles.input}
                    value={currentExperience.startDate}
                    onChangeText={(text) => setCurrentExperience({...currentExperience, startDate: text})}
                    placeholder="Jan 2023"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TextInput
                    style={[styles.input, currentExperience.isCurrentJob && styles.disabledInput]}
                    value={currentExperience.endDate}
                    onChangeText={(text) => setCurrentExperience({...currentExperience, endDate: text})}
                    placeholder="Dec 2023"
                    editable={!currentExperience.isCurrentJob}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setCurrentExperience({
                  ...currentExperience,
                  isCurrentJob: !currentExperience.isCurrentJob,
                  endDate: !currentExperience.isCurrentJob ? '' : currentExperience.endDate
                })}
              >
                <View style={[styles.checkbox, currentExperience.isCurrentJob && styles.checkedBox]}>
                  {currentExperience.isCurrentJob && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>I currently work here</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Job Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentExperience.description}
                onChangeText={(text) => setCurrentExperience({...currentExperience, description: text})}
                placeholder="Describe your role and responsibilities..."
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowExperienceModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addOrUpdateExperience}
              >
                <Text style={styles.confirmButtonText}>
                  {editingExperienceIndex >= 0 ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Certification Modal */}
      <Modal
        visible={showCertificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCertificationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCertificationIndex >= 0 ? 'Edit Certification' : 'Add Certification'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Certification Name *</Text>
              <TextInput
                style={styles.input}
                value={currentCertification.name}
                onChangeText={(text) => setCurrentCertification({...currentCertification, name: text})}
                placeholder="e.g., AWS Certified Solutions Architect"
              />

              <Text style={styles.inputLabel}>Issuing Organization *</Text>
              <TextInput
                style={styles.input}
                value={currentCertification.issuer}
                onChangeText={(text) => setCurrentCertification({...currentCertification, issuer: text})}
                placeholder="e.g., Amazon Web Services"
              />

              <View style={styles.inputRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Issue Date</Text>
                  <TextInput
                    style={styles.input}
                    value={currentCertification.issueDate}
                    onChangeText={(text) => setCurrentCertification({...currentCertification, issueDate: text})}
                    placeholder="Jan 2023"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={currentCertification.expiryDate}
                    onChangeText={(text) => setCurrentCertification({...currentCertification, expiryDate: text})}
                    placeholder="Jan 2026"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Credential ID</Text>
              <TextInput
                style={styles.input}
                value={currentCertification.credentialId}
                onChangeText={(text) => setCurrentCertification({...currentCertification, credentialId: text})}
                placeholder="Certificate ID or URL"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCertificationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addOrUpdateCertification}
              >
                <Text style={styles.confirmButtonText}>
                  {editingCertificationIndex >= 0 ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#22223b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    backgroundColor: colors.blue,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.blue,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  itemDetails: {
    fontSize: 12,
    color: '#888',
  },
  itemActions: {
    flexDirection: 'row',
  },
  editActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: colors.blue,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#999',
  },
});

export default EditProfileScreen;