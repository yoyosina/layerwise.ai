// @ts-nocheck
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function DailyQuizScreen() {
  const { dayId } = useLocalSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const scrollViewRef = useRef(null);

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

  useEffect(() => {
    // Timer logic
    if (timeLeft <= 0 && !result && !isSubmitting) {
      submitQuiz(); // auto submit when time is up
      return;
    }
    if (!result && !loading) {
      const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, result, isSubmitting, loading]);

  const selectOption = (qId, oId) => {
    if (result || isSubmitting) return; // Prevent changing after submission or while submitting
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
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
      // Scroll to the top to see the result
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#03dac6" /></View>;
  }

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      {/* Header Container with Logo, Title, and Timer */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>Layerwise.ai</Text>
        <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
          ⏱ {formatTime(timeLeft)}
        </Text>
      </View>
      
      <Text style={styles.header}>Daily Quiz: Day {dayId}</Text>
      
      {result && (
        <Animated.View entering={FadeInDown.duration(800).springify()} style={[styles.resultBox, result.passed ? styles.passedBox : styles.failedBox]}>
          <Animated.Text entering={ZoomIn.delay(300)} style={styles.resultText}>
            {result.passed ? "🎉 Congratulations! You Passed!" : "😔 You did not pass. Try again."}
          </Animated.Text>
          <Text style={styles.scoreText}>Score: {result.score.toFixed(1)}% (75% required)</Text>
          
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => result.passed ? router.push('/student/dashboard') : router.push(`/student/tasks/${dayId}`)}
          >
            <Text style={styles.actionBtnText}>
              {result.passed ? "Return to Dashboard" : "Revisit the lesson"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {questions.map((q, idx) => (
        <Animated.View key={q.id} entering={FadeInDown.delay(idx * 100).duration(500)} style={styles.questionCard}>
          <Text style={styles.questionText}>{idx + 1}. {q.text}</Text>
          {q.options.map(opt => {
            const isSelected = answers[q.id] === opt.id;
            return (
              <TouchableOpacity 
                key={opt.id} 
                style={[styles.optionBtn, isSelected && styles.selectedOption]}
                onPress={() => selectOption(q.id, opt.id)}
                disabled={isSubmitting || result != null}
              >
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      ))}

      {!result && (
        <TouchableOpacity 
          style={[
            styles.submitBtn, 
            (Object.keys(answers).length < questions.length || isSubmitting) && styles.disabledBtn
          ]}
          disabled={Object.keys(answers).length < questions.length || isSubmitting}
          onPress={submitQuiz}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? "Submitting..." : "Submit Answers"}
          </Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#bb86fc',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#03dac6',
  },
  timerWarning: {
    color: '#ff5252',
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
