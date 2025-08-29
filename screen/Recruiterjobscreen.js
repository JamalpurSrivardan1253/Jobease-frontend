import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';
import { colors } from './utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  'IT', 'Finance', 'Marketing', 'Sales', 'HR', 'Design', 'Operations'
];
const SALARIES = [
  '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '10', '12', '15', '20'
];
const LOCATIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'
];

const JOB_STATUSES = [
  { value: 'open', label: 'Open', icon: 'radio-button-on', color: '#10B981' },
  { value: 'closed', label: 'Closed', icon: 'radio-button-off', color: '#EF4444' }
];

const Recruiterjobscreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params || {};

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [jobStatus, setJobStatus] = useState('open');
  const [categoryModal, setCategoryModal] = useState(false);
  const [salaryModal, setSalaryModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [jobStatusModal, setJobStatusModal] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(res.data);
      setTitle(res.data.title || '');
      setDescription(res.data.description || '');
      setCategory(res.data.category || '');
      setSalary(res.data.salary ? String(res.data.salary) : '');
      setLocation(res.data.location || '');
      setJobStatus(res.data.jobStatus || 'open');
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch job details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!description.trim()) newErrors.description = 'Job description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!salary) newErrors.salary = 'Salary is required';
    if (!location) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BACKEND_URL}/api/jobs/${jobId}`,
        { title, description, category, salary, location, jobStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Job updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const getStatusInfo = (status) => {
    return JOB_STATUSES.find(s => s.value === status) || JOB_STATUSES[0];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Job Not Found</Text>
          <Text style={styles.errorDescription}>
            The job you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Enhanced Dropdown Modal Component
  const DropdownModal = ({ visible, data, onSelect, onClose, label, selectedValue }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={label === 'Job Status' ? data : data.map(item => ({ value: item, label: item }))}
            keyExtractor={(item) => label === 'Job Status' ? item.value : item.value}
            renderItem={({ item }) => {
              const isSelected = selectedValue === (label === 'Job Status' ? item.value : item.value);
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSelected && styles.selectedModalItem]}
                  onPress={() => {
                    onSelect(label === 'Job Status' ? item.value : item.value);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    {label === 'Job Status' && (
                      <Ionicons 
                        name={item.icon} 
                        size={20} 
                        color={item.color} 
                        style={styles.statusIcon}
                      />
                    )}
                    <Text style={[
                      styles.modalItemText, 
                      isSelected && styles.selectedModalItemText
                    ]}>
                      {label === 'Job Status' ? item.label : item.label}
                      {label === 'Salary' && item.value ? ` LPA` : ''}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.blue} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Job</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Job Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Job Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({...errors, title: null});
            }}
            placeholder="Enter job title"
            placeholderTextColor="#9CA3AF"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Job Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors({...errors, description: null});
            }}
            placeholder="Describe the job role, requirements, and responsibilities..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Category Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.category && styles.inputError]}
            onPress={() => setCategoryModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
              <Text style={[styles.dropdownText, category && styles.selectedText]}>
                {category || 'Select Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Salary Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Salary <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.salary && styles.inputError]}
            onPress={() => setSalaryModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text style={[styles.dropdownText, salary && styles.selectedText]}>
                {salary ? `₹ ${salary} LPA` : 'Select Salary Range'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}
        </View>

        {/* Location Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.location && styles.inputError]}
            onPress={() => setLocationModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={[styles.dropdownText, location && styles.selectedText]}>
                {location || 'Select Location'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        {/* Job Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Status</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setJobStatusModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <Ionicons 
                name={getStatusInfo(jobStatus).icon} 
                size={20} 
                color={getStatusInfo(jobStatus).color} 
              />
              <Text style={[styles.dropdownText, styles.selectedText]}>
                {getStatusInfo(jobStatus).label}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <View style={styles.saveButtonContent}>
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={styles.saveLoader} />
                <Text style={styles.saveButtonText}>Saving Changes...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <DropdownModal
        visible={categoryModal}
        data={CATEGORIES}
        onSelect={setCategory}
        onClose={() => setCategoryModal(false)}
        label="Category"
        selectedValue={category}
      />

      <DropdownModal
        visible={salaryModal}
        data={SALARIES}
        onSelect={setSalary}
        onClose={() => setSalaryModal(false)}
        label="Salary"
        selectedValue={salary}
      />

      <DropdownModal
        visible={locationModal}
        data={LOCATIONS}
        onSelect={setLocation}
        onClose={() => setLocationModal(false)}
        label="Location"
        selectedValue={location}
      />

      <DropdownModal
        visible={jobStatusModal}
        data={JOB_STATUSES}
        onSelect={setJobStatus}
        onClose={() => setJobStatusModal(false)}
        label="Job Status"
        selectedValue={jobStatus}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  errorContent: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  inputGroup: {
    marginHorizontal: 20,
    marginTop: 20,
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  selectedText: {
    color: '#1F2937',
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
  saveButton: {
    backgroundColor: colors.blue,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 12,
    shadowColor: colors.blue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveLoader: {
    marginRight: 8,
  },
  bottomSpacer: {
    height: 40,
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
    backgroundColor: '#fff',
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modalItemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedModalItemText: {
    color: colors.blue,
    fontWeight: '600',
  },
  statusIcon: {
    marginRight: 12,
  },
});

export default Recruiterjobscreen;