
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BACKEND_URL } from '../utils/config';
import { colors } from './utils/colors';

const { width } = Dimensions.get('window');

const AppliedScreen = () => {
  const navigation = useNavigation();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) {
          setError('User not logged in');
          setIsLoading(false);
          return;
        }
        const response = await axios.get(`${BACKEND_URL}/api/applications/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch applications');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const renderApplication = ({ item }) => {
    const job = item.job || {};
    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate('Jobscreen', { jobId: job._id })}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={job.company?.logo ? { uri: job.company.logo } : require('./assets/logo.png')}
            style={styles.companyLogo}
            defaultSource={require('./assets/logo.png')}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.jobTitle}>{job.title || 'Job Title'}</Text>
            <Text style={styles.jobCompany}>{job.company?.name || 'Company'}</Text>
            <Text style={styles.jobLocation}>{job.location || ''}</Text>
            <Text style={styles.statusText}>Status: {item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs Applied</Text>
      </View>
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={item => item._id}
        contentContainerStyle={applications.length === 0 && styles.emptyList}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Ionicons name="document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>You haven't applied to any jobs yet.</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 14,
    padding: 16,
    elevation: 2,
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
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
  statusText: {
    color: colors.blue,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f87171',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppliedScreen;
