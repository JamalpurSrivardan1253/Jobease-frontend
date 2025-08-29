import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Pressable, Modal, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';

const AdminJobsScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = [
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 }
  ];

  // Update counts
  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    jobs.forEach(job => {
      const status = (job.status || 'pending').toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/api/admin/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (e) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    setFilteredJobs(jobs.filter(job => (job.status || 'pending').toLowerCase() === activeStatus));
  }, [jobs, activeStatus]);

  const handleStatusToggle = (status) => setActiveStatus(status);

  const openJobModal = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeJobModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint = status === 'approved'
        ? `${BACKEND_URL}/api/admin/jobs/${selectedJob._id}/approve`
        : `${BACKEND_URL}/api/admin/jobs/${selectedJob._id}/reject`;
      
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.error || 'Failed to update status');
        setActionLoading(false);
        return;
      }
      setJobs(prev => prev.map(j => j._id === selectedJob._id ? { ...j, status } : j));
      closeJobModal();
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (!selectedJob) return null;
    
    const currentStatus = (selectedJob.status || 'pending').toLowerCase();
    
    return (
      <View style={styles.modalButtonRow}>
        {currentStatus !== 'rejected' && (
          <TouchableOpacity
            style={[styles.modalButton, styles.rejectButton]}
            disabled={actionLoading}
            onPress={() => handleUpdateStatus('rejected')}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.modalButtonText}>Reject</Text>
            )}
          </TouchableOpacity>
        )}
        
        {currentStatus !== 'approved' && (
          <TouchableOpacity
            style={[styles.modalButton, styles.approveButton]}
            disabled={actionLoading}
            onPress={() => handleUpdateStatus('approved')}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.modalButtonText}>Approve</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const formatSalary = (job) => {
    if (job.salaryRange) {
      return `$${job.salaryRange.min?.toLocaleString()} - $${job.salaryRange.max?.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Management</Text>
        <Text style={styles.headerSubtitle}>Review and manage job postings</Text>
      </View>

      {/* Status Toggle */}
      <View style={styles.toggleContainer}>
        {statusOptions.map((option) => (
          <Pressable
            key={option.key}
            style={({ pressed }) => [
              styles.toggleButton,
              activeStatus === option.key && styles.activeToggleButton,
              pressed && styles.pressedButton
            ]}
            onPress={() => handleStatusToggle(option.key)}
          >
            <Text style={[
              styles.toggleButtonText,
              activeStatus === option.key && styles.activeToggleButtonText
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.countBadge,
              activeStatus === option.key && styles.activeCountBadge
            ]}>
              <Text style={[
                styles.countText,
                activeStatus === option.key && styles.activeCountText
              ]}>
                {statusCounts[option.key] || 0}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {!filteredJobs.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No {activeStatus} jobs</Text>
          <Text style={styles.emptyStateSubtitle}>
            {activeStatus === 'pending' 
              ? 'All caught up! No pending job postings to review.'
              : `No jobs have been ${activeStatus} yet.`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => openJobModal(item)}
              style={styles.cardTouchable}
              activeOpacity={0.7}
            >
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.companyName}>{item.company?.name || 'Company not specified'}</Text>
                    <Text style={styles.jobLocation}>{item.location || 'Remote'}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    styles[`${(item.status || 'pending').toLowerCase()}StatusBadge`]
                  ]}>
                    <Text style={[
                      styles.statusText,
                      styles[`${(item.status || 'pending').toLowerCase()}StatusText`]
                    ]}>
                      {(item.status || 'pending').toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.jobMetadata}>
                  <Text style={styles.jobType}>{item.type || 'Full-time'}</Text>
                  <Text style={styles.salaryRange}>{formatSalary(item)}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailsText}>Tap to view details</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Job Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeJobModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Job Details</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={closeJobModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedJob && (
                <View style={styles.detailsContainer}>
                  {/* Job Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Title:</Text>
                      <Text style={styles.modalValue}>{selectedJob.title}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Current Status:</Text>
                      <View style={[
                        styles.modalStatusBadge,
                        styles[`${(selectedJob.status || 'pending').toLowerCase()}StatusBadge`]
                      ]}>
                        <Text style={[
                          styles.modalStatusText,
                          styles[`${(selectedJob.status || 'pending').toLowerCase()}StatusText`]
                        ]}>
                          {(selectedJob.status || 'pending').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Location:</Text>
                      <Text style={styles.modalValue}>{selectedJob.location || 'Remote'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Job Type:</Text>
                      <Text style={styles.modalValue}>{selectedJob.type || 'Full-time'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Salary Range:</Text>
                      <Text style={styles.modalValue}>{formatSalary(selectedJob)}</Text>
                    </View>
                    {selectedJob.description && (
                      <View style={styles.detailRow}>
                        <Text style={styles.modalLabel}>Description:</Text>
                        <Text style={styles.modalValue}>{selectedJob.description}</Text>
                      </View>
                    )}
                  </View>

                  {/* Company Information */}
                  {selectedJob.company && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Company Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.modalLabel}>Company Name:</Text>
                        <Text style={styles.modalValue}>{selectedJob.company.name}</Text>
                      </View>
                      {selectedJob.company.description && (
                        <View style={styles.detailRow}>
                          <Text style={styles.modalLabel}>Company Description:</Text>
                          <Text style={styles.modalValue}>{selectedJob.company.description}</Text>
                        </View>
                      )}
                      {selectedJob.company.website && (
                        <View style={styles.detailRow}>
                          <Text style={styles.modalLabel}>Website:</Text>
                          <Text style={[styles.modalValue, styles.linkText]}>
                            {selectedJob.company.website}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Recruiter Information */}
                  {selectedJob.recruiter && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Recruiter Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.modalLabel}>Name:</Text>
                        <Text style={styles.modalValue}>
                          {selectedJob.recruiter.firstName} {selectedJob.recruiter.lastName}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.modalLabel}>Email:</Text>
                        <Text style={[styles.modalValue, styles.linkText]}>
                          {selectedJob.recruiter.email}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Requirements */}
                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Requirements</Text>
                      {selectedJob.requirements.map((req, index) => (
                        <View key={index} style={styles.requirementItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.requirementText}>{req}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
            
            {renderActionButtons()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 60,
  },
  activeToggleButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  activeToggleButtonText: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeCountText: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cardTouchable: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingStatusBadge: {
    backgroundColor: '#fef3c7',
  },
  approvedStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  rejectedStatusBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pendingStatusText: {
    color: '#92400e',
  },
  approvedStatusText: {
    color: '#166534',
  },
  rejectedStatusText: {
    color: '#dc2626',
  },
  jobMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  jobType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  salaryRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  linkText: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminJobsScreen;