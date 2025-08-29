import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { BACKEND_URL } from '../utils/config';
import { colors } from './utils/colors';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
};

const safeNumber = (val, defaultValue = 0) => {
  if (val === null || val === undefined || val === '') return defaultValue;
  const num = Number(val);
  if (!isFinite(num) || isNaN(num)) return defaultValue;
  return Math.max(0, num);
};

const validateChartData = (data, minValue = 0.1) => {
  if (!Array.isArray(data)) return [];
  return data.map(val => {
    const safeVal = safeNumber(val);
    return safeVal === 0 ? minValue : safeVal;
  });
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ months: [], counts: [] });
  const [applicationStatusStats, setApplicationStatusStats] = useState({});
  const [platformStats, setPlatformStats] = useState({});
  const [jobApprovalStats, setJobApprovalStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let token = null;
      try {
        const asyncStorage = await import('@react-native-async-storage/async-storage');
        token = await asyncStorage.default.getItem('token');
      } catch (err) {
        console.error('❌ Could not load token from AsyncStorage:', err);
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [
        userRes,
        appStatusRes,
        platformRes,
        jobApprovalRes
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/user-stats`, { headers }),
        fetch(`${BACKEND_URL}/api/admin/application-status-stats`, { headers }),
        fetch(`${BACKEND_URL}/api/admin/platform-stats`, { headers }),
        fetch(`${BACKEND_URL}/api/admin/job-approval-stats`, { headers })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserStats({
          months: Array.isArray(userData.months) ? userData.months : [],
          counts: Array.isArray(userData.counts) ? userData.counts : []
        });
      } else {
        setUserStats({ months: [], counts: [] });
      }
      if (appStatusRes.ok) {
        const appStatusData = await appStatusRes.json();
        setApplicationStatusStats(typeof appStatusData === 'object' && appStatusData !== null ? appStatusData : {});
      } else {
        setApplicationStatusStats({});
      }
      if (platformRes.ok) {
        const platformData = await platformRes.json();
        setPlatformStats(typeof platformData === 'object' && platformData !== null ? platformData : {});
      } else {
        setPlatformStats({});
      }
      if (jobApprovalRes.ok) {
        const jobApprovalData = await jobApprovalRes.json();
        setJobApprovalStats(typeof jobApprovalData === 'object' && jobApprovalData !== null ? jobApprovalData : {});
      } else {
        setJobApprovalStats({});
      }
    } catch (e) {
      setUserStats({ months: [], counts: [] });
      setApplicationStatusStats({});
      setPlatformStats({});
      setJobApprovalStats({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  const appStatusPieData = Object.keys(applicationStatusStats || {})
    .map((status, idx) => {
      const count = safeNumber(applicationStatusStats[status], 0.1);
      return {
        name: status || `Status ${idx + 1}`,
        population: count,
        color: ['#2563eb', '#10b981', '#ef4444', '#f59e42', '#6366f1'][idx % 5],
        legendFontColor: "#222",
        legendFontSize: 13
      };
    })
    .filter(item => item.population > 0);

  const jobApprovalLabels = Object.keys(jobApprovalStats || {});
  const jobApprovalCounts = validateChartData(
    jobApprovalLabels.map(k => jobApprovalStats[k])
  );

  const lineChartData = {
    labels: (userStats.months || []).slice(0, 12),
    datasets: [{
      data: validateChartData(userStats.counts || [])
    }]
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.header}>Admin Dashboard</Text>

      {/* Platform Overview */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Platform Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{safeNumber(platformStats.totalUsers)}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{safeNumber(platformStats.totalJobs)}</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{safeNumber(platformStats.totalApplications)}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{safeNumber(platformStats.approvedJobs)}</Text>
            <Text style={styles.statLabel}>Approved Jobs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{safeNumber(platformStats.pendingJobs)}</Text>
            <Text style={styles.statLabel}>Pending Jobs</Text>
          </View>
        </View>
      </View>

      {/* User Growth */}
      {lineChartData.labels.length > 0 && lineChartData.datasets[0].data.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Growth (Last 6 Months)</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
          />
        </View>
      )}

      {/* Application Status Distribution */}
      {appStatusPieData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Application Status Distribution</Text>
          <PieChart
            data={appStatusPieData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
            hasLegend={true}
          />
        </View>
      )}

      {/* Job Approval Stats */}
      {jobApprovalLabels.length > 0 && jobApprovalCounts.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Job Approval Stats</Text>
          <BarChart
            data={{
              labels: jobApprovalLabels,
              datasets: [{ data: jobApprovalCounts }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={false}
            withVerticalLines={false}
            showValuesOnTopOfBars={true}
          />
        </View>
      )}

      {/* Show message if no data is available */}
      {appStatusPieData.length === 0 && jobApprovalLabels.length === 0 && lineChartData.labels.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.noDataText}>No data available to display charts.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB', paddingTop: 24 },
  header: { fontSize: 24, fontWeight: 'bold', color: colors.blue, textAlign: 'center', marginBottom: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: colors.blue },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 2 },
  chart: { borderRadius: 12, marginVertical: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FB' },
  noDataText: { 
    textAlign: 'center', 
    color: '#64748b', 
    fontSize: 16, 
    fontStyle: 'italic', 
    paddingVertical: 20 
  },
});

export default AdminDashboard;