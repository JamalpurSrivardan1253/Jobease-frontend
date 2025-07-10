import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from './utils/colors';

const JobApplicationsScreen = ({ route }) => {
  const { job, applications = [] } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Applications for {job?.title || 'Job'}</Text>
      {applications.length === 0 ? (
        <Text style={styles.noData}>No applications for this job yet.</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item._id || String(Math.random())}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.label}>Applicant:</Text>
              <Text style={styles.value}>{item.user?.firstName} {item.user?.lastName}</Text>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{item.user?.email}</Text>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{item.status}</Text>
              <Text style={styles.label}>Resume:</Text>
              <Text style={styles.value}>{item.resumeLink || 'N/A'}</Text>
              {item.coverLetter ? (
                <>
                  <Text style={styles.label}>Cover Letter:</Text>
                  <Text style={styles.value}>{item.coverLetter}</Text>
                </>
              ) : null}
            </View>
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
    fontSize: 20,
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
  label: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  value: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  noData: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default JobApplicationsScreen;
