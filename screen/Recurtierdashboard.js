import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from './utils/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { BACKEND_URL } from '../utils/config';// Change to your backend IP if needed

const Recurtierdashboard = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [applicationCount, setApplicationCount] = useState(null);

  // Helper to determine status and badge color
  const getJobStatus = (job) => {
    if (job.status === 'approved') {
      return { label: 'Active', badgeStyle: styles.activeBadge, textStyle: styles.activeBadgeText };
    }
    if (job.status === 'Active') {
      return { label: 'Active', badgeStyle: styles.activeBadge, textStyle: styles.activeBadgeText };
    }
    return { label: job.status || 'Inactive', badgeStyle: styles.inactiveBadge, textStyle: styles.inactiveBadgeText };
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
          setJobs([]);
          setApplicationCount(null);
          return;
        }
        // Get recruiter id and company id
        const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const companyId = userRes.data.companyId || userRes.data.company?._id || userRes.data.company;
        // Use /api/jobs/my to get jobs posted by this recruiter
        console.log('Calling /api/jobs/my');
        const jobsRes = await axios.get(`${BACKEND_URL}/api/jobs/my`, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Jobs response:', jobsRes.data);
        setJobs(jobsRes.data);
        // Fetch application count for the company
        if (companyId) {
          const countRes = await axios.get(`${BACKEND_URL}/api/applications/company/${companyId}/applications/count`, { headers: { Authorization: `Bearer ${token}` } });
          setApplicationCount(countRes.data.applicationsCount ?? 0);
        } else {
          setApplicationCount(0);
        }
      } catch (error) {
        console.log('Error fetching jobs:', error.response?.data || error.message);
        setJobs([]);
        setApplicationCount(null);
      }
    };
    fetchJobs();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>Jamalpur Srivardan</Text>
          </View>
        </View>
        <View style={styles.searchBoxWrapper}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search Candidates"
            placeholderTextColor="#888"
          />
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Job Openings</Text>
        </View>
        <TouchableOpacity
          style={styles.statCardRight}
          onPress={() => {
            // Pass the full jobs array to ApplicationsScreen
            navigation.navigate('ApplicationsScreen', { jobs });
          }}
        >
          <Text style={styles.statNumber}>
            {applicationCount === null ? '...' : applicationCount}
          </Text>
          <Text style={styles.statLabel}>Applications</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.sectionTitle}>Hiring Process</Text>
        {/* {jobs.map((job) => (
          <TouchableOpacity key={job._id || job.id} 
          style={styles.jobCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, justifyContent: 'space-between' }}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={
                job.status === 'approved' ? styles.approvedBadge :
                job.status === 'Active' ? styles.activeBadge :
                styles.inactiveBadge
              }>
                <Text style={
                  job.status === 'approved' ? styles.approvedBadgeText :
                  job.status === 'Active' ? styles.activeBadgeText :
                  styles.inactiveBadgeText
                }>{job.status === 'approved' ? 'Active' : (job.status || 'Pending')}</Text>
              </View>
            </View>
            <Text style={styles.jobCompany}>{job.company?.name || job.company || ''}</Text>
            <Text style={styles.jobLocation}>{job.location}</Text>
           </TouchableOpacity>
        ))} */}
        {jobs.map((job) => (
  <TouchableOpacity
    key={job._id || job.id}
    style={styles.jobCard}
    onPress={() => navigation.navigate('Recruiterjobscreen', { jobId: job._id || job.id })}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, justifyContent: 'space-between' }}>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <View style={
        job.status === 'approved' ? styles.approvedBadge :
        job.status === 'Active' ? styles.activeBadge :
        styles.inactiveBadge
      }>
        <Text style={
          job.status === 'approved' ? styles.approvedBadgeText :
          job.status === 'Active' ? styles.activeBadgeText :
          styles.inactiveBadgeText
        }>{job.status === 'approved' ? 'Active' : (job.status || 'Pending')}</Text>
      </View>
    </View>
    <Text style={styles.jobCompany}>{job.company?.name || job.company || ''}</Text>
    <Text style={styles.jobLocation}>{job.location}</Text>
  </TouchableOpacity>
))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerBg: {
    backgroundColor: colors.blue,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBoxWrapper: {
    marginTop: 24,
    alignItems: 'center',
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    fontSize: 16,
    width: '100%',
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:10,
    marginHorizontal: 24,
    zIndex: 2,
  },
  statCardLeft: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    flex: 1,
    marginRight: 8,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  statCardRight: {
    backgroundColor: '#60a5fa',
    borderRadius: 18,
    flex: 1,
    marginLeft: 8,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  statNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#e0e7ef',
    fontSize: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
    marginLeft: 24,
    color: '#222',
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 14,
    padding: 16,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
  },
  activeBadgeText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: 'bold',
  },
  approvedBadge: {
    backgroundColor: '#22c55e',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
  },
  approvedBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
  },
  inactiveBadgeText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: 'bold',
  },
  jobCompany: {
    color: '#444',
    fontSize: 14,
    marginTop: 2,
  },
  jobLocation: {
    color: '#888',
    fontSize: 13,
    marginTop: 1,
  },
});

export default Recurtierdashboard;