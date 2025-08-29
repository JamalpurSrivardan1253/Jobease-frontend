import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Pressable, Modal, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/config';

const AdminAccountsScreen = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = [
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 }
  ];

  // Update counts
  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    recruiters.forEach(recruiter => {
      const status = (recruiter.status || 'pending').toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/api/admin/recruiters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRecruiters(Array.isArray(data) ? data : []);
      } catch (e) {
        setRecruiters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const filtered = recruiters.filter(recruiter => {
      const status = recruiter.status || 'pending';
      return status.toLowerCase() === activeStatus.toLowerCase();
    });
    setFilteredRecruiters(filtered);
  }, [recruiters, activeStatus]);

  const handleStatusToggle = (status) => setActiveStatus(status);

  const openRecruiterModal = async (recruiter) => {
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/admin/recruiters/${recruiter._id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedRecruiter({ ...data.recruiter, company: data.company });
        setModalVisible(true);
      } else {
        Alert.alert('Error', data.msg || 'Failed to fetch details');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch details');
    } finally {
      setActionLoading(false);
    }
  };

  const closeRecruiterModal = () => {
    setModalVisible(false);
    setSelectedRecruiter(null);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedRecruiter) return;
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint = status === 'approved'
        ? `${BACKEND_URL}/api/admin/recruiters/${selectedRecruiter._id}/approve`
        : `${BACKEND_URL}/api/admin/recruiters/${selectedRecruiter._id}/reject`;
      
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
      setRecruiters(prev => prev.map(r => r._id === selectedRecruiter._id ? { ...r, status } : r));
      closeRecruiterModal();
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (!selectedRecruiter) return null;
    
    const currentStatus = (selectedRecruiter.status || 'pending').toLowerCase();
    
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading recruiters...</Text>
      </View>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recruiter Management</Text>
        <Text style={styles.headerSubtitle}>Manage recruiter account requests</Text>
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
      {!filteredRecruiters.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No {activeStatus} recruiters</Text>
          <Text style={styles.emptyStateSubtitle}>
            {activeStatus === 'pending' 
              ? 'All caught up! No pending requests to review.'
              : `No recruiters have been ${activeStatus} yet.`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecruiters}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => openRecruiterModal(item)}
              style={styles.cardTouchable}
              activeOpacity={0.7}
            >
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name}>{item.name || item.email}</Text>
                    <Text style={styles.email}>{item.email}</Text>
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
                
                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailsText}>Tap to view details</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Recruiter Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRecruiterModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recruiter Details</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={closeRecruiterModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRecruiter ? (
                <View style={styles.detailsContainer}>
                  {/* Personal Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Name:</Text>
                      <Text style={styles.modalValue}>
                        {selectedRecruiter.name || `${selectedRecruiter.firstName || ''} ${selectedRecruiter.lastName || ''}`.trim() || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Email:</Text>
                      <Text style={styles.modalValue}>{selectedRecruiter.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.modalLabel}>Current Status:</Text>
                      <View style={[
                        styles.modalStatusBadge,
                        styles[`${(selectedRecruiter.status || 'pending').toLowerCase()}StatusBadge`]
                      ]}>
                        <Text style={[
                          styles.modalStatusText,
                          styles[`${(selectedRecruiter.status || 'pending').toLowerCase()}StatusText`]
                        ]}>
                          {(selectedRecruiter.status || 'pending').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Company Information */}
                  {selectedRecruiter?.company && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Company Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.modalLabel}>Company Name:</Text>
                        <Text style={styles.modalValue}>{selectedRecruiter.company.name}</Text>
                      </View>
                      {selectedRecruiter.company.description && (
                        <View style={styles.detailRow}>
                          <Text style={styles.modalLabel}>Description:</Text>
                          <Text style={styles.modalValue}>{selectedRecruiter.company.description}</Text>
                        </View>
                      )}
                      {selectedRecruiter.company.website && (
                        <View style={styles.detailRow}>
                          <Text style={styles.modalLabel}>Website:</Text>
                          <Text style={[styles.modalValue, styles.linkText]}>
                            {selectedRecruiter.company.website}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ) : null}
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
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
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

export default AdminAccountsScreen;