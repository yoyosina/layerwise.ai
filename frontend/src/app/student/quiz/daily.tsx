import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function DailyQuizScreen() {
  const { dayId } = useLocalSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`https://layerwise-ai.onrender.com/api/quiz/daily/${dayId}`, { credentials: 'include',  headers });
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [dayId]);

  const selectOption = (qId, oId) => {
    if (result) return; // Prevent changing after submission
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };

  const submitQuiz = async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      const res = await fetch(`https://layerwise-ai.onrender.com/api/quiz/daily/${dayId}/submit`, { credentials: 'include', 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#03dac6" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Daily Quiz: Day {dayId}</Text>
      
      {result && (
        <Animated.View entering={FadeInDown.duration(800).springify()} style={[styles.resultBox, result.passed ? styles.passedBox : styles.failedBox]}>
          <Animated.Text entering={ZoomIn.delay(300)} style={styles.resultText}>
            {result.passed ? "🎉 Congratulations! You Passed!" : "❌ You did not pass. Try again."}
          </Animated.Text>
          <Text style={styles.scoreText}>Score: {result.score.toFixed(1)}% (75% required)</Text>
          
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => result.passed ? router.push('/student/dashboard') : setResult(null)}
          >
            <Text style={styles.actionBtnText}>
              {result.passed ? "Return to Dashboard" : "Retake Quiz"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

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

      {!result && (
        <TouchableOpacity 
          style={[styles.submitBtn, Object.keys(answers).length < questions.length && styles.disabledBtn]}
          disabled={Object.keys(answers).length < questions.length}
          onPress={submitQuiz}
        >
          <Text style={styles.submitBtnText}>Submit Answers</Text>
        </TouchableOpacity>
      )}
      
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03dac6',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#3700B3',
    borderColor: '#3700B3',
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
    backgroundColor: '#03dac6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: '#444444',
  },
  submitBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultBox: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  passedBox: {
    backgroundColor: '#004d40',
  },
  failedBox: {
    backgroundColor: '#7f0000',
  },
  resultText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreText: {
    color: '#dddddd',
    fontSize: 16,
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  actionBtnText: {
    color: '#000000',
    fontWeight: 'bold',
  }
});
