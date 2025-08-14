import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './utils/colors';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BACKEND_URL } from '../utils/config';

const { width } = Dimensions.get('window');

const Jobscreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Job Description');
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (jobId) {
      console.log(`Fetching job with ID: ${jobId}`);
      axios.get(`${BACKEND_URL}/api/jobs/${jobId}`)
        .then(res => setJob(res.data))
        .catch(() => setJob(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      (async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        try {
          const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserId(userRes.data._id || userRes.data.id);
          const savedRes = await axios.get(`${BACKEND_URL}/api/users/${userRes.data._id || userRes.data.id}/saved-jobs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsSaved(savedRes.data.some(j => (j._id || j.id) === (jobId)));
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [jobId]);

  const handleApply = useCallback(async () => {
    if (saveLoading) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to apply.');
        return;
      }
      await axios.post(
        `${BACKEND_URL}/api/applications/apply`,
        {
          jobId: job._id || job.id,
          resumeLink: '',
          coverLetter: '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Applied successfully!');
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to apply for job.'
      );
    }
  }, [job, saveLoading]);

  const handleSaveUnsave = useCallback(async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !userId || !job) return;
      if (isSaved) {
        await axios.delete(`${BACKEND_URL}/api/users/${userId}/unsave-job/${job._id || job.id}`,
          { headers: { Authorization: `Bearer ${token}` } });
        setIsSaved(false);
      } else {
        await axios.post(`${BACKEND_URL}/api/users/${userId}/save-job`,
          { jobId: job._id || job.id },
          { headers: { Authorization: `Bearer ${token}` } });
        setIsSaved(true);
      }
    } catch (e) {
      alert('Failed to update saved jobs.');
    } finally {
      setSaveLoading(false);
    }
  }, [isSaved, userId, job, saveLoading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>Job not found</Text>
          <Text style={styles.errorSubText}>The job you're looking for doesn't exist or has been removed.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={job.company?.logo
                  ? { uri: job.company.logo }
                  : require('./assets/logo.png')
                }
                style={styles.logo}
              />
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
              <View style={styles.companyRow}>
                <Ionicons name="business-outline" size={16} color="#666" />
                <Text style={styles.company}>
                  {job.company?.name || job.company?.toString() || 'Company'}
                </Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.location}>{job.location || 'Location not specified'}</Text>
              </View>
              <View style={styles.salaryRow}>
                <Ionicons name="wallet-outline" size={16} color="#666" />
                <Text style={styles.salary}>
                  {job.salary ? `₹${job.salary.toLocaleString()}` : 'Salary not disclosed'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleSaveUnsave} 
              disabled={saveLoading}
              style={[styles.bookmarkButton, isSaved && styles.bookmarkButtonActive]}
            >
              {saveLoading ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ) : (
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isSaved ? '#fff' : colors.blue}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Section */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'Job Description' && styles.activeTab]}
            onPress={() => setTab('Job Description')}
          >
            <Ionicons 
              name="document-text-outline" 
              size={20} 
              color={tab === 'Job Description' ? '#fff' : '#666'} 
            />
            <Text style={[styles.tabText, tab === 'Job Description' && styles.activeTabText]}>
              Job Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, tab === 'Company Details' && styles.activeTab]}
            onPress={() => setTab('Company Details')}
          >
            <Ionicons 
              name="business-outline" 
              size={20} 
              color={tab === 'Company Details' ? '#fff' : '#666'} 
            />
            <Text style={[styles.tabText, tab === 'Company Details' && styles.activeTabText]}>
              Company
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'Job Description' ? (
            <View style={styles.contentContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.blue} /> Job Overview
                </Text>
                <View style={styles.card}>
                  <Text style={styles.body}>{job.description || 'No description available.'}</Text>
                </View>
              </View>

              {job.requirements && job.requirements.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.blue} /> Requirements
                  </Text>
                  <View style={styles.card}>
                    {job.requirements.map((req, idx) => (
                      <View key={idx} style={styles.requirementItem}>
                        <Ionicons name="chevron-forward" size={16} color={colors.blue} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.blue} /> Job Information
                </Text>
                <View style={styles.card}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Category</Text>
                      <Text style={styles.infoValue}>{job.category || 'Not specified'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <View style={[styles.statusBadge, job.status === 'active' && styles.activeStatusBadge]}>
                        <Text style={[styles.statusText, job.status === 'active' && styles.activeStatusText]}>
                          {job.status || 'Active'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Posted</Text>
                      <Text style={styles.infoValue}>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Recently'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="business" size={18} color={colors.blue} /> About the Company
                </Text>
                <View style={styles.card}>
                  <Text style={styles.companyName}>{job.company?.name || 'Company Name'}</Text>
                  <Text style={styles.body}>
                    {job.company?.description || 'No company description available.'}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="link-outline" size={18} color={colors.blue} /> Company Details
                </Text>
                <View style={styles.card}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Website</Text>
                      <Text style={styles.infoValue}>
                        {job.company?.website || 'Not provided'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>
                        {job.company?.location || 'Not provided'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Founded</Text>
                      <Text style={styles.infoValue}>
                        {job.company?.createdAt ? new Date(job.company.createdAt).getFullYear() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="send-outline" size={20} color="#fff" style={styles.applyIcon} />
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  jobInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 28,
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  company: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salary: {
    fontSize: 16,
    color: colors.blue,
    fontWeight: '600',
    marginLeft: 6,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.blue,
  },
  bookmarkButtonActive: {
    backgroundColor: colors.blue,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.blue,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  body: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginLeft: 8,
    flex: 1,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activeStatusText: {
    color: '#16a34a',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButton: {
    backgroundColor: colors.blue,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  applyIcon: {
    marginRight: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Jobscreen;
