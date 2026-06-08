// @ts-nocheck
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResultsScreen() {
  const { score, passed, revision } = useLocalSearchParams();
  const router = useRouter();
  
  const isPassed = passed === 'true';
  const scoreNum = parseFloat(score || 0).toFixed(1);
  
  let revisionData = {};
  try {
    if (revision) {
      revisionData = JSON.parse(revision);
    }
  } catch(e) {}

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.heroCard, isPassed ? styles.passedBg : styles.failedBg]}>
        <Text style={styles.heroTitle}>
          {isPassed ? "🎉 Module Complete!" : "⚠️ Module Exam Failed"}
        </Text>
        <Text style={styles.heroScore}>Score: {scoreNum}%</Text>
        <Text style={styles.heroSub}>Required to pass: 70%</Text>
      </View>

      {!isPassed && Object.keys(revisionData).length > 0 && (
        <View style={styles.revisionBox}>
          <Text style={styles.revisionTitle}>Action Required: Revision Plan</Text>
          <Text style={styles.revisionDesc}>
            Based on the questions you missed, you need to revisit the following days before retaking the exam:
          </Text>
          
          {Object.keys(revisionData).map((dayStr) => (
            <View key={dayStr} style={styles.revisionItem}>
              <Text style={styles.revisionDay}>Day {dayStr}</Text>
              {revisionData[dayStr].map((concept, idx) => (
                <Text key={idx} style={styles.revisionConcept}>• {concept}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => router.push('/student/dashboard')}
      >
        <Text style={styles.actionBtnText}>Return to Dashboard</Text>
      </TouchableOpacity>
      
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  heroCard: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  passedBg: {
    backgroundColor: '#004d40',
  },
  failedBg: {
    backgroundColor: '#7f0000',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  heroSub: {
    fontSize: 16,
    color: '#dddddd',
  },
  revisionBox: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  revisionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cf6679',
    marginBottom: 10,
  },
  revisionDesc: {
    color: '#bbbbbb',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  revisionItem: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  revisionDay: {
    color: '#03dac6',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  revisionConcept: {
    color: '#ffffff',
    fontSize: 15,
    marginLeft: 10,
    marginTop: 3,
  },
  actionBtn: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
