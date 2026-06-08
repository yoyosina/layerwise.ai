// @ts-nocheck
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function TaskScreen() {
  const router = useRouter();

  const handleOpenDoc = () => {
    Linking.openURL('https://example.com/documentation');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Vibe Coding Core</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Andy Carroll Podcast</Text>
        <Text style={styles.cardSubtitle}>Watch or read the resource</Text>
        
        <View style={styles.videoPlaceholder}>
          <Text style={styles.placeholderIcon}>▶️</Text>
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={handleOpenDoc}>
          <Text style={styles.linkButtonText}>READ DOCUMENTATION</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mascotContainer}>
        <View style={styles.mascot}>
          <Text style={styles.mascotText}>🦉</Text>
        </View>
        <View style={styles.hintBubble}>
          <Text style={styles.hintText}>Need help understanding? Ask the Tutor!</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.tutorButton} onPress={() => router.push('/chat')}>
          <Text style={styles.tutorButtonText}>ASK TUTOR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={() => router.push('/dashboard')}>
          <Text style={styles.completeButtonText}>CONTINUE</Text>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C3C3C',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#AFAFAF',
    marginBottom: 20,
    fontWeight: '600',
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
  },
  placeholderIcon: {
    fontSize: 40,
  },
  linkButton: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  linkButtonText: {
    color: '#1CB0F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mascotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  mascot: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mascotText: {
    fontSize: 30,
  },
  hintBubble: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  hintText: {
    color: '#3C3C3C',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    gap: 15,
  },
  tutorButton: {
    backgroundColor: '#CE82FF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#A568CC',
  },
  tutorButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#58CC02',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#4BAA00',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  }
});
