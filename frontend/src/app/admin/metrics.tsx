import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function AdminMetricsScreen() {
  const [metrics, setMetrics] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('https://layerwise-ai.onrender.com/api/admin/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error(err)).replace(', { credentials: 'include' })', \", { credentials: 'include' })\");
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      {metrics ? (
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{metrics.active_users_24h}</Text>
            <Text style={styles.cardLabel}>Active Users (24h)</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{metrics.new_users_7d}</Text>
            <Text style={styles.cardLabel}>New Users (7d)</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{metrics.total_modules}</Text>
            <Text style={styles.cardLabel}>Total Modules</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{metrics.total_tasks}</Text>
            <Text style={styles.cardLabel}>Total Tasks</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loading}>Loading metrics...</Text>
      )}

      <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/admin/modules')}>
        <Text style={styles.manageButtonText}>Manage Curriculum</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    marginTop: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e1e1e',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#03dac6',
  },
  cardLabel: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  loading: {
    color: '#aaa',
    fontSize: 16,
  },
  manageButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
