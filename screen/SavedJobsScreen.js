import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { colors } from './utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { BACKEND_URL } from '../utils/config';

const SavedJobsScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userId = userRes.data._id || userRes.data.id;
        const res = await axios.get(`${BACKEND_URL}/api/users/${userId}/saved-jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data);
      } catch (e) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const renderJob = ({ item }) => {
    // Helper: check if string is likely an ObjectId
    const isObjectId = (str) => typeof str === 'string' && /^[a-f\d]{24}$/i.test(str);
    let companyName = 'Unknown Company';
    if (typeof item.company === 'object') {
      companyName = item.company.name || 'Unknown Company';
    } else if (typeof item.company === 'string' && !isObjectId(item.company) && item.company.length < 30) {
      companyName = item.company;
    }
    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate('Jobscreen', { jobId: item._id || item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.jobRow}>
          <Image
            source={item.company?.logo
              ? { uri: item.company.logo }
              : require('./assets/logo.png')
            }
            style={styles.logo}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.title || 'Untitled Job'}</Text>
            <Text style={styles.jobCompany}>{companyName}</Text>
            {item.location ? (
              <Text style={styles.jobLocation}>{item.location}</Text>
            ) : null}
          </View>
          <Ionicons name="bookmark" size={22} color={colors.blue} style={styles.bookmarkIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Saved Jobs</Text>
      {jobs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No saved jobs yet.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 18,
    marginLeft: 24,
    color: '#111',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 32,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f3f4f6',
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  jobCompany: {
    color: '#444',
    fontSize: 15,
    marginTop: 2,
  },
  jobLocation: {
    color: '#888',
    fontSize: 14,
    marginTop: 1,
  },
  bookmarkIcon: {
    marginLeft: 12,
  },
});

export default SavedJobsScreen;
