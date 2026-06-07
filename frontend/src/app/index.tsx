import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '317193772618-b7bdlts6kj58jrku9lpc1kf903j7duan.apps.googleusercontent.com',
    redirectUri: 'https://layerwise-ai.vercel.app',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken || authentication?.idToken) {
        verifyTokenWithBackend(authentication?.accessToken, authentication?.idToken);
      }
    }
  }, [response]);

  const verifyTokenWithBackend = async (accessToken?: string, idToken?: string) => {
    setLoading(true);
    try {
      const payload: any = {};
      if (accessToken) payload.access_token = accessToken;
      if (idToken) payload.id_token = idToken;

      const res = await fetch('https://layerwise-ai.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok && data.token) {
        // Save the JWT secure token
        await AsyncStorage.setItem('user_token', data.token);
        
        // Route correctly based on new user flag
        if (data.is_new_user) {
          router.replace('/student/onboarding');
        } else {
          router.replace('/learn');
        }
      } else {
        alert('Backend verification failed: ' + (typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error communicating with backend');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    promptAsync();
  };

  return (
    <View style={styles.container}>
      <View style={styles.mascotPlaceholder}>
        <Text style={styles.mascotText}>🤖</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Layerwise.ai</Text>
        <Text style={styles.subtitle}>Structured AI Learning</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#208AEF" />
        ) : (
          <Text style={styles.buttonText}>LOGIN WITH GOOGLE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#208AEF', // Bright Blue
    padding: 20,
  },
  mascotPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  mascotText: {
    fontSize: 50,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#E6F4FE',
    marginBottom: 40,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    minWidth: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: '#208AEF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
