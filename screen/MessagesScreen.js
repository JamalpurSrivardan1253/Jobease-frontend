import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../utils/config';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Sending token:', token);
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BACKEND_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Notifications response:', res.data);
      setNotifications(res.data); // direct set, since it's already an array
    } catch (err) {
      console.log('Fetch error:', err.response?.data || err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  )

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.read ? styles.read : styles.unread]}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>Notifications</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3288DD" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>Notifications</Text>
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptySubtitle}>You're all caught up! New notifications will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id ? item._id : item.id?.toString?.() || Math.random().toString()}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3288DD']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
     fontSize: 32,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 18,
    marginLeft: 24,
    color: '#111',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  message: {
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'right',
    fontWeight: '400',
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3288DD',
    backgroundColor: '#FEFEFF',
    shadowColor: '#3288DD',
    shadowOpacity: 0.12,
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
});

export default MessagesScreen;