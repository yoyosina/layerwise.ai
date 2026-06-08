// @ts-nocheck
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Path</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 5</Text>
        </View>
      </View>
      
      <View style={styles.pathContainer}>
        {/* Mocked Duolingo Path Nodes */}
        <TouchableOpacity style={[styles.node, styles.nodeCompleted]} onPress={() => router.push('/task')}>
          <Text style={styles.nodeIcon}>⭐</Text>
        </TouchableOpacity>
        <View style={styles.pathLine} />
        
        <TouchableOpacity style={[styles.node, styles.nodeCurrent]} onPress={() => router.push('/task')}>
          <Text style={styles.nodeIcon}>📚</Text>
        </TouchableOpacity>
        <View style={styles.pathLine} />
        
        <TouchableOpacity style={[styles.node, styles.nodeLocked]}>
          <Text style={styles.nodeIcon}>🔒</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Module 1: Vibe Coding</Text>
        <Text style={styles.cardProgress}>Progress: 2/30</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/task')}>
          <Text style={styles.primaryButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/portal')}>
          <Text style={styles.secondaryButtonText}>PROJECT PORTAL</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  streakBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#FF9600',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pathContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderBottomWidth: 8,
  },
  nodeCompleted: {
    backgroundColor: '#FFD900',
    borderColor: '#E5C300',
  },
  nodeCurrent: {
    backgroundColor: '#58CC02',
    borderColor: '#4BAA00',
  },
  nodeLocked: {
    backgroundColor: '#E5E5E5',
    borderColor: '#CECECE',
  },
  nodeIcon: {
    fontSize: 32,
  },
  pathLine: {
    width: 10,
    height: 40,
    backgroundColor: '#fff',
    opacity: 0.3,
    marginVertical: -5,
    zIndex: -1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    marginTop: 40,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C3C3C',
    marginBottom: 5,
  },
  cardProgress: {
    fontSize: 16,
    color: '#AFAFAF',
    marginBottom: 20,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#58CC02',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#4BAA00',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
});
