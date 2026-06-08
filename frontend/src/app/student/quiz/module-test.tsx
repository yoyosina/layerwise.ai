// @ts-nocheck
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ModuleTestScreen() {
  const { moduleId } = useLocalSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  
  // 45 minutes = 2700 seconds
  const [timeLeft, setTimeLeft] = useState(2700);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`https://layerwise-ai.onrender.com/api/quiz/module/${moduleId}`, { credentials: 'include',  headers });
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [moduleId]);

  useEffect(() => {
    if (loading || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted]);

  const selectOption = (qId, oId) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };

  const submitExam = async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const token = await AsyncStorage.getItem('user_token');
      const res = await fetch(`https://layerwise-ai.onrender.com/api/quiz/module/${moduleId}/submit`, { credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      
      // Navigate to results page
      router.replace({
        pathname: '/student/quiz/results',
        params: { 
          score: data.score, 
          passed: data.passed, 
          revision: JSON.stringify(data.revision_needed || {}) 
        }
      });
      
    } catch (err) {
      console.error(err);
      setSubmitted(false);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#cf6679" /></View>;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Module {moduleId} Final Exam</Text>
        <Text style={[styles.timer, timeLeft < 300 && styles.timerWarning]}>
          ⏳ {formatTime(timeLeft)}
        </Text>
      </View>

      <ScrollView style={styles.scrollArea}>
        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{idx + 1}. {q.text}</Text>
            {q.options.map(opt => {
              const isSelected = answers[q.id] === opt.id;
              return (
                <TouchableOpacity 
                  key={opt.id} 
                  style={[styles.optionBtn, isSelected && styles.selectedOption]}
                  onPress={() => selectOption(q.id, opt.id)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={submitExam}
          disabled={submitted}
        >
          <Text style={styles.submitBtnText}>
            {submitted ? "Submitting..." : "Submit Exam"}
          </Text>
        </TouchableOpacity>
        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cf6679',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#03dac6',
  },
  timerWarning: {
    color: '#cf6679',
  },
  scrollArea: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 15,
  },
  optionBtn: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#cf6679',
    borderColor: '#cf6679',
  },
  optionText: {
    color: '#bbbbbb',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#cf6679',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
