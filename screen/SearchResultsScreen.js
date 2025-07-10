import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { colors } from './utils/colors';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';

const SearchResultsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchJobs = async (query) => {
    try {
      setIsLoading(true);
      console.log('Searching for:', query); // Debug log
      
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      let url;
      if (!query.trim()) {
        url = `${BACKEND_URL}/api/jobs/`;
      } else {
        // Try to detect if query is a number (salary search)
        if (!isNaN(query) && query.trim() !== '') {
          url = `${BACKEND_URL}/api/jobs/search?salary=${encodeURIComponent(query)}`;
        } else if (/\d/.test(query) === false && query.length > 2 && query[0] === query[0].toUpperCase()) {
          // crude check: if first letter is uppercase and not a number, treat as location (improve as needed)
          url = `${BACKEND_URL}/api/jobs/search?location=${encodeURIComponent(query)}`;
        } else {
          // default: search by title
          url = `${BACKEND_URL}/api/jobs/search?title=${encodeURIComponent(query)}`;
        }
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Search response:', response.data); // Debug log
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - fetch all jobs
  useEffect(() => {
    searchJobs('');
  }, []);

  // Handle search query changes with debounce
  useEffect(() => {
    // Don't search if query is just spaces
    if (searchQuery.trim() === searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        console.log('Debounced search for:', searchQuery); // Debug log
        searchJobs(searchQuery);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const renderJobCard = ({ item: job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => {
        console.log('Navigating to job:', job._id); // Debug log
        navigation.navigate('Jobscreen', { jobId: job._id });
      }}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.salary}>₹{job.salary?.toLocaleString() || job.salary}</Text>
      </View>
      <Text style={styles.companyName}>{job.company?.name || (typeof job.company === 'string' ? job.company : '')}</Text>
      <View style={styles.jobFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.location}>{job.location}</Text>
        </View>
        <View style={styles.categoryContainer}>
          <Ionicons name="briefcase-outline" size={16} color="#666" />
          <Text style={styles.category}>{job.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs by title or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color={colors.blue} />
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
            </Text>
            <FlatList
              data={jobs}
              renderItem={renderJobCard}
              keyExtractor={(item) => item._id || item.id}
              contentContainerStyle={styles.jobsList}
              ListEmptyComponent={() => (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    {isLoading ? 'Searching...' : 'No jobs found'}
                  </Text>
                  {!isLoading && (
                    <Text style={styles.noResultsSubText}>
                      {searchQuery.trim() 
                        ? 'Try different keywords or location'
                        : 'All jobs will appear here'}
                    </Text>
                  )}
                </View>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginLeft: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: 20,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    padding: 16,
  },
  jobsList: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  salary: {
    fontSize: 16,
    color: colors.blue,
    fontWeight: '600',
  },
  companyName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  location: {
    marginLeft: 4,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    marginLeft: 4,
    color: '#666',
  },
  noResults: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});

export default SearchResultsScreen;
