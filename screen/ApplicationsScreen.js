import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from './utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';

const ApplicationsScreen = ({ route, navigation }) => {
  const { jobs = [] } = route.params || {};
  const activeJobs = jobs.filter(job => job.status === 'approved' || job.status === 'Active');

  const [loadingJobId, setLoadingJobId] = React.useState(null);

  const handleJobPress = async (job) => {
    setLoadingJobId(job._id || job.id);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/applications/job/${job._id || job.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(job._id || job.id, 'Job ID pressed');
      const applications = await res.json();
      navigation.navigate('JobApplicationsScreen', { job, applications });
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch applications for this job.');
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Active Jobs</Text>
      {activeJobs.length === 0 ? (
        <Text style={styles.noData}>No active jobs found.</Text>
      ) : (
        <FlatList
          data={activeJobs}
          keyExtractor={item => item._id || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleJobPress(item)}
              disabled={loadingJobId === (item._id || item.id)}
            >
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.label}>Tap to view applications</Text>
              {loadingJobId === (item._id || item.id) && (
                <ActivityIndicator size="small" color={colors.blue} style={{ marginTop: 8 }} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.blue,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.blue,
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    color: '#888',
    marginTop: 4,
  },
  value: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  noData: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ApplicationsScreen;
