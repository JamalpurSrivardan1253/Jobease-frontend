import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './utils/colors';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BACKEND_URL } from '../utils/config'; // Change to your backend IP if needed

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
        .catch(() =>  setJob(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [jobId]);
  // Use correct icon for save/unsave (filled for saved, outline for unsaved)
  // No extra code needed here, just update the icon in the render
  useEffect(() => {
    if (jobId) {
      // Fetch user info and check if job is saved
      (async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        setUserId(userRes.data._id || userRes.data.id);
        // Get saved jobs
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
        // Unsave
        await axios.delete(`${BACKEND_URL}/api/users/${userId}/unsave-job/${job._id || job.id}`,
          { headers: { Authorization: `Bearer ${token}` } });
        setIsSaved(false);
      } else {
        // Save
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
        <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ margin: 32, color: 'red', fontSize: 18 }}>Job not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.company}>
              {job.company?.name || job.company?.toString() || ''}
            </Text>
            <Text style={styles.location}>{job.location}</Text>
          </View>
          <TouchableOpacity onPress={handleSaveUnsave} disabled={saveLoading}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={isSaved ? colors.blue : '#888'}
              style={styles.bookmark}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'Job Description' && styles.activeTab]}
            onPress={() => setTab('Job Description')}
          >
            <Text style={[styles.tabText, tab === 'Job Description' && styles.activeTabText]}>Job Description</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'Company Details' && styles.activeTab]}
            onPress={() => setTab('Company Details')}
          >
            <Text style={[styles.tabText, tab === 'Company Details' && styles.activeTabText]}>Company Details</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {tab === 'Job Description' ? (
            <>
              <Text style={styles.sectionTitle}>Job Title:</Text>
              <Text style={styles.body}>{job.title}</Text>
              <Text style={styles.sectionTitle}>Job Description:</Text>
              <Text style={styles.body}>{job.description}</Text>
              <Text style={styles.sectionTitle}>Requirements:</Text>
              {(job.requirements || []).map((req, idx) => (
                <Text key={idx} style={styles.bullet}>• {req}</Text>
              ))}
              <Text style={styles.sectionTitle}>Salary:</Text>
              <Text style={styles.body}>{job.salary ? `₹${job.salary}` : 'Not specified'}</Text>
              <Text style={styles.sectionTitle}>Category:</Text>
              <Text style={styles.body}>{job.category || 'Not specified'}</Text>
              <Text style={styles.sectionTitle}>Location:</Text>
              <Text style={styles.body}>{job.location || 'Not specified'}</Text>
              <Text style={styles.sectionTitle}>Status:</Text>
              <Text style={styles.body}>{job.status || 'Not specified'}</Text>
              <Text style={styles.sectionTitle}>Posted On:</Text>
              <Text style={styles.body}>{job.createdAt ? new Date(job.createdAt).toDateString() : ''}</Text>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Company Name:</Text>
              <Text style={styles.body}>{job.company?.name || ''}</Text>
              <Text style={styles.sectionTitle}>Description:</Text>
              <Text style={styles.body}>{job.company?.description || 'No description provided.'}</Text>
              <Text style={styles.sectionTitle}>Website:</Text>
              <Text style={styles.body}>{job.company?.website || 'No website provided.'}</Text>
              <Text style={styles.sectionTitle}>Location:</Text>
              <Text style={styles.body}>{job.company?.location || 'No location provided.'}</Text>
              <Text style={styles.sectionTitle}>Created By:</Text>
              <Text style={styles.body}>{job.company?.createdBy || 'N/A'}</Text>
              <Text style={styles.sectionTitle}>Created At:</Text>
              <Text style={styles.body}>{job.company?.createdAt ? new Date(job.company.createdAt).toDateString() : ''}</Text>
            </>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  company: {
    fontSize: 16,
    color: '#444',
  },
  location: {
    fontSize: 14,
    color: '#888',
  },
  bookmark: {
    fontSize: 22,
    color: '#888',
    marginLeft: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.blue,
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
    color: '#222',
  },
  body: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#444',
    marginLeft: 8,
    marginBottom: 2,
  },
  applyButton: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    margin: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Jobscreen;
