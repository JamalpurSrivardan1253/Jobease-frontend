import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const Postjob = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [category, setCategory] = useState('');
  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Salary ranges - Updated with LPA format
  const salaryRanges = [
    { label: '₹2 LPA', value: '2' },
    { label: '₹2.5 LPA', value: '2.5' },
    { label: '₹3 LPA', value: '3' },
    { label: '₹3.5 LPA', value: '3.5' },
    { label: '₹4 LPA', value: '4' },
    { label: '₹5 LPA', value: '5' },
    { label: '₹6 LPA', value: '6' },
    { label: '₹7 LPA', value: '7' },
    { label: '₹8 LPA', value: '8' },
    { label: '₹10 LPA', value: '10' },
    { label: '₹12 LPA', value: '12' },
    { label: '₹15 LPA', value: '15' },
    { label: '₹20 LPA', value: '20' },
    { label: '₹25+ LPA', value: '25+' },
  ];

  // Job categories - Updated to match recruiter screen
  const categories = [
    { label: 'IT', value: 'IT', icon: 'code-slash' },
    { label: 'Finance', value: 'Finance', icon: 'card' },
    { label: 'Marketing', value: 'Marketing', icon: 'trending-up' },
    { label: 'Sales', value: 'Sales', icon: 'people' },
    { label: 'HR', value: 'HR', icon: 'person-add' },
    { label: 'Design', value: 'Design', icon: 'brush' },
    { label: 'Operations', value: 'Operations', icon: 'settings' },
    { label: 'Healthcare', value: 'Healthcare', icon: 'medical' },
    { label: 'Education', value: 'Education', icon: 'school' },
    { label: 'Engineering', value: 'Engineering', icon: 'construct' },
    { label: 'Customer Service', value: 'Customer Service', icon: 'headset' },
    { label: 'Other', value: 'Other', icon: 'ellipsis-horizontal' },
  ];

  // Location options
  const locations = [
    { label: 'Mumbai', value: 'Mumbai', icon: 'location' },
    { label: 'Delhi', value: 'Delhi', icon: 'location' },
    { label: 'Bangalore', value: 'Bangalore', icon: 'location' },
    { label: 'Hyderabad', value: 'Hyderabad', icon: 'location' },
    { label: 'Chennai', value: 'Chennai', icon: 'location' },
    { label: 'Kolkata', value: 'Kolkata', icon: 'location' },
    { label: 'Pune', value: 'Pune', icon: 'location' },
    { label: 'Ahmedabad', value: 'Ahmedabad', icon: 'location' },
    { label: 'Surat', value: 'Surat', icon: 'location' },
    { label: 'Jaipur', value: 'Jaipur', icon: 'location' },
    { label: 'Remote', value: 'Remote', icon: 'globe' },
    { label: 'Other', value: 'Other', icon: 'location-outline' },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Job title is required';
    else if (title.trim().length < 3) newErrors.title = 'Job title must be at least 3 characters';
    
    if (!description.trim()) newErrors.description = 'Job description is required';
    else if (description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
    
    if (!location.trim() && !location) newErrors.location = 'Location is required';
    if (!salary) newErrors.salary = 'Salary range is required';
    if (!category) newErrors.category = 'Job category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostJob = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error', 
        'Please fill in all required fields correctly.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          'Authentication Required', 
          'You must be logged in as a recruiter to post a job.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      await axios.post(
        `${BACKEND_URL}/api/jobs/`,
        { 
          title: title.trim(), 
          description: description.trim(), 
          location: location || locations.find(l => l.value === location)?.value, 
          salary, 
          category 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert(
        'Success!', 
        'Job posted successfully! Candidates can now view and apply to your job listing.', 
        [{ 
          text: 'OK', 
          onPress: () => {
            // Clear form
            setTitle('');
            setDescription('');
            setLocation('');
            setSalary('');
            setCategory('');
            setErrors({});
            if (navigation) navigation.goBack();
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        'Failed to Post Job',
        error.response?.data?.error || error.response?.data?.message || 'Server error. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const DropdownModal = ({ visible, onClose, data, onSelect, title, selectedValue }) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={data}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSelected && styles.selectedModalItem]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    {item.icon && (
                      <Ionicons 
                        name={item.icon} 
                        size={20} 
                        color={isSelected ? '#3288DD' : '#6B7280'} 
                        style={styles.modalItemIcon}
                      />
                    )}
                    <Text style={[
                      styles.modalItemText, 
                      isSelected && styles.selectedModalItemText
                    ]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="#3288DD" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );

  const DropdownInput = ({ placeholder, value, onPress, error, icon }) => (
    <TouchableOpacity 
      style={[styles.dropdownInput, error && styles.inputError]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownContent}>
        <Ionicons name={icon} size={20} color="#6B7280" style={styles.inputIcon} />
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#3288DD" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Post New Job</Text>
          <Text style={styles.headerSubtitle}>Find the perfect candidate</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.form}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Step 1 of 1: Job Details</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>

            {/* Job Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Job Title <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="briefcase-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="e.g. Senior Software Engineer"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errors.title) setErrors({...errors, title: null});
                  }}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Job Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Job Description <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  placeholder="Describe the role, responsibilities, requirements, qualifications, and benefits..."
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description) setErrors({...errors, description: null});
                  }}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>
                    {description.length}/500 characters
                  </Text>
                </View>
              </View>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              {location && !locations.find(l => l.value === location) ? (
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.location && styles.inputError]}
                    placeholder="e.g. Bangalore, Karnataka"
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      if (errors.location) setErrors({...errors, location: null});
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ) : (
                <DropdownInput
                  placeholder="Select location or choose 'Other' to type custom"
                  value={locations.find(l => l.value === location)?.label}
                  onPress={() => setLocationModalVisible(true)}
                  error={errors.location}
                  icon="location-outline"
                />
              )}
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            {/* Salary Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Salary Range <Text style={styles.required}>*</Text>
              </Text>
              <DropdownInput
                placeholder="Select salary range"
                value={salaryRanges.find(s => s.value === salary)?.label}
                onPress={() => setSalaryModalVisible(true)}
                error={errors.salary}
                icon="cash-outline"
              />
              {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Job Category <Text style={styles.required}>*</Text>
              </Text>
              <DropdownInput
                placeholder="Select job category"
                value={categories.find(c => c.value === category)?.label}
                onPress={() => setCategoryModalVisible(true)}
                error={errors.category}
                icon="grid-outline"
              />
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Post Button */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handlePostJob}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />
                    <Text style={styles.buttonText}>Posting Job...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Post Job</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Tips Section */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
                <Text style={styles.tipsTitle}>Tips for a Great Job Post</Text>
              </View>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Use clear, specific job titles</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Include required skills and qualifications</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Mention company benefits and culture</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <DropdownModal
        visible={salaryModalVisible}
        onClose={() => setSalaryModalVisible(false)}
        data={salaryRanges}
        onSelect={(item) => {
          setSalary(item.value);
          if (errors.salary) setErrors({...errors, salary: null});
        }}
        title="Select Salary Range"
        selectedValue={salary}
      />

      <DropdownModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        data={categories}
        onSelect={(item) => {
          setCategory(item.value);
          if (errors.category) setErrors({...errors, category: null});
        }}
        title="Select Job Category"
        selectedValue={category}
      />

      <DropdownModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        data={locations}
        onSelect={(item) => {
          if (item.value === 'Other') {
            setLocation(''); // This will show the text input
          } else {
            setLocation(item.value);
          }
          if (errors.location) setErrors({...errors, location: null});
        }}
        title="Select Location"
        selectedValue={location}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  }, container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backBtn: {
    padding: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    marginTop:32,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    padding: 16,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#3288DD',
    borderRadius: 2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  textAreaContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dropdownInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3288DD',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#3288DD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonLoader: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  tipsContainer: {
    marginTop: 32,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#78350F',
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedModalItem: {
    backgroundColor: '#EBF8FF',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemIcon: {
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedModalItemText: {
    color: '#3288DD',
    fontWeight: '600',
  },
});

export default Postjob;