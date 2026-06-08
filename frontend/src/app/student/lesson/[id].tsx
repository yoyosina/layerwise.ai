import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import YoutubePlayer from 'react-native-youtube-iframe';

const getYoutubeVideoId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
export default function StudentLessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);
  const youtubeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const [currRes, progRes] = await Promise.all([
          fetch('https://layerwise-ai.onrender.com/api/curriculum/modules', { credentials: 'include',  headers }),
          fetch(`https://layerwise-ai.onrender.com/api/student/video-progress/${id}`, { credentials: 'include',  headers })
        ]);
        const currData = await currRes.json();
        const progData = await progRes.json();
        
        let found = null;
        for (const mod of currData.modules) {
          for (const t of mod.tasks) {
            if (t.id.toString() === id?.toString()) {
              found = t;
              break;
            }
          }
          if (found) break;
        }
        setTask(found);
        if (progData && progData.progress_seconds > 0) {
          setInitialProgress(progData.progress_seconds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const elapsed = await youtubeRef.current?.getCurrentTime();
        const duration = await youtubeRef.current?.getDuration();
        if (elapsed > 0) {
          const dur = duration || 1000;
          const token = await AsyncStorage.getItem('user_token');
          const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
          fetch('https://layerwise-ai.onrender.com/api/student/video-progress', { credentials: 'include', 
            method: 'POST',
            headers,
            body: JSON.stringify({
              task_id: parseInt(id.toString()),
              progress_seconds: elapsed,
              duration_seconds: dur
            })
          }).catch(err => console.error("Error saving progress", err));
        }
      } catch (err) {
        // Ignore iframe errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const onStateChange = useCallback((state) => {
    if (state === "playing") {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, []);

  const onReady = useCallback(() => {
    if (initialProgress > 0) {
      youtubeRef.current?.seekTo(initialProgress, true);
    }
  }, [initialProgress]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#03dac6" />
      </View>
    );
  }

  if (!task) {
    return <View style={styles.container}><Text style={styles.title}>Lesson not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.contentBox}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{task.title}</Text>
        <Text style={styles.description}>
          Welcome to Day {task.day}! Please review the provided material thoroughly. 
          You must pass the Daily Quiz with a score of 75% or higher to unlock tomorrow's lesson.
        </Text>
        
        {getYoutubeVideoId(task.resource_link) ? (
          <View style={styles.videoContainer}>
            <YoutubePlayer
              ref={youtubeRef}
              height={220}
              play={false}
              videoId={getYoutubeVideoId(task.resource_link)}
              initialPlayerParams={{ start: Math.floor(initialProgress) || 0 }}
              onChangeState={onStateChange}
            />
          </View>
        ) : task.resource_link ? (
          <TouchableOpacity 
            style={styles.resourceBtn} 
            onPress={() => Linking.openURL(task.resource_link)}
          >
            <Text style={styles.resourceBtnText}>🔗 Open Free Resource</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.noResourceBox}>
            <Text style={styles.noResourceText}>No resource link provided for this lesson.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.quizBtn} 
        onPress={() => router.push(`/student/quiz/daily?dayId=${task.day}`)}
      >
        <Text style={styles.quizBtnText}>Take Daily Quiz (10 MCQs)</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    color: '#03dac6',
    fontSize: 16,
  },
  contentBox: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  videoContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bb86fc',
    marginBottom: 15,
  },
  description: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  resourceBtn: {
    backgroundColor: '#3700B3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resourceBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResourceBox: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  noResourceText: {
    color: '#888888',
    fontStyle: 'italic',
  },
  quizBtn: {
    backgroundColor: '#03dac6',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  quizBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
