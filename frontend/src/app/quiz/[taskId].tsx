import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function StudentQuizScreen() {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Fetch mock quiz data from backend
    fetch(`https://layerwise-ai.onrender.com/api/curriculum/tasks/${taskId}/quiz`)
      .then(res => res.json())
      .then(data => setQuestions(data.questions))
      .catch(err => console.error(err));
  }, [taskId]);

  useEffect(() => {
    // Timer logic
    if (timeLeft <= 0 && !result) {
      handleSubmit(); // auto submit when time is up
      return;
    }
    if (!result) {
      const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, result]);

  const selectOption = (qId: number, optionId: number) => {
    setAnswers({ ...answers, [qId]: optionId });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`https://layerwise-ai.onrender.com/api/curriculum/tasks/${taskId}/quiz/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (result) {
    return (
      <View style={[styles.container, styles.resultContainer]}>
        <Text style={[styles.resultTitle, { color: result.passed ? '#03dac6' : '#ff5252' }]}>
          {result.passed ? 'LESSON PASSED!' : 'LESSON FAILED'}
        </Text>
        <Text style={styles.resultScore}>Score: {result.score}%</Text>
        <Text style={styles.resultMessage}>{result.message}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
          <Text style={styles.actionBtnText}>{result.passed ? 'CONTINUE LEARNING' : 'RETAKE LESSON'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Graduation Quiz</Text>
        <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>{formatTime(timeLeft)}</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {questions.map((q, i) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{i + 1}. {q.text}</Text>
            {q.options.map((opt: any) => (
              <TouchableOpacity 
                key={opt.id} 
                style={[styles.optionBtn, answers[q.id] === opt.id && styles.optionSelected]}
                onPress={() => selectOption(q.id, opt.id)}
              >
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitBtnText}>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT QUIZ'}</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  timer: { fontSize: 24, fontWeight: 'bold', color: '#03dac6' },
  timerWarning: { color: '#ff5252' },
  scroll: { flex: 1 },
  questionCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12, marginBottom: 20 },
  questionText: { fontSize: 18, color: '#fff', marginBottom: 15, fontWeight: '600' },
  optionBtn: { padding: 15, backgroundColor: '#333', borderRadius: 8, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  optionSelected: { borderColor: '#6200ee', backgroundColor: '#3a2b58' },
  optionText: { color: '#fff', fontSize: 16 },
  submitBtn: { backgroundColor: '#03dac6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  
  resultContainer: { justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  resultScore: { fontSize: 64, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  resultMessage: { color: '#aaa', fontSize: 18, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  actionBtn: { backgroundColor: '#6200ee', padding: 20, borderRadius: 12, width: '100%', alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
