import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('user_token');
      const response = await fetch('https://layerwise-ai.onrender.com/api/auth/onboard', { credentials: 'include', 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (response.ok) {
        router.replace('/learn');
      } else {
        alert('Failed to save profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Layerwise!</Text>
      <Text style={styles.subtitle}>Let's set up your learning profile.</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={styles.input}
          placeholder="Your preferred name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        
        <TouchableOpacity 
          style={[styles.button, !name.trim() && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Learning</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#bb86fc',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#1e1e1e',
    padding: 30,
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 16,
    color: '#dddddd',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 18,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#03dac6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#224a46',
    opacity: 0.7,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
