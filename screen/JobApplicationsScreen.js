import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Alert,
  Linking,
  StatusBar,
  Dimensions
} from 'react-native';
import { colors } from './utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../utils/config';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const JobApplicationsScreen = ({ route }) => {
  const { job, applications = [] } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationsData, setApplicationsData] = useState(applications);

  const handleCardPress = (application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  };

  const updateApplicationStatus = async (newStatus) => {
    if (!selectedApplication) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${BACKEND_URL}/api/applications/${selectedApplication._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Error', result.error || 'Failed to update status');
        return;
      }
      const updatedApplications = applicationsData.map(app =>
        app._id === selectedApplication._id
          ? result.application
          : app
      );
      setApplicationsData(updatedApplications);
      setModalVisible(false);
      setSelectedApplication(null);
      Alert.alert('Status Updated', `Application has been ${newStatus.toLowerCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      console.error(error);
    }
  };

  const openResume = (resumeLink) => {
    console.log('Opening resume link:', resumeLink);
    if (resumeLink && resumeLink !== 'N/A') {
      Linking.openURL(resumeLink);
    } else {
      Alert.alert('No Resume', 'Resume link is not available');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'interview':
        return '#F59E0B';
      case 'applied':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'interview':
        return 'people';
      case 'applied':
        return 'document-text';
      default:
        return 'document-text';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0)?.toUpperCase() || ''}${lastName?.charAt(0)?.toUpperCase() || ''}`;
  };

  const renderApplicationCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleCardPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.applicantSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {getInitials(item.user?.firstName, item.user?.lastName)}
              </Text>
            </View>
            <View style={styles.applicantInfo}>
              <Text style={styles.applicantName}>
                {item.user?.firstName?.toUpperCase()} {item.user?.lastName?.toUpperCase()}
              </Text>
              <Text style={styles.applicantEmail}>{item.user?.email}</Text>
              {item.user?.phone && (
                <Text style={styles.applicantPhone}>{item.user.phone}</Text>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={12} color="#FFFFFF" style={styles.statusIcon} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        {item.user?.skills && item.user.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {item.user.skills.slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {item.user.skills.length > 3 && (
              <View style={styles.skillChip}>
                <Text style={styles.skillText}>+{item.user.skills.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {item.coverLetter && (
          <View style={styles.coverLetterContainer}>
            <Text style={styles.coverLetterLabel}>Cover Letter:</Text>
            <Text style={styles.coverLetterPreview} numberOfLines={2}>
              "{item.coverLetter}"
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.resumeButton}
            onPress={() => openResume(item.resume)}
          >
            <Ionicons name="document-text" size={14} color="#FFFFFF" style={styles.resumeIcon} />
            <Text style={styles.resumeButtonText}>View Resume</Text>
          </TouchableOpacity>
          
          <Text style={styles.tapHint}>Tap to manage</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatusModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Application</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {selectedApplication && (
            <View style={styles.applicantDetails}>
              <View style={styles.modalApplicantHeader}>
                <View style={styles.modalAvatarContainer}>
                  <Text style={styles.modalAvatarText}>
                    {getInitials(selectedApplication.user?.firstName, selectedApplication.user?.lastName)}
                  </Text>
                </View> 
                <View style={styles.modalApplicantInfo}>
                  <Text style={styles.modalApplicantName}>
                    {selectedApplication.user?.firstName?.toUpperCase()} {selectedApplication.user?.lastName?.toUpperCase()}
                  </Text>
                  <Text style={styles.modalApplicantEmail}>
                    {selectedApplication.user?.email}
                  </Text>
                  {selectedApplication.user?.phone && (
                    <Text style={styles.modalApplicantDetail}>
                      <Ionicons name="call" size={14} color="#64748B" /> {selectedApplication.user.phone}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.currentStatusContainer}>
                <Text style={styles.currentStatusLabel}>Current Status:</Text>
                <View style={[styles.currentStatusBadge, { backgroundColor: getStatusColor(selectedApplication.status) }]}>
                  <Ionicons name={getStatusIcon(selectedApplication.status)} size={14} color="#FFFFFF" style={styles.currentStatusIcon} />
                  <Text style={styles.currentStatusText}>{selectedApplication.status}</Text>
                </View>
              </View>

              {selectedApplication.user?.bio && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Bio:</Text>
                  <Text style={styles.detailText}>{selectedApplication.user.bio}</Text>
                </View>
              )}

              {selectedApplication.user?.skills && selectedApplication.user.skills.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Skills:</Text>
                  <View style={styles.modalSkillsContainer}>
                    {selectedApplication.user.skills.map((skill, idx) => (
                      <View key={idx} style={styles.modalSkillChip}>
                        <Text style={styles.modalSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedApplication.user?.education && selectedApplication.user.education.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Education:</Text>
                  {selectedApplication.user.education.map((edu, idx) => (
                    <Text key={idx} style={styles.detailText}>
                      <Ionicons name="school" size={14} color="#64748B" /> {edu.degree} at {edu.institute} ({edu.startYear} - {edu.endYear})
                    </Text>
                  ))}
                </View>
              )}

              {selectedApplication.user?.experience && selectedApplication.user.experience.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Experience:</Text>
                  {selectedApplication.user.experience.map((exp, idx) => (
                    <Text key={idx} style={styles.detailText}>
                      <Ionicons name="briefcase" size={14} color="#64748B" /> {exp.jobTitle} at {exp.company} ({exp.startYear} - {exp.endYear || 'Present'})
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[styles.statusButton, styles.shortlistButton]}
              onPress={() => updateApplicationStatus('shortlisted')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.statusButtonIcon} />
              <Text style={styles.statusButtonText}>Shortlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusButton, styles.interviewButton]}
              onPress={() => updateApplicationStatus('interview')}
            >
              <Ionicons name="people-circle" size={20} color="#fff" style={styles.statusButtonIcon} />
              <Text style={styles.statusButtonText}>Interview</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusButton, styles.rejectButton]}
              onPress={() => updateApplicationStatus('rejected')}
            >
              <Ionicons name="close-circle" size={20} color="#fff" style={styles.statusButtonIcon} />
              <Text style={styles.statusButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Calculate statistics
  const statusCounts = Array.isArray(applicationsData)
    ? applicationsData.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.headerSection}>
        <Text style={styles.header}>{job?.title || 'Job'} Applications</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Array.isArray(applicationsData) ? applicationsData.length : 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}> 
              {statusCounts.shortlisted || 0}
            </Text>
            <Text style={styles.statLabel}>Shortlisted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}> 
              {statusCounts.interview || 0}
            </Text>
            <Text style={styles.statLabel}>Interview</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}> 
              {statusCounts.rejected || 0}
            </Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {Array.isArray(applicationsData) && applicationsData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#94A3B8" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
          <Text style={styles.emptyStateText}>
            Applications for this job will appear here once candidates apply.
          </Text>
        </View>
      ) : (
        Array.isArray(applicationsData) && (
          <FlatList
            data={applicationsData}
            keyExtractor={(item) => item._id || String(Math.random())}
            renderItem={renderApplicationCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )
      )}

      <StatusModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  applicantSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  applicantEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  applicantPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  coverLetterContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  coverLetterLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  coverLetterPreview: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resumeIcon: {
    marginRight: 6,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748B',
  },
  applicantDetails: {
    padding: 20,
  },
  modalApplicantHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  modalApplicantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalApplicantName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalApplicantEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 2,
  },
  modalApplicantDetail: {
    fontSize: 14,
    color: '#64748B',
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentStatusLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginRight: 12,
  },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentStatusIcon: {
    marginRight: 4,
  },
  currentStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalSkillChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  modalSkillText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shortlistButton: {
    backgroundColor: '#10B981',
  },
  interviewButton: {
    backgroundColor: '#F59E0B',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  statusButtonIcon: {
    marginRight: 6,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JobApplicationsScreen;
