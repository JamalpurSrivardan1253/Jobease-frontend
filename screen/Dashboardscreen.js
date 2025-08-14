import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from './utils/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { BACKEND_URL } from '../utils/config';

const Dashboardscreen = () => {
	const navigation = useNavigation();
	const [jobs, setJobs] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [appliedCount, setAppliedCount] = useState(0);
	const [interviewCount, setInterviewCount] = useState(0);
	const [userName, setUserName] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	const fetchDashboardData = async () => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) return;

			// Fetch jobs
			const jobsResponse = await axios.get(`${BACKEND_URL}/api/jobs/`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setJobs(jobsResponse.data);

			// Fetch user data and applications
			const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			const userId = userRes.data._id || userRes.data.id;
			const fullName = userRes.data.fullName || 
				`${userRes.data.firstName || ''} ${userRes.data.lastName || ''}`.trim();
			setUserName(fullName || userRes.data.name || userRes.data.username || 'User');

			// Fetch applications
			const appsRes = await axios.get(`${BACKEND_URL}/api/applications/user/${userId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			setAppliedCount(appsRes.data.length);
			setInterviewCount(appsRes.data.filter(app => 
				app.status && app.status.toLowerCase().includes('interview')
			).length);

		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		}
	};

	const searchJobs = async (query) => {
		if (!query.trim()) {
			fetchDashboardData();
			return;
		}

		setIsSearching(true);
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				console.error('No auth token found');
				return;
			}

			const response = await axios.get(`${BACKEND_URL}/api/jobs/search`, {
				params: {
					title: query,
					location: query // Search in both title and location
				},
				headers: { 
					Authorization: `Bearer ${token}`
				}
			});
			setJobs(response.data);
		} catch (error) {
			console.error('Error searching jobs:', error);
		} finally {
			setIsSearching(false);
		}
	};

	// Debounce search to prevent too many API calls
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			searchJobs(searchQuery);
		}, 500); // Wait 500ms after last keystroke before searching

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchDashboardData().then(() => setRefreshing(false));
	}, []);

	// Initial load
	useEffect(() => {
		fetchDashboardData();
	}, []);

	// Refresh on focus
	useFocusEffect(
		useCallback(() => {
			fetchDashboardData();
		}, [])
	);

	return (
		<View style={styles.container}>
			<View style={styles.headerBg}>
				<View style={styles.headerRow}>
					<View>
						<Text style={styles.welcomeText}>Welcome,</Text>
						<Text style={styles.userName}>{userName}</Text>
					</View>
					<Image
						source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
						style={styles.avatar}
					/>
				</View>
				<View style={styles.searchBoxWrapper}>
					<TouchableOpacity 
						style={styles.searchInputWrapper}
						onPress={() => navigation.navigate('SearchResults')}
						activeOpacity={0.7}
					>
						<Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
						<Text style={[styles.searchBox, { color: '#888' }]}>
							Search jobs by title or location...
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.statsRow}>
			   <TouchableOpacity
				   style={styles.statCardLeft}
				   activeOpacity={0.7}
				   onPress={() => navigation.navigate('AppliedScreen')}
			   >
				   <Text style={styles.statNumber}>{appliedCount}</Text>
				   <Text style={styles.statLabel}>Jobs Applied</Text>
				   <Image source={require('./assets/logo.png')} style={styles.statIcon} />
			   </TouchableOpacity>
				<View style={styles.statCardRight}>
					<Text style={styles.statNumber}>{interviewCount}</Text>
					<Text style={styles.statLabel}>Interviews</Text>
					<Image source={require('./assets/logo.png')} style={styles.statIcon} />
				</View>
			</View>

			<ScrollView 
				style={{ flex: 1 }} 
				contentContainerStyle={{ paddingBottom: 24 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.titleRow}>
					<Text style={styles.sectionTitle}>
						{searchQuery ? 'Search Results' : 'Recommended Jobs'}
					</Text>
					{isSearching && <ActivityIndicator size="small" color={colors.blue} />}
				</View>

				{jobs.length > 0 ? (
					jobs.map((job, idx) => (
						<TouchableOpacity
							key={job._id || job.id || idx}
							style={styles.jobCard}
							onPress={() => {
								navigation.navigate('Jobscreen', { jobId: job._id || job.id });
							}}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
								<Text style={styles.jobTitle}>{job.title}</Text>
								{job.isNew && (
									<View style={styles.newBadge}>
										<Text style={styles.newBadgeText}>New</Text>
									</View>
								)}
							</View>
							<Text style={styles.jobCompany}>
								{job.company?.name || job.company || ''}
							</Text>
							<Text style={styles.jobLocation}>{job.location}</Text>
						</TouchableOpacity>
					))
				) : (
					<View style={styles.noResults}>
						<Text style={styles.noResultsText}>
							{searchQuery ? 'No jobs found matching your search.' : 'No jobs available.'}
						</Text>
						{searchQuery && (
							<Text style={styles.noResultsSubText}>
								Try different keywords or clear search
							</Text>
						)}
					</View>
				)}
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
		// fontFamily: fonts.regular,
	},
	userName: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		// fontFamily: fonts.bold,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		borderWidth: 2,
		borderColor: '#fff',
	},
	searchBoxWrapper: {
		marginTop: 24,
		alignItems: 'center',
	},
	searchInputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 20,
		paddingHorizontal: 15,
		width: '100%',
		elevation: 2,
	},
	searchBox: {
		flex: 1,
		paddingVertical: 10,
		fontSize: 16,
		color: '#333',
	},
	searchIcon: {
		marginRight: 8,
	},
	clearButton: {
		padding: 5,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 11,
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
	statIcon: {
		width: 36,
		height: 36,
		opacity: 0.15,
		position: 'absolute',
		bottom: 10,
		right: 10,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 32,
		marginBottom: 12,
		marginLeft: 24,
		color: '#222',
		// fontFamily: fonts.bold,
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
		// fontFamily: fonts.medium,
	},
	newBadge: {
		backgroundColor: '#ffeb3b',
		borderRadius: 4,
		paddingHorizontal: 6,
		paddingVertical: 2,
		marginLeft: 6,
	},
	newBadgeText: {
		color: '#222',
		fontSize: 12,
		fontWeight: 'bold',
	},
	jobCompany: {
		color: '#444',
		fontSize: 14,
		marginTop: 2,
		// fontFamily: fonts.regular,
	},
	jobLocation: {
		color: '#888',
		fontSize: 13,
		marginTop: 1,
		// fontFamily: fonts.light,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingRight: 24,
		marginTop: 32,
		marginBottom: 12,
		marginLeft: 24,
	},
	noResults: {
		alignItems: 'center',
		padding: 20,
		marginTop: 20,
	},
	noResultsText: {
		fontSize: 16,
		color: '#666',
		fontWeight: 'bold',
	},
	noResultsSubText: {
		fontSize: 14,
		color: '#888',
		marginTop: 5,
	},
});

export default Dashboardscreen;
