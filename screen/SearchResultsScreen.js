import React, { useState, useEffect ,useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { colors } from './utils/colors';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';
import { Modal } from 'react-native';


const { width } = Dimensions.get('window');

const SearchResultsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;


  // Filter state
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinSalary, setFilterMinSalary] = useState('');
  const [filterMaxSalary, setFilterMaxSalary] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const searchJobs = async (query) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      let url;
      if (!query.trim()) {
        url = `${BACKEND_URL}/api/jobs/`;
      } else {
        if (!isNaN(query)) {
          url = `${BACKEND_URL}/api/jobs/search?salary=${encodeURIComponent(query)}`;
        } else if (/\d/.test(query) === false && query.length > 2 && query[0] === query[0].toUpperCase()) {
          url = `${BACKEND_URL}/api/jobs/search?location=${encodeURIComponent(query)}`;
        } else {
          url = `${BACKEND_URL}/api/jobs/search?title=${encodeURIComponent(query)}`;
        }
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (filterLocation) params.append('location', filterLocation);
      if (filterMinSalary) params.append('minSalary', filterMinSalary);
      if (filterMaxSalary) params.append('maxSalary', filterMaxSalary);
      if (filterCategory) params.append('category', filterCategory);

      const url = `${BACKEND_URL}/api/jobs/filter?${params.toString()}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Filter error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterLocation('');
    setFilterCategory('');
    setFilterMinSalary('');
    setFilterMaxSalary('');
    searchJobs('');
  };

 const toggleFilters = () => {
  setShowFilters(!showFilters);
};


  useEffect(() => {
    searchJobs('');
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchJobs(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const renderJobCard = ({ item: job, index }) => (
    <TouchableOpacity
      key={job._id || index}
      style={styles.jobCard}
      onPress={() => navigation.navigate('Jobscreen', { jobId: job._id })}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={job.company?.logo ? { uri: job.company.logo } : require('./assets/logo.png')}
          style={styles.companyLogo}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCompany}>{job.company?.name}</Text>
          <Text style={styles.jobLocation}>{job.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>{isLoading ? 'Searching...' : 'No jobs found'}</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your filters or search terms</Text>
      {!isLoading && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={toggleFilters}>
            <Ionicons name="options-outline" size={24} color={colors.blue} />
          </TouchableOpacity>
        </View>

        <Modal
  animationType="slide"
  transparent={true}
  visible={showFilters}
  onRequestClose={() => setShowFilters(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Filter Jobs</Text>
      <ScrollView contentContainerStyle={styles.filterInputGroup}>
        <TextInput
          style={styles.filterInput}
          placeholder="Location"
          value={filterLocation}
          onChangeText={setFilterLocation}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Category"
          value={filterCategory}
          onChangeText={setFilterCategory}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Min Salary"
          value={filterMinSalary}
          onChangeText={setFilterMinSalary}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Max Salary"
          value={filterMaxSalary}
          onChangeText={setFilterMaxSalary}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.applyButton} onPress={() => { applyFilters(); setShowFilters(false); }}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={() => { clearFilters(); setShowFilters(false); }}>
          <Text style={styles.clearText}>Clear Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeModalButton}>
          <Text style={styles.closeModalText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </View>
</Modal>

      </View>

      {/* Job Results */}
     <FlatList
  data={jobs.filter(job => (job.status || '').toLowerCase() === 'approved')}
  renderItem={renderJobCard}
  keyExtractor={(item) => item._id}
  contentContainerStyle={{ paddingVertical: 12 }}
  ListEmptyComponent={renderEmptyState}
  ListFooterComponent={isLoading && <ActivityIndicator size="large" color={colors.blue} />}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerContainer: { backgroundColor: '#fff', elevation: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    marginHorizontal: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1e293b' },
  searchIcon: { marginRight: 12 },
  filterContainer: { overflow: 'hidden', paddingHorizontal: 16 },
  filterInputGroup: { paddingVertical: 10 },
  filterInput: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: colors.blue,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold' },
  clearButton: { alignItems: 'center', marginTop: 10 },
  clearText: { color: colors.blue, fontWeight: '600' },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 14,
    padding: 16,
    elevation: 2,
  },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  jobCompany: { color: '#444', fontSize: 14, marginTop: 2 },
  jobLocation: { color: '#888', fontSize: 13, marginTop: 1 },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  emptyState: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16, color: '#1e293b' },
  emptySubtitle: { color: '#64748b', textAlign: 'center', marginTop: 4 },
  clearSearchButton: {
    backgroundColor: colors.blue,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: { color: '#fff', fontWeight: '600' },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  maxHeight: '80%',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
  color: '#1e293b',
  textAlign: 'center',
},
closeModalButton: {
  marginTop: 10,
  alignItems: 'center',
},
closeModalText: {
  color: colors.blue,
  fontWeight: '600',
  fontSize: 16,
}

});

export default SearchResultsScreen;
