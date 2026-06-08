// @ts-nocheck
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function PortalScreen() {
  const [status, setStatus] = useState('Idle');
  const [score, setScore] = useState<{ correctness: number; architecture: number; mathematics: number } | null>(null);

  const simulateUpload = () => {
    setStatus('Evaluating project securely...');
    
    setTimeout(() => {
      setStatus('Evaluated');
      setScore({
        correctness: 8,
        architecture: 7,
        mathematics: 9
      });
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Project Portal</Text>
      
      <View style={styles.uploadCard}>
        <View style={styles.cloudIconContainer}>
          <Text style={styles.cloudIcon}>☁️</Text>
        </View>
        <Text style={styles.uploadTitle}>Upload Project Code</Text>
        <Text style={styles.uploadSubtitle}>Submit your .py files for automated evaluation by The Proctor.</Text>
        
        <TouchableOpacity style={styles.uploadButton} onPress={simulateUpload}>
          <Text style={styles.uploadButtonText}>SELECT FILES</Text>
        </TouchableOpacity>
      </View>

      {status !== 'Idle' && !score && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>⚙️ {status}</Text>
        </View>
      )}

      {score && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Evaluation Results</Text>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Correctness</Text>
            <View style={styles.stars}><Text>⭐⭐⭐</Text></View>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Architecture</Text>
            <View style={styles.stars}><Text>⭐⭐</Text></View>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Mathematics</Text>
            <View style={styles.stars}><Text>⭐⭐⭐</Text></View>
          </View>

          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>
              Great job! Code executed successfully. Consider optimizing your data structures for a perfect score.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#208AEF',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 30,
  },
  uploadCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 4,
    borderColor: '#E5E5E5',
  },
  cloudIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E6F4FE',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cloudIcon: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C3C3C',
    marginBottom: 10,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#AFAFAF',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#1CB0F6',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#1899D6',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  statusBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    color: '#3C3C3C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 24,
    width: '100%',
    borderBottomWidth: 4,
    borderColor: '#E5E5E5',
  },
  scoreTitle: {
    fontSize: 22,
    color: '#3C3C3C',
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F7F7F7',
    padding: 15,
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#3C3C3C',
    fontWeight: 'bold',
  },
  stars: {
    flexDirection: 'row',
  },
  feedbackBox: {
    backgroundColor: '#E6F4FE',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  feedbackText: {
    color: '#1CB0F6',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 20,
  }
});
