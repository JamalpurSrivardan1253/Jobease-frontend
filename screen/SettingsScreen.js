import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handlePasswordReset = () => {
    // Navigate to password reset screen or show modal
    navigation.navigate('PasswordReset');
  };

  const handleAboutUs = () => {
    // Navigate to about us screen
    navigation.navigate('AboutUs');
  };

  const handleContact = () => {
    // Navigate to contact screen or open email/phone
    navigation.navigate('Contact');
  };

  const handleSupport = () => {
    // Navigate to support screen or help center
    navigation.navigate('Support');
  };

  const SettingCard = ({ title, subtitle, onPress, icon, danger = false }) => (
    <TouchableOpacity 
      style={[styles.card, danger && styles.dangerCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, danger && styles.dangerIcon]}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, danger && styles.dangerText]}>{title}</Text>
          <Text style={[styles.cardSubtitle, danger && styles.dangerSubtitle]}>{subtitle}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, danger && styles.dangerArrow]}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>Settings</Text>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingCard
            title="Reset Password"
            subtitle="Change your account password"
            icon="🔐"
            onPress={handlePasswordReset}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Information</Text>
          
          <SettingCard
            title="About Us"
            subtitle="Learn more about our company"
            icon="ℹ️"
            onPress={handleAboutUs}
          />
          
          <SettingCard
            title="Contact Us"
            subtitle="Get in touch with our team"
            icon="📧"
            onPress={handleContact}
          />
          
          <SettingCard
            title="Support"
            subtitle="Get help and technical support"
            icon="🛠️"
            onPress={handleSupport}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <SettingCard
            title="Logout"
            subtitle="Sign out of your account"
            icon="🚪"
            onPress={handleLogout}
            danger={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
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
  dangerCard: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEFEFE',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  dangerIcon: {
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  dangerText: {
    color: '#DC2626',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  dangerSubtitle: {
    color: '#991B1B',
    opacity: 0.8,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 20,
    color: '#3288DD',
    fontWeight: 'bold',
  },
  dangerArrow: {
    color: '#DC2626',
  },
});

export default SettingsScreen;